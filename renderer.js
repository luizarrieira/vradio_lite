import stationsData from './stations.js';
import { getNewsSubsetForDay } from './adv_news_list.js';

/* =================== Configurações Globais =================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

const SAMPLE_RATE = 48000;
const FADE_STATIC_TIME = 2.0; // Tempo em segundos para a estática sumir
const DUCK_VOLUME = 0.2;      // Volume da música quando o locutor fala
const NORMAL_VOLUME = 1.0;

let globalDurations = {}; // Será preenchido pelo JSON
let activeStationId = null; 
const stationsInstances = {}; 
let staticBuffer = null;
let isSystemStarted = false;

/* =================== Carregamento Inicial =================== */

async function loadGlobalData() {
  try {
    const resp = await fetch('duracoes_global.json');
    globalDurations = await resp.json();
    console.log(`[System] Durations loaded: ${Object.keys(globalDurations).length} files.`);
  } catch (e) {
    console.error("ERRO CRÍTICO: Não foi possível carregar duracoes_global.json.", e);
  }
}

async function loadStatic() {
  try {
    const resp = await fetch('0x0DE98BE6.mp3'); 
    const ab = await resp.arrayBuffer();
    staticBuffer = await audioCtx.decodeAudioData(ab);
  } catch(e) {
    console.warn("Arquivo de estática não encontrado.");
  }
}

/* =================== Classe RadioStation =================== */

class RadioStation {
  constructor(id, name, folderBase, data) {
    this.id = id;
    this.name = name;
    this.folderBase = folderBase;
    this.data = data;
    
    // Estado Lógico (Phantom)
    this.playlist = []; 
    this.currentSequence = null; 
    this.logicalNextTime = 0; 
    this.timerHandle = null; 

    // Estado Físico (Audio Real)
    this.isActive = false; 
    this.audioNodes = []; 
    this.gainNode = null; 
    
    // Inicia gerando algumas músicas na fila
    for(let i=0; i<3; i++) this.enqueueSequence();
  }

  // --- LÓGICA DE DECISÃO (O CÉREBRO) ---

  /**
   * Encontra a melhor narração que caiba no tempo de intro da música.
   */
  findBestIntro(musicData, voicePaths) {
    if (!voicePaths || voicePaths.length === 0) return null;

    // Janela disponível em segundos (IntroEnd - IntroStart)
    const windowSamples = musicData.introEnd - musicData.introStart;
    const windowSeconds = windowSamples / SAMPLE_RATE;

    // Filtra vozes que cabem na janela (com margem de 0.5s)
    const candidates = voicePaths.filter(voicePath => {
        const fname = voicePath.split('/').pop();
        const samples = globalDurations[voicePath] || globalDurations[fname];
        if (!samples) return false;
        
        const durationSec = samples / SAMPLE_RATE;
        return durationSec <= (windowSeconds - 0.5); 
    });

    if (candidates.length === 0) return null;

    // Escolhe aleatória
    const chosenPath = candidates[Math.floor(Math.random() * candidates.length)];
    const chosenFilename = chosenPath.split('/').pop();
    const chosenSamples = globalDurations[chosenPath] || globalDurations[chosenFilename];

    return {
        url: chosenPath,
        duration: chosenSamples / SAMPLE_RATE
    };
  }

  enqueueSequence() {
    // 1. Escolhe Música
    const musicData = this.data.musicas[Math.floor(Math.random() * this.data.musicas.length)];
    
    // 2. Obtém duração via JSON (Crucial para Phantom Mode)
    const musicFilename = musicData.arquivo.split('/').pop();
    const musicSamples = globalDurations[musicData.arquivo] || globalDurations[musicFilename];
    
    // Fallback: Se não achar no JSON, assume 4 minutos para não travar, mas avisa no console
    if (!musicSamples) console.warn(`[${this.name}] ⚠️ Duração desconhecida: ${musicFilename}`);
    const musicDurationSec = (musicSamples || 11520000) / SAMPLE_RATE;

    const sequenceFiles = [{
        url: musicData.arquivo,
        role: 'music',
        startOffset: 0, 
        duration: musicDurationSec
    }];

    const duckingPoints = [];

    // 3. Lógica de Intro (Locução)
    if (musicData.introStart && musicData.introEnd) {
        // Pega as vozes específicas desta música (chave = nome da música)
        const possibleVoices = this.data[musicData.name];

        if (possibleVoices && possibleVoices.length > 0) {
            const voiceObj = this.findBestIntro(musicData, possibleVoices);

            // 50% de chance de falar
            if (voiceObj && Math.random() < 0.5) {
                // Hitting the Post: Voz termina exatamente no introEnd
                const introEndSec = musicData.introEnd / SAMPLE_RATE;
                let voiceStartTime = introEndSec - voiceObj.duration;
                if (voiceStartTime < 0) voiceStartTime = 0;

                sequenceFiles.push({
                    url: voiceObj.url,
                    role: 'voice',
                    startOffset: voiceStartTime,
                    duration: voiceObj.duration
                });

                duckingPoints.push({
                    start: voiceStartTime,
                    end: voiceStartTime + voiceObj.duration
                });
            }
        }
    }

    // 4. Cria Objeto da Sequência
    const sequenceObj = {
        id: Date.now() + Math.random(),
        type: 'MUSIC_BLOCK',
        files: sequenceFiles,
        totalDuration: musicDurationSec,
        duckingPoints: duckingPoints,
        meta: musicData
    };

    this.playlist.push(sequenceObj);
  }

