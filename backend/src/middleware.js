import { authAdmin, db } from './firebaseAdmin.js';

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) { req.user = null; return next(); }
  try { req.user = await authAdmin.verifyIdToken(header.slice(7)); return next(); }
  catch { return res.status(401).json({ message: 'Your login session is invalid. Please sign in again.' }); }
}
export async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ message: 'Please log in to continue.' });
    next();
  });
}
export async function getUserProfile(uid) {
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { uid, ...snap.data() };
}
