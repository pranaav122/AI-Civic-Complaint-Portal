import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'civic.db');

// sql.js wrapper that provides a better-sqlite3-compatible API
class DatabaseWrapper {
  constructor() {
    this.db = null;
    this.dbPath = dbPath;
    this._initPromise = this._init();
  }

  async _init() {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }

    // Set PRAGMAs
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');

    // Read and execute schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db.run(schema);
    }

    // Auto-save periodically
    this._saveInterval = setInterval(() => this.save(), 5000);
    if (this._saveInterval.unref) this._saveInterval.unref();

    return this;
  }

  async ready() {
    await this._initPromise;
    return this;
  }

  save() {
    if (this.db) {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    }
  }

  prepare(sql) {
    const self = this;
    return {
      run(...params) {
        try {
          self.db.run(sql, params);
          // Get last insert rowid and changes
          const lastId = self.db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
          const changes = self.db.exec('SELECT changes() as c')[0]?.values[0][0];
          self.save();
          return { lastInsertRowid: lastId, changes };
        } catch (e) {
          console.error('SQL run error:', sql, params, e.message);
          throw e;
        }
      },
      get(...params) {
        try {
          const stmt = self.db.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            stmt.free();
            const row = {};
            cols.forEach((col, i) => row[col] = vals[i]);
            return row;
          }
          stmt.free();
          return undefined;
        } catch (e) {
          console.error('SQL get error:', sql, params, e.message);
          throw e;
        }
      },
      all(...params) {
        try {
          const stmt = self.db.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            const row = {};
            cols.forEach((col, i) => row[col] = vals[i]);
            results.push(row);
          }
          stmt.free();
          return results;
        } catch (e) {
          console.error('SQL all error:', sql, params, e.message);
          throw e;
        }
      }
    };
  }

  exec(sql) {
    this.db.run(sql);
    this.save();
  }

  pragma(statement) {
    try {
      this.db.run(`PRAGMA ${statement}`);
    } catch (e) {
      // Some pragmas may not be supported in sql.js
    }
  }

  transaction(fn) {
    return (...args) => {
      this.db.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        this.db.run('COMMIT');
        this.save();
        return result;
      } catch (e) {
        this.db.run('ROLLBACK');
        throw e;
      }
    };
  }

  close() {
    if (this._saveInterval) clearInterval(this._saveInterval);
    this.save();
    if (this.db) this.db.close();
  }
}

const db = new DatabaseWrapper();

export default db;
export { db };
