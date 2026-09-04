/* Deweg Engineering HRMS — demo logic (session-aware) */

/* ---------- Session ---------- */
const EMPLOYEES = [
  {id:1,  name:"Rahul Sharma",    div:"Engineering",   dept:"Mechanical", email:"rahul.sharma@deweg.com",   mgr:"A. Iyer",   status:"Online",  manager:true },
  {id:2,  name:"Priya Nair",      div:"Design",        dept:"Design",     email:"priya.nair@deweg.com",     mgr:"Rahul Sharma", status:"Online", manager:false},
  {id:3,  name:"Vikram Patel",    div:"Manufacturing", dept:"Electrical", email:"vikram.patel@deweg.com",   mgr:"P. Menon",  status:"Off Line",manager:false},
  {id:4,  name:"Anita Desai",     div:"Quality",       dept:"Mechanical", email:"anita.desai@deweg.com",    mgr:"Rahul Sharma", status:"Online", manager:false},
  {id:5,  name:"Suresh Kumar",    div:"Projects",      dept:"Civil",      email:"suresh.kumar@deweg.com",   mgr:"A. Iyer",   status:"Off Line",manager:false},
  {id:6,  name:"Meera Joshi",     div:"Engineering",   dept:"Design",     email:"meera.joshi@deweg.com",    mgr:"Rahul Sharma", status:"Online", manager:false},
  {id:7,  name:"Arjun Reddy",     div:"Manufacturing", dept:"Mechanical", email:"arjun.reddy@deweg.com",    mgr:"P. Menon",  status:"Online",  manager:false},
  {id:8,  name:"Kavya Menon",     div:"Quality",       dept:"Electrical", email:"kavya.menon@deweg.com",    mgr:"A. Iyer",   status:"Online",  manager:false},
  {id:9,  name:"Rohit Verma",     div:"Projects",      dept:"Civil",      email:"rohit.verma@deweg.com",    mgr:"Rahul Sharma", status:"Off Line",manager:false},
  {id:10, name:"Deepika Iyer",    div:"Design",        dept:"Design",     email:"deepika.iyer@deweg.com",   mgr:"A. Iyer",   status:"Online",  manager:false},
];
const session = JSON.parse(localStorage.getItem('deweg_user') || '{"id":1,"role":"manager"}');
const ME = EMPLOYEES.find(e=>e.id===session.id) || EMPLOYEES[0];
const pad = n => 'DEWEG_' + n;

/* ---------- Sample leave requests ---------- */
const requests = [
  { no:"LV-2026-0148", emp:1,  type:"PL", start:"2026-09-07", end:"2026-09-09", days:3,   status:"Pending",  by:"Rahul Sharma" },
  { no:"LV-2026-0147", emp:2,  type:"CL", start:"2026-09-05", end:"2026-09-05", days:1,   status:"Approved", by:"Priya Nair"   },
  { no:"LV-2026-0146", emp:3,  type:"AL", start:"2026-09-01", end:"2026-09-04", days:4,   status:"Approved", by:"Vikram Patel" },
  { no:"LV-2026-0145", emp:4,  type:"PL", start:"2026-08-28", end:"2026-08-29", days:2,   status:"Rejected", by:"Anita Desai"  },
  { no:"LV-2026-0144", emp:5,  type:"CL", start:"2026-08-26", end:"2026-08-26", days:0.5, status:"Approved", by:"Suresh Kumar" },
  { no:"LV-2026-0143", emp:6,  type:"PL", start:"2026-08-20", end:"2026-08-22", days:3,   status:"Approved", by:"Meera Joshi"  },
  { no:"LV-2026-0142", emp:7,  type:"AL", start:"2026-08-15", end:"2026-08-18", days:4,   status:"Pending",  by:"Arjun Reddy"  },
  { no:"LV-2026-0141", emp:8,  type:"CL", start:"2026-08-12", end:"2026-08-13", days:2,   status:"Approved", by:"Kavya Menon"  },
  { no:"LV-2026-0140", emp:9,  type:"PL", start:"2026-08-10", end:"2026-08-11", days:2,   status:"Approved", by:"Rohit Verma"  },
  { no:"LV-2026-0139", emp:10, type:"AL", start:"2026-08-05", end:"2026-08-06", days:2,   status:"Rejected", by:"Deepika Iyer" },
];
const empName = id => (EMPLOYEES.find(e=>e.id===id)||{}).name || '—';
const initials = n => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

