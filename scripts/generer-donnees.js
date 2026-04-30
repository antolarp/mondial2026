#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join('C:', 'Users', 'antol', 'OneDrive', 'Documents', 'MONDIAL');
const DATA = path.join(ROOT, 'data');

// ── FORCES DES ÉQUIPES (1-10) ─────────────────────────────────────────────────
const STRENGTH = {
  'Argentine': 9.5, 'France': 9.0, 'Brésil': 8.8, 'Allemagne': 8.5, 'Espagne': 8.5,
  'Angleterre': 8.0, 'Portugal': 7.8, 'Pays-Bas': 7.5, 'Belgique': 7.5,
  'Uruguay': 7.0, 'Maroc': 6.8, 'Colombie': 6.5, 'Sénégal': 6.5, 'Suisse': 6.5,
  'Norvège': 6.0, 'États-Unis': 6.0, 'Mexique': 5.5, 'Équateur': 5.5,
  'Canada': 5.5, 'Japon': 5.5, 'République de Corée': 5.5, 'Écosse': 5.5,
  'Turquie': 5.5, 'Croatie': 5.5, 'Autriche': 5.5, 'Suède': 5.5,
  'Côte d\'Ivoire': 5.2, 'Australie': 5.0, 'Tchéquie': 5.0, 'Tunisie': 5.0,
  'Ghana': 4.5, 'Égypte': 4.5, 'Arabie saoudite': 4.5, 'Algérie': 4.5,
  'RI Iran': 4.5, 'Bosnie-et-Herzégovine': 4.5, 'Ouzbékistan': 4.0,
  'Mexique': 5.5, 'Panamá': 4.0, 'Paraguay': 4.0, 'Qatar': 4.0,
  'Afrique du Sud': 3.8, 'Irak': 3.8, 'Cap-Vert': 3.5, 'RD Congo': 3.5,
  'Nouvelle-Zélande': 3.5, 'Jordanie': 3.5, 'Curaçao': 3.0, 'Haïti': 3.0,
};

// ── RNG DÉTERMINISTE ──────────────────────────────────────────────────────────
let _seed = 7654321;
function rand() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  if (_seed < 0) _seed += 0x100000000;
  return _seed / 0x100000000;
}

function simScore(home, away, koMode = false) {
  const h = STRENGTH[home] || 5;
  const a = STRENGTH[away] || 5;
  const adv = h - a + (koMode ? 0.1 : 0.35);
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
  if (koMode) { dp = 0; }
  const r = rand(); const r2 = rand();
  let hg, ag;
  if (r < hwp) {
    if (r2 < 0.27) { hg=1; ag=0; } else if (r2 < 0.50) { hg=2; ag=0; }
    else if (r2 < 0.70) { hg=2; ag=1; } else if (r2 < 0.83) { hg=3; ag=1; }
    else if (r2 < 0.92) { hg=3; ag=0; } else { hg=4; ag=1; }
  } else if (!koMode && r < hwp + dp) {
    if (r2 < 0.38) { hg=0; ag=0; } else if (r2 < 0.82) { hg=1; ag=1; } else { hg=2; ag=2; }
  } else {
    if (r2 < 0.27) { hg=0; ag=1; } else if (r2 < 0.50) { hg=0; ag=2; }
    else if (r2 < 0.70) { hg=1; ag=2; } else if (r2 < 0.83) { hg=1; ag=3; }
    else if (r2 < 0.92) { hg=0; ag=3; } else { hg=1; ag=4; }
  }
  return { domicile: hg, exterieur: ag };
}

function winner(home, away, score) {
  if (score.domicile > score.exterieur) return home;
  if (score.domicile < score.exterieur) return away;
  return STRENGTH[home] >= STRENGTH[away] ? home : away; // favoris en cas d'égalité KO
}

