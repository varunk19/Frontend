import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightPlanComponent } from './flight-plan.component';

describe('FlightPlanComponent', () => {
  let component: FlightPlanComponent;
  let fixture: ComponentFixture<FlightPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlightPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
