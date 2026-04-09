import mongoose from 'mongoose';
import Migration from '../models/Migration.js';

export const getHistory = async (req, res, next) => {
  try {
    const migrations = await Migration.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $sort: { createdAt: -1 } },
      { $project: {
          slug: 1,
          sourceDb: 1,
          createdAt: 1,
          preview: { $substr: ["$originalSql", 0, 100] },
          warningCount: { $size: { $ifNull: ["$warnings", []] } }
      }}
    ]);

    return res.json({
      success: true,
      count: migrations.length,
      migrations
    });
  } catch (error) {
    next(error);
  }
};

export const getMigrationBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const migration = await Migration.findOne({ slug });
    if (!migration) {
      return res.status(404).json({ success: false, message: 'Migration not found' });
    }

    return res.json({
      success: true,
      slug: migration.slug,
      originalSql: migration.originalSql,
      convertedSql: migration.convertedSql,
      warnings: migration.warnings,
      notes: [],
      sourceDb: migration.sourceDb,
      createdAt: migration.createdAt
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMigration = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const migration = await Migration.findOne({ slug });
    if (!migration) {
      return res.status(404).json({ success: false, message: 'Migration not found' });
    }
    
    if (migration.userId?.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Migration.deleteOne({ slug });
    return res.json({ success: true, message: 'Migration deleted' });
  } catch (err) {
    next(err);
  }
};
