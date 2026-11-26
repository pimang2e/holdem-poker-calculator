import { useMemo, useState } from 'react'
import { calculateEquity, parseCards } from './poker'
import './App.css'

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const suits = [
  { value: 's', label: '♠' },
  { value: 'h', label: '♥' },
  { value: 'd', label: '♦' },
  { value: 'c', label: '♣' },
]

const updateCard = (setter, cards, index, field, value) => {
  setter(cards.map((card, cardIndex) => cardIndex === index ? { ...card, [field]: value } : card))
}

function CardPicker({ cards, setter, label }) {
  return (
    <div className={`card-picker ${label === '보드' ? 'board-picker' : 'hero-picker'}`}>
      {cards.map((card, index) => (
        <div className="card-slot" key={`${label}-${index}`}>
          <select
            aria-label={`${label} 카드 ${index + 1} 숫자`}
            value={card.rank}
            onChange={(event) => updateCard(setter, cards, index, 'rank', event.target.value)}
            className="rank-select"
          >
            <option value="">숫자</option>
            {ranks.map((rank) => <option key={rank} value={rank}>{rank}</option>)}
          </select>
          <select
            aria-label={`${label} 카드 ${index + 1} 문양`}
            value={card.suit}
            onChange={(event) => updateCard(setter, cards, index, 'suit', event.target.value)}
            className={`suit-select ${card.suit}`}
          >
            <option value="">문양</option>
            {suits.map((suit) => <option key={suit.value} value={suit.value}>{suit.label}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}

function App() {
  const [hero, setHero] = useState([{ rank: '', suit: '' }, { rank: '', suit: '' }])
  const [board, setBoard] = useState(Array.from({ length: 5 }, () => ({ rank: '', suit: '' })))
  const [position, setPosition] = useState('BTN')
  const [opponents, setOpponents] = useState(1)
  const [pot, setPot] = useState(30)
  const [sidePot, setSidePot] = useState(0)
  const [callAmount, setCallAmount] = useState(10)

  const cardString = (cards) => cards
    .filter((card) => card.rank && card.suit)
    .map((card) => `${card.rank === '10' ? 'T' : card.rank}${card.suit}`)
    .join(' ')

  const result = useMemo(() => {
    const heroCards = parseCards(cardString(hero))
    const boardCards = parseCards(cardString(board))
    if (heroCards.length !== 2 || boardCards.length > 5) return null
    const allCards = [...heroCards, ...boardCards]
    if (new Set(allCards).size !== allCards.length) return null
    const equity = calculateEquity(heroCards, boardCards, opponents, 5000)
    if (!equity) return null

    const totalPot = Number(pot || 0) + Number(sidePot || 0)
    const call = Number(callAmount || 0)
    const required = call > 0 ? (call / (totalPot + call)) * 100 : 0
    const profitableCall = equity.equity > required
    let recommendedAction = '체크 / 폴드'
    if (call === 0) recommendedAction = equity.equity >= 55 ? '가치 베팅' : '체크'
    else if (profitableCall) recommendedAction = equity.equity >= 65 ? '레이즈 고려' : '콜'
    else if (equity.equity >= required - 3) recommendedAction = '플렉스 콜'

    const betFactor = equity.equity >= 65 ? 0.75 : equity.equity >= 50 ? 0.5 : 0.33
    const recommendedBet = Math.max(1, Math.round((totalPot * betFactor) / 5) * 5)
    return { ...equity, totalPot, required, profitableCall, recommendedAction, recommendedBet }
  }, [hero, board, opponents, pot, sidePot, callAmount])

  return (
    <main className="app-shell">
      <header>
        <div><p className="eyebrow">Hold'em Calculator</p><h1>원팟 계산기</h1></div>
        <button className="reset" onClick={() => {
          setHero([{ rank: '', suit: '' }, { rank: '', suit: '' }])
          setBoard(Array.from({ length: 5 }, () => ({ rank: '', suit: '' })))
          setPot(30)
          setSidePot(0)
          setCallAmount(10)
        }}>초기화</button>
      </header>

      <section className="card hand-card">
        <label>내 패<span>두 장 선택</span></label>
        <CardPicker cards={hero} setter={setHero} label="내 패" />
        <label>보드<span>최대 5장 선택</span></label>
        <CardPicker cards={board} setter={setBoard} label="보드" />
      </section>

      <section className="card controls">
        <div className="field full">
          <span>내 포지션</span>
          <div className="segmented">
            {['EP', 'MP', 'CO', 'BTN', 'SB', 'BB'].map((item) => (
              <button key={item} className={position === item ? 'active' : ''} onClick={() => setPosition(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="field"><label htmlFor="opponents">상대 수</label><select id="opponents" value={opponents} onChange={(event) => setOpponents(Number(event.target.value))}>{[1,2,3,4,5,6].map((count) => <option key={count} value={count}>{count}명</option>)}</select></div>
        <div className="field"><label htmlFor="pot">메인 팟</label><input id="pot" type="number" min="0" value={pot} onChange={(event) => setPot(event.target.value)} /></div>
        <div className="field"><label htmlFor="sidePot">사이드 팟</label><input id="sidePot" type="number" min="0" value={sidePot} onChange={(event) => setSidePot(event.target.value)} /></div>
        <div className="field"><label htmlFor="call">콜 금액</label><input id="call" type="number" min="0" value={callAmount} onChange={(event) => setCallAmount(event.target.value)} /></div>
      </section>

      <section className="result-card">
        {result ? (
          <>
            <div className="action-row"><div><span>추천 액션</span><strong>{result.recommendedAction}</strong></div><div className="equity"><span>추정 승률</span><strong>{result.equity.toFixed(1)}%</strong></div></div>
            <div className="metrics">
              <div><span>팟오즈 필요 승률</span><strong>{result.required.toFixed(1)}%</strong></div>
              <div><span>추천 베팅</span><strong>{result.recommendedBet.toLocaleString()}</strong></div>
              <div><span>총 팟</span><strong>{result.totalPot.toLocaleString()}</strong></div>
              <div><span>판정</span><strong className={result.profitableCall ? 'good' : 'bad'}>{result.profitableCall ? '콜 허용' : '콜 주의'}</strong></div>
            </div>
          </>
        ) : (
          <div className="empty"><strong>내 패와 보드를 입력하세요</strong><span>내 패는 2장, 보드는 최대 5장까지 가능합니다.</span></div>
        )}
      </section>
      <p className="disclaimer">참고용 추정치입니다. 상대 범위와 블라인드 구조를 고려해 판단하세요.</p>
    </main>
  )
}

export default App
