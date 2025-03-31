import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-abmex',
  templateUrl: './abmex.component.html',
  styleUrls: ['./abmex.component.scss']
})
export class AbmexComponent implements OnInit {

  tab = 'home';

  constructor() { }

  ngOnInit(): void {
  }

  changeTab(tab: any) {
    this.tab = tab;
  }

}
