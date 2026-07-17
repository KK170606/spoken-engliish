import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8zQGohjdhtsYp5m7csc3hGrC7BcmgxUE",
  authDomain: "spoken-english-4f507.firebaseapp.com",
  projectId: "spoken-english-4f507",
  storageBucket: "spoken-english-4f507.firebasestorage.app",
  messagingSenderId: "864828597512",
  appId: "1:864828597512:web:24e7446a8fc90e61ce78bd",
  measurementId: "G-51N82JS09V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const API_BASE_URL = window.LINGOFLOW_API_BASE_URL || window.location.origin;

const lessons = [
  {
    unit: "Unit 4: Verb Tenses",
    title: "Past Simple vs. Present Perfect",
    progress: 65,
    rule: "Past Simple is used for actions completed at a specific time in the past. Present Perfect connects the past to the present and focuses on experience.",
    examples: [
      ["Past Simple", '"I visited London in 2019."', "Specific time mentioned."],
      ["Present Perfect", '"I have visited London three times."', "Focus on the experience."]
    ],
    profileTask: "Finish verb tense unit"
  },
  {
    unit: "Unit 5: Articles",
    title: "A, An, The, and Zero Article",
    progress: 20,
    rule: "Use a or an for one general thing, the for something specific, and zero article for many general ideas.",
    examples: [
      ["General", '"I need a notebook."', "Any notebook is fine."],
      ["Specific", '"The notebook on my desk is blue."', "The listener knows which one."]
    ],
    profileTask: "Practice articles with daily objects"
  },
  {
    unit: "Unit 6: Business Requests",
    title: "Polite Requests at Work",
    progress: 0,
    rule: "Professional requests sound better when you use could, would, may, and clear reasons instead of direct commands.",
    examples: [
      ["Direct", '"Send me the file."', "Too sharp for many workplace situations."],
      ["Polite", '"Could you send me the file by 3 PM?"', "Clear, respectful, and specific."]
    ],
    profileTask: "Use three polite business requests"
  },
  {
    unit: "Unit 7: Interview Answers",
    title: "Situation, Action, Result",
    progress: 0,
    rule: "Strong interview answers use a simple story shape: situation, action, and result. This makes your answer easy to follow.",
    examples: [
      ["Situation", '"In my last project, our deadline changed suddenly."', "Set the context quickly."],
      ["Result", '"I organized the tasks and we delivered on time."', "End with impact."]
    ],
    profileTask: "Prepare one interview answer with a result"
  }
];

const sectionTitles = {
  dashboard: "Dashboard", topics: "Grammar Topics", lesson: "Daily Lesson",
  chat: "Voice AI Chat", interview: "AI Interview", business: "Business Meeting",
  profile: "Profile", quiz: "Daily Quiz", quizDone: "Quiz Complete",
  vocabulary: "Vocabulary Builder", speaking: "Speaking Lab",
  resources: "Resources", progress: "Learning Progress", community: "Community Rooms"
};

let liveProfile = null;
let liveProgress = null;
let unsubscribeSnapshot = null;
let dashboardReady = false;

function emptyProgress() {
  return { lessonIndex: 0, completedLessons: [], quizScore: "", quizCompleted: false, speakingSessions: 0, lastActivity: "" };
}

function getProgress() { return liveProgress || emptyProgress(); }

function profileInitial(name) {
  return (String(name || "Learner").trim().charAt(0) || "L").toUpperCase();
}

function renderProfileAvatar(name) {
  const image = document.querySelector("#profileAvatarImage");
  const initial = document.querySelector("#profileAvatarInitial");
  if (!image || !initial) return;
  const photoURL = liveProfile?.photoURL || auth.currentUser?.photoURL || "";
  initial.textContent = profileInitial(name);
  image.hidden = !photoURL;
  if (photoURL) image.src = photoURL;
}

function compressProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Please choose a valid image file."));
      image.onload = () => {
        const maxSize = 320;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function initProfilePhoto() {
  const picker = document.querySelector("#avatarPicker");
  const input = document.querySelector("#profilePhotoInput");
  const upload = document.querySelector("#profilePhotoUpload");
  const remove = document.querySelector("#profilePhotoRemove");
  if (!picker || !input || !upload || !remove) return;

  const openPicker = () => input.click();
  picker.addEventListener("click", openPicker);
  upload.addEventListener("click", openPicker);
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      alert("Choose a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }
    try {
      const photoURL = await compressProfilePhoto(file);
      if (photoURL.length > 850000) throw new Error("That photo is still too large. Please choose another image.");
      await setDoc(doc(db, "users", auth.currentUser.uid), { photoURL, updatedAt: new Date().toISOString() }, { merge: true });
      await updateProfile(auth.currentUser, { photoURL });
    } catch (error) {
      alert(error.message || "Could not save your profile photo.");
    }
  });
  remove.addEventListener("click", async () => {
    await setDoc(doc(db, "users", auth.currentUser.uid), { photoURL: "", updatedAt: new Date().toISOString() }, { merge: true });
    await updateProfile(auth.currentUser, { photoURL: "" });
  });
}

function initProfileSettings() {
  const form = document.querySelector("#profileSettingsForm");
  const status = document.querySelector("#profileSettingsStatus");
  if (!form || !status) return;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const name = document.querySelector("#profileNameInput").value.trim();
    const level = document.querySelector("#profileLevelInput").value;
    const dailyGoal = Number(document.querySelector("#profileDailyGoalInput").value);
    if (!name) {
      status.textContent = "Enter your name to continue.";
      return;
    }
    if (!Number.isFinite(dailyGoal) || dailyGoal < 5 || dailyGoal > 180) {
      status.textContent = "Choose a daily goal between 5 and 180 minutes.";
      return;
    }
    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    status.textContent = "Saving…";
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        name,
        level,
        dailyGoal,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      await updateProfile(auth.currentUser, { displayName: name });
      status.textContent = "Profile saved.";
    } catch (error) {
      status.textContent = error.message || "Could not save your profile.";
    } finally {
      submit.disabled = false;
    }
  });
}

