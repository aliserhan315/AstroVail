import { success, error } from "../../utils/response.js";
import { OwnershipBlockchain } from "../../services/ownership.service.js";


export async function mint(req, res) {
  try {
    const { email, starId, orderId } = req.body || {};
    if (!email || !String(email).trim()) return error(res, "email required", 400);

    const out = await OwnershipBlockchain.mintToEmail({
      email: String(email).trim(),
      starId,
      orderId,
    });

    return success(res, out, "Minted to email");
  } catch (e) {
    console.error("mint error:", e);
    return error(res, e.message || "mint-failed", 500);
  }
}

export async function starsByEmail(req, res) {
  try {
    const email = String(req.query.email || "").trim();
    if (!email) return error(res, "email required", 400);

    const records = await OwnershipBlockchain.getStarsByEmail(email);
    return success(res, { email, records }, "Stars for email");
  } catch (e) {
    console.error("stars error:", e);
    return error(res, e.message || "query-failed", 500);
  }
}


export async function contractOwner(req, res) {
  try {
    const owner = await OwnershipBlockchain.contractOwner();
    return success(res, { owner }, "Contract owner");
  } catch (e) {
    return error(res, e.message || "owner-failed", 500);
  }
}

export async function ownerOf(req, res) {
  try {
    const tokenId = String(req.query.tokenId || "").trim();
    if (!tokenId) return error(res, "tokenId required", 400);

    const owner = await OwnershipBlockchain.ownerOf(tokenId);
    return success(res, { tokenId, owner }, "On-chain token owner");
  } catch (e) {
    console.error("ownerOf error:", e);
    return error(res, e.message || "ownerOf-failed", 500);
  }
}


export async function currentTokenId(req, res) {
  try {
    const id = await OwnershipBlockchain.currentTokenId();
    return success(res, { currentTokenId: id }, "Current token id");
  } catch (e) {
    console.error("currentTokenId error:", e);
    return error(res, e.message || "currentTokenId-failed", 500);
  }
}
