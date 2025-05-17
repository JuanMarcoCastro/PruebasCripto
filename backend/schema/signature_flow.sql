-- Tabla para definir el flujo de firmas requerido para cada documento
CREATE TABLE IF NOT EXISTS signature_flows (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    required_count INTEGER NOT NULL DEFAULT 1,
    current_count INTEGER NOT NULL DEFAULT 0,
    flow_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    UNIQUE(document_id, role)
);

-- Tabla para registrar las firmas realizadas
CREATE TABLE IF NOT EXISTS signature_status (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    signed_at TIMESTAMP NOT NULL,
    UNIQUE(document_id, user_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_signature_flows_document_id ON signature_flows(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_flows_role ON signature_flows(role);
CREATE INDEX IF NOT EXISTS idx_signature_status_document_id ON signature_status(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_status_user_id ON signature_status(user_id);