async function saveProgress(updates, quizEntry = null) {
  const user = auth.currentUser;
  if (!user) return;
  liveProgress = { ...getProgress(), ...updates, lastActivity: new Date().toISOString() };

  // streak: increment only on first activity of a new day
  const today = new Date().toISOString().slice(0, 10);
  const lastDay = (liveProfile?.lastActiveDate || "").slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = liveProfile?.streak || 0;
  if (lastDay !== today) {
    streak = lastDay === yesterday ? streak + 1 : 1;
    liveProfile = { ...liveProfile, streak, lastActiveDate: today };
  }

  const headers = await authHeaders();
  await fetch(`${API_BASE_URL}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      progress: liveProgress,
      weeklyUnits: liveProfile?.weeklyUnits || 0,
      quizEntry
    })
  }).catch(() => {
    // fallback: write directly to Firestore if backend unreachable
    setDoc(doc(db, "users", user.uid), { progress: liveProgress, streak, lastActiveDate: today, updatedAt: new Date().toISOString() }, { merge: true });
  });
  applyUi();
}

function applyUi() {
  const p = getProgress();
  const name = liveProfile?.name || "Learner";
  const level = liveProfile?.level || "B1 Intermediate";

  const set = (id, val) => { const el = document.querySelector(id); if (el) el.textContent = val; };
  const setStyle = (id, val) => { const el = document.querySelector(id); if (el) el.style.width = val; };

  set("#userChip", name);
  set("#dashboard-title", `Welcome back, ${name}!`);
  set("#profileName", name);
  set("#profileLevel", level);
  renderProfileAvatar(name);
  const profileNameInput = document.querySelector("#profileNameInput");
  const profileEmailInput = document.querySelector("#profileEmailInput");
  const profileLevelInput = document.querySelector("#profileLevelInput");
  const profileDailyGoalInput = document.querySelector("#profileDailyGoalInput");
  if (profileNameInput && document.activeElement !== profileNameInput) profileNameInput.value = name;
  if (profileEmailInput) profileEmailInput.value = liveProfile?.email || auth.currentUser?.email || "";
  if (profileLevelInput && document.activeElement !== profileLevelInput) profileLevelInput.value = level;
  if (profileDailyGoalInput && document.activeElement !== profileDailyGoalInput) profileDailyGoalInput.value = liveProfile?.dailyGoal || 15;

  // sidebar profile
  const sidebarH2 = document.querySelector(".profile-block h2");
  const sidebarP = document.querySelector(".profile-block p");
  if (sidebarH2) sidebarH2.textContent = name;
  if (sidebarP) sidebarP.textContent = level;

  // streak & stats
  const streak = liveProfile?.streak || 0;
  const units = liveProfile?.weeklyUnits || 0;
  set("#statStreak", streak);
  set("#statUnits", units);
  set("#statLevel", level.split(" ")[0]);
  document.querySelectorAll(".streak-pill").forEach(el => el.textContent = `${streak} day streak`);

  // dashboard progress
  const completed = (p.completedLessons || []).length;
  const pct = Math.round((completed / lessons.length) * 100);
  set("#dashboardProgressPercent", `${pct}%`);
  setStyle("#dashboardProgressBar", `${pct}%`);
  set("#dashboardUnits", `${units}/20 units`);

  // lesson
  const idx = Math.max(0, Math.min(Number(p.lessonIndex || 0), lessons.length - 1));
  const lesson = lessons[idx];
  const isDone = (p.completedLessons || []).includes(idx);
  const lPct = isDone ? 100 : lesson.progress;
  set("#lessonUnit", lesson.unit);
  set("#lesson-title", lesson.title);
  set("#lessonProgressLabel", `${lPct}% complete`);
  setStyle("#lessonProgressBar", `${lPct}%`);
  set("#lessonRule", lesson.rule);
  set("#lessonExampleOneTitle", lesson.examples[0][0]);
  set("#lessonExampleOne", lesson.examples[0][1]);
  set("#lessonExampleOneHelper", lesson.examples[0][2]);
  set("#lessonExampleTwoTitle", lesson.examples[1][0]);
  set("#lessonExampleTwo", lesson.examples[1][1]);
  set("#lessonExampleTwoHelper", lesson.examples[1][2]);
  set("#lessonFlowText", `Today's lesson: ${lesson.title}. Mark it complete when you finish practice.`);
  set("#profileCurrentLesson", lesson.profileTask);
  document.querySelectorAll("[data-lesson-index]").forEach(b => b.classList.toggle("active", Number(b.dataset.lessonIndex) === idx));

  // quiz
  if (p.quizCompleted) {
    set("#quizDoneSummary", `Great work. Final score saved: ${p.quizScore}.`);
  }

  // progress page skill bars
  setStyle("#skillGrammar", `${pct}%`);
  setStyle("#skillVocab", `${Math.max(10, pct - 8)}%`);
  setStyle("#skillSpeaking", `${Math.min(100, pct + 10)}%`);
  setStyle("#skillListening", `${Math.max(10, pct - 15)}%`);
  set("#statConversations", p.speakingSessions || 0);
  const el2 = document.querySelector("#statStreak2"); if (el2) el2.textContent = streak;
  const el3 = document.querySelector("#statUnits2"); if (el3) el3.textContent = units;

  // quiz history
  const historyEl = document.querySelector("#quizHistory");
  if (historyEl) {
    const history = liveProfile?.quizHistory || [];
    if (!history.length) {
      historyEl.innerHTML = '<p style="opacity:.6;font-size:.9rem">No quiz attempts yet.</p>';
    } else {
      historyEl.innerHTML = [...history].reverse().slice(0, 10).map(h => {
        const d = new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        const pct = Math.round((h.score / h.total) * 100);
        return `<div style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--border,#e5e7eb)"><span>${d}</span><strong>${h.score}/${h.total} (${pct}%)</strong></div>`;
      }).join("");
    }
  }
}

async function ensureProfile(user, name = "") {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const data = {
      name: name || user.displayName || user.email,
      email: user.email,
      level: "B1 Intermediate",
      streak: 1,
      weeklyUnits: 0,
      dailyGoal: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: emptyProgress()
    };
    await setDoc(ref, data);
    liveProfile = data;
    liveProgress = data.progress;
  } else {
    const data = snap.data();
    liveProfile = data;
    liveProgress = data.progress || emptyProgress();
  }
}

function subscribeProgress(uid) {
  if (unsubscribeSnapshot) unsubscribeSnapshot();
  unsubscribeSnapshot = onSnapshot(doc(db, "users", uid), snap => {
    const data = snap.data() || {};
    liveProfile = data;
    liveProgress = data.progress || emptyProgress();
    applyUi();
  });
}

async function authHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

function isLoginPage() { return Boolean(document.querySelector("#loginForm")); }
function goToLogin() { window.location.href = "./login.html"; }
function goToApp() { window.location.href = "./index.html"; }

