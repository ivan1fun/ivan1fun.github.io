import { Injectable, signal, computed } from '@angular/core';
import { FamilyTree } from '../../../shared/types';
import { FamilyTreeService } from '../api/family-tree.service';

@Injectable({ providedIn: 'root' })
export class FamilyTreeStore {
  private _trees = signal<FamilyTree[]>([]);
  private _loading = signal(false);
  private _activeTree = signal<FamilyTree | null>(null);

  trees = this._trees.asReadonly();
  loading = this._loading.asReadonly();
  activeTree = this._activeTree.asReadonly();

  constructor(private service: FamilyTreeService) {}

  async loadTrees(uid: string): Promise<void> {
    this._loading.set(true);
    try {
      const trees = await this.service.getTreesForUser(uid);
      this._trees.set(trees);
    } finally {
      this._loading.set(false);
    }
  }

  async loadTree(id: string): Promise<void> {
    this._loading.set(true);
    try {
      const tree = await this.service.getTreeById(id);
      this._activeTree.set(tree);
    } finally {
      this._loading.set(false);
    }
  }

  async createTree(name: string, ownerId: string): Promise<FamilyTree> {
    const tree = await this.service.createTree(name, ownerId);
    this._trees.update((t) => [...t, tree]);
    return tree;
  }

  async updateTree(id: string, name: string): Promise<void> {
    await this.service.updateTree(id, { name });
    this._trees.update((ts) =>
      ts.map((t) => (t.id === id ? { ...t, name } : t))
    );
    if (this._activeTree()?.id === id) {
      this._activeTree.update((t) => (t ? { ...t, name } : null));
    }
  }

  async deleteTree(id: string): Promise<void> {
    await this.service.deleteTree(id);
    this._trees.update((ts) => ts.filter((t) => t.id !== id));
    if (this._activeTree()?.id === id) this._activeTree.set(null);
  }

  setActiveTree(tree: FamilyTree | null): void {
    this._activeTree.set(tree);
  }
}
