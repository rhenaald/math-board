import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretguruauthkey";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === "admin" && password === "guru123") {
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
      
      const response = NextResponse.json({ success: true, message: "Login berhasil!" });
      
      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ success: false, message: "Username atau password salah!" }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