/* ---------- Personalize shell ---------- */
document.querySelector('.sb-user .avatar').textContent = initials(ME.name);
document.querySelector('.sb-user .nm').textContent = ME.name;
document.querySelector('.sb-user .rl').textContent =
  session.role==='manager' ? 'Reporting Manager' : 'Employee · ' + pad(ME.id);
document.getElementById('greet').textContent = 'Welcome, ' + ME.name + ' 👋';

/* Employee sees only their own requests; manager sees their team's */
const teamIds = EMPLOYEES.filter(e=>e.mgr===ME.name).map(e=>e.id).concat(ME.id);
const visibleRequests = session.role==='manager'
  ? requests.filter(r=>teamIds.includes(r.emp))
  : requests.filter(r=>r.emp===ME.id);

document.getElementById('dash-title').textContent = session.role==='manager'
  ? 'Team Leave Requests' : 'My Recent Leave Requests';
document.getElementById('dash-sub').textContent = session.role==='manager'
  ? 'Latest requests raised by you and your direct reports' : 'Your latest leave applications and their current status';

/* ---------- Navigation ---------- */
function showView(v){
  if(v==='employee' && session.role!=='manager'){ v='dashboard'; }
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.toggle('active', l.dataset.view===v));
  window.scrollTo({top:0,behavior:'smooth'});
}
/* event delegation so collapsed-sidebar clicks always register */
document.addEventListener('click',e=>{
  const link = e.target.closest('.sb-link[data-view]');
  if(link){ showView(link.dataset.view); toggleSidebar(false); }
});
function logout(){
  localStorage.removeItem('deweg_user');
  location.href = 'index.html';
}

/* ---------- Sidebar: desktop collapse / mobile drawer ---------- */
function toggleSidebar(force){
  const app = document.querySelector('.app');
  const mobile = window.innerWidth <= 900;
  if(mobile){
    /* drawer: open overlays content, closed slides away */
    const open = force !== undefined ? force : !app.classList.contains('sb-open');
    app.classList.toggle('sb-open', open);
  }else{
    /* desktop: collapse to icon rail */
    const collapsed = force !== undefined ? !force : !app.classList.contains('sb-collapsed');
    app.classList.toggle('sb-collapsed', collapsed);
  }
}

/* ---------- Badges / dates ---------- */
const badge = s => `<span class="badge ${s.toLowerCase().replace(/ /g,'')}">${s}</span>`;
const badgeLv = t => `<span class="badge ${t.toLowerCase()}">${t}</span>`;
const fmt = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';

/* ---------- Dashboard ---------- */
function renderDash(){
  document.getElementById('dash-table').innerHTML = visibleRequests.slice(0,6).map(r=>`
    <tr>
      <td data-label="Request No" class="emp-id">${r.no}</td>
      <td data-label="Requested For"><span class="avatar">${initials(empName(r.emp))}</span>${empName(r.emp)}</td>
      <td data-label="Leave Type">${badgeLv(r.type)}</td>
      <td data-label="Start Date">${fmt(r.start)}</td><td data-label="End Date">${fmt(r.end)}</td>
      <td data-label="No of Days"><strong>${r.days}</strong></td><td data-label="Status">${badge(r.status)}</td><td data-label="Requested By">${r.by}</td>
    </tr>`).join('') || `<tr><td colspan="8" class="no-label" style="text-align:center;color:var(--muted);padding:28px">No requests yet.</td></tr>`;
}

const pending = visibleRequests.filter(r=>r.status==='Pending').length;
const statVals = document.querySelectorAll('#view-dashboard .stat');
if(session.role==='manager'){
  statVals[0].querySelector('.lbl').textContent='Team Strength';
  statVals[0].querySelector('.val').textContent=teamIds.length-1;
  statVals[0].querySelector('.sub').textContent='Direct reports';
}else{
  statVals[0].querySelector('.lbl').textContent='My Employee ID';
  statVals[0].querySelector('.val').textContent=ME.id;
  statVals[0].querySelector('.sub').textContent=ME.div+' · '+ME.dept;
  statVals[3].querySelector('.lbl').textContent='Leaves Taken';
  statVals[3].querySelector('.val').textContent=
    visibleRequests.filter(r=>r.status==='Approved').reduce((s,r)=>s+r.days,0);
  statVals[3].querySelector('.sub').textContent='Approved days this period';
}
statVals[1].querySelector('.val').textContent=pending;

