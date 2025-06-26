import { Injectable, Injector, Type } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class ModalOverlayService {
  private overlayRef?: OverlayRef;

  constructor(private overlay: Overlay, private injector: Injector) {}

  openModal<T extends object>(
    component: Type<T>,
    data?: Partial<T>
  ): { overlayRef: OverlayRef; instance: T } {
    this.close();

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const portal = new ComponentPortal(component, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);

    if (data) {
      Object.assign(componentRef.instance as T, data);
    }

    if ('onClose' in componentRef.instance) {
      const comp = componentRef.instance as any;
      comp.onClose?.subscribe?.(() => {
        this.close();
      });
    }

    return {
      overlayRef: this.overlayRef,
      instance: componentRef.instance as T,
    };
  }

  close() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
