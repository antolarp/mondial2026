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
// Normaliser toutes les clés en NFC pour garantir la correspondance
const CODES_NFC = Object.fromEntries(Object.entries(CODES).map(([k, v]) => [k.normalize('NFC'), v]))

export const TOUTES_EQUIPES = Object.keys(CODES).sort((a, b) => a.localeCompare(b, 'fr'))

export function getFlagUrl(teamName, width = 20) {
  if (!teamName) return null
  const code = CODES_NFC[teamName.trim().normalize('NFC')]
  if (!code) return null
  return `https://flagcdn.com/w${width}/${code}.png`
}
