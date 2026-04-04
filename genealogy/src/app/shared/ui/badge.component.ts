import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="badgeClasses">
      <ng-content />
    </div>
  `,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');

  get badgeClasses(): string {
    const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
    const variants: Record<BadgeVariant, string> = {
      default: 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]',
      secondary: 'border-transparent bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]',
      outline: 'text-[var(--color-foreground)]',
      destructive: 'border-transparent bg-[var(--color-destructive)] text-white',
    };
    return `${base} ${variants[this.variant()]}`;
  }
}
