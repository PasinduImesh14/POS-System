const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(categories);
  });
});

// Get category by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  });
});

// Create new category (admin only)
router.post('/', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').notEmpty().trim(),
  body('color').optional().isHexColor()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, color } = req.body;

  db.run(
    'INSERT INTO categories (name, color) VALUES (?, ?)',
    [name, color || '#3B82F6'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      db.get('SELECT * FROM categories WHERE id = ?', [this.lastID], (err, category) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json(category);
      });
    }
  );
});

// Update category (admin only)
router.put('/:id', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').optional().notEmpty().trim(),
  body('color').optional().isHexColor()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  db.run(`UPDATE categories SET ${fields} WHERE id = ?`, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(category);
    });
  });
});

// Delete category (admin only)
router.delete('/:id', [authenticateToken, authorizeRole(['admin'])], (req, res) => {
  const { id } = req.params;
  
  // Check if category has products
  db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with active products' });
    }
    
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category deleted successfully' });
    });
  });
});

module.exports = router;