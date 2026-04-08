import { useState, useEffect, useCallback, useRef } from "react";

// ═══ CONFIG & SECURITY ═══
const SB = "https://iqccddabidfcrsbdehiq.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY2NkZGFiaWRmY3JzYmRlaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwODQyMDQsImV4cCI6MjA4NzY2MDIwNH0.tKb-l9TnlSDVsG7zHUJTdd5kt5vWCYKtvQYwVjz0xos";
const DOMAIN = "blackbeltcommandos.net";
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
const C = {
  bg: "#050805", surface: "#0d140d", border: "#22301d", accent: "#d4a841",
  muted: "#5c6b52", text: "#e0e6e0", soft: "#8a9a82", darkAccent: "#1a2418",
  gn: "#4ade80", yl: "#fbbf24", rd: "#ef4444", bl: "#60a5fa", super: "#c084fc"
};

const DS = {
  companyName: "BBCSS", tagline: "BLACK BELT COMMANDOS · ACCOUNT MANAGEMENT SYSTEM",
  serviceTypes: ["Security Services", "Facility Management", "Housekeeping", "Event Security", "Manpower Supply"],
  complianceItems: [{ key: "psara", label: "PSARA License" }, { key: "labour", label: "Labour License" }, { key: "esiPf", label: "ESI/PF Registration" }, { key: "clra", label: "CLRA Returns" }],
  healthStatuses: [{ key: "Green", color: C.gn, meaning: "All good" }, { key: "Yellow", color: C.yl, meaning: "Needs attention" }, { key: "Red", color: C.rd, meaning: "Critical" }],
  accountStatuses: ["Active", "Paused", "Terminated", "Onboarding"],
  billingCycles: ["Monthly", "Quarterly", "Half-Yearly", "Annually"],
  paymentTermsPresets: [15, 30, 45, 60, 90],
  staffRoles: [{ key: "guard", label: "Guard" }, { key: "supervisor", label: "Supervisor" }, { key: "gunman", label: "Gunman" }, { key: "housekeeper", label: "Housekeeper" }, { key: "driver", label: "Driver" }],
  alertThresholds: { renewalDays: 90, overduePaymentDays: 45, staffShortfallPct: 10 },
  currency: { symbol: "₹", locale: "en-IN", lakhFormat: true },
  invoiceDayDefault: 1, defaultPaymentTerms: 30, defaultBillingCycle: "Monthly",
  defaultHealth: "Green", defaultStatus: "Active", customFields: [], notesTemplate: "",
  showBranding: true, renewalStatuses: ["Pending", "In Discussion", "Rate Revision", "Renewed", "Lost"],
  branches: ["Hyderabad", "Bangalore"],
};

// ═══ UTILS ═══
const $f = (a, cu) => { const s = cu?.symbol || "₹"; if (cu?.lakhFormat !== false) { if (Math.abs(a) >= 1e7) return `${s}${(a / 1e7).toFixed(2)}Cr`; if (Math.abs(a) >= 1e5) return `${s}${(a / 1e5).toFixed(1)}L`; if (Math.abs(a) >= 1e3) return `${s}${(a / 1e3).toFixed(1)}K`; } return `${s}${a.toLocaleString(cu?.locale || "en-IN")}` };
const $d = d => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) };
const dTo = d => Math.ceil((new Date(d) - new Date()) / 864e5);
const dSn = d => Math.ceil((new Date() - new Date(d)) / 864e5);
const hC = (h, hs) => hs.find(x => x.key === h)?.color || "#888";
const tS = (sb, t) => Object.values(sb || {}).reduce((s, v) => s + (v[t] || 0), 0);
const foName = (id, users) => { if (!id) return "—"; const u = (users || []).find(x => x.id === id); return u ? (u.full_name || u.username) : "—" };

// ═══ STYLES ═══
const inp = { background: C.bg, border: `1px solid ${C.border}`, color: C.text, padding: "10px 12px", fontSize: 12, fontFamily: F, width: "100%", boxSizing: "border-box", outline: "none", borderRadius: 4 };
const lbl = { fontSize: 10, color: C.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block", fontWeight: 600 };
const sec = { background: C.surface, border: `1px solid ${C.border}`, padding: 20, marginBottom: 16, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" };
const secT = { fontSize: 11, color: C.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 15, paddingBottom: 10, borderBottom: `1px solid ${C.border}`, fontWeight: 700 };
const pill = c => ({ display: "inline-block", background: c + "22", color: c, padding: "3px 8px", fontSize: 10, borderRadius: 4, fontWeight: 700, letterSpacing: 1, border: `1px solid ${c}44` });
const dot = c => ({ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, marginRight: 6, verticalAlign: "middle", flexShrink: 0, boxShadow: `0 0 8px ${c}` });
const nb = a => ({ background: a ? C.accent : "transparent", color: a ? C.bg : C.soft, border: `1px solid ${a ? C.accent : C.border}`, padding: "8px 16px", fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: F, borderRadius: 4, transition: "all 0.2s" });
const bt = v => ({ background: v === "p" ? C.accent : v === "d" ? "#7f1d1d" : v === "s" ? "#1a2418" : "transparent", color: v === "p" ? C.bg : v === "d" ? "#fca5a5" : v === "s" ? C.accent : C.soft, border: `1px solid ${v === "p" ? C.accent : v === "d" ? "#991b1b" : C.border}`, padding: "8px 16px", fontSize: 11, letterSpacing: 1, cursor: "pointer", fontFamily: F, fontWeight: 700, borderRadius: 4, transition: "all 0.2s" });
const sb = v => ({ ...bt(v), padding: "4px 10px", fontSize: 10 });
const th = { background: C.darkAccent, color: C.accent, padding: "12px 10px", textAlign: "left", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", borderBottom: `2px solid ${C.border}`, whiteSpace: "nowrap" };
const td = { padding: "12px 10px", borderBottom: `1px solid ${C.bg}`, verticalAlign: "middle", fontSize: 12, color: C.text };
const dr = { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.bg}` };

const J3S = () => <div style={{ textAlign: "center", padding: "20px 0", borderTop: `1px solid ${C.border}`, marginTop: 24, fontSize: 10, letterSpacing: 3, color: C.muted }}>SYSTEM OPERATIONAL · <span style={{ color: C.accent, fontWeight: 700 }}>J3S COMMAND</span></div>;

function PayIn({ onRec }) {
  const [a, setA] = useState(""), [r, setR] = useState(""), [n, setN] = useState("");
  return <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
    <input style={{ ...inp, flex: 1, minWidth: 80 }} placeholder="Amount" value={a} onChange={e => setA(e.target.value)} type="number" />
    <input style={{ ...inp, width: 100 }} placeholder="Ref" value={r} onChange={e => setR(e.target.value)} />
    <input style={{ ...inp, width: 100 }} placeholder="Note" value={n} onChange={e => setN(e.target.value)} />
    <button style={bt("p")} onClick={() => { if (a > 0) { onRec(Number(a), r, n); setA(""); setR(""); setN("") } }}>RECORD</button>
  </div>
}

function DocUp({ docs, onUp, onRm }) {
  const r = useRef();
  return <div>
    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
      {docs.map(d => <div key={d.id} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "6px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 8, borderRadius: 4 }}>
        <span style={{ color: C.accent, cursor: "pointer" }} onClick={() => window.open(fileUrl(d.storage_path), "_blank")}>📄 {d.file_name}</span>
        <span style={{ color: C.muted, fontSize: 10 }}>{(d.file_size / 1024).toFixed(0)}KB</span>
        <span style={{ color: C.rd, cursor: "pointer", fontWeight: 700 }} onClick={() => onRm(d.id, d.storage_path)}>×</span>
      </div>)}
      {docs.length === 0 && <span style={{ color: C.muted, fontSize: 11 }}>No documents found</span>}
    </div>
    <input ref={r} type="file" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) { onUp(e.target.files[0]); e.target.value = "" } }} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx" />
    <button style={sb("s")} onClick={() => r.current.click()}>📎 UPLOAD DOC</button>
  </div>
}

function InEd({ value, onChange, style: st }) {
  const [ed, setEd] = useState(false), [v, setV] = useState(value), r = useRef();
  useEffect(() => { if (ed && r.current) r.current.focus() }, [ed]);
  if (!ed) return <span style={{ ...st, cursor: "pointer", borderBottom: `1px dashed ${C.border}` }} onClick={() => { setV(value); setEd(true) }}>{value}</span>;
  return <input ref={r} style={{ ...inp, ...st, width: "auto", minWidth: 50 }} value={v} onChange={e => setV(e.target.value)} onBlur={() => { onChange(v); setEd(false) }} onKeyDown={e => { if (e.key === "Enter") { onChange(v); setEd(false) } if (e.key === "Escape") setEd(false) }} />;
}

const mkCSV = (accs, s, users) => {
  const rl = s.staffRoles.map(r => r.key), cm = s.complianceItems.map(c => c.key);
  const hd = ["ID", "Code", "Client", "Location", "Type", "Status", "Health", "Value", "Billing", "Terms", "Start", "End", "Renewal", "Pending", "FieldOfficer", "TotReq", "TotDep", ...rl.flatMap(r => [`${r}_R`, `${r}_D`]), ...cm.map(c => `C_${c}`), "Paid", "Notes"];
  const rows = accs.map(a => [a.account_id, a.account_code || "", `"${a.client}"`, `"${a.location || ""}"`, a.service_type, a.status, a.health, a.contract_value, a.billing_cycle, a.payment_terms, a.contract_start, a.contract_end, a.renewal_status || "", a.pending_amount, `"${foName(a.field_officer_id, users)}"`, tS(a.staff_breakdown, "required"), tS(a.staff_breakdown, "deployed"), ...rl.flatMap(r => [a.staff_breakdown?.[r]?.required || 0, a.staff_breakdown?.[r]?.deployed || 0]), ...cm.map(c => a.compliance_status?.[c] ? "Y" : "N"), (a._p || []).reduce((s, p) => s + Number(p.amount), 0), `"${(a.notes || "").replace(/"/g, '""')}"`].join(","));
  return hd.join(",") + "\n" + rows.join("\n");
};

