import stationsData from './stations.js';
import { advList, getNewsSubsetForDay } from './adv_news_list.js';

// --- Utilitários de Tempo e Lógica ---

const rand = (arr) => arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

// Função de escolha ponderada (Weights)
const weightedPick = (items) => {
    const total = items.reduce((s, i) => s + i.w, 0);
    let r = Math.random() * total;
    for (const it of items) {
        if (r < it.w) return it.k;
        r -= it.w;
    }
    return items[0].k;
};

// Calcula o dia do ano (1 a 366) baseado no timestamp
function getDayOfYear(timestamp) {
    const date = new Date(timestamp);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Filtra arquivos baseados no horário virtual (Ex: Não tocar "Good Morning" de noite)
function filterByTime(fileList, currentTimestamp) {
    if (!fileList || fileList.length === 0) return [];
    
    const date = new Date(currentTimestamp);
    const hour = date.getHours();

    const isMorning = (hour >= 5 && hour < 12);
    const isNight = (hour >= 19 || hour < 5);

    // Filtra lista
    const allowed = fileList.filter(f => {
        const nameUpper = f.toUpperCase();
        if (isMorning && (nameUpper.includes('NIGHT') || nameUpper.includes('EVENING'))) return false;
        if (isNight && (nameUpper.includes('MORNING'))) return false;
        return true;
    });

    // Se o filtro removeu tudo (ex: só tinha arquivos de noite e é de manhã), retorna a lista original para não travar
    return allowed.length > 0 ? allowed : fileList;
}

// --- Carregamento Simulado de Metadados ---
let audioMetadata = {};

async function loadMetadata() {
    try {
        const response = await fetch('audio_metadata.json');
        audioMetadata = await response.json();
    } catch (e) {
        console.warn("Metadados não encontrados, usando duração padrão.");
    }
}

function getDuration(path) {
    // Tenta achar a chave exata
    if (audioMetadata[path] && audioMetadata[path]._debug) {
        return audioMetadata[path]._debug.duration;
    }
    // Tenta achar por correspondência parcial (o metadata às vezes tem prefixos diferentes)
    const key = Object.keys(audioMetadata).find(k => path.includes(k) || k.includes(path));
    if (key && audioMetadata[key]._debug) {
        return audioMetadata[key]._debug.duration;
    }
    return 180; // 3 minutos padrão se falhar
}

// --- Classe da Estação Virtual ---

class VirtualStation {
    constructor(id, data) {
        this.id = id;
        this.data = data;
        this.playlist = [];
        // Define o ano base como 2026 (para garantir ano cheio)
        this.virtualTime = new Date('2026-01-01T00:00:00').getTime(); 
        this.endTime = new Date('2026-12-31T23:59:59').getTime();
    }

    generateYear() {
        console.log(`Gerando grade inteligente para: ${this.id}...`);
        
        while (this.virtualTime < this.endTime) {
            let sequence = [];
            let seqType;

            // 1. Define a Sequência baseada nos PESOS (%)
            if (this.id === 'kult') {
                seqType = weightedPick([
                    {k:'idkult+musica', w:30},
                    {k:'musica', w:30},
                    {k:'adkult+idkult+musica', w:20},
                    {k:'djsolo+musica', w:16},
                    {k:'adkult+djsolo+musica', w:4}
                ]);
            } else {
                seqType = weightedPick([
                    {k:'djsolo+musica', w:30},
                    {k:'musica', w:30},
                    {k:'id+musica', w:24},
                    {k:'adv+id+musica', w:14},
                    {k:'djsolo+id+musica', w:2}
                ]);
            }

            // 2. Constrói a Playlist respeitando Horário e Calendário
            
            // --- ADVERTS (Gerais) ---
            if (seqType.includes('adv')) {
                // Pega propaganda genérica
                sequence.push({ type: 'ad', file: `adv/${rand(advList)}.mp3` });
            }

            // --- ADVERTS (Kult Específicos) ---
            if (seqType.includes('adkult')) {
                const adFile = rand(this.data.narracoes.filter(n => n.toUpperCase().includes('AD')));
                if (adFile) sequence.push({ type: 'ad', file: adFile });
            }

            // --- NEWS (Com Lógica de Data) ---
            if (seqType.includes('news')) {
                const dayOfYear = getDayOfYear(this.virtualTime);
                // Pega apenas as notícias permitidas para este dia do ano
                const validNewsList = getNewsSubsetForDay(dayOfYear); 
                const newsFile = rand(validNewsList);
                sequence.push({ type: 'news', file: `adv/${newsFile}.mp3` });
            }

            // --- DJ / IDs (Com Lógica de Horário - Bom dia/Boa noite) ---
            if (seqType.includes('djsolo')) {
                // Filtra narrações compatíveis com a hora atual
                const validNarrations = filterByTime(this.data.narracoes, this.virtualTime);
                sequence.push({ type: 'dj', file: rand(validNarrations) });
            }

            if (seqType.includes('id') || seqType.includes('idkult')) {
                const validIds = filterByTime(this.data.ids, this.virtualTime);
                sequence.push({ type: 'id', file: rand(validIds) });
            }
            
            // --- MÚSICA ---
            if (seqType.includes('musica')) {
                const musicFile = rand(this.data.musicas);
                sequence.push({ 
                    type: 'music', 
                    file: musicFile.arquivo, 
                    id: musicFile.id,
                    capa: musicFile.capa 
                });
            }

            // 3. Processa e Salva
            for (let item of sequence) {
                if(!item.file) continue; // Segurança

                const duration = getDuration(item.file);
                
                this.playlist.push({
                    ...item,
                    startAt: this.virtualTime,
                    duration: duration
                });

                // Avança o tempo virtual
                // Remove 0.2s para simular transição rápida
                this.virtualTime += (duration * 1000) - 200; 
            }
        }
        console.log(`${this.id} finalizada. Itens na grade: ${this.playlist.length}`);
    }
}

// --- Função Principal ---
export async function generateAndDownloadSchedule() {
    await loadMetadata();

    const stations = {
        rock: new VirtualStation('rock', stationsData.getRock()),
        silverlake: new VirtualStation('silverlake', stationsData.getSilver()),
        class_rock: new VirtualStation('class_rock', stationsData.getClassRock()),
        kult: new VirtualStation('kult', stationsData.getKult())
    };

    const fullSchedule = {};

    for (const [key, station] of Object.entries(stations)) {
        station.generateYear();
        fullSchedule[key] = station.playlist;
    }

    const blob = new Blob([JSON.stringify(fullSchedule)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "schedule_2026.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}