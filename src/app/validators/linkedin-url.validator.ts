import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function linkedinUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinRegex.test(control.value) ? null : { invalidLinkedin: true };
  };
}
