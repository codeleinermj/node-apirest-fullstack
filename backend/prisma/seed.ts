import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
    },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Laptop Pro 15', description: 'Laptop de alto rendimiento con 16GB RAM y SSD 512GB', price: 1299.99, stock: 25, authorId: admin.id },
      { title: 'Mouse Inalámbrico', description: 'Mouse ergonómico bluetooth con 3 meses de batería', price: 29.99, stock: 100, authorId: user.id },
      { title: 'Teclado Mecánico RGB', description: 'Teclado mecánico con switches Cherry MX Red', price: 89.99, stock: 50, authorId: admin.id },
      { title: 'Monitor 4K 27"', description: 'Monitor UHD con panel IPS y 144Hz', price: 549.99, stock: 15, authorId: admin.id },
      { title: 'Auriculares Noise Cancelling', description: 'Cancelación activa de ruido, 30h batería', price: 199.99, stock: 40, authorId: user.id },
      { title: 'Webcam 1080p', description: 'Cámara web Full HD con micrófono integrado', price: 69.99, stock: 60, authorId: admin.id },
      { title: 'Hub USB-C 7 en 1', description: 'HDMI 4K, USB 3.0, SD card, 100W PD', price: 49.99, stock: 80, authorId: user.id },
      { title: 'SSD Externo 1TB', description: 'Velocidad 1050MB/s, compatible USB 3.2', price: 109.99, stock: 35, authorId: admin.id },
      { title: 'Silla Ergonómica', description: 'Soporte lumbar ajustable, reposabrazos 4D', price: 449.99, stock: 10, authorId: admin.id },
      { title: 'Lámpara LED de Escritorio', description: 'Control táctil, temperatura de color ajustable', price: 34.99, stock: 90, authorId: user.id },
      { title: 'Micrófono de Condensador', description: 'Patrón cardioide, conexión USB-C', price: 129.99, stock: 25, authorId: admin.id },
      { title: 'Tablet 10" 128GB', description: 'Pantalla AMOLED, lápiz stylus incluido', price: 349.99, stock: 20, authorId: user.id },
      { title: 'Soporte para Monitor', description: 'Brazo articulado, compatible VESA 75/100', price: 59.99, stock: 45, authorId: admin.id },
      { title: 'Cargador Inalámbrico 15W', description: 'Compatible Qi, carga rápida para iPhone y Android', price: 24.99, stock: 120, authorId: user.id },
      { title: 'Altavoz Bluetooth', description: 'Resistente al agua IPX7, 20h de reproducción', price: 79.99, stock: 55, authorId: admin.id },
      { title: 'Controlador para PC', description: 'Compatible Xbox/PC, vibración háptica', price: 59.99, stock: 30, authorId: user.id },
      { title: 'Router WiFi 6', description: 'Cobertura 200m², tri-banda, 6Gbps', price: 179.99, stock: 18, authorId: admin.id },
      { title: 'Cable HDMI 2.1 2m', description: 'Soporte 8K@60Hz y 4K@120Hz', price: 14.99, stock: 200, authorId: user.id },
      { title: 'Mousepad XL RGB', description: 'Base antideslizante, superficie de tela premium', price: 39.99, stock: 70, authorId: admin.id },
      { title: 'Cooling Pad para Laptop', description: '5 ventiladores, soporte ajustable en altura', price: 27.99, stock: 50, authorId: user.id },
      { title: 'Disco Duro Externo 2TB', description: 'USB 3.0, compatible Time Machine y Windows Backup', price: 74.99, stock: 40, authorId: admin.id },
      { title: 'Impresora Multifunción', description: 'WiFi, impresión dúplex, escáner 1200dpi', price: 129.99, stock: 12, authorId: admin.id },
      { title: 'Funda Laptop 15"', description: 'Neopreno resistente al agua, bolsillos adicionales', price: 19.99, stock: 150, authorId: user.id },
      { title: 'Smartwatch Pro', description: 'GPS, monitor cardíaco, resistente al agua 5ATM', price: 249.99, stock: 22, authorId: admin.id },
      { title: 'Tira LED RGB 5m', description: 'Control por app, compatible Alexa y Google Home', price: 22.99, stock: 100, authorId: user.id },
      { title: 'Teclado Bluetooth Compacto', description: 'Compatible iOS/Android/Windows, batería 3 meses', price: 44.99, stock: 60, authorId: admin.id },
      { title: 'Memoria RAM 16GB DDR5', description: '5600MHz, perfil XMP 3.0, disipador incluido', price: 89.99, stock: 30, authorId: user.id },
      { title: 'Tarjeta Gráfica RTX 4060', description: '8GB GDDR6, ray tracing, DLSS 3.0', price: 399.99, stock: 8, authorId: admin.id },
      { title: 'Fuente de Poder 750W', description: '80 Plus Gold, modular completa', price: 99.99, stock: 20, authorId: admin.id },
      { title: 'Ventilador PC 120mm RGB', description: 'Rodamiento de bolas, 1500RPM, pack de 3', price: 29.99, stock: 75, authorId: user.id },
      { title: 'Kit Limpieza Electrónica', description: 'Spray aire comprimido, paños microfibra, pinceles', price: 17.99, stock: 110, authorId: user.id },
      { title: 'Soporte Vertical para PS5', description: 'Doble cargador de mandos incluido', price: 34.99, stock: 25, authorId: admin.id },
      { title: 'Capturadora HDMI 4K', description: 'USB 3.0, compatible OBS, 0ms latencia', price: 89.99, stock: 15, authorId: user.id },
      { title: 'Switch KVM 4 Puertos', description: 'Controla 4 PCs con 1 teclado y monitor', price: 69.99, stock: 18, authorId: admin.id },
      { title: 'Lector de Tarjetas SD', description: 'USB-C, soporta SD/MicroSD/CF, USB 3.0', price: 12.99, stock: 180, authorId: user.id },
      { title: 'Pasta Térmica Premium', description: 'Conductividad 12.5 W/mK, jeringa 3g', price: 9.99, stock: 250, authorId: admin.id },
      { title: 'Base para Laptop Plegable', description: 'Aluminio, altura ajustable en 6 niveles', price: 32.99, stock: 65, authorId: user.id },
      { title: 'Adaptador Multipuerto USB-A', description: '4 puertos USB 3.0, carga simultánea', price: 18.99, stock: 130, authorId: admin.id },
      { title: 'Cámara Mirrorless 24MP', description: 'Video 4K60, estabilización óptica, WiFi/BT', price: 899.99, stock: 7, authorId: admin.id },
      { title: 'Trípode Flexible Gorilla', description: 'Para cámaras y smartphones, 25cm', price: 15.99, stock: 90, authorId: user.id },
      { title: 'Batería Portátil 20000mAh', description: 'Carga rápida 65W, 3 puertos USB-C/A', price: 54.99, stock: 45, authorId: admin.id },
      { title: 'Foco LED Inteligente', description: '16M colores, compatible Matter/Zigbee, 806lm', price: 16.99, stock: 200, authorId: user.id },
      { title: 'Proyector Mini 1080p', description: '200 pulgadas máximo, HDMI/USB/BT integrado', price: 279.99, stock: 10, authorId: admin.id },
      { title: 'Escáner Portátil A4', description: 'Escaneo directo a PDF/JPEG, sin cables', price: 149.99, stock: 14, authorId: user.id },
      { title: 'Estabilizador de Tensión', description: 'Protege equipos hasta 1500W de picos eléctricos', price: 44.99, stock: 28, authorId: admin.id },
      { title: 'Reposamuñecas para Teclado', description: 'Memoria viscoelástica, antideslizante', price: 21.99, stock: 85, authorId: user.id },
      { title: 'Cámara de Seguridad WiFi', description: 'Visión nocturna 10m, detección de movimiento IA', price: 39.99, stock: 50, authorId: admin.id },
      { title: 'Cable USB-C 240W 2m', description: 'Carga rápida, transferencia 40Gbps', price: 19.99, stock: 160, authorId: user.id },
      { title: 'Auriculares Gaming 7.1', description: 'Sonido envolvente, micrófono retráctil con LED', price: 69.99, stock: 35, authorId: admin.id },
      { title: 'Mini PC Intel N100', description: '16GB RAM, 512GB NVMe, WiFi 6, sin ruido', price: 229.99, stock: 12, authorId: admin.id },
    ],
  });

  console.log('Seed completed:', { admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
