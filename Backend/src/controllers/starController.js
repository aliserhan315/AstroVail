import Star from '../models/Star.js';
import { verifyFromAuthHeader } from '../lib/jwt.js';

export async function getStars(req, res) {
  try {
    const q = req.query.q;
    const stars = q
      ? await Star.find({ $text: { $search: q } }).limit(50)
      : await Star.find().limit(50).sort({ createdAt: -1 });
    res.json(stars);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function createStar(req, res) {
  const payload = verifyFromAuthHeader(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { baseName, displayName, ra, dec, magnitude, constellation, certificateStyle, catalogId } = req.body;
  if (!baseName && !displayName) {
    return res.status(400).json({ error: 'baseName or displayName required' });
  }
  try {
    const star = await Star.create({
      owner: payload.sub,
      baseName,
      displayName,
      ra,
      dec,
      magnitude,
      constellation,
      certificateStyle: certificateStyle || 'classic',
      catalogId,
    });
    res.json(star);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateStar(req, res) {
  const payload = verifyFromAuthHeader(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { displayName, certificateStyle } = req.body;

  try {
    const star = await Star.findOne({ _id: id, owner: payload.sub });
    if (!star) {
      return res.status(404).json({ error: 'Star not found/owned' });
    }
    if (displayName !== undefined) star.displayName = displayName;
    if (certificateStyle) star.certificateStyle = certificateStyle;
    await star.save();
    res.json(star);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getStar(req, res) {
  try {
    const star = await Star.findById(req.params.id);
    if (!star) {
      return res.status(404).json({ error: 'Star not found' });
    }
    res.json(star);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteStar(req, res) {
  const payload = verifyFromAuthHeader(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  try {
    const star = await Star.findOneAndDelete({ _id: id, owner: payload.sub });
    if (!star) {
      return res.status(404).json({ error: 'Star not found/owned' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}
