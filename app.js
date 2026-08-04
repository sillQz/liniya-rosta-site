const DB_KEY = "liniya-rosta-db-v2";
const SESSION_KEY = "liniya-rosta-current-user";
const ADMIN_ID = "admin-nikita-monastyrev";
const DB_VERSION = 4;
const CLOUD_API = "https://api.keyval.org";
const CLOUD_PREFIX = "liniya-rosta-2026-8f7ad9c1";
const ADMIN_PIN = "1003";
const LEGACY_TEST_IDS = ["test-strong-call","test-tariffs","test-objections"];
const COMPETENCY_OPTIONS = ["Контакт","Потребность","Слушание","Диалог","Речь","Возражения","Аргументация","Завершение","Тарифы","Общие знания"];

const employeeNav = [["⌂","Главная"],["▰","Курсы"],["✓","Тесты"],["□","Задания"],["★","Рейтинг"]];
const adminNav = [["⌂","Обзор"],["▰","Сотрудники"],["✓","Тесты"],["□","Курсы"],["★","Настройки"]];

const courses = [
  { id:"strong-call", number:"01", icon:"☎", title:"Сильный звонок", category:"Продажи", lessons:8, description:"Структура результативного разговора: от контакта до заявки." },
  { id:"objections", number:"02", icon:"!", title:"Работа с возражениями", category:"Практика", lessons:6, description:"Спокойные и уверенные ответы на самые частые сомнения клиентов." },
  { id:"mts-products", number:"03", icon:"◆", title:"Продукты и тарифы", category:"Продукт", lessons:10, description:"Интернет, ТВ, мобильная связь и подбор решения под задачу клиента." },
];

const assignments = [
  { id:"audio-call", title:"Записать учебный звонок", category:"Практика", points:120, deadline:"Сегодня" },
  { id:"script-review", title:"Разобрать пять реплик скрипта", category:"Скрипты", points:80, deadline:"До пятницы" },
  { id:"objection-card", title:"Составить карточку возражений", category:"Продажи", points:100, deadline:"До 12 августа" },
];

const seedTests = [
  {
    id:"test-dialogue-competencies", title:"Демо: компетенции, тарифы и ведение диалога", category:"Компетенции", description:"Комплексная проверка контакта, выявления потребности, знания тарифов, аргументации и завершения разговора.", published:true,
    questions:[
      { competency:"Контакт", text:"Какова главная задача первых секунд разговора?", options:["Сразу назвать цену","Установить контакт и обозначить цель","Перечислить все продукты"], correct:1 },
      { competency:"Потребность", text:"Какой вопрос лучше помогает выявить потребность клиента?", options:["Вам всё понятно?","Как вы сейчас решаете эту задачу?","Вы точно хотите подключение?"], correct:1 },
      { competency:"Слушание", text:"Что показывает навык активного слушания?", options:["Оператор уточняет и кратко резюмирует ответ","Оператор говорит без пауз","Оператор повторяет скрипт дословно"], correct:0 },
      { competency:"Возражения", text:"Клиент говорит: «Это дорого». Как лучше продолжить?", options:["Сразу предложить максимальную скидку","Возразить клиенту","Признать сомнение и уточнить, с чем он сравнивает"], correct:2 },
      { competency:"Речь", text:"Какой стиль речи усиливает доверие?", options:["Спокойный темп и ясные формулировки","Очень быстрая речь","Давление и категоричность"], correct:0 },
      { competency:"Диалог", text:"Что делать, если клиент начал подробно рассказывать о ситуации?", options:["Перебить и вернуться к скрипту","Выслушать, выделить главное и задать уточнение","Сразу завершить звонок"], correct:1 },
      { competency:"Аргументация", text:"Как правильно презентовать решение?", options:["Связать выгоды с озвученной потребностью","Назвать все характеристики подряд","Говорить только о компании"], correct:0 },
      { competency:"Завершение", text:"Чем лучше завершить результативный диалог?", options:["Фразой «подумайте»","Повторным приветствием","Конкретным согласованным следующим шагом"], correct:2 },
      { competency:"Тарифы", text:"Что нужно выяснить перед подбором тарифа?", options:["Только возраст клиента","Сценарии использования, объём услуг и бюджет","Любимый способ оплаты"], correct:1 },
      { competency:"Тарифы", text:"Как лучше объяснить стоимость тарифа?", options:["Назвать цену без пояснений","Сравнить клиента с другими","Связать стоимость с нужными клиенту выгодами и экономией"], correct:2 },
    ],
  },
];

let db = loadDb();
let currentUserId = localStorage.getItem(SESSION_KEY) || "";
let activeSection = "";
let toastTimer = null;
let testSession = null;
let selectedAnswer = null;
let editorDraft = null;
let pendingDeleteTestId = null;
let adminPin = sessionStorage.getItem("liniya-rosta-admin-pin") || "";
let cloudSyncTimer = null;
let cloudOnline = false;

function uid(prefix="id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

function adminUser() {
  return { id:ADMIN_ID, firstName:"Никита", lastName:"Монастырёв", role:"admin", adminId:ADMIN_ID, createdAt:new Date().toISOString(), xp:0, streak:0, courseProgress:{}, assignments:{} };
}

function defaultDb() {
  return { version:DB_VERSION, users:[adminUser()], tests:JSON.parse(JSON.stringify(seedTests)), attempts:[] };
}

function loadDb() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || "null");
    if (!parsed) return defaultDb();
    if (parsed.version === 2 || parsed.version === 3) {
      const builtInIds=[...LEGACY_TEST_IDS,"test-dialogue-competencies"];
      const customTests=(parsed.tests||[]).filter((test)=>!builtInIds.includes(test.id));
      parsed.tests=[...JSON.parse(JSON.stringify(seedTests)),...customTests];
      parsed.version=DB_VERSION;
      localStorage.setItem(DB_KEY,JSON.stringify(parsed));
    }
    if (parsed.version !== DB_VERSION) return defaultDb();
    if (!parsed.users.some((user) => user.id === ADMIN_ID)) parsed.users.unshift(adminUser());
    return parsed;
  } catch { return defaultDb(); }
}

function saveDb(sync=true) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  if(sync) queueCloudSync();
}

function currentUser() {
  return db.users.find((user) => user.id === currentUserId) || null;
}

function isAdminName(firstName, lastName) {
  const value = `${firstName} ${lastName}`.toLocaleLowerCase("ru-RU").replaceAll("ё","е").replace(/\s+/g," ").trim();
  return value === "никита монастырев" || value === "монастырев никита";
}

function normalizeName(value) {
  return value.toLocaleLowerCase("ru-RU").replaceAll("ё","е").replace(/\s+/g," ").trim();
}

function initials(user) {
  return `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();
}

function fullName(user) {
  return `${user.firstName} ${user.lastName}`;
}

function questionLabel(count) {
  const lastTwo=count%100; const last=count%10;
  const word=lastTwo>=11&&lastTwo<=14?"вопросов":last===1?"вопрос":last>=2&&last<=4?"вопроса":"вопросов";
  return `${count} ${word}`;
}

function escapeHtml(value="") {
  return String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

async function keyValueRequest(path,body) {
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000);
  let response;
  try { response=await fetch(`${CLOUD_API}/${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:controller.signal}); }
  finally { clearTimeout(timeout); }
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.status!=="SUCCESS")throw new Error("Общая база временно недоступна");
  return data;
}

