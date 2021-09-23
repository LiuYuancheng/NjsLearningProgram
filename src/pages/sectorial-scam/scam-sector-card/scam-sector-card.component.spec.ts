import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScamSectorCardComponent } from './scam-sector-card.component';

describe('ScamSectorCardComponent', () => {
  let component: ScamSectorCardComponent;
  let fixture: ComponentFixture<ScamSectorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScamSectorCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScamSectorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