function makeProno(real, niveau) {
  const rng = rand();
  const pExact = [0.06, 0.10, 0.14, 0.18][niveau];
  const pBon   = [0.30, 0.42, 0.55, 0.65][niveau];
  if (rng < pExact) return { domicile: real.domicile, exterieur: real.exterieur };
  if (rng < pExact + pBon) {
    const sign = Math.sign(real.domicile - real.exterieur);
    const r2 = rand();
    if (sign > 0) { const v=[[1,0],[2,0],[2,1],[3,1],[3,0]]; const x=v[Math.floor(r2*v.length)]; return {domicile:x[0],exterieur:x[1]}; }
    if (sign < 0) { const v=[[0,1],[0,2],[1,2],[1,3],[0,3]]; const x=v[Math.floor(r2*v.length)]; return {domicile:x[0],exterieur:x[1]}; }
    const v=[[0,0],[1,1],[2,2]]; const x=v[Math.floor(r2*v.length)]; return {domicile:x[0],exterieur:x[1]};
  }
  const scores=[[0,0],[1,0],[0,1],[1,1],[2,0],[0,2],[2,1],[1,2],[2,2],[3,1],[1,3]];
  const x=scores[Math.floor(rand()*scores.length)]; return {domicile:x[0],exterieur:x[1]};
}

function groupStandings(groupMatches, resultats) {
  const teams = [...new Set(groupMatches.flatMap(m => [m.domicile, m.exterieur]))];
  const pts={}, gf={}, ga={}, gd={};
  teams.forEach(t => { pts[t]=0; gf[t]=0; ga[t]=0; gd[t]=0; });
  for (const m of groupMatches) {
    const s = resultats[m.id]; if (!s) continue;
    gf[m.domicile]+=s.domicile; ga[m.domicile]+=s.exterieur;
    gf[m.exterieur]+=s.exterieur; ga[m.exterieur]+=s.domicile;
    if (s.domicile > s.exterieur) pts[m.domicile]+=3;
    else if (s.domicile < s.exterieur) pts[m.exterieur]+=3;
    else { pts[m.domicile]++; pts[m.exterieur]++; }
  }
  teams.forEach(t => gd[t] = gf[t]-ga[t]);
  return [...teams].sort((a,b)=>(pts[b]-pts[a])||(gd[b]-gd[a])||(gf[b]-gf[a]))
    .map(t=>({nom:t, pts:pts[t], gf:gf[t], ga:ga[t], gd:gd[t]}));
}

