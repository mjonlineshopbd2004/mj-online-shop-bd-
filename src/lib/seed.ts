import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { DEMO_PRODUCTS, DEMO_CONFIG } from '../constants';

export async function seedDemoData() {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Seeding demo products...');
      for (const product of DEMO_PRODUCTS) {
        const { id, ...data } = product;
        await addDoc(collection(db, 'products'), data);
      }
      console.log('Demo products seeded!');
    }

    const configSnap = await getDocs(collection(db, 'config'));
    if (configSnap.empty) {
      console.log('Seeding demo config...');
      await setDoc(doc(db, 'config', 'settings'), DEMO_CONFIG);
      console.log('Demo config seeded!');
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
}
