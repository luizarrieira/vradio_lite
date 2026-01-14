import stationsData from './stations.js';
import { getNewsSubsetForDay, advList } from './adv_news_list.js';

/* =================== CONFIGURAÇÕES GLOBAIS =================== */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

const SAMPLE_RATE = 48000;
const FADE_STATIC_TIME = 2.0; 
const DUCK_VOLUME = 0.2;
const NORMAL_VOLUME = 1.0;

let globalDurations = {}; 
let activeStationId = null; 
const stationsInstances = {}; 
let staticBuffer = null;
let isSystemStarted = false;

/* =================== UTILITÁRIOS ORIGINAIS =================== */
function rand(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null; }
function chance(p) { return Math.random() < p; }

function weightedPick(items) {
  if (!items || items.length === 0) return null;
  if (items[0].w === undefined) return rand(items);
  
  const total = items.reduce((s, i) => s + (i.w || 1), 0);
  let r = Math.random() * total;
  for (const it of items) {
    if (r < (it.w || 1)) return it;
    r -= (it.w || 1);
  }
  return items[0];
}

function getDuration(pathUrl) {
    if (!pathUrl) return null;
    const filename = pathUrl.split('/').pop();
    // Procura no JSON global (tenta caminho completo ou só nome)
    const samples = globalDurations[pathUrl] || globalDurations[filename];
    if (!samples) return null;
    return samples / SAMPLE_RATE; // Retorna segundos
}

/* =================== SETUP INICIAL =================== */

async function loadGlobalData() {
  try {
    const resp = await fetch('duracoes_global.json');
    globalDurations = await resp.json();
    console.log(`[System] Durations loaded: ${Object.keys(globalDurations).length} files.`);
  } catch (e) {
    console.error("ERRO: duracoes_global.json não carregado.", e);
  }
}

async function loadStatic() {
  try {
    const resp = await fetch('0x0DE98BE6.mp3'); 
    const ab = await resp.arrayBuffer();
    staticBuffer = await audioCtx.decodeAudioData(ab);
  } catch(e) {}
}

/* =================== CLASSE RADIOSTATION =================== */

class RadioStation {
  constructor(id, name, folderBase, data) {
    this.id = id;
    this.name = name;
    this.folderBase = folderBase;
    this.data = data;
    
    // Controle de Tempo e Estado
    this.isActive = false; 
    this.audioNodes = []; 
    this.gainNode = null; 
    
    this.nextEventTime = 0; // O "ponteiro" do relógio da rádio
    this.currentTrackInfo = null; // O que está tocando (ou deveria estar) agora
    this.timerHandle = null;
  }

  // --- 1. O CÉREBRO (SUA LÓGICA ORIGINAL) ---
  // Esta função decide O QUE tocar, baseada na estrutura que você já tinha.
  // Ela NÃO toca áudio, apenas monta o "pacote" do que vai tocar.
  generateNextTrack() {
    // AQUI VOCÊ PODE MANTER SUA ESTRUTURA EXATA DE IF/ELSE/CHANCE
    
    // Exemplo da estrutura padrão:
    // 1. Chance de Notícia? (Se quiser usar contadores, adicione this.counter++ na classe)
    /* if (chance(0.1)) { ... return { type: 'news', ... } } */
    
    // 2. Chance de Comercial?
    /* if (chance(0.2)) { ... return { type: 'ad', ... } } */

    // 3. Chance de Vinheta (ID)?
    if (this.data.ids && chance(0.15)) {
        const idFile = rand(this.data.ids);
        const dur = getDuration(idFile);
        if (dur) {
            return {
                type: 'ID',
                mainFile: idFile,
                duration: dur,
                overlay: null,
                meta: { name: this.name, capa: `${this.folderBase}/capas/default.jpg` }
            };
        }
    }

    // 4. Música (Padrão)
    const musicData = weightedPick(this.data.musicas);
    const musicDur = getDuration(musicData.arquivo);
    
    if (!musicDur) {
        // Se der erro na duração, tenta outra recursivamente para não travar
        return this.generateNextTrack(); 
    }

    // Lógica de Overlay (Narração por cima)
    let overlayData = null;
    
    // Verifica se tem intro configurada E se tem narrações para essa música
    if (musicData.introStart && musicData.introEnd && this.data[musicData.name]) {
        // Sua lógica de chance de narração
        if (chance(0.5)) { 
            const possibleVoices = this.data[musicData.name];
            
            // Lógica de encaixe (Fantasma - usa JSON)
            const windowSec = (musicData.introEnd - musicData.introStart) / SAMPLE_RATE;
            
            // Filtra as que cabem
            const validVoices = possibleVoices.filter(v => {
                const d = getDuration(v);
                return d && d <= (windowSec - 0.5);
            });

            if (validVoices.length > 0) {
                const chosen = rand(validVoices);
                const vDur = getDuration(chosen);
                
                // Calcula start para terminar junto com a intro (Hitting the Post)
                const introEndSec = musicData.introEnd / SAMPLE_RATE;
                let vStart = introEndSec - vDur;
                if (vStart < 0) vStart = 0;

                overlayData = {
                    file: chosen,
                    start: vStart,
                    duration: vDur
                };
            }
        }
    }

    // Retorna o objeto pronto para execução
    return {
        type: 'MUSIC',
        mainFile: musicData.arquivo,
        duration: musicDur,
        overlay: overlayData, // Pode ser null ou objeto {file, start, duration}
        meta: musicData
    };
  }

