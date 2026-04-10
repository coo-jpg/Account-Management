import { useState, useEffect, useCallback, useRef } from "react";

const SB = "https://iqccddabidfcrsbdehiq.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY2NkZGFiaWRmY3JzYmRlaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODQyMDQsImV4cCI6MjA4NzY2MDIwNH0.tKb-l9TnlSDVsG7zHUJTdd5kt5vWCYKtvQYwVjz0xos";
const H = { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json" };
const rpc = async (fn, params) => { const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: "POST", headers: H, body: JSON.stringify(params) }); const data = await r.json().catch(() => null); if (!r.ok) throw new Error(data?.message || "RPC failed"); return data; };
const get = async (t, p = "") => { try { const r = await fetch(`${SB}/rest/v1/${t}${p}`, { headers: { ...H, Prefer: "return=representation" } }); return r.ok ? r.json() : [] } catch { return [] } };
const post = async (t, d) => { try { const r = await fetch(`${SB}/rest/v1/${t}`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(d) }); return r.ok ? r.json() : null } catch { return null } };
const patch = async (t, m, d) => { try { const r = await fetch(`${SB}/rest/v1/${t}${m}`, { method: "PATCH", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify(d) }); return r.ok ? r.json() : null } catch { return null } };
const rm = async (t, m) => { try { await fetch(`${SB}/rest/v1/${t}${m}`, { method: "DELETE", headers: H }) } catch {} };
const upFile = async (p, f) => { try { const r = await fetch(`${SB}/storage/v1/object/account-docs/${p}`, { method: "POST", headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": f.type }, body: f }); return r.ok } catch { return false } };
const rmFile = async p => { try { await fetch(`${SB}/storage/v1/object/account-docs/${p}`, { method: "DELETE", headers: { apikey: SK, Authorization: `Bearer ${SK}` } }) } catch {} };
const fileUrl = p => `${SB}/storage/v1/object/public/account-docs/${p}`;

// ═══ THEMES ═══
const DARK = { bg:"#0a0f0a", p:"#111a0f", bd:"#2a3a22", g:"#d4a841", m:"#6b7a5e", d:"#4a5a42", t:"#c8cfc8", s:"#8a9a82", dk:"#0f1a0d", gn:"#4ade80", yl:"#fbbf24", rd:"#ef4444", bl:"#60a5fa", font:"'Share Tech Mono','Courier New',monospace", inputBg:"#111a0f", navBg:"linear-gradient(180deg,#1a2418 0%,#0f1a0d 100%)", rowHover:"#1a2418", codeBg:"#1a2418" };
const LIGHT = { bg:"#f4f6f4", p:"#ffffff", bd:"#d0d8cc", g:"#8a6a10", m:"#5a6a50", d:"#9aaa90", t:"#1a2418", s:"#4a5a42", dk:"#eaf0ea", gn:"#16a34a", yl:"#d97706", rd:"#dc2626", bl:"#2563eb", font:"'Helvetica Neue',Helvetica,Arial,sans-serif", inputBg:"#ffffff", navBg:"linear-gradient(180deg,#e8f0e4 0%,#dce8d8 100%)", rowHover:"#eaf0ea", codeBg:"#f0f4ee" };

const DS = {
  companyName:"BBCSS", tagline:"BLACK BELT COMMANDOS · ACCOUNT MANAGEMENT SYSTEM",
  serviceTypes:["Security Services","Facility Management","Housekeeping","Event Security","Manpower Supply"],
  complianceItems:[{key:"psara",label:"PSARA License"},{key:"labour",label:"Labour License"},{key:"esiPf",label:"ESI/PF Registration"},{key:"clra",label:"CLRA Returns"}],
  healthStatuses:[{key:"Green",color:"#4ade80",meaning:"All good"},{key:"Yellow",color:"#fbbf24",meaning:"Needs attention"},{key:"Red",color:"#ef4444",meaning:"Critical"}],
  accountStatuses:["Active","Paused","Terminated","Onboarding"],
  billingCycles:["Monthly","Quarterly","Half-Yearly","Annually"],
  paymentTermsPresets:[15,30,45,60,90],
  staffRoles:[{key:"guard",label:"Guard"},{key:"supervisor",label:"Supervisor"},{key:"gunman",label:"Gunman"},{key:"housekeeper",label:"Housekeeper"},{key:"driver",label:"Driver"}],
  alertThresholds:{renewalDays:90,overduePaymentDays:45,staffShortfallPct:10},
  currency:{symbol:"₹",locale:"en-IN",lakhFormat:true},
  invoiceDayDefault:1,defaultPaymentTerms:30,defaultBillingCycle:"Monthly",defaultHealth:"Green",defaultStatus:"Active",
  customFields:[],notesTemplate:"",showBranding:true,
  renewalStatuses:["Pending","In Discussion","Rate Revision","Renewed","Lost"],
  branches:["Karnataka","Telangana","Tamil Nadu","Kerala","Multi-State"],
};

const $f = (a,cu) => { const s=cu?.symbol||"₹"; if(cu?.lakhFormat!==false){if(Math.abs(a)>=1e7)return`${s}${(a/1e7).toFixed(2)}Cr`;if(Math.abs(a)>=1e5)return`${s}${(a/1e5).toFixed(1)}L`;if(Math.abs(a)>=1e3)return`${s}${(a/1e3).toFixed(1)}K`;}return`${s}${a.toLocaleString(cu?.locale||"en-IN")}`};
const $d = d => {if(!d)return"—";return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})};
const dTo = d => Math.ceil((new Date(d)-new Date())/864e5);
const dSn = d => Math.ceil((new Date()-new Date(d))/864e5);
const hC = (h,hs) => hs.find(x=>x.key===h)?.color||"#888";
const tS = (sb,t) => Object.values(sb||{}).reduce((s,v)=>s+(v[t]||0),0);
const foName = (id,users) => {if(!id)return"—";const u=(users||[]).find(x=>x.id===id);return u?(u.full_name||u.username):"—"};
const mkCSV = (accs,s,users) => { const rl=s.staffRoles.map(r=>r.key),cm=s.complianceItems.map(c=>c.key); const hd=["ID","Code","Client","Location","Type","Status","Health","Value","Billing","Terms","Start","End","Renewal","Pending","FieldOfficer","TotReq","TotDep",...rl.flatMap(r=>[`${r}_R`,`${r}_D`]),...cm.map(c=>`C_${c}`),"Paid","Notes"]; const rows=accs.map(a=>[a.account_id,a.account_code||"",`"${a.client}"`,`"${a.location||""}"`,a.service_type,a.status,a.health,a.contract_value,a.billing_cycle,a.payment_terms,a.contract_start,a.contract_end,a.renewal_status||"",a.pending_amount,`"${foName(a.field_officer_id,users)}"`,tS(a.staff_breakdown,"required"),tS(a.staff_breakdown,"deployed"),...rl.flatMap(r=>[a.staff_breakdown?.[r]?.required||0,a.staff_breakdown?.[r]?.deployed||0]),...cm.map(c=>a.compliance_status?.[c]?"Y":"N"),(a._p||[]).reduce((s,p)=>s+Number(p.amount),0),`"${(a.notes||"").replace(/"/g,'""')}"`].join(",")); return hd.join(",")+"\n"+rows.join("\n") };

// Style factories that depend on theme
const mkStyles = (C) => ({
  inp: {background:C.inputBg,border:`1px solid ${C.bd}`,color:C.t,padding:"8px 12px",fontSize:13,fontFamily:C.font,width:"100%",boxSizing:"border-box",outline:"none",borderRadius:4},
  lbl: {fontSize:11,color:C.m,letterSpacing:0.5,marginBottom:4,display:"block",fontFamily:C.font},
  sec: {background:C.p,border:`1px solid ${C.bd}`,padding:18,marginBottom:14,borderRadius:6},
  secT: {fontSize:12,color:C.g,letterSpacing:1,textTransform:"uppercase",marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.bd}`,fontFamily:C.font,fontWeight:700},
  pill: c=>({display:"inline-block",background:c+"22",color:c,padding:"2px 8px",fontSize:10,borderRadius:10,fontWeight:700}),
  dot: c=>({display:"inline-block",width:8,height:8,borderRadius:"50%",background:c,marginRight:6,verticalAlign:"middle",flexShrink:0}),
  nb: a=>({background:a?C.g:"transparent",color:a?C.bg:C.m,border:`1px solid ${a?C.g:C.bd}`,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:C.font,borderRadius:4,fontWeight:a?700:400}),
  bt: v=>({background:v==="p"?C.g:v==="d"?"#dc2626":v==="s"?C.dk:"transparent",color:v==="p"?C.bg:v==="d"?"#fff":v==="s"?C.g:C.m,border:`1px solid ${v==="p"?C.g:v==="d"?"#dc2626":C.bd}`,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:C.font,fontWeight:700,borderRadius:4}),
  sb: v=>({background:v==="p"?C.g:v==="d"?"#dc2626":v==="s"?C.dk:"transparent",color:v==="p"?C.bg:v==="d"?"#fff":v==="s"?C.g:C.m,border:`1px solid ${v==="p"?C.g:v==="d"?"#dc2626":C.bd}`,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:C.font,fontWeight:600,borderRadius:4}),
  th: {background:C.codeBg,color:C.g,padding:"8px 10px",textAlign:"left",fontSize:11,letterSpacing:0.5,textTransform:"uppercase",borderBottom:`2px solid ${C.bd}`,whiteSpace:"nowrap",fontFamily:C.font},
  td: {padding:"8px 10px",borderBottom:`1px solid ${C.bd}`,verticalAlign:"middle",fontSize:13,fontFamily:C.font},
  dr: {display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.bg}`},
});

const J3S = ({C}) => <div style={{textAlign:"center",padding:"14px 0",borderTop:`1px solid ${C.bd}`,marginTop:24,fontSize:10,color:C.d,fontFamily:C.font}}>BUILT FOR THE <span style={{color:C.g,fontWeight:700}}>J3S OFFICE</span></div>;

function PayIn({onRec,C,S}){
  const[a,setA]=useState("");const[r,setR]=useState("");const[n,setN]=useState("");
  return<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
    <input style={{...S.inp,flex:1,minWidth:80}} placeholder="Amount" value={a} onChange={e=>setA(e.target.value)} type="number"/>
    <input style={{...S.inp,width:100}} placeholder="Ref" value={r} onChange={e=>setR(e.target.value)}/>
    <input style={{...S.inp,width:100}} placeholder="Note" value={n} onChange={e=>setN(e.target.value)}/>
    <button style={S.bt("p")} onClick={()=>{if(a>0){onRec(Number(a),r,n);setA("");setR("");setN("")}}}>RECORD</button>
  </div>
}

function DocUp({docs,onUp,onRm,C,S}){
  const r=useRef();
  return<div>
    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
      {docs.map(d=><div key={d.id} style={{background:C.codeBg,border:`1px solid ${C.bd}`,padding:"6px 10px",fontSize:11,display:"flex",alignItems:"center",gap:8,borderRadius:4}}>
        <span style={{color:C.g,cursor:"pointer"}} onClick={()=>window.open(fileUrl(d.storage_path),"_blank")}>📄 {d.file_name}</span>
        <span style={{color:C.d,fontSize:10}}>{(d.file_size/1024).toFixed(0)}KB</span>
        <span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>onRm(d.id,d.storage_path)}>×</span>
      </div>)}
      {docs.length===0&&<span style={{color:C.d,fontSize:11}}>No documents</span>}
    </div>
    <input ref={r} type="file" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){onUp(e.target.files[0]);e.target.value=""}}} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"/>
    <button style={S.sb("s")} onClick={()=>r.current.click()}>📎 Upload</button>
  </div>
}

// ═══════════════════════════════════════
// ALL MODALS — outside App to prevent remounting
// ═══════════════════════════════════════

function AccountFormModal({fd,setFD,eMode,onSave,onClose,syncing,stg,users,C,S}){
  if(!fd)return null;
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:20,overflowY:"auto"}} onClick={onClose}>
    <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,width:"94%",maxWidth:720,padding:24,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:16,fontWeight:700,color:C.t,marginBottom:16,fontFamily:C.font}}>{eMode?"Edit":"New"} Account</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["Client","client","text",fd.client],["Account Code","account_code","text",fd.account_code||""]].map(([l,k,t,v])=><div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} type={t} value={v} onChange={e=>setFD({...fd,[k]:e.target.value})}/></div>)}
        <div><label style={S.lbl}>Location</label><input style={S.inp} value={fd.location||""} onChange={e=>setFD({...fd,location:e.target.value})}/></div>
        <div><label style={S.lbl}>Service Type</label><select style={S.inp} value={fd.service_type} onChange={e=>setFD({...fd,service_type:e.target.value})}>{stg.serviceTypes.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label style={S.lbl}>Contract Value ({stg.currency.symbol}/yr)</label><input style={S.inp} type="number" value={fd.contract_value} onChange={e=>setFD({...fd,contract_value:Number(e.target.value)})}/></div>
        <div><label style={S.lbl}>Start Date</label><input style={S.inp} type="date" value={fd.contract_start||""} onChange={e=>setFD({...fd,contract_start:e.target.value})}/></div>
        <div><label style={S.lbl}>End Date</label><input style={S.inp} type="date" value={fd.contract_end||""} onChange={e=>setFD({...fd,contract_end:e.target.value})}/></div>
        <div><label style={S.lbl}>Billing Cycle</label><select style={S.inp} value={fd.billing_cycle} onChange={e=>setFD({...fd,billing_cycle:e.target.value})}>{stg.billingCycles.map(b=><option key={b}>{b}</option>)}</select></div>
        <div><label style={S.lbl}>Payment Terms</label><select style={S.inp} value={fd.payment_terms} onChange={e=>setFD({...fd,payment_terms:Number(e.target.value)})}>{stg.paymentTermsPresets.map(d=><option key={d} value={d}>{d} days</option>)}</select></div>
        <div><label style={S.lbl}>Status</label><select style={S.inp} value={fd.status} onChange={e=>setFD({...fd,status:e.target.value})}>{stg.accountStatuses.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label style={S.lbl}>Health</label><select style={S.inp} value={fd.health} onChange={e=>setFD({...fd,health:e.target.value})}>{stg.healthStatuses.map(h=><option key={h.key} value={h.key}>{h.key}</option>)}</select></div>
        <div><label style={S.lbl}>Pending Amount ({stg.currency.symbol})</label><input style={S.inp} type="number" value={fd.pending_amount} onChange={e=>setFD({...fd,pending_amount:Number(e.target.value)})}/></div>
        <div><label style={S.lbl}>Branch</label><select style={S.inp} value={fd.branch||""} onChange={e=>setFD({...fd,branch:e.target.value})}>{(stg.branches||[]).map(b=><option key={b}>{b}</option>)}</select></div>
        <div><label style={S.lbl}>Field Officer</label><select style={S.inp} value={fd.field_officer_id||""} onChange={e=>setFD({...fd,field_officer_id:e.target.value||null})}><option value="">— None —</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}</select></div>
      </div>
      <div style={{marginTop:16}}><label style={{...S.lbl,marginBottom:8}}>👥 Staff Breakdown</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
          {stg.staffRoles.map(r=>{const v=fd.staff_breakdown?.[r.key]||{required:0,deployed:0};return<div key={r.key} style={{background:C.bg,padding:10,border:`1px solid ${C.bd}`,borderRadius:6}}><div style={{fontSize:11,color:C.g,fontWeight:700,marginBottom:6,fontFamily:C.font}}>{r.label}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}><div><label style={{fontSize:10,color:C.d,fontFamily:C.font}}>Required</label><input style={S.inp} type="number" min={0} value={v.required} onChange={e=>setFD({...fd,staff_breakdown:{...fd.staff_breakdown,[r.key]:{...v,required:Number(e.target.value)}}})}/></div><div><label style={{fontSize:10,color:C.d,fontFamily:C.font}}>Deployed</label><input style={S.inp} type="number" min={0} value={v.deployed} onChange={e=>setFD({...fd,staff_breakdown:{...fd.staff_breakdown,[r.key]:{...v,deployed:Number(e.target.value)}}})}/></div></div></div>})}
        </div>
      </div>
      <div style={{marginTop:12}}><label style={S.lbl}>Compliance</label><div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:6}}>{stg.complianceItems.map(ci=><label key={ci.key} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:C.s,cursor:"pointer",fontFamily:C.font}}><input type="checkbox" checked={fd.compliance_status?.[ci.key]||false} onChange={e=>setFD({...fd,compliance_status:{...fd.compliance_status,[ci.key]:e.target.checked}})}/>{ci.label}</label>)}</div></div>
      <div style={{marginTop:12}}><label style={S.lbl}>Notes</label><textarea style={{...S.inp,height:60,resize:"vertical"}} value={fd.notes||""} onChange={e=>setFD({...fd,notes:e.target.value})}/></div>
      <div style={{marginTop:12}}><label style={S.lbl}>Contact</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}><input style={S.inp} placeholder="Name" value={fd.contacts?.[0]?.name||""} onChange={e=>setFD({...fd,contacts:[{...(fd.contacts?.[0]||{}),name:e.target.value}]})}/><input style={S.inp} placeholder="Phone" value={fd.contacts?.[0]?.phone||""} onChange={e=>setFD({...fd,contacts:[{...(fd.contacts?.[0]||{}),phone:e.target.value}]})}/><input style={S.inp} placeholder="Role" value={fd.contacts?.[0]?.role||""} onChange={e=>setFD({...fd,contacts:[{...(fd.contacts?.[0]||{}),role:e.target.value}]})}/></div></div>
      <div style={{display:"flex",gap:8,marginTop:20}}><button style={S.bt("p")} onClick={onSave} disabled={syncing}>{syncing?"Saving...":eMode?"Update":"Create"}</button><button style={S.bt("g")} onClick={onClose}>Cancel</button></div>
    </div>
  </div>;
}

