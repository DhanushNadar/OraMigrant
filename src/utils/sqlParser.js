import pkg from 'node-sql-parser';
const { Parser } = pkg;

export const parseSql = (sql, sourceDb) => {
  const parser = new Parser();
  try {
    const dbType = sourceDb === 'postgresql' ? 'PostgresSQL' : 'MySQL';
    const ast = parser.astify(sql, { database: dbType });
    const statements = Array.isArray(ast) ? ast : [ast];
    
    const tables = [];
    
    for (const stmt of statements) {
      if (stmt.type === 'create' && stmt.keyword === 'table') {
        const tableName = stmt.table && stmt.table[0] ? stmt.table[0].table : 'unknown';
        const columns = [];
        let primaryKey = null;
        const foreignKeys = [];

        if (stmt.create_definitions) {
          for (const def of stmt.create_definitions) {
            if (def.resource === 'column') {
              const constraints = [];
              if (def.primary_key) constraints.push('PRIMARY KEY');
              if (def.unique) constraints.push('UNIQUE');
              if (def.auto_increment) constraints.push('AUTO_INCREMENT');
              
              let typeStr = def.definition?.dataType || 'UNKNOWN';
              if (def.definition?.length) {
                typeStr += `(${def.definition.length})`;
              }

              columns.push({
                name: def.column?.column || 'unknown',
                type: typeStr,
                constraints
              });
              
              if (def.primary_key && !primaryKey) {
                primaryKey = def.column?.column;
              }
            } else if (def.resource === 'constraint') {
              if (def.constraint_type === 'PRIMARY KEY' || def.constraint_type === 'primary key') {
                if (def.definition && def.definition[0]) {
                  primaryKey = def.definition[0].column;
                }
              } else if (def.constraint_type === 'FOREIGN KEY' || def.constraint_type === 'foreign key') {
                 foreignKeys.push(def.definition);
              }
            }
          }
        }
        
        tables.push({
          name: tableName,
          columns,
          primaryKey,
          foreignKeys
        });
      }
    }

    return { tables };
  } catch (error) {
    return { tables: [], parseError: true };
  }
};
