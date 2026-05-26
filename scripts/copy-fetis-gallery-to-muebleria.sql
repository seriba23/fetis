-- Copia las filas user-uploaded (no-seed) de gallery_items de fetis_database
-- a inge_muebleria, mapeando las categorías por slug (los UUIDs son
-- distintos entre DBs porque cada una corrió seed independientemente).
--
-- Uso: mysql -u root < scripts/copy-fetis-gallery-to-muebleria.sql
-- Idempotente: vuelve a correrlo NO inserta duplicados (filtra por image_url).

INSERT INTO inge_muebleria.gallery_items
  (id, category_id, image_url, thumb_url, title, description, `order`, visible, featured, created_at, updated_at)
SELECT
  UUID(),
  (SELECT id FROM inge_muebleria.gallery_categories WHERE slug = sc.slug),
  s.image_url,
  s.thumb_url,
  s.title,
  s.description,
  s.`order`,
  s.visible,
  s.featured,
  NOW(3),
  NOW(3)
FROM fetis_database.gallery_items s
JOIN fetis_database.gallery_categories sc ON s.category_id = sc.id
WHERE s.image_url NOT LIKE '%seed-%'
  AND s.image_url NOT IN (SELECT image_url FROM inge_muebleria.gallery_items);
