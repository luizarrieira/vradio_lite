// renderer.js — O Executor da Rádio (Versão Final "Leitor de Programação")

/* ==========================================================================
   1. INICIALIZAÇÃO E VARIÁVEIS GLOBAIS
   ========================================================================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

// Configurações
const STATIC_FILE = '0x0DE98BE6.mp3'; 
const FADE_TIME = 0.01; // Tempo da transição de ducking (rápido)

// Estado do Sistema
let currentSchedule = null; // Guarda o JSON da rádio atual
let currentActiveChannelId = 'rock'; 
let isSystemStarted = false;
let audioMetadata = {}; // Para consultar tipos de fusão

// Controle de Áudio
let currentSourceNodes = []; // Nós tocando atualmente (para poder parar)
let nextSequenceTimeout = null; // Timer para o próximo bloco
let staticNode = null; // Nó da estática
let staticBuffer = null;

/* ==========================================================================
   2. CARREGAMENTO DE DADOS
   ========================================================================== */

async function loadGlobalData() {
    console.log("📥 Carregando estática e metadados...");
    try {
        // Carrega Estática
        const staticResp = await fetch(STATIC_FILE);
        if (staticResp.ok) {
            const staticData = await staticResp.arrayBuffer();
            staticBuffer = await audioCtx.decodeAudioData(staticData);
        } else {
            console.warn("⚠️ Arquivo de estática não encontrado.");
        }

        // Carrega Metadata (para fusões precisas)
        const metaResp = await fetch('audio_metadata.json');
        if (metaResp.ok) {
            audioMetadata = await metaResp.json();
        }
    } catch (error) {
        console.error("❌ Erro no loadGlobalData:", error);
    }
}

async function loadStationSchedule(stationId) {
    const fileName = `programacao_${stationId}.json`;
    console.log(`📥 Baixando programação: ${fileName}`);
    try {
        const resp = await fetch(fileName);
        if (!resp.ok) throw new Error(`Arquivo ${fileName} não encontrado`);
        currentSchedule = await resp.json();
        console.log(`✅ Programação de ${stationId} carregada (${currentSchedule.length} blocos).`);
    } catch (e) {
        console.error("❌ Erro ao baixar programação:", e);
        alert("Erro ao carregar rádio. Verifique se os arquivos JSON foram gerados.");
        currentSchedule = [];
    }
}

/* ==========================================================================
   3. CÁLCULOS DE TEMPO E FUSÃO (Espelho do Gerador)
   ========================================================================== */

function getSecondsInMonth() {
    const now = new Date();
    const dia = now.getDate(); // 1 a 31
    const hora = now.getHours();
    const min = now.getMinutes();
    const seg = now.getSeconds();
    
    // Calcula quantos segundos passaram desde o início do mês (Dia 1, 00:00:00)
    return ((dia - 1) * 86400) + (hora * 3600) + (min * 60) + seg;
}

// Recalcula a fusão em tempo real para posicionar os áudios
function getFusionOverlap(prevType, nextType, prevFile) {
    // 1. News (Sempre rápido)
    if (prevType === 'news' || nextType === 'news') return 0.2;

    // 2. Metadata Check
    // Tenta achar o metadata pelo nome do arquivo
    let endType = null;
    if (prevFile) {
        // Tenta chave exata ou endsWith
        if (audioMetadata[prevFile]) endType = audioMetadata[prevFile].fusionEndType;
        else {
            const key = Object.keys(audioMetadata).find(k => k.endsWith(prevFile));
            if (key) endType = audioMetadata[key].fusionEndType;
        }
    }
    
    if (endType === 'none') return 0.0;

    // 3. IDs
    if (prevType === 'idlong') return 2.0;
    if (prevType === 'idshort' || prevType === 'id') return 1.0;
    if (nextType === 'idlong') return 1.0;

    // 4. Ads
    if (prevType.includes('ad') || prevType === 'adv') return 0.5;

    // 5. Música
    if (prevType === 'music') {
        if (endType === 'fade-out') return 1.5;
        if (endType === 'abrupt') return 1.0;
        if (endType === 'normal') return 0.2;
        // Se for Kult e não tiver metadata
        if (currentActiveChannelId === 'kult') return 0.8; 
        return 1.5;
    }

    // 6. Solo
    if (prevType === 'solo') return (nextType === 'music') ? 1.0 : 0.5;

    return 1.0; // Default
}

/* ==========================================================================
   4. CONTROLE DE ÁUDIO (PLAY / STOP / DUCK)
   ========================================================================== */

function stopCurrentAudio() {
    // Para abruptamente todos os nós atuais (troca de rádio)
    currentSourceNodes.forEach(node => {
        try {
            if(node.source) { node.source.stop(); node.source.disconnect(); }
            if(node.gain) node.gain.disconnect();
        } catch(e) {}
    });
    currentSourceNodes = [];
    if (nextSequenceTimeout) clearTimeout(nextSequenceTimeout);
}

