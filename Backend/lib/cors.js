const ALLOW_ORIGIN = "*"; // tighten in prod

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function okJson(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...corsHeaders(), ...(init.headers || {}) },
  });
}

export function badRequest(msg) {
  return okJson({ error: msg }, { status: 400 });
}

export function unauthorized(msg = "Unauthorized") {
  return okJson({ error: msg }, { status: 401 });
}

export function methodNotAllowed() {
  return okJson({ error: "Method not allowed" }, { status: 405 });
}
