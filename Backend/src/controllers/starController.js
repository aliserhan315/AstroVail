import { StarService } from "../services/starService.js";
import { success, error } from "../utils/response.js";

export async function getStars(req, res) {
  try {
    const out = await StarService.list(req.query.q, req.query);
    return success(res, out);
  } catch (e) {
    console.error("getStars:", e);
    return error(res);
  }
}
export async function getStar(req, res) {
  try {
    const star = await StarService.getById(req.params.id);
    return success(res, star);
  } catch (e) {
    if (e.status === 404 || e.message === "Star not found") {
      return error(res, "Star not found", 404);
    }
    console.error("getStar:", e);
    return error(res);
  }
}
export async function getStarByCatalog(req, res) {
  try {
    const star = await StarService.getByCatalog(req.params.catalogId);
    return success(res, star);
  } catch (e) {
    if (e.status === 404 || e.message === "Star not found") {
      return error(res, "Star not found", 404);
    }
    console.error("getStarByCatalog:", e);
    return error(res);
  }
}
export async function createStar(req, res) {
  try {
    const userId = req.user?.sub || null;
    const star = await StarService.create(userId, req.body);
    return success(res, star, "Created", 201);
  } catch (e) {
    if (e.status) return error(res, e.message, e.status);
    console.error("createStar:", e);
    return error(res);
  }
}
export async function updateStar(req, res) {
  try {
    const userId = req.user.sub;
    const star = await StarService.update(userId, req.params.id, req.body);
    return success(res, star, "Updated");
  } catch (e) {
    if (e.status) return error(res, e.message, e.status);
    console.error("updateStar:", e);
    return error(res);
  }
}
export async function deleteStar(req, res) {
  try {
    const userId = req.user.sub;
    const out = await StarService.remove(userId, req.params.id);
    return success(res, out, "Deleted");
  } catch (e) {
    if (e.status) return error(res, e.message, e.status);
    console.error("deleteStar:", e);
    return error(res);
  }
}

export async function getMyStars(req, res) {
  try {
    const userId = req.user.sub;
    const out = await StarService.listOwned(userId, req.query);
    return success(res, out);
  } catch (e) {
    console.error("getMyStars:", e);
    return error(res);
  }
}