function playStatic() {
    if (staticNode || !staticBuffer) return;
    const src = audioCtx.createBufferSource();
    src.buffer = staticBuffer;
    src.loop = true;
    const gain = audioCtx.createGain();
    src.connect(gain).connect(audioCtx.destination);
    src.start();
    staticNode = { src, gain };
}

function fadeOutStatic() {
    if (!staticNode) return;
    const now = audioCtx.currentTime;
    // Fade out de 1.5s
    staticNode.gain.gain.setValueAtTime(1, now);
    staticNode.gain.gain.linearRampToValueAtTime(0, now + 1.5);
    const nodeParam = staticNode;
    staticNode = null;
    setTimeout(() => {
        try { nodeParam.src.stop(); nodeParam.src.disconnect(); } catch(e){}
    }, 1600);
}

/* ==========================================================================
   5. ENGINE DE REPRODUÇÃO (CORE)
   ========================================================================== */

async function playBlock(index, startOffset, isSwitching) {
    if (!currentSchedule || currentSchedule.length === 0) return;
    
    // Loop infinito seguro
    if (index >= currentSchedule.length) index = 0;
    
    const block = currentSchedule[index];
    
    // 1. Carregar (Download/Decode) todos os itens do bloco
    // Isso acontece enquanto a estática toca (se for switch) ou no final da música anterior
    const buffers = {};
    
    // Coletar lista de arquivos para baixar (Áudios principais + Narrações)
    const filesToLoad = [];
    block.items.forEach(item => {
        filesToLoad.push(item.file);
        if (item.narrations) {
            item.narrations.forEach(n => filesToLoad.push(n.file));
        }
    });

    const loadPromises = filesToLoad.map(async (f) => {
        if (!buffers[f]) {
            try {
                const res = await fetch(f);
                if(res.ok) {
                    const ab = await res.arrayBuffer();
                    buffers[f] = await audioCtx.decodeAudioData(ab);
                }
            } catch (e) { console.error(`Erro loading: ${f}`, e); }
        }
    });

    await Promise.all(loadPromises);

    // 2. Se for troca de rádio, inicia o fade out da estática agora que temos o áudio
    if (isSwitching) {
        fadeOutStatic();
    }

    // 3. Agendar os Nós de Áudio
    const now = audioCtx.currentTime;
    let localCursor = 0; // Cursor relativo ao início do bloco

    // Iterar itens para calcular overlaps e agendar
    for (let i = 0; i < block.items.length; i++) {
        const item = block.items[i];
        const nextItem = block.items[i+1];
        
        const buffer = buffers[item.file];
        
        if (buffer) {
            // Criação dos Nós
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            const gainNode = audioCtx.createGain(); // Ganho individual para Ducking
            source.connect(gainNode).connect(audioCtx.destination);
            currentSourceNodes.push({ source, gain: gainNode });

            // Calcular tempo de início
            // startOffset: quanto tempo já passou do início teórico desse bloco (se entramos no meio)
            
            const itemStartTimeRelative = localCursor;
            
            // Verifica se o item deve tocar agora ou no futuro
            let whenToStart = now + (itemStartTimeRelative - startOffset);
            let offsetIntoFile = 0;

            if (startOffset > itemStartTimeRelative) {
                // Estamos atrasados (o item começou no passado)
                offsetIntoFile = startOffset - itemStartTimeRelative;
                whenToStart = now; // Começa imediatamente (mas pulando o início)
            }

            // Se o arquivo ainda não acabou (offset < duração), toca
            if (offsetIntoFile < item.duration) {
                try {
                    source.start(whenToStart, offsetIntoFile);
                } catch(e) { console.warn("Erro ao iniciar source", e); }

                // --- UI Update (Capa) ---
                if (item.type === 'music' && item.metadata?.capa) {
                    const delay = (whenToStart - now) * 1000;
                    if (delay < 20000) { // Só agenda se for acontecer logo
                        setTimeout(() => {
                            const capaEl = document.getElementById('capa');
                            if(capaEl) capaEl.src = item.metadata.capa;
                        }, Math.max(0, delay));
                    }
                }

                // --- NARRAÇÕES & DUCKING ---
                if (item.narrations && item.narrations.length > 0) {
                    item.narrations.forEach(nar => {
                        const narBuf = buffers[nar.file];
                        if (!narBuf) return;

                        const srcN = audioCtx.createBufferSource();
                        srcN.buffer = narBuf;
                        const gainN = audioCtx.createGain();
                        srcN.connect(gainN).connect(audioCtx.destination);
                        currentSourceNodes.push({ source: srcN, gain: gainN });

                        // Calcular tempo absoluto da narração
                        // nar.startAt é relativo ao início do arquivo de música (0:00 da música)
                        // A música vai começar (ou começou) no 'whenToStart' - 'offsetIntoFile' (tempo ajustado)
                        
                        // Tempo real onde o "0:00" da música estaria:
                        const musicRealZeroTime = whenToStart - offsetIntoFile; 
                        const narAbsStart = musicRealZeroTime + nar.startAt;

                        if (narAbsStart > now) {
                            srcN.start(narAbsStart);
                            
                            // Lógica de Ducking (Baixar volume da música)
                            // 40% para normais, 50% para Kult
                            const DUCK_VOL = (currentActiveChannelId === 'kult') ? 0.5 : 0.4;
                            
                            // Baixa
                            gainNode.gain.setValueAtTime(1, narAbsStart);
                            gainNode.gain.linearRampToValueAtTime(DUCK_VOL, narAbsStart + FADE_TIME);
                            
                            // Sobe
                            const narEnd = narAbsStart + nar.duration;
                            gainNode.gain.setValueAtTime(DUCK_VOL, narEnd);
                            gainNode.gain.linearRampToValueAtTime(1, narEnd + FADE_TIME);
                        }
                    });
                }
            }
        }

        // Avançar cursor para o próximo item
        // Aplica a mesma lógica de fusão do gerador
        let overlap = 0;
        if (nextItem) {
            overlap = getFusionOverlap(item.type, nextItem.type, item.file);
        }
        localCursor += (item.duration - overlap);
    }

    // 4. Agendar o Próximo Bloco
    // block.totalDuration vem do JSON. startOffset é onde começamos neste bloco.
    // O tempo restante é totalDuration - startOffset.
    // Mas precisamos considerar a fusão com o PRÓXIMO bloco também.
    
    // Correção: O 'totalDuration' do JSON já considera o fim efetivo do bloco.
    // Vamos agendar o próximo play para (totalDuration - startOffset).
    
    // Dica Pro: Subtraímos um overlap pequeno padrão (2.0s) para garantir que o 
    // próximo bloco comece a processar antes do silêncio, e usamos o calculateFusion
    // do primeiro item do próximo bloco para ajuste fino se fosse um sistema contínuo perfeito,
    // mas confiar no timer é suficiente para Web Audio.
    
    const overlapNextBlock = 2.0; // Overlap de segurança entre blocos
    const timeLeft = block.totalDuration - startOffset - overlapNextBlock;
    
    const nextIdx = index + 1;
    
    // Pré-carregar próxima sequência silenciosamente (Browser Cache)
    if (currentSchedule[nextIdx]) {
        currentSchedule[nextIdx].items.forEach(i => fetch(i.file).catch(()=>{}));
    }

    console.log(`⏳ Bloco ${index} tocando. Próximo em ${timeLeft.toFixed(1)}s`);

    nextSequenceTimeout = setTimeout(() => {
        playBlock(nextIdx, 0, false);
    }, timeLeft * 1000);
}

