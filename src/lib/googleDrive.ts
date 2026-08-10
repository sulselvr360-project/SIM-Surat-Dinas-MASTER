// Google Drive Integration & Sync Utility for SIMSURAT

import firebaseAppletConfig from '../../firebase-applet-config.json';

export interface SIMSuratBackupData {
  version: string;
  timestamp: string;
  instansiConfig: any;
  suratMasukList: any[];
  suratKeluarList: any[];
  kodeKlasifikasiList: any[];
  userAccounts: any[];
}

export const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
      }
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export const requestGoogleDriveToken = (): Promise<string> => {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    firebaseAppletConfig.oAuthClientId ||
    '716757910541-qi0a3j8bn73ut2r3od7dbq73k7i70pdm.apps.googleusercontent.com';

  return new Promise((resolve, reject) => {
    const triggerOAuth = () => {
      try {
        if (!(window as any).google?.accounts?.oauth2) {
          reject(new Error('Pustaka Otentikasi Google belum siap. Silakan coba lagi.'));
          return;
        }

        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('Gagal mendapatkan token akses Google Drive.'));
            }
          },
          error_callback: (err: any) => {
            reject(new Error('Jendela popup otentikasi Google diblokir oleh peramban atau ditutup. Silakan izinkan popup untuk situs ini dan coba lagi.'));
          }
        });
        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    };

    if ((window as any).google?.accounts?.oauth2) {
      triggerOAuth();
    } else {
      loadGsiScript()
        .then(() => {
          triggerOAuth();
        })
        .catch((err) => {
          reject(new Error('Gagal memuat pustaka Google Identity Services: ' + (err.message || err)));
        });
    }
  });
};

export const uploadBackupToGoogleDrive = async (
  accessToken: string,
  backupData: SIMSuratBackupData,
  fileName = `SIMSURAT_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Data Cadangan Otomatis SIMSURAT (Surat Masuk, Surat Keluar, Disposisi & Pengaturan)',
  };

  const fileContent = JSON.stringify(backupData, null, 2);
  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', new Blob([fileContent], { type: 'application/json' }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal mengunggah ke Google Drive: ${errorText}`);
  }

  return await response.json();
};

export const listGoogleDriveBackups = async (
  accessToken: string
): Promise<Array<{ id: string; name: string; createdTime: string; size: string }>> => {
  const query = "name contains 'SIMSURAT_Backup' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,createdTime,size)&orderBy=createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal membaca berkas Google Drive: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
};

export const downloadBackupFromGoogleDrive = async (
  accessToken: string,
  fileId: string
): Promise<SIMSuratBackupData> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Gagal mengunduh berkas cadangan dari Google Drive.');
  }

  return await response.json();
};
