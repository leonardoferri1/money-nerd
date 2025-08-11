import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlySummaryComponent } from './yearly-summary.component';

describe('YearlySummaryComponent', () => {
  let component: YearlySummaryComponent;
  let fixture: ComponentFixture<YearlySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearlySummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YearlySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
