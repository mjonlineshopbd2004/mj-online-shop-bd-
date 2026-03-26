import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { UserProfile, Order, Product } from '../models/types';

import bcrypt from 'bcryptjs';

export const seedDatabase = async (req: Request, res: Response) => {
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

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Server error during seeding' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const usersCount = (await db.collection('users').get()).size;
    const productsCount = (await db.collection('products').get()).size;
    
    const ordersSnapshot = await db.collection('orders').get();
    const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
    
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    res.json({
      totalUsers: usersCount,
      totalProducts: productsCount,
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => {
      const { password: _, ...userWithoutPassword } = doc.data() as UserProfile;
      return userWithoutPassword;
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.update({ role });
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};
