import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../entities/user/api/auth.service';
import { FamilyTreeStore } from '../../../entities/family-tree/model/family-tree.store';
import { FamilyTreeService } from '../../../entities/family-tree/api/family-tree.service';
import { UserService } from '../../../entities/user/api/user.service';
import { AppUser } from '../../../shared/types';
import { NavbarComponent } from '../../../widgets/navbar/navbar.component';
import { UserManagementComponent } from '../../../features/user-management/user-management.component';
@Component({
  selector: 'page-users-settings',
  standalone: true,
  imports: [RouterLink, NavbarComponent, UserManagementComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <widget-navbar />
      <main class="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div class="flex items-center gap-3 mb-8">
          <a [routerLink]="['/trees', treeId()]" class="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            ← Назад к древу
          </a>
        </div>
        <h1 class="text-2xl font-bold mb-2">Настройки участников</h1>
        <p class="text-[var(--color-muted-foreground)] mb-6">
          {{ treeStore.activeTree()?.name }}
        </p>

        @if (loading()) {
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        } @else {
          <feature-user-management
            #userMgmt
            [tree]="treeStore.activeTree()!"
            [members]="members()"
            [currentUserIsOwner]="isOwner()"
            (inviteMember)="onInvite($event)"
            (removeMember)="onRemove($event)"
          />
        }
      </main>
    </div>
  `,
})
export class UsersSettingsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private treeService = inject(FamilyTreeService);

  treeStore = inject(FamilyTreeStore);
  treeId = signal('');
  members = signal<AppUser[]>([]);
  loading = signal(true);

  isOwner = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.treeId.set(id);
    await this.treeStore.loadTree(id);

    const tree = this.treeStore.activeTree();
    const user = this.auth.currentUser();

    if (tree && user) {
      this.isOwner.set(tree.ownerId === user.uid);
      const memberProfiles = await Promise.all(
        tree.memberUids.map((uid) => this.userService.getUserById(uid))
      );
      this.members.set(memberProfiles.filter(Boolean) as AppUser[]);
    }
    this.loading.set(false);
  }

  async onInvite(email: string): Promise<void> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      alert(`Пользователь с email ${email} не найден. Попросите его сначала зарегистрироваться.`);
      return;
    }
    const tree = this.treeStore.activeTree();
    if (!tree) return;
    if (tree.memberUids.includes(user.uid)) {
      alert('Этот пользователь уже является участником');
      return;
    }
    await this.treeService.addMember(tree.id, user.uid);
    this.members.update((m) => [...m, user]);
    await this.treeStore.loadTree(tree.id);
  }

  async onRemove(uid: string): Promise<void> {
    if (!confirm('Удалить участника из древа?')) return;
    const tree = this.treeStore.activeTree();
    if (!tree) return;
    await this.treeService.removeMember(tree.id, uid);
    this.members.update((m) => m.filter((u) => u.uid !== uid));
    await this.treeStore.loadTree(tree.id);
  }
}