  // --- CONTROLE DE TEMPO (O MOTOR) ---

  start() {
    this.logicalNextTime = audioCtx.currentTime;
    this.processNextSequence();
  }

  processNextSequence() {
    // Mantém a fila cheia
    if (this.playlist.length < 3) this.enqueueSequence(); 
    
    this.currentSequence = this.playlist.shift();

    // Define tempos absolutos
    this.currentSequence.startTime = this.logicalNextTime;
    this.currentSequence.endTime = this.logicalNextTime + this.currentSequence.totalDuration;
    
    // Prepara o tempo da próxima
    this.logicalNextTime = this.currentSequence.endTime;

    if (this.isActive) {
      // Se a rádio está ativa, toca áudio real (com offset 0 pois está começando agora)
      this.playRealAudio(this.currentSequence, 0);
      updateUI(this.id, this.currentSequence.meta);
    } else {
      // Se não, só espera o tempo passar (Modo Fantasma)
      this.playPhantom(this.currentSequence);
    }
  }

  playPhantom(sequence) {
    const timeUntilNext = (sequence.endTime - audioCtx.currentTime) * 1000;
    
    // Se o processamento atrasou e já devia ter acabado
    if (timeUntilNext <= 0) {
      this.processNextSequence();
      return;
    }

    // Agenda apenas a lógica da próxima troca
    this.timerHandle = setTimeout(() => {
      this.processNextSequence();
    }, timeUntilNext);
  }

  // --- TRANSIÇÕES DE ESTADO (HIDRATAÇÃO) ---

  async goActive() {
    if (this.isActive) return;
    this.isActive = true;
    console.log(`[${this.name}] 🟢 Ativando rádio...`);

    // 1. Toca Estática Imediatamente
    const staticNode = playStaticSound(); 

    // 2. Calcula onde estamos na música atual
    const now = audioCtx.currentTime;
    
    if (this.currentSequence && now < this.currentSequence.endTime) {
      const offset = now - this.currentSequence.startTime;
      console.log(`[${this.name}] Retomando em: ${offset.toFixed(2)}s`);
      
      updateUI(this.id, this.currentSequence.meta);
      await this.playRealAudio(this.currentSequence, offset);
    } else {
      this.processNextSequence();
    }

    // 3. Fade Out da Estática
    if (staticNode) {
      const nowFade = audioCtx.currentTime;
      staticNode.gain.setValueAtTime(0.8, nowFade);
      staticNode.gain.linearRampToValueAtTime(0, nowFade + FADE_STATIC_TIME);
      setTimeout(() => staticNode.source.stop(), FADE_STATIC_TIME * 1000 + 200);
    }
  }

  goPhantom() {
    if (!this.isActive) return;
    this.isActive = false;
    console.log(`[${this.name}] ⚪ Modo Fantasma (Desativando áudio)...`);

    this.stopAllAudio();

    if (this.timerHandle) clearTimeout(this.timerHandle);

    // Volta para o loop fantasma baseado no tempo restante
    if (this.currentSequence && audioCtx.currentTime < this.currentSequence.endTime) {
      this.playPhantom(this.currentSequence);
    } else {
      this.processNextSequence();
    }
  }

  // --- REPRODUÇÃO DE ÁUDIO REAL ---

