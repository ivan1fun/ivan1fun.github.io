import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { InputComponent } from '../../../shared/ui/input.component';
import { LabelComponent } from '../../../shared/ui/label.component';

@Component({
  selector: 'feature-register-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, LabelComponent],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="space-y-2">
        <ui-label for="name">Имя</ui-label>
        <ui-input id="name" placeholder="Иван Иванов" [(ngModel)]="displayName" name="displayName" />
      </div>
      <div class="space-y-2">
        <ui-label for="email">Email</ui-label>
        <ui-input id="email" type="email" placeholder="you@example.com" [(ngModel)]="email" name="email" />
      </div>
      <div class="space-y-2">
        <ui-label for="password">Пароль</ui-label>
        <ui-input id="password" type="password" placeholder="Минимум 6 символов" [(ngModel)]="password" name="password" />
      </div>
      @if (error()) {
        <p class="text-sm text-[var(--color-destructive)]">{{ error() }}</p>
      }
      <ui-button type="submit" [disabled]="loading()" class="w-full">
        {{ loading() ? 'Регистрация...' : 'Создать аккаунт' }}
      </ui-button>
    </form>
  `,
})
export class RegisterFormComponent {
  submitted = output<{ email: string; password: string; displayName: string }>();

  displayName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.displayName || !this.email || !this.password) {
      this.error.set('Заполните все поля');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Пароль должен быть не менее 6 символов');
      return;
    }
    this.error.set('');
    this.submitted.emit({ email: this.email, password: this.password, displayName: this.displayName });
  }

  setLoading(v: boolean): void { this.loading.set(v); }
  setError(v: string): void { this.error.set(v); }
}
