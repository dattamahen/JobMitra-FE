import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import html2canvas from 'html2canvas';
import { ProfileSnapshot } from '../types/profile.types';

export type { ProfileSnapshot }

@Injectable({
	providedIn: 'root'
})
export class ProfileShareService {
	private platformId = inject(PLATFORM_ID);
	
	constructor(private http: HttpClient) {}

	async generateProfileSnapshot(element: HTMLElement): Promise<string> {
		const canvas = await html2canvas(element, {
			backgroundColor: '#ffffff',
			scale: 2,
			useCORS: true,
			allowTaint: true
		});
		return canvas.toDataURL('image/png');
	}

	shareViaEmail(profileData: ProfileSnapshot, imageData?: string): void {
		if (!isPlatformBrowser(this.platformId)) return;
		
		const subject = `${profileData.name} - Professional Profile`;
		const body = this.generateEmailBody(profileData);
		
		const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
		window.open(mailtoUrl, '_blank');
	}

	shareViaWhatsApp(profileData: ProfileSnapshot): void {
		if (!isPlatformBrowser(this.platformId)) return;
		
		const message = this.generateWhatsAppMessage(profileData);
		const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, '_blank');
	}

	shareViaLinkedIn(profileData: ProfileSnapshot): void {
		if (!isPlatformBrowser(this.platformId)) return;
		
		const text = `Check out ${profileData.name}'s professional profile - ${profileData.role} with ${profileData.experience} years of experience in ${profileData.skills.slice(0, 3).join(', ')}`;
		const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
		window.open(linkedinUrl, '_blank');
	}

	private generateEmailBody(profile: ProfileSnapshot): string {
		return `Hi,

I'd like to share ${profile.name}'s professional profile with you:

👤 Name: ${profile.name}
💼 Role: ${profile.role}
📍 Location: ${profile.location}
⏱️ Experience: ${profile.experience} years
🛠️ Key Skills: ${profile.skills.slice(0, 5).join(', ')}
📧 Email: ${profile.email}
${profile.phone ? `📱 Phone: ${profile.phone}` : ''}
${profile.linkedin ? `🔗 LinkedIn: ${profile.linkedin}` : ''}
${profile.github ? `💻 GitHub: ${profile.github}` : ''}

${profile.summary ? `About:\n${profile.summary}` : ''}

Best regards`;
	}

	private generateWhatsAppMessage(profile: ProfileSnapshot): string {
		return `🚀 *Professional Profile*

👤 *${profile.name}*
💼 ${profile.role}
📍 ${profile.location}
⏱️ ${profile.experience} years experience

🛠️ *Key Skills:*
${profile.skills.slice(0, 5).map(skill => `• ${skill}`).join('\n')}

📧 ${profile.email}
${profile.phone ? `📱 ${profile.phone}` : ''}
${profile.linkedin ? `🔗 ${profile.linkedin}` : ''}

${profile.summary ? `\n*About:*\n${profile.summary.substring(0, 200)}${profile.summary.length > 200 ? '...' : ''}` : ''}`;
	}

	downloadProfileCard(element: HTMLElement, filename: string = 'profile-card'): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				const canvas = await html2canvas(element, {
					backgroundColor: '#ffffff',
					scale: 2,
					useCORS: true,
					allowTaint: true
				});
				
				const link = document.createElement('a');
				link.download = `${filename}.png`;
				link.href = canvas.toDataURL();
				link.click();
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}
}