/* ---------- Employee Master ---------- */
function renderEmployees(){
  const q = (document.getElementById('emp-search').value||'').toLowerCase();
  const fd = document.getElementById('emp-fdiv').value;
  const fp = document.getElementById('emp-fdept').value;
  const fs = document.getElementById('emp-fstat').value;
  const rows = EMPLOYEES.filter(e=>
    (!q || (e.name+pad(e.id)+e.email).toLowerCase().includes(q)) &&
    (!fd || e.div===fd) && (!fp || e.dept===fp) && (!fs || e.status===fs));
  document.getElementById('emp-table').innerHTML = rows.length ? rows.map(e=>`
    <tr>
      <td data-label="Emp No" class="emp-id">${pad(e.id)}</td>
      <td data-label="Employee Name"><span class="avatar">${initials(e.name)}</span>${e.name}</td>
      <td data-label="Division">${e.div}</td><td data-label="Department">${e.dept}</td>
      <td data-label="Email ID">${e.email}</td><td data-label="Reporting Manager">${e.mgr}</td>
      <td data-label="Status">${badge(e.status)}</td>
      <td data-label="Actions" class="no-label"><button class="btn btn-outline btn-sm" onclick="toast('View / edit coming soon (demo)')">View</button></td>
    </tr>`).join('') : `<tr><td colspan="8" class="no-label" style="text-align:center;color:var(--muted);padding:28px">No employees match the filters.</td></tr>`;
}

/* ---------- Leave Application (personalized) ---------- */
document.getElementById('lf-no').textContent   = pad(ME.id);
document.getElementById('lf-name').textContent = ME.name;
document.getElementById('lf-div').textContent  = ME.div;
document.getElementById('lf-dept').textContent = ME.dept;
document.getElementById('lf-avatar').textContent = initials(ME.name);
document.getElementById('lf-name2').textContent  = ME.name;
document.getElementById('lf-no2').textContent    = pad(ME.id);

/* ---------- Leave balances driven by Configuration ---------- */
const policy = { PL:18, CL:12, AL:10 };   /* mirrors Configuration screen */

function usedOf(id){
  const u = { PL:0, CL:0, AL:0 };
  requests.forEach(r=>{ if(r.emp===id && r.status==='Approved') u[r.type]+=r.days; });
  return u;
}
function availOf(id){
  const u = usedOf(id), a = {};
  for(const t in policy) a[t] = Math.max(0, policy[t]-u[t]);
  return a;
}
function renderBalances(){
  const a = availOf(ME.id);
  for(const t of ['PL','CL','AL']){
    const k = t.toLowerCase();
    document.getElementById('pil-'+k).textContent = a[t].toFixed(1);
    document.getElementById('val-'+k).textContent = a[t].toFixed(1);
    document.getElementById('tot-'+k).textContent = policy[t].toFixed(1);
    document.getElementById('bar-'+k).style.width = (a[t]/policy[t]*100)+'%';
  }
  const cat = document.getElementById('lv-cat').value;
  document.getElementById('lv-bal').value =
    cat ? `${a[cat].toFixed(1)} / ${policy[cat].toFixed(1)} days` : '—';
}

document.getElementById('lv-cat').addEventListener('change',renderBalances);

/* ---------- Additional employee fields (toggled from Configuration) ---------- */
function applyExtraFields(){
  ['mobile','desig','doj'].forEach(k=>{
    const on = document.getElementById('cfg-f-'+k).checked;
    document.querySelectorAll('[data-extra="'+k+'"]').forEach(el=>{
      el.style.display = on ? '' : 'none';
    });
  });
}

function saveConfig(){
  for(const t of ['pl','cl','al']){
    const v = parseFloat(document.getElementById('cfg-'+t).value);
    if(!isNaN(v) && v>=0) policy[t.toUpperCase()] = v;
  }
  renderBalances();
  toast('✅ Configuration saved — leave balances and form fields updated');
}

function calcDays(){
  const s = document.getElementById('lv-start').value;
  const e = document.getElementById('lv-end').value;
  const st = document.getElementById('lv-stype').value;
  const et = document.getElementById('lv-etype').value;
  if(!s||!e){ return; }
  let days = Math.round((new Date(e)-new Date(s))/86400000) + 1;
  if(days < 1){ document.getElementById('lv-days').value = '0.0'; return; }
  if(days===1){
    document.getElementById('lv-days').value =
      (st==='Half Day'||et==='Half Day') ? '0.5' : '1.0';
  } else {
    const d = days - (st==='Half Day'?0.5:0) - (et==='Half Day'?0.5:0);
    document.getElementById('lv-days').value = d.toFixed(1);
  }
}
['lv-start','lv-end','lv-stype','lv-etype'].forEach(id=>
  document.getElementById(id).addEventListener('change',calcDays));

