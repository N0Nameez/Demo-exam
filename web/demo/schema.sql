-- ============================================================
--  SoleVault — База данных магазина обуви
--  MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS solevault CHARACTER SET utf8mb4;
USE solevault;

CREATE TABLE roles (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE   -- guest, client, manager, admin
);

CREATE TABLE users (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    login         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role_id       INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE categories (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE manufacturers (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE suppliers (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE products (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(200)      NOT NULL,
    category_id     INT               NOT NULL,
    description     TEXT,
    manufacturer_id INT               NOT NULL,
    supplier_id     INT               NOT NULL,
    price           DECIMAL(10,2)     NOT NULL CHECK (price >= 0),
    unit            VARCHAR(50)       NOT NULL DEFAULT 'пара',
    stock           INT               NOT NULL DEFAULT 0 CHECK (stock >= 0),
    discount        TINYINT UNSIGNED  NOT NULL DEFAULT 0,
    image_path      VARCHAR(500),
    FOREIGN KEY (category_id)     REFERENCES categories(id),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id),
    FOREIGN KEY (supplier_id)     REFERENCES suppliers(id)
);

CREATE TABLE order_statuses (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE orders (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    article       VARCHAR(50)  NOT NULL UNIQUE,
    status_id     INT          NOT NULL,
    address       VARCHAR(500) NOT NULL,
    order_date    DATE         NOT NULL,
    delivery_date DATE,
    client_id     INT,
    FOREIGN KEY (status_id) REFERENCES order_statuses(id),
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    order_id       INT           NOT NULL,
    product_id     INT           NOT NULL,
    quantity       INT           NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ─── Начальные данные ──────────────────────────────────────

INSERT INTO roles (name) VALUES ('guest'), ('client'), ('manager'), ('admin');

INSERT INTO categories (name) VALUES
    ('Кроссовки'), ('Ботинки'), ('Туфли'), ('Сандалии'), ('Кеды'), ('Мокасины');

INSERT INTO manufacturers (name) VALUES
    ('Nike'), ('Adidas'), ('Puma'), ('New Balance'), ('Reebok'), ('Skechers');

INSERT INTO suppliers (name) VALUES
    ('ООО СпортОпт'), ('ИП Федоров'), ('ТД Обувь России'), ('АО ШузТрейд');

INSERT INTO order_statuses (name) VALUES
    ('В обработке'), ('Подтверждён'), ('В пути'), ('Доставлен'), ('Отменён');

-- Пароли: нужно заменить на реальные BCrypt хэши через приложение
-- Запустите: POST /api/auth/seed — создаст хэши автоматически
INSERT INTO users (login, password_hash, full_name, role_id) VALUES
    ('admin',   '$2a$11$PLACEHOLDER_RUN_SEED', 'Иванов Алексей Петрович',  4),
    ('manager', '$2a$11$PLACEHOLDER_RUN_SEED', 'Смирнова Ольга Ивановна',  3),
    ('client',  '$2a$11$PLACEHOLDER_RUN_SEED', 'Козлов Дмитрий Сергеевич', 2);

INSERT INTO products (name, category_id, description, manufacturer_id, supplier_id, price, stock, discount) VALUES
    ('Air Max 270',    1, 'Беговые кроссовки с амортизацией', 1, 1,  8990.00, 15, 20),
    ('Stan Smith',     5, 'Классические белые кеды',          2, 2,  5490.00,  0,  0),
    ('Suede Classic',  1, 'Замшевые кроссовки ретро-стиль',   3, 3,  4990.00,  8, 10),
    ('Fresh Foam 880', 1, 'Профессиональные беговые кроссовки',4, 4, 11200.00,  3,  0),
    ('Classic Leather',5, 'Кожаные кеды на плоской подошве',  5, 1,  3990.00, 22, 25),
    ('Ultraboost 22',  1, 'Кроссовки с Boost технологией',    2, 3, 14900.00,  5,  0),
    ('Revolution 6',   1, 'Кроссовки для ежедневных тренировок',1,4,  4599.00,  0, 18);

INSERT INTO orders (article, status_id, address, order_date, delivery_date, client_id) VALUES
    ('ORD-001', 4, 'г. Москва, ул. Пушкина, д.1', '2024-03-01', '2024-03-05', 3),
    ('ORD-002', 1, 'г. СПб, пр. Невский, д.100',  '2024-03-10', '2024-03-15', 3);

INSERT INTO order_items (order_id, product_id, quantity, price_at_order) VALUES
    (1, 1, 1, 7192.00),
    (1, 3, 2, 4491.00),
    (2, 4, 1, 11200.00);
