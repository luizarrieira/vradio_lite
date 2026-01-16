import stationsData from './stations.js';

/* =================== Configurações Globais =================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

let audioMetadata = {};
let gradeProgramada = null;
let staticBuffer = null;
let isSystemStarted = false;
let currentActiveChannelId = 'rock'; 

// Referências das instâncias das rádios
let stations = {};

/* =================== Utils =================== */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const log = (prefix, ...args) => console.log(`[${prefix}]`, ...args);

/**
 * Carrega o áudio e transforma em buffer
 */
async function getAudioBuffer(url) {
  const resp = await fetch(url);
  const arrayBuffer = await resp.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

/**
 * Carrega os arquivos de configuração essenciais
 */
async function loadGlobalData() {
  try {
    const [metaResp, gradeResp, staticResp] = await Promise.all([
      fetch('audio_metadata.json'),
      fetch('programacao.json'),
      fetch('0x0DE98BE6.mp3') // Chiado de transição
    ]);

    audioMetadata = await metaResp.json();
    gradeProgramada = await gradeResp.json();
    
    const staticAb = await staticResp.arrayBuffer();
    staticBuffer = await audioCtx.decodeAudioData(staticAb);
    
    log('SYSTEM', 'Dados de programação e metadados carregados com sucesso.');
  } catch (e) {
    console.error('Erro crítico ao carregar inicialização:', e);
  }
}

/* =================== Classe RadioStation =================== */
class RadioStation {
  constructor(id, name, basePath) {
    this.id = id;
    this.name = name;
    this.basePath = basePath;
    this.started = false;
    this.currentSource = null;
    
    // Controle de volume individual
    this.masterGain = audioCtx.createGain();
    this.masterGain.connect(audioCtx.destination);
    this.masterGain.gain.value = (id === currentActiveChannelId) ? 1 : 0;
  }

  /**
   * Descobre qual música deve estar tocando AGORA e em qual segundo
   */
  sincronizarComRelogio() {
    const agora = new Date();
    const dia = agora.getDate().toString();
    const segundosHoje = (agora.getHours() * 3600) + (agora.getMinutes() * 60) + agora.getSeconds();
    
    const playlistDoDia = gradeProgramada[this.id][dia];
    
    if (!playlistDoDia) return { index: 0, offset: 0 };

    for (let i = 0; i < playlistDoDia.length; i++) {
      const item = playlistDoDia[i];
      const fimItem = item.inicio + item.duracao;

      if (segundosHoje >= item.inicio && segundosHoje < fimItem) {
        return { index: i, offset: segundosHoje - item.inicio };
      }
    }
    return { index: 0, offset: 0 };
  }

  async run() {
    this.started = true;
    let { index, offset } = this.sincronizarComRelogio();

    while (this.started) {
      const dia = new Date().getDate().toString();
      const playlist = gradeProgramada[this.id][dia];
      const track = playlist[index];

      // "GHOST MODE": Só baixa o áudio se for a rádio ativa
      if (currentActiveChannelId === this.id) {
        try {
          const buffer = await getAudioBuffer(track.path);
          
          // Se for música, atualiza a interface
          if (track.musicaObj) {
             document.getElementById('capa').src = track.musicaObj.capa;
          }

          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(this.masterGain);
          
          const startTime = audioCtx.currentTime;
          source.start(startTime, offset);
          this.currentSource = source;

          // Espera a duração restante da música
          const tempoRestante = (buffer.duration - offset) * 1000;
          await sleep(tempoRestante);
          
        } catch (e) {
          log(this.id, "Erro ao reproduzir faixa, pulando...", e);
          await sleep(1000);
        }
      } else {
        // Se não for a rádio ativa, apenas simula o tempo passando
        const tempoRestanteSimulado = (track.duracao - offset) * 1000;
        await sleep(tempoRestanteSimulado);
      }

      // Prepara próxima faixa
      offset = 0; 
      index = (index + 1) % playlist.length;
    }
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
  }
}

/* =================== Controle de Interface =================== */

async function switchChannel(newId) {
  if (newId === currentActiveChannelId) return;
  
  const oldStation = stations[currentActiveChannelId];
  const newStation = stations[newId];

  // 1. Efeito de Chiado (Static)
  const staticSource = audioCtx.createBufferSource();
  staticSource.buffer = staticBuffer;
  const staticGain = audioCtx.createGain();
  staticGain.connect(audioCtx.destination);
  staticGain.gain.value = 0.3;
  staticSource.start();
  
  // 2. Desliga a rádio antiga (para de baixar áudio)
  oldStation.masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
  oldStation.stop();

  // 3. Atualiza ID ativo
  currentActiveChannelId = newId;
  window.updateRadioUI(newId);

  // 4. Liga a rádio nova
  newStation.masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1.5);
  
  // O loop "run" da rádio nova já está rodando em background, 
  // ao detectar que virou a ativa, o próximo "while" dela baixará o áudio.
  
  log('RADIO', `Mudou para ${newStation.name}`);
  await sleep(1000);
  staticGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
}

async function startRadio() {
  if (isSystemStarted) return;
  isSystemStarted = true;

  if (audioCtx.state === 'suspended') await audioCtx.resume();
  await loadGlobalData();

  // Inicializa as 4 rádios
  stations.rock = new RadioStation('rock', 'Vinewood Boulevard', 'RADIO_18_90S_ROCK');
  stations.silverlake = new RadioStation('silverlake', 'Radio Mirror Park', 'RADIO_16_SILVERLAKE');
  stations.class_rock = new RadioStation('class_rock', 'Los Santos Rock Radio', 'RADIO_01_CLASS_ROCK');
  stations.kult = new RadioStation('kult', 'Kult FM 99.1', 'RADIO_34_DLC_HEI4_KULT');

  // Roda todas em paralelo
  Object.values(stations).forEach(s => s.run());
}

// Expõe para o HTML
window.__RADIO = { startRadio, switchChannel };