// ════════════════════════════════════════════════════════════════════════════
// MATCHS RÉELS — PHASE DE GROUPES (72 matchs)
// ════════════════════════════════════════════════════════════════════════════
const matchs = [
  // ── JOURNÉE 1 ─────────────────────────────────────────────────────────────
  {id:'M01', phase:'Groupe A', date:'2026-06-11T15:00:00', domicile:'Mexique',              exterieur:'Afrique du Sud'},
  {id:'M02', phase:'Groupe A', date:'2026-06-11T22:00:00', domicile:'République de Corée',  exterieur:'Tchéquie'},
  {id:'M03', phase:'Groupe B', date:'2026-06-12T15:00:00', domicile:'Canada',               exterieur:'Bosnie-et-Herzégovine'},
  {id:'M04', phase:'Groupe D', date:'2026-06-12T21:00:00', domicile:'États-Unis',           exterieur:'Paraguay'},
  {id:'M05', phase:'Groupe B', date:'2026-06-13T15:00:00', domicile:'Qatar',                exterieur:'Suisse'},
  {id:'M06', phase:'Groupe C', date:'2026-06-13T18:00:00', domicile:'Brésil',               exterieur:'Maroc'},
  {id:'M07', phase:'Groupe C', date:'2026-06-13T21:00:00', domicile:'Haïti',                exterieur:'Écosse'},
  {id:'M08', phase:'Groupe D', date:'2026-06-14T00:00:00', domicile:'Australie',            exterieur:'Turquie'},
  {id:'M09', phase:'Groupe E', date:'2026-06-14T13:00:00', domicile:'Allemagne',            exterieur:'Curaçao'},
  {id:'M10', phase:'Groupe F', date:'2026-06-14T16:00:00', domicile:'Pays-Bas',             exterieur:'Japon'},
  {id:'M11', phase:'Groupe E', date:'2026-06-14T19:00:00', domicile:"Côte d'Ivoire",        exterieur:'Équateur'},
  {id:'M12', phase:'Groupe F', date:'2026-06-14T22:00:00', domicile:'Suède',                exterieur:'Tunisie'},
  {id:'M13', phase:'Groupe H', date:'2026-06-15T12:00:00', domicile:'Espagne',              exterieur:'Cap-Vert'},
  {id:'M14', phase:'Groupe G', date:'2026-06-15T15:00:00', domicile:'Belgique',             exterieur:'Égypte'},
  {id:'M15', phase:'Groupe H', date:'2026-06-15T18:00:00', domicile:'Arabie saoudite',      exterieur:'Uruguay'},
  {id:'M16', phase:'Groupe G', date:'2026-06-15T21:00:00', domicile:'RI Iran',              exterieur:'Nouvelle-Zélande'},
  {id:'M17', phase:'Groupe I', date:'2026-06-16T15:00:00', domicile:'France',               exterieur:'Sénégal'},
  {id:'M18', phase:'Groupe I', date:'2026-06-16T18:00:00', domicile:'Irak',                 exterieur:'Norvège'},
  {id:'M19', phase:'Groupe J', date:'2026-06-16T21:00:00', domicile:'Argentine',            exterieur:'Algérie'},
  {id:'M20', phase:'Groupe J', date:'2026-06-17T00:00:00', domicile:'Autriche',             exterieur:'Jordanie'},
  {id:'M21', phase:'Groupe K', date:'2026-06-17T13:00:00', domicile:'Portugal',             exterieur:'RD Congo'},
  {id:'M22', phase:'Groupe L', date:'2026-06-17T16:00:00', domicile:'Angleterre',           exterieur:'Croatie'},
  {id:'M23', phase:'Groupe L', date:'2026-06-17T19:00:00', domicile:'Ghana',                exterieur:'Panamá'},
  {id:'M24', phase:'Groupe K', date:'2026-06-17T22:00:00', domicile:'Ouzbékistan',          exterieur:'Colombie'},

  // ── JOURNÉE 2 ─────────────────────────────────────────────────────────────
  {id:'M25', phase:'Groupe A', date:'2026-06-18T12:00:00', domicile:'Tchéquie',             exterieur:'Afrique du Sud'},
  {id:'M26', phase:'Groupe B', date:'2026-06-18T15:00:00', domicile:'Suisse',               exterieur:'Bosnie-et-Herzégovine'},
  {id:'M27', phase:'Groupe B', date:'2026-06-18T18:00:00', domicile:'Canada',               exterieur:'Qatar'},
  {id:'M28', phase:'Groupe A', date:'2026-06-18T21:00:00', domicile:'Mexique',              exterieur:'République de Corée'},
  {id:'M29', phase:'Groupe D', date:'2026-06-19T15:00:00', domicile:'États-Unis',           exterieur:'Australie'},
  {id:'M30', phase:'Groupe C', date:'2026-06-19T18:00:00', domicile:'Écosse',               exterieur:'Maroc'},
  {id:'M31', phase:'Groupe C', date:'2026-06-19T20:30:00', domicile:'Brésil',               exterieur:'Haïti'},
  {id:'M32', phase:'Groupe D', date:'2026-06-19T23:00:00', domicile:'Turquie',              exterieur:'Paraguay'},
  {id:'M33', phase:'Groupe F', date:'2026-06-20T13:00:00', domicile:'Pays-Bas',             exterieur:'Suède'},
  {id:'M34', phase:'Groupe E', date:'2026-06-20T16:00:00', domicile:'Allemagne',            exterieur:"Côte d'Ivoire"},
  {id:'M35', phase:'Groupe E', date:'2026-06-20T20:00:00', domicile:'Équateur',             exterieur:'Curaçao'},
  {id:'M36', phase:'Groupe F', date:'2026-06-21T00:00:00', domicile:'Tunisie',              exterieur:'Japon'},
  {id:'M37', phase:'Groupe H', date:'2026-06-21T12:00:00', domicile:'Espagne',              exterieur:'Arabie saoudite'},
  {id:'M38', phase:'Groupe G', date:'2026-06-21T15:00:00', domicile:'Belgique',             exterieur:'RI Iran'},
  {id:'M39', phase:'Groupe H', date:'2026-06-21T18:00:00', domicile:'Uruguay',              exterieur:'Cap-Vert'},
  {id:'M40', phase:'Groupe G', date:'2026-06-21T21:00:00', domicile:'Nouvelle-Zélande',     exterieur:'Égypte'},
  {id:'M41', phase:'Groupe J', date:'2026-06-22T13:00:00', domicile:'Argentine',            exterieur:'Autriche'},
  {id:'M42', phase:'Groupe I', date:'2026-06-22T17:00:00', domicile:'France',               exterieur:'Irak'},
  {id:'M43', phase:'Groupe I', date:'2026-06-22T20:00:00', domicile:'Norvège',              exterieur:'Sénégal'},
  {id:'M44', phase:'Groupe J', date:'2026-06-22T23:00:00', domicile:'Jordanie',             exterieur:'Algérie'},
  {id:'M45', phase:'Groupe K', date:'2026-06-23T13:00:00', domicile:'Portugal',             exterieur:'Ouzbékistan'},
  {id:'M46', phase:'Groupe L', date:'2026-06-23T16:00:00', domicile:'Angleterre',           exterieur:'Ghana'},
  {id:'M47', phase:'Groupe L', date:'2026-06-23T19:00:00', domicile:'Panamá',               exterieur:'Croatie'},
  {id:'M48', phase:'Groupe K', date:'2026-06-23T22:00:00', domicile:'Colombie',             exterieur:'RD Congo'},

  // ── JOURNÉE 3 (matchs simultanés par groupe) ─────────────────────────────
  {id:'M49', phase:'Groupe B', date:'2026-06-24T15:00:00', domicile:'Suisse',               exterieur:'Canada'},
  {id:'M50', phase:'Groupe B', date:'2026-06-24T15:00:00', domicile:'Bosnie-et-Herzégovine',exterieur:'Qatar'},
  {id:'M51', phase:'Groupe C', date:'2026-06-24T18:00:00', domicile:'Écosse',               exterieur:'Brésil'},
  {id:'M52', phase:'Groupe C', date:'2026-06-24T18:00:00', domicile:'Maroc',                exterieur:'Haïti'},
  {id:'M53', phase:'Groupe A', date:'2026-06-24T21:00:00', domicile:'Tchéquie',             exterieur:'Mexique'},
  {id:'M54', phase:'Groupe A', date:'2026-06-24T21:00:00', domicile:'Afrique du Sud',       exterieur:'République de Corée'},
  {id:'M55', phase:'Groupe E', date:'2026-06-25T16:00:00', domicile:'Équateur',             exterieur:'Allemagne'},
  {id:'M56', phase:'Groupe E', date:'2026-06-25T16:00:00', domicile:'Curaçao',              exterieur:"Côte d'Ivoire"},
  {id:'M57', phase:'Groupe F', date:'2026-06-25T19:00:00', domicile:'Tunisie',              exterieur:'Pays-Bas'},
  {id:'M58', phase:'Groupe F', date:'2026-06-25T19:00:00', domicile:'Japon',                exterieur:'Suède'},
  {id:'M59', phase:'Groupe D', date:'2026-06-25T22:00:00', domicile:'Turquie',              exterieur:'États-Unis'},
  {id:'M60', phase:'Groupe D', date:'2026-06-25T22:00:00', domicile:'Paraguay',             exterieur:'Australie'},
  {id:'M61', phase:'Groupe I', date:'2026-06-26T15:00:00', domicile:'Norvège',              exterieur:'France'},
  {id:'M62', phase:'Groupe I', date:'2026-06-26T15:00:00', domicile:'Sénégal',              exterieur:'Irak'},
  {id:'M63', phase:'Groupe H', date:'2026-06-26T20:00:00', domicile:'Uruguay',              exterieur:'Espagne'},
  {id:'M64', phase:'Groupe H', date:'2026-06-26T20:00:00', domicile:'Cap-Vert',             exterieur:'Arabie saoudite'},
  {id:'M65', phase:'Groupe G', date:'2026-06-26T23:00:00', domicile:'Nouvelle-Zélande',     exterieur:'Belgique'},
  {id:'M66', phase:'Groupe G', date:'2026-06-26T23:00:00', domicile:'Égypte',               exterieur:'RI Iran'},
  {id:'M67', phase:'Groupe L', date:'2026-06-27T17:00:00', domicile:'Panamá',               exterieur:'Angleterre'},
  {id:'M68', phase:'Groupe L', date:'2026-06-27T17:00:00', domicile:'Croatie',              exterieur:'Ghana'},
  {id:'M69', phase:'Groupe K', date:'2026-06-27T19:30:00', domicile:'Colombie',             exterieur:'Portugal'},
  {id:'M70', phase:'Groupe K', date:'2026-06-27T19:30:00', domicile:'RD Congo',             exterieur:'Ouzbékistan'},
  {id:'M71', phase:'Groupe J', date:'2026-06-27T22:00:00', domicile:'Jordanie',             exterieur:'Argentine'},
  {id:'M72', phase:'Groupe J', date:'2026-06-27T22:00:00', domicile:'Algérie',              exterieur:'Autriche'},
];

