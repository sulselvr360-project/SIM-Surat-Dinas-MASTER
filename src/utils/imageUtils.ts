/**
 * Utility to compress image files / Data URLs before storing in Firestore
 * to ensure document sizes stay well under Firestore's 1MB limit.
 */

export async function compressImageFile(
  file: File,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.75
): Promise<string> {
  // If it's SVG and small (< 50KB), keep as text SVG
  if (file.type === 'image/svg+xml' && file.size < 50000) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width || maxWidth;
        let height = img.height || maxHeight;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve((e.target?.result as string).slice(0, 300000));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => {
        // Fallback
        const result = e.target?.result as string;
        resolve(result ? result.slice(0, 300000) : '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressDataUrl(
  dataUrl: string,
  maxWidth = 300,
  maxHeight = 300,
  quality = 0.75
): Promise<string> {
  if (!dataUrl) return '';

  // If it's a web URL (http/https), keep as is
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  // If it's a lightweight vector SVG without large embedded base64 image data
  if (
    dataUrl.startsWith('data:image/svg+xml') &&
    dataUrl.length < 100000 &&
    !dataUrl.includes('base64,')
  ) {
    return dataUrl;
  }

  // If string length is already very small (< 50KB), safe for Firestore
  if (dataUrl.length < 50000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width || maxWidth;
      let height = img.height || maxHeight;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl.slice(0, 300000));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(dataUrl.slice(0, 300000));
    };
    img.src = dataUrl;
  });
}
