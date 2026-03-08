import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export const saveSession = async (userId, username) => {
  if (!userId) return;
  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', userId), {
    username: username ? username.toLowerCase() : null,
    lastActive: new Date().toISOString()
  });
};

export const getActiveSession = async (userId) => {
  const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', userId));
  return snap.exists() ? snap.data().username : null;
};
