#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join('C:', 'Users', 'antol', 'OneDrive', 'Documents', 'MONDIAL');
const DATA = path.join(ROOT, 'data');

// ── GROUPES (équipes dans l'ordre : tête de série, puis 2e-4e) ────────────────
const GROUPS = {
  A: ['USA',         'Ukraine',      'Albania',        'Panama'],
  B: ['Mexico',      'Senegal',      'Ecuador',        'Poland'],
  C: ['Canada',      'Morocco',      'Czech Republic', 'Peru'],
  D: ['Argentina',   'Japan',        'Nigeria',        'Chile'],
  E: ['France',      'Australia',    'Saudi Arabia',   'Paraguay'],
  F: ['Spain',       'South Korea',  'Tunisia',        'Honduras'],
  G: ['England',     'Colombia',     'Cameroon',       'Jamaica'],
  H: ['Portugal',    'Turkey',       'Ivory Coast',    'Costa Rica'],
  I: ['Brazil',      'Denmark',      'Venezuela',      'Serbia'],
  J: ['Germany',     'Romania',      'DR Congo',       'Bolivia'],
  K: ['Belgium',     'Uruguay',      'Iran',           'Slovenia'],
  L: ['Netherlands', 'South Africa', 'Qatar',          'Guatemala'],
};

const STRENGTH = {
  'Argentina': 9.5, 'France': 9.0, 'Brazil': 8.8, 'Germany': 8.5, 'Spain': 8.5,
  'England': 8.0, 'Portugal': 7.8, 'Netherlands': 7.5, 'Belgium': 7.5,
  'Denmark': 7.0, 'Uruguay': 7.0, 'Morocco': 6.8, 'Colombia': 6.5, 'Senegal': 6.5,
  'USA': 6.0, 'Mexico': 5.8, 'Ecuador': 5.5, 'Canada': 5.5, 'Japan': 5.5,
  'South Korea': 5.5, 'Serbia': 5.5, 'Poland': 5.5, 'Turkey': 5.5,
  'Chile': 5.0, 'Peru': 5.0, 'Ivory Coast': 5.2, 'Cameroon': 5.0, 'Tunisia': 5.0,
  'Australia': 5.0, 'Czech Republic': 5.0, 'Venezuela': 4.8, 'Romania': 5.0,
  'Ukraine': 4.5, 'Saudi Arabia': 4.5, 'Nigeria': 4.5, 'Iran': 4.5,
  'Panama': 4.0, 'Albania': 3.8, 'Paraguay': 4.0, 'Bolivia': 3.5, 'Costa Rica': 4.0,
  'Honduras': 3.5, 'Jamaica': 3.5, 'DR Congo': 3.5, 'Slovenia': 4.0,
  'South Africa': 3.8, 'Qatar': 4.0, 'Guatemala': 3.5,
};