  // --- 2. O MOTOR (MODIFICADO PARA FANTASMA) ---
  
  start() {
    // Define o tempo inicial como AGORA
    this.nextEventTime = audioCtx.currentTime;
    this.cycle(); // Começa o ciclo
  }

  // Substitui o antigo 'run()' com while(true)
  cycle() {
    // 1. Gera o próximo item usando SUA lógica
    const track = this.generateNextTrack();

    // 2. Define os tempos absolutos
    const startTime = this.nextEventTime;
    const endTime = startTime + track.duration;
    
    // Atualiza o ponteiro para a próxima rodada
    this.nextEventTime = endTime;

    // Salva o estado atual
    this.currentTrackInfo = { ...track, startTime, endTime };

    // 3. DECISÃO: Tocar ou Esperar (Fantasma)?
    if (this.isActive) {
        // Se está ativo, carrega e toca
        this.playCurrentTrackReal();
        // UI
        updateUI(this.id, track.meta);
    } else {
        // Se não, agenda o próximo ciclo sem carregar nada
        this.waitPhantom(endTime);
    }
  }

  waitPhantom(endTime) {
    const now = audioCtx.currentTime;
    const delay = (endTime - now) * 1000;
    
    if (this.timerHandle) clearTimeout(this.timerHandle);
    
    if (delay <= 0) {
        this.cycle(); // Já atrasou, roda o próximo imediatamente
    } else {
        // Espera o tempo exato da música passar
        this.timerHandle = setTimeout(() => {
            this.cycle();
        }, delay);
    }
  }

  // --- 3. REPRODUÇÃO REAL (COM FUSÃO/DUCKING) ---

  async playCurrentTrackReal() {
    const info = this.currentTrackInfo;
    const now = audioCtx.currentTime;

    // Se já passou do tempo, pula pro próximo
    if (now >= info.endTime) {
        this.cycle();
        return;
    }

    // Prepara Master Gain
    if (!this.gainNode) {
        this.gainNode = audioCtx.createGain();
        this.gainNode.connect(audioCtx.destination);
    }
    this.gainNode.gain.setValueAtTime(1, now);

    // Carrega arquivos necessários (Música e talvez Voz)
    const filesToLoad = [info.mainFile];
    if (info.overlay) filesToLoad.push(info.overlay.file);

    const buffers = await Promise.all(filesToLoad.map(url => fetchAudio(url)));
    
    // Verifica se ainda é ativo e se ainda é a mesma música
    if (!this.isActive || this.currentTrackInfo !== info) return;

    // --- Configura Música Principal ---
    const musicBuffer = buffers[0];
    if (musicBuffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = musicBuffer;
        
        const musicGain = audioCtx.createGain();
        source.connect(musicGain);
        musicGain.connect(this.gainNode);

        // Calcula offset (Seek) caso tenha pego a música andando
        const offset = Math.max(0, audioCtx.currentTime - info.startTime);
        source.start(0, offset);
        
        this.audioNodes.push({ source, gain: musicGain });

        // --- Configura Ducking e Voz (Se houver) ---
        if (info.overlay && buffers[1]) {
            const voiceBuffer = buffers[1];
            const voiceAbsStart = info.startTime + info.overlay.start;
            const voiceAbsEnd = voiceAbsStart + info.overlay.duration;

            // Só toca a voz se ainda não tiver acabado
            if (audioCtx.currentTime < voiceAbsEnd) {
                const vSource = audioCtx.createBufferSource();
                vSource.buffer = voiceBuffer;
                
                const vGain = audioCtx.createGain();
                // Aumenta um pouco a voz pra ficar claro
                vGain.gain.value = 1.2; 
                vSource.connect(vGain);
                vGain.connect(this.gainNode);

                // Seek da voz
                let vOffset = 0;
                let vStartWhen = voiceAbsStart;

                if (audioCtx.currentTime > voiceAbsStart) {
                    vOffset = audioCtx.currentTime - voiceAbsStart;
                    vStartWhen = audioCtx.currentTime;
                }

                vSource.start(vStartWhen, vOffset);
                this.audioNodes.push({ source: vSource, gain: vGain });

                // Aplica Ducking na MÚSICA
                // Se estamos antes do duck, agenda
                if (audioCtx.currentTime < voiceAbsStart) {
                    musicGain.gain.setValueAtTime(1, voiceAbsStart);
                    musicGain.gain.linearRampToValueAtTime(DUCK_VOLUME, voiceAbsStart + 0.5);
                } 
                // Se estamos no meio do duck, já começa baixo
                else if (audioCtx.currentTime >= voiceAbsStart && audioCtx.currentTime < voiceAbsEnd) {
                    musicGain.gain.setValueAtTime(DUCK_VOLUME, audioCtx.currentTime);
                }

                // Sobe o volume quando acaba a voz
                if (audioCtx.currentTime < voiceAbsEnd) {
                    musicGain.gain.setValueAtTime(DUCK_VOLUME, voiceAbsEnd);
                    musicGain.gain.linearRampToValueAtTime(1, voiceAbsEnd + 1.5);
                }
            }
        }
    }

    // Agenda o próximo ciclo baseado no fim desta faixa
    this.waitPhantom(info.endTime);
  }

