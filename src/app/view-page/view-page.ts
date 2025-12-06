import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginPage } from '../login-page/login-page';
import { Dashboard } from '../dashboard/dashboard';

@Component({
	selector: 'app-view-page',
	imports: [CommonModule, LoginPage, Dashboard],
	templateUrl: './view-page.html',
	styleUrl: './view-page.css'
})
export class ViewPage implements OnInit {
	currentPage: string = '';

	constructor(private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.data.subscribe(data => {
			this.currentPage = data['page'] || '';
		});
	}
}
