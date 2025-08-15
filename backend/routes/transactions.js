const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, limit = 50, start_date, end_date } = req.query;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT t.*, e.name as employee_name 
    FROM transactions t 
    LEFT JOIN employees e ON t.employee_id = e.id
  `;
  const params = [];

  const conditions = [];
  if (start_date) {
    conditions.push('DATE(t.created_at) >= ?');
    params.push(start_date);
  }
  if (end_date) {
    conditions.push('DATE(t.created_at) <= ?');
    params.push(end_date);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(transactions);
  });
});

// Get transaction by ID with items
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT t.*, e.name as employee_name 
    FROM transactions t 
    LEFT JOIN employees e ON t.employee_id = e.id 
    WHERE t.id = ?
  `, [id], (err, transaction) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get transaction items
    db.all(`
      SELECT ti.*, p.name as product_name, p.barcode 
      FROM transaction_items ti 
      LEFT JOIN products p ON ti.product_id = p.id 
      WHERE ti.transaction_id = ?
    `, [id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      transaction.items = items;
      res.json(transaction);
    });
  });
});

// Create new transaction
router.post('/', [
  authenticateToken,
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  body('subtotal').isFloat({ min: 0 }),
  body('tax').isFloat({ min: 0 }),
  body('total').isFloat({ min: 0 }),
  body('payment_method').isIn(['cash', 'card', 'digital'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { items, subtotal, tax, discount = 0, total, payment_method } = req.body;
  const transactionId = uuidv4();
  const employeeId = req.user.id;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert transaction
    db.run(`
      INSERT INTO transactions (transaction_id, employee_id, subtotal, tax, discount, total, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [transactionId, employeeId, subtotal, tax, discount, total, payment_method], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Database error' });
      }

      const dbTransactionId = this.lastID;
      let itemsProcessed = 0;
      let hasError = false;

      // Process each item
      items.forEach(item => {
        // First, get the current product price and stock
        db.get('SELECT price, stock_quantity FROM products WHERE id = ?', [item.product_id], (err, product) => {
          if (err || !product) {
            if (!hasError) {
              hasError = true;
              db.run('ROLLBACK');
              return res.status(400).json({ error: `Product ${item.product_id} not found` });
            }
            return;
          }

          // Check stock availability
          if (product.stock_quantity < item.quantity) {
            if (!hasError) {
              hasError = true;
              db.run('ROLLBACK');
              return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
            }
            return;
          }

          const unitPrice = product.price;
          const totalPrice = unitPrice * item.quantity;

          // Insert transaction item
          db.run(`
            INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `, [dbTransactionId, item.product_id, item.quantity, unitPrice, totalPrice], (err) => {
            if (err && !hasError) {
              hasError = true;
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Database error' });
            }

            // Update product stock
            db.run(
              'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
              [item.quantity, item.product_id],
              (err) => {
                if (err && !hasError) {
                  hasError = true;
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Database error' });
                }

                itemsProcessed++;
                
                // If all items processed successfully
                if (itemsProcessed === items.length && !hasError) {
                  db.run('COMMIT', (err) => {
                    if (err) {
                      return res.status(500).json({ error: 'Transaction commit failed' });
                    }

                    // Return the created transaction with items
                    db.get(`
                      SELECT t.*, e.name as employee_name 
                      FROM transactions t 
                      LEFT JOIN employees e ON t.employee_id = e.id 
                      WHERE t.id = ?
                    `, [dbTransactionId], (err, transaction) => {
                      if (err) {
                        return res.status(500).json({ error: 'Database error' });
                      }

                      db.all(`
                        SELECT ti.*, p.name as product_name, p.barcode 
                        FROM transaction_items ti 
                        LEFT JOIN products p ON ti.product_id = p.id 
                        WHERE ti.transaction_id = ?
                      `, [dbTransactionId], (err, transactionItems) => {
                        if (err) {
                          return res.status(500).json({ error: 'Database error' });
                        }
                        
                        transaction.items = transactionItems;
                        res.status(201).json(transaction);
                      });
                    });
                  });
                }
              }
            );
          });
        });
      });
    });
  });
});

// Get sales summary
router.get('/reports/summary', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = 'SELECT COUNT(*) as total_transactions, SUM(total) as total_sales, SUM(tax) as total_tax FROM transactions';
  const params = [];

  const conditions = [];
  if (start_date) {
    conditions.push('DATE(created_at) >= ?');
    params.push(start_date);
  }
  if (end_date) {
    conditions.push('DATE(created_at) <= ?');
    params.push(end_date);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  db.get(query, params, (err, summary) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(summary);
  });
});

module.exports = router;