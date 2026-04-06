import { Injectable } from '@angular/core';
import { pb } from '../../../shared/pocketbase/pocketbase.client';
import { Person } from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class PersonService {
  async getPersons(treeId: string): Promise<Person[]> {
    const records = await pb.collection('persons').getFullList({
      filter: `tree = "${treeId}"`,
      sort: 'lastName,firstName',
    });
    return records.map((r) => this.mapRecord(r));
  }

  async getPersonById(treeId: string, personId: string): Promise<Person | null> {
    try {
      const record = await pb.collection('persons').getOne(personId);
      return this.mapRecord(record);
    } catch {
      return null;
    }
  }

  async createPerson(treeId: string, data: Omit<Person, 'id' | 'treeId'>): Promise<Person> {
    const record = await pb.collection('persons').create({
      tree: treeId,
      firstName: data.firstName,
      lastName: data.lastName,
      sex: data.sex,
      birthDate: data.birthDate ?? '',
      deathDate: data.deathDate ?? '',
      birthPlace: data.birthPlace ?? '',
      deathPlace: data.deathPlace ?? '',
      bio: data.bio ?? '',
    });
    return this.mapRecord(record);
  }

  async updatePerson(treeId: string, personId: string, data: Partial<Person>): Promise<void> {
    const payload: Record<string, any> = { ...data };
    delete payload['id'];
    delete payload['treeId'];
    await pb.collection('persons').update(personId, payload);
  }

  async deletePerson(treeId: string, personId: string): Promise<void> {
    await pb.collection('persons').delete(personId);
  }

  private mapRecord(record: any): Person {
    return {
      id: record.id,
      treeId: record.tree,
      firstName: record.firstName,
      lastName: record.lastName,
      sex: record.sex,
      birthDate: record.birthDate || undefined,
      deathDate: record.deathDate || undefined,
      birthPlace: record.birthPlace || undefined,
      deathPlace: record.deathPlace || undefined,
      bio: record.bio || undefined,
      photoURL: record.photo ? pb.files.getURL(record, record.photo) : undefined,
    };
  }

  async uploadPhoto(treeId: string, personId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);
    const record = await pb.collection('persons').update(personId, formData);
    return record['photo']
      ? pb.files.getURL(record, record['photo'])
      : '';
  }
}
