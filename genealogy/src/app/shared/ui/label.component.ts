import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-label',
  standalone: true,
  template: `
    <label [attr.for]="for()" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      <ng-content />
    </label>
  `,
})
export class LabelComponent {
  for = input<string>('');
}
