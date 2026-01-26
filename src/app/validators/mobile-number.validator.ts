import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function mobileNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(control.value.replace(/\s+/g, '')) ? null : { invalidMobile: true };
  };
}
