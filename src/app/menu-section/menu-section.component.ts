import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MenuSection } from '../models/Menu';

@Component({
  selector: 'menu-section',
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.scss']
})
export class MenuSectionComponent {
  @Input() menuSection?: MenuSection;
  @Input() currentTab: string = '';
  @Input() tabName: string = '';
  
  @Output() backToMain = new EventEmitter<void>();
  @Output() optionSelected = new EventEmitter<string>();
  
  goBack() {
    this.backToMain.emit();
  }
  
  onOptionClick(option: string) {
    this.optionSelected.emit(option);
  }
}
