import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button.component';
import { LabelComponent } from '../../shared/ui/label.component';
import { SelectComponent, SelectOption } from '../../shared/ui/select.component';
import { Person, RelationshipType } from '../../shared/types';

export interface RelationshipFormData {
  personAId: string;
  personBId: string;
  type: RelationshipType;
}

@Component({
  selector: 'feature-relationship-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, LabelComponent, SelectComponent],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="space-y-2">
        <ui-label>Первый человек</ui-label>
        <ui-select [options]="personOptions()" [(ngModel)]="personAId" name="personAId" />
      </div>
      <div class="space-y-2">
        <ui-label>Тип связи</ui-label>
        <ui-select [options]="typeOptions" [(ngModel)]="type" name="type" />
      </div>
      <div class="space-y-2">
        <ui-label>{{ type === 'parent-child' ? 'Ребёнок' : 'Супруг(а)' }}</ui-label>
        <ui-select [options]="personOptions()" [(ngModel)]="personBId" name="personBId" />
      </div>
      @if (error()) {
        <p class="text-sm text-[var(--color-destructive)]">{{ error() }}</p>
      }
      <div class="flex justify-end gap-2">
        <ui-button type="button" variant="outline" (clicked)="cancelled.emit()">Отмена</ui-button>
        <ui-button type="submit">Создать связь</ui-button>
      </div>
    </form>
  `,
})
export class RelationshipFormComponent {
  persons = input<Person[]>([]);
  submitted = output<RelationshipFormData>();
  cancelled = output<void>();

  personAId = '';
  personBId = '';
  type: RelationshipType = 'parent-child';
  error = signal('');

  typeOptions: SelectOption[] = [
    { value: 'parent-child', label: 'Родитель → Ребёнок' },
    { value: 'spouse', label: 'Супруги' },
  ];

  personOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— Выберите —' },
    ...this.persons().map((p) => ({
      value: p.id,
      label: `${p.firstName} ${p.lastName}`,
    })),
  ]);

  onSubmit(): void {
    if (!this.personAId || !this.personBId) {
      this.error.set('Выберите обоих людей');
      return;
    }
    if (this.personAId === this.personBId) {
      this.error.set('Нельзя связать человека с самим собой');
      return;
    }
    this.error.set('');
    this.submitted.emit({ personAId: this.personAId, personBId: this.personBId, type: this.type });
  }
}
