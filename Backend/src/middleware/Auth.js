import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;


export function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; 
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function authOptional(req, _res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, SECRET);
  } catch {
   
  }
  next();
}
