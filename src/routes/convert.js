import express from 'express';
import { convertSql } from '../controllers/convertController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
  } catch (e) {
    // invalid token — just ignore, treat as guest
  }
  next();
};

router.post('/', optionalAuth, convertSql);

export default router;
