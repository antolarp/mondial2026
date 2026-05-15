// lib/flags.js — Drapeaux emoji pour les 48 équipes de la Coupe du Monde 2026

const FLAGS = {
  'Afrique du Sud':       '🇿🇦',
  'Algérie':              '🇩🇿',
  'Allemagne':            '🇩🇪',
  'Angleterre':           '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Arabie saoudite':      '🇸🇦',
  'Argentine':            '🇦🇷',
  'Australie':            '🇦🇺',
  'Autriche':             '🇦🇹',
  'Belgique':             '🇧🇪',
  'Bosnie-et-Herzégovine':'🇧🇦',
  'Brésil':               '🇧🇷',
  'Canada':               '🇨🇦',
  'Cap-Vert':             '🇨🇻',
  'Colombie':             '🇨🇴',
  'Croatie':              '🇭🇷',
  'Curaçao':              '🇨🇼',
  "Côte d'Ivoire":        '🇨🇮',
  'Espagne':              '🇪🇸',
  'France':               '🇫🇷',
  'Ghana':                '🇬🇭',
  'Haïti':                '🇭🇹',
  'Irak':                 '🇮🇶',
  'Japon':                '🇯🇵',
  'Jordanie':             '🇯🇴',
  'Maroc':                '🇲🇦',
  'Mexique':              '🇲🇽',
  'Norvège':              '🇳🇴',
  'Nouvelle-Zélande':     '🇳🇿',
  'Ouzbékistan':          '🇺🇿',
  'Panamá':               '🇵🇦',
  'Paraguay':             '🇵🇾',
  'Pays-Bas':             '🇳🇱',
  'Portugal':             '🇵🇹',
  'Qatar':                '🇶🇦',
  'RD Congo':             '🇨🇩',
  'RI Iran':              '🇮🇷',
  'République de Corée':  '🇰🇷',
  'Suisse':               '🇨🇭',
  'Suède':                '🇸🇪',
  'Sénégal':              '🇸🇳',
  'Tchéquie':             '🇨🇿',
  'Tunisie':              '🇹🇳',
  'Turquie':              '🇹🇷',
  'Uruguay':              '🇺🇾',
  'Écosse':               '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Égypte':               '🇪🇬',
  'Équateur':             '🇪🇨',
  'États-Unis':           '🇺🇸',
}

/**
 * Retourne le drapeau emoji d'une équipe, ou '' si inconnu (ex : "1er Groupe A")
 */
export function getFlag(teamName) {
  return FLAGS[teamName] ?? ''
}
