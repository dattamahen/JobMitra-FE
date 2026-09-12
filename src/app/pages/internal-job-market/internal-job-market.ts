import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { JobSearchPage } from '../job-search/job-search';

@Component({
  selector: 'app-internal-job-market',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JobSearchPage],
  templateUrl: './internal-job-market.html'
})
export class InternalJobMarketPage {
  navigateToPage = input<(event: { page: string }) => void>();
}
