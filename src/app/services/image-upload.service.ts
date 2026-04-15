import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
	private http = inject(HttpClient);
	private baseUrl = environment.apiUrl || 'http://localhost:8000';

	private getHeaders(): HttpHeaders {
		const token = localStorage.getItem('jobmitra_token');
		return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
	}

	uploadAvatar(file: File): Observable<string> {
		const formData = new FormData();
		formData.append('file', file);

		return this.http.post<{ avatar_url: string }>(
			`${this.baseUrl}/api/v1/users/avatar`,
			formData,
			{ headers: this.getHeaders() }
		).pipe(map(res => `${this.baseUrl}${res.avatar_url}`));
	}

	removeAvatar(): Observable<void> {
		return this.http.delete<void>(
			`${this.baseUrl}/api/v1/users/avatar`,
			{ headers: this.getHeaders() }
		);
	}

	getFullAvatarUrl(avatarUrl: string | null | undefined): string | null {
		if (!avatarUrl) return null;
		if (avatarUrl.startsWith('http')) return avatarUrl;
		return `${this.baseUrl}${avatarUrl}`;
	}

	validateImageFile(file: File): { valid: boolean; error?: string } {
		const maxSize = 5 * 1024 * 1024;
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

		if (!allowedTypes.includes(file.type)) {
			return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WebP)' };
		}
		if (file.size > maxSize) {
			return { valid: false, error: 'Image size must be less than 5MB' };
		}
		return { valid: true };
	}

	// Legacy methods — kept for cover image (still localStorage based)
	uploadProfileImage(file: File): Observable<string> {
		return new Observable(observer => {
			const reader = new FileReader();
			reader.onload = () => {
				const base64 = reader.result as string;
				localStorage.setItem('profileCoverImage', base64);
				observer.next(base64);
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
}
