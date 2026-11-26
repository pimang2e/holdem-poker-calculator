import { useMemo, useState } from 'react'
import { calculateEquity, parseCards } from './poker'
import './App.css'

function App() {
  const [hero, setHero] = useState('')
  const [board, setBoard] = useState('')
  const [position, setPosition] = useState('BTN')
  const [opponents, setOpponents] = useState(1)
  const [pot, setPot] = useState(30)
  const [sidePot, setSidePot] = useState(0)
  const [callAmount, setCallAmount] = useState(10)

  const result = useMemo(() => {
    const heroCards = parseCards(hero)
    const boardCards = parseCards(board)
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
        <button className="reset" onClick={() => { setHero(''); setBoard(''); setPot(30); setSidePot(0); setCallAmount(10) }}>초기화</button>
      </header>

      <section className="card hand-card">
        <label>내 패<span>예: As Kh 또는 A♠ K♥</span></label>
        <input value={hero} onChange={(event) => setHero(event.target.value)} placeholder="A♠ K♥" />
        <label>보드<span>플롭 3 / 턴 4 / 리버 5장</span></label>
        <input value={board} onChange={(event) => setBoard(event.target.value)} placeholder="T♠ J♠ Q♣" />
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
