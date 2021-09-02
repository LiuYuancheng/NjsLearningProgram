import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashNationalNameComponent } from './dash-national-name.component';

describe('DashNationalNameComponent', () => {
  let component: DashNationalNameComponent;
  let fixture: ComponentFixture<DashNationalNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashNationalNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashNationalNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
