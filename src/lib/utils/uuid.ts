export const generateShortUUID = (): string => {
  const randomBytes = new Uint8Array(12); // 12 bytes generate 16 characters in base64
  crypto.getRandomValues(randomBytes);
  return btoa(String.fromCharCode(...randomBytes)).replace(/\+/g, '-').replace(/\//g, '_').substring(0, 16);
};
