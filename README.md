# 🏆 CBLOL Draft Arena — Ultimate Card & Simulator Game

[![React](https://img.shields.io/badge/React-18%2B-blue?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6%2B-bd34fe?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4%2B-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-React-ff007f?logo=framer&logoColor=white)](https://motion.dev/)

Um simulador tático e colecionador de cartas de Esports inspirado no cenário competitivo do **CBLOL (Campeonato Brasileiro de League of Legends)**. Monte escalações históricas, monte drafts estratégicos de campeões e dispute um mata-mata simulado contra grandes elencos lendários ou elencos de campanhas desastrosas da história do CBLOL.

---

## 🎮 O que é o Projeto?

O **CBLOL Draft Arena** eleva o gerenciamento de esports a um formato de card game digital dinâmico. O jogador assume o manto de treinador principal em formato de torneio:
1. **Formação de Escalação (Draft de Cartas):** Selecione, rota por rota (Top, Jng, Mid, Bot, Sup), atletas reais com estatísticas baseadas em seus Splits históricos.
2. **Química de Equipe:** Obtenha bônus cruciais de sinergia escalando jogadores da mesma equipe tradicional ou da mesma era competitivo.
3. **Draft de Campeões:** Encare a fase de *Pick & Ban* contra a inteligência artificial, escolhendo composições táticas e *counters* diretos de rotas.
4. **Resolução de Partidas Simulação Ativa:** Uma simulação automatizada que calcula interações de lanes, bônus de entrosamento e mecânicas de counter-matchups com logs detalhados em tempo real de lances no Rift.

O banco de dados contempla desde formações lendárias consagradas como o **Exodia da INTZ 2016**, a **paiN Gaming 2015 do Allianz Parque** e a soberana **LOUD de 2023**, até campanhas desastrosas emblemáticas como o **The Last Dance da LOS de 2024** e os caubóis da **Rensga 2022 (1-17)**.

---

## 🎨 Identidade Visual e Filosofia de Design

O design do app afasta-se de modelos genéricos ou layouts repletos de "poluição visual IA" para focar em uma estética imersiva típica de arenas modernas de esports:
- **Tema Escuro Atmosférico:** Fundo cinza carvoeiro-escuro combinado com iluminação em neon ciano e carmesim representando a clássica rivalidade entre o Lado Azul e Lado Vermelho.
- **Cartas Resplandecentes de Jogadores:** Molduras estilizadas que respondem de acordo com a raridade da carta (*Comum*, *Raro*, *Épico* e *Lendário*), exibindo KDA, estatísticas de farm (CS) e descrições personalizadas.
- **Espaço Negativo Proporcional:** Tipografia elegante usando a fonte de alta legibilidade *Inter* e números detalhados em fontes monoespaçadas de altíssima fidelidade.
- **Micro-Animações Suaves:** Utilização de animações táticas de entrada e transições de rotas fluidas implementadas com a biblioteca **Motion (Framer Motion)**.

---

## 🔒 Arquitetura de Validação & Criptografia (Segurança e Qualidade)

Para garantir um ecossistema à prova de adulterações que pudesse ser integrado de forma transparente a ecossistemas integrados online ou tabelas de classificação, o projeto implementa regras rígidas de segurança de aplicação client-side:

### 1. RNG Criptográfico de Drop de Cartas (Anti-Cheat Local)
Diferente de simulações padrão que confiam no manipulável pseudorreferencial `Math.random()`, o core de probabilidade do CBLOL Draft Arena emprega segurança criptográfica de entropia de sistema operacional:
```typescript
export function getSecureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / 4294967296; // Retorna floats uniformes em intervalo [0, 1)
  }
  return Math.random();
}
```
Isso impossibilita a interceptação e predição de sequências semente para manipulação de picos de raridade de cartas no inventário ou resultados de dados no draft.

### 2. Ocultação de Lógica de Negócios Sensível (Domínio Imutável)
Cálculos vitais do jogo, tais como afinidades e simulações completas de partidas, não dependem de strings injetadas no front-end ou variáveis voláteis nas ações da interface. Toda a lógica de simulação opera exclusivamente a partir de dados imutáveis originários da camada de Domínio, gerando um payload seguro:
- **Cálculo Real de Sinergias (Chemistry):** Sinergia estruturada com base nas chaves canônicas de equipe e temporada das cartas do jogador (`team`, `splitName`).
- **Simulação Atômica de Casamento de Rotas:** O sistema avalia matchups individuais de rotas e coeficientes de counters diretos dos campeões a partir de referências estáticas e mapeadas, retornando pontuações e logs de forma unificada e infalsificável.

### 3. Técnicas Anti-View e Proteção de Fonte de Bundle
Com o foco em impedir cópias superficiais do software ou auditorias locais diretas de usuários maliciosos ao inspecionar a interface renderizada:
- **Supressão Ativa de Ferramentas de Desenvolvedor (DevTools Trap):** Processo em loop infinito e concorrente dispara comandos `debugger` ativamente contra inspetores abertos para congelar o fluxo de telas de depuração.
- **Bloqueio de Associação de Atalhos e Menus:** Eventos disparados capturam e interceptam cliques com o botão direito (`contextmenu`), solicitações do painel do console (`F12`, `Ctrl+Shift+I` / `Cmd+Opt+I` / `J` / `C`), além de ocultar tentativas de salvar o código empacotado (`Ctrl+S`/`Cmd+S`) ou visualizar a receita bruta (`Ctrl+U`/`Cmd+U`).
- **Eliminação de Sourcemaps na Compilação:** Configuração agressiva no Bundler do Vite desativa por completo a emissão de mapas de código fonte (`sourcemaps: false`), tornando o código nos navegadores ilegível e altamente ofuscado.

---

## 🛠️ Tecnologias Utilizadas (Stack)

- **Framework:** `React 18` (com TypeScript estrito)
- **Compilador/Builder:** `Vite 6` + `esbuild` para otimizações táticas
- **Estilização:** `Tailwind CSS` (Tailwind v4)
- **Animações:** `Motion v11` (instalado a partir de `motion/react`)
- **Iconografia:** `Lucide React`
- **Linter & Tipagem:** `ESLint` + `TypeScript compiler` sem supressão de erros (`--noEmit`)

---

## 🚀 Instalação e Execução Local

Siga o passo a passo a seguir para rodar o simulador em sua máquina de desenvolvimento local:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/cblol-draft-arena.git
   cd cblol-draft-arena
   ```

2. **Instale as dependências do projeto:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Abra o navegador no endereço indicado:**
   ```text
   http://localhost:3000
   ```

5. **Para buildar o projeto visando produção:**
   ```bash
   npm run build
   ```

---

## 📑 Divisão de Módulos de Código

Para garantir legibilidade extrema e evitar problemas de saturação de tokens, o código está granularmente bem estruturado:
- `src/types.ts`: Contém os contratos estanques de tipos (`PlayerCard`, `DraftSquad`, `MatchSimulation`, etc.).
- `src/data/players.ts`: O banco de dados histórico do CBLOL rico em estatísticas reais, apelidos e piadas internas de cada época.
- `src/utils/draftEngine.ts`: O motor matemático seguro e criptográfico responsável por drop rates, química de equipe e resolução tática de lutas.
- `src/components/DraftArena.tsx`: O painel moderno onde o jogador escolhe seu elenco histórico.
- `src/components/TournamentBracket.tsx`: A tela do campeonato contendo pick/bans estratégicos, simulação ativa e narrativa do confronto no Rift.

---

### 💚 Créditos e Histórias
O jogo homenageia anos dourados e momentos cômicos que consolidaram o CBLOL como uma das torcidas mais apaixonadas de todo o globo terrestre. Divirta-se colecionando raridades e testando estratégias de draft!