// ── LOGIN PAGE ──────────────────────────────────────────────────────────────
function initLoginPage() {
  const form = document.querySelector("#loginForm");
  const error = document.querySelector("#loginError");
  const submit = document.querySelector("#loginSubmit");
  const createBtn = document.querySelector("#createAccountButton");

  // clear any cached session so login is always required
  signOut(auth);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    error.textContent = "";
    submit.disabled = true;
    submit.innerHTML = 'Signing In <span class="material-symbols-outlined">progress_activity</span>';

    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value;

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await ensureProfile(user, document.querySelector("#loginName").value.trim());
      goToApp();
    } catch (err) {
      error.textContent = err.message || "Login failed";
      submit.disabled = false;
      submit.innerHTML = 'Sign In <span class="material-symbols-outlined">login</span>';
    }
  });

  createBtn.addEventListener("click", async () => {
    error.textContent = "";
    createBtn.disabled = true;
    createBtn.innerHTML = 'Creating <span class="material-symbols-outlined">progress_activity</span>';

    const name = document.querySelector("#loginName").value.trim();
    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value;

    if (!name) { error.textContent = "Please enter your name."; createBtn.disabled = false; createBtn.innerHTML = 'Create Account <span class="material-symbols-outlined">person_add</span>'; return; }
    if (!email) { error.textContent = "Please enter your email."; createBtn.disabled = false; createBtn.innerHTML = 'Create Account <span class="material-symbols-outlined">person_add</span>'; return; }
    if (password.length < 6) { error.textContent = "Password must be at least 6 characters."; createBtn.disabled = false; createBtn.innerHTML = 'Create Account <span class="material-symbols-outlined">person_add</span>'; return; }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await ensureProfile(user, name);
      goToApp();
    } catch (err) {
      error.textContent = err.message || "Could not create account";
      createBtn.disabled = false;
      createBtn.innerHTML = 'Create Account <span class="material-symbols-outlined">person_add</span>';
    }
  });
}

// ── APP PAGE ────────────────────────────────────────────────────────────────
function initAppPage() {
  document.body.style.visibility = "hidden";

  onAuthStateChanged(auth, async user => {
    if (!user) { goToLogin(); return; }
    await ensureProfile(user, user.displayName || user.email);
    subscribeProgress(user.uid);
    document.body.style.visibility = "visible";
    applyUi();
    if (!dashboardReady) { initDashboard(); dashboardReady = true; }
  });
}

function initDashboard() {
  const views = document.querySelectorAll(".view");
  const sidebar = document.querySelector(".sidebar");
  const pageTitle = document.querySelector("#pageTitle");

  function showSection(id) {
    views.forEach(v => v.classList.toggle("active", v.id === id));
    document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.section === id));
    document.querySelectorAll(".mobile-nav button").forEach(b => b.classList.toggle("active", b.dataset.section === id));
    pageTitle.textContent = sectionTitles[id] || "LingoFlow";
    sidebar.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.showLingoSection = showSection;

  document.querySelectorAll("[data-section]").forEach(b => b.addEventListener("click", () => showSection(b.dataset.section)));
  document.querySelector("#menuToggle").addEventListener("click", () => sidebar.classList.toggle("open"));
  document.querySelector("#logoutButton").addEventListener("click", async () => { await signOut(auth); goToLogin(); });

  document.querySelector("#topicFilters").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    document.querySelectorAll(".topic-card").forEach(card => card.classList.toggle("is-hidden", filter !== "all" && card.dataset.topicCategory !== filter));
  });

  document.querySelector("#answerRow").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const feedback = document.querySelector("#quizFeedback");
    document.querySelectorAll("#answerRow button").forEach(b => b.classList.remove("correct", "wrong"));
    if (btn.dataset.answer === "Saw") {
      btn.classList.add("correct");
      feedback.textContent = "Correct. Yesterday is a specific past time, so Past Simple fits.";
      feedback.className = "feedback correct";
    } else {
      btn.classList.add("wrong");
      feedback.textContent = "Close. Because the sentence says yesterday, use Past Simple: saw.";
      feedback.className = "feedback wrong";
    }
  });

  initLessonPicker();
  initDailyQuiz();
  initVocabularySearch();
  initSpeakingTimer();
  initPracticeHub();
  initProfilePhoto();
  initProfileSettings();
  initChat();
  initInterview();
  initBusinessMeeting();
  checkApi();

  const retakeBtn = document.querySelector("#retakeQuizButton");
  if (retakeBtn) retakeBtn.addEventListener("click", () => { showSection("quiz"); loadAiQuiz(); });
}

