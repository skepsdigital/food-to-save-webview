import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmexQuestionsComponent } from './abmex-questions.component';

describe('AbmexQuestionsComponent', () => {
  let component: AbmexQuestionsComponent;
  let fixture: ComponentFixture<AbmexQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmexQuestionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmexQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
