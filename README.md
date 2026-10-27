# 全栈应用开发练习

三个项目都按教程的方法做：先写 `database.md` 和 `PRD.md`，再用 Express + MySQL 做接口，用 React + TypeScript + Vite 做页面。内容做了小改动，避免和教程示例完全一样。

| 项目 | 地址 | 改动 |
| --- | --- | --- |
| 页边手记 | http://localhost:5173 | 分类是技术、生活、读书、随记，文章是课程和日常笔记 |
| 问一问 | http://localhost:5174 | 积分在页面上叫声望，问题围绕登录、分类表和购物车 |
| 角落小铺 | http://localhost:5175 | 卖文具、数码、零食和生活小物，下单后保持待支付 |

体验账号：`demo` / `demo123`，另一位用户 `lin` / `lin12345`。

## 启动

需要本机 Docker。目录名是中文，所以指定了项目名 `fullstack`。

```bash
cd "/Users/hhz/Desktop/全栈开发"
npm run install:all
docker compose -p fullstack up -d
npm run init
npm run dev
```

`npm run init` 会重建三套数据库和示例数据。密码使用 bcrypt 算法加密，依赖是纯 JavaScript 的 bcryptjs，和教程里的 bcrypt 兼容。

接口端口：博客 3001，问答 3002，商城 3003。

`提交截图/` 里是页面跑通后的截图，可以按文件名直接交。重新截图前先用上面的地址打开页面，登录体验账号再操作。
