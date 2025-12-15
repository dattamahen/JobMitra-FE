export interface FormFieldConfig {
	name: string;
	label: string;
	type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'dynamic-array' | 'chip-list' | 'url' | 'date';
	placeholder?: string;
	required?: boolean;
	defaultValue?: any;
	validators?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		min?: number;
		max?: number;
	};
	options?: { value: any; label: string }[];
	icon?: string;
	hint?: string;
	rows?: number;
	cssClass?: string;
	width?: 'full' | 'half' | 'quarter' | 'three-quarter';
	readonly?: boolean;
	fields?: FormFieldConfig[]; // For dynamic-array and nested field types
}

export interface FormConfig {
	title?: string;
	fields: FormFieldConfig[];
	submitLabel?: string;
	loading?: boolean;
	readonly?: boolean;
	showCancel?: boolean;
	showActions?: boolean;
}