// =============================================================
// game.js — Estrutura do Grafo e Motor de Simulação
// =============================================================
// CONCEITOS DE GRAFOS APLICADOS:
//
// VÉRTICE  → cada seleção (objeto em SELECOES)
// ARESTA   → cada partida entre dois times
// PESO     → coeficiente Fifa do time (define probabilidade)
// DAG      → o torneio é um Grafo Dirigido Acíclico:
//            o vencedor sempre avança, nunca volta
//
// FORMATO COPA 2026:
//   48 times → 12 grupos de 4
//   Classificam: 1º e 2º de cada grupo (24) + 8 melhores 3ºs = 32
//   Mata-mata: 32avos → 16avos → Quartas → Semi → Final
// =============================================================
// -------------------------------------------------------------
// 1. GRAFO
// -------------------------------------------------------------

const Grafo = {
  vertices: {},
  arestas:  [],

  inicializar(selecoes) {
    this.vertices = {};
    this.arestas  = [];
    selecoes.forEach(time => {
      this.vertices[time.sigla] = { ...time, pontos: 0, vitorias: 0, derrotas: 0 };
    });
  },

  adicionarAresta(siglaA, siglaB, fase) {
    this.arestas.push({ timeA: siglaA, timeB: siglaB, fase, vencedor: null });
  },

  getTime(sigla) {
    return this.vertices[sigla];
  }
};

// -------------------------------------------------------------
// 2. MOTOR DE SIMULAÇÃO
// -------------------------------------------------------------
// P(A vence) = coefA / (coefA + coefB)
// -------------------------------------------------------------

function simularPartida(siglaA, siglaB, fase) {
  const timeA   = Grafo.getTime(siglaA);
  const timeB   = Grafo.getTime(siglaB);
  const probA   = timeA.coeficiente / (timeA.coeficiente + timeB.coeficiente);
  const vencedor = Math.random() < probA ? timeA : timeB;
  const perdedor = vencedor.sigla === siglaA ? timeB : timeA;

  Grafo.adicionarAresta(siglaA, siglaB, fase);
  const aresta    = Grafo.arestas[Grafo.arestas.length - 1];
  aresta.vencedor = vencedor.sigla;
  aresta.probA    = (probA * 100).toFixed(1);
  aresta.probB    = ((1 - probA) * 100).toFixed(1);

  return { vencedor, perdedor };
}


// -------------------------------------------------------------
// 3. SORTEIO DOS GRUPOS — Fisher-Yates
// -------------------------------------------------------------
// 48 times embaralhados → 12 grupos de 4 (A até L)
// -------------------------------------------------------------

function sortearGrupos(selecoes) {
  const nomeGrupos  = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const embaralhados = [...selecoes];

  // Fisher-Yates shuffle
  for (let i = embaralhados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhados[i], embaralhados[j]] = [embaralhados[j], embaralhados[i]];
  }

  const grupos = {};
  nomeGrupos.forEach((letra, i) => {
    grupos[letra] = embaralhados.slice(i * 4, i * 4 + 4).map(t => t.sigla);
  });

  return grupos;
}


// -------------------------------------------------------------
// 4. FASE DE GRUPOS
// -------------------------------------------------------------
// 6 partidas por grupo (todos contra todos).
// Classificam: 1º e 2º de cada grupo + 8 melhores 3ºs lugares.
// Total: 24 + 8 = 32 times no mata-mata.
// -------------------------------------------------------------

