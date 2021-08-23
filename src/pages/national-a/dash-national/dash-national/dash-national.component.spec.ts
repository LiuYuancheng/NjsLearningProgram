import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashNationalComponent } from './dash-national.component';

describe('DashNationalComponent', () => {
  let component: DashNationalComponent;
  let fixture: ComponentFixture<DashNationalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashNationalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashNationalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