function encodeCloudDb(value) {
  const bytes=new TextEncoder().encode(JSON.stringify(value)); let binary="";
  for(let index=0;index<bytes.length;index+=8192)binary+=String.fromCharCode(...bytes.subarray(index,index+8192));
  return btoa(binary);
}

function decodeCloudDb(value) {
  const binary=atob(value); const bytes=new Uint8Array(binary.length);
  for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function emptyCloudDb() {
  return {version:DB_VERSION,users:[],tests:JSON.parse(JSON.stringify(seedTests)),attempts:[]};
}

async function readCloudDb() {
  const manifest=await keyValueRequest("get",{key:`${CLOUD_PREFIX}-manifest`}).catch(()=>null);
  if(!manifest?.val||!String(manifest.val).includes(":"))return emptyCloudDb();
  const [revision,countText]=String(manifest.val).split(":"); const count=Number(countText);
  if(!revision||!Number.isInteger(count)||count<1||count>1000)return emptyCloudDb();
  const chunks=await Promise.all(Array.from({length:count},(_,index)=>keyValueRequest("get",{key:`${CLOUD_PREFIX}-${revision}-${index}`})));
  const parsed=decodeCloudDb(chunks.map((item)=>item.val||"").join(""));
  const tests=new Map(seedTests.map((test)=>[test.id,JSON.parse(JSON.stringify(test))]));
  (Array.isArray(parsed.tests)?parsed.tests:[]).forEach((test)=>tests.set(test.id,test));
  return {version:DB_VERSION,users:Array.isArray(parsed.users)?parsed.users:[],tests:[...tests.values()],attempts:Array.isArray(parsed.attempts)?parsed.attempts:[]};
}

async function writeCloudDb(value) {
  const stored={...value,tests:(value.tests||[]).filter((test)=>test.id!==seedTests[0].id||JSON.stringify(test)!==JSON.stringify(seedTests[0]))};
  const encoded=encodeCloudDb(stored); const chunks=encoded.match(/.{1,280}/g)||[""]; const revision=`${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
  for(let index=0;index<chunks.length;index++)await keyValueRequest("set",{key:`${CLOUD_PREFIX}-${revision}-${index}`,val:chunks[index]});
  await keyValueRequest("set",{key:`${CLOUD_PREFIX}-manifest`,val:`${revision}:${chunks.length}`});
}

function publicCloudSnapshot(remote,userId="") {
  const leaderboard=remote.users.filter((user)=>user.role!=="admin").map((user)=>({id:user.id,firstName:user.firstName,lastName:user.lastName,xp:user.xp||0}));
  return {tests:remote.tests,leaderboard,attempts:userId?remote.attempts.filter((attempt)=>attempt.userId===userId):[]};
}

async function cloudRequest(payload) {
  let remote=await readCloudDb();
  if(payload.action==="bootstrap") {
    cloudOnline=true; setCloudStatus("Общая база подключена",true); return publicCloudSnapshot(remote);
  }
  if(payload.action==="login"&&isAdminName(payload.firstName,payload.lastName)) {
    if(String(payload.pin)!==ADMIN_PIN)throw new Error("Неверный PIN администратора");
    cloudOnline=true; setCloudStatus("Общая база подключена",true); return {admin:true,db:remote};
  }
  if(payload.action==="login") {
    const key=normalizeName(`${payload.firstName||""} ${payload.lastName||""}`); let user=remote.users.find((item)=>item.role!=="admin"&&normalizeName(fullName(item))===key);
    const local=payload.localUser&&normalizeName(fullName(payload.localUser))===key?payload.localUser:null;
    user={...(local||{}),...(user||{}),id:user?.id||local?.id||uid("user"),firstName:String(payload.firstName||"").trim(),lastName:String(payload.lastName||"").trim(),role:"employee",adminId:ADMIN_ID,lastActive:new Date().toISOString(),createdAt:user?.createdAt||local?.createdAt||new Date().toISOString(),xp:user?.xp||local?.xp||0,streak:user?.streak||local?.streak||1,courseProgress:{...(local?.courseProgress||{}),...(user?.courseProgress||{})},assignments:{...(local?.assignments||{}),...(user?.assignments||{})}};
    remote.users=remote.users.filter((item)=>item.id!==user.id&&normalizeName(fullName(item))!==key); remote.users.push(user);
    const attempts=new Map(remote.attempts.map((attempt)=>[attempt.id,attempt])); (payload.attempts||[]).forEach((attempt)=>attempts.set(attempt.id,{...attempt,userId:user.id})); remote.attempts=[...attempts.values()];
    await writeCloudDb(remote); cloudOnline=true; setCloudStatus("Общая база подключена",true); return {user,...publicCloudSnapshot(remote,user.id)};
  }
  if(payload.action==="save") {
    const user=payload.user; const key=normalizeName(fullName(user)); remote.users=remote.users.filter((item)=>item.id!==user.id&&normalizeName(fullName(item))!==key); remote.users.push(user);
    const attempts=new Map(remote.attempts.map((attempt)=>[attempt.id,attempt])); (payload.attempts||[]).forEach((attempt)=>attempts.set(attempt.id,attempt)); remote.attempts=[...attempts.values()];
    await writeCloudDb(remote); cloudOnline=true; setCloudStatus("Общая база подключена",true); return {user,...publicCloudSnapshot(remote,user.id)};
  }
  if(payload.action==="adminSync") {
    if(String(payload.pin)!==ADMIN_PIN)throw new Error("Неверный PIN администратора");
    remote=mergeAdminDatabases(remote,{users:payload.users||[],tests:payload.tests||[],attempts:payload.attempts||[]}); await writeCloudDb(remote); cloudOnline=true; setCloudStatus("Общая база подключена",true); return {admin:true,db:remote};
  }
  if(payload.action==="deleteTest") {
    if(String(payload.pin)!==ADMIN_PIN)throw new Error("Неверный PIN администратора");
    remote.tests=remote.tests.filter((test)=>test.id!==payload.testId); await writeCloudDb(remote); cloudOnline=true; setCloudStatus("Общая база подключена",true); return {admin:true,db:remote};
  }
  throw new Error("Неизвестная операция синхронизации");
}

function setCloudStatus(message,online=false) {
  const status=document.getElementById("cloud-status");
  if(!status)return;
  status.classList.toggle("online",online);
  status.querySelector("span").textContent=message;
}

function mergeTests(remoteTests=[]) {
  const merged=new Map(db.tests.map((test)=>[test.id,test]));
  remoteTests.forEach((test)=>merged.set(test.id,test));
  if(!merged.has(seedTests[0].id))merged.set(seedTests[0].id,JSON.parse(JSON.stringify(seedTests[0])));
  db.tests=[...merged.values()];
}

function mergeLeaderboard(leaderboard=[]) {
  leaderboard.forEach((summary)=>{
    const existing=db.users.find((user)=>user.id===summary.id||normalizeName(fullName(user))===normalizeName(`${summary.firstName} ${summary.lastName}`));
    if(existing)Object.assign(existing,summary);
    else db.users.push({...summary,role:"employee",adminId:ADMIN_ID,createdAt:new Date().toISOString(),courseProgress:{},assignments:{}});
  });
}

function applyCloudDb(remote) {
  if(!remote)return;
  db={version:DB_VERSION,users:Array.isArray(remote.users)?remote.users:[],tests:Array.isArray(remote.tests)?remote.tests:[],attempts:Array.isArray(remote.attempts)?remote.attempts:[]};
  if(!db.users.some((user)=>user.id===ADMIN_ID))db.users.unshift(adminUser());
  if(!db.tests.length)db.tests=JSON.parse(JSON.stringify(seedTests));
  saveDb(false);
}

function mergeAdminDatabases(local,remote) {
  const users=new Map();
  (local.users||[]).forEach((user)=>users.set(normalizeName(fullName(user)),JSON.parse(JSON.stringify(user))));
  (remote.users||[]).forEach((user)=>{
    const key=normalizeName(fullName(user)); const previous=users.get(key)||{};
    users.set(key,{...previous,...user,courseProgress:{...(previous.courseProgress||{}),...(user.courseProgress||{})},assignments:{...(previous.assignments||{}),...(user.assignments||{})}});
  });
  const tests=new Map((local.tests||[]).map((test)=>[test.id,test]));
  (remote.tests||[]).forEach((test)=>tests.set(test.id,test));
  if(!tests.has(seedTests[0].id))tests.set(seedTests[0].id,JSON.parse(JSON.stringify(seedTests[0])));
  const attempts=new Map((local.attempts||[]).map((attempt)=>[attempt.id,attempt]));
  (remote.attempts||[]).forEach((attempt)=>attempts.set(attempt.id,attempt));
  return {version:DB_VERSION,users:[...users.values()],tests:[...tests.values()],attempts:[...attempts.values()]};
}

function queueCloudSync() {
  if(!currentUserId)return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer=setTimeout(syncCurrentState,450);
}

async function syncCurrentState() {
  const user=currentUser(); if(!user)return;
  try {
    if(user.role==="admin"&&adminPin) {
      const result=await cloudRequest({action:"adminSync",pin:adminPin,users:db.users,tests:db.tests,attempts:db.attempts});
      applyCloudDb(result.db);
    } else if(user.role!=="admin") {
      const result=await cloudRequest({action:"save",user,attempts:db.attempts.filter((attempt)=>attempt.userId===user.id)});
      mergeTests(result.tests); mergeLeaderboard(result.leaderboard);
      db.attempts=[...db.attempts.filter((attempt)=>attempt.userId!==user.id),...(result.attempts||[])];
      saveDb(false);
    }
  } catch { cloudOnline=false; setCloudStatus("Работаем локально — синхронизация повторится позже"); }
}

function localLogin(firstName,lastName) {
  if (isAdminName(firstName,lastName)) currentUserId = ADMIN_ID;
  else {
    const key = normalizeName(`${firstName} ${lastName}`);
    let user = db.users.find((item) => item.role !== "admin" && normalizeName(fullName(item)) === key);
    if (!user) {
      user = { id:uid("user"), firstName:firstName.trim(), lastName:lastName.trim(), role:"employee", adminId:ADMIN_ID, createdAt:new Date().toISOString(), lastActive:new Date().toISOString(), xp:0, streak:1, courseProgress:{}, assignments:{} };
      db.users.push(user); saveDb();
    }
    currentUserId = user.id;
  }
  localStorage.setItem(SESSION_KEY,currentUserId);
  activeSection = currentUser().role === "admin" ? "Обзор" : "Главная";
  showApp();
}

async function login(firstName,lastName,pin="") {
  const adminEntry=isAdminName(firstName,lastName);
  const key=normalizeName(`${firstName} ${lastName}`);
  const localUser=db.users.find((user)=>normalizeName(fullName(user))===key);
  const button=document.querySelector('#auth-form button[type="submit"]');
  button.disabled=true; button.innerHTML="Подключаем профиль…";
  try {
    const result=await cloudRequest({action:"login",firstName,lastName,pin,localUser,attempts:localUser?db.attempts.filter((attempt)=>attempt.userId===localUser.id):[]});
    if(adminEntry) {
      adminPin=pin; sessionStorage.setItem("liniya-rosta-admin-pin",pin);
      db=mergeAdminDatabases(db,result.db||{});
      await writeCloudDb(db); setCloudStatus("Общая база подключена",true);
      applyCloudDb(db); currentUserId=ADMIN_ID;
    } else {
      const existingIndex=db.users.findIndex((user)=>user.id===result.user.id||normalizeName(fullName(user))===key);
      if(existingIndex>=0)db.users[existingIndex]=result.user;else db.users.push(result.user);
      currentUserId=result.user.id; mergeTests(result.tests); mergeLeaderboard(result.leaderboard);
      db.attempts=[...db.attempts.filter((attempt)=>attempt.userId!==currentUserId),...(result.attempts||[])];
      saveDb(false);
    }
    localStorage.setItem(SESSION_KEY,currentUserId);
    activeSection=currentUser().role==="admin"?"Обзор":"Главная"; showApp();
  } catch(error) {
    if(adminEntry) {
      if(pin===ADMIN_PIN){cloudOnline=false;setCloudStatus("Работаем локально — синхронизация повторится позже");adminPin=pin;sessionStorage.setItem("liniya-rosta-admin-pin",pin);localLogin(firstName,lastName);notify("Админка открыта локально. Синхронизация повторится автоматически.");}
      else{setCloudStatus(error.message||"Не удалось открыть админку");const pinInput=document.querySelector('input[name="adminPin"]');pinInput.focus();}
    } else {
      localLogin(firstName,lastName); notify("Профиль открыт локально. Синхронизация повторится автоматически.");
    }
  } finally {
    button.disabled=false; button.innerHTML='Открыть мой кабинет <span>→</span>';
  }
}

function showAuth() {
  document.getElementById("auth-screen").classList.remove("is-hidden");
  document.getElementById("app-shell").classList.add("is-hidden");
  document.getElementById("auth-form").reset();
  document.getElementById("admin-pin-field").classList.add("is-hidden");
  document.querySelector('#auth-form input[name="firstName"]').focus();
}

function showApp() {
  const user = currentUser();
  if (!user) { showAuth(); return; }
  document.getElementById("auth-screen").classList.add("is-hidden");
  document.getElementById("app-shell").classList.remove("is-hidden");
  document.getElementById("profile-name").textContent = fullName(user);
  document.getElementById("profile-avatar").textContent = initials(user);
  document.getElementById("profile-role").textContent = user.role === "admin" ? "Администратор" : "Сотрудник";
  if (!activeSection) activeSection = user.role === "admin" ? "Обзор" : "Главная";
  renderNav(); renderSection();
}

function renderNav() {
  const user = currentUser();
  const items = user.role === "admin" ? adminNav : employeeNav;
  document.getElementById("sidebar-nav").innerHTML = items.map(([icon,label]) => `<button data-nav="${label}" class="${activeSection === label ? "active" : ""}"><span class="ui-icon">${icon}</span><span>${label}</span></button>`).join("");
}

function renderSection() {
  const user = currentUser();
  const dashboard = document.getElementById("dashboard");
  if (user.role === "admin") {
    const views = {"Обзор":adminOverview,"Сотрудники":adminEmployees,"Тесты":adminTests,"Курсы":adminCourses,"Настройки":adminSettings};
    dashboard.innerHTML = (views[activeSection] || adminOverview)();
  } else {
    const views = {"Главная":employeeHome,"Курсы":employeeCourses,"Тесты":employeeTests,"Задания":employeeAssignments,"Рейтинг":employeeRanking};
    dashboard.innerHTML = (views[activeSection] || employeeHome)();
  }
}

function userMetrics(user) {
  const attempts = db.attempts.filter((attempt) => attempt.userId === user.id);
  const avg = attempts.length ? Math.round(attempts.reduce((sum,item) => sum + item.score,0) / attempts.length) : 0;
  const courseValues = Object.values(user.courseProgress || {});
  const courseAvg = courseValues.length ? Math.round(courseValues.reduce((a,b)=>a+b,0)/courseValues.length) : 0;
  const completedAssignments = Object.values(user.assignments || {}).filter(Boolean).length;
  const skill = Math.min(100, Math.round((avg * .6) + (courseAvg * .25) + (completedAssignments * 5)));
  return { attempts, avg, courseAvg, completedAssignments, skill, xp:user.xp || 0, streak:user.streak || 1 };
}

const competencyGroups = [
  ["Контакт",["Контакт"]],
  ["Выявление потребности",["Потребность","Слушание"]],
  ["Ведение диалога",["Диалог","Речь"]],
  ["Работа с возражениями",["Возражения"]],
  ["Аргументация",["Аргументация","Завершение"]],
  ["Знание тарифа",["Тарифы"]],
];

function userCompetencies(user) {
  const raw={};
  db.attempts.filter((attempt)=>attempt.userId===user.id&&Array.isArray(attempt.answers)).forEach((attempt)=>{
    const test=testById(attempt.testId); if(!test)return;
    test.questions.forEach((question,index)=>{
      const name=question.competency||"Общие знания";
      raw[name]=raw[name]||{correct:0,total:0}; raw[name].total++;
      if(attempt.answers[index]===question.correct)raw[name].correct++;
    });
  });
  return competencyGroups.map(([label,names])=>{
    const totals=names.reduce((acc,name)=>({correct:acc.correct+(raw[name]?.correct||0),total:acc.total+(raw[name]?.total||0)}),{correct:0,total:0});
    return {label,value:totals.total?Math.round(totals.correct/totals.total*100):0,total:totals.total};
  });
}

function competencyBars(user,compact=false) {
  return `<div class="competency-bars ${compact?"compact":""}">${userCompetencies(user).map((item)=>`<div><span><b>${item.label}</b><em>${item.total?`${item.value}%`:"нет данных"}</em></span><i><u style="width:${item.value}%"></u></i></div>`).join("")}</div>`;
}

function activityBars(user) {
  const attempts=db.attempts.filter((attempt)=>attempt.userId===user.id).sort((a,b)=>a.date.localeCompare(b.date)).slice(-8);
  if(!attempts.length)return '<div class="chart-empty">График появится после первого теста</div>';
  return `<div class="activity-chart">${attempts.map((attempt,index)=>`<div><i style="height:${Math.max(8,attempt.score)}%"><b>${attempt.score}%</b></i><small>${index+1}</small></div>`).join("")}</div>`;
}

function teamCompetencies(employees) {
  return competencyGroups.map(([label],index)=>{
    const values=employees.map((user)=>userCompetencies(user)[index]).filter((item)=>item.total).map((item)=>item.value);
    return {label,value:values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0};
  });
}

function scoreBars(items) {
  return `<div class="competency-bars compact">${items.map((item)=>`<div><span><b>${item.label}</b><em>${item.value}%</em></span><i><u style="width:${item.value}%"></u></i></div>`).join("")}</div>`;
}

function teamActivityBars(attempts) {
  const recent=attempts.slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(-12);
  if(!recent.length)return '<div class="chart-empty">Активность появится после первого прохождения</div>';
  return `<div class="activity-chart team">${recent.map((attempt,index)=>`<div><i style="height:${Math.max(8,attempt.score)}%"><b>${attempt.score}%</b></i><small>${index+1}</small></div>`).join("")}</div>`;
}

function metric(icon,value,label,note,positive=false) {
  return `<article class="metric-card panel"><span class="metric-icon">${icon}</span><div><strong>${value}</strong><b>${label}</b><small class="${positive?"positive":""}">${positive?"↗ ":""}${note}</small></div></article>`;
}

function pageIntro(kicker,title,description,action="") {
  return `<div class="page-intro"><div><span>${kicker}</span><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

function footer() {
  return `<footer class="site-footer"><span>Линия роста · обучение и практика в одном пространстве</span><span class="local-badge">✓ Данные сохранены</span></footer>`;
}

function employeeHome() {
  const user = currentUser(); const m = userMetrics(user);
  const lastAttempt = m.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  return `<div class="dashboard employee-view">
    ${pageIntro("Личный кабинет",`Добрый день, ${escapeHtml(user.firstName)}`,"Ваш персональный план, результаты и ближайшие задачи.",'<button class="search-button" data-nav="Тесты"><span class="ui-icon">⌕</span><span>Найти тест</span><kbd>Ctrl K</kbd></button>')}
    <section class="hero employee-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Демо-тест · Компетенции</div><h2>Знания превращаем<br><em>в уверенный результат.</em></h2><p>Проверьте навыки установления контакта, знания тарифа и ведения диалога.</p><div class="hero-actions"><button class="white-button" data-action="start-test" data-id="test-dialogue-competencies">Начать демо-тест <span>→</span></button><span>10 вопросов · 9 минут</span></div></div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="orbit orbit-two"></div><div class="phone"><span>●</span><b>☎</b></div><div class="floating-icon fi-one">✓</div><div class="floating-icon fi-two">↗</div></div><div class="hero-progress"><div class="progress-ring" style="--value:${Math.max(20,m.skill)*3.6}deg"><span><b>${m.skill}%</b><small>навык</small></span></div><p>Средний результат<br><b>${m.avg || "нет тестов"}${m.avg?"%":""}</b></p></div></section>
    <section class="metrics-grid">${metric("◆",m.xp,"баллов опыта",m.xp?"накоплено за обучение":"начните первый тест",m.xp>0)}${metric("✓",`${m.avg}%`,"средний тест",`${m.attempts.length} попыток`,m.avg>=70)}${metric("▰",`${m.courseAvg}%`,"прогресс курсов",`${Object.keys(user.courseProgress||{}).length} активных курсов`,m.courseAvg>0)}${metric("⚡",`${m.streak} дн.`,"серия активности",m.streak>1?"отличный ритм":"первый день")}</section>
    <section class="team-analysis-grid"><article class="panel analysis-card"><div class="panel-heading"><div><span>Мои навыки</span><h3>Компетенции</h3></div></div>${competencyBars(user,true)}</article><article class="panel analysis-card"><div class="panel-heading"><div><span>Моя динамика</span><h3>Последние результаты</h3></div></div>${activityBars(user)}</article></section>
    <div class="content-grid"><section class="panel learning-panel"><div class="panel-heading"><div><span>Быстрый доступ</span><h3>Продолжить обучение</h3></div><button data-nav="Курсы">Все курсы →</button></div><div class="quick-grid"><button class="quick-card" data-nav="Курсы"><span>01</span><div><small>Курс</small><b>Сильный звонок</b><em>${user.courseProgress?.["strong-call"] || 0}% пройдено</em></div><i>→</i></button><button class="quick-card" data-nav="Задания"><span>02</span><div><small>Практика</small><b>Учебный звонок</b><em>${user.assignments?.["audio-call"]?"выполнено":"сдать сегодня"}</em></div><i>→</i></button><button class="quick-card" data-nav="Тесты"><span>03</span><div><small>Демо-тест</small><b>Компетенции и тарифы</b><em>10 вопросов</em></div><i>→</i></button></div></section>
    <section class="panel skill-panel"><div class="panel-heading"><div><span>Последний результат</span><h3>${lastAttempt?escapeHtml(testById(lastAttempt.testId)?.title || "Тест"):"Начните обучение"}</h3></div></div>${lastAttempt?`<div class="result-orb ${lastAttempt.score>=70?"good":"warn"}"><strong>${lastAttempt.score}%</strong><small>${formatDate(lastAttempt.date)}</small></div><p class="result-copy">Правильных ответов: <b>${lastAttempt.correct} из ${lastAttempt.total}</b></p><button class="soft-button" data-action="start-test" data-id="${lastAttempt.testId}">Пройти ещё раз <span>→</span></button>`:`<div class="empty-state"><span class="empty-icon">✓</span><b>Здесь появятся результаты</b><p>Выберите тест и ответьте на вопросы.</p></div>`}</section></div>
    ${footer()}</div>`;
}

function employeeCourses() {
  const user=currentUser();
  return `<div class="dashboard">${pageIntro("Каталог обучения","Курсы","Изучайте материал в удобном темпе — прогресс сохраняется автоматически.")}
    <div class="catalog-grid">${courses.map((course)=>{const progress=user.courseProgress?.[course.id]||0;return `<article class="catalog-card panel"><span class="course-art large"><b>${course.number}</b><i>${course.icon}</i></span><div class="catalog-copy"><small>${course.category} · ${course.lessons} уроков</small><h3>${course.title}</h3><p>${course.description}</p><div class="catalog-progress"><span><i style="width:${progress}%"></i></span><b>${progress}%</b></div><button class="primary" data-action="advance-course" data-id="${course.id}">${progress?"Продолжить":"Начать курс"} <span>→</span></button></div></article>`}).join("")}</div>${footer()}</div>`;
}

function employeeTests() {
  const user=currentUser(); const attempts=db.attempts.filter((a)=>a.userId===user.id);
  return `<div class="dashboard">${pageIntro("Проверка знаний","Тесты","Проходите тесты, улучшайте результат и отслеживайте динамику.")}
    <div class="test-grid">${db.tests.filter((t)=>t.published).map((test)=>{const mine=attempts.filter((a)=>a.testId===test.id);const best=mine.length?Math.max(...mine.map((a)=>a.score)):null;return `<article class="test-card panel"><div class="test-card-top"><span class="test-icon">✓</span><span class="category-chip">${escapeHtml(test.category)}</span></div><h3>${escapeHtml(test.title)}</h3><p>${escapeHtml(test.description)}</p><div class="test-meta"><span>${questionLabel(test.questions.length)}</span><span>${best===null?"Не пройден":`Лучший: ${best}%`}</span></div><button class="primary full" data-action="start-test" data-id="${test.id}">${best===null?"Начать тест":"Пройти ещё раз"} <span>→</span></button></article>`}).join("")}</div>${footer()}</div>`;
}

function employeeAssignments() {
  const user=currentUser();
  return `<div class="dashboard">${pageIntro("Практика","Задания","Закрепляйте навыки в заданиях и получайте баллы опыта.")}
    <section class="panel assignment-panel"><div class="assignment-list">${assignments.map((item)=>{const done=!!user.assignments?.[item.id];return `<article class="assignment-row ${done?"done":""}"><span class="assignment-check">${done?"✓":""}</span><div><small>${item.category} · ${item.deadline}</small><h3>${item.title}</h3><p>Награда: ${item.points} XP</p></div><button class="${done?"soft-button":"primary"}" data-action="toggle-assignment" data-id="${item.id}">${done?"Выполнено":"Отметить выполненным"}</button></article>`}).join("")}</div></section>${footer()}</div>`;
}

function employeeRanking() {
  const employees=db.users.filter((u)=>u.role!=="admin").sort((a,b)=>(b.xp||0)-(a.xp||0));
  return `<div class="dashboard">${pageIntro("Командный результат","Рейтинг","Баллы начисляются за тесты, курсы и практические задания.")}
    <section class="panel ranking-panel"><div class="ranking-list">${employees.map((user,index)=>{const m=userMetrics(user);return `<article class="ranking-row ${user.id===currentUserId?"me":""}"><span class="rank-place">${index+1}</span><span class="table-avatar">${initials(user)}</span><div><b>${escapeHtml(fullName(user))}</b><small>${m.attempts.length} тестов · навык ${m.skill}</small></div><strong>${m.xp} XP</strong></article>`}).join("")}</div></section>${footer()}</div>`;
}

function adminOverview() {
  const employees=db.users.filter((u)=>u.role!=="admin");
  const attempts=db.attempts;
  const avg=attempts.length?Math.round(attempts.reduce((s,a)=>s+a.score,0)/attempts.length):0;
  const today=new Date().toISOString().slice(0,10);
  const activeToday=employees.filter((u)=>u.lastActive?.slice(0,10)===today).length;
  const passRate=attempts.length?Math.round(attempts.filter((a)=>a.score>=70).length/attempts.length*100):0;
  const courseAvg=employees.length?Math.round(employees.reduce((sum,user)=>sum+userMetrics(user).courseAvg,0)/employees.length):0;
  const completedAssignments=employees.reduce((sum,user)=>sum+userMetrics(user).completedAssignments,0);
  const teamXp=employees.reduce((sum,user)=>sum+(user.xp||0),0);
  return `<div class="dashboard organizer-view">${pageIntro("Центр управления","Панель руководителя","Сотрудники, обучение и результаты в одном кабинете.",'<button class="primary" data-nav="Тесты"><span>＋</span> Создать тест</button>')}
    <section class="hero organizer-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Единая команда</div><h2>Видеть прогресс.<br><em>Усиливать каждого.</em></h2><p>Открывайте профиль любого сотрудника, смотрите историю тестов и создавайте новые проверки знаний.</p><button class="white-button" data-nav="Сотрудники">Открыть сотрудников <span>→</span></button></div><div class="team-orbit" aria-hidden="true"><div class="leader">НМ<span>${employees.length}</span></div><div class="person p1">АК</div><div class="person p2">ИМ</div><div class="person p3">МЛ</div><div class="person p4">ДС</div><i class="ring r1"></i><i class="ring r2"></i></div></section>
    <section class="metrics-grid admin-metrics">${metric("●",employees.length,"сотрудников",`${activeToday} активны сегодня`,employees.length>0)}${metric("◉",activeToday,"активны сегодня",employees.length?`${Math.round(activeToday/employees.length*100)}% команды`:"пока нет данных",activeToday>0)}${metric("✓",`${avg}%`,"средний результат",`${attempts.length} попыток`,avg>=70)}${metric("↑",`${passRate}%`,"успешных тестов","порог прохождения 70%",passRate>=70)}${metric("◎",attempts.length,"всего попыток","история прохождений",attempts.length>0)}${metric("▰",`${courseAvg}%`,"средний прогресс","по активным курсам",courseAvg>0)}${metric("□",completedAssignments,"заданий выполнено","практика команды",completedAssignments>0)}${metric("◆",teamXp,"XP команды",`${db.tests.filter(t=>t.published).length} тест опубликован`,teamXp>0)}</section>
    <section class="team-analysis-grid"><article class="panel analysis-card"><div class="panel-heading"><div><span>Карта навыков</span><h3>Компетенции команды</h3></div></div>${scoreBars(teamCompetencies(employees))}</article><article class="panel analysis-card"><div class="panel-heading"><div><span>Динамика</span><h3>Последние результаты</h3></div><button data-action="export-excel">Excel →</button></div>${teamActivityBars(attempts)}</article></section>
    <div class="content-grid organizer-grid"><section class="panel team-panel"><div class="panel-heading"><div><span>Последние профили</span><h3>Сотрудники</h3></div><button data-nav="Сотрудники">Вся команда →</button></div>${employees.length?employeeTable(employees.slice(-5).reverse()):'<div class="empty-state"><span class="empty-icon">◎</span><b>Пока нет сотрудников</b><p>Новый профиль появится здесь после входа по имени и фамилии.</p></div>'}</section><section class="panel funnel-panel"><div class="panel-heading"><div><span>Контент</span><h3>Быстрые действия</h3></div></div><div class="admin-actions"><button data-action="edit-test" data-id=""><span>＋</span><div><b>Создать тест</b><small>Добавить вопросы и ответы</small></div></button><button data-nav="Тесты"><span>✓</span><div><b>Редактировать тесты</b><small>${db.tests.length} материалов</small></div></button><button data-nav="Сотрудники"><span>●</span><div><b>Открыть аналитику</b><small>По каждому человеку</small></div></button><button data-action="export-excel"><span>⇩</span><div><b>Выгрузить в Excel</b><small>Сотрудники и результаты</small></div></button></div></section></div>${footer()}</div>`;
}

function employeeTable(users) {
  return `<div class="table-scroll"><table><thead><tr><th>Сотрудник</th><th>Навык</th><th>Тесты</th><th>Курсы</th><th>Опыт</th><th></th></tr></thead><tbody>${users.map((user)=>{const m=userMetrics(user);return `<tr><td><span class="table-avatar">${initials(user)}</span><span><b>${escapeHtml(fullName(user))}</b><small>${formatDate(user.createdAt)}</small></span></td><td><b>${m.skill}</b><small>/100</small></td><td><b>${m.avg}%</b><small>${m.attempts.length} попыток</small></td><td><b>${m.courseAvg}%</b></td><td class="up">${m.xp} XP</td><td><button data-action="user-detail" data-id="${user.id}">Открыть →</button></td></tr>`}).join("")}</tbody></table></div>`;
}

function adminEmployees() {
  const employees=db.users.filter((u)=>u.role!=="admin");
  return `<div class="dashboard">${pageIntro("Команда","Сотрудники","Открывайте профили и отслеживайте прогресс обучения каждого человека.")}
    <section class="panel directory-panel">${employees.length?employeeTable(employees):'<div class="empty-state"><span class="empty-icon">●</span><b>Список пока пуст</b><p>Попросите сотрудника открыть сайт и ввести имя и фамилию.</p></div>'}</section>${footer()}</div>`;
}

function adminTests() {
  return `<div class="dashboard">${pageIntro("Редактор знаний","Тесты","Создавайте вопросы, меняйте правильные ответы и запускайте тесты для команды.",'<button class="primary" data-action="edit-test" data-id=""><span>＋</span> Новый тест</button>')}
    <div class="admin-test-list">${db.tests.map((test)=>`<article class="admin-test-card panel"><span class="test-icon">✓</span><div class="admin-test-copy"><small>${escapeHtml(test.category)} · ${questionLabel(test.questions.length)}</small><h3>${escapeHtml(test.title)}</h3><p>${escapeHtml(test.description)}</p></div><span class="publish-chip ${test.published?"live":""}">${test.published?"Опубликован":"Черновик"}</span><div class="card-actions"><button data-action="preview-test" data-id="${test.id}">Просмотр</button><button data-action="edit-test" data-id="${test.id}">Редактировать</button><button class="danger-link" data-action="delete-test" data-id="${test.id}">Удалить</button></div></article>`).join("")}</div>${footer()}</div>`;
}

function adminCourses() {
  return `<div class="dashboard">${pageIntro("Учебная программа","Курсы","Обзор материалов, доступных всей команде.")}
    <div class="catalog-grid">${courses.map((course)=>`<article class="catalog-card panel"><span class="course-art large"><b>${course.number}</b><i>${course.icon}</i></span><div class="catalog-copy"><small>${course.category} · ${course.lessons} уроков</small><h3>${course.title}</h3><p>${course.description}</p><button class="soft-button" data-notify="Редактор курсов будет добавлен следующим этапом">Настроить курс <span>→</span></button></div></article>`).join("")}</div>${footer()}</div>`;
}

function adminSettings() {
  return `<div class="dashboard">${pageIntro("Управление","Настройки","Общая база, резервные копии и выгрузка отчётов.")}
    <div class="settings-grid"><section class="panel settings-card"><span class="metric-icon">НМ</span><div><small>Главный администратор</small><h3>Никита Монастырёв</h3><p>Полная аналитика защищена PIN-кодом администратора.</p></div></section><section class="panel settings-card"><span class="metric-icon">X</span><div><small>Отчёт</small><h3>Выгрузка в Excel</h3><p>Сотрудники, компетенции, прогресс и история тестов в одном файле.</p><button class="soft-button" data-action="export-excel">Скачать Excel <span>→</span></button></div></section><section class="panel settings-card"><span class="metric-icon">☁</span><div><small>Хранение</small><h3>Общая база</h3><p>Профили и результаты синхронизируются между компьютерами и телефонами. IP не сохраняются.</p></div></section></div>${footer()}</div>`;
}

function testById(id) { return db.tests.find((test)=>test.id===id); }
function formatDate(value) { return new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value)); }

