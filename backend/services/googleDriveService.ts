import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export class GoogleDriveService {
  private drive: any = null;
  private currentConfig: { email: string; key: string; folderId: string } | null = null;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    try {
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      if (clientEmail && privateKey) {
        this.setConfig(clientEmail, privateKey, folderId || '');
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive client from env:', error);
    }
  }

  public setConfig(email: string, key: string, folderId: string) {
    try {
      let privateKey = key.trim().replace(/^["']|["']$/g, '');
      privateKey = privateKey.replace(/\\n/g, '\n');

      // Ensure proper PEM format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        const base64 = privateKey.replace(/\s/g, '');
        const wrappedBase64 = base64.match(/.{1,64}/g)?.join('\n') || base64;
        privateKey = `-----BEGIN PRIVATE KEY-----\n${wrappedBase64}\n-----END PRIVATE KEY-----\n`;
      }

      const auth = new google.auth.JWT({
        email: email,
        key: privateKey,
        scopes: SCOPES
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.currentConfig = { email, key: privateKey, folderId };
      console.log('Google Drive Service configured successfully');
    } catch (error) {
      console.error('Error setting Google Drive config:', error);
      this.drive = null;
    }
  }

  public isConfigured(): boolean {
    return this.drive !== null;
  }

  public async uploadFile(filePath: string, fileName: string, mimeType: string, customFolderId?: string): Promise<string | null> {
    if (!this.drive) return null;

    try {
      const folderId = customFolderId || this.currentConfig?.folderId;
      
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      const fileId = response.data.id;

      // Make the file public (Anyone with the link can view)
      // We don't await this to speed up the response, but we add a catch to log errors
      this.drive.permissions.create({
        fileId: fileId!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      }).catch((err: any) => {
        console.error(`Error setting permissions for file ${fileId}:`, err.message);
      });

      // Return the direct download link
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      return null;
    }
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    if (!this.drive) return false;

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting from Google Drive:', error);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
