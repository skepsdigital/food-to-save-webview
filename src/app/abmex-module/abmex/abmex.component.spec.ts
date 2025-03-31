import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmexComponent } from './abmex.component';

describe('AbmexComponent', () => {
  let component: AbmexComponent;
  let fixture: ComponentFixture<AbmexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
