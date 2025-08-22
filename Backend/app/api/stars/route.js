import { connectDB } from "@/lib/db";
import Star from "@/models/Star";
import { verifyFromAuthHeader } from "@/lib/jwt";
import { okJson, badRequest, unauthorized, methodNotAllowed, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const stars = q
    ? await Star.find({ $text: { $search: q } }).limit(50)
    : await Star.find().limit(50).sort({ createdAt: -1 });
  return okJson(stars);
}

export async function POST(req) {
  await connectDB();
  const payload = verifyFromAuthHeader(req);
  if (!payload) return unauthorized();

  const body = await req.json();
  if (!body.baseName && !body.displayName) return badRequest("baseName or displayName required");

  const star = await Star.create({
    owner: payload.sub,
    baseName: body.baseName,
    displayName: body.displayName,
    ra: body.ra,
    dec: body.dec,
    magnitude: body.magnitude,
    constellation: body.constellation,
    certificateStyle: body.certificateStyle || "classic",
    catalogId: body.catalogId,
  });

  return okJson(star);
}

export function PATCH() { return methodNotAllowed(); }
