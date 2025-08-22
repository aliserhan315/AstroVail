import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { okJson, badRequest, methodNotAllowed, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  if (!email || !password) return badRequest("email and password required");

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) return okJson({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return okJson({ error: "Invalid credentials" }, { status: 401 });

  const token = signJwt({ sub: user._id.toString(), email: user.email });
  return okJson({
    accessToken: token,
    user: { id: user._id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
  });
}

export function GET() { return methodNotAllowed(); }
