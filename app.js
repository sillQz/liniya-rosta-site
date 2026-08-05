const DB_KEY = "liniya-rosta-db-v2";
const SESSION_KEY = "liniya-rosta-current-user";
const ADMIN_ID = "admin-nikita-monastyrev";
const DB_VERSION = 6;
const CLOUD_API = "https://xukynmdddmujrclzxidr.supabase.co/functions/v1/liniya-rosta-sync";
const CLOUD_TOKEN = "sb_publishable_aZlczYzhUYuQ9dyXEbZEgQ_KKPrLLU3";
const LEGACY_TEST_IDS = ["test-strong-call","test-tariffs","test-objections"];
const COMPETENCY_OPTIONS = ["Контакт","Потребность","Слушание","Диалог","Речь","Возражения","Аргументация","Завершение","Тарифы","Общие знания"];

const employeeNav = [["⌂","Главная"],["▰","Курсы"],["✓","Тесты"],["□","Задания"],["★","Рейтинг"]];
const adminNav = [["⌂","Обзор"],["▰","Сотрудники"],["✓","Тесты"],["□","Курсы"],["★","Настройки"]];

const demoLessons = [
  { id:"strong-call-contact", title:"Первые 20 секунд: устанавливаем контакт", duration:"7 мин", content:"Цель начала разговора — не продать услугу за одну фразу, а получить внимание и право продолжить диалог. Представьтесь, назовите компанию и коротко обозначьте пользу звонка.\n\nИспользуйте спокойный темп и одну понятную мысль: «Добрый день, меня зовут Анна, МТС. Звоню, чтобы подобрать более удобный вариант домашнего интернета и связи. Удобно две минуты?»", keyPoints:["Назовите себя и компанию","Обозначьте пользу звонка","Получите согласие на короткий разговор"], resourceUrl:"" },
  { id:"strong-call-needs", title:"Выявляем потребность вопросами", duration:"9 мин", content:"Сильный оператор не перечисляет все тарифы подряд. Сначала он понимает текущую ситуацию клиента. Начните с открытого вопроса, затем уточните детали и резюмируйте услышанное.\n\nПример: «Как сейчас пользуетесь интернетом дома?» → «Сколько устройств обычно подключено?» → «Правильно понимаю, важнее стабильность вечером и единый платёж?»", keyPoints:["Открытый вопрос запускает диалог","Уточняйте сценарий использования","Резюмируйте потребность словами клиента"], resourceUrl:"" },
  { id:"strong-call-offer", title:"Презентуем решение через выгоды", duration:"8 мин", content:"Связывайте каждое свойство тарифа с потребностью, которую клиент уже озвучил. Вместо списка характеристик покажите конкретный результат.\n\nФормула: потребность → решение → выгода → проверочный вопрос. Например: «Вы говорили, что вечером интернетом пользуется вся семья. Скорость 500 Мбит/с позволит одновременно смотреть ТВ и работать без зависаний. Такой вариант решит вашу задачу?»", keyPoints:["Не перегружайте характеристиками","Связывайте предложение с потребностью","Завершайте проверочным вопросом"], resourceUrl:"" },
  { id:"strong-call-close", title:"Фиксируем следующий шаг и заявку", duration:"6 мин", content:"Результативный диалог заканчивается конкретным действием. Коротко повторите согласованные условия, уточните данные и назовите следующий шаг.\n\nПример: «Тогда оформляем интернет и ТВ за указанную стоимость. Сейчас зафиксирую адрес и удобное время подключения, после чего придёт подтверждение заявки». Не оставляйте разговор на неопределённом «подумайте». ", keyPoints:["Повторите выбранное решение","Согласуйте точный следующий шаг","Зафиксируйте заявку и ожидания клиента"], resourceUrl:"" },
];

