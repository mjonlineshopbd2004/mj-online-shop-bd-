import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { db } from '../config/firebase';

export interface GoogleSheetConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  enabled: boolean;
}

export const getGoogleSheetConfig = async (): Promise<GoogleSheetConfig | null> => {
  try {
    const settingsDoc = await db.collection('settings').doc('googleSheet').get();
    if (!settingsDoc.exists) return null;
    return settingsDoc.data() as GoogleSheetConfig;
  } catch (error) {
    console.error('Error fetching Google Sheet config:', error);
    return null;
  }
};

export const syncOrderToSheet = async (order: any) => {
  const config = await getGoogleSheetConfig();
  if (!config || !config.enabled || !config.spreadsheetId || !config.clientEmail || !config.privateKey) {
    console.log('Google Sheet sync is disabled or not configured.');
    return;
  }

  try {
    const formattedKey = config.privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
    
    const serviceAccountAuth = new JWT({
      email: config.clientEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(config.spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['Orders'];
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: 'Orders', 
        headerValues: [
          'Order ID', 
          'Date', 
          'Customer Name', 
          'Phone', 
          'Address', 
          'Total Amount', 
          'Payment Status', 
          'Order Status', 
          'Items'
        ] 
      });
    }

    const itemsSummary = order.items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ');

    await sheet.addRow({
      'Order ID': order.id,
      'Date': new Date(order.createdAt).toLocaleString(),
      'Customer Name': order.customerName,
      'Phone': order.phone,
      'Address': order.address,
      'Total Amount': order.total,
      'Payment Status': order.paymentStatus,
      'Order Status': order.status,
      'Items': itemsSummary
    });

    console.log(`Order ${order.id} synced to Google Sheet.`);
  } catch (error) {
    console.error('Error syncing order to Google Sheet:', error);
  }
};
