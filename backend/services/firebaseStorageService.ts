import { getStorageInstance } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export class FirebaseStorageService {
  public async uploadFile(filePath: string, fileName: string, mimeType: string): Promise<string | null> {
    try {
      const storage = getStorageInstance();
      const bucket = storage.bucket();
      const destination = `products/${uuidv4()}_${fileName}`;
      
      console.log(`Attempting Firebase Storage upload to bucket: ${bucket.name}, destination: ${destination}`);

      // Use file.save() for better reliability in some environments
      const file = bucket.file(destination);
      const fileBuffer = fs.readFileSync(filePath);
      
      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType,
        },
        resumable: false, // Disable resumable for small files to avoid some Gaxios errors
      });

      // Make the file public
      try {
        await file.makePublic();
      } catch (publicError: any) {
        console.warn('Could not make file public via ACL (Uniform bucket-level access might be enabled):', publicError.message);
        // If makePublic fails, we still return the URL, as the bucket might be public by default
      }

      // Return the public URL
      return `https://storage.googleapis.com/${bucket.name}/${destination}`;
    } catch (error: any) {
      console.error('Error uploading to Firebase Storage:', error);
      if (error.response) {
        console.error('Firebase Storage API Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.code) {
        console.error('Firebase Storage Error Code:', error.code);
      }
      
      // Provide actionable advice for common errors
      if (error.message?.includes('storage.objects.create')) {
        console.error('CRITICAL: Service Account lacks "storage.objects.create" permission. Please grant "Storage Object Admin" or "Firebase Admin" role.');
      }
      
      return null;
    }
  }

  public async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const storage = getStorageInstance();
      const bucket = storage.bucket();
      
      // Extract the path from the URL
      // URL format: https://storage.googleapis.com/BUCKET_NAME/products/FILENAME
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;

      await bucket.file(filePath).delete();
      return true;
    } catch (error) {
      console.error('Error deleting from Firebase Storage:', error);
      return false;
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
