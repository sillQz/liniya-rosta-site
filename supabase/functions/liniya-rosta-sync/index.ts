import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_ID = "admin-nikita-monastyrev";
const DB_VERSION = 6;
const MAX_USERS = 5000;
const MAX_TESTS = 1000;
const MAX_COURSES = 1000;
const MAX_ATTEMPTS = 20000;
const ALLOWED_ORIGINS = new Set(["https://sillqz.github.io", "null"]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    ...(ALLOWED_ORIGINS.has(origin) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json; charset=utf-8" },
  });

const asArray = (value: unknown, limit: number) =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === "object").slice(0, limit) : [];

const cleanText = (value: unknown, max = 120) =>
  String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);

const cleanLongText = (value: unknown, max = 15000) =>
  String(value ?? "").replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);

const cleanUrl = (value: unknown) => {
  const candidate = cleanText(value, 500);
  if (!candidate) return "";
  try { const url = new URL(candidate); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; } catch { return ""; }
};

const normalizeName = (value: unknown) =>
  cleanText(value, 250).toLocaleLowerCase("ru-RU").replaceAll("ё", "е").replace(/\s+/g, " ").trim();

const nameOf = (user: Record<string, unknown>) =>
  normalizeName(`${cleanText(user.firstName)} ${cleanText(user.lastName)}`);

