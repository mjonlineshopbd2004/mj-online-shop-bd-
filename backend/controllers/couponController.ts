import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { Coupon } from '../models/types';

export const createCoupon = async (req: Request, res: Response) => {
  const { code, discountType, value, minOrder, expiryDate } = req.body;

  if (!code || !discountType || !value || !expiryDate) {
    return res.status(400).json({ message: 'Missing required coupon fields' });
  }

  try {
    const couponSnapshot = await db.collection('coupons').where('code', '==', code.toUpperCase()).get();
    if (!couponSnapshot.empty) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const newCoupon: Coupon = {
      id: db.collection('coupons').doc().id,
      code: code.toUpperCase(),
      discountType,
      value,
      minOrder: minOrder || 0,
      expiryDate,
      active: true,
    };

    await db.collection('coupons').doc(newCoupon.id).set(newCoupon);
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating coupon' });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  const { code, subtotal } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    const couponSnapshot = await db.collection('coupons').where('code', '==', code.toUpperCase()).get();
    if (couponSnapshot.empty) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    const coupon = couponSnapshot.docs[0].data() as Coupon;

    if (!coupon.active) {
      return res.status(400).json({ message: 'Coupon is no longer active' });
    }

    const expiryDate = new Date(coupon.expiryDate);
    if (expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (subtotal < coupon.minOrder) {
      return res.status(400).json({ message: `Minimum order of ৳${coupon.minOrder} required for this coupon` });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error validating coupon' });
  }
};

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('coupons').get();
    const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await db.collection('coupons').doc(req.params.id).delete();
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
};