// ── SIMULATION GROUPES ────────────────────────────────────────────────────────
const resultats = {};
matchs.forEach(m => { resultats[m.id] = simScore(m.domicile, m.exterieur); });

// Classements par groupe
const groupLetters = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const standings = {};
for (const gl of groupLetters) {
  const gm = matchs.filter(m => m.phase === `Groupe ${gl}`);
  standings[gl] = groupStandings(gm, resultats);
}

// Meilleurs 3es (8 sur 12 se qualifient)
const allThirds = groupLetters.map(gl => ({
  team: standings[gl][2].nom,
  pts: standings[gl][2].pts,
  gd: standings[gl][2].gd,
  gf: standings[gl][2].gf,
  group: gl,
})).sort((a,b) => (b.pts-a.pts)||(b.gd-a.gd)||(b.gf-a.gf));
const best8 = allThirds.slice(0,8).map(t => t.team);

const Q = {}; // Q[X].first / .second / .third
for (const gl of groupLetters) {
  Q[gl] = { first: standings[gl][0].nom, second: standings[gl][1].nom, third: standings[gl][2].nom };
}

// ════════════════════════════════════════════════════════════════════════════
// PHASES ÉLIMINATOIRES
// ════════════════════════════════════════════════════════════════════════════

// ── Seizièmes de finale (R32) : 16 matchs, M73–M88 ───────────────────────────
// Bracket officiel FIFA WC 2026
// M88 = 2e Groupe D vs 2e Groupe G (correction doublon M83 dans le calendrier officiel)
const r32Def = [
  {id:'M73', date:'2026-06-28T15:00:00', home: Q.A.second,  away: Q.B.second},
  {id:'M74', date:'2026-06-29T16:30:00', home: Q.E.first,   away: best8[0]},
  {id:'M75', date:'2026-06-29T21:00:00', home: Q.F.first,   away: Q.C.second},
  {id:'M76', date:'2026-06-29T13:00:00', home: Q.C.first,   away: Q.F.second},
  {id:'M77', date:'2026-06-30T17:00:00', home: Q.I.first,   away: best8[1]},
  {id:'M78', date:'2026-06-30T13:00:00', home: Q.E.second,  away: Q.I.second},
  {id:'M79', date:'2026-06-30T21:00:00', home: Q.A.first,   away: best8[2]},
  {id:'M80', date:'2026-07-01T12:00:00', home: Q.L.first,   away: best8[3]},
  {id:'M81', date:'2026-07-01T20:00:00', home: Q.D.first,   away: best8[4]},
  {id:'M82', date:'2026-07-01T16:00:00', home: Q.G.first,   away: best8[5]},
  {id:'M83', date:'2026-07-02T19:00:00', home: Q.K.second,  away: Q.L.second},
  {id:'M84', date:'2026-07-02T15:00:00', home: Q.H.first,   away: Q.J.second},
  {id:'M85', date:'2026-07-02T23:00:00', home: Q.B.first,   away: best8[6]},
  {id:'M86', date:'2026-07-03T18:00:00', home: Q.J.first,   away: Q.H.second},
  {id:'M87', date:'2026-07-03T21:30:00', home: Q.K.first,   away: best8[7]},
  {id:'M88', date:'2026-07-03T14:00:00', home: Q.D.second,  away: Q.G.second},
];

