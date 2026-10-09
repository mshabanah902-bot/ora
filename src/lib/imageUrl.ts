export function getOptimizedImageUrl(source: string, width: number): string {
  try {
    const url = new URL(source);
    if (!(url.hostname === 'cloudinary.com' || url.hostname.endsWith('.cloudinary.com')) || !url.pathname.includes('/image/upload/')) return source;

    const uploadPath = '/image/upload/';
    const pathBeforeUpload = url.pathname.slice(0, url.pathname.indexOf(uploadPath) + uploadPath.length);
    const pathAfterUpload = url.pathname.slice(pathBeforeUpload.length);
    if (/^(?:[^/]+,)*f_auto(?:,|\/)/.test(pathAfterUpload)) return source;

    const targetWidth = Math.max(1, Math.round(width));
    url.pathname = `${pathBeforeUpload}f_auto,q_auto,w_${targetWidth},c_limit/${pathAfterUpload}`;
    return url.toString();
  } catch {
    return source;
  }
}