// Dates de matchday par groupe (2 matchs simultanés le 3e jour)
const GROUP_SCHEDULE = {
  A: { d1: ['2026-06-12T18:00:00', '2026-06-12T21:00:00'], d2: ['2026-06-17T18:00:00', '2026-06-17T21:00:00'], d3: ['2026-06-22T21:00:00', '2026-06-22T21:00:00'] },
  B: { d1: ['2026-06-13T00:00:00', '2026-06-13T03:00:00'], d2: ['2026-06-18T18:00:00', '2026-06-18T21:00:00'], d3: ['2026-06-23T21:00:00', '2026-06-23T21:00:00'] },
  C: { d1: ['2026-06-13T18:00:00', '2026-06-13T21:00:00'], d2: ['2026-06-19T00:00:00', '2026-06-19T03:00:00'], d3: ['2026-06-24T21:00:00', '2026-06-24T21:00:00'] },
  D: { d1: ['2026-06-14T00:00:00', '2026-06-14T03:00:00'], d2: ['2026-06-19T18:00:00', '2026-06-19T21:00:00'], d3: ['2026-06-24T24:00:00', '2026-06-24T24:00:00'] },
  E: { d1: ['2026-06-14T18:00:00', '2026-06-14T21:00:00'], d2: ['2026-06-20T00:00:00', '2026-06-20T03:00:00'], d3: ['2026-06-25T21:00:00', '2026-06-25T21:00:00'] },
  F: { d1: ['2026-06-15T00:00:00', '2026-06-15T03:00:00'], d2: ['2026-06-20T18:00:00', '2026-06-20T21:00:00'], d3: ['2026-06-25T24:00:00', '2026-06-25T24:00:00'] },
  G: { d1: ['2026-06-15T18:00:00', '2026-06-15T21:00:00'], d2: ['2026-06-21T00:00:00', '2026-06-21T03:00:00'], d3: ['2026-06-26T21:00:00', '2026-06-26T21:00:00'] },
  H: { d1: ['2026-06-16T00:00:00', '2026-06-16T03:00:00'], d2: ['2026-06-21T18:00:00', '2026-06-21T21:00:00'], d3: ['2026-06-26T24:00:00', '2026-06-26T24:00:00'] },
  I: { d1: ['2026-06-16T18:00:00', '2026-06-16T21:00:00'], d2: ['2026-06-22T00:00:00', '2026-06-22T03:00:00'], d3: ['2026-06-27T21:00:00', '2026-06-27T21:00:00'] },
  J: { d1: ['2026-06-17T00:00:00', '2026-06-17T03:00:00'], d2: ['2026-06-22T18:00:00', '2026-06-22T21:00:00'], d3: ['2026-06-27T24:00:00', '2026-06-27T24:00:00'] },
  K: { d1: ['2026-06-11T18:00:00', '2026-06-11T21:00:00'], d2: ['2026-06-16T18:00:00', '2026-06-16T21:00:00'], d3: ['2026-06-21T21:00:00', '2026-06-21T21:00:00'] },
  L: { d1: ['2026-06-12T00:00:00', '2026-06-12T03:00:00'], d2: ['2026-06-17T00:00:00', '2026-06-17T03:00:00'], d3: ['2026-06-22T24:00:00', '2026-06-22T24:00:00'] },
};

// ── RNG déterministe ──────────────────────────────────────────────────────────
let _seed = 7654321;
function rand() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  if (_seed < 0) _seed += 0x100000000;
  return _seed / 0x100000000;
}

function simScore(homeTeam, awayTeam, koMode = false) {
  const h = STRENGTH[homeTeam] || 5;
  const a = STRENGTH[awayTeam] || 5;
  const adv = h - a + (koMode ? 0.1 : 0.35); // légère faveur domicile

  let hwp, dp;
  if (adv > 4.5) { hwp = 0.82; dp = 0.10; }
  else if (adv > 3.5) { hwp = 0.72; dp = 0.14; }
  else if (adv > 2.5) { hwp = 0.62; dp = 0.18; }
  else if (adv > 1.5) { hwp = 0.52; dp = 0.22; }
  else if (adv > 0.5) { hwp = 0.43; dp = 0.26; }
  else if (adv > -0.5) { hwp = 0.34; dp = 0.28; }
  else if (adv > -1.5) { hwp = 0.26; dp = 0.24; }
  else if (adv > -2.5) { hwp = 0.18; dp = 0.20; }
  else { hwp = 0.12; dp = 0.16; }

  // En phase à élimination, pas de nul (ou on choisit un vainqueur si nul)
  if (koMode) {
    dp = 0;
    const total = hwp + (1 - hwp);
    hwp = hwp / total;
  }

  const r = rand();
  const r2 = rand();
  let hg, ag;

  if (r < hwp) {
    // Victoire domicile
    if (r2 < 0.27) { hg = 1; ag = 0; }
    else if (r2 < 0.50) { hg = 2; ag = 0; }
    else if (r2 < 0.70) { hg = 2; ag = 1; }
    else if (r2 < 0.83) { hg = 3; ag = 1; }
    else if (r2 < 0.92) { hg = 3; ag = 0; }
    else { hg = 4; ag = 1; }
  } else if (!koMode && r < hwp + dp) {
    // Nul (groupes seulement)
    if (r2 < 0.38) { hg = 0; ag = 0; }
    else if (r2 < 0.82) { hg = 1; ag = 1; }
    else { hg = 2; ag = 2; }
  } else {
    // Victoire extérieur
    if (r2 < 0.27) { hg = 0; ag = 1; }
    else if (r2 < 0.50) { hg = 0; ag = 2; }
    else if (r2 < 0.70) { hg = 1; ag = 2; }
    else if (r2 < 0.83) { hg = 1; ag = 3; }
    else if (r2 < 0.92) { hg = 0; ag = 3; }
    else { hg = 1; ag = 4; }
  }

  return { domicile: hg, exterieur: ag };
}