function simularFaseDeGrupos(grupos) {
  const resultadosGrupos = {};

  Object.entries(grupos).forEach(([nomeGrupo, times]) => {
    const [t0, t1, t2, t3] = times;

    simularPartida(t0, t1, `Grupo ${nomeGrupo} - R1`);
    simularPartida(t2, t3, `Grupo ${nomeGrupo} - R1`);
    simularPartida(t0, t2, `Grupo ${nomeGrupo} - R2`);
    simularPartida(t1, t3, `Grupo ${nomeGrupo} - R2`);
    simularPartida(t0, t3, `Grupo ${nomeGrupo} - R3`);
    simularPartida(t1, t2, `Grupo ${nomeGrupo} - R3`);

    const pontos = {};
    times.forEach(s => pontos[s] = 0);
    Grafo.arestas
      .filter(a => a.fase.startsWith(`Grupo ${nomeGrupo}`))
      .forEach(a => { pontos[a.vencedor] += 3; });

    const classificacao = Object.entries(pontos)
      .sort((a, b) => b[1] - a[1])
      .map(([sigla, pts]) => ({ sigla, pts }));

    resultadosGrupos[nomeGrupo] = {
      times,
      pontos,
      primeiro:   classificacao[0].sigla,
      segundo:    classificacao[1].sigla,
      terceiro:   { sigla: classificacao[2].sigla, pts: classificacao[2].pts },
      quarto:     classificacao[3].sigla,
    };
  });

  return resultadosGrupos;
}

// -------------------------------------------------------------
// 5. SELECIONAR 8 MELHORES TERCEIROS COLOCADOS
// -------------------------------------------------------------
// Dos 12 terceiros colocados (um por grupo), os 8 com mais
// pontos avançam para o mata-mata.
// -------------------------------------------------------------

function selecionarMelhoresTerceiros(resultadosGrupos) {
  const terceiros = Object.values(resultadosGrupos)
    .map(g => g.terceiro)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 8)
    .map(t => t.sigla);

  return terceiros;
}


// -------------------------------------------------------------
// 6. MATA-MATA — travessia do DAG (32 times)
// -------------------------------------------------------------

function simularRodada(times, nomeFase) {
  console.log(`\n=== ${nomeFase.toUpperCase()} ===`);
  const vencedores = [];
  for (let i = 0; i < times.length; i += 2) {
    const { vencedor } = simularPartida(times[i], times[i + 1], nomeFase);
    console.log(`  ${times[i]} x ${times[i+1]} → ${vencedor.nome}`);
    vencedores.push(vencedor.sigla);
  }
  return vencedores;
}

function simularMataMata(classificados32) {
  const r16   = simularRodada(classificados32,   "32avos de Final");
  const quartas = simularRodada(r16,             "16avos de Final");
  const semi    = simularRodada(quartas,         "Quartas de Final");
  const final   = simularRodada(semi,            "Semifinais");
  const [campeao] = simularRodada(final,         "Final");

  return Grafo.getTime(campeao);
}


// -------------------------------------------------------------
// 7. INICIALIZAÇÃO COMPLETA
// -------------------------------------------------------------

function iniciarTorneio() {
  Grafo.inicializar(SELECOES);

  const grupos           = sortearGrupos(SELECOES);
  const resultadosGrupos = simularFaseDeGrupos(grupos);

  // Monta os 24 classificados diretos (1º e 2º de cada grupo)
  const primeiros = Object.values(resultadosGrupos).map(g => g.primeiro);
  const segundos  = Object.values(resultadosGrupos).map(g => g.segundo);

  // 8 melhores terceiros
  const melhoresTerceiros = selecionarMelhoresTerceiros(resultadosGrupos);

  // 32 times no mata-mata: primeiros (12) + segundos (12) + terceiros (8)
  // Intercalados para equilibrar o chaveamento
  const classificados32 = [];
  for (let i = 0; i < 12; i++) {
    classificados32.push(primeiros[i]);
    classificados32.push(segundos[i]);
  }
  // Insere os 8 melhores terceiros no chaveamento
  melhoresTerceiros.forEach((sigla, i) => {
    classificados32.splice(i * 4 + 2, 0, sigla);
  });
  // Garante exatamente 32 times
  const bracket32 = classificados32.slice(0, 32);

  const campeao = simularMataMata(bracket32);

  return { grupos, resultadosGrupos, melhoresTerceiros, campeao, grafo: Grafo };
}