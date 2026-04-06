import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { LabelComponent } from '../../shared/ui/label.component';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { AppUser, FamilyTree } from '../../shared/types';

@Component({
  selector: 'feature-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, LabelComponent, AvatarComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h3 class="text-sm font-medium mb-3">Участники</h3>
        <div class="space-y-2">
          @for (member of members(); track member.uid) {
            <div class="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)]">
              <div class="flex items-center gap-3">
                <ui-avatar [src]="member.photoURL ?? ''" [initials]="member.displayName[0]" />
                <div>
                  <p class="text-sm font-medium">{{ member.displayName }}</p>
                  <p class="text-xs text-[var(--color-muted-foreground)]">{{ member.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <ui-badge [variant]="member.uid === tree().ownerId ? 'default' : 'secondary'">
                  {{ member.uid === tree().ownerId ? 'Владелец' : 'Участник' }}
                </ui-badge>
                @if (member.uid !== tree().ownerId && currentUserIsOwner()) {
                  <ui-button variant="destructive" size="sm" (clicked)="removeMember.emit(member.uid)">
                    Удалить
                  </ui-button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      @if (currentUserIsOwner()) {
        <div class="space-y-2">
          <ui-label for="inviteEmail">Добавить участника по email</ui-label>
          <div class="flex gap-2">
            <ui-input
              id="inviteEmail"
              type="email"
              placeholder="user@example.com"
              [(ngModel)]="inviteEmail"
              name="inviteEmail"
            />
            <ui-button (clicked)="onInvite()" [disabled]="!inviteEmail">Добавить</ui-button>
          </div>
          @if (error()) {
            <p class="text-sm text-[var(--color-destructive)]">{{ error() }}</p>
          }
        </div>
      }
    </div>
  `,
})
export class UserManagementComponent {
  tree = input.required<FamilyTree>();
  members = input<AppUser[]>([]);
  currentUserIsOwner = input(false);

  inviteMember = output<string>();
  removeMember = output<string>();

  inviteEmail = '';
  error = signal('');

  onInvite(): void {
    if (!this.inviteEmail) return;
    this.error.set('');
    this.inviteMember.emit(this.inviteEmail);
    this.inviteEmail = '';
  }

  setError(v: string): void { this.error.set(v); }
}
