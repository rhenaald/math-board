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

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.attempt.deleteMany();
    return NextResponse.json({ success: true, message: "Semua riwayat nilai dibersihkan!" });
  } catch (e) {
    console.error("Clear attempts failed:", e);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
