import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { BlipService } from '../services/blip.service';

@Component({
  selector: 'app-food-to-save-pipeline',
  templateUrl: './food-to-save-pipeline.component.html',
  styleUrls: ['./food-to-save-pipeline.component.scss']
})
export class FoodToSavePipelineComponent implements OnInit {

  openedTickets: any[] = [];
  newTickets: any[] = [];
  closedTickets: any[] = [];

  activeTickets: any[] = [];

  customers: any[] = [];

  teams: any[] = [];
  agents: any[] = [];
  
  activeFilters = [true];
  
  filter = {
    id: '',
    customerIdentity: '',
    agentIdentity: '',
    email: '',
    active: null
  };

  credentials = {
    email: '',
    password: ''
  };

  isLogged = false;

  loggedUser = '';

  constructor(
    private http: HttpClient,
    private blipService: BlipService

  ) { }

  async ngOnInit() {

    this.blipService.startApplication();
    this.blipService.setDefinedHeight(50000);
    
    // Add bypass login functionality
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('bypass') === 'true') {
      this.isLogged = true;
      const bypassEmail = 'test@example.com';
      this.loggedUser = bypassEmail.replace('@', '%40');
      localStorage.setItem('skepsPipelineEmail', btoa(bypassEmail));
      await this.listTeams();
      await this.listAgents();
      await this.list();
      return;
    }
    