function initLessonPicker() {
  document.querySelector("#lessonPicker").addEventListener("click", async e => {
    const btn = e.target.closest("[data-lesson-index]");
    if (!btn) return;
    await saveProgress({ lessonIndex: Number(btn.dataset.lessonIndex) });
  });

  document.querySelector("#completeLessonButton").addEventListener("click", async () => {
    const idx = Number(getProgress().lessonIndex || 0);
    const completed = [...new Set([...(getProgress().completedLessons || []), idx])];
    const next = Math.min(idx + 1, lessons.length - 1);
    const newUnits = (liveProfile?.weeklyUnits || 0) + 1;
    liveProfile = { ...liveProfile, weeklyUnits: newUnits };
    await saveProgress({ lessonIndex: idx, completedLessons: completed });

    const headers = await authHeaders();
    await fetch(`${API_BASE_URL}/api/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ progress: liveProgress, weeklyUnits: newUnits })
    }).catch(() => setDoc(doc(db, "users", auth.currentUser.uid), { weeklyUnits: newUnits }, { merge: true }));

    const flowText = document.querySelector("#lessonFlowText");
    if (flowText) flowText.textContent = idx === lessons.length - 1
      ? "All lessons complete. Review or choose any lesson again."
      : `Lesson complete! Next: ${lessons[next].title}.`;
  });

  document.querySelector("#nextLessonButton").addEventListener("click", async () => {
    const next = (Number(getProgress().lessonIndex || 0) + 1) % lessons.length;
    await saveProgress({ lessonIndex: next });
  });
}

async function loadAiQuiz() {
  const dailyQuiz = document.querySelector("#dailyQuiz");
  const quizProgress = document.querySelector("#quizProgress");
  const dailyQuizFeedback = document.querySelector("#dailyQuizFeedback");

  // show loading state
  dailyQuiz.innerHTML = '<p style="padding:1rem;opacity:.6">Generating new questions with AI...</p>';
  if (quizProgress) quizProgress.style.width = "0%";
  if (dailyQuizFeedback) dailyQuizFeedback.textContent = "";

  let questions = null;
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE_URL}/api/quiz/generate`, { headers });
    const data = await res.json();
    questions = data.questions;
  } catch {}

  if (!questions || !questions.length) {
    dailyQuiz.innerHTML = '<p style="padding:1rem;color:red">Could not load quiz. Make sure the backend is running.</p>';
    return;
  }

  // render cards
  dailyQuiz.innerHTML = questions.map((q, i) => `
    <article class="card quiz-card" data-correct="${q.correct.replace(/"/g, '&quot;')}" data-explanation="${q.explanation.replace(/"/g, '&quot;')}">
      <p class="eyebrow">Question ${i + 1}</p>
      <h3>${q.question}</h3>
      <div class="answer-row">
        ${q.options.map(o => `<button data-choice="${o.replace(/"/g, '&quot;')}">${o}</button>`).join("")}
      </div>
    </article>
  `).join("") + `<p class="feedback" id="dailyQuizFeedback" aria-live="polite"></p>`;

  const answered = new Set();

  dailyQuiz.addEventListener("click", async e => {
    const btn = e.target.closest("button[data-choice]");
    if (!btn) return;
    const card = btn.closest(".quiz-card");
    if (!card || answered.has(card)) return;
    const isCorrect = btn.dataset.choice === card.dataset.correct;
    card.querySelectorAll("button").forEach(b => b.classList.remove("correct", "wrong"));
    btn.classList.add(isCorrect ? "correct" : "wrong");
    if (!isCorrect) card.querySelector(`[data-choice="${card.dataset.correct}"]`)?.classList.add("correct");
    answered.add(card);

    // show explanation
    let note = card.querySelector(".quiz-note");
    if (!note) { note = document.createElement("p"); note.className = "quiz-note"; note.style.cssText = "font-size:.85rem;opacity:.75;margin-top:.4rem"; card.appendChild(note); }
    note.textContent = card.dataset.explanation;

    const allCards = dailyQuiz.querySelectorAll(".quiz-card");
    const score = dailyQuiz.querySelectorAll(".quiz-card button.correct").length;
    const total = allCards.length;
    if (quizProgress) quizProgress.style.width = `${(answered.size / total) * 100}%`;
    const fb = document.querySelector("#dailyQuizFeedback");
    if (fb) { fb.textContent = `Answered ${answered.size}/${total}. Score: ${score}/${total}.`; fb.className = isCorrect ? "feedback correct" : "feedback wrong"; }

    if (answered.size === total) {
      const quizEntry = { score, total, date: new Date().toISOString() };
      await saveProgress({ quizScore: `${score}/${total}`, quizCompleted: true }, quizEntry);
      document.querySelector("#quizDoneSummary").textContent = `Today's session is over. Final score: ${score}/${total}.`;
      setTimeout(() => window.showLingoSection("quizDone"), 800);
    }
  });
}

