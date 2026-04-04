import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';

export let firebaseApp = initializeApp(firebaseConfig);

export function provideFirebase(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
