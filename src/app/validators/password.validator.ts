import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
    if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
    if (!/[0-9]/.test(value)) errors['missingNumber'] = true;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) errors['missingSpecial'] = true;

    return Object.keys(errors).length ? errors : null;
  };
}
