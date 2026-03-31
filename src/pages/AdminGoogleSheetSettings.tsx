import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';

interface GoogleSheetSettings {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  enabled: boolean;
}

const AdminGoogleSheetSettings: React.FC = () => {
  const [settings, setSettings] = useState<GoogleSheetSettings>({
    spreadsheetId: '',
    clientEmail: '',
    privateKey: '',
    enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/settings/google-sheet', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.spreadsheetId || !settings.clientEmail || !settings.privateKey) {
      toast.error('Please provide all credentials before testing');
      return;
    }

    setTesting(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/settings/google-sheet/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Connection successful! A test row has been added to the "Orders" sheet.');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/settings/google-sheet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings updated successfully');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
          Google Sheet Integration
        </h1>
        <p className="text-gray-600 mt-2">
          Sync your orders automatically to a Google Sheet for easier management.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              <p className="text-sm text-gray-500">Provide your Google Service Account credentials</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spreadsheet ID
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="e.g. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ"
                value={settings.spreadsheetId}
                onChange={(e) => setSettings({ ...settings, spreadsheetId: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Found in the URL of your Google Sheet: docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Account Email (Client Email)
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your-service-account@project-id.iam.gserviceaccount.com"
                value={settings.clientEmail}
                onChange={(e) => setSettings({ ...settings, clientEmail: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Private Key
              </label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-xs"
                placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                value={settings.privateKey}
                onChange={(e) => setSettings({ ...settings, privateKey: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Include the full key including the BEGIN and END lines.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Setup Instructions:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Create a project in Google Cloud Console.</li>
                <li>Enable the Google Sheets API.</li>
                <li>Create a Service Account and download the JSON key.</li>
                <li>Copy the <code>client_email</code> and <code>private_key</code> from the JSON.</li>
                <li><strong>Important:</strong> Share your Google Sheet with the Service Account email address with "Editor" permissions.</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {testing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              Test Connection
            </button>
            <button
              type="submit"
              disabled={saving || testing}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGoogleSheetSettings;