function CreateUserModal({uf,setUF,onSave,onClose,stg,C,S}){
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:24,width:420,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:16,fontWeight:700,color:C.t,marginBottom:16,fontFamily:C.font}}>Create User</div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Username</label><input style={S.inp} value={uf.username} onChange={e=>setUF({...uf,username:e.target.value})} autoComplete="off"/></div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Password</label><input style={S.inp} type="password" value={uf.password} onChange={e=>setUF({...uf,password:e.target.value})} autoComplete="new-password"/></div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Full Name</label><input style={S.inp} value={uf.full_name} onChange={e=>setUF({...uf,full_name:e.target.value})}/></div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Role</label><select style={S.inp} value={uf.role} onChange={e=>setUF({...uf,role:e.target.value})}><option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Super Admin</option></select></div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Scope</label><select style={S.inp} value={uf.scope_level} onChange={e=>setUF({...uf,scope_level:e.target.value,scope_branch:e.target.value==="branch"?uf.scope_branch:""})}><option value="org">Org (all branches)</option><option value="branch">Branch (one branch)</option><option value="site">Site (assigned accounts)</option></select></div>
      {uf.scope_level==="branch"&&<div style={{marginBottom:10}}><label style={S.lbl}>Branch</label><select style={S.inp} value={uf.scope_branch} onChange={e=>setUF({...uf,scope_branch:e.target.value})}><option value="">Select...</option>{(stg.branches||[]).map(b=><option key={b} value={b}>{b}</option>)}</select></div>}
      {uf.role==="user"&&<div style={{marginBottom:14}}><label style={S.lbl}>View Access</label><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:6}}>{[["dashboard","Dashboard"],["command","Command"],["analytics","Analytics"],["notifications","Notifications"]].map(([k,l])=><label key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:C.s,cursor:"pointer",fontFamily:C.font}}><input type="checkbox" checked={uf.view_permissions[k]} onChange={e=>setUF({...uf,view_permissions:{...uf.view_permissions,[k]:e.target.checked}})}/>{l}</label>)}</div></div>}
      <div style={{display:"flex",gap:8,marginTop:8}}><button style={S.bt("p")} onClick={onSave}>Create</button><button style={S.bt("g")} onClick={onClose}>Cancel</button></div>
    </div>
  </div>;
}

function TaskFormModal({editTask,taskForm,setTaskForm,onSave,onClose,syncing,users,scopedAccs,C,S}){
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:40,overflowY:"auto"}} onClick={onClose}>
    <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:24,width:"94%",maxWidth:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:16,fontWeight:700,color:C.t,marginBottom:16,fontFamily:C.font}}>{editTask?"Edit":"New"} Task</div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Title *</label><input style={S.inp} value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} placeholder="What needs to be done?" autoFocus/></div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Description</label><textarea style={{...S.inp,height:70,resize:"vertical"}} value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} placeholder="Details, context, expected outcome..."/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={S.lbl}>Priority</label><select style={S.inp} value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></div>
        <div><label style={S.lbl}>Due Date</label><input type="date" style={S.inp} value={taskForm.due_date} onChange={e=>setTaskForm({...taskForm,due_date:e.target.value})}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div><label style={S.lbl}>Assign To</label><select style={S.inp} value={taskForm.assigned_to} onChange={e=>{const uid=e.target.value;const u=users.find(x=>x.id===uid);setTaskForm({...taskForm,assigned_to:uid,assigned_to_name:u?(u.full_name||u.username):"All"})}}><option value="">— All —</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}</select></div>
        <div><label style={S.lbl}>Linked Account</label><select style={S.inp} value={taskForm.account_id} onChange={e=>setTaskForm({...taskForm,account_id:e.target.value})}><option value="">— None —</option>{scopedAccs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
      </div>
      <div style={{marginBottom:14}}><label style={S.lbl}>Tags (comma-separated)</label><input style={S.inp} value={taskForm.tags} onChange={e=>setTaskForm({...taskForm,tags:e.target.value})} placeholder="site-visit, urgent, vendor..."/></div>
      <div style={{display:"flex",gap:8}}><button style={S.bt("p")} onClick={onSave} disabled={syncing}>{syncing?"Saving...":editTask?"Update":"Create"}</button><button style={S.bt("g")} onClick={onClose}>Cancel</button></div>
    </div>
  </div>;
}

function PwResetModal({pwModal,pwVal,setPwVal,pwVal2,setPwVal2,pwErr,setPwErr,onConfirm,onClose,C,S}){
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:24,width:380,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:14,fontFamily:C.font}}>🔑 Reset Password — {pwModal.user?.full_name||pwModal.user?.username}</div>
      <div style={{marginBottom:10}}><label style={S.lbl}>New Password</label><input style={S.inp} type="password" value={pwVal} onChange={e=>setPwVal(e.target.value)} autoFocus autoComplete="new-password"/></div>
      <div style={{marginBottom:10}}><label style={S.lbl}>Confirm Password</label><input style={S.inp} type="password" value={pwVal2} onChange={e=>setPwVal2(e.target.value)} autoComplete="new-password"/></div>
      {pwErr&&<div style={{color:C.rd,fontSize:12,marginBottom:10,fontFamily:C.font}}>{pwErr}</div>}
      <div style={{display:"flex",gap:8,marginTop:14}}><button style={S.bt("p")} onClick={onConfirm}>Confirm</button><button style={S.bt("g")} onClick={onClose}>Cancel</button></div>
    </div>
  </div>;
}

function DelUserModal({delUserModal,onConfirm,onClose,C,S}){
  return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:C.p,border:`2px solid ${C.rd}`,borderRadius:8,padding:24,width:400,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:15,fontWeight:700,color:C.rd,marginBottom:14,fontFamily:C.font}}>⚠ Delete User — Permanent</div>
      <div style={{fontSize:13,color:C.t,marginBottom:6,fontFamily:C.font}}>Delete <strong>{delUserModal.user?.full_name||delUserModal.user?.username}</strong>?</div>
      <div style={{fontSize:12,color:C.m,marginBottom:18,lineHeight:1.6,fontFamily:C.font}}>This cannot be undone. Task assignments, field officer links, and notifications will be cleared.</div>
      <div style={{display:"flex",gap:8}}><button style={S.bt("d")} onClick={onConfirm}>Confirm Delete</button><button style={S.bt("g")} onClick={onClose}>Cancel</button></div>
    </div>
  </div>;
}

// ═══════════════════════════════════════
// COMMAND PANELS — all 4 outside App
// ═══════════════════════════════════════

