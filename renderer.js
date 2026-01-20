/* ==========================================================================
   RENDERER.JS - VERSÃO FINAL (CAPAS FIX & TIMING)
   ========================================================================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

const STATIC_FILE = '0x0DE98BE6.mp3'; 
const FADE_TIME = 0.02; 

let currentSchedule = null;
let currentActiveChannelId = 'rock'; 
let isSystemStarted = false;
let audioMetadata = {};

let currentSourceNodes = [];
let nextSequenceTimeout = null;
let staticNode = null;
let staticBuffer = null;
let currentCoverSrc = ''; // Para evitar recarregar a mesma imagem

/* ==========================================================================
   CARREGAMENTO
   ========================================================================== */
async function loadGlobalData() {
    try {
        const staticResp = await fetch(STATIC_FILE);
        if (staticResp.ok) {
            const staticData = await staticResp.arrayBuffer();
            staticBuffer = await audioCtx.decodeAudioData(staticData);
        }
        const metaResp = await fetch('audio_metadata.json');
        if (metaResp.ok) audioMetadata = await metaResp.json();
    } catch (e) { console.error(e); }
}

async function loadStationSchedule(stationId) {
    const fileName = `programacao_${stationId}.json`;
    console.log(`📥 Baixando: ${fileName}`);
    try {
        const resp = await fetch(fileName);
        if (!resp.ok) throw new Error("404");
        currentSchedule = await resp.json();
    } catch (e) {
        alert("Erro ao carregar programação: " + e.message);
        currentSchedule = [];
    }
}

/* ==========================================================================
   ENGINE
   ========================================================================== */
function getSecondsInMonth() {
    const now = new Date();
    const dia = now.getDate();
    const hora = now.getHours();
    const min = now.getMinutes();
    const seg = now.getSeconds();
    return ((dia - 1) * 86400) + (hora * 3600) + (min * 60) + seg;
}

function stopCurrentAudio() {
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
    staticNode.gain.gain.setValueAtTime(1, now);
    staticNode.gain.gain.linearRampToValueAtTime(0, now + 1.0);
    const nodeParam = staticNode;
    staticNode = null;
    setTimeout(() => { try { nodeParam.src.stop(); } catch(e){} }, 1100);
}

function updateCover(src) {
    if (!src || src === currentCoverSrc) return;
    const capaEl = document.getElementById('capa');
    if (capaEl) {
        capaEl.src = src;
        currentCoverSrc = src;
    }
}