const r32Winners = [];
r32Def.forEach(({id, date, home, away}) => {
  matchs.push({id, phase:'Seizièmes de finale', date, domicile:home, exterieur:away});
  const s = simScore(home, away, true);
  resultats[id] = s;
  r32Winners.push(winner(home, away, s));
});

// ── Huitièmes de finale (R16) : 8 matchs, M89–M96 ────────────────────────────
const r16Def = [
  {id:'M89', date:'2026-07-04T17:00:00', home: r32Winners[1],  away: r32Winners[3]},  // V74 vs V77
  {id:'M90', date:'2026-07-04T13:00:00', home: r32Winners[0],  away: r32Winners[2]},  // V73 vs V75
  {id:'M91', date:'2026-07-05T16:00:00', home: r32Winners[5],  away: r32Winners[4]},  // V76 vs V78
  {id:'M92', date:'2026-07-05T20:00:00', home: r32Winners[6],  away: r32Winners[7]},  // V79 vs V80
  {id:'M93', date:'2026-07-06T15:00:00', home: r32Winners[10], away: r32Winners[11]}, // V83 vs V84
  {id:'M94', date:'2026-07-06T20:00:00', home: r32Winners[8],  away: r32Winners[9]},  // V81 vs V82
  {id:'M95', date:'2026-07-07T12:00:00', home: r32Winners[13], away: r32Winners[15]}, // V86 vs V88
  {id:'M96', date:'2026-07-07T16:00:00', home: r32Winners[12], away: r32Winners[14]}, // V85 vs V87
];
const r16Winners = [];
r16Def.forEach(({id, date, home, away}) => {
  matchs.push({id, phase:'Huitièmes de finale', date, domicile:home, exterieur:away});
  const s = simScore(home, away, true);
  resultats[id] = s;
  r16Winners.push(winner(home, away, s));
});