function UpdPanel({accs,currentUser,isAdmin,C,S}){
  const[items,setItems]=useState([]);const[showA,setShowA]=useState(false);const[ld,setLd]=useState(true);const[flt,setFlt]=useState("all");
  const[fm,setFm]=useState({title:"",description:"",category:"general",priority:"normal",account_id:""});
  const load=useCallback(async()=>{try{const d=await get("account_updates","?order=is_pinned.desc,created_at.desc&limit=50");setItems(d||[])}catch(e){}setLd(false)},[]);
  useEffect(()=>{load()},[load]);
  const catI={general:"📋",contract:"📄",staff:"👥",billing:"💰",compliance:"🛡",alert:"⚠",renewal:"🔄",onboarding:"🚀"};
  const prC=p=>({critical:C.rd,high:"#f97316",normal:C.g,low:C.m}[p]||C.g);
  const add=async()=>{if(!fm.title.trim())return;const ac=accs.find(a=>a.id===fm.account_id);await post("account_updates",{...fm,account_name:ac?.client||"",created_by_name:currentUser?.full_name||"Admin"});setShowA(false);setFm({title:"",description:"",category:"general",priority:"normal",account_id:""});load()};
  const fl=flt==="all"?items:items.filter(u=>u.category===flt);
  const cats=["all","general","contract","staff","billing","compliance","alert","renewal","onboarding"];
  return<div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:6,overflow:"hidden",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.codeBg}}>
      <span style={{fontSize:13,fontWeight:700,color:C.g,fontFamily:C.font}}>📋 Account Updates</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:11,color:C.m,fontFamily:C.font}}>{items.length}</span>{isAdmin&&<button style={S.sb("p")} onClick={()=>setShowA(true)}>+ Add</button>}</div>
    </div>
    <div style={{padding:"6px 10px",display:"flex",gap:4,flexWrap:"wrap",borderBottom:`1px solid ${C.bd}`}}>
      {cats.map(c=><button key={c} onClick={()=>setFlt(c)} style={{...S.sb(flt===c?"p":"g"),padding:"2px 8px",fontSize:10}}>{c==="all"?"All":c.slice(0,5)}</button>)}
    </div>
    <div style={{flex:1,overflowY:"auto",maxHeight:280}}>
      {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:12,fontFamily:C.font}}>Loading...</div>:
      fl.length===0?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:12,fontFamily:C.font}}>No updates</div>:
      fl.map(u=><div key={u.id} style={{padding:"10px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:16,minWidth:20}}>{catI[u.category]||"📋"}</span>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
            {u.is_pinned&&<span style={{fontSize:10}}>📌</span>}
            <span style={{fontSize:13,color:C.t,fontWeight:600,fontFamily:C.font}}>{u.title}</span>
            <span style={{...S.pill(prC(u.priority)),fontSize:9}}>{u.priority}</span>
          </div>
          {u.description&&<div style={{fontSize:11,color:C.m,fontFamily:C.font,marginBottom:3}}>{u.description}</div>}
          <div style={{fontSize:10,color:C.d,fontFamily:C.font}}>{u.account_name&&<span style={{marginRight:8,color:C.g}}>📁 {u.account_name}</span>}{Math.floor((new Date()-new Date(u.created_at))/864e5)}d ago · {u.created_by_name||"System"}</div>
        </div>
        {isAdmin&&<div style={{display:"flex",gap:4}}>
          <button onClick={async()=>{await patch("account_updates",`?id=eq.${u.id}`,{is_pinned:!u.is_pinned});load()}} style={{...S.sb("g"),fontSize:11,padding:"2px 6px"}}>{u.is_pinned?"📌":"📍"}</button>
          <button onClick={async()=>{await rm("account_updates",`?id=eq.${u.id}`);load()}} style={{...S.sb("g"),fontSize:11,padding:"2px 6px",color:C.rd}}>✕</button>
        </div>}
      </div>)}
    </div>
    {showA&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowA(false)}>
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:20,width:"100%",maxWidth:500,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:14,fontFamily:C.font}}>New Update</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={S.lbl}>Title</label><input style={S.inp} value={fm.title} onChange={e=>setFm({...fm,title:e.target.value})} placeholder="Update title..." autoFocus/></div>
          <div><label style={S.lbl}>Description</label><textarea style={{...S.inp,height:60,resize:"vertical"}} value={fm.description} onChange={e=>setFm({...fm,description:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Category</label><select style={S.inp} value={fm.category} onChange={e=>setFm({...fm,category:e.target.value})}>{Object.keys(catI).map(c=><option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}</select></div>
            <div><label style={S.lbl}>Priority</label><select style={S.inp} value={fm.priority} onChange={e=>setFm({...fm,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></div>
          </div>
          <div><label style={S.lbl}>Account</label><select style={S.inp} value={fm.account_id} onChange={e=>setFm({...fm,account_id:e.target.value})}><option value="">— None —</option>{accs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
          <div style={{display:"flex",gap:8}}><button style={S.bt("p")} onClick={add}>Create</button><button style={S.bt("g")} onClick={()=>setShowA(false)}>Cancel</button></div>
        </div>
      </div>
    </div>}
  </div>;
}

function TodoPanel({accs,users,currentUser,isAdmin,onNotifChange,C,S}){
  const[todos,setTodos]=useState([]);const[showA,setShowA]=useState(false);const[editI,setEditI]=useState(null);const[ld,setLd]=useState(true);const[sf,setSf]=useState("active");
  const[remarkModal,setRemarkModal]=useState(null);const[remarkText,setRemarkText]=useState("");
  const defF={title:"",description:"",priority:"normal",assigned_to:"",assigned_to_name:"",account_id:"",due_date:"",tags:""};
  const[fm,setFm]=useState(defF);
  const prC=p=>({critical:C.rd,high:"#f97316",normal:C.g,low:C.m}[p]||C.g);
  const stC=s=>({pending:C.yl,in_progress:C.bl,completed:C.gn,overdue:C.rd}[s]||C.g);
  const load=useCallback(async()=>{
    const d=await get("todos","?order=created_at.desc&limit=100");const now=new Date();
    const visible=(d||[]).filter(t=>isAdmin||t.assigned_to===null||t.assigned_to===currentUser?.id);
    setTodos(visible.map(t=>(["pending","in_progress"].includes(t.status)&&t.due_date&&new Date(t.due_date)<now)?{...t,status:"overdue"}:t));
    setLd(false);
  },[isAdmin,currentUser?.id]);
  useEffect(()=>{load()},[load]);
  const notify=async(todo,eventType,message,remark)=>{
    if(!todo)return;const recipients=new Set();
    if(todo.assigned_to)recipients.add(todo.assigned_to);if(todo.assigned_by)recipients.add(todo.assigned_by);
    (users||[]).filter(u=>u.role==="admin"&&u.is_active).forEach(u=>recipients.add(u.id));if(currentUser?.id)recipients.delete(currentUser.id);
    const rows=[...recipients].map(rid=>({recipient_id:rid,todo_id:todo.id,todo_title:todo.title,event_type:eventType,message,remark:remark||null,actor_id:currentUser?.id||null,actor_name:currentUser?.full_name||"System"}));
    if(rows.length>0){await post("todo_notifications",rows);if(onNotifChange)onNotifChange();}
  };
  const save=async()=>{if(!fm.title.trim())return;const ac=accs.find(a=>a.id===fm.account_id);
    const bd={title:fm.title,description:fm.description,priority:fm.priority,assigned_to:fm.assigned_to||null,assigned_to_name:fm.assigned_to_name||"All",account_id:fm.account_id||null,account_name:ac?.client||"",due_date:fm.due_date||null,tags:fm.tags?fm.tags.split(",").map(t=>t.trim()).filter(Boolean):[],assigned_by:currentUser?.id||null,assigned_by_name:currentUser?.full_name||"Admin"};
    if(editI){bd.updated_at=new Date().toISOString();const res=await patch("todos",`?id=eq.${editI.id}`,bd);const updated=(res&&res[0])||{...editI,...bd};if(editI.assigned_to!==bd.assigned_to)await notify(updated,"reassigned",`Task reassigned to ${bd.assigned_to_name}`);}
    else{bd.notified_at=new Date().toISOString();bd.status="pending";const res=await post("todos",bd);if(res&&res[0])await notify(res[0],"assigned",`New task: ${bd.title}`);}
    setShowA(false);setEditI(null);setFm(defF);load();
  };
  const upSt=async(id,s)=>{const todo=todos.find(t=>t.id===id);if(s==="completed"){setRemarkModal({type:"complete",todo});setRemarkText("");return;}await patch("todos",`?id=eq.${id}`,{status:s,updated_at:new Date().toISOString()});if(todo)await notify(todo,"status_changed",`Status → ${s}`);load();};
  const confirmComplete=async()=>{if(!remarkText.trim()){alert("Remark required");return;}const todo=remarkModal.todo;await patch("todos",`?id=eq.${todo.id}`,{status:"completed",completed_at:new Date().toISOString(),completion_remark:remarkText.trim(),updated_at:new Date().toISOString()});await notify(todo,"completed",`Completed: ${todo.title}`,remarkText.trim());setRemarkModal(null);setRemarkText("");load();};
  const del=async(id)=>{const todo=todos.find(t=>t.id===id);setRemarkModal({type:"delete",todo});setRemarkText("");};
  const confirmDelete=async()=>{if(!remarkText.trim()){alert("Reason required");return;}const todo=remarkModal.todo;await notify(todo,"deleted",`Deleted: ${todo.title}`,remarkText.trim());await rm("todos",`?id=eq.${todo.id}`);setRemarkModal(null);setRemarkText("");load();};
  const fil=sf==="active"?todos.filter(t=>["pending","in_progress","overdue"].includes(t.status)):sf==="completed"?todos.filter(t=>t.status==="completed"):sf==="overdue"?todos.filter(t=>t.status==="overdue"):todos;
  const st={t:todos.length,p:todos.filter(t=>t.status==="pending").length,o:todos.filter(t=>t.status==="overdue").length,c:todos.filter(t=>t.status==="completed").length};
  return<div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:6,overflow:"hidden",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.codeBg}}>
      <span style={{fontSize:13,fontWeight:700,color:C.bl,fontFamily:C.font}}>📝 To-Do Tracker</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>{st.o>0&&<span style={{background:C.rd+"22",color:C.rd,padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:700}}>{st.o} overdue</span>}<button style={S.sb("p")} onClick={()=>{setEditI(null);setFm(defF);setShowA(true)}}>+ Add</button></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`}}>
      {[["All",st.t,C.t,"all"],["Pending",st.p,C.yl,"active"],["Overdue",st.o,C.rd,"overdue"],["Done",st.c,C.gn,"completed"]].map(([l,v,c,f])=>
        <button key={f} onClick={()=>setSf(f)} style={{background:sf===f?`${c}15`:"transparent",border:"none",borderBottom:sf===f?`2px solid ${c}`:"2px solid transparent",padding:"8px 4px",cursor:"pointer",textAlign:"center",fontFamily:C.font}}>
          <div style={{fontSize:16,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:10,color:C.m}}>{l}</div>
        </button>)}
    </div>
    <div style={{flex:1,overflowY:"auto",maxHeight:250}}>
      {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontFamily:C.font}}>Loading...</div>:
      fil.length===0?<div style={{padding:20,textAlign:"center",color:C.m,fontFamily:C.font}}>No tasks</div>:
      fil.map(t=>{const isOd=t.status==="overdue";
        return<div key={t.id} style={{padding:"10px 14px",borderBottom:`1px solid ${C.bd}`,background:isOd?`${C.rd}08`:"transparent",display:"flex",gap:10,alignItems:"flex-start"}}>
          <div onClick={()=>t.status!=="completed"?upSt(t.id,"completed"):upSt(t.id,"pending")} style={{width:16,height:16,borderRadius:3,border:`2px solid ${t.status==="completed"?C.gn:C.bd}`,background:t.status==="completed"?C.gn:"transparent",cursor:"pointer",flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff"}}>{t.status==="completed"?"✓":""}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:t.status==="completed"?C.m:C.t,fontWeight:600,textDecoration:t.status==="completed"?"line-through":"none",marginBottom:3,fontFamily:C.font}}>{t.title}</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              <span style={{...S.pill(prC(t.priority)),fontSize:9}}>{t.priority}</span>
              <span style={{...S.pill(stC(t.status)),fontSize:9}}>{t.status.replace("_"," ")}</span>
              {t.assigned_to_name&&<span style={{fontSize:10,color:C.bl,fontFamily:C.font}}>→ {t.assigned_to_name}</span>}
              {t.due_date&&<span style={{fontSize:10,color:isOd?C.rd:C.m,fontFamily:C.font}}>Due {new Date(t.due_date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</span>}
            </div>
            {t.completion_remark&&<div style={{fontSize:10,color:C.gn,fontStyle:"italic",marginTop:3,fontFamily:C.font}}>✓ {t.completion_remark}</div>}
          </div>
          <div style={{display:"flex",gap:4}}>
            {t.status==="pending"&&<button onClick={()=>upSt(t.id,"in_progress")} style={{...S.sb("g"),padding:"2px 6px",fontSize:10}}>▶</button>}
            <button onClick={()=>{setEditI(t);setFm({title:t.title,description:t.description||"",priority:t.priority,assigned_to:t.assigned_to||"",assigned_to_name:t.assigned_to_name||"All",account_id:t.account_id||"",due_date:t.due_date||"",tags:(t.tags||[]).join(", ")});setShowA(true)}} style={{...S.sb("g"),padding:"2px 6px",fontSize:10}}>✎</button>
            <button onClick={()=>del(t.id)} style={{...S.sb("g"),padding:"2px 6px",fontSize:10,color:C.rd}}>✕</button>
          </div>
        </div>})}
    </div>
    {showA&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{setShowA(false);setEditI(null)}}>
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:20,width:"100%",maxWidth:500,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:14,fontFamily:C.font}}>{editI?"Edit":"New"} Task</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={S.lbl}>Title *</label><input style={S.inp} value={fm.title} onChange={e=>setFm({...fm,title:e.target.value})} placeholder="Task title..." autoFocus/></div>
          <div><label style={S.lbl}>Description</label><textarea style={{...S.inp,height:50,resize:"vertical"}} value={fm.description} onChange={e=>setFm({...fm,description:e.target.value})}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Priority</label><select style={S.inp} value={fm.priority} onChange={e=>setFm({...fm,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select></div>
            <div><label style={S.lbl}>Due Date</label><input type="date" style={S.inp} value={fm.due_date} onChange={e=>setFm({...fm,due_date:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Assign To</label><select style={S.inp} value={fm.assigned_to} onChange={e=>{const uid=e.target.value;const u=users.find(x=>x.id===uid);setFm({...fm,assigned_to:uid,assigned_to_name:u?(u.full_name||u.username):"All"})}}><option value="">— All —</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}</select></div>
            <div><label style={S.lbl}>Account</label><select style={S.inp} value={fm.account_id} onChange={e=>setFm({...fm,account_id:e.target.value})}><option value="">— None —</option>{accs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
          </div>
          <div><label style={S.lbl}>Tags</label><input style={S.inp} value={fm.tags} onChange={e=>setFm({...fm,tags:e.target.value})} placeholder="urgent, followup..."/></div>
          <div style={{display:"flex",gap:8}}><button style={S.bt("p")} onClick={save}>{editI?"Update":"Create"}</button><button style={S.bt("g")} onClick={()=>{setShowA(false);setEditI(null)}}>Cancel</button></div>
        </div>
      </div>
    </div>}
    {remarkModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{setRemarkModal(null);setRemarkText("")}}>
      <div style={{background:C.p,border:`1px solid ${remarkModal.type==="delete"?C.rd:C.gn}`,borderRadius:8,padding:20,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:remarkModal.type==="delete"?C.rd:C.gn,marginBottom:10,fontFamily:C.font}}>{remarkModal.type==="delete"?"🗑 Reason for Deletion":"✅ Completion Remark"}</div>
        <div style={{fontSize:12,color:C.m,marginBottom:10,fontFamily:C.font}}>Task: <strong style={{color:C.t}}>{remarkModal.todo?.title}</strong></div>
        <textarea style={{...S.inp,height:80,resize:"vertical"}} value={remarkText} onChange={e=>setRemarkText(e.target.value)} placeholder={remarkModal.type==="delete"?"Why is this being deleted?":"Describe the outcome..."} autoFocus/>
        <div style={{fontSize:11,color:C.d,margin:"8px 0",fontFamily:C.font}}>This will notify the assignee, creator, and admins.</div>
        <div style={{display:"flex",gap:8}}><button style={S.bt(remarkModal.type==="delete"?"d":"p")} onClick={remarkModal.type==="delete"?confirmDelete:confirmComplete}>{remarkModal.type==="delete"?"Confirm Delete":"Mark Complete"}</button><button style={S.bt("g")} onClick={()=>{setRemarkModal(null);setRemarkText("")}}>Cancel</button></div>
      </div>
    </div>}
  </div>;
}

function CollPanel({accs,isAdmin,C,S}){
  const[items,setItems]=useState([]);const[showA,setShowA]=useState(false);const[ld,setLd]=useState(true);const[mFlt,setMFlt]=useState("");
  const defF={account_id:"",invoice_number:"",invoice_month:"",invoice_date:"",due_date:"",amount:"",gst_amount:"",notes:""};
  const[fm,setFm]=useState(defF);
  const load=useCallback(async()=>{const d=await get("collections","?order=due_date.desc&limit=200");const now=new Date();setItems((d||[]).map(c=>(["pending","partial"].includes(c.status)&&c.due_date&&new Date(c.due_date)<now)?{...c,status:"overdue"}:c));setLd(false);},[]);
  useEffect(()=>{load()},[load]);
  const stC=s=>({pending:C.yl,partial:C.yl,collected:C.gn,overdue:C.rd,disputed:C.rd}[s]||C.m);
  const add=async()=>{if(!fm.account_id||!fm.invoice_number||!fm.amount)return;const ac=accs.find(a=>a.id===fm.account_id);const amt=Number(fm.amount)||0;const gst=Number(fm.gst_amount)||0;await post("collections",{...fm,account_name:ac?.client||"",amount:amt,gst_amount:gst,total_amount:amt+gst,collected_amount:0,status:"pending"});setShowA(false);setFm(defF);load();};
  const recPay=async(c,amount)=>{const nc=Number(c.collected_amount||0)+Number(amount);await patch("collections",`?id=eq.${c.id}`,{collected_amount:nc,status:nc>=Number(c.total_amount)?"collected":"partial",payment_date:new Date().toISOString().split("T")[0],updated_at:new Date().toISOString()});load();};
  const tot=items.reduce((s,c)=>s+Number(c.total_amount||0),0);const col=items.reduce((s,c)=>s+Number(c.collected_amount||0),0);
  const od=items.filter(c=>c.status==="overdue").reduce((s,c)=>s+(Number(c.total_amount)-Number(c.collected_amount||0)),0);
  const rate=tot?Math.round((col/tot)*100):0;
  const months=[...new Set(items.map(c=>c.invoice_month).filter(Boolean))].sort().reverse();
  const fl=mFlt?items.filter(c=>c.invoice_month===mFlt):items;
  const fM=n=>n?`₹${Number(n).toLocaleString("en-IN")}`:"₹0";
  return<div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:6,overflow:"hidden",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.codeBg}}>
      <span style={{fontSize:13,fontWeight:700,color:C.gn,fontFamily:C.font}}>💰 Collections</span>
      {isAdmin&&<button style={S.sb("p")} onClick={()=>setShowA(true)}>+ Invoice</button>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`,padding:"8px 12px",gap:4}}>
      {[["Invoiced",fM(tot),C.t],["Collected",fM(col),C.gn],["Pending",fM(tot-col),C.yl],["Overdue",fM(od),C.rd]].map(([l,v,c])=>
        <div key={l} style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:c,fontFamily:C.font}}>{v}</div><div style={{fontSize:10,color:C.m,fontFamily:C.font}}>{l}</div></div>)}
    </div>
    <div style={{padding:"6px 12px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}><div style={{width:`${rate}%`,height:"100%",background:rate>80?C.gn:rate>50?C.yl:C.rd,borderRadius:3}}/></div>
      <span style={{fontSize:11,fontWeight:700,color:rate>80?C.gn:rate>50?C.yl:C.rd,fontFamily:C.font,minWidth:32}}>{rate}%</span>
      <select style={{...S.inp,width:"auto",padding:"3px 8px",fontSize:11}} value={mFlt} onChange={e=>setMFlt(e.target.value)}><option value="">All months</option>{months.map(m=><option key={m} value={m}>{m}</option>)}</select>
    </div>
    <div style={{flex:1,overflowY:"auto",maxHeight:210}}>
      {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontFamily:C.font}}>Loading...</div>:
      fl.length===0?<div style={{padding:20,textAlign:"center",color:C.m,fontFamily:C.font}}>No invoices</div>:
      fl.map(c=>{const out=Number(c.total_amount)-Number(c.collected_amount||0);const pct=Number(c.total_amount)?Math.round((Number(c.collected_amount||0)/Number(c.total_amount))*100):0;
        return<div key={c.id} style={{padding:"10px 14px",borderBottom:`1px solid ${C.bd}`,background:c.status==="overdue"?`${C.rd}08`:"transparent"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:12,fontWeight:600,color:C.t,fontFamily:C.font}}>{c.invoice_number}</span><span style={{...S.pill(stC(c.status)),fontSize:9}}>{c.status}</span></div>
            <span style={{fontSize:12,fontWeight:700,color:C.g,fontFamily:C.font}}>{fM(c.total_amount)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,color:C.m,fontFamily:C.font}}>{c.account_name} · {c.invoice_month}</span><span style={{fontSize:11,color:out>0?C.yl:C.gn,fontFamily:C.font}}>{out>0?`${fM(out)} due`:"Paid"}</span></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{flex:1,height:4,background:C.bg,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?C.gn:C.g,borderRadius:2}}/></div>
            <span style={{fontSize:10,color:C.m,fontFamily:C.font,minWidth:28}}>{pct}%</span>
            {out>0&&isAdmin&&<button onClick={()=>{const amt=prompt(`Amount for ${c.invoice_number} (outstanding: ${fM(out)})`);if(amt&&Number(amt)>0)recPay(c,Number(amt))}} style={{...S.sb("p"),padding:"2px 8px",fontSize:10}}>💵 Pay</button>}
          </div>
        </div>})}
    </div>
    {showA&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowA(false)}>
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:20,width:"100%",maxWidth:500,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:14,fontFamily:C.font}}>New Invoice</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={S.lbl}>Account *</label><select style={S.inp} value={fm.account_id} onChange={e=>setFm({...fm,account_id:e.target.value})}><option value="">Select...</option>{accs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Invoice # *</label><input style={S.inp} value={fm.invoice_number} onChange={e=>setFm({...fm,invoice_number:e.target.value})} placeholder="INV-001" autoFocus/></div>
            <div><label style={S.lbl}>Month</label><input style={S.inp} value={fm.invoice_month} onChange={e=>setFm({...fm,invoice_month:e.target.value})} placeholder="Apr 2026"/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Invoice Date</label><input type="date" style={S.inp} value={fm.invoice_date} onChange={e=>setFm({...fm,invoice_date:e.target.value})}/></div>
            <div><label style={S.lbl}>Due Date</label><input type="date" style={S.inp} value={fm.due_date} onChange={e=>setFm({...fm,due_date:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Amount ₹ *</label><input type="number" style={S.inp} value={fm.amount} onChange={e=>setFm({...fm,amount:e.target.value})}/></div>
            <div><label style={S.lbl}>GST ₹</label><input type="number" style={S.inp} value={fm.gst_amount} onChange={e=>setFm({...fm,gst_amount:e.target.value})}/></div>
          </div>
          <div style={{display:"flex",gap:8}}><button style={S.bt("p")} onClick={add}>Create</button><button style={S.bt("g")} onClick={()=>setShowA(false)}>Cancel</button></div>
        </div>
      </div>
    </div>}
  </div>;
}

function PipePanel({accs,users,currentUser,isAdmin,C,S}){
  const[leads,setLeads]=useState([]);const[stages,setStages]=useState([]);const[tasks,setTasks]=useState([]);
  const[showA,setShowA]=useState(false);const[showT,setShowT]=useState(null);const[editL,setEditL]=useState(null);
  const[showCfg,setShowCfg]=useState(false);const[ld,setLd]=useState(true);const[vm,setVm]=useState("kanban");const[expL,setExpL]=useState(null);
  const load=useCallback(async()=>{const[l,s,t]=await Promise.all([get("sales_pipeline","?order=created_at.desc&limit=200"),get("pipeline_stages","?order=sort_order.asc"),get("pipeline_tasks","?order=created_at.desc&limit=500")]);setLeads(l||[]);setStages(s||[]);setTasks(t||[]);setLd(false);},[]);
  useEffect(()=>{load()},[load]);
  const defF={lead_name:"",company:"",contact_person:"",contact_phone:"",service_type:"",location:"",estimated_value:"",stage:"lead",assigned_to_name:"",expected_close_date:"",notes:""};
  const[fm,setFm]=useState(defF);
  const prC=p=>({critical:C.rd,high:"#f97316",normal:C.g,low:C.m}[p]||C.g);
  const fM=n=>n?`₹${Number(n).toLocaleString("en-IN")}`:"₹0";
  const save=async()=>{if(!fm.lead_name.trim())return;const sg=stages.find(s=>s.slug===fm.stage);const bd={...fm,estimated_value:Number(fm.estimated_value)||0,probability:sg?.probability||10,assigned_by_name:currentUser?.full_name||"Admin",expected_close_date:fm.expected_close_date||null};
    if(editL){bd.updated_at=new Date().toISOString();await patch("sales_pipeline",`?id=eq.${editL.id}`,bd)}else{bd.notified_at=new Date().toISOString();await post("sales_pipeline",bd)}
    setShowA(false);setEditL(null);setFm(defF);load();};
  const moveSt=async(id,ns)=>{const sg=stages.find(s=>s.slug===ns);const bd={stage:ns,probability:sg?.probability||10,updated_at:new Date().toISOString()};if(ns==="won"||ns==="lost")bd.closed_at=new Date().toISOString();await patch("sales_pipeline",`?id=eq.${id}`,bd);load();};
  const defTF={title:"",priority:"normal",assigned_to_name:"",due_date:""};const[tf,setTf]=useState(defTF);
  const addT=async pid=>{if(!tf.title.trim())return;await post("pipeline_tasks",{...tf,pipeline_id:pid,status:"pending",assigned_by_name:currentUser?.full_name||"Admin",notified_at:new Date().toISOString(),due_date:tf.due_date||null});setTf(defTF);load();};
  const[ns,setNs]=useState({name:"",color:"#d4a841",probability:50});
  const addSt=async()=>{if(!ns.name.trim())return;const sl=ns.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");const mx=stages.reduce((m,s)=>Math.max(m,s.sort_order||0),0);await post("pipeline_stages",{...ns,slug:sl,sort_order:mx+1,is_active:true});setNs({name:"",color:"#d4a841",probability:50});load();};
  const tV=leads.reduce((s,l)=>s+Number(l.estimated_value||0),0);const wonV=leads.filter(l=>l.stage==="won").reduce((s,l)=>s+Number(l.estimated_value||0),0);const actC=leads.filter(l=>!["won","lost"].includes(l.stage)).length;
  const actSt=stages.filter(s=>s.is_active);
  const dSince=d=>{if(!d)return 0;return Math.floor((new Date()-new Date(d))/864e5)};
  return<div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:6,overflow:"hidden",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.codeBg}}>
      <span style={{fontSize:13,fontWeight:700,color:C.yl,fontFamily:C.font}}>🚀 Sales Pipeline</span>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>setVm(v=>v==="kanban"?"list":"kanban")} style={{...S.sb("g"),padding:"3px 8px"}}>{vm==="kanban"?"☰ List":"▦ Board"}</button>
        {isAdmin&&<button onClick={()=>setShowCfg(true)} style={{...S.sb("g"),padding:"3px 8px"}}>⚙</button>}
        <button style={S.sb("p")} onClick={()=>{setEditL(null);setFm(defF);setShowA(true)}}>+ Lead</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`,padding:"8px 12px"}}>
      {[["Pipeline",fM(tV),C.t],["Won",fM(wonV),C.gn],["Active",actC,C.bl],["Stages",actSt.length,C.m]].map(([l,v,c])=>
        <div key={l} style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:c,fontFamily:C.font}}>{v}</div><div style={{fontSize:10,color:C.m,fontFamily:C.font}}>{l}</div></div>)}
    </div>
    <div style={{flex:1,overflowX:"auto",overflowY:"auto",maxHeight:260}}>
      {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontFamily:C.font}}>Loading...</div>:
      vm==="kanban"?<div style={{display:"flex",gap:2,padding:6,minWidth:actSt.length*160}}>
        {actSt.map(sg=>{const sl=leads.filter(l=>l.stage===sg.slug);
          return<div key={sg.id} style={{flex:1,minWidth:150,background:C.bg,borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"6px 8px",background:`${sg.color}20`,borderBottom:`2px solid ${sg.color}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:sg.color,fontFamily:C.font}}>{sg.name}</span>
              <span style={{background:`${sg.color}30`,color:sg.color,padding:"1px 6px",borderRadius:8,fontSize:10,fontWeight:700}}>{sl.length}</span>
            </div>
            <div style={{padding:4,display:"flex",flexDirection:"column",gap:3,maxHeight:200,overflowY:"auto"}}>
              {sl.map(l=>{const lt=tasks.filter(t=>t.pipeline_id===l.id);
                return<div key={l.id} style={{background:C.p,padding:"7px 8px",border:`1px solid ${C.bd}`,borderRadius:4,cursor:"pointer"}} onClick={()=>setExpL(expL===l.id?null:l.id)}>
                  <div style={{fontSize:12,fontWeight:600,color:C.t,marginBottom:2,fontFamily:C.font}}>{l.lead_name}</div>
                  {l.company&&<div style={{fontSize:10,color:C.m,fontFamily:C.font}}>{l.company}</div>}
                  <div style={{fontSize:12,fontWeight:700,color:C.g,fontFamily:C.font}}>{fM(l.estimated_value)}</div>
                  {l.assigned_to_name&&<div style={{fontSize:10,color:C.bl,fontFamily:C.font}}>→ {l.assigned_to_name}</div>}
                  {lt.length>0&&<div style={{fontSize:10,color:C.m,fontFamily:C.font}}>📋 {lt.filter(t=>t.status==="completed").length}/{lt.length}</div>}
                  {expL===l.id&&<div style={{marginTop:6,borderTop:`1px solid ${C.bd}`,paddingTop:6}} onClick={e=>e.stopPropagation()}>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
                      {actSt.filter(s=>s.slug!==l.stage).map(s=><button key={s.slug} onClick={()=>moveSt(l.id,s.slug)} style={{fontSize:10,padding:"2px 6px",background:`${s.color}20`,color:s.color,border:`1px solid ${s.color}40`,borderRadius:3,cursor:"pointer",fontFamily:C.font}}>{s.name.slice(0,8)}</button>)}
                    </div>
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>{setEditL(l);setFm({lead_name:l.lead_name,company:l.company||"",contact_person:l.contact_person||"",contact_phone:l.contact_phone||"",service_type:l.service_type||"",location:l.location||"",estimated_value:l.estimated_value||"",stage:l.stage,assigned_to_name:l.assigned_to_name||"",expected_close_date:l.expected_close_date||"",notes:l.notes||""});setShowA(true)}} style={{...S.sb("g"),padding:"2px 6px",fontSize:10}}>✎</button>
                      <button onClick={()=>setShowT(l.id)} style={{...S.sb("g"),padding:"2px 6px",fontSize:10,color:C.bl}}>📋</button>
                      <button onClick={async()=>{if(confirm("Delete lead?"))await rm("sales_pipeline",`?id=eq.${l.id}`);load();}} style={{...S.sb("g"),padding:"2px 6px",fontSize:10,color:C.rd}}>✕</button>
                    </div>
                  </div>}
                </div>})}
              {sl.length===0&&<div style={{textAlign:"center",padding:12,fontSize:11,color:C.d,fontFamily:C.font}}>Empty</div>}
            </div>
          </div>})}
      </div>:
      <div>{leads.map(l=>{const sg=stages.find(s=>s.slug===l.stage);const lt=tasks.filter(t=>t.pipeline_id===l.id);const days=dSince(l.notified_at);
        return<div key={l.id} style={{padding:"10px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",gap:10,alignItems:"center"}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.t,fontFamily:C.font,marginBottom:2}}>{l.lead_name}{l.company&&<span style={{fontSize:11,color:C.m,marginLeft:6}}>{l.company}</span>}</div>
            <div style={{display:"flex",gap:6}}><span style={{background:`${sg?.color||C.g}20`,color:sg?.color||C.g,padding:"1px 8px",borderRadius:8,fontSize:10,fontFamily:C.font,fontWeight:700}}>{sg?.name||l.stage}</span>{l.assigned_to_name&&<span style={{fontSize:11,color:C.bl,fontFamily:C.font}}>→ {l.assigned_to_name}</span>}</div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:C.g,fontFamily:C.font}}>{fM(l.estimated_value)}</div><div style={{fontSize:10,color:C.m,fontFamily:C.font}}>{days}d{lt.length>0&&` · 📋${lt.filter(t=>t.status==="completed").length}/${lt.length}`}</div></div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>{setEditL(l);setFm({lead_name:l.lead_name,company:l.company||"",contact_person:l.contact_person||"",contact_phone:l.contact_phone||"",service_type:l.service_type||"",location:l.location||"",estimated_value:l.estimated_value||"",stage:l.stage,assigned_to_name:l.assigned_to_name||"",expected_close_date:l.expected_close_date||"",notes:l.notes||""});setShowA(true)}} style={{...S.sb("g"),padding:"3px 8px"}}>✎</button>
            <button onClick={()=>setShowT(l.id)} style={{...S.sb("g"),padding:"3px 8px",color:C.bl}}>📋</button>
            <button onClick={async()=>{if(confirm("Delete?"))await rm("sales_pipeline",`?id=eq.${l.id}`);load();}} style={{...S.sb("g"),padding:"3px 8px",color:C.rd}}>✕</button>
          </div>
        </div>})}</div>}
    </div>
    {showA&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>{setShowA(false);setEditL(null)}}>
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:20,width:"100%",maxWidth:520,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:14,fontFamily:C.font}}>{editL?"Edit":"New"} Lead</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={S.lbl}>Lead Name *</label><input style={S.inp} value={fm.lead_name} onChange={e=>setFm({...fm,lead_name:e.target.value})} autoFocus/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Company</label><input style={S.inp} value={fm.company} onChange={e=>setFm({...fm,company:e.target.value})}/></div>
            <div><label style={S.lbl}>Service</label><input style={S.inp} value={fm.service_type} onChange={e=>setFm({...fm,service_type:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Contact</label><input style={S.inp} value={fm.contact_person} onChange={e=>setFm({...fm,contact_person:e.target.value})}/></div>
            <div><label style={S.lbl}>Phone</label><input style={S.inp} value={fm.contact_phone} onChange={e=>setFm({...fm,contact_phone:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Location</label><input style={S.inp} value={fm.location} onChange={e=>setFm({...fm,location:e.target.value})}/></div>
            <div><label style={S.lbl}>Value ₹</label><input type="number" style={S.inp} value={fm.estimated_value} onChange={e=>setFm({...fm,estimated_value:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>Stage</label><select style={S.inp} value={fm.stage} onChange={e=>setFm({...fm,stage:e.target.value})}>{actSt.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></div>
            <div><label style={S.lbl}>Assign To</label><select style={S.inp} value={fm.assigned_to_name} onChange={e=>setFm({...fm,assigned_to_name:e.target.value})}><option value="">—</option>{users.map(u=><option key={u.id} value={u.full_name}>{u.full_name}</option>)}</select></div>
          </div>
          <div><label style={S.lbl}>Expected Close</label><input type="date" style={S.inp} value={fm.expected_close_date} onChange={e=>setFm({...fm,expected_close_date:e.target.value})}/></div>
          <div><label style={S.lbl}>Notes</label><textarea style={{...S.inp,height:50,resize:"vertical"}} value={fm.notes} onChange={e=>setFm({...fm,notes:e.target.value})}/></div>
          <div style={{display:"flex",gap:8}}><button style={S.bt("p")} onClick={save}>{editL?"Update":"Create"}</button><button style={S.bt("g")} onClick={()=>{setShowA(false);setEditL(null)}}>Cancel</button></div>
        </div>
      </div>
    </div>}
    {showT&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowT(null)}>
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:20,width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:12,fontFamily:C.font}}>Pipeline Tasks</div>
        {tasks.filter(t=>t.pipeline_id===showT).map(t=><div key={t.id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.bd}`}}>
          <span onClick={async()=>{const s=t.status==="completed"?"pending":"completed";await patch("pipeline_tasks",`?id=eq.${t.id}`,{status:s,updated_at:new Date().toISOString(),...(s==="completed"?{completed_at:new Date().toISOString()}:{})});load();}} style={{cursor:"pointer",fontSize:16}}>{t.status==="completed"?"☑":"☐"}</span>
          <div style={{flex:1}}><div style={{fontSize:12,color:t.status==="completed"?C.m:C.t,textDecoration:t.status==="completed"?"line-through":"none",fontFamily:C.font}}>{t.title}</div>
            <div style={{fontSize:10,color:C.d,fontFamily:C.font}}>{t.assigned_to_name&&`→ ${t.assigned_to_name}`}{t.due_date&&` · Due ${new Date(t.due_date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}`}</div></div>
          <span style={{...S.pill(prC(t.priority)),fontSize:9}}>{t.priority}</span>
          <button onClick={async()=>{await rm("pipeline_tasks",`?id=eq.${t.id}`);load();}} style={{...S.sb("g"),padding:"2px 6px",color:C.rd,fontSize:10}}>✕</button>
        </div>)}
        <div style={{borderTop:`1px solid ${C.bd}`,paddingTop:10,marginTop:10}}>
          <label style={S.lbl}>Add Task</label>
          <input style={{...S.inp,marginBottom:8}} placeholder="Task title..." value={tf.title} onChange={e=>setTf({...tf,title:e.target.value})}/>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <select style={{...S.inp,flex:1}} value={tf.priority} onChange={e=>setTf({...tf,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p[0].toUpperCase()+p.slice(1)}</option>)}</select>
            <select style={{...S.inp,flex:1}} value={tf.assigned_to_name} onChange={e=>setTf({...tf,assigned_to_name:e.target.value})}><option value="">Assign to...</option>{users.map(u=><option key={u.id} value={u.full_name}>{u.full_name}</option>)}</select>
            <input type="date" style={{...S.inp,flex:1}} value={tf.due_date} onChange={e=>setTf({...tf,due_date:e.target.value})}/>
          </div>
          <button style={S.bt("p")} onClick={()=>addT(showT)}>Add Task</button>
        </div>
        <button style={{...S.bt("g"),marginTop:10,width:"100%"}} onClick={()=>setShowT(null)}>Close</button>
      </div>
    </div>}
    {showCfg&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowCfg(false)}>
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,padding:20,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:15,fontWeight:700,color:C.t,marginBottom:12,fontFamily:C.font}}>Configure Stages</div>
        {stages.map(s=><div key={s.id} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.bd}`}}>
          <div style={{width:12,height:12,borderRadius:3,background:s.color}}/><span style={{flex:1,fontSize:12,color:C.t,fontFamily:C.font}}>{s.name}</span><span style={{fontSize:11,color:C.m,fontFamily:C.font}}>{s.probability}%</span>
          {!["lead","won","lost"].includes(s.slug)&&<button onClick={async()=>{await rm("pipeline_stages",`?id=eq.${s.id}`);load();}} style={{...S.sb("g"),padding:"2px 6px",color:C.rd,fontSize:10}}>✕</button>}
        </div>)}
        <div style={{borderTop:`1px solid ${C.bd}`,paddingTop:10,marginTop:10}}>
          <label style={S.lbl}>Add Stage</label>
          <div style={{display:"flex",gap:6,marginTop:6}}>
            <input style={{...S.inp,flex:1}} placeholder="Name..." value={ns.name} onChange={e=>setNs({...ns,name:e.target.value})}/>
            <input type="color" style={{width:36,height:36,padding:2,background:C.p,border:`1px solid ${C.bd}`,borderRadius:4,cursor:"pointer"}} value={ns.color} onChange={e=>setNs({...ns,color:e.target.value})}/>
            <input type="number" style={{...S.inp,width:52}} placeholder="%" value={ns.probability} onChange={e=>setNs({...ns,probability:Number(e.target.value)})}/>
            <button style={S.bt("p")} onClick={addSt}>Add</button>
          </div>
        </div>
        <button style={{...S.bt("g"),marginTop:10,width:"100%"}} onClick={()=>setShowCfg(false)}>Close</button>
      </div>
    </div>}
  </div>;
}

// ═══════════════════════
// MAIN APP
// ═══════════════════════
export default function App(){
  const[darkMode,setDarkMode]=useState(()=>localStorage.getItem("bbcss_theme")!=="light");
  const C=darkMode?DARK:LIGHT;
  const S=mkStyles(C);

  const toggleTheme=()=>{ const next=!darkMode; setDarkMode(next); localStorage.setItem("bbcss_theme",next?"dark":"light"); };

  const[user,setUser]=useState(null);const[lErr,setLE]=useState("");const[lU,setLU]=useState("");const[lP,setLP]=useState("");const[lding,setLding]=useState(false);
  const[accs,setAccs]=useState([]);const[stg,setStg]=useState(DS);const[stgId,setStgId]=useState(null);const[loaded,setLoaded]=useState(false);const[syncing,setSyncing]=useState(false);
  const[view,setView]=useState("dashboard");const[selId,setSelId]=useState(null);const[showFrm,setSF]=useState(false);const[fd,setFD]=useState(null);const[eMode,setEM]=useState(false);
  const[flt,setFlt]=useState("All");const[srch,setSrch]=useState("");const[sTab,setSTab]=useState("general");const[toast,setToast]=useState(null);
  const[users,setUsers]=useState([]);const[showUF,setSUF]=useState(false);
  const defUF={username:"",password:"",full_name:"",role:"user",scope_level:"org",scope_branch:"",view_permissions:{dashboard:true,command:true,analytics:true,notifications:true}};
  const[uf,setUF]=useState(defUF);
  const[pwModal,setPwModal]=useState({open:false,user:null});const[pwVal,setPwVal]=useState("");const[pwVal2,setPwVal2]=useState("");const[pwErr,setPwErr]=useState("");
  const[delUserModal,setDelUserModal]=useState({open:false,user:null});
  const[notifs,setNotifs]=useState([]);const[notifTick,setNotifTick]=useState(0);
  const[allTodos,setAllTodos]=useState([]);const[allTaskUpdates,setAllTaskUpdates]=useState([]);
  const[selTaskId,setSelTaskId]=useState(null);const[taskFilter,setTaskFilter]=useState("active");const[taskSearch,setTaskSearch]=useState("");const[taskAssigneeFlt,setTaskAssigneeFlt]=useState("all");
  const[showTaskForm,setShowTaskForm]=useState(false);const[editTask,setEditTask]=useState(null);
  const defTaskForm={title:"",description:"",priority:"normal",assigned_to:"",assigned_to_name:"",account_id:"",due_date:"",tags:""};
  const[taskForm,setTaskForm]=useState(defTaskForm);const[updateText,setUpdateText]=useState("");const[updateStatus,setUpdateStatus]=useState("");

  const tw=m=>{setToast(m);setTimeout(()=>setToast(null),2500)};
  const isSA=user?.role==="superadmin";const isA=user?.role==="admin"||isSA;
  const uScope=user?.scope_level||"org";const uBranch=user?.scope_branch||"";
  const canSee=v=>isA||(user?.view_permissions||{})[v]!==false;
  const inScope=a=>{if(isSA||uScope==="org")return true;if(uScope==="branch")return a.branch===uBranch;if(uScope==="site")return a.field_officer_id===user.id;return false};

  const doLogin=async()=>{setLding(true);setLE("");const res=await rpc("acm_login",{p_username:lU,p_password:lP});if(res&&res.length>0)setUser(res[0]);else setLE("Invalid credentials");setLding(false);};

  const loadAll=useCallback(async()=>{try{setSyncing(true);const[ac,sa]=await Promise.all([get("accounts","?order=account_id.asc"),get("account_settings","?limit=1")]);const enr=await Promise.all(ac.map(async a=>{const[py,dc]=await Promise.all([get("account_payments",`?account_id=eq.${a.id}&order=payment_date.desc`),get("account_documents",`?account_id=eq.${a.id}&order=uploaded_at.desc`)]);return{...a,_p:py||[],_d:dc||[]}}));setAccs(enr);if(sa.length>0){setStg({...DS,...sa[0].settings_data});setStgId(sa[0].id)}}catch(e){console.error(e)}setSyncing(false);setLoaded(true)},[]);
  const loadUsers=async()=>{const u=await get("acm_users","?order=created_at.asc");setUsers(u)};
  const loadTasks=useCallback(async()=>{const[t,u]=await Promise.all([get("todos","?order=created_at.desc&limit=500"),get("task_updates","?order=created_at.asc&limit=2000")]);const now=new Date();setAllTodos((t||[]).map(task=>(["pending","in_progress"].includes(task.status)&&task.due_date&&new Date(task.due_date)<now)?{...task,status:"overdue"}:task));setAllTaskUpdates(u||[])},[]);
  const loadNotifs=useCallback(async()=>{if(!user?.id)return;const n=await get("todo_notifications",`?recipient_id=eq.${user.id}&order=created_at.desc&limit=50`);setNotifs(n||[])},[user?.id]);

  useEffect(()=>{if(user){loadAll();loadUsers();loadNotifs();loadTasks();rpc("cleanup_old_todo_notifications",{}).catch(()=>{});const iv=setInterval(()=>setNotifTick(t=>t+1),45000);return()=>clearInterval(iv)}},[user,loadAll,loadNotifs,loadTasks]);
  useEffect(()=>{if(notifTick>0){loadNotifs();loadTasks()}},[notifTick,loadNotifs,loadTasks]);

  const markAllNotifsRead=async()=>{if(!user?.id)return;await patch("todo_notifications",`?recipient_id=eq.${user.id}&is_read=eq.false`,{is_read:true});setNotifs(prev=>prev.map(n=>({...n,is_read:true})));tw("All marked read")};
  const unreadNotifCount=notifs.filter(n=>!n.is_read).length;
  const uS=async p=>{const u={...stg,...p};setStg(u);if(stgId)await patch("account_settings",`?id=eq.${stgId}`,{settings_data:u});tw("Saved")};

  const mkE=()=>({account_id:"",account_code:"",client:"",location:"",service_type:stg.serviceTypes[0]||"",contract_value:0,billing_cycle:stg.defaultBillingCycle,contract_start:"",contract_end:"",invoice_day:stg.invoiceDayDefault,payment_terms:stg.defaultPaymentTerms,status:stg.defaultStatus,health:stg.defaultHealth,staff_breakdown:Object.fromEntries(stg.staffRoles.map(r=>[r.key,{required:0,deployed:0}])),pending_amount:0,compliance_status:Object.fromEntries(stg.complianceItems.map(c=>[c.key,false])),contacts:[{name:"",phone:"",role:"POC"}],notes:stg.notesTemplate,renewal_status:stg.renewalStatuses?.[0]||"Pending",branch:stg.branches?.[0]||"",rate_revision:0,field_officer_id:null,custom_data:{},_p:[],_d:[]});
  const saveAcc=async()=>{if(!fd)return;setSyncing(true);if(eMode){const{_p,_d,id,created_at,updated_at,...rest}=fd;await patch("accounts",`?id=eq.${fd.id}`,rest)}else{const nums=accs.map(a=>parseInt(a.account_id.replace("ACC-",""))||0);const nx=Math.max(0,...nums)+1;const{_p,_d,id,...rest}=fd;await post("accounts",{...rest,account_id:`ACC-${String(nx).padStart(3,"0")}`})}await loadAll();setSF(false);setEM(false);setSyncing(false);tw(eMode?"Updated":"Created")};
  const delAcc=async id=>{setSyncing(true);await rm("accounts",`?id=eq.${id}`);await loadAll();setSelId(null);setView("dashboard");setSyncing(false);tw("Deleted")};
  const updA=async(id,p)=>{await patch("accounts",`?id=eq.${id}`,p);setAccs(prev=>prev.map(a=>a.id===id?{...a,...p}:a))};
  const recPay=async(uid,amt,ref,note)=>{setSyncing(true);await post("account_payments",{account_id:uid,payment_date:new Date().toISOString().split("T")[0],amount:amt,reference:ref,note});const ac=accs.find(a=>a.id===uid);if(ac)await patch("accounts",`?id=eq.${uid}`,{pending_amount:Math.max(0,Number(ac.pending_amount)-amt)});await loadAll();setSyncing(false);tw(`${stg.currency.symbol}${amt.toLocaleString()} recorded`)};
  const upDoc=async(uid,f)=>{if(f.size>5e6){tw("Max 5MB");return}setSyncing(true);const p=`${uid}/${Date.now()}_${f.name}`;if(await upFile(p,f)){await post("account_documents",{account_id:uid,file_name:f.name,file_type:f.type,file_size:f.size,storage_path:p});await loadAll();tw("Uploaded")}else tw("Failed");setSyncing(false)};
  const rmDoc=async(did,sp)=>{setSyncing(true);await rmFile(sp);await rm("account_documents",`?id=eq.${did}`);await loadAll();setSyncing(false);tw("Removed")};

  const createUser=async()=>{try{if(!uf.username||!uf.password){tw("Username & password required");return}const res=await rpc("acm_create_user",{p_username:uf.username,p_password:uf.password,p_full_name:uf.full_name,p_role:uf.role,p_state:"HQ",p_scope_level:uf.scope_level,p_scope_branch:uf.scope_branch,p_view_permissions:uf.view_permissions});if(res&&res.length>0){await loadUsers();setSUF(false);setUF(defUF);tw("User created")}else tw("Failed — username may exist")}catch(err){tw(err.message||"Error")}};
  const toggleUser=async(id,active)=>{await patch("acm_users",`?id=eq.${id}`,{is_active:!active});await loadUsers();tw(active?"Deactivated":"Activated")};
  const changeRole=async(id,role)=>{await patch("acm_users",`?id=eq.${id}`,{role});await loadUsers();tw("Role updated")};
  const updateUserField=async(id,data)=>{await patch("acm_users",`?id=eq.${id}`,data);await loadUsers();tw("Updated")};
  const vpToggle=async(u,key)=>{const vp={...(u.view_permissions||{dashboard:true,command:true,analytics:true,notifications:true})};vp[key]=!vp[key];await updateUserField(u.id,{view_permissions:vp})};
  const resetUserPassword=async(userId,pw)=>{const r=await rpc("acm_reset_password",{p_user_id:userId,p_new_password:pw});return r===true||r};
  const hardDeleteUser=async(userId)=>{const r=await rpc("acm_delete_user",{p_user_id:userId});if(r){await loadUsers();return true}return false};

  const notifyTaskEvent=async(task,eventType,message,remark)=>{if(!task)return;const recipients=new Set();if(task.assigned_to)recipients.add(task.assigned_to);if(task.assigned_by)recipients.add(task.assigned_by);(users||[]).filter(u=>u.role==="admin"&&u.is_active).forEach(u=>recipients.add(u.id));if(user?.id)recipients.delete(user.id);const rows=[...recipients].map(rid=>({recipient_id:rid,todo_id:task.id,todo_title:task.title,event_type:eventType,message,remark:remark||null,actor_id:user?.id||null,actor_name:user?.full_name||"System"}));if(rows.length>0){await post("todo_notifications",rows);loadNotifs()}};
  const saveTask=async()=>{if(!taskForm.title.trim()){tw("Title required");return}const ac=accs.find(a=>a.id===taskForm.account_id);const bd={title:taskForm.title,description:taskForm.description,priority:taskForm.priority,assigned_to:taskForm.assigned_to||null,assigned_to_name:taskForm.assigned_to_name||"All",account_id:taskForm.account_id||null,account_name:ac?.client||"",due_date:taskForm.due_date||null,tags:taskForm.tags?taskForm.tags.split(",").map(t=>t.trim()).filter(Boolean):[],assigned_by:user?.id||null,assigned_by_name:user?.full_name||"Admin"};setSyncing(true);if(editTask){bd.updated_at=new Date().toISOString();const res=await patch("todos",`?id=eq.${editTask.id}`,bd);const updated=(res&&res[0])||{...editTask,...bd};if(editTask.assigned_to!==bd.assigned_to)await notifyTaskEvent(updated,"reassigned",`Task reassigned to ${bd.assigned_to_name}`);}else{bd.notified_at=new Date().toISOString();bd.status="pending";const res=await post("todos",bd);if(res&&res[0])await notifyTaskEvent(res[0],"assigned",`New task: ${bd.title}`);}await loadTasks();setShowTaskForm(false);setEditTask(null);setTaskForm(defTaskForm);setSyncing(false);tw(editTask?"Updated":"Created")};
  const delTask=async(id)=>{const task=allTodos.find(t=>t.id===id);const reason=prompt("Reason for deletion:");if(!reason?.trim())return;setSyncing(true);if(task)await notifyTaskEvent(task,"deleted",`Deleted: ${task.title}`,reason.trim());await rm("todos",`?id=eq.${id}`);await loadTasks();if(selTaskId===id)setSelTaskId(null);setSyncing(false);tw("Deleted")};
  const postTaskUpdate=async(taskId)=>{if(!updateText.trim()){tw("Update required");return}const task=allTodos.find(t=>t.id===taskId);if(!task)return;setSyncing(true);await post("task_updates",{todo_id:taskId,update_text:updateText.trim(),status_change:updateStatus||null,author_id:user?.id||null,author_name:user?.full_name||"Unknown"});if(updateStatus&&updateStatus!==task.status){const pb={status:updateStatus,updated_at:new Date().toISOString()};if(updateStatus==="completed"){pb.completed_at=new Date().toISOString();pb.completion_remark=updateText.trim()}await patch("todos",`?id=eq.${taskId}`,pb);await notifyTaskEvent(task,"status_changed",`Status → ${updateStatus}`,updateText.trim())}else await notifyTaskEvent(task,"remark_added",`Update on: ${task.title}`,updateText.trim());setUpdateText("");setUpdateStatus("");await loadTasks();setSyncing(false);tw("Posted")};
  const delTaskUpdate=async(id)=>{if(!confirm("Delete update?"))return;await rm("task_updates",`?id=eq.${id}`);await loadTasks();tw("Removed")};

  const scopedAccs=accs.filter(inScope);
  const sel=accs.find(a=>a.id===selId);
  const fil=scopedAccs.filter(a=>{const mf=flt==="All"||a.health===flt||a.status===flt||a.branch===flt;const ms=a.client.toLowerCase().includes(srch.toLowerCase())||(a.location||"").toLowerCase().includes(srch.toLowerCase())||(a.account_code||"").toLowerCase().includes(srch.toLowerCase());return mf&&ms});
  const totCV=scopedAccs.reduce((s,a)=>s+Number(a.contract_value),0);const totP=scopedAccs.reduce((s,a)=>s+Number(a.pending_amount),0);const totR=scopedAccs.reduce((s,a)=>s+tS(a.staff_breakdown,"required"),0);const totD=scopedAccs.reduce((s,a)=>s+tS(a.staff_breakdown,"deployed"),0);
  const renS=scopedAccs.filter(a=>{const d=dTo(a.contract_end);return d<=stg.alertThresholds.renewalDays&&d>0}).length;
  const cGap=scopedAccs.filter(a=>Object.values(a.compliance_status||{}).some(v=>!v)).length;
  const totCol=scopedAccs.reduce((s,a)=>s+(a._p||[]).reduce((ps,p)=>ps+Number(p.amount),0),0);const totBil=totCol+totP;const cR=totBil>0?(totCol/totBil)*100:100;
  const actA=scopedAccs.filter(a=>a.status==="Active");const dso=actA.length>0?actA.reduce((s,a)=>{if(!a._p?.length)return s+a.payment_terms;return s+dSn(a._p[0].payment_date)},0)/actA.length:0;
  const ag={c:0,d3:0,d6:0,o9:0};scopedAccs.forEach(a=>{if(Number(a.pending_amount)<=0)return;const lp=a._p?.[0]?.payment_date||a.contract_start;const d=dSn(lp);if(d<=30)ag.c+=Number(a.pending_amount);else if(d<=60)ag.d3+=Number(a.pending_amount);else if(d<=90)ag.d6+=Number(a.pending_amount);else ag.o9+=Number(a.pending_amount)});
  const xCSV=()=>{const c=mkCSV(scopedAccs,stg,users);const b=new Blob([c],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`bbcss_${new Date().toISOString().split("T")[0]}.csv`;a.click();tw("Exported")};

  useEffect(()=>{if(!user)return;const needsPerm=["dashboard","command","analytics","notifications"];if(needsPerm.includes(view)&&!canSee(view)){const first=needsPerm.find(v=>canSee(v));if(first)setView(first);else if(isA)setView("users")}},[user,view]);// eslint-disable-line

  if(!user)return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:C.font,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{border:`2px solid ${C.g}`,background:C.p,borderRadius:12,padding:40,width:360,textAlign:"center",animation:"fadeIn .4s ease-out",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}}>
        <div style={{fontSize:28,fontWeight:800,color:C.g,letterSpacing:2,marginBottom:4,fontFamily:C.font}}>BBCSS</div>
        <div style={{fontSize:12,color:C.m,marginBottom:30,fontFamily:C.font}}>Account Management System</div>
        <div style={{marginBottom:12}}><input style={{...S.inp,textAlign:"center",fontSize:14}} placeholder="Username" value={lU} onChange={e=>setLU(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
        <div style={{marginBottom:12}}><input style={{...S.inp,textAlign:"center",fontSize:14}} placeholder="Password" type="password" value={lP} onChange={e=>setLP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
        {lErr&&<div style={{color:C.rd,fontSize:12,marginBottom:10,fontFamily:C.font}}>{lErr}</div>}
        <button style={{...S.bt("p"),width:"100%",fontSize:14,padding:"10px 0"}} onClick={doLogin} disabled={lding}>{lding?"Authenticating...":"Login"}</button>
        <div style={{marginTop:16}}><button onClick={toggleTheme} style={{background:"none",border:"none",cursor:"pointer",color:C.m,fontSize:12,fontFamily:C.font}}>{darkMode?"☀ Light mode":"🌙 Dark mode"}</button></div>
      </div>
    </div>);

  if(!loaded)return<div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.g,fontFamily:C.font,flexDirection:"column",gap:12}}><div style={{fontSize:16}}>Loading BBCSS...</div></div>;

  const prC=p=>({critical:C.rd,high:"#f97316",normal:C.g,low:C.m}[p]||C.g);
  const stC=s=>({pending:C.yl,in_progress:C.bl,completed:C.gn,overdue:C.rd,cancelled:C.m}[s]||C.g);

  const Dash=()=><>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
      {[{l:"Active Accounts",v:actA.length,s:`${scopedAccs.length} total`,c:C.g},{l:"Monthly Revenue",v:$f(totCV/12,stg.currency),s:`ACV ${$f(totCV,stg.currency)}`,c:C.g},{l:"Receivables",v:$f(totP,stg.currency),s:`${cR.toFixed(0)}% collected`,c:totP>0?C.yl:C.gn},{l:"Staff",v:`${totD}/${totR}`,s:totD<totR?`${totR-totD} short`:"Full",c:totD<totR?C.yl:C.gn},{l:"Avg DSO",v:`${dso.toFixed(0)}d`,s:dso<45?"Healthy":"Review",c:dso<45?C.gn:C.yl}].map((x,i)=>
        <div key={i} style={{background:C.p,border:`1px solid ${C.bd}`,padding:16,borderRadius:8}}>
          <div style={{fontSize:11,color:C.m,fontFamily:C.font,marginBottom:4}}>{x.l}</div>
          <div style={{fontSize:26,fontWeight:700,color:x.c,fontFamily:C.font}}>{x.v}</div>
          <div style={{fontSize:11,color:C.d,fontFamily:C.font}}>{x.s}</div>
        </div>)}
    </div>
    {(renS>0||cGap>0||ag.o9>0)&&<div style={{background:`${C.yl}15`,border:`1px solid ${C.yl}`,borderRadius:8,padding:14,marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:C.yl,marginBottom:6,fontFamily:C.font}}>⚠ Alerts</div>
      {renS>0&&<div style={{color:C.yl,fontSize:12,marginBottom:3,fontFamily:C.font}}>• {renS} contract(s) expiring within {stg.alertThresholds.renewalDays} days</div>}
      {cGap>0&&<div style={{color:C.rd,fontSize:12,marginBottom:3,fontFamily:C.font}}>• {cGap} compliance gap(s)</div>}
      {ag.o9>0&&<div style={{color:C.rd,fontSize:12,fontFamily:C.font}}>• {$f(ag.o9,stg.currency)} overdue 90+ days</div>}
    </div>}
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <input style={{...S.inp,width:220,flexShrink:0}} placeholder="Search client / code..." value={srch} onChange={e=>setSrch(e.target.value)}/>
      {["All",...stg.healthStatuses.map(h=>h.key),...stg.accountStatuses,...(stg.branches||[])].map(f=><button key={f} style={S.nb(flt===f)} onClick={()=>setFlt(f)}>{f}</button>)}
      <div style={{flex:1}}/><button style={S.sb("s")} onClick={xCSV}>📥 CSV</button><button style={S.sb("s")} onClick={loadAll}>🔄</button>
      {isA&&<button style={S.bt("p")} onClick={()=>{setFD(mkE());setEM(false);setSF(true)}}>+ New Account</button>}
    </div>
    <div style={{overflowX:"auto",borderRadius:8,border:`1px solid ${C.bd}`}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Client","Code","Branch","Field Officer","Health","Contract","Staff","Pending","Renewal","Compliance"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>
      {fil.map(a=>{const d=dTo(a.contract_end),sr=tS(a.staff_breakdown,"required"),sd=tS(a.staff_breakdown,"deployed"),ok=Object.values(a.compliance_status||{}).every(Boolean);
        return<tr key={a.id} style={{cursor:"pointer"}} onClick={()=>{setSelId(a.id);setView("detail")}} onMouseEnter={e=>e.currentTarget.style.background=C.rowHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={S.td}><div style={{fontWeight:600,fontFamily:C.font}}>{a.client}</div><div style={{fontSize:11,color:C.d,fontFamily:C.font}}>{a.account_id} · {a.location}</div></td>
          <td style={{...S.td,color:C.bl,fontWeight:600,fontFamily:C.font}}>{a.account_code||"—"}</td>
          <td style={{...S.td,color:C.m,fontFamily:C.font}}>{a.branch||"—"}</td>
          <td style={{...S.td,fontFamily:C.font}}>{a.field_officer_id?<span style={{color:C.g,fontWeight:600}}>👤 {foName(a.field_officer_id,users)}</span>:<span style={{color:C.d}}>—</span>}</td>
          <td style={S.td}><span style={{...S.dot(hC(a.health,stg.healthStatuses))}}/><span style={{fontFamily:C.font}}>{a.health}</span></td>
          <td style={{...S.td,color:C.g,fontWeight:600,fontFamily:C.font}}>{$f(Number(a.contract_value),stg.currency)}/yr</td>
          <td style={S.td}><span style={{color:sd<sr?C.yl:C.gn,fontFamily:C.font}}>{sd}</span><span style={{color:C.d,fontFamily:C.font}}>/{sr}</span></td>
          <td style={{...S.td,color:Number(a.pending_amount)>0?C.yl:C.gn,fontFamily:C.font}}>{$f(Number(a.pending_amount),stg.currency)}</td>
          <td style={S.td}><span style={{...S.pill(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}}>{d}d</span></td>
          <td style={S.td}><span style={{...S.pill(ok?C.gn:C.rd)}}>{ok?"OK":"Gaps"}</span></td>
        </tr>})}
      {fil.length===0&&<tr><td colSpan={10} style={{...S.td,textAlign:"center",color:C.d,padding:40,fontFamily:C.font}}>No accounts found</td></tr>}
    </tbody></table></div>
    <J3S C={C}/></>;

  const Det=()=>{if(!sel)return null;const a=sel,d=dTo(a.contract_end),sr=tS(a.staff_breakdown,"required"),sd=tS(a.staff_breakdown,"deployed");
    return<>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <button style={S.bt("g")} onClick={()=>{setView("dashboard");setSelId(null)}}>← Back</button>
        <div><div style={{fontSize:18,fontWeight:700,color:C.t,fontFamily:C.font}}>{a.client}{a.account_code&&<span style={{color:C.bl,fontSize:14,marginLeft:8}}>[{a.account_code}]</span>}</div><div style={{fontSize:12,color:C.m,fontFamily:C.font}}>{a.account_id} · {a.location} · {a.service_type}</div></div>
        <div style={{flex:1}}/>
        {isA&&stg.healthStatuses.map(h=><button key={h.key} style={{...S.nb(a.health===h.key),fontSize:11,padding:"4px 12px"}} onClick={()=>updA(a.id,{health:h.key})}><span style={S.dot(h.color)}/>{h.key}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:14,marginBottom:14}}>
        <div style={S.sec}><div style={S.secT}>Contract Details</div>
          {[["Value",$f(Number(a.contract_value),stg.currency)+"/yr"],["Monthly",$f(Number(a.contract_value)/12,stg.currency)],["Code",a.account_code||"—"],["Billing",a.billing_cycle],["Terms",a.payment_terms+"d"],["Period",`${$d(a.contract_start)} → ${$d(a.contract_end)}`],["Status",a.status],["Field Officer",foName(a.field_officer_id,users)]].map(([l,v])=><div key={l} style={S.dr}><span style={{color:C.m,fontSize:12,fontFamily:C.font}}>{l}</span><span style={{color:C.t,fontSize:13,fontWeight:600,fontFamily:C.font}}>{v}</span></div>)}
          <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={S.pill(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}>{d} days to renewal</span>
            {isA?<select style={{...S.inp,width:150}} value={a.renewal_status||""} onChange={e=>updA(a.id,{renewal_status:e.target.value})}>{(stg.renewalStatuses||[]).map(s=><option key={s}>{s}</option>)}</select>:<span style={S.pill(C.bl)}>{a.renewal_status}</span>}
          </div>
        </div>
        <div style={S.sec}><div style={S.secT}>Collection Health</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <div style={{background:C.bg,padding:14,textAlign:"center",borderRadius:6}}><div style={{fontSize:11,color:C.m,fontFamily:C.font}}>Receivable</div><div style={{fontSize:24,fontWeight:700,color:Number(a.pending_amount)>0?C.yl:C.gn,fontFamily:C.font}}>{$f(Number(a.pending_amount),stg.currency)}</div></div>
            <div style={{background:C.bg,padding:14,textAlign:"center",borderRadius:6}}><div style={{fontSize:11,color:C.m,fontFamily:C.font}}>Collected</div><div style={{fontSize:24,fontWeight:700,color:C.gn,fontFamily:C.font}}>{$f((a._p||[]).reduce((s,p)=>s+Number(p.amount),0),stg.currency)}</div></div>
          </div>
          {isA&&<PayIn C={C} S={S} onRec={(am,rf,n)=>recPay(a.id,am,rf,n)}/>}
          {a._p?.length>0&&<div style={{marginTop:10,maxHeight:140,overflowY:"auto"}}>{a._p.map((p,i)=><div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.bd}`,fontFamily:C.font}}><span style={{color:C.m,width:90}}>{$d(p.payment_date)}</span><span style={{color:C.gn,fontWeight:700,width:80}}>{$f(Number(p.amount),stg.currency)}</span><span style={{color:C.d}}>{p.reference}</span><span style={{color:C.d,flex:1}}>{p.note}</span></div>)}</div>}
        </div>
      </div>
      <div style={S.sec}><div style={S.secT}>Staff by Role</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
          {stg.staffRoles.map(r=>{const v=a.staff_breakdown?.[r.key]||{required:0,deployed:0};return<div key={r.key} style={{background:C.bg,padding:12,borderRadius:6}}><div style={{fontSize:12,color:C.m,fontFamily:C.font,marginBottom:8}}>{r.label}</div><div style={{display:"flex",gap:12}}><div><div style={{fontSize:10,color:C.d,fontFamily:C.font}}>Required</div><div style={{fontSize:22,fontWeight:700,color:C.t,fontFamily:C.font}}>{v.required}</div></div><div><div style={{fontSize:10,color:C.d,fontFamily:C.font}}>Deployed</div><div style={{fontSize:22,fontWeight:700,color:v.deployed>=v.required?C.gn:C.yl,fontFamily:C.font}}>{v.deployed}</div></div></div></div>})}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <div style={S.sec}><div style={S.secT}>Compliance</div>{stg.complianceItems.map(ci=><div key={ci.key} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bd}`}}><span style={S.dot(a.compliance_status?.[ci.key]?C.gn:C.rd)}/><span style={{flex:1,fontSize:13,fontFamily:C.font}}>{ci.label}</span><span style={S.pill(a.compliance_status?.[ci.key]?C.gn:C.rd)}>{a.compliance_status?.[ci.key]?"Valid":"Pending"}</span></div>)}</div>
        <div style={S.sec}><div style={S.secT}>Documents</div><DocUp C={C} S={S} docs={a._d||[]} onUp={f=>upDoc(a.id,f)} onRm={(did,sp)=>rmDoc(did,sp)}/></div>
      </div>
      <div style={S.sec}><div style={S.secT}>Notes & Contacts</div><div style={{fontSize:13,color:C.s,marginBottom:10,lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:C.font}}>{a.notes||"—"}</div>{(a.contacts||[]).map((ct,i)=><div key={i} style={{display:"flex",gap:14,fontSize:13,color:C.m,fontFamily:C.font}}><span style={{color:C.g,fontWeight:600}}>{ct.role}</span><span>{ct.name}</span><span>{ct.phone}</span></div>)}</div>
      {isA&&<div style={{display:"flex",gap:8,marginTop:14}}><button style={S.bt("p")} onClick={()=>{setFD({...a});setEM(true);setSF(true)}}>Edit Account</button><button style={S.bt("d")} onClick={()=>{if(confirm("Delete this account?"))delAcc(a.id)}}>Delete</button></div>}
      <J3S C={C}/></>;
  };

  const Analytics=()=>{
    const sbr={};stg.staffRoles.forEach(r=>{sbr[r.key]={req:0,dep:0,label:r.label}});scopedAccs.forEach(a=>Object.entries(a.staff_breakdown||{}).forEach(([k,v])=>{if(sbr[k]){sbr[k].req+=v.required||0;sbr[k].dep+=v.deployed||0}}));
    const mx=Math.max(1,...Object.values(sbr).map(v=>v.req));const at=ag.c+ag.d3+ag.d6+ag.o9;
    return<>
      <div style={S.sec}><div style={S.secT}>Collection Health</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:16}}>
          {[{l:"Collection Rate",v:`${cR.toFixed(1)}%`,c:cR>80?C.gn:cR>60?C.yl:C.rd},{l:"Avg DSO",v:`${dso.toFixed(0)}d`,c:dso<45?C.gn:dso<60?C.yl:C.rd},{l:"Receivables",v:$f(totP,stg.currency),c:totP>0?C.yl:C.gn},{l:"Collected",v:$f(totCol,stg.currency),c:C.g}].map((x,i)=><div key={i} style={{background:C.bg,padding:14,textAlign:"center",borderRadius:6}}><div style={{fontSize:11,color:C.m,fontFamily:C.font}}>{x.l}</div><div style={{fontSize:24,fontWeight:700,color:x.c,marginTop:4,fontFamily:C.font}}>{x.v}</div></div>)}
        </div>
        <div style={{fontSize:12,fontWeight:700,color:C.g,fontFamily:C.font,marginBottom:10}}>Aging</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[{l:"0-30d",v:ag.c,c:C.gn},{l:"31-60d",v:ag.d3,c:C.yl},{l:"61-90d",v:ag.d6,c:"#f97316"},{l:"90+d",v:ag.o9,c:C.rd}].map((x,i)=><div key={i} style={{background:C.bg,padding:12,borderRadius:6}}><div style={{fontSize:11,color:C.m,fontFamily:C.font}}>{x.l}</div><div style={{fontSize:20,fontWeight:700,color:x.c,fontFamily:C.font}}>{$f(x.v,stg.currency)}</div>{at>0&&<div style={{height:4,background:C.bd,borderRadius:2,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:`${(x.v/at)*100}%`,background:x.c,borderRadius:2}}/></div>}</div>)}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={S.sec}><div style={S.secT}>Staff by Role</div>
          {Object.entries(sbr).filter(([,v])=>v.req>0).map(([k,v])=><div key={k} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4,fontFamily:C.font}}><span style={{color:C.t}}>{v.label}</span><span><span style={{color:v.dep>=v.req?C.gn:C.yl}}>{v.dep}</span><span style={{color:C.d}}>/{v.req}</span></span></div><div style={{height:8,background:C.bg,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${(v.dep/mx)*100}%`,background:v.dep>=v.req?C.gn:C.yl,borderRadius:4}}/></div></div>)}
        </div>
        <div style={S.sec}><div style={S.secT}>Renewal Pipeline</div>
          {scopedAccs.filter(a=>a.status==="Active").sort((a,b)=>dTo(a.contract_end)-dTo(b.contract_end)).slice(0,8).map(a=>{const d=dTo(a.contract_end);return<div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bd}`,cursor:"pointer"}} onClick={()=>{setSelId(a.id);setView("detail")}}><span style={S.dot(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}/><span style={{flex:1,fontSize:12,color:C.t,fontFamily:C.font}}>{a.client}</span><span style={S.pill(a.renewal_status==="Renewed"?C.gn:a.renewal_status==="Lost"?C.rd:C.yl)}>{a.renewal_status||"Pending"}</span><span style={{fontSize:11,color:d<=30?C.rd:C.m,fontWeight:700,fontFamily:C.font}}>{d}d</span></div>})}
        </div>
      </div>
      <J3S C={C}/></>;
  };

  const Notif=()=>{
    const evIcon={assigned:"📬",reassigned:"🔄",status_changed:"🔃",completed:"✅",deleted:"🗑️",remark_added:"💬"};
    const evColor={assigned:C.bl,reassigned:C.yl,status_changed:C.bl,completed:C.gn,deleted:C.rd,remark_added:C.g};
    return<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:16,fontWeight:700,color:C.t,fontFamily:C.font}}>🔔 Notifications</div><div style={{fontSize:12,color:C.m,fontFamily:C.font}}>{unreadNotifCount} unread · {notifs.length} total</div></div>
        <div style={{display:"flex",gap:8}}><button style={S.sb("s")} onClick={loadNotifs}>🔄 Refresh</button>{unreadNotifCount>0&&<button style={S.bt("p")} onClick={markAllNotifsRead}>Mark All Read</button>}</div>
      </div>
      {notifs.length===0?<div style={{...S.sec,textAlign:"center",padding:40,color:C.d,fontFamily:C.font}}>No notifications yet.</div>:
      <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8}}>
        {notifs.map(n=><div key={n.id} style={{padding:"14px 16px",borderBottom:`1px solid ${C.bd}`,background:n.is_read?"transparent":`${C.g}10`,display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer"}} onClick={async()=>{if(!n.is_read){await patch("todo_notifications",`?id=eq.${n.id}`,{is_read:true});setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,is_read:true}:x))}}}>
          <div style={{fontSize:20,minWidth:24}}>{evIcon[n.event_type]||"🔔"}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
              {!n.is_read&&<span style={{width:8,height:8,borderRadius:"50%",background:C.g,display:"inline-block"}}/>}
              <span style={{fontSize:13,color:C.t,fontWeight:600,fontFamily:C.font}}>{n.todo_title||"(Deleted task)"}</span>
              <span style={S.pill(evColor[n.event_type]||C.m)}>{(n.event_type||"").replace("_"," ")}</span>
            </div>
            <div style={{fontSize:12,color:C.s,fontFamily:C.font,marginBottom:3}}>{n.message}</div>
            {n.remark&&<div style={{fontSize:12,color:C.g,fontStyle:"italic",padding:"6px 10px",background:C.bg,borderLeft:`3px solid ${C.g}`,borderRadius:2,fontFamily:C.font}}>"{n.remark}"</div>}
            <div style={{fontSize:11,color:C.d,marginTop:4,fontFamily:C.font}}>{n.actor_name||"System"} · {new Date(n.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <button style={{...S.sb("g"),padding:"2px 8px",color:C.rd}} onClick={async e=>{e.stopPropagation();await rm("todo_notifications",`?id=eq.${n.id}`);setNotifs(prev=>prev.filter(x=>x.id!==n.id))}}>✕</button>
        </div>)}
      </div>}
      <J3S C={C}/></div>;
  };

  const Usr=()=><div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:16,fontWeight:700,color:C.t,fontFamily:C.font}}>User Management</div><button style={S.bt("p")} onClick={()=>setSUF(true)}>+ New User</button></div>
    <div style={{overflowX:"auto",borderRadius:8,border:`1px solid ${C.bd}`}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}><thead><tr>{["Username","Name","Role","Scope","Branch","Views","Active","Last Login","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>
      {users.map(u=>{const vp=u.view_permissions||{dashboard:true,command:true,analytics:true,notifications:true};const isSelf=u.id===user.id;
        return<tr key={u.id}>
          <td style={S.td}><span style={{fontWeight:600,fontFamily:C.font}}>{u.username}</span></td>
          <td style={{...S.td,fontFamily:C.font}}>{u.full_name||"—"}</td>
          <td style={S.td}><span style={S.pill(u.role==="superadmin"?"#a855f7":u.role==="admin"?C.g:C.bl)}>{u.role}</span></td>
          <td style={S.td}>{isSelf?<span style={S.pill(C.g)}>{(u.scope_level||"org")}</span>:<select style={{...S.inp,width:90,padding:"3px 8px",fontSize:11}} value={u.scope_level||"org"} onChange={e=>updateUserField(u.id,{scope_level:e.target.value,...(e.target.value!=="branch"?{scope_branch:null}:{})})}><option value="org">Org</option><option value="branch">Branch</option><option value="site">Site</option></select>}</td>
          <td style={S.td}>{u.scope_level==="branch"?(isSelf?<span style={{color:C.t,fontFamily:C.font}}>{u.scope_branch||"—"}</span>:<select style={{...S.inp,width:120,padding:"3px 8px",fontSize:11}} value={u.scope_branch||""} onChange={e=>updateUserField(u.id,{scope_branch:e.target.value})}><option value="">—</option>{(stg.branches||[]).map(b=><option key={b} value={b}>{b}</option>)}</select>):<span style={{color:C.d,fontFamily:C.font}}>—</span>}</td>
          <td style={S.td}>{u.role==="admin"||u.role==="superadmin"?<span style={{color:C.d,fontSize:11,fontFamily:C.font}}>All</span>:<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[["dashboard","Dash"],["command","Cmd"],["analytics","Anl"],["notifications","Notif"]].map(([k,l])=><label key={k} style={{display:"flex",alignItems:"center",gap:3,fontSize:11,cursor:isSelf?"default":"pointer",color:vp[k]?C.gn:C.d,fontFamily:C.font}}><input type="checkbox" checked={vp[k]!==false} disabled={isSelf} onChange={()=>vpToggle(u,k)}/>{l}</label>)}</div>}</td>
          <td style={S.td}><span style={S.dot(u.is_active?C.gn:C.rd)}/><span style={{fontFamily:C.font}}>{u.is_active?"Active":"Off"}</span></td>
          <td style={{...S.td,fontSize:11,color:C.m,fontFamily:C.font}}>{u.last_login?$d(u.last_login):"Never"}</td>
          <td style={S.td}>{!isSelf&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}><button style={{...S.sb("s"),color:C.bl}} onClick={()=>{setPwModal({open:true,user:u});setPwVal("");setPwVal2("");setPwErr("")}}>🔑 PW</button><button style={S.sb("d")} onClick={()=>setDelUserModal({open:true,user:u})}>🗑 Del</button><button style={S.sb(u.is_active?"d":"s")} onClick={()=>toggleUser(u.id,u.is_active)}>{u.is_active?"Off":"On"}</button><select style={{...S.inp,width:90,padding:"3px 8px",fontSize:11}} value={u.role} onChange={e=>changeRole(u.id,e.target.value)}><option value="superadmin">SuperAdmin</option><option value="admin">Admin</option><option value="user">User</option></select></div>}</td>
        </tr>})}
    </tbody></table></div>
    <J3S C={C}/>
  </div>;

  const Stg=()=><div>
    <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>{[["general","General"],["services","Services"],["compliance","Compliance"],["health","Health"],["staff","Staff Roles"],["alerts","Alerts"],["billing","Billing"],["branches","Branches"],["data","Data"]].map(([k,l])=><button key={k} style={S.nb(sTab===k)} onClick={()=>setSTab(k)}>{l}</button>)}</div>
    {sTab==="general"&&<div style={S.sec}><div style={S.secT}>Branding</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label style={S.lbl}>Company Name</label><input style={S.inp} value={stg.companyName} onChange={e=>uS({companyName:e.target.value})}/></div><div><label style={S.lbl}>Tagline</label><input style={S.inp} value={stg.tagline} onChange={e=>uS({tagline:e.target.value})}/></div></div></div>}
    {sTab==="services"&&<div style={S.sec}><div style={S.secT}>Service Types</div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>{stg.serviceTypes.map((t,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:C.bg,border:`1px solid ${C.bd}`,padding:"4px 12px",borderRadius:20,fontSize:12,fontFamily:C.font}}><span>{t}</span><span style={{color:C.rd,cursor:"pointer"}} onClick={()=>uS({serviceTypes:stg.serviceTypes.filter((_,j)=>j!==i)})}>×</span></div>)}</div><button style={S.sb("s")} onClick={()=>uS({serviceTypes:[...stg.serviceTypes,"New Service"]})}>+ Add</button></div>}
    {sTab==="compliance"&&<div style={S.sec}><div style={S.secT}>Compliance Items</div>{stg.complianceItems.map((item,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...S.inp,width:120}} value={item.key} onChange={e=>{const u=[...stg.complianceItems];u[i]={...u[i],key:e.target.value.replace(/\s/g,"")};uS({complianceItems:u})}}/><input style={{...S.inp,flex:1}} value={item.label} onChange={e=>{const u=[...stg.complianceItems];u[i]={...u[i],label:e.target.value};uS({complianceItems:u})}}/><button style={{...S.sb("d"),padding:"4px 10px"}} onClick={()=>uS({complianceItems:stg.complianceItems.filter((_,j)=>j!==i)})}>Remove</button></div>)}<button style={S.sb("s")} onClick={()=>uS({complianceItems:[...stg.complianceItems,{key:`c${Date.now()}`,label:"New Item"}]})}>+ Add</button></div>}
    {sTab==="health"&&<div style={S.sec}><div style={S.secT}>Health Statuses</div>{stg.healthStatuses.map((h,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...S.inp,width:100}} value={h.key} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],key:e.target.value};uS({healthStatuses:u})}}/><input type="color" style={{width:40,height:36,padding:2,border:`1px solid ${C.bd}`,borderRadius:4,cursor:"pointer"}} value={h.color} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],color:e.target.value};uS({healthStatuses:u})}}/><input style={{...S.inp,flex:1}} value={h.meaning} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],meaning:e.target.value};uS({healthStatuses:u})}}/></div>)}</div>}
    {sTab==="staff"&&<div style={S.sec}><div style={S.secT}>Staff Roles</div>{stg.staffRoles.map((r,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...S.inp,width:120}} value={r.key} onChange={e=>{const u=[...stg.staffRoles];u[i]={...u[i],key:e.target.value.replace(/\s/g,"")};uS({staffRoles:u})}}/><input style={{...S.inp,flex:1}} value={r.label} onChange={e=>{const u=[...stg.staffRoles];u[i]={...u[i],label:e.target.value};uS({staffRoles:u})}}/><button style={{...S.sb("d"),padding:"4px 10px"}} onClick={()=>uS({staffRoles:stg.staffRoles.filter((_,j)=>j!==i)})}>Remove</button></div>)}<button style={S.sb("s")} onClick={()=>uS({staffRoles:[...stg.staffRoles,{key:`r${Date.now()}`,label:"New Role"}]})}>+ Add</button></div>}
    {sTab==="alerts"&&<div style={S.sec}><div style={S.secT}>Alert Thresholds</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}><div><label style={S.lbl}>Renewal Warning (days)</label><input style={S.inp} type="number" value={stg.alertThresholds.renewalDays} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,renewalDays:Number(e.target.value)}})}/></div><div><label style={S.lbl}>Overdue Threshold (days)</label><input style={S.inp} type="number" value={stg.alertThresholds.overduePaymentDays} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,overduePaymentDays:Number(e.target.value)}})}/></div><div><label style={S.lbl}>Staff Shortfall %</label><input style={S.inp} type="number" value={stg.alertThresholds.staffShortfallPct} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,staffShortfallPct:Number(e.target.value)}})}/></div></div></div>}
    {sTab==="billing"&&<div style={S.sec}><div style={S.secT}>Billing Defaults</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label style={S.lbl}>Invoice Day</label><input style={S.inp} type="number" min={1} max={28} value={stg.invoiceDayDefault} onChange={e=>uS({invoiceDayDefault:Number(e.target.value)})}/></div><div><label style={S.lbl}>Payment Terms</label><select style={S.inp} value={stg.defaultPaymentTerms} onChange={e=>uS({defaultPaymentTerms:Number(e.target.value)})}>{stg.paymentTermsPresets.map(d=><option key={d} value={d}>{d} days</option>)}</select></div></div></div>}
    {sTab==="branches"&&<div style={S.sec}><div style={S.secT}>Branches</div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>{(stg.branches||[]).map((b,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:C.bg,border:`1px solid ${C.bd}`,padding:"4px 12px",borderRadius:20,fontSize:12,fontFamily:C.font}}><span>{b}</span><span style={{color:C.rd,cursor:"pointer"}} onClick={()=>uS({branches:stg.branches.filter((_,j)=>j!==i)})}>×</span></div>)}</div><button style={S.sb("s")} onClick={()=>uS({branches:[...(stg.branches||[]),"New Branch"]})}>+ Add</button></div>}
    {sTab==="data"&&<div style={S.sec}><div style={S.secT}>Data & Connection</div><div style={{fontSize:12,color:C.s,marginBottom:12,fontFamily:C.font}}>Connected: <span style={{color:C.g,fontWeight:600}}>iqccddabidfcrsbdehiq.supabase.co</span> · ap-south-1</div><div style={{display:"flex",gap:8}}><button style={S.bt("s")} onClick={xCSV}>📥 Export CSV</button><button style={S.bt("s")} onClick={loadAll}>🔄 Refresh</button></div></div>}
    <J3S C={C}/>
  </div>;

  const Tasks=()=>{
    const visibleTasks=allTodos.filter(t=>{if(isA)return true;return t.assigned_to===user.id||t.assigned_to===null});
    const statusFiltered=taskFilter==="all"?visibleTasks:taskFilter==="active"?visibleTasks.filter(t=>["pending","in_progress","overdue"].includes(t.status)):visibleTasks.filter(t=>t.status===taskFilter);
    const assigneeFiltered=taskAssigneeFlt==="all"?statusFiltered:taskAssigneeFlt==="me"?statusFiltered.filter(t=>t.assigned_to===user.id):taskAssigneeFlt==="unassigned"?statusFiltered.filter(t=>!t.assigned_to):statusFiltered.filter(t=>t.assigned_to===taskAssigneeFlt);
    const filtered=!taskSearch?assigneeFiltered:assigneeFiltered.filter(t=>t.title.toLowerCase().includes(taskSearch.toLowerCase())||(t.description||"").toLowerCase().includes(taskSearch.toLowerCase())||(t.account_name||"").toLowerCase().includes(taskSearch.toLowerCase()));
    const st={all:visibleTasks.length,active:visibleTasks.filter(t=>["pending","in_progress","overdue"].includes(t.status)).length,pending:visibleTasks.filter(t=>t.status==="pending").length,in_progress:visibleTasks.filter(t=>t.status==="in_progress").length,overdue:visibleTasks.filter(t=>t.status==="overdue").length,completed:visibleTasks.filter(t=>t.status==="completed").length};
    const fmtTs=ts=>{if(!ts)return"—";return new Date(ts).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"2-digit",hour:"2-digit",minute:"2-digit"})};
    const fmtDate=d=>{if(!d)return"—";return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"})};
    const selTask=selTaskId?allTodos.find(t=>t.id===selTaskId):null;
    const selUpdates=selTask?allTaskUpdates.filter(u=>u.todo_id===selTask.id).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)):[];
    const canPostUpdate=selTask&&(isA||selTask.assigned_to===user.id||selTask.assigned_by===user.id);
    return<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:16,fontWeight:700,color:C.t,fontFamily:C.font}}>📋 Task Tracker</div><div style={{fontSize:12,color:C.m,fontFamily:C.font}}>{st.active} active · {st.overdue} overdue · {st.completed} done</div></div>
        <div style={{display:"flex",gap:8}}><button style={S.sb("s")} onClick={loadTasks}>🔄</button><button style={S.bt("p")} onClick={()=>{setEditTask(null);setTaskForm(defTaskForm);setShowTaskForm(true)}}>+ New Task</button></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:16}}>
        {[["All",st.all,C.t,"all"],["Active",st.active,C.yl,"active"],["Pending",st.pending,C.yl,"pending"],["In Progress",st.in_progress,C.bl,"in_progress"],["Overdue",st.overdue,C.rd,"overdue"],["Done",st.completed,C.gn,"completed"]].map(([l,v,c,f])=>
          <button key={f} onClick={()=>setTaskFilter(f)} style={{background:taskFilter===f?`${c}15`:C.p,border:`1px solid ${taskFilter===f?c:C.bd}`,borderRadius:8,padding:"10px 8px",cursor:"pointer",fontFamily:C.font,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:10,color:C.m,marginTop:2}}>{l}</div>
          </button>)}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input style={{...S.inp,width:280,flexShrink:0}} placeholder="Search tasks..." value={taskSearch} onChange={e=>setTaskSearch(e.target.value)}/>
        <select style={{...S.inp,width:200}} value={taskAssigneeFlt} onChange={e=>setTaskAssigneeFlt(e.target.value)}><option value="all">All assignees</option><option value="me">Assigned to me</option><option value="unassigned">Unassigned</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}</select>
        <span style={{fontSize:12,color:C.m,fontFamily:C.font}}>{filtered.length} task(s)</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:selTask?"minmax(320px,1fr) 2fr":"1fr",gap:14,alignItems:"flex-start"}}>
        <div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,maxHeight:"calc(100vh - 340px)",overflowY:"auto"}}>
          {filtered.length===0?<div style={{padding:40,textAlign:"center",color:C.d,fontFamily:C.font}}>No tasks found</div>:
          filtered.map(t=>{const isSel=selTaskId===t.id;const updCount=allTaskUpdates.filter(u=>u.todo_id===t.id).length;const isOd=t.status==="overdue";
            return<div key={t.id} onClick={()=>setSelTaskId(t.id===selTaskId?null:t.id)} style={{padding:"12px 16px",borderBottom:`1px solid ${C.bd}`,background:isSel?`${C.g}12`:isOd?`${C.rd}08`:"transparent",cursor:"pointer",borderLeft:isSel?`3px solid ${C.g}`:"3px solid transparent"}}>
              <div style={{fontSize:13,color:t.status==="completed"?C.m:C.t,fontWeight:600,textDecoration:t.status==="completed"?"line-through":"none",marginBottom:4,fontFamily:C.font}}>{t.title}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}>
                <span style={{...S.pill(prC(t.priority)),fontSize:9}}>{t.priority}</span>
                <span style={{...S.pill(stC(t.status)),fontSize:9}}>{t.status.replace("_"," ")}</span>
                {updCount>0&&<span style={{...S.pill(C.bl),fontSize:9}}>💬 {updCount}</span>}
              </div>
              <div style={{fontSize:11,color:C.m,fontFamily:C.font}}>{t.assigned_to_name&&`→ ${t.assigned_to_name}`}{t.account_name&&` · 📁 ${t.account_name}`}</div>
              {t.due_date&&<div style={{fontSize:11,color:isOd?C.rd:C.m,fontFamily:C.font}}>Due: {fmtDate(t.due_date)}</div>}
            </div>})}
        </div>
        {selTask&&<div style={{background:C.p,border:`1px solid ${C.bd}`,borderRadius:8,maxHeight:"calc(100vh - 340px)",overflowY:"auto"}}>
          <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.bd}`,background:C.codeBg}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:C.t,marginBottom:6,fontFamily:C.font}}>{selTask.title}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={{...S.pill(prC(selTask.priority)),fontSize:10}}>{selTask.priority}</span>
                  <span style={{...S.pill(stC(selTask.status)),fontSize:10}}>{selTask.status.replace("_"," ")}</span>
                  {selTask.account_name&&<span style={{...S.pill(C.bl),fontSize:10}}>📁 {selTask.account_name}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {(isA||selTask.assigned_by===user.id)&&<button style={S.sb("s")} onClick={()=>{setEditTask(selTask);setTaskForm({title:selTask.title,description:selTask.description||"",priority:selTask.priority,assigned_to:selTask.assigned_to||"",assigned_to_name:selTask.assigned_to_name||"",account_id:selTask.account_id||"",due_date:selTask.due_date||"",tags:(selTask.tags||[]).join(", ")});setShowTaskForm(true)}}>✎ Edit</button>}
                {isA&&<button style={S.sb("d")} onClick={()=>delTask(selTask.id)}>Delete</button>}
                <button style={S.sb("g")} onClick={()=>setSelTaskId(null)}>✕</button>
              </div>
            </div>
            {selTask.description&&<div style={{fontSize:12,color:C.s,lineHeight:1.6,whiteSpace:"pre-wrap",fontFamily:C.font}}>{selTask.description}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginTop:12,fontSize:11}}>
              {[["Assigned To",selTask.assigned_to_name||"All"],["Assigned By",selTask.assigned_by_name||"—"],["Due",fmtDate(selTask.due_date)],["Created",Math.floor((new Date()-new Date(selTask.created_at))/864e5)+"d ago"]].map(([l,v])=><div key={l}><div style={{color:C.m,fontFamily:C.font}}>{l}</div><div style={{color:C.t,fontWeight:600,fontFamily:C.font,marginTop:2}}>{v}</div></div>)}
            </div>
          </div>
          <div style={{padding:"16px 18px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.g,marginBottom:12,fontFamily:C.font}}>Activity Log ({selUpdates.length})</div>
            {selUpdates.length===0?<div style={{fontSize:12,color:C.d,fontStyle:"italic",marginBottom:14,fontFamily:C.font}}>No updates yet.</div>:
            <div style={{marginBottom:14}}>
              {selUpdates.map((u)=>{const isStatusChange=!!u.status_change;
                return<div key={u.id} style={{marginBottom:12,paddingLeft:16,borderLeft:`3px solid ${isStatusChange?stC(u.status_change):C.g}`}}>
                  <div style={{background:C.bg,padding:"10px 12px",borderRadius:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:6}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:12,color:C.g,fontWeight:600,fontFamily:C.font}}>👤 {u.author_name||"Unknown"}</span>
                        {isStatusChange&&<span style={{...S.pill(stC(u.status_change)),fontSize:9}}>→ {u.status_change.replace("_"," ")}</span>}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:10,color:C.d,fontFamily:C.font}}>{fmtTs(u.created_at)}</span>
                        {(isA||u.author_id===user.id)&&<span style={{color:C.rd,cursor:"pointer",fontSize:12}} onClick={()=>delTaskUpdate(u.id)}>✕</span>}
                      </div>
                    </div>
                    <div style={{fontSize:13,color:C.t,lineHeight:1.5,whiteSpace:"pre-wrap",fontFamily:C.font}}>{u.update_text}</div>
                  </div>
                </div>})}
            </div>}
            {canPostUpdate?<div style={{background:C.bg,border:`1px solid ${C.bd}`,borderRadius:8,padding:14}}>
              <div style={{fontSize:12,fontWeight:600,color:C.g,marginBottom:8,fontFamily:C.font}}>Add Update</div>
              <textarea style={{...S.inp,height:70,resize:"vertical",marginBottom:8}} placeholder="What progress? Any blockers?" value={updateText} onChange={e=>setUpdateText(e.target.value)}/>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <select style={{...S.inp,flex:1,minWidth:160}} value={updateStatus} onChange={e=>setUpdateStatus(e.target.value)}><option value="">— No status change —</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                <button style={{...S.bt("p")}} onClick={()=>postTaskUpdate(selTask.id)} disabled={syncing||!updateText.trim()}>{syncing?"Posting...":"Post Update"}</button>
              </div>
            </div>:<div style={{fontSize:12,color:C.d,textAlign:"center",padding:10,fontStyle:"italic",fontFamily:C.font}}>View only — you cannot post updates to this task.</div>}
          </div>
        </div>}
      </div>
      <J3S C={C}/>
    </div>;
  };

  return<div style={{background:C.bg,minHeight:"100vh",fontFamily:C.font,color:C.t}}>
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
    <style>{`*::-webkit-scrollbar{width:5px;height:5px}*::-webkit-scrollbar-track{background:${C.bg}}*::-webkit-scrollbar-thumb{background:${C.bd};border-radius:3px}*::-webkit-scrollbar-thumb:hover{background:${C.g}}input[type=color]{padding:2px;height:36px;cursor:pointer}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    <div style={{background:C.navBg,borderBottom:`2px solid ${C.g}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:6}}>
      <div><div style={{fontSize:16,fontWeight:800,color:C.g,letterSpacing:1,fontFamily:C.font}}>{stg.companyName} Accounts</div><div style={{fontSize:10,color:C.d,fontFamily:C.font}}>J3S Office · {darkMode?"Tactical Mode":"Standard Mode"}</div></div>
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        {syncing&&<span style={{fontSize:11,color:C.yl,animation:"pulse 1s infinite",fontFamily:C.font}}>Syncing...</span>}
        {[["dashboard","Dashboard"],["tasks","📋 Tasks"],["command","Command"],["analytics","Analytics"],["notifications",`🔔${unreadNotifCount>0?` (${unreadNotifCount})`:""}`],...(isSA?[["users","👤 Users"],["settings","⚙ Settings"]]:[])].filter(([k])=>["users","settings"].includes(k)?isSA:k==="tasks"?true:canSee(k)).map(([k,l])=>{
          const active=view===k||(view==="detail"&&k==="dashboard");
          return<button key={k} style={{...S.nb(active),...(k==="notifications"&&unreadNotifCount>0&&!active?{borderColor:C.rd,color:C.rd}:{})}} onClick={()=>{setView(k);setSelId(null)}}>{l}</button>
        })}
        <button onClick={toggleTheme} style={{...S.sb("s"),fontSize:14,padding:"4px 10px"}} title="Toggle theme">{darkMode?"☀":"🌙"}</button>
        <span style={{background:C.gn,color:"#fff",padding:"2px 8px",fontSize:10,fontWeight:700,borderRadius:10,fontFamily:C.font}}>LIVE</span>
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 12px",background:C.codeBg,border:`1px solid ${C.bd}`,borderRadius:20,fontSize:12}}>
          <span style={S.dot(C.gn)}/><span style={{color:C.t,fontFamily:C.font}}>{user.full_name||user.username}</span>
          <span style={S.pill(isSA?"#a855f7":isA?C.g:C.bl)}>{user.role}</span>
          <span style={{color:C.rd,cursor:"pointer",fontWeight:700,marginLeft:4}} onClick={()=>{setUser(null);setLoaded(false);setAccs([]);setNotifs([]);setView("dashboard")}}>✕</span>
        </div>
      </div>
    </div>
    <div style={{padding:"20px 24px"}}>
      {view==="dashboard"&&<Dash/>}
      {view==="tasks"&&<Tasks/>}
      {view==="command"&&<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}><UpdPanel accs={scopedAccs} currentUser={user} isAdmin={isA} C={C} S={S}/><TodoPanel accs={scopedAccs} users={users} currentUser={user} isAdmin={isA} onNotifChange={loadNotifs} C={C} S={S}/><CollPanel accs={scopedAccs} isAdmin={isA} C={C} S={S}/><PipePanel accs={scopedAccs} users={users} currentUser={user} isAdmin={isA} C={C} S={S}/></div><J3S C={C}/></div>}
      {view==="detail"&&<Det/>}
      {view==="analytics"&&<Analytics/>}
      {view==="notifications"&&<Notif/>}
      {view==="users"&&isSA&&<Usr/>}
      {view==="settings"&&isSA&&<Stg/>}
    </div>
    {showFrm&&<AccountFormModal fd={fd} setFD={setFD} eMode={eMode} onSave={saveAcc} onClose={()=>{setSF(false);setEM(false)}} syncing={syncing} stg={stg} users={users} C={C} S={S}/>}
    {showUF&&<CreateUserModal uf={uf} setUF={setUF} onSave={createUser} onClose={()=>setSUF(false)} stg={stg} C={C} S={S}/>}
    {showTaskForm&&<TaskFormModal editTask={editTask} taskForm={taskForm} setTaskForm={setTaskForm} onSave={saveTask} onClose={()=>{setShowTaskForm(false);setEditTask(null)}} syncing={syncing} users={users} scopedAccs={scopedAccs} C={C} S={S}/>}
    {pwModal.open&&<PwResetModal pwModal={pwModal} pwVal={pwVal} setPwVal={setPwVal} pwVal2={pwVal2} setPwVal2={setPwVal2} pwErr={pwErr} setPwErr={setPwErr} C={C} S={S}
      onConfirm={async()=>{if(!pwVal.trim()){setPwErr("Password required");return}if(pwVal!==pwVal2){setPwErr("Passwords do not match");return}if(pwVal.length<6){setPwErr("Min 6 characters");return}setPwErr("");const ok=await resetUserPassword(pwModal.user.id,pwVal);if(ok){tw("Password reset");setPwModal({open:false,user:null});setPwVal("");setPwVal2("")}else setPwErr("Failed")}}
      onClose={()=>{setPwModal({open:false,user:null});setPwVal("");setPwVal2("");setPwErr("")}}
    />}
    {delUserModal.open&&<DelUserModal delUserModal={delUserModal} C={C} S={S}
      onConfirm={async()=>{const ok=await hardDeleteUser(delUserModal.user.id);if(ok){setDelUserModal({open:false,user:null});tw("Deleted")}else tw("Failed")}}
      onClose={()=>setDelUserModal({open:false,user:null})}
    />}
    {toast&&<div style={{position:"fixed",bottom:24,right:24,background:C.g,color:C.bg,padding:"10px 20px",fontSize:13,fontWeight:700,fontFamily:C.font,zIndex:300,borderRadius:8,boxShadow:"0 4px 20px rgba(0,0,0,.2)"}}>{toast}</div>}
  </div>;
}
