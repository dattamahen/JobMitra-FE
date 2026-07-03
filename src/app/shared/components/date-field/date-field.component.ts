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
		<mat-form-field appearance="fill" class="full-width" [class.disabled-field]="disabled || readonly">
			<mat-label>{{ label }}{{ required ? ' *' : '' }}</mat-label>
			<input 
				matInput 
				[matDatepicker]="picker"
				[value]="value"
				(dateInput)="onDateChange($event)"
				[max]="maxDate"
				[readonly]="readonly"
				[disabled]="disabled || readonly">
			<mat-datepicker-toggle matSuffix [for]="picker" [disabled]="disabled || readonly"></mat-datepicker-toggle>
			<mat-datepicker #picker [disabled]="disabled || readonly"></mat-datepicker>
			@if (hint) {
				<mat-hint>{{ hint }}</mat-hint>
			}
		</mat-form-field>
	`,
	styles: [`
		:host { display: block; width: 100%; }
		.mat-datepicker-toggle { transform: scale(0.8); }
		.mat-mdc-form-field { font-size: 14px; }
		input { color: #65697b !important; }
		.mat-mdc-floating-label { color: #65697b !important; }
	`],
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
	@Input() maxDate: Date | null = null;

	value: Date | null = null;
	onChange = (value: Date | null) => {};
	onTouched = () => {};

	onDateChange(event: any) {
		this.value = event.value;
		this.onChange(this.value);
		this.onTouched();
	}

	writeValue(value: Date | string | null): void {
		if (value) {
			this.value = value instanceof Date ? value : new Date(value);
		} else {
			this.value = null;
		}
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
