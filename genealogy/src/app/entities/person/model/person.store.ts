import { Injectable, signal } from '@angular/core';
import { Person } from '../../../shared/types';
import { PersonService } from '../api/person.service';

@Injectable({ providedIn: 'root' })
export class PersonStore {
  private _persons = signal<Person[]>([]);
  private _loading = signal(false);
  private _activePerson = signal<Person | null>(null);

  persons = this._persons.asReadonly();
  loading = this._loading.asReadonly();
  activePerson = this._activePerson.asReadonly();

  constructor(private service: PersonService) {}

  async loadPersons(treeId: string): Promise<void> {
    this._loading.set(true);
    try {
      const persons = await this.service.getPersons(treeId);
      this._persons.set(persons);
    } finally {
      this._loading.set(false);
    }
  }

  async loadPerson(treeId: string, personId: string): Promise<void> {
    const person = await this.service.getPersonById(treeId, personId);
    this._activePerson.set(person);
  }

  async createPerson(treeId: string, data: Omit<Person, 'id' | 'treeId'>): Promise<Person> {
    const person = await this.service.createPerson(treeId, data);
    this._persons.update((ps) => [...ps, person]);
    return person;
  }

  async updatePerson(treeId: string, personId: string, data: Partial<Person>): Promise<void> {
    await this.service.updatePerson(treeId, personId, data);
    this._persons.update((ps) =>
      ps.map((p) => (p.id === personId ? { ...p, ...data } : p))
    );
    if (this._activePerson()?.id === personId) {
      this._activePerson.update((p) => (p ? { ...p, ...data } : null));
    }
  }

  async deletePerson(treeId: string, personId: string): Promise<void> {
    await this.service.deletePerson(treeId, personId);
    this._persons.update((ps) => ps.filter((p) => p.id !== personId));
    if (this._activePerson()?.id === personId) this._activePerson.set(null);
  }

  setActivePerson(person: Person | null): void {
    this._activePerson.set(person);
  }

  clear(): void {
    this._persons.set([]);
    this._activePerson.set(null);
  }
}
