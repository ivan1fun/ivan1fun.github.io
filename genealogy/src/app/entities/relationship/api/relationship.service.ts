import { Injectable } from '@angular/core';
import { pb } from '../../../shared/pocketbase/pocketbase.client';
import { Relationship, RelationshipType } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class RelationshipService {
  async getRelationships(treeId: string): Promise<Relationship[]> {
    const records = await pb.collection('relationships').getFullList({
      filter: `tree = "${treeId}"`,
    });
    return records.map(this.mapRecord);
  }

  async createRelationship(
    treeId: string,
    type: RelationshipType,
    personAId: string,
    personBId: string
  ): Promise<Relationship> {
    const record = await pb.collection('relationships').create({
      tree: treeId,
      type,
      personA: personAId,
      personB: personBId,
    });
    return this.mapRecord(record);
  }

  async deleteRelationship(treeId: string, relId: string): Promise<void> {
    await pb.collection('relationships').delete(relId);
  }

  private mapRecord(record: any): Relationship {
    return {
      id: record.id,
      treeId: record.tree,
      type: record.type as RelationshipType,
      personAId: record.personA,
      personBId: record.personB,
    };
  }
}
