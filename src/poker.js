const RANKS = '23456789TJQKA'
const SUITS = ['s', 'h', 'd', 'c']

export function parseCard(value) {
  const cleaned = value.toUpperCase().trim().replace(/♠/g, 'S').replace(/♥/g, 'H').replace(/♦/g, 'D').replace(/♣/g, 'C')
  if (cleaned.length !== 2) return null
  const rank = cleaned[0] === '10' ? 'T' : cleaned[0]
  const suit = cleaned[1].toLowerCase()
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null
  return rank + suit
}

export function parseCards(value) {
  if (!value.trim()) return []
  return value
    .replace(/,/g, ' ')
    .replace(/10/g, 'T')
    .split(/\s+/)
    .map(parseCard)
    .filter(Boolean)
}

function makeDeck(excluded) {
  const excludedSet = new Set(excluded)
  const deck = []
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      const card = rank + suit
      if (!excludedSet.has(card)) deck.push(card)
    }
  }
  return deck
}

function rankValue(rank) {
  return RANKS.indexOf(rank) + 2
}

function evaluateFive(cards) {
  const ranks = cards.map((card) => rankValue(card[0])).sort((a, b) => b - a)
  const counts = {}
  for (const rank of ranks) counts[rank] = (counts[rank] || 0) + 1
  const groups = Object.entries(counts).map(([rank, count]) => [Number(rank), count]).sort((a, b) => b[1] - a[1] || b[0] - a[0])
  const unique = [...new Set(ranks)].sort((a, b) => b - a)
  const suitCounts = {}
  for (const card of cards) suitCounts[card[1]] = (suitCounts[card[1]] || 0) + 1
  const flushSuit = Object.keys(suitCounts).find((suit) => suitCounts[suit] >= 5)
  let flushRanks = []
  if (flushSuit) flushRanks = cards.filter((card) => card[1] === flushSuit).map((card) => rankValue(card[0])).sort((a, b) => b - a)

  const straightHigh = (values) => {
    const set = new Set(values)
    if (set.has(14)) set.add(1)
    let run = 0
    let high = 0
    for (let value = 14; value >= 1; value--) {
      if (set.has(value)) {
        run++
        if (run >= 5) high = value + 4
      } else {
        run = 0
      }
    }
    return high
  }

  const straight = straightHigh(ranks)
  const flushStraight = flushRanks.length ? straightHigh(flushRanks) : 0
  if (flushStraight) return [8, flushStraight]
  if (groups[0][1] === 4) return [7, groups[0][0], groups[1][0]]
  if (groups[0][1] === 3 && groups[1][1] >= 2) return [6, groups[0][0], groups[1][0]]
  if (flushSuit) return [5, ...flushRanks.slice(0, 5)]
  if (straight) return [4, straight]
  if (groups[0][1] === 3) return [3, groups[0][0], ...groups.slice(1).map((group) => group[0]).sort((a, b) => b - a).slice(0, 2)]
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = groups.filter((group) => group[1] === 2).map((group) => group[0]).sort((a, b) => b - a)
    const kicker = groups.find((group) => group[1] === 1)?.[0] || 0
    return [2, ...pairs, kicker]
  }
  if (groups[0][1] === 2) return [1, groups[0][0], ...groups.slice(1).map((group) => group[0]).sort((a, b) => b - a).slice(0, 3)]
  return [0, ...unique.slice(0, 5)]
}

function evaluateSeven(cards) {
  let best = [-1]
  for (let a = 0; a < cards.length - 4; a++) {
    for (let b = a + 1; b < cards.length - 3; b++) {
      for (let c = b + 1; c < cards.length - 2; c++) {
        for (let d = c + 1; d < cards.length - 1; d++) {
          for (let e = d + 1; e < cards.length; e++) {
            const score = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]])
            if (compareScores(score, best) > 0) best = score
          }
        }
      }
    }
  }
  return best
}

function compareScores(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    if (av !== bv) return av - bv
  }
  return 0
}

export function calculateEquity(heroCards, boardCards, opponentCount = 1, simulations = 5000) {
  if (heroCards.length !== 2) return null
  if (boardCards.length > 5) return null

  const deck = makeDeck([...heroCards, ...boardCards])
  const unknownBoardCount = 5 - boardCards.length
  let wins = 0
  let ties = 0

  for (let trial = 0; trial < simulations; trial++) {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    let cursor = 0
    const runout = shuffled.slice(cursor, cursor + unknownBoardCount)
    cursor += unknownBoardCount
    const fullBoard = [...boardCards, ...runout]
    const heroScore = evaluateSeven([...heroCards, ...fullBoard])
    let beat = false
    let tied = false

    for (let player = 0; player < opponentCount; player++) {
      const villainCards = shuffled.slice(cursor, cursor + 2)
      cursor += 2
      if (villainCards.length < 2) break
      const villainScore = evaluateSeven([...villainCards, ...fullBoard])
      const result = compareScores(heroScore, villainScore)
      if (result < 0) beat = true
      if (result === 0) tied = true
    }

    if (!beat) wins += tied ? 0.5 : 1
    if (tied && !beat) ties++
  }
  return { equity: (wins / simulations) * 100, ties: (ties / simulations) * 100 }
}
