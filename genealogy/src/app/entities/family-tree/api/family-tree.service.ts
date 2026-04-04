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
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseApp } from '../../../shared/firebase/firebase.providers';
import { FamilyTree } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class FamilyTreeService {
  private db = getFirestore(firebaseApp);

  async getTreesForUser(uid: string): Promise<FamilyTree[]> {
    const q = query(
      collection(this.db, 'trees'),
      where('memberUids', 'array-contains', uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyTree));
  }

  async getTreeById(id: string): Promise<FamilyTree | null> {
    const snap = await getDoc(doc(this.db, 'trees', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as FamilyTree;
  }

  async createTree(name: string, ownerId: string): Promise<FamilyTree> {
    const data = {
      name,
      ownerId,
      memberUids: [ownerId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(this.db, 'trees'), data);
    return { id: ref.id, ...data };
  }

  async updateTree(id: string, updates: Partial<Pick<FamilyTree, 'name'>>): Promise<void> {
    await updateDoc(doc(this.db, 'trees', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  async deleteTree(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'trees', id));
  }

  async addMember(treeId: string, uid: string): Promise<void> {
    await updateDoc(doc(this.db, 'trees', treeId), {
      memberUids: arrayUnion(uid),
      updatedAt: new Date().toISOString(),
    });
  }

  async removeMember(treeId: string, uid: string): Promise<void> {
    await updateDoc(doc(this.db, 'trees', treeId), {
      memberUids: arrayRemove(uid),
      updatedAt: new Date().toISOString(),
    });
  }
}
