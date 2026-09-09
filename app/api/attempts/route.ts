import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretguruauthkey";

interface AttemptQuestionItem {
  no: number;
  operation: string;
  questionStr: string;
  num1?: number | null;
  num2?: number | null;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  errorType?: string | null;
  errorDetail?: string | null;
  suggestedIntervention?: string | null;
}

async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    return !!jwt.verify(token, JWT_SECRET);
  } catch {
    return false;
  }
}

// GET: Fetch all attempts (Admin only)
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const attempts = await prisma.attempt.findMany({
      include: {
        questions: {
          orderBy: {
            no: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(attempts);
  } catch (e) {
    console.error("GET attempts failed:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// POST: Save or update an attempt (Public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      attemptId,
      studentName,
      dateStr,
      operation,
      placeValueLevel,
      correctCount,
      wrongCount,
      totalTime,
      summaryErrors,
      questions,
    } = body;

    const finalStudentName = (studentName && studentName.trim()) ? studentName.trim() : "Siswa";

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Data soal tidak valid" }, { status: 400 });
    }

    const questionCreateData = questions.map((q: AttemptQuestionItem) => ({
      no: q.no,
      operation: q.operation,
      questionStr: q.questionStr,
      num1: q.num1 !== undefined ? q.num1 : null,
      num2: q.num2 !== undefined ? q.num2 : null,
      userAnswer: q.userAnswer,
      isCorrect: q.isCorrect,
      timeTaken: q.timeTaken,
      errorType: q.errorType || null,
      errorDetail: q.errorDetail || null,
      suggestedIntervention: q.suggestedIntervention || null,
    }));

    const finalCorrectCount = typeof correctCount === "number" ? correctCount : questions.filter(q => q.isCorrect).length;
    const finalWrongCount = typeof wrongCount === "number" ? wrongCount : (questions.length - finalCorrectCount);
    const finalTotalTime = typeof totalTime === "number" ? totalTime : questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);

    // Jika attemptId diberikan, lakukan update sesi yang sedang berjalan
    if (attemptId) {
      const existing = await prisma.attempt.findUnique({
        where: { id: attemptId },
      });

      if (existing) {
        const [, updatedAttempt] = await prisma.$transaction([
          prisma.questionLog.deleteMany({
            where: { attemptId },
          }),
          prisma.attempt.update({
            where: { id: attemptId },
            data: {
              studentName: finalStudentName,
              dateStr: dateStr || existing.dateStr,
              operation: operation || existing.operation,
              placeValueLevel: placeValueLevel || existing.placeValueLevel,
              correctCount: finalCorrectCount,
              wrongCount: finalWrongCount,
              totalTime: finalTotalTime,
              summaryErrors: summaryErrors || null,
              questions: {
                create: questionCreateData,
              },
            },
            include: {
              questions: {
                orderBy: { no: "asc" },
              },
            },
          }),
        ]);

        return NextResponse.json({ success: true, attempt: updatedAttempt, updated: true });
      }
    }

    // Jika belum ada attemptId atau tidak ditemukan, buat attempt baru
    const count = await prisma.attempt.count({
      where: {
        studentName: {
          equals: finalStudentName,
          mode: "insensitive",
        },
      },
    });
    const attemptNumber = count + 1;

    const attempt = await prisma.attempt.create({
      data: {
        studentName: finalStudentName,
        dateStr: dateStr || new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
        attemptNumber,
        operation: operation || null,
        placeValueLevel: placeValueLevel || null,
        correctCount: finalCorrectCount,
        wrongCount: finalWrongCount,
        totalTime: finalTotalTime,
        summaryErrors: summaryErrors || null,
        questions: {
          create: questionCreateData,
        },
      },
      include: {
        questions: {
          orderBy: { no: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, attempt, created: true });
  } catch (e) {
    console.error("POST attempt failed:", e);
    return NextResponse.json({ error: "Gagal menyimpan hasil latihan" }, { status: 500 });
  }
}
