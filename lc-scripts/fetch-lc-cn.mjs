/**
 * 从力扣中国站 (leetcode.cn) 拉取用户统计，输出与 leetcode-glance widget 兼容的 JSON。
 * 用 node 运行: node fetch-lc-cn.mjs <用户名>
 * 依赖: 在上级 widgets 目录执行 npm install leetcode-query
 *
 * 要拿「全年」提交日历：设置环境变量 LEETCODE_CN_SESSION 为你在力扣中国站登录后的 Cookie 中的 LEETCODE_SESSION 值。
 * 获取方式：浏览器登录 leetcode.cn → F12 开发者工具 → Application → Cookies → 复制 LEETCODE_SESSION。
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const username = process.argv[2] || process.env.LEETCODE_CN_USERNAME || "";
if (!username) {
  console.error(JSON.stringify({ status: "error", message: "请传入用户名: node fetch-lc-cn.mjs <用户名>" }));
  process.exit(1);
}

function buildCalendarFromSubmissions(submissions) {
  const cal = {};
  if (!Array.isArray(submissions)) return cal;
  for (const s of submissions) {
    const t = s.submitTime != null ? s.submitTime : s.timestamp;
    if (t == null) continue;
    const ms = t < 1e12 ? t * 1000 : t;
    const d = new Date(ms);
    const utcMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const key = Math.floor(utcMidnight / 1000);
    cal[key] = (cal[key] || 0) + 1;
  }
  return cal;
}

function mergeSubmissions(...submissionLists) {
  const merged = new Map();
  for (const submissions of submissionLists) {
    if (!Array.isArray(submissions)) continue;
    for (const submission of submissions) {
      if (!submission) continue;
      const timestamp = submission.submitTime ?? submission.timestamp ?? "";
      const id = submission.id ?? submission.submissionId;
      const key = id != null
        ? `id:${id}`
        : `submission:${timestamp}:${submission.titleSlug ?? submission.title ?? ""}:${submission.lang ?? ""}`;
      if (!merged.has(key)) merged.set(key, submission);
    }
  }
  return [...merged.values()];
}

const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

async function fetchAllSubmissionsWithSession(sessionCookie) {
  const list = [];
  const limit = 40;
  let offset = 0;
  let hasNext = true;
  const base = "https://leetcode.cn/api/submissions/";
  const headers = {
    Cookie: `LEETCODE_SESSION=${sessionCookie.trim()}`,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Referer: "https://leetcode.cn/",
    Origin: "https://leetcode.cn",
  };
  while (hasNext) {
    const url = `${base}?offset=${offset}&limit=${limit}`;
    const res = await fetch(url, { headers });
    if (res.status === 401) return [];
    if (res.status === 403 || !res.ok) break;
    const data = await res.json();
    const dump = data.submissions_dump || data.submission_dump || data.submissions || [];
    if (Array.isArray(dump)) list.push(...dump);
    hasNext = data.has_next === true && dump && dump.length === limit;
    if (dump && dump.length < limit) break;
    offset += limit;
    await new Promise((r) => setTimeout(r, 800));
  }
  return list;
}

function getCachePath() {
  return join(__dirname, ".submissions_cache.json");
}

function readSubmissionsCache() {
  try {
    const p = getCachePath();
    if (!existsSync(p)) return null;
    const raw = readFileSync(p, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.submissions)) return null;
    return {
      submissions: data.submissions,
      isFresh: Boolean(data.fetchedAt && Date.now() - data.fetchedAt < CACHE_MAX_AGE_MS),
    };
  } catch (_) {
    return null;
  }
}

function writeSubmissionsCache(submissions) {
  try {
    writeFileSync(getCachePath(), JSON.stringify({ fetchedAt: Date.now(), submissions }), "utf8");
  } catch (_) {}
}

async function main() {
  try {
    let session = process.env.LEETCODE_CN_SESSION || "";
    if (!session) {
      const toTry = [];
      if (process.env.LEETCODE_CN_SESSION_FILE) toTry.push(process.env.LEETCODE_CN_SESSION_FILE);
      toTry.push(
        join(__dirname, ".leetcode_cn_session"),
        join(process.cwd(), "lc-scripts", ".leetcode_cn_session"),
        join(process.cwd(), ".leetcode_cn_session"),
        process.env.HOME && join(process.env.HOME, "Library", "Application Support", "Übersicht", "widgets", "lc-scripts", ".leetcode_cn_session"),
      );
      for (const p of toTry) {
        if (p && existsSync(p)) {
          session = readFileSync(p, "utf8").trim().split("\n")[0].trim();
          break;
        }
      }
    }

    const { LeetCodeCN } = await import("leetcode-query");
    const lc = new LeetCodeCN();
    const data = await lc.user(username);

    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let ranking = null;
    let acceptanceRate = null;
    let submissionCalendar = {};

    if (data.matchedUser) {
      const m = data.matchedUser;
      if (m.submitStats && m.submitStats.acSubmissionNum) {
        for (const item of m.submitStats.acSubmissionNum) {
          const c = item.count || 0;
          if (item.difficulty === "All") totalSolved = c;
          else if (item.difficulty === "Easy") easySolved = c;
          else if (item.difficulty === "Medium") mediumSolved = c;
          else if (item.difficulty === "Hard") hardSolved = c;
        }
        if (totalSolved === 0) totalSolved = easySolved + mediumSolved + hardSolved;
      }
      if (m.profile && m.profile.ranking != null) ranking = m.profile.ranking;
      if (m.submissionCalendar && typeof m.submissionCalendar === "string") {
        try {
          submissionCalendar = JSON.parse(m.submissionCalendar);
        } catch (_) {}
      }
    } else if (data.userProfileUserQuestionProgress && data.userProfilePublicProfile) {
      const progress = data.userProfileUserQuestionProgress;
      const profile = data.userProfilePublicProfile;
      if (progress.numAcceptedQuestions && Array.isArray(progress.numAcceptedQuestions)) {
        for (const item of progress.numAcceptedQuestions) {
          const c = item.count || 0;
          const d = (item.difficulty || "").toLowerCase();
          if (d === "easy" || d === "简单") easySolved = c;
          else if (d === "medium" || d === "中等") mediumSolved = c;
          else if (d === "hard" || d === "困难") hardSolved = c;
        }
        totalSolved = easySolved + mediumSolved + hardSolved;
      }
      if (profile.siteRanking != null) ranking = profile.siteRanking;
    }

    if (Object.keys(submissionCalendar).length === 0) {
      const cached = readSubmissionsCache();
      let historicalSubmissions = cached ? cached.submissions : [];

      if (session && (!cached || !cached.isFresh)) {
        try {
          const fetchedSubmissions = await fetchAllSubmissionsWithSession(session);
          if (fetchedSubmissions.length > 0) {
            historicalSubmissions = fetchedSubmissions;
            writeSubmissionsCache(fetchedSubmissions);
          }
        } catch (_) {}
      }

      let recentSubmissions = [];
      try {
        recentSubmissions = await lc.recent_submissions(username, 20);
      } catch (_) {}

      const calendarSubmissions = mergeSubmissions(historicalSubmissions, recentSubmissions);
      submissionCalendar = buildCalendarFromSubmissions(calendarSubmissions);

      const rateSubmissions = historicalSubmissions.length > 0 ? historicalSubmissions : recentSubmissions;
      if (rateSubmissions.length > 0) {
        const accepted = rateSubmissions.filter((s) => (s.statusDisplay || s.status_display || s.status || "").toLowerCase() === "accepted").length;
        acceptanceRate = Math.round((accepted / rateSubmissions.length) * 1000) / 10;
      }
    }

    const out = {
      status: "success",
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking: ranking != null ? ranking : "N/A",
      acceptanceRate,
      submissionCalendar,
    };
    console.log(JSON.stringify(out));
  } catch (err) {
    const message = err && (err.message || String(err));
    console.error(JSON.stringify({ status: "error", message }));
    process.exit(1);
  }
}

main();
