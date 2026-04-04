import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="closed.emit()"></div>
        <div class="relative z-50 w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg">
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  open = input(false);
  closed = output<void>();
}

@Component({
  selector: 'ui-dialog-header',
  standalone: true,
  template: `<div class="flex flex-col space-y-1.5 mb-4"><ng-content /></div>`,
})
export class DialogHeaderComponent {}

@Component({
  selector: 'ui-dialog-title',
  standalone: true,
  template: `<h2 class="text-lg font-semibold leading-none tracking-tight"><ng-content /></h2>`,
})
export class DialogTitleComponent {}

@Component({
  selector: 'ui-dialog-footer',
  standalone: true,
  template: `<div class="flex justify-end gap-2 mt-6"><ng-content /></div>`,
})
export class DialogFooterComponent {}
