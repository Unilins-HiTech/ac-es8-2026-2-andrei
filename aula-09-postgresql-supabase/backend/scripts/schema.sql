
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    nascimento DATE NOT NULL
);

-- Dados iniciais
INSERT INTO pacientes (nome, email, nascimento) VALUES
    ('Maria Silva', 'maria.silva@email.com', '1990-04-12'),
    ('João Pereira', 'joao.pereira@email.com', '1985-11-30'),
    ('Ana Costa', 'ana.costa@email.com', '2001-07-08')
ON CONFLICT (email) DO NOTHING;