const isAdminName = (firstName: unknown, lastName: unknown) => {
  const value = normalizeName(`${cleanText(firstName)} ${cleanText(lastName)}`);
  return value === "никита монастырев" || value === "монастырев никита";
};

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().replaceAll("-", "").slice(0, 14)}`;

function cleanDailyMap(value: unknown, includeApplications = false) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)).slice(-400).map(([date, raw]) => {
    const item = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
    return [date, {
      dialogues: Math.max(0, Math.min(10000, Number(item.dialogues) || 0)),
      packages: Math.max(0, Math.min(1000, Number(item.packages) || 0)),
      prospects: Math.max(0, Math.min(10000, Number(item.prospects) || 0)),
      ...(includeApplications ? { acceptedApplications: Math.max(0, Math.min(1000, Number(item.acceptedApplications) || 0)), updatedAt: cleanText(item.updatedAt, 50) } : {}),
    }];
  }));
}

function cleanLessonProgress(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, MAX_COURSES).map(([courseId, lessons]) => [cleanText(courseId, 160), Array.isArray(lessons) ? [...new Set(lessons.map((id) => cleanText(id, 160)).filter(Boolean))].slice(0, 100) : []]).filter(([courseId]) => courseId));
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function employeeUser(input: Record<string, unknown>, id?: string) {
  const firstName = cleanText(input.firstName, 80);
  const lastName = cleanText(input.lastName, 80);
  if (!firstName || !lastName) throw new Error("Укажите имя и фамилию");
  const now = new Date().toISOString();
  return {
    ...input,
    id: cleanText(id || input.id || newId("user"), 160),
    firstName,
    lastName,
    role: "employee",
    adminId: ADMIN_ID,
    createdAt: cleanText(input.createdAt, 50) || now,
    lastActive: now,
    xp: Math.max(0, Number(input.xp) || 0),
    streak: Math.max(0, Number(input.streak) || 0),
    courseProgress: input.courseProgress && typeof input.courseProgress === "object" ? input.courseProgress : {},
    lessonProgress: cleanLessonProgress(input.lessonProgress),
    assignments: input.assignments && typeof input.assignments === "object" ? input.assignments : {},
    dailyPlans: cleanDailyMap(input.dailyPlans),
    dailyResults: cleanDailyMap(input.dailyResults, true),
  };
}

function mergeEmployee(existing: Record<string, unknown> | null, incoming: Record<string, unknown>, id: string, allowPlanWrites = false) {
  const base = existing || {};
  const next = employeeUser({ ...base, ...incoming }, id);
  next.createdAt = cleanText(base.createdAt || incoming.createdAt, 50) || new Date().toISOString();
  next.xp = Math.max(Number(base.xp) || 0, Number(incoming.xp) || 0);
  next.streak = Math.max(Number(base.streak) || 0, Number(incoming.streak) || 0);
  next.courseProgress = {
    ...(base.courseProgress && typeof base.courseProgress === "object" ? base.courseProgress : {}),
    ...(incoming.courseProgress && typeof incoming.courseProgress === "object" ? incoming.courseProgress : {}),
  };
  next.assignments = {
    ...(base.assignments && typeof base.assignments === "object" ? base.assignments : {}),
    ...(incoming.assignments && typeof incoming.assignments === "object" ? incoming.assignments : {}),
  };
  next.lessonProgress = cleanLessonProgress({
    ...(base.lessonProgress && typeof base.lessonProgress === "object" ? base.lessonProgress : {}),
    ...(incoming.lessonProgress && typeof incoming.lessonProgress === "object" ? incoming.lessonProgress : {}),
  });
  next.dailyPlans = allowPlanWrites
    ? cleanDailyMap({
      ...(base.dailyPlans && typeof base.dailyPlans === "object" ? base.dailyPlans : {}),
      ...(incoming.dailyPlans && typeof incoming.dailyPlans === "object" ? incoming.dailyPlans : {}),
    })
    : cleanDailyMap(base.dailyPlans || incoming.dailyPlans);
  next.dailyResults = allowPlanWrites
    ? cleanDailyMap(base.dailyResults || incoming.dailyResults, true)
    : cleanDailyMap({
      ...(base.dailyResults && typeof base.dailyResults === "object" ? base.dailyResults : {}),
      ...(incoming.dailyResults && typeof incoming.dailyResults === "object" ? incoming.dailyResults : {}),
    }, true);
  return next;
}

function cleanCourse(input: Record<string, unknown>) {
  const title = cleanText(input.title, 100);
  const description = cleanText(input.description, 500);
  if (!title || !description) throw new Error("Заполните название и описание курса");
  const lessonItems = asArray(input.lessonItems, 100).map((raw, index) => {
    const lesson = raw as Record<string, unknown>;
    const lessonTitle = cleanText(lesson.title, 120);
    const content = cleanLongText(lesson.content, 15000);
    if (!lessonTitle || !content) throw new Error(`Заполните название и материал урока ${index + 1}`);
    return {
      id: cleanText(lesson.id || newId("lesson"), 160),
      title: lessonTitle,
      duration: cleanText(lesson.duration || "7 мин", 30),
      content,
      keyPoints: Array.isArray(lesson.keyPoints) ? lesson.keyPoints.map((item) => cleanText(item, 240)).filter(Boolean).slice(0, 12) : [],
      resourceUrl: cleanUrl(lesson.resourceUrl),
    };
  });
  return {
    id: cleanText(input.id || newId("course"), 160),
    number: cleanText(input.number || "01", 4),
    icon: cleanText(input.icon || "▰", 4),
    title,
    category: cleanText(input.category || "Продажи", 50),
    lessons: lessonItems.length || Math.max(1, Math.min(100, Number(input.lessons) || 1)),
    description,
    published: input.published !== false,
    lessonItems,
    updatedAt: new Date().toISOString(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method === "GET") return json(req, { ok: true, service: "liniya-rosta-sync", storesIp: false });
  if (req.method !== "POST") return json(req, { ok: false, error: "Метод не поддерживается" }, 405);

  try {
    const origin = req.headers.get("origin") || "";
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json(req, { ok: false, error: "Источник запроса не разрешён" }, 403);
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    const suppliedKey = req.headers.get("apikey") || "";
    if (!publishableKeys.default || suppliedKey !== publishableKeys.default) {
      return json(req, { ok: false, error: "Ключ приложения недействителен" }, 401);
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const serverKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serverKey) throw new Error("Серверная конфигурация Supabase недоступна");
    const db = createClient(supabaseUrl, serverKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const body = await req.json().catch(() => ({}));
    const action = cleanText(body?.action, 40);

    async function allUsers() {
      const { data, error } = await db.from("lr_users").select("data").order("updated_at", { ascending: true }).limit(MAX_USERS);
      if (error) throw error;
      return (data || []).map((row) => row.data).filter(Boolean);
    }

    async function allTests() {
      const { data, error } = await db.from("lr_tests").select("data").order("updated_at", { ascending: true }).limit(MAX_TESTS);
      if (error) throw error;
      return (data || []).map((row) => row.data).filter(Boolean);
    }

    async function allCourses() {
      const { data, error } = await db.from("lr_courses").select("data").order("updated_at", { ascending: true }).limit(MAX_COURSES);
      if (error) throw error;
      return (data || []).map((row) => row.data).filter(Boolean);
    }

    async function allAttempts() {
      const { data, error } = await db.from("lr_attempts").select("data").order("updated_at", { ascending: true }).limit(MAX_ATTEMPTS);
      if (error) throw error;
      return (data || []).map((row) => row.data).filter(Boolean);
    }

    async function attemptsFor(userId: string) {
      const { data, error } = await db.from("lr_attempts").select("data").eq("user_id", userId).order("updated_at", { ascending: true }).limit(MAX_ATTEMPTS);
      if (error) throw error;
      return (data || []).map((row) => row.data).filter(Boolean);
    }

    async function publicSnapshot(userId = "") {
      const [users, tests, courses, attempts] = await Promise.all([
        allUsers(),
        allTests(),
        allCourses(),
        userId ? attemptsFor(userId) : Promise.resolve([]),
      ]);
      return {
        tests,
        courses,
        leaderboard: users.filter((user) => user?.role !== "admin").map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          xp: Number(user.xp) || 0,
        })),
        attempts,
      };
    }

    async function fullDb() {
      const [users, tests, courses, attempts] = await Promise.all([allUsers(), allTests(), allCourses(), allAttempts()]);
      return { version: DB_VERSION, users, tests, courses, attempts };
    }

    async function findUser(normalizedName: string) {
      const { data, error } = await db.from("lr_users").select("id,data").eq("normalized_name", normalizedName).maybeSingle();
      if (error) throw error;
      return data;
    }

    async function upsertEmployee(input: Record<string, unknown>, allowPlanWrites = false) {
      const normalized = nameOf(input);
      if (!normalized) throw new Error("Укажите имя и фамилию");
      const found = await findUser(normalized);
      const canonicalId = cleanText(found?.id || input.id || newId("user"), 160);
      const merged = mergeEmployee((found?.data as Record<string, unknown>) || null, input, canonicalId, allowPlanWrites);
      const { error } = await db.from("lr_users").upsert({
        id: canonicalId,
        normalized_name: normalized,
        data: merged,
        updated_at: new Date().toISOString(),
      }, { onConflict: "normalized_name" });
      if (error) throw error;
      return merged;
    }

    async function upsertAttempts(items: unknown[], userId: string) {
      const rows = asArray(items, MAX_ATTEMPTS).map((raw) => {
        const attempt = { ...(raw as Record<string, unknown>) };
        attempt.id = cleanText(attempt.id || newId("attempt"), 160);
        attempt.userId = userId;
        return { id: attempt.id, user_id: userId, data: attempt, updated_at: new Date().toISOString() };
      });
      if (rows.length) {
        const { error } = await db.from("lr_attempts").upsert(rows, { onConflict: "id" });
        if (error) throw error;
      }
    }

    async function requireAdmin() {
      const { data, error } = await db.from("lr_settings").select("value").eq("key", "admin_pin_sha256").maybeSingle();
      if (error) throw error;
      const suppliedHash = await sha256(cleanText(body?.pin, 20));
      if (!data?.value || suppliedHash !== data.value) throw new Error("Неверный PIN администратора");
    }

    if (action === "bootstrap") return json(req, { ok: true, ...(await publicSnapshot()) });

    if (action === "login" && isAdminName(body?.firstName, body?.lastName)) {
      await requireAdmin();
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    if (action === "login") {
      const firstName = cleanText(body?.firstName, 80);
      const lastName = cleanText(body?.lastName, 80);
      if (!firstName || !lastName) throw new Error("Укажите имя и фамилию");
      const local = body?.localUser && typeof body.localUser === "object" ? body.localUser : {};
      const user = await upsertEmployee({ ...local, firstName, lastName });
      await upsertAttempts(body?.attempts, String(user.id));
      return json(req, { ok: true, user, ...(await publicSnapshot(String(user.id))) });
    }

    if (action === "save") {
      if (!body?.user || typeof body.user !== "object") throw new Error("Профиль не передан");
      if (body.user.role === "admin" || isAdminName(body.user.firstName, body.user.lastName)) {
        throw new Error("Администратор синхронизируется отдельно");
      }
      const user = await upsertEmployee(body.user);
      await upsertAttempts(body?.attempts, String(user.id));
      return json(req, { ok: true, user, ...(await publicSnapshot(String(user.id))) });
    }

    if (action === "adminSync") {
      await requireAdmin();
      const idMap = new Map<string, string>();
      for (const raw of asArray(body?.users, MAX_USERS)) {
        const user = raw as Record<string, unknown>;
        if (user.role === "admin" || isAdminName(user.firstName, user.lastName)) {
          const admin = { ...user, id: ADMIN_ID, firstName: "Никита", lastName: "Монастырёв", role: "admin", adminId: ADMIN_ID };
          const { error } = await db.from("lr_users").upsert({
            id: ADMIN_ID,
            normalized_name: "никита монастырев",
            data: admin,
            updated_at: new Date().toISOString(),
          }, { onConflict: "normalized_name" });
          if (error) throw error;
          idMap.set(cleanText(user.id, 160), ADMIN_ID);
        } else {
          const previousId = cleanText(user.id, 160);
          const saved = await upsertEmployee(user, true);
          idMap.set(previousId, String(saved.id));
        }
      }

      const testRows = asArray(body?.tests, MAX_TESTS).map((raw) => {
        const test = { ...(raw as Record<string, unknown>) };
        test.id = cleanText(test.id || newId("test"), 160);
        return { id: test.id, data: test, updated_at: new Date().toISOString() };
      });
      if (testRows.length) {
        const { error } = await db.from("lr_tests").upsert(testRows, { onConflict: "id" });
        if (error) throw error;
      }

      const courseRows = asArray(body?.courses, MAX_COURSES).map((raw) => {
        const course = cleanCourse(raw as Record<string, unknown>);
        return { id: course.id, data: course, updated_at: new Date().toISOString() };
      });
      if (courseRows.length) {
        const { error } = await db.from("lr_courses").upsert(courseRows, { onConflict: "id" });
        if (error) throw error;
      }

      const attemptRows = asArray(body?.attempts, MAX_ATTEMPTS).map((raw) => {
        const attempt = { ...(raw as Record<string, unknown>) };
        attempt.id = cleanText(attempt.id || newId("attempt"), 160);
        attempt.userId = idMap.get(cleanText(attempt.userId, 160)) || cleanText(attempt.userId, 160);
        return { id: attempt.id, user_id: attempt.userId, data: attempt, updated_at: new Date().toISOString() };
      }).filter((row) => row.user_id);
      if (attemptRows.length) {
        const { error } = await db.from("lr_attempts").upsert(attemptRows, { onConflict: "id" });
        if (error) throw error;
      }
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    if (action === "deleteTest") {
      await requireAdmin();
      const testId = cleanText(body?.testId, 160);
      if (!testId) throw new Error("Тест не указан");
      const { error } = await db.from("lr_tests").delete().eq("id", testId);
      if (error) throw error;
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    if (action === "saveEmployeePlan") {
      await requireAdmin();
      const userId = cleanText(body?.userId, 160);
      const date = cleanText(body?.date, 10);
      if (!userId || userId === ADMIN_ID) throw new Error("Сотрудник не указан");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Укажите дату плана");
      const { data: row, error: readError } = await db.from("lr_users").select("id,data").eq("id", userId).maybeSingle();
      if (readError) throw readError;
      if (!row?.data) throw new Error("Профиль сотрудника не найден");
      const existing = row.data as Record<string, unknown>;
      const dailyPlans = {
        ...(existing.dailyPlans && typeof existing.dailyPlans === "object" ? existing.dailyPlans : {}),
        [date]: body?.plan && typeof body.plan === "object" ? body.plan : {},
      };
      const saved = mergeEmployee(existing, { ...existing, dailyPlans }, userId, true);
      const { error: saveError } = await db.from("lr_users").update({ data: saved, updated_at: new Date().toISOString() }).eq("id", userId);
      if (saveError) throw saveError;
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    if (action === "saveCourse") {
      await requireAdmin();
      if (!body?.course || typeof body.course !== "object") throw new Error("Курс не передан");
      const course = cleanCourse(body.course);
      const { error } = await db.from("lr_courses").upsert({ id: course.id, data: course, updated_at: new Date().toISOString() }, { onConflict: "id" });
      if (error) throw error;
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    if (action === "deleteCourse") {
      await requireAdmin();
      const courseId = cleanText(body?.courseId, 160);
      if (!courseId) throw new Error("Курс не указан");
      const { error } = await db.from("lr_courses").delete().eq("id", courseId);
      if (error) throw error;
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    if (action === "deleteUser") {
      await requireAdmin();
      const userId = cleanText(body?.userId, 160);
      if (!userId || userId === ADMIN_ID) throw new Error("Сотрудник не указан");
      const { error: attemptError } = await db.from("lr_attempts").delete().eq("user_id", userId);
      if (attemptError) throw attemptError;
      const { error: userError } = await db.from("lr_users").delete().eq("id", userId).neq("id", ADMIN_ID);
      if (userError) throw userError;
      return json(req, { ok: true, admin: true, db: await fullDb() });
    }

    return json(req, { ok: false, error: "Неизвестная операция синхронизации" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка общей базы";
    return json(req, { ok: false, error: message }, message === "Неверный PIN администратора" ? 403 : 400);
  }
});
