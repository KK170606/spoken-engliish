const http = require("http");
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const Groq = require("groq-sdk");

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : fs.existsSync(serviceAccountPath)
      ? require(serviceAccountPath)
      : null;

  try {
    admin.initializeApp(
      serviceAccount
        ? {
            credential: admin.credential.cert(serviceAccount),
            projectId: "spoken-english-4f507"
          }
        : { projectId: "spoken-english-4f507" }
    );
  } catch (error) {
    console.warn("Firebase Admin credential is unavailable:", error.message);
    admin.initializeApp({ projectId: "spoken-english-4f507" });
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "REPLACE_WITH_GROQ_API_KEY" });

const SYSTEM_PROMPTS = {
  teacher: `You are Maya, a friendly spoken English tutor. The user is practicing English.
Correct grammar mistakes clearly, explain why, give the correct version, and encourage them.
Keep replies short (2-4 sentences). Always respond in English.`,
  interview: `You are Arjun, a professional interview coach. Ask one interview question at a time,
evaluate the user's answer for clarity, grammar, and structure (situation-action-result).
Give specific feedback and coaching. Keep replies concise and professional.`,
  business: `You are Sophia, a business English mentor. You are in a professional meeting simulation.
Respond to the user's meeting contributions, coach their business English, suggest more professional
phrasing when needed. Keep replies short and workplace-appropriate.`
};

async function getGroqReply(message, mode = "teacher") {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.teacher },
        { role: "user", content: message }
      ],
      max_tokens: 300
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error("Groq error:", err.message);
    return "I am having trouble connecting right now. Please try again.";
  }
}

async function generateQuizQuestions(level = "B1") {
  const prompt = `Generate exactly 8 English grammar quiz questions for a ${level} learner.
Return ONLY a valid JSON array, no markdown, no explanation.
Each object must have: "question" (string), "options" (array of 3 strings), "correct" (the exact correct option string), "explanation" (one sentence why).
Cover varied topics: tenses, articles, prepositions, modals, conditionals, vocabulary, relative clauses, comparatives.
Example format:
[{"question":"Choose the correct sentence.","options":["I goed","I went","I go yesterday"],"correct":"I went","explanation":"Past simple of go is went."}]`;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
      temperature: 0.8
    });
    const text = completion.choices[0].message.content.trim();
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON array found");
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch (err) {
    console.error("Quiz generation error:", err.message);
    return null;
  }
}

const PORT = Number(process.env.PORT || 4000);
const websiteRoot = path.resolve(__dirname, "../full-website");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const dashboard = {
  learner: {
    name: "Learner",
    level: "B2 Upper Intermediate",
    streakDays: 12
  },
  quote: {
    text: "The limits of my language mean the limits of my world.",
    author: "Ludwig Wittgenstein"
  },
  todayGoal: {
    title: "Business Negotiations II",
    description: "Mastering the soft landing in professional disagreement.",
    tasks: [
      { title: "Vocabulary Refresh", complete: true },
      { title: "Roleplay: The Salary Review", complete: false }
    ]
  },
  weeklyProgress: {
    percent: 65,
    completedUnits: 13,
    targetUnits: 20
  }
};

const grammar = {
  globalProgress: 57,
  categories: ["All Topics", "Fundamentals", "Sentence Structure", "Professional", "Advanced"],
  topics: [
    {
      title: "Nouns",
      body: "Master common, proper, abstract, and collective nouns in English sentences.",
      status: "Completed",
      progress: 100,
      icon: "alphabetical-variant"
    },
    {
      title: "Tenses",
      body: "Understanding past, present, and future timeframes and aspects.",
      status: "In Progress",
      progress: 65,
      icon: "clock-outline"
    },
    {
      title: "Verbs",
      body: "Action words, linking verbs, and auxiliary verbs usage.",
      status: "Start Topic",
      progress: 0,
      icon: "run"
    },
    {
      title: "Articles",
      body: "Use a, an, the, and zero article naturally in everyday sentences.",
      status: "Start Topic",
      progress: 0,
      icon: "article"
    },
    {
      title: "Conditionals",
      body: "Build zero, first, second, third, and mixed conditional sentences.",
      status: "In Progress",
      progress: 38,
      icon: "account-tree"
    },
    {
      title: "Relative Clauses",
      body: "Connect ideas with who, which, that, where, and whose.",
      status: "Start Topic",
      progress: 0,
      icon: "join-inner"
    },
    {
      title: "Modals",
      body: "Express ability, permission, advice, possibility, and obligation.",
      status: "Start Topic",
      progress: 0,
      icon: "psychology"
    },
    {
      title: "Polite Requests",
      body: "Make professional requests using softer, respectful wording.",
      status: "In Progress",
      progress: 45,
      icon: "handshake"
    }
  ]
};

