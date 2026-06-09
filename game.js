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


// =============================================================
// 2. GERADOR DE GOLS — Distribuição de Poisson
// =============================================================
// Quanto maior a média, maior a tendência de gerar mais gols.
// Times mais fortes recebem média maior, então marcam mais.
// =============================================================

function gerarGols(mediaGols) {
  let L = Math.exp(-mediaGols);
  let k = 1;
  let p = Math.random();
  while (p > L) {
    k++;
    p *= Math.random();
  }
  return k - 1;
}


// -------------------------------------------------------------
// 3. MOTOR DE SIMULAÇÃO
// -------------------------------------------------------------
// P(A vence) = coefA / (coefA + coefB)
// Na fase de grupos permite empate. No mata-mata não.
// -------------------------------------------------------------

function simularPartida(siglaA, siglaB, fase, permitirEmpate = true) {
  const timeA  = Grafo.getTime(siglaA);
  const timeB  = Grafo.getTime(siglaB);
  const probA  = timeA.coeficiente / (timeA.coeficiente + timeB.coeficiente);
  const mediaA = 0.5 + probA * 2;
  const mediaB = 0.5 + (1 - probA) * 2;

  let golsA = gerarGols(mediaA);
  let golsB = gerarGols(mediaB);
  const rand = Math.random();

  if (rand < probA) {
    // Time A vence — garante que golsA > golsB
    if (golsA <= golsB) golsA = golsB + 1;
  } else if (permitirEmpate && rand < probA + 0.25) {
    // FIX: removido operador vírgula que tornava a condição sempre verdadeira
    const menor = Math.min(golsA, golsB);
    golsA = menor;
    golsB = menor;
  } else {
    // Time B vence — garante que golsB > golsA
    if (golsB <= golsA) golsB = golsA + 1;
  }

  const vencedor = golsA > golsB ? timeA : golsB > golsA ? timeB : null;
  const perdedor = golsA > golsB ? timeB : golsB > golsA ? timeA : null;

  Grafo.adicionarAresta(siglaA, siglaB, fase);
  const aresta    = Grafo.arestas[Grafo.arestas.length - 1];
  aresta.vencedor = vencedor ? vencedor.sigla : "EMPATE";
  aresta.golsA    = golsA;
  aresta.golsB    = golsB;
  aresta.probA    = (probA * 100).toFixed(1);
  aresta.probB    = ((1 - probA) * 100).toFixed(1);

  return { vencedor, perdedor, golsA, golsB };
}


// -------------------------------------------------------------
// 4. SORTEIO DOS GRUPOS — Fisher-Yates
// -------------------------------------------------------------
// 48 times embaralhados → 12 grupos de 4 (A até L)
// -------------------------------------------------------------

function sortearGrupos(selecoes) {
  const nomeGrupos   = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const embaralhados = [...selecoes];

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
// 5. FASE DE GRUPOS
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

    const pontos    = {};
    const saldoGols = {};
    const golsPro   = {};
    times.forEach(s => { pontos[s] = 0; saldoGols[s] = 0; golsPro[s] = 0; });

    Grafo.arestas
      .filter(a => a.fase.startsWith(`Grupo ${nomeGrupo}`))
      .forEach(a => {
        if (a.vencedor === "EMPATE") {
          pontos[a.timeA] += 1;
          pontos[a.timeB] += 1;
        } else {
          pontos[a.vencedor] += 3;
        }
        saldoGols[a.timeA] += a.golsA - a.golsB;
        saldoGols[a.timeB] += a.golsB - a.golsA;
        golsPro[a.timeA]   += a.golsA;
        golsPro[a.timeB]   += a.golsB;
      });

    const classificacao = Object.entries(pontos)
      .sort((a, b) => {
        const [siglaA, ptsA] = a;
        const [siglaB, ptsB] = b;
        if (ptsB !== ptsA)                           return ptsB - ptsA;
        if (saldoGols[siglaB] !== saldoGols[siglaA]) return saldoGols[siglaB] - saldoGols[siglaA];
        if (golsPro[siglaB]   !== golsPro[siglaA])   return golsPro[siglaB]   - golsPro[siglaA];
        return Grafo.getTime(siglaB).coeficiente - Grafo.getTime(siglaA).coeficiente;
      })
      .map(([sigla, pts]) => ({ sigla, pts }));

    resultadosGrupos[nomeGrupo] = {
      times,
      pontos,
      saldoGols,
      golsPro,
      primeiro: classificacao[0].sigla,
      segundo:  classificacao[1].sigla,
      // FIX: terceiro agora carrega saldoGols e golsPro para desempate correto
      terceiro: {
        sigla:     classificacao[2].sigla,
        pts:       classificacao[2].pts,
        saldoGols: saldoGols[classificacao[2].sigla],
        golsPro:   golsPro[classificacao[2].sigla],
      },
      quarto: classificacao[3].sigla,
    };
  });

  return resultadosGrupos;
}


