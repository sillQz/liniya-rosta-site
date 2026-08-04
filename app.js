const DB_KEY = "liniya-rosta-db-v2";
const SESSION_KEY = "liniya-rosta-current-user";
const ADMIN_ID = "admin-nikita-monastyrev";

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
    id:"test-strong-call", title:"Формула сильного звонка", category:"Продажи", description:"Пять шагов уверенного и результативного разговора.", published:true,
    questions:[
      { text:"С чего начинается сильный звонок?", options:["С длинной презентации","С установления контакта","С обсуждения цены"], correct:1 },
      { text:"Что лучше сделать после выявления потребности?", options:["Предложить подходящее решение","Завершить звонок","Повторить приветствие"], correct:0 },
      { text:"Как правильно работать с возражением?", options:["Перебить клиента","Признать сомнение и вернуть ценность","Сразу дать скидку"], correct:1 },
    ],
  },
  {
    id:"test-tariffs", title:"Знание тарифов", category:"Продукт", description:"Проверка понимания продуктовой линейки и подбора предложения.", published:true,
    questions:[
      { text:"Что важно выяснить перед подбором тарифа?", options:["Любимый цвет клиента","Потребности и сценарии использования","Возраст телефона"], correct:1 },
      { text:"Как презентовать тариф?", options:["Перечислить всё подряд","Связать преимущества с потребностью","Назвать только цену"], correct:1 },
      { text:"Что делать, если клиент сомневается в цене?", options:["Показать ценность решения","Спорить","Завершить разговор"], correct:0 },
    ],
  },
  {
    id:"test-objections", title:"Работа с возражениями", category:"Практика", description:"Ситуационные вопросы по сложным моментам разговора.", published:true,
    questions:[
      { text:"Клиент говорит «Я подумаю». Ваш следующий шаг?", options:["Попрощаться","Уточнить, что поможет принять решение","Повторить цену громче"], correct:1 },
      { text:"Клиент говорит «Мне неинтересно». Что делать?", options:["Уточнить причину и потребность","Начать спор","Сразу положить трубку"], correct:0 },
      { text:"Какой тон помогает снять напряжение?", options:["Спокойный и уважительный","Давящий","Безразличный"], correct:0 },
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

function uid(prefix="id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

function adminUser() {
  return { id:ADMIN_ID, firstName:"Никита", lastName:"Монастырёв", role:"admin", adminId:ADMIN_ID, createdAt:new Date().toISOString(), xp:0, streak:0, courseProgress:{}, assignments:{} };
}

function defaultDb() {
  return { version:2, users:[adminUser()], tests:seedTests, attempts:[] };
}

function loadDb() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || "null");
    if (!parsed || parsed.version !== 2) return defaultDb();
    if (!parsed.users.some((user) => user.id === ADMIN_ID)) parsed.users.unshift(adminUser());
    return parsed;
  } catch { return defaultDb(); }
}

function saveDb() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
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

