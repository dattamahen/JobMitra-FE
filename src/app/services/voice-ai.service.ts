import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { EnvironmentService } from './environment.service';

// Web Speech API type declarations
declare global {
	interface Window {
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
	}
}

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
	onresult: ((this: SpeechRecognition, ev: any) => any) | null;
	onend: ((this: SpeechRecognition, ev: Event) => any) | null;
	onerror: ((this: SpeechRecognition, ev: any) => any) | null;
}

export interface VoiceResponse {
	text: string;
	sources?: { uri: string; title: string }[];
}

@Injectable({
	providedIn: 'root'
})
export class VoiceAiService {
	private readonly API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
	private readonly MODEL_NAME = 'gemini-2.5-flash-preview-05-20';
	private readonly apiKey: string;

	// Speech recognition and synthesis
	private recognition?: any;
	private synthesis?: SpeechSynthesis;
	private platformId = inject(PLATFORM_ID);

	// Signals for reactive state
	isListening = signal(false);
	isProcessing = signal(false);
	currentTranscript = signal('');
	currentResponse = signal('');
	error = signal('');

	constructor(
		private http: HttpClient,
		private envService: EnvironmentService
	) {
		this.apiKey = this.envService.getGeminiApiKey();
		if (isPlatformBrowser(this.platformId)) {
			this.synthesis = window.speechSynthesis;
			this.initSpeechRecognition();
		}
	}

	private initSpeechRecognition(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		
		if (!SpeechRecognition) {
			this.error.set('Speech recognition not supported in this browser');
			return;
		}

		this.recognition = new SpeechRecognition();
		this.recognition.continuous = false;
		this.recognition.interimResults = false;
		this.recognition.lang = 'en-US';

		this.recognition.onstart = () => {
			this.isListening.set(true);
			this.error.set('');
		};

		this.recognition.onresult = (event:any) => {
			const transcript = event.results[0][0].transcript;
			this.currentTranscript.set(transcript);
			this.processQuery(transcript);
		};

		this.recognition.onend = () => {
			this.isListening.set(false);
		};

		this.recognition.onerror = (event:any) => {
			this.isListening.set(false);
			let message = 'Speech recognition error';
			if (event.error === 'not-allowed') {
				message = 'Microphone access denied';
			} else if (event.error === 'no-speech') {
				message = 'No speech detected';
			}
			this.error.set(message);
		};
	}

	startListening(): void {
		if (!this.recognition || this.isListening()) return;
		
		try {
			this.recognition.start();
		} catch (e) {
			this.error.set('Could not start microphone');
		}
	}

	stopListening(): void {
		if (this.recognition && this.isListening()) {
			this.recognition.stop();
		}
	}

	private async processQuery(query: string): Promise<void> {
		this.isProcessing.set(true);
		this.speak('One moment, please.');

		try {
			const response = await this.callGemini(query);
			this.currentResponse.set(response.text);
			this.speak(response.text);
		} catch (error) {
			const errorMsg = 'An error occurred while processing your request';
			this.currentResponse.set(errorMsg);
			this.speak(errorMsg);
			this.error.set(errorMsg);
		} finally {
			this.isProcessing.set(false);
		}
	}

	private async callGemini(prompt: string): Promise<VoiceResponse> {
		const apiUrl = `${this.API_BASE_URL}/${this.MODEL_NAME}:generateContent?key=${this.apiKey}`;

		const payload = {
			contents: [{ parts: [{ text: prompt }] }],
			tools: [{ "google_search": {} }],
			systemInstruction: {
				parts: [{ text: "You are a helpful, concise AI voice assistant. Answer briefly and informatively." }],
			},
		};

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const result = await response.json();
		const candidate = result.candidates?.[0];

		if (!candidate?.content?.parts?.[0]?.text) {
			throw new Error('No response generated');
		}

		const text = candidate.content.parts[0].text;
		let sources: { uri: string; title: string }[] = [];

		const groundingMetadata = candidate.groundingMetadata;
		if (groundingMetadata?.groundingAttributions) {
			sources = groundingMetadata.groundingAttributions
				.map((attr: any) => ({
					uri: attr.web?.uri,
					title: attr.web?.title,
				}))
				.filter((source: any) => source.uri && source.title);
		}

		return { text, sources };
	}

	speak(text: string): void {
		if (!this.synthesis) return;

		this.synthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = 1.0;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		const voices = this.synthesis.getVoices();
		const preferredVoice = voices.find(voice => 
			voice.name.includes('Google') && voice.lang.startsWith('en')
		);
		if (preferredVoice) {
			utterance.voice = preferredVoice;
		}

		this.synthesis.speak(utterance);
	}

	clearError(): void {
		this.error.set('');
	}
}
