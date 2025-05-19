import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { startLoading, stopLoading } from './loading.actions';
import { LoadingState } from './loading.state';
import { selectIsLoading } from './loading.selectors';

@Injectable({
  providedIn: 'root',
})
export class LoadingFacade {
  isLoading$: Observable<boolean>;

  constructor(private store: Store<LoadingState>) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  startLoading(): void {
    this.store.dispatch(startLoading());
  }

  stopLoading(): void {
    this.store.dispatch(stopLoading());
  }
}
