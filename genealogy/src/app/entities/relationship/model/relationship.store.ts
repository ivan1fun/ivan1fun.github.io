import { Injectable, signal } from '@angular/core';
import { Relationship, RelationshipType } from '../../../shared/types';
import { RelationshipService } from '../api/relationship.service';

@Injectable({ providedIn: 'root' })
export class RelationshipStore {
  private _relationships = signal<Relationship[]>([]);

  relationships = this._relationships.asReadonly();

  constructor(private service: RelationshipService) {}

  async loadRelationships(treeId: string): Promise<void> {
    const rels = await this.service.getRelationships(treeId);
    this._relationships.set(rels);
  }

  async createRelationship(
    treeId: string,
    type: RelationshipType,
    personAId: string,
    personBId: string
  ): Promise<void> {
    const rel = await this.service.createRelationship(treeId, type, personAId, personBId);
    this._relationships.update((rs) => [...rs, rel]);
  }

  async deleteRelationship(treeId: string, relId: string): Promise<void> {
    await this.service.deleteRelationship(treeId, relId);
    this._relationships.update((rs) => rs.filter((r) => r.id !== relId));
  }

  clear(): void {
    this._relationships.set([]);
  }
}
