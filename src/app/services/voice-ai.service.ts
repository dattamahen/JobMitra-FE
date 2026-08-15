import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

@Injectable({
	providedIn: 'root'
})
export class VoiceAiService {
	private recognition?: any;
	private synthesis?: SpeechSynthesis;
	private platformId = inject(PLATFORM_ID);

	isListening = signal(false);
	isProcessing = signal(false);
	isSpeaking = signal(false);
	currentTranscript = signal('');
	currentResponse = signal('');
	error = signal('');

	constructor() {
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

		this.recognition.onresult = (event: any) => {
			const transcript = event.results[0][0].transcript;
			this.currentTranscript.set(transcript);
		};

		this.recognition.onend = () => {
			this.isListening.set(false);
		};

		this.recognition.onerror = (event: any) => {
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

	speak(text: string): void {
		if (!this.synthesis) return;

		this.synthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = 1.0;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;
		utterance.onstart = () => this.isSpeaking.set(true);
		utterance.onend = () => this.isSpeaking.set(false);
		utterance.onerror = () => this.isSpeaking.set(false);

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

	clearTranscript(): void {
		this.currentTranscript.set('');
	}
}
