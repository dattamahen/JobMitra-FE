import { Injectable, signal } from '@angular/core';
import { fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  isOnline = signal(navigator.onLine);

  constructor() {
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(status => this.isOnline.set(status));
  }
}
