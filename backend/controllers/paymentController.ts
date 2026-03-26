import { Request, Response } from 'express';
import SSLCommerzPayment from 'sslcommerz-lts';
import { db } from '../config/firebase';
import dotenv from 'dotenv';

dotenv.config();

const store_id = process.env.SSLCOMMERZ_STORE_ID || 'test_store_id';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'test_password';
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

export const initPayment = async (req: any, res: Response) => {
  const { orderId, total, customerName, customerEmail, phone, address } = req.body;

  if (!orderId || !total) {
    return res.status(400).json({ message: 'Order ID and total amount are required' });
  }

  const trans_id = `TXN_${Date.now()}_${orderId}`;

  const data = {
    total_amount: total,
    currency: 'BDT',
    tran_id: trans_id,
    success_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/success/${trans_id}`,
    fail_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/fail/${trans_id}`,
    cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/cancel/${trans_id}`,
    ipn_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/ipn`,
    shipping_method: 'Courier',
    product_name: 'E-commerce Product',
    product_category: 'General',
    product_profile: 'general',
    cus_name: customerName || 'Customer',
    cus_email: customerEmail || 'customer@example.com',
    cus_add1: address || 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: phone || '01700000000',
    cus_fax: '01700000000',
    ship_name: customerName || 'Customer',
    ship_add1: address || 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  
  try {
    const apiResponse = await sslcz.init(data);
    
    if (apiResponse?.GatewayPageURL) {
      // Store transaction info in Firestore
      await db.collection('payments').doc(trans_id).set({
        orderId,
        userId: req.user.uid,
        amount: total,
        status: 'pending',
        trans_id,
        createdAt: new Date().toISOString(),
      });

      res.json({ url: apiResponse.GatewayPageURL });
    } else {
      res.status(400).json({ message: 'Failed to initialize payment gateway' });
    }
  } catch (error) {
    console.error('SSLCommerz Init Error:', error);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

export const paymentSuccess = async (req: Request, res: Response) => {
  const { trans_id } = req.params;
  
  try {
    const paymentDoc = await db.collection('payments').doc(trans_id).get();
    if (!paymentDoc.exists) {
      return res.redirect('/order-history?payment=failed');
    }

    const paymentData = paymentDoc.data();
    const orderId = paymentData?.orderId;

    // Update payment status
    await db.collection('payments').doc(trans_id).update({
      status: 'success',
      updatedAt: new Date().toISOString(),
      val_id: req.body.val_id, // Validation ID from SSLCommerz
    });

    // Update order status
    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'paid',
        transactionId: trans_id,
      });
    }

    res.redirect(`/order-confirmation/${orderId}?payment=success`);
  } catch (error) {
    console.error('Payment Success Error:', error);
    res.redirect('/order-history?payment=error');
  }
};

export const paymentFail = async (req: Request, res: Response) => {
  const { trans_id } = req.params;
  try {
    await db.collection('payments').doc(trans_id).update({
      status: 'failed',
      updatedAt: new Date().toISOString(),
    });
    res.redirect('/order-history?payment=failed');
  } catch (error) {
    res.redirect('/order-history?payment=error');
  }
};

export const paymentCancel = async (req: Request, res: Response) => {
  const { trans_id } = req.params;
  try {
    await db.collection('payments').doc(trans_id).update({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
    res.redirect('/order-history?payment=cancelled');
  } catch (error) {
    res.redirect('/order-history?payment=error');
  }
};

export const paymentIPN = async (req: Request, res: Response) => {
  // Handle Instant Payment Notification
  console.log('IPN Received:', req.body);
  res.status(200).send('IPN Received');
};
