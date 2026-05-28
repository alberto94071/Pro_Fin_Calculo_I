import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ReferenceDot, ResponsiveContainer
} from "recharts";

// ================================================================
//  CHRONOS-DEV — CÁLCULO I: LA DERIVADA EN ACCIÓN
//  Proyecto: Dinámica de Carga y Auto-scaling de Servidores
// ================================================================

// ── FUNCIÓN DE USUARIOS U(t) ─────────────────────────────────────
// Representa el número total de usuarios conectados en el instante t.
// U(t) = -t³ + 9t² + 48t + 200
const U = (t) =>
  -Math.pow(t, 3) + 9 * Math.pow(t, 2) + 48 * t + 200;

// ── DERIVADA ANALÍTICA U'(t) ─────────────────────────────────────
// *** LÍNEA CLAVE DEL PROYECTO ***
// Razón de cambio instantánea: cuántos usuarios/hora llegan en t exacto.
// Derivada término a término: d/dt(-t³)=-3t², d/dt(9t²)=18t, d/dt(48t)=48, d/dt(200)=0
// DEMO "¿qué pasa si cambio esta línea?":
//   -3 → -1  : pico dura más (evento más largo)
//   48 → 100 : arranca con muchísima más velocidad inicial
const dU = (t) =>
  -3 * Math.pow(t, 2) + 18 * t + 48;

// Genera puntos para las gráficas (t = 0..10, paso 0.25)
const generateChartData = () => {
  const data = [];
  for (let t = 0; t <= 10; t += 0.25) {
    const tv = parseFloat(t.toFixed(2));
    data.push({ t: tv, usuarios: Math.round(U(tv)), tasa: parseFloat(dU(tv).toFixed(1)) });
  }
  return data;
};
const CHART_DATA = generateChartData();

// Paleta CHRONOS-DEV
const C = {
  bg:"#0d1035", surface:"#141840", card:"#1a2060",
  border:"rgba(0,220,255,0.18)", borderBright:"rgba(0,220,255,0.4)",
  cyan:"#00dcff", green:"#00e5a0", amber:"#f0b429",
  red:"#ff4d6a", purple:"#7b6ff0",
  textPrimary:"#e8eeff", textSec:"rgba(160,180,230,0.72)", textMuted:"rgba(120,140,200,0.5)",
};

// Lógica de auto-scaling basada en U(t) y U'(t)
const getStatus = (t, umbral, capacidad) => {
  const u = U(t), du = dU(t);

  // Cada servidor tiene la misma capacidad individual.
  // SRV-01 solo         → hasta 1x capacidad
  // SRV-01 + SRV-02     → hasta 2x capacidad
  // SRV-01 + SRV-02 + SRV-03 → hasta 3x capacidad

  // Nivel 3: carga supera 2 servidores — necesita los 3
  if (u > capacidad * 2)
    return { level:3, color:C.red,   label:"COLAPSO INMINENTE", servers:[true,true,true],  icon:"⚠" };

  // Nivel 3 preventivo: velocidad alta Y carga cerca del límite de 2 servidores
  if (du >= umbral && u > capacidad)
    return { level:3, color:C.red,   label:"ESCALANDO A 3...",  servers:[true,true,true],  icon:"⚡" };

  // Nivel 2: carga supera 1 servidor — necesita SRV-02
  if (u > capacidad)
    return { level:2, color:C.amber, label:"ESCALANDO...",      servers:[true,true,false], icon:"⚡" };

  // Nivel 2 preventivo: velocidad alta pero carga todavía manejable
  // La derivada avisa que pronto se necesitará SRV-02
  if (du >= umbral)
    return { level:2, color:C.amber, label:"ALERTA PREVENTIVA", servers:[true,true,false], icon:"⚡" };

  // Nivel 1: todo dentro del límite del servidor base
  return   { level:1, color:C.green, label:"SISTEMA ESTABLE",   servers:[true,false,false],icon:"✓" };
};

const CustomTooltip = ({ active, payload, label, isDerivada, umbral, capacidad }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:"8px 12px", fontSize:11, fontFamily:"Courier New,monospace", color:C.textPrimary }}>
      <div style={{ color:C.textMuted, marginBottom:4 }}>t = {label} horas</div>
      {isDerivada
        ? <><div style={{color:C.green}}>U'({label}) = <strong>{val}</strong> usr/hr</div>
            {val >= umbral && <div style={{color:C.amber,marginTop:4}}>⚡ Supera umbral ({umbral})</div>}</>
        : <><div style={{color:C.cyan}}>U({label}) = <strong>{val}</strong> usuarios</div>
            {val > capacidad && <div style={{color:C.red,marginTop:4}}>⚠ Supera capacidad ({capacidad})</div>}</>
      }
    </div>
  );
};

