import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginPage } from '../login-page/login-page';
import { Dashboard } from '../dashboard/dashboard';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
	selector: 'app-view-page',
	imports: [CommonModule, LoginPage, Dashboard],
	templateUrl: './view-page.html',
	styleUrl: './view-page.css'
})
export class ViewPage implements OnInit {
	currentPage: string = '';
	private destroyRef = inject(DestroyRef);

	constructor(private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.data
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(data => {
			this.currentPage = data['page'] || '';
		});
	}
}
