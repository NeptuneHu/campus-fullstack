# 页边手记 · 数据库设计

教程里的个人博客，这里改成自己的写作站：分类固定为「技术、生活、读书、随记」，用来记课程、阅读和日常。表结构仍按教程的用户、文章、分类来做。

## 用户表（users）

- id：主键
- username：用户名，唯一，3-20 字符
- email：邮箱，唯一
- password：密码，bcrypt 加密
- avatar：头像 URL
- created_at：创建时间

## 分类表（categories）

- id：主键
- name：分类名称，唯一
- description：分类描述

预置分类：技术、生活、读书、随记。

## 文章表（posts）

- id：主键
- title：标题
- content：正文，Markdown
- cover：封面图 URL，可空
- category：分类名称
- tags：标签，JSON 数组
- author_id：作者 ID，外键关联 users
- views：浏览次数
- created_at、updated_at
