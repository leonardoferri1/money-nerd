import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as LoadingActions from './loading.actions';

@Injectable()
export class LoadingEffects {
  constructor(private actions: Actions) {}

  logLoading$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(LoadingActions.startLoading, LoadingActions.stopLoading),
        tap((action) => console.log('Loading action:', action))
      ),
    { dispatch: false }
  );
}