// ── Quarts de finale : 4 matchs, M97–M100 ────────────────────────────────────
const qfDef = [
  {id:'M97',  date:'2026-07-09T16:00:00', home: r16Winners[0], away: r16Winners[1]},  // V89 vs V90
  {id:'M98',  date:'2026-07-10T15:00:00', home: r16Winners[4], away: r16Winners[5]},  // V93 vs V94
  {id:'M99',  date:'2026-07-11T17:00:00', home: r16Winners[2], away: r16Winners[3]},  // V91 vs V92
  {id:'M100', date:'2026-07-11T21:00:00', home: r16Winners[6], away: r16Winners[7]},  // V95 vs V96
];
const qfWinners = []; const qfLosers = [];
qfDef.forEach(({id, date, home, away}) => {
  matchs.push({id, phase:'Quarts de finale', date, domicile:home, exterieur:away});
  const s = simScore(home, away, true);
  resultats[id] = s;
  const w = winner(home, away, s);
  qfWinners.push(w);
  qfLosers.push(w === home ? away : home);
});

// ── Demi-finales : 2 matchs, M101–M102 ───────────────────────────────────────
const sfDef = [
  {id:'M101', date:'2026-07-14T15:00:00', home: qfWinners[0], away: qfWinners[1]}, // V97 vs V98
  {id:'M102', date:'2026-07-15T15:00:00', home: qfWinners[2], away: qfWinners[3]}, // V99 vs V100
];
const sfWinners = []; const sfLosers = [];
sfDef.forEach(({id, date, home, away}) => {
  matchs.push({id, phase:'Demi-finales', date, domicile:home, exterieur:away});
  const s = simScore(home, away, true);
  resultats[id] = s;
  const w = winner(home, away, s);
  sfWinners.push(w);
  sfLosers.push(w === home ? away : home);
});