function openModal(html,wide=false) {
  document.getElementById("modal-content").innerHTML=html;
  document.getElementById("modal").classList.toggle("modal-wide",wide);
  document.getElementById("modal-backdrop").classList.add("is-open");
  document.body.style.overflow="hidden";
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.remove("is-open");
  document.body.style.overflow=""; testSession=null; selectedAnswer=null; editorDraft=null;
}

function notify(message) {
  const toast=document.getElementById("toast"); toast.querySelector("p").textContent=message; toast.classList.add("is-open"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("is-open"),2600);
}

function startTest(testId,preview=false) {
  const test=testById(testId); if(!test) return;
  testSession={testId,index:0,answers:[],preview}; selectedAnswer=null; renderTestQuestion();
}

function renderTestQuestion() {
  const test=testById(testSession.testId); const question=test.questions[testSession.index]; const progress=Math.round((testSession.index/test.questions.length)*100);
  openModal(`<div class="quiz-head"><div><div class="eyebrow">${escapeHtml(test.category)} · ${testSession.preview?"предпросмотр":"тест"}</div><h2 id="modal-title">${escapeHtml(test.title)}</h2></div><span>${testSession.index+1} / ${test.questions.length}</span></div><div class="quiz-progress"><i style="width:${progress}%"></i></div><div class="quiz-question"><small>Вопрос ${testSession.index+1}</small><h3>${escapeHtml(question.text)}</h3></div><div class="answers">${question.options.map((answer,index)=>`<button data-answer="${index}"><span>${String.fromCharCode(65+index)}</span>${escapeHtml(answer)}</button>`).join("")}</div><button class="primary full" data-action="next-question" disabled>${testSession.index===test.questions.length-1?"Завершить тест":"Следующий вопрос"} <span>→</span></button>`,true);
}

