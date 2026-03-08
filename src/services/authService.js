import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { hashPassword } from '../utils/crypto';

// Bug Fix: Case-insensitive username check
export const checkUsernameAvailable = async (username) => {
  const safeName = username.toLowerCase();
  const docSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', safeName));
  return !docSnap.exists();
};

// Bug Fix: Check if email already exists in ANY account
export const checkEmailAvailable = async (email) => {
  const safeEmail = email.toLowerCase();
  const accountsSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'));
  let taken = false;
  accountsSnap.forEach(d => {
    if (d.data().email === safeEmail) taken = true;
  });
  return !taken;
};

// Registration Logic
export const registerCommander = async (username, email, password) => {
  const safeName = username.toLowerCase();
  const hashed = await hashPassword(password);
  await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', safeName), {
    email: email.toLowerCase(),
    password: hashed,
    displayName: username, // Keeps the original casing for display
    createdAt: new Date().toISOString()
  });
  return safeName;
};
