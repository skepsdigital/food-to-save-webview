import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmexHomeComponent } from './abmex-home.component';

describe('AbmexHomeComponent', () => {
  let component: AbmexHomeComponent;
  let fixture: ComponentFixture<AbmexHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmexHomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmexHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