function finishTest() {
  const test=testById(testSession.testId); const correct=test.questions.filter((q,i)=>q.correct===testSession.answers[i]).length; const score=Math.round(correct/test.questions.length*100); const preview=testSession.preview;
  if(!preview && currentUser().role!=="admin") {
    db.attempts.push({id:uid("attempt"),userId:currentUserId,testId:test.id,score,correct,total:test.questions.length,answers:[...testSession.answers],date:new Date().toISOString()});
    const user=currentUser(); user.xp=(user.xp||0)+score*2; user.streak=Math.max(1,user.streak||1); user.lastActive=new Date().toISOString(); saveDb();
  }
  testSession=null; selectedAnswer=null;
  openModal(`<div class="result-screen"><span class="result-badge ${score>=70?"success":"retry"}">${score>=70?"✓":"↗"}</span><div class="eyebrow">${preview?"Предпросмотр завершён":"Результат сохранён"}</div><h2 id="modal-title">${score}%</h2><h3>${score>=80?"Отличный результат!":score>=60?"Хорошая база":"Попробуйте ещё раз"}</h3><p>Правильных ответов: <b>${correct} из ${test.questions.length}</b>${preview?"":"<br>Результат добавлен в вашу аналитику."}</p><button class="primary full" data-action="close-and-render">Вернуться в кабинет <span>→</span></button></div>`);
}

