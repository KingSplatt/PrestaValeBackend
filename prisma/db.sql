
-- 1. Crear tipos ENUM para los estados del vale
CREATE TYPE estado_vale AS ENUM ('ACTIVO', 'PAGADO');

-- 2. Tabla de Clientes
CREATE TABLE Cliente (
    clienteId SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    saldoFavor DECIMAL(9, 2) DEFAULT 0.00 -- saldo a favor del cliente
);

-- 3. Tabla de Configuración de Comisiones (Personalizada por cliente)
CREATE TABLE ConfiguracionComision (
    configuracionId SERIAL PRIMARY KEY,
    clienteId INTEGER REFERENCES Cliente(clienteId) ON DELETE CASCADE,
    dia INTEGER NOT NULL,
    porcentaje DECIMAL(5, 2) NOT NULL
    --CONSTRAINT rango_dia CHECK (dia >= 1 AND dia <= 31)
);

-- 4. Tabla de Vales
CREATE TABLE Vale (
    valeId SERIAL PRIMARY KEY,
    montoTotal DECIMAL(9, 2) NOT NULL,
    saldo DECIMAL(9, 2) NOT NULL,
    estatus estado_vale DEFAULT 'ACTIVO',
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechaVencimiento TIMESTAMP NOT NULL,
    clienteId INTEGER REFERENCES Cliente(clienteId) ON DELETE CASCADE
);

-- 5. Tabla de Pagos
CREATE TABLE Pago (
    pagoId SERIAL PRIMARY KEY,
    valeId INTEGER REFERENCES Vale(valeId) ON DELETE CASCADE,
    monto DECIMAL(9, 2) NOT NULL, --CHECK ("monto" >= 0), -- maximo 1 millon
    fechaPago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para optimizar consultas
CREATE INDEX idx_vale_cliente ON Vale(clienteId);
CREATE INDEX idx_pago_vale ON Pago(valeId);
CREATE INDEX idx_comision_cliente ON ConfiguracionComision(clienteId);