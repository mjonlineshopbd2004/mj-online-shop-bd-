import { toast } from 'sonner';

export const uploadFile = async (file: File, idToken: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  try {
    const response = await fetch(`${cleanBaseUrl}/api/upload/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload file');
    return null;
  }
};

export const uploadMultipleFiles = async (files: FileList | File[], idToken: string): Promise<string[]> => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  const baseUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  try {
    const response = await fetch(`${cleanBaseUrl}/api/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.urls;
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload files');
    return [];
  }
};