function escapeHtml(value="") {
  return String(value).replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

function login(firstName, lastName) {
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

function showAuth() {
  document.getElementById("auth-screen").classList.remove("is-hidden");
  document.getElementById("app-shell").classList.add("is-hidden");
  document.getElementById("auth-form").reset();
  document.querySelector('#auth-form input[name="fullName"]').focus();
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
    <section class="hero employee-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Следующий шаг · Тест</div><h2>Знания превращаем<br><em>в уверенный результат.</em></h2><p>Пройдите тест «Формула сильного звонка». Результат сразу появится в вашей персональной аналитике.</p><div class="hero-actions"><button class="white-button" data-action="start-test" data-id="test-strong-call">Начать тест <span>→</span></button><span>3 вопроса · 5 минут</span></div></div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="orbit orbit-two"></div><div class="phone"><span>●</span><b>☎</b></div><div class="floating-icon fi-one">✓</div><div class="floating-icon fi-two">↗</div></div><div class="hero-progress"><div class="progress-ring" style="--value:${Math.max(20,m.skill)*3.6}deg"><span><b>${m.skill}%</b><small>навык</small></span></div><p>Средний результат<br><b>${m.avg || "нет тестов"}${m.avg?"%":""}</b></p></div></section>
    <section class="metrics-grid">${metric("◆",m.xp,"баллов опыта",m.xp?"накоплено за обучение":"начните первый тест",m.xp>0)}${metric("✓",`${m.avg}%`,"средний тест",`${m.attempts.length} попыток`,m.avg>=70)}${metric("▰",`${m.courseAvg}%`,"прогресс курсов",`${Object.keys(user.courseProgress||{}).length} активных курсов`,m.courseAvg>0)}${metric("⚡",`${m.streak} дн.`,"серия активности",m.streak>1?"отличный ритм":"первый день")}</section>
    <div class="content-grid"><section class="panel learning-panel"><div class="panel-heading"><div><span>Быстрый доступ</span><h3>Продолжить обучение</h3></div><button data-nav="Курсы">Все курсы →</button></div><div class="quick-grid"><button class="quick-card" data-nav="Курсы"><span>01</span><div><small>Курс</small><b>Сильный звонок</b><em>${user.courseProgress?.["strong-call"] || 0}% пройдено</em></div><i>→</i></button><button class="quick-card" data-nav="Задания"><span>02</span><div><small>Практика</small><b>Учебный звонок</b><em>${user.assignments?.["audio-call"]?"выполнено":"сдать сегодня"}</em></div><i>→</i></button><button class="quick-card" data-nav="Тесты"><span>03</span><div><small>Тест</small><b>Работа с возражениями</b><em>3 вопроса</em></div><i>→</i></button></div></section>
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
    <div class="test-grid">${db.tests.filter((t)=>t.published).map((test)=>{const mine=attempts.filter((a)=>a.testId===test.id);const best=mine.length?Math.max(...mine.map((a)=>a.score)):null;return `<article class="test-card panel"><div class="test-card-top"><span class="test-icon">✓</span><span class="category-chip">${escapeHtml(test.category)}</span></div><h3>${escapeHtml(test.title)}</h3><p>${escapeHtml(test.description)}</p><div class="test-meta"><span>${test.questions.length} вопроса</span><span>${best===null?"Не пройден":`Лучший: ${best}%`}</span></div><button class="primary full" data-action="start-test" data-id="${test.id}">${best===null?"Начать тест":"Пройти ещё раз"} <span>→</span></button></article>`}).join("")}</div>${footer()}</div>`;
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
  const employees=db.users.filter((u)=>u.role!=="admin"); const attempts=db.attempts; const avg=attempts.length?Math.round(attempts.reduce((s,a)=>s+a.score,0)/attempts.length):0; const active=employees.filter((u)=>u.lastActive).length;
  return `<div class="dashboard organizer-view">${pageIntro("Центр управления","Панель руководителя","Сотрудники, обучение и результаты в одном кабинете.",'<button class="primary" data-nav="Тесты"><span>＋</span> Создать тест</button>')}
    <section class="hero organizer-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Единая команда</div><h2>Видеть прогресс.<br><em>Усиливать каждого.</em></h2><p>Открывайте профиль любого сотрудника, смотрите историю тестов и создавайте новые проверки знаний.</p><button class="white-button" data-nav="Сотрудники">Открыть сотрудников <span>→</span></button></div><div class="team-orbit" aria-hidden="true"><div class="leader">НМ<span>${employees.length}</span></div><div class="person p1">АК</div><div class="person p2">ИМ</div><div class="person p3">МЛ</div><div class="person p4">ДС</div><i class="ring r1"></i><i class="ring r2"></i></div></section>
    <section class="metrics-grid">${metric("●",employees.length,"сотрудников",`${active} открывали кабинет`,employees.length>0)}${metric("✓",`${avg}%`,"средний результат",`${attempts.length} попыток`,avg>=70)}${metric("◆",db.tests.length,"теста создано",`${db.tests.filter(t=>t.published).length} опубликовано`)}${metric("↗",employees.reduce((s,u)=>s+(u.xp||0),0),"XP команды","суммарный опыт",true)}</section>
    <div class="content-grid organizer-grid"><section class="panel team-panel"><div class="panel-heading"><div><span>Последние профили</span><h3>Сотрудники</h3></div><button data-nav="Сотрудники">Вся команда →</button></div>${employees.length?employeeTable(employees.slice(-5).reverse()):'<div class="empty-state"><span class="empty-icon">◎</span><b>Пока нет сотрудников</b><p>Новый профиль появится здесь после входа по имени и фамилии.</p></div>'}</section><section class="panel funnel-panel"><div class="panel-heading"><div><span>Контент</span><h3>Быстрые действия</h3></div></div><div class="admin-actions"><button data-action="edit-test" data-id=""><span>＋</span><div><b>Создать тест</b><small>Добавить вопросы и ответы</small></div></button><button data-nav="Тесты"><span>✓</span><div><b>Редактировать тесты</b><small>${db.tests.length} материалов</small></div></button><button data-nav="Сотрудники"><span>●</span><div><b>Открыть аналитику</b><small>По каждому человеку</small></div></button></div></section></div>${footer()}</div>`;
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
    <div class="admin-test-list">${db.tests.map((test)=>`<article class="admin-test-card panel"><span class="test-icon">✓</span><div class="admin-test-copy"><small>${escapeHtml(test.category)} · ${test.questions.length} вопроса</small><h3>${escapeHtml(test.title)}</h3><p>${escapeHtml(test.description)}</p></div><span class="publish-chip ${test.published?"live":""}">${test.published?"Опубликован":"Черновик"}</span><div class="card-actions"><button data-action="preview-test" data-id="${test.id}">Просмотр</button><button data-action="edit-test" data-id="${test.id}">Редактировать</button><button class="danger-link" data-action="delete-test" data-id="${test.id}">Удалить</button></div></article>`).join("")}</div>${footer()}</div>`;
}

function adminCourses() {
  return `<div class="dashboard">${pageIntro("Учебная программа","Курсы","Обзор материалов, доступных всей команде.")}
    <div class="catalog-grid">${courses.map((course)=>`<article class="catalog-card panel"><span class="course-art large"><b>${course.number}</b><i>${course.icon}</i></span><div class="catalog-copy"><small>${course.category} · ${course.lessons} уроков</small><h3>${course.title}</h3><p>${course.description}</p><button class="soft-button" data-notify="Редактор курсов будет добавлен следующим этапом">Настроить курс <span>→</span></button></div></article>`).join("")}</div>${footer()}</div>`;
}

function adminSettings() {
  return `<div class="dashboard">${pageIntro("Управление","Настройки","Параметры владельца команды и локальных данных.")}
    <div class="settings-grid"><section class="panel settings-card"><span class="metric-icon">НМ</span><div><small>Главный администратор</small><h3>Никита Монастырёв</h3><p>Все новые сотрудники автоматически прикрепляются к этому профилю.</p></div></section><section class="panel settings-card"><span class="metric-icon">⇩</span><div><small>Резервная копия</small><h3>Экспорт данных</h3><p>Сохраните пользователей, тесты и результаты в одном JSON-файле.</p><button class="soft-button" data-action="export-data">Скачать данные <span>→</span></button></div></section><section class="panel settings-card"><span class="metric-icon">⌂</span><div><small>Хранение</small><h3>Этот браузер</h3><p>Данные доступны только на текущем устройстве. Для общей базы потребуется облачное подключение.</p></div></section></div>${footer()}</div>`;
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
    db.attempts.push({id:uid("attempt"),userId:currentUserId,testId:test.id,score,correct,total:test.questions.length,date:new Date().toISOString()});
    const user=currentUser(); user.xp=(user.xp||0)+score*2; user.streak=Math.max(1,user.streak||1); user.lastActive=new Date().toISOString(); saveDb();
  }
  testSession=null; selectedAnswer=null;
  openModal(`<div class="result-screen"><span class="result-badge ${score>=70?"success":"retry"}">${score>=70?"✓":"↗"}</span><div class="eyebrow">${preview?"Предпросмотр завершён":"Результат сохранён"}</div><h2 id="modal-title">${score}%</h2><h3>${score>=80?"Отличный результат!":score>=60?"Хорошая база":"Попробуйте ещё раз"}</h3><p>Правильных ответов: <b>${correct} из ${test.questions.length}</b>${preview?"":"<br>Результат добавлен в вашу аналитику."}</p><button class="primary full" data-action="close-and-render">Вернуться в кабинет <span>→</span></button></div>`);
}

function openTestEditor(testId="") {
  const existing=testId?testById(testId):null;
  editorDraft=existing?JSON.parse(JSON.stringify(existing)):{id:"",title:"",category:"Продажи",description:"",published:true,questions:[{text:"",options:["","",""],correct:0}]};
  openModal(`<form id="test-editor-form"><div class="editor-head"><div><div class="eyebrow">Конструктор тестов</div><h2 id="modal-title">${existing?"Редактировать":"Новый"} <em>тест</em></h2></div><label class="publish-toggle"><input type="checkbox" name="published" ${editorDraft.published?"checked":""}><span>Опубликовать</span></label></div><div class="form-grid"><label>Название<input name="title" required value="${escapeHtml(editorDraft.title)}" placeholder="Например, Сильный звонок"></label><label>Категория<select name="category">${["Продажи","Продукт","Практика","Скрипты"].map((c)=>`<option ${c===editorDraft.category?"selected":""}>${c}</option>`).join("")}</select></label></div><label>Описание<textarea name="description" rows="2" placeholder="Что проверяет этот тест">${escapeHtml(editorDraft.description)}</textarea></label><div class="question-editor-head"><div><small>Вопросы</small><b id="question-count">${editorDraft.questions.length}</b></div><button type="button" class="soft-button" data-action="add-question">＋ Добавить вопрос</button></div><div id="question-editor"></div><button class="primary full" type="submit">Сохранить тест <span>→</span></button></form>`,true);
  renderEditorQuestions();
}

function renderEditorQuestions() {
  const container=document.getElementById("question-editor"); if(!container||!editorDraft) return;
  document.getElementById("question-count").textContent=editorDraft.questions.length;
  container.innerHTML=editorDraft.questions.map((q,index)=>`<section class="question-block"><div class="question-block-head"><span>${String(index+1).padStart(2,"0")}</span><b>Вопрос ${index+1}</b>${editorDraft.questions.length>1?`<button type="button" data-action="remove-question" data-index="${index}">Удалить</button>`:""}</div><label>Текст вопроса<input name="q${index}text" required value="${escapeHtml(q.text)}" placeholder="Введите вопрос"></label><div class="option-grid">${q.options.map((option,oi)=>`<label>Ответ ${String.fromCharCode(65+oi)}<input name="q${index}a${oi}" required value="${escapeHtml(option)}" placeholder="Вариант ответа"></label>`).join("")}</div><label class="correct-select">Правильный ответ<select name="q${index}correct">${q.options.map((_,oi)=>`<option value="${oi}" ${oi===q.correct?"selected":""}>${String.fromCharCode(65+oi)}</option>`).join("")}</select></label></section>`).join("");
}

function syncEditorDraftFromForm() {
  const form=document.getElementById("test-editor-form");
  if(!form||!editorDraft)return;
  const data=new FormData(form);
  editorDraft.questions=editorDraft.questions.map((q,index)=>({
    text:String(data.get(`q${index}text`)??q.text),
    options:[0,1,2].map((oi)=>String(data.get(`q${index}a${oi}`)??q.options[oi])),
    correct:Number(data.get(`q${index}correct`)??q.correct)
  }));
}

function saveTestEditor(form) {
  const data=new FormData(form); const questions=editorDraft.questions.map((_,index)=>({text:String(data.get(`q${index}text`)).trim(),options:[0,1,2].map((oi)=>String(data.get(`q${index}a${oi}`)).trim()),correct:Number(data.get(`q${index}correct`))}));
  if(questions.some((q)=>!q.text||q.options.some((a)=>!a))){notify("Заполните все вопросы и варианты ответов");return;}
  const saved={id:editorDraft.id||uid("test"),title:String(data.get("title")).trim(),category:String(data.get("category")),description:String(data.get("description")).trim(),published:data.get("published")==="on",questions,updatedAt:new Date().toISOString()};
  const index=db.tests.findIndex((test)=>test.id===saved.id); if(index>=0)db.tests[index]=saved;else db.tests.unshift(saved); saveDb(); closeModal(); renderSection(); notify(`Тест «${saved.title}» сохранён`);
}

function openUserDetail(userId) {
  const user=db.users.find((item)=>item.id===userId); if(!user)return; const m=userMetrics(user); const attempts=m.attempts.slice().sort((a,b)=>b.date.localeCompare(a.date));
  openModal(`<div class="user-detail-head"><span class="detail-avatar">${initials(user)}</span><div><div class="eyebrow">Профиль сотрудника</div><h2 id="modal-title">${escapeHtml(fullName(user))}</h2><p>Профиль создан ${formatDate(user.createdAt)}</p></div></div><div class="detail-metrics"><div><strong>${m.skill}</strong><small>навык</small></div><div><strong>${m.avg}%</strong><small>тесты</small></div><div><strong>${m.courseAvg}%</strong><small>курсы</small></div><div><strong>${m.xp}</strong><small>XP</small></div></div><div class="panel-heading detail-heading"><div><span>История</span><h3>Результаты тестов</h3></div></div>${attempts.length?`<div class="attempt-list">${attempts.map((a)=>`<div><span class="score-dot ${a.score>=70?"good":""}">${a.score}%</span><p><b>${escapeHtml(testById(a.testId)?.title||"Удалённый тест")}</b><small>${formatDate(a.date)} · ${a.correct} из ${a.total}</small></p></div>`).join("")}</div>`:'<div class="empty-state"><b>Тесты ещё не пройдены</b><p>Результаты появятся после первой попытки.</p></div>'}<button class="soft-button full" data-action="close-modal">Закрыть профиль</button>`,true);
}

function exportData() {
  const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download=`liniya-rosta-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(url); notify("Резервная копия скачана");
}

document.addEventListener("click",(event)=>{
  const nav=event.target.closest("[data-nav]");
  if(nav){activeSection=nav.dataset.nav;renderNav();renderSection();window.scrollTo({top:0,behavior:"smooth"});return;}
  const note=event.target.closest("[data-notify]"); if(note){notify(note.dataset.notify);return;}
  const answer=event.target.closest("[data-answer]"); if(answer){selectedAnswer=Number(answer.dataset.answer);document.querySelectorAll("[data-answer]").forEach((button)=>button.classList.toggle("selected",button===answer));document.querySelector('[data-action="next-question"]').disabled=false;return;}
  const target=event.target.closest("[data-action]"); if(!target)return; const action=target.dataset.action; const id=target.dataset.id||"";
  if(action==="home"){activeSection=currentUser().role==="admin"?"Обзор":"Главная";renderNav();renderSection();}
  if(action==="switch-user"){localStorage.removeItem(SESSION_KEY);currentUserId="";activeSection="";showAuth();}
  if(action==="close-modal")closeModal();
  if(action==="close-and-render"){closeModal();renderSection();}
  if(action==="start-test")startTest(id,false);
  if(action==="preview-test")startTest(id,true);
  if(action==="next-question"){testSession.answers[testSession.index]=selectedAnswer;if(testSession.index===testById(testSession.testId).questions.length-1)finishTest();else{testSession.index++;selectedAnswer=null;renderTestQuestion();}}
  if(action==="advance-course"){const user=currentUser();user.courseProgress=user.courseProgress||{};user.courseProgress[id]=Math.min(100,(user.courseProgress[id]||0)+15);user.xp=(user.xp||0)+30;user.lastActive=new Date().toISOString();saveDb();renderSection();notify(`Прогресс курса: ${user.courseProgress[id]}%`);}
  if(action==="toggle-assignment"){const user=currentUser();user.assignments=user.assignments||{};const was=!!user.assignments[id];user.assignments[id]=!was;const item=assignments.find((a)=>a.id===id);user.xp=Math.max(0,(user.xp||0)+(was?-item.points:item.points));saveDb();renderSection();notify(was?"Задание возвращено в работу":"Задание выполнено — XP начислены");}
  if(action==="edit-test")openTestEditor(id);
  if(action==="add-question"){syncEditorDraftFromForm();editorDraft.questions.push({text:"",options:["","",""],correct:0});renderEditorQuestions();}
  if(action==="remove-question"){syncEditorDraftFromForm();const index=Number(target.dataset.index);editorDraft.questions.splice(index,1);renderEditorQuestions();}
  if(action==="delete-test"){pendingDeleteTestId=id;const test=testById(id);openModal(`<div class="confirm-screen"><span class="result-badge retry">!</span><div class="eyebrow">Подтверждение</div><h2 id="modal-title">Удалить тест?</h2><p>«${escapeHtml(test.title)}» исчезнет из каталога. Уже сохранённые результаты сотрудников останутся в истории.</p><div class="confirm-actions"><button class="soft-button" data-action="close-modal">Отмена</button><button class="primary" data-action="confirm-delete-test">Удалить</button></div></div>`);}
  if(action==="confirm-delete-test"){db.tests=db.tests.filter((test)=>test.id!==pendingDeleteTestId);saveDb();pendingDeleteTestId=null;closeModal();renderSection();notify("Тест удалён");}
  if(action==="user-detail")openUserDetail(id);
  if(action==="export-data")exportData();
});

document.addEventListener("submit",(event)=>{
  if(event.target.id==="auth-form"){
    event.preventDefault();
    const input=event.target.elements.fullName;
    const parts=String(input.value).trim().split(/\s+/).filter(Boolean);
    input.setCustomValidity(parts.length<2?"Введите имя и фамилию":"");
    if(parts.length<2){input.reportValidity();return;}
    login(parts[0],parts.slice(1).join(" "));
  }
  if(event.target.id==="test-editor-form"){event.preventDefault();saveTestEditor(event.target);}
});

document.getElementById("modal-backdrop").addEventListener("click",(event)=>{if(event.target.id==="modal-backdrop")closeModal();});
document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closeModal();if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();if(currentUser()?.role!=="admin"){activeSection="Тесты";renderNav();renderSection();}}});

if(currentUser())showApp();else showAuth();
