import { Injectable } from '@angular/core';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { firebaseApp } from '../../../shared/firebase/firebase.providers';
import { AppUser } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private db = getFirestore(firebaseApp);

  async getUserById(uid: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(this.db, 'users', uid));
    return snap.exists() ? (snap.data() as AppUser) : null;
  }

  async getUserByEmail(email: string): Promise<AppUser | null> {
    const q = query(collection(this.db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AppUser;
  }
}
