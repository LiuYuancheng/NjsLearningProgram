import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScamSectorDetailsComponent } from './scam-sector-details.component';

describe('ScamSectorDetailsComponent', () => {
  let component: ScamSectorDetailsComponent;
  let fixture: ComponentFixture<ScamSectorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScamSectorDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScamSectorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
