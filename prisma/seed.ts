import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ----- Atributos por tipo de mueble -----

const FURNITURE_TYPES = [
  {
    slug: 'cocina',
    name: 'Cocina integral',
    icon: '🍳',
    description: 'Cocina a la medida con módulos superiores e inferiores',
    order: 1,
    attributes: [
      { key: 'metros_lineales', label: 'Metros lineales', type: 'number', unit: 'm', required: true },
      { key: 'forma', label: 'Forma', type: 'select', options: ['Lineal', 'L-shape', 'U-shape', 'Isla', 'Doble línea'] },
      { key: 'modulos_superiores', label: 'Módulos superiores', type: 'number' },
      { key: 'modulos_inferiores', label: 'Módulos inferiores', type: 'number' },
      { key: 'material_puertas', label: 'Material puertas', type: 'select', options: ['MDF laqueado', 'Melamina', 'Madera maciza', 'Vidrio', 'Laminado'] },
      { key: 'color_puertas', label: 'Color puertas', type: 'text' },
      { key: 'material_cubierta', label: 'Material cubierta', type: 'select', options: ['Cuarzo', 'Granito', 'Mármol', 'Madera', 'Laminado', 'Acero inoxidable'] },
      { key: 'color_cubierta', label: 'Color cubierta', type: 'text' },
      { key: 'herrajes', label: 'Herrajes', type: 'select', options: ['Estándar', 'Soft-close', 'Push-to-open', 'Hettich premium', 'Blum premium'] },
      { key: 'tarja', label: 'Tarja / fregadero', type: 'text' },
      { key: 'electrodomesticos', label: 'Electrodomésticos a integrar', type: 'textarea' },
      { key: 'iluminacion', label: 'Iluminación LED', type: 'boolean' },
    ],
  },
  {
    slug: 'closet',
    name: 'Closet / Vestidor',
    icon: '👔',
    description: 'Closets a medida con divisiones internas y puertas',
    order: 2,
    attributes: [
      { key: 'ancho', label: 'Ancho', type: 'number', unit: 'cm', required: true },
      { key: 'alto', label: 'Alto', type: 'number', unit: 'cm', required: true },
      { key: 'profundidad', label: 'Profundidad', type: 'number', unit: 'cm' },
      { key: 'cantidad_puertas', label: 'Cantidad de puertas', type: 'number' },
      { key: 'tipo_puerta', label: 'Tipo de puerta', type: 'select', options: ['Abatible', 'Corrediza', 'Plegable', 'Sin puertas'] },
      { key: 'cajones', label: 'Cantidad de cajones', type: 'number' },
      { key: 'tubos_colgar', label: 'Tubos para colgar', type: 'number' },
      { key: 'espejos', label: 'Espejos integrados', type: 'boolean' },
      { key: 'material', label: 'Material', type: 'select', options: ['Melamina', 'MDF laqueado', 'Madera maciza', 'Laminado'] },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'iluminacion', label: 'Iluminación interior', type: 'boolean' },
    ],
  },
  {
    slug: 'mesa',
    name: 'Mesa (comedor / centro / auxiliar)',
    icon: '🍽️',
    description: 'Mesa a medida en distintos materiales y acabados',
    order: 3,
    attributes: [
      { key: 'subtipo', label: 'Tipo de mesa', type: 'select', options: ['Comedor', 'Centro', 'Auxiliar', 'Trabajo', 'Bar'] },
      { key: 'largo', label: 'Largo', type: 'number', unit: 'cm', required: true },
      { key: 'ancho', label: 'Ancho', type: 'number', unit: 'cm', required: true },
      { key: 'alto', label: 'Alto', type: 'number', unit: 'cm', required: true },
      { key: 'forma', label: 'Forma', type: 'select', options: ['Rectangular', 'Cuadrada', 'Redonda', 'Ovalada', 'Irregular'] },
      { key: 'material_cubierta', label: 'Material cubierta', type: 'select', options: ['Madera maciza', 'MDF laqueado', 'Mármol', 'Cristal', 'Metal', 'Concreto'] },
      { key: 'color', label: 'Color / acabado', type: 'text' },
      { key: 'numero_patas', label: 'Número de patas', type: 'number' },
      { key: 'material_patas', label: 'Material patas', type: 'select', options: ['Madera', 'Metal negro', 'Metal cromado', 'Acero inoxidable'] },
      { key: 'acabado', label: 'Acabado', type: 'select', options: ['Mate', 'Brillante', 'Satinado', 'Natural', 'Texturizado'] },
    ],
  },
  {
    slug: 'silla',
    name: 'Sillas',
    icon: '🪑',
    description: 'Sillas individuales o en juego',
    order: 4,
    attributes: [
      { key: 'cantidad', label: 'Cantidad', type: 'number', required: true },
      { key: 'estructura', label: 'Estructura', type: 'select', options: ['Madera', 'Metal', 'Mixto'] },
      { key: 'tapizado', label: 'Tapizado', type: 'select', options: ['Tela', 'Vinipiel', 'Piel', 'Sin tapizar'] },
      { key: 'color_tapiz', label: 'Color tapiz', type: 'text' },
      { key: 'color_estructura', label: 'Color estructura', type: 'text' },
      { key: 'respaldo', label: 'Tipo de respaldo', type: 'text' },
      { key: 'descansabrazos', label: 'Con descansabrazos', type: 'boolean' },
    ],
  },
  {
    slug: 'recamara',
    name: 'Recámara',
    icon: '🛏️',
    description: 'Recámara completa o piezas individuales',
    order: 5,
    attributes: [
      { key: 'tamano_cama', label: 'Tamaño de cama', type: 'select', options: ['Individual', 'Matrimonial', 'Queen', 'King'] },
      { key: 'cabecera', label: 'Cabecera', type: 'textarea' },
      { key: 'buros', label: 'Burós (cantidad)', type: 'number' },
      { key: 'tocador', label: 'Tocador', type: 'boolean' },
      { key: 'comoda', label: 'Cómoda', type: 'boolean' },
      { key: 'banca_pie_cama', label: 'Banca pie de cama', type: 'boolean' },
      { key: 'material', label: 'Material principal', type: 'select', options: ['Madera maciza', 'MDF laqueado', 'Melamina', 'Tapizado'] },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'acabado', label: 'Acabado', type: 'select', options: ['Mate', 'Brillante', 'Satinado', 'Natural'] },
    ],
  },
  {
    slug: 'sala',
    name: 'Sala',
    icon: '🛋️',
    description: 'Juegos de sala modulares',
    order: 6,
    attributes: [
      { key: 'configuracion', label: 'Configuración', type: 'select', options: ['Sofá + 2 individuales', 'Modular en L', 'Modular en U', 'Sofá + esquinero', 'Solo sofá'] },
      { key: 'plazas', label: 'Plazas totales', type: 'number' },
      { key: 'tela_tapiz', label: 'Tela / tapiz', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'estructura', label: 'Estructura', type: 'select', options: ['Madera maciza', 'Metal', 'Mixto'] },
      { key: 'cojines_sueltos', label: 'Cojines sueltos', type: 'boolean' },
      { key: 'medida_total', label: 'Medida total aprox.', type: 'text', placeholder: 'Ej: 2.80m x 2.00m' },
    ],
  },
  {
    slug: 'sofa',
    name: 'Sofá',
    icon: '💺',
    description: 'Sofá individual o esquinero',
    order: 7,
    attributes: [
      { key: 'plazas', label: 'Número de plazas', type: 'number', required: true },
      { key: 'largo', label: 'Largo', type: 'number', unit: 'cm', required: true },
      { key: 'profundidad', label: 'Profundidad', type: 'number', unit: 'cm' },
      { key: 'alto', label: 'Alto', type: 'number', unit: 'cm' },
      { key: 'tela', label: 'Tela / piel', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'estructura', label: 'Estructura', type: 'select', options: ['Madera maciza', 'Metal', 'Mixto'] },
      { key: 'sofa_cama', label: 'Función sofá cama', type: 'boolean' },
      { key: 'cojines_extra', label: 'Cojines extra', type: 'number' },
    ],
  },
  {
    slug: 'mueble-tv',
    name: 'Mueble para TV',
    icon: '📺',
    description: 'Mueble para televisión y entretenimiento',
    order: 8,
    attributes: [
      { key: 'largo', label: 'Largo', type: 'number', unit: 'cm', required: true },
      { key: 'profundidad', label: 'Profundidad', type: 'number', unit: 'cm' },
      { key: 'alto', label: 'Alto', type: 'number', unit: 'cm' },
      { key: 'pulgadas_tv', label: 'Pulgadas TV', type: 'number' },
      { key: 'modulos', label: 'Cantidad de módulos / repisas', type: 'number' },
      { key: 'puertas', label: 'Cantidad de puertas', type: 'number' },
      { key: 'cajones', label: 'Cantidad de cajones', type: 'number' },
      { key: 'tipo_montaje', label: 'Montaje', type: 'select', options: ['Piso', 'Pared (flotante)', 'Mixto'] },
      { key: 'material', label: 'Material', type: 'select', options: ['MDF laqueado', 'Melamina', 'Madera maciza', 'Mixto'] },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'iluminacion', label: 'Iluminación LED', type: 'boolean' },
    ],
  },
  {
    slug: 'otros',
    name: 'Otros muebles',
    icon: '📦',
    description: 'Muebles especiales no listados',
    order: 99,
    attributes: [
      { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
      { key: 'medidas', label: 'Medidas aproximadas', type: 'text', placeholder: 'Largo x Ancho x Alto' },
      { key: 'material', label: 'Material principal', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'acabado', label: 'Acabado', type: 'text' },
    ],
  },
];

