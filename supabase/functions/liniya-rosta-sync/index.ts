import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_ID = "admin-nikita-monastyrev";
const DB_VERSION = 4;
const MAX_USERS = 5000;
const MAX_TESTS = 1000;
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
    assignments: input.assignments && typeof input.assignments === "object" ? input.assignments : {},
  };
}

function mergeEmployee(existing: Record<string, unknown> | null, incoming: Record<string, unknown>, id: string) {
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
  return next;
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
      const [users, tests, attempts] = await Promise.all([
        allUsers(),
        allTests(),
        userId ? attemptsFor(userId) : Promise.resolve([]),
      ]);
      return {
        tests,
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
      const [users, tests, attempts] = await Promise.all([allUsers(), allTests(), allAttempts()]);
      return { version: DB_VERSION, users, tests, attempts };
    }

    async function findUser(normalizedName: string) {
      const { data, error } = await db.from("lr_users").select("id,data").eq("normalized_name", normalizedName).maybeSingle();
      if (error) throw error;
      return data;
    }

    async function upsertEmployee(input: Record<string, unknown>) {
      const normalized = nameOf(input);
      if (!normalized) throw new Error("Укажите имя и фамилию");
      const found = await findUser(normalized);
      const canonicalId = cleanText(found?.id || input.id || newId("user"), 160);
      const merged = mergeEmployee((found?.data as Record<string, unknown>) || null, input, canonicalId);
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
          const saved = await upsertEmployee(user);
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

    return json(req, { ok: false, error: "Неизвестная операция синхронизации" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка общей базы";
    return json(req, { ok: false, error: message }, message === "Неверный PIN администратора" ? 403 : 400);
  }
});
