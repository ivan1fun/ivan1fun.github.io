export type UserRole = 'owner' | 'member';
export type Sex = 'male' | 'female' | 'other';
export type RelationshipType = 'parent-child' | 'spouse';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface FamilyTree {
  id: string;
  name: string;
  ownerId: string;
  memberUids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  treeId: string;
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  bio?: string;
  photoURL?: string;
}

export interface Relationship {
  id: string;
  treeId: string;
  type: RelationshipType;
  personAId: string;
  personBId: string;
}
