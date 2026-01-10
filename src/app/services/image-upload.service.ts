import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class ImageUploadService {
	
	uploadProfileImage(file: File): Observable<string> {
		return new Observable(observer => {
			const reader = new FileReader();
			reader.onload = () => {
				const base64String = reader.result as string;
				localStorage.setItem('profileCoverImage', base64String);
				observer.next(base64String);
				observer.complete();
			};
			reader.onerror = () => observer.error('Failed to read file');
			reader.readAsDataURL(file);
		});
	}

	getProfileImage(): string | null {
		return localStorage.getItem('profileCoverImage');
	}

	removeProfileImage(): void {
		localStorage.removeItem('profileCoverImage');
	}

	validateImageFile(file: File): { valid: boolean; error?: string } {
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

		if (!allowedTypes.includes(file.type)) {
			return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WebP)' };
		}

		if (file.size > maxSize) {
			return { valid: false, error: 'Image size must be less than 5MB' };
		}

		return { valid: true };
	}
}
