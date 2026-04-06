# CLAUDE.md

Проект: `ivan1fun/ivan1fun.github.io` — GitHub Pages сайт с несколькими под-приложениями.

---

## Структура репозитория

```
/                          # Корень — vanilla JS GitHub Pages сайт
├── index.html             # Главная страница
├── game/                  # Под-проект (игра)
├── ottergram/             # Под-проект
├── genealogy/             # Angular 21 приложение — ОСНОВНОЙ ПРОЕКТ
└── .github/workflows/
    └── deploy-genealogy.yml
```

---

## Genealogy App

**URL:** `https://ivan1fun.github.io/genealogy/`  
**Ветка разработки:** `claude/genealogy-tree-service-ldwfR`

### Стек

- **Angular 21** — standalone components, Signals, `withHashLocation()`
- **TailwindCSS v4** — `@import "tailwindcss"` в `styles.css`, конфиг в `.postcssrc.json`
- **PocketBase** — самохостинг на `https://api.ibrstv.ru` (Traefik + Let's Encrypt)
- **FSD (Feature-Sliced Design)** — 5 слоёв: `pages → widgets → features → entities → shared`

### Команды

```bash
# Всегда из папки genealogy/
cd genealogy

npm start                          # dev сервер на :4200
npx ng build --base-href /genealogy/   # production сборка (ОБЯЗАТЕЛЬНО с base-href)
```

### Деплой

Push в `master` → GitHub Actions собирает и пушит в ветку `gh-pages`.  
Деплой срабатывает только если изменились файлы в `genealogy/**`.

```bash
# Рабочий процесс: разрабатываем на feature-ветке, мержим в master
git checkout claude/genealogy-tree-service-ldwfR
# ... изменения ...
git push origin claude/genealogy-tree-service-ldwfR

git checkout master
git merge claude/genealogy-tree-service-ldwfR
git push origin master            # ← триггерит GitHub Actions

git checkout claude/genealogy-tree-service-ldwfR
```

### npm install

Всегда использовать `--legacy-peer-deps`:
```bash
npm install <package> --legacy-peer-deps
```

---

## FSD архитектура (`genealogy/src/app/`)

```
pages/
  auth/login/            LoginPage
  auth/register/         RegisterPage
  trees/list/            TreesListPage
  trees/view/            TreeViewPage  ← главная страница с деревом
  settings/users/        UsersSettingsPage

widgets/
  navbar/                Верхняя навигация
  tree-canvas/           SVG визуализация дерева (pan/zoom)
  person-card/           Боковая карточка выбранного человека

features/
  auth/login-form/       Форма входа
  auth/register-form/    Форма регистрации
  person-form/           Добавление/редактирование человека
  relationship-form/     Создание связи между людьми
  user-management/       Управление участниками дерева

entities/
  user/api/auth.service.ts        PocketBase auth (signals)
  user/api/user.service.ts        Поиск пользователей
  family-tree/api/family-tree.service.ts
  family-tree/model/family-tree.store.ts
  family-tree/model/tree-graph.adapter.ts  (не используется, есть встроенный layout)
  person/api/person.service.ts    CRUD + загрузка фото
  person/model/person.store.ts
  relationship/api/relationship.service.ts
  relationship/model/relationship.store.ts

shared/
  pocketbase/pocketbase.client.ts  ← синглтон pb
  ui/                              Кастомные shadcn-inspired компоненты
    button, input, card, dialog, avatar, badge, select, textarea, label
  guards/auth.guard.ts
  guards/tree-access.guard.ts
  types/index.ts                   Все типы (Person, Relationship, etc.)
```

---

## PocketBase

**API:** `https://api.ibrstv.ru`  
**Admin:** `https://api.ibrstv.ru/_/` (ivan1berestov@gmail.com)  
**Запущен:** на сервере `194.87.151.177` как systemd-сервис  
**Traefik** проксирует 443→8090 через Docker (хост `172.19.0.1:8090`)

### Коллекции

| Коллекция     | Описание                              |
|---------------|---------------------------------------|
| `users`       | Встроенная auth коллекция PocketBase  |
| `trees`       | Генеалогические деревья               |
| `persons`     | Люди в дереве (с фото)                |
| `relationships` | Связи: `parent-child` / `spouse`    |

### Клиент (`shared/pocketbase/pocketbase.client.ts`)

```ts
import PocketBase from 'pocketbase';
export const pb = new PocketBase('https://api.ibrstv.ru');
pb.autoCancellation(false);
```

---

## UI компоненты (`shared/ui/`)

Самописные компоненты, вдохновлённые shadcn/ui. **Не используй сторонние UI-библиотеки** — `@ngzard/ui` задеприкейтилась, Firebase/AngularFire убраны в пользу PocketBase.

| Компонент          | Selector          |
|--------------------|-------------------|
| ButtonComponent    | `<ui-button>`     |
| InputComponent     | `<ui-input>`      |
| SelectComponent    | `<ui-select>`     |
| TextareaComponent  | `<ui-textarea>`   |
| CardComponent      | `<ui-card>`       |
| DialogComponent    | `<ui-dialog>`     |
| AvatarComponent    | `<ui-avatar>`     |
| BadgeComponent     | `<ui-badge>`      |
| LabelComponent     | `<ui-label>`      |

---

## TailwindCSS v4

**Конфиг:** `genealogy/.postcssrc.json` (не `postcss.config.mjs` — Angular CLI его не видит)

```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

**Стили:** `genealogy/src/styles.css` — использует `@import "tailwindcss"` и `@theme {}` для токенов.  
**НЕТ** `tailwind.config.js` — в v4 конфигурация через CSS.

### CSS-переменные (токены)

```css
--color-primary       /* oklch(55.8% 0.288 264.05) — синий */
--color-destructive   /* oklch(57.7% 0.245 27.33) — красный */
--color-border
--color-background
--color-muted
--color-muted-foreground
```

---

## Tree Canvas (`widgets/tree-canvas/`)

SVG-визуализация с кастомным layout-алгоритмом:

- **Генерационный layout**: BFS от корней, супруги рядом, дети ниже
- **Ребра супругов**: пунктирная горизонтальная линия между узлами
- **Ребра родитель-ребёнок**: вертикальная линия от **середины** линии супругов вниз к ребёнку
- **Несколько детей**: стебель → горизонтальная перемычка → вертикальные капли
- Pan/Zoom: колесо мыши + drag
- Нет внешних зависимостей для layout (ngx-graph установлен, но не используется)

---

## Типы данных (`shared/types/index.ts`)

```ts
type RelationshipType = 'parent-child' | 'spouse';
// В parent-child: personAId = родитель, personBId = ребёнок

interface Person { id, treeId, firstName, lastName, sex, birthDate?, deathDate?,
                   birthPlace?, deathPlace?, bio?, photoURL? }
interface Relationship { id, treeId, type, personAId, personBId }
interface FamilyTree { id, name, ownerId, memberUids[], createdAt, updatedAt }
```

---

## Angular-специфика

- **Zoneless**: `provideExperimentalZonelessChangeDetection()` НЕ используется — стандартный zone.js
- **Standalone components**: везде `standalone: true`
- **Signal inputs**: `input<T>()` вместо `@Input()`
- **Effects**: использовать `effect()` в конструкторе для реакции на signal inputs (не `ngOnInit`)
- **Guards**: функциональные (`export const authGuard = () => ...`)
- **Routing**: `withHashLocation()` обязателен для GitHub Pages

---

## Известные ограничения

- `@angular/fire` и Firebase **убраны** — используется только PocketBase
- `@swimlane/ngx-graph` установлен, но **не используется** в tree-canvas (кастомный SVG layout)
- При добавлении пакетов всегда `--legacy-peer-deps` из-за peer-конфликтов
- `angular.json` содержит `"fonts": { "inline": false }` — Google Fonts не инлайнятся (403 в CI)
