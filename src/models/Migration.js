import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const MigrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  originalSql: {
    type: String,
    required: true,
  },
  convertedSql: {
    type: String,
  },
  sourceDb: {
    type: String,
    enum: ['mysql', 'postgresql'],
  },
  warnings: [
    {
      type: { type: String },
      message: { type: String },
      level: { type: String },
    },
  ],
  slug: {
    type: String,
    unique: true,
    default: () => nanoid(10), // Generates a unique slug
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Migration = mongoose.model('Migration', MigrationSchema);

export default Migration;
