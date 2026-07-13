export function createEmptyProgress() {
  return {
    lessonIndex: 0,
    completedLessons: [],
    quizScore: "0/0",
    quizCompleted: false,
    speakingSessions: 0,
    lastActivity: ""
  };
}

export function buildProgressPercent(progress, lessonCount = 4) {
  const completedLessons = Array.isArray(progress?.completedLessons) ? progress.completedLessons : [];
  if (!lessonCount || lessonCount <= 0) return 0;
  return Math.min(100, Math.round((completedLessons.length / lessonCount) * 100));
}

export function buildQuizPercent(progress, total = 4) {
  const scoreText = String(progress?.quizScore || "0/0");
  const [scorePart] = scoreText.split("/");
  const score = Number.parseInt(scorePart, 10) || 0;
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((score / total) * 100));
}