export default function App() {
  const [umbral,    setUmbral]    = useState(60);
  const [capacidad, setCapacidad] = useState(400);
  const [t,         setT]         = useState(3);
  const [playing,   setPlaying]   = useState(false);
  const intervalRef = useRef(null);

  const usuarios = Math.round(U(t));
  const tasa     = parseFloat(dU(t).toFixed(1));
  const status   = getStatus(t, umbral, capacidad);
  const minPorUsuario = tasa > 0 ? (60 / tasa).toFixed(1) : null;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setT(prev => {
          if (prev >= 10) { setPlaying(false); return 10; }
          return parseFloat((prev + 0.1).toFixed(1));
        });
      }, 300); // cada 300ms — velocidad cómoda para presentación
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  const card    = (e={}) => ({ background:C.card,    border:`0.5px solid ${C.border}`, borderRadius:12, padding:"14px 16px", ...e });
  const surface = (e={}) => ({ background:C.surface, border:`0.5px solid ${C.border}`, borderRadius:10, padding:"12px 14px", ...e });
  const lbl     = (e={}) => ({ fontSize:9, letterSpacing:"0.12em", color:C.textMuted, textTransform:"uppercase", margin:"0 0 4px", fontFamily:"Courier New,monospace", ...e });

  const calcStr = `−3(${t.toFixed(1)})² + 18(${t.toFixed(1)}) + 48`;
  let interpMsg = `Exactamente a las t = ${t.toFixed(1)} horas del evento, la velocidad instantánea de llegada de usuarios es de ${Math.abs(tasa)} personas por hora. `;
  if (tasa > 0)  interpMsg += `La plataforma recibe un nuevo usuario cada ${minPorUsuario} minutos. El flujo está creciendo. `;
  if (tasa < 0)  interpMsg += `Los usuarios están saliendo. El evento ha pasado su pico. `;
  if (tasa === 0) interpMsg += `La tasa es cero: se alcanzó el pico máximo exacto. `;
  if (status.level === 1) interpMsg += `Con U'(t)=${tasa} usr/hr (bajo umbral ${umbral}), SRV-01 maneja la carga sin escalar.`;
  if (status.level === 2) interpMsg += `U'(t)=${tasa} supera el umbral ${umbral} usr/hr → SRV-02 activado automáticamente.`;
  if (status.level === 3) interpMsg += `⚠ CRÍTICO: U'(t)=${tasa} supera umbral y U(t)=${usuarios} supera capacidad ${capacidad}. SRV-03 activado.`;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"20px 24px", fontFamily:"Courier New,monospace", color:C.textPrimary }}>

      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, paddingBottom:14, borderBottom:`0.5px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#7b6ff0,#00dcff)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:"#fff" }}>CD</div>
          <div>
            <div style={{ fontSize:17, fontWeight:600, letterSpacing:"0.05em" }}>CHRONOS<span style={{color:C.cyan}}>DEV</span></div>
            <div style={{ fontSize:9, color:C.textMuted, letterSpacing:"0.14em" }}>SERVER AUTO-SCALING SIMULATOR</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:10, color:C.textMuted, marginBottom:4 }}>Cálculo I — Proyecto Final</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:C.green, justifyContent:"flex-end" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulse 1.4s infinite" }}></span>
            SIMULACIÓN EN VIVO
          </div>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {[
          { label:"Usuarios actuales",  val:usuarios.toLocaleString(), unit:"U(t) evaluada",     color:C.cyan },
          { label:"Tasa instantánea",   val:tasa,                       unit:"usr/hr · U'(t)",    color:tasa>=umbral?C.amber:C.green },
          { label:"Tiempo simulado",    val:`t = ${t.toFixed(1)} h`,   unit:"horas del evento",  color:C.purple },
          { label:"Servidores activos", val:`${status.servers.filter(Boolean).length} / 3`, unit:status.label, color:status.color },
        ].map((m,i) => (
          <div key={i} style={surface()}>
            <p style={lbl()}>{m.label}</p>
            <p style={{ fontSize:22, fontWeight:600, margin:"0 0 2px", color:m.color }}>{m.val}</p>
            <p style={{ fontSize:10, color:C.textMuted, margin:0 }}>{m.unit}</p>
          </div>
        ))}
      </div>

      {/* CONTROLES */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.3fr", gap:10, marginBottom:16 }}>
        <div style={surface()}>
          <p style={lbl()}>① Umbral de velocidad crítica</p>
          <p style={{ fontSize:20, fontWeight:600, color:C.amber, margin:"0 0 8px" }}>{umbral} <span style={{fontSize:10,color:C.textMuted}}>usr/hr</span></p>
          <input type="range" min="20" max="120" step="5" value={umbral} onChange={e=>setUmbral(+e.target.value)} style={{ width:"100%", accentColor:C.amber }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.textMuted, marginTop:3 }}><span>20</span><span>70</span><span>120</span></div>
          <p style={{ fontSize:9, color:C.textMuted, margin:"6px 0 0", lineHeight:1.5 }}>Si U'(t) ≥ {umbral} → activa SRV-02</p>
        </div>
        <div style={surface()}>
          <p style={lbl()}>② Capacidad máx. servidor base</p>
          <p style={{ fontSize:20, fontWeight:600, color:C.cyan, margin:"0 0 8px" }}>{capacidad} <span style={{fontSize:10,color:C.textMuted}}>usuarios</span></p>
          <input type="range" min="200" max="800" step="50" value={capacidad} onChange={e=>setCapacidad(+e.target.value)} style={{ width:"100%", accentColor:C.cyan }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.textMuted, marginTop:3 }}><span>200</span><span>500</span><span>800</span></div>
          <p style={{ fontSize:9, color:C.textMuted, margin:"6px 0 0", lineHeight:1.5 }}>Si U(t) &gt; {capacidad} + alerta → activa SRV-03</p>
        </div>
        <div style={surface()}>
          <p style={lbl()}>③ Cursor de tiempo del evento</p>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <button onClick={()=>{setT(0);setPlaying(false);}} style={{ background:"transparent", border:`0.5px solid ${C.border}`, color:C.textMuted, borderRadius:6, padding:"4px 9px", cursor:"pointer", fontSize:13 }}>↺</button>
            <button onClick={()=>setPlaying(p=>!p)} style={{ background:playing?C.red:C.green, border:"none", color:C.bg, borderRadius:6, padding:"4px 14px", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"Courier New,monospace" }}>
              {playing ? "⏸ PAUSA" : "▶ PLAY"}
            </button>
            <span style={{ fontSize:18, fontWeight:600, color:C.purple, marginLeft:"auto" }}>t = {t.toFixed(1)} h</span>
          </div>
          <input type="range" min="0" max="10" step="0.1" value={t} onChange={e=>setT(+e.target.value)} style={{ width:"100%", accentColor:C.purple }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:C.textMuted, marginTop:3 }}>
            {[0,1,2,3,4,5,6,7,8,9,10].map(n=><span key={n}>{n}</span>)}
          </div>
        </div>
      </div>

      {/* GRÁFICAS */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        <div style={card()}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:600, margin:"0 0 2px", color:C.textPrimary }}>U(t) — Usuarios Totales</p>
              <p style={{ fontSize:9, color:C.cyan, margin:0 }}>U(t) = −t³ + 9t² + 48t + 200</p>
            </div>
            <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:"rgba(0,220,255,0.1)", border:`0.5px solid ${C.borderBright}`, color:C.cyan }}>CARGA TOTAL</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={CHART_DATA} margin={{top:5,right:5,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.cyan}  stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={C.cyan}  stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,220,255,0.07)"/>
              <XAxis dataKey="t" stroke={C.textMuted} tick={{fontSize:9,fontFamily:"Courier New",fill:C.textMuted}} tickLine={false}/>
              <YAxis stroke={C.textMuted} tick={{fontSize:9,fontFamily:"Courier New",fill:C.textMuted}} tickLine={false}/>
              <Tooltip content={<CustomTooltip isDerivada={false} umbral={umbral} capacidad={capacidad}/>}/>
              <ReferenceLine y={capacidad} stroke={C.red} strokeDasharray="4 3" strokeWidth={1} label={{value:`Cap.${capacidad}`,fill:C.red,fontSize:9,fontFamily:"Courier New"}}/>
              <ReferenceLine x={t} stroke={C.purple} strokeDasharray="3 3" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="usuarios" stroke={C.cyan} strokeWidth={2} fill="url(#gU)" dot={false} activeDot={{r:4,fill:C.cyan,stroke:C.bg}}/>
              {/* Punto animado que recorre la curva — muestra la posición exacta en t */}
              <ReferenceDot x={t} y={usuarios} r={6} fill={C.cyan} stroke={C.bg} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={card()}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:600, margin:"0 0 2px", color:C.textPrimary }}>U'(t) — Razón de Cambio Instantánea</p>
              <p style={{ fontSize:9, color:C.green, margin:0 }}>U'(t) = −3t² + 18t + 48</p>
            </div>
            <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:tasa>=umbral?"rgba(240,180,41,0.12)":"rgba(0,229,160,0.1)", border:`0.5px solid ${tasa>=umbral?"rgba(240,180,41,0.4)":"rgba(0,229,160,0.35)"}`, color:tasa>=umbral?C.amber:C.green }}>
              {tasa>=umbral?"⚡ ALERTA":"DERIVADA"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={CHART_DATA} margin={{top:5,right:5,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gDU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,229,160,0.07)"/>
              <XAxis dataKey="t" stroke={C.textMuted} tick={{fontSize:9,fontFamily:"Courier New",fill:C.textMuted}} tickLine={false}/>
              <YAxis stroke={C.textMuted} tick={{fontSize:9,fontFamily:"Courier New",fill:C.textMuted}} tickLine={false}/>
              <Tooltip content={<CustomTooltip isDerivada={true} umbral={umbral} capacidad={capacidad}/>}/>
              <ReferenceLine y={umbral} stroke={C.amber} strokeDasharray="4 3" strokeWidth={1} label={{value:`Umbral ${umbral}`,fill:C.amber,fontSize:9,fontFamily:"Courier New"}}/>
              <ReferenceLine x={t} stroke={C.purple} strokeDasharray="3 3" strokeWidth={1.5}/>
              <Area type="monotone" dataKey="tasa" stroke={C.green} strokeWidth={2} fill="url(#gDU)" dot={false} activeDot={{r:4,fill:C.green,stroke:C.bg}}/>
              {/* Punto animado que recorre la curva de la derivada — muestra U'(t) exacto */}
              <ReferenceDot x={t} y={tasa} r={6} fill={tasa >= umbral ? C.amber : C.green} stroke={C.bg} strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PANEL INFERIOR */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.7fr", gap:10 }}>
        <div style={card()}>
          <p style={lbl({marginBottom:6})}>Panel de auto-scaling</p>
          <div style={{ display:"flex", gap:8, alignItems:"center", margin:"12px 0 10px" }}>
            {status.servers.map((active,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <div style={{ width:50, height:50, borderRadius:10, background:active?`${status.color}1A`:"rgba(255,255,255,0.03)", border:`1px solid ${active?status.color+"70":"rgba(255,255,255,0.08)"}`, color:active?status.color:"rgba(160,180,230,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:active?`0 0 14px ${status.color}30`:"none", transition:"all 0.4s ease" }}>
                    <i className="ti ti-server" aria-hidden="true"></i>
                  </div>
                  <span style={{ fontSize:9, color:active?C.textSec:C.textMuted }}>SRV-0{i+1}</span>
                </div>
                {i<2 && <div style={{ height:2, width:14, marginBottom:16, borderRadius:1, background:active&&status.servers[i+1]?`${status.color}60`:C.border }}/>}
              </div>
            ))}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, padding:"4px 10px", borderRadius:5, background:`${status.color}15`, border:`0.5px solid ${status.color}50`, color:status.color }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:status.color, display:"inline-block" }}></span>
            {status.icon} {status.label}
          </div>
          <div style={{ marginTop:10, paddingTop:9, borderTop:`0.5px solid ${C.border}` }}>
            {[
              ["U(t) actual",    `${usuarios.toLocaleString()} usuarios`, C.cyan],
              ["U'(t) actual",   `${tasa} usr/hr`,                        tasa>=umbral?C.amber:C.green],
              ["Umbral activo",  `${umbral} usr/hr`,                       C.amber],
              ["Capacidad base", `${capacidad} usuarios`,                  C.purple],
            ].map(([k,v,c]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:10, padding:"3px 0" }}>
                <span style={{color:C.textMuted}}>{k}</span>
                <span style={{color:c,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card()}>
          <p style={lbl({marginBottom:9,paddingBottom:8,borderBottom:`0.5px solid ${C.border}`})}>Interpretación de la derivada — para el informe</p>
          <div style={{ background:"rgba(0,220,255,0.07)", border:`0.5px solid rgba(0,220,255,0.3)`, borderLeft:`2px solid ${C.cyan}`, borderRadius:5, padding:"9px 11px", marginBottom:11, fontSize:11, lineHeight:1.7, color:"rgba(0,220,255,0.72)" }}>
            U'(t) = −3t² + 18t + 48<br/>
            <span style={{color:C.cyan,fontWeight:600}}>U'({t.toFixed(1)}) = {calcStr} = {tasa} usr/hr</span>
          </div>
          <p style={{ fontSize:11, color:C.textSec, lineHeight:1.8, margin:0 }}>{interpMsg}</p>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ marginTop:14, paddingTop:10, borderTop:`0.5px solid ${C.border}`, display:"flex", justifyContent:"space-between", fontSize:9, color:C.textMuted }}>
        <span>CHRONOS-DEV © 2026 · Software Development & AI Integration · Guatemala City, GT</span>
        <span>U(t) = −t³+9t²+48t+200  ·  U'(t) = −3t²+18t+48</span>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
