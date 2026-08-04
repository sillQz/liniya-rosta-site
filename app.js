const STORAGE_KEY = "liniya-rosta-state-v1";

const defaults = {
  role: "employee",
  active: "Главная",
  lessonProgress: 72,
  filter: "Все",
  created: [],
};

let state = loadState();
let selectedAnswer = null;
let toastTimer = null;

const employeeNav = [
  ["⌂", "Главная"], ["▰", "Моё обучение"], ["✓", "Тесты"], ["□", "Задания"], ["★", "Рейтинг"],
];
const organizerNav = [
  ["⌂", "Обзор"], ["▰", "Команда"], ["✓", "Контент"], ["□", "Аналитика"], ["★", "Настройки"],
];

const courses = [
  { title: "Сильный звонок", tag: "Курс", progress: 72, meta: "Урок 6 из 8", number: "01", action: "lesson", icon: "☎" },
  { title: "Работа с возражениями", tag: "Практика", progress: 48, meta: "4 кейса осталось", number: "02", action: "lesson", icon: "☎" },
  { title: "Продукты МТС", tag: "Тест", progress: 88, meta: "Повторить 3 вопроса", number: "03", action: "test", icon: "✓" },
];

const team = [
  { name: "Анна Воронова", initials: "АВ", score: 94, progress: 91, calls: 128, trend: "+12%", status: "Лидер" },
  { name: "Илья Максимов", initials: "ИМ", score: 87, progress: 76, calls: 116, trend: "+6%", status: "В норме" },
  { name: "Мария Лебедева", initials: "МЛ", score: 82, progress: 68, calls: 104, trend: "+3%", status: "В норме" },
  { name: "Денис Серов", initials: "ДС", score: 71, progress: 43, calls: 89, trend: "−8%", status: "Нужна помощь" },
];

function loadState() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return { ...defaults }; }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* file:// may block storage in strict browsers */ }
}

function metric(icon, value, label, note, positive = false) {
  return `<article class="metric-card panel"><span class="metric-icon">${icon}</span><div><strong>${value}</strong><b>${label}</b><small class="${positive ? "positive" : ""}">${positive ? "↗ " : ""}${note}</small></div></article>`;
}

function render() {
  document.querySelectorAll("[data-role]").forEach((button) => button.classList.toggle("active", button.dataset.role === state.role));
  document.getElementById("profile-role").textContent = state.role === "employee" ? "Оператор" : "Организатор";
  renderNav();
  document.getElementById("dashboard").innerHTML = state.role === "employee" ? employeeView() : organizerView();
}

function renderNav() {
  const items = state.role === "employee" ? employeeNav : organizerNav;
  document.getElementById("sidebar-nav").innerHTML = items.map(([icon, label]) => `
    <button data-nav="${label}" class="${state.active === label ? "active" : ""}"><span class="ui-icon">${icon}</span><span>${label}</span></button>
  `).join("");
}

