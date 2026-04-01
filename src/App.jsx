import { useState, useEffect, useCallback, useRef } from "react";

// ═══ SUPABASE CONFIG ═══
const SB = "https://iqccddabidfcrsbdehiq.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY2NkZGFiaWRmY3JzYmRlaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODQyMDQsImV4cCI6MjA4NzY2MDIwNH0.tKb-l9TnlSDVsG7zHUJTdd5kt5vWCYKtvQYwVjz0xos";
const H = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };
const rpc = async (fn, params) => {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: "POST", headers: H, body: JSON.stringify(params) });
  return r.ok ? r.json() : null;
};
const get = async (t, p = "") => { try { const r = await fetch(`${SB}/rest/v1/${t}${p}`, { headers: { ...H, Prefer: "return=representation" } }); return r.ok ? r.json() : [] } catch { return [] } };
const post = async (t, d) => { try { const r = await fetch(`${SB}/rest/v1/${t}`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(d) }); return r.ok ? r.json() : null } catch { return null } };
const patch = async (t, m, d) => { try { const r = await fetch(`${SB}/rest/v1/${t}${m}`, { method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(d) }); return r.ok ? r.json() : null } catch { return null } };
const rm = async (t, m) => { try { await fetch(`${SB}/rest/v1/${t}${m}`, { method: "DELETE", headers: H }) } catch {} };
const upFile = async (p, f) => { try { const r = await fetch(`${SB}/storage/v1/object/account-docs/${p}`, { method: "POST", headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": f.type }, body: f }); return r.ok } catch { return false } };
const rmFile = async p => { try { await fetch(`${SB}/storage/v1/object/account-docs/${p}`, { method: "DELETE", headers: { apikey: SK, Authorization: `Bearer ${SK}` } }) } catch {} };
const fileUrl = p => `${SB}/storage/v1/object/public/account-docs/${p}`;

// ═══ THEME ═══
const F = "'Share Tech Mono','Courier New',monospace";
const C = { bg:"#0a0f0a", p:"#111a0f", bd:"#2a3a22", g:"#d4a841", m:"#6b7a5e", d:"#4a5a42", t:"#c8cfc8", s:"#8a9a82", dk:"#0f1a0d", gn:"#4ade80", yl:"#fbbf24", rd:"#ef4444", bl:"#60a5fa" };

const DS = {
  companyName:"BBCSS", tagline:"BLACK BELT COMMANDOS · ACCOUNT MANAGEMENT SYSTEM",
  serviceTypes:["Security Services","Facility Management","Housekeeping","Event Security","Manpower Supply"],
  complianceItems:[{key:"psara",label:"PSARA License"},{key:"labour",label:"Labour License"},{key:"esiPf",label:"ESI/PF Registration"},{key:"clra",label:"CLRA Returns"}],
  healthStatuses:[{key:"Green",color:C.gn,meaning:"All good"},{key:"Yellow",color:C.yl,meaning:"Needs attention"},{key:"Red",color:C.rd,meaning:"Critical"}],
  accountStatuses:["Active","Paused","Terminated","Onboarding"],
  billingCycles:["Monthly","Quarterly","Half-Yearly","Annually"],
  paymentTermsPresets:[15,30,45,60,90],
  staffRoles:[{key:"guard",label:"Guard"},{key:"supervisor",label:"Supervisor"},{key:"gunman",label:"Gunman"},{key:"housekeeper",label:"Housekeeper"},{key:"driver",label:"Driver"}],
  alertThresholds:{renewalDays:90,overduePaymentDays:45,staffShortfallPct:10},
  currency:{symbol:"₹",locale:"en-IN",lakhFormat:true},
  invoiceDayDefault:1,defaultPaymentTerms:30,defaultBillingCycle:"Monthly",defaultHealth:"Green",defaultStatus:"Active",
  customFields:[],notesTemplate:"",showBranding:true,
  renewalStatuses:["Pending","In Discussion","Rate Revision","Renewed","Lost"],
};

// ═══ UTILS ═══
const $f = (a,cu) => { const s=cu?.symbol||"₹"; if(cu?.lakhFormat!==false){if(Math.abs(a)>=1e7)return`${s}${(a/1e7).toFixed(2)}Cr`;if(Math.abs(a)>=1e5)return`${s}${(a/1e5).toFixed(1)}L`;if(Math.abs(a)>=1e3)return`${s}${(a/1e3).toFixed(1)}K`;}return`${s}${a.toLocaleString(cu?.locale||"en-IN")}`};
const $d = d => {if(!d)return"—";return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})};
const dTo = d => Math.ceil((new Date(d)-new Date())/864e5);
const dSn = d => Math.ceil((new Date()-new Date(d))/864e5);
const hC = (h,hs) => hs.find(x=>x.key===h)?.color||"#888";
const tS = (sb,t) => Object.values(sb||{}).reduce((s,v)=>s+(v[t]||0),0);

// ═══ STYLED BLOCKS ═══
const inp = {background:C.p,border:`1px solid ${C.bd}`,color:C.t,padding:"8px 12px",fontSize:12,fontFamily:F,width:"100%",boxSizing:"border-box",outline:"none"};
const lbl = {fontSize:10,color:C.m,letterSpacing:1,textTransform:"uppercase",marginBottom:4,display:"block"};
const sec = {background:C.p,border:`1px solid ${C.bd}`,padding:18,marginBottom:14};
const secT = {fontSize:11,color:C.g,letterSpacing:2,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.bd}`};
const pill = c => ({display:"inline-block",background:c+"22",color:c,padding:"2px 8px",fontSize:10,borderRadius:2,fontWeight:700,letterSpacing:1});
const dot = c => ({display:"inline-block",width:8,height:8,borderRadius:"50%",background:c,marginRight:6,verticalAlign:"middle",flexShrink:0});
const nb = a => ({background:a?C.g:"transparent",color:a?C.bg:C.m,border:`1px solid ${a?C.g:C.bd}`,padding:"7px 14px",fontSize:11,letterSpacing:1,cursor:"pointer",fontFamily:F});
const bt = v => ({background:v==="p"?C.g:v==="d"?"#7f1d1d":v==="s"?"#1a2418":"transparent",color:v==="p"?C.bg:v==="d"?"#fca5a5":v==="s"?C.g:C.m,border:`1px solid ${v==="p"?C.g:v==="d"?"#991b1b":C.bd}`,padding:"7px 14px",fontSize:11,letterSpacing:1,cursor:"pointer",fontFamily:F,fontWeight:700});
const sb = v => ({...bt(v),padding:"4px 10px",fontSize:10});
const th = {background:"#1a2418",color:C.g,padding:"8px 10px",textAlign:"left",fontSize:10,letterSpacing:2,textTransform:"uppercase",borderBottom:`2px solid ${C.bd}`,whiteSpace:"nowrap"};
const td = {padding:"8px 10px",borderBottom:`1px solid #1a2418`,verticalAlign:"middle",fontSize:12};
const dr = {display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.bg}`};

const J3S = () => <div style={{textAlign:"center",padding:"14px 0",borderTop:`1px solid ${C.bd}`,marginTop:24,fontSize:10,letterSpacing:3,color:C.d}}>BUILT FOR THE <span style={{color:C.g,fontWeight:700}}>J3S OFFICE</span></div>;

function PayIn({onRec}){const[a,setA]=useState(""),[r,setR]=useState(""),[n,setN]=useState("");return<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><input style={{...inp,flex:1,minWidth:80}} placeholder="Amount" value={a} onChange={e=>setA(e.target.value)} type="number"/><input style={{...inp,width:100}} placeholder="Ref" value={r} onChange={e=>setR(e.target.value)}/><input style={{...inp,width:100}} placeholder="Note" value={n} onChange={e=>setN(e.target.value)}/><button style={bt("p")} onClick={()=>{if(a>0){onRec(Number(a),r,n);setA("");setR("");setN("")}}}>RECORD</button></div>}

function DocUp({docs,onUp,onRm}){const r=useRef();return<div><div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>{docs.map(d=><div key={d.id} style={{background:"#1a2418",border:`1px solid ${C.bd}`,padding:"6px 10px",fontSize:11,display:"flex",alignItems:"center",gap:8}}><span style={{color:C.g,cursor:"pointer"}} onClick={()=>window.open(fileUrl(d.storage_path),"_blank")}>📄 {d.file_name}</span><span style={{color:C.d,fontSize:10}}>{(d.file_size/1024).toFixed(0)}KB</span><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>onRm(d.id,d.storage_path)}>×</span></div>)}{docs.length===0&&<span style={{color:C.d,fontSize:11}}>No documents</span>}</div><input ref={r} type="file" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){onUp(e.target.files[0]);e.target.value=""}}} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"/><button style={sb("s")} onClick={()=>r.current.click()}>📎 UPLOAD</button></div>}

function InEd({value,onChange,style:st}){const[ed,setEd]=useState(false),[v,setV]=useState(value),r=useRef();useEffect(()=>{if(ed&&r.current)r.current.focus()},[ed]);if(!ed)return<span style={{...st,cursor:"pointer",borderBottom:`1px dashed ${C.bd}`}} onClick={()=>{setV(value);setEd(true)}}>{value}</span>;return<input ref={r} style={{...inp,...st,width:"auto",minWidth:50}} value={v} onChange={e=>setV(e.target.value)} onBlur={()=>{onChange(v);setEd(false)}} onKeyDown={e=>{if(e.key==="Enter"){onChange(v);setEd(false)}if(e.key==="Escape")setEd(false)}}/>}

const mkCSV = (accs,s) => {const rl=s.staffRoles.map(r=>r.key),cm=s.complianceItems.map(c=>c.key);const hd=["ID","Code","Client","Location","Type","Status","Health","Value","Billing","Terms","Start","End","Renewal","Pending","TotReq","TotDep",...rl.flatMap(r=>[`${r}_R`,`${r}_D`]),...cm.map(c=>`C_${c}`),"Paid","Notes"];const rows=accs.map(a=>[a.account_id,a.account_code||"",`"${a.client}"`,`"${a.location||""}"`,a.service_type,a.status,a.health,a.contract_value,a.billing_cycle,a.payment_terms,a.contract_start,a.contract_end,a.renewal_status||"",a.pending_amount,tS(a.staff_breakdown,"required"),tS(a.staff_breakdown,"deployed"),...rl.flatMap(r=>[a.staff_breakdown?.[r]?.required||0,a.staff_breakdown?.[r]?.deployed||0]),...cm.map(c=>a.compliance_status?.[c]?"Y":"N"),(a._p||[]).reduce((s,p)=>s+Number(p.amount),0),`"${(a.notes||"").replace(/"/g,'""')}"`].join(","));return hd.join(",")+"\n"+rows.join("\n")};

