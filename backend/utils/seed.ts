import { db } from '../config/firebase';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  console.log('Seeding database...');

  try {
    // 1. Seed Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      uid: 'admin_user_id',
      email: 'mjonlineshopbd@gmail.com',
      password: adminPassword,
      displayName: 'Admin MJ',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    await db.collection('users').doc(adminUser.uid).set(adminUser);
    console.log('Admin user seeded.');

    // 2. Seed Products
    const products = [
      {
        name: 'Premium Cotton Polo Shirt',
        description: 'High-quality 100% cotton polo shirt for men. Comfortable and stylish.',
        price: 1200,
        discountPrice: 990,
        category: 'Men',
        stock: 50,
        images: ['https://picsum.photos/seed/polo/800/1000'],
        rating: 4.5,
        reviewsCount: 12,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Silk Party Saree',
        description: 'Elegant silk saree with intricate embroidery. Perfect for weddings and parties.',
        price: 4500,
        discountPrice: 3800,
        category: 'Women',
        stock: 20,
        images: ['https://picsum.photos/seed/saree/800/1000'],
        rating: 4.8,
        reviewsCount: 8,
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Wireless Noise Cancelling Earbuds',
        description: 'Premium wireless earbuds with active noise cancellation and 24h battery life.',
        price: 3500,
        discountPrice: 2900,
        category: 'Electronics',
        stock: 30,
        images: ['https://picsum.photos/seed/earbuds/800/1000'],
        rating: 4.7,
        reviewsCount: 25,
        createdAt: new Date().toISOString(),
      }
    ];

    for (const product of products) {
      const id = db.collection('products').doc().id;
      await db.collection('products').doc(id).set({ ...product, id });
    }
    console.log('Products seeded.');

    // 3. Seed Coupons
    const coupons = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        value: 10,
        minOrder: 1000,
        expiryDate: '2026-12-31T23:59:59Z',
        active: true,
      },
      {
        code: 'SAVE500',
        discountType: 'fixed',
        value: 500,
        minOrder: 5000,
        expiryDate: '2026-12-31T23:59:59Z',
        active: true,
      }
    ];

    for (const coupon of coupons) {
      const id = db.collection('coupons').doc().id;
      await db.collection('coupons').doc(id).set({ ...coupon, id });
    }
    console.log('Coupons seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