function employeeView() {
  const today = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const courseRows = courses.map((course) => `
    <button class="course-row" data-course-tag="${course.tag}" data-action="${course.action}">
      <span class="course-art"><b>${course.number}</b><i>${course.icon}</i></span>
      <span class="course-copy"><small>${course.tag}</small><b>${course.title}</b><em>${course.meta}</em></span>
      <span class="course-progress"><span><i style="width:${course.progress}%"></i></span><b>${course.progress}%</b></span>
      <span class="arrow">→</span>
    </button>`).join("");

  return `<div class="dashboard employee-view">
    <div class="page-intro"><div><span>${today}</span><h1>Добрый день, Алексей</h1><p>Сегодня отличный день, чтобы стать сильнее в продажах.</p></div><button class="search-button" data-notify="Поиск по материалам открыт"><span class="ui-icon">⌕</span><span>Найти материал</span><kbd>Ctrl K</kbd></button></div>
    <section class="hero employee-hero">
      <div class="hero-content"><div class="eyebrow light"><span></span> Фокус дня · Навык №1</div><h2>Не читай скрипт —<br><em>управляй разговором.</em></h2><p>Продолжите курс «Сильный звонок» и отработайте три сценария ответа на возражения.</p><div class="hero-actions"><button class="white-button" data-action="lesson">Продолжить урок <span>→</span></button><span>12 минут</span></div></div>
      <div class="hero-visual" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="phone"><span>●</span><b>☎</b></div><div class="floating-icon fi-one">✓</div><div class="floating-icon fi-two">↗</div></div>
      <div class="hero-progress"><div class="progress-ring" style="--value:${state.lessonProgress * 3.6}deg"><span><b>${state.lessonProgress}%</b><small>пройдено</small></span></div><p>До сертификата<br><b>${state.lessonProgress >= 90 ? "последний шаг" : "ещё 2 урока"}</b></p></div>
    </section>
    <section class="metrics-grid">
      ${metric("◆", "1 840", "баллов опыта", "+120 за неделю", true)}
      ${metric("✓", "86%", "средний тест", "лучше 78% команды", true)}
      ${metric("↗", "+14%", "рост конверсии", "за последние 30 дней", true)}
      ${metric("⚡", "7 дней", "серия обучения", "личный рекорд: 12")}
    </section>
    <div class="content-grid">
      <section class="panel learning-panel"><div class="panel-heading"><div><span>Моё обучение</span><h3>Продолжить путь</h3></div><button data-notify="Открыт полный каталог">Все материалы →</button></div><div class="filters">${["Все","Курс","Тест","Практика"].map((f) => `<button data-filter="${f}" class="${state.filter === f ? "active" : ""}">${f === "Курс" ? "Курсы" : f === "Тест" ? "Тесты" : f}</button>`).join("")}</div><div class="course-list">${courseRows}</div></section>
      <section class="panel skill-panel"><div class="panel-heading"><div><span>Профиль навыков</span><h3>Вы растёте</h3></div><button class="period" data-notify="Период: 30 дней">30 дней ⌄</button></div><div class="skill-score"><div><strong>82</strong><small>из 100</small></div><p><b>+8 пунктов</b><br>с прошлого месяца</p></div><div class="skill-bars">${[["Контакт",91],["Потребность",84],["Презентация",78],["Возражения",69],["Закрытие",86]].map(([name,value]) => `<div><span>${name}<b>${value}</b></span><i><em style="width:${value}%"></em></i></div>`).join("")}</div><button class="soft-button" data-notify="Персональный план сформирован">Открыть план развития <span>→</span></button></section>
    </div>
    <section class="panel week-panel"><div class="week-title"><span class="red-icon">◎</span><div><span>Активность</span><h3>Ваш ритм обучения</h3></div></div><div class="week-chart">${[["Пн",35],["Вт",70],["Ср",48],["Чт",92],["Пт",76],["Сб",24],["Вс",58]].map(([day,height],i) => `<div><span class="${i === 3 ? "peak" : ""}" style="height:${height}%"><b>${i === 3 ? "48 мин" : ""}</b></span><small>${day}</small></div>`).join("")}</div><div class="week-insight"><span>⚡</span><p><b>Лучшее время — 10:00–12:00</b><br>В это время вы усваиваете материал на 23% лучше.</p></div></section>
    ${footer()}
  </div>`;
}