  // --- TRANSIÇÕES ---

  async goActive() {
    if (this.isActive) return;
    this.isActive = true;
    console.log(`[${this.name}] Ativando (Carregando áudio)...`);

    // 1. Toca Estática
    const staticData = playStaticSound();

    // 2. Verifica o que deveria estar tocando (Phantom) e Toca (Real)
    if (this.currentTrackInfo) {
        updateUI(this.id, this.currentTrackInfo.meta);
        // Chama a função de tocar (ela já calcula o offset/seek interno)
        await this.playCurrentTrackReal();
    } else {
        // Se por acaso estava nulo, inicia ciclo
        this.cycle();
    }

    // 3. Fade Out Estática
    if (staticData) {
        const now = audioCtx.currentTime;
        staticData.gain.cancelScheduledValues(now);
        staticData.gain.setValueAtTime(0.8, now);
        staticData.gain.linearRampToValueAtTime(0, now + FADE_STATIC_TIME);
        setTimeout(() => staticData.source.stop(), FADE_STATIC_TIME * 1000 + 100);
    }
  }

  goPhantom() {
    if (!this.isActive) return;
    this.isActive = false;
    console.log(`[${this.name}] Modo Fantasma (Desligando áudio)...`);

    // Para todo áudio real imediatamente
    this.stopAllAudio();
    
    // O ciclo lógico continua rodando via 'waitPhantom' que usa setTimeout,
    // então não precisamos fazer nada aqui, o relógio lógico não para.
  }

  stopAllAudio() {
    this.audioNodes.forEach(n => {
        try { n.source.stop(); } catch(e){}
        n.source.disconnect();
        n.gain.disconnect();
    });
    this.audioNodes = [];
  }
}

/* =================== HELPERS DE ÁUDIO =================== */

async function fetchAudio(url) {
  try {
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(ab);
  } catch(e) {
    console.error("Erro load:", url);
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
      const el = document.getElementById('capa');
      if (el) el.src = meta.capa || 'default.jpg';
      console.log(`🎵 [${id.toUpperCase()}] ${meta.name}`);
  }
}

/* =================== INICIALIZAÇÃO =================== */

async function startSystem() {
  if (isSystemStarted) return;
  isSystemStarted = true;
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  await loadGlobalData();
  await loadStatic();

  // Instancie suas rádios aqui
  stationsInstances['rock'] = new RadioStation('rock', 'Vinewood Rock', 'RADIO_01_CLASS_ROCK', stationsData.getClassRock());
  // stationsInstances['pop'] = ... adicione as outras

  // Inicia todas (Fantasma)
  Object.values(stationsInstances).forEach(s => s.start());

  // Ativa a padrão
  switchChannel('rock');
}

window.switchChannel = (id) => {
    if (activeStationId === id) return;
    
    if (activeStationId && stationsInstances[activeStationId]) {
        stationsInstances[activeStationId].goPhantom();
    }
    
    activeStationId = id;
    
    if (stationsInstances[id]) {
        stationsInstances[id].goActive();
    }
    window.updateRadioUI(id);
};

window.__RADIO = { startRadio: startSystem, switchChannel: window.switchChannel };
