import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function githubUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
    return githubRegex.test(control.value) ? null : { invalidGithub: true };
  };
}
