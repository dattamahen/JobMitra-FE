import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
	data?: T;
	message?: string;
	error?: string;
	count?: number;
	timestamp?: string;
}

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private readonly baseUrl = environment.apiUrl || 'http://localhost:8000';
	private readonly apiBaseUrl = `${this.baseUrl}/api/v1`;

	constructor(private http: HttpClient) {}

	/**
	* Create HTTP headers with authentication if available
	*/
	private createHeaders(): HttpHeaders {
		let headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		// Get token from localStorage using correct key (same as AuthService)
		const token = localStorage.getItem('jobmitra_token');
		if (token) {
			headers = headers.set('Authorization', `Bearer ${token}`);
		}

		return headers;
	}

	/**
	* GET request
	*/
	get<T>(endpoint: string, params?: any, responseType?: 'json' | 'blob'): Observable<T> {
		let httpParams = new HttpParams();
		
		if (params) {
			Object.keys(params).forEach(key => {
				if (params[key] !== null && params[key] !== undefined) {
					httpParams = httpParams.set(key, params[key].toString());
				}
			});
		}

		const url = endpoint.startsWith('/api/v1') ? `${this.baseUrl}${endpoint}` : `${this.apiBaseUrl}${endpoint}`;
		
		if (responseType === 'blob') {
			return this.http.get(url, {
				headers: this.createHeaders(),
				params: httpParams,
				responseType: 'blob' as 'json'
			}) as Observable<T>;
		}
		
		return this.http.get<T>(url, { headers: this.createHeaders(), params: httpParams })
			.pipe(
				catchError(this.handleError)
			);
	}

	/**
	* POST request
	*/
	post<T>(endpoint: string, data: any): Observable<T> {
		const url = endpoint.startsWith('/api/v1') ? `${this.baseUrl}${endpoint}` : `${this.apiBaseUrl}${endpoint}`;
		
		return this.http.post<T>(url, JSON.stringify(data), { headers: this.createHeaders() })
			.pipe(
				retry(1),
				catchError(this.handleError)
			);
	}

	/**
	* PUT request
	*/
	put<T>(endpoint: string, data: any): Observable<T> {
		const url = endpoint.startsWith('/api/v1') ? `${this.baseUrl}${endpoint}` : `${this.apiBaseUrl}${endpoint}`;
		
		return this.http.put<T>(url, JSON.stringify(data), { headers: this.createHeaders() })
			.pipe(
				retry(1),
				catchError(this.handleError)
			);
	}

	/**
	* DELETE request
	*/
	delete<T>(endpoint: string): Observable<T> {
		const url = endpoint.startsWith('/api/v1') ? `${this.baseUrl}${endpoint}` : `${this.apiBaseUrl}${endpoint}`;
		
		return this.http.delete<T>(url, { headers: this.createHeaders() })
			.pipe(
				retry(1),
				catchError(this.handleError)
			);
	}

	/**
	* AI Query endpoint (core endpoint)
	*/
	askAI(query: string): Observable<{ response: string; timestamp: string }> {
		return this.http.post<{ response: string; timestamp: string }>(
			`${this.baseUrl}/ask`, 
			{ query },
			{ headers: this.createHeaders() }
		).pipe(
			retry(1),
			catchError(this.handleError)
		);
	}

	/**
	* Health check endpoints
	*/
	healthCheck(): Observable<any> {
		return this.http.get(`${this.baseUrl}/`).pipe(
			catchError(this.handleError)
		);
	}

	extendedHealthCheck(): Observable<any> {
		return this.get('/health');
	}

	/**
	* Get logs
	*/
	getLogs(limit: number = 10): Observable<any> {
		return this.http.get(`${this.baseUrl}/logs`, {
			params: { limit: limit.toString() }
		}).pipe(
			catchError(this.handleError)
		);
	}

	/**
	* Error handling
	*/
	private handleError(error: any): Observable<never> {
		let errorMessage = 'An unknown error occurred!';
		
		if (error.error instanceof ErrorEvent) {
			// Client-side error
			errorMessage = `Client Error: ${error.error.message}`;
		} else {
			// Server-side error
			if (error.status === 0) {
				errorMessage = 'Cannot connect to server. Please check if the API is running.';
			} else if (error.error && error.error.detail) {
				errorMessage = error.error.detail;
			} else {
				errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
			}
		}
		

		return throwError(() => new Error(errorMessage));
	}
}
