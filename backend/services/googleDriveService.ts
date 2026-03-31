import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export class GoogleDriveService {
  private drive;

  constructor() {
    try {
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

      if (!clientEmail || !privateKey) {
        console.warn('Google Drive Service Account credentials not fully configured.');
        this.drive = null;
        return;
      }

      // Robust handling of private key for Vercel environment variables
      // Remove any surrounding quotes that might have been added in the Vercel UI
      privateKey = privateKey.trim().replace(/^["']|["']$/g, '');
      // Handle both literal newlines and escaped \n strings
      privateKey = privateKey.replace(/\\n/g, '\n');

      const auth = new google.auth.JWT(
        clientEmail,
        undefined,
        privateKey,
        SCOPES
      );

      this.drive = google.drive({ version: 'v3', auth });
    } catch (error) {
      console.error('Failed to initialize Google Drive client:', error);
      this.drive = null;
    }
  }

  public isConfigured(): boolean {
    return this.drive !== null;
  }

  public async uploadFile(filePath: string, fileName: string, mimeType: string): Promise<string | null> {
    if (!this.drive) return null;

    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      
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
      await this.drive.permissions.create({
        fileId: fileId!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Return the direct download link if possible, or the webViewLink
      // For images/videos, we want the direct link
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
