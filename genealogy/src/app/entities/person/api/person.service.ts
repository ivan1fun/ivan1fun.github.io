import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '../../../shared/firebase/firebase.providers';
import { Person } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private db = getFirestore(firebaseApp);
  private storage = getStorage(firebaseApp);

  async getPersons(treeId: string): Promise<Person[]> {
    const snap = await getDocs(collection(this.db, `trees/${treeId}/persons`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Person));
  }

  async getPersonById(treeId: string, personId: string): Promise<Person | null> {
    const snap = await getDoc(doc(this.db, `trees/${treeId}/persons`, personId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Person;
  }

  async createPerson(treeId: string, data: Omit<Person, 'id' | 'treeId'>): Promise<Person> {
    const personData = { ...data, treeId };
    const ref2 = await addDoc(collection(this.db, `trees/${treeId}/persons`), personData);
    return { id: ref2.id, ...personData };
  }

  async updatePerson(treeId: string, personId: string, data: Partial<Person>): Promise<void> {
    await updateDoc(doc(this.db, `trees/${treeId}/persons`, personId), data);
  }

  async deletePerson(treeId: string, personId: string): Promise<void> {
    await deleteDoc(doc(this.db, `trees/${treeId}/persons`, personId));
  }

  async uploadPhoto(treeId: string, personId: string, file: File): Promise<string> {
    const storageRef = ref(this.storage, `trees/${treeId}/persons/${personId}/photo`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
