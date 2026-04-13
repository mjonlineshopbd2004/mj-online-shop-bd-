import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export class ImgBBService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.IMGBB_API_KEY || null;
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async uploadFile(filePath: string): Promise<string | null> {
    if (!this.apiKey) {
      console.error('ImgBB API Key is missing');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(filePath));

      console.log('Attempting ImgBB upload...');
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${this.apiKey}`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (response.data && response.data.data && response.data.data.url) {
        console.log('ImgBB upload successful:', response.data.data.url);
        return response.data.data.url;
      }

      return null;
    } catch (error: any) {
      console.error('Error uploading to ImgBB:', error.response?.data || error.message);
      return null;
    }
  }
}

export const imgbbService = new ImgBBService();
