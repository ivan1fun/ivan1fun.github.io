import { Injectable, signal, effect } from '@angular/core';
import { pb } from '../../../shared/pocketbase/pocketbase.client';
import { AppUser } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AppUser | null>(this.mapUser());

  constructor() {
    // Sync signal whenever PocketBase auth state changes
    pb.authStore.onChange(() => {
      this.currentUser.set(this.mapUser());
    });
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name: displayName,
    });
    await this.login(email, password);
  }

  async login(email: string, password: string): Promise<void> {
    await pb.collection('users').authWithPassword(email, password);
    this.currentUser.set(this.mapUser());
  }

  async logout(): Promise<void> {
    pb.authStore.clear();
    this.currentUser.set(null);
  }

  private mapUser(): AppUser | null {
    const model = pb.authStore.record;
    if (!model) return null;
    return {
      uid: model['id'],
      email: model['email'] ?? '',
      displayName: model['name'] ?? model['email'] ?? '',
      photoURL: model['avatar']
        ? pb.files.getURL(model, model['avatar'])
        : undefined,
      role: 'owner',
      createdAt: model['created'] ?? new Date().toISOString(),
    };
  }
}
