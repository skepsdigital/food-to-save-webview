import { Component, OnInit } from '@angular/core';
import { BlipService } from './services/blip.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'PipefyBlipPlugin';

  count = 0;

  constructor(private blipService: BlipService, private router: Router) {}

  async ngOnInit() {
   
  }

  isUfcOrNotificationApp() {
    return this.router.url.indexOf('ufc') != -1 || this.router.url.indexOf('notification/app') != -1 || this.router.url.indexOf('foodtosave') != -1 || this.router.url.indexOf('movidesk') != -1;;
  }
}
