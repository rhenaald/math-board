import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretguruauthkey";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded) {
      return NextResponse.json({ success: true, authenticated: true });
    }

    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }
}