// Prono légèrement imparfait selon le niveau du joueur (0=mauvais, 1=moyen, 2=bon, 3=excellent)
function makeProno(real, niveau) {
  const rng = rand();
  const hg = real.domicile;
  const ag = real.exterieur;

  const precisionExact  = [0.06, 0.10, 0.14, 0.18][niveau];
  const precisionBon    = [0.30, 0.42, 0.55, 0.65][niveau];

  if (rng < precisionExact) {
    // Score exact
    return { domicile: hg, exterieur: ag };
  } else if (rng < precisionExact + precisionBon) {
    // Bon résultat (vainqueur correct, score légèrement différent)
    const sign = Math.sign(hg - ag); // -1, 0, 1
    if (sign === 1) { // home win
      const variants = [[1,0],[2,0],[2,1],[3,1],[3,0]];
      return variants[Math.floor(rand() * variants.length)];
    } else if (sign === -1) { // away win
      const variants = [[0,1],[0,2],[1,2],[1,3],[0,3]];
      const v = variants[Math.floor(rand() * variants.length)];
      return { domicile: v[0], exterieur: v[1] };
    } else { // draw
      const variants = [[0,0],[1,1],[2,2]];
      const v = variants[Math.floor(rand() * variants.length)];
      return { domicile: v[0], exterieur: v[1] };
    }
  } else {
    // Mauvais (signe inverse ou nul vs victoire)
    const r3 = rand();
    const allScores = [[0,0],[1,0],[0,1],[1,1],[2,0],[0,2],[2,1],[1,2],[2,2],[3,1],[1,3]];
    const idx = Math.floor(r3 * allScores.length);
    return { domicile: allScores[idx][0], exterieur: allScores[idx][1] };
  }
}

function makePronoObj(real, niveau) {
  const p = makeProno(real, niveau);
  if (Array.isArray(p)) return { domicile: p[0], exterieur: p[1] };
  return p;
}

// ── CALCUL CLASSEMENT DE GROUPE ───────────────────────────────────────────────
function groupStandings(teams, results) {
  const pts = {}, gf = {}, ga = {}, gd = {}, wins = {};
  teams.forEach(t => { pts[t] = 0; gf[t] = 0; ga[t] = 0; gd[t] = 0; wins[t] = 0; });

  for (const { home, away, score } of results) {
    gf[home] += score.domicile; ga[home] += score.exterieur;
    gf[away] += score.exterieur; ga[away] += score.domicile;
    gd[home] = gf[home] - ga[home]; gd[away] = gf[away] - ga[away];
    if (score.domicile > score.exterieur) { pts[home] += 3; wins[home]++; }
    else if (score.domicile < score.exterieur) { pts[away] += 3; wins[away]++; }
    else { pts[home]++; pts[away]++; }
  }

  return [...teams].sort((a, b) =>
    (pts[b] - pts[a]) || (gd[b] - gd[a]) || (gf[b] - gf[a])
  ).map(t => ({ nom: t, pts: pts[t], gf: gf[t], ga: ga[t], gd: gd[t] }));
}

