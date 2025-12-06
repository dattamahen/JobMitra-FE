export function maskString(value: string, shouldMask: boolean, maskChar: string = '*'): string {
	if (!shouldMask || !value) {
		return value;
	}
	
	// Keep first and last character visible, mask the middle
	if (value.length <= 2) {
		return maskChar.repeat(value.length);
	}
	
	const firstChar = value.charAt(0);
	const lastChar = value.charAt(value.length - 1);
	const middleLength = value.length - 2;
	
	return firstChar + maskChar.repeat(middleLength) + lastChar;
}

export function maskEmail(email: string, shouldMask: boolean): string {
	if (!shouldMask || !email) {
		return email;
	}
	
	const [username, domain] = email.split('@');
	if (!username || !domain) {
		return email;
	}
	
	const maskedUsername = username.length > 2 
		? username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
		: '*'.repeat(username.length);
		
	return maskedUsername + '@' + domain;
}

export function maskPhone(phone: string, shouldMask: boolean): string {
	if (!shouldMask || !phone) {
		return phone;
	}
	
	// Keep last 4 digits visible
	if (phone.length <= 4) {
		return '*'.repeat(phone.length);
	}
	
	const visiblePart = phone.slice(-4);
	const maskedPart = '*'.repeat(phone.length - 4);
	
	return maskedPart + visiblePart;
}