const lesson = {
  unit: "Unit 4: Verb Tenses",
  progress: 65,
  title: "Past Simple vs. Present Perfect",
  explanation:
    "The Past Simple is used for actions completed at a specific time in the past. The Present Perfect connects the past to the present, focusing on the experience rather than the specific time.",
  examples: [
    {
      title: "Past Simple",
      text: '"I visited London in 2019."',
      helper: "Specific time mentioned."
    },
    {
      title: "Present Perfect",
      text: '"I have visited London three times."',
      helper: "Focus on the experience."
    }
  ],
  practice: {
    prompt: '"I _____ (see) that movie yesterday."',
    options: ["Have seen", "Saw", "Seeing"],
    answer: "Saw"
  }
};


function sendJson(res, status, data) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(data));
}

function sendStreamHeaders(res) {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8"
  });
}

function sendStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: "File not found" });
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function buildTeacherReply(message) {
  const lower = String(message || "").toLowerCase();

  if (lower.includes("have went")) {
    return {
      reply:
        "Great start. Use 'I went' instead of 'I have went' because yesterday is a specific past time.",
      correction: "I went to the store yesterday."
    };
  }

  if (lower.includes("yesterday")) {
    return {
      reply:
        "Nice. Because you used 'yesterday', Past Simple is usually the right tense.",
      correction: null
    };
  }

  return {
    reply:
      "Try adding a clear time marker, like yesterday or last week, and I can help you choose the tense.",
    correction: null
  };
}

function staffIntro(staff) {
  const staffNames = {
    maya: "Maya, your friendly grammar coach",
    arjun: "Arjun, your interview trainer",
    sophia: "Sophia, your business English mentor",
    david: "David, your pronunciation coach"
  };
  return staffNames[staff] || "Your AI coach";
}

function buildInterviewReply(message) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const hasExample = /\b(when|once|for example|in my last|at my|during)\b/.test(lower);
  const hasImpact = /\b(result|improved|increased|reduced|helped|completed|learned|saved)\b/.test(lower);
  const hasPastIssue = /\b(have went|did went|was go|i were)\b/.test(lower);

  if (words.length < 14) {
    return {
      reply:
        "Good start, but your interview answer is too short. Use this structure: situation, action, result. Add one real example and one result.",
      correction: null
    };
  }

  if (hasPastIssue) {
    return {
      reply:
        "Your answer has useful content, but fix the past-tense form. Say 'I went', 'I did', or 'I was' depending on the sentence.",
      correction: "Example: I went to the client, explained the issue, and solved it before the deadline."
    };
  }

  if (!hasExample) {
    return {
      reply:
        "Your answer is clear, but it needs a specific example. Start with 'In my last project...' or 'Once, I had to...' so the interviewer can trust the story.",
      correction: null
    };
  }

  if (!hasImpact) {
    return {
      reply:
        "Nice example. Now add impact: what improved, what you completed, or what the team learned. Strong interview answers end with a result.",
      correction: null
    };
  }

  return {
    reply:
      "Strong interview answer. You gave context, action, and impact. To sound even more confident, slow down slightly and end with one sentence about what the experience taught you.",
    correction: null
  };
}

