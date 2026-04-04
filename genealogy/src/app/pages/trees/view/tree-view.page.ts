import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../entities/user/api/auth.service';
import { FamilyTreeStore } from '../../../entities/family-tree/model/family-tree.store';
import { PersonStore } from '../../../entities/person/model/person.store';
import { RelationshipStore } from '../../../entities/relationship/model/relationship.store';
import { PersonService } from '../../../entities/person/api/person.service';
import { Person } from '../../../shared/types';
import { NavbarComponent } from '../../../widgets/navbar/navbar.component';
import { TreeCanvasComponent } from '../../../widgets/tree-canvas/tree-canvas.component';
import { PersonCardComponent } from '../../../widgets/person-card/person-card.component';
import { PersonFormComponent, PersonFormData } from '../../../features/person-form/person-form.component';
import { RelationshipFormComponent } from '../../../features/relationship-form/relationship-form.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { DialogComponent, DialogHeaderComponent, DialogTitleComponent } from '../../../shared/ui/dialog.component';

@Component({
  selector: 'page-tree-view',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    NavbarComponent, TreeCanvasComponent, PersonCardComponent,
    PersonFormComponent, RelationshipFormComponent,
    ButtonComponent,
    DialogComponent, DialogHeaderComponent, DialogTitleComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col">
      <widget-navbar />

      <div class="flex-1 flex flex-col">
        <!-- Toolbar -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]">
          <a routerLink="/trees" class="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            ← Все древа
          </a>
          <span class="text-[var(--color-border)]">/</span>
          <h1 class="font-semibold">{{ treeStore.activeTree()?.name ?? 'Загрузка...' }}</h1>

          <div class="ml-auto flex gap-2">
            <ui-button size="sm" variant="outline" (clicked)="showRelForm.set(true)" [disabled]="personStore.persons().length < 2">
              Добавить связь
            </ui-button>
            <ui-button size="sm" (clicked)="openAddPerson()">
              + Добавить человека
            </ui-button>
            <a [routerLink]="['/trees', treeId(), 'settings', 'users']">
              <ui-button size="sm" variant="ghost">⚙ Настройки</ui-button>
            </a>
          </div>
        </div>

        <!-- Main content -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Tree canvas -->
          <div class="flex-1 p-4" [class.pr-0]="!!selectedPerson()">
            <widget-tree-canvas
              [persons]="personStore.persons()"
              [relationships]="relStore.relationships()"
              [selectedPersonId]="selectedPerson()?.id ?? ''"
              (nodeClicked)="onNodeClick($event)"
              class="block h-full"
              style="height: calc(100vh - 130px)"
            />
          </div>

          <!-- Sidebar: selected person -->
          @if (selectedPerson()) {
            <div class="w-80 border-l border-[var(--color-border)] p-4 overflow-y-auto bg-[var(--color-background)]" style="height: calc(100vh - 130px)">
              <div class="flex justify-between items-start mb-4">
                <h3 class="font-semibold">Информация</h3>
                <button class="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] text-xl leading-none" (click)="selectedPerson.set(null)">×</button>
              </div>
              <widget-person-card
                [person]="selectedPerson()"
                (editPerson)="openEditPerson($event)"
                (deletePerson)="onDeletePerson($event)"
              />
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Add/Edit Person Dialog -->
    <ui-dialog [open]="showPersonForm()" (closed)="showPersonForm.set(false)">
      <ui-dialog-header>
        <ui-dialog-title>{{ editingPerson() ? 'Редактировать' : 'Добавить человека' }}</ui-dialog-title>
      </ui-dialog-header>
      <feature-person-form
        #personForm
        [person]="editingPerson()"
        [submitLabel]="editingPerson() ? 'Сохранить' : 'Добавить'"
        (submitted)="onPersonFormSubmit($event)"
        (cancelled)="showPersonForm.set(false)"
      />
    </ui-dialog>

    <!-- Relationship Dialog -->
    <ui-dialog [open]="showRelForm()" (closed)="showRelForm.set(false)">
      <ui-dialog-header>
        <ui-dialog-title>Добавить связь</ui-dialog-title>
      </ui-dialog-header>
      <feature-relationship-form
        [persons]="personStore.persons()"
        (submitted)="onRelFormSubmit($event)"
        (cancelled)="showRelForm.set(false)"
      />
    </ui-dialog>
  `,
})
export class TreeViewPage implements OnInit {
  @ViewChild('personForm') personFormRef!: PersonFormComponent;

  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private personService = inject(PersonService);

  treeStore = inject(FamilyTreeStore);
  personStore = inject(PersonStore);
  relStore = inject(RelationshipStore);

  treeId = signal('');
  selectedPerson = signal<Person | null>(null);
  showPersonForm = signal(false);
  showRelForm = signal(false);
  editingPerson = signal<Person | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.treeId.set(id);
    await Promise.all([
      this.treeStore.loadTree(id),
      this.personStore.loadPersons(id),
      this.relStore.loadRelationships(id),
    ]);
  }

  onNodeClick(person: Person): void {
    this.selectedPerson.set(person);
  }

  openAddPerson(): void {
    this.editingPerson.set(null);
    this.showPersonForm.set(true);
  }

  openEditPerson(person: Person): void {
    this.editingPerson.set(person);
    this.showPersonForm.set(true);
  }

  async onPersonFormSubmit(data: PersonFormData): Promise<void> {
    this.personFormRef?.setLoading(true);
    try {
      const treeId = this.treeId();
      const { photoFile, ...rest } = data;
      const personData = {
        firstName: rest.firstName,
        lastName: rest.lastName,
        sex: rest.sex,
        birthDate: rest.birthDate || undefined,
        deathDate: rest.deathDate || undefined,
        birthPlace: rest.birthPlace || undefined,
        deathPlace: rest.deathPlace || undefined,
        bio: rest.bio || undefined,
      };

      if (this.editingPerson()) {
        const personId = this.editingPerson()!.id;
        let photoURL = this.editingPerson()!.photoURL;
        if (photoFile) {
          photoURL = await this.personService.uploadPhoto(treeId, personId, photoFile);
        }
        await this.personStore.updatePerson(treeId, personId, { ...personData, photoURL });
      } else {
        const newPerson = await this.personStore.createPerson(treeId, personData);
        if (photoFile) {
          const photoURL = await this.personService.uploadPhoto(treeId, newPerson.id, photoFile);
          await this.personStore.updatePerson(treeId, newPerson.id, { photoURL });
        }
      }
      this.showPersonForm.set(false);
      this.editingPerson.set(null);
    } catch (e) {
      this.personFormRef?.setError('Ошибка сохранения. Попробуйте снова.');
    } finally {
      this.personFormRef?.setLoading(false);
    }
  }

  async onDeletePerson(personId: string): Promise<void> {
    if (!confirm('Удалить этого человека?')) return;
    await this.personStore.deletePerson(this.treeId(), personId);
    this.selectedPerson.set(null);
  }

  async onRelFormSubmit(data: { personAId: string; personBId: string; type: any }): Promise<void> {
    await this.relStore.createRelationship(this.treeId(), data.type, data.personAId, data.personBId);
    this.showRelForm.set(false);
  }
}
