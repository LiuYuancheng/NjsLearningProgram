import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashNationalPopupComponent } from './dash-national-popup.component';

describe('DashNationalPopupComponent', () => {
  let component: DashNationalPopupComponent;
  let fixture: ComponentFixture<DashNationalPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashNationalPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashNationalPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
