// =============================================================
// selecoes.js — Vértices do grafo
// =============================================================
// Na teoria de grafos, cada seleção é um VÉRTICE (nó).
// O coeficiente Fifa é o PESO do vértice, usado para calcular
// a probabilidade de vitória em cada aresta (partida).
//
// Os grupos NÃO são definidos aqui — o sorteio é feito
// dinamicamente pela função sortearGrupos() no game.js.
// =============================================================

const SELECOES = [
  { nome: "Argentina", sigla: "ARG", coeficiente: 1875, bandeira: "flags/ARG.png" },
  { nome: "Espanha", sigla: "ESP", coeficiente: 1873, bandeira: "flags/ESP.png" },
  { nome: "França", sigla: "FRA", coeficiente: 1869, bandeira: "flags/FRA.png" },
  { nome: "Inglaterra", sigla: "ENG", coeficiente: 1826, bandeira: "flags/ENG.png" },
  { nome: "Portugal", sigla: "POR", coeficiente: 1764, bandeira: "flags/POR.png" },
  { nome: "Brasil", sigla: "BRA", coeficiente: 1761, bandeira: "flags/BRA.png" },
  { nome: "Holanda", sigla: "NED", coeficiente: 1758, bandeira: "flags/NED.png" },
  { nome: "Marrocos", sigla: "MAR", coeficiente: 1756, bandeira: "flags/MAR.png" },
  { nome: "Bélgica", sigla: "BEL", coeficiente: 1735, bandeira: "flags/BEL.png" },
  { nome: "Alemanha", sigla: "GER", coeficiente: 1730, bandeira: "flags/GER.png" },
  { nome: "Croácia", sigla: "CRO", coeficiente: 1717, bandeira: "flags/CRO.png" },
  { nome: "Colômbia", sigla: "COL", coeficiente: 1693, bandeira: "flags/COL.png" },
  { nome: "Senegal", sigla: "SEN", coeficiente: 1689, bandeira: "flags/SEN.png" },
  { nome: "México", sigla: "MEX", coeficiente: 1681, bandeira: "flags/MEX.png" },
  { nome: "Estados Unidos", sigla: "USA", coeficiente: 1673, bandeira: "flags/USA.png" },
  { nome: "Uruguai", sigla: "URU", coeficiente: 1673, bandeira: "flags/URU.png" },
  { nome: "Japão", sigla: "JPN", coeficiente: 1660, bandeira: "flags/JPN.png" },
  { nome: "Suíça", sigla: "SUI", coeficiente: 1649, bandeira: "flags/SUI.png" },
  { nome: "Irã", sigla: "IRN", coeficiente: 1615, bandeira: "flags/IRN.png" },
  { nome: "Turquia", sigla: "TUR", coeficiente: 1599, bandeira: "flags/TUR.png" },
  { nome: "Equador", sigla: "ECU", coeficiente: 1595, bandeira: "flags/ECU.png" },
  { nome: "Áustria", sigla: "AUT", coeficiente: 1593, bandeira: "flags/AUT.png" },
  { nome: "Coreia do Sul", sigla: "KOR", coeficiente: 1589, bandeira: "flags/KOR.png" },
  { nome: "Austrália", sigla: "AUS", coeficiente: 1581, bandeira: "flags/AUS.png" },
  { nome: "Argélia", sigla: "ALG", coeficiente: 1564, bandeira: "flags/ALG.png" },
  { nome: "Egito", sigla: "EGY", coeficiente: 1563, bandeira: "flags/EGY.png" },
  { nome: "Canadá", sigla: "CAN", coeficiente: 1556, bandeira: "flags/CAN.png" },
  { nome: "Noruega", sigla: "NOR", coeficiente: 1551, bandeira: "flags/NOR.png" },
  { nome: "Panamá", sigla: "PAN", coeficiente: 1541, bandeira: "flags/PAN.png" },
  { nome: "Costa do Marfim", sigla: "CIV", coeficiente: 1533, bandeira: "flags/CIV.png" },
  { nome: "Suécia", sigla: "SWE", coeficiente: 1515, bandeira: "flags/SWE.png" },
  { nome: "Paraguai", sigla: "PAR", coeficiente: 1504, bandeira: "flags/PAR.png" },
  { nome: "Tchéquia", sigla: "CZE", coeficiente: 1501, bandeira: "flags/CZE.png" },
  { nome: "Escócia", sigla: "SCO", coeficiente: 1498, bandeira: "flags/SCO.png" },
  { nome: "Tunísia", sigla: "TUN", coeficiente: 1483, bandeira: "flags/TUN.png" },
  { nome: "RD Congo", sigla: "COD", coeficiente: 1478, bandeira: "flags/COD.png" },
  { nome: "Uzbequistão", sigla: "UZB", coeficiente: 1465, bandeira: "flags/UZB.png" },
  { nome: "Catar", sigla: "QAT", coeficiente: 1455, bandeira: "flags/QAT.png" },
  { nome: "Iraque", sigla: "IRQ", coeficiente: 1447, bandeira: "flags/IRQ.png" },
  { nome: "África do Sul", sigla: "RSA", coeficiente: 1430, bandeira: "flags/RSA.png" },
  { nome: "Arábia Saudita", sigla: "KSA", coeficiente: 1421, bandeira: "flags/KSA.png" },
  { nome: "Jordânia", sigla: "JOR", coeficiente: 1391, bandeira: "flags/JOR.png" },
  { nome: "Bósnia e Herzegovina", sigla: "BIH", coeficiente: 1386, bandeira: "flags/BIH.png" },
  { nome: "Cabo Verde", sigla: "CPV", coeficiente: 1366, bandeira: "flags/CPV.png" },
  { nome: "Gana", sigla: "GHA", coeficiente: 1346, bandeira: "flags/GHA.png" },
  { nome: "Curaçao", sigla: "CUW", coeficiente: 1295, bandeira: "flags/CUW.png" },
  { nome: "Haiti", sigla: "HAI", coeficiente: 1292, bandeira: "flags/HAI.png" },
  { nome: "Nova Zelândia", sigla: "NZL", coeficiente: 1282, bandeira: "flags/NZL.png" }
];
