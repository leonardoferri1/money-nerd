import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WealthGrowthSummaryComponent } from './wealth-growth-summary.component';

describe('WealthGrowthSummaryComponent', () => {
  let component: WealthGrowthSummaryComponent;
  let fixture: ComponentFixture<WealthGrowthSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WealthGrowthSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WealthGrowthSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
