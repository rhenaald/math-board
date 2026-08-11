import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretguruauthkey";

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

// POST: Save a new attempt (Public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, dateStr, correctCount, wrongCount, totalTime, questions } = body;

    if (!studentName || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    // Hitung attemptNumber untuk nama siswa ini
    const count = await prisma.attempt.count({
      where: {
        studentName: {
          equals: studentName,
          mode: "insensitive",
        },
      },
    });
    const attemptNumber = count + 1;

    const attempt = await prisma.attempt.create({
      data: {
        studentName,
        dateStr,
        attemptNumber,
        correctCount,
        wrongCount,
        totalTime,
        questions: {
          create: questions.map((q: any) => ({
            no: q.no,
            operation: q.operation,
            questionStr: q.questionStr,
            userAnswer: q.userAnswer,
            isCorrect: q.isCorrect,
            timeTaken: q.timeTaken,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({ success: true, attempt });
  } catch (e) {
    console.error("POST attempt failed:", e);
    return NextResponse.json({ error: "Gagal menyimpan hasil kuis" }, { status: 500 });
  }
}
