import Level from '../models/Level.js';

export async function getLevels(req, res, next) {
  try {
    const levels = await Level.find({ isPublished: true })
      .sort({ levelNumber: 1 })
      .select('levelNumber difficulty objective shots targetScore starThresholds');

    res.status(200).json({ success: true, count: levels.length, levels });
  } catch (err) {
    next(err);
  }
}

export async function getLevelById(req, res, next) {
  try {
    const level = await Level.findOne({ levelNumber: parseInt(req.params.id, 10) });
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found.' });
    }
    res.status(200).json({ success: true, level });
  } catch (err) {
    next(err);
  }
}

