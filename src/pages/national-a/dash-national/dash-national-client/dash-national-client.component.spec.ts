import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashNationalClientComponent } from './dash-national-client.component';

describe('DashNationalClientComponent', () => {
  let component: DashNationalClientComponent;
  let fixture: ComponentFixture<DashNationalClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashNationalClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashNationalClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
