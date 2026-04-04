import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../entities/user/api/auth.service';
import { RegisterFormComponent } from '../../../features/auth/register-form/register-form.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, CardFooterComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'page-register',
  standalone: true,
  imports: [RouterLink, RegisterFormComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, CardFooterComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--color-muted)]/30 px-4">
      <ui-card class="w-full max-w-md">
        <ui-card-header>
          <div class="flex justify-center mb-4">
            <span class="text-5xl">🌳</span>
          </div>
          <ui-card-title class="text-center">Регистрация</ui-card-title>
          <ui-card-description class="text-center">Создайте аккаунт и начните строить семейное древо</ui-card-description>
        </ui-card-header>
        <ui-card-content>
          <feature-register-form #registerForm (submitted)="onRegister($event)" />
        </ui-card-content>
        <ui-card-footer>
          <p class="text-sm text-center w-full text-[var(--color-muted-foreground)]">
            Уже есть аккаунт?
            <a routerLink="/auth/login" class="text-[var(--color-primary)] hover:underline ml-1">Войти</a>
          </p>
        </ui-card-footer>
      </ui-card>
    </div>
  `,
})
export class RegisterPage {
  @ViewChild('registerForm') registerForm!: RegisterFormComponent;

  private auth = inject(AuthService);
  private router = inject(Router);

  async onRegister(event: { email: string; password: string; displayName: string }): Promise<void> {
    this.registerForm.setLoading(true);
    try {
      await this.auth.register(event.email, event.password, event.displayName);
      this.router.navigate(['/trees']);
    } catch (e: any) {
      this.registerForm.setError(this.getErrorMessage(e.code));
    } finally {
      this.registerForm.setLoading(false);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use': return 'Email уже используется';
      case 'auth/weak-password': return 'Пароль слишком слабый';
      case 'auth/invalid-email': return 'Неверный формат email';
      default: return 'Ошибка регистрации';
    }
  }
}
