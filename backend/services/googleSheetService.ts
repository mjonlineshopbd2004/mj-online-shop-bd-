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

const getFormattedKey = (key: string) => {
  if (!key) return '';
  
  let cleaned = key.trim();

  // 1. Try to parse as JSON first (handles pasting the whole file)
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.private_key) {
      cleaned = parsed.private_key;
    } else if (parsed.key) {
      cleaned = parsed.key;
    }
  } catch (e) {
    // If not JSON, check if it's a quoted string (common when copying from JSON)
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
  }
  
  // 2. Handle JSON-escaped newlines (literal \n)
  cleaned = cleaned.replace(/\\n/g, '\n');
  
  // 3. Extract the base64 part by removing ANY headers and all whitespace
  const base64 = cleaned
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
  
  if (base64.length < 100) {
    console.error(`Google Sheet sync failed: Private key is too short (${base64.length} chars).`);
    return '';
  }

  // 4. Reconstruct the PEM string with strict 64-character wrapping
  const wrappedBase64 = base64.match(/.{1,64}/g)?.join('\n') || base64;
  return `-----BEGIN PRIVATE KEY-----\n${wrappedBase64}\n-----END PRIVATE KEY-----\n`;
};

export const syncOrderToSheet = async (order: any) => {
  const config = await getGoogleSheetConfig();
  if (!config || !config.enabled || !config.spreadsheetId || !config.clientEmail || !config.privateKey) {
    console.log('Google Sheet sync is disabled or not configured.');
    return;
  }

  try {
    const extractId = (id: string) => {
      if (!id) return '';
      const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : id.trim().replace(/^["']|["']$/g, '');
    };
    const sanitizedId = extractId(config.spreadsheetId);
    const formattedKey = getFormattedKey(config.privateKey);
    
    const serviceAccountAuth = new JWT({
      email: config.clientEmail.trim(),
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sanitizedId, serviceAccountAuth);
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

export const syncProductToSheet = async (product: any) => {
  const config = await getGoogleSheetConfig();
  if (!config || !config.enabled || !config.spreadsheetId || !config.clientEmail || !config.privateKey) {
    return;
  }

  try {
    const extractId = (id: string) => {
      if (!id) return '';
      const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : id.trim().replace(/^["']|["']$/g, '');
    };
    const sanitizedId = extractId(config.spreadsheetId);
    const formattedKey = getFormattedKey(config.privateKey);
    
    const serviceAccountAuth = new JWT({
      email: config.clientEmail.trim(),
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sanitizedId, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['Products'];
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: 'Products', 
        headerValues: [
          'Product ID', 
          'Name', 
          'Price', 
          'Discount Price', 
          'Category', 
          'Stock', 
          'Rating', 
          'Reviews Count', 
          'Images',
          'Last Updated'
        ] 
      });
    }

    const rows = await sheet.getRows();
    const existingRow = rows.find(row => row.get('Product ID') === product.id);

    const productData = {
      'Product ID': product.id,
      'Name': product.name,
      'Price': product.price,
      'Discount Price': product.discountPrice || '',
      'Category': product.category,
      'Stock': product.stock,
      'Rating': product.rating || 0,
      'Reviews Count': product.reviewsCount || 0,
      'Images': (product.images || []).join(', '),
      'Last Updated': new Date().toLocaleString()
    };

    if (existingRow) {
      Object.assign(existingRow, productData);
      await existingRow.save();
    } else {
      await sheet.addRow(productData);
    }

    console.log(`Product ${product.id} synced to Google Sheet.`);
  } catch (error) {
    console.error('Error syncing product to Google Sheet:', error);
  }
};

export const getProductsFromSheet = async () => {
  const config = await getGoogleSheetConfig();
  if (!config || !config.enabled || !config.spreadsheetId || !config.clientEmail || !config.privateKey) {
    return null;
  }

  try {
    const extractId = (id: string) => {
      if (!id) return '';
      const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : id.trim().replace(/^["']|["']$/g, '');
    };
    const sanitizedId = extractId(config.spreadsheetId);
    const formattedKey = getFormattedKey(config.privateKey);
    
    const serviceAccountAuth = new JWT({
      email: config.clientEmail.trim(),
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sanitizedId, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Products'];
    if (!sheet) return null;

    const rows = await sheet.getRows();
    return rows.map(row => ({
      id: row.get('Product ID'),
      name: row.get('Name'),
      price: Number(row.get('Price')),
      discountPrice: row.get('Discount Price') ? Number(row.get('Discount Price')) : undefined,
      category: row.get('Category'),
      stock: Number(row.get('Stock')),
      rating: Number(row.get('Rating') || 0),
      reviewsCount: Number(row.get('Reviews Count') || 0),
      images: row.get('Images') ? row.get('Images').split(',').map((s: string) => s.trim()) : [],
      createdAt: row.get('Last Updated') || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching products from Google Sheet:', error);
    return null;
  }
};
