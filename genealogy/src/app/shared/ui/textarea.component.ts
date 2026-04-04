import { Component, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  template: `
    <textarea
      [placeholder]="placeholder()"
      [rows]="rows()"
      [disabled]="isDisabled"
      [value]="value"
      (input)="onInput($event)"
      (blur)="onTouched()"
      class="flex min-h-[80px] w-full rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
    ></textarea>
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  placeholder = input<string>('');
  rows = input<number>(3);

  value = '';
  isDisabled = false;
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; }

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value = value;
    this.onChange(value);
  }
}
