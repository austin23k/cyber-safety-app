const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { db, saveDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utility function to get last insert ID
function getLastInsertId() {
  try {
    const result = db.exec('SELECT last_insert_rowid() as id');
    return result[0].values[0][0];
  } catch (error) {
    return null;
  }
}

// Helper to convert sql.js result to array of objects
function resultToObjects(result) {
  if (result.length === 0) return [];
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running successfully!' });
});

// ============================================================
// HARASSMENT REPORT ENDPOINTS
// ============================================================

// Get all reports (for admin dashboard)
app.get('/api/reports', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM reports ORDER BY created_at DESC');
    const data = resultToObjects(result);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Get report by ID
app.get('/api/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.exec('SELECT * FROM reports WHERE id = ?', [id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const data = resultToObjects(result)[0];
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Submit a new harassment report
app.post('/api/reports', (req, res) => {
  try {
    const { type, description, email, phone, location, severity } = req.body;

    // Validation
    if (!type || !description) {
      return res.status(400).json({ error: 'Type and description are required' });
    }

    db.run(
      `INSERT INTO reports (type, description, email, phone, location, severity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, description, email || null, phone || null, location || null, severity || 'medium']
    );
    
    saveDatabase();
    const reportId = getLastInsertId();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      reportId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit report', details: error.message });
  }
});

// Update report status
app.put('/api/reports/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    db.run('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
    saveDatabase();

    res.json({ success: true, message: 'Report updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report', details: error.message });
  }
});

// ============================================================
// CONTACT MESSAGE ENDPOINTS
// ============================================================

// Get all contact messages
app.get('/api/contact-messages', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM contact_messages ORDER BY created_at DESC');
    const data = resultToObjects(result);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Submit a contact message
app.post('/api/contact-messages', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    db.run(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [name, email, subject, message]
    );
    
    saveDatabase();
    const messageId = getLastInsertId();

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      messageId
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Mark contact message as read
app.put('/api/contact-messages/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    db.run('UPDATE contact_messages SET read_status = 1 WHERE id = ?', [id]);
    saveDatabase();

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message', details: error.message });
  }
});

// ============================================================
// SUPPORT RESOURCES ENDPOINTS
// ============================================================

// Get all support resources
app.get('/api/support-resources', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM support_resources ORDER BY category, title');
    const data = resultToObjects(result);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// Get resources by category
app.get('/api/support-resources/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const result = db.exec(
      'SELECT * FROM support_resources WHERE category = ? ORDER BY title',
      [category]
    );
    const data = resultToObjects(result);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================
// STATISTICS ENDPOINT
// ============================================================

// Get general statistics
app.get('/api/statistics', (req, res) => {
  try {
    const totalReports = db.exec('SELECT COUNT(*) as count FROM reports');
    const pendingReports = db.exec('SELECT COUNT(*) as count FROM reports WHERE status = "pending"');
    const resolvedReports = db.exec('SELECT COUNT(*) as count FROM reports WHERE status = "resolved"');
    const totalMessages = db.exec('SELECT COUNT(*) as count FROM contact_messages');

    const stats = {
      totalReports: totalReports[0]?.values[0][0] || 0,
      pendingReports: pendingReports[0]?.values[0][0] || 0,
      resolvedReports: resolvedReports[0]?.values[0][0] || 0,
      totalMessages: totalMessages[0]?.values[0][0] || 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation:`);
  console.log(`   GET  /api/health - Check server status`);
  console.log(`   GET  /api/reports - Get all reports`);
  console.log(`   POST /api/reports - Submit a harassment report`);
  console.log(`   GET  /api/contact-messages - Get all contact messages`);
  console.log(`   POST /api/contact-messages - Send a contact message`);
  console.log(`   GET  /api/support-resources - Get all support resources`);
  console.log(`   GET  /api/statistics - Get site statistics`);
});
