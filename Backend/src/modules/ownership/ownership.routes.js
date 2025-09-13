import { Router } from 'express';
import { success, error } from '../../utils/response.js';
import { OwnershipBlockchain } from '../../services/ownership.service.js';

const router = Router();

router.post('/mint', async (req, res) => {
  try {
    const { email, starId, orderId } = req.body || {};
    if (!email) return error(res, 'email required', 400);
    const out = await OwnershipBlockchain.mintToEmail({ email, starId, orderId });
    return success(res, out, 'Minted to email');
  } catch (e) {
    console.error('mint error:', e);
    return error(res, e.message || 'mint-failed', 500);
  }
});

router.get('/stars', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim();
    if (!email) return error(res, 'email required', 400);
    const records = await OwnershipBlockchain.getStarsByEmail(email);
    return success(res, { email, records }, 'Stars for email');
  } catch (e) {
    console.error('stars error:', e);
    return error(res, e.message || 'query-failed', 500);
  }
});

router.get('/owner', async (_req, res) => {
  try {
    const owner = await OwnershipBlockchain.contractOwner();
    return success(res, { owner }, 'Contract owner');
  } catch (e) {
    return error(res, e.message || 'owner-failed', 500);
  }
});

router.get('/ownerOf', async (req, res) => {
  try {
    const tokenId = String(req.query.tokenId || '').trim();
    if (!tokenId) return error(res, 'tokenId required', 400);
    const owner = await OwnershipBlockchain.ownerOf(tokenId);
    return success(res, { tokenId, owner }, 'On-chain token owner');
  } catch (e) {
    console.error('ownerOf error:', e);
    return error(res, e.message || 'ownerOf-failed', 500);
  }
});

router.get('/currentTokenId', async (_req, res) => {
  try {
    const id = await OwnershipBlockchain.currentTokenId();
    return success(res, { currentTokenId: id }, 'Current token id');
  } catch (e) {
    console.error('currentTokenId error:', e);
    return error(res, e.message || 'currentTokenId-failed', 500);
  }
});

export default router;
