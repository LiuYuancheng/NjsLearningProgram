import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashNationalSectorComponent } from './dash-national-sector.component';

describe('DashNationalSectorComponent', () => {
  let component: DashNationalSectorComponent;
  let fixture: ComponentFixture<DashNationalSectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashNationalSectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashNationalSectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
