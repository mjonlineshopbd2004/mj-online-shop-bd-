import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { googleDriveService } from '../services/googleDriveService';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // If Google Drive is configured, upload to Drive
    if (googleDriveService.isConfigured()) {
      const driveUrl = await googleDriveService.uploadFile(
        req.file.path,
        req.file.filename,
        req.file.mimetype
      );

      if (driveUrl) {
        // Delete local file after upload to Drive
        fs.unlinkSync(req.file.path);
        return res.status(200).json({ url: driveUrl });
      }
    }

    // Fallback to local storage
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = [];

    for (const file of files) {
      if (googleDriveService.isConfigured()) {
        const driveUrl = await googleDriveService.uploadFile(
          file.path,
          file.filename,
          file.mimetype
        );

        if (driveUrl) {
          fs.unlinkSync(file.path);
          fileUrls.push(driveUrl);
          continue;
        }
      }
      
      fileUrls.push(`/uploads/${file.filename}`);
    }

    res.status(200).json({ urls: fileUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
};
