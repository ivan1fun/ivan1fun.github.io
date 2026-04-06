import { Injectable } from '@angular/core';
import { pb } from '../../../shared/pocketbase/pocketbase.client';
import { FamilyTree } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class FamilyTreeService {
  async getTreesForUser(uid: string): Promise<FamilyTree[]> {
    const records = await pb.collection('trees').getFullList({
      filter: `members ~ "${uid}"`,
      sort: '-created',
    });
    return records.map(this.mapRecord);
  }

  async getTreeById(id: string): Promise<FamilyTree | null> {
    try {
      const record = await pb.collection('trees').getOne(id);
      return this.mapRecord(record);
    } catch {
      return null;
    }
  }

  async createTree(name: string, ownerId: string): Promise<FamilyTree> {
    const record = await pb.collection('trees').create({
      name,
      owner: ownerId,
      members: [ownerId],
    });
    return this.mapRecord(record);
  }

  async updateTree(id: string, updates: Partial<Pick<FamilyTree, 'name'>>): Promise<void> {
    await pb.collection('trees').update(id, updates);
  }

  async deleteTree(id: string): Promise<void> {
    await pb.collection('trees').delete(id);
  }

  async addMember(treeId: string, uid: string): Promise<void> {
    const tree = await pb.collection('trees').getOne(treeId);
    const members: string[] = tree['members'] ?? [];
    if (!members.includes(uid)) {
      await pb.collection('trees').update(treeId, {
        members: [...members, uid],
      });
    }
  }

  async removeMember(treeId: string, uid: string): Promise<void> {
    const tree = await pb.collection('trees').getOne(treeId);
    const members: string[] = (tree['members'] ?? []).filter((m: string) => m !== uid);
    await pb.collection('trees').update(treeId, { members });
  }

  private mapRecord(record: any): FamilyTree {
    return {
      id: record.id,
      name: record.name,
      ownerId: record.owner,
      memberUids: record.members ?? [],
      createdAt: record.created,
      updatedAt: record.updated,
    };
  }
}