function openTestEditor(testId="") {
  const existing=testId?testById(testId):null;
  editorDraft=existing?JSON.parse(JSON.stringify(existing)):{id:"",title:"",category:"Компетенции",description:"",published:true,questions:[{competency:"Контакт",text:"",options:["","",""],correct:0}]};
  openModal(`<form id="test-editor-form"><div class="editor-head"><div><div class="eyebrow">Конструктор тестов</div><h2 id="modal-title">${existing?"Редактировать":"Новый"} <em>тест</em></h2></div><label class="publish-toggle"><input type="checkbox" name="published" ${editorDraft.published?"checked":""}><span>Опубликовать</span></label></div><div class="form-grid"><label>Название<input name="title" required value="${escapeHtml(editorDraft.title)}" placeholder="Например, Сильный звонок"></label><label>Категория<select name="category">${["Компетенции","Продажи","Продукт","Практика","Скрипты"].map((c)=>`<option ${c===editorDraft.category?"selected":""}>${c}</option>`).join("")}</select></label></div><label>Описание<textarea name="description" rows="2" placeholder="Что проверяет этот тест">${escapeHtml(editorDraft.description)}</textarea></label><div class="question-editor-head"><div><small>Вопросы</small><b id="question-count">${editorDraft.questions.length}</b></div><button type="button" class="soft-button" data-action="add-question">＋ Добавить вопрос</button></div><div id="question-editor"></div><button class="primary full" type="submit">Сохранить тест <span>→</span></button></form>`,true);
  renderEditorQuestions();
}

