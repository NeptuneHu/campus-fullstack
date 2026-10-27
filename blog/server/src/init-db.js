require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const posts = [
  {
    title: '实验报告怎样写成以后还看得懂的笔记',
    category: '技术',
    tags: ['笔记', '课程'],
    author_id: 1,
    views: 28,
    daysAgo: 11,
    content: [
      '交上去的那版通常很完整，自己回头看却找不到当时为什么这样写。我现在会在文末单独留一块「下次怎么做」。',
      '',
      '## 我会留下的三行',
      '',
      '- 这次用了哪张表，字段是什么意思',
      '- 哪一步其实是凑出来的',
      '- 如果重做，先改哪里',
      '',
      '页边手记就拿来放这些不适合写进报告正文的话。',
    ].join('\n'),
  },
  {
    title: '图书馆闭馆前的两小时',
    category: '生活',
    tags: ['校园'],
    author_id: 1,
    views: 16,
    daysAgo: 10,
    content: [
      '闭馆音乐响起来的时候，人会突然变得很诚实：这一晚上真正读完的，往往只有计划里的一小段。',
      '',
      '与其列十件事，不如在进门前写下唯一要完成的那一节。出来时再补一句做到了没有。',
    ].join('\n'),
  },
  {
    title: '《设计心理学》前三章里我记住的一句',
    category: '读书',
    tags: ['阅读', '设计'],
    author_id: 1,
    views: 34,
    daysAgo: 9,
    content: [
      '人很少怪自己没看懂，更容易觉得这个东西不好用。',
      '',
      '## 我准备怎么用',
      '',
      '- 先把空状态写出来，不让页面空白着',
      '- 按钮上写动作，比如「发布这篇」',
      '- 报错时说下一步可以做什么',
      '',
      '做页边手记的发布页时，我会按这三条再看一遍。',
    ].join('\n'),
  },
  {
    title: '辩论赛后改掉的三句话',
    category: '随记',
    tags: ['辩论', '复盘'],
    author_id: 1,
    views: 21,
    daysAgo: 8,
    content: [
      '赛后最有用的不是重听自己的总结陈词，而是把对方追问时卡住的三句原话抄下来。',
      '',
      '1. 把「显然」换成一个例子',
      '2. 把「大家都会」换成「在这个场景里」',
      '3. 把结论提前，理由放在后面',
      '',
      '下一场开始前，只看这三句。',
    ].join('\n'),
  },
  {
    title: '接口先通，再画页面',
    category: '技术',
    tags: ['全栈'],
    author_id: 1,
    views: 19,
    daysAgo: 7,
    content: [
      '前后端一起改的时候，最容易不知道问题在哪。我现在的顺序是：先把注册、登录、文章列表用接口跑通，再做页面。',
      '',
      '页面只负责把已经确定的字段摆清楚：标题、分类、标签、正文、封面。',
    ].join('\n'),
  },
  {
    title: '宿舍台灯的高度',
    category: '生活',
    tags: ['宿舍'],
    author_id: 2,
    views: 12,
    daysAgo: 6,
    content: [
      '灯太高，书页是白的，人是困的。灯压到刚好照见半页纸，晚上会愿意多读一会儿。',
      '',
      '小事，但比换一份计划表有用。',
    ].join('\n'),
  },
  {
    title: '把一本书的目录抄进笔记',
    category: '读书',
    tags: ['阅读', '笔记'],
    author_id: 2,
    views: 15,
    daysAgo: 5,
    content: [
      '先抄目录，再决定读哪一章。抄的时候会发现有些章节标题其实已经把结论说完了。',
      '',
      '这周只读和「反馈」有关的那一节，读完用自己的话写五行。',
    ].join('\n'),
  },
  {
    title: '这周只做完一件事也算数',
    category: '随记',
    tags: ['复盘'],
    author_id: 1,
    views: 9,
    daysAgo: 4,
    content: [
      '清单写长了，周末就会全部划掉。这周的一件事是：把页边手记的文章列表、详情和写作页连起来。',
      '',
      '其他的先记在随记里，不假装它们也完成了。',
    ].join('\n'),
  },
  {
    title: '分页不要一次把文章全拿回来',
    category: '技术',
    tags: ['全栈', '笔记'],
    author_id: 1,
    views: 23,
    daysAgo: 3,
    content: [
      '首页每页 10 篇就够了。搜索和分类都在同一套分页上，避免页面越滚越长。',
      '',
      '总数单独查一次，页码就能知道还有没有下一页。',
    ].join('\n'),
  },
  {
    title: '食堂新窗口的一碗面',
    category: '生活',
    tags: ['校园'],
    author_id: 2,
    views: 11,
    daysAgo: 2,
    content: [
      '新窗口排队的人比味道更说明问题。我记下窗口名字和大概的等待时间，下次饿的时候不用重新试错。',
    ].join('\n'),
  },
  {
    title: '重读自己上周的会议记录',
    category: '读书',
    tags: ['复盘', '笔记'],
    author_id: 1,
    views: 8,
    daysAgo: 1,
    content: [
      '上周记的会，有一半句子当时懂、现在不懂。重读时把还成立的句子留着，其余改成自己的话。',
      '',
      '笔记如果不能重读，就只是打字。',
    ].join('\n'),
  },
  {
    title: '提交作业前的检查清单',
    category: '随记',
    tags: ['课程'],
    author_id: 1,
    views: 14,
    daysAgo: 0,
    content: [
      '交之前我只看这四项：',
      '',
      '- 体验账号还能登录',
      '- 首页能翻页、能按分类看',
      '- 自己的文章有编辑和删除',
      '- 别人的文章没有这些按钮',
      '',
      '截图也按这个顺序拍。',
    ].join('\n'),
  },
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
    DROP DATABASE IF EXISTS blog_db;
    CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);
  await connection.query('USE blog_db');
  await connection.query(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      avatar VARCHAR(255) NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE categories (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255) NOT NULL DEFAULT ''
    );

    CREATE TABLE posts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(80) NOT NULL,
      content MEDIUMTEXT NOT NULL,
      cover VARCHAR(255) NOT NULL DEFAULT '',
      category VARCHAR(50) NOT NULL,
      tags JSON,
      author_id INT NOT NULL,
      views INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  const demoHash = bcrypt.hashSync('demo123', 10);
  const linHash = bcrypt.hashSync('lin12345', 10);
  await connection.query(
    `INSERT INTO users (username, email, password, avatar) VALUES
     (?, ?, ?, ''), (?, ?, ?, '')`,
    ['demo', 'demo@example.com', demoHash, 'lin', 'lin@example.com', linHash]
  );
  await connection.query(
    `INSERT INTO categories (name, description) VALUES
     ('技术', '课程、接口和自己踩过的实现'),
     ('生活', '校园里值得记一笔的日常'),
     ('读书', '读完还能复述的那几页'),
     ('随记', '短想法和赛后的几句话')`
  );

  for (const post of posts) {
    await connection.query(
      `INSERT INTO posts (title, content, cover, category, tags, author_id, views, created_at)
       VALUES (?, ?, '', ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))`,
      [post.title, post.content, post.category, JSON.stringify(post.tags), post.author_id, post.views, post.daysAgo]
    );
  }

  await connection.end();
  console.log('页边手记数据库已就绪：demo / demo123');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