function organizerView() {
  const created = state.created.map((title) => `<button class="studio-card draft" data-action="create"><span class="studio-icon">✦</span><small>Черновик · сохранён локально</small><b>${escapeHtml(title)}</b><em>Продолжить создание →</em></button>`).join("");
  const rows = team.map((member) => `<tr><td><span class="table-avatar">${member.initials}</span><span><b>${member.name}</b><small>${member.status}</small></span></td><td><b>${member.score}</b><small>/100</small></td><td><div class="table-progress"><i style="width:${member.progress}%"></i></div><small>${member.progress}%</small></td><td>${member.calls}</td><td class="${member.trend.startsWith("−") ? "down" : "up"}">${member.trend}</td><td><button data-notify="Открыт профиль: ${member.name}">•••</button></td></tr>`).join("");

  return `<div class="dashboard organizer-view">
    <div class="page-intro"><div><span>Центр управления обучением</span><h1>Команда на линии</h1><p>Следите за ростом, находите точки внимания и запускайте обучение.</p></div><button class="primary" data-action="create"><span>＋</span> Создать материал</button></div>
    <section class="hero organizer-hero"><div class="hero-content"><div class="eyebrow light"><span></span> Итоги недели</div><h2>Команда растёт.<br><em>Конверсия тоже.</em></h2><p>18 из 24 сотрудников выполнили недельный план обучения. Средняя конверсия выросла на 7,4%.</p><button class="white-button" data-notify="Подробный отчёт подготовлен">Смотреть отчёт <span>→</span></button></div><div class="team-orbit" aria-hidden="true"><div class="leader">НП<span>94</span></div><div class="person p1">АК</div><div class="person p2">ИМ</div><div class="person p3">МЛ</div><div class="person p4">ДС</div><i class="ring r1"></i><i class="ring r2"></i></div><div class="hero-badge"><span>↗</span><div><b>+7,4%</b><small>конверсия</small></div></div></section>
    <section class="metrics-grid">
      ${metric("●", "24", "сотрудника", "22 активны сегодня", true)}
      ${metric("✓", "78%", "план обучения", "+11% к прошлой неделе", true)}
      ${metric("★", "84", "индекс навыков", "цель месяца — 87")}
      ${metric("↗", "18,6%", "конверсия", "+7,4% за неделю", true)}
    </section>
    <div class="content-grid organizer-grid">
      <section class="panel team-panel"><div class="panel-heading"><div><span>Команда</span><h3>Результаты сотрудников</h3></div><button data-notify="Полный список сотрудников открыт">Вся команда →</button></div><div class="table-scroll"><table><thead><tr><th>Сотрудник</th><th>Навык</th><th>Обучение</th><th>Звонки</th><th>Динамика</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <section class="panel funnel-panel"><div class="panel-heading"><div><span>Эффективность</span><h3>Воронка звонка</h3></div><button class="period" data-notify="Период изменён">Неделя ⌄</button></div><div class="funnel"><div style="width:100%"><span>Контакт</span><b>1 284</b></div><div style="width:82%"><span>Диалог</span><b>1 053</b></div><div style="width:55%"><span>Интерес</span><b>706</b></div><div style="width:31%"><span>Заявка</span><b>398</b></div></div><div class="funnel-note"><span>!</span><p><b>Точка роста</b><br>Переход «Интерес → Заявка» ниже цели на 4%.</p></div></section>
    </div>
    <section class="panel content-studio"><div class="panel-heading"><div><span>Контент-студия</span><h3>Обучение команды</h3></div><button data-action="create">＋ Новый материал</button></div><div class="studio-grid">${created}<button class="studio-card" data-notify="Открыт курс «Сильный звонок»"><span class="studio-icon">☎</span><small>Курс · 8 уроков</small><b>Сильный звонок</b><em>18 проходят · 72%</em></button><button class="studio-card" data-action="test"><span class="studio-icon">✓</span><small>Тест · 15 вопросов</small><b>Знание тарифов</b><em>Средний балл · 86%</em></button><button class="studio-card" data-notify="Открыто практическое задание"><span class="studio-icon">◎</span><small>Задание · аудио</small><b>Разбор звонка</b><em>9 ждут проверки</em></button><button class="studio-card add-card" data-action="create"><span>＋</span><b>Создать с нуля</b><small>Курс, тест или задание</small></button></div></section>
    ${footer()}
  </div>`;
}

function footer() {
  return `<footer class="site-footer"><span>Линия роста · демо-кабинет телемаркетинга</span><span class="local-badge">✓ Работает локально</span></footer>`;
}

