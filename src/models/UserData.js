import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';

export const userDataModel = {
  async fetchMaps(username) {
    const mapRef = doc(db, 'artifacts', appId, 'public', 'data', 'user_maps', username);
    const snap = await getDoc(mapRef);
    return snap.exists() ? snap.data().maps : [];
  },

  async saveMaps(username, mapsArray) {
    const mapRef = doc(db, 'artifacts', appId, 'public', 'data', 'user_maps', username);
    await setDoc(mapRef, { maps: mapsArray });
  }
};
