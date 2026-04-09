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
  branches:["Hyderabad","Bangalore"],
};

// ═══ UTILS ═══
const $f = (a,cu) => { const s=cu?.symbol||"₹"; if(cu?.lakhFormat!==false){if(Math.abs(a)>=1e7)return`${s}${(a/1e7).toFixed(2)}Cr`;if(Math.abs(a)>=1e5)return`${s}${(a/1e5).toFixed(1)}L`;if(Math.abs(a)>=1e3)return`${s}${(a/1e3).toFixed(1)}K`;}return`${s}${a.toLocaleString(cu?.locale||"en-IN")}`};
const $d = d => {if(!d)return"—";return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})};
const dTo = d => Math.ceil((new Date(d)-new Date())/864e5);
const dSn = d => Math.ceil((new Date()-new Date(d))/864e5);
const hC = (h,hs) => hs.find(x=>x.key===h)?.color||"#888";
const tS = (sb,t) => Object.values(sb||{}).reduce((s,v)=>s+(v[t]||0),0);
const foName = (id,users) => {if(!id)return"—";const u=(users||[]).find(x=>x.id===id);return u?(u.full_name||u.username):"—"};

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

const mkCSV = (accs,s,users) => {const rl=s.staffRoles.map(r=>r.key),cm=s.complianceItems.map(c=>c.key);const hd=["ID","Code","Client","Location","Type","Status","Health","Value","Billing","Terms","Start","End","Renewal","Pending","FieldOfficer","TotReq","TotDep",...rl.flatMap(r=>[`${r}_R`,`${r}_D`]),...cm.map(c=>`C_${c}`),"Paid","Notes"];const rows=accs.map(a=>[a.account_id,a.account_code||"",`"${a.client}"`,`"${a.location||""}"`,a.service_type,a.status,a.health,a.contract_value,a.billing_cycle,a.payment_terms,a.contract_start,a.contract_end,a.renewal_status||"",a.pending_amount,`"${foName(a.field_officer_id,users)}"`,tS(a.staff_breakdown,"required"),tS(a.staff_breakdown,"deployed"),...rl.flatMap(r=>[a.staff_breakdown?.[r]?.required||0,a.staff_breakdown?.[r]?.deployed||0]),...cm.map(c=>a.compliance_status?.[c]?"Y":"N"),(a._p||[]).reduce((s,p)=>s+Number(p.amount),0),`"${(a.notes||"").replace(/"/g,'""')}"`].join(","));return hd.join(",")+"\n"+rows.join("\n")};

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
  const[uf,setUF]=useState({username:"",password:"",full_name:"",role:"user",scope_level:"org",scope_branch:"",view_permissions:{dashboard:true,command:true,analytics:true,notifications:true}});
  const[pwModal,setPwModal]=useState({open:false,user:null});
  const[pwVal,setPwVal]=useState("");
  const[pwVal2,setPwVal2]=useState("");
  const[pwErr,setPwErr]=useState("");
  const[delUserModal,setDelUserModal]=useState({open:false,user:null});
  const[notifs,setNotifs]=useState([]);
  const[notifTick,setNotifTick]=useState(0);
  const[allTodos,setAllTodos]=useState([]);
  const[allTaskUpdates,setAllTaskUpdates]=useState([]);
  const[selTaskId,setSelTaskId]=useState(null);
  const[taskFilter,setTaskFilter]=useState("active");
  const[taskSearch,setTaskSearch]=useState("");
  const[taskAssigneeFlt,setTaskAssigneeFlt]=useState("all");
  const[showTaskForm,setShowTaskForm]=useState(false);
  const[editTask,setEditTask]=useState(null);
  const defTaskForm={title:"",description:"",priority:"normal",assigned_to:"",assigned_to_name:"",account_id:"",due_date:"",tags:""};
  const[taskForm,setTaskForm]=useState(defTaskForm);
  const[updateText,setUpdateText]=useState("");
  const[updateStatus,setUpdateStatus]=useState("");

  const tw = m => {setToast(m);setTimeout(()=>setToast(null),2500)};
  const isSA = user?.role==="superadmin";
  const isA = user?.role==="admin"||isSA;

  // ─── SCOPING & PERMISSIONS ───
  const uScope = user?.scope_level||"org";
  const uBranch = user?.scope_branch||"";
  const vPerms = user?.view_permissions||{dashboard:true,command:true,analytics:true,notifications:true};
  const canSee = v => isA||vPerms[v]!==false;
  const inScope = a => {if(isA||uScope==="org")return true;if(uScope==="branch")return a.state===uBranch;if(uScope==="site")return a.field_officer_id===user.id;return false};

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

  // ─── TASKS & UPDATES ───
  const loadTasks=useCallback(async()=>{
    const[t,u]=await Promise.all([
      get("todos","?order=created_at.desc&limit=500"),
      get("task_updates","?order=created_at.asc&limit=2000")
    ]);
    const now=new Date();
    const processed=(t||[]).map(task=>(["pending","in_progress"].includes(task.status)&&task.due_date&&new Date(task.due_date)<now)?{...task,status:"overdue"}:task);
    setAllTodos(processed);
    setAllTaskUpdates(u||[]);
  },[]);

  // ─── NOTIFICATIONS ───
  const loadNotifs=useCallback(async()=>{
    if(!user?.id)return;
    const n=await get("todo_notifications",`?recipient_id=eq.${user.id}&order=created_at.desc&limit=50`);
    setNotifs(n||[]);
  },[user?.id]);

  useEffect(()=>{
    if(user){
      loadAll();
      loadUsers();
      loadNotifs();
      loadTasks();
      rpc("cleanup_old_todo_notifications",{}).catch(()=>{});
      const iv=setInterval(()=>setNotifTick(t=>t+1),45000);
      return ()=>clearInterval(iv);
    }
  },[user,loadAll,loadNotifs,loadTasks]);

  useEffect(()=>{if(notifTick>0){loadNotifs();loadTasks()}},[notifTick,loadNotifs,loadTasks]);

  const markNotifRead=async(id)=>{
    await patch("todo_notifications",`?id=eq.${id}`,{is_read:true});
    setNotifs(prev=>prev.map(n=>n.id===id?{...n,is_read:true}:n));
  };
  const markAllNotifsRead=async()=>{
    if(!user?.id)return;
    await patch("todo_notifications",`?recipient_id=eq.${user.id}&is_read=eq.false`,{is_read:true});
    setNotifs(prev=>prev.map(n=>({...n,is_read:true})));
    tw("All marked as read");
  };
  const deleteNotif=async(id)=>{
    await rm("todo_notifications",`?id=eq.${id}`);
    setNotifs(prev=>prev.filter(n=>n.id!==id));
  };
  const unreadNotifCount=notifs.filter(n=>!n.is_read).length;

  // ─── SETTINGS ───
  const uS=async p=>{const u={...stg,...p};setStg(u);if(stgId)await patch("account_settings",`?id=eq.${stgId}`,{settings_data:u});tw("Saved")};

  // ─── ACCOUNT CRUD ───
  const mkE=()=>({account_id:"",account_code:"",client:"",location:"",service_type:stg.serviceTypes[0]||"",contract_value:0,billing_cycle:stg.defaultBillingCycle,contract_start:"",contract_end:"",invoice_day:stg.invoiceDayDefault,payment_terms:stg.defaultPaymentTerms,status:stg.defaultStatus,health:stg.defaultHealth,staff_breakdown:Object.fromEntries(stg.staffRoles.map(r=>[r.key,{required:0,deployed:0}])),pending_amount:0,compliance_status:Object.fromEntries(stg.complianceItems.map(c=>[c.key,false])),contacts:[{name:"",phone:"",role:"POC"}],notes:stg.notesTemplate,renewal_status:stg.renewalStatuses?.[0]||"Pending",branch:stg.branches?.[0]||"",rate_revision:0,field_officer_id:null,custom_data:{},_p:[],_d:[]});
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
    const res=await rpc("acm_create_user",{p_username:uf.username,p_password:uf.password,p_full_name:uf.full_name,p_role:uf.role,p_scope_level:uf.scope_level,p_scope_branch:uf.scope_branch||null,p_view_permissions:uf.view_permissions});
    if(res&&res.length>0){await loadUsers();setSUF(false);setUF({username:"",password:"",full_name:"",role:"user",scope_level:"org",scope_branch:"",view_permissions:{dashboard:true,command:true,analytics:true,notifications:true}});tw("User created")}else tw("Failed - username may exist")};
  const toggleUser=async(id,active)=>{await patch("acm_users",`?id=eq.${id}`,{is_active:!active});await loadUsers();tw(active?"Deactivated":"Activated")};
  const changeRole=async(id,role)=>{await patch("acm_users",`?id=eq.${id}`,{role});await loadUsers();tw("Role updated")};
  const updateUserField=async(id,data)=>{await patch("acm_users",`?id=eq.${id}`,data);await loadUsers();tw("Updated")};
  const vpToggle=async(u,key)=>{const vp={...(u.view_permissions||{dashboard:true,command:true,analytics:true,notifications:true})};vp[key]=!vp[key];await updateUserField(u.id,{view_permissions:vp})};
  const resetUserPassword=async(userId,newPassword)=>{const r=await rpc("acm_reset_password",{p_user_id:userId,p_new_password:newPassword});return r===true||r};
  const hardDeleteUser=async(userId)=>{const r=await rpc("acm_delete_user",{p_user_id:userId});if(r){await loadUsers();return true}return false};

  // ─── TASK CRUD ───
  const notifyTaskEvent=async(task,eventType,message,remark)=>{
    if(!task)return;
    const recipients=new Set();
    if(task.assigned_to)recipients.add(task.assigned_to);
    if(task.assigned_by)recipients.add(task.assigned_by);
    (users||[]).filter(u=>u.role==="admin"&&u.is_active).forEach(u=>recipients.add(u.id));
    if(user?.id)recipients.delete(user.id);
    const rows=[...recipients].map(rid=>({recipient_id:rid,todo_id:task.id,todo_title:task.title,event_type:eventType,message,remark:remark||null,actor_id:user?.id||null,actor_name:user?.full_name||user?.username||"System"}));
    if(rows.length>0){await post("todo_notifications",rows);loadNotifs()}
  };

  const saveTask=async()=>{
    if(!taskForm.title.trim()){tw("Title required");return}
    const ac=accs.find(a=>a.id===taskForm.account_id);
    const bd={title:taskForm.title,description:taskForm.description,priority:taskForm.priority,assigned_to:taskForm.assigned_to||null,assigned_to_name:taskForm.assigned_to_name||"All",account_id:taskForm.account_id||null,account_name:ac?.client||"",due_date:taskForm.due_date||null,tags:taskForm.tags?taskForm.tags.split(",").map(t=>t.trim()).filter(Boolean):[],assigned_by:user?.id||null,assigned_by_name:user?.full_name||"Admin"};
    setSyncing(true);
    if(editTask){
      bd.updated_at=new Date().toISOString();
      const res=await patch("todos",`?id=eq.${editTask.id}`,bd);
      const updated=(res&&res[0])||{...editTask,...bd};
      if(editTask.assigned_to!==bd.assigned_to)await notifyTaskEvent(updated,"reassigned",`Task reassigned to ${bd.assigned_to_name}`);
    }else{
      bd.notified_at=new Date().toISOString();
      bd.status="pending";
      const res=await post("todos",bd);
      const created=res&&res[0];
      if(created)await notifyTaskEvent(created,"assigned",`New task assigned: ${bd.title}`);
    }
    await loadTasks();
    setShowTaskForm(false);setEditTask(null);setTaskForm(defTaskForm);
    setSyncing(false);tw(editTask?"Updated":"Created");
  };

  const delTask=async(id)=>{
    const task=allTodos.find(t=>t.id===id);
    const reason=prompt("Reason for deletion (required):");
    if(!reason||!reason.trim())return;
    setSyncing(true);
    if(task)await notifyTaskEvent(task,"deleted",`Task deleted: ${task.title}`,reason.trim());
    await rm("todos",`?id=eq.${id}`);
    await loadTasks();
    if(selTaskId===id)setSelTaskId(null);
    setSyncing(false);tw("Deleted");
  };

  const postTaskUpdate=async(taskId)=>{
    if(!updateText.trim()){tw("Update text required");return}
    const task=allTodos.find(t=>t.id===taskId);
    if(!task)return;
    setSyncing(true);
    // Post the update entry
    await post("task_updates",{
      todo_id:taskId,
      update_text:updateText.trim(),
      status_change:updateStatus||null,
      author_id:user?.id||null,
      author_name:user?.full_name||user?.username||"Unknown"
    });
    // If status changed, update the todo
    if(updateStatus&&updateStatus!==task.status){
      const patchBody={status:updateStatus,updated_at:new Date().toISOString()};
      if(updateStatus==="completed"){patchBody.completed_at=new Date().toISOString();patchBody.completion_remark=updateText.trim()}
      await patch("todos",`?id=eq.${taskId}`,patchBody);
      await notifyTaskEvent(task,"status_changed",`Status: ${task.status} → ${updateStatus}`,updateText.trim());
    }else{
      await notifyTaskEvent(task,"remark_added",`New update on: ${task.title}`,updateText.trim());
    }
    setUpdateText("");setUpdateStatus("");
    await loadTasks();
    setSyncing(false);tw("Update posted");
  };

  const delTaskUpdate=async(updateId)=>{
    if(!confirm("Delete this update?"))return;
    await rm("task_updates",`?id=eq.${updateId}`);
    await loadTasks();
    tw("Update removed");
  };

  // ─── DERIVED (scoped) ───
  const scopedAccs=accs.filter(inScope);
  const sel=accs.find(a=>a.id===selId);
  const fil=scopedAccs.filter(a=>{const mf=flt==="All"||a.health===flt||a.status===flt||a.branch===flt;const ms=a.client.toLowerCase().includes(srch.toLowerCase())||(a.location||"").toLowerCase().includes(srch.toLowerCase())||(a.account_code||"").toLowerCase().includes(srch.toLowerCase());return mf&&ms});
  const totCV=scopedAccs.reduce((s,a)=>s+Number(a.contract_value),0);
  const totP=scopedAccs.reduce((s,a)=>s+Number(a.pending_amount),0);
  const totR=scopedAccs.reduce((s,a)=>s+tS(a.staff_breakdown,"required"),0);
  const totD=scopedAccs.reduce((s,a)=>s+tS(a.staff_breakdown,"deployed"),0);
  const renS=scopedAccs.filter(a=>{const d=dTo(a.contract_end);return d<=stg.alertThresholds.renewalDays&&d>0}).length;
  const cGap=scopedAccs.filter(a=>Object.values(a.compliance_status||{}).some(v=>!v)).length;
  const totCol=scopedAccs.reduce((s,a)=>s+(a._p||[]).reduce((ps,p)=>ps+Number(p.amount),0),0);
  const totBil=totCol+totP;
  const cR=totBil>0?(totCol/totBil)*100:100;
  const actA=scopedAccs.filter(a=>a.status==="Active");
  const dso=actA.length>0?actA.reduce((s,a)=>{if(!a._p?.length)return s+a.payment_terms;return s+dSn(a._p[0].payment_date)},0)/actA.length:0;
  const ag={c:0,d3:0,d6:0,o9:0};
  scopedAccs.forEach(a=>{if(Number(a.pending_amount)<=0)return;const lp=a._p?.[0]?.payment_date||a.contract_start;const d=dSn(lp);if(d<=30)ag.c+=Number(a.pending_amount);else if(d<=60)ag.d3+=Number(a.pending_amount);else if(d<=90)ag.d6+=Number(a.pending_amount);else ag.o9+=Number(a.pending_amount)});
  const xCSV=()=>{const c=mkCSV(scopedAccs,stg,users);const b=new Blob([c],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`bbcss_${new Date().toISOString().split("T")[0]}.csv`;a.click();tw("Exported")};

  // ─── VIEW ACCESS GUARD ───
  useEffect(()=>{
    if(!user)return;
    const needsPerm=["dashboard","command","analytics","notifications"];
    if(needsPerm.includes(view)&&!canSee(view)){
      const first=needsPerm.find(v=>canSee(v));
      if(first)setView(first);else if(isA)setView("users");
    }
  },[user,view]);// eslint-disable-line

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
    const sbr={};stg.staffRoles.forEach(r=>{sbr[r.key]={req:0,dep:0,label:r.label}});scopedAccs.forEach(a=>Object.entries(a.staff_breakdown||{}).forEach(([k,v])=>{if(sbr[k]){sbr[k].req+=v.required||0;sbr[k].dep+=v.deployed||0}}));
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
        {scopedAccs.filter(a=>a.status==="Active").sort((a,b)=>dTo(a.contract_end)-dTo(b.contract_end)).slice(0,8).map(a=>{const d=dTo(a.contract_end);return<div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bg}`,cursor:"pointer"}} onClick={()=>{setSelId(a.id);setView("detail")}}><span style={dot(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}/><span style={{flex:1,fontSize:11,color:C.t}}>{a.client}</span><span style={pill(a.renewal_status==="Renewed"?C.gn:a.renewal_status==="Lost"?C.rd:C.yl)}>{a.renewal_status||"Pending"}</span><span style={{fontSize:10,color:d<=30?C.rd:C.m,fontWeight:700}}>{d}d</span></div>})}
      </div>
    </div>
    <div style={{...sec,marginTop:14}}><div style={secT}>📈 EFFECTIVENESS</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
        {[{l:"Staffing",sc:totR>0?(totD/totR)*100:100},{l:"Collection",sc:cR},{l:"Compliance",sc:scopedAccs.length>0?(scopedAccs.length-cGap)/scopedAccs.length*100:100},{l:"Renewal",sc:actA.length>0?(actA.length-renS)/actA.length*100:100}].map((x,i)=>{const co=x.sc>=80?C.gn:x.sc>=60?C.yl:C.rd;return<div key={i} style={{background:C.bg,padding:14}}><div style={{fontSize:10,color:C.m}}>{x.l}</div><div style={{fontSize:26,fontWeight:700,color:co,margin:"4px 0"}}>{x.sc.toFixed(1)}%</div><div style={{height:4,background:"#1a2418",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,x.sc)}%`,background:co,borderRadius:2}}/></div></div>})}
      </div></div>
    <J3S/></>;
  };

  // ═══ DASHBOARD ═══
  const Dash=()=><>
    {uScope!=="org"&&!isA&&<div style={{background:"#1a2418",border:`1px solid ${C.bd}`,padding:"8px 14px",marginBottom:14,fontSize:11,color:C.g,letterSpacing:1}}>🔒 SCOPE: {uScope==="branch"?`BRANCH · ${uBranch||"—"}`:`FIELD OFFICER · ${user.full_name||user.username} · ${scopedAccs.length} assigned account(s)`}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:14,marginBottom:20}}>
      {[{l:"Accounts",v:actA.length,s:`${scopedAccs.length} total`,c:C.g},{l:"Monthly",v:$f(totCV/12,stg.currency),s:`ACV ${$f(totCV,stg.currency)}`,c:C.g},{l:"Receivables",v:$f(totP,stg.currency),s:`${cR.toFixed(0)}% collected`,c:totP>0?C.yl:C.gn},{l:"Staff",v:`${totD}/${totR}`,s:totD<totR?`${totR-totD} short`:"Full",c:totD<totR?C.yl:C.gn},{l:"DSO",v:`${dso.toFixed(0)}d`,s:dso<45?"Healthy":"Review",c:dso<45?C.gn:C.yl}].map((x,i)=><div key={i} style={{background:C.p,border:`1px solid ${C.bd}`,padding:14}}><div style={{fontSize:10,color:C.m,letterSpacing:2,textTransform:"uppercase"}}>{x.l}</div><div style={{fontSize:24,fontWeight:700,color:x.c}}>{x.v}</div><div style={{fontSize:10,color:C.d,marginTop:2}}>{x.s}</div></div>)}
    </div>
    {(renS>0||cGap>0||ag.o9>0)&&<div style={{...sec,borderColor:"#7f5a08",marginBottom:16}}><div style={{...secT,color:C.yl,borderColor:"#7f5a08"}}>⚠ ALERTS</div>{renS>0&&<div style={{color:C.yl,fontSize:12,marginBottom:4}}>• {renS} contract(s) within {stg.alertThresholds.renewalDays}d</div>}{cGap>0&&<div style={{color:C.rd,fontSize:12,marginBottom:4}}>• {cGap} compliance gaps</div>}{ag.o9>0&&<div style={{color:C.rd,fontSize:12}}>• {$f(ag.o9,stg.currency)} overdue 90+d</div>}</div>}
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <input style={{...inp,width:200,flexShrink:0}} placeholder="Search client/code..." value={srch} onChange={e=>setSrch(e.target.value)}/>
      {["All",...stg.healthStatuses.map(h=>h.key),...stg.accountStatuses,...(stg.branches||[])].map(f=><button key={f} style={nb(flt===f)} onClick={()=>setFlt(f)}>{f}</button>)}
      <div style={{flex:1}}/>
      <button style={sb("s")} onClick={xCSV}>📥 CSV</button>
      <button style={sb("s")} onClick={loadAll}>🔄</button>
      {isA&&<button style={bt("p")} onClick={()=>{setFD(mkE());setEM(false);setSF(true)}}>+ NEW</button>}
    </div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Client","Code","Branch","Field Officer","Health","Contract","Staff","Pending","Renewal","Comp"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
      {fil.map(a=>{const d=dTo(a.contract_end),sr=tS(a.staff_breakdown,"required"),sd=tS(a.staff_breakdown,"deployed"),ok=Object.values(a.compliance_status||{}).every(Boolean);
        return<tr key={a.id} style={{cursor:"pointer"}} onClick={()=>{setSelId(a.id);setView("detail")}} onMouseEnter={e=>e.currentTarget.style.background="#1a2418"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={td}><div style={{fontWeight:700}}>{a.client}</div><div style={{fontSize:10,color:C.d}}>{a.account_id} · {a.location}</div></td>
          <td style={{...td,color:C.bl,fontWeight:600}}>{a.account_code||"—"}</td>
          <td style={{...td,color:C.m,fontSize:11}}>{a.branch||"—"}</td>
          <td style={{...td,fontSize:11}}>{a.field_officer_id?<span style={{color:C.g,fontWeight:600}}>👤 {foName(a.field_officer_id,users)}</span>:<span style={{color:C.d}}>—</span>}</td>
          <td style={td}><span style={dot(hC(a.health,stg.healthStatuses))}/>{a.health}</td>
          <td style={{...td,color:C.g,fontWeight:600}}>{$f(Number(a.contract_value),stg.currency)}/yr</td>
          <td style={td}><span style={{color:sd<sr?C.yl:C.gn}}>{sd}</span><span style={{color:C.d}}>/{sr}</span></td>
          <td style={{...td,color:Number(a.pending_amount)>0?C.yl:C.gn}}>{$f(Number(a.pending_amount),stg.currency)}</td>
          <td style={td}><span style={pill(d<=30?C.rd:d<=stg.alertThresholds.renewalDays?C.yl:C.gn)}>{d}d</span></td>
          <td style={td}><span style={pill(ok?C.gn:C.rd)}>{ok?"OK":"GAPS"}</span></td>
        </tr>})}
      {fil.length===0&&<tr><td colSpan={10} style={{...td,textAlign:"center",color:C.d,padding:40}}>No accounts</td></tr>}
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
          {[["Value",$f(Number(a.contract_value),stg.currency)+"/yr"],["Monthly",$f(Number(a.contract_value)/12,stg.currency)],["Code",a.account_code||"—"],["Billing",a.billing_cycle],["Terms",a.payment_terms+"d"],["Period",`${$d(a.contract_start)} → ${$d(a.contract_end)}`],["Status",a.status],["Field Officer",foName(a.field_officer_id,users)]].map(([l,v])=><div key={l} style={dr}><span style={{color:C.m,fontSize:11}}>{l}</span><span style={{color:C.t,fontSize:12,fontWeight:600}}>{v}</span></div>)}
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
    <div style={{fontSize:10,color:C.m,marginBottom:10,letterSpacing:1}}>SCOPE: <span style={{color:C.g}}>ORG</span> = all branches · <span style={{color:C.bl}}>BRANCH</span> = one branch only · <span style={{color:C.yl}}>SITE</span> = only accounts where they're the field officer</div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}><thead><tr>{["Username","Name","Role","Scope","Branch","Views","Active","Last Login","Actions"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
      {users.map(u=>{const vp=u.view_permissions||{dashboard:true,command:true,analytics:true,notifications:true};const isSelf=u.id===user.id;
        return<tr key={u.id}>
          <td style={td}><span style={{fontWeight:700}}>{u.username}</span></td>
          <td style={td}>{u.full_name||"—"}</td>
          <td style={td}><span style={pill(u.role==="superadmin"?"#a855f7":u.role==="admin"?C.g:C.bl)}>{u.role.toUpperCase()}</span></td>
          <td style={td}>{isSelf?<span style={pill(C.g)}>{(u.scope_level||"org").toUpperCase()}</span>:<select style={{...inp,width:90,padding:"2px 6px",fontSize:10}} value={u.scope_level||"org"} onChange={e=>updateUserField(u.id,{scope_level:e.target.value,...(e.target.value!=="branch"?{scope_branch:null}:{})})}><option value="org">Org</option><option value="branch">Branch</option><option value="site">Site</option></select>}</td>
          <td style={td}>{u.scope_level==="branch"?(isSelf?<span style={{color:C.t}}>{u.scope_branch||"—"}</span>:<select style={{...inp,width:110,padding:"2px 6px",fontSize:10}} value={u.scope_branch||""} onChange={e=>updateUserField(u.id,{scope_branch:e.target.value})}><option value="">—</option>{(stg.branches||[]).map(b=><option key={b} value={b}>{b}</option>)}</select>):<span style={{color:C.d}}>—</span>}</td>
          <td style={td}>{u.role==="admin"||u.role==="superadmin"?<span style={{color:C.d,fontSize:10}}>ALL ({u.role})</span>:<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{[["dashboard","DASH"],["command","CMD"],["analytics","ANL"],["notifications","NOTIF"]].map(([k,l])=><label key={k} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,cursor:isSelf?"default":"pointer",color:vp[k]?C.gn:C.d}}><input type="checkbox" checked={vp[k]!==false} disabled={isSelf} onChange={()=>vpToggle(u,k)} style={{margin:0,cursor:isSelf?"default":"pointer"}}/>{l}</label>)}</div>}</td>
          <td style={td}><span style={dot(u.is_active?C.gn:C.rd)}/>{u.is_active?"Active":"Off"}</td>
          <td style={{...td,fontSize:11,color:C.m}}>{u.last_login?$d(u.last_login):"Never"}</td>
          <td style={td}>{!isSelf&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}><button style={{...sb("s"),color:C.bl,borderColor:`${C.bl}66`}} onClick={()=>{setPwModal({open:true,user:u});setPwVal("");setPwVal2("");setPwErr("")}}>🔑 PW</button><button style={sb("d")} onClick={()=>setDelUserModal({open:true,user:u})}>🗑 DEL</button><button style={sb(u.is_active?"d":"s")} onClick={()=>toggleUser(u.id,u.is_active)}>{u.is_active?"OFF":"ON"}</button><select style={{...inp,width:90,padding:"2px 6px",fontSize:10}} value={u.role} onChange={e=>changeRole(u.id,e.target.value)}><option value="superadmin">SuperAdmin</option><option value="admin">Admin</option><option value="user">User</option></select></div>}</td>
        </tr>})}
    </tbody></table></div>
    {showUF&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setSUF(false)}>
      <div style={{background:C.dk,border:`2px solid ${C.g}`,padding:24,width:400,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:14,fontWeight:700,color:C.g,letterSpacing:2,marginBottom:16}}>CREATE USER</div>
        <div style={{marginBottom:10}}><label style={lbl}>Username</label><input style={inp} value={uf.username} onChange={e=>setUF({...uf,username:e.target.value})}/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Password</label><input style={inp} type="password" value={uf.password} onChange={e=>setUF({...uf,password:e.target.value})}/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Full Name</label><input style={inp} value={uf.full_name} onChange={e=>setUF({...uf,full_name:e.target.value})}/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Role</label><select style={inp} value={uf.role} onChange={e=>setUF({...uf,role:e.target.value})}><option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Super Admin</option></select></div>
        <div style={{marginBottom:10}}><label style={lbl}>Scope Level</label><select style={inp} value={uf.scope_level} onChange={e=>setUF({...uf,scope_level:e.target.value,scope_branch:e.target.value==="branch"?uf.scope_branch:""})}><option value="org">Org (full company)</option><option value="branch">Branch (one branch only)</option><option value="site">Site (assigned accounts only)</option></select></div>
        {uf.scope_level==="branch"&&<div style={{marginBottom:10}}><label style={lbl}>Branch</label><select style={inp} value={uf.scope_branch} onChange={e=>setUF({...uf,scope_branch:e.target.value})}><option value="">Select...</option>{(stg.branches||[]).map(b=><option key={b} value={b}>{b}</option>)}</select></div>}
        {uf.role==="user"&&<div style={{marginBottom:14}}><label style={lbl}>View Access</label><div style={{display:"flex",gap:10,flexWrap:"wrap",padding:"6px 0"}}>{[["dashboard","Dashboard"],["command","Command"],["analytics","Analytics"],["notifications","Notifications"]].map(([k,l])=><label key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:uf.view_permissions[k]?C.t:C.m,cursor:"pointer"}}><input type="checkbox" checked={uf.view_permissions[k]} onChange={e=>setUF({...uf,view_permissions:{...uf.view_permissions,[k]:e.target.checked}})}/>{l}</label>)}</div></div>}
        <div style={{display:"flex",gap:8}}><button style={bt("p")} onClick={createUser}>CREATE</button><button style={bt("g")} onClick={()=>setSUF(false)}>CANCEL</button></div>
        <div style={{textAlign:"center",marginTop:14,fontSize:9,color:C.d,letterSpacing:2}}>BUILT FOR THE J3S OFFICE</div>
      </div>
    </div>}
    <J3S/>
  </div>;

  // ═══ NOTIFICATIONS VIEW ═══
  const Notif=()=>{
    const fDateFull=d=>d?new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";
    const evIcon={assigned:"📬",reassigned:"🔄",status_changed:"🔃",completed:"✅",deleted:"🗑️",remark_added:"💬"};
    const evColor={assigned:C.bl,reassigned:C.yl,status_changed:C.bl,completed:C.gn,deleted:C.rd,remark_added:C.g};
    return<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:14,color:C.g,letterSpacing:2,fontWeight:700}}>🔔 NOTIFICATIONS</div>
          <div style={{fontSize:10,color:C.m,marginTop:2}}>{unreadNotifCount} unread · {notifs.length} total · Auto-expires after 30/60 days</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button style={sb("s")} onClick={loadNotifs}>🔄 REFRESH</button>
          {unreadNotifCount>0&&<button style={bt("p")} onClick={markAllNotifsRead}>MARK ALL READ</button>}
        </div>
      </div>
      {notifs.length===0?<div style={{...sec,textAlign:"center",padding:40,color:C.d,fontSize:12}}>No notifications yet. You'll be notified here when tasks are assigned to you, status changes, or remarks are added.</div>:
      <div style={{background:C.p,border:`1px solid ${C.bd}`}}>
        {notifs.map(n=><div key={n.id} style={{padding:"12px 16px",borderBottom:`1px solid #1a2418`,background:n.is_read?"transparent":`${C.g}08`,display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer"}} onClick={()=>!n.is_read&&markNotifRead(n.id)}>
          <div style={{fontSize:20,minWidth:24}}>{evIcon[n.event_type]||"🔔"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
              {!n.is_read&&<span style={{width:8,height:8,borderRadius:"50%",background:C.g,display:"inline-block"}}/>}
              <span style={{fontSize:12,color:C.t,fontWeight:700}}>{n.todo_title||"(Deleted task)"}</span>
              <span style={pill(evColor[n.event_type]||C.m)}>{(n.event_type||"").replace("_"," ").toUpperCase()}</span>
            </div>
            <div style={{fontSize:11,color:C.s,marginBottom:4}}>{n.message}</div>
            {n.remark&&<div style={{fontSize:11,color:C.g,fontStyle:"italic",marginBottom:4,padding:"6px 10px",background:C.bg,borderLeft:`2px solid ${C.g}`}}>💬 "{n.remark}"</div>}
            <div style={{fontSize:10,color:C.d}}>{n.actor_name||"System"} · {fDateFull(n.created_at)}</div>
          </div>
          <button style={{...sb("s"),padding:"2px 6px",color:C.rd}} onClick={e=>{e.stopPropagation();deleteNotif(n.id)}}>✕</button>
        </div>)}
      </div>}
      <J3S/>
    </div>;
  };

  // ═══ SETTINGS ═══
  const Stg=()=><div>
    <div style={{display:"flex",gap:4,marginBottom:18,flexWrap:"wrap"}}>{[["general","General"],["services","Services"],["compliance","Compliance"],["health","Health"],["staff","Staff Roles"],["alerts","Alerts"],["billing","Billing"],["fields","Fields"],["branches","Branches"],["data","Data"]].map(([k,l])=><button key={k} style={nb(sTab===k)} onClick={()=>setSTab(k)}>{l}</button>)}</div>
    {sTab==="general"&&<div style={sec}><div style={secT}>BRANDING</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label style={lbl}>Company Name</label><input style={inp} value={stg.companyName} onChange={e=>uS({companyName:e.target.value})}/></div><div><label style={lbl}>Tagline</label><input style={inp} value={stg.tagline} onChange={e=>uS({tagline:e.target.value})}/></div><div><label style={lbl}>Currency</label><input style={{...inp,width:80}} value={stg.currency.symbol} onChange={e=>uS({currency:{...stg.currency,symbol:e.target.value}})}/></div><div><label style={lbl}>Locale</label><input style={inp} value={stg.currency.locale} onChange={e=>uS({currency:{...stg.currency,locale:e.target.value}})}/></div></div></div>}
    {sTab==="services"&&<div style={sec}><div style={secT}>SERVICE TYPES</div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{stg.serviceTypes.map((t,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1a2418",border:`1px solid ${C.bd}`,padding:"4px 10px",fontSize:11}}><InEd value={t} onChange={v=>{const u=[...stg.serviceTypes];u[i]=v;uS({serviceTypes:u})}} style={{fontSize:11,color:C.t}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({serviceTypes:stg.serviceTypes.filter((_,j)=>j!==i)})}>×</span></div>)}</div><button style={sb("s")} onClick={()=>uS({serviceTypes:[...stg.serviceTypes,"New"]})}>+ ADD</button></div>}
    {sTab==="compliance"&&<div style={sec}><div style={secT}>COMPLIANCE ITEMS</div>{stg.complianceItems.map((item,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,width:120}} value={item.key} onChange={e=>{const u=[...stg.complianceItems];u[i]={...u[i],key:e.target.value.replace(/\s/g,"")};uS({complianceItems:u})}}/><input style={{...inp,flex:1}} value={item.label} onChange={e=>{const u=[...stg.complianceItems];u[i]={...u[i],label:e.target.value};uS({complianceItems:u})}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({complianceItems:stg.complianceItems.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({complianceItems:[...stg.complianceItems,{key:`c${Date.now()}`,label:"New"}]})}>+ ADD</button></div>}
    {sTab==="health"&&<div style={sec}><div style={secT}>HEALTH STATUSES</div>{stg.healthStatuses.map((h,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,width:80}} value={h.key} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],key:e.target.value};uS({healthStatuses:u})}}/><input type="color" style={{width:40,height:32,padding:2,background:C.p,border:`1px solid ${C.bd}`,cursor:"pointer"}} value={h.color} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],color:e.target.value};uS({healthStatuses:u})}}/><input style={{...inp,flex:1}} value={h.meaning} onChange={e=>{const u=[...stg.healthStatuses];u[i]={...u[i],meaning:e.target.value};uS({healthStatuses:u})}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({healthStatuses:stg.healthStatuses.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({healthStatuses:[...stg.healthStatuses,{key:"New",color:"#888",meaning:""}]})}>+ ADD</button></div>}
    {sTab==="staff"&&<div style={sec}><div style={secT}>STAFF ROLES</div>{stg.staffRoles.map((r,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,width:120}} value={r.key} onChange={e=>{const u=[...stg.staffRoles];u[i]={...u[i],key:e.target.value.replace(/\s/g,"")};uS({staffRoles:u})}}/><input style={{...inp,flex:1}} value={r.label} onChange={e=>{const u=[...stg.staffRoles];u[i]={...u[i],label:e.target.value};uS({staffRoles:u})}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({staffRoles:stg.staffRoles.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({staffRoles:[...stg.staffRoles,{key:`r${Date.now()}`,label:"New Role"}]})}>+ ADD</button></div>}
    {sTab==="alerts"&&<div style={sec}><div style={secT}>THRESHOLDS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}><div><label style={lbl}>Renewal (days)</label><input style={inp} type="number" value={stg.alertThresholds.renewalDays} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,renewalDays:Number(e.target.value)}})}/></div><div><label style={lbl}>Overdue (days)</label><input style={inp} type="number" value={stg.alertThresholds.overduePaymentDays} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,overduePaymentDays:Number(e.target.value)}})}/></div><div><label style={lbl}>Staff %</label><input style={inp} type="number" value={stg.alertThresholds.staffShortfallPct} onChange={e=>uS({alertThresholds:{...stg.alertThresholds,staffShortfallPct:Number(e.target.value)}})}/></div></div></div>}
    {sTab==="billing"&&<div style={sec}><div style={secT}>DEFAULTS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}><div><label style={lbl}>Invoice Day</label><input style={inp} type="number" min={1} max={28} value={stg.invoiceDayDefault} onChange={e=>uS({invoiceDayDefault:Number(e.target.value)})}/></div><div><label style={lbl}>Payment Terms</label><select style={inp} value={stg.defaultPaymentTerms} onChange={e=>uS({defaultPaymentTerms:Number(e.target.value)})}>{stg.paymentTermsPresets.map(d=><option key={d} value={d}>{d}d</option>)}</select></div></div></div>}
    {sTab==="fields"&&<div style={sec}><div style={secT}>CUSTOM FIELDS</div>{stg.customFields.map((f,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input style={{...inp,flex:1}} value={f.label} onChange={e=>{const u=[...stg.customFields];u[i]={...u[i],label:e.target.value};uS({customFields:u})}}/><select style={{...inp,width:100}} value={f.type} onChange={e=>{const u=[...stg.customFields];u[i]={...u[i],type:e.target.value};uS({customFields:u})}}><option value="text">Text</option><option value="number">Number</option><option value="toggle">Yes/No</option></select><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({customFields:stg.customFields.filter((_,j)=>j!==i)})}>×</span></div>)}<button style={sb("s")} onClick={()=>uS({customFields:[...stg.customFields,{key:`cf_${Date.now()}`,label:"",type:"text"}]})}>+ ADD</button></div>}
    {sTab==="branches"&&<div style={sec}><div style={secT}>BRANCHES</div><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{(stg.branches||[]).map((b,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1a2418",border:`1px solid ${C.bd}`,padding:"4px 10px",fontSize:11}}><InEd value={b} onChange={v=>{const u=[...stg.branches];u[i]=v;uS({branches:u})}} style={{fontSize:11,color:C.t}}/><span style={{color:C.rd,cursor:"pointer",fontWeight:700}} onClick={()=>uS({branches:stg.branches.filter((_,j)=>j!==i)})}>×</span></div>)}</div><button style={sb("s")} onClick={()=>uS({branches:[...(stg.branches||[]),"New Branch"]})}>+ ADD</button></div>}
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
        <div><label style={lbl}>Branch</label><select style={inp} value={fd.branch||""} onChange={e=>setFD({...fd,branch:e.target.value})}>{(stg.branches||[]).map(b=><option key={b}>{b}</option>)}</select></div>
        <div><label style={lbl}>Field Officer Responsible</label><select style={inp} value={fd.field_officer_id||""} onChange={e=>setFD({...fd,field_officer_id:e.target.value||null})}><option value="">— None —</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username} {u.scope_level==="site"?"(site)":u.scope_level==="branch"?`(${u.scope_branch||"branch"})`:""}</option>)}</select></div>
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

  // ═══ COMMAND PANELS (4-Panel Dashboard) ═══
  const CommandPanels=({accs,users,currentUser,isAdmin,stg,loadAll,onNotifChange})=>{
    const cGet=async(t,p="")=>get(t,p);
    const cPost=async(t,d)=>post(t,d);
    const cPatch=async(t,m,d)=>patch(t,m,d);
    const cRm=async(t,m)=>rm(t,m);
    const daysSince=d=>{if(!d)return 0;return Math.floor((new Date()-new Date(d))/(864e5))};
    const fDate=d=>d?new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"}):"—";
    const fM=n=>n?`₹${Number(n).toLocaleString("en-IN")}`:"₹0";
    const prC=p=>({critical:C.rd,high:"#e85a3a",normal:C.g,low:C.m}[p]||C.g);
    const stC=s=>({pending:C.yl,in_progress:C.bl,completed:C.gn,overdue:C.rd,cancelled:C.m,partial:C.yl,collected:C.gn,disputed:C.rd,written_off:C.m,lead:"#6b7a5e",contacted:"#8a9a6e",proposal:C.g,negotiation:"#e8b84a",site_visit:"#4a9a4a",won:C.gn,lost:C.rd}[s]||C.g);
    const pnl={background:C.p,border:`1px solid ${C.bd}`,overflow:"hidden",display:"flex",flexDirection:"column"};
    const pnlH=(ac=C.g)=>({padding:"10px 14px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(135deg,#111a0f 0%,#141e14 100%)"});
    const pnlT=(ac=C.g)=>({fontSize:11,fontWeight:700,letterSpacing:2,color:ac,textTransform:"uppercase",fontFamily:F});
    const sBt=(v="p",sm=false)=>({background:v==="p"?C.g:v==="d"?C.rd:"transparent",color:v==="p"?C.bg:v==="d"?"#fff":C.m,border:v==="g"?`1px solid ${C.bd}`:"none",padding:sm?"3px 8px":"5px 12px",fontSize:sm?9:10,fontFamily:F,fontWeight:700,letterSpacing:1,cursor:"pointer",textTransform:"uppercase",borderRadius:2});
    const cInp={background:C.p,border:`1px solid ${C.bd}`,color:C.t,padding:"7px 10px",fontSize:11,fontFamily:F,borderRadius:2,width:"100%",boxSizing:"border-box"};
    const cSel={...cInp,cursor:"pointer"};
    const cBdg=c=>({display:"inline-block",padding:"1px 6px",fontSize:8,fontWeight:700,letterSpacing:1,borderRadius:2,background:`${c}22`,color:c,textTransform:"uppercase",fontFamily:F});
    const cTag=(c=C.g)=>({display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",fontSize:8,background:`${c}15`,color:c,borderRadius:2,fontFamily:F,letterSpacing:1,fontWeight:700});
    const dBdg=(days,due)=>{const od=due&&new Date(due)<new Date();const c=od?C.rd:days>7?C.yl:days>3?C.g:C.gn;return{...cBdg(c),minWidth:36,textAlign:"center"}};
    const mOv={position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20};
    const mBx={background:C.dk,border:`1px solid ${C.g}33`,padding:20,width:"100%",maxWidth:520,maxHeight:"85vh",overflowY:"auto",fontFamily:F};
    const cLbl={fontSize:9,color:C.m,letterSpacing:1.5,marginBottom:3,textTransform:"uppercase",fontFamily:F};

    // ═══ PANEL 1: ACCOUNT UPDATES ═══
    function UpdPanel(){
      const[items,setItems]=useState([]);const[showA,setShowA]=useState(false);const[ld,setLd]=useState(true);const[flt,setFlt]=useState("all");
      const[fm,setFm]=useState({title:"",description:"",category:"general",priority:"normal",account_id:""});
      const load=useCallback(async()=>{try{const d=await cGet("account_updates","?order=is_pinned.desc,created_at.desc&limit=50");setItems(d||[])}catch(e){}setLd(false)},[]);
      useEffect(()=>{load()},[load]);
      const add=async()=>{if(!fm.title.trim())return;const ac=accs.find(a=>a.id===fm.account_id);
        await cPost("account_updates",{...fm,account_name:ac?.client||"",created_by_name:currentUser?.full_name||"Admin"});
        setShowA(false);setFm({title:"",description:"",category:"general",priority:"normal",account_id:""});load()};
      const pin=async u=>{await cPatch("account_updates",`?id=eq.${u.id}`,{is_pinned:!u.is_pinned});load()};
      const del=async id=>{await cRm("account_updates",`?id=eq.${id}`);load()};
      const cats=["all","general","contract","staff","billing","compliance","alert","renewal","onboarding"];
      const catI={general:"📋",contract:"📄",staff:"👥",billing:"💰",compliance:"🛡",alert:"⚠",renewal:"🔄",onboarding:"🚀"};
      const fl=flt==="all"?items:items.filter(u=>u.category===flt);
      return<div style={pnl}>
        <div style={pnlH()}><div style={pnlT()}>📋 ACCOUNT UPDATES</div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:9,color:C.m}}>{items.length}</span>{isAdmin&&<button style={sBt("p",true)} onClick={()=>setShowA(true)}>+ ADD</button>}</div></div>
        <div style={{padding:"6px 10px",display:"flex",gap:3,flexWrap:"wrap",borderBottom:`1px solid ${C.bd}`}}>
          {cats.map(c=><button key={c} onClick={()=>setFlt(c)} style={{...sBt("g",true),background:flt===c?C.g:"transparent",color:flt===c?C.bg:C.m,border:`1px solid ${flt===c?C.g:C.bd}`,padding:"2px 6px"}}>{c==="all"?"ALL":c.slice(0,4).toUpperCase()}</button>)}
        </div>
        <div style={{flex:1,overflowY:"auto",maxHeight:300}}>
          {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>LOADING...</div>:
          fl.length===0?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>NO UPDATES</div>:
          fl.map(u=><div key={u.id} style={{padding:"8px 12px",borderBottom:`1px solid #1a2418`,background:u.is_pinned?`${C.g}08`:"transparent",display:"flex",gap:8,alignItems:"flex-start"}}>
            <div style={{fontSize:14,minWidth:18}}>{catI[u.category]||"📋"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                {u.is_pinned&&<span style={{fontSize:8,color:C.g}}>📌</span>}
                <span style={{fontSize:11,color:C.t,fontWeight:700}}>{u.title}</span>
                <span style={cBdg(prC(u.priority))}>{u.priority}</span>
              </div>
              {u.description&&<div style={{fontSize:9,color:C.m,marginBottom:2}}>{u.description}</div>}
              <div style={{display:"flex",gap:6,fontSize:8,color:C.d,flexWrap:"wrap"}}>
                {u.account_name&&<span style={cTag()}>{u.account_name}</span>}
                <span>{daysSince(u.created_at)}d ago · {u.created_by_name||"System"}</span>
              </div>
            </div>
            {isAdmin&&<div style={{display:"flex",gap:2,flexShrink:0}}>
              <button onClick={()=>pin(u)} style={{...sBt("g",true),fontSize:9,padding:"2px 4px"}}>{u.is_pinned?"📌":"📍"}</button>
              <button onClick={()=>del(u.id)} style={{...sBt("g",true),fontSize:9,padding:"2px 4px",color:C.rd}}>✕</button>
            </div>}
          </div>)}
        </div>
        {showA&&<div style={mOv} onClick={()=>setShowA(false)}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT(),marginBottom:14}}>NEW UPDATE</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div><div style={cLbl}>TITLE</div><input style={cInp} value={fm.title} onChange={e=>setFm({...fm,title:e.target.value})} placeholder="Update title..."/></div>
            <div><div style={cLbl}>DESCRIPTION</div><textarea style={{...cInp,height:50,resize:"vertical"}} value={fm.description} onChange={e=>setFm({...fm,description:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>CATEGORY</div><select style={cSel} value={fm.category} onChange={e=>setFm({...fm,category:e.target.value})}>{Object.keys(catI).map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}</select></div>
              <div><div style={cLbl}>PRIORITY</div><select style={cSel} value={fm.priority} onChange={e=>setFm({...fm,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p.toUpperCase()}</option>)}</select></div>
            </div>
            <div><div style={cLbl}>ACCOUNT</div><select style={cSel} value={fm.account_id} onChange={e=>setFm({...fm,account_id:e.target.value})}><option value="">— None —</option>{accs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
            <div style={{display:"flex",gap:8,marginTop:6}}><button style={bt("p")} onClick={add}>CREATE</button><button style={bt("g")} onClick={()=>setShowA(false)}>CANCEL</button></div>
          </div>
        </div></div>}
      </div>;
    }

    // ═══ PANEL 2: TO-DO TRACKER ═══
    function TodoPanel(){
      const[todos,setTodos]=useState([]);
      const[showA,setShowA]=useState(false);
      const[editI,setEditI]=useState(null);
      const[ld,setLd]=useState(true);
      const[sf,setSf]=useState("active");
      const[remarkModal,setRemarkModal]=useState(null);
      const[remarkText,setRemarkText]=useState("");
      const defF={title:"",description:"",priority:"normal",assigned_to:"",assigned_to_name:"",account_id:"",due_date:"",tags:""};
      const[fm,setFm]=useState(defF);

      const load=useCallback(async()=>{try{const d=await cGet("todos","?order=created_at.desc&limit=100");const now=new Date();
        const visible=(d||[]).filter(t=>isAdmin||t.assigned_to===null||t.assigned_to===currentUser?.id);
        setTodos(visible.map(t=>(["pending","in_progress"].includes(t.status)&&t.due_date&&new Date(t.due_date)<now)?{...t,status:"overdue"}:t))}catch(e){}setLd(false)},[]);
      useEffect(()=>{load()},[load]);

      const notify=async(todo,eventType,message,remark)=>{
        if(!todo)return;
        const recipients=new Set();
        if(todo.assigned_to)recipients.add(todo.assigned_to);
        if(todo.assigned_by)recipients.add(todo.assigned_by);
        (users||[]).filter(u=>u.role==="admin"&&u.is_active).forEach(u=>recipients.add(u.id));
        if(currentUser?.id)recipients.delete(currentUser.id);
        const rows=[...recipients].map(rid=>({recipient_id:rid,todo_id:todo.id,todo_title:todo.title,event_type:eventType,message,remark:remark||null,actor_id:currentUser?.id||null,actor_name:currentUser?.full_name||currentUser?.username||"System"}));
        if(rows.length>0){await cPost("todo_notifications",rows);if(onNotifChange)onNotifChange();}
      };

      const save=async()=>{if(!fm.title.trim())return;const ac=accs.find(a=>a.id===fm.account_id);
        const bd={title:fm.title,description:fm.description,priority:fm.priority,assigned_to:fm.assigned_to||null,assigned_to_name:fm.assigned_to_name||"All",account_id:fm.account_id||null,account_name:ac?.client||"",due_date:fm.due_date||null,tags:fm.tags?fm.tags.split(",").map(t=>t.trim()).filter(Boolean):[],assigned_by:currentUser?.id||null,assigned_by_name:currentUser?.full_name||"Admin"};
        if(editI){
          bd.updated_at=new Date().toISOString();
          const res=await cPatch("todos",`?id=eq.${editI.id}`,bd);
          const updated=(res&&res[0])||{...editI,...bd};
          if(editI.assigned_to!==bd.assigned_to){
            await notify(updated,"reassigned",`Task reassigned to ${bd.assigned_to_name}`);
          }
        }else{
          bd.notified_at=new Date().toISOString();bd.status="pending";
          const res=await cPost("todos",bd);
          const created=res&&res[0];
          if(created)await notify(created,"assigned",`New task assigned: ${bd.title}`);
        }
        setShowA(false);setEditI(null);setFm(defF);load()};

      const upSt=async(id,s)=>{
        const todo=todos.find(t=>t.id===id);
        if(s==="completed"){
          setRemarkModal({type:"complete",todo});
          setRemarkText("");
          return;
        }
        const bd={status:s,updated_at:new Date().toISOString()};
        await cPatch("todos",`?id=eq.${id}`,bd);
        if(todo)await notify(todo,"status_changed",`Status changed to ${s.replace("_"," ")}`);
        load();
      };

      const confirmComplete=async()=>{
        if(!remarkText.trim()){alert("Completion remark is required");return;}
        const todo=remarkModal.todo;
        const bd={status:"completed",completed_at:new Date().toISOString(),completion_remark:remarkText.trim(),updated_at:new Date().toISOString()};
        await cPatch("todos",`?id=eq.${todo.id}`,bd);
        await notify(todo,"completed",`Task completed: ${todo.title}`,remarkText.trim());
        setRemarkModal(null);setRemarkText("");load();
      };

      const del=async(id)=>{
        const todo=todos.find(t=>t.id===id);
        setRemarkModal({type:"delete",todo});
        setRemarkText("");
      };

      const confirmDelete=async()=>{
        if(!remarkText.trim()){alert("Reason for deletion is required");return;}
        const todo=remarkModal.todo;
        await notify(todo,"deleted",`Task deleted: ${todo.title}`,remarkText.trim());
        await cRm("todos",`?id=eq.${todo.id}`);
        setRemarkModal(null);setRemarkText("");load();
      };

      const fil=sf==="active"?todos.filter(t=>["pending","in_progress","overdue"].includes(t.status)):sf==="completed"?todos.filter(t=>t.status==="completed"):sf==="overdue"?todos.filter(t=>t.status==="overdue"):todos;
      const st={t:todos.length,p:todos.filter(t=>t.status==="pending").length,o:todos.filter(t=>t.status==="overdue").length,c:todos.filter(t=>t.status==="completed").length};

      return<div style={pnl}>
        <div style={pnlH(C.bl)}><div style={pnlT(C.bl)}>📝 TO-DO TRACKER</div><div style={{display:"flex",gap:6,alignItems:"center"}}>
          {st.o>0&&<span style={{...cBdg(C.rd),animation:"pulse 2s infinite"}}>{st.o} OVERDUE</span>}
          <button style={sBt("p",true)} onClick={()=>{setEditI(null);setFm(defF);setShowA(true)}}>+ ADD</button>
        </div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`}}>
          {[["ALL",st.t,C.t,"all"],["PENDING",st.p,C.yl,"active"],["OVERDUE",st.o,C.rd,"overdue"],["DONE",st.c,C.gn,"completed"]].map(([l,v,c,f])=>
            <button key={f} onClick={()=>setSf(f)} style={{background:sf===f?`${c}11`:"transparent",border:"none",borderBottom:sf===f?`2px solid ${c}`:"2px solid transparent",padding:"6px 4px",cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:c,fontFamily:F}}>{v}</div><div style={{fontSize:7,color:C.m,letterSpacing:1,fontFamily:F}}>{l}</div>
            </button>)}
        </div>
        <div style={{flex:1,overflowY:"auto",maxHeight:260}}>
          {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>LOADING...</div>:
          fil.length===0?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>NO TASKS</div>:
          fil.map(t=>{const days=daysSince(t.notified_at);const isOd=t.status==="overdue";
            return<div key={t.id} style={{padding:"8px 12px",borderBottom:`1px solid #1a2418`,background:isOd?`${C.rd}08`:"transparent",display:"flex",gap:8,alignItems:"flex-start"}}>
              <div onClick={()=>t.status!=="completed"?upSt(t.id,"completed"):upSt(t.id,"pending")} style={{width:14,height:14,borderRadius:2,border:`2px solid ${t.status==="completed"?C.gn:C.bd}`,background:t.status==="completed"?C.gn:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.bg}}>{t.status==="completed"?"✓":""}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:t.status==="completed"?C.m:C.t,fontWeight:700,textDecoration:t.status==="completed"?"line-through":"none"}}>{t.title}</span>
                  <span style={cBdg(prC(t.priority))}>{t.priority}</span>
                  <span style={cBdg(stC(t.status))}>{t.status.replace("_"," ")}</span>
                </div>
                <div style={{display:"flex",gap:4,fontSize:8,color:C.d,flexWrap:"wrap"}}>
                  {t.assigned_to_name&&<span style={cTag(C.bl)}>→ {t.assigned_to_name}</span>}
                  {t.account_name&&<span style={cTag()}>📁 {t.account_name}</span>}
                  {t.due_date&&<span style={{color:isOd?C.rd:C.m}}>Due: {fDate(t.due_date)}</span>}
                </div>
                {t.completion_remark&&<div style={{fontSize:9,color:C.gn,fontStyle:"italic",marginTop:2}}>✓ {t.completion_remark}</div>}
              </div>
              <div style={{textAlign:"center",flexShrink:0}}><div style={dBdg(days,t.due_date)}>{days}d</div><div style={{fontSize:6,color:C.d,marginTop:1}}>SINCE</div></div>
              <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
                {t.status==="pending"&&<button onClick={()=>upSt(t.id,"in_progress")} style={{...sBt("g",true),fontSize:7,padding:"1px 4px"}}>▶</button>}
                <button onClick={()=>{setEditI(t);setFm({title:t.title,description:t.description||"",priority:t.priority,assigned_to:t.assigned_to||"",assigned_to_name:t.assigned_to_name||"All",account_id:t.account_id||"",due_date:t.due_date||"",tags:(t.tags||[]).join(", ")});setShowA(true)}} style={{...sBt("g",true),fontSize:7,padding:"1px 4px"}}>✎</button>
                <button onClick={()=>del(t.id)} style={{...sBt("g",true),fontSize:7,padding:"1px 4px",color:C.rd}}>✕</button>
              </div>
            </div>})}
        </div>
        {showA&&<div style={mOv} onClick={()=>{setShowA(false);setEditI(null)}}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT(C.bl),marginBottom:14}}>{editI?"EDIT":"NEW"} TO-DO</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div><div style={cLbl}>TITLE *</div><input style={cInp} value={fm.title} onChange={e=>setFm({...fm,title:e.target.value})} placeholder="Task title..."/></div>
            <div><div style={cLbl}>DESCRIPTION</div><textarea style={{...cInp,height:40,resize:"vertical"}} value={fm.description} onChange={e=>setFm({...fm,description:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>PRIORITY</div><select style={cSel} value={fm.priority} onChange={e=>setFm({...fm,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p.toUpperCase()}</option>)}</select></div>
              <div><div style={cLbl}>DUE DATE</div><input type="date" style={cInp} value={fm.due_date} onChange={e=>setFm({...fm,due_date:e.target.value})}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>ASSIGN TO</div><select style={cSel} value={fm.assigned_to} onChange={e=>{const uid=e.target.value;const u=users.find(x=>x.id===uid);setFm({...fm,assigned_to:uid,assigned_to_name:u?(u.full_name||u.username):"All"})}}><option value="">— All (Everyone) —</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}</select></div>
              <div><div style={cLbl}>ACCOUNT</div><select style={cSel} value={fm.account_id} onChange={e=>setFm({...fm,account_id:e.target.value})}><option value="">— None —</option>{accs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
            </div>
            <div><div style={cLbl}>TAGS</div><input style={cInp} value={fm.tags} onChange={e=>setFm({...fm,tags:e.target.value})} placeholder="urgent, followup..."/></div>
            <div style={{display:"flex",gap:8,marginTop:6}}><button style={bt("p")} onClick={save}>{editI?"UPDATE":"CREATE"}</button><button style={bt("g")} onClick={()=>{setShowA(false);setEditI(null)}}>CANCEL</button></div>
          </div>
        </div></div>}
        {remarkModal&&<div style={mOv} onClick={()=>{setRemarkModal(null);setRemarkText("")}}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT(remarkModal.type==="delete"?C.rd:C.gn),marginBottom:14}}>
            {remarkModal.type==="delete"?"🗑 REASON FOR DELETION":"✅ COMPLETION REMARK"}
          </div>
          <div style={{fontSize:11,color:C.m,marginBottom:10}}>Task: <span style={{color:C.t,fontWeight:700}}>{remarkModal.todo?.title}</span></div>
          <div style={{marginBottom:12}}>
            <div style={cLbl}>{remarkModal.type==="delete"?"REASON *":"REMARK *"}</div>
            <textarea style={{...cInp,height:80,resize:"vertical"}} value={remarkText} onChange={e=>setRemarkText(e.target.value)} placeholder={remarkModal.type==="delete"?"Why is this task being deleted?":"Describe the outcome or notes about this task..."} autoFocus/>
          </div>
          <div style={{fontSize:9,color:C.d,marginBottom:12}}>This action will notify the assignee, creator, and all admins.</div>
          <div style={{display:"flex",gap:8}}>
            <button style={remarkModal.type==="delete"?bt("d"):bt("p")} onClick={remarkModal.type==="delete"?confirmDelete:confirmComplete}>
              {remarkModal.type==="delete"?"CONFIRM DELETE":"MARK COMPLETE"}
            </button>
            <button style={bt("g")} onClick={()=>{setRemarkModal(null);setRemarkText("")}}>CANCEL</button>
          </div>
        </div></div>}
      </div>;
    }

    // ═══ PANEL 3: COLLECTIONS TRACKER ═══
    function CollPanel(){
      const[items,setItems]=useState([]);const[showA,setShowA]=useState(false);const[ld,setLd]=useState(true);const[mFlt,setMFlt]=useState("");
      const defF={account_id:"",invoice_number:"",invoice_month:"",invoice_date:"",due_date:"",amount:"",gst_amount:"",notes:""};
      const[fm,setFm]=useState(defF);
      const load=useCallback(async()=>{try{const d=await cGet("collections","?order=due_date.desc&limit=200");const now=new Date();
        setItems((d||[]).map(c=>(["pending","partial"].includes(c.status)&&c.due_date&&new Date(c.due_date)<now)?{...c,status:"overdue"}:c))}catch(e){}setLd(false)},[]);
      useEffect(()=>{load()},[load]);
      const add=async()=>{if(!fm.account_id||!fm.invoice_number||!fm.amount)return;const ac=accs.find(a=>a.id===fm.account_id);const amt=Number(fm.amount)||0;const gst=Number(fm.gst_amount)||0;
        await cPost("collections",{...fm,account_name:ac?.client||"",amount:amt,gst_amount:gst,total_amount:amt+gst,collected_amount:0,status:"pending"});
        setShowA(false);setFm(defF);load()};
      const recPay=async(c,amount)=>{const nc=Number(c.collected_amount||0)+Number(amount);const ns=nc>=Number(c.total_amount)?"collected":"partial";
        await cPatch("collections",`?id=eq.${c.id}`,{collected_amount:nc,status:ns,payment_date:new Date().toISOString().split("T")[0],followup_count:(c.followup_count||0)+1,updated_at:new Date().toISOString()});load()};
      const tot=items.reduce((s,c)=>s+Number(c.total_amount||0),0);const col=items.reduce((s,c)=>s+Number(c.collected_amount||0),0);
      const od=items.filter(c=>c.status==="overdue").reduce((s,c)=>s+(Number(c.total_amount)-Number(c.collected_amount||0)),0);
      const pnd=tot-col;const rate=tot?Math.round((col/tot)*100):0;
      const months=[...new Set(items.map(c=>c.invoice_month).filter(Boolean))].sort().reverse();
      const fl=mFlt?items.filter(c=>c.invoice_month===mFlt):items;
      return<div style={pnl}>
        <div style={pnlH(C.gn)}><div style={pnlT(C.gn)}>💰 COLLECTIONS</div>{isAdmin&&<button style={sBt("p",true)} onClick={()=>setShowA(true)}>+ INVOICE</button>}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`,padding:"8px 10px",gap:4}}>
          {[["INVOICED",fM(tot),C.t],["COLLECTED",fM(col),C.gn],["PENDING",fM(pnd),C.yl],["OVERDUE",fM(od),C.rd]].map(([l,v,c])=>
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:c,fontFamily:F}}>{v}</div><div style={{fontSize:7,color:C.m,letterSpacing:1}}>{l}</div></div>)}
        </div>
        <div style={{padding:"5px 12px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:9,color:C.m,minWidth:60}}>RATE</span>
          <div style={{flex:1,height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}><div style={{width:`${rate}%`,height:"100%",background:rate>80?C.gn:rate>50?C.yl:C.rd,borderRadius:3}}/></div>
          <span style={{fontSize:10,fontWeight:700,color:rate>80?C.gn:rate>50?C.yl:C.rd,fontFamily:F}}>{rate}%</span>
          <select style={{...cSel,width:"auto",padding:"2px 6px",fontSize:9}} value={mFlt} onChange={e=>setMFlt(e.target.value)}><option value="">ALL</option>{months.map(m=><option key={m} value={m}>{m}</option>)}</select>
        </div>
        <div style={{flex:1,overflowY:"auto",maxHeight:220}}>
          {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>LOADING...</div>:
          fl.length===0?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>NO INVOICES</div>:
          fl.map(c=>{const out=Number(c.total_amount)-Number(c.collected_amount||0);const pct=Number(c.total_amount)?Math.round((Number(c.collected_amount||0)/Number(c.total_amount))*100):0;const odD=c.status==="overdue"?daysSince(c.due_date):0;
            return<div key={c.id} style={{padding:"8px 12px",borderBottom:`1px solid #1a2418`,background:c.status==="overdue"?`${C.rd}08`:"transparent"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:10,fontWeight:700,color:C.t}}>{c.invoice_number}</span><span style={cBdg(stC(c.status))}>{c.status}</span>{odD>0&&<span style={cBdg(C.rd)}>{odD}d OD</span>}</div>
                <span style={{fontSize:11,fontWeight:700,color:C.g,fontFamily:F}}>{fM(c.total_amount)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:9,color:C.m}}>{c.account_name} · {c.invoice_month}</span><span style={{fontSize:9,color:out>0?C.yl:C.gn}}>{out>0?`${fM(out)} due`:"PAID"}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{flex:1,height:3,background:C.bg,borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:pct===100?C.gn:C.g,borderRadius:2}}/></div>
                <span style={{fontSize:8,color:C.m,fontFamily:F}}>{pct}%</span>
                {out>0&&c.status!=="collected"&&isAdmin&&<button onClick={()=>{const amt=prompt(`Payment for ${c.invoice_number}\nOutstanding: ${fM(out)}`);if(amt&&Number(amt)>0)recPay(c,Number(amt))}} style={{...sBt("p",true),fontSize:7,padding:"1px 5px"}}>💵</button>}
              </div>
            </div>})}
        </div>
        {showA&&<div style={mOv} onClick={()=>setShowA(false)}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT(C.gn),marginBottom:14}}>NEW INVOICE</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div><div style={cLbl}>ACCOUNT *</div><select style={cSel} value={fm.account_id} onChange={e=>setFm({...fm,account_id:e.target.value})}><option value="">Select...</option>{accs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>INVOICE # *</div><input style={cInp} value={fm.invoice_number} onChange={e=>setFm({...fm,invoice_number:e.target.value})} placeholder="INV-001"/></div>
              <div><div style={cLbl}>MONTH</div><input style={cInp} value={fm.invoice_month} onChange={e=>setFm({...fm,invoice_month:e.target.value})} placeholder="Apr 2026"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>INV DATE</div><input type="date" style={cInp} value={fm.invoice_date} onChange={e=>setFm({...fm,invoice_date:e.target.value})}/></div>
              <div><div style={cLbl}>DUE DATE</div><input type="date" style={cInp} value={fm.due_date} onChange={e=>setFm({...fm,due_date:e.target.value})}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>AMOUNT ₹ *</div><input type="number" style={cInp} value={fm.amount} onChange={e=>setFm({...fm,amount:e.target.value})}/></div>
              <div><div style={cLbl}>GST ₹</div><input type="number" style={cInp} value={fm.gst_amount} onChange={e=>setFm({...fm,gst_amount:e.target.value})}/></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:6}}><button style={bt("p")} onClick={add}>CREATE</button><button style={bt("g")} onClick={()=>setShowA(false)}>CANCEL</button></div>
          </div>
        </div></div>}
      </div>;
    }

    // ═══ PANEL 4: SALES PIPELINE ═══
    function PipePanel(){
      const[leads,setLeads]=useState([]);const[stages,setStages]=useState([]);const[tasks,setTasks]=useState([]);
      const[showA,setShowA]=useState(false);const[showT,setShowT]=useState(null);const[editL,setEditL]=useState(null);
      const[showCfg,setShowCfg]=useState(false);const[ld,setLd]=useState(true);const[vm,setVm]=useState("kanban");const[expL,setExpL]=useState(null);
      const load=useCallback(async()=>{try{const[l,s,t]=await Promise.all([cGet("sales_pipeline","?order=created_at.desc&limit=200"),cGet("pipeline_stages","?order=sort_order.asc"),cGet("pipeline_tasks","?order=created_at.desc&limit=500")]);
        setLeads(l||[]);setStages(s||[]);setTasks(t||[])}catch(e){}setLd(false)},[]);
      useEffect(()=>{load()},[load]);
      const defF={lead_name:"",company:"",contact_person:"",contact_phone:"",service_type:"",location:"",estimated_value:"",stage:"lead",assigned_to_name:"",expected_close_date:"",notes:""};
      const[fm,setFm]=useState(defF);
      const save=async()=>{if(!fm.lead_name.trim())return;const sg=stages.find(s=>s.slug===fm.stage);
        const bd={...fm,estimated_value:Number(fm.estimated_value)||0,probability:sg?.probability||10,assigned_by_name:currentUser?.full_name||"Admin",expected_close_date:fm.expected_close_date||null};
        if(editL){bd.updated_at=new Date().toISOString();await cPatch("sales_pipeline",`?id=eq.${editL.id}`,bd)}
        else{bd.notified_at=new Date().toISOString();await cPost("sales_pipeline",bd)}
        setShowA(false);setEditL(null);setFm(defF);load()};
      const moveSt=async(id,ns)=>{const sg=stages.find(s=>s.slug===ns);const bd={stage:ns,probability:sg?.probability||10,updated_at:new Date().toISOString()};
        if(ns==="won"||ns==="lost")bd.closed_at=new Date().toISOString();await cPatch("sales_pipeline",`?id=eq.${id}`,bd);load()};
      const delL=async id=>{await cRm("sales_pipeline",`?id=eq.${id}`);load()};
      const defTF={title:"",priority:"normal",assigned_to_name:"",due_date:""};const[tf,setTf]=useState(defTF);
      const addT=async pid=>{if(!tf.title.trim())return;await cPost("pipeline_tasks",{...tf,pipeline_id:pid,status:"pending",assigned_by_name:currentUser?.full_name||"Admin",notified_at:new Date().toISOString(),due_date:tf.due_date||null});setTf(defTF);load()};
      const upT=async(id,s)=>{const bd={status:s,updated_at:new Date().toISOString()};if(s==="completed")bd.completed_at=new Date().toISOString();await cPatch("pipeline_tasks",`?id=eq.${id}`,bd);load()};
      const delT=async id=>{await cRm("pipeline_tasks",`?id=eq.${id}`);load()};
      const[ns,setNs]=useState({name:"",color:"#d4a841",probability:50});
      const addSt=async()=>{if(!ns.name.trim())return;const sl=ns.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");const mx=stages.reduce((m,s)=>Math.max(m,s.sort_order||0),0);
        await cPost("pipeline_stages",{...ns,slug:sl,sort_order:mx+1,is_active:true});setNs({name:"",color:"#d4a841",probability:50});load()};
      const delSt=async id=>{await cRm("pipeline_stages",`?id=eq.${id}`);load()};
      const tV=leads.reduce((s,l)=>s+Number(l.estimated_value||0),0);const wV=leads.reduce((s,l)=>s+(Number(l.estimated_value||0)*(l.probability||0)/100),0);
      const wonV=leads.filter(l=>l.stage==="won").reduce((s,l)=>s+Number(l.estimated_value||0),0);const actC=leads.filter(l=>!["won","lost"].includes(l.stage)).length;
      const actSt=stages.filter(s=>s.is_active);
      return<div style={pnl}>
        <div style={pnlH("#e8b84a")}><div style={pnlT("#e8b84a")}>🚀 SALES PIPELINE</div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <button onClick={()=>setVm(v=>v==="kanban"?"list":"kanban")} style={sBt("g",true)}>{vm==="kanban"?"☰":"▦"}</button>
            {isAdmin&&<button onClick={()=>setShowCfg(true)} style={sBt("g",true)}>⚙</button>}
            <button style={sBt("p",true)} onClick={()=>{setEditL(null);setFm(defF);setShowA(true)}}>+ LEAD</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`,padding:"6px 10px"}}>
          {[["PIPELINE",fM(tV),C.t],["WEIGHTED",fM(wV),C.yl],["WON",fM(wonV),C.gn],["ACTIVE",actC,C.bl]].map(([l,v,c])=>
            <div key={l} style={{textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:c,fontFamily:F}}>{v}</div><div style={{fontSize:7,color:C.m,letterSpacing:1}}>{l}</div></div>)}
        </div>
        <div style={{flex:1,overflowX:"auto",overflowY:"auto",maxHeight:280}}>
          {ld?<div style={{padding:20,textAlign:"center",color:C.m,fontSize:10}}>LOADING...</div>:
          vm==="kanban"?<div style={{display:"flex",gap:2,padding:4,minWidth:actSt.length*150}}>
            {actSt.map(sg=>{const sl=leads.filter(l=>l.stage===sg.slug);
              return<div key={sg.id} style={{flex:1,minWidth:140,background:C.bg,overflow:"hidden"}}>
                <div style={{padding:"5px 6px",background:`${sg.color}15`,borderBottom:`2px solid ${sg.color}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:7,fontWeight:700,color:sg.color,letterSpacing:1,fontFamily:F}}>{sg.name.toUpperCase()}</span>
                  <span style={{...cBdg(sg.color),fontSize:7}}>{sl.length}</span>
                </div>
                <div style={{padding:3,display:"flex",flexDirection:"column",gap:2,maxHeight:220,overflowY:"auto"}}>
                  {sl.map(l=>{const lt=tasks.filter(t=>t.pipeline_id===l.id);const days=daysSince(l.notified_at);
                    return<div key={l.id} style={{background:C.p,padding:"5px 6px",border:`1px solid ${C.bd}`,cursor:"pointer"}} onClick={()=>setExpL(expL===l.id?null:l.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}><span style={{fontSize:9,fontWeight:700,color:C.t}}>{l.lead_name}</span><span style={dBdg(days)}>{days}d</span></div>
                      {l.company&&<div style={{fontSize:7,color:C.m}}>{l.company}</div>}
                      <div style={{fontSize:9,fontWeight:700,color:C.g,marginTop:1}}>{fM(l.estimated_value)}</div>
                      {l.assigned_to_name&&<div style={{fontSize:7,color:C.bl}}>→ {l.assigned_to_name}</div>}
                      {lt.length>0&&<div style={{fontSize:7,color:C.m,marginTop:2}}>📋 {lt.filter(t=>t.status==="completed").length}/{lt.length}</div>}
                      {expL===l.id&&<div style={{marginTop:4,borderTop:`1px solid ${C.bd}`,paddingTop:4}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:3}}>
                          {actSt.filter(s=>s.slug!==l.stage).map(s=><button key={s.slug} onClick={()=>moveSt(l.id,s.slug)} style={{...sBt("g",true),fontSize:6,padding:"1px 3px",color:s.color}}>{s.name.slice(0,6)}</button>)}
                        </div>
                        <div style={{display:"flex",gap:2}}>
                          <button onClick={()=>{setEditL(l);setFm({lead_name:l.lead_name,company:l.company||"",contact_person:l.contact_person||"",contact_phone:l.contact_phone||"",service_type:l.service_type||"",location:l.location||"",estimated_value:l.estimated_value||"",stage:l.stage,assigned_to_name:l.assigned_to_name||"",expected_close_date:l.expected_close_date||"",notes:l.notes||""});setShowA(true)}} style={{...sBt("g",true),fontSize:6}}>✎</button>
                          <button onClick={()=>setShowT(l.id)} style={{...sBt("g",true),fontSize:6,color:C.bl}}>📋</button>
                          <button onClick={()=>delL(l.id)} style={{...sBt("g",true),fontSize:6,color:C.rd}}>✕</button>
                        </div>
                        {lt.map(t=><div key={t.id} style={{display:"flex",gap:3,alignItems:"center",padding:"1px 0",fontSize:7}}>
                          <span onClick={()=>upT(t.id,t.status==="completed"?"pending":"completed")} style={{cursor:"pointer",color:t.status==="completed"?C.gn:C.m}}>{t.status==="completed"?"☑":"☐"}</span>
                          <span style={{flex:1,color:t.status==="completed"?C.m:C.t,textDecoration:t.status==="completed"?"line-through":"none"}}>{t.title}</span>
                          {t.notified_at&&<span style={dBdg(daysSince(t.notified_at),t.due_date)}>{daysSince(t.notified_at)}d</span>}
                        </div>)}
                      </div>}
                    </div>})}
                  {sl.length===0&&<div style={{textAlign:"center",padding:8,fontSize:7,color:C.d}}>—</div>}
                </div>
              </div>})}
          </div>:
          <div>{leads.map(l=>{const sg=stages.find(s=>s.slug===l.stage);const lt=tasks.filter(t=>t.pipeline_id===l.id);const days=daysSince(l.notified_at);
            return<div key={l.id} style={{padding:"8px 12px",borderBottom:`1px solid #1a2418`,display:"flex",gap:8,alignItems:"center"}}>
              <div style={{flex:1}}><div style={{display:"flex",gap:4,alignItems:"center",marginBottom:1}}><span style={{fontSize:10,fontWeight:700,color:C.t}}>{l.lead_name}</span><span style={cBdg(sg?.color||C.g)}>{sg?.name||l.stage}</span>{l.assigned_to_name&&<span style={cTag(C.bl)}>→ {l.assigned_to_name}</span>}</div>
                <div style={{fontSize:8,color:C.m}}>{[l.company,l.service_type,l.location].filter(Boolean).join(" · ")}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:C.g,fontFamily:F}}>{fM(l.estimated_value)}</div><div style={{display:"flex",gap:3,justifyContent:"flex-end"}}><span style={dBdg(days)}>{days}d</span>{lt.length>0&&<span style={{fontSize:7,color:C.m}}>📋{lt.filter(t=>t.status==="completed").length}/{lt.length}</span>}</div></div>
              <div style={{display:"flex",gap:2}}>
                <button onClick={()=>{setEditL(l);setFm({lead_name:l.lead_name,company:l.company||"",contact_person:l.contact_person||"",contact_phone:l.contact_phone||"",service_type:l.service_type||"",location:l.location||"",estimated_value:l.estimated_value||"",stage:l.stage,assigned_to_name:l.assigned_to_name||"",expected_close_date:l.expected_close_date||"",notes:l.notes||""});setShowA(true)}} style={sBt("g",true)}>✎</button>
                <button onClick={()=>setShowT(l.id)} style={{...sBt("g",true),color:C.bl}}>📋</button>
                <button onClick={()=>delL(l.id)} style={{...sBt("g",true),color:C.rd}}>✕</button>
              </div>
            </div>})}</div>}
        </div>
        {showA&&<div style={mOv} onClick={()=>{setShowA(false);setEditL(null)}}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT("#e8b84a"),marginBottom:14}}>{editL?"EDIT":"NEW"} LEAD</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div><div style={cLbl}>NAME *</div><input style={cInp} value={fm.lead_name} onChange={e=>setFm({...fm,lead_name:e.target.value})}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>COMPANY</div><input style={cInp} value={fm.company} onChange={e=>setFm({...fm,company:e.target.value})}/></div>
              <div><div style={cLbl}>SERVICE</div><input style={cInp} value={fm.service_type} onChange={e=>setFm({...fm,service_type:e.target.value})}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>CONTACT</div><input style={cInp} value={fm.contact_person} onChange={e=>setFm({...fm,contact_person:e.target.value})}/></div>
              <div><div style={cLbl}>PHONE</div><input style={cInp} value={fm.contact_phone} onChange={e=>setFm({...fm,contact_phone:e.target.value})}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>LOCATION</div><input style={cInp} value={fm.location} onChange={e=>setFm({...fm,location:e.target.value})}/></div>
              <div><div style={cLbl}>VALUE ₹</div><input type="number" style={cInp} value={fm.estimated_value} onChange={e=>setFm({...fm,estimated_value:e.target.value})}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={cLbl}>STAGE</div><select style={cSel} value={fm.stage} onChange={e=>setFm({...fm,stage:e.target.value})}>{actSt.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></div>
              <div><div style={cLbl}>ASSIGN TO</div><select style={cSel} value={fm.assigned_to_name} onChange={e=>setFm({...fm,assigned_to_name:e.target.value})}><option value="">—</option>{users.map(u=><option key={u.id} value={u.full_name}>{u.full_name}</option>)}</select></div>
            </div>
            <div><div style={cLbl}>CLOSE DATE</div><input type="date" style={cInp} value={fm.expected_close_date} onChange={e=>setFm({...fm,expected_close_date:e.target.value})}/></div>
            <div><div style={cLbl}>NOTES</div><textarea style={{...cInp,height:40,resize:"vertical"}} value={fm.notes} onChange={e=>setFm({...fm,notes:e.target.value})}/></div>
            <div style={{display:"flex",gap:8,marginTop:6}}><button style={bt("p")} onClick={save}>{editL?"UPDATE":"CREATE"}</button><button style={bt("g")} onClick={()=>{setShowA(false);setEditL(null)}}>CANCEL</button></div>
          </div>
        </div></div>}
        {showT&&<div style={mOv} onClick={()=>setShowT(null)}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT(C.bl),marginBottom:10}}>PIPELINE TASKS</div>
          {tasks.filter(t=>t.pipeline_id===showT).map(t=><div key={t.id} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 0",borderBottom:`1px solid #1a2418`}}>
            <span onClick={()=>upT(t.id,t.status==="completed"?"pending":"completed")} style={{cursor:"pointer",fontSize:14}}>{t.status==="completed"?"☑":"☐"}</span>
            <div style={{flex:1}}><div style={{fontSize:10,color:t.status==="completed"?C.m:C.t,textDecoration:t.status==="completed"?"line-through":"none"}}>{t.title}</div>
              <div style={{fontSize:8,color:C.d}}>{t.assigned_to_name&&`→ ${t.assigned_to_name}`}{t.due_date&&` · Due ${fDate(t.due_date)}`}{t.notified_at&&` · ${daysSince(t.notified_at)}d`}</div></div>
            <span style={cBdg(prC(t.priority))}>{t.priority}</span>
            <button onClick={()=>delT(t.id)} style={{...sBt("g",true),color:C.rd,fontSize:8}}>✕</button>
          </div>)}
          <div style={{borderTop:`1px solid ${C.bd}`,paddingTop:8,marginTop:8}}>
            <div style={{...cLbl,marginBottom:4}}>ADD TASK</div>
            <input style={{...cInp,marginBottom:6}} placeholder="Task..." value={tf.title} onChange={e=>setTf({...tf,title:e.target.value})}/>
            <div style={{display:"flex",gap:4,marginBottom:6}}>
              <select style={{...cSel,flex:1}} value={tf.priority} onChange={e=>setTf({...tf,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p}</option>)}</select>
              <select style={{...cSel,flex:1}} value={tf.assigned_to_name} onChange={e=>setTf({...tf,assigned_to_name:e.target.value})}><option value="">Assign...</option>{users.map(u=><option key={u.id} value={u.full_name}>{u.full_name}</option>)}</select>
              <input type="date" style={{...cInp,flex:1}} value={tf.due_date} onChange={e=>setTf({...tf,due_date:e.target.value})}/>
            </div>
            <button style={bt("p")} onClick={()=>addT(showT)}>ADD</button>
          </div>
          <button style={{...bt("g"),marginTop:8,width:"100%"}} onClick={()=>setShowT(null)}>CLOSE</button>
        </div></div>}
        {showCfg&&<div style={mOv} onClick={()=>setShowCfg(false)}><div style={mBx} onClick={e=>e.stopPropagation()}>
          <div style={{...pnlT("#e8b84a"),marginBottom:10}}>STAGES CONFIG</div>
          {stages.map(s=><div key={s.id} style={{display:"flex",gap:6,alignItems:"center",padding:"4px 0",borderBottom:`1px solid #1a2418`}}>
            <div style={{width:10,height:10,borderRadius:2,background:s.color}}/><span style={{flex:1,fontSize:10,color:C.t}}>{s.name}</span><span style={{fontSize:9,color:C.m}}>{s.probability}%</span>
            {!["lead","won","lost"].includes(s.slug)&&<button onClick={()=>delSt(s.id)} style={{...sBt("g",true),color:C.rd,fontSize:8}}>✕</button>}
          </div>)}
          <div style={{borderTop:`1px solid ${C.bd}`,paddingTop:8,marginTop:8}}>
            <div style={{...cLbl,marginBottom:4}}>ADD STAGE</div>
            <div style={{display:"flex",gap:4}}>
              <input style={{...cInp,flex:1}} placeholder="Name..." value={ns.name} onChange={e=>setNs({...ns,name:e.target.value})}/>
              <input type="color" style={{width:32,height:28,padding:1,background:C.p,border:`1px solid ${C.bd}`,cursor:"pointer"}} value={ns.color} onChange={e=>setNs({...ns,color:e.target.value})}/>
              <input type="number" style={{...cInp,width:44}} placeholder="%" value={ns.probability} onChange={e=>setNs({...ns,probability:Number(e.target.value)})}/>
              <button style={sBt("p",true)} onClick={addSt}>ADD</button>
            </div>
          </div>
          <button style={{...bt("g"),marginTop:8,width:"100%"}} onClick={()=>setShowCfg(false)}>CLOSE</button>
        </div></div>}
      </div>;
    }

    return<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,minHeight:"calc(100vh - 120px)"}}>
        <UpdPanel/><TodoPanel/><CollPanel/><PipePanel/>
      </div>
      <J3S/>
    </>;
  };

  // ═══ TASKS VIEW (Full Tab) ═══
  const Tasks=()=>{
    // Filter visible tasks based on scope & role
    const visibleTasks=allTodos.filter(t=>{
      if(isA)return true;
      // Non-admins see tasks assigned to them or unassigned
      if(t.assigned_to===user.id||t.assigned_to===null)return true;
      return false;
    });

    // Apply status filter
    const statusFiltered=taskFilter==="all"?visibleTasks:
      taskFilter==="active"?visibleTasks.filter(t=>["pending","in_progress","overdue"].includes(t.status)):
      taskFilter==="overdue"?visibleTasks.filter(t=>t.status==="overdue"):
      taskFilter==="completed"?visibleTasks.filter(t=>t.status==="completed"):
      visibleTasks.filter(t=>t.status===taskFilter);

    // Assignee filter
    const assigneeFiltered=taskAssigneeFlt==="all"?statusFiltered:
      taskAssigneeFlt==="me"?statusFiltered.filter(t=>t.assigned_to===user.id):
      taskAssigneeFlt==="unassigned"?statusFiltered.filter(t=>!t.assigned_to):
      statusFiltered.filter(t=>t.assigned_to===taskAssigneeFlt);

    // Search filter
    const filtered=!taskSearch?assigneeFiltered:assigneeFiltered.filter(t=>
      t.title.toLowerCase().includes(taskSearch.toLowerCase())||
      (t.description||"").toLowerCase().includes(taskSearch.toLowerCase())||
      (t.account_name||"").toLowerCase().includes(taskSearch.toLowerCase())||
      (t.assigned_to_name||"").toLowerCase().includes(taskSearch.toLowerCase())
    );

    // Stats
    const st={
      all:visibleTasks.length,
      active:visibleTasks.filter(t=>["pending","in_progress","overdue"].includes(t.status)).length,
      pending:visibleTasks.filter(t=>t.status==="pending").length,
      in_progress:visibleTasks.filter(t=>t.status==="in_progress").length,
      overdue:visibleTasks.filter(t=>t.status==="overdue").length,
      completed:visibleTasks.filter(t=>t.status==="completed").length,
    };

    const prC=p=>({critical:C.rd,high:"#e85a3a",normal:C.g,low:C.m}[p]||C.g);
    const stC=s=>({pending:C.yl,in_progress:C.bl,completed:C.gn,overdue:C.rd,cancelled:C.m}[s]||C.g);
    const fmtTs=ts=>{if(!ts)return"—";const d=new Date(ts);return d.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"2-digit",hour:"2-digit",minute:"2-digit"})};
    const fmtDate=d=>{if(!d)return"—";return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"})};
    const daysSince=d=>{if(!d)return 0;return Math.floor((new Date()-new Date(d))/864e5)};

    const selTask=selTaskId?allTodos.find(t=>t.id===selTaskId):null;
    const selUpdates=selTask?allTaskUpdates.filter(u=>u.todo_id===selTask.id).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)):[];
    const canPostUpdate=selTask&&(isA||selTask.assigned_to===user.id||selTask.assigned_by===user.id);

    return<div>
      {/* Header + Stats */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:14,color:C.g,letterSpacing:2,fontWeight:700}}>📋 TASK TRACKER</div>
          <div style={{fontSize:10,color:C.m,marginTop:2}}>{st.active} active · {st.overdue} overdue · {st.completed} completed · {st.all} total</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button style={sb("s")} onClick={loadTasks}>🔄 REFRESH</button>
          <button style={bt("p")} onClick={()=>{setEditTask(null);setTaskForm(defTaskForm);setShowTaskForm(true)}}>+ NEW TASK</button>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:14}}>
        {[["ALL",st.all,C.t,"all"],["ACTIVE",st.active,C.yl,"active"],["PENDING",st.pending,C.yl,"pending"],["IN PROGRESS",st.in_progress,C.bl,"in_progress"],["OVERDUE",st.overdue,C.rd,"overdue"],["COMPLETED",st.completed,C.gn,"completed"]].map(([l,v,c,f])=>
          <button key={f} onClick={()=>setTaskFilter(f)} style={{background:taskFilter===f?`${c}15`:C.p,border:`1px solid ${taskFilter===f?c:C.bd}`,padding:"10px 8px",cursor:"pointer",fontFamily:F,textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:C.m,letterSpacing:1.5,marginTop:2}}>{l}</div>
          </button>)}
      </div>

      {/* Search + Assignee filter */}
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input style={{...inp,width:260,flexShrink:0}} placeholder="Search title / description / account..." value={taskSearch} onChange={e=>setTaskSearch(e.target.value)}/>
        <select style={{...inp,width:180}} value={taskAssigneeFlt} onChange={e=>setTaskAssigneeFlt(e.target.value)}>
          <option value="all">All assignees</option>
          <option value="me">🎯 Assigned to me</option>
          <option value="unassigned">Unassigned</option>
          {users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}
        </select>
        <div style={{fontSize:10,color:C.m,marginLeft:6}}>{filtered.length} task(s)</div>
      </div>

      {/* Main layout: list | detail */}
      <div style={{display:"grid",gridTemplateColumns:selTask?"minmax(320px,1fr) 2fr":"1fr",gap:14,alignItems:"flex-start"}}>

        {/* Task list */}
        <div style={{background:C.p,border:`1px solid ${C.bd}`,maxHeight:"calc(100vh - 320px)",overflowY:"auto"}}>
          {filtered.length===0?<div style={{padding:40,textAlign:"center",color:C.d,fontSize:11}}>No tasks match the current filter</div>:
          filtered.map(t=>{
            const isSel=selTaskId===t.id;
            const updCount=allTaskUpdates.filter(u=>u.todo_id===t.id).length;
            const isOd=t.status==="overdue";
            return<div key={t.id} onClick={()=>setSelTaskId(t.id===selTaskId?null:t.id)} style={{padding:"12px 14px",borderBottom:`1px solid #1a2418`,background:isSel?`${C.g}15`:isOd?`${C.rd}08`:"transparent",cursor:"pointer",borderLeft:isSel?`3px solid ${C.g}`:"3px solid transparent"}}>
              <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:4}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:t.status==="completed"?C.m:C.t,fontWeight:700,textDecoration:t.status==="completed"?"line-through":"none",marginBottom:3}}>{t.title}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                    <span style={pill(prC(t.priority))}>{t.priority}</span>
                    <span style={pill(stC(t.status))}>{t.status.replace("_"," ")}</span>
                    {updCount>0&&<span style={pill(C.bl)}>💬 {updCount}</span>}
                  </div>
                </div>
              </div>
              <div style={{fontSize:10,color:C.m,display:"flex",gap:6,flexWrap:"wrap"}}>
                {t.assigned_to_name&&<span>→ {t.assigned_to_name}</span>}
                {t.account_name&&<span>· 📁 {t.account_name}</span>}
              </div>
              {t.due_date&&<div style={{fontSize:10,color:isOd?C.rd:C.m,marginTop:3}}>Due: {fmtDate(t.due_date)}</div>}
            </div>})}
        </div>

        {/* Task detail + updates */}
        {selTask&&<div style={{background:C.p,border:`1px solid ${C.bd}`,maxHeight:"calc(100vh - 320px)",overflowY:"auto"}}>
          <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.bd}`,background:"linear-gradient(135deg,#111a0f 0%,#141e14 100%)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:C.t,marginBottom:4}}>{selTask.title}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <span style={pill(prC(selTask.priority))}>{selTask.priority}</span>
                  <span style={pill(stC(selTask.status))}>{selTask.status.replace("_"," ")}</span>
                  {selTask.account_name&&<span style={pill(C.bl)}>📁 {selTask.account_name}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:4}}>
                {(isA||selTask.assigned_by===user.id)&&<button style={sb("s")} onClick={()=>{setEditTask(selTask);setTaskForm({title:selTask.title,description:selTask.description||"",priority:selTask.priority,assigned_to:selTask.assigned_to||"",assigned_to_name:selTask.assigned_to_name||"",account_id:selTask.account_id||"",due_date:selTask.due_date||"",tags:(selTask.tags||[]).join(", ")});setShowTaskForm(true)}}>✎ EDIT</button>}
                {isA&&<button style={sb("d")} onClick={()=>delTask(selTask.id)}>✕ DELETE</button>}
                <button style={sb("s")} onClick={()=>setSelTaskId(null)}>✕</button>
              </div>
            </div>
            {selTask.description&&<div style={{fontSize:11,color:C.s,marginTop:8,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{selTask.description}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginTop:12,fontSize:10}}>
              <div><div style={{color:C.m,letterSpacing:1}}>ASSIGNED TO</div><div style={{color:C.t,fontWeight:700,marginTop:2}}>{selTask.assigned_to_name||"All"}</div></div>
              <div><div style={{color:C.m,letterSpacing:1}}>ASSIGNED BY</div><div style={{color:C.t,fontWeight:700,marginTop:2}}>{selTask.assigned_by_name||"—"}</div></div>
              <div><div style={{color:C.m,letterSpacing:1}}>DUE DATE</div><div style={{color:selTask.status==="overdue"?C.rd:C.t,fontWeight:700,marginTop:2}}>{fmtDate(selTask.due_date)}</div></div>
              <div><div style={{color:C.m,letterSpacing:1}}>CREATED</div><div style={{color:C.t,fontWeight:700,marginTop:2}}>{daysSince(selTask.created_at)}d ago</div></div>
            </div>
            {selTask.tags&&selTask.tags.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:10}}>{selTask.tags.map((tg,i)=><span key={i} style={{...pill(C.m),background:"#1a2418"}}>#{tg}</span>)}</div>}
          </div>

          {/* Activity Timeline */}
          <div style={{padding:"16px 18px"}}>
            <div style={{fontSize:11,color:C.g,letterSpacing:2,marginBottom:12,textTransform:"uppercase"}}>📜 Activity Log ({selUpdates.length})</div>

            {selUpdates.length===0?<div style={{fontSize:11,color:C.d,fontStyle:"italic",marginBottom:14}}>No updates yet. {canPostUpdate?"Post the first update below.":""}</div>:
            <div style={{marginBottom:14,position:"relative",paddingLeft:22}}>
              <div style={{position:"absolute",left:7,top:6,bottom:6,width:2,background:C.bd}}/>
              {selUpdates.map((u,i)=>{
                const isStatusChange=!!u.status_change;
                return<div key={u.id} style={{position:"relative",marginBottom:14,paddingBottom:8}}>
                  <div style={{position:"absolute",left:-20,top:4,width:12,height:12,borderRadius:"50%",background:isStatusChange?stC(u.status_change):C.g,border:`2px solid ${C.bg}`}}/>
                  <div style={{background:C.bg,padding:"10px 12px",border:`1px solid ${C.bd}`,borderLeft:`3px solid ${isStatusChange?stC(u.status_change):C.g}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:6}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:C.g,fontWeight:700}}>👤 {u.author_name||"Unknown"}</span>
                        {isStatusChange&&<span style={pill(stC(u.status_change))}>→ {u.status_change.replace("_"," ")}</span>}
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:9,color:C.d,fontFamily:F}}>{fmtTs(u.created_at)}</span>
                        {(isA||u.author_id===user.id)&&<span style={{color:C.rd,cursor:"pointer",fontSize:11}} onClick={()=>delTaskUpdate(u.id)}>✕</span>}
                      </div>
                    </div>
                    <div style={{fontSize:12,color:C.t,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{u.update_text}</div>
                  </div>
                </div>})}
            </div>}

            {/* Post Update Composer */}
            {canPostUpdate?<div style={{background:C.bg,border:`1px solid ${C.bd}`,padding:12}}>
              <div style={{fontSize:10,color:C.g,letterSpacing:1.5,marginBottom:8}}>✍ ADD UPDATE</div>
              <textarea style={{...inp,height:70,resize:"vertical",marginBottom:8}} placeholder="What progress have you made? What blockers? What's next?" value={updateText} onChange={e=>setUpdateText(e.target.value)}/>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:160}}>
                  <label style={{...lbl,marginBottom:2}}>Change status? (optional)</label>
                  <select style={inp} value={updateStatus} onChange={e=>setUpdateStatus(e.target.value)}>
                    <option value="">— No change —</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button style={{...bt("p"),marginTop:14}} onClick={()=>postTaskUpdate(selTask.id)} disabled={syncing||!updateText.trim()}>{syncing?"POSTING...":"POST UPDATE"}</button>
              </div>
            </div>:<div style={{fontSize:10,color:C.d,textAlign:"center",padding:10,fontStyle:"italic"}}>You can view this task but cannot post updates. Only the assignee, creator, or admins can add updates.</div>}
          </div>
        </div>}
      </div>

      {/* Task Form Modal */}
      {showTaskForm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:40,overflowY:"auto"}} onClick={()=>{setShowTaskForm(false);setEditTask(null)}}>
        <div style={{background:C.dk,border:`2px solid ${C.g}`,padding:22,width:"94%",maxWidth:560,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:14,fontWeight:700,color:C.g,letterSpacing:2,marginBottom:14}}>{editTask?"EDIT":"NEW"} TASK</div>
          <div style={{marginBottom:10}}><label style={lbl}>Title *</label><input style={inp} value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} placeholder="What needs to be done?"/></div>
          <div style={{marginBottom:10}}><label style={lbl}>Description</label><textarea style={{...inp,height:70,resize:"vertical"}} value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} placeholder="Details, context, expected outcome..."/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Priority</label><select style={inp} value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}>{["low","normal","high","critical"].map(p=><option key={p} value={p}>{p.toUpperCase()}</option>)}</select></div>
            <div><label style={lbl}>Due Date</label><input type="date" style={inp} value={taskForm.due_date} onChange={e=>setTaskForm({...taskForm,due_date:e.target.value})}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Assign To</label><select style={inp} value={taskForm.assigned_to} onChange={e=>{const uid=e.target.value;const u=users.find(x=>x.id===uid);setTaskForm({...taskForm,assigned_to:uid,assigned_to_name:u?(u.full_name||u.username):"All"})}}><option value="">— All (Everyone) —</option>{users.filter(u=>u.is_active).map(u=><option key={u.id} value={u.id}>{u.full_name||u.username}</option>)}</select></div>
            <div><label style={lbl}>Linked Account</label><select style={inp} value={taskForm.account_id} onChange={e=>setTaskForm({...taskForm,account_id:e.target.value})}><option value="">— None —</option>{scopedAccs.map(a=><option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
          </div>
          <div style={{marginBottom:14}}><label style={lbl}>Tags (comma-separated)</label><input style={inp} value={taskForm.tags} onChange={e=>setTaskForm({...taskForm,tags:e.target.value})} placeholder="site-visit, urgent, vendor..."/></div>
          <div style={{display:"flex",gap:8}}><button style={bt("p")} onClick={saveTask} disabled={syncing}>{syncing?"SAVING...":editTask?"UPDATE":"CREATE"}</button><button style={bt("g")} onClick={()=>{setShowTaskForm(false);setEditTask(null)}}>CANCEL</button></div>
        </div>
      </div>}

      <J3S/>
    </div>;
  };

  // ═══ MAIN RENDER ═══
  return<div style={{background:C.bg,minHeight:"100vh",fontFamily:F,color:C.t}}>
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet"/>
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} *::-webkit-scrollbar{width:5px;height:5px} *::-webkit-scrollbar-track{background:${C.bg}} *::-webkit-scrollbar-thumb{background:${C.bd};border-radius:3px} *::-webkit-scrollbar-thumb:hover{background:${C.g}} input[type=color]{padding:2px;height:32px;cursor:pointer}`}</style>
    <div style={{background:"linear-gradient(180deg,#1a2418 0%,#0f1a0d 100%)",borderBottom:`2px solid ${C.g}`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:6}}>
      <div><div style={{fontSize:16,fontWeight:700,color:C.g,letterSpacing:3}}>{stg.companyName} ACCOUNTS</div><div style={{fontSize:9,color:C.d,letterSpacing:2}}>BUILT FOR THE <span style={{color:C.g}}>J3S OFFICE</span></div></div>
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        {syncing&&<span style={{fontSize:10,color:C.yl,animation:"pulse 1s infinite"}}>SYNCING</span>}
        {[["dashboard","DASHBOARD"],["tasks","📋 TASKS"],["command","COMMAND"],["analytics","ANALYTICS"],["notifications",`🔔 NOTIFICATIONS${unreadNotifCount>0?` (${unreadNotifCount})`:""}`],...(isSA?[["users","👤 USERS"],["settings","⚙ SETTINGS"]]:[])].filter(([k])=>["users","settings"].includes(k)?isSA:k==="tasks"?true:canSee(k)).map(([k,l])=>{
          const active=view===k||(view==="detail"&&k==="dashboard");
          const hasUnread=k==="notifications"&&unreadNotifCount>0;
          return<button key={k} style={{...nb(active),position:"relative",...(hasUnread&&!active?{borderColor:C.rd,color:C.rd}:{})}} onClick={()=>{setView(k);setSelId(null)}}>{l}</button>
        })}
        <span style={{background:C.gn,color:C.bg,padding:"2px 8px",fontSize:9,fontWeight:700,borderRadius:2}}>LIVE</span>
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:6,padding:"4px 10px",background:"#1a2418",border:`1px solid ${C.bd}`,fontSize:10}}>
          <span style={dot(C.gn)}/><span style={{color:C.t}}>{user.full_name||user.username}</span><span style={pill(isA?C.g:C.bl)}>{user.role.toUpperCase()}</span>
          <span style={{color:C.rd,cursor:"pointer",fontWeight:700,marginLeft:4}} onClick={()=>{setUser(null);setLoaded(false);setAccs([]);setNotifs([]);setView("dashboard")}}>✕</span>
        </div>
      </div>
    </div>
    <div style={{padding:"18px 20px"}}>
     {view==="dashboard"&&Dash()}
{view==="tasks"&&Tasks()}
{view==="command"&&<CommandPanels accs={scopedAccs} users={users} currentUser={user} isAdmin={isA} stg={stg} loadAll={loadAll} onNotifChange={loadNotifs}/>}
{view==="detail"&&Det()}
{view==="analytics"&&Analytics()}
{view==="notifications"&&Notif()}
{view==="users"&&isSA&&Usr()}
{view==="settings"&&isSA&&Stg()}
    </div>
    {showFrm&&Frm()}
    {pwModal.open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{setPwModal({open:false,user:null});setPwVal("");setPwVal2("");setPwErr("")}}>
      <div style={{background:C.dk,border:`2px solid ${C.bl}`,padding:24,width:360,fontFamily:F}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:11,color:C.bl,letterSpacing:2,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${C.bd}`,fontWeight:700}}>🔑 RESET PASSWORD</div>
        <div style={{fontSize:11,color:C.m,marginBottom:14}}>User: <span style={{color:C.t,fontWeight:700}}>{pwModal.user?.full_name||pwModal.user?.username}</span></div>
        <div style={{marginBottom:10}}><label style={lbl}>New Password *</label><input style={inp} type="password" value={pwVal} onChange={e=>setPwVal(e.target.value)} placeholder="Enter new password" autoFocus/></div>
        <div style={{marginBottom:10}}><label style={lbl}>Confirm Password *</label><input style={inp} type="password" value={pwVal2} onChange={e=>setPwVal2(e.target.value)} placeholder="Confirm new password"/></div>
        {pwErr&&<div style={{color:C.rd,fontSize:11,marginBottom:10}}>{pwErr}</div>}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button style={bt("p")} onClick={async()=>{
            if(!pwVal.trim()){setPwErr("Password required");return}
            if(pwVal!==pwVal2){setPwErr("Passwords do not match");return}
            if(pwVal.length<6){setPwErr("Minimum 6 characters");return}
            setPwErr("");
            const ok=await resetUserPassword(pwModal.user.id,pwVal);
            if(ok){tw("Password reset");setPwModal({open:false,user:null});setPwVal("");setPwVal2("")}
            else setPwErr("Reset failed — check connection");
          }}>CONFIRM</button>
          <button style={bt("g")} onClick={()=>{setPwModal({open:false,user:null});setPwVal("");setPwVal2("");setPwErr("")}}>CANCEL</button>
        </div>
      </div>
    </div>}
    {delUserModal.open&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setDelUserModal({open:false,user:null})}>
      <div style={{background:C.dk,border:`2px solid ${C.rd}`,padding:24,width:380,fontFamily:F}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:11,color:C.rd,letterSpacing:2,marginBottom:14,paddingBottom:8,borderBottom:`1px solid ${C.bd}`,fontWeight:700}}>⚠ DELETE USER — PERMANENT</div>
        <div style={{fontSize:12,color:C.t,marginBottom:6}}>Permanently delete <span style={{color:C.rd,fontWeight:700}}>{delUserModal.user?.full_name||delUserModal.user?.username}</span>?</div>
        <div style={{fontSize:11,color:C.m,marginBottom:18,lineHeight:1.5}}>This cannot be undone. All their task assignments will be unlinked, account field officer assignments will be cleared, and their notifications will be deleted.</div>
        <div style={{display:"flex",gap:8}}>
          <button style={bt("d")} onClick={async()=>{
            const ok=await hardDeleteUser(delUserModal.user.id);
            if(ok){setDelUserModal({open:false,user:null});tw("User deleted")}
            else tw("Delete failed");
          }}>CONFIRM DELETE</button>
          <button style={bt("g")} onClick={()=>setDelUserModal({open:false,user:null})}>CANCEL</button>
        </div>
      </div>
    </div>}
    {toast&&<div style={{position:"fixed",bottom:20,right:20,background:C.g,color:C.bg,padding:"8px 18px",fontSize:12,fontWeight:700,letterSpacing:1,fontFamily:F,zIndex:300,borderRadius:2}}>{toast}</div>}
  </div>;
}
