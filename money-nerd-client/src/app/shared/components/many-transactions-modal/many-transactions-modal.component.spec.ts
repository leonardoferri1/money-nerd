import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManyTransactionsModalComponent } from './many-transactions-modal.component';

describe('ManyTransactionsModalComponent', () => {
  let component: ManyTransactionsModalComponent;
  let fixture: ComponentFixture<ManyTransactionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManyTransactionsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManyTransactionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
