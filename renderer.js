// renderer.js — Executor da Programação (Versão Corrigida)

// 1. Definições Iniciais
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

const STATIC_FILE = '0x0DE98BE6.mp3'; 
let staticBuffer = null;
let staticNode = null;

let programacao = null;
let currentActiveChannelId = 'rock'; 
let isSystemStarted = false;

let currentSourceNodes = [];
let nextSequenceTimeout = null;

// 2. Funções de Carregamento
async function loadGlobalData() {
    console.log("📥 Carregando dados globais...");
    
    try {
        const progResp = await fetch('programacao.json');
        if (!progResp.ok) throw new Error("Não encontrou programacao.json");
        programacao = await progResp.json();
        
        const staticResp = await fetch(STATIC_FILE);
        if (!staticResp.ok) throw new Error("Não encontrou arquivo de estática (0x0DE98BE6.mp3)");
        const staticData = await staticResp.arrayBuffer();
        staticBuffer = await audioCtx.decodeAudioData(staticData);
        
        console.log("✅ Dados carregados com sucesso.");
    } catch (error) {
        console.error("❌ ERRO FATAL ao carregar arquivos:", error);
        alert("Erro ao carregar arquivos: " + error.message);
    }
}

// 3. Utilitários de Tempo
function getSecondsInMonth() {
    const now = new Date();
    const dia = now.getDate();
    const hora = now.getHours();
    const min = now.getMinutes();
    const seg = now.getSeconds();
    return ((dia - 1) * 86400) + (hora * 3600) + (min * 60) + seg;
}

// 4. Utilitários de Áudio (Stop / Static)
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
    staticNode.gain.gain.linearRampToValueAtTime(0, now + 1.5);
    const nodeParam = staticNode;
    staticNode = null;
    setTimeout(() => {
        try { nodeParam.src.stop(); nodeParam.src.disconnect(); } catch(e){}
    }, 1600);
}

// 5. O Player Principal
async function playSequence(index, startOffset, isSwitching) {
    if (!programacao) return;
    const playlist = programacao[currentActiveChannelId];
    if (index >= playlist.length) index = 0;
    
    const sequence = playlist[index];
    
    // Carregar Buffers
    const buffers = {};
    const loadPromises = sequence.items.map(async (item) => {
        if (!buffers[item.file]) {
            try {
                const res = await fetch(item.file);
                const ab = await res.arrayBuffer();
                buffers[item.file] = await audioCtx.decodeAudioData(ab);
            } catch (e) { console.error(`Erro loading audio: ${item.file}`, e); }
        }
    });
    await Promise.all(loadPromises);

    if (isSwitching) fadeOutStatic();

    const now = audioCtx.currentTime;
    let localCursor = 0;

    sequence.items.forEach(item => {
        const buffer = buffers[item.file];
        if (!buffer) return;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const gainNode = audioCtx.createGain();
        source.connect(gainNode).connect(audioCtx.destination);
        currentSourceNodes.push({ source, gain: gainNode });

        const itemStartTimeRelative = localCursor;
        const itemEndTimeRelative = localCursor + item.duration;

        if (startOffset >= itemEndTimeRelative) {
            localCursor += item.duration;
            return;
        }

        let whenToStart = now + (itemStartTimeRelative - startOffset);
        let offsetIntoFile = 0;

        if (startOffset > itemStartTimeRelative) {
            offsetIntoFile = startOffset - itemStartTimeRelative;
            whenToStart = now;
        }

        try { source.start(whenToStart, offsetIntoFile); } catch(e){}

        // Narrações e Capas
        if (item.type === 'music' && item.metadata?.capa) {
             setTimeout(() => {
                 const capaEl = document.getElementById('capa');
                 if(capaEl) capaEl.src = item.metadata.capa;
             }, (whenToStart - now) * 1000);
        }
        
        // (Lógica de ducking simplificada para poupar espaço e evitar erros)
        if (item.narrations && item.narrations.length > 0) {
            item.narrations.forEach(async nar => {
                try {
                    const resN = await fetch(nar.file);
                    const bufN = await audioCtx.decodeAudioData(await resN.arrayBuffer());
                    const srcN = audioCtx.createBufferSource();
                    srcN.buffer = bufN;
                    const gainN = audioCtx.createGain();
                    srcN.connect(gainN).connect(audioCtx.destination);
                    currentSourceNodes.push({ source: srcN, gain: gainN });
                    
                    const narStartAbs = whenToStart + nar.startAt;
                    if (narStartAbs > now) srcN.start(narStartAbs);
                    
                    // Ducking simples
                    gainNode.gain.setValueAtTime(1, narStartAbs);
                    gainNode.gain.linearRampToValueAtTime(0.2, narStartAbs + 0.1);
                    gainNode.gain.setValueAtTime(0.2, narStartAbs + nar.duration);
                    gainNode.gain.linearRampToValueAtTime(1, narStartAbs + nar.duration + 0.5);
                } catch(e){}
            });
        }

        localCursor += item.duration;
    });

    // Próxima Sequência
    const overlap = 2.0;
    const timeLeft = sequence.totalDuration - startOffset - overlap;
    const nextIdx = index + 1;
    
    // Preload
    if (playlist[nextIdx]) {
        playlist[nextIdx].items.forEach(i => fetch(i.file).catch(()=>{})); 
    }

    nextSequenceTimeout = setTimeout(() => {
        playSequence(nextIdx, 0, false);
    }, timeLeft * 1000);
}

function syncAndPlay(isSwitching) {
    if (!programacao) return;
    const playlist = programacao[currentActiveChannelId];
    if (!playlist) return;

    const currentSeconds = getSecondsInMonth();
    let foundIndex = -1;
    let offset = 0;

    for (let i = 0; i < playlist.length; i++) {
        const seq = playlist[i];
        if (currentSeconds >= seq.startTime && currentSeconds < (seq.startTime + seq.totalDuration)) {
            foundIndex = i;
            offset = currentSeconds - seq.startTime;
            break;
        }
    }

    if (foundIndex === -1) foundIndex = 0;
    playSequence(foundIndex, offset, isSwitching);
}


// 6. EXPOSIÇÃO GLOBAL (Onde ocorre o erro)
window.__RADIO = {
    startRadio: async () => {
        if (isSystemStarted) return;
        isSystemStarted = true;
        if (audioCtx.state === 'suspended') await audioCtx.resume();
        await loadGlobalData();
        syncAndPlay(false);
    },
    switchChannel: async (id) => {
        if (id === currentActiveChannelId) return;
        playStatic();
        stopCurrentAudio();
        currentActiveChannelId = id;
        await new Promise(r => setTimeout(r, 800));
        syncAndPlay(true);
        if(window.updateRadioUI) window.updateRadioUI(id);
    }
};

console.log("✅ Renderer.js carregado com sucesso! window.__RADIO está pronto.");
