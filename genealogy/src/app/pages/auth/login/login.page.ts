import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../entities/user/api/auth.service';
import { LoginFormComponent } from '../../../features/auth/login-form/login-form.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, CardFooterComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'page-login',
  standalone: true,
  imports: [RouterLink, LoginFormComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent, CardFooterComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--color-muted)]/30 px-4">
      <ui-card class="w-full max-w-md">
        <ui-card-header>
          <div class="flex justify-center mb-4">
            <span class="text-5xl">🌳</span>
          </div>
          <ui-card-title class="text-center">Вход</ui-card-title>
          <ui-card-description class="text-center">Войдите в своё генеалогическое древо</ui-card-description>
        </ui-card-header>
        <ui-card-content>
          <feature-login-form #loginForm (submitted)="onLogin($event)" />
        </ui-card-content>
        <ui-card-footer>
          <p class="text-sm text-center w-full text-[var(--color-muted-foreground)]">
            Нет аккаунта?
            <a routerLink="/auth/register" class="text-[var(--color-primary)] hover:underline ml-1">Зарегистрироваться</a>
          </p>
        </ui-card-footer>
      </ui-card>
    </div>
  `,
})
export class LoginPage {
  @ViewChild('loginForm') loginForm!: LoginFormComponent;

  private auth = inject(AuthService);
  private router = inject(Router);

  async onLogin(event: { email: string; password: string }): Promise<void> {
    this.loginForm.setLoading(true);
    try {
      await this.auth.login(event.email, event.password);
      this.router.navigate(['/trees']);
    } catch (e: any) {
      this.loginForm.setError(this.getErrorMessage(e.code));
    } finally {
      this.loginForm.setLoading(false);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'Пользователь не найден';
      case 'auth/wrong-password': return 'Неверный пароль';
      case 'auth/invalid-email': return 'Неверный email';
      case 'auth/too-many-requests': return 'Слишком много попыток. Попробуйте позже';
      default: return 'Ошибка входа. Проверьте данные';
    }
  }
}
