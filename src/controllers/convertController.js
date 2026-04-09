import Groq from 'groq-sdk';
import mongoose from 'mongoose';
import Migration from '../models/Migration.js';
import { parseSql } from '../utils/sqlParser.js';
import { buildPrompt } from '../utils/promptBuilder.js';
import { checkRules } from '../utils/ruleChecker.js';

export const convertSql = async (req, res, next) => {
  try {
    const { sql, sourceDb } = req.body;

    if (!sql || sql.trim() === '') {
      return res.status(400).json({ success: false, message: 'SQL is required' });
    }

    if (sql.length > 10000) {
      return res.status(400).json({ success: false, message: 'SQL too large' });
    }

    const parsedSchema = parseSql(sql, sourceDb);
    const ruleWarnings = checkRules(sql, sourceDb);
    const prompt = buildPrompt(sql, parsedSchema, sourceDb);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a database migration expert. Always respond with valid JSON only. No explanation outside JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4096,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    let parsedData;
    
    try {
      parsedData = JSON.parse(content);
    } catch (err) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedData = JSON.parse(match[0]);
        } catch (e) {
            return res.status(500).json({ success: false, message: 'AI response parsing failed' });
        }
      } else {
        return res.status(500).json({ success: false, message: 'AI response parsing failed' });
      }
    }

    const groqWarnings = parsedData.warnings || [];
    const allWarnings = [...ruleWarnings, ...groqWarnings];
    
    const seen = new Set();
    const uniqueWarnings = allWarnings.filter(w => {
      if (seen.has(w.type)) return false;
      seen.add(w.type);
      return true;
    });

    const migration = new Migration({
      originalSql: sql,
      convertedSql: parsedData.convertedSql || '',
      sourceDb: sourceDb,
      warnings: uniqueWarnings,
      userId: req.userId || null
    });

    if (mongoose.connection.readyState === 1) {
      await migration.save();
    } else {
      console.warn('MongoDB not connected: skipping database save for this migration.');
    }

    return res.json({
      success: true,
      slug: migration.slug,
      originalSql: migration.originalSql,
      convertedSql: migration.convertedSql,
      warnings: migration.warnings,
      notes: parsedData.notes || [],
      sourceDb: migration.sourceDb
    });
  } catch (error) {
    next(error);
  }
};
