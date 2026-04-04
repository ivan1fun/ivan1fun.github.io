import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClasses"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  clicked = output<MouseEvent>();

  get buttonClasses(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer';

    const variants: Record<ButtonVariant, string> = {
      default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90',
      secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary)]/80',
      outline: 'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
      ghost: 'hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
      destructive: 'bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive)]/90',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  }
}
