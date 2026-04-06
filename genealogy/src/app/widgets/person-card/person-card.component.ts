import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Person } from '../../shared/types';
import { ButtonComponent } from '../../shared/ui/button.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { AvatarComponent } from '../../shared/ui/avatar.component';

@Component({
  selector: 'widget-person-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, AvatarComponent, DatePipe],
  template: `
    @if (person()) {
      <div class="flex flex-col h-full">
        <div class="flex items-center gap-4 mb-6">
          <ui-avatar
            [src]="person()!.photoURL ?? ''"
            [initials]="(person()!.firstName[0] || '') + (person()!.lastName[0] || '')"
            class="[&>div]:h-16 [&>div]:w-16 [&>div]:text-xl"
          />
          <div>
            <h2 class="text-xl font-semibold">{{ person()!.firstName }} {{ person()!.lastName }}</h2>
            <ui-badge [variant]="person()!.sex === 'male' ? 'default' : 'secondary'">
              {{ sexLabel() }}
            </ui-badge>
          </div>
        </div>

        <div class="space-y-3 flex-1 overflow-y-auto">
          @if (person()!.birthDate) {
            <div>
              <p class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Дата рождения</p>
              <p class="text-sm">{{ person()!.birthDate | date:'longDate':'':'ru' }}</p>
            </div>
          }
          @if (person()!.birthPlace) {
            <div>
              <p class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Место рождения</p>
              <p class="text-sm">{{ person()!.birthPlace }}</p>
            </div>
          }
          @if (person()!.deathDate) {
            <div>
              <p class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Дата смерти</p>
              <p class="text-sm">{{ person()!.deathDate | date:'longDate':'':'ru' }}</p>
            </div>
          }
          @if (person()!.deathPlace) {
            <div>
              <p class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Место смерти</p>
              <p class="text-sm">{{ person()!.deathPlace }}</p>
            </div>
          }
          @if (person()!.bio) {
            <div>
              <p class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Биография</p>
              <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ person()!.bio }}</p>
            </div>
          }
        </div>

        <div class="flex gap-2 mt-6 pt-4 border-t border-[var(--color-border)]">
          <ui-button variant="outline" size="sm" (clicked)="editPerson.emit(person()!)">
            Редактировать
          </ui-button>
          <ui-button variant="destructive" size="sm" (clicked)="deletePerson.emit(person()!.id)">
            Удалить
          </ui-button>
        </div>
      </div>
    }
  `,
})
export class PersonCardComponent {
  person = input<Person | null>(null);
  editPerson = output<Person>();
  deletePerson = output<string>();

  get sexLabel(): () => string {
    return () => {
      switch (this.person()?.sex) {
        case 'male': return 'Мужчина';
        case 'female': return 'Женщина';
        default: return 'Другой';
      }
    };
  }
}
