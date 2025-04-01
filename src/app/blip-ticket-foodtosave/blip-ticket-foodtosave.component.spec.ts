import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlipTicketFoodtosaveComponent } from './blip-ticket-foodtosave.component';

describe('BlipTicketFoodtosaveComponent', () => {
  let component: BlipTicketFoodtosaveComponent;
  let fixture: ComponentFixture<BlipTicketFoodtosaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlipTicketFoodtosaveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlipTicketFoodtosaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