function buildBusinessMeetingReply(message) {
  const lower = String(message || "").toLowerCase();
  const hasPolitePhrase = /\b(could|would|may|please|i suggest|i recommend|from my side)\b/.test(lower);
  const hasQuestion = lower.includes("?");
  const hasAction = /\b(i will|we will|next step|action item|by tomorrow|by friday|deadline)\b/.test(lower);

  if (lower.length < 45) {
    return {
      reply:
        "Your meeting response is too short. Add one detail, one reason, and one next step so the team knows exactly what to do.",
      correction: null
    };
  }

  if (!hasPolitePhrase) {
    return {
      reply:
        "Your idea is useful, but make it sound more professional with a polite opener like 'I suggest...' or 'Could we consider...'.",
      correction: "I suggest we confirm the deadline first, then share the updated plan with the client."
    };
  }

  if (!hasQuestion && lower.includes("clarify")) {
    return {
      reply:
        "Good instinct to clarify. In a meeting, turn it into a direct question so people can answer quickly.",
      correction: "Could you clarify which deadline is the highest priority?"
    };
  }

  if (!hasAction) {
    return {
      reply:
        "That sounds professional. Now add an action item: who will do what, and by when.",
      correction: null
    };
  }

  return {
    reply:
      "Strong meeting response. You sounded polite, clear, and action-oriented. Keep your pace steady and pause after the action item.",
    correction: null
  };
}

async function getAuthUser(req) {
  // Vercel function mount paths can shift; this API router also supports a no-prefix health route.
  // Set to a constant to avoid noisy logs while debugging locally.
  const _debug = {
    pathname: new URL(req.url || "/", `http://${req.headers.host}`).pathname,
    method: req.method
  };

  const auth = req.headers.authorization || "";

  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return { email: decoded.email, uid: decoded.uid };
  } catch {
    return null;
  }
}

function buildStreamingReply(message, mode = "teacher", staff = "") {
  const teacherReply =
    mode === "interview"
      ? buildInterviewReply(message)
      : mode === "business"
        ? buildBusinessMeetingReply(message)
        : buildTeacherReply(message);
  const correction = teacherReply.correction ? ` Correct version: ${teacherReply.correction}` : "";
  return `${staffIntro(staff)} says: ${teacherReply.reply}${correction} Try speaking it once slowly, then once at natural speed.`;
}

function streamText(res, text) {
  sendStreamHeaders(res);
  const chunks = text.match(/.{1,18}(\s|$)/g) || [text];
  let index = 0;

  const timer = setInterval(() => {
    if (index >= chunks.length) {
      res.write("event: done\ndata: {}\n\n");
      res.end();
      clearInterval(timer);
      return;
    }

    res.write(`data: ${JSON.stringify({ token: chunks[index] })}\n\n`);
    index += 1;
  }, 90);

  res.on("close", () => clearInterval(timer));
}

