import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { firebaseApp } from '../../../shared/firebase/firebase.providers';
import { Relationship, RelationshipType } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class RelationshipService {
  private db = getFirestore(firebaseApp);

  async getRelationships(treeId: string): Promise<Relationship[]> {
    const snap = await getDocs(collection(this.db, `trees/${treeId}/relationships`));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Relationship));
  }

  async createRelationship(
    treeId: string,
    type: RelationshipType,
    personAId: string,
    personBId: string
  ): Promise<Relationship> {
    const data = { treeId, type, personAId, personBId };
    const ref = await addDoc(collection(this.db, `trees/${treeId}/relationships`), data);
    return { id: ref.id, ...data };
  }

  async deleteRelationship(treeId: string, relId: string): Promise<void> {
    await deleteDoc(doc(this.db, `trees/${treeId}/relationships`, relId));
  }
}
