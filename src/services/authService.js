import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const registerCommander = async (username, email, password) => {
  const safeName = username.toLowerCase();
  const hashed = await hashPassword(password);
  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', safeName), {
    email: email.toLowerCase(),
    password: hashed,
    displayName: username,
    createdAt: new Date().toISOString()
  });
};

export const loginCommander = async (username, password) => {
  const safeName = username.toLowerCase();
  const docSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', safeName));
  if (!docSnap.exists()) return { success: false, msg: "Commander not found" };
  const hashed = await hashPassword(password);
  if (docSnap.data().password === hashed) return { success: true, user: docSnap.data() };
  return { success: false, msg: "Invalid credentials" };
};
