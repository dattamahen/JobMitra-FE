import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

export interface CvUploadPreview {
  extracted: Record<string, unknown>;
  warnings: string[];
}

@Injectable({ providedIn: 'root' })
export class CvUploadService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  private get uploadHeaders(): HttpHeaders {
    // No Content-Type — browser must set multipart/form-data boundary automatically
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jobmitra_token');
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  uploadForPreview(file: File): Observable<CvUploadPreview> {
    const form = new FormData();
    form.append('file', file);
    const base = environment.apiUrl || 'http://localhost:8000';
    return this.http.post<CvUploadPreview>(
      `${base}/api/v1/profile/upload-cv`,
      form,
      { headers: this.uploadHeaders }
    );
  }

  confirmSave(extracted: Record<string, unknown>): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>(
      '/api/v1/profile/upload-cv/confirm',
      { extracted },
    );
  }
}
