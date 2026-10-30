import QRCode from 'qrcode';

export async function generateQrSvg(data: string): Promise<string> {
  try {
    return await QRCode.toString(data, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#1b4332', // Deep agricultural forest green
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export async function generateQrDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      margin: 2,
      color: {
        dark: '#1b4332',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR Data URL:', err);
    return '';
  }
}