function initDailyQuiz() {
  loadAiQuiz();
}

function initVocabularySearch() {
  document.querySelector("#vocabSearch").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll(".vocab-card").forEach(card => {
      card.classList.toggle("is-hidden", q.length > 0 && !`${card.dataset.word} ${card.textContent}`.toLowerCase().includes(q));
    });
  });
}

function initSpeakingTimer() {
  const btn = document.querySelector("#timerButton");
  const display = document.querySelector("#speakingTimer");
  let interval = null;
  let secs = 30;

  btn.addEventListener("click", async () => {
    if (interval) {
      clearInterval(interval); interval = null; secs = 30;
      display.textContent = "00:30";
      btn.innerHTML = 'Start Practice <span class="material-symbols-outlined">play_arrow</span>';
      return;
    }
    await saveProgress({ speakingSessions: (getProgress().speakingSessions || 0) + 1 });
    btn.innerHTML = 'Reset <span class="material-symbols-outlined">restart_alt</span>';
    interval = setInterval(() => {
      secs -= 1;
      display.textContent = `00:${String(secs).padStart(2, "0")}`;
      if (secs <= 0) { clearInterval(interval); interval = null; secs = 30; btn.innerHTML = 'Practice Again <span class="material-symbols-outlined">replay</span>'; }
    }, 1000);
  });
}

function initPracticeHub() {
  const $ = id => document.querySelector(id);
  if ($("#readAloudButton")) $("#readAloudButton").addEventListener("click", () => speakText($("#readAloudText").textContent));
  if ($("#stopReadAloudButton")) $("#stopReadAloudButton").addEventListener("click", () => window.speechSynthesis.cancel());
  if ($("#repeatHearButton")) $("#repeatHearButton").addEventListener("click", () => speakText("Please repeat: I have been practicing every day this week."));
  if ($("#repeatRecordButton")) $("#repeatRecordButton").addEventListener("click", () => { $("#repeatFeedback").textContent = "Great job. Try to match the sentence, then speak with steady rhythm."; speakText("Please repeat: I have been practicing every day this week."); });
  if ($("#imageDescribeButton")) $("#imageDescribeButton").addEventListener("click", () => { const d = $("#imageDescriptionInput").value.trim() || "A bright house stands beside a green tree under a sunny sky."; $("#imageDescriptionStatus").textContent = `You described: ${d}`; speakText(d); });
  if ($("#lectureSpeakButton")) $("#lectureSpeakButton").addEventListener("click", () => speakText($("#lectureContent").textContent));
  if ($("#lectureSaveButton")) $("#lectureSaveButton").addEventListener("click", () => { const s = $("#lectureRetellInput").value.trim() || "A good study routine helps memory because short daily practice builds confidence."; $("#lectureRetellStatus").textContent = `Saved: ${s}`; speakText(s); });
}

async function checkApi() {
  const status = document.querySelector("#apiStatus");
  if (!status) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    const data = await res.json();
    status.textContent = data.ok ? "API online" : "API error";
    status.className = `api-status ${data.ok ? "online" : "offline"}`;
  } catch {
    status.textContent = "API offline";
    status.className = "api-status offline";
  }
}

function addChatMessage(text, mine = false, selector = "#chatLog") {
  const log = document.querySelector(selector);
  const p = document.createElement("p");
  p.textContent = text;
  if (mine) p.classList.add("mine");
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
  return p;
}

async function streamAiReply(message, selector = "#chatLog", mode = "teacher", staff = "") {
  const bubble = addChatMessage("", false, selector);
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ message, mode, staff })
    });
    if (!res.ok || !res.body) throw new Error("Stream failed");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "", reply = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop() || "";
      parts.forEach(block => {
        const line = block.split("\n").find(l => l.startsWith("data: "));
        if (!line) return;
        const data = JSON.parse(line.slice(6));
        if (!data.token) return;
        reply += data.token;
        bubble.textContent = reply;
      });
    }
    return reply.trim();
  } catch {
    bubble.textContent = "Backend offline. Run: node server.js in the backend folder.";
    return bubble.textContent;
  }
}

