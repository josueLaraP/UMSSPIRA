-- Bajo el supuesto de que la carrera "Ing. Informática" tiene este id
INSERT INTO administrador_de_carrera (id_usuario, id_carrera, estado)
VALUES (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'ACTIVO'
)
ON CONFLICT (id_usuario, id_carrera) DO NOTHING;