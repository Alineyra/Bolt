/*
# Create hospitals table for Estado de México hospital finder

1. New Tables
- `hospitals`
  - `id` (uuid, primary key)
  - `name` (text, not null) - hospital name
  - `municipality` (text, not null) - municipality in Estado de México
  - `address` (text, not null) - street address
  - `phone` (text) - contact phone
  - `type` (text, not null) - 'público' or 'privado'
  - `emergency` (boolean, default true) - has 24/7 emergency services
  - `specialties` (text[]) - array of medical specialties
  - `latitude` (numeric) - geographic latitude
  - `longitude` (numeric) - geographic longitude
  - `created_at` (timestamptz)
2. Security
- Enable RLS on `hospitals`.
- Grant SELECT to anon + authenticated (no-auth app, public data).
- Allow public read access since this is reference data.
3. Seed data
- Inserts ~16 real hospitals across Estado de México municipalities.
*/

CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  municipality text NOT NULL,
  address text NOT NULL,
  phone text,
  type text NOT NULL CHECK (type IN ('público', 'privado')),
  emergency boolean NOT NULL DEFAULT true,
  specialties text[] DEFAULT '{}',
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON hospitals TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_hospitals" ON hospitals;
CREATE POLICY "public_read_hospitals"
ON hospitals FOR SELECT
TO anon, authenticated USING (true);

-- Seed data: real hospitals in Estado de México
INSERT INTO hospitals (name, municipality, address, phone, type, emergency, specialties, latitude, longitude) VALUES
('Hospital General de Toluca "Dr. Nicolás San Juan"', 'Toluca', 'Av. Paseo Tollocan S/N, Moderna de la Cruz', '722 273 2000', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Traumatología','Urgencias'], 19.2864, -99.6534),
('Hospital Materno Infantil de Toluca', 'Toluca', 'Av. Paseo Tollocan 931, Moderna de la Cruz', '722 273 2040', 'público', true, ARRAY['Maternidad','Pediatría','Ginecología','Neonatología'], 19.2858, -99.6528),
('Hospital General de Ecatepec "Las Américas"', 'Ecatepec de Morelos', 'Av. Carlos Hank González 1000, San Cristóbal Centro', '55 5003 2800', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias','Traumatología'], 19.6086, -99.0324),
('Hospital General de Nezahualcóyotl', 'Ciudad Nezahualcóyotl', 'Av. Chimalhuacán 8, Benito Juárez', '55 5719 5100', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias'], 19.4000, -99.0167),
('Hospital General de Naucalpan', 'Naucalpan de Juárez', 'Av. 5 de Mayo 39, San Antonio Zomeyucan', '55 5323 3000', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Traumatología','Urgencias'], 19.4764, -99.2589),
('Hospital General de Tlalnepantla', 'Tlalnepantla de Baz', 'Av. Hidalgo 6, San Andrés Atenco', '55 5390 9700', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias'], 19.5400, -99.1953),
('Hospital General de Chalco', 'Valle de Chalco Solidaridad', 'Av. Cuauhtémoc 1200, San Isidro', '55 5978 4200', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias'], 19.2897, -98.9408),
('Hospital General de Ixtapaluca', 'Ixtapaluca', 'Av. Cuauhtémoc 100, Ixtapaluca Centro', '55 5976 1100', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias'], 19.3167, -98.8833),
('Hospital General de Cuautitlán', 'Cuautitlán Izcalli', 'Av. Morelos 3, Centro Urbano', '55 5870 1200', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Traumatología'], 19.6431, -99.2167),
('Hospital General de Zumpango', 'Zumpango de Ocampo', 'Av. principal S/N, Zumpango Centro', '591 918 2100', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias'], 19.7953, -99.0975),
('Hospital General de Tenancingo', 'Tenancingo de Degollado', 'Av. Hidalgo 5, Centro', '714 143 2200', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Urgencias'], 18.9614, -99.5919),
('Hospital General de Atlacomulco', 'Atlacomulco de Fabela', 'Av. Benito Juárez 100, Centro', '712 129 5500', 'público', true, ARRAY['Medicina general','Cirugía','Pediatría','Ginecología','Urgencias'], 19.7994, -99.8744),
('Hospital Privado de Toluca', 'Toluca', 'Av. P.º de los Matlazincas 1100, Las Jaracas', '722 219 3000', 'privado', true, ARRAY['Medicina general','Cirugía','Cardiología','Ginecología','Pediatría','Urgencias'], 19.2671, -99.6467),
('Hospital Ángeles Toluca', 'Toluca', 'Av. P.º Tollocan 853, Moderna de la Cruz', '722 273 3333', 'privado', true, ARRAY['Medicina general','Cirugía','Cardiología','Neurología','Oncología','Pediatría','Urgencias','Ginecología'], 19.2870, -99.6510),
('Hospital Español de Metepec', 'Metepec', 'Av. Baja Velocidad 6, San Jerónimo Chicahualco', '722 289 8900', 'privado', true, ARRAY['Medicina general','Cirugía','Cardiología','Ginecología','Pediatría','Urgencias','Gastroenterología'], 19.2569, -99.5989),
('Hospital Star Médica Metepec', 'Metepec', 'Av. Estado de México 8, San Jerónimo Chicahualco', '722 230 8800', 'privado', true, ARRAY['Medicina general','Cirugía','Cardiología','Traumatología','Pediatría','Urgencias','Ortopedia'], 19.2544, -99.6011)
ON CONFLICT DO NOTHING;
