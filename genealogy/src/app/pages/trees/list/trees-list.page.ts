import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../entities/user/api/auth.service';
import { FamilyTreeStore } from '../../../entities/family-tree/model/family-tree.store';
import { FamilyTree } from '../../../shared/types';
import { NavbarComponent } from '../../../widgets/navbar/navbar.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { InputComponent } from '../../../shared/ui/input.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/ui/card.component';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogFooterComponent } from '../../../shared/ui/dialog.component';
import { LabelComponent } from '../../../shared/ui/label.component';

@Component({
  selector: 'page-trees-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    NavbarComponent, ButtonComponent, InputComponent, LabelComponent,
    CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent,
    DialogComponent, DialogHeaderComponent, DialogTitleComponent, DialogFooterComponent,
    DatePipe,
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <widget-navbar />

      <main class="flex-1 container mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold">Мои древа</h1>
            <p class="text-[var(--color-muted-foreground)] mt-1">Управляйте своими генеалогическими деревьями</p>
          </div>
          <ui-button (clicked)="showCreateDialog.set(true)">
            + Новое древо
          </ui-button>
        </div>

        @if (treeStore.loading()) {
          <div class="flex justify-center py-16">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        } @else if (treeStore.trees().length === 0) {
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <span class="text-6xl mb-4">🌳</span>
            <h2 class="text-xl font-semibold mb-2">Нет деревьев</h2>
            <p class="text-[var(--color-muted-foreground)] mb-6">Создайте первое генеалогическое древо</p>
            <ui-button (clicked)="showCreateDialog.set(true)">Создать древо</ui-button>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (tree of treeStore.trees(); track tree.id) {
              <a [routerLink]="['/trees', tree.id]" class="block group">
                <ui-card class="hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                  <ui-card-header>
                    <ui-card-title class="group-hover:text-[var(--color-primary)] transition-colors">
                      {{ tree.name }}
                    </ui-card-title>
                    <ui-card-description>
                      {{ tree.memberUids.length }} участник{{ tree.memberUids.length > 1 ? 'а' : '' }}
                    </ui-card-description>
                  </ui-card-header>
                  <ui-card-content>
                    <p class="text-xs text-[var(--color-muted-foreground)]">
                      Создано: {{ tree.createdAt | date:'dd.MM.yyyy' }}
                    </p>
                  </ui-card-content>
                </ui-card>
              </a>
            }
          </div>
        }
      </main>
    </div>

    <!-- Create Tree Dialog -->
    <ui-dialog [open]="showCreateDialog()" (closed)="showCreateDialog.set(false)">
      <ui-dialog-header>
        <ui-dialog-title>Новое генеалогическое древо</ui-dialog-title>
      </ui-dialog-header>
      <div class="space-y-2">
        <ui-label for="treeName">Название</ui-label>
        <ui-input id="treeName" placeholder="Например: Семья Ивановых" [(ngModel)]="newTreeName" name="treeName" />
      </div>
      <ui-dialog-footer>
        <ui-button variant="outline" (clicked)="showCreateDialog.set(false)">Отмена</ui-button>
        <ui-button (clicked)="onCreate()" [disabled]="!newTreeName">Создать</ui-button>
      </ui-dialog-footer>
    </ui-dialog>
  `,
})
export class TreesListPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  treeStore = inject(FamilyTreeStore);

  showCreateDialog = signal(false);
  newTreeName = '';

  async ngOnInit(): Promise<void> {
    const user = this.auth.currentUser();
    if (user) {
      await this.treeStore.loadTrees(user.uid);
    }
  }

  async onCreate(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user || !this.newTreeName) return;
    const tree = await this.treeStore.createTree(this.newTreeName, user.uid);
    this.newTreeName = '';
    this.showCreateDialog.set(false);
    this.router.navigate(['/trees', tree.id]);
  }
}
