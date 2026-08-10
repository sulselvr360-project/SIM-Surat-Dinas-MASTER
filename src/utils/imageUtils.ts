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
    let handled = false;
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        resolve('');
      }
    }, 3000);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        if (!handled) {
          handled = true;
          clearTimeout(timeoutId);
          resolve('');
        }
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (handled) return;
        handled = true;
        clearTimeout(timeoutId);
        try {
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
            resolve(result.slice(0, 300000));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(result.slice(0, 300000));
        }
      };
      img.onerror = () => {
        if (!handled) {
          handled = true;
          clearTimeout(timeoutId);
          resolve(result.slice(0, 300000));
        }
      };
      img.src = result;
    };
    reader.onerror = (err) => {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        reject(err);
      }
    };
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
    !dataUrl.includes('base64,')
  ) {
    return dataUrl;
  }

  // If string length is already small (< 50KB), safe for Firestore
  if (dataUrl.length < 50000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    let handled = false;
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        resolve(dataUrl.slice(0, 300000));
      }
    }, 1500);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (handled) return;
      handled = true;
      clearTimeout(timeoutId);
      try {
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
      } catch {
        resolve(dataUrl.slice(0, 300000));
      }
    };
    img.onerror = () => {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        resolve(dataUrl.slice(0, 300000));
      }
    };
    img.src = dataUrl;
  });
}