function speakText(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

function initChat() {
  const form = document.querySelector("#chatForm");
  const input = document.querySelector("#chatInput");
  const voiceBtn = document.querySelector("#voiceButton");
  const speakLastBtn = document.querySelector("#speakLastButton");
  const autoSpeak = document.querySelector("#autoSpeakToggle");
  const staffSelect = document.querySelector("#staffSelect");
  const voiceStatus = document.querySelector("#voiceStatus");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let listening = false, lastReply = "";

  async function send(msg) {
    addChatMessage(msg, true);
    await saveProgress({ speakingSessions: (getProgress().speakingSessions || 0) + 1 });
    lastReply = await streamAiReply(msg, "#chatLog", "teacher", staffSelect.value);
    if (autoSpeak.checked) speakText(lastReply);
  }

  form.addEventListener("submit", async e => { e.preventDefault(); const msg = input.value.trim(); if (!msg) return; input.value = ""; await send(msg); });
  speakLastBtn.addEventListener("click", () => speakText(lastReply || "Send a message first."));

  if (!SR) { voiceStatus.textContent = "Voice needs Chrome or Edge"; voiceBtn.disabled = true; return; }
  const rec = new SR();
  rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
  rec.addEventListener("start", () => { listening = true; voiceStatus.textContent = "Listening..."; voiceBtn.innerHTML = '<span class="material-symbols-outlined">stop_circle</span> Stop'; });
  rec.addEventListener("result", e => { const t = Array.from(e.results).map(r => r[0].transcript).join(""); input.value = t; if (e.results[e.results.length - 1].isFinal) { rec.stop(); send(t.trim()); input.value = ""; } });
  rec.addEventListener("end", () => { listening = false; voiceStatus.textContent = "Voice ready"; voiceBtn.innerHTML = '<span class="material-symbols-outlined">mic</span> Start Listening'; });
  rec.addEventListener("error", () => { voiceStatus.textContent = "Microphone permission needed"; });
  voiceBtn.addEventListener("click", () => listening ? rec.stop() : rec.start());
}

function initInterview() {
  const form = document.querySelector("#interviewForm");
  const input = document.querySelector("#interviewInput");
  const questions = ["Tell me about yourself.", "Describe a challenge you solved at work or school.", "Why should we choose you for this role?", "Tell me about a time you worked with a team.", "Where do you want to improve your communication skills?"];
  let qi = 0;
  const ask = () => { const q = questions[qi++ % questions.length]; addChatMessage(q, false, "#interviewLog"); speakText(q); };
  document.querySelector("#startInterviewButton").addEventListener("click", () => { qi = 0; ask(); });
  document.querySelector("#nextInterviewQuestion").addEventListener("click", ask);
  form.addEventListener("submit", async e => { e.preventDefault(); const a = input.value.trim(); if (!a) return; input.value = ""; addChatMessage(a, true, "#interviewLog"); const r = await streamAiReply(a, "#interviewLog", "interview", "arjun"); speakText(r); });
}

function initBusinessMeeting() {
  const form = document.querySelector("#businessForm");
  const input = document.querySelector("#businessInput");
  const staffSelect = document.querySelector("#meetingStaffSelect");
  const prompts = ["Please give a short update on your project status.", "A teammate disagrees with your timeline. Respond politely.", "Ask the client one clarifying question about the deadline.", "Summarize the action items before the meeting ends.", "Explain a risk and suggest a practical solution."];
  let pi = 0;
  const addPrompt = () => { const p = prompts[pi++ % prompts.length]; addChatMessage(p, false, "#businessLog"); speakText(p); };
  document.querySelector("#startBusinessButton").addEventListener("click", () => { pi = 0; addPrompt(); });
  document.querySelector("#nextMeetingPrompt").addEventListener("click", addPrompt);
  form.addEventListener("submit", async e => { e.preventDefault(); const r = input.value.trim(); if (!r) return; input.value = ""; addChatMessage(r, true, "#businessLog"); const reply = await streamAiReply(r, "#businessLog", "business", staffSelect.value); speakText(reply); });
}

if (isLoginPage()) {
  initLoginPage();
} else {
  initAppPage();
}