function renderEditorQuestions() {
  const container=document.getElementById("question-editor"); if(!container||!editorDraft) return;
  document.getElementById("question-count").textContent=editorDraft.questions.length;
  container.innerHTML=editorDraft.questions.map((q,index)=>`<section class="question-block"><div class="question-block-head"><span>${String(index+1).padStart(2,"0")}</span><b>Вопрос ${index+1}</b>${editorDraft.questions.length>1?`<button type="button" data-action="remove-question" data-index="${index}">Удалить</button>`:""}</div><div class="form-grid"><label>Текст вопроса<input name="q${index}text" required value="${escapeHtml(q.text)}" placeholder="Введите вопрос"></label><label>Компетенция<select name="q${index}competency">${COMPETENCY_OPTIONS.map((name)=>`<option ${name===(q.competency||"Общие знания")?"selected":""}>${name}</option>`).join("")}</select></label></div><div class="option-grid">${q.options.map((option,oi)=>`<label>Ответ ${String.fromCharCode(65+oi)}<input name="q${index}a${oi}" required value="${escapeHtml(option)}" placeholder="Вариант ответа"></label>`).join("")}</div><label class="correct-select">Правильный ответ<select name="q${index}correct">${q.options.map((_,oi)=>`<option value="${oi}" ${oi===q.correct?"selected":""}>${String.fromCharCode(65+oi)}</option>`).join("")}</select></label></section>`).join("");
}

