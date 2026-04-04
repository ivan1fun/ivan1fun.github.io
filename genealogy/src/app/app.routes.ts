import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { treeAccessGuard } from './shared/guards/tree-access.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/trees', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'trees',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/trees/list/trees-list.page').then((m) => m.TreesListPage),
      },
      {
        path: ':id',
        canActivate: [treeAccessGuard],
        loadComponent: () =>
          import('./pages/trees/view/tree-view.page').then((m) => m.TreeViewPage),
      },
      {
        path: ':id/settings/users',
        canActivate: [treeAccessGuard],
        loadComponent: () =>
          import('./pages/settings/users/users-settings.page').then((m) => m.UsersSettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: '/trees' },
];
