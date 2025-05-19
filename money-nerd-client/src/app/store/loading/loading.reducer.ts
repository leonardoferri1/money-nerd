import { createReducer, on } from '@ngrx/store';
import * as LoadingActions from './loading.actions';

export const initialState = false;

export const loadingReducer = createReducer(
  initialState,
  on(LoadingActions.startLoading, () => true),
  on(LoadingActions.stopLoading, () => false)
);