async function playBlock(index, startOffset, isSwitching) {
    if (!currentSchedule || currentSchedule.length === 0) return;
    if (index >= currentSchedule.length) index = 0;
    
    const block = currentSchedule[index];
    
    // 1. Carregar Arquivos
    const buffers = {};
    const filesToLoad = [];
    block.items.forEach(item => {
        filesToLoad.push(item.file);
        if (item.narrations) item.narrations.forEach(n => filesToLoad.push(n.file));
    });

    await Promise.all(filesToLoad.map(async (f) => {
        if (!buffers[f]) {
            try {
                const res = await fetch(f);
                if(res.ok) buffers[f] = await audioCtx.decodeAudioData(await res.arrayBuffer());
            } catch (e) {}
        }
    }));

    if (isSwitching) fadeOutStatic();

    const now = audioCtx.currentTime;
    let localCursor = 0;

    // 2. Tocar Itens
    for (let i = 0; i < block.items.length; i++) {
        const item = block.items[i];
        const nextItem = block.items[i+1];
        
        const buffer = buffers[item.file];
        
        if (buffer) {
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            const gainNode = audioCtx.createGain(); 
            source.connect(gainNode).connect(audioCtx.destination);
            currentSourceNodes.push({ source, gain: gainNode });

            const itemStartTimeRelative = localCursor;
            
            // Calculo de quando este arquivo começa RELATIVO AO AGORA
            let whenToStart = now + (itemStartTimeRelative - startOffset);
            let offsetIntoFile = 0;

            if (startOffset > itemStartTimeRelative) {
                offsetIntoFile = startOffset - itemStartTimeRelative;
                whenToStart = now;
            }

            // CORREÇÃO DA CAPA: Atualiza imediatamente se já começou ou agenda
            if (item.type === 'music' && item.metadata?.capa) {
                const delayMs = (whenToStart - now) * 1000;
                if (delayMs <= 0) {
                    // Já devia estar tocando, atualiza agora
                    updateCover(item.metadata.capa);
                } else {
                    // Vai tocar no futuro, agenda
                    setTimeout(() => {
                        updateCover(item.metadata.capa);
                    }, delayMs);
                }
            }

            // Toca apenas se o arquivo ainda tem conteúdo restante
            if (offsetIntoFile < item.duration) {
                try {
                    source.start(whenToStart, offsetIntoFile);
                } catch(e) {}

                // --- NARRAÇÕES ---
                if (item.narrations && item.narrations.length > 0) {
                    item.narrations.forEach(nar => {
                        const narBuf = buffers[nar.file];
                        if (!narBuf) return;

                        const blockStartAbs = now - startOffset;
                        const narStartAbs = blockStartAbs + itemStartTimeRelative + nar.startAt;
                        const narEndAbs = narStartAbs + nar.duration;

                        if (now >= narEndAbs) return; // Já passou

                        const srcN = audioCtx.createBufferSource();
                        srcN.buffer = narBuf;
                        const gainN = audioCtx.createGain();
                        srcN.connect(gainN).connect(audioCtx.destination);
                        currentSourceNodes.push({ source: srcN, gain: gainN });

                        if (now > narStartAbs && now < narEndAbs) {
                            // Toca do meio
                            const offsetNar = now - narStartAbs;
                            srcN.start(now, offsetNar);
                            // Ducking imediato
                            gainNode.gain.setValueAtTime(0.4, now); 
                            gainNode.gain.setValueAtTime(0.4, narEndAbs); 
                            gainNode.gain.linearRampToValueAtTime(1, narEndAbs + 0.5);
                        } 
                        else {
                            // Toca no futuro
                            srcN.start(narStartAbs);
                            // Agenda Ducking
                            const DUCK_VAL = (currentActiveChannelId === 'kult') ? 0.5 : 0.4;
                            gainNode.gain.setValueAtTime(1, narStartAbs);
                            gainNode.gain.linearRampToValueAtTime(DUCK_VAL, narStartAbs + FADE_TIME);
                            gainNode.gain.setValueAtTime(DUCK_VAL, narEndAbs);
                            gainNode.gain.linearRampToValueAtTime(1, narEndAbs + 0.5);
                        }
                    });
                }
            }
        }

        // Fusão simples para avançar o cursor
        let overlap = 1.0; 
        if (nextItem && nextItem.type === 'news') overlap = 0.2;
        localCursor += (item.duration - overlap);
    }

    // Agenda próximo
    const overlapNextBlock = 2.0; 
    const timeLeft = block.totalDuration - startOffset - overlapNextBlock;
    const nextIdx = index + 1;
    
    if (currentSchedule[nextIdx]) {
        currentSchedule[nextIdx].items.forEach(i => fetch(i.file).catch(()=>{}));
    }

    nextSequenceTimeout = setTimeout(() => {
        playBlock(nextIdx, 0, false);
    }, timeLeft * 1000);
}

function syncAndPlay(isSwitching) {
    if (!currentSchedule) return;
    const currentSeconds = getSecondsInMonth();
    let foundIndex = -1;
    let offset = 0;

    for (let i = 0; i < currentSchedule.length; i++) {
        const blk = currentSchedule[i];
        if (currentSeconds >= blk.startTime && currentSeconds < (blk.startTime + blk.totalDuration)) {
            foundIndex = i;
            offset = currentSeconds - blk.startTime;
            break;
        }
    }

    if (foundIndex === -1) foundIndex = 0;
    playBlock(foundIndex, offset, isSwitching);
}

window.__RADIO = {
    startRadio: async () => {
        if (isSystemStarted) return;
        isSystemStarted = true;
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        await loadGlobalData();
        await loadStationSchedule(currentActiveChannelId);
        syncAndPlay(false);
    },
    switchChannel: async (id) => {
        if (id === currentActiveChannelId) return;
        playStatic();
        stopCurrentAudio();
        currentActiveChannelId = id;
        currentCoverSrc = ''; // Reseta capa para forçar atualização na troca
        await loadStationSchedule(id);
        await new Promise(r => setTimeout(r, 600));
        syncAndPlay(true);
        if(window.updateRadioUI) window.updateRadioUI(id);
    }
};
