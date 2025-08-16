const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './database/pos.db';
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        // Database connection successful, now run schema creation
        initializeDbSchema();
    }
});

// Enable foreign keys
db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
});

function initializeDbSchema() {
    db.serialize(() => {
        // Create tables if they don't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS USERS (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                full_name TEXT,
                role TEXT NOT NULL CHECK( role IN ('admin','cashier','manager') ),
                email TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS SUPPLIERS (
                supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                contact_person TEXT,
                phone TEXT,
                email TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS ITEMS (
                item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT UNIQUE,
                barcode TEXT UNIQUE,
                name TEXT NOT NULL,
                image BLOB,
                unit TEXT,
                category TEXT,
                supplier_id INTEGER,
                cost_price REAL,
                selling_price REAL,
                billing_price REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES SUPPLIERS(supplier_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS SUPPLIES (
                supply_id INTEGER PRIMARY KEY AUTOINCREMENT,
                supplier_id INTEGER NOT NULL,
                total_amount REAL,
                discount REAL,
                total_after_discount REAL,
                paid_amount REAL,
                paid_method TEXT CHECK( paid_method IN ('check','via_shop_balance','loan','cash','card') ),
                supply_date DATETIME,
                notes TEXT,
                FOREIGN KEY (supplier_id) REFERENCES SUPPLIERS(supplier_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS SUPPLY_PRODUCTS (
                supply_product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                supply_id INTEGER NOT NULL,
                batch_id TEXT,
                item_id INTEGER NOT NULL,
                quantity REAL,
                unit_price REAL,
                total_price REAL,
                FOREIGN KEY (supply_id) REFERENCES SUPPLIES(supply_id),
                FOREIGN KEY (item_id) REFERENCES ITEMS(item_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS CUSTOMERS (
                customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                nic TEXT,
                nic_image_front BLOB,
                nic_image_back BLOB,
                shop_balance REAL DEFAULT 0.00,
                phone TEXT,
                email TEXT,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS CUSTOMER_ORDERS (
                order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                customer_id INTEGER,
                cost REAL,
                discount REAL,
                total_cost REAL,
                paid_amount REAL,
                payment_method TEXT CHECK( payment_method IN ('cash','card','loan') ),
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                STATUS TEXT CHECK( STATUS IN ('PENDING','COMPLETE','LOAN','REFUND','PARTLYPAID','PARTLYREFUND') ),
                FOREIGN KEY (user_id) REFERENCES USERS(user_id),
                FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS ORDER_PRODUCTS (
                order_product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL,
                quantity REAL,
                STATUS TEXT CHECK( STATUS IN ('PENDING','COMPLETE','LOAN','REFUND') ),
                unit_price REAL,
                discountperitem REAL,
                line_total REAL,
                FOREIGN KEY (order_id) REFERENCES CUSTOMER_ORDERS(order_id),
                FOREIGN KEY (item_id) REFERENCES ITEMS(item_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS PAYMENTS (
                payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                order_id INTEGER,
                payment_reason TEXT,
                amount REAL,
                payment_method TEXT CHECK( payment_method IN ('cash','card','check') ),
                payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                received_by INTEGER,
                FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
                FOREIGN KEY (order_id) REFERENCES CUSTOMER_ORDERS(order_id),
                FOREIGN KEY (received_by) REFERENCES USERS(user_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS WITHDRAWALS (
                withdrawal_id INTEGER PRIMARY KEY AUTOINCREMENT,
                reason TEXT,
                amount REAL,
                withdrawal_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER,
                notes TEXT,
                FOREIGN KEY (user_id) REFERENCES USERS(user_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS SHOP_ACCOUNTS (
                account_id INTEGER PRIMARY KEY AUTOINCREMENT,
                shop_name TEXT,
                contact_person TEXT,
                phone TEXT,
                email TEXT,
                address TEXT,
                balance REAL DEFAULT 0.00,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS STOCK (
                stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                full_quantity REAL,
                healthy_quantity REAL,
                damaged_quantity REAL,
                expired_quantity REAL,
                unit TEXT CHECK( unit IN ('kg','liters','packets','bottles') ),
                stock_level TEXT CHECK( stock_level IN ('low','medium','high') ),
                last_updated DATETIME,
                FOREIGN KEY (item_id) REFERENCES ITEMS(item_id)
            );
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS STOCK_BATCHES (
                batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
                stock_id INTEGER NOT NULL,
                Full_batch_quantity REAL,
                health_batch_quantity REAL,
                damage_batch_quantity REAL,
                expired_batch_quantity REAL,
                expiry_date DATE,
                received_date DATE,
                FOREIGN KEY (stock_id) REFERENCES STOCK(stock_id)
            );
        `);
        console.log('Database schema initialized.');
    });
}

module.exports = db;