// -------------------------------------------------------------
// 6. SELECIONAR 8 MELHORES TERCEIROS COLOCADOS
// -------------------------------------------------------------
// FIX: critério completo — pontos → saldo de gols → gols pró
// -------------------------------------------------------------

function selecionarMelhoresTerceiros(resultadosGrupos) {
  return Object.values(resultadosGrupos)
    .map(g => g.terceiro)
    .sort((a, b) => {
      if (b.pts       !== a.pts)       return b.pts       - a.pts;
      if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
      return b.golsPro - a.golsPro;
    })
    .slice(0, 8)
    .map(t => t.sigla);
}


// -------------------------------------------------------------
// 7. MATA-MATA — travessia do DAG (32 times)
// -------------------------------------------------------------

function simularRodada(times, nomeFase, debug = false) {
  // FIX: console.log agora é opcional via flag debug
  if (debug) console.log(`\n=== ${nomeFase.toUpperCase()} ===`);
  const vencedores = [];
  for (let i = 0; i < times.length; i += 2) {
    const { vencedor } = simularPartida(times[i], times[i + 1], nomeFase, false);
    if (debug) console.log(`  ${times[i]} x ${times[i + 1]} → ${vencedor.nome}`);
    vencedores.push(vencedor.sigla);
  }
  return vencedores;
}

function simularMataMata(classificados32, debug = false) {
  // FIX: nomes das variáveis refletem quem avança, não a fase anterior
  const classificados16 = simularRodada(classificados32,    "32avos de Final",  debug);
  const classificados8  = simularRodada(classificados16,    "16avos de Final",  debug);
  const classificados4  = simularRodada(classificados8,     "Quartas de Final", debug);
  const classificados2  = simularRodada(classificados4,     "Semifinais",       debug);
  const [campeao]       = simularRodada(classificados2,     "Final",            debug);
  return Grafo.getTime(campeao);
}


// -------------------------------------------------------------
// 8. INICIALIZAÇÃO COMPLETA
// -------------------------------------------------------------

let _estado = null;

function iniciarTorneio(debug = false) {
  // FIX: validação do número de times antes de iniciar
  if (SELECOES.length !== 48) {
    console.error(`SELECOES deve ter exatamente 48 times. Encontrado: ${SELECOES.length}`);
    return null;
  }

  Grafo.inicializar(SELECOES);

  const grupos           = sortearGrupos(SELECOES);
  const resultadosGrupos = simularFaseDeGrupos(grupos);

  const primeiros         = Object.values(resultadosGrupos).map(g => g.primeiro);
  const segundos          = Object.values(resultadosGrupos).map(g => g.segundo);
  const melhoresTerceiros = selecionarMelhoresTerceiros(resultadosGrupos);

  const classificados32 = [];
  for (let i = 0; i < 12; i++) {
    classificados32.push(primeiros[i]);
    classificados32.push(segundos[i]);
  }
  melhoresTerceiros.forEach((sigla, i) => {
    classificados32.splice(i * 4 + 2, 0, sigla);
  });
  const bracket32 = classificados32.slice(0, 32);

  const campeao = simularMataMata(bracket32, debug);

  _estado = { grupos, resultadosGrupos, melhoresTerceiros, campeao, grafo: Grafo };
  return _estado;
}


// =============================================================
// 9. RESETAR
// =============================================================

function resetar() {
  // FIX: usa inicializar() em vez de mutar Grafo diretamente
  Grafo.inicializar([]);
  _estado = null;
}


// =============================================================
// 10. CAMADA DE ACESSO — objeto Torneio
// =============================================================

const Torneio = {
  getGrupos:           ()      => _estado?.grupos,
  getResultadoGrupos:  ()      => _estado?.resultadosGrupos,
  getCampeao:          ()      => _estado?.campeao,
  getMelhoresTerceiros:()      => _estado?.melhoresTerceiros,
  getPartidasDaFase:   (fase)  => Grafo.arestas.filter(a => a.fase === fase),
  getPartidasDoGrupo:  (letra) => Grafo.arestas.filter(a => a.fase.startsWith(`Grupo ${letra}`)),
  // FIX: métodos adicionais necessários para o front-end
  getTime:             (sigla) => Grafo.getTime(sigla),
  getTimes:            ()      => Object.values(Grafo.vertices),
  isIniciado:          ()      => _estado !== null,
  getPartidasMataMata: ()      => Grafo.arestas.filter(a => !a.fase.startsWith("Grupo")),
};