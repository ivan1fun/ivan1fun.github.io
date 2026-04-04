import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../entities/user/api/auth.service';
import { FamilyTreeService } from '../../entities/family-tree/api/family-tree.service';

export const treeAccessGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const treeService = inject(FamilyTreeService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (!user) return router.createUrlTree(['/auth/login']);

  const treeId = route.paramMap.get('id');
  if (!treeId) return router.createUrlTree(['/trees']);

  const tree = await treeService.getTreeById(treeId);
  if (!tree) return router.createUrlTree(['/trees']);

  const hasAccess = tree.ownerId === user.uid || tree.memberUids.includes(user.uid);
  if (!hasAccess) return router.createUrlTree(['/trees']);

  return true;
};
