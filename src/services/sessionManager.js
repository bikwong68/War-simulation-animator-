import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export const sessionManager = {
  async syncSession(uid, username) {
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', uid);
    await setDoc(sessionRef, { username }, { merge: true });
  },

  async recoverUsername(uid) {
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', uid);
    const snap = await getDoc(sessionRef);
    return snap.exists() ? snap.data().username : null;
  }
};
