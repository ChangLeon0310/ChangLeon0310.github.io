import { useEffect, useMemo, useState } from 'react'

const TAIPEI = { name: '台北市', latitude: 25.033, longitude: 121.5654 }
const GROUPS = {
  clear: [0],
  cloudy: [1, 2, 3, 45, 48],
  rain: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
  snow: [71, 73, 75, 77, 85, 86],
  thunder: [95, 96, 99],
}
const weatherKind = (code = 1) => Object.entries(GROUPS).find(([, values]) => values.includes(code))?.[0] || 'cloudy'
const weatherLabel = code => code === 0 ? '晴朗' : [1, 2].includes(code) ? '晴時多雲' : [3, 45, 48].includes(code) ? '陰天' : GROUPS.rain.includes(code) ? '降雨' : GROUPS.snow.includes(code) ? '降雪' : GROUPS.thunder.includes(code) ? '雷雨' : '天氣變化中'
const weatherIcon = (code, isDay = 1) => ({ clear: isDay ? '☀️' : '🌙', cloudy: '☁️', rain: '🌧️', snow: '❄️', thunder: '⛈️' })[weatherKind(code)]

function Rain({ heavy = false }) {
  return <div className="rain-layer">{Array.from({ length: heavy ? 55 : 33 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-(i % 15) * .13}s`, animationDuration: `${heavy ? .5 : .72 + (i % 4) * .09}s` }} />)}</div>
}
function Snow() {
  return <div className="snow-layer">{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ left: `${(i * 43) % 100}%`, fontSize: `${7 + i % 4 * 3}px`, animationDelay: `${-(i % 13) * .35}s`, animationDuration: `${4.5 + i % 5}s` }}>●</i>)}</div>
}
function Stars() {
  return <div className="stars">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ left: `${(i * 47) % 98}%`, top: `${5 + (i * 29) % 48}%`, animationDelay: `${(i % 8) * .25}s` }} />)}</div>
}
function Cloud({ className }) { return <div className={`cloud ${className}`}><i/><i/><i/></div> }
function VillageScene({ kind, isDay, paused }) {
  return <div className={`scene layered-scene weather-${kind} ${isDay ? 'day' : 'night'} ${paused ? 'paused' : ''}`}>
    <div className="art-layer art-far" />
    <div className="art-layer art-mid" />
    <div className="art-layer art-front" />
    <div className="depth-light" />
    {!isDay && <Stars />}
    <Cloud className="cloud-a"/><Cloud className="cloud-b"/><Cloud className="cloud-c"/>
    <div className="mist mist-a"/><div className="mist mist-b"/>
    <div className="sun-glow" />
    <div className="village-lights"><i/><i/><i/><i/><i/></div>
    <div className="water-shimmer"><i/><i/><i/></div>
    {kind === 'rain' && <><Rain/><div className="wet-glow"/></>}
    {kind === 'thunder' && <><Rain heavy/><div className="wet-glow"/><div className="flash"/><div className="lightning">ϟ</div></>}
    {kind === 'snow' && <Snow/>}
    <div className="night-tint"/><div className="weather-tint"/><div className="vignette"/>
  </div>
}

export default function App() {
  const [place, setPlace] = useState(TAIPEI)
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('正在連接氣象站…')
  const [paused, setPaused] = useState(false)
  const [locating, setLocating] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])

  async function loadWeather(target = place) {
    setStatus('正在更新天氣…')
    try {
      const params = new URLSearchParams({
        latitude: target.latitude,
        longitude: target.longitude,
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto', forecast_days: '5'
      })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      if (!response.ok) throw new Error('weather')
      setData(await response.json())
      setStatus(`更新於 ${new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}`)
    } catch { setStatus('暫時無法取得天氣，請稍後重試') }
  }
  useEffect(() => { loadWeather(TAIPEI) }, [])

  function locate() {
    if (!navigator.geolocation) return setStatus('瀏覽器不支援定位')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const target = { name: '目前位置', latitude: coords.latitude, longitude: coords.longitude }
      setPlace(target); setLocating(false); loadWeather(target)
    }, () => { setLocating(false); setStatus('無法取得定位，繼續顯示台北市') }, { timeout: 8000 })
  }

  const current = data?.current
  const kind = weatherKind(current?.weather_code)
  const isDay = current?.is_day ?? (now.getHours() > 6 && now.getHours() < 18 ? 1 : 0)
  const greeting = useMemo(() => kind === 'rain' || kind === 'thunder' ? '雨聲輕落，出門記得帶傘。' : kind === 'clear' && isDay ? '陽光正好，適合出門走走。' : !isDay ? '小鎮亮起燈火，晚安。' : kind === 'snow' ? '雪花落下，世界慢了下來。' : '雲朵慢慢經過，今天也從容一點。', [kind, isDay])

  return <main className="app">
    <header>
      <div><small>WEATHER TOWN</small><h1>山嵐小鎮 <em>V6</em></h1></div>
      <button className="soft-button" onClick={() => setPaused(v => !v)}>{paused ? '▶ 開啟動畫' : 'Ⅱ 暫停動畫'}</button>
    </header>

    <section className="hero-card">
      <VillageScene kind={kind} isDay={isDay} paused={paused}/>
      <div className="top-status"><span>⌖ {place.name}</span><b>{now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</b></div>
      <div className="weather-glass">
        <span className="main-icon">{weatherIcon(current?.weather_code, isDay)}</span>
        <strong>{current ? Math.round(current.temperature_2m) : '--'}°</strong>
        <div><h2>{current ? weatherLabel(current.weather_code) : '讀取天氣中'}</h2><p>{greeting}</p></div>
      </div>
    </section>

    <section className="info-grid">
      <article className="glass-panel observations">
        <div className="panel-heading"><b>今日觀測</b><small>{status}</small></div>
        <div className="stats">
          <div><span>體感溫度</span><b>{current ? Math.round(current.apparent_temperature) : '--'}°C</b></div>
          <div><span>相對濕度</span><b>{current?.relative_humidity_2m ?? '--'}%</b></div>
          <div><span>降水量</span><b>{current?.precipitation ?? '--'} mm</b></div>
          <div><span>風速</span><b>{current ? Math.round(current.wind_speed_10m) : '--'} km/h</b></div>
        </div>
        <div className="actions"><button onClick={locate} disabled={locating}>⌖ {locating ? '定位中…' : '使用目前位置'}</button><button onClick={() => loadWeather()}>↻ 重新整理</button></div>
      </article>

      <article className="glass-panel forecast-panel">
        <div className="panel-heading"><b>未來 5 天</b><small>天氣預報</small></div>
        <div className="forecast">
          {data?.daily?.time?.map((date, i) => <div className="day-card" key={date}>
            <b>{i === 0 ? '今天' : new Date(`${date}T12:00`).toLocaleDateString('zh-TW', { weekday: 'short' })}</b>
            <i>{weatherIcon(data.daily.weather_code[i])}</i>
            <strong>{Math.round(data.daily.temperature_2m_max[i])}°</strong>
            <small>{Math.round(data.daily.temperature_2m_min[i])}°</small>
            <em>降雨 {data.daily.precipitation_probability_max[i]}%</em>
          </div>) || Array.from({ length: 5 }, (_, i) => <div className="day-card loading" key={i}/>)}
        </div>
      </article>
    </section>
    <footer>天氣資料來自 Open-Meteo。分層插畫會依即時天氣與日夜自動變化。</footer>
  </main>
}
