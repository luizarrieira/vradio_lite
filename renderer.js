import stationsData from './stations.js';

/* =================== Configurações Globais =================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

let gradeProgramada = null;
let staticBuffer = null;
let isSystemStarted = false;
let currentActiveChannelId = 'rock'; 
let stations = {};

// Variáveis para controle da Estática
let staticSource = null;
let staticGain = null;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* =================== Controle da Estática =================== */

/**
 * Inicia o chiado em loop infinito
 */
function startStaticLoop() {
  if (staticSource) return; // Evita sobreposição

  staticSource = audioCtx.createBufferSource();
  staticSource.buffer = staticBuffer;
  staticSource.loop = true; // <--- Ativa o loop

  staticGain = audioCtx.createGain();
  staticGain.connect(audioCtx.destination);
  staticGain.gain.value = 0.2; // Volume da estática

  staticSource.connect(staticGain);
  staticSource.start();
}

/**
 * Para o chiado com um fade-out suave
 */
function stopStaticLoop() {
  if (staticSource) {
    const now = audioCtx.currentTime;
    staticGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    staticSource.stop(now + 0.4);
    
    staticSource = null;
    staticGain = null;
  }
}

/* =================== Classe RadioStation =================== */
class RadioStation {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.isPlaying = false;
    this.currentSource = null;
    this.masterGain = audioCtx.createGain();
    this.masterGain.connect(audioCtx.destination);
    this.masterGain.gain.value = 0;
  }

  sincronizarComRelogio() {
    const agora = new Date();
    const dia = agora.getDate().toString();
    const segundosHoje = (agora.getHours() * 3600) + (agora.getMinutes() * 60) + agora.getSeconds();
    
    const playlistDoDia = gradeProgramada[this.id][dia];
    if (!playlistDoDia) return null;

    for (let i = 0; i < playlistDoDia.length; i++) {
      const item = playlistDoDia[i];
      const fimItem = item.inicio + item.duracao;
      if (segundosHoje >= item.inicio && segundosHoje < fimItem) {
        return { index: i, offset: segundosHoje - item.inicio };
      }
    }
    return { index: 0, offset: 0 };
  }

  async play() {
    this.isPlaying = true;
    
    let sync = this.sincronizarComRelogio();
    if (!sync) return;

    let currentIndex = sync.index;
    let currentOffset = sync.offset;

    while (this.isPlaying) {
      const dia = new Date().getDate().toString();
      const track = gradeProgramada[this.id][dia][currentIndex];

      try {
        // --- INÍCIO DO CARREGAMENTO ---
        const resp = await fetch(track.path);
        const arrayBuffer = await resp.arrayBuffer();
        const buffer = await audioCtx.decodeAudioData(arrayBuffer);
        // --- FIM DO CARREGAMENTO ---

        // Quando o áudio estiver carregado e decodificado, paramos a estática
        stopStaticLoop();

        // Faz o volume da rádio subir
        this.masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, 0.2);

        if (track.musicaObj && this.id === currentActiveChannelId) {
          document.getElementById('capa').src = track.musicaObj.capa;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.masterGain);
        
        source.start(audioCtx.currentTime, currentOffset);
        this.currentSource = source;

        const duracaoRestante = (buffer.duration - currentOffset) * 1000;
        await sleep(duracaoRestante);

      } catch (e) {
        console.error("Erro na reprodução:", e);
        await sleep(1000);
      }

      currentOffset = 0;
      currentIndex = (currentIndex + 1) % gradeProgramada[this.id][dia].length;
    }
  }

  stop() {
    this.isPlaying = false;
    this.masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch(e){}
      this.currentSource = null;
    }
  }
}

/* =================== Controle de Interface =================== */

async function switchChannel(newId) {
  if (newId === currentActiveChannelId && stations[newId].isPlaying) return;

  // 1. Para a rádio atual e tira o volume
  if (stations[currentActiveChannelId]) {
    stations[currentActiveChannelId].stop();
  }

  // 2. Aciona a estática em LOOP imediatamente
  startStaticLoop();

  // 3. Troca o ID e atualiza UI
  currentActiveChannelId = newId;
  window.updateRadioUI(newId);
  
  // 4. Inicia a rádio nova (ela vai carregar o arquivo e desligar o chiado quando terminar)
  stations[newId].play(); 
}

/* =================== Inicialização =================== */

async function startRadio() {
  if (isSystemStarted) return;
  isSystemStarted = true;

  if (audioCtx.state === 'suspended') await audioCtx.resume();

  // Carrega Grade e Chiado Inicial
  const [gradeResp, staticResp] = await Promise.all([
    fetch('programacao.json'),
    fetch('0x0DE98BE6.mp3')
  ]);
  gradeProgramada = await gradeResp.json();
  const staticAb = await staticResp.arrayBuffer();
  staticBuffer = await audioCtx.decodeAudioData(staticAb);

  stations.rock = new RadioStation('rock', 'Vinewood Blvd');
  stations.silverlake = new RadioStation('silverlake', 'Radio Mirror Park');
  stations.class_rock = new RadioStation('class_rock', 'LS Rock Radio');
  stations.kult = new RadioStation('kult', 'Kult FM');

  // Começa com a rádio ativa padrão
  stations[currentActiveChannelId].play();
}

window.__RADIO = { startRadio, switchChannel };
