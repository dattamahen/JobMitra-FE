import { FormControl } from '@angular/forms';
import { emailValidator } from './email.validator';
import { mobileNumberValidator } from './mobile-number.validator';

describe('Custom Validators', () => {

	// ─── Email Validator ─────────────────────────────────────────────────────

	describe('emailValidator', () => {
		const validator = emailValidator();

		it('should return null for valid email', () => {
			const control = new FormControl('user@example.com');
			expect(validator(control)).toBeNull();
		});

		it('should return null for empty value', () => {
			const control = new FormControl('');
			expect(validator(control)).toBeNull();
		});

		it('should return error for email without @', () => {
			const control = new FormControl('userexample.com');
			expect(validator(control)).toEqual({ invalidEmail: true });
		});

		it('should return error for email without domain', () => {
			const control = new FormControl('user@');
			expect(validator(control)).toEqual({ invalidEmail: true });
		});

		it('should return error for email without TLD', () => {
			const control = new FormControl('user@example');
			expect(validator(control)).toEqual({ invalidEmail: true });
		});

		it('should accept email with subdomain', () => {
			const control = new FormControl('user@mail.example.com');
			expect(validator(control)).toBeNull();
		});

		it('should accept email with + character', () => {
			const control = new FormControl('user+tag@example.com');
			expect(validator(control)).toBeNull();
		});

		it('should reject email with spaces', () => {
			const control = new FormControl('user @example.com');
			expect(validator(control)).toEqual({ invalidEmail: true });
		});
	});

	// ─── Mobile Number Validator ─────────────────────────────────────────────

	describe('mobileNumberValidator', () => {
		const validator = mobileNumberValidator();

		it('should return null for valid Indian mobile number', () => {
			const control = new FormControl('9876543210');
			expect(validator(control)).toBeNull();
		});

		it('should return null for empty value', () => {
			const control = new FormControl('');
			expect(validator(control)).toBeNull();
		});

		it('should accept numbers starting with 6-9', () => {
			['6', '7', '8', '9'].forEach(digit => {
				const control = new FormControl(`${digit}123456789`);
				expect(validator(control)).toBeNull();
			});
		});

		it('should reject numbers starting with 0-5', () => {
			['0', '1', '2', '3', '4', '5'].forEach(digit => {
				const control = new FormControl(`${digit}123456789`);
				expect(validator(control)).toEqual({ invalidMobile: true });
			});
		});

		it('should reject numbers with less than 10 digits', () => {
			const control = new FormControl('987654321');
			expect(validator(control)).toEqual({ invalidMobile: true });
		});

		it('should reject numbers with more than 10 digits', () => {
			const control = new FormControl('98765432101');
			expect(validator(control)).toEqual({ invalidMobile: true });
		});

		it('should handle numbers with spaces', () => {
			const control = new FormControl('9876 543 210');
			expect(validator(control)).toBeNull();
		});

		it('should reject alphabetic characters', () => {
			const control = new FormControl('98765abcde');
			expect(validator(control)).toEqual({ invalidMobile: true });
		});
	});
});