function syncAndPlay(isSwitching) {
    if (!currentSchedule) return;

    const currentSeconds = getSecondsInMonth();
    let foundIndex = -1;
    let offset = 0;

    // Busca linear qual bloco cobre o segundo atual
    for (let i = 0; i < currentSchedule.length; i++) {
        const blk = currentSchedule[i];
        if (currentSeconds >= blk.startTime && currentSeconds < (blk.startTime + blk.totalDuration)) {
            foundIndex = i;
            offset = currentSeconds - blk.startTime;
            break;
        }
    }

    if (foundIndex === -1) {
        console.warn("⚠️ Tempo fora do range do mês (ou fim da lista). Reiniciando.");
        foundIndex = 0;
    }

    console.log(`📍 Sync: Bloco ${foundIndex} | Offset: ${offset.toFixed(2)}s | Rádio: ${currentActiveChannelId}`);
    playBlock(foundIndex, offset, isSwitching);
}

/* ==========================================================================
   6. EXPOSIÇÃO GLOBAL (API window.__RADIO)
   ========================================================================== */

window.__RADIO = {
    startRadio: async () => {
        if (isSystemStarted) return;
        isSystemStarted = true;
        
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        
        await loadGlobalData(); // Estática e Metadata
        await loadStationSchedule(currentActiveChannelId); // Carrega JSON inicial
        
        syncAndPlay(false);
    },

    switchChannel: async (id) => {
        if (id === currentActiveChannelId) return;
        
        console.log(`🔄 Trocando para: ${id}`);

        // 1. Toca estática e mata som atual
        playStatic();
        stopCurrentAudio();
        currentActiveChannelId = id;
        
        // 2. Baixa a nova programação
        await loadStationSchedule(id);
        
        // 3. Pequeno delay para dar tempo do buffer limpar e estática aparecer
        await new Promise(r => setTimeout(r, 600));
        
        // 4. Sincroniza e Toca (vai dar fade out na estática sozinho)
        syncAndPlay(true);
        
        // Atualiza UI se existir função
        if(window.updateRadioUI) window.updateRadioUI(id);
    }
};

console.log("✅ Renderer.js carregado. Sistema pronto.");
