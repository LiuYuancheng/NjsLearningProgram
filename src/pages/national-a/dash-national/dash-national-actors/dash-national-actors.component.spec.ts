import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashNationalActorsComponent } from './dash-national-actors.component';

describe('DashNationalActorsComponent', () => {
  let component: DashNationalActorsComponent;
  let fixture: ComponentFixture<DashNationalActorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashNationalActorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashNationalActorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
