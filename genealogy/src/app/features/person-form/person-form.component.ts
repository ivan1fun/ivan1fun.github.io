import { Component, input, output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { LabelComponent } from '../../shared/ui/label.component';
import { TextareaComponent } from '../../shared/ui/textarea.component';
import { SelectComponent, SelectOption } from '../../shared/ui/select.component';
import { Person, Sex } from '../../shared/types';

export interface PersonFormData {
  firstName: string;
  lastName: string;
  sex: Sex;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  deathPlace: string;
  bio: string;
  photoFile?: File;
}

@Component({
  selector: 'feature-person-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, LabelComponent, TextareaComponent, SelectComponent],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <ui-label for="firstName">Имя *</ui-label>
          <ui-input id="firstName" placeholder="Иван" [(ngModel)]="form.firstName" name="firstName" />
        </div>
        <div class="space-y-2">
          <ui-label for="lastName">Фамилия *</ui-label>
          <ui-input id="lastName" placeholder="Иванов" [(ngModel)]="form.lastName" name="lastName" />
        </div>
      </div>

      <div class="space-y-2">
        <ui-label>Пол</ui-label>
        <ui-select [options]="sexOptions" [(ngModel)]="form.sex" name="sex" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <ui-label for="birthDate">Дата рождения</ui-label>
          <ui-input id="birthDate" type="date" [(ngModel)]="form.birthDate" name="birthDate" />
        </div>
        <div class="space-y-2">
          <ui-label for="deathDate">Дата смерти</ui-label>
          <ui-input id="deathDate" type="date" [(ngModel)]="form.deathDate" name="deathDate" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <ui-label for="birthPlace">Место рождения</ui-label>
          <ui-input id="birthPlace" placeholder="Москва, Россия" [(ngModel)]="form.birthPlace" name="birthPlace" />
        </div>
        <div class="space-y-2">
          <ui-label for="deathPlace">Место смерти</ui-label>
          <ui-input id="deathPlace" placeholder="Санкт-Петербург" [(ngModel)]="form.deathPlace" name="deathPlace" />
        </div>
      </div>

      <div class="space-y-2">
        <ui-label for="bio">Биография</ui-label>
        <ui-textarea id="bio" placeholder="Расскажите о человеке..." [(ngModel)]="form.bio" name="bio" [rows]="4" />
      </div>

      <div class="space-y-2">
        <ui-label for="photo">Фотография</ui-label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          (change)="onFileChange($event)"
          class="flex h-10 w-full rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
        />
        @if (photoPreview()) {
          <img [src]="photoPreview()" alt="Preview" class="mt-2 h-24 w-24 rounded-full object-cover" />
        }
      </div>

      @if (error()) {
        <p class="text-sm text-[var(--color-destructive)]">{{ error() }}</p>
      }

      <div class="flex justify-end gap-2">
        <ui-button type="button" variant="outline" (clicked)="cancelled.emit()">Отмена</ui-button>
        <ui-button type="submit" [disabled]="loading()">
          {{ loading() ? 'Сохранение...' : (submitLabel()) }}
        </ui-button>
      </div>
    </form>
  `,
})
export class PersonFormComponent implements OnInit {
  person = input<Person | null>(null);
  submitLabel = input('Добавить');

  submitted = output<PersonFormData>();
  cancelled = output<void>();

  form: PersonFormData = {
    firstName: '',
    lastName: '',
    sex: 'male',
    birthDate: '',
    deathDate: '',
    birthPlace: '',
    deathPlace: '',
    bio: '',
  };

  photoPreview = signal('');
  loading = signal(false);
  error = signal('');

  sexOptions: SelectOption[] = [
    { value: 'male', label: 'Мужской' },
    { value: 'female', label: 'Женский' },
    { value: 'other', label: 'Другой' },
  ];

  ngOnInit(): void {
    const p = this.person();
    if (p) {
      this.form = {
        firstName: p.firstName,
        lastName: p.lastName,
        sex: p.sex,
        birthDate: p.birthDate ?? '',
        deathDate: p.deathDate ?? '',
        birthPlace: p.birthPlace ?? '',
        deathPlace: p.deathPlace ?? '',
        bio: p.bio ?? '',
      };
      if (p.photoURL) this.photoPreview.set(p.photoURL);
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.form.photoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (!this.form.firstName || !this.form.lastName) {
      this.error.set('Имя и фамилия обязательны');
      return;
    }
    this.error.set('');
    this.submitted.emit({ ...this.form });
  }

  setLoading(v: boolean): void { this.loading.set(v); }
  setError(v: string): void { this.error.set(v); }
}
