
-- 1. Crear tipos ENUM para los estados del vale
CREATE TYPE voucher_status AS ENUM ('ACTIVE', 'PAID');

-- 2. Tabla de Clientes
CREATE TABLE Client (
    clientId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    creditBalance DECIMAL(9, 2) DEFAULT 0.00 -- saldo a favor del cliente
);

-- 3. Tabla de Configuracion de Comisiones (Personalizada por cliente)
CREATE TABLE CommissionConfig (
    configId SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES Client(clientId) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- 4. Tabla de Vales
CREATE TABLE Voucher (
    voucherId SERIAL PRIMARY KEY,
    totalAmount DECIMAL(9, 2) NOT NULL,
    balance DECIMAL(9, 2) NOT NULL,
    status voucher_status DEFAULT 'ACTIVE',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate TIMESTAMP NOT NULL,
    clientId INTEGER REFERENCES Client(clientId) ON DELETE CASCADE
);

-- 5. Tabla de Pagos
CREATE TABLE Payment (
    paymentId SERIAL PRIMARY KEY,
    voucherId INTEGER REFERENCES Voucher(voucherId) ON DELETE CASCADE,
    amount DECIMAL(9, 2) NOT NULL, -- CHECK (amount >= 0), -- maximo 1 millon
    paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para optimizar consultas
CREATE INDEX idx_voucher_client ON Voucher(clientId);
CREATE INDEX idx_payment_voucher ON Payment(voucherId);
CREATE INDEX idx_commission_client ON CommissionConfig(clientId);

-- Registros iniciales commsion config
INSERT INTO CommissionConfig (clientId, name) VALUES
(1, 'DEFUALT'),
(2, 'PREMIUM');