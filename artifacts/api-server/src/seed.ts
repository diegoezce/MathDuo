import { db, lessonsTable, exercisesTable, achievementsTable } from "@workspace/db";

export async function seedLessons() {
  const existing = await db.select().from(lessonsTable).limit(1);
  if (existing.length > 0) return;

  const lessons = [
    {
      title: "Adding Small Numbers",
      description: "Learn to add numbers 1-10 with fun visuals",
      category: "addition",
      difficulty: 1,
      xpReward: 20,
      orderIndex: 1,
      requiredLessonIds: "[]",
      iconEmoji: "+",
      color: "#58CC02",
    },
    {
      title: "Adding Bigger Numbers",
      description: "Practice adding numbers up to 100",
      category: "addition",
      difficulty: 2,
      xpReward: 25,
      orderIndex: 2,
      requiredLessonIds: "[1]",
      iconEmoji: "+",
      color: "#58CC02",
    },
    {
      title: "Subtracting Small Numbers",
      description: "Take away numbers and find the difference",
      category: "subtraction",
      difficulty: 1,
      xpReward: 20,
      orderIndex: 3,
      requiredLessonIds: "[1]",
      iconEmoji: "-",
      color: "#FF4B4B",
    },
    {
      title: "Subtracting Bigger Numbers",
      description: "Work with subtraction up to 100",
      category: "subtraction",
      difficulty: 2,
      xpReward: 25,
      orderIndex: 4,
      requiredLessonIds: "[3]",
      iconEmoji: "-",
      color: "#FF4B4B",
    },
    {
      title: "Multiplication Basics",
      description: "Learn your times tables 1 through 5",
      category: "multiplication",
      difficulty: 2,
      xpReward: 30,
      orderIndex: 5,
      requiredLessonIds: "[2, 4]",
      iconEmoji: "x",
      color: "#CE82FF",
    },
    {
      title: "Multiplication Tables 6-10",
      description: "Master the harder multiplication facts",
      category: "multiplication",
      difficulty: 3,
      xpReward: 35,
      orderIndex: 6,
      requiredLessonIds: "[5]",
      iconEmoji: "x",
      color: "#CE82FF",
    },
    {
      title: "Division Basics",
      description: "Split numbers into equal groups",
      category: "division",
      difficulty: 2,
      xpReward: 30,
      orderIndex: 7,
      requiredLessonIds: "[5]",
      iconEmoji: "/",
      color: "#FF9600",
    },
    {
      title: "Long Division",
      description: "Divide larger numbers step by step",
      category: "division",
      difficulty: 3,
      xpReward: 40,
      orderIndex: 8,
      requiredLessonIds: "[7]",
      iconEmoji: "/",
      color: "#FF9600",
    },
    {
      title: "Understanding Fractions",
      description: "Learn what fractions mean and how to read them",
      category: "fractions",
      difficulty: 3,
      xpReward: 40,
      orderIndex: 9,
      requiredLessonIds: "[6, 7]",
      iconEmoji: "1/2",
      color: "#1CB0F6",
    },
    {
      title: "Adding Fractions",
      description: "Add fractions with the same and different denominators",
      category: "fractions",
      difficulty: 4,
      xpReward: 50,
      orderIndex: 10,
      requiredLessonIds: "[9]",
      iconEmoji: "1/2",
      color: "#1CB0F6",
    },
    {
      title: "Algebra Basics",
      description: "Solve for x in simple equations",
      category: "algebra",
      difficulty: 4,
      xpReward: 60,
      orderIndex: 11,
      requiredLessonIds: "[8, 10]",
      iconEmoji: "x=",
      color: "#FF86D0",
    },
    {
      title: "Linear Equations",
      description: "Solve equations with one variable",
      category: "algebra",
      difficulty: 5,
      xpReward: 75,
      orderIndex: 12,
      requiredLessonIds: "[11]",
      iconEmoji: "x=",
      color: "#FF86D0",
    },
  ];

  const insertedLessons = await db.insert(lessonsTable).values(lessons).returning();

  const exercisesByLesson: Record<number, any[]> = {
    1: [
      { type: "multiple_choice", question: "What is 3 + 4?", options: JSON.stringify(["5", "6", "7", "8"]), correctAnswer: "7", orderIndex: 1 },
      { type: "fill_blank", question: "5 + ___ = 9", options: null, correctAnswer: "4", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 2 + 6?", options: JSON.stringify(["7", "8", "9", "10"]), correctAnswer: "8", orderIndex: 3 },
      { type: "fill_blank", question: "1 + 1 = ___", options: null, correctAnswer: "2", orderIndex: 4 },
      { type: "multiple_choice", question: "What is 7 + 3?", options: JSON.stringify(["9", "10", "11", "12"]), correctAnswer: "10", orderIndex: 5 },
    ],
    2: [
      { type: "multiple_choice", question: "What is 25 + 37?", options: JSON.stringify(["52", "62", "72", "42"]), correctAnswer: "62", orderIndex: 1 },
      { type: "fill_blank", question: "48 + ___ = 75", options: null, correctAnswer: "27", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 56 + 44?", options: JSON.stringify(["90", "100", "110", "120"]), correctAnswer: "100", orderIndex: 3 },
      { type: "word_problem", question: "A store has 34 apples. They receive 29 more. How many apples total?", options: JSON.stringify(["53", "63", "73", "43"]), correctAnswer: "63", orderIndex: 4 },
      { type: "fill_blank", question: "67 + 25 = ___", options: null, correctAnswer: "92", orderIndex: 5 },
    ],
    3: [
      { type: "multiple_choice", question: "What is 9 - 4?", options: JSON.stringify(["3", "4", "5", "6"]), correctAnswer: "5", orderIndex: 1 },
      { type: "fill_blank", question: "10 - ___ = 6", options: null, correctAnswer: "4", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 7 - 3?", options: JSON.stringify(["3", "4", "5", "6"]), correctAnswer: "4", orderIndex: 3 },
      { type: "fill_blank", question: "8 - 5 = ___", options: null, correctAnswer: "3", orderIndex: 4 },
      { type: "multiple_choice", question: "What is 10 - 7?", options: JSON.stringify(["1", "2", "3", "4"]), correctAnswer: "3", orderIndex: 5 },
    ],
    4: [
      { type: "multiple_choice", question: "What is 45 - 18?", options: JSON.stringify(["25", "27", "29", "23"]), correctAnswer: "27", orderIndex: 1 },
      { type: "fill_blank", question: "92 - 37 = ___", options: null, correctAnswer: "55", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 80 - 34?", options: JSON.stringify(["44", "46", "48", "42"]), correctAnswer: "46", orderIndex: 3 },
      { type: "word_problem", question: "A library has 75 books. 28 are checked out. How many remain?", options: JSON.stringify(["47", "53", "43", "57"]), correctAnswer: "47", orderIndex: 4 },
      { type: "fill_blank", question: "100 - 64 = ___", options: null, correctAnswer: "36", orderIndex: 5 },
    ],
    5: [
      { type: "multiple_choice", question: "What is 3 × 4?", options: JSON.stringify(["10", "11", "12", "13"]), correctAnswer: "12", orderIndex: 1 },
      { type: "fill_blank", question: "5 × ___ = 20", options: null, correctAnswer: "4", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 2 × 7?", options: JSON.stringify(["12", "14", "16", "10"]), correctAnswer: "14", orderIndex: 3 },
      { type: "fill_blank", question: "4 × 4 = ___", options: null, correctAnswer: "16", orderIndex: 4 },
      { type: "multiple_choice", question: "What is 5 × 5?", options: JSON.stringify(["20", "25", "30", "35"]), correctAnswer: "25", orderIndex: 5 },
    ],
    6: [
      { type: "multiple_choice", question: "What is 6 × 7?", options: JSON.stringify(["38", "40", "42", "44"]), correctAnswer: "42", orderIndex: 1 },
      { type: "fill_blank", question: "8 × 9 = ___", options: null, correctAnswer: "72", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 7 × 8?", options: JSON.stringify(["54", "56", "58", "60"]), correctAnswer: "56", orderIndex: 3 },
      { type: "fill_blank", question: "9 × 9 = ___", options: null, correctAnswer: "81", orderIndex: 4 },
      { type: "multiple_choice", question: "What is 6 × 6?", options: JSON.stringify(["30", "36", "42", "48"]), correctAnswer: "36", orderIndex: 5 },
    ],
    7: [
      { type: "multiple_choice", question: "What is 12 ÷ 3?", options: JSON.stringify(["2", "3", "4", "5"]), correctAnswer: "4", orderIndex: 1 },
      { type: "fill_blank", question: "20 ÷ ___ = 4", options: null, correctAnswer: "5", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 18 ÷ 6?", options: JSON.stringify(["2", "3", "4", "5"]), correctAnswer: "3", orderIndex: 3 },
      { type: "fill_blank", question: "35 ÷ 7 = ___", options: null, correctAnswer: "5", orderIndex: 4 },
      { type: "multiple_choice", question: "What is 24 ÷ 4?", options: JSON.stringify(["4", "5", "6", "7"]), correctAnswer: "6", orderIndex: 5 },
    ],
    8: [
      { type: "multiple_choice", question: "What is 96 ÷ 8?", options: JSON.stringify(["10", "12", "14", "16"]), correctAnswer: "12", orderIndex: 1 },
      { type: "fill_blank", question: "144 ÷ 12 = ___", options: null, correctAnswer: "12", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 84 ÷ 7?", options: JSON.stringify(["10", "12", "13", "14"]), correctAnswer: "12", orderIndex: 3 },
      { type: "word_problem", question: "72 students are divided into groups of 9. How many groups?", options: JSON.stringify(["6", "8", "9", "10"]), correctAnswer: "8", orderIndex: 4 },
      { type: "fill_blank", question: "132 ÷ 11 = ___", options: null, correctAnswer: "12", orderIndex: 5 },
    ],
    9: [
      { type: "multiple_choice", question: "What fraction is shaded if 2 of 4 parts are shaded?", options: JSON.stringify(["1/4", "2/4", "3/4", "4/4"]), correctAnswer: "2/4", orderIndex: 1 },
      { type: "multiple_choice", question: "Which fraction equals 1/2?", options: JSON.stringify(["1/3", "2/4", "3/8", "2/6"]), correctAnswer: "2/4", orderIndex: 2 },
      { type: "fill_blank", question: "1/4 is the same as ___/8", options: null, correctAnswer: "2", orderIndex: 3 },
      { type: "multiple_choice", question: "Which is bigger: 3/4 or 1/2?", options: JSON.stringify(["1/2", "3/4", "They're equal", "Cannot tell"]), correctAnswer: "3/4", orderIndex: 4 },
      { type: "fill_blank", question: "3/6 simplified is ___", options: null, correctAnswer: "1/2", orderIndex: 5 },
    ],
    10: [
      { type: "multiple_choice", question: "What is 1/4 + 1/4?", options: JSON.stringify(["1/4", "2/4", "3/4", "4/4"]), correctAnswer: "2/4", orderIndex: 1 },
      { type: "fill_blank", question: "1/3 + 1/3 = ___", options: null, correctAnswer: "2/3", orderIndex: 2 },
      { type: "multiple_choice", question: "What is 1/2 + 1/4?", options: JSON.stringify(["2/6", "3/4", "2/4", "4/6"]), correctAnswer: "3/4", orderIndex: 3 },
      { type: "fill_blank", question: "2/5 + 1/5 = ___", options: null, correctAnswer: "3/5", orderIndex: 4 },
      { type: "multiple_choice", question: "What is 3/8 + 1/8?", options: JSON.stringify(["4/16", "4/8", "2/8", "5/8"]), correctAnswer: "4/8", orderIndex: 5 },
    ],
    11: [
      { type: "multiple_choice", question: "Solve: x + 5 = 10", options: JSON.stringify(["3", "4", "5", "6"]), correctAnswer: "5", orderIndex: 1 },
      { type: "fill_blank", question: "x - 3 = 7, x = ___", options: null, correctAnswer: "10", orderIndex: 2 },
      { type: "multiple_choice", question: "Solve: 2x = 14", options: JSON.stringify(["5", "6", "7", "8"]), correctAnswer: "7", orderIndex: 3 },
      { type: "fill_blank", question: "x + 8 = 15, x = ___", options: null, correctAnswer: "7", orderIndex: 4 },
      { type: "multiple_choice", question: "Solve: x/3 = 4", options: JSON.stringify(["9", "12", "15", "18"]), correctAnswer: "12", orderIndex: 5 },
    ],
    12: [
      { type: "multiple_choice", question: "Solve: 2x + 3 = 11", options: JSON.stringify(["3", "4", "5", "6"]), correctAnswer: "4", orderIndex: 1 },
      { type: "fill_blank", question: "3x - 6 = 9, x = ___", options: null, correctAnswer: "5", orderIndex: 2 },
      { type: "multiple_choice", question: "Solve: 5x + 2 = 22", options: JSON.stringify(["3", "4", "5", "6"]), correctAnswer: "4", orderIndex: 3 },
      { type: "fill_blank", question: "2x + 5 = 17, x = ___", options: null, correctAnswer: "6", orderIndex: 4 },
      { type: "word_problem", question: "If 3 pencils cost $x total and each pencil is $4, what is x?", options: JSON.stringify(["10", "12", "14", "16"]), correctAnswer: "12", orderIndex: 5 },
    ],
  };

  for (const [lessonIndex, exercises] of Object.entries(exercisesByLesson)) {
    const lesson = insertedLessons[parseInt(lessonIndex) - 1];
    if (!lesson) continue;
    await db.insert(exercisesTable).values(
      exercises.map(e => ({ ...e, lessonId: lesson.id }))
    );
  }

  // Seed achievements
  const achievementsList = [
    { title: "First Step", description: "Complete your first lesson", iconEmoji: "star", requirement: "Complete 1 lesson" },
    { title: "On Fire", description: "Reach a 3-day streak", iconEmoji: "fire", requirement: "3-day streak" },
    { title: "Streak Master", description: "Reach a 7-day streak", iconEmoji: "lightning", requirement: "7-day streak" },
    { title: "XP Hunter", description: "Earn 100 XP total", iconEmoji: "gem", requirement: "Earn 100 XP" },
    { title: "Scholar", description: "Earn 500 XP total", iconEmoji: "book", requirement: "Earn 500 XP" },
    { title: "Perfect Score", description: "Complete a lesson with 100% accuracy", iconEmoji: "target", requirement: "100% accuracy on a lesson" },
    { title: "Consistent Learner", description: "Complete 5 lessons total", iconEmoji: "medal", requirement: "Complete 5 lessons" },
    { title: "Math Champion", description: "Complete 10 lessons total", iconEmoji: "trophy", requirement: "Complete 10 lessons" },
  ];
  const existingAchievements = await db.select().from(achievementsTable).limit(1);
  if (existingAchievements.length === 0) {
    await db.insert(achievementsTable).values(achievementsList);
  }
}
