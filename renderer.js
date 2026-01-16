// No topo do renderer.js
let programacaoGlobal = null;
let currentSequenceIndex = 0;
let nextSequenceAudioData = null; // Buffer para a próxima sequência

// Carregar a programação antes de tudo
async function loadGlobalData() {
    // ... carregamentos anteriores ...
    const resp = await fetch('programacao.json');
    programacaoGlobal = await resp.json();
}

// Função para iniciar a rádio no ponto certo
function startRadio() {
    if (!audioCtx) initAudio();
    
    // 1. Calcular tempo atual do mês
    const now = new Date();
    const dia = now.getDate();
    const hora = now.getHours();
    const min = now.getMinutes();
    const seg = now.getSeconds();
    
    // Tempo absoluto em segundos dentro do mês
    const currentSeconds = ((dia - 1) * 86400) + (hora * 3600) + (min * 60) + seg;
    
    // 2. Achar a sequência correta na programação
    const playlist = programacaoGlobal[currentActiveChannelId];
    
    // Busca binária ou linear simples para achar onde estamos
    // Precisamos achar o item onde: item.startTime <= currentSeconds < (item.startTime + item.duration)
    let foundIndex = -1;
    let timeOffset = 0; // Onde exatamente dentro da música vamos começar

    for(let i=0; i < playlist.length; i++) {
        const seq = playlist[i];
        // Estimativa simples. O ideal é somar durações reais.
        // Como temos startTime gerado no JSON, usamos ele.
        if (currentSeconds >= seq.startTime && currentSeconds < (seq.startTime + seq.totalDuration)) {
            foundIndex = i;
            timeOffset = currentSeconds - seq.startTime;
            break;
        }
    }

    if (foundIndex === -1) foundIndex = 0; // Fallback

    // 3. Tocar
    playSequence(foundIndex, timeOffset, false);
}

// Variável para controlar a estática
let staticSourceNode = null;

async function switchChannel(newChannelId) {
    if (newChannelId === currentActiveChannelId) return;
    
    // 1. Inicia Estática (Loop)
    playStaticNoise();

    // 2. Para rádio atual e descarta buffers
    stopCurrentPlayback(); // Função para dar stop nos nós atuais
    
    currentActiveChannelId = newChannelId;
    
    // 3. Carrega nova programação e sincroniza
    // Pequeno delay para simular sintonia
    await sleep(500); 
    
    startRadio(); // Recalcula posição para o novo canal
}

function playStaticNoise() {
    // Toca o arquivo de estática em loop
    if (staticSourceNode) return;
    const src = audioCtx.createBufferSource();
    src.buffer = staticBuffer; // Já carregado globalmente
    src.loop = true;
    const gain = audioCtx.createGain();
    src.connect(gain).connect(audioCtx.destination);
    src.start();
    
    staticSourceNode = { source: src, gain: gain };
}

function fadeOutStatic() {
    if (!staticSourceNode) return;
    const now = audioCtx.currentTime;
    // Fade out de 1 segundo
    staticSourceNode.gain.gain.setValueAtTime(1, now);
    staticSourceNode.gain.gain.linearRampToValueAtTime(0, now + 1);
    
    const nodeToStop = staticSourceNode.source;
    setTimeout(() => {
        nodeToStop.stop();
        nodeToStop.disconnect();
    }, 1100);
    staticSourceNode = null;
}

// Core do Player Sequencial
async function playSequence(index, startOffset = 0, isPreload = false) {
    currentSequenceIndex = index;
    const playlist = programacaoGlobal[currentActiveChannelId];
    const sequenceData = playlist[index];
    
    if (!sequenceData) return; // Fim da programação

    // Se estivermos trocando de rádio, remove a estática APÓS começar a tocar
    if (staticSourceNode) {
        fadeOutStatic();
    }

    // Carregar arquivos da sequência (Fetch & Decode)
    // Aqui carregamos ID + Música + News dessa sequência específica
    const buffers = await carregarBuffersDaSequencia(sequenceData);
    
    // Agendar Web Audio
    const now = audioCtx.currentTime;
    let localCursor = 0;

    sequenceData.items.forEach(item => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffers[item.file];
        
        const gain = audioCtx.createGain();
        source.connect(gain).connect(masterGain); // Conectar ao master
        
        // Lógica de Start Time com base no Offset (se o usuário entrou no meio da música)
        const whenToStart = now + localCursor - startOffset;
        let offsetIntoFile = 0;
        
        if (whenToStart < now) {
            // A música já deveria ter começado. Ajustamos o "ponto da agulha" (offset)
            offsetIntoFile = Math.abs(whenToStart - now);
            source.start(now, offsetIntoFile); 
        } else {
            source.start(whenToStart);
        }

        // --- Tratamento de Narrações (Ducking) ---
        if (item.narrations) {
            item.narrations.forEach(nar => {
                // Configurar o player da narração e baixar volume da música principal (ducking)
                // Usar item.metadata.introEnd para timing
            });
        }
        
        localCursor += item.duration; // Ajustar com fusão real se necessário
    });

    // --- Preload da Próxima ---
    // Enquanto toca esta, carregamos a próxima silenciosamente para memória
    const nextIndex = index + 1;
    if (playlist[nextIndex]) {
        nextSequenceAudioData = await carregarBuffersDaSequencia(playlist[nextIndex]);
    }
    
    // Calcular quando chamar a próxima sequência
    // setTimeout ou evento 'ended' do último nó (menos o tempo de fusão)
    const timeUntilNext = (sequenceData.totalDuration - startOffset - 2.0) * 1000; // 2.0 é o overlap
    setTimeout(() => {
        playSequence(nextIndex, 0);
    }, timeUntilNext);
}