export default function App() {
  const [user, setUser] = useState(null);
  const [lErr, setLE] = useState("");
  const [lU, setLU] = useState("");
  const [lP, setLP] = useState("");
  const [lding, setLding] = useState(false);
  const [accs, setAccs] = useState([]);
  const [stg, setStg] = useState(DS);
  const [stgId, setStgId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [view, setView] = useState("dashboard");
  const [selId, setSelId] = useState(null);
  const [showFrm, setSF] = useState(false);
  const [fd, setFD] = useState(null);
  const [eMode, setEM] = useState(false);
  const [flt, setFlt] = useState("All");
  const [srch, setSrch] = useState("");
  const [sTab, setSTab] = useState("general");
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUF, setSUF] = useState(false);
  const [uf, setUF] = useState({ username: "", password: "", full_name: "", role: "user", scope_level: "org", scope_branch: "", view_permissions: { dashboard: true, command: true, analytics: true, notifications: true } });
  const [notifs, setNotifs] = useState([]);
  const [notifTick, setNotifTick] = useState(0);
  const [allTodos, setAllTodos] = useState([]);
  const [allTaskUpdates, setAllTaskUpdates] = useState([]);
  const [selTaskId, setSelTaskId] = useState(null);
  const [taskFilter, setTaskFilter] = useState("active");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskAssigneeFlt, setTaskAssigneeFlt] = useState("all");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const defTaskForm = { title: "", description: "", priority: "normal", assigned_to: "", assigned_to_name: "", account_id: "", due_date: "", tags: "" };
  const [taskForm, setTaskForm] = useState(defTaskForm);
  const [updateText, setUpdateText] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  const tw = m => { setToast(m); setTimeout(() => setToast(null), 2500) };
  const isS = user?.role === "superadmin";
  const isA = isS || user?.role === "admin";
  const uScope = user?.scope_level || "org";
  const uBranch = user?.scope_branch || "";
  const vPerms = user?.view_permissions || { dashboard: true, command: true, analytics: true, notifications: true };
  const canSee = v => isA || vPerms[v] !== false;
  const inScope = a => { if (isA || uScope === "org") return true; if (uScope === "branch") return a.branch === uBranch; if (uScope === "site") return a.field_officer_id === user.id; return false };

  const doLogin = async () => {
    setLding(true); setLE("");
    if (!lU.endsWith(`@${DOMAIN}`)) { setLE(`Access restricted to @${DOMAIN} workspace emails.`); setLding(false); return; }
    const res = await rpc("acm_login", { p_username: lU, p_password: lP });
    if (res && res.length > 0) { setUser(res[0]) } else { setLE("Invalid credentials or account disabled") }
    setLding(false);
  };

  const loadAll = useCallback(async () => {
    try {
      setSyncing(true);
      const [ac, sa] = await Promise.all([get("accounts", "?order=account_id.asc"), get("account_settings", "?limit=1")]);
      const enr = await Promise.all(ac.map(async a => {
        const [py, dc] = await Promise.all([get("account_payments", `?account_id=eq.${a.id}&order=payment_date.desc`), get("account_documents", `?account_id=eq.${a.id}&order=uploaded_at.desc`)]);
        return { ...a, _p: py || [], _d: dc || [] };
      }));
      setAccs(enr);
      if (sa.length > 0) { setStg({ ...DS, ...sa[0].settings_data }); setStgId(sa[0].id) }
    } catch (e) { console.error(e) }
    setSyncing(false); setLoaded(true);
  }, []);

  const loadUsers = async () => { const u = await get("acm_users", "?order=created_at.asc"); setUsers(u) };
  const loadTasks = useCallback(async () => {
    const [t, u] = await Promise.all([get("todos", "?order=created_at.desc&limit=500"), get("task_updates", "?order=created_at.asc&limit=2000")]);
    const now = new Date();
    const processed = (t || []).map(task => (["pending", "in_progress"].includes(task.status) && task.due_date && new Date(task.due_date) < now) ? { ...task, status: "overdue" } : task);
    setAllTodos(processed); setAllTaskUpdates(u || []);
  }, []);

  const loadNotifs = useCallback(async () => {
    if (!user?.id) return;
    const n = await get("todo_notifications", `?recipient_id=eq.${user.id}&order=created_at.desc&limit=50`);
    setNotifs(n || []);
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadAll(); loadUsers(); loadNotifs(); loadTasks();
      const iv = setInterval(() => setNotifTick(t => t + 1), 45000);
      return () => clearInterval(iv);
    }
  }, [user, loadAll, loadNotifs, loadTasks]);

  useEffect(() => { if (notifTick > 0) { loadNotifs(); loadTasks() } }, [notifTick, loadNotifs, loadTasks]);

  const markNotifRead = async (id) => { await patch("todo_notifications", `?id=eq.${id}`, { is_read: true }); setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n)) };
  const markAllNotifsRead = async () => { if (!user?.id) return; await patch("todo_notifications", `?recipient_id=eq.${user.id}&is_read=eq.false`, { is_read: true }); setNotifs(prev => prev.map(n => ({ ...n, is_read: true }))); tw("All marked as read") };
  const deleteNotif = async (id) => { await rm("todo_notifications", `?id=eq.${id}`); setNotifs(prev => prev.filter(n => n.id !== id)) };
  const unreadNotifCount = notifs.filter(n => !n.is_read).length;

  const createUser = async () => {
    if (!uf.username || !uf.password) { tw("Username & password required"); return }
    if (!uf.username.endsWith(`@${DOMAIN}`)) { tw(`Users must belong to @${DOMAIN}`); return; }
    const res = await rpc("acm_create_user", { p_username: uf.username, p_password: uf.password, p_full_name: uf.full_name, p_role: uf.role, p_scope_level: uf.scope_level, p_scope_branch: uf.scope_branch || null, p_view_permissions: uf.view_permissions });
    if (res && res.length > 0) { await loadUsers(); setSUF(false); setUF({ username: "", password: "", full_name: "", role: "user", scope_level: "org", scope_branch: "", view_permissions: { dashboard: true, command: true, analytics: true, notifications: true } }); tw("User created") } else tw("Failed - username may exist")
  };

  const toggleUser = async (id, active) => {
    const targetUser = users.find(u => u.id === id);
    if (!isS && targetUser?.role === "admin") { tw("Only Super Admin can modify other Admins"); return; }
    await patch("acm_users", `?id=eq.${id}`, { is_active: !active }); await loadUsers(); tw(active ? "Deactivated" : "Activated")
  };
  const changeRole = async (id, role) => {
    const targetUser = users.find(u => u.id === id);
    if (!isS && (targetUser?.role === "admin" || role === "superadmin")) { tw("Super Admin privileges required"); return; }
    await patch("acm_users", `?id=eq.${id}`, { role }); await loadUsers(); tw("Role updated")
  };
  const updateUserField = async (id, data) => {
    const targetUser = users.find(u => u.id === id);
    if (!isS && targetUser?.role === "admin") { tw("Super Admin privileges required"); return; }
    await patch("acm_users", `?id=eq.${id}`, data); await loadUsers(); tw("Updated")
  };
  const vpToggle = async (u, key) => { const vp = { ...(u.view_permissions || { dashboard: true, command: true, analytics: true, notifications: true }) }; vp[key] = !vp[key]; await updateUserField(u.id, { view_permissions: vp }) };

  const uS = async p => { const u = { ...stg, ...p }; setStg(u); if (stgId) await patch("account_settings", `?id=eq.${stgId}`, { settings_data: u }); tw("Saved") };

  const mkE = () => ({
    account_id: "", account_code: "", client: "", location: "", service_type: stg.serviceTypes[0] || "",
    contract_value: 0, billing_cycle: stg.defaultBillingCycle, contract_start: "", contract_end: "",
    invoice_day: stg.invoiceDayDefault, payment_terms: stg.defaultPaymentTerms, status: stg.defaultStatus,
    health: stg.defaultHealth, staff_breakdown: Object.fromEntries(stg.staffRoles.map(r => [r.key, { required: 0, deployed: 0 }])),
    pending_amount: 0, compliance_status: Object.fromEntries(stg.complianceItems.map(c => [c.key, false])),
    contacts: [{ name: "", phone: "", role: "POC" }], notes: stg.notesTemplate,
    renewal_status: stg.renewalStatuses?.[0] || "Pending", branch: stg.branches?.[0] || "",
    rate_revision: 0, field_officer_id: null, custom_data: {}, _p: [], _d: []
  });

  const saveAcc = async () => {
    if (!fd) return; setSyncing(true);
    if (eMode) { const { _p, _d, id, created_at, updated_at, ...rest } = fd; await patch("accounts", `?id=eq.${fd.id}`, rest) }
    else { const nums = accs.map(a => parseInt(a.account_id.replace("ACC-", "")) || 0); const nx = Math.max(0, ...nums) + 1; const { _p, _d, id, ...rest } = fd; await post("accounts", { ...rest, account_id: `ACC-${String(nx).padStart(3, "0")}` }) }
    await loadAll(); setSF(false); setEM(false); setSyncing(false); tw(eMode ? "Updated" : "Created")
  };

  const delAcc = async id => { setSyncing(true); await rm("accounts", `?id=eq.${id}`); await loadAll(); setSelId(null); setView("dashboard"); setSyncing(false); tw("Deleted") };
  const updA = async (id, p) => { await patch("accounts", `?id=eq.${id}`, p); setAccs(prev => prev.map(a => a.id === id ? { ...a, ...p } : a)) };
  const recPay = async (uid, amt, ref, note) => { setSyncing(true); await post("account_payments", { account_id: uid, payment_date: new Date().toISOString().split("T")[0], amount: amt, reference: ref, note }); const ac = accs.find(a => a.id === uid); if (ac) await patch("accounts", `?id=eq.${uid}`, { pending_amount: Math.max(0, Number(ac.pending_amount) - amt) }); await loadAll(); setSyncing(false); tw(`${stg.currency.symbol}${amt.toLocaleString()} recorded`) };
  const upDoc = async (uid, f) => { if (f.size > 5e6) { tw("Max 5MB"); return } setSyncing(true); const p = `${uid}/${Date.now()}_${f.name}`; const ok = await upFile(p, f); if (ok) { await post("account_documents", { account_id: uid, file_name: f.name, file_type: f.type, file_size: f.size, storage_path: p }); await loadAll(); tw("Uploaded") } else tw("Failed"); setSyncing(false) };
  const rmDoc = async (did, sp) => { setSyncing(true); await rmFile(sp); await rm("account_documents", `?id=eq.${did}`); await loadAll(); setSyncing(false); tw("Removed") };

  const notifyTaskEvent = async (task, eventType, message, remark) => {
    if (!task) return;
    const recipients = new Set();
    if (task.assigned_to) recipients.add(task.assigned_to);
    if (task.assigned_by) recipients.add(task.assigned_by);
    (users || []).filter(u => u.role === "admin" && u.is_active).forEach(u => recipients.add(u.id));
    if (user?.id) recipients.delete(user.id);
    const rows = [...recipients].map(rid => ({ recipient_id: rid, todo_id: task.id, todo_title: task.title, event_type: eventType, message, remark: remark || null, actor_id: user?.id || null, actor_name: user?.full_name || user?.username || "System" }));
    if (rows.length > 0) { await post("todo_notifications", rows); loadNotifs() }
  };

  const saveTask = async () => {
    if (!taskForm.title.trim()) { tw("Title required"); return }
    const ac = accs.find(a => a.id === taskForm.account_id);
    const bd = { title: taskForm.title, description: taskForm.description, priority: taskForm.priority, assigned_to: taskForm.assigned_to || null, assigned_to_name: taskForm.assigned_to_name || "All", account_id: taskForm.account_id || null, account_name: ac?.client || "", due_date: taskForm.due_date || null, tags: taskForm.tags ? taskForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [], assigned_by: user?.id || null, assigned_by_name: user?.full_name || "Admin" };
    setSyncing(true);
    if (editTask) {
      bd.updated_at = new Date().toISOString();
      const res = await patch("todos", `?id=eq.${editTask.id}`, bd);
      const updated = (res && res[0]) || { ...editTask, ...bd };
      if (editTask.assigned_to !== bd.assigned_to) await notifyTaskEvent(updated, "reassigned", `Task reassigned to ${bd.assigned_to_name}`);
    } else {
      bd.notified_at = new Date().toISOString(); bd.status = "pending";
      const res = await post("todos", bd);
      const created = res && res[0];
      if (created) await notifyTaskEvent(created, "assigned", `New task assigned: ${bd.title}`);
    }
    await loadTasks(); setShowTaskForm(false); setEditTask(null); setTaskForm(defTaskForm); setSyncing(false); tw(editTask ? "Updated" : "Created");
  };

  const delTask = async (id) => {
    const task = allTodos.find(t => t.id === id);
    const reason = prompt("Reason for deletion (required):");
    if (!reason || !reason.trim()) return;
    setSyncing(true);
    if (task) await notifyTaskEvent(task, "deleted", `Task deleted: ${task.title}`, reason.trim());
    await rm("todos", `?id=eq.${id}`);
    await loadTasks(); if (selTaskId === id) setSelTaskId(null); setSyncing(false); tw("Deleted");
  };

  const postTaskUpdate = async (taskId) => {
    if (!updateText.trim()) { tw("Update text required"); return }
    const task = allTodos.find(t => t.id === taskId);
    if (!task) return;
    setSyncing(true);
    await post("task_updates", { todo_id: taskId, update_text: updateText.trim(), old_status: task.status, new_status: updateStatus || null, author_id: user?.id || null, author_name: user?.full_name || user?.username || "Unknown" });
    if (updateStatus && updateStatus !== task.status) {
      const patchBody = { status: updateStatus, updated_at: new Date().toISOString() };
      if (updateStatus === "completed") { patchBody.completed_at = new Date().toISOString(); patchBody.completion_remark = updateText.trim() }
      await patch("todos", `?id=eq.${taskId}`, patchBody);
      await notifyTaskEvent(task, "status_changed", `Status: ${task.status} → ${updateStatus}`, updateText.trim());
    } else { await notifyTaskEvent(task, "remark_added", `New update on: ${task.title}`, updateText.trim()) }
    setUpdateText(""); setUpdateStatus(""); await loadTasks(); setSyncing(false); tw("Update posted");
  };

  const delTaskUpdate = async (updateId) => {
    if (!confirm("Delete this update?")) return;
    await rm("task_updates", `?id=eq.${updateId}`); await loadTasks(); tw("Update removed");
  };

  const xCSV = () => { const c = mkCSV(scopedAccs, stg, users); const b = new Blob([c], { type: "text/csv" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `BBCSS_Accounts_${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(u) };

  const scopedAccs = accs.filter(inScope);
  const sel = accs.find(a => a.id === selId);
  const fil = scopedAccs.filter(a => { const mf = flt === "All" || a.health === flt || a.status === flt || a.branch === flt; const ms = a.client.toLowerCase().includes(srch.toLowerCase()) || (a.location || "").toLowerCase().includes(srch.toLowerCase()) || (a.account_code || "").toLowerCase().includes(srch.toLowerCase()); return mf && ms });
  const totCV = scopedAccs.reduce((s, a) => s + Number(a.contract_value), 0);
  const totP = scopedAccs.reduce((s, a) => s + Number(a.pending_amount), 0);
  const totR = scopedAccs.reduce((s, a) => s + tS(a.staff_breakdown, "required"), 0);
  const totD = scopedAccs.reduce((s, a) => s + tS(a.staff_breakdown, "deployed"), 0);
  const renS = scopedAccs.filter(a => { const d = dTo(a.contract_end); return d <= stg.alertThresholds.renewalDays && d > 0 }).length;
  const cGap = scopedAccs.filter(a => Object.values(a.compliance_status || {}).some(v => !v)).length;
  const totCol = scopedAccs.reduce((s, a) => s + (a._p || []).reduce((ps, p) => ps + Number(p.amount), 0), 0);
  const totBil = totCol + totP;
  const cR = totBil > 0 ? (totCol / totBil) * 100 : 100;
  const actA = scopedAccs.filter(a => a.status === "Active");
  const dso = actA.length > 0 ? actA.reduce((s, a) => { if (!a._p?.length) return s + a.payment_terms; return s + dSn(a._p[0].payment_date) }, 0) / actA.length : 0;
  const ag = { c: 0, d3: 0, d6: 0, o9: 0 };
  scopedAccs.forEach(a => { if (Number(a.pending_amount) <= 0) return; const lp = a._p?.[0]?.payment_date || a.contract_start; const d = dSn(lp); if (d <= 30) ag.c += Number(a.pending_amount); else if (d <= 60) ag.d3 += Number(a.pending_amount); else if (d <= 90) ag.d6 += Number(a.pending_amount); else ag.o9 += Number(a.pending_amount) });

  // ═══ VIEWS ═══
  const Analytics = () => {
    const sbr = {}; stg.staffRoles.forEach(r => { sbr[r.key] = { req: 0, dep: 0, label: r.label } }); scopedAccs.forEach(a => Object.entries(a.staff_breakdown || {}).forEach(([k, v]) => { if (sbr[k]) { sbr[k].req += v.required || 0; sbr[k].dep += v.deployed || 0 } }));
    const mx = Math.max(1, ...Object.values(sbr).map(v => v.req)); const at = ag.c + ag.d3 + ag.d6 + ag.o9;
    return <><div style={{ ...sec, borderColor: C.accent }}><div style={secT}>📊 COLLECTION HEALTH</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 16 }}>
        {[{ l: "Collection Rate", v: `${cR.toFixed(1)}%`, c: cR > 80 ? C.gn : cR > 60 ? C.yl : C.rd }, { l: "Avg DSO", v: `${dso.toFixed(0)}d`, c: dso < 45 ? C.gn : dso < 60 ? C.yl : C.rd }, { l: "Receivables", v: $f(totP, stg.currency), c: totP > 0 ? C.yl : C.gn }, { l: "Collected", v: $f(totCol, stg.currency), c: C.accent }].map((x, i) => <div key={i} style={{ background: C.bg, padding: 15, textAlign: "center", borderRadius: 6, border: `1px solid ${C.border}` }}><div style={{ fontSize: 10, color: C.soft }}>{x.l}</div><div style={{ fontSize: 24, fontWeight: 700, color: x.c, marginTop: 4 }}>{x.v}</div></div>)}
      </div>
      <div style={{ fontSize: 11, color: C.accent, letterSpacing: 2, marginBottom: 8 }}>AGING ANALYSIS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {[{ l: "0-30d", v: ag.c, c: C.gn }, { l: "31-60d", v: ag.d3, c: C.yl }, { l: "61-90d", v: ag.d6, c: "#f97316" }, { l: "90+d", v: ag.o9, c: C.rd }].map((x, i) => <div key={i} style={{ background: C.bg, padding: 10, borderRadius: 4 }}><div style={{ fontSize: 10, color: C.soft }}>{x.l}</div><div style={{ fontSize: 18, fontWeight: 700, color: x.c }}>{$f(x.v, stg.currency)}</div>{at > 0 && <div style={{ height: 4, background: C.darkAccent, borderRadius: 2, marginTop: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${(x.v / at) * 100}%`, background: x.c, borderRadius: 2 }} /></div>}</div>)}
      </div></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={sec}><div style={secT}>👥 STAFFING MATRIX</div>
          {Object.entries(sbr).filter(([, v]) => v.req > 0).map(([k, v]) => <div key={k} style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span style={{ color: C.text }}>{v.label}</span><span><span style={{ color: v.dep >= v.req ? C.gn : C.yl }}>{v.dep}</span><span style={{ color: C.muted }}>/{v.req}</span></span></div><div style={{ height: 8, background: C.darkAccent, borderRadius: 4, overflow: "hidden", position: "relative" }}><div style={{ position: "absolute", height: "100%", width: `${(v.req / mx) * 100}%`, background: C.border, borderRadius: 4 }} /><div style={{ position: "absolute", height: "100%", width: `${(v.dep / mx) * 100}%`, background: v.dep >= v.req ? C.gn : C.yl, borderRadius: 4 }} /></div></div>)}
        </div>
        <div style={sec}><div style={secT}>🔄 RENEWAL PIPELINE</div>
          {scopedAccs.filter(a => a.status === "Active").sort((a, b) => dTo(a.contract_end) - dTo(b.contract_end)).slice(0, 8).map(a => { const d = dTo(a.contract_end); return <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.bg}`, cursor: "pointer" }} onClick={() => { setSelId(a.id); setView("detail") }}><span style={dot(d <= 30 ? C.rd : d <= stg.alertThresholds.renewalDays ? C.yl : C.gn)} /><span style={{ flex: 1, fontSize: 11, color: C.text }}>{a.client}</span><span style={pill(a.renewal_status === "Renewed" ? C.gn : a.renewal_status === "Lost" ? C.rd : C.yl)}>{a.renewal_status || "Pending"}</span><span style={{ fontSize: 10, color: d <= 30 ? C.rd : C.soft, fontWeight: 700 }}>{d}d</span></div> })}
        </div>
      </div>
      <div style={{ ...sec, marginTop: 14 }}><div style={secT}>📈 SYSTEM EFFECTIVENESS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {[{ l: "Staffing", sc: totR > 0 ? (totD / totR) * 100 : 100 }, { l: "Collection", sc: cR }, { l: "Compliance", sc: scopedAccs.length > 0 ? (scopedAccs.length - cGap) / scopedAccs.length * 100 : 100 }, { l: "Renewal", sc: actA.length > 0 ? (actA.length - renS) / actA.length * 100 : 100 }].map((x, i) => { const co = x.sc >= 80 ? C.gn : x.sc >= 60 ? C.yl : C.rd; return <div key={i} style={{ background: C.bg, padding: 16, borderRadius: 6, border: `1px solid ${C.border}` }}><div style={{ fontSize: 10, color: C.soft }}>{x.l}</div><div style={{ fontSize: 28, fontWeight: 700, color: co, margin: "4px 0" }}>{x.sc.toFixed(1)}%</div><div style={{ height: 4, background: C.darkAccent, borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, x.sc)}%`, background: co, borderRadius: 2 }} /></div></div> })}
        </div></div>
      <J3S /></>;
  };

  const Dash = () => <>
    {uScope !== "org" && !isA && <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "10px 16px", marginBottom: 16, fontSize: 11, color: C.accent, letterSpacing: 1, borderRadius: 6 }}>🔒 SCOPE: {uScope === "branch" ? `BRANCH · ${uBranch || "—"}` : `FIELD OFFICER · ${user.full_name || user.username} · ${scopedAccs.length} accounts`}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
      {[{ l: "Accounts", v: actA.length, s: `${scopedAccs.length} total`, c: C.accent }, { l: "Monthly", v: $f(totCV / 12, stg.currency), s: `ACV ${$f(totCV, stg.currency)}`, c: C.accent }, { l: "Receivables", v: $f(totP, stg.currency), s: `${cR.toFixed(0)}% collected`, c: totP > 0 ? C.yl : C.gn }, { l: "Staff", v: `${totD}/${totR}`, s: totD < totR ? `${totR - totD} short` : "Full", c: totD < totR ? C.yl : C.gn }, { l: "DSO", v: `${dso.toFixed(0)}d`, s: dso < 45 ? "Healthy" : "Review", c: dso < 45 ? C.gn : C.yl }].map((x, i) => <div key={i} style={{ ...sec, background: C.surface, padding: 16 }}>
        <div style={{ fontSize: 10, color: C.soft, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{x.l}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: x.c }}>{x.v}</div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{x.s}</div>
      </div>)}
    </div>
    {(renS > 0 || cGap > 0 || ag.o9 > 0) && <div style={{ ...sec, borderColor: C.yl, marginBottom: 16 }}><div style={{ ...secT, color: C.yl, borderColor: C.yl }}>⚠ SYSTEM ALERTS</div>{renS > 0 && <div style={{ color: C.yl, fontSize: 12, marginBottom: 4 }}>• {renS} contract(s) within {stg.alertThresholds.renewalDays}d</div>}{cGap > 0 && <div style={{ color: C.rd, fontSize: 12, marginBottom: 4 }}>• {cGap} compliance gaps detected</div>}{ag.o9 > 0 && <div style={{ color: C.rd, fontSize: 12 }}>• {$f(ag.o9, stg.currency)} overdue 90+d</div>}</div>}
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
      <input style={{ ...inp, width: 240, flexShrink: 0 }} placeholder="SEARCH CLIENT / CODE..." value={srch} onChange={e => setSrch(e.target.value)} />
      {["All", ...stg.healthStatuses.map(h => h.key), ...stg.accountStatuses, ...(stg.branches || [])].map(f => <button key={f} style={nb(flt === f)} onClick={() => setFlt(f)}>{f}</button>)}
      <div style={{ flex: 1 }} />
      <button style={sb("s")} onClick={xCSV}>📥 EXPORT CSV</button>
      <button style={sb("s")} onClick={loadAll}>🔄 SYNC</button>
      {isA && <button style={bt("p")} onClick={() => { setFD(mkE()); setEM(false); setSF(true) }}>+ NEW ACCOUNT</button>}
    </div>
    <div style={{ overflowX: "auto", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{["Client", "Code", "Branch", "Field Officer", "Health", "Contract", "Staff", "Pending", "Renewal", "Comp"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
      {fil.map(a => { const d = dTo(a.contract_end), sr = tS(a.staff_breakdown, "required"), sd = tS(a.staff_breakdown, "deployed"), ok = Object.values(a.compliance_status || {}).every(Boolean); return <tr key={a.id} style={{ cursor: "pointer", transition: "background 0.2s" }} onClick={() => { setSelId(a.id); setView("detail") }} onMouseEnter={e => e.currentTarget.style.background = C.darkAccent} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <td style={td}><div style={{ fontWeight: 700 }}>{a.client}</div><div style={{ fontSize: 10, color: C.muted }}>{a.account_id} · {a.location}</div></td>
        <td style={{ ...td, color: C.bl, fontWeight: 600 }}>{a.account_code || "—"}</td>
        <td style={{ ...td, color: C.soft, fontSize: 11 }}>{a.branch || "—"}</td>
        <td style={td}>{a.field_officer_id ? <span style={{ color: C.accent, fontWeight: 600 }}>👤 {foName(a.field_officer_id, users)}</span> : <span style={{ color: C.muted }}>—</span>}</td>
        <td style={td}><span style={dot(hC(a.health, stg.healthStatuses))} />{a.health}</td>
        <td style={{ ...td, color: C.accent, fontWeight: 600 }}>{$f(Number(a.contract_value), stg.currency)}/yr</td>
        <td style={td}><span style={{ color: sd < sr ? C.yl : C.gn }}>{sd}</span><span style={{ color: C.muted }}>/{sr}</span></td>
        <td style={{ ...td, color: Number(a.pending_amount) > 0 ? C.yl : C.gn }}>{$f(Number(a.pending_amount), stg.currency)}</td>
        <td style={td}><span style={pill(d <= 30 ? C.rd : d <= stg.alertThresholds.renewalDays ? C.yl : C.gn)}>{d}d</span></td>
        <td style={td}><span style={pill(ok ? C.gn : C.rd)}>{ok ? "VALID" : "GAPS"}</span></td>
      </tr> })}
      {fil.length === 0 && <tr><td colSpan={10} style={{ ...td, textAlign: "center", color: C.muted, padding: 40 }}>No accounts found matching filters</td></tr>}
    </tbody></table></div>
    <J3S /></>;

  const Det = () => {
    if (!sel) return null;
    const a = sel, d = dTo(a.contract_end), sr = tS(a.staff_breakdown, "required"), sd = tS(a.staff_breakdown, "deployed");
    return <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <button style={bt("g")} onClick={() => { setView("dashboard"); setSelId(null) }}>← RETURN TO DASHBOARD</button>
        <div><div style={{ fontSize: 18, fontWeight: 700, color: C.accent, letterSpacing: 2 }}>{a.client}{a.account_code && <span style={{ color: C.bl, fontSize: 12, marginLeft: 8 }}>[{a.account_code}]</span>}</div><div style={{ fontSize: 11, color: C.soft }}>{a.account_id} · {a.location} · {a.service_type}</div></div>
        <div style={{ flex: 1 }} />
        {isA && stg.healthStatuses.map(h => <button key={h.key} style={{ ...nb(a.health === h.key), fontSize: 10, padding: "4px 10px" }} onClick={() => updA(a.id, { health: h.key })}><span style={dot(h.color)} />{h.key}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 16 }}>
        <div style={sec}><div style={secT}>CONTRACT DATA</div>
          {[["Value", $f(Number(a.contract_value), stg.currency) + "/yr"], ["Monthly", $f(Number(a.contract_value) / 12, stg.currency)], ["Code", a.account_code || "—"], ["Billing", a.billing_cycle], ["Terms", a.payment_terms + "d"], ["Period", `${$d(a.contract_start)} → ${$d(a.contract_end)}`], ["Status", a.status], ["Field Officer", foName(a.field_officer_id, users)]].map(([l, v]) => <div key={l} style={dr}><span style={{ color: C.soft, fontSize: 11 }}>{l}</span><span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{v}</span></div>)}
          <div style={{ marginTop: 15, fontSize: 11, color: C.accent, letterSpacing: 2 }}>RENEWAL STATUS</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
            <span style={pill(d <= 30 ? C.rd : d <= stg.alertThresholds.renewalDays ? C.yl : C.gn)}>{d} DAYS REMAINING</span>
            {isA ? <select style={{ ...inp, width: 140 }} value={a.renewal_status || ""} onChange={e => updA(a.id, { renewal_status: e.target.value })}>{(stg.renewalStatuses || []).map(s => <option key={s}>{s}</option>)}</select> : <span style={pill(C.bl)}>{a.renewal_status}</span>}
            {isA && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 10, color: C.soft }}>REV%</span><input style={{ ...inp, width: 60 }} type="number" value={a.rate_revision || 0} onChange={e => updA(a.id, { rate_revision: Number(e.target.value) })} /></div>}
          </div>
          {Number(a.rate_revision) > 0 && <div style={{ fontSize: 11, color: C.bl, marginTop: 6 }}>Revised Value: {$f(Number(a.contract_value) * (1 + Number(a.rate_revision) / 100), stg.currency)}/yr</div>}
        </div>
        <div style={sec}><div style={secT}>COLLECTION HEALTH</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ background: C.bg, padding: 15, textAlign: "center", borderRadius: 6, border: `1px solid ${C.border}` }}><div style={{ fontSize: 10, color: C.soft }}>RECEIVABLE</div><div style={{ fontSize: 24, fontWeight: 700, color: Number(a.pending_amount) > 0 ? C.yl : C.gn }}>{$f(Number(a.pending_amount), stg.currency)}</div></div>
            <div style={{ background: C.bg, padding: 15, textAlign: "center", borderRadius: 6, border: `1px solid ${C.border}` }}><div style={{ fontSize: 10, color: C.soft }}>COLLECTED</div><div style={{ fontSize: 24, fontWeight: 700, color: C.gn }}>{$f((a._p || []).reduce((s, p) => s + Number(p.amount), 0), stg.currency)}</div></div>
          </div>
          {isA && <PayIn onRec={(am, rf, n) => recPay(a.id, am, rf, n)} />}
          {a._p?.length > 0 && <div style={{ marginTop: 10, maxHeight: 140, overflowY: "auto" }}><div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, marginBottom: 6 }}>TRANSACTION HISTORY</div>{a._p.map((p, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, padding: "6px 0", borderBottom: `1px solid ${C.bg}` }}><span style={{ color: C.soft, width: 80 }}>{$d(p.payment_date)}</span><span style={{ color: C.gn, fontWeight: 700, width: 70 }}>{$f(Number(p.amount), stg.currency)}</span><span style={{ color: C.muted }}>{p.reference}</span><span style={{ color: C.muted, flex: 1 }}>{p.note}</span></div>)}</div>}
        </div>
      </div>
      <div style={sec}><div style={secT}>👥 STAFFING ALLOCATION</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 10 }}>
          {stg.staffRoles.map(r => { const v = a.staff_breakdown?.[r.key] || { required: 0, deployed: 0 }; return <div key={r.key} style={{ background: C.bg, padding: 10, borderRadius: 6, border: `1px solid ${C.border}` }}><div style={{ fontSize: 10, color: C.soft, letterSpacing: 1, marginBottom: 6 }}>{r.label.toUpperCase()}</div><div style={{ display: "flex", gap: 8 }}><div><div style={{ fontSize: 9, color: C.muted }}>REQ</div><div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{v.required}</div></div><div><div style={{ fontSize: 9, color: C.muted }}>DEP</div><div style={{ fontSize: 20, fontWeight: 700, color: v.deployed >= v.required ? C.gn : C.yl }}>{v.deployed}</div></div></div><div style={{ height: 4, background: C.darkAccent, borderRadius: 2, marginTop: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, v.required > 0 ? (v.deployed / v.required) * 100 : 100)}%`, background: v.deployed >= v.required ? C.gn : C.yl, borderRadius: 2 }} /></div></div> })}
        </div>
        <div style={{ fontSize: 12 }}>Operational Total: <span style={{ color: sd >= sr ? C.gn : C.yl, fontWeight: 700 }}>{sd}</span><span style={{ color: C.muted }}>/{sr}</span>{sr - sd > 0 && <span style={{ color: C.rd, marginLeft: 8 }}>Shortfall: {sr - sd}</span>}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={sec}><div style={secT}>COMPLIANCE STATUS</div>{stg.complianceItems.map(ci => <div key={ci.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.bg}` }}><span style={dot(a.compliance_status?.[ci.key] ? C.gn : C.rd)} /><span style={{ flex: 1, fontSize: 12 }}>{ci.label}</span><span style={pill(a.compliance_status?.[ci.key] ? C.gn : C.rd)}>{a.compliance_status?.[ci.key] ? "VALID" : "PENDING"}</span></div>)}</div>
        <div style={sec}><div style={secT}>📎 DOCUMENT VAULT</div><DocUp docs={a._d || []} onUp={f => upDoc(a.id, f)} onRm={(did, sp) => rmDoc(did, sp)} /></div>
      </div>
      <div style={sec}><div style={secT}>NOTES & PRIMARY CONTACTS</div><div style={{ fontSize: 12, color: C.soft, marginBottom: 10, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{a.notes || "—"}</div>{(a.contacts || []).map((ct, i) => <div key={i} style={{ display: "flex", gap: 14, fontSize: 12, color: C.soft }}><span style={{ color: C.accent }}>{ct.role}</span><span>{ct.name}</span><span>{ct.phone}</span></div>)}</div>
      {isA && <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button style={bt("p")} onClick={() => { setFD({ ...a }); setEM(true); setSF(true) }}>EDIT ACCOUNT</button><button style={bt("d")} onClick={() => { if (confirm("Confirm permanent deletion?")) delAcc(a.id) }}>DELETE</button></div>}
      <J3S /></>;
  };

  const Usr = () => <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}><div style={{ fontSize: 16, color: C.accent, letterSpacing: 2, fontWeight: 700 }}>USER ACCESS CONTROL</div><button style={bt("p")} onClick={() => setSUF(true)}>+ REGISTER USER</button></div>
    <div style={{ fontSize: 10, color: C.soft, marginBottom: 12, letterSpacing: 1, background: C.surface, padding: 10, borderRadius: 6, border: `1px solid ${C.border}` }}>
      <span style={{ color: C.super, fontWeight: 700 }}>SUPER ADMIN</span>: Full System Control → <span style={{ color: C.accent, fontWeight: 700 }}>ADMIN</span>: Branch/User Control → <span style={{ color: C.bl, fontWeight: 700 }}>USER</span>: Operational Access
    </div>
    <div style={{ overflowX: "auto", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}><table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}><thead><tr>{["Username", "Name", "Role", "Scope", "Branch", "Views", "Active", "Last Login", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead><tbody>
      {users.map(u => { const vp = u.view_permissions || { dashboard: true, command: true, analytics: true, notifications: true }; const isSelf = u.id === user.id;
        return <tr key={u.id}>
          <td style={td}><span style={{ fontWeight: 700 }}>{u.username}</span></td>
          <td style={td}>{u.full_name || "—"}</td>
          <td style={td}><span style={pill(u.role === "superadmin" ? C.super : u.role === "admin" ? C.accent : C.bl)}>{u.role.toUpperCase()}</span></td>
          <td style={td}>{isSelf ? <span style={pill(C.accent)}>{(u.scope_level || "org").toUpperCase()}</span> : <select style={{ ...inp, width: 90, padding: "2px 6px", fontSize: 10 }} value={u.scope_level || "org"} onChange={e => updateUserField(u.id, { scope_level: e.target.value, ...(e.target.value !== "branch" ? { scope_branch: null } : {}) })}><option value="org">Org</option><option value="branch">Branch</option><option value="site">Site</option></select>}</td>
          <td style={td}>{u.scope_level === "branch" ? (isSelf ? <span style={{ color: C.text }}>{u.scope_branch || "—"}</span> : <select style={{ ...inp, width: 110, padding: "2px 6px", fontSize: 10 }} value={u.scope_branch || ""} onChange={e => updateUserField(u.id, { scope_branch: e.target.value })}><option value="">—</option>{(stg.branches || []).map(b => <option key={b} value={b}>{b}</option>)}</select>) : <span style={{ color: C.muted }}>—</span>}</td>
          <td style={td}>{u.role === "superadmin" || u.role === "admin" ? <span style={{ color: C.muted, fontSize: 10 }}>FULL ACCESS</span> : <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{[["dashboard", "DASH"], ["command", "CMD"], ["analytics", "ANL"], ["notifications", "NOTIF"]].map(([k, l]) => <label key={k} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, cursor: isSelf ? "default" : "pointer", color: vp[k] ? C.gn : C.muted }}><input type="checkbox" checked={vp[k] !== false} disabled={isSelf} onChange={() => vpToggle(u, k)} style={{ margin: 0, cursor: isSelf ? "default" : "pointer" }} />{l}</label>)}</div>}</td>
          <td style={td}><span style={dot(u.is_active ? C.gn : C.rd)} />{u.is_active ? "Active" : "Off"}</td>
          <td style={{ ...td, fontSize: 11, color: C.soft }}>{u.last_login ? $d(u.last_login) : "Never"}</td>
          <td style={td}>{!isSelf && <div style={{ display: "flex", gap: 6 }}><button style={sb(u.is_active ? "d" : "s")} onClick={() => toggleUser(u.id, u.is_active)}>{u.is_active ? "DISABLE" : "ENABLE"}</button><select style={{ ...inp, width: 80, padding: "2px 6px", fontSize: 10 }} value={u.role} onChange={e => changeRole(u.id, e.target.value)}><option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Super Admin</option></select></div>}</td>
        </tr> })}
    </tbody></table></div>
    {showUF && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSUF(false)}>
      <div style={{ background: C.surface, border: `2px solid ${C.accent}`, padding: 24, width: 420, maxHeight: "90vh", overflowY: "auto", borderRadius: 12 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 16 }}>USER IDENTITY REGISTRATION</div>
        <div style={{ marginBottom: 10 }}><label style={lbl}>Workspace Email (@{DOMAIN})</label><input style={inp} value={uf.username} onChange={e => setUF({ ...uf, username: e.target.value })} /></div>
        <div style={{ marginBottom: 10 }}><label style={lbl}>Security Password</label><input style={inp} type="password" value={uf.password} onChange={e => setUF({ ...uf, password: e.target.value })} /></div>
        <div style={{ marginBottom: 10 }}><label style={lbl}>Full Name</label><input style={inp} value={uf.full_name} onChange={e => setUF({ ...uf, full_name: e.target.value })} /></div>
        <div style={{ marginBottom: 10 }}><label style={lbl}>System Role</label><select style={inp} value={uf.role} onChange={e => setUF({ ...uf, role: e.target.value })}><option value="user">User</option><option value="admin">Admin</option><option value="superadmin">Super Admin</option></select></div>
        <div style={{ marginBottom: 10 }}><label style={lbl}>Scope Level</label><select style={inp} value={uf.scope_level} onChange={e => setUF({ ...uf, scope_level: e.target.value, scope_branch: e.target.value === "branch" ? uf.scope_branch : "" })}><option value="org">Org (Full System)</option><option value="branch">Branch (Specific Branch)</option><option value="site">Site (Assigned Accounts)</option></select></div>
        {uf.scope_level === "branch" && <div style={{ marginBottom: 10 }}><label style={lbl}>Branch Assignment</label><select style={inp} value={uf.scope_branch} onChange={e => setUF({ ...uf, scope_branch: e.target.value })}><option value="">Select...</option>{(stg.branches || []).map(b => <option key={b} value={b}>{b}</option>)}</select></div>}
        {uf.role !== "superadmin" && <div style={{ marginBottom: 14 }}><label style={lbl}>Module Access</label><div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "6px 0" }}>{[["dashboard", "Dashboard"], ["command", "Command"], ["analytics", "Analytics"], ["notifications", "Notifications"]].map(([k, l]) => <label key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: uf.view_permissions[k] ? C.text : C.muted, cursor: "pointer" }}><input type="checkbox" checked={uf.view_permissions[k]} onChange={e => setUF({ ...uf, view_permissions: { ...uf.view_permissions, [k]: e.target.checked } })} />{l}</label>)}</div></div>}
        <div style={{ display: "flex", gap: 8 }}><button style={bt("p")} onClick={createUser}>CONFIRM CREATE</button><button style={bt("g")} onClick={() => setSUF(false)}>CANCEL</button></div>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 9, color: C.muted, letterSpacing: 2 }}>BUILT FOR THE J3S OFFICE</div>
      </div>
    </div>}
    <J3S />
  </div>;

  const Tasks = () => {
    const visibleTasks = allTodos.filter(t => { if (isA) return true; if (t.assigned_to === user.id || t.assigned_to === null) return true; return false; });
    const statusFiltered = taskFilter === "all" ? visibleTasks : taskFilter === "active" ? visibleTasks.filter(t => ["pending", "in_progress", "overdue"].includes(t.status)) : taskFilter === "overdue" ? visibleTasks.filter(t => t.status === "overdue") : taskFilter === "completed" ? visibleTasks.filter(t => t.status === "completed") : visibleTasks.filter(t => t.status === taskFilter);
    const assigneeFiltered = taskAssigneeFlt === "all" ? statusFiltered : taskAssigneeFlt === "me" ? statusFiltered.filter(t => t.assigned_to === user.id) : taskAssigneeFlt === "unassigned" ? statusFiltered.filter(t => !t.assigned_to) : statusFiltered.filter(t => t.assigned_to === taskAssigneeFlt);
    const filtered = !taskSearch ? assigneeFiltered : assigneeFiltered.filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()) || (t.description || "").toLowerCase().includes(taskSearch.toLowerCase()) || (t.account_name || "").toLowerCase().includes(taskSearch.toLowerCase()) || (t.assigned_to_name || "").toLowerCase().includes(taskSearch.toLowerCase()));
    const st = { all: visibleTasks.length, active: visibleTasks.filter(t => ["pending", "in_progress", "overdue"].includes(t.status)).length, pending: visibleTasks.filter(t => t.status === "pending").length, in_progress: visibleTasks.filter(t => t.status === "in_progress").length, overdue: visibleTasks.filter(t => t.status === "overdue").length, completed: visibleTasks.filter(t => t.status === "completed").length };
    const prC = p => ({ critical: C.rd, high: "#e85a3a", normal: C.bl, low: C.muted }[p] || C.bl);
    const stC = s => ({ pending: C.yl, in_progress: C.bl, completed: C.gn, overdue: C.rd, cancelled: C.muted }[s] || C.bl);
    const fmtTs = ts => { if (!ts) return "—"; const d = new Date(ts); return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) };
    const fmtDate = d => { if (!d) return "—"; return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) };
    const daysSince = d => { if (!d) return 0; return Math.floor((new Date() - new Date(d)) / 864e5) };
    const selTask = selTaskId ? allTodos.find(t => t.id === selTaskId) : null;
    const selUpdates = selTask ? allTaskUpdates.filter(u => u.todo_id === selTask.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];
    const canPostUpdate = selTask && (isA || selTask.assigned_to === user.id || selTask.assigned_by === user.id);

    return <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div><div style={{ fontSize: 14, color: C.accent, letterSpacing: 2, fontWeight: 700 }}>📋 TASK TRACKER</div><div style={{ fontSize: 10, color: C.soft, marginTop: 2 }}>{st.active} active · {st.overdue} overdue · {st.completed} completed · {st.all} total</div></div>
        <div style={{ display: "flex", gap: 6 }}><button style={sb("s")} onClick={loadTasks}>🔄 REFRESH</button><button style={bt("p")} onClick={() => { setEditTask(null); setTaskForm(defTaskForm); setShowTaskForm(true) }}>+ NEW TASK</button></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 14 }}>
        {[["ALL", st.all, C.text, "all"], ["ACTIVE", st.active, C.yl, "active"], ["PENDING", st.pending, C.yl, "pending"], ["IN PROGRESS", st.in_progress, C.bl, "in_progress"], ["OVERDUE", st.overdue, C.rd, "overdue"], ["COMPLETED", st.completed, C.gn, "completed"]].map(([l, v, c, f]) =>
          <button key={f} onClick={() => setTaskFilter(f)} style={{ background: taskFilter === f ? `${c}15` : C.surface, border: `1px solid ${taskFilter === f ? c : C.border}`, padding: "10px 8px", cursor: "pointer", fontFamily: F, textAlign: "center", borderRadius: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div><div style={{ fontSize: 9, color: C.soft, letterSpacing: 1.5, marginTop: 2 }}>{l}</div>
          </button>)}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input style={{ ...inp, width: 260, flexShrink: 0 }} placeholder="Search title / description / account..." value={taskSearch} onChange={e => setTaskSearch(e.target.value)} />
        <select style={{ ...inp, width: 180 }} value={taskAssigneeFlt} onChange={e => setTaskAssigneeFlt(e.target.value)}><option value="all">All assignees</option><option value="me">🎯 Assigned to me</option><option value="unassigned">Unassigned</option>{users.filter(u => u.is_active).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}</select>
        <div style={{ fontSize: 10, color: C.soft, marginLeft: 6 }}>{filtered.length} task(s)</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: selTask ? "minmax(320px,1fr) 2fr" : "1fr", gap: 14, alignItems: "flex-start" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, maxHeight: "calc(100vh - 320px)", overflowY: "auto", borderRadius: 8 }}>
          {filtered.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 11 }}>No tasks match the current filter</div> :
            filtered.map(t => { const isSel = selTaskId === t.id; const updCount = allTaskUpdates.filter(u => u.todo_id === t.id).length; const isOd = t.status === "overdue";
              return <div key={t.id} onClick={() => setSelTaskId(t.id === selTaskId ? null : t.id)} style={{ padding: "12px 14px", borderBottom: `1px solid ${C.bg}`, background: isSel ? `${C.accent}15` : isOd ? `${C.rd}08` : "transparent", cursor: "pointer", borderLeft: isSel ? `3px solid ${C.accent}` : "3px solid transparent" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: t.status === "completed" ? C.muted : C.text, fontWeight: 700, textDecoration: t.status === "completed" ? "line-through" : "none", marginBottom: 3 }}>{t.title}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}><span style={pill(prC(t.priority))}>{t.priority}</span><span style={pill(stC(t.status))}>{t.status.replace("_", " ")}</span>{updCount > 0 && <span style={pill(C.bl)}>💬 {updCount}</span>}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: C.soft, display: "flex", gap: 6, flexWrap: "wrap" }}>{t.assigned_to_name && <span>→ {t.assigned_to_name}</span>}{t.account_name && <span>· 📁 {t.account_name}</span>}</div>
                {t.due_date && <div style={{ fontSize: 10, color: isOd ? C.rd : C.soft, marginTop: 3 }}>Due: {fmtDate(t.due_date)}</div>}
              </div> })}
        </div>
        {selTask && <div style={{ background: C.surface, border: `1px solid ${C.border}`, maxHeight: "calc(100vh - 320px)", overflowY: "auto", borderRadius: 8 }}>
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, background: C.darkAccent }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{selTask.title}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><span style={pill(prC(selTask.priority))}>{selTask.priority}</span><span style={pill(stC(selTask.status))}>{selTask.status.replace("_", " ")}</span>{selTask.account_name && <span style={pill(C.bl)}>📁 {selTask.account_name}</span>}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(isA || selTask.assigned_by === user.id) && <button style={sb("s")} onClick={() => { setEditTask(selTask); setTaskForm({ title: selTask.title, description: selTask.description || "", priority: selTask.priority, assigned_to: selTask.assigned_to || "", assigned_to_name: selTask.assigned_to_name || "", account_id: selTask.account_id || "", due_date: selTask.due_date || "", tags: (selTask.tags || []).join(", ") }); setShowTaskForm(true) }}>✎ EDIT</button>}
                {isA && <button style={sb("d")} onClick={() => delTask(selTask.id)}>✕ DELETE</button>}
                <button style={sb("s")} onClick={() => setSelTaskId(null)}>✕</button>
              </div>
            </div>
            {selTask.description && <div style={{ fontSize: 11, color: C.soft, marginTop: 8, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{selTask.description}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginTop: 12, fontSize: 10 }}>
              <div><div style={{ color: C.soft, letterSpacing: 1 }}>ASSIGNED TO</div><div style={{ color: C.text, fontWeight: 700, marginTop: 2 }}>{selTask.assigned_to_name || "All"}</div></div>
              <div><div style={{ color: C.soft, letterSpacing: 1 }}>ASSIGNED BY</div><div style={{ color: C.text, fontWeight: 700, marginTop: 2 }}>{selTask.assigned_by_name || "—"}</div></div>
              <div><div style={{ color: C.soft, letterSpacing: 1 }}>DUE DATE</div><div style={{ color: selTask.status === "overdue" ? C.rd : C.text, fontWeight: 700, marginTop: 2 }}>{fmtDate(selTask.due_date)}</div></div>
              <div><div style={{ color: C.soft, letterSpacing: 1 }}>CREATED</div><div style={{ color: C.text, fontWeight: 700, marginTop: 2 }}>{daysSince(selTask.created_at)}d ago</div></div>
            </div>
            {selTask.tags && selTask.tags.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>{selTask.tags.map((tg, i) => <span key={i} style={{ ...pill(C.soft), background: C.darkAccent }}>#{tg}</span>)}</div>}
          </div>
          <div style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.accent, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>📜 Activity Log ({selUpdates.length})</div>
            {selUpdates.length === 0 ? <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 14 }}>No updates yet. {canPostUpdate ? "Post the first update below." : ""}</div> :
              <div style={{ marginBottom: 14, position: "relative", paddingLeft: 22 }}>
                <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: C.border }} />
                {selUpdates.map((u, i) => { const isStatusChange = !!u.new_status; return <div key={u.id} style={{ position: "relative", marginBottom: 14, paddingBottom: 8 }}>
                  <div style={{ position: "absolute", left: -20, top: 4, width: 12, height: 12, borderRadius: "50%", background: isStatusChange ? stC(u.new_status) : C.accent, border: `2px solid ${C.bg}` }} />
                  <div style={{ background: C.bg, padding: "10px 12px", border: `1px solid ${C.border}`, borderLeft: `3px solid ${isStatusChange ? stC(u.new_status) : C.accent}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>👤 {u.author_name || "Unknown"}</span>
                        {isStatusChange && <span style={pill(stC(u.new_status))}>{u.old_status ? `${u.old_status.replace("_", " ")} → ${u.new_status.replace("_", " ")}` : `→ ${u.new_status.replace("_", " ")}`}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 9, color: C.muted, fontFamily: F }}>{fmtTs(u.created_at)}</span>
                        {(isA || u.author_id === user.id) && <span style={{ color: C.rd, cursor: "pointer", fontSize: 11 }} onClick={() => delTaskUpdate(u.id)}>✕</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{u.update_text}</div>
                  </div>
                </div> })}
              </div>}
            {canPostUpdate ? <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 12, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: 1.5, marginBottom: 8 }}>✍ ADD UPDATE</div>
              <textarea style={{ ...inp, height: 70, resize: "vertical", marginBottom: 8 }} placeholder="Update progress or blockers..." value={updateText} onChange={e => setUpdateText(e.target.value)} />
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ ...lbl, marginBottom: 2 }}>Change status?</label>
                  <select style={inp} value={updateStatus} onChange={e => setUpdateStatus(e.target.value)}><option value="">— No change —</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                </div>
                <button style={{ ...bt("p"), marginTop: 14 }} onClick={() => postTaskUpdate(selTask.id)} disabled={syncing || !updateText.trim()}>{syncing ? "POSTING..." : "POST UPDATE"}</button>
              </div>
            </div> : <div style={{ fontSize: 10, color: C.muted, textAlign: "center", padding: 10, fontStyle: "italic" }}>Read-only access. Only assigned users or admins can update.</div>}
          </div>
        </div>}
      </div>
      {showTaskForm && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40, overflowY: "auto" }} onClick={() => { setShowTaskForm(false); setEditTask(null) }}>
        <div style={{ background: C.surface, border: `2px solid ${C.accent}`, padding: 22, width: "94%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", borderRadius: 12 }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 14 }}>{editTask ? "EDIT" : "NEW"} TASK</div>
          <div style={{ marginBottom: 10 }}><label style={lbl}>Title *</label><input style={inp} value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="What needs to be done?" /></div>
          <div style={{ marginBottom: 10 }}><label style={lbl}>Description</label><textarea style={{ ...inp, height: 70, resize: "vertical" }} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Context or expected outcome..." /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={lbl}>Priority</label><select style={inp} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>{["low", "normal", "high", "critical"].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}</select></div>
            <div><label style={lbl}>Due Date</label><input type="date" style={inp} value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={lbl}>Assign To</label><select style={inp} value={taskForm.assigned_to} onChange={e => { const uid = e.target.value; const u = users.find(x => x.id === uid); setTaskForm({ ...taskForm, assigned_to: uid, assigned_to_name: u ? (u.full_name || u.username) : "All" }) }}><option value="">— All (Everyone) —</option>{users.filter(u => u.is_active).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}</select></div>
            <div><label style={lbl}>Linked Account</label><select style={inp} value={taskForm.account_id} onChange={e => setTaskForm({ ...taskForm, account_id: e.target.value })}><option value="">— None —</option>{scopedAccs.map(a => <option key={a.id} value={a.id}>{a.client}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={lbl}>Tags (comma-separated)</label><input style={inp} value={taskForm.tags} onChange={e => setTaskForm({ ...taskForm, tags: e.target.value })} placeholder="site-visit, urgent, vendor..." /></div>
          <div style={{ display: "flex", gap: 8 }}><button style={bt("p")} onClick={saveTask} disabled={syncing}>{syncing ? "SAVING..." : editTask ? "UPDATE" : "CREATE"}</button><button style={bt("g")} onClick={() => { setShowTaskForm(false); setEditTask(null) }}>CANCEL</button></div>
        </div>
      </div>}
      <J3S />
    </div>;
  };

  const Notif = () => {
    const fDateFull = d => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
    const evIcon = { assigned: "📬", reassigned: "🔄", status_changed: "🔃", completed: "✅", deleted: "🗑️", remark_added: "💬" };
    const evColor = { assigned: C.bl, reassigned: C.yl, status_changed: C.bl, completed: C.gn, deleted: C.rd, remark_added: C.accent };
    return <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div><div style={{ fontSize: 14, color: C.accent, letterSpacing: 2, fontWeight: 700 }}>🔔 NOTIFICATIONS</div><div style={{ fontSize: 10, color: C.soft, marginTop: 2 }}>{unreadNotifCount} unread · {notifs.length} total</div></div>
        <div style={{ display: "flex", gap: 6 }}><button style={sb("s")} onClick={loadNotifs}>🔄 REFRESH</button>{unreadNotifCount > 0 && <button style={bt("p")} onClick={markAllNotifsRead}>MARK ALL READ</button>}</div>
      </div>
      {notifs.length === 0 ? <div style={{ ...sec, textAlign: "center", padding: 40, color: C.muted, fontSize: 12 }}>No notifications.</div> :
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          {notifs.map(n => <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.bg}`, background: n.is_read ? "transparent" : `${C.accent}08`, display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }} onClick={() => !n.is_read && markNotifRead(n.id)}>
            <div style={{ fontSize: 20, minWidth: 24 }}>{evIcon[n.event_type] || "🔔"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, display: "inline-block" }} />}
                <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{n.todo_title || "(Deleted task)"}</span>
                <span style={pill(evColor[n.event_type] || C.soft)}>{(n.event_type || "").replace("_", " ").toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 11, color: C.soft, marginBottom: 4 }}>{n.message}</div>
              {n.remark && <div style={{ fontSize: 11, color: C.accent, fontStyle: "italic", marginBottom: 4, padding: "6px 10px", background: C.bg, borderLeft: `2px solid ${C.accent}` }}>💬 "{n.remark}"</div>}
              <div style={{ fontSize: 10, color: C.muted }}>{n.actor_name || "System"} · {fDateFull(n.created_at)}</div>
            </div>
            <button style={{ ...sb("s"), padding: "2px 6px", color: C.rd }} onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}>✕</button>
          </div>)}
        </div>}
      <J3S />
    </div>;
  };

  const Stg = () => <div>
    <div style={{ display: "flex", gap: 4, marginBottom: 18, flexWrap: "wrap" }}>{[["general", "General"], ["services", "Services"], ["compliance", "Compliance"], ["health", "Health"], ["staff", "Staff Roles"], ["alerts", "Alerts"], ["billing", "Billing"], ["branches", "Branches"], ["data", "Data"]].map(([k, l]) => <button key={k} style={nb(sTab === k)} onClick={() => setSTab(k)}>{l}</button>)}</div>
    {sTab === "general" && <div style={sec}><div style={secT}>BRANDING</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div><label style={lbl}>Company Name</label><input style={inp} value={stg.companyName} onChange={e => uS({ companyName: e.target.value })} /></div><div><label style={lbl}>Tagline</label><input style={inp} value={stg.tagline} onChange={e => uS({ tagline: e.target.value })} /></div><div><label style={lbl}>Currency Symbol</label><input style={{ ...inp, width: 80 }} value={stg.currency.symbol} onChange={e => uS({ currency: { ...stg.currency, symbol: e.target.value } })} /></div><div><label style={lbl}>Locale</label><input style={inp} value={stg.currency.locale} onChange={e => uS({ currency: { ...stg.currency, locale: e.target.value } })} /></div></div></div>}
    {sTab === "services" && <div style={sec}><div style={secT}>SERVICE TYPES</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{stg.serviceTypes.map((t, i) => <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11, borderRadius: 4 }}><InEd value={t} onChange={v => { const u = [...stg.serviceTypes]; u[i] = v; uS({ serviceTypes: u }) }} style={{ fontSize: 11, color: C.text }} /><span style={{ color: C.rd, cursor: "pointer", fontWeight: 700 }} onClick={() => uS({ serviceTypes: stg.serviceTypes.filter((_, j) => j !== i) })}>×</span></div>)}</div><button style={sb("s")} onClick={() => uS({ serviceTypes: [...stg.serviceTypes, "New Service"] })}>+ ADD</button></div>}
    {sTab === "compliance" && <div style={sec}><div style={secT}>COMPLIANCE ITEMS</div>{stg.complianceItems.map((item, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><input style={{ ...inp, width: 120 }} value={item.key} onChange={e => { const u = [...stg.complianceItems]; u[i] = { ...u[i], key: e.target.value.replace(/\s/g, "") }; uS({ complianceItems: u }) }} /><input style={{ ...inp, flex: 1 }} value={item.label} onChange={e => { const u = [...stg.complianceItems]; u[i] = { ...u[i], label: e.target.value }; uS({ complianceItems: u }) }} /><span style={{ color: C.rd, cursor: "pointer", fontWeight: 700 }} onClick={() => uS({ complianceItems: stg.complianceItems.filter((_, j) => j !== i) })}>×</span></div>)}<button style={sb("s")} onClick={() => uS({ complianceItems: [...stg.complianceItems, { key: `c${Date.now()}`, label: "New Item" }] })}>+ ADD</button></div>}
    {sTab === "health" && <div style={sec}><div style={secT}>HEALTH STATUSES</div>{stg.healthStatuses.map((h, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><input style={{ ...inp, width: 80 }} value={h.key} onChange={e => { const u = [...stg.healthStatuses]; u[i] = { ...u[i], key: e.target.value }; uS({ healthStatuses: u }) }} /><input type="color" style={{ width: 40, height: 32, padding: 2, background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }} value={h.color} onChange={e => { const u = [...stg.healthStatuses]; u[i] = { ...u[i], color: e.target.value }; uS({ healthStatuses: u }) }} /><input style={{ ...inp, flex: 1 }} value={h.meaning} onChange={e => { const u = [...stg.healthStatuses]; u[i] = { ...u[i], meaning: e.target.value }; uS({ healthStatuses: u }) }} /><span style={{ color: C.rd, cursor: "pointer", fontWeight: 700 }} onClick={() => uS({ healthStatuses: stg.healthStatuses.filter((_, j) => j !== i) })}>×</span></div>)}<button style={sb("s")} onClick={() => uS({ healthStatuses: [...stg.healthStatuses, { key: "New", color: "#888888", meaning: "" }] })}>+ ADD</button></div>}
    {sTab === "staff" && <div style={sec}><div style={secT}>STAFF ROLES</div>{stg.staffRoles.map((r, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><input style={{ ...inp, width: 120 }} value={r.key} onChange={e => { const u = [...stg.staffRoles]; u[i] = { ...u[i], key: e.target.value.replace(/\s/g, "") }; uS({ staffRoles: u }) }} /><input style={{ ...inp, flex: 1 }} value={r.label} onChange={e => { const u = [...stg.staffRoles]; u[i] = { ...u[i], label: e.target.value }; uS({ staffRoles: u }) }} /><span style={{ color: C.rd, cursor: "pointer", fontWeight: 700 }} onClick={() => uS({ staffRoles: stg.staffRoles.filter((_, j) => j !== i) })}>×</span></div>)}<button style={sb("s")} onClick={() => uS({ staffRoles: [...stg.staffRoles, { key: `r${Date.now()}`, label: "New Role" }] })}>+ ADD</button></div>}
    {sTab === "alerts" && <div style={sec}><div style={secT}>THRESHOLDS</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}><div><label style={lbl}>Renewal (days)</label><input style={inp} type="number" value={stg.alertThresholds.renewalDays} onChange={e => uS({ alertThresholds: { ...stg.alertThresholds, renewalDays: Number(e.target.value) } })} /></div><div><label style={lbl}>Overdue (days)</label><input style={inp} type="number" value={stg.alertThresholds.overduePaymentDays} onChange={e => uS({ alertThresholds: { ...stg.alertThresholds, overduePaymentDays: Number(e.target.value) } })} /></div><div><label style={lbl}>Staff Shortfall %</label><input style={inp} type="number" value={stg.alertThresholds.staffShortfallPct} onChange={e => uS({ alertThresholds: { ...stg.alertThresholds, staffShortfallPct: Number(e.target.value) } })} /></div></div></div>}
    {sTab === "billing" && <div style={sec}><div style={secT}>DEFAULTS</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div><label style={lbl}>Invoice Day</label><input style={inp} type="number" min={1} max={28} value={stg.invoiceDayDefault} onChange={e => uS({ invoiceDayDefault: Number(e.target.value) })} /></div><div><label style={lbl}>Payment Terms</label><select style={inp} value={stg.defaultPaymentTerms} onChange={e => uS({ defaultPaymentTerms: Number(e.target.value) })}>{stg.paymentTermsPresets.map(d => <option key={d} value={d}>{d}d</option>)}</select></div></div></div>}
    {sTab === "branches" && <div style={sec}><div style={secT}>BRANCHES</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{(stg.branches || []).map((b, i) => <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, padding: "4px 10px", fontSize: 11, borderRadius: 4 }}><InEd value={b} onChange={v => { const u = [...stg.branches]; u[i] = v; uS({ branches: u }) }} style={{ fontSize: 11, color: C.text }} /><span style={{ color: C.rd, cursor: "pointer", fontWeight: 700 }} onClick={() => uS({ branches: stg.branches.filter((_, j) => j !== i) })}>×</span></div>)}</div><button style={sb("s")} onClick={() => uS({ branches: [...(stg.branches || []), "New Branch"] })}>+ ADD</button></div>}
    {sTab === "data" && <div style={sec}><div style={secT}>SUPABASE CONNECTION</div><div style={{ fontSize: 11, color: C.soft, marginBottom: 12 }}>Connected: <span style={{ color: C.gn }}>iqccddabidfcrsbdehiq.supabase.co</span> · Mumbai (ap-south-1)</div><div style={{ display: "flex", gap: 8 }}><button style={bt("s")} onClick={xCSV}>📥 EXPORT CSV</button><button style={bt("s")} onClick={loadAll}>🔄 FORCE SYNC</button></div></div>}
    <J3S />
  </div>;

  // ═══ ACCOUNT FORM ═══
  const Frm = () => {
    if (!fd) return null;
    return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 20, overflowY: "auto" }} onClick={() => setSF(false)}>
      <div style={{ background: C.surface, border: `2px solid ${C.accent}`, width: "94%", maxWidth: 720, padding: 22, maxHeight: "90vh", overflowY: "auto", borderRadius: 12 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 2, marginBottom: 14 }}>{eMode ? "EDIT" : "NEW"} ACCOUNT</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={lbl}>Client *</label><input style={inp} value={fd.client} onChange={e => setFD({ ...fd, client: e.target.value })} placeholder="Client name" /></div>
          <div><label style={lbl}>Account Code</label><input style={inp} value={fd.account_code || ""} onChange={e => setFD({ ...fd, account_code: e.target.value })} placeholder="e.g. MRF-HYD-001" /></div>
          <div><label style={lbl}>Location</label><input style={inp} value={fd.location || ""} onChange={e => setFD({ ...fd, location: e.target.value })} placeholder="City / Site" /></div>
          <div><label style={lbl}>Service Type</label><select style={inp} value={fd.service_type} onChange={e => setFD({ ...fd, service_type: e.target.value })}>{stg.serviceTypes.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label style={lbl}>Contract Value ({stg.currency.symbol}/yr)</label><input style={inp} type="number" value={fd.contract_value} onChange={e => setFD({ ...fd, contract_value: Number(e.target.value) })} /></div>
          <div><label style={lbl}>Billing Cycle</label><select style={inp} value={fd.billing_cycle} onChange={e => setFD({ ...fd, billing_cycle: e.target.value })}>{stg.billingCycles.map(b => <option key={b}>{b}</option>)}</select></div>
          <div><label style={lbl}>Contract Start</label><input style={inp} type="date" value={fd.contract_start || ""} onChange={e => setFD({ ...fd, contract_start: e.target.value })} /></div>
          <div><label style={lbl}>Contract End</label><input style={inp} type="date" value={fd.contract_end || ""} onChange={e => setFD({ ...fd, contract_end: e.target.value })} /></div>
          <div><label style={lbl}>Payment Terms</label><select style={inp} value={fd.payment_terms} onChange={e => setFD({ ...fd, payment_terms: Number(e.target.value) })}>{stg.paymentTermsPresets.map(d => <option key={d} value={d}>{d}d</option>)}</select></div>
          <div><label style={lbl}>Status</label><select style={inp} value={fd.status} onChange={e => setFD({ ...fd, status: e.target.value })}>{stg.accountStatuses.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={lbl}>Health</label><select style={inp} value={fd.health} onChange={e => setFD({ ...fd, health: e.target.value })}>{stg.healthStatuses.map(h => <option key={h.key} value={h.key}>{h.key}</option>)}</select></div>
          <div><label style={lbl}>Pending ({stg.currency.symbol})</label><input style={inp} type="number" value={fd.pending_amount} onChange={e => setFD({ ...fd, pending_amount: Number(e.target.value) })} /></div>
          <div><label style={lbl}>Branch</label><select style={inp} value={fd.branch || ""} onChange={e => setFD({ ...fd, branch: e.target.value })}><option value="">— Select —</option>{(stg.branches || []).map(b => <option key={b}>{b}</option>)}</select></div>
          <div><label style={lbl}>Field Officer</label><select style={inp} value={fd.field_officer_id || ""} onChange={e => setFD({ ...fd, field_officer_id: e.target.value || null })}><option value="">— None —</option>{users.filter(u => u.is_active).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username} {u.scope_level === "site" ? "(site)" : u.scope_level === "branch" ? `(${u.scope_branch || "branch"})` : ""}</option>)}</select></div>
        </div>

        <div style={{ marginTop: 14 }}><label style={{ ...lbl, marginBottom: 8 }}>👥 STAFF BREAKDOWN</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
            {stg.staffRoles.map(r => { const v = fd.staff_breakdown?.[r.key] || { required: 0, deployed: 0 }; return <div key={r.key} style={{ background: C.bg, padding: 10, border: `1px solid ${C.border}`, borderRadius: 4 }}><div style={{ fontSize: 10, color: C.accent, letterSpacing: 1, marginBottom: 6 }}>{r.label.toUpperCase()}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}><div><label style={{ fontSize: 9, color: C.muted }}>Required</label><input style={inp} type="number" min={0} value={v.required} onChange={e => setFD({ ...fd, staff_breakdown: { ...fd.staff_breakdown, [r.key]: { ...v, required: Number(e.target.value) } } })} /></div><div><label style={{ fontSize: 9, color: C.muted }}>Deployed</label><input style={inp} type="number" min={0} value={v.deployed} onChange={e => setFD({ ...fd, staff_breakdown: { ...fd.staff_breakdown, [r.key]: { ...v, deployed: Number(e.target.value) } } })} /></div></div></div> })}
          </div>
        </div>

        <div style={{ marginTop: 12 }}><label style={lbl}>Compliance Status</label>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
            {stg.complianceItems.map(ci => <label key={ci.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.soft, cursor: "pointer" }}><input type="checkbox" checked={fd.compliance_status?.[ci.key] || false} onChange={e => setFD({ ...fd, compliance_status: { ...fd.compliance_status, [ci.key]: e.target.checked } })} />{ci.label}</label>)}
          </div>
        </div>

        <div style={{ marginTop: 12 }}><label style={lbl}>Renewal Status</label>
          <select style={inp} value={fd.renewal_status || ""} onChange={e => setFD({ ...fd, renewal_status: e.target.value })}>
            {(stg.renewalStatuses || []).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 12 }}><label style={lbl}>Notes</label><textarea style={{ ...inp, height: 60, resize: "vertical" }} value={fd.notes || ""} onChange={e => setFD({ ...fd, notes: e.target.value })} placeholder="Internal notes, deployment details..." /></div>

        <div style={{ marginTop: 12 }}><label style={lbl}>Primary Contact</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <input style={inp} placeholder="Name" value={fd.contacts?.[0]?.name || ""} onChange={e => setFD({ ...fd, contacts: [{ ...(fd.contacts?.[0] || {}), name: e.target.value }] })} />
            <input style={inp} placeholder="Phone" value={fd.contacts?.[0]?.phone || ""} onChange={e => setFD({ ...fd, contacts: [{ ...(fd.contacts?.[0] || {}), phone: e.target.value }] })} />
            <input style={inp} placeholder="Role" value={fd.contacts?.[0]?.role || ""} onChange={e => setFD({ ...fd, contacts: [{ ...(fd.contacts?.[0] || {}), role: e.target.value }] })} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button style={bt("p")} onClick={saveAcc} disabled={syncing}>{syncing ? "SAVING..." : eMode ? "UPDATE ACCOUNT" : "CREATE ACCOUNT"}</button>
          <button style={bt("g")} onClick={() => { setSF(false); setEM(false) }}>CANCEL</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 9, color: C.muted, letterSpacing: 2 }}>BUILT FOR THE J3S OFFICE</div>
      </div>
    </div>;
  };

  // ═══ LOGIN SCREEN ═══
  if (!user) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>
      <div style={{ width: 380, padding: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.accent, letterSpacing: 4 }}>BBCSS</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, marginTop: 4 }}>BLACK BELT COMMANDOS · SECURITY SERVICES</div>
          <div style={{ width: 40, height: 2, background: C.accent, margin: "12px auto 0" }} />
        </div>
        <div style={{ marginBottom: 12 }}><label style={lbl}>Workspace Email</label><input style={inp} value={lU} onChange={e => setLU(e.target.value)} placeholder={`username@${DOMAIN}`} onKeyDown={e => e.key === "Enter" && doLogin()} autoFocus /></div>
        <div style={{ marginBottom: 18 }}><label style={lbl}>Password</label><input style={inp} type="password" value={lP} onChange={e => setLP(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && doLogin()} /></div>
        {lErr && <div style={{ color: C.rd, fontSize: 11, marginBottom: 12, padding: "8px 10px", background: "#7f1d1d22", border: `1px solid #7f1d1d`, borderRadius: 4 }}>{lErr}</div>}
        <button style={{ ...bt("p"), width: "100%", padding: 12, fontSize: 12, letterSpacing: 2 }} onClick={doLogin} disabled={lding}>{lding ? "AUTHENTICATING..." : "AUTHENTICATE"}</button>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 9, color: C.muted, letterSpacing: 2 }}>BUILT FOR THE J3S OFFICE · RESTRICTED ACCESS</div>
      </div>
    </div>
  );

  // ═══ MAIN SHELL ═══
  const navItems = [
    { key: "dashboard", label: "DASHBOARD", show: canSee("dashboard") },
    { key: "analytics", label: "ANALYTICS", show: canSee("analytics") },
    { key: "tasks", label: "TASKS", show: canSee("command") },
    { key: "notifications", label: `NOTIF${unreadNotifCount > 0 ? ` (${unreadNotifCount})` : ""}`, show: canSee("notifications") },
    { key: "users", label: "USERS", show: isA },
    { key: "settings", label: "SETTINGS", show: isA },
  ].filter(n => n.show);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F, color: C.text }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 16, height: 52, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 3, flexShrink: 0 }}>BBCSS</div>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, flexShrink: 0, display: "none" }}>{stg.tagline}</div>
        <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
          {navItems.map(n => <button key={n.key} style={{ ...nb(view === n.key), padding: "6px 12px", fontSize: 10, flexShrink: 0, color: view === n.key ? C.bg : n.key === "notifications" && unreadNotifCount > 0 ? C.yl : C.soft }} onClick={() => { setView(n.key); if (n.key !== "detail") setSelId(null) }}>{n.label}</button>)}
        </div>
        {syncing && <div style={{ fontSize: 9, color: C.yl, letterSpacing: 2, flexShrink: 0 }}>SYNCING...</div>}
        <div style={{ fontSize: 10, color: C.soft, flexShrink: 0 }}>{user.full_name || user.username}</div>
        <button style={{ ...sb("d"), fontSize: 9 }} onClick={() => setUser(null)}>LOGOUT</button>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 20px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {view === "dashboard" && <Dash />}
        {view === "detail" && <Det />}
        {view === "analytics" && <Analytics />}
        {view === "tasks" && <Tasks />}
        {view === "notifications" && <Notif />}
        {view === "users" && isA && <Usr />}
        {view === "settings" && isA && <Stg />}
      </div>

      {/* Account Form Modal */}
      {showFrm && <Frm />}

      {/* Toast */}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: C.darkAccent, border: `1px solid ${C.accent}`, color: C.accent, padding: "10px 18px", fontSize: 11, letterSpacing: 1, borderRadius: 6, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", fontFamily: F }}>{toast}</div>}
    </div>
  );
}
