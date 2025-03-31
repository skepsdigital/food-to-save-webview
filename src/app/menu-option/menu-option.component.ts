import { Component, OnInit, Input } from '@angular/core';
interface Option {
  name: string;
  icon?: any;
}
@Component({
  selector: 'menu-option', // Changed from app-menu-option
  templateUrl: './menu-option.component.html',
  styleUrls: ['./menu-option.component.scss']
})
export class MenuOptionComponent implements OnInit {
  @Input() option!: { name: string, icon?: string };

  constructor() { }

  ngOnInit(): void {
  }

}