/* voice input (Web Speech API, graceful fallback) */
let recog=null;
function toggleMic(){
  const btn = document.getElementById('mic-btn');
  const reason = document.getElementById('lv-reason');
  if(!recog){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR){ toast('Voice input is not supported in this browser (demo)'); return; }
    recog = new SR(); recog.continuous = true; recog.interimResults = false; recog.lang = 'en-IN';
    recog.onresult = ev => { reason.value += (reason.value?' ':'') + ev.results[ev.results.length-1][0].transcript; };
    recog.onend = () => btn.classList.remove('rec');
  }
  if(btn.classList.contains('rec')){ recog.stop(); btn.classList.remove('rec'); }
  else { recog.start(); btn.classList.add('rec'); toast('Listening… speak now'); }
}

function showFiles(input){
  document.getElementById('file-list').innerHTML = [...input.files].map(f=>
    `<span class="badge online" style="margin:4px 6px 0 0">📎 ${f.name}</span>`).join('');
}

function submitLeave(){
  const cat = document.getElementById('lv-cat').value;
  const s = document.getElementById('lv-start').value, e = document.getElementById('lv-end').value;
  const reason = document.getElementById('lv-reason').value.trim();
  if(!cat)                 return toast('Please select a leave category');
  if(!s || !e)             return toast('Please select start and end dates');
  if(document.getElementById('lv-days').value==='0.0') return toast('End date must be on or after start date');
  if(!reason)              return toast('Please enter a reason for the leave');
  requests.unshift({ no:'LV-2026-0149', emp:ME.id, type:cat, start:s, end:e,
    days:parseFloat(document.getElementById('lv-days').value), status:'Pending', by:ME.name });
  renderReport();
  renderDash();
  renderBalances();
  toast('✅ Leave submitted — request LV-2026-0149 is now on your dashboard');
  showView('dashboard');
  showView('report');
}

/* ---------- Leave Report ---------- */
function renderReport(){
  const st = document.getElementById('rp-status').value;
  const tp = document.getElementById('rp-type').value;
  const rows = visibleRequests.filter(r=>(!st||r.status===st)&&(!tp||r.type===tp));
  document.getElementById('report-table').innerHTML = rows.length ? rows.map(r=>`
    <tr>
      <td data-label="Request No" class="emp-id">${r.no}</td>
      <td data-label="Requested For"><span class="avatar">${initials(empName(r.emp))}</span>${empName(r.emp)}</td>
      <td data-label="Leave Type">${badgeLv(r.type)}</td>
      <td data-label="Start Date">${fmt(r.start)}</td><td data-label="End Date">${fmt(r.end)}</td>
      <td data-label="No of Days"><strong>${r.days}</strong></td>
      <td data-label="Status">${badge(r.status)}</td><td data-label="Requested By">${r.by}</td>
    </tr>`).join('') : `<tr><td colspan="8" class="no-label" style="text-align:center;color:var(--muted);padding:28px">No requests found for the selected filters.</td></tr>`;
}

/* ---------- Employee modal ---------- */
function openModal(){ document.getElementById('emp-modal').classList.add('open'); }
function closeModal(){ document.getElementById('emp-modal').classList.remove('open'); }
function saveEmployee(){ closeModal(); toast('✅ Employee saved — Employee Number auto-generated'); }
document.getElementById('emp-modal').addEventListener('click',e=>{
  if(e.target===e.currentTarget) closeModal();
});

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3200);
}

/* ---------- "Add Employee" modal: auto next number ---------- */
document.querySelector('#emp-modal input[readonly]').value = pad(EMPLOYEES.length + 1);

/* ---------- Leave side card collapse (details hide upward) ---------- */
function toggleSideCard(){
  document.getElementById('side-card').classList.toggle('collapsed');
}

/* ---------- Role-based access: only managers see Employee Master ---------- */
if(session.role !== 'manager'){
  document.querySelector('.sb-link[data-view="employee"]').style.display = 'none';
}

/* init */
renderEmployees();
renderReport();
renderDash();
renderBalances();