// ════════════════════════════════════════════════════════════════════════════════
// GÉNÉRATION PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════════

const matchs = [];
const resultats = {};
const groupMatchResults = {}; // pour calculer les classements

// ── Phase de groupes ──────────────────────────────────────────────────────────
const groupAdvancement = {}; // {letter: [{nom,rank}, ...]}

for (const [letter, teams] of Object.entries(GROUPS)) {
  const sched = GROUP_SCHEDULE[letter];
  const grpResults = [];

  // 6 matches: d1=[0vs2, 1vs3], d2=[0vs3, 1vs2], d3=[0vs1, 2vs3]
  const matchPairs = [
    [0, 2], [1, 3],
    [0, 3], [1, 2],
    [0, 1], [2, 3],
  ];
  const dayKeys = ['d1', 'd1', 'd2', 'd2', 'd3', 'd3'];
  const daySlot = [0, 1, 0, 1, 0, 1];

  const phaseLabel = `Groupe ${letter}`;

  matchPairs.forEach(([hi, ai], i) => {
    const id = `G${letter}${String(i + 1).padStart(2, '0')}`;
    const home = teams[hi];
    const away = teams[ai];
    const date = sched[dayKeys[i]][daySlot[i]];
    matchs.push({ id, phase: phaseLabel, date, domicile: home, exterieur: away });

    const score = simScore(home, away);
    resultats[id] = score;
    grpResults.push({ home, away, score });
  });

  const standings = groupStandings(teams, grpResults);
  groupAdvancement[letter] = standings;
}

// ── Meilleurs 3es ─────────────────────────────────────────────────────────────
const thirds = Object.entries(groupAdvancement).map(([letter, s]) => ({
  nom: s[2].nom, pts: s[2].pts, gd: s[2].gd, gf: s[2].gf, letter,
}));
thirds.sort((a, b) => (b.pts - a.pts) || (b.gd - a.gd) || (b.gf - a.gf));
const best8thirds = thirds.slice(0, 8).map(t => t.nom);

// Listes des qualifiés
const q = {}; // q[letter] = {first, second, third}
for (const [letter, s] of Object.entries(groupAdvancement)) {
  q[letter] = { first: s[0].nom, second: s[1].nom, third: s[2].nom };
}

// ── Huittièmes de finale (Round of 32) ───────────────────────────────────────
// Pairings FIFA WC 2026 simulés (bracket prédéfini)
const r32Dates = [
  '2026-06-29T21:00:00', '2026-06-30T18:00:00', '2026-06-30T21:00:00',
  '2026-07-01T18:00:00', '2026-07-01T21:00:00', '2026-07-02T18:00:00',
  '2026-07-02T21:00:00', '2026-07-03T18:00:00', '2026-07-03T21:00:00',
  '2026-07-04T18:00:00', '2026-07-04T21:00:00', '2026-07-05T18:00:00',
  '2026-07-05T21:00:00', '2026-07-06T18:00:00', '2026-07-06T21:00:00',
  '2026-07-07T18:00:00',
];

// Bracket R32 : croisements des groupes
const r32Bracket = [
  [q.A.first, q.B.second],   // R32-01
  [q.C.first, q.D.second],   // R32-02
  [q.E.first, q.F.second],   // R32-03
  [q.G.first, q.H.second],   // R32-04
  [q.I.first, q.J.second],   // R32-05
  [q.K.first, q.L.second],   // R32-06
  [q.A.second, q.B.first],   // R32-07
  [q.C.second, q.D.first],   // R32-08
  [q.E.second, q.F.first],   // R32-09
  [q.G.second, q.H.first],   // R32-10
  [q.I.second, q.J.first],   // R32-11
  [q.K.second, q.L.first],   // R32-12
  [best8thirds[0], best8thirds[1]],  // R32-13
  [best8thirds[2], best8thirds[3]],  // R32-14
  [best8thirds[4], best8thirds[5]],  // R32-15
  [best8thirds[6], best8thirds[7]],  // R32-16
];

