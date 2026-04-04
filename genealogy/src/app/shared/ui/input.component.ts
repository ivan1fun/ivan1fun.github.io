import { Component, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <input
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled"
      [value]="value"
      (input)="onInput($event)"
      (blur)="onTouched()"
      class="flex h-10 w-full rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  `,
})
export class InputComponent implements ControlValueAccessor {
  type = input<string>('text');
  placeholder = input<string>('');

  value = '';
  isDisabled = false;
  onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }
}
