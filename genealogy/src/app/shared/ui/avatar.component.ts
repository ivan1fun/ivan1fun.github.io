import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      @if (src()) {
        <img [src]="src()" [alt]="alt()" class="aspect-square h-full w-full object-cover" />
      } @else {
        <div class="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)] text-sm font-medium">
          {{ initials() }}
        </div>
      }
    </div>
  `,
})
export class AvatarComponent {
  src = input<string>('');
  alt = input<string>('');
  initials = input<string>('?');
}
