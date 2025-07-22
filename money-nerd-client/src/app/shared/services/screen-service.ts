import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenService implements OnDestroy {
  private screenWidthSubject = new BehaviorSubject<number>(window.innerWidth);
  screenWidth$ = this.screenWidthSubject.asObservable();

  private resizeSubscription: Subscription;

  constructor() {
    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.screenWidthSubject.next(window.innerWidth);
    });
  }

  get currentWidth(): number {
    return this.screenWidthSubject.getValue();
  }

  ngOnDestroy(): void {
    this.resizeSubscription.unsubscribe();
  }
}