function syncEditorDraftFromForm() {
  const form=document.getElementById("test-editor-form");
  if(!form||!editorDraft)return;
  const data=new FormData(form);
  editorDraft.questions=editorDraft.questions.map((q,index)=>({
    competency:String(data.get(`q${index}competency`)??q.competency??"Общие знания"),
    text:String(data.get(`q${index}text`)??q.text),
    options:[0,1,2].map((oi)=>String(data.get(`q${index}a${oi}`)??q.options[oi])),
    correct:Number(data.get(`q${index}correct`)??q.correct)
  }));
}

function saveTestEditor(form) {
  const data=new FormData(form); const questions=editorDraft.questions.map((_,index)=>({competency:String(data.get(`q${index}competency`)||"Общие знания"),text:String(data.get(`q${index}text`)).trim(),options:[0,1,2].map((oi)=>String(data.get(`q${index}a${oi}`)).trim()),correct:Number(data.get(`q${index}correct`))}));
  if(questions.some((q)=>!q.text||q.options.some((a)=>!a))){notify("Заполните все вопросы и варианты ответов");return;}
  const saved={id:editorDraft.id||uid("test"),title:String(data.get("title")).trim(),category:String(data.get("category")),description:String(data.get("description")).trim(),published:data.get("published")==="on",questions,updatedAt:new Date().toISOString()};
  const index=db.tests.findIndex((test)=>test.id===saved.id); if(index>=0)db.tests[index]=saved;else db.tests.unshift(saved); saveDb(); closeModal(); renderSection(); notify(`Тест «${saved.title}» сохранён`);
}

function openUserDetail(userId) {
  const user=db.users.find((item)=>item.id===userId); if(!user)return;
  const m=userMetrics(user); const attempts=m.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const tariff=userCompetencies(user).find((item)=>item.label==="Знание тарифа")||{value:0,total:0};
  openModal(`<div class="user-detail-head"><span class="detail-avatar">${initials(user)}</span><div><div class="eyebrow">Профиль сотрудника</div><h2 id="modal-title">${escapeHtml(fullName(user))}</h2><p>Профиль создан ${formatDate(user.createdAt)} · последнее посещение ${formatDate(user.lastActive||user.createdAt)}</p></div></div>
    <div class="detail-metrics"><div><strong>${m.skill}</strong><small>общий навык</small></div><div><strong>${m.avg}%</strong><small>тесты</small></div><div><strong>${m.courseAvg}%</strong><small>курсы</small></div><div><strong>${m.xp}</strong><small>XP</small></div></div>
    <div class="employee-analysis-grid"><section class="detail-analysis"><div class="panel-heading"><div><span>Компетенции</span><h3>Карта навыков</h3></div></div>${competencyBars(user)}</section><section class="detail-analysis knowledge-card"><div><span class="knowledge-ring" style="--score:${tariff.value*3.6}deg"><b>${tariff.total?`${tariff.value}%`:"—"}</b><small>тарифы</small></span><h3>Знание тарифа</h3><p>${tariff.total?tariff.value>=80?"Уверенное знание продуктовых решений":tariff.value>=60?"Хорошая база, нужна практика":"Рекомендуется повторить продуктовый курс":"Показатель появится после демо-теста"}</p></div></section></div>
    <section class="detail-analysis activity-block"><div class="panel-heading"><div><span>Динамика</span><h3>Результаты по попыткам</h3></div></div>${activityBars(user)}</section>
    <div class="panel-heading detail-heading"><div><span>История</span><h3>Результаты тестов</h3></div></div>${attempts.length?`<div class="attempt-list">${attempts.map((a)=>`<div><span class="score-dot ${a.score>=70?"good":""}">${a.score}%</span><p><b>${escapeHtml(testById(a.testId)?.title||"Удалённый тест")}</b><small>${formatDate(a.date)} · ${a.correct} из ${a.total}</small></p></div>`).join("")}</div>`:'<div class="empty-state"><b>Тесты ещё не пройдены</b><p>Результаты появятся после первой попытки.</p></div>'}<button class="soft-button full" data-action="close-modal">Закрыть профиль</button>`,true);
}

