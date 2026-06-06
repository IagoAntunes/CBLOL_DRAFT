/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role } from '../types';

export interface Champion {
  id: string;
  name: string;
  role: Role;
  archetype: 'Dano' | 'Tanque' | 'Iniciação' | 'Controle' | 'Suporte';
  flavor: string;
  counters: string[]; // nicknames or champion names it counters
}

export const LOL_CHAMPIONS: Champion[] = [
  // --- TOP LANE ---
  {
    id: "aatrox",
    name: "Aatrox",
    role: "Top",
    archetype: "Dano",
    flavor: "O Espadachim Extinto. Excelente sustento em lutas de equipe grandes.",
    counters: ["Ornn", "Gnar"]
  },
  {
    id: "fiora",
    name: "Fiora",
    role: "Top",
    archetype: "Dano",
    flavor: "A Duelista Implacável. Rainha absoluta da investida dividida (split-push).",
    counters: ["Aatrox", "Gangplank"]
  },
  {
    id: "jax",
    name: "Jax",
    role: "Top",
    archetype: "Dano",
    flavor: "O Grão-Mestre das Armas. Saltos agressivos e contra-ataques cirúrgicos.",
    counters: ["Fiora", "Jayce"]
  },
  {
    id: "gnar",
    name: "Gnar",
    role: "Top",
    archetype: "Iniciação",
    flavor: "O Yordle Pré-Histórico. Iniciações monstruosas quando se transforma em Mega Gnar.",
    counters: ["Jax", "Ornn"]
  },
  {
    id: "ornn",
    name: "Ornn",
    role: "Top",
    archetype: "Tanque",
    flavor: "O Fogo sob a Montanha. Resistência infinita e upgrades lendários de itens.",
    counters: ["Rumble", "Malphite"]
  },
  {
    id: "gangplank",
    name: "Gangplank",
    role: "Top",
    archetype: "Dano",
    flavor: "O Terror dos Doze Mares. Barris explosivos devastadores que mudam rumos de lutas.",
    counters: ["Ornn", "Malphite"]
  },
  {
    id: "jayce",
    name: "Jayce",
    role: "Top",
    archetype: "Dano",
    flavor: "O Defensor do Amanhã. Poké devastadores de longa distância com canhão.",
    counters: ["Gnar", "Aatrox"]
  },

  // --- JUNGLE SELVA ---
  {
    id: "lee-sin",
    name: "Lee Sin",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "O Monge Cego. Pressão extrema de jogo precoce e chutes Insec espetaculares.",
    counters: ["Graves", "Nocturne"]
  },
  {
    id: "sejuani",
    name: "Sejuani",
    role: "Jng",
    archetype: "Tanque",
    flavor: "A Ira do Inverno. Controle de grupo em área e iniciação segura com javali.",
    counters: ["Viego", "Elise"]
  },
  {
    id: "viego",
    name: "Viego",
    role: "Jng",
    archetype: "Dano",
    flavor: "O Rei Destruído. Reseta e possui corpos de inimigos abatidos em lutas.",
    counters: ["Sejuani", "Maokai"]
  },
  {
    id: "elise",
    name: "Elise",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "A Rainha Aranha. Dive de torre impecável no early-game e casulos letais.",
    counters: ["Lee Sin", "Graves"]
  },
  {
    id: "graves",
    name: "Graves",
    role: "Jng",
    archetype: "Dano",
    flavor: "O Foragido. Alto dano físico e velocidade limpando campos da selva oponente.",
    counters: ["Maokai", "Sejuani"]
  },
  {
    id: "jarvan",
    name: "Jarvan IV",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "O Exemplo de Demacia. Confinamento em arena (Cataclismo) para teamfights combinadas.",
    counters: ["Viego", "Nocturne"]
  },
  {
    id: "maokai",
    name: "Maokai",
    role: "Jng",
    archetype: "Tanque",
    flavor: "O Ente Retorcido. Excelente controle tático com mudas explosivas e garras da natureza.",
    counters: ["Lee Sin", "Jarvan"]
  },

  // --- MID LANE ---
  {
    id: "ahri",
    name: "Ahri",
    role: "Mid",
    archetype: "Iniciação",
    flavor: "A Raposa de Nove Caudas. Mobilidade insana de disparos espirituais e encanto letal.",
    counters: ["Azir", "Syndra"]
  },
  {
    id: "azir",
    name: "Azir",
    role: "Mid",
    archetype: "Controle",
    flavor: "O Imperador de Shurima. Soldados de areia implacáveis e o clássico Shurima Shuffle.",
    counters: ["Ryze", "Orianna"]
  },
  {
    id: "orianna",
    name: "Orianna",
    role: "Mid",
    archetype: "Controle",
    flavor: "A Donzela de Ferro. Utilidade insana e choque de ondas de choque de esferas cirúrgicas.",
    counters: ["Syndra", "LeBlanc"]
  },
  {
    id: "syndra",
    name: "Syndra",
    role: "Mid",
    archetype: "Dano",
    flavor: "A Soberana Sombria. Explosão mágica instantânea (burst) de esferas negras transcendentais.",
    counters: ["Ryze", "Zoe"]
  },
  {
    id: "ryze",
    name: "Ryze",
    role: "Mid",
    archetype: "Controle",
    flavor: "O Mago Rúnico. Rotações táticas de teletransporte portal em grupo.",
    counters: ["Zoe", "Katarina"]
  },
  {
    id: "zoe",
    name: "Zoe",
    role: "Mid",
    archetype: "Dano",
    flavor: "A Mensageira Cósmica. Sonhos e estrelas cadentes que solam oponentes de longe.",
    counters: ["Orianna", "Azir"]
  },
  {
    id: "leblanc",
    name: "LeBlanc",
    role: "Mid",
    archetype: "Dano",
    flavor: "A Farsante. Ilusões, clones e infiltração explosiva de alta mobilidade pelas dunas.",
    counters: ["Ryze", "Ahri"]
  },

  // --- BOT LANE ---
  {
    id: "daven",
    name: "Daven (Davenport / Draven)",
    role: "Bot",
    archetype: "Dano",
    flavor: "O Glorioso Carrasco. Pressão de rota opressiva com machados giratórios letais.",
    counters: ["Ezreal", "Jhin"]
  },
  {
    id: "ezreal",
    name: "Ezreal",
    role: "Bot",
    archetype: "Dano",
    flavor: "O Explorador Pródigo. Disparos arcanos constantes e segurança com translocação.",
    counters: ["Kai'Sa", "Zeri"]
  },
  {
    id: "kaisa",
    name: "Kai'Sa",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Filha do Vazio. Sobrevivência impecável e capacidade de mergulhos isolados de longa alcance.",
    counters: ["Daven", "Jhin"]
  },
  {
    id: "jhin",
    name: "Jhin",
    role: "Bot",
    archetype: "Controle",
    flavor: "O Virtuoso. Quatro tiros teatrais de puro impacto artístico e mira letal.",
    counters: ["Zeri", "Ezreal"]
  },
  {
    id: "aphelios",
    name: "Aphelios",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Arma dos Devotos. Arsenal complexo de 5 armas sintonizadas e dano brutal no late-game.",
    counters: ["Kai'Sa", "Daven"]
  },
  {
    id: "zeri",
    name: "Zeri",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Faísca de Zaun. Super velocidade elétrica e projéteis ricocheteando nas lutas.",
    counters: ["Aphelios", "Jhin"]
  },
  {
    id: "kalista",
    name: "Kalista",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Lança da Vingança. Saltos ágeis a cada ataque básico e controle de objetivos épicos.",
    counters: ["Ezreal", "Zeri"]
  },

  // --- SUPPORT LANE ---
  {
    id: "thresh",
    name: "Thresh",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "O Guardião das Correntes. Sentenças de ganchos icônicos e resgates salvadores com lanterna.",
    counters: ["Alistar", "Nautilus"]
  },
  {
    id: "alistar",
    name: "Alistar",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "O Minotauro. Combo clássico de cabeçada+pulverização inquebrável.",
    counters: ["Lulu", "Rakan"]
  },
  {
    id: "bard",
    name: "Bard",
    role: "Sup",
    archetype: "Suporte",
    flavor: "O Protetor Errante. Portais mágicos e congelamento rúnico do espaço-tempo.",
    counters: ["Yuumi", "Lulu"]
  },
  {
    id: "lulu",
    name: "Lulu",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Fada Feiticeira. Crescimento gigante protetor absoluto anti-assassinos.",
    counters: ["Thresh", "Nautilus"]
  },
  {
    id: "yuumi",
    name: "Yuumi",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Gata Mágica. Cura constante e buffs cruciais acoplada no aliado carregador.",
    counters: ["Bard", "Rakan"]
  },
  {
    id: "rakan",
    name: "Rakan",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "O Dançarino de Batalha. Entrada triunfal de alta velocidade e charme em área.",
    counters: ["Thresh", "Lulu"]
  },
  {
    id: "nautilus",
    name: "Nautilus",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "O Titã das Profundezas. Âncora gigansteca de aprisionamento letal sem erro de alvo.",
    counters: ["Yuumi", "Alistar"]
  },
  // --- TOP LANE ---
  {
    id: "darius",
    name: "Darius",
    role: "Top",
    archetype: "Dano",
    flavor: "A Mão de Noxus. Dano massivo com sangramento e guilhotinas que resetam em lutas.",
    counters: ["Sion", "Renekton"]
  },
  {
    id: "renekton",
    name: "Renekton",
    role: "Top",
    archetype: "Dano",
    flavor: "O Carniceiro das Areias. Domínio absoluto de rota e dives agressivos no início do jogo.",
    counters: ["Jax", "Camille"]
  },
  {
    id: "camille",
    name: "Camille",
    role: "Top",
    archetype: "Iniciação",
    flavor: "A Sombra de Aço. Mobilidade imensa nas paredes e isolamento letal de alvos prioritários.",
    counters: ["Aatrox", "Gnar"]
  },
  {
    id: "sion",
    name: "Sion",
    role: "Top",
    archetype: "Tanque",
    flavor: "O Colosso Morto-Vivo. Um trem desgovernado de iniciação e linha de frente infinita.",
    counters: ["Malphite", "Ornn"]
  },
  {
    id: "sett",
    name: "Sett",
    role: "Top",
    archetype: "Iniciação",
    flavor: "O Chefe. Transforma a linha de frente inimiga em uma arma com seu arremesso colossal.",
    counters: ["Irelia", "Renekton"]
  },

  // --- JUNGLE (SELVA) ---
  {
    id: "xin-zhao",
    name: "Xin Zhao",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "O Senescal de Demacia. Duelos fortíssimos nos primeiros níveis e ultimate que isola alvos.",
    counters: ["Lee Sin", "Viego"]
  },
  {
    id: "zac",
    name: "Zac",
    role: "Jng",
    archetype: "Tanque",
    flavor: "A Arma Secreta. Ganks de ângulos imprevisíveis voando das sombras com controle elástico em área.",
    counters: ["Elise", "Sejuani"]
  },
  {
    id: "hecarim",
    name: "Hecarim",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "A Sombra da Guerra. Velocidade de movimento aterrorizante atropelando a linha de trás.",
    counters: ["Graves", "Jarvan"]
  },
  {
    id: "nidalee",
    name: "Nidalee",
    role: "Jng",
    archetype: "Dano",
    flavor: "A Caçadora Bestial. Poké de lanças com altíssimo dano e ritmo de selva inalcançável.",
    counters: ["Zac", "Sejuani"]
  },
  {
    id: "vi",
    name: "Vi",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "A Defensora de Piltover. Lockdown garantido (point-and-click) em alvos carregadores.",
    counters: ["Lee Sin", "Nidalee"]
  },

  // --- MID LANE ---
  {
    id: "yasuo",
    name: "Yasuo",
    role: "Mid",
    archetype: "Dano",
    flavor: "O Imperdoável. Parede de vento cirúrgica e tornados que definem os combates em equipe.",
    counters: ["Syndra", "Gnar"]
  },
  {
    id: "sylas",
    name: "Sylas",
    role: "Mid",
    archetype: "Iniciação",
    flavor: "O Abrupto. Lutas caóticas roubando as ultimates mais importantes dos adversários.",
    counters: ["Malphite", "Sejuani"]
  },
  {
    id: "akali",
    name: "Akali",
    role: "Mid",
    archetype: "Dano",
    flavor: "A Assassina Renegada. Fumaça de invisibilidade tática e execução de alta mobilidade.",
    counters: ["Viktor", "Zoe"]
  },
  {
    id: "viktor",
    name: "Viktor",
    role: "Mid",
    archetype: "Controle",
    flavor: "O Arauto das Máquinas. Controle de zona impenetrável e dano mágico explosivo no late-game.",
    counters: ["Azir", "Ryze"]
  },
  {
    id: "yone",
    name: "Yone",
    role: "Mid",
    archetype: "Dano",
    flavor: "O Inesquecido. Engages espetaculares cruzando telas e dano híbrido com suas lâminas duplas.",
    counters: ["Orianna", "Zoe"]
  },

  // --- BOT LANE ---
  {
    id: "jinx",
    name: "Jinx",
    role: "Bot",
    archetype: "Dano",
    flavor: "O Gatilho Desenfreado. Hypercarry que vira uma máquina de demolição ao conseguir o primeiro abate.",
    counters: ["Ezreal", "Aphelios"]
  },
  {
    id: "lucian",
    name: "Lucian",
    role: "Bot",
    archetype: "Dano",
    flavor: "O Purificador. Atirador de alta mobilidade e pressão opressora na fase de rotas.",
    counters: ["Vayne", "Jhin"]
  },
  {
    id: "vayne",
    name: "Vayne",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Caçadora Noturna. Dano verdadeiro derretendo tanques e reposicionamento com invisibilidade.",
    counters: ["Sion", "Ornn"]
  },
  {
    id: "caitlyn",
    name: "Caitlyn",
    role: "Bot",
    archetype: "Controle",
    flavor: "A Xerife de Piltover. Alcance base máximo controlando passagens com armadilhas táticas.",
    counters: ["Vayne", "Daven"]
  },
  {
    id: "xayah",
    name: "Xayah",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Rebelde. Segurança extrema contra investidas (drives) usando sua tempestade de plumas.",
    counters: ["Kai'Sa", "Zeri"]
  },

  // --- SUPPORT LANE ---
  {
    id: "leona",
    name: "Leona",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "A Alvorada Radiante. Resistência massiva e sequências intermináveis de atordoamento.",
    counters: ["Nautilus", "Yuumi"]
  },
  {
    id: "braum",
    name: "Braum",
    role: "Sup",
    archetype: "Tanque",
    flavor: "O Coração de Freljord. Escudo impenetrável barrando projéteis e defesa impecável da retaguarda.",
    counters: ["Leona", "Nautilus"]
  },
  {
    id: "karma",
    name: "Karma",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Iluminada. Pressão pesada de poké na rota e escudos em área para velocidade do time.",
    counters: ["Lulu", "Thresh"]
  },
  {
    id: "pyke",
    name: "Pyke",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "O Estripador das Águas Sangrentas. Suporte assassino que compartilha ouro em execuções de ultimate.",
    counters: ["Soraka", "Sona"]
  },
  {
    id: "renata",
    name: "Renata Glasc",
    role: "Sup",
    archetype: "Controle",
    flavor: "A Baronesa da Química. Ressurreições condicionais e ultimate que faz os inimigos se matarem.",
    counters: ["Rakan", "Alistar"]
  },
  // --- TOP LANE ---
  {
    id: "mordekaiser",
    name: "Mordekaiser",
    role: "Top",
    archetype: "Dano",
    flavor: "O Revenã de Ferro. Isola completamente um inimigo no Reino da Morte para um duelo sem volta.",
    counters: ["Illaoi", "Shen"]
  },
  {
    id: "shen",
    name: "Shen",
    role: "Top",
    archetype: "Tanque",
    flavor: "O Olho do Crepúsculo. Presença de mapa global, salvando aliados à beira da morte com escudos massivos.",
    counters: ["Renekton", "Camille"]
  },
  {
    id: "ksante",
    name: "K'Sante",
    role: "Top",
    archetype: "Tanque",
    flavor: "O Orgulho de Nazumah. Transforma sua defesa impenetrável em dano absoluto ao isolar oponentes pelas paredes.",
    counters: ["Ornn", "Sion"]
  },
  {
    id: "irelia",
    name: "Irelia",
    role: "Top",
    archetype: "Dano",
    flavor: "A Dançarina das Lâminas. Desliza pelas tropas inimigas com agilidade letal e atordoamentos precisos.",
    counters: ["Aatrox", "Gnar"]
  },

  // --- JUNGLE (SELVA) ---
  {
    id: "rengar",
    name: "Rengar",
    role: "Jng",
    archetype: "Dano",
    flavor: "O Acossador da Alcateia. O predador perfeito que salta invisível das sombras para dizimar os carregadores.",
    counters: ["Kha'Zix", "Evelynn"]
  },
  {
    id: "gragas",
    name: "Gragas",
    role: "Jng",
    archetype: "Iniciação",
    flavor: "O Badernista. Quebra completamente as formações inimigas com barris explosivos cirúrgicos.",
    counters: ["Lee Sin", "Xin Zhao"]
  },
  {
    id: "ivern",
    name: "Ivern",
    role: "Jng",
    archetype: "Suporte",
    flavor: "O Pai do Verde. Caçador pacífico que cria arbustos táticos e invoca a golem Margarida para lutar.",
    counters: ["Rengar", "Nidalee"]
  },
  {
    id: "evelynn",
    name: "Evelynn",
    role: "Jng",
    archetype: "Dano",
    flavor: "O Abraço da Agonia. Camuflagem permanente que aterroriza adversários isolados no mapa.",
    counters: ["Lee Sin", "Vi"]
  },

  // --- MID LANE ---
  {
    id: "kassadin",
    name: "Kassadin",
    role: "Mid",
    archetype: "Dano",
    flavor: "O Andarilho do Vazio. Uma bomba-relógio; fraco no início, mas teletransporta e destrói tudo no fim do jogo.",
    counters: ["Katarina", "Sylas"]
  },
  {
    id: "galio",
    name: "Galio",
    role: "Mid",
    archetype: "Tanque",
    flavor: "O Colosso. Resistência anti-magia absurda e entradas heroicas voando pelos ares para proteger o time.",
    counters: ["LeBlanc", "Akali"]
  },
  {
    id: "talon",
    name: "Talon",
    role: "Mid",
    archetype: "Dano",
    flavor: "A Sombra da Lâmina. O rei do parkour; pula os muros do mapa espalhando pressão nas rotas laterais.",
    counters: ["Zed", "Ahri"]
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    role: "Mid",
    archetype: "Dano",
    flavor: "O Abraço da Serpente. Dano por segundo devastador e atordoamento em cone petrificante.",
    counters: ["Ryze", "Yasuo"]
  },

  // --- BOT LANE ---
  {
    id: "ashe",
    name: "Ashe",
    role: "Bot",
    archetype: "Controle",
    flavor: "A Arqueira de Gelo. Lentidão constante nos ataques e flechas de cristal que iniciam lutas do outro lado do mapa.",
    counters: ["Kalista", "Zeri"]
  },
  {
    id: "samira",
    name: "Samira",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Rosa do Deserto. Mergulha de cabeça no combate corpo a corpo rodopiando em um inferno de balas.",
    counters: ["Aphelios", "Jinx"]
  },
  {
    id: "twitch",
    name: "Twitch",
    role: "Bot",
    archetype: "Dano",
    flavor: "O Semeador da Peste. Esgueira-se invisível para derreter o time inteiro com virotes perfurantes.",
    counters: ["Vayne", "Ezreal"]
  },
  {
    id: "miss-fortune",
    name: "Miss Fortune",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Caçadora de Recompensas. Dominância na fase de rotas e uma chuva de balas devastadora nas lutas de equipe.",
    counters: ["Caitlyn", "Lucian"]
  },

  // --- SUPPORT LANE ---
  {
    id: "blitzcrank",
    name: "Blitzcrank",
    role: "Sup",
    archetype: "Iniciação",
    flavor: "O Grande Golem a Vapor. Um único puxão biônico bem acertado pode decidir o campeonato.",
    counters: ["Sona", "Soraka"]
  },
  {
    id: "soraka",
    name: "Soraka",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Filha das Estrelas. A ambulância do LoL; frustra assassinos curando todo o time com magia celestial.",
    counters: ["Pyke", "Leona"]
  },
  {
    id: "nami",
    name: "Nami",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Conjuradora das Marés. Controla o fluxo da rota com bolhas e invoca maremotos implacáveis.",
    counters: ["Braum", "Tahm Kench"]
  },
  {
    id: "morgana",
    name: "Morgana",
    role: "Sup",
    archetype: "Controle",
    flavor: "A Caída. Anula iniciações inimigas com seu escudo negro e aprisiona alvos por uma eternidade.",
    counters: ["Nautilus", "Thresh"]
  },
  // --- TOP LANE ---
  {
    id: "riven",
    name: "Riven",
    role: "Top",
    archetype: "Dano",
    flavor: "A Exilada. Combos complexos de animação e pura mecânica que recompensam jogadores habilidosos.",
    counters: ["Aatrox", "Yasuo"]
  },
  {
    id: "malphite",
    name: "Malphite",
    role: "Top",
    archetype: "Tanque",
    flavor: "O Fragmento do Monolito. A muralha de pedra que destrói o time inimigo com seu impacto inabalável.",
    counters: ["Jax", "Fiora"]
  },
  {
    id: "teemo",
    name: "Teemo",
    role: "Top",
    archetype: "Controle",
    flavor: "O Explorador Veloz. O terror psicológico da rota superior, plantando cogumelos explosivos por todo o mapa.",
    counters: ["Garen", "Darius"]
  },
  {
    id: "urgot",
    name: "Urgot",
    role: "Top",
    archetype: "Dano",
    flavor: "O Encouraçado. Um tanque de guerra com pernas de metralhadora que tritura quem ousa chegar perto.",
    counters: ["Sion", "Renekton"]
  },

  // --- JUNGLE (SELVA) ---
  {
    id: "khazix",
    name: "Kha'Zix",
    role: "Jng",
    archetype: "Dano",
    flavor: "O Ceifador do Vazio. Adapta-se, evolui e aniquila rapidamente qualquer alvo que cometa o erro de andar isolado.",
    counters: ["Rengar", "Lee Sin"]
  },
  {
    id: "amumu",
    name: "Amumu",
    role: "Jng",
    archetype: "Tanque",
    flavor: "A Múmia Triste. Seu choro em área e atordoamento massivo ditam o destino das lutas em equipe.",
    counters: ["Master Yi", "Xin Zhao"]
  },
  {
    id: "kindred",
    name: "Kindred",
    role: "Jng",
    archetype: "Dano",
    flavor: "Os Caçadores Eternos. Atiradores de selva que escalam marcando alvos e salvam vidas com seu refúgio imortal.",
    counters: ["Lee Sin", "Nidalee"]
  },
  {
    id: "rammus",
    name: "Rammus",
    role: "Jng",
    archetype: "Tanque",
    flavor: "O Tatu Blindado. Rola em alta velocidade para punir severamente composições baseadas em ataque físico.",
    counters: ["Master Yi", "Graves"]
  },

  // --- MID LANE ---
  {
    id: "zed",
    name: "Zed",
    role: "Mid",
    archetype: "Dano",
    flavor: "O Mestre das Sombras. Entra, elimina o carregador com a Marca Fatal e sai ileso trocando de lugar com as sombras.",
    counters: ["Syndra", "Orianna"]
  },
  {
    id: "veigar",
    name: "Veigar",
    role: "Mid",
    archetype: "Controle",
    flavor: "O Pequeno Mestre do Mal. Escala poder mágico infinitamente para explodir inimigos com um único botão.",
    counters: ["Ahri", "LeBlanc"]
  },
  {
    id: "twisted-fate",
    name: "Twisted Fate",
    role: "Mid",
    archetype: "Controle",
    flavor: "O Mestre das Cartas. Pressão de mapa invisível, teletransportando-se para emboscar as rotas laterais.",
    counters: ["Katarina", "Akali"]
  },
  {
    id: "vladimir",
    name: "Vladimir",
    role: "Mid",
    archetype: "Dano",
    flavor: "O Sanguinário Vermelho. Sustento infinito e dano explosivo em área que pode evaporar o time inteiro sozinho.",
    counters: ["Zed", "Talon"]
  },

  // --- BOT LANE ---
  {
    id: "tristana",
    name: "Tristana",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Artilheira Yordle. Demolidora implacável de torres que pula em cima dos inimigos com confiança explosiva.",
    counters: ["Caitlyn", "Jinx"]
  },
  {
    id: "sivir",
    name: "Sivir",
    role: "Bot",
    archetype: "Controle",
    flavor: "A Mestra da Batalha. Escudo de feitiço e aceleração em grupo perfeita para composições de iniciação rápida (hard engage).",
    counters: ["Ashe", "Caitlyn"]
  },
  {
    id: "varus",
    name: "Varus",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Flecha da Retribuição. Dano misto e controle de grupo poderoso para iniciar lutas da própria rota inferior.",
    counters: ["Daven", "Aphelios"]
  },
  {
    id: "kogmaw",
    name: "Kog'Maw",
    role: "Bot",
    archetype: "Dano",
    flavor: "A Boca do Abismo. O hipercarregador definitivo, derrete absolutamente qualquer coisa que fique no seu caminho se bem protegido.",
    counters: ["Vayne", "Ezreal"]
  },

  // --- SUPPORT LANE ---
  {
    id: "janna",
    name: "Janna",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Fúria da Tormenta. A rainha do desengajamento; furacões e ventos curativos que anulam qualquer tentativa de investida.",
    counters: ["Leona", "Alistar"]
  },
  {
    id: "tahm-kench",
    name: "Tahm Kench",
    role: "Sup",
    archetype: "Tanque",
    flavor: "O Rei do Rio. Engole seus aliados para salvá-los de punições certas ou devora inimigos isolados.",
    counters: ["Blitzcrank", "Thresh"]
  },
  {
    id: "sona",
    name: "Sona",
    role: "Sup",
    archetype: "Suporte",
    flavor: "A Mestra das Cordas. Uma aura musical ambulante que cura, acelera e atordoa times inteiros no compasso perfeito.",
    counters: ["Janna", "Soraka"]
  },
  {
    id: "zilean",
    name: "Zilean",
    role: "Sup",
    archetype: "Controle",
    flavor: "O Guardião do Tempo. Bombas duplas e a incrível capacidade de ressuscitar aliados e mudar o destino da luta.",
    counters: ["Pyke", "Morgana"]
  }
];
