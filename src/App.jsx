import { useEffect, useMemo, useState } from 'react'

const TAIPEI = { name: '台北市', latitude: 25.033, longitude: 121.5654 }
const GROUPS = {
  clear: [0], cloudy: [1,2,3,45,48],
  rain: [51,53,55,56,57,61,63,65,66,67,80,81,82],
  snow: [71,73,75,77,85,86], thunder: [95,96,99]
}
const kindOf = (code=1) => Object.entries(GROUPS).find(([,v])=>v.includes(code))?.[0] || 'cloudy'
const labelOf = code => code===0?'晴朗':[1,2].includes(code)?'晴時多雲':[3,45,48].includes(code)?'陰天':GROUPS.rain.includes(code)?'降雨':GROUPS.snow.includes(code)?'降雪':GROUPS.thunder.includes(code)?'雷雨':'天氣變化中'
const iconOf = (code, day=1) => ({clear:day?'☀️':'🌙',cloudy:'☁️',rain:'🌧️',snow:'🌨️',thunder:'⛈️'})[kindOf(code)]

function Rain({heavy=false}) { return <div className="rain">{Array.from({length:heavy?60:38},(_,i)=><i key={i} style={{left:`${i*37%100}%`,animationDelay:`-${i%13*.13}s`,animationDuration:`${heavy?.48:.72+(i%4)*.08}s`}} />)}</div> }
function Stars(){return <div className="stars">{Array.from({length:34},(_,i)=><i key={i} style={{left:`${i*47%98}%`,top:`${5+i*29%46}%`,animationDelay:`${i%7*.2}s`}} />)}</div>}
function Clouds(){return <><i className="cloud c1"/><i className="cloud c2"/><i className="cloud c3"/></>}

function Scene({kind,isDay,paused}){
 return <div className={`scene ${kind} ${isDay?'day':'night'} ${paused?'paused':''}`}>
   <div className="sky"/>{!isDay&&<Stars/>}{kind==='clear'&&<i className={isDay?'sun':'moon'}/>} {kind!=='clear'&&<Clouds/>}
   {kind==='rain'&&<Rain/>}{kind==='thunder'&&<><Rain heavy/><div className="flash"/><b className="bolt">ϟ</b></>}
   {kind==='snow'&&<div className="snow">{Array.from({length:32},(_,i)=><i key={i} style={{left:`${i*43%100}%`,animationDelay:`-${i%11*.3}s`}}>✦</i>)}</div>}
   <div className="mount m1"/><div className="mount m2"/><div className="grass"/>
   <div className="tree t1"><i/><b/><span/></div><div className="tree t2"><i/><b/><span/></div>
   <div className="house"><i className="roof"/><i className="wall"/><i className="win w1"/><i className="win w2"/><i className="door"/><i className="chimney"/></div>
   <div className="shop"><strong>天氣屋</strong><i className="awning"/><i className="window"/></div>
   <div className="well"><i/><b/></div><div className="crate"/><div className="barrel"/><div className="flowers">✿ ✿ ✿</div>
   <div className="road"/><div className="lamp l1"><i/></div><div className="lamp l2"><i/></div>
   <div className="hero"><i className="hair"/><i className="face"/><i className="body"/><i className="cape"/><i className="shield"/><i className="sword"/>{['rain','thunder'].includes(kind)&&<i className="umbrella"/>}</div>
   <div className="cat"><i/><b/><span/></div>{['rain','thunder'].includes(kind)&&<><i className="puddle p1"/><i className="puddle p2"/></>}
 </div>
}

export default function App(){
 const [place,setPlace]=useState(TAIPEI),[data,setData]=useState(null),[status,setStatus]=useState('正在連接氣象站…'),[paused,setPaused]=useState(false),[locating,setLocating]=useState(false),[now,setNow]=useState(new Date())
 useEffect(()=>{const id=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(id)},[])
 async function load(target=place){setStatus('正在更新天氣…');try{const q=new URLSearchParams({latitude:target.latitude,longitude:target.longitude,current:'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',timezone:'auto',forecast_days:'5'});const r=await fetch(`https://api.open-meteo.com/v1/forecast?${q}`);if(!r.ok)throw Error();setData(await r.json());setStatus(`更新於 ${new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}`)}catch{setStatus('暫時無法取得天氣，請稍後重試')}}
 useEffect(()=>{load(TAIPEI)},[])
 function locate(){if(!navigator.geolocation)return setStatus('瀏覽器不支援定位');setLocating(true);navigator.geolocation.getCurrentPosition(({coords})=>{const p={name:'目前位置',latitude:coords.latitude,longitude:coords.longitude};setPlace(p);setLocating(false);load(p)},()=>{setLocating(false);setStatus('無法取得定位，繼續顯示台北')},{timeout:8000})}
 const c=data?.current, kind=kindOf(c?.weather_code), isDay=c?.is_day ?? (now.getHours()>6&&now.getHours()<18?1:0)
 const greet=useMemo(()=>kind==='rain'||kind==='thunder'?'雨滴正在拜訪小鎮，出門記得帶傘！':kind==='clear'&&isDay?'陽光灑進小鎮，適合出門走走。':!isDay?'小鎮亮起燈火，祝你有個舒服的夜晚。':kind==='snow'?'雪花落下，小鎮換上銀白外套。':'雲朵緩緩經過，今天也要過得從容。',[kind,isDay])
 return <main><header><div><small>PIXEL WEATHER TOWN</small><h1>像素天氣小鎮</h1></div><button onClick={()=>setPaused(v=>!v)}>{paused?'▶ 開啟動畫':'Ⅱ 暫停動畫'}</button></header>
  <section className="stage"><Scene kind={kind} isDay={isDay} paused={paused}/><div className="location">📍 {place.name}<b>{now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}</b></div><div className="summary"><span>{iconOf(c?.weather_code,isDay)}</span><strong>{c?Math.round(c.temperature_2m):'--'}°</strong><div><h2>{c?labelOf(c.weather_code):'讀取天氣中'}</h2><p>{greet}</p></div></div></section>
  <section className="grid"><article className="panel"><div className="panelTitle"><b>今日觀測</b><small>{status}</small></div><div className="stats"><div>體感<b>{c?Math.round(c.apparent_temperature):'--'}°C</b></div><div>濕度<b>{c?.relative_humidity_2m??'--'}%</b></div><div>降水<b>{c?.precipitation??'--'} mm</b></div><div>風速<b>{c?Math.round(c.wind_speed_10m):'--'} km/h</b></div></div><div className="actions"><button onClick={locate} disabled={locating}>⌖ {locating?'定位中…':'使用目前位置'}</button><button onClick={()=>load()}>↻ 重新整理</button></div></article>
  <article className="panel"><div className="panelTitle"><b>未來 5 天</b><small>小鎮氣象預報</small></div><div className="forecast">{data?.daily?.time.map((d,i)=><div className="day" key={d}><b>{i?'週'+new Date(d+'T12:00').toLocaleDateString('zh-TW',{weekday:'short'}).slice(-1):'今天'}</b><i>{iconOf(data.daily.weather_code[i])}</i><strong>{Math.round(data.daily.temperature_2m_max[i])}°</strong><small>{Math.round(data.daily.temperature_2m_min[i])}°</small><em>☔ {data.daily.precipitation_probability_max[i]}%</em></div>)||Array.from({length:5},(_,i)=><div className="day loading" key={i}/>)}</div></article></section>
  <footer>天氣資料來源：Open-Meteo。場景依即時天氣與日夜自動切換。</footer>
 </main>
}
