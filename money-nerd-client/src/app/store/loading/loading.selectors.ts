import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectLoadingState = createFeatureSelector<boolean>('loading');

export const selectIsLoading = createSelector(
  selectLoadingState,
  (state) => state
);