const seedCourses = [
  { id:"strong-call", number:"01", icon:"☎", title:"Сильный звонок", category:"Продажи", lessons:4, description:"Готовый демо-курс: структура результативного разговора от контакта до принятой заявки.", published:true, lessonItems:demoLessons },
  { id:"objections", number:"02", icon:"!", title:"Работа с возражениями", category:"Практика", lessons:6, description:"Спокойные и уверенные ответы на самые частые сомнения клиентов.", published:true, lessonItems:[] },
  { id:"mts-products", number:"03", icon:"◆", title:"Продукты и тарифы", category:"Продукт", lessons:10, description:"Интернет, ТВ, мобильная связь и подбор решения под задачу клиента.", published:true, lessonItems:[] },
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
let courseEditorDraft = null;
let pendingDeleteCourseId = null;
let pendingDeleteUserId = null;
let adminPin = sessionStorage.getItem("liniya-rosta-admin-pin") || "";
let cloudSyncTimer = null;
let cloudOnline = false;

function uid(prefix="id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

function adminUser() {
  return { id:ADMIN_ID, firstName:"Никита", lastName:"Монастырёв", role:"admin", adminId:ADMIN_ID, createdAt:new Date().toISOString(), xp:0, streak:0, courseProgress:{}, lessonProgress:{}, assignments:{}, dailyPlans:{}, dailyResults:{} };
}

function defaultDb() {
  return { version:DB_VERSION, users:[adminUser()], tests:JSON.parse(JSON.stringify(seedTests)), courses:JSON.parse(JSON.stringify(seedCourses)), attempts:[] };
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
    }
    if(parsed.version===4){parsed.courses=JSON.parse(JSON.stringify(seedCourses));parsed.version=5;}
    if(parsed.version===5){
      parsed.courses=(parsed.courses||[]).map((course)=>course.id==="strong-call"&&!Array.isArray(course.lessonItems)?{...course,lessons:demoLessons.length,lessonItems:JSON.parse(JSON.stringify(demoLessons))}:{...course,lessonItems:Array.isArray(course.lessonItems)?course.lessonItems:[]});
      (parsed.users||[]).forEach((user)=>{user.dailyPlans=user.dailyPlans||{};user.dailyResults=user.dailyResults||{};user.lessonProgress=user.lessonProgress||{};});
      parsed.version=DB_VERSION;
    }
    if (parsed.version !== DB_VERSION) return defaultDb();
    if(!Array.isArray(parsed.courses))parsed.courses=JSON.parse(JSON.stringify(seedCourses));
    if (!parsed.users.some((user) => user.id === ADMIN_ID)) parsed.users.unshift(adminUser());
    localStorage.setItem(DB_KEY,JSON.stringify(parsed));
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

function safeUrl(value="") {
  try { const url=new URL(String(value));return ["http:","https:"].includes(url.protocol)?url.href:""; } catch { return ""; }
}

async function cloudRequest(payload) {
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000);
  let response;
  try {
    response=await fetch(CLOUD_API,{
      method:"POST",
      headers:{"Content-Type":"application/json",apikey:CLOUD_TOKEN},
      body:JSON.stringify(payload),
      signal:controller.signal,
    });
  } finally { clearTimeout(timeout); }
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.ok!==true)throw new Error(data.error||"Общая база временно недоступна");
  cloudOnline=true; setCloudStatus("Общая база подключена",true);
  return data;
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

function mergeCourses(remoteCourses=[]) {
  if(Array.isArray(remoteCourses))db.courses=remoteCourses.map((course)=>JSON.parse(JSON.stringify(course)));
}

function mergeLeaderboard(leaderboard=[]) {
  leaderboard.forEach((summary)=>{
    const existing=db.users.find((user)=>user.id===summary.id||normalizeName(fullName(user))===normalizeName(`${summary.firstName} ${summary.lastName}`));
    if(existing)Object.assign(existing,summary);
    else db.users.push({...summary,role:"employee",adminId:ADMIN_ID,createdAt:new Date().toISOString(),courseProgress:{},lessonProgress:{},assignments:{},dailyPlans:{},dailyResults:{}});
  });
}

function applyCloudDb(remote) {
  if(!remote)return;
  db={version:DB_VERSION,users:Array.isArray(remote.users)?remote.users:[],tests:Array.isArray(remote.tests)?remote.tests:[],courses:Array.isArray(remote.courses)?remote.courses:[],attempts:Array.isArray(remote.attempts)?remote.attempts:[]};
  if(!db.users.some((user)=>user.id===ADMIN_ID))db.users.unshift(adminUser());
  if(!db.tests.length)db.tests=JSON.parse(JSON.stringify(seedTests));
  if(!Array.isArray(remote.courses))db.courses=JSON.parse(JSON.stringify(seedCourses));
  saveDb(false);
}

function mergeAdminDatabases(local,remote) {
  const users=new Map();
  (local.users||[]).forEach((user)=>users.set(normalizeName(fullName(user)),JSON.parse(JSON.stringify(user))));
  (remote.users||[]).forEach((user)=>{
    const key=normalizeName(fullName(user)); const previous=users.get(key)||{};
    users.set(key,{...previous,...user,courseProgress:{...(previous.courseProgress||{}),...(user.courseProgress||{})},lessonProgress:{...(previous.lessonProgress||{}),...(user.lessonProgress||{})},assignments:{...(previous.assignments||{}),...(user.assignments||{})},dailyPlans:{...(previous.dailyPlans||{}),...(user.dailyPlans||{})},dailyResults:{...(previous.dailyResults||{}),...(user.dailyResults||{})}});
  });
  const tests=new Map((local.tests||[]).map((test)=>[test.id,test]));
  (remote.tests||[]).forEach((test)=>tests.set(test.id,test));
  if(!tests.has(seedTests[0].id))tests.set(seedTests[0].id,JSON.parse(JSON.stringify(seedTests[0])));
  const courses=Array.isArray(remote.courses)?remote.courses.map((course)=>JSON.parse(JSON.stringify(course))):(local.courses||[]).map((course)=>JSON.parse(JSON.stringify(course)));
  const attempts=new Map((local.attempts||[]).map((attempt)=>[attempt.id,attempt]));
  (remote.attempts||[]).forEach((attempt)=>attempts.set(attempt.id,attempt));
  return {version:DB_VERSION,users:[...users.values()],tests:[...tests.values()],courses,attempts:[...attempts.values()]};
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
      const result=await cloudRequest({action:"adminSync",pin:adminPin,users:db.users,tests:db.tests,courses:db.courses,attempts:db.attempts});
      applyCloudDb(result.db);
    } else if(user.role!=="admin") {
      const result=await cloudRequest({action:"save",user,attempts:db.attempts.filter((attempt)=>attempt.userId===user.id)});
      mergeTests(result.tests); mergeCourses(result.courses); mergeLeaderboard(result.leaderboard);
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
      user = { id:uid("user"), firstName:firstName.trim(), lastName:lastName.trim(), role:"employee", adminId:ADMIN_ID, createdAt:new Date().toISOString(), lastActive:new Date().toISOString(), xp:0, streak:1, courseProgress:{}, lessonProgress:{}, assignments:{}, dailyPlans:{}, dailyResults:{} };
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
      const synced=await cloudRequest({action:"adminSync",pin,users:db.users,tests:db.tests,courses:db.courses,attempts:db.attempts});
      applyCloudDb(synced.db); currentUserId=ADMIN_ID;
    } else {
      const previousIds=db.users.filter((user)=>user.role!=="admin"&&normalizeName(fullName(user))===key).map((user)=>user.id);
      const existingIndex=db.users.findIndex((user)=>user.id===result.user.id||normalizeName(fullName(user))===key);
      if(existingIndex>=0)db.users[existingIndex]=result.user;else db.users.push(result.user);
      currentUserId=result.user.id; mergeTests(result.tests); mergeCourses(result.courses); mergeLeaderboard(result.leaderboard);
      db.attempts=[...db.attempts.filter((attempt)=>attempt.userId!==currentUserId&&!previousIds.includes(attempt.userId)),...(result.attempts||[])];
      saveDb(false);
    }
    localStorage.setItem(SESSION_KEY,currentUserId);
    activeSection=currentUser().role==="admin"?"Обзор":"Главная"; showApp();
  } catch(error) {
    if(adminEntry) {
      setCloudStatus(error.message||"Не удалось открыть админку");const pinInput=document.querySelector('input[name="adminPin"]');pinInput.focus();
    } else {
      localLogin(firstName,lastName); queueCloudSync(); notify("Профиль открыт локально. Синхронизация повторится автоматически.");
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

function todayKey() { const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`; }

function emptyPlan() { return { dialogues:0, packages:0, prospects:0 }; }

function emptyResult() { return { dialogues:0, packages:0, prospects:0, acceptedApplications:0 }; }

function dailyPlan(user,date=todayKey()) { return {...emptyPlan(),...(user.dailyPlans?.[date]||{})}; }

function dailyResult(user,date=todayKey()) { return {...emptyResult(),...(user.dailyResults?.[date]||{})}; }

function planPercent(plan,result) {
  const target=Number(plan.dialogues||0)+Number(plan.packages||0)+Number(plan.prospects||0);
  const actual=Math.min(Number(result.dialogues||0),Number(plan.dialogues||0))+Math.min(Number(result.packages||0),Number(plan.packages||0))+Math.min(Number(result.prospects||0),Number(plan.prospects||0));
  return target?Math.min(100,Math.round(actual/target*100)):0;
}

function courseProgressFor(user,course) {
  const lessons=Array.isArray(course?.lessonItems)?course.lessonItems:[];
  if(!lessons.length)return Number(user.courseProgress?.[course?.id]||0);
  const completed=new Set(user.lessonProgress?.[course.id]||[]);
  return Math.round(lessons.filter((lesson)=>completed.has(lesson.id)).length/lessons.length*100);
}

function userMetrics(user) {
  const attempts = db.attempts.filter((attempt) => attempt.userId === user.id);
  const avg = attempts.length ? Math.round(attempts.reduce((sum,item) => sum + item.score,0) / attempts.length) : 0;
  const courseValues = db.courses.map((course)=>courseProgressFor(user,course)).filter((value)=>value>0);
  const courseAvg = courseValues.length ? Math.round(courseValues.reduce((a,b)=>a+b,0)/courseValues.length) : 0;
  const completedAssignments = Object.values(user.assignments || {}).filter(Boolean).length;
  const skill = Math.min(100, Math.round((avg * .6) + (courseAvg * .25) + (completedAssignments * 5)));
  const plan=dailyPlan(user); const result=dailyResult(user); const planCompletion=planPercent(plan,result);
  const allResults=Object.values(user.dailyResults||{});
  const acceptedApplications=allResults.reduce((sum,item)=>sum+Number(item.acceptedApplications||0),0);
  const dialogues=allResults.reduce((sum,item)=>sum+Number(item.dialogues||0),0);
  const packages=allResults.reduce((sum,item)=>sum+Number(item.packages||0),0);
  const prospects=allResults.reduce((sum,item)=>sum+Number(item.prospects||0),0);
  const activeDays=allResults.filter((item)=>Number(item.dialogues||0)+Number(item.packages||0)+Number(item.prospects||0)+Number(item.acceptedApplications||0)>0).length;
  return { attempts, avg, courseAvg, completedAssignments, skill, xp:user.xp || 0, streak:user.streak || 1, plan, result, planCompletion, acceptedApplications, dialogues, packages, prospects, activeDays };
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

function resultField(name,label,icon,plan,result) {
  const target=Number(plan[name]||0); const actual=Number(result[name]||0); const percent=target?Math.min(100,Math.round(actual/target*100)):0;
  return `<label class="plan-result-field"><span class="plan-field-icon">${icon}</span><span><b>${label}</b><small>${target?`план ${target} · ${percent}% выполнено`:"план пока не задан"}</small></span><input type="number" min="0" max="10000" name="${name}" value="${actual}" aria-label="${label}"></label>`;
}

function employeePlanTracker(user) {
  const plan=dailyPlan(user); const result=dailyResult(user); const completion=planPercent(plan,result); const hasPlan=Object.values(plan).some(Number);
  return `<section class="panel daily-plan-panel"><div class="plan-panel-head"><div><span>Сегодня · ${formatDate(todayKey())}</span><h3>Мой рабочий план</h3><p>${hasPlan?"Заполняйте фактический результат — руководитель увидит обновление сразу.":"Руководитель ещё не назначил цели на сегодня. Результаты всё равно можно фиксировать."}</p></div><span class="plan-score" style="--plan:${completion*3.6}deg"><b>${completion}%</b><small>плана</small></span></div><form id="daily-result-form"><div class="plan-result-grid">${resultField("dialogues","Диалоги","☎",plan,result)}${resultField("packages","Пакеты","◆",plan,result)}${resultField("prospects","Потенциальные абоненты","●",plan,result)}</div><div class="application-row"><div><span class="application-icon">✓</span><span><b>Принятые заявки</b><small>Нажимайте кнопку после каждой принятой заявки</small></span></div><strong>${Number(result.acceptedApplications||0)}</strong><button type="button" class="accept-button" data-action="accept-application">＋ Принята заявка</button><button class="primary" type="submit">Сохранить выполнение <span>→</span></button></div></form></section>`;
}

function planHistory(user) {
  const dates=Object.keys({...user.dailyPlans,...user.dailyResults}).sort().slice(-7);
  if(!dates.length)return '<div class="chart-empty">Динамика плана появится после первой записи</div>';
  return `<div class="plan-history-chart">${dates.map((date)=>{const percent=planPercent(dailyPlan(user,date),dailyResult(user,date));return `<div><b>${percent}%</b><i><u style="height:${Math.max(5,percent)}%"></u></i><small>${date.slice(5).split("-").reverse().join(".")}</small></div>`}).join("")}</div>`;
}

function employeeHome() {
  const user = currentUser(); const m = userMetrics(user);
  const lastAttempt = m.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  return `<div class="dashboard employee-view">
    ${pageIntro("Личный кабинет",`Добрый день, ${escapeHtml(user.firstName)}`,"Ваш персональный план, результаты и ближайшие задачи.",'<button class="search-button" data-nav="Тесты"><span class="ui-icon">⌕</span><span>Найти тест</span><kbd>Ctrl K</kbd></button>')}
    <section class="hero employee-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Демо-тест · Компетенции</div><h2>Знания превращаем<br><em>в уверенный результат.</em></h2><p>Проверьте навыки установления контакта, знания тарифа и ведения диалога.</p><div class="hero-actions"><button class="white-button" data-action="start-test" data-id="test-dialogue-competencies">Начать демо-тест <span>→</span></button><span>10 вопросов · 9 минут</span></div></div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="orbit orbit-two"></div><div class="phone"><span>●</span><b>☎</b></div><div class="floating-icon fi-one">✓</div><div class="floating-icon fi-two">↗</div></div><div class="hero-progress"><div class="progress-ring" style="--value:${Math.max(20,m.skill)*3.6}deg"><span><b>${m.skill}%</b><small>навык</small></span></div><p>Средний результат<br><b>${m.avg || "нет тестов"}${m.avg?"%":""}</b></p></div></section>
    <section class="metrics-grid employee-metrics">${metric("✓",m.result.acceptedApplications,"заявок сегодня",`${m.acceptedApplications} за всё время`,m.result.acceptedApplications>0)}${metric("↑",`${m.planCompletion}%`,"выполнение плана",m.planCompletion>=100?"цель дня достигнута":"обновляйте результат",m.planCompletion>=100)}${metric("☎",m.result.dialogues,"диалогов сегодня",m.plan.dialogues?`из ${m.plan.dialogues} по плану`:"без плана",m.result.dialogues>=m.plan.dialogues&&m.plan.dialogues>0)}${metric("◆",m.result.packages,"пакетов сегодня",m.plan.packages?`из ${m.plan.packages} по плану`:"без плана",m.result.packages>=m.plan.packages&&m.plan.packages>0)}${metric("●",m.result.prospects,"потенциальных",m.plan.prospects?`из ${m.plan.prospects} по плану`:"без плана",m.result.prospects>=m.plan.prospects&&m.plan.prospects>0)}${metric("▰",`${m.courseAvg}%`,"прогресс курсов",`${m.activeDays} активных дней`,m.courseAvg>0)}${metric("✓",`${m.avg}%`,"средний тест",`${m.attempts.length} попыток`,m.avg>=70)}${metric("◆",m.xp,"баллов опыта","за обучение и практику",m.xp>0)}</section>
    ${employeePlanTracker(user)}
    <section class="team-analysis-grid"><article class="panel analysis-card"><div class="panel-heading"><div><span>Мои навыки</span><h3>Компетенции</h3></div></div>${competencyBars(user,true)}</article><article class="panel analysis-card"><div class="panel-heading"><div><span>Моя динамика</span><h3>Последние результаты</h3></div></div>${activityBars(user)}</article></section>
    <div class="content-grid"><section class="panel learning-panel"><div class="panel-heading"><div><span>Быстрый доступ</span><h3>Продолжить обучение</h3></div><button data-nav="Курсы">Все курсы →</button></div><div class="quick-grid"><button class="quick-card" data-action="open-course" data-id="strong-call"><span>01</span><div><small>Демо-курс · 4 урока</small><b>Сильный звонок</b><em>${courseProgressFor(user,courseById("strong-call"))}% пройдено</em></div><i>→</i></button><button class="quick-card" data-nav="Задания"><span>02</span><div><small>Практика</small><b>Учебный звонок</b><em>${user.assignments?.["audio-call"]?"выполнено":"сдать сегодня"}</em></div><i>→</i></button><button class="quick-card" data-nav="Тесты"><span>03</span><div><small>Демо-тест</small><b>Компетенции и тарифы</b><em>10 вопросов</em></div><i>→</i></button></div></section>
    <section class="panel skill-panel"><div class="panel-heading"><div><span>Последний результат</span><h3>${lastAttempt?escapeHtml(testById(lastAttempt.testId)?.title || "Тест"):"Начните обучение"}</h3></div></div>${lastAttempt?`<div class="result-orb ${lastAttempt.score>=70?"good":"warn"}"><strong>${lastAttempt.score}%</strong><small>${formatDate(lastAttempt.date)}</small></div><p class="result-copy">Правильных ответов: <b>${lastAttempt.correct} из ${lastAttempt.total}</b></p><button class="soft-button" data-action="start-test" data-id="${lastAttempt.testId}">Пройти ещё раз <span>→</span></button>`:`<div class="empty-state"><span class="empty-icon">✓</span><b>Здесь появятся результаты</b><p>Выберите тест и ответьте на вопросы.</p></div>`}</section></div>
    ${footer()}</div>`;
}

function employeeCourses() {
  const user=currentUser();
  return `<div class="dashboard">${pageIntro("Каталог обучения","Курсы","Изучайте материал в удобном темпе — прогресс сохраняется автоматически.")}
    <div class="catalog-grid">${db.courses.filter((course)=>course.published).map((course)=>{const progress=courseProgressFor(user,course);const lessonCount=Array.isArray(course.lessonItems)&&course.lessonItems.length?course.lessonItems.length:course.lessons;return `<article class="catalog-card panel ${course.lessonItems?.length?"course-ready":""}"><span class="course-art large"><b>${escapeHtml(course.number)}</b><i>${escapeHtml(course.icon)}</i>${course.lessonItems?.length?'<em>Материалы готовы</em>':""}</span><div class="catalog-copy"><small>${escapeHtml(course.category)} · ${lessonCount} уроков</small><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description)}</p><div class="catalog-progress"><span><i style="width:${progress}%"></i></span><b>${progress}%</b></div><button class="primary" data-action="open-course" data-id="${course.id}">${progress?"Продолжить":"Открыть курс"} <span>→</span></button></div></article>`}).join("")||'<div class="empty-state panel"><span class="empty-icon">▰</span><b>Курсы готовятся</b><p>Администратор скоро опубликует учебные материалы.</p></div>'}</div>${footer()}</div>`;
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
  const todayApplications=employees.reduce((sum,user)=>sum+dailyResult(user).acceptedApplications,0);
  const todayDialogues=employees.reduce((sum,user)=>sum+dailyResult(user).dialogues,0);
  const todayPackages=employees.reduce((sum,user)=>sum+dailyResult(user).packages,0);
  const todayProspects=employees.reduce((sum,user)=>sum+dailyResult(user).prospects,0);
  const plannedEmployees=employees.filter((user)=>Object.values(dailyPlan(user)).some(Number));
  const planAverage=plannedEmployees.length?Math.round(plannedEmployees.reduce((sum,user)=>sum+planPercent(dailyPlan(user),dailyResult(user)),0)/plannedEmployees.length):0;
  return `<div class="dashboard organizer-view">${pageIntro("Центр управления","Панель руководителя","Сотрудники, обучение и результаты в одном кабинете.",'<button class="primary" data-nav="Тесты"><span>＋</span> Создать тест</button>')}
    <section class="hero organizer-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Единая команда</div><h2>Видеть прогресс.<br><em>Усиливать каждого.</em></h2><p>Открывайте профиль любого сотрудника, смотрите историю тестов и создавайте новые проверки знаний.</p><button class="white-button" data-nav="Сотрудники">Открыть сотрудников <span>→</span></button></div><div class="team-orbit" aria-hidden="true"><div class="leader">НМ<span>${employees.length}</span></div><div class="person p1">АК</div><div class="person p2">ИМ</div><div class="person p3">МЛ</div><div class="person p4">ДС</div><i class="ring r1"></i><i class="ring r2"></i></div></section>
    <section class="metrics-grid admin-metrics">${metric("●",employees.length,"сотрудников",`${activeToday} активны сегодня`,employees.length>0)}${metric("↑",`${planAverage}%`,"план команды",`${plannedEmployees.length} сотрудников с планом`,planAverage>=80)}${metric("✓",todayApplications,"заявок сегодня","принято командой",todayApplications>0)}${metric("☎",todayDialogues,"диалогов сегодня","фактический результат",todayDialogues>0)}${metric("◆",todayPackages,"пакетов сегодня","оформлено сотрудниками",todayPackages>0)}${metric("◉",todayProspects,"потенциальных","зафиксировано сегодня",todayProspects>0)}${metric("✓",`${avg}%`,"средний тест",`${attempts.length} попыток`,avg>=70)}${metric("▰",`${courseAvg}%`,"прогресс курсов",`${completedAssignments} заданий выполнено`,courseAvg>0)}${metric("↑",`${passRate}%`,"успешных тестов","порог 70%",passRate>=70)}${metric("◆",teamXp,"XP команды",`${db.tests.filter(t=>t.published).length} тестов опубликовано`,teamXp>0)}</section>
    <section class="team-analysis-grid"><article class="panel analysis-card"><div class="panel-heading"><div><span>Карта навыков</span><h3>Компетенции команды</h3></div></div>${scoreBars(teamCompetencies(employees))}</article><article class="panel analysis-card"><div class="panel-heading"><div><span>Динамика</span><h3>Последние результаты</h3></div><button data-action="export-excel">Excel →</button></div>${teamActivityBars(attempts)}</article></section>
    <div class="content-grid organizer-grid"><section class="panel team-panel"><div class="panel-heading"><div><span>Последние профили</span><h3>Сотрудники</h3></div><button data-nav="Сотрудники">Вся команда →</button></div>${employees.length?employeeTable(employees.slice(-5).reverse()):'<div class="empty-state"><span class="empty-icon">◎</span><b>Пока нет сотрудников</b><p>Новый профиль появится здесь после входа по имени и фамилии.</p></div>'}</section><section class="panel funnel-panel"><div class="panel-heading"><div><span>Контент</span><h3>Быстрые действия</h3></div></div><div class="admin-actions"><button data-action="edit-test" data-id=""><span>＋</span><div><b>Создать тест</b><small>Добавить вопросы и ответы</small></div></button><button data-nav="Тесты"><span>✓</span><div><b>Редактировать тесты</b><small>${db.tests.length} материалов</small></div></button><button data-nav="Курсы"><span>▰</span><div><b>Настроить курсы</b><small>${db.courses.length} материалов</small></div></button><button data-nav="Сотрудники"><span>●</span><div><b>Открыть аналитику</b><small>По каждому человеку</small></div></button><button data-action="export-excel"><span>⇩</span><div><b>Выгрузить в Excel</b><small>Сотрудники и результаты</small></div></button></div></section></div>${footer()}</div>`;
}

function employeeTable(users) {
  return `<div class="table-scroll"><table><thead><tr><th>Сотрудник</th><th>План</th><th>Заявки</th><th>Диалоги</th><th>Обучение</th><th></th></tr></thead><tbody>${users.map((user)=>{const m=userMetrics(user);return `<tr><td><span class="table-avatar">${initials(user)}</span><span><b>${escapeHtml(fullName(user))}</b><small>${formatDate(user.createdAt)}</small></span></td><td><b>${m.planCompletion}%</b><small>сегодня</small></td><td><b>${m.result.acceptedApplications}</b><small>${m.acceptedApplications} всего</small></td><td><b>${m.result.dialogues}</b><small>из ${m.plan.dialogues||"—"}</small></td><td><b>${m.skill}/100</b><small>курсы ${m.courseAvg}%</small></td><td><div class="card-actions employee-actions"><button data-action="user-detail" data-id="${user.id}">Открыть</button><button class="danger-link" data-action="delete-user" data-id="${user.id}">Удалить</button></div></td></tr>`}).join("")}</tbody></table></div>`;
}

function employeeCards(users) {
  return `<div class="employee-card-grid">${users.map((user)=>{const m=userMetrics(user);const lastActive=(user.lastActive||user.createdAt||"").slice(0,10)===todayKey();return `<article class="employee-card panel"><div class="employee-card-head"><span class="employee-card-avatar">${initials(user)}</span><div><span class="employee-status ${lastActive?"online":""}">${lastActive?"Активен сегодня":"Нет активности сегодня"}</span><h3>${escapeHtml(fullName(user))}</h3><small>В команде с ${formatDate(user.createdAt)}</small></div><span class="employee-skill-ring" style="--skill:${m.skill*3.6}deg"><b>${m.skill}</b></span></div><div class="employee-plan-line"><span><b>План на сегодня</b><small>${m.planCompletion}% выполнено</small></span><i><u style="width:${m.planCompletion}%"></u></i></div><div class="employee-stat-grid"><div><strong>${m.result.acceptedApplications}</strong><small>заявок</small></div><div><strong>${m.result.dialogues}<em>/${m.plan.dialogues||"—"}</em></strong><small>диалоги</small></div><div><strong>${m.result.packages}<em>/${m.plan.packages||"—"}</em></strong><small>пакеты</small></div><div><strong>${m.result.prospects}<em>/${m.plan.prospects||"—"}</em></strong><small>потенциальные</small></div><div><strong>${m.avg}%</strong><small>тесты</small></div><div><strong>${m.courseAvg}%</strong><small>курсы</small></div></div><div class="employee-card-actions"><button class="primary" data-action="user-detail" data-id="${user.id}">Профиль и план <span>→</span></button><button class="icon-danger" data-action="delete-user" data-id="${user.id}" aria-label="Удалить сотрудника">×</button></div></article>`}).join("")}</div>`;
}

function adminEmployees() {
  const employees=db.users.filter((u)=>u.role!=="admin");
  const teamPlan=employees.length?Math.round(employees.reduce((sum,user)=>sum+userMetrics(user).planCompletion,0)/employees.length):0;
  const applications=employees.reduce((sum,user)=>sum+userMetrics(user).result.acceptedApplications,0);
  const dialogues=employees.reduce((sum,user)=>sum+userMetrics(user).result.dialogues,0);
  return `<div class="dashboard">${pageIntro("Команда","Сотрудники","Рабочие планы, заявки, продажи и обучение каждого человека в одном экране.")}
    <section class="employee-summary-strip"><div><span>↑</span><b>${teamPlan}%</b><small>выполнение плана</small></div><div><span>✓</span><b>${applications}</b><small>заявок сегодня</small></div><div><span>☎</span><b>${dialogues}</b><small>диалогов сегодня</small></div><div><span>●</span><b>${employees.length}</b><small>сотрудников</small></div></section>${employees.length?employeeCards(employees):'<section class="panel directory-panel"><div class="empty-state"><span class="empty-icon">●</span><b>Список пока пуст</b><p>Попросите сотрудника открыть сайт и ввести имя и фамилию.</p></div></section>'}${footer()}</div>`;
}

function adminTests() {
  return `<div class="dashboard">${pageIntro("Редактор знаний","Тесты","Создавайте вопросы, меняйте правильные ответы и запускайте тесты для команды.",'<button class="primary" data-action="edit-test" data-id=""><span>＋</span> Новый тест</button>')}
    <div class="admin-test-list">${db.tests.map((test)=>`<article class="admin-test-card panel"><span class="test-icon">✓</span><div class="admin-test-copy"><small>${escapeHtml(test.category)} · ${questionLabel(test.questions.length)}</small><h3>${escapeHtml(test.title)}</h3><p>${escapeHtml(test.description)}</p></div><span class="publish-chip ${test.published?"live":""}">${test.published?"Опубликован":"Черновик"}</span><div class="card-actions"><button data-action="preview-test" data-id="${test.id}">Просмотр</button><button data-action="edit-test" data-id="${test.id}">Редактировать</button><button class="danger-link" data-action="delete-test" data-id="${test.id}">Удалить</button></div></article>`).join("")}</div>${footer()}</div>`;
}

function adminCourses() {
  return `<div class="dashboard">${pageIntro("Учебная программа","Курсы","Создавайте, настраивайте и публикуйте учебные материалы для команды.",'<button class="primary" data-action="edit-course" data-id=""><span>＋</span> Новый курс</button>')}
    <div class="catalog-grid">${db.courses.map((course)=>{const count=course.lessonItems?.length||0;return `<article class="catalog-card panel admin-course-card"><span class="course-art large"><b>${escapeHtml(course.number)}</b><i>${escapeHtml(course.icon)}</i></span><div class="catalog-copy"><div class="course-card-meta"><small>${escapeHtml(course.category)} · ${count||course.lessons} уроков</small><span class="publish-chip ${course.published?"live":""}">${course.published?"Опубликован":"Черновик"}</span></div><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description)}</p><div class="course-content-status ${count?"ready":""}"><span>${count?"✓":"!"}</span><div><b>${count?`${count} уроков наполнены материалом`:"Материалы ещё не добавлены"}</b><small>${count?"текст, тезисы и ссылки доступны сотрудникам":"откройте настройки и добавьте уроки"}</small></div></div><div class="card-actions course-actions"><button data-action="edit-course" data-id="${course.id}">Настроить уроки</button><button class="danger-link" data-action="delete-course" data-id="${course.id}">Удалить</button></div></div></article>`}).join("")||'<div class="empty-state panel"><span class="empty-icon">▰</span><b>Курсов пока нет</b><p>Создайте первый курс для команды.</p></div>'}</div>${footer()}</div>`;
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
  document.body.style.overflow=""; testSession=null; selectedAnswer=null; editorDraft=null; courseEditorDraft=null;
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

function courseById(id) { return db.courses.find((course)=>course.id===id); }

function openCourseEditor(courseId="") {
  const existing=courseId?courseById(courseId):null;
  courseEditorDraft=existing?JSON.parse(JSON.stringify(existing)):{id:"",number:String(db.courses.length+1).padStart(2,"0"),icon:"▰",title:"",category:"Продажи",lessons:1,description:"",published:true,lessonItems:[]};
  courseEditorDraft.lessonItems=Array.isArray(courseEditorDraft.lessonItems)?courseEditorDraft.lessonItems:[];
  openModal(`<form id="course-editor-form"><div class="editor-head"><div><div class="eyebrow">Конструктор курсов</div><h2 id="modal-title">${existing?"Настроить":"Новый"} <em>курс</em></h2></div><label class="publish-toggle"><input type="checkbox" name="published" ${courseEditorDraft.published?"checked":""}><span>Опубликовать</span></label></div><div class="course-editor-preview"><span class="course-art large"><b>${escapeHtml(courseEditorDraft.number)}</b><i>${escapeHtml(courseEditorDraft.icon)}</i></span><div><small>Карточка в каталоге</small><b>${escapeHtml(courseEditorDraft.title||"Новый курс")}</b><em>Уроков с материалом: ${courseEditorDraft.lessonItems.length}</em></div></div><div class="form-grid"><label>Название<input name="title" required maxlength="100" value="${escapeHtml(courseEditorDraft.title)}" placeholder="Например, Работа с возражениями"></label><label>Категория<select name="category">${["Продажи","Практика","Продукт","Скрипты","Сервис","Адаптация"].map((category)=>`<option ${category===courseEditorDraft.category?"selected":""}>${category}</option>`).join("")}</select></label><label>Номер<input name="number" required maxlength="4" value="${escapeHtml(courseEditorDraft.number)}" placeholder="01"></label><label>Иконка<input name="icon" required maxlength="4" value="${escapeHtml(courseEditorDraft.icon)}" placeholder="☎"></label></div><label>Описание<textarea name="description" rows="3" maxlength="500" required placeholder="Чему научится сотрудник">${escapeHtml(courseEditorDraft.description)}</textarea></label><div class="lesson-editor-head"><div><small>Содержание курса</small><h3>Уроки и материалы</h3></div><button class="soft-button" type="button" data-action="add-course-lesson">＋ Добавить урок</button></div><div id="course-lessons-editor"></div><button class="primary full" type="submit">Сохранить курс <span>→</span></button></form>`,true);
  renderCourseLessonsEditor();
}

function renderCourseLessonsEditor() {
  const container=document.getElementById("course-lessons-editor"); if(!container||!courseEditorDraft)return;
  container.innerHTML=courseEditorDraft.lessonItems.length?courseEditorDraft.lessonItems.map((lesson,index)=>`<section class="course-lesson-editor"><div class="lesson-number">${String(index+1).padStart(2,"0")}</div><div class="lesson-editor-body"><div class="lesson-editor-title"><b>Урок ${index+1}</b><button type="button" data-action="remove-course-lesson" data-index="${index}">Удалить</button></div><div class="form-grid"><label>Название урока<input name="lesson${index}title" required maxlength="120" value="${escapeHtml(lesson.title)}" placeholder="Название урока"></label><label>Продолжительность<input name="lesson${index}duration" maxlength="30" value="${escapeHtml(lesson.duration||"")}" placeholder="Например, 8 мин"></label></div><label>Материал урока<textarea name="lesson${index}content" rows="7" maxlength="15000" required placeholder="Добавьте теорию, скрипт, примеры и практические рекомендации">${escapeHtml(lesson.content||"")}</textarea></label><div class="lesson-import-row"><label class="file-import">⇧ Загрузить текстовый файл<input type="file" accept=".txt,.md,text/plain,text/markdown" data-lesson-upload="${index}"></label><small>TXT или Markdown, до 15 000 знаков</small></div><label>Ключевые тезисы <small>каждый с новой строки</small><textarea name="lesson${index}points" rows="3" maxlength="2000" placeholder="Главная мысль урока">${escapeHtml((lesson.keyPoints||[]).join("\n"))}</textarea></label><label>Ссылка на дополнительный материал<input name="lesson${index}url" type="url" maxlength="500" value="${escapeHtml(lesson.resourceUrl||"")}" placeholder="https://..."></label></div></section>`).join(""):'<div class="empty-lessons"><span>▰</span><b>Добавьте первый урок</b><p>В урок можно вставить текст вручную или загрузить файл TXT/Markdown.</p></div>';
}

function syncCourseDraftFromForm() {
  const form=document.getElementById("course-editor-form"); if(!form||!courseEditorDraft)return;
  const data=new FormData(form);
  courseEditorDraft.lessonItems=courseEditorDraft.lessonItems.map((lesson,index)=>({
    id:lesson.id||uid("lesson"),title:String(data.get(`lesson${index}title`)??lesson.title).trim(),duration:String(data.get(`lesson${index}duration`)??lesson.duration??"").trim(),content:String(data.get(`lesson${index}content`)??lesson.content??"").trim(),keyPoints:String(data.get(`lesson${index}points`)??(lesson.keyPoints||[]).join("\n")).split("\n").map((item)=>item.trim()).filter(Boolean).slice(0,12),resourceUrl:String(data.get(`lesson${index}url`)??lesson.resourceUrl??"").trim()
  }));
}

async function saveCourseEditor(form) {
  syncCourseDraftFromForm();
  const data=new FormData(form);
  const saved={id:courseEditorDraft.id||uid("course"),number:String(data.get("number")).trim(),icon:String(data.get("icon")).trim(),title:String(data.get("title")).trim(),category:String(data.get("category")).trim(),lessons:Math.max(1,courseEditorDraft.lessonItems.length),description:String(data.get("description")).trim(),published:data.get("published")==="on",lessonItems:courseEditorDraft.lessonItems,updatedAt:new Date().toISOString()};
  if(!saved.title||!saved.description||!saved.number||!saved.icon){notify("Заполните все поля курса");return;}
  if(saved.lessonItems.some((lesson)=>!lesson.title||!lesson.content)){notify("Заполните название и материал каждого урока");return;}
  const index=db.courses.findIndex((course)=>course.id===saved.id); if(index>=0)db.courses[index]=saved;else db.courses.unshift(saved); saveDb(false);
  try {
    const result=await cloudRequest({action:"saveCourse",pin:adminPin,course:saved}); applyCloudDb(result.db);
    closeModal(); renderSection(); notify(`Курс «${saved.title}» сохранён`);
  } catch(error) {
    saveDb(); closeModal(); renderSection(); notify("Курс сохранён локально — синхронизация повторится позже");
  }
}

function openCourse(courseId,lessonId="") {
  const course=courseById(courseId); if(!course)return;
  const lessons=Array.isArray(course.lessonItems)?course.lessonItems:[]; const user=currentUser();
  if(!lessons.length){openModal(`<div class="empty-state"><span class="empty-icon">▰</span><b>Материалы курса готовятся</b><p>Администратор уже создал курс, но ещё не добавил содержание уроков.</p><button class="soft-button" data-action="close-modal">Закрыть</button></div>`);return;}
  const completed=new Set(user.lessonProgress?.[course.id]||[]); const selected=lessons.find((lesson)=>lesson.id===lessonId)||lessons.find((lesson)=>!completed.has(lesson.id))||lessons[0]; const done=completed.has(selected.id); const progress=courseProgressFor(user,course); const resourceUrl=safeUrl(selected.resourceUrl);
  openModal(`<div class="course-player"><aside><div class="course-player-brand"><span>${escapeHtml(course.icon)}</span><div><small>${escapeHtml(course.category)}</small><b>${escapeHtml(course.title)}</b></div></div><div class="catalog-progress"><span><i style="width:${progress}%"></i></span><b>${progress}%</b></div><nav>${lessons.map((lesson,index)=>`<button class="${lesson.id===selected.id?"active":""} ${completed.has(lesson.id)?"done":""}" data-action="open-course-lesson" data-course="${course.id}" data-id="${lesson.id}"><span>${completed.has(lesson.id)?"✓":String(index+1).padStart(2,"0")}</span><div><b>${escapeHtml(lesson.title)}</b><small>${escapeHtml(lesson.duration||"Материал")}</small></div></button>`).join("")}</nav></aside><article class="course-player-content"><div class="eyebrow">Урок ${lessons.indexOf(selected)+1} из ${lessons.length} · ${escapeHtml(selected.duration||"самостоятельно")}</div><h2 id="modal-title">${escapeHtml(selected.title)}</h2><div class="lesson-text">${escapeHtml(selected.content).split("\n").filter(Boolean).map((paragraph)=>`<p>${paragraph}</p>`).join("")}</div>${selected.keyPoints?.length?`<section class="lesson-key-points"><b>Главное из урока</b>${selected.keyPoints.map((point)=>`<div><span>✓</span><p>${escapeHtml(point)}</p></div>`).join("")}</section>`:""}${resourceUrl?`<a class="lesson-resource" href="${escapeHtml(resourceUrl)}" target="_blank" rel="noopener">Открыть дополнительный материал ↗</a>`:""}<div class="lesson-actions"><button class="soft-button" data-action="close-modal">Закрыть</button><button class="primary" data-action="complete-course-lesson" data-course="${course.id}" data-id="${selected.id}" ${done?"disabled":""}>${done?"Урок пройден ✓":"Отметить урок пройденным →"}</button></div></article></div>`,true);
}

function openUserDetail(userId) {
  const user=db.users.find((item)=>item.id===userId); if(!user)return;
  const m=userMetrics(user); const attempts=m.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const tariff=userCompetencies(user).find((item)=>item.label==="Знание тарифа")||{value:0,total:0};
  openModal(`<div class="user-detail-head"><span class="detail-avatar">${initials(user)}</span><div><div class="eyebrow">Профиль сотрудника</div><h2 id="modal-title">${escapeHtml(fullName(user))}</h2><p>Профиль создан ${formatDate(user.createdAt)} · последнее посещение ${formatDate(user.lastActive||user.createdAt)}</p></div></div>
    <div class="detail-metrics expanded"><div><strong>${m.planCompletion}%</strong><small>план сегодня</small></div><div><strong>${m.result.acceptedApplications}</strong><small>заявок сегодня</small></div><div><strong>${m.result.dialogues}</strong><small>диалогов</small></div><div><strong>${m.result.packages}</strong><small>пакетов</small></div><div><strong>${m.result.prospects}</strong><small>потенциальных</small></div><div><strong>${m.activeDays}</strong><small>активных дней</small></div><div><strong>${m.avg}%</strong><small>тесты</small></div><div><strong>${m.courseAvg}%</strong><small>курсы</small></div></div>
    <section class="admin-plan-editor"><div class="plan-editor-copy"><span>Индивидуальные цели</span><h3>План сотрудника по дням</h3><p>Выберите дату и назначьте количество диалогов, пакетов и потенциальных абонентов.</p></div><form id="employee-plan-form"><input type="hidden" name="userId" value="${user.id}"><label>Дата<input type="date" name="date" required value="${todayKey()}"></label><label>Диалоги<input type="number" name="dialogues" min="0" max="10000" required value="${m.plan.dialogues}"></label><label>Пакеты<input type="number" name="packages" min="0" max="1000" required value="${m.plan.packages}"></label><label>Потенциальные абоненты<input type="number" name="prospects" min="0" max="10000" required value="${m.plan.prospects}"></label><button class="primary" type="submit">Сохранить план →</button></form></section>
    <section class="detail-analysis activity-block"><div class="panel-heading"><div><span>Выполнение целей</span><h3>План за последние дни</h3></div><b class="detail-total">${m.acceptedApplications} заявок всего</b></div>${planHistory(user)}</section>
    <div class="employee-analysis-grid"><section class="detail-analysis"><div class="panel-heading"><div><span>Компетенции</span><h3>Карта навыков</h3></div></div>${competencyBars(user)}</section><section class="detail-analysis knowledge-card"><div><span class="knowledge-ring" style="--score:${tariff.value*3.6}deg"><b>${tariff.total?`${tariff.value}%`:"—"}</b><small>тарифы</small></span><h3>Знание тарифа</h3><p>${tariff.total?tariff.value>=80?"Уверенное знание продуктовых решений":tariff.value>=60?"Хорошая база, нужна практика":"Рекомендуется повторить продуктовый курс":"Показатель появится после демо-теста"}</p></div></section></div>
    <section class="detail-analysis activity-block"><div class="panel-heading"><div><span>Динамика</span><h3>Результаты по попыткам</h3></div></div>${activityBars(user)}</section>
    <div class="panel-heading detail-heading"><div><span>История</span><h3>Результаты тестов</h3></div></div>${attempts.length?`<div class="attempt-list">${attempts.map((a)=>`<div><span class="score-dot ${a.score>=70?"good":""}">${a.score}%</span><p><b>${escapeHtml(testById(a.testId)?.title||"Удалённый тест")}</b><small>${formatDate(a.date)} · ${a.correct} из ${a.total}</small></p></div>`).join("")}</div>`:'<div class="empty-state"><b>Тесты ещё не пройдены</b><p>Результаты появятся после первой попытки.</p></div>'}<div class="detail-actions"><button class="danger-button" data-action="delete-user" data-id="${user.id}">Удалить сотрудника</button><button class="soft-button" data-action="close-modal">Закрыть профиль</button></div>`,true);
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
  const employeeHeaders=["Сотрудник","Дата регистрации","Последний вход","План сегодня, %","Заявки сегодня","Диалоги сегодня","Пакеты сегодня","Потенциальные сегодня","Заявки всего","Общий навык","Средний тест","Прогресс курсов","XP",...competencyGroups.map(([label])=>label)];
  const employeeRows=employees.map((user)=>{const m=userMetrics(user);return [fullName(user),formatDate(user.createdAt),formatDate(user.lastActive||user.createdAt),m.planCompletion,m.result.acceptedApplications,m.result.dialogues,m.result.packages,m.result.prospects,m.acceptedApplications,m.skill,m.avg,m.courseAvg,m.xp,...userCompetencies(user).map((item)=>item.value)];});
  const attemptHeaders=["Сотрудник","Тест","Дата","Результат, %","Правильных","Всего вопросов"];
  const attemptRows=db.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date)).map((attempt)=>{const user=db.users.find((item)=>item.id===attempt.userId);return [user?fullName(user):"Удалённый профиль",testById(attempt.testId)?.title||"Удалённый тест",formatDate(attempt.date),attempt.score,attempt.correct,attempt.total];});
  const dailyHeaders=["Сотрудник","Дата","План диалогов","Факт диалогов","План пакетов","Факт пакетов","План потенциальных","Факт потенциальных","Принято заявок","Выполнение плана, %"];
  const dailyRows=employees.flatMap((user)=>Object.keys({...user.dailyPlans,...user.dailyResults}).sort().map((date)=>{const plan=dailyPlan(user,date);const result=dailyResult(user,date);return [fullName(user),date,plan.dialogues,result.dialogues,plan.packages,result.packages,plan.prospects,result.prospects,result.acceptedApplications,planPercent(plan,result)];}));
  const workbook=`<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${excelSheet("Сотрудники",employeeHeaders,employeeRows)}${excelSheet("Планы по дням",dailyHeaders,dailyRows)}${excelSheet("Результаты тестов",attemptHeaders,attemptRows)}</Workbook>`;
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
  if(action==="accept-application"){const user=currentUser();user.dailyResults=user.dailyResults||{};const result=dailyResult(user);result.acceptedApplications=Number(result.acceptedApplications||0)+1;result.updatedAt=new Date().toISOString();user.dailyResults[todayKey()]=result;user.lastActive=new Date().toISOString();saveDb();renderSection();notify("Заявка добавлена в результат дня");}
  if(action==="open-course")openCourse(id);
  if(action==="open-course-lesson")openCourse(target.dataset.course,id);
  if(action==="complete-course-lesson"){const user=currentUser();const courseId=target.dataset.course;user.lessonProgress=user.lessonProgress||{};const completed=new Set(user.lessonProgress[courseId]||[]);if(!completed.has(id)){completed.add(id);user.lessonProgress[courseId]=[...completed];user.courseProgress=user.courseProgress||{};user.courseProgress[courseId]=courseProgressFor(user,courseById(courseId));user.xp=(user.xp||0)+25;user.lastActive=new Date().toISOString();saveDb();notify("Урок пройден — начислено 25 XP");}openCourse(courseId,id);}
  if(action==="advance-course"){const user=currentUser();user.courseProgress=user.courseProgress||{};user.courseProgress[id]=Math.min(100,(user.courseProgress[id]||0)+15);user.xp=(user.xp||0)+30;user.lastActive=new Date().toISOString();saveDb();renderSection();notify(`Прогресс курса: ${user.courseProgress[id]}%`);}
  if(action==="toggle-assignment"){const user=currentUser();user.assignments=user.assignments||{};const was=!!user.assignments[id];user.assignments[id]=!was;const item=assignments.find((a)=>a.id===id);user.xp=Math.max(0,(user.xp||0)+(was?-item.points:item.points));saveDb();renderSection();notify(was?"Задание возвращено в работу":"Задание выполнено — XP начислены");}
  if(action==="edit-test")openTestEditor(id);
  if(action==="add-question"){syncEditorDraftFromForm();editorDraft.questions.push({competency:"Контакт",text:"",options:["","",""],correct:0});renderEditorQuestions();}
  if(action==="remove-question"){syncEditorDraftFromForm();const index=Number(target.dataset.index);editorDraft.questions.splice(index,1);renderEditorQuestions();}
  if(action==="edit-course")openCourseEditor(id);
  if(action==="add-course-lesson"){syncCourseDraftFromForm();courseEditorDraft.lessonItems.push({id:uid("lesson"),title:"",duration:"7 мин",content:"",keyPoints:[],resourceUrl:""});renderCourseLessonsEditor();}
  if(action==="remove-course-lesson"){syncCourseDraftFromForm();courseEditorDraft.lessonItems.splice(Number(target.dataset.index),1);renderCourseLessonsEditor();}
  if(action==="delete-course"){pendingDeleteCourseId=id;const course=courseById(id);if(course)openModal(`<div class="confirm-screen"><span class="result-badge retry">!</span><div class="eyebrow">Подтверждение</div><h2 id="modal-title">Удалить курс?</h2><p>«${escapeHtml(course.title)}» исчезнет из каталога. Уже набранный сотрудниками прогресс останется в их аналитике.</p><div class="confirm-actions"><button class="soft-button" data-action="close-modal">Отмена</button><button class="primary" data-action="confirm-delete-course">Удалить</button></div></div>`);}
  if(action==="confirm-delete-course"){const deletedId=pendingDeleteCourseId;try{const result=await cloudRequest({action:"deleteCourse",pin:adminPin,courseId:deletedId});applyCloudDb(result.db);pendingDeleteCourseId=null;closeModal();renderSection();notify("Курс удалён");}catch(error){notify(error.message||"Не удалось удалить курс");}}
  if(action==="delete-test"){pendingDeleteTestId=id;const test=testById(id);openModal(`<div class="confirm-screen"><span class="result-badge retry">!</span><div class="eyebrow">Подтверждение</div><h2 id="modal-title">Удалить тест?</h2><p>«${escapeHtml(test.title)}» исчезнет из каталога. Уже сохранённые результаты сотрудников останутся в истории.</p><div class="confirm-actions"><button class="soft-button" data-action="close-modal">Отмена</button><button class="primary" data-action="confirm-delete-test">Удалить</button></div></div>`);}
  if(action==="confirm-delete-test"){const deletedId=pendingDeleteTestId;db.tests=db.tests.filter((test)=>test.id!==deletedId);saveDb(false);if(adminPin){try{const result=await cloudRequest({action:"deleteTest",pin:adminPin,testId:deletedId});applyCloudDb(result.db);}catch{notify("Удалено локально, облако обновится позже");}}pendingDeleteTestId=null;closeModal();renderSection();notify("Тест удалён");}
  if(action==="delete-user"){pendingDeleteUserId=id;const user=db.users.find((item)=>item.id===id&&item.role!=="admin");if(user)openModal(`<div class="confirm-screen"><span class="result-badge retry">!</span><div class="eyebrow">Безвозвратное действие</div><h2 id="modal-title">Удалить сотрудника?</h2><p>Профиль «${escapeHtml(fullName(user))}» и вся история его тестов будут удалены из общей базы.</p><div class="confirm-actions"><button class="soft-button" data-action="close-modal">Отмена</button><button class="primary" data-action="confirm-delete-user">Удалить профиль</button></div></div>`);}
  if(action==="confirm-delete-user"){const deletedId=pendingDeleteUserId;try{const result=await cloudRequest({action:"deleteUser",pin:adminPin,userId:deletedId});applyCloudDb(result.db);pendingDeleteUserId=null;closeModal();renderSection();notify("Сотрудник и его результаты удалены");}catch(error){notify(error.message||"Не удалось удалить сотрудника");}}
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
  if(event.target.id==="course-editor-form"){event.preventDefault();await saveCourseEditor(event.target);}
  if(event.target.id==="daily-result-form"){event.preventDefault();const data=new FormData(event.target);const user=currentUser();user.dailyResults=user.dailyResults||{};const previous=dailyResult(user);user.dailyResults[todayKey()]={...previous,dialogues:Math.max(0,Number(data.get("dialogues"))||0),packages:Math.max(0,Number(data.get("packages"))||0),prospects:Math.max(0,Number(data.get("prospects"))||0),updatedAt:new Date().toISOString()};user.lastActive=new Date().toISOString();saveDb();renderSection();notify("Выполнение плана сохранено");}
  if(event.target.id==="employee-plan-form"){event.preventDefault();const data=new FormData(event.target);const userId=String(data.get("userId"));const date=String(data.get("date"));const plan={dialogues:Math.max(0,Number(data.get("dialogues"))||0),packages:Math.max(0,Number(data.get("packages"))||0),prospects:Math.max(0,Number(data.get("prospects"))||0)};try{const result=await cloudRequest({action:"saveEmployeePlan",pin:adminPin,userId,date,plan});applyCloudDb(result.db);openUserDetail(userId);renderSection();notify("Индивидуальный план сохранён");}catch(error){notify(error.message||"Не удалось сохранить план");}}
});

document.addEventListener("change",async(event)=>{
  const upload=event.target.closest("[data-lesson-upload]");
  if(upload&&upload.files?.[0]){const index=Number(upload.dataset.lessonUpload);const file=upload.files[0];if(file.size>100000){notify("Файл слишком большой — максимум 100 КБ");upload.value="";return;}const content=(await file.text()).slice(0,15000);syncCourseDraftFromForm();courseEditorDraft.lessonItems[index].content=content;renderCourseLessonsEditor();notify(`Материал из «${file.name}» загружен`);return;}
  if(event.target.matches('#employee-plan-form input[name="date"]')){const form=event.target.form;const user=db.users.find((item)=>item.id===form.elements.userId.value);const plan=dailyPlan(user,event.target.value);form.elements.dialogues.value=plan.dialogues;form.elements.packages.value=plan.packages;form.elements.prospects.value=plan.prospects;}
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
    const result=await cloudRequest({action:"bootstrap"}); mergeTests(result.tests); mergeCourses(result.courses); mergeLeaderboard(result.leaderboard); saveDb(false);
    if(currentUserId&&currentUser()?.role!=="admin")syncCurrentState();
  } catch { cloudOnline=false; setCloudStatus("Общая база недоступна — можно продолжить локально"); }
}

if(currentUser()?.role==="admin"&&!adminPin){localStorage.removeItem(SESSION_KEY);currentUserId="";showAuth();}
else if(currentUser())showApp();else showAuth();
bootstrapCloud();
