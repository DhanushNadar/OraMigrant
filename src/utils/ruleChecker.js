export const checkRules = (sql, sourceDb) => {
  const warnings = [];
  const upperSql = sql.toUpperCase();

  if (sourceDb === 'mysql') {
    if (upperSql.includes('AUTO_INCREMENT')) {
      warnings.push({ type: 'auto_increment', level: 'warning', message: 'AUTO_INCREMENT replaced with SEQUENCE + TRIGGER in Oracle. Verify trigger fires correctly on all INSERT operations.' });
    }
    if (upperSql.includes('ENUM(')) {
      warnings.push({ type: 'enum', level: 'error', message: 'ENUM is not supported in Oracle. Converted to VARCHAR2 with CHECK constraint. Review all application-level enum validations.' });
    }
    if (upperSql.includes('TINYINT') || upperSql.includes('BOOLEAN')) {
      warnings.push({ type: 'boolean', level: 'warning', message: 'BOOLEAN/TINYINT converted to NUMBER(1). Update application code that expects true/false to use 1/0.' });
    }
    if (upperSql.includes('UNSIGNED')) {
      warnings.push({ type: 'unsigned', level: 'warning', message: 'UNSIGNED is not supported in Oracle. Add CHECK constraint manually if negative values must be prevented.' });
    }
    if (upperSql.includes('ON UPDATE CURRENT_TIMESTAMP')) {
      warnings.push({ type: 'on_update', level: 'error', message: 'ON UPDATE CURRENT_TIMESTAMP is not supported in Oracle. You must create a BEFORE UPDATE TRIGGER manually to replicate this.' });
    }
    if (upperSql.includes('ZEROFILL')) {
      warnings.push({ type: 'zerofill', level: 'warning', message: 'ZEROFILL is not supported in Oracle. Use LPAD() in your SELECT queries if zero-padding display is needed.' });
    }
    if (upperSql.includes('JSON')) {
      warnings.push({ type: 'json', level: 'warning', message: 'MySQL JSON type maps to Oracle JSON type (12c+) or CLOB. Verify your Oracle version supports native JSON.' });
    }
  } else if (sourceDb === 'postgresql') {
    if (upperSql.includes('SERIAL') || upperSql.includes('BIGSERIAL')) {
      warnings.push({ type: 'serial', level: 'warning', message: 'SERIAL/BIGSERIAL replaced with SEQUENCE + TRIGGER in Oracle.' });
    }
    if (upperSql.includes('RETURNING')) {
      warnings.push({ type: 'returning', level: 'error', message: 'RETURNING clause is not supported in Oracle DML. Use the RETURNING INTO clause instead for PL/SQL blocks.' });
    }
    if (upperSql.includes('ILIKE')) {
      warnings.push({ type: 'ilike', level: 'error', message: "ILIKE (case-insensitive LIKE) is not supported in Oracle. Use UPPER(col) LIKE UPPER('%value%') instead." });
    }
    if (upperSql.includes('::')) {
      warnings.push({ type: 'cast', level: 'warning', message: 'PostgreSQL cast operator (::) is not valid in Oracle. Use CAST(value AS type) or TO_NUMBER/TO_DATE/TO_CHAR functions.' });
    }
    if (upperSql.includes('TRUE') || upperSql.includes('FALSE')) {
      warnings.push({ type: 'boolean_literal', level: 'warning', message: 'TRUE/FALSE literals not supported in Oracle tables. Use 1/0 with NUMBER(1) and CHECK constraint.' });
    }
    if (upperSql.includes('NOW()')) {
      warnings.push({ type: 'now', level: 'warning', message: 'NOW() replaced with SYSTIMESTAMP in Oracle.' });
    }
    if (upperSql.includes('INTERVAL')) {
      warnings.push({ type: 'interval', level: 'warning', message: 'INTERVAL syntax differs in Oracle. Review interval expressions carefully.' });
    }
  }

  return warnings;
};
