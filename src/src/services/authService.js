import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, appId } from '../lib/firebase';
import { hashPassword } from '../utils/crypto';

export const authService = {
  async signUp(username, email, password) {
    const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'accounts', username);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) throw new Error("Username taken.");
    
    const hashedPassword = await hashPassword(password);
    await setDoc(userRef, { 
      email, 
      password: hashedPassword, 
      createdAt: new Date().toISOString() 
    });
    
    return { username };
  },

  async login(username, password) {
    const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'accounts', username);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) throw new Error("Account not found.");
    
    const accountData = docSnap.data();
    const hashedPassword = await hashPassword(password);
    
    if (accountData.password !== hashedPassword) throw new Error("Incorrect password.");
    
    return { username, email: accountData.email };
  }
};
