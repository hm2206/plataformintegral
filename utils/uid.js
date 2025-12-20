/**
 * Genera un ID único alfanumérico
 * Reemplazo local para el paquete 'uid' que es ESM-only en Node 18+
 * @param {number} length - Longitud del ID (default: 11)
 * @returns {string} - ID único
 */
const uid = (length = 11) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default uid;
