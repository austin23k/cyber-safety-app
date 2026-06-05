const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'harassment_reports.db');

let db = null;

async function initializeDatabase() {
  try {
    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath);
      db = new SQL.Database(data);
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        location TEXT,
        severity TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_status INTEGER DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS support_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        url TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    seedSupportResources();
    saveDatabase();

    console.log('Connected to SQLite database');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

function seedSupportResources() {
  try {
    const result = db.exec('SELECT COUNT(*) as count FROM support_resources');
    const count = result.length > 0 ? result[0].values[0][0] : 0;

    if (count === 0) {
      const resources = [
        {
          title: 'Cyberbullying Research Center',
          description: 'Evidence-based research and resources on cyberbullying',
          url: 'https://cyberbullying.org',
          category: 'Research'
        },
        {
          title: 'Crisis Text Line',
          description: 'Text HOME to 741741 for support',
          url: 'https://www.crisistextline.org',
          category: 'Crisis Support'
        },
        {
          title: 'National Center for Missing & Exploited Children',
          description: 'Help with online exploitation and cyberstalking',
          url: 'https://www.ncmec.org',
          category: 'Legal Support'
        }
      ];

      resources.forEach((resource) => {
        db.run(
          `INSERT INTO support_resources (title, description, url, category) 
           VALUES (?, ?, ?, ?)`,
          [resource.title, resource.description, resource.url, resource.category]
        );
      });

      console.log('Support resources seeded');
    }
  } catch (error) {
    console.error('Error seeding support resources:', error);
  }
}

function saveDatabase() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database has not been initialized yet');
  }
  return db;
}

module.exports = {
  initializeDatabase,
  getDb,
  saveDatabase,
  execQuery: (query, params = []) => {
    try {
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        const result = getDb().exec(query, params);
        return {
          success: true,
          data: result.length > 0 ? result[0].values : []
        };
      }

      getDb().run(query, params);
      saveDatabase();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
