// renderer.js — O Executor da Programação (Client-Side)
// Este script apenas LÊ e EXECUTA o programacao.json gerado anteriormente.

/* =================== Configurações Globais =================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

const STATIC_FILE = '0x0DE98BE6.mp3'; // Certifique-se que este arquivo existe na raiz
let staticBuffer = null;
let staticNode = null; // Para controlar o loop de estática

let programacao = null; // Vai receber o JSON gigante
let currentActiveChannelId = 'rock'; // Rádio padrão
let isSystemStarted = false;

// Controle de Reprodução
let currentSourceNodes = []; // Armazena nós tocando agora para poder parar na troca
let nextSequenceTimeout = null; // Timer para chamar a próxima música

/* =================== Inicialização =================== */

async function loadGlobalData() {
    console.log("📥 Carregando dados globais...");
    
    // 1. Carrega a programação gerada pelo Node
    const progResp = await fetch('programacao.json');
    programacao = await progResp.json();
    
    // 2. Carrega a estática (ruído)
    const staticResp = await fetch(STATIC_FILE);
    const staticData = await staticResp.arrayBuffer();
    staticBuffer = await audioCtx.decodeAudioData(staticData);
    
    console.log("✅ Dados carregados. Sistema pronto.");
}

// Expõe funções para o index.html
window.__RADIO = {
    startRadio: async () => {
        if (isSystemStarted) return;
        isSystemStarted = true;
        
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        
        await loadGlobalData();
        
        // Inicia a rádio sem estática (primeira vez)
        syncAndPlay(false); 
    },

    switchChannel: async (newChannelId) => {
        if (newChannelId === currentActiveChannelId) return;
        
        console.log(`🔄 Trocando para: ${newChannelId}`);
        
        // 1. Toca estática IMEDIATAMENTE
        playStatic();

        // 2. Para o áudio atual
        stopCurrentAudio();
        
        // 3. Atualiza ID
        currentActiveChannelId = newChannelId;
        
        // 4. Pequeno delay para simular sintonia e dar tempo de limpar buffers
        await new Promise(r => setTimeout(r, 800));
        
        // 5. Sincroniza e Toca a nova rádio (que vai dar fade out na estática quando estiver pronta)
        syncAndPlay(true);
        
        // Atualiza UI (Capa, etc - opcional, depende da sua UI)
        if(window.updateRadioUI) window.updateRadioUI(newChannelId);
    }
};

/* =================== Lógica de Sincronia (O "Relógio") =================== */

function getSecondsInMonth() {
    const now = new Date();
    const dia = now.getDate();
    const hora = now.getHours();
    const min = now.getMinutes();
    const seg = now.getSeconds();
    
    // Fórmula deve ser IGUAL à usada no gerar_programacao.mjs
    // Dia 1 começa em 0. Dia 2 começa em 86400...
    return ((dia - 1) * 86400) + (hora * 3600) + (min * 60) + seg;
}

function syncAndPlay(isSwitching) {
    const playlist = programacao[currentActiveChannelId];
    if (!playlist) {
        console.error("❌ Rádio não encontrada no JSON!");
        return;
    }

    const currentSeconds = getSecondsInMonth();
    
    // Busca Binária Simplificada para achar a sequência atual
    // Precisamos achar o item onde: startTime <= agora < (startTime + totalDuration)
    let foundIndex = -1;
    let offset = 0;

    // Busca linear é rápida o suficiente para ~10k itens
    for (let i = 0; i < playlist.length; i++) {
        const seq = playlist[i];
        if (currentSeconds >= seq.startTime && currentSeconds < (seq.startTime + seq.totalDuration)) {
            foundIndex = i;
            offset = currentSeconds - seq.startTime;
            break;
        }
    }

    if (foundIndex === -1) {
        // Se não achou (ex: dia 31 passou do limite), volta pro começo (loop do mês)
        console.warn("⚠️ Fim do mês ou erro de tempo. Reiniciando do index 0.");
        foundIndex = 0;
        offset = 0;
    }

    console.log(`📍 Sincronizado: Index ${foundIndex} | Offset: ${offset.toFixed(2)}s`);
    
    // Inicia o Player na sequência correta
    playSequence(foundIndex, offset, isSwitching);
}