const handleRequest = async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, { ok: true, app: "LingoFlow API" });
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const user = await getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Not authenticated" });
      return sendJson(res, 200, { user });
    }

    if (req.method === "GET" && url.pathname === "/api/dashboard") {
      return sendJson(res, 200, dashboard);
    }

    if (req.method === "GET" && url.pathname === "/api/grammar") {
      return sendJson(res, 200, grammar);
    }

    if (req.method === "GET" && url.pathname === "/api/lesson") {
      return sendJson(res, 200, lesson);
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const body = await readBody(req);
      if (!body.message || typeof body.message !== "string") {
        return sendJson(res, 400, { error: "message is required" });
      }

      return sendJson(res, 200, buildTeacherReply(body.message));
    }

    if (req.method === "POST" && url.pathname === "/api/progress") {
      const user = await getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Not authenticated" });
      const body = await readBody(req);
      const db = admin.firestore();
      await db.doc(`users/${user.uid}`).set({
        progress: body.progress || {},
        weeklyUnits: body.weeklyUnits || 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/quiz/generate") {
      const user = await getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Not authenticated" });
      const prompt = `Generate 5 multiple-choice English grammar quiz questions for an intermediate learner. Return ONLY a JSON array with this exact shape, no markdown, no extra text:
[{"question":"...","options":["A","B","C"],"correct":"A","explanation":"..."}]`;
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800
        });
        const raw = completion.choices[0].message.content.trim();
        const start = raw.indexOf("[");
        const end = raw.lastIndexOf("]");
        const questions = JSON.parse(raw.slice(start, end + 1));
        return sendJson(res, 200, { questions });
      } catch (err) {
        console.error("Quiz generate error:", err.message);
        return sendJson(res, 500, { error: "Could not generate quiz" });
      }
    }

    if (req.method === "POST" && url.pathname === "/api/chat/stream") {
      const body = await readBody(req);
      if (!body.message || typeof body.message !== "string") {
        return sendJson(res, 400, { error: "message is required" });
      }

      const reply = await getGroqReply(body.message, body.mode);
      return streamText(res, reply);
    }

    if (req.method === "GET" && url.pathname === "/api/quiz/generate") {
      const user = await getAuthUser(req);
      let level = "B1";
      if (user) {
        try {
          const snap = await admin.firestore().doc(`users/${user.uid}`).get();
          level = snap.data()?.level?.split(" ")[0] || "B1";
        } catch {}
      }
      const questions = await generateQuizQuestions(level);
      if (!questions) return sendJson(res, 500, { error: "Failed to generate quiz" });
      return sendJson(res, 200, { questions });
    }

    if (req.method === "POST" && url.pathname === "/api/progress") {
      const user = await getAuthUser(req);
      if (!user) return sendJson(res, 401, { error: "Not authenticated" });
      const body = await readBody(req);
      const db = admin.firestore();
      const ref = db.doc(`users/${user.uid}`);
      const snap = await ref.get();
      const existing = snap.data() || {};
      const existingProgress = existing.progress || {};

      // streak logic: increment only if last activity was yesterday or first time today
      const today = new Date().toISOString().slice(0, 10);
      const lastDay = (existing.lastActiveDate || "").slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let streak = existing.streak || 0;
      if (lastDay === today) {
        // same day, no change
      } else if (lastDay === yesterday) {
        streak += 1;
      } else if (lastDay !== today) {
        streak = 1;
      }

      // append quiz history entry if provided
      const quizHistory = existing.quizHistory || [];
      if (body.quizEntry) {
        quizHistory.push({ ...body.quizEntry, date: new Date().toISOString() });
        if (quizHistory.length > 30) quizHistory.splice(0, quizHistory.length - 30);
      }

      const updates = {
        progress: { ...existingProgress, ...(body.progress || {}), lastActivity: new Date().toISOString() },
        streak,
        lastActiveDate: today,
        weeklyUnits: body.weeklyUnits !== undefined ? body.weeklyUnits : (existing.weeklyUnits || 0),
        quizHistory,
        updatedAt: new Date().toISOString()
      };
      await ref.set(updates, { merge: true });
      return sendJson(res, 200, { ok: true, streak, quizHistory });
    }

    if (req.method === "GET" && !url.pathname.startsWith("/api/")) {
      const requestedPath =
        url.pathname === "/" ? "/login.html" : url.pathname === "/login" ? "/login.html" : url.pathname;
      const safePath = path
        .normalize(decodeURIComponent(requestedPath))
        .replace(/^(\.\.[/\\])+/, "");
      const filePath = path.join(websiteRoot, safePath);
      const resolvedPath = path.resolve(filePath);

      if (!resolvedPath.startsWith(websiteRoot)) {
        return sendJson(res, 403, { error: "Forbidden" });
      }

      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
        return sendStatic(res, resolvedPath);
      }

      return sendStatic(res, path.join(websiteRoot, "index.html"));
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Internal server error" });
  }
};

if (require.main === module) {
  http.createServer(handleRequest).listen(PORT, "127.0.0.1", () => {
    console.log(`LingoFlow API running at http://127.0.0.1:${PORT}`);
  });
}

module.exports = { handleRequest };
