import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-date-field',
	standalone: true,
	imports: [
		CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatIconModule
	],
	template: `
		<mat-form-field appearance="outline" class="full-width">
			<mat-label>{{ label }}{{ required ? ' *' : '' }}</mat-label>
			<input 
				matInput 
				[matDatepicker]="picker"
				[value]="value"
				(dateInput)="onDateChange($event)"
				[readonly]="readonly"
				[disabled]="disabled">
			<mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
			<mat-datepicker #picker></mat-datepicker>
			@if (hint) {
				<mat-hint>{{ hint }}</mat-hint>
			}
		</mat-form-field>
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => DateFieldComponent),
			multi: true
		}
	]
})
export class DateFieldComponent implements ControlValueAccessor {
	@Input() label = '';
	@Input() required = false;
	@Input() readonly = false;
	@Input() disabled = false;
	@Input() hint = '';

	value: Date | null = null;
	onChange = (value: Date | null) => {};
	onTouched = () => {};

	onDateChange(event: any) {
		this.value = event.value;
		this.onChange(this.value);
		this.onTouched();
	}

	writeValue(value: Date | null): void {
		this.value = value;
	}

	registerOnChange(fn: (value: Date | null) => void): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}
}