const r32Winners = [];
r32Bracket.forEach(([home, away], i) => {
  const id = `R32_${String(i + 1).padStart(2, '0')}`;
  const date = r32Dates[i];
  matchs.push({ id, phase: 'Huitièmes de finale', date, domicile: home, exterieur: away });
  const score = simScore(home, away, true);
  resultats[id] = score;
  r32Winners.push(score.domicile >= score.exterieur ? home : away);
  // En KO, si égalité on choisit le favori
  if (score.domicile === score.exterieur) {
    r32Winners[r32Winners.length - 1] = STRENGTH[home] >= STRENGTH[away] ? home : away;
  }
});

// ── Quarts de finale ─────────────────────────────────────────────────────────
const r16Dates = [
  '2026-07-08T21:00:00', '2026-07-09T18:00:00', '2026-07-09T21:00:00',
  '2026-07-10T18:00:00', '2026-07-10T21:00:00', '2026-07-11T18:00:00',
  '2026-07-11T21:00:00', '2026-07-12T18:00:00',
];
const r16Bracket = [
  [r32Winners[0], r32Winners[1]],
  [r32Winners[2], r32Winners[3]],
  [r32Winners[4], r32Winners[5]],
  [r32Winners[6], r32Winners[7]],
  [r32Winners[8], r32Winners[9]],
  [r32Winners[10], r32Winners[11]],
  [r32Winners[12], r32Winners[13]],
  [r32Winners[14], r32Winners[15]],
];
const r16Winners = [];
r16Bracket.forEach(([home, away], i) => {
  const id = `R16_${String(i + 1).padStart(2, '0')}`;
  matchs.push({ id, phase: 'Quarts de finale', date: r16Dates[i], domicile: home, exterieur: away });
  const score = simScore(home, away, true);
  resultats[id] = score;
  let winner = score.domicile > score.exterieur ? home : away;
  if (score.domicile === score.exterieur) winner = STRENGTH[home] >= STRENGTH[away] ? home : away;
  r16Winners.push(winner);
});

// ── Demi-finales ─────────────────────────────────────────────────────────────
const sfDates = ['2026-07-14T21:00:00', '2026-07-15T21:00:00', '2026-07-16T21:00:00', '2026-07-17T21:00:00'];
const qfBracket = [
  [r16Winners[0], r16Winners[1]],
  [r16Winners[2], r16Winners[3]],
  [r16Winners[4], r16Winners[5]],
  [r16Winners[6], r16Winners[7]],
];
const qfWinners = []; const qfLosers = [];
qfBracket.forEach(([home, away], i) => {
  const id = `QF_${String(i + 1).padStart(2, '0')}`;
  matchs.push({ id, phase: 'Demi-finales', date: sfDates[i], domicile: home, exterieur: away });
  const score = simScore(home, away, true);
  resultats[id] = score;
  let winner = score.domicile > score.exterieur ? home : away;
  let loser  = score.domicile > score.exterieur ? away : home;
  if (score.domicile === score.exterieur) {
    winner = STRENGTH[home] >= STRENGTH[away] ? home : away;
    loser  = STRENGTH[home] >= STRENGTH[away] ? away : home;
  }
  qfWinners.push(winner); qfLosers.push(loser);
});