// ── Finale pour le bronze ─────────────────────────────────────────────────────
{
  const id='M103', date='2026-07-18T17:00:00';
  matchs.push({id, phase:'Troisième place', date, domicile:sfLosers[0], exterieur:sfLosers[1]});
  resultats[id] = simScore(sfLosers[0], sfLosers[1], true);
}

// ── Finale ────────────────────────────────────────────────────────────────────
{
  const id='M104', date='2026-07-19T15:00:00';
  matchs.push({id, phase:'Finale', date, domicile:sfWinners[0], exterieur:sfWinners[1]});
  let s = simScore(sfWinners[0], sfWinners[1], true);
  if (s.domicile === s.exterieur) s.domicile++; // on veut un vainqueur en finale
  resultats[id] = s;
}

// ── JOUEURS : génération des pronos ──────────────────────────────────────────
const JOUEURS = [
  {nom:'Antoine', niveau:2},
  {nom:'Thomas',  niveau:1},
  {nom:'Lucas',   niveau:1},
  {nom:'Maxime',  niveau:2},
  {nom:'Julien',  niveau:1},
  {nom:'Romain',  niveau:3},
  {nom:'Kevin',   niveau:1},
  {nom:'Pierre',  niveau:0},
];

JOUEURS.forEach(({nom, niveau}) => {
  const pronos = {};
  matchs.forEach(m => {
    const real = resultats[m.id];
    if (real) pronos[m.id] = makeProno(real, niveau);
  });
  fs.writeFileSync(
    path.join(DATA, 'joueurs', `${nom.toLowerCase()}.json`),
    JSON.stringify({nom, pronos}, null, 2), 'utf-8'
  );
});

// ── ÉCRITURE FICHIERS ─────────────────────────────────────────────────────────
fs.writeFileSync(path.join(DATA, 'matchs.json'),    JSON.stringify(matchs, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA, 'resultats.json'), JSON.stringify(resultats, null, 2), 'utf-8');

console.log(`✅ ${matchs.length} matchs (${matchs.filter(m=>m.phase.startsWith('Groupe')).length} groupes + ${matchs.filter(m=>!m.phase.startsWith('Groupe')).length} KO)`);
console.log(`✅ ${Object.keys(resultats).length} résultats simulés`);
console.log(`✅ ${JOUEURS.length} joueurs mis à jour\n`);
console.log('📊 Classements groupes :');
for (const gl of groupLetters) {
  const s = standings[gl];
  console.log(`  Groupe ${gl}: ${s.map((t,i)=>`${i+1}.${t.nom}(${t.pts}pts)`).join(' | ')}`);
}
console.log(`\n🏆 Finale : ${matchs[103].domicile} vs ${matchs[103].exterieur}`);
const fin = resultats['M104'];
console.log(`   Champion : ${fin.domicile > fin.exterieur ? matchs[103].domicile : matchs[103].exterieur} (${fin.domicile}-${fin.exterieur})`);
