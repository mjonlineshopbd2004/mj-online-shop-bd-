# Google Drive Storage Setup Instructions

To use Google Drive as your media database for images and videos, follow these steps:

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.

## 2. Enable Google Drive API
1. In the sidebar, go to **APIs & Services > Library**.
2. Search for **"Google Drive API"** and click **Enable**.

## 3. Create a Service Account
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > Service Account**.
3. Give it a name (e.g., "Website Media Storage") and click **Create and Continue**.
4. Skip the optional roles and click **Done**.
5. Click on the newly created service account email.
6. Go to the **Keys** tab.
7. Click **Add Key > Create New Key**.
8. Select **JSON** and click **Create**. A file will be downloaded to your computer.

## 4. Create a Google Drive Folder (IMPORTANT: Shared Drive Recommended)
1. **Option A: Shared Drive (Best for Service Accounts)**
   - Go to your [Google Drive](https://drive.google.com/).
   - Click on **Shared Drives** in the sidebar.
   - Click **New** and name it (e.g., "App Media").
   - Click **Manage members** and add your **Service Account email** as a **Contributor** or **Content Manager**.
   - Create a folder inside this Shared Drive and copy its **Folder ID** from the URL.

2. **Option B: Regular Folder (May have quota issues)**
   - Create a new folder in your "My Drive".
   - **Share the folder** with your Service Account email and give it **Editor** access.
   - Copy the **Folder ID** from the URL.
   - *Note: Service accounts have 0GB quota. If you get a "storage quota" error, you MUST use Option A (Shared Drive).*

3. **How to get the Folder ID:**
   - The URL looks like: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`
   - Copy only the `YOUR_FOLDER_ID` part.

## 5. Set Environment Variables
Add the following variables to your environment (e.g., in Vercel settings or your `.env` file):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The email of your service account.
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: The `private_key` from the JSON file you downloaded.
  - **Note:** Make sure to include the full key, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`.
- `GOOGLE_DRIVE_FOLDER_ID`: The ID of the folder you created in step 4.

## How it works
Once these are set up, when you upload an image or video in the Admin Panel:
1. The website will automatically upload the file to your Google Drive folder.
2. It will set the file to be publicly viewable.
3. It will save the direct link in your database.
4. Your website will display the media directly from Google Drive.
