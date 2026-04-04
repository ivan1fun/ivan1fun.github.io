# Настройка Firebase

## 1. Создайте Firebase проект

1. Перейдите на [console.firebase.google.com](https://console.firebase.google.com)
2. Создайте новый проект
3. Включите **Authentication** → Sign-in method → Email/Password
4. Включите **Firestore Database** → Create database (production mode)
5. Включите **Storage** (для фотографий)

## 2. Получите конфигурацию

1. Project Settings → Your apps → Web app → Add app
2. Скопируйте конфигурацию

## 3. Вставьте конфигурацию в проект

Откройте `src/app/shared/firebase/firebase.config.ts` и замените значения:

```ts
export const firebaseConfig = {
  apiKey: 'ВАШ_API_KEY',
  authDomain: 'ВАШ_PROJECT.firebaseapp.com',
  projectId: 'ВАШ_PROJECT_ID',
  storageBucket: 'ВАШ_PROJECT.appspot.com',
  messagingSenderId: 'ВАШ_SENDER_ID',
  appId: 'ВАШ_APP_ID',
};
```

## 4. Настройте правила Firestore

В консоли Firebase → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Trees: members can read, owner can write
    match /trees/{treeId} {
      allow read: if request.auth.uid in resource.data.memberUids;
      allow create: if request.auth.uid == request.resource.data.ownerId;
      allow update: if request.auth.uid == resource.data.ownerId;
      allow delete: if request.auth.uid == resource.data.ownerId;

      // Persons: tree members can read/write
      match /persons/{personId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/trees/$(treeId)).data.memberUids;
      }

      // Relationships: tree members can read/write
      match /relationships/{relId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/trees/$(treeId)).data.memberUids;
      }
    }
  }
}
```

## 5. Настройте правила Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trees/{treeId}/persons/{personId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Запустите локально

```bash
cd genealogy
npm start
```

## 7. Сборка и деплой на GitHub Pages

```bash
npx ng build --base-href /genealogy/
cp dist/genealogy/browser/index.html dist/genealogy/browser/404.html
```

Или просто запушьте на `main` — GitHub Actions автоматически задеплоит.
