// lib/flags.js — Codes ISO des 48 équipes → images via flagcdn.com

const CODES = {
  'Afrique du Sud':        'za',
  'Algérie':               'dz',
  'Allemagne':             'de',
  'Angleterre':            'gb-eng',
  'Arabie saoudite':       'sa',
  'Argentine':             'ar',
  'Australie':             'au',
  'Autriche':              'at',
  'Belgique':              'be',
  'Bosnie-et-Herzégovine': 'ba',
  'Brésil':                'br',
  'Canada':                'ca',
  'Cap-Vert':              'cv',
  'Colombie':              'co',
  'Croatie':               'hr',
  'Curaçao':               'cw',
  "Côte d'Ivoire":         'ci',
  'Espagne':               'es',
  'France':                'fr',
  'Ghana':                 'gh',
  'Haïti':                 'ht',
  'Irak':                  'iq',
  'Japon':                 'jp',
  'Jordanie':              'jo',
  'Maroc':                 'ma',
  'Mexique':               'mx',
  'Norvège':               'no',
  'Nouvelle-Zélande':      'nz',
  'Ouzbékistan':           'uz',
  'Panamá':                'pa',
  'Paraguay':              'py',
  'Pays-Bas':              'nl',
  'Portugal':              'pt',
  'Qatar':                 'qa',
  'RD Congo':              'cd',
  'RI Iran':               'ir',
  'République de Corée':   'kr',
  'Suisse':                'ch',
  'Suède':                 'se',
  'Sénégal':               'sn',
  'Tchéquie':              'cz',
  'Tunisie':               'tn',
  'Turquie':               'tr',
  'Uruguay':               'uy',
  'Écosse':                'gb-sct',
  'Égypte':                'eg',
  'Équateur':              'ec',
  'États-Unis':            'us',
}

/**
 * Retourne l'URL du drapeau (20px par défaut), ou null si équipe inconnue
 * Source : https://flagcdn.com — gratuit, pas de clé API
 */
export function getFlagUrl(teamName, width = 20) {
  const code = CODES[teamName]
  if (!code) return null
  return `https://flagcdn.com/w${width}/${code}.png`
}
