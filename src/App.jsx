import React, { useState, useEffect, memo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection 
} from 'firebase/firestore';
import { User, Lock, Mail, Map as MapIcon, Plus, Loader2 } from 'lucide-react';

// --- DATABASE CONNECTION ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- SECURITY LOGIC ---
async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', user.uid));
            if (snap.exists() && snap.data().username) {
              setUsername(snap.data().username);
              setView('workspace');
            }
          }
          setLoading(false);
        });
      } catch (e) {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAuth = async (mode) => {
    setError('');
    const safeName = username.toLowerCase();
    const hashed = await hashPassword(password);

    try {
      if (mode === 'signup') {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', safeName), {
          displayName: username,
          password: hashed,
          email: email
        });
      } else {
        const acc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', safeName));
        if (!acc.exists() || acc.data().password !== hashed) {
          setError("Invalid Credentials");
          return;
        }
      }

      if (auth.currentUser) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', auth.currentUser.uid), {
          username: safeName
        });
      }
      setView('workspace');
    } catch (e) {
      setError("Database Error");
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  if (view === 'landing' || view === 'login' || view === 'signup') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <h1 className="text-white text-xl font-bold text-center uppercase tracking-widest">Base Command</h1>
        {error && <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] text-center uppercase font-bold">{error}</div>}
        <div className="space-y-4">
          <input className="w-full p-3 bg-black border border-slate-800 text-white rounded text-sm focus:border-blue-500 transition-all outline-none" placeholder="Commander ID" onChange={e => setUsername(e.target.value)} />
          {view === 'signup' && <input className="w-full p-3 bg-black border border-slate-800 text-white rounded text-sm focus:border-blue-500 transition-all outline-none" placeholder="Email" onChange={e => setEmail(e.target.value)} />}
          <input className="w-full p-3 bg-black border border-slate-800 text-white rounded text-sm focus:border-blue-500 transition-all outline-none" type="password" placeholder="Access Code" onChange={e => setPassword(e.target.value)} />
          <button onClick={() => handleAuth(view === 'signup' ? 'signup' : 'login')} className="w-full py-3 bg-blue-600 text-white font-bold rounded uppercase text-xs tracking-widest hover:bg-blue-500 transition-all active:scale-95">
            {view === 'signup' ? 'Enroll' : 'Access Base'}
          </button>
          <button onClick={() => setView(view === 'signup' ? 'login' : 'signup')} className="w-full text-slate-500 text-[10px] font-bold uppercase hover:text-white transition-colors">
            {view === 'signup' ? 'Already Enrolled? Login' : 'New? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden font-sans">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg"><MapIcon className="w-5 h-5 text-blue-500" /></div>
          <span className="font-bold uppercase tracking-tight">@{username}</span>
        </div>
        <button onClick={() => { auth.signOut(); setView('landing'); }} className="text-[10px] font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors">Logout</button>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r border-slate-800 bg-slate-900/10 p-4">
           <div className="flex justify-between items-center mb-6 font-bold text-[10px] text-slate-500 uppercase tracking-widest">Tactical Maps <Plus className="w-4 h-4 text-blue-500 cursor-pointer" /></div>
           <div className="text-center py-12 opacity-20"><MapIcon className="w-8 h-8 mx-auto mb-2" /><p className="text-[8px] font-bold uppercase tracking-widest">No Maps Active</p></div>
        </aside>
        <main className="flex-1 flex items-center justify-center bg-slate-900/5">
           <div className="text-center p-12 border border-dashed border-slate-800 rounded-3xl opacity-30">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Workspace</p>
              <h3 className="text-white font-bold uppercase tracking-tighter">Awaiting Simulation Data</h3>
           </div>
        </main>
      </div>
    </div>
  );
}

