# 问一问 · 数据库设计

教程里的问答社区。界面上把积分叫做「声望」，问题和示例都围绕这门课里的前端、数据库和课程作业。表结构按教程保留用户、问题、回答、点赞。

## 用户表（users）

- id、username、email、password、avatar
- points：声望。新用户从 100 开始
- created_at

## 问题表（questions）

- id、title、content（Markdown）
- tags：标签，JSON 数组
- author_id：提问者
- views：浏览次数
- answers_count：回答数
- votes：点赞数
- is_solved：是否已解决
- created_at、updated_at

## 回答表（answers）

- id、content（Markdown）
- question_id、author_id
- votes：点赞数
- is_accepted：是否被采纳
- created_at、updated_at

## 点赞表（votes）

- id、user_id
- target_type：question 或 answer
- target_id
- created_at
- 同一用户对同一目标只能有一条记录
