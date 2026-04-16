import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PROJECTS_DATA, ProjectItem } from '../../data/projects-data';

@Component({
	selector: 'app-projects-page',
	templateUrl: './projects.html',
	styleUrls: ['./projects.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsPage {
	readonly projects: ProjectItem[] = PROJECTS_DATA;
}
