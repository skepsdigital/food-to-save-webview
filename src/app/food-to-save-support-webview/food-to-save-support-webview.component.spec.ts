import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodToSaveSupportWebviewComponent } from './food-to-save-support-webview.component';

describe('FoodToSaveSupportWebviewComponent', () => {
  let component: FoodToSaveSupportWebviewComponent;
  let fixture: ComponentFixture<FoodToSaveSupportWebviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FoodToSaveSupportWebviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoodToSaveSupportWebviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
