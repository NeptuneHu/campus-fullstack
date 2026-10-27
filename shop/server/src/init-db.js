require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const products = [
  ['横线笔记本 A5', '课堂记笔记刚好一本。纸不透，封面是空白的，方便自己写科目。', 12.8, 39, '文具'],
  ['黑色中性笔 3 支', '0.5 毫米，考试和草稿都能用。三支放笔袋里不容易一次丢完。', 9.9, 60, '文具'],
  ['文件夹 5 个装', '按课程分开放作业。透明封面，不用拆开也知道里面是哪一门。', 16, 30, '文具'],
  ['夹式小台灯', '夹在床沿上，光落在半页纸就够。宿舍熄灯之后还能看一会儿书。', 49, 15, '数码'],
  ['入耳式耳塞', '图书馆和宿舍都用得上。线短，塞进笔袋不占地方。', 19.9, 25, '数码'],
  ['挂耳咖啡 10 杯', '早课之前冲一杯。比在楼下排队快，味道也稳定。', 32, 20, '零食'],
  ['苏打饼干', '自习带到一半饿了，不用特意下楼。一包可以分两次吃。', 8.5, 34, '零食'],
  ['桌面收纳盒', '把笔、便签和 U 盘从桌面中间挪开。桌子一空，比较愿意开始写。', 24, 18, '生活'],
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true,
    timezone: '+08:00',
  });

  await connection.query(`
    DROP DATABASE IF EXISTS shop_db;
    CREATE DATABASE shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
  await connection.query('USE shop_db');
  await connection.query(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      avatar VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(80) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      images JSON,
      category VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE cart_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_cart (user_id, product_id),
      CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
      CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE addresses (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      name VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      province VARCHAR(50) NOT NULL,
      city VARCHAR(50) NOT NULL,
      district VARCHAR(50) NOT NULL,
      detail VARCHAR(255) NOT NULL,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE orders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_no VARCHAR(32) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      address_id INT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT '待支付',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
      CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
    );

    CREATE TABLE order_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
      CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  const demoHash = bcrypt.hashSync('demo123', 10);
  const linHash = bcrypt.hashSync('lin12345', 10);
  await connection.query(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?), (?, ?, ?)`,
    ['demo', 'demo@example.com', demoHash, 'lin', 'lin@example.com', linHash]
  );

  for (const product of products) {
    await connection.query(
      `INSERT INTO products (name, description, price, stock, images, category) VALUES (?, ?, ?, ?, '[]', ?)`,
      product
    );
  }

  await connection.query(
    `INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default)
     VALUES (1, '周宁', '13800001111', '湖北省', '武汉市', '洪山区', '东十二舍 214', 1)`
  );
  await connection.query(
    `INSERT INTO orders (order_no, user_id, address_id, total_price, status, created_at) VALUES
     ('202610270001', 1, 1, 12.80, '待支付', DATE_SUB(NOW(), INTERVAL 1 DAY)),
     ('202610260001', 1, 1, 8.50, '已完成', DATE_SUB(NOW(), INTERVAL 6 DAY))`
  );
  await connection.query(
    `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
     (1, 1, 1, 12.80),
     (2, 7, 1, 8.50)`
  );
  await connection.query(
    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (1, 4, 1)`
  );

  await connection.end();
  console.log('角落小铺数据库已就绪：demo / demo123');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