/* =================== O Player (Core) =================== */

async function playSequence(index, startOffset, isSwitching) {
    const playlist = programacao[currentActiveChannelId];
    
    // Proteção contra fim de array
    if (index >= playlist.length) index = 0;
    
    const sequence = playlist[index];
    
    // 1. Carrega os áudios desta sequência (Download + Decode)
    // Isso pode demorar alguns segundos. Se for 'switch', a estática está tocando.
    const buffers = {};
    const loadPromises = sequence.items.map(async (item) => {
        if (!buffers[item.file]) {
            try {
                const res = await fetch(item.file);
                const ab = await res.arrayBuffer();
                buffers[item.file] = await audioCtx.decodeAudioData(ab);
            } catch (e) {
                console.error(`Erro ao carregar ${item.file}`, e);
            }
        }
    });

    await Promise.all(loadPromises);

    // 2. Se for troca de rádio, agora que carregou, tira a estática
    if (isSwitching) {
        fadeOutStatic();
    }

    // 3. Agenda os áudios
    const now = audioCtx.currentTime;
    let localCursor = 0; // Cursor relativo ao início da sequência

    sequence.items.forEach(item => {
        const buffer = buffers[item.file];
        if (!buffer) return;

        // Cria nós de áudio
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const gainNode = audioCtx.createGain();
        
        source.connect(gainNode).connect(audioCtx.destination);
        
        // Guarda referência para poder cancelar se trocar de rádio
        currentSourceNodes.push({ source, gain: gainNode });

        // --- Lógica de Tempo ---
        // Quando este arquivo deve começar (absoluto no AudioContext)
        // startOffset é quanto tempo já passou do inicio da SEQUENCIA inteira
        
        // Ex: Sequencia começou há 10s.
        // Item 1 (ID) tem 5s. (Já tocou)
        // Item 2 (Musica) começa em 5s.
        
        const itemStartTimeRelative = localCursor; // 0, 5, etc
        const itemEndTimeRelative = localCursor + item.duration;

        // Se o item já acabou no passado (devido ao offset), ignoramos
        if (startOffset >= itemEndTimeRelative) {
            localCursor += item.duration;
            return; 
        }

        let whenToStart = now + (itemStartTimeRelative - startOffset);
        let offsetIntoFile = 0;

        // Se o item já deveria ter começado, mas ainda não acabou
        if (startOffset > itemStartTimeRelative) {
            offsetIntoFile = startOffset - itemStartTimeRelative;
            whenToStart = now; // Começa agora
        }

        source.start(whenToStart, offsetIntoFile);

        // --- Narrações (Overlay) ---
        if (item.narrations && item.narrations.length > 0) {
            item.narrations.forEach(async nar => {
                // Carrega narração sob demanda (pequeno delay aceitável ou pré-carregar acima)
                try {
                    const resN = await fetch(nar.file);
                    const bufN = await audioCtx.decodeAudioData(await resN.arrayBuffer());
                    
                    const srcN = audioCtx.createBufferSource();
                    srcN.buffer = bufN;
                    const gainN = audioCtx.createGain();
                    srcN.connect(gainN).connect(audioCtx.destination);
                    currentSourceNodes.push({ source: srcN, gain: gainN });

                    // Calcula tempo:
                    // A narração deve começar 'nar.startAt' segundos APÓS o inicio da MÚSICA
                    // whenToStart (da música) + nar.startAt - offsetIntoFile (se musica ja começou cortada)
                    
                    // Ajuste preciso:
                    // O tempo real de inicio da música é (now ou futuro).
                    // Se musica começou no passado (offsetIntoFile > 0), o tempo relativo muda.
                    
                    // Simplificando: O tempo absoluto do inicio da musica seria (now - offsetIntoFile) se fosse no passado
                    // ou whenToStart se for no futuro.
                    const musicAbsStartTime = whenToStart - (offsetIntoFile > 0 ? 0 : 0); 
                    // Nota: a lógica acima de whenToStart já cobre isso.
                    
                    let narAbsStart = whenToStart + nar.startAt; 
                    
                    // Se cortamos a música no meio (offsetIntoFile), o nar.startAt precisa ser ajustado?
                    // Não, nar.startAt é relativo ao zero da música.
                    // Se offsetIntoFile for 10s, e narração é aos 5s, ela já passou.
                    
                    if (offsetIntoFile > (nar.startAt + nar.duration)) {
                        // Narração já passou
                        return;
                    }
                    
                    let narOffset = 0;
                    if (offsetIntoFile > nar.startAt) {
                         // Entramos no meio da narração
                         narOffset = offsetIntoFile - nar.startAt;
                         narAbsStart = now;
                    } else {
                         // Narração vai tocar no futuro, mas temos que descontar o quanto adiantamos a música?
                         // Não, whenToStart já é o ponto real de play. Só somamos o startAt (menos o que já comemos do arquivo)
                         // Espera, se offsetIntoFile for 0, narAbsStart = now + nar.startAt. Correto.
                         // Se offsetIntoFile for 10, e startAt for 20. Musica começa agora (skip 10). Narração em +10s.
                         // whenToStart = now. 
                         // conta: now + 20 ?? Errado. Deveria ser now + 10.
                         narAbsStart = now + (nar.startAt - offsetIntoFile);
                    }

                    srcN.start(narAbsStart, narOffset);

                    // Ducking (Baixar volume da música)
                    // Baixa volume 0.2s antes da fala, sobe 0.2s depois
                    const DUCK_VAL = 0.2;
                    const originalVol = 1.0;
                    
                    gainNode.gain.setValueAtTime(originalVol, narAbsStart - 0.3);
                    gainNode.gain.linearRampToValueAtTime(DUCK_VAL, narAbsStart);
                    gainNode.gain.setValueAtTime(DUCK_VAL, narAbsStart + nar.duration);
                    gainNode.gain.linearRampToValueAtTime(originalVol, narAbsStart + nar.duration + 0.5);

                } catch(e) { console.error("Erro narração", e); }
            });
        }

        // Atualizar Capa (Se for música)
        if (item.type === 'music' && item.metadata && item.metadata.capa) {
             // Agenda a troca da capa para quando a música começar
             setTimeout(() => {
                 const capaEl = document.getElementById('capa');
                 if(capaEl) capaEl.src = item.metadata.capa;
             }, (whenToStart - now) * 1000);
        }

        localCursor += item.duration;
    });

    // 4. Prepara a Próxima Sequência
    // Calculamos quanto tempo falta para esta sequencia acabar.
    // sequence.totalDuration é o tempo total ideal.
    // startOffset é onde começamos.
    
    // Fusão Manual (Overlap): O gerador já descontou 2s no tempo global, 
    // mas aqui no player precisamos garantir que o Próximo Play seja chamado um pouco antes do fim.
    const overlap = 2.0; 
    const timeLeft = sequence.totalDuration - startOffset - overlap;
    
    console.log(`⏳ Próxima sequência em: ${timeLeft.toFixed(1)}s`);

    // Carregar a próxima (Preload simples: o browser faz cache se dermos fetch antes)
    const nextIdx = index + 1;
    if (playlist[nextIdx]) {
        playlist[nextIdx].items.forEach(i => fetch(i.file)); // Trigger download in background
    }

    nextSequenceTimeout = setTimeout(() => {
        playSequence(nextIdx, 0, false);
    }, timeLeft * 1000);
}


/* =================== Utilitários de Controle =================== */

function stopCurrentAudio() {
    // Para todos os nós ativos
    currentSourceNodes.forEach(node => {
        try {
            node.source.stop();
            node.source.disconnect();
            node.gain.disconnect();
        } catch(e) {}
    });
    currentSourceNodes = [];
    
    if (nextSequenceTimeout) clearTimeout(nextSequenceTimeout);
}

function playStatic() {
    if (staticNode) return; // Já está tocando
    if (!staticBuffer) return;

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
    staticNode = null; // Libera flag

    setTimeout(() => {
        nodeParam.src.stop();
        nodeParam.src.disconnect();
    }, 1600);
}
