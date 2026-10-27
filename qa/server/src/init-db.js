require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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
    DROP DATABASE IF EXISTS qa_db;
    CREATE DATABASE qa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
  await connection.query('USE qa_db');
  await connection.query(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      avatar VARCHAR(255) NOT NULL DEFAULT '',
      points INT NOT NULL DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE questions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(120) NOT NULL,
      content MEDIUMTEXT NOT NULL,
      tags JSON,
      author_id INT NOT NULL,
      views INT NOT NULL DEFAULT 0,
      answers_count INT NOT NULL DEFAULT 0,
      votes INT NOT NULL DEFAULT 0,
      is_solved TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_questions_author FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE answers (
      id INT PRIMARY KEY AUTO_INCREMENT,
      content MEDIUMTEXT NOT NULL,
      question_id INT NOT NULL,
      author_id INT NOT NULL,
      votes INT NOT NULL DEFAULT 0,
      is_accepted TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id),
      CONSTRAINT fk_answers_author FOREIGN KEY (author_id) REFERENCES users(id)
    );

    CREATE TABLE votes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      target_type ENUM('question', 'answer') NOT NULL,
      target_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_vote (user_id, target_type, target_id),
      CONSTRAINT fk_votes_user FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const demoHash = bcrypt.hashSync('demo123', 10);
  const linHash = bcrypt.hashSync('lin12345', 10);
  await connection.query(
    `INSERT INTO users (username, email, password, avatar, points) VALUES
     (?, ?, ?, '', 105), (?, ?, ?, '', 150)`,
    ['demo', 'demo@example.com', demoHash, 'lin', 'lin@example.com', linHash]
  );

  const questions = [
    {
      title: '登录状态该放在本地，还是每次进页面都问一次服务器？',
      tags: ['前端', '课程'],
      author_id: 1,
      views: 26,
      answers_count: 1,
      votes: 1,
      is_solved: 1,
      daysAgo: 2,
      content: [
        '做页边手记的时候，token 放在 localStorage，刷新后先读本地，再用 /users/me 对一下。',
        '',
        '这样快，但 token 过期时页面会闪一下。想知道课程作业里这样写算不算清楚。',
      ].join('\n'),
    },
    {
      title: '文章分类，要不要既建分类表，又在文章上存分类名？',
      tags: ['数据库', '课程'],
      author_id: 1,
      views: 9,
      answers_count: 0,
      votes: 0,
      is_solved: 0,
      daysAgo: 0,
      content: [
        '教程里两样都有：分类表，以及文章上的 category 字段。',
        '',
        '我现在用分类表校验名字，文章里存的是名称，筛选比较直接。这样会不会和分类表脱节？',
      ].join('\n'),
    },
    {
      title: '购物车里同一件商品再点一次，数量应该累加还是覆盖？',
      tags: ['数据库'],
      author_id: 2,
      views: 17,
      answers_count: 1,
      votes: 1,
      is_solved: 0,
      daysAgo: 1,
      content: [
        '角落小铺如果已经有这本书灯，再点「加入购物车」，我倾向于数量累加，并检查有没有超过库存。',
        '',
        '覆盖的话，用户会把之前选的数量弄丢。想确认这个理解和教程一致。',
      ].join('\n'),
    },
  ];

  for (const question of questions) {
    await connection.query(
      `INSERT INTO questions
        (title, content, tags, author_id, views, answers_count, votes, is_solved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [
        question.title,
        question.content,
        JSON.stringify(question.tags),
        question.author_id,
        question.views,
        question.answers_count,
        question.votes,
        question.is_solved,
        question.daysAgo,
      ]
    );
  }

  await connection.query(
    `INSERT INTO answers (content, question_id, author_id, votes, is_accepted, created_at) VALUES
     (?, 1, 2, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
     (?, 3, 1, 0, 0, DATE_SUB(NOW(), INTERVAL 12 HOUR))`,
    [
      [
        '作业里这样写是清楚的。',
        '',
        '- 本地保存 token，请求头自动带上',
        '- 进入页面时用 /users/me 校对',
        '- 401 就清掉本地状态，回到登录页',
        '',
        '闪一下可以接受。关键是过期后不要继续拿旧用户信息发请求。',
      ].join('\n'),
      [
        '再点一次就累加。购物车里按用户和商品保持一条记录，数量加完再和库存比。',
        '',
        '超过库存就拒绝，不要先加进去再提示。',
      ].join('\n'),
    ]
  );

  await connection.query(
    `INSERT INTO votes (user_id, target_type, target_id) VALUES
     (2, 'question', 1),
     (1, 'question', 3),
     (1, 'answer', 1)`
  );

  await connection.end();
  console.log('问一问数据库已就绪：demo / demo123');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
