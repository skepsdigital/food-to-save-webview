import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbmexChatsComponent } from './abmex-chats.component';

describe('AbmexChatsComponent', () => {
  let component: AbmexChatsComponent;
  let fixture: ComponentFixture<AbmexChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbmexChatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbmexChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
