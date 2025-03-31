import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';


declare var require: any;
const IframeMessageProxy = require('iframe-message-proxy');
const uuid = require('uuid');

@Injectable({
  providedIn: 'root'
})
export class BlipService {

  application: any = null;

  authKey = '';

  organizationId = '';

  constructor(
    private http: HttpClient,
  ) { }

  startDefinedApplication(height: any) {
    IframeMessageProxy.IframeMessageProxy.listen();
    this.setDefinedHeight(height);
  }

  startApplication() {
    IframeMessageProxy.IframeMessageProxy.listen();
    this.setHeight();
  }

  getAuthKey() {
    return this.authKey;
  }

  startLoading = () => IframeMessageProxy.IframeMessageProxy.sendMessage({ action: 'startLoading' })

  stopLoading = () => IframeMessageProxy.IframeMessageProxy.sendMessage({ action: 'stopLoading' })

  setHeight() {
    setTimeout(() => {
      const height = document.getElementById('main')?.scrollHeight;
      IframeMessageProxy.IframeMessageProxy.sendMessage({ action: 'heightChange', content: height ? height + 5000 : 5000 });
    }, 2000)
  }

  setDefinedHeight(height: any) {
    setTimeout(() => {
      IframeMessageProxy.IframeMessageProxy.sendMessage({ action: 'heightChange', content: height ? height + 5000 : 5000 });
    }, 2000)
  }

  async getAuthorizationKey() {
    const response = await IframeMessageProxy.IframeMessageProxy.sendMessage({
      action: 'getApplication',
    });
    if (response && response.response && response.response.shortName && response.response.accessKey) {
      this.authKey = 'Key ' + btoa(`${response.response.shortName}:` + atob(response.response.accessKey));
    } else {
      this.authKey = 'Key cGx1Z2ludGVzdGU6R000MmY1MkJFOFdFbVNtN25uT0k=' // only for tests;
    }

    this.application = response;
  }
  public async trackEvent(category: string, action: string, Authorization: string, extras?: any):Promise<boolean> {
    try {
    
      const payload = {
        "id": uuidv4(),
        "to": "postmaster@analytics.msging.net",
        "method": "set",
        "type": "application/vnd.iris.eventTrack+json",
        "uri": "/event-track",
        "resource": {
          "category": category,
          "action": action,
          "extras": extras || {}
        }
      }
      if (extras) {
        payload.resource.extras = extras;
      }
      
      await this.http.post(`https://foodtosave.http.msging.net/commands`, payload, {
        headers: {
          'Authorization': Authorization,
          'Content-Type': 'application/json'
        }
      }).toPromise();
      console.log('Event tracked successfully');
      return true;
    }
    catch (error) {
      console.error('Error tracking event:', error);
      return false;
    }
  }
  
}
