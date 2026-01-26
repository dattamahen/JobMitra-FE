import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private platformId = inject(PLATFORM_ID);
  isOnline = signal(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOnline.set(navigator.onLine);
      merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false))
      ).subscribe(status => this.isOnline.set(status));
    }
  }
}
