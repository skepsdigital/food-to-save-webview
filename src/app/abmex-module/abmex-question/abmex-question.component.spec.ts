import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmexQuestionComponent } from './abmex-question.component';

describe('AbmexQuestionComponent', () => {
  let component: AbmexQuestionComponent;
  let fixture: ComponentFixture<AbmexQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmexQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmexQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
