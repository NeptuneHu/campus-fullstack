# 角落小铺 · 数据库设计

教程里的 Mini 在线商城。商品换成宿舍里用得上的文具、数码、零食和生活小物。不接真实支付，下单后状态是「待支付」。表仍按教程的用户、商品、购物车、地址、订单、订单商品来做。

## 用户表（users）

- id、username、email、password、avatar、created_at

## 商品表（products）

- id、name、description、price、stock
- images：图片 URL，JSON 数组，练习数据留空，页面用分类色块
- category：文具、数码、零食、生活
- created_at、updated_at

## 购物车表（cart_items）

- id、user_id、product_id、quantity
- 同一用户同一商品只有一条，再次加入时数量累加
- created_at

## 地址表（addresses）

- id、user_id、name、phone、province、city、district、detail
- is_default：是否默认地址
- created_at

## 订单表（orders）

- id、order_no、user_id、address_id
- total_price：总价
- status：待支付、已支付、已发货、已完成、已取消
- created_at、updated_at

## 订单商品表（order_items）

- id、order_id、product_id、quantity
- price：下单时的单价，之后商品改价不影响这笔订单