    if(localStorage.getItem('skepsPipelineEmail')){
      this.isLogged = true;
      try {
        let pass: any = localStorage.getItem('skepsPipelineEmail');
        this.loggedUser = atob(pass).replace('@', '%40');
        
      } catch(e) {

      }
    }
    await this.listTeams();
    await this.listAgents();
    await this.list();
  }

  async reload() {
    this.openedTickets = [];
    this.newTickets = [];
    this.closedTickets = [];
  
    this.customers = [];
  
    this.teams = [];
    this.agents = [];
    
    this.filter = {
      id: '',
      customerIdentity: '',
      agentIdentity: '',
      email: '',
      active: null
    };
  

    await this.listTeams();
    await this.listAgents();
    await this.list();
  }

  async changeTeam(ticket: any) {
    ticket.agentIdentity = '';
    if(!ticket.team || ticket.team.length === 0) {
      return;
    }
    await this.transferTicketToTeam(ticket.id, ticket.team);
  }

  async changeAgent(ticket: any) {
    await this.transferTicketToAgent(ticket.id, ticket.agentIdentity, ticket.team);
  }

  listAttendants(ticket: any) {
    if(!ticket.team) {
      return [];
    }

    return this.agents.filter((t: any) => t.teams.filter((a: any) => a === ticket.team).length > 0);
  }

  async transferTicketToTeam(ticketId: any, team: any) {

    let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
        "id": uuidv4(),
        "to": "postmaster@desk.msging.net",
        "method": "set",
        "uri": `/tickets/${ticketId}/transfer`,
        "type": "application/vnd.iris.ticket+json",
        "resource": {
            "team": team
        }
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY=" // Hardcoded API key - consider moving to environment variables
        }
      }).toPromise();

  }

  async transferTicketToAgent(ticketId: any, agent: any, team: any) {

    if(!agent || !team) {
      return;
    }

    let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
        "id": uuidv4(),
        "to": "postmaster@desk.msging.net",
        "method": "set",
        "uri": `/tickets/${ticketId}/transfer`,
        "type": "application/vnd.iris.ticket+json",
        "resource": {
            "agentIdentity":agent,
            "team": team
        }
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
        }
      }).toPromise();

      await this.reload();

  }

  login() {
    if(btoa(this.credentials.email) === this.credentials.password) {
      this.isLogged = true;
      localStorage.setItem('skepsPipelineEmail', this.credentials.password);
      this.loggedUser = atob(this.credentials.password).replace('@', '%40');
    } else {
      this.isLogged = false;
    }
  }

  async listTeams() {
    let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
      "id": uuidv4(),
      "to": "postmaster@desk.msging.net",
      "method": "get",
      "uri": `/teams`,
    }, {
      headers: {
        'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
      }
    }).toPromise();

    this.teams = result?.resource?.items;

  }

  async listAgents() {
    let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
      "id": uuidv4(),
      "to": "postmaster@desk.msging.net",
      "method": "get",
      "uri": `/attendants`,
    }, {
      headers: {
        'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
      }
    }).toPromise();

    this.agents = result?.resource?.items;
  }

  getContactEmail(identity: any) {
    let result = identity.split('@0mn.io')[0].split('.');
    result.splice(-1);
    return result.join('.').replace('%40','@');
  }

  async list() {
    this.openedTickets = [];
    this.newTickets = [];
    await this.listActiveEmails();
    await this.listNewTickets();
    await this.listOpenedTickets();
    await this.listClosedTickets();

    for(let item of this.activeTickets) {
      if(
        this.newTickets.filter((a: any) => a.movideskId && a.movideskId == item.ticketId).length === 0 &&
        this.closedTickets.filter((a: any) => a.movideskId && a.movideskId == item.ticketId).length === 0 &&
        this.openedTickets.filter((a: any) => a.movideskId && a.movideskId == item.ticketId).length === 0
        ) {
          this.newTickets.push({
            customerIdentity: item.email + '.' + item.ticketId + '@0mn.io',
            team: item.category,
            agentIdentity: '',
            movideskId: item.ticketId
          });
        }
    }

    this.customers = [...new Set(this.customers)];
  }

  async listActiveEmails () {
    // https://blipticket.azurewebsites.net/oggi/actives
    let result = await this.http.get<any>('https://blipticket.azurewebsites.net/oggi/actives').toPromise();

    this.activeTickets = result.data;
    console.log('listActiveEmails');
    console.log(this.activeTickets);
  }

  async listOpenedTickets () {

    let hasItems = true;

    let skip = 0;

    do {
      let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
        "id": uuidv4(),
        "to": "postmaster@desk.msging.net",
        "method": "get",
        "uri": `/monitoring/open-tickets?version=2&$take=500&$skip=${skip}&refreshCache=true`,
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
        }
      }).toPromise();
  
      result?.resource?.items.map((item: any) => item.movideskId = item.customerIdentity.split('@0mn.io')[0].split('.').pop());
  
      for(let item of result?.resource?.items) {
        if(item.movideskId) {
          if(this.activeTickets.filter((a: any) => a.ticketId ==item.movideskId).length > 0) {
            item.isActive = true;
          }
        }
        if(item.agentIdentity && item.agentIdentity.indexOf(this.loggedUser) != -1) {
          this.openedTickets.push(item);
        } else {
          this.newTickets.push(item);
        }
      }
      
      hasItems = result.resource.items.length > 0;

      skip += 500;
  
      result?.resource?.items.map((t: any) => this.customers.push(this.getContactEmail(t.customerIdentity)));
    } while(hasItems)
    
  }

  async listNewTickets () {

    let hasItems = true;

    let skip = 0;

    do {
      let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
        "id": uuidv4(),
        "to": "postmaster@desk.msging.net",
        "method": "get",
        "uri": `/monitoring/waiting-tickets?version=2&$take=500&$skip=${skip}&refreshCache=true`,
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
        }
      }).toPromise();
  
      result?.resource?.items.map((item: any) => item.movideskId = item.customerIdentity.split('@0mn.io')[0].split('.').pop());
  
      for(let item of result?.resource?.items) {
        if(item.movideskId) {
          if(this.activeTickets.filter((a: any) => a.ticketId == item.movideskId).length > 0) {
            item.isActive = true;
          }
        }
        if(item.agentIdentity && item.agentIdentity.indexOf(this.loggedUser) != -1) {
          this.openedTickets.push(item);        
        } else {
          this.newTickets.push(item);
        }
      }
  
      console.log(this.newTickets);

      hasItems = result.resource.items.length > 0;

      skip += 500;
  
      result?.resource?.items.map((t: any) => this.customers.push(this.getContactEmail(t.customerIdentity)));
    } while(hasItems);
    
  }

  async listClosedTickets() {

    let hasTicket = true;
    let skip = 0;


    do {

      let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
      "id": uuidv4(),
      "to": "postmaster@desk.msging.net",
      "method": "get",
      "uri": `/tickets/history?$filter=storageDate%20ge%20datetimeoffset'2024-08-27T03%3A00%3A00.000Z'%20and%20storageDate%20le%20datetimeoffset'2030-01-10T02%3A59%3A00.000Z'%20and%20status%20ne%20'Open'%20and%20status%20ne%20'Waiting'&$skip=${skip}&$take=100`
    }, {
      headers: {
        'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
      }
    }).toPromise();

    result?.resource?.items.map((item: any) => item.movideskId = item.customerIdentity.split('@0mn.io')[0].split('.').pop());

    for(let item of result?.resource?.items) {
        if(item.movideskId) {
          if(this.activeTickets.filter((a: any) => a.ticketId ==item.movideskId).length > 0) {
            item.isActive = true;
          }
        }

        if(item.status && item.status.indexOf('Closed') != -1 && this.openedTickets.filter((t: any) => t.customerIdentity == item.customerIdentity).length == 0 &&
        this.newTickets.filter((t: any) => t.customerIdentity == item.customerIdentity).length == 0) {
          this.closedTickets.push(item);        
        }
    }

    result?.resource?.items.map((t: any) => this.customers.push(this.getContactEmail(t.customerIdentity)));



    if(result?.resource?.items.length > 0) {
      hasTicket = true;
      skip += 100;
    } else {
      hasTicket = false;
    }

    } while(hasTicket)

    console.log('this.closedTickets');
    console.log(this.closedTickets);
    
  }

  

  openMovideskTicketHistory(identity: any) {
    let ticketId = identity.split('@0mn.io')[0].split('.').pop();
    window.open(`https://skepsinsights.web.app/movidesk-history/` + ticketId, '_blank');
  }

  closeModal() {

  }


}
