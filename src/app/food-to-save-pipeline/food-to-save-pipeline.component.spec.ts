import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodToSavePipelineComponent } from './food-to-save-pipeline.component';

describe('FoodToSavePipelineComponent', () => {
  let component: FoodToSavePipelineComponent;
  let fixture: ComponentFixture<FoodToSavePipelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodToSavePipelineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodToSavePipelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
