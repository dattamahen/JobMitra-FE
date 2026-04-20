import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface JobFilterConfig {
	searchQuery: string;
	selectedLocation: string;
	selectedExperience: string;
	selectedEmploymentType?: string;
	selectedStatus?: string;
}

export interface JobFilterOptions {
	locations: string[];
	experience_levels: string[];
	employment_types?: string[];
}

@Component({
	selector: 'app-job-filter',
	imports: [
		CommonModule,
		FormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule
	],
	template: `
		<mat-card class="search-filters">
			<mat-card-content>
				<div class="filter-row">
					<mat-form-field appearance="fill" class="search-field">
						<mat-label>{{searchLabel()}}</mat-label>
						<input matInput [placeholder]="searchPlaceholder()" 
							[ngModel]="filterConfig().searchQuery"
							(ngModelChange)="onSearchQueryChange($event)"
							(keyup.enter)="search.emit()">
						<mat-icon matSuffix>search</mat-icon>
					</mat-form-field>

					<mat-form-field appearance="fill">
						<mat-label>Location</mat-label>
						<mat-select [value]="filterConfig().selectedLocation" 
							(selectionChange)="onLocationChange($event.value)">
							<mat-option value="all">All Locations</mat-option>
							@for (location of filterOptions().locations; track location) {
								<mat-option [value]="location.toLowerCase().replaceAll(' ', '-')">
									{{location}}
								</mat-option>
							}
						</mat-select>
					</mat-form-field>

					<mat-form-field appearance="fill">
						<mat-label>Experience Level</mat-label>
						<mat-select [value]="filterConfig().selectedExperience" 
							(selectionChange)="onExperienceChange($event.value)">
							<mat-option value="all">All Experience Levels</mat-option>
							@for (experience of filterOptions().experience_levels; track experience) {
								<mat-option [value]="experience.toLowerCase().replaceAll(' ', '-')">
									{{experience | titlecase}}
								</mat-option>
							}
						</mat-select>
					</mat-form-field>

					@if (showEmploymentType()) {
						<mat-form-field appearance="fill">
							<mat-label>Employment Type</mat-label>
							<mat-select [value]="filterConfig().selectedEmploymentType || 'all'" 
								(selectionChange)="onEmploymentTypeChange($event.value)">
								<mat-option value="all">All Employment Types</mat-option>
								@for (type of filterOptions().employment_types || []; track type) {
									<mat-option [value]="type.toLowerCase().replaceAll(' ', '-')">
										{{type | titlecase}}
									</mat-option>
								}
							</mat-select>
						</mat-form-field>
					}

					@if (showStatus()) {
						<mat-form-field appearance="fill">
							<mat-label>Job Status</mat-label>
							<mat-select [value]="filterConfig().selectedStatus || 'all'" 
								(selectionChange)="onStatusChange($event.value)">
								<mat-option value="all">All Status</mat-option>
								<mat-option value="active">Active</mat-option>
								<mat-option value="inactive">Inactive</mat-option>
							</mat-select>
						</mat-form-field>
					}
				</div>
				
				<div class="search-button-container">
					<div class="results-summary">
						{{resultsCount()}} {{resultsLabel()}}{{resultsCount() !== 1 ? 's' : ''}} found
					</div>
					<button mat-raised-button color="primary" class="search-button" (click)="search.emit()">
						<mat-icon>search</mat-icon>
						{{searchButtonLabel()}}
					</button>
				</div>
			</mat-card-content>
		</mat-card>
	`,
	styles: [`
		.search-filters {
			margin-bottom: 24px;
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
			border-radius: 12px;
		}

		.filter-row {
			display: flex;
			gap: 16px;
			flex-wrap: wrap;
			align-items: center;
		}

		.search-field {
			flex: 2;
			min-width: 300px;
		}

		.filter-row mat-form-field {
			flex: 1;
			min-width: 150px;
		}

		.search-button-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 16px;
		}

		.search-button {
			padding: 12px 24px;
			font-weight: 500;
			border-radius: 8px;
		}

		.results-summary {
			font-size: 0.9rem;
			font-weight: 500;
		}

		@media (max-width: 768px) {
			.filter-row {
				flex-direction: column;
			}
			
			.filter-row mat-form-field {
				width: 100%;
			}
			
			.search-button-container {
				flex-direction: column;
				gap: 12px;
				align-items: stretch;
			}
		}
	`],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobFilterComponent {
	filterConfig = input.required<JobFilterConfig>();
	filterOptions = input.required<JobFilterOptions>();
	resultsCount = input<number>(0);
	searchLabel = input<string>('Search jobs');
	searchPlaceholder = input<string>('Enter job title, skills, or company');
	searchButtonLabel = input<string>('Search Jobs');
	resultsLabel = input<string>('job');
	showEmploymentType = input<boolean>(true);
	showStatus = input<boolean>(false);

	filterChange = output<JobFilterConfig>();
	search = output<void>();

	onSearchQueryChange(value: string): void {
		this.filterChange.emit({ ...this.filterConfig(), searchQuery: value });
	}

	onLocationChange(value: string): void {
		this.filterChange.emit({ ...this.filterConfig(), selectedLocation: value });
	}

	onExperienceChange(value: string): void {
		this.filterChange.emit({ ...this.filterConfig(), selectedExperience: value });
	}

	onEmploymentTypeChange(value: string): void {
		this.filterChange.emit({ ...this.filterConfig(), selectedEmploymentType: value });
	}

	onStatusChange(value: string): void {
		this.filterChange.emit({ ...this.filterConfig(), selectedStatus: value });
	}
}
