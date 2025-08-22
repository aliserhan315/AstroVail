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
  const { email, password, displayName } = await req.json();

  if (!email || !password) return badRequest("email and password required");

  const exists = await User.findOne({ email });
  if (exists) return badRequest("Email already in use");

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash: hash, displayName });

  const token = signJwt({ sub: user._id.toString(), email: user.email });
  return okJson({
    accessToken: token,
    user: { id: user._id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
  });
}

export function GET() { return methodNotAllowed(); }