function openModal(type) {
  selectedAnswer = null;
  const content = document.getElementById("modal-content");
  if (type === "lesson") content.innerHTML = `<div class="eyebrow">Урок 6 · 12 минут</div><h2 id="modal-title">Снимаем возражение<br><em>«Мне дорого»</em></h2><div class="lesson-card"><span class="lesson-number">01</span><div><small>Не спорьте с клиентом</small><p>Признайте сомнение: «Понимаю, цена действительно важна».</p></div></div><div class="lesson-card"><span class="lesson-number">02</span><div><small>Верните ценность</small><p>Свяжите тариф с задачей клиента и назовите выгоду в месяц.</p></div></div><button class="primary full" data-action="complete-lesson">Завершить урок <span>→</span></button>`;
  if (type === "test") content.innerHTML = `<div class="eyebrow">Быстрая проверка · 1 из 3</div><h2 id="modal-title">Что сказать после<br><em>«Я подумаю»?</em></h2><div class="answers">${["Хорошо, до свидания","Что именно поможет вам принять решение?","Предложить самый дорогой тариф"].map((answer,i) => `<button data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${answer}</button>`).join("")}</div><button class="primary full" data-action="check-answer" disabled>Проверить ответ</button>`;
  if (type === "create") content.innerHTML = `<form id="create-form"><div class="eyebrow">Конструктор контента</div><h2 id="modal-title">Новый материал<br><em>для команды</em></h2><label>Тип<select name="type"><option>Курс</option><option>Тест</option><option>Задание</option></select></label><label>Название<input name="title" required placeholder="Например, Продажи без давления"></label><label>Описание<textarea name="description" rows="3" placeholder="Коротко опишите цель материала"></textarea></label><div class="form-grid"><label>Срок<input type="date" name="date"></label><label>Баллы<input type="number" name="points" value="100"></label></div><button class="primary full" type="submit">Сохранить черновик <span>→</span></button></form>`;
  document.getElementById("modal-backdrop").classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.remove("is-open");
  document.body.style.overflow = "";
}

function notify(message) {
  const toast = document.getElementById("toast");
  toast.querySelector("p").textContent = message;
  toast.classList.add("is-open");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-open"), 2600);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char]));
}

document.addEventListener("click", (event) => {
  const roleButton = event.target.closest("[data-role]");
  if (roleButton) {
    state.role = roleButton.dataset.role;
    state.active = state.role === "employee" ? "Главная" : "Обзор";
    saveState(); render(); return;
  }
  const navButton = event.target.closest("[data-nav]");
  if (navButton) { state.active = navButton.dataset.nav; saveState(); renderNav(); notify(`Раздел «${state.active}» выбран`); return; }
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    state.filter = filterButton.dataset.filter; saveState();
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("active", button === filterButton));
    document.querySelectorAll("[data-course-tag]").forEach((row) => row.classList.toggle("is-hidden", state.filter !== "Все" && row.dataset.courseTag !== state.filter));
    return;
  }
  const answerButton = event.target.closest("[data-answer]");
  if (answerButton) {
    selectedAnswer = Number(answerButton.dataset.answer);
    document.querySelectorAll("[data-answer]").forEach((button) => button.classList.toggle("selected", button === answerButton));
    document.querySelector('[data-action="check-answer"]').disabled = false; return;
  }
  const notifyButton = event.target.closest("[data-notify]");
  if (notifyButton) { notify(notifyButton.dataset.notify); return; }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (["lesson","test","create"].includes(action)) openModal(action);
  if (action === "close-modal") closeModal();
  if (action === "home") { state.active = state.role === "employee" ? "Главная" : "Обзор"; saveState(); renderNav(); notify("Вы на главной"); }
  if (action === "complete-lesson") { state.lessonProgress = Math.min(100, state.lessonProgress + 9); saveState(); closeModal(); render(); notify("Урок завершён — прогресс обновлён"); }
  if (action === "check-answer") { const correct = selectedAnswer === 1; closeModal(); notify(correct ? "Верно! +20 XP" : "Почти. Посмотрите разбор в курсе"); }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "create-form") return;
  event.preventDefault();
  const title = new FormData(event.target).get("title").toString().trim();
  state.created.unshift(title); saveState(); closeModal(); render(); notify(`«${title}» сохранён в черновики`);
});

document.getElementById("modal-backdrop").addEventListener("click", (event) => { if (event.target.id === "modal-backdrop") closeModal(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); notify("Поиск по материалам открыт"); }
});

render();
