
-- <====================== USERS TABLE ====================== >
-- CREATE TABLE users (
-- user_id INT AUTO_INCREMENT PRIMARY KEY,
-- firstName VARCHAR(70),
-- lastName VARCHAR(70) ,
-- email VARCHAR(150) NOT NULL,
-- phone VARCHAR(30) ,
-- password VARCHAR(150),
-- gender VARCHAR(30),
-- refreshToken VARCHAR(150),
-- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- <====================== USERS_ADDRESS TABLE ====================== >
-- CREATE TABLE user_address(
-- 	   user_id INT,
-- 	   fullName VARCHAR(100),
--     pincode VARCHAR(30),
--     state VARCHAR(30),
--     city VARCHAR(30),
--     address VARCHAR(200),
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
-- );

-- <====================== PRODUCTS TABLE ====================== >
-- CREATE TABLE products (
-- productId INT AUTO_INCREMENT PRIMARY KEY,
-- user_id INT,
-- productType VARCHAR(30),
-- productName VARCHAR(70) ,
-- productDetails VARCHAR(150),
-- productPrice DECIMAL(10,2),
-- productRating VARCHAR(20),
-- productImageUrl VARCHAR(100),
-- FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
-- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- <====================== CARTS TABLE ====================== >
-- CREATE TABLE carts (
-- 	cart_id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     productId INT,
--     quantity INT DEFAULT 1,
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
-- );

-- <====================== ORDERS TABLE ====================== >
-- CREATE TABLE orders (
--     order_id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     productId INT,
--     total_amount DECIMAL(10,2),
--     order_status VARCHAR(30) DEFAULT 'pending',
--     payment_status VARCHAR(30) DEFAULT 'unpaid',
--     payment_method VARCHAR(30) DEFAULT 'cash',
--     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- 	FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
-- );

-- <====================== CART_ITEM TABLE ====================== >
--     CREATE TABLE cart_item (
-- 	   cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     productId INT,
--     quantity INT DEFAULT 1,
--     productImageUrl varchar(200),
--     snapshot_name VARCHAR(70),
--     snapshot_price DECIMAL(10,2),
--     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
--     FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE,
--     created_ate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- <====================== ORDER_ITEM TABLE ====================== >
-- CREATE TABLE order_item (
-- 	order_item_id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT,
--     order_id INT,
--     productId INT,
--     productImageUrl VARCHAR(200),
--     quantity INT,
--     snapshot_name VARCHAR(70),
--     snapshot_price DECIMAL(10,2),
--     order_status VARCHAR(80) DEFAULT 'Your item is on the way',
--     FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
--     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- )AUTO_INCREMENT = 1001;
	
-- <====================== ORDER_BILL TABLE ====================== >
-- drop table order_bill;
-- CREATE TABLE order_bill(
-- 		user_id INT,
-- 		bill_id INT AUTO_INCREMENT PRIMARY KEY,
-- 		orderId VARCHAR(50),
--         invoiceId VARCHAR(50),
--         productId INT,
--         seller_address VARCHAR(100),
--         buyer_address VARCHAR(150),
--         buyer_city VARCHAR(30),
--         totalPrice DECIMAL(10,2),
--         FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
-- 		bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );	

-- SELECT 
--     oi.snapshot_name,
--     oi.quantity,
--     o.total_amount,
--     p.productId,
--     p.seller_address,
--     u.address AS buyer_address,
--     u.city AS buyer_city 
-- FROM order_item AS oi
-- INNER JOIN products AS p ON oi.productId = p.productId
-- INNER JOIN orders AS o ON oi.order_id = o.order_id          
-- INNER JOIN user_address AS u ON o.user_id = u.user_id     
-- WHERE o.user_id = 9;      

-- select * from products;




-- select * from orders;
-- select * from order_item;
-- select * from cart_item;
-- select * from carts;
-- select * from user_address;

-- select * from order_bill; 
-- select * from users;

-- select * from order_bill;
-- /======================= TESTING QUERY ===================================/
-- ALTER TABLE order_bill MODIFY COLUMN order_item_id INT AFTER bill_id;
-- ALTER TABLE order_item MODIFY COLUMN user_id INT AFTER order_item_id;

-- alter table order_bill add column order_item_id INT;
-- alter table orders drop column shipping_address;
-- alter table order_item add column productImageUrl VARCHAR(200);
-- alter table orders add column total_amount decimal(10,2);
-- alter table order_item add column user_id INT;
-- alter table order_item add column status varchar(30) default 'Your item is on the way'; 
-- alter table order_bill drop column seller_address;
-- alter table order_item drop column total_amount;

-- update cart_item set snapshot_price = 1500.80 where productId = 41;
-- update orders set payment_status = 'unpaid' where order_id in (102,103,104);
-- update orders set payment_status = 'unpaid' where order_id in (102,103,104);


-- DELETE FROM orders WHERE user_id =12 AND payment_status='unpaid';
-- delete from user_address where user_id = 12;
-- delete from orders where order_id between 8 and 59;
-- delete from orders where order_id between 90 AND 96;
-- delete from order_item where order_item_id between 1022 AND 1028;
-- delete from orders where order_id = 1;
-- delete from order_item where order_item_id between 1022 AND 1028;
-- delete from orders where order_id between 41 and 44;
-- delete from order_item where order_item_id between 1041 and 1044;
-- delete from user_address where user_id = 12;
