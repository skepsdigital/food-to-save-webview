import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlipTicketComponent } from './blip-ticket.component';

describe('BlipTicketComponent', () => {
  let component: BlipTicketComponent;
  let fixture: ComponentFixture<BlipTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlipTicketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlipTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
