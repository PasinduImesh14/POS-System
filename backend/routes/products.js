const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', authenticateToken, (req, res) => {
  const { category, search } = req.query;
  let query = `
    SELECT p.*, c.name as category_name, c.color as category_color 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.is_active = 1
  `;
  const params = [];

  if (category) {
    query += ' AND p.category_id = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.barcode LIKE ? OR p.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY p.name';

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

// Get product by barcode
router.get('/barcode/:barcode', authenticateToken, (req, res) => {
  const { barcode } = req.params;
  
  db.get(`
    SELECT p.*, c.name as category_name, c.color as category_color 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.barcode = ? AND p.is_active = 1
  `, [barcode], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Get product by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT p.*, c.name as category_name, c.color as category_color 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    WHERE p.id = ? AND p.is_active = 1
  `, [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Create new product (admin only)
router.post('/', [
  authenticateToken,
  authorizeRole(['admin']),
  body('barcode').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('category_id').isInt({ min: 1 }),
  body('stock_quantity').isInt({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { barcode, name, description, price, category_id, stock_quantity } = req.body;

  db.run(`
    INSERT INTO products (barcode, name, description, price, category_id, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [barcode, name, description, price, category_id, stock_quantity], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Product barcode already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Return the created product
    db.get(`
      SELECT p.*, c.name as category_name, c.color as category_color 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [this.lastID], (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(product);
    });
  });
});

// Update product (admin only)
router.put('/:id', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').optional().notEmpty().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category_id').optional().isInt({ min: 1 }),
  body('stock_quantity').optional().isInt({ min: 0 })
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

  db.run(`UPDATE products SET ${fields} WHERE id = ?`, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Return the updated product
    db.get(`
      SELECT p.*, c.name as category_name, c.color as category_color 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [id], (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(product);
    });
  });
});

// Delete product (admin only)
router.delete('/:id', [authenticateToken, authorizeRole(['admin'])], (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE products SET is_active = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;