import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { startLoading, stopLoading } from '../store/loading/loading.actions';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.store.dispatch(startLoading());

    return next
      .handle(request)
      .pipe(finalize(() => this.store.dispatch(stopLoading())));
  }
}