  async playRealAudio(sequence, startOffset) {
    if (!this.isActive) return;

    if (startOffset >= sequence.totalDuration) {
        this.processNextSequence();
        return;
    }

    // Setup Master Gain
    if (!this.gainNode) {
      this.gainNode = audioCtx.createGain();
      this.gainNode.connect(audioCtx.destination);
    }
    this.gainNode.gain.setValueAtTime(1, audioCtx.currentTime);

    // Carrega arquivos
    const fetchPromises = sequence.files.map(f => fetchAudio(f.url));
    const audioBuffers = await Promise.all(fetchPromises);

    if (!this.isActive) return; // Se trocou de rádio durante o load

    sequence.files.forEach((fileInfo, index) => {
      const buffer = audioBuffers[index];
      if (!buffer) return;

      const absoluteStartTime = sequence.startTime + fileInfo.startOffset;
      const absoluteEndTime = absoluteStartTime + buffer.duration;
      const now = audioCtx.currentTime;

      if (now >= absoluteEndTime) return; // Já tocou

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      
      const fileGain = audioCtx.createGain();
      source.connect(fileGain);
      fileGain.connect(this.gainNode);

      // Seek Logic
      let playWhen = 0;
      let offsetInFile = 0;

      if (now > absoluteStartTime) {
        playWhen = now;
        offsetInFile = now - absoluteStartTime;
      } else {
        playWhen = absoluteStartTime;
        offsetInFile = 0;
      }

      source.start(playWhen, offsetInFile);
      this.audioNodes.push({ source, gain: fileGain });

      // === LÓGICA DE DUCKING (Reconstrução do Estado) ===
      if (fileInfo.role === 'music' && sequence.duckingPoints) {
          sequence.duckingPoints.forEach(dp => {
              const duckStartAbs = sequence.startTime + dp.start;
              const duckEndAbs = sequence.startTime + dp.end;

              // Se o duck ainda vai acontecer
              if (now < duckStartAbs) {
                  fileGain.gain.setValueAtTime(NORMAL_VOLUME, duckStartAbs);
                  fileGain.gain.linearRampToValueAtTime(DUCK_VOLUME, duckStartAbs + 0.5);
              } 
              // Se já estamos NO MEIO do duck (ao carregar a rádio)
              else if (now >= duckStartAbs && now < duckEndAbs) {
                  fileGain.gain.setValueAtTime(DUCK_VOLUME, now);
              }

              // Agendar subida (Release)
              if (now < duckEndAbs) {
                  fileGain.gain.setValueAtTime(DUCK_VOLUME, duckEndAbs);
                  fileGain.gain.linearRampToValueAtTime(NORMAL_VOLUME, duckEndAbs + 1.0);
              }
          });
      }
    });

    // Timeout de segurança para a próxima faixa
    const timeRemaining = (sequence.endTime - audioCtx.currentTime) * 1000;
    if (this.timerHandle) clearTimeout(this.timerHandle);
    this.timerHandle = setTimeout(() => {
        this.processNextSequence();
    }, timeRemaining);
  }

  stopAllAudio() {
    this.audioNodes.forEach(node => {
      try { node.source.stop(); } catch(e){}
      node.source.disconnect();
      node.gain.disconnect();
    });
    this.audioNodes = [];
    if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
    }
  }
}

/* =================== Utilitários =================== */

async function fetchAudio(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error(`Erro loading ${url}`, e);
    return null;
  }
}

function playStaticSound() {
  if (!staticBuffer) return null;
  const source = audioCtx.createBufferSource();
  source.buffer = staticBuffer;
  source.loop = true;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.8;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
  return { source, gain };
}

function updateUI(id, meta) {
  if (id === activeStationId) {
      const capaEl = document.getElementById('capa');
      if(capaEl && meta.capa) capaEl.src = meta.capa;
      
      // Log visual (Opcional)
      console.log(`🎵 Now Playing on ${id}: ${meta.name}`);
  }
}

/* =================== Inicialização =================== */

async function startSystem() {
  if(isSystemStarted) return;
  isSystemStarted = true;
  
  if(audioCtx.state === 'suspended') await audioCtx.resume();
  
  await loadGlobalData();
  await loadStatic();

  // Inicializa Estações
  // Ajuste os IDs das pastas ('RADIO_01...') conforme o seu sistema de arquivos real
  stationsInstances['rock'] = new RadioStation('rock', 'Vinewood Rock', 'RADIO_01_CLASS_ROCK', stationsData.getRock());
  stationsInstances['pop'] = new RadioStation('pop', 'Non Stop Pop', 'RADIO_02_POP', stationsData.getSilver()); 
  stationsInstances['class_rock'] = new RadioStation('class_rock', 'Los Santos Rock', 'RADIO_01_CLASS_ROCK', stationsData.getClassRock());
  
  // Inicia todas em modo fantasma
  Object.values(stationsInstances).forEach(st => st.start());

  // Ativa a primeira
  switchChannel('class_rock');
}

window.switchChannel = (newId) => {
  if (activeStationId === newId) return;

  // Desliga a anterior (vira fantasma)
  if (activeStationId && stationsInstances[activeStationId]) {
    stationsInstances[activeStationId].goPhantom();
  }

  activeStationId = newId;

  // Liga a nova (hidratação + estática)
  if (stationsInstances[newId]) {
    stationsInstances[newId].goActive();
  }
  
  // Atualiza UI dos botões
  window.updateRadioUI(newId);
};

// Expor API global
window.__RADIO = {
  startRadio: startSystem,
  switchChannel: window.switchChannel
};