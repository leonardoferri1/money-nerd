import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewItemMenuComponent } from './new-item-menu.component';

describe('LoadingSpinnerComponent', () => {
  let component: NewItemMenuComponent;
  let fixture: ComponentFixture<NewItemMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewItemMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewItemMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
