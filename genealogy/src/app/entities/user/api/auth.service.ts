import { Injectable, signal } from '@angular/core';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../../../shared/firebase/firebase.providers';
import { AppUser } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = getAuth(firebaseApp);
  private db = getFirestore(firebaseApp);

  currentUser = signal<AppUser | null>(null);
  loading = signal(true);

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        const appUser = await this.fetchUserProfile(user);
        this.currentUser.set(appUser);
      } else {
        this.currentUser.set(null);
      }
      this.loading.set(false);
    });
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await updateProfile(cred.user, { displayName });

    const appUser: AppUser = {
      uid: cred.user.uid,
      email,
      displayName,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(this.db, 'users', cred.user.uid), appUser);
    this.currentUser.set(appUser);
  }

  async login(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    const appUser = await this.fetchUserProfile(cred.user);
    this.currentUser.set(appUser);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser.set(null);
  }

  private async fetchUserProfile(user: User): Promise<AppUser> {
    const snap = await getDoc(doc(this.db, 'users', user.uid));
    if (snap.exists()) {
      return snap.data() as AppUser;
    }
    const appUser: AppUser = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? undefined,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(this.db, 'users', user.uid), appUser);
    return appUser;
  }
}