// ----- Categorías de galería -----

const GALLERY_CATEGORIES = [
  { slug: 'cocinas', name: 'Cocinas', order: 1 },
  { slug: 'closets', name: 'Closets y Vestidores', order: 2 },
  { slug: 'mesas', name: 'Mesas', order: 3 },
  { slug: 'sillas', name: 'Sillas', order: 4 },
  { slug: 'recamaras', name: 'Recámaras', order: 5 },
  { slug: 'salas', name: 'Salas', order: 6 },
  { slug: 'sofas', name: 'Sofás', order: 7 },
  { slug: 'mueble-tv', name: 'Mueble para TV', order: 8 },
  { slug: 'otros', name: 'Otros', order: 99 },
];

// ----- Settings iniciales -----

const SETTINGS = [
  { key: 'business.name', value: process.env.BUSINESS_NAME || 'Fetis Muebles', group: 'business' },
  { key: 'business.email', value: process.env.BUSINESS_EMAIL || 'contacto@fetis.mx', group: 'business' },
  { key: 'business.whatsapp', value: process.env.BUSINESS_WHATSAPP || '5213339130931', group: 'business' },
  { key: 'business.phone', value: '', group: 'business' },
  { key: 'business.address', value: '', group: 'business' },
  { key: 'business.instagram', value: '', group: 'business' },
  { key: 'business.facebook', value: '', group: 'business' },
  { key: 'landing.hero_title', value: 'Muebles a medida que transforman tu espacio', group: 'landing' },
  { key: 'landing.hero_subtitle', value: 'Diseño exclusivo, materiales premium y fabricación artesanal. Cada mueble Fetis es único, como tu hogar.', group: 'landing' },
  { key: 'landing.about_title', value: 'Carpintería con visión de diseño', group: 'landing' },
  { key: 'landing.about_text', value: 'En Fetis combinamos técnica tradicional con diseño contemporáneo. Cada pieza se proyecta a medida, se construye con maderas y herrajes de la más alta calidad, y se entrega lista para integrarse a tu espacio.', group: 'landing' },
];