// ═══════════════════════
// MAIN APP
// ═══════════════════════
export default function App(){
  const[user,setUser]=useState(null);
  const[lErr,setLE]=useState("");
  const[lU,setLU]=useState("");
  const[lP,setLP]=useState("");
  const[lding,setLding]=useState(false);

  const[accs,setAccs]=useState([]);
  const[stg,setStg]=useState(DS);
  const[stgId,setStgId]=useState(null);
  const[loaded,setLoaded]=useState(false);
  const[syncing,setSyncing]=useState(false);
  const[view,setView]=useState("dashboard");
  const[selId,setSelId]=useState(null);
  const[showFrm,setSF]=useState(false);
  const[fd,setFD]=useState(null);
  const[eMode,setEM]=useState(false);
  const[flt,setFlt]=useState("All");
  const[srch,setSrch]=useState("");
  const[sTab,setSTab]=useState("general");
  const[toast,setToast]=useState(null);
  const[users,setUsers]=useState([]);
  const[showUF,setSUF]=useState(false);
  const[uf,setUF]=useState({username:"",password:"",full_name:"",role:"user"});

  const tw = m => {setToast(m);setTimeout(()=>setToast(null),2500)};
  const isA = user?.role==="admin";

  // ─── AUTH via RPC (server-side bcrypt) ───
  const doLogin = async () => {
    setLding(true);setLE("");
    const res = await rpc("acm_login",{p_username:lU,p_password:lP});
    if(res&&res.length>0){setUser(res[0])}
    else{setLE("Invalid credentials or account disabled")}
    setLding(false);
  };

  // ─── LOAD DATA ───
  const loadAll = useCallback(async()=>{
    try{
      setSyncing(true);
      const[ac,sa]=await Promise.all([get("accounts","?order=account_id.asc"),get("account_settings","?limit=1")]);
      const enr=await Promise.all(ac.map(async a=>{
        const[py,dc]=await Promise.all([get("account_payments",`?account_id=eq.${a.id}&order=payment_date.desc`),get("account_documents",`?account_id=eq.${a.id}&order=uploaded_at.desc`)]);
        return{...a,_p:py||[],_d:dc||[]};
      }));
      setAccs(enr);
      if(sa.length>0){setStg({...DS,...sa[0].settings_data});setStgId(sa[0].id)}
    }catch(e){console.error(e)}
    setSyncing(false);setLoaded(true);
  },[]);

  const loadUsers=async()=>{const u=await get("acm_users","?order=created_at.asc");setUsers(u)};
  useEffect(()=>{if(user){loadAll();if(user.role==="admin")loadUsers()}},[user,loadAll]);

  // ─── SETTINGS ───
  const uS=async p=>{const u={...stg,...p};setStg(u);if(stgId)await patch("account_settings",`?id=eq.${stgId}`,{settings_data:u});tw("Saved")};

  // ─── ACCOUNT CRUD ───
  const mkE=()=>({account_id:"",account_code:"",client:"",location:"",service_type:stg.serviceTypes[0]||"",contract_value:0,billing_cycle:stg.defaultBillingCycle,contract_start:"",contract_end:"",invoice_day:stg.invoiceDayDefault,payment_terms:stg.defaultPaymentTerms,status:stg.defaultStatus,health:stg.defaultHealth,staff_breakdown:Object.fromEntries(stg.staffRoles.map(r=>[r.key,{required:0,deployed:0}])),pending_amount:0,compliance_status:Object.fromEntries(stg.complianceItems.map(c=>[c.key,false])),contacts:[{name:"",phone:"",role:"POC"}],notes:stg.notesTemplate,renewal_status:stg.renewalStatuses?.[0]||"Pending",rate_revision:0,custom_data:{},_p:[],_d:[]});

  const saveAcc=async()=>{if(!fd)return;setSyncing(true);
    if(eMode){const{_p,_d,id,created_at,updated_at,...rest}=fd;await patch("accounts",`?id=eq.${fd.id}`,rest)}
    else{const nums=accs.map(a=>parseInt(a.account_id.replace("ACC-",""))||0);const nx=Math.max(0,...nums)+1;const{_p,_d,id,...rest}=fd;await post("accounts",{...rest,account_id:`ACC-${String(nx).padStart(3,"0")}`})}
    await loadAll();setSF(false);setEM(false);setSyncing(false);tw(eMode?"Updated":"Created")};
  const delAcc=async id=>{setSyncing(true);await rm("accounts",`?id=eq.${id}`);await loadAll();setSelId(null);setView("dashboard");setSyncing(false);tw("Deleted")};
  const updA=async(id,p)=>{await patch("accounts",`?id=eq.${id}`,p);setAccs(prev=>prev.map(a=>a.id===id?{...a,...p}:a))};
  const recPay=async(uid,amt,ref,note)=>{setSyncing(true);await post("account_payments",{account_id:uid,payment_date:new Date().toISOString().split("T")[0],amount:amt,reference:ref,note});const ac=accs.find(a=>a.id===uid);if(ac)await patch("accounts",`?id=eq.${uid}`,{pending_amount:Math.max(0,Number(ac.pending_amount)-amt)});await loadAll();setSyncing(false);tw(`${stg.currency.symbol}${amt.toLocaleString()} recorded`)};
  const upDoc=async(uid,f)=>{if(f.size>5e6){tw("Max 5MB");return}setSyncing(true);const p=`${uid}/${Date.now()}_${f.name}`;const ok=await upFile(p,f);if(ok){await post("account_documents",{account_id:uid,file_name:f.name,file_type:f.type,file_size:f.size,storage_path:p});await loadAll();tw("Uploaded")}else tw("Failed");setSyncing(false)};
  const rmDoc=async(did,sp)=>{setSyncing(true);await rmFile(sp);await rm("account_documents",`?id=eq.${did}`);await loadAll();setSyncing(false);tw("Removed")};

  // ─── USER MGMT via RPC ───
  const createUser=async()=>{if(!uf.username||!uf.password){tw("Username & password required");return}
    const res=await rpc("acm_create_user",{p_username:uf.username,p_password:uf.password,p_full_name:uf.full_name,p_role:uf.role});
    if(res&&res.length>0){await loadUsers();setSUF(false);setUF({username:"",password:"",full_name:"",role:"user"});tw("User created")}else tw("Failed - username may exist")};
  const toggleUser=async(id,active)=>{await patch("acm_users",`?id=eq.${id}`,{is_active:!active});await loadUsers();tw(active?"Deactivated":"Activated")};
  const changeRole=async(id,role)=>{await patch("acm_users",`?id=eq.${id}`,{role});await loadUsers();tw("Role updated")};

  // ─── DERIVED ───
  const sel=accs.find(a=>a.id===selId);
  const fil=accs.filter(a=>{const mf=flt==="All"||a.health===flt||a.status===flt;const ms=a.client.toLowerCase().includes(srch.toLowerCase())||(a.location||"").toLowerCase().includes(srch.toLowerCase())||(a.account_code||"").toLowerCase().includes(srch.toLowerCase());return mf&&ms});
  const totCV=accs.reduce((s,a)=>s+Number(a.contract_value),0);
  const totP=accs.reduce((s,a)=>s+Number(a.pending_amount),0);
  const totR=accs.reduce((s,a)=>s+tS(a.staff_breakdown,"required"),0);
  const totD=accs.reduce((s,a)=>s+tS(a.staff_breakdown,"deployed"),0);
  const renS=accs.filter(a=>{const d=dTo(a.contract_end);return d<=stg.alertThresholds.renewalDays&&d>0}).length;
  const cGap=accs.filter(a=>Object.values(a.compliance_status||{}).some(v=>!v)).length;
  const totCol=accs.reduce((s,a)=>s+(a._p||[]).reduce((ps,p)=>ps+Number(p.amount),0),0);
  const totBil=totCol+totP;
  const cR=totBil>0?(totCol/totBil)*100:100;
  const actA=accs.filter(a=>a.status==="Active");
  const dso=actA.length>0?actA.reduce((s,a)=>{if(!a._p?.length)return s+a.payment_terms;return s+dSn(a._p[0].payment_date)},0)/actA.length:0;
  const ag={c:0,d3:0,d6:0,o9:0};
  accs.forEach(a=>{if(Number(a.pending_amount)<=0)return;const lp=a._p?.[0]?.payment_date||a.contract_start;const d=dSn(lp);if(d<=30)ag.c+=Number(a.pending_amount);else if(d<=60)ag.d3+=Number(a.pending_amount);else if(d<=90)ag.d6+=Number(a.pending_amount);else ag.o9+=Number(a.pending_amount)});
  const xCSV=()=>{const c=mkCSV(accs,stg);const b=new Blob([c],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`bbcss_${new Date().toISOString().split("T")[0]}.csv`;a.click();tw("Exported")};

  // ═══ LOGIN SCREEN ═══
  if(!user)return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{border:`2px solid ${C.g}`,background:C.dk,padding:40,width:340,textAlign:"center",animation:"fadeIn .4s ease-out"}}>
        <div style={{fontSize:24,fontWeight:700,color:C.g,letterSpacing:6,marginBottom:4}}>BBCSS</div>
        <div style={{fontSize:9,color:C.m,letterSpacing:3,marginBottom:6}}>ACCOUNT MANAGEMENT SYSTEM</div>
        <div style={{fontSize:9,color:C.d,letterSpacing:2,marginBottom:30}}>BUILT FOR THE <span style={{color:C.g}}>J3S OFFICE</span></div>
        <div style={{marginBottom:14}}><input style={{...inp,textAlign:"center",fontSize:13}} placeholder="USERNAME" value={lU} onChange={e=>setLU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
        <div style={{marginBottom:14}}><input style={{...inp,textAlign:"center",fontSize:13}} placeholder="PASSWORD" type="password" value={lP} onChange={e=>setLP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
        {lErr&&<div style={{color:C.rd,fontSize:11,marginBottom:10}}>{lErr}</div>}
        <button style={{...bt("p"),width:"100%",fontSize:13,padding:"10px 0"}} onClick={doLogin} disabled={lding}>{lding?"AUTHENTICATING...":"LOGIN"}</button>
      </div>
    </div>);

  if(!loaded)return<div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.g,fontFamily:F,flexDirection:"column",gap:12}}><link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style><div style={{animation:"pulse 1.5s infinite",fontSize:14,letterSpacing:3}}>LOADING SYSTEMS...</div><div style={{fontSize:10,color:C.d,letterSpacing:2}}>BUILT FOR THE J3S OFFICE</div></div>;

  // ═══ ANALYTICS ═══
  const Analytics=()=>{
    const sbr={};stg.staffRoles.forEach(r=>{sbr[r.key]={req:0,dep:0,label:r.label}});accs.forEach(a=>Object.entries(a.staff_breakdown||{}).forEach(([k,v])=>{if(sbr[k]){sbr[k].req+=v.required||0;sbr[k].dep+=v.deployed||0}}));
    const mx=Math.max(1,...Object.values(sbr).map(v=>v.req));const at=ag.c+ag.d3+ag.d6+ag.o9;
    return<><div style={{...sec,borderColor:C.g}}><div style={secT}>📊 COLLECTION HEALTH</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:16}}>
        {[{l:"Collection Rate",v:`${cR.toFixed(1)}%`,c:cR>80?C.gn:cR>60?C.yl:C.rd},{l:"Avg DSO",v:`${dso.toFixed(0)}d`,c:dso<45?C.gn:dso<60?C.yl:C.rd},{l:"Receivables",v:$f(totP,stg.currency),c:totP>0?C.yl:C.gn},{l:"Collected",v:$f(totCol,stg.currency),c:C.g}].map((x,i)=><div key={i} style={{background:C.bg,padding:12,textAlign:"center"}}><div style={{fontSize:10,color:C.m}}>{x.l}</div><div style={{fontSize:22,fontWeight:700,color:x.c,marginTop:4}}>{x.v}</div></div>)}
      </div>
      <div style={{fontSize:11,color:C.g,letterSpacing:2,marginBottom:8}}>AGING</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[{l:"0-30d",v:ag.c,c:C.gn},{l:"31-60d",v:ag.d3,c:C.yl},{l:"61-90d",v:ag.d6,c:"#f97316"},{l:"90+d",v:ag.o9,c:C.rd}].map((x,i)=><div key={i} style={{background:C.bg,padding:10}}><div style={{fontSize:10,color:C.m}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c}}>{$f(x.v,stg.currency)}</div>{at>0&&<div style={{height:4,background:"#1a2418",borderRadius:2,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:`${(x.v/at)*100}%`,background:x.c,borderRadius:2}}/></div>}</div>)}
      </div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={sec}><div style={secT}>👥 STAFF BY ROLE</div>
        {Object.entries(sbr).filter(([,v])=>v.req>0).map(([k,v])=><div key={k} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:C.t}}>{v.label}</span><span><span style={{color:v.dep>=v.req?C.gn:C.yl}}>{v.dep}</span><span style={{color:C.d}}>/{v.req}</span></span></div><div style={{height:8,background:"#1a2418",borderRadius:4,overflow:"hidden",position:"relative"}}><div style={{position:"absolute",height:"100%",width:`${(v.req/mx)*100}%`,background:C.bd,borderRadius:4}}/><div style={{position:"absolute",height:"100%",width:`${(v.dep/mx)*100}%`,background:v.dep>=v.req?C.gn:C.yl,borderRadius:4}}/></div></div>)}
      </div>
      <div style={sec}><div style={secT}>🔄 RENEWAL PIPELINE</div>
        {accs.filter(a=>a.status==="Active").sort((a,b)=>dTo(a.contract_end)-dTo(b.contract_end)).slice(0,8).map(a=>{const d=dTo(a.contract_end);return<div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bg}`,cursor:"pointer"}} onClick={()=>{setSelId(a.id);setView("detail")}}><span style={dot(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}/><span style={{flex:1,fontSize:11,color:C.t}}>{a.client}</span><span style={pill(a.renewal_status==="Renewed"?C.gn:a.renewal_status==="Lost"?C.rd:C.yl)}>{a.renewal_status||"Pending"}</span><span style={{fontSize:10,color:d<=30?C.rd:C.m,fontWeight:700}}>{d}d</span></div>})}
      </div>
    </div>
    <div style={{...sec,marginTop:14}}><div style={secT}>📈 EFFECTIVENESS</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
        {[{l:"Staffing",sc:totR>0?(totD/totR)*100:100},{l:"Collection",sc:cR},{l:"Compliance",sc:accs.length>0?(accs.length-cGap)/accs.length*100:100},{l:"Renewal",sc:actA.length>0?(actA.length-renS)/actA.length*100:100}].map((x,i)=>{const co=x.sc>=80?C.gn:x.sc>=60?C.yl:C.rd;return<div key={i} style={{background:C.bg,padding:14}}><div style={{fontSize:10,color:C.m}}>{x.l}</div><div style={{fontSize:26,fontWeight:700,color:co,margin:"4px 0"}}>{x.sc.toFixed(1)}%</div><div style={{height:4,background:"#1a2418",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,x.sc)}%`,background:co,borderRadius:2}}/></div></div>})}
      </div></div>
    <J3S/></>;
  };

  // ═══ DASHBOARD ═══
  const Dash=()=><>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:14,marginBottom:20}}>
      {[{l:"Accounts",v:actA.length,s:`${accs.length} total`,c:C.g},{l:"Monthly",v:$f(totCV/12,stg.currency),s:`ACV ${$f(totCV,stg.currency)}`,c:C.g},{l:"Receivables",v:$f(totP,stg.currency),s:`${cR.toFixed(0)}% collected`,c:totP>0?C.yl:C.gn},{l:"Staff",v:`${totD}/${totR}`,s:totD<totR?`${totR-totD} short`:"Full",c:totD<totR?C.yl:C.gn},{l:"DSO",v:`${dso.toFixed(0)}d`,s:dso<45?"Healthy":"Review",c:dso<45?C.gn:C.yl}].map((x,i)=><div key={i} style={{background:C.p,border:`1px solid ${C.bd}`,padding:14}}><div style={{fontSize:10,color:C.m,letterSpacing:2,textTransform:"uppercase"}}>{x.l}</div><div style={{fontSize:24,fontWeight:700,color:x.c}}>{x.v}</div><div style={{fontSize:10,color:C.d,marginTop:2}}>{x.s}</div></div>)}
    </div>
    {(renS>0||cGap>0||ag.o9>0)&&<div style={{...sec,borderColor:"#7f5a08",marginBottom:16}}><div style={{...secT,color:C.yl,borderColor:"#7f5a08"}}>⚠ ALERTS</div>{renS>0&&<div style={{color:C.yl,fontSize:12,marginBottom:4}}>• {renS} contract(s) within {stg.alertThresholds.renewalDays}d</div>}{cGap>0&&<div style={{color:C.rd,fontSize:12,marginBottom:4}}>• {cGap} compliance gaps</div>}{ag.o9>0&&<div style={{color:C.rd,fontSize:12}}>• {$f(ag.o9,stg.currency)} overdue 90+d</div>}</div>}
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <input style={{...inp,width:200,flexShrink:0}} placeholder="Search client/code..." value={srch} onChange={e=>setSrch(e.target.value)}/>
      {["All",...stg.healthStatuses.map(h=>h.key),...stg.accountStatuses].map(f=><button key={f} style={nb(flt===f)} onClick={()=>setFlt(f)}>{f}</button>)}
      <div style={{flex:1}}/>
      <button style={sb("s")} onClick={xCSV}>📥 CSV</button>
      <button style={sb("s")} onClick={loadAll}>🔄</button>
      {isA&&<button style={bt("p")} onClick={()=>{setFD(mkE());setEM(false);setSF(true)}}>+ NEW</button>}
    </div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Client","Code","Health","Contract","Staff","Pending","Renewal","Comp"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
      {fil.map(a=>{const d=dTo(a.contract_end),sr=tS(a.staff_breakdown,"required"),sd=tS(a.staff_breakdown,"deployed"),ok=Object.values(a.compliance_status||{}).every(Boolean);
        return<tr key={a.id} style={{cursor:"pointer"}} onClick={()=>{setSelId(a.id);setView("detail")}} onMouseEnter={e=>e.currentTarget.style.background="#1a2418"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={td}><div style={{fontWeight:700}}>{a.client}</div><div style={{fontSize:10,color:C.d}}>{a.account_id} · {a.location}</div></td>
          <td style={{...td,color:C.bl,fontWeight:600}}>{a.account_code||"—"}</td>
          <td style={td}><span style={dot(hC(a.health,stg.healthStatuses))}/>{a.health}</td>
          <td style={{...td,color:C.g,fontWeight:600}}>{$f(Number(a.contract_value),stg.currency)}/yr</td>
          <td style={td}><span style={{color:sd<sr?C.yl:C.gn}}>{sd}</span><span style={{color:C.d}}>/{sr}</span></td>
          <td style={{...td,color:Number(a.pending_amount)>0?C.yl:C.gn}}>{$f(Number(a.pending_amount),stg.currency)}</td>
          <td style={td}><span style={pill(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}>{d}d</span></td>
          <td style={td}><span style={pill(ok?C.gn:C.rd)}>{ok?"OK":"GAPS"}</span></td>
        </tr>})}
      {fil.length===0&&<tr><td colSpan={8} style={{...td,textAlign:"center",color:C.d,padding:40}}>No accounts</td></tr>}
    </tbody></table></div>
    <J3S/></>;

  // ═══ DETAIL ═══
  const Det=()=>{if(!sel)return null;const a=sel,d=dTo(a.contract_end),sr=tS(a.staff_breakdown,"required"),sd=tS(a.staff_breakdown,"deployed");
    return<>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <button style={bt("g")} onClick={()=>{setView("dashboard");setSelId(null)}}>← BACK</button>
        <div><div style={{fontSize:16,fontWeight:700,color:C.g,letterSpacing:2}}>{a.client}{a.account_code&&<span style={{color:C.bl,fontSize:12,marginLeft:8}}>[{a.account_code}]</span>}</div><div style={{fontSize:11,color:C.m}}>{a.account_id} · {a.location} · {a.service_type}</div></div>
        <div style={{flex:1}}/>
        {isA&&stg.healthStatuses.map(h=><button key={h.key} style={{...nb(a.health===h.key),fontSize:10,padding:"4px 10px"}} onClick={()=>updA(a.id,{health:h.key})}><span style={dot(h.color)}/>{h.key}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginBottom:14}}>
        <div style={sec}><div style={secT}>CONTRACT</div>
          {[["Value",$f(Number(a.contract_value),stg.currency)+"/yr"],["Monthly",$f(Number(a.contract_value)/12,stg.currency)],["Code",a.account_code||"—"],["Billing",a.billing_cycle],["Terms",a.payment_terms+"d"],["Period",`${$d(a.contract_start)} → ${$d(a.contract_end)}`],["Status",a.status]].map(([l,v])=><div key={l} style={dr}><span style={{color:C.m,fontSize:11}}>{l}</span><span style={{color:C.t,fontSize:12,fontWeight:600}}>{v}</span></div>)}
          <div style={{marginTop:10,fontSize:11,color:C.g,letterSpacing:2}}>RENEWAL</div>
          <div style={{display:"flex",gap:10,alignItems:"center",marginTop:6,flexWrap:"wrap"}}>
            <span style={pill(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}>{d} DAYS</span>
            {isA?<select style={{...inp,width:140}} value={a.renewal_status||""} onChange={e=>updA(a.id,{renewal_status:e.target.value})}>{(stg.renewalStatuses||[]).map(s=><option key={s}>{s}</option>)}</select>:<span style={pill(C.bl)}>{a.renewal_status}</span>}
            {isA&&<div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:C.m}}>REV%</span><input style={{...inp,width:60}} type="number" value={a.rate_revision||0} onChange={e=>updA(a.id,{rate_revision:Number(e.target.value)})}/></div>}
          </div>
          {Number(a.rate_revision)>0&&<div style={{fontSize:11,color:C.bl,marginTop:6}}>Revised: {$f(Number(a.contract_value)*(1+Number(a.rate_revision)/100),stg.currency)}/yr</div>}
        </div>
        <div style={sec}><div style={secT}>COLLECTION HEALTH</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{background:C.bg,padding:10,textAlign:"center"}}><div style={{fontSize:10,color:C.m}}>RECEIVABLE</div><div style={{fontSize:22,fontWeight:700,color:Number(a.pending_amount)>0?C.yl:C.gn}}>{$f(Number(a.pending_amount),stg.currency)}</div></div>
            <div style={{background:C.bg,padding:10,textAlign:"center"}}><div style={{fontSize:10,color:C.m}}>COLLECTED</div><div style={{fontSize:22,fontWeight:700,color:C.gn}}>{$f((a._p||[]).reduce((s,p)=>s+Number(p.amount),0),stg.currency)}</div></div>
          </div>
          {isA&&<PayIn onRec={(am,rf,n)=>recPay(a.id,am,rf,n)}/>}
          {a._p?.length>0&&<div style={{marginTop:10,maxHeight:140,overflowY:"auto"}}><div style={{fontSize:10,color:C.g,letterSpacing:2,marginBottom:6}}>HISTORY</div>{a._p.map((p,i)=><div key={i} style={{display:"flex",gap:8,fontSize:11,padding:"4px 0",borderBottom:`1px solid ${C.bg}`}}><span style={{color:C.m,width:80}}>{$d(p.payment_date)}</span><span style={{color:C.gn,fontWeight:700,width:70}}>{$f(Number(p.amount),stg.currency)}</span><span style={{color:C.d}}>{p.reference}</span><span style={{color:C.d,flex:1}}>{p.note}</span></div>)}</div>}
        </div>
      </div>
      <div style={sec}><div style={secT}>👥 STAFF BY ROLE</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:10}}>
          {stg.staffRoles.map(r=>{const v=a.staff_breakdown?.[r.key]||{required:0,deployed:0};return<div key={r.key} style={{background:C.bg,padding:10}}><div style={{fontSize:10,color:C.m,letterSpacing:1,marginBottom:6}}>{r.label.toUpperCase()}</div><div style={{display:"flex",gap:8}}><div><div style={{fontSize:9,color:C.d}}>REQ</div><div style={{fontSize:20,fontWeight:700,color:C.t}}>{v.required}</div></div><div><div style={{fontSize:9,color:C.d}}>DEP</div><div style={{fontSize:20,fontWeight:700,color:v.deployed>=v.required?C.gn:C.yl}}>{v.deployed}</div></div></div><div style={{height:4,background:"#1a2418",borderRadius:2,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,v.required>0?(v.deployed/v.required)*100:100)}%`,background:v.deployed>=v.required?C.gn:C.yl,borderRadius:2}}/></div></div>})}
        </div>
        <div style={{fontSize:12}}>Total: <span style={{color:sd>=sr?C.gn:C.yl,fontWeight:700}}>{sd}</span><span style={{color:C.d}}>/{sr}</span>{sr-sd>0&&<span style={{color:C.rd,marginLeft:8}}>Shortfall: {sr-sd}</span>}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={sec}><div style={secT}>COMPLIANCE</div>{stg.complianceItems.map(ci=><div key={ci.key} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.bg}`}}><span style={dot(a.compliance_status?.[ci.key]?C.gn:C.rd)}/><span style={{flex:1,fontSize:12}}>{ci.label}</span><span style={pill(a.compliance_status?.[ci.key]?C.gn:C.rd)}>{a.compliance_status?.[ci.key]?"VALID":"PENDING"}</span></div>)}</div>
        <div style={sec}><div style={secT}>📎 DOCUMENTS</div><DocUp docs={a._d||[]} onUp={f=>upDoc(a.id,f)} onRm={(did,sp)=>rmDoc(did,sp)}/></div>
      </div>
      <div style={sec}><div style={secT}>NOTES & CONTACTS</div><div style={{fontSize:12,color:C.s,marginBottom:10,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{a.notes||"—"}</div>{(a.contacts||[]).map((ct,i)=><div key={i} style={{display:"flex",gap:14,fontSize:12,color:C.m}}><span style={{color:C.g}}>{ct.role}</span><span>{ct.name}</span><span>{ct.phone}</span></div>)}</div>
      {isA&&<div style={{display:"flex",gap:8,marginTop:10}}><button style={bt("p")} onClick={()=>{setFD({...a});setEM(true);setSF(true)}}>EDIT</button><button style={bt("d")} onClick={()=>{if(confirm("Delete?"))delAcc(a.id)}}>DELETE</button></div>}
      <J3S/></>;
  };

  // ═══ USERS ═══
  const Usr=()=><div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:14,color:C.g,letterSpacing:2,fontWeight:700}}>USER MANAGEMENT</div><button style={bt("p")} onClick={()=>setSUF(true)}>+ NEW USER</button></div>
    <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Username","Name","Role","Active","Last Login","Actions"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
      {users.map(u=><tr key={u.id}><td style={td}><span style={{fontWeight:700}}>{u.username}</span></td><td style={td}>{u.full_name||"—"}</td><td style={td}><span style={pill(u.role==="admin"?C.g:C.bl)}>{u.role.toUpperCase()}</span></td><td style={td}><span style={dot(u.is_active?C.gn:C.rd)}/>{u.is_active?"Active":"Off"}</td><td style={{...td,fontSize:11,color:C.m}}>{u.last_login?$d(u.last_login):"Never"}</td>
        <td style={td}>{u.id!==user.id&&<div style={{display:"flex",gap:6}}><button style={sb(u.is_active?"d":"s")} onClick={()=>toggleUser(u.id,u.is_active)}>{u.is_active?"DISABLE":"ENABLE"}</button><select style={{...inp,width:80,padding:"2px 6px",fontSize:10}} value={u.role} onChange={e=>changeRole(u.id,e.target.value)}><option value="admin">Admin</option><option value="user">User</option></select></div>}</td></tr>)}
    </tbody></table>
    {showUF&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setSUF(false)}>
      <div style={{background:C.dk,border:`2px solid ${C.g}`,padding:24,width:360}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:14,fontWeight:700,color:C.g,letterSpacing:2,marginBottom:16}}>CREATE USER</div>
        <div style={{marginBottom:10}}><label style={lbl}>Username</label><input style={inp} value={uf.username} onChange={e=>setUF({...uf,username:e.target.value})}/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Password</label><input style={inp} type="password" value={uf.password} onChange={e=>setUF({...uf,password:e.target.value})}/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Full Name</label><input style={inp} value={uf.full_name} onChange={e=>setUF({...uf,full_name:e.target.value})}/></div>
        <div style={{marginBottom:14}}><label style={lbl}>Role</label><select style={inp} value={uf.role} onChange={e=>setUF({...uf,role:e.target.value})}><option value="user">User</option><option value="admin">Admin</option></select></div>
        <div style={{display:"flex",gap:8}}><button style={bt("p")} onClick={createUser}>CREATE</button><button style={bt("g")} onClick={()=>setSUF(false)}>CANCEL</button></div>
        <div style={{textAlign:"center",marginTop:14,fontSize:9,color:C.d,letterSpacing:2}}>BUILT FOR THE J3S OFFICE</div>
      </div>
    </div>}
    <J3S/>
  </div>;

  // ═══ SETTINGS ═══
  const Stg=()=><div>
    <div style={{display:"flex",gap:4,marginBottom:18,flexWrap:"wrap"}}>{[["general","General"],["services","Services"],["compliance","Compliance"],["health","Health"],["staff","Staff Roles"],["alerts","Alerts"],["billing","Billing"],["fields","Fields"],["data","Data"]].map(([k,l])=><button key={k} style={nb(sTab===k)} onClick={()=>setSTab(k)}>{l}</button>)}</div>
    {sTab==="general"&&<div style={sec}><div style={secT}>BRANDING</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label style={lbl}>Company Name</label><input style={inp} value={stg.companyName} onChange={e=>uS({companyName:e.target.value})}/></div><div><label style={lbl}>Tagline</label><input style={inp} value={stg.tagline} onChange={e=>uS({tagline:e.target.value})}/></div><div><label style={lbl}>Currency</label><input style={{...inp,width:80}} value={stg.currency.symbol} onChange={e=>uS({currency:{...stg.currency,symbol:e.target.value}})}/></div><div><label style={lbl}>Locale</label><input style={inp} value={stg.currency.locale} onChange={e=>uS({currency:{...stg.currency,locale:e.target.value}})}/></div></div></div>}
    {sTab==="services"&&<div style={sec}><div style={secT}>SERVICE TYPES</div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{stg.serviceTypes.map((t,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1a2418",border:`1px solid ${C.bd}`,padding:"4px 10px",fontSize:11}}><InEd value={t} onChange={v=>{const u=[...stg.serviceTypes];u[i]=v;uS({serviceTypes:u})}} style={{fontSize:11,color:C.t}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({serviceTypes:stg.serviceTypes.filter((_,j)=>j!==i)})}>×</span></div>)}</div><button style={sb("s")} onClick={()=>uS({serviceTypes:[...stg.serviceTypes,"New"]})}>+ ADD</button></div>}
    {sTab==="compliance"&&<div style={sec}><div style={secT}>COMPLIANCE ITEMS</div>{stg.complianceItems.map((item,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,width:120}} value={item.key} onChange={e=>{const u=[...stg.complianceItems];u[i]={...u[i],key:e.target.value.replace(/\s/g,"")};uS({complianceItems:u})}}/><input style={{...inp,flex:1}} value={item.label} onChange={e=>{const u=[...stg.complianceItems];u[i]={...u[i],label:e.target.value};uS({complianceItems:u})}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({complianceItems:stg.complianceItems.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({complianceItems:[...stg.complianceItems,{key:`c${Date.now()}`,label:"New"}]})}>+ ADD</button></div>}
    {sTab==="health"&&<div style={sec}><div style={secT}>HEALTH STATUSES</div>{stg.healthStatuses.map((h,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,width:80}} value={h.key} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],key:e.target.value};uS({healthStatuses:u})}}/><input type="color" style={{width:40,height:32,padding:2,background:C.p,border:`1px solid ${C.bd}`,cursor:"pointer"}} value={h.color} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],color:e.target.value};uS({healthStatuses:u})}}/><input style={{...inp,flex:1}} value={h.meaning} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],meaning:e.target.value};uS({healthStatuses:u})}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({healthStatuses:stg.healthStatuses.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({healthStatuses:[...stg.healthStatuses,{key:"New",color:"#888",meaning:""}]})}>+ ADD</button></div>}
    {sTab==="staff"&&<div style={sec}><div style={secT}>STAFF ROLES</div>{stg.staffRoles.map((r,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,width:120}} value={r.key} onChange={e=>{const u=[...stg.staffRoles];u[i]={...u[i],key:e.target.value.replace(/\s/g,"")};uS({staffRoles:u})}}/><input style={{...inp,flex:1}} value={r.label} onChange={e=>{const u=[...stg.staffRoles];u[i]={...u[i],label:e.target.value};uS({staffRoles:u})}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({staffRoles:stg.staffRoles.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({staffRoles:[...stg.staffRoles,{key:`r${Date.now()}`,label:"New Role"}]})}>+ ADD</button></div>}
    {sTab==="alerts"&&<div style={sec}><div style={secT}>THRESHOLDS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}><div><label style={lbl}>Renewal (days)</label><input style={inp} type="number" value={stg.alertThresholds.renewalDays} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,renewalDays:Number(e.target.value)}})}/></div><div><label style={lbl}>Overdue (days)</label><input style={inp} type="number" value={stg.alertThresholds.overduePaymentDays} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,overduePaymentDays:Number(e.target.value)}})}/></div><div><label style={lbl}>Staff %</label><input style={inp} type="number" value={stg.alertThresholds.staffShortfallPct} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,staffShortfallPct:Number(e.target.value)}})}/></div></div></div>}
    {sTab==="billing"&&<div style={sec}><div style={secT}>DEFAULTS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label style={lbl}>Invoice Day</label><input style={inp} type="number" min={1} max={28} value={stg.invoiceDayDefault} onChange={e=>uS({invoiceDayDefault:Number(e.target.value)})}/></div><div><label style={lbl}>Payment Terms</label><select style={inp} value={stg.defaultPaymentTerms} onChange={e=>uS({defaultPaymentTerms:Number(e.target.value)})}>{stg.paymentTermsPresets.map(d=><option key={d} value={d}>{d}d</option>)}</select></div></div></div>}
    {sTab==="fields"&&<div style={sec}><div style={secT}>CUSTOM FIELDS</div>{stg.customFields.map((f,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,flex:1}} value={f.label} onChange={e=>{const u=[...stg.customFields];u[i]={...u[i],label:e.target.value};uS({customFields:u})}}/><select style={{...inp,width:100}} value={f.type} onChange={e=>{const u=[...stg.customFields];u[i]={...u[i],type:e.target.value};uS({customFields:u})}}><option value="text">Text</option><option value="number">Number</option><option value="toggle">Yes/No</option></select><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({customFields:stg.customFields.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({customFields:[...stg.customFields,{key:`cf_${Date.now()}`,label:"",type:"text"}]})}>+ ADD</button></div>}
    {sTab==="data"&&<div style={sec}><div style={secT}>SUPABASE</div><div style={{fontSize:11,color:C.s,marginBottom:12}}>Connected: <span style={{color:C.g}}>iqccddabidfcrsbdehiq.supabase.co</span> · Mumbai</div><div style={{display:"flex",gap:8}}><button style={bt("s")} onClick={xCSV}>📥 CSV</button><button style={bt("s")} onClick={loadAll}>🔄 REFRESH</button></div></div>}
    <J3S/>
  </div>;

  // ═══ FORM ═══
  const Frm=()=>{if(!fd)return null;return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:20,overflowY:"auto"}} onClick={()=>setSF(false)}>
    <div style={{background:C.dk,border:`2px solid ${C.g}`,width:"94%",maxWidth:720,padding:22,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:14,fontWeight:700,color:C.g,letterSpacing:2,marginBottom:14}}>{eMode?"EDIT":"NEW"} ACCOUNT</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div><label style={lbl}>Client</label><input style={inp} value={fd.client} onChange={e=>setFD({...fd,client:e.target.value})}/></div>
        <div><label style={lbl}>Account Code</label><input style={inp} placeholder="e.g. KATH-JH-001" value={fd.account_code||""} onChange={e=>setFD({...fd,account_code:e.target.value})}/></div>
        <div><label style={lbl}>Location</label><input style={inp} value={fd.location||""} onChange={e=>setFD({...fd,location:e.target.value})}/></div>
        <div><label style={lbl}>Service Type</label><select style={inp} value={fd.service_type} onChange={e=>setFD({...fd,service_type:e.target.value})}>{stg.serviceTypes.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label style={lbl}>Contract Value ({stg.currency.symbol}/yr)</label><input style={inp} type="number" value={fd.contract_value} onChange={e=>setFD({...fd,contract_value:Number(e.target.value)})}/></div>
        <div><label style={lbl}>Start</label><input style={inp} type="date" value={fd.contract_start||""} onChange={e=>setFD({...fd,contract_start:e.target.value})}/></div>
        <div><label style={lbl}>End</label><input style={inp} type="date" value={fd.contract_end||""} onChange={e=>setFD({...fd,contract_end:e.target.value})}/></div>
        <div><label style={lbl}>Billing</label><select style={inp} value={fd.billing_cycle} onChange={e=>setFD({...fd,billing_cycle:e.target.value})}>{stg.billingCycles.map(b=><option key={b}>{b}</option>)}</select></div>
        <div><label style={lbl}>Terms</label><select style={inp} value={fd.payment_terms} onChange={e=>setFD({...fd,payment_terms:Number(e.target.value)})}>{stg.paymentTermsPresets.map(d=><option key={d} value={d}>{d}d</option>)}</select></div>
        <div><label style={lbl}>Status</label><select style={inp} value={fd.status} onChange={e=>setFD({...fd,status:e.target.value})}>{stg.accountStatuses.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={lbl}>Health</label><select style={inp} value={fd.health} onChange={e=>setFD({...fd,health:e.target.value})}>{stg.healthStatuses.map(h=><option key={h.key} value={h.key}>{h.key}</option>)}</select></div>
        <div><label style={lbl}>Pending ({stg.currency.symbol})</label><input style={inp} type="number" value={fd.pending_amount} onChange={e=>setFD({...fd,pending_amount:Number(e.target.value)})}/></div>
      </div>
      <div style={{marginTop:14}}><label style={{...lbl,marginBottom:8}}>👥 STAFF BREAKDOWN</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8}}>
          {stg.staffRoles.map(r=>{const v=fd.staff_breakdown?.[r.key]||{required:0,deployed:0};return<div key={r.key} style={{background:C.bg,padding:10,border:`1px solid ${C.bd}`}}><div style={{fontSize:10,color:C.g,letterSpacing:1,marginBottom:6}}>{r.label.toUpperCase()}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><div><label style={{fontSize:9,color:C.d}}>Req</label><input style={inp} type="number" min={0} value={v.required} onChange={e=>setFD({...fd,staff_breakdown:{...fd.staff_breakdown,[r.key]:{...v,required:Number(e.target.value)}}})}/></div><div><label style={{fontSize:9,color:C.d}}>Dep</label><input style={inp} type="number" min={0} value={v.deployed} onChange={e=>setFD({...fd,staff_breakdown:{...fd.staff_breakdown,[r.key]:{...v,deployed:Number(e.target.value)}}})}/></div></div></div>})}
        </div></div>
      <div style={{marginTop:12}}><label style={lbl}>Compliance</label><div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:4}}>{stg.complianceItems.map(ci=><label key={ci.key} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.s,cursor:"pointer"}}><input type="checkbox" checked={fd.compliance_status?.[ci.key]||false} onChange={e=>setFD({...fd,compliance_status:{...fd.compliance_status,[ci.key]:e.target.checked}})}/>{ci.label}</label>)}</div></div>
      <div style={{marginTop:12}}><label style={lbl}>Notes</label><textarea style={{...inp,height:50,resize:"vertical"}} value={fd.notes||""} onChange={e=>setFD({...fd,notes:e.target.value})}/></div>
      <div style={{marginTop:12}}><label style={lbl}>Contact</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><input style={inp} placeholder="Name" value={fd.contacts?.[0]?.name||""} onChange={e=>setFD({...fd,contacts:[{...(fd.contacts?.[0]||{}),name:e.target.value}]})}/><input style={inp} placeholder="Phone" value={fd.contacts?.[0]?.phone||""} onChange={e=>setFD({...fd,contacts:[{...(fd.contacts?.[0]||{}),phone:e.target.value}]})}/><input style={inp} placeholder="Role" value={fd.contacts?.[0]?.role||""} onChange={e=>setFD({...fd,contacts:[{...(fd.contacts?.[0]||{}),role:e.target.value}]})}/></div></div>
      <div style={{display:"flex",gap:8,marginTop:18}}><button style={bt("p")} onClick={saveAcc} disabled={syncing}>{syncing?"SAVING...":eMode?"UPDATE":"CREATE"}</button><button style={bt("g")} onClick={()=>setSF(false)}>CANCEL</button></div>
      <div style={{textAlign:"center",marginTop:14,fontSize:9,color:C.d,letterSpacing:2}}>BUILT FOR THE J3S OFFICE</div>
    </div></div>};

  // ═══ MAIN RENDER ═══
  return<div style={{background:C.bg,minHeight:"100vh",fontFamily:F,color:C.t}}>
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *::-webkit-scrollbar{width:5px;height:5px} *::-webkit-scrollbar-track{background:${C.bg}} *::-webkit-scrollbar-thumb{background:${C.bd};border-radius:3px} *::-webkit-scrollbar-thumb:hover{background:${C.g}} input[type=color]{padding:2px;height:32px;cursor:pointer}`}</style>
    <div style={{background:"linear-gradient(180deg,#1a2418 0%,#0f1a0d 100%)",borderBottom:`2px solid ${C.g}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:6}}>
      <div><div style={{fontSize:16,fontWeight:700,color:C.g,letterSpacing:3}}>{stg.companyName} ACCOUNTS</div><div style={{fontSize:9,color:C.d,letterSpacing:2}}>BUILT FOR THE <span style={{color:C.g}}>J3S OFFICE</span></div></div>
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        {syncing&&<span style={{fontSize:10,color:C.yl,animation:"pulse 1s infinite"}}>SYNCING</span>}
        {[["dashboard","DASHBOARD"],["analytics","ANALYTICS"],...(isA?[["users","👤 USERS"],["settings","⚙ SETTINGS"]]:[])].map(([k,l])=><button key={k} style={nb(view===k||(view==="detail"&&k==="dashboard"))} onClick={()=>{setView(k);setSelId(null)}}>{l}</button>)}
        <span style={{background:C.gn,color:C.bg,padding:"2px 8px",fontSize:9,fontWeight:700,borderRadius:2}}>LIVE</span>
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:6,padding:"4px 10px",background:"#1a2418",border:`1px solid ${C.bd}`,fontSize:10}}>
          <span style={dot(C.gn)}/><span style={{color:C.t}}>{user.full_name||user.username}</span><span style={pill(isA?C.g:C.bl)}>{user.role.toUpperCase()}</span>
          <span style={{color:C.rd,cursor:"pointer",fontWeight:700,marginLeft:4}} onClick={()=>{setUser(null);setLoaded(false);setAccs([]);setView("dashboard")}}>✕</span>
        </div>
      </div>
    </div>
    <div style={{padding:"18px 20px"}}>
      {view==="dashboard"&&<Dash/>}
      {view==="detail"&&<Det/>}
      {view==="analytics"&&<Analytics/>}
      {view==="users"&&isA&&<Usr/>}
      {view==="settings"&&isA&&<Stg/>}
    </div>
    {showFrm&&<Frm/>}
    {toast&&<div style={{position:"fixed",bottom:20,right:20,background:C.g,color:C.bg,padding:"8px 18px",fontSize:12,fontWeight:700,letterSpacing:1,fontFamily:F,zIndex:300,borderRadius:2}}>{toast}</div>}
  </div>;
}
