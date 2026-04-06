import { Injectable } from '@angular/core';
import { pb } from '../../../shared/pocketbase/pocketbase.client';
import { AppUser } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class UserService {
  async getUserById(uid: string): Promise<AppUser | null> {
    try {
      const record = await pb.collection('users').getOne(uid);
      return this.mapRecord(record);
    } catch {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<AppUser | null> {
    try {
      const result = await pb.collection('users').getFirstListItem(
        `email = "${email}"`
      );
      return this.mapRecord(result);
    } catch {
      return null;
    }
  }

  private mapRecord(record: any): AppUser {
    return {
      uid: record.id,
      email: record.email ?? '',
      displayName: record.name ?? record.email ?? '',
      photoURL: record.avatar
        ? pb.files.getURL(record, record.avatar)
        : undefined,
      role: 'owner',
      createdAt: record.created ?? new Date().toISOString(),
    };
  }
}