function exportData() {
  const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=`liniya-rosta-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url); notify("Резервная копия скачана");
}

function xmlEscape(value="") {
  return String(value).replace(/[<>&'\"]/g,(char)=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[char]));
}

function excelSheet(name,headers,rows) {
  const cell=(value)=>`<Cell><Data ss:Type="${typeof value==="number"?"Number":"String"}">${xmlEscape(value)}</Data></Cell>`;
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table><Row>${headers.map(cell).join("")}</Row>${rows.map((row)=>`<Row>${row.map(cell).join("")}</Row>`).join("")}</Table></Worksheet>`;
}

function exportExcel() {
  const employees=db.users.filter((user)=>user.role!=="admin");
  const employeeHeaders=["Сотрудник","Дата регистрации","Последний вход","Общий навык","Средний тест","Прогресс курсов","XP",...competencyGroups.map(([label])=>label)];
  const employeeRows=employees.map((user)=>{const m=userMetrics(user);return [fullName(user),formatDate(user.createdAt),formatDate(user.lastActive||user.createdAt),m.skill,m.avg,m.courseAvg,m.xp,...userCompetencies(user).map((item)=>item.value)];});
  const attemptHeaders=["Сотрудник","Тест","Дата","Результат, %","Правильных","Всего вопросов"];
  const attemptRows=db.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date)).map((attempt)=>{const user=db.users.find((item)=>item.id===attempt.userId);return [user?fullName(user):"Удалённый профиль",testById(attempt.testId)?.title||"Удалённый тест",formatDate(attempt.date),attempt.score,attempt.correct,attempt.total];});
  const workbook=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${excelSheet("Сотрудники",employeeHeaders,employeeRows)}${excelSheet("Результаты тестов",attemptHeaders,attemptRows)}</Workbook>`;
  const blob=new Blob(["\ufeff",workbook],{type:"application/vnd.ms-excel"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=`liniya-rosta-report-${new Date().toISOString().slice(0,10)}.xls`; link.click(); URL.revokeObjectURL(url); notify("Отчёт Excel скачан");
}

document.addEventListener("click",async(event)=>{
  const nav=event.target.closest("[data-nav]");
  if(nav){activeSection=nav.dataset.nav;renderNav();renderSection();window.scrollTo({top:0,behavior:"smooth"});return;}
  const note=event.target.closest("[data-notify]"); if(note){notify(note.dataset.notify);return;}
  const answer=event.target.closest("[data-answer]"); if(answer){selectedAnswer=Number(answer.dataset.answer);document.querySelectorAll("[data-answer]").forEach((button)=>button.classList.toggle("selected",button===answer));document.querySelector('[data-action="next-question"]').disabled=false;return;}
  const target=event.target.closest("[data-action]"); if(!target)return; const action=target.dataset.action; const id=target.dataset.id||"";
  if(action==="home"){activeSection=currentUser().role==="admin"?"Обзор":"Главная";renderNav();renderSection();}
  if(action==="switch-user"){localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem("liniya-rosta-admin-pin");adminPin="";currentUserId="";activeSection="";showAuth();}
  if(action==="close-modal")closeModal();
  if(action==="close-and-render"){closeModal();renderSection();}
  if(action==="start-test")startTest(id,false);
  if(action==="preview-test")startTest(id,true);
  if(action==="next-question"){testSession.answers[testSession.index]=selectedAnswer;if(testSession.index===testById(testSession.testId).questions.length-1)finishTest();else{testSession.index++;selectedAnswer=null;renderTestQuestion();}}
  if(action==="advance-course"){const user=currentUser();user.courseProgress=user.courseProgress||{};user.courseProgress[id]=Math.min(100,(user.courseProgress[id]||0)+15);user.xp=(user.xp||0)+30;user.lastActive=new Date().toISOString();saveDb();renderSection();notify(`Прогресс курса: ${user.courseProgress[id]}%`);}
  if(action==="toggle-assignment"){const user=currentUser();user.assignments=user.assignments||{};const was=!!user.assignments[id];user.assignments[id]=!was;const item=assignments.find((a)=>a.id===id);user.xp=Math.max(0,(user.xp||0)+(was?-item.points:item.points));saveDb();renderSection();notify(was?"Задание возвращено в работу":"Задание выполнено — XP начислены");}
  if(action==="edit-test")openTestEditor(id);
  if(action==="add-question"){syncEditorDraftFromForm();editorDraft.questions.push({competency:"Контакт",text:"",options:["","",""],correct:0});renderEditorQuestions();}
  if(action==="remove-question"){syncEditorDraftFromForm();const index=Number(target.dataset.index);editorDraft.questions.splice(index,1);renderEditorQuestions();}
  if(action==="delete-test"){pendingDeleteTestId=id;const test=testById(id);openModal(`<div class="confirm-screen"><span class="result-badge retry">!</span><div class="eyebrow">Подтверждение</div><h2 id="modal-title">Удалить тест?</h2><p>«${escapeHtml(test.title)}» исчезнет из каталога. Уже сохранённые результаты сотрудников останутся в истории.</p><div class="confirm-actions"><button class="soft-button" data-action="close-modal">Отмена</button><button class="primary" data-action="confirm-delete-test">Удалить</button></div></div>`);}
  if(action==="confirm-delete-test"){const deletedId=pendingDeleteTestId;db.tests=db.tests.filter((test)=>test.id!==deletedId);saveDb(false);if(adminPin){try{const result=await cloudRequest({action:"deleteTest",pin:adminPin,testId:deletedId});applyCloudDb(result.db);}catch{notify("Удалено локально, облако обновится позже");}}pendingDeleteTestId=null;closeModal();renderSection();notify("Тест удалён");}
  if(action==="user-detail")openUserDetail(id);
  if(action==="export-data")exportData();
  if(action==="export-excel")exportExcel();
});

document.addEventListener("submit",async(event)=>{
  if(event.target.id==="auth-form"){
    event.preventDefault();
    const data=new FormData(event.target);
    await login(String(data.get("firstName")),String(data.get("lastName")),String(data.get("adminPin")||""));
  }
  if(event.target.id==="test-editor-form"){event.preventDefault();saveTestEditor(event.target);}
});

document.getElementById("modal-backdrop").addEventListener("click",(event)=>{if(event.target.id==="modal-backdrop")closeModal();});
document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closeModal();if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();if(currentUser()?.role!=="admin"){activeSection="Тесты";renderNav();renderSection();}}});

const authForm=document.getElementById("auth-form");
authForm.addEventListener("input",()=>{
  const data=new FormData(authForm); const adminEntry=isAdminName(String(data.get("firstName")),String(data.get("lastName")));
  document.getElementById("admin-pin-field").classList.toggle("is-hidden",!adminEntry);
  authForm.elements.adminPin.required=adminEntry;
});

async function bootstrapCloud() {
  try {
    const result=await cloudRequest({action:"bootstrap"}); mergeTests(result.tests); mergeLeaderboard(result.leaderboard); saveDb(false);
    if(currentUserId&&currentUser()?.role!=="admin")syncCurrentState();
  } catch { cloudOnline=false; setCloudStatus("Общая база недоступна — можно продолжить локально"); }
}

if(currentUser()?.role==="admin"&&!adminPin){localStorage.removeItem(SESSION_KEY);currentUserId="";showAuth();}
else if(currentUser())showApp();else showAuth();
bootstrapCloud();