// ── Finales ───────────────────────────────────────────────────────────────────
const sfFinalDates = ['2026-07-18T21:00:00', '2026-07-18T21:00:00'];
const sfBracket = [
  [qfWinners[0], qfWinners[1]],
  [qfWinners[2], qfWinners[3]],
];
const sfWinners = []; const sfLosers = [];
sfBracket.forEach(([home, away], i) => {
  const id = `SF_${String(i + 1).padStart(2, '0')}`;
  matchs.push({ id, phase: 'Demi-finales', date: ['2026-07-14T21:00:00', '2026-07-15T21:00:00'][i], domicile: home, exterieur: away });
  const score = simScore(home, away, true);
  resultats[id] = score;
  let winner = score.domicile > score.exterieur ? home : away;
  let loser  = score.domicile > score.exterieur ? away : home;
  if (score.domicile === score.exterieur) {
    winner = STRENGTH[home] >= STRENGTH[away] ? home : away;
    loser  = STRENGTH[home] >= STRENGTH[away] ? away : home;
  }
  sfWinners.push(winner); sfLosers.push(loser);
});

// Petite finale
{
  const id = 'TPL';
  matchs.push({ id, phase: 'Troisième place', date: '2026-07-18T21:00:00', domicile: sfLosers[0], exterieur: sfLosers[1] });
  resultats[id] = simScore(sfLosers[0], sfLosers[1], true);
}

// Finale
{
  const id = 'FIN';
  matchs.push({ id, phase: 'Finale', date: '2026-07-19T21:00:00', domicile: sfWinners[0], exterieur: sfWinners[1] });
  const score = simScore(sfWinners[0], sfWinners[1], true);
  // On force un résultat non nul
  let s = score;
  if (s.domicile === s.exterieur) s = { domicile: s.domicile + 1, exterieur: s.exterieur };
  resultats[id] = s;
}

// ── JOUEURS : pronos ──────────────────────────────────────────────────────────
const JOUEURS = [
  { nom: 'Antoine', niveau: 2 },
  { nom: 'Thomas',  niveau: 1 },
  { nom: 'Lucas',   niveau: 1 },
  { nom: 'Maxime',  niveau: 2 },
  { nom: 'Julien',  niveau: 1 },
  { nom: 'Romain',  niveau: 3 },
  { nom: 'Kevin',   niveau: 1 },
  { nom: 'Pierre',  niveau: 0 },
];

JOUEURS.forEach(({ nom, niveau }) => {
  const pronos = {};
  matchs.forEach(m => {
    const real = resultats[m.id];
    if (real) pronos[m.id] = makePronoObj(real, niveau);
  });
  const filePath = path.join(DATA, 'joueurs', `${nom.toLowerCase()}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ nom, pronos }, null, 2), 'utf-8');
});

// ── ÉCRITURE DES FICHIERS ─────────────────────────────────────────────────────
fs.writeFileSync(path.join(DATA, 'matchs.json'), JSON.stringify(matchs, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA, 'resultats.json'), JSON.stringify(resultats, null, 2), 'utf-8');

console.log(`✅ ${matchs.length} matchs générés`);
console.log(`✅ ${Object.keys(resultats).length} résultats simulés`);
console.log(`✅ ${JOUEURS.length} joueurs mis à jour`);
console.log('\n📊 Groupes :');
for (const [letter, s] of Object.entries(groupAdvancement)) {
  console.log(`  Groupe ${letter}: 1er=${s[0].nom}(${s[0].pts}pts), 2e=${s[1].nom}(${s[1].pts}pts), 3e=${s[2].nom}(${s[2].pts}pts), 4e=${s[3].nom}(${s[3].pts}pts)`);
}
console.log('\n🏆 Chemin vers la finale :');
console.log('  R32 winners:', r32Winners.join(', '));
console.log('  R16 winners:', r16Winners.join(', '));
console.log('  QF winners:', qfWinners.join(', '));
console.log('  SF winners:', sfWinners.join(', '));
console.log(`  Finale: ${sfWinners[0]} vs ${sfWinners[1]}`);
console.log(`  Champion: ${resultats['FIN'].domicile > resultats['FIN'].exterieur ? sfWinners[0] : sfWinners[1]}`);
