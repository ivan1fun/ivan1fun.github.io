import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { InputComponent } from '../../../shared/ui/input.component';
import { LabelComponent } from '../../../shared/ui/label.component';

@Component({
  selector: 'feature-login-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, LabelComponent],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="space-y-2">
        <ui-label for="email">Email</ui-label>
        <ui-input id="email" type="email" placeholder="you@example.com" [(ngModel)]="email" name="email" />
      </div>
      <div class="space-y-2">
        <ui-label for="password">Пароль</ui-label>
        <ui-input id="password" type="password" placeholder="••••••••" [(ngModel)]="password" name="password" />
      </div>
      @if (error()) {
        <p class="text-sm text-[var(--color-destructive)]">{{ error() }}</p>
      }
      <ui-button type="submit" [disabled]="loading()" class="w-full">
        {{ loading() ? 'Вход...' : 'Войти' }}
      </ui-button>
    </form>
  `,
})
export class LoginFormComponent {
  submitted = output<{ email: string; password: string }>();

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Заполните все поля');
      return;
    }
    this.error.set('');
    this.submitted.emit({ email: this.email, password: this.password });
  }

  setLoading(v: boolean): void { this.loading.set(v); }
  setError(v: string): void { this.error.set(v); }
}
