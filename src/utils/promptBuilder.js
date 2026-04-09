export const buildPrompt = (originalSql, parsedSchema, sourceDb) => {
  const rules = sourceDb === 'postgresql' 
    ? `STRICT CONVERSION RULES — follow every single one:
1. SERIAL/BIGSERIAL → SEQUENCE + TRIGGER
2. TEXT → CLOB
3. BOOLEAN → NUMBER(1) CHECK (col IN (0,1))
4. NOW() → SYSTIMESTAMP
5. :: cast operator → CAST() function
6. RETURNING → RETURNING INTO (PL/SQL only)
7. ILIKE → UPPER(col) LIKE UPPER(val)
8. INTERVAL → Review manually
9. ARRAY types → Not supported, use separate table
10. End every statement with semicolon`
    : `STRICT CONVERSION RULES — follow every single one:
1. VARCHAR → VARCHAR2
2. INT, INTEGER, BIGINT → NUMBER
3. AUTO_INCREMENT → Remove it. Create SEQUENCE named 
   <tablename>_seq START WITH 1 INCREMENT BY 1 before the table.
   Also create a BEFORE INSERT TRIGGER named <tablename>_bir 
   that sets :NEW.id = <tablename>_seq.NEXTVAL
4. BOOLEAN, TINYINT(1) → NUMBER(1) with CHECK constraint (col IN (0,1))
5. CURRENT_TIMESTAMP → SYSTIMESTAMP
6. Backticks → Remove them. Use double quotes only if name is reserved word
7. LIMIT n → FETCH FIRST n ROWS ONLY
8. TEXT → CLOB
9. DATETIME → TIMESTAMP
10. DEFAULT TRUE → DEFAULT 1, DEFAULT FALSE → DEFAULT 0
11. Add ENABLE ROW MOVEMENT if table has updates
12. End every statement with semicolon`;

  return `You are an expert database migration specialist.
Convert the following ${sourceDb} SQL schema to Oracle SQL.

${rules}

Original ${sourceDb} SQL:
${originalSql}

Parsed structure for reference:
${JSON.stringify(parsedSchema, null, 2)}

Respond ONLY with valid JSON in this exact format, no markdown, no backticks:
{
  "convertedSql": "-- full Oracle SQL here as a single string",
  "warnings": [
    {
      "type": "conversion",
      "level": "warning",
      "message": "human readable explanation of what changed and why"
    }
  ],
  "notes": [
    "any additional things developer should know after migration"
  ]
}`;
};
