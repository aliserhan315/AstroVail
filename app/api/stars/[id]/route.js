import { connectDB } from "@/lib/db";
import Star from "@/models/Star";
import { verifyFromAuthHeader } from "@/lib/jwt";
import { okJson, badRequest, unauthorized, methodNotAllowed, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function PATCH(req, { params }) {
  await connectDB();
  const payload = verifyFromAuthHeader(req);
  if (!payload) return unauthorized();

  const { id } = params;
  const body = await req.json();

  const star = await Star.findOne({ _id: id, owner: payload.sub });
  if (!star) return okJson({ error: "Star not found/owned" }, { status: 404 });

  if (body.displayName !== undefined) star.displayName = body.displayName;
  if (body.certificateStyle) star.certificateStyle = body.certificateStyle;

  await star.save();
  return okJson(star);
}

export function GET() { return methodNotAllowed(); }
export function POST() { return methodNotAllowed(); }
