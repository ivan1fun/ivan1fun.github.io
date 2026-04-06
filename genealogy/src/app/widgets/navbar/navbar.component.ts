import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../entities/user/api/auth.service';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'widget-navbar',
  standalone: true,
  imports: [RouterLink, AvatarComponent, ButtonComponent],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <a routerLink="/trees" class="flex items-center gap-2 font-semibold text-lg">
          <span class="text-[var(--color-primary)]">🌳</span>
          Генеалогическое древо
        </a>

        @if (user()) {
          <div class="flex items-center gap-4">
            <span class="text-sm text-[var(--color-muted-foreground)] hidden sm:block">
              {{ user()!.displayName }}
            </span>
            <ui-avatar
              [src]="user()!.photoURL ?? ''"
              [initials]="user()!.displayName[0] || '?'"
            />
            <ui-button variant="ghost" size="sm" (clicked)="onLogout()">
              Выйти
            </ui-button>
          </div>
        }
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;

  async onLogout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
