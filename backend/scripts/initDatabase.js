const db = require('../config/database');
const bcrypt = require('bcryptjs');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create employees table
      db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'cashier',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create categories table
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#3B82F6',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create products table
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER,
        stock_quantity INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`);

      // Create transactions table
      db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        employee_id INTEGER,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_method TEXT DEFAULT 'cash',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
      )`);

      // Create transaction_items table
      db.run(`CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`);

      // Insert sample categories
      const categories = [
        { name: 'Food', color: '#10B981' },
        { name: 'Beverages', color: '#3B82F6' },
        { name: 'Snacks', color: '#F59E0B' },
        { name: 'Electronics', color: '#8B5CF6' },
        { name: 'Clothing', color: '#EF4444' }
      ];

      const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)`);
      categories.forEach(cat => {
        insertCategory.run(cat.name, cat.color);
      });
      insertCategory.finalize();

      // Insert sample products based on the screenshot
      const products = [
        { barcode: '5562', name: 'Megans T Shirt', description: 'Comfortable cotton t-shirt', price: 15.29, category_id: 5, stock_quantity: 10 },
        { barcode: '5563', name: 'Megans T Shirt', description: 'Comfortable cotton t-shirt', price: 2.96, category_id: 5, stock_quantity: 15 },
        { barcode: '5564', name: 'Megans T Shirt', description: 'Comfortable cotton t-shirt', price: 2.96, category_id: 5, stock_quantity: 8 },
        { barcode: '5565', name: 'Megans T Shirt', description: 'Comfortable cotton t-shirt', price: 2.96, category_id: 5, stock_quantity: 12 },
        { barcode: '1001', name: 'Dr Pepper', description: 'Refreshing soda drink', price: 12.97, category_id: 2, stock_quantity: 20 },
        { barcode: '1002', name: 'Sunrise Max Orange', description: 'Fresh orange juice', price: 5.64, category_id: 2, stock_quantity: 25 },
        { barcode: '1003', name: 'Chill Cheeze Fr LRG', description: 'Large frozen cheese snack', price: 4.72, category_id: 3, stock_quantity: 18 },
        { barcode: '1004', name: 'Fries', description: 'Crispy french fries', price: 2.61, category_id: 1, stock_quantity: 30 },
        { barcode: '1005', name: 'Hot dog Reg', description: 'Regular hot dog', price: 2.31, category_id: 1, stock_quantity: 22 },
        { barcode: '1006', name: 'Hot Dog Jumbo LRG', description: 'Large jumbo hot dog', price: 2.91, category_id: 1, stock_quantity: 15 },
        { barcode: '1007', name: 'Popcorn LRG', description: 'Large popcorn', price: 2.61, category_id: 3, stock_quantity: 25 },
        { barcode: '1008', name: 'Cotton Candy', description: 'Sweet cotton candy', price: 2.31, category_id: 3, stock_quantity: 20 },
        { barcode: '1009', name: 'Bag of Chips', description: 'Crispy potato chips', price: 2.31, category_id: 3, stock_quantity: 40 },
        { barcode: '1010', name: 'Fountain Drink', description: 'Refreshing fountain beverage', price: 2.31, category_id: 2, stock_quantity: 50 },
        { barcode: '1011', name: 'Nachos', description: 'Cheese nachos with chips', price: 2.91, category_id: 1, stock_quantity: 18 },
        { barcode: '1012', name: 'Cookie', description: 'Fresh baked cookie', price: 2.31, category_id: 3, stock_quantity: 35 },
        { barcode: '1013', name: 'hamburger KIT', description: 'Complete hamburger kit', price: 7.14, category_id: 1, stock_quantity: 12 },
        { barcode: '1014', name: 'B.L.T. Combo', description: 'Bacon lettuce tomato combo', price: 5.93, category_id: 1, stock_quantity: 10 },
        { barcode: '1015', name: 'B.L.T.', description: 'Bacon lettuce tomato sandwich', price: 3.52, category_id: 1, stock_quantity: 15 },
        { barcode: '1016', name: 'Samsung Galaxy', description: 'Smartphone device', price: 769.99, category_id: 4, stock_quantity: 5 },
        { barcode: '1017', name: 'Bulk Sour Candy', description: 'Assorted sour candies', price: 4.61, category_id: 3, stock_quantity: 28 },
        { barcode: '1018', name: 'buy one get one', description: 'Special promotion item', price: 4.99, category_id: 3, stock_quantity: 20 },
        { barcode: '1019', name: 'Candy LRG', description: 'Large candy selection', price: 2.61, category_id: 3, stock_quantity: 30 }
      ];

      const insertProduct = db.prepare(`INSERT OR IGNORE INTO products (barcode, name, description, price, category_id, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)`);
      products.forEach(product => {
        insertProduct.run(product.barcode, product.name, product.description, product.price, product.category_id, product.stock_quantity);
      });
      insertProduct.finalize();

      // Create default admin user
      const saltRounds = 10;
      bcrypt.hash('admin123', saltRounds, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        db.run(`INSERT OR IGNORE INTO employees (name, email, password, role) VALUES (?, ?, ?, ?)`,
          ['Administrator', 'admin@pos.com', hash, 'admin'], (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Database initialized successfully!');
            console.log('Default admin credentials:');
            console.log('Email: admin@pos.com');
            console.log('Password: admin123');
            resolve();
          }
        });
      });
    });
  });
};

if (require.main === module) {
  initDatabase().then(() => {
    db.close();
    process.exit(0);
  }).catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
}

module.exports = initDatabase;