// ----- Mapeo de fotos a categorías -----

const TRABAJOS_DIR = path.join(__dirname, '..', 'img', 'trabajos realizados');

const PHOTO_ASSIGNMENTS: Record<string, string> = {
  'WhatsApp Image 2026-05-22 at 10.43.21 AM.jpeg': 'cocinas',
  'WhatsApp Image 2026-05-22 at 10.43.21 AM (1).jpeg': 'closets',
  'WhatsApp Image 2026-05-22 at 10.43.22 AM.jpeg': 'cocinas',
  'WhatsApp Image 2026-05-22 at 10.43.22 AM (1).jpeg': 'closets',
  'Screenshot 2026-05-22 165209.png': 'mesas',
  'Screenshot 2026-05-22 165331.png': 'recamaras',
  'Screenshot 2026-05-22 165354.png': 'salas',
  'Screenshot 2026-05-22 165441.png': 'mueble-tv',
  'Screenshot 2026-05-22 165516.png': 'sofas',
  'Screenshot 2026-05-22 165604.png': 'sillas',
};

async function main() {
  console.log('🌱 Seed: iniciando...');

  // 1. Admin
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@fetis.mx').toLowerCase();
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador Fetis';
  const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'Fetis2026!';
  const hash = await bcrypt.hash(adminPwd, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: hash,
      role: 'ADMIN',
      active: true,
    },
  });
  console.log(`✅ Admin: ${adminEmail} / ${adminPwd}`);

  // 2. Furniture types
  for (const ft of FURNITURE_TYPES) {
    await prisma.furnitureType.upsert({
      where: { slug: ft.slug },
      update: {
        name: ft.name,
        icon: ft.icon,
        description: ft.description,
        order: ft.order,
        attributesSchema: ft.attributes,
      },
      create: {
        slug: ft.slug,
        name: ft.name,
        icon: ft.icon,
        description: ft.description,
        order: ft.order,
        attributesSchema: ft.attributes,
      },
    });
  }
  console.log(`✅ ${FURNITURE_TYPES.length} tipos de mueble`);

  // 3. Gallery categories
  for (const cat of GALLERY_CATEGORIES) {
    await prisma.galleryCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: { slug: cat.slug, name: cat.name, order: cat.order },
    });
  }
  console.log(`✅ ${GALLERY_CATEGORIES.length} categorías de galería`);

  // 4. Settings
  for (const s of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: { key: s.key, value: s.value, group: s.group, type: 'string' },
    });
  }
  console.log(`✅ ${SETTINGS.length} settings`);

  // 5. Importar fotos de trabajos realizados a la galería
  if (fs.existsSync(TRABAJOS_DIR)) {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'gallery');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const existingCount = await prisma.galleryItem.count();
    if (existingCount === 0) {
      let order = 0;
      for (const [filename, catSlug] of Object.entries(PHOTO_ASSIGNMENTS)) {
        const srcPath = path.join(TRABAJOS_DIR, filename);
        if (!fs.existsSync(srcPath)) {
          console.warn(`⚠️  Foto no encontrada: ${filename}`);
          continue;
        }
        const ext = path.extname(filename);
        const safe = `seed-${catSlug}-${order}${ext}`.toLowerCase().replace(/\s+/g, '-');
        const dstPath = path.join(uploadsDir, safe);
        fs.copyFileSync(srcPath, dstPath);

        const category = await prisma.galleryCategory.findUnique({ where: { slug: catSlug } });
        if (!category) continue;
        await prisma.galleryItem.create({
          data: {
            categoryId: category.id,
            imageUrl: `/uploads/gallery/${safe}`,
            title: null,
            order: order++,
            visible: true,
            featured: order <= 4,
          },
        });
      }
      console.log(`✅ ${order} fotos importadas a la galería`);
    } else {
      console.log(`ℹ️  Galería ya tiene ${existingCount} items, skip import`);
    }
  } else {
    console.warn(`⚠️  Carpeta no encontrada: ${TRABAJOS_DIR}`);
  }

  console.log('🌱 Seed: completo');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
