import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BlipService } from '../services/blip.service';

@Component({
  selector: 'app-blip-ticket-foodtosave',
  templateUrl: './blip-ticket-foodtosave.component.html',
  styleUrls: ['./blip-ticket-foodtosave.component.scss']
})
export class BlipTicketFoodtosaveComponent implements OnInit {

  tickets: any[] = [];
  teams: any[] = [];
  attendants: any[] = [];

  showCreateTicketSuccess = false;
  createdTicketId = 0;

  createTicketMsg = '';

  categories = [
    {
      fila: '[E-mail] Atendimento B2B | Fila long tail',
      category: 'Comercial'
    },
    {
      fila: '[E-mail] Atendimento B2C | E-mail ativo',
      category: 'Email ativo'
    },
    {
      fila: '[E-mail] Atendimento B2C | Geral',
      category: 'Geral'
    },
    {
      fila: '[E-mail] Atendimento B2C | Pós-vendas (imagens)',
      category: 'Imagens'
    },
    {
      fila: '[E-mail] Atendimento B2C | Pós-vendas (réplicas)',
      category: 'Réplicas'
    },
    {
      fila: 'Atendimento B2B | Fila comprovante & contrato',
      category: 'Comprovante & Contrato'
    },
    {
      fila: 'Atendimento B2B | Fila contestação [chatbot]',
      category: 'Contestação'
    },
    {
      fila: 'Atendimento B2B | Fila contestação [painel]',
      category: 'Contestação painel'
    },
  ]

  newTicket = {
    email: '',
    name: '',
    subject: '',
    description: '',
    category: ''
  };

  teamTags: any = {}

  constructor(
    private http: HttpClient,
    private blipService: BlipService
  ) { }

  async ngOnInit() {
    this.blipService.startApplication();
    this.blipService.setDefinedHeight(10000)
    await this.reload();
  }

  async transferTickets(event: any, item: any) {
    let tickets = item.tickets.filter((t: any) => t.checked);

    if(tickets.length > 0) {
      this.blipService.startLoading();
      for(let ticket of tickets) {

        if(ticket.status.indexOf('Close') === -1 && ticket.status.indexOf('Transf') === -1) {
          
          await this.transferTicketToAgent(ticket.id, event.target.value, ticket.team);
        }
      }
    }
    this.blipService.stopLoading();
  }

  async createTicket() {
    console.log(this.newTicket);

    if(!this.newTicket.name || this.newTicket.name.length === 0 ||
      !this.newTicket.email || this.newTicket.email.length === 0 ||
      !this.newTicket.subject || this.newTicket.subject.length === 0) {
        return;
    }

    // 

    try {
      // https://blipticket.azurewebsites.net/foodtosave/create_customer_ticket
      const result = await this.http.post<any>('https://blipticket.azurewebsites.net/foodtosave/create_customer_ticket', {
        "email": this.newTicket.email,
        "nome": this.newTicket.name,
        "subject": this.newTicket.subject,
        "description": this.newTicket.description,
        "category": this.newTicket.category
      }).toPromise();
  
      console.log(result);
  
      this.createdTicketId = result.data;
      
      this.createTicketMsg = `Ticket ${this.createdTicketId} criado com sucesso! Caso queira criar um novo ticket, clique no botão abaixo`;
  
      this.showCreateTicketSuccess = true;
  
      this.newTicket = {
        email: '',
        name: '',
        subject: '',
        description: '',
        category: ''
      };
  
      return;
    } catch(e: any) {
      const delayTime = () =>
        new Promise((resolve: any) => setTimeout(() => {
            resolve(); 
      }, 5000));

      await delayTime();
      await this.retryCreateTicket();
    }
    
  }

  async retryCreateTicket() {
    try {
      // https://blipticket.azurewebsites.net/foodtosave/create_customer_ticket
      const result = await this.http.post<any>('https://blipticket.azurewebsites.net/foodtosave/create_customer_ticket', {
        "email": this.newTicket.email,
        "nome": this.newTicket.name,
        "subject": this.newTicket.subject,
        "description": this.newTicket.description,
        "category": this.newTicket.category
      }).toPromise();
  
      console.log(result);
  
      this.createdTicketId = result.data;
      
      this.createTicketMsg = `Ticket ${this.createdTicketId} criado com sucesso! Caso queira criar um novo ticket, clique no botão abaixo`;
  
      this.showCreateTicketSuccess = true;
  
      this.newTicket = {
        email: '',
        name: '',
        subject: '',
        description: '',
        category: ''
      };
  
      return;
    } catch(e: any) {
      this.showCreateTicketSuccess = true;
      this.newTicket = {
        email: '',
        name: '',
        subject: '',
        description: '',
        category: ''
      };
      this.createTicketMsg = `Falha ao criar ticket!\n\nError: ${e.message}!\n\nCaso queira criar um novo ticket, clique no botão abaixo`;
    }
  }

  async reload() {
    this.tickets = [];
    this.teams = [];
    this.attendants = [];

    let teams: any = [];

    this.teamTags = {};

    await this.listAttendants()
    await this.listTickets();


    for(let ticket of this.tickets) {
      
      if(ticket.status && ticket.status === 'Waiting') {
        ticket.tags = ['Novo'];
      } else if(ticket.status && ticket.status.indexOf('Transf') === -1 && ticket.status.indexOf('Clos') === -1) {
        ticket.tags = ['Aberto'];
      }

      ticket.checked = false;

      if(teams.filter((t: any) => t.team === ticket.team).length > 0) {
        let item = teams.find((t: any) => t.team === ticket.team);

        if(item.tickets.filter((t: any) => t.customerIdentity == ticket.customerIdentity).length > 0) {
          let currentTicket = item.tickets.find((t: any) => t.customerIdentity == ticket.customerIdentity);
          if(currentTicket.sequentialId < ticket.sequentialId) {
            ticket.openDate = currentTicket.openDate;
            currentTicket = ticket;
          }
        } else {
          item.tickets.push(ticket);
        }
      } else if(ticket.status != 'Transfer') {
        let obj: any = {
          team: ticket.team,
          tickets: [ticket]
        };
        teams.push(obj);
      }
      this.teams.push(ticket.team);
    }

    for(let item of teams) {
      for(let ticket of item.tickets) {
        if(ticket['tags'] && ticket['tags'].length > 0) {
          if(item[ticket['tags'][0]]) {
            item[ticket['tags'][0]]++;
          } else { 
            item[ticket['tags'][0]] = 1;
          }
        }
      }
    }

    this.teams = teams;

  }

  showDetails(item: any) {
    if(!item.details) {
      item.details = true;
    } else {
      item.details = false;
    }
  }

  async transferTicketToAgent(ticketId: any, event: any, team: any) {

    let result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
        "id": uuidv4(),
        "to": "postmaster@desk.msging.net",
        "method": "set",
        "uri": `/tickets/${ticketId}/transfer`,
        "type": "application/vnd.iris.ticket+json",
        "resource": {
            "agentIdentity": event?.target?.value,
            "team": team
        }
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
        }
      }).toPromise();

      console.log('transferTicketToAgent');
      console.log(result);
  }


  getCustomerEmail(ticketId: any, customerIdentity: any) {
    let replaceStr = '.' + ticketId;
    return customerIdentity.replace(replaceStr, '').replace('%40','@').replace('@0mn.io', '');
  }

  changeTeamFilter(team: any, filter: any) {
    team.filter = filter;
  }

  hasTag(filter: any, tags: any) {
    return tags.filter((t: any) => t == filter).length > 0;
  }

  async listAttendants() {
    let response = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
      "to": "postmaster@desk.msging.net",
      "method": "get",
      "uri": "/attendants",
      "id": uuidv4()
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
        }
      }).toPromise();

      this.attendants = response?.resource?.items;
      console.log(this.attendants);

  }

  async transferTicket() {

  }

  async listTickets() {
    let hasMore = true;
    let data: any[] = []
    let result: any = null;

    do {
        result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
        "id": uuidv4(),
        "method": "get",
        "to": "postmaster@desk.msging.net",
        "uri": `/tickets/history?$filter=storageDate%20ge%20datetimeoffset'2024-08-10T03%3A00%3A00.000Z'%20and%20storageDate%20le%20datetimeoffset'2024-08-31T23%3A59%3A00.000Z'%20&$skip=${data.length}&$take=100`,
      }, {
        headers: {
          'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
        }
      }).toPromise();


      if (result && result.resource && result.resource.items && result.resource.items.length > 0) {
        data = data.concat(result.resource.items);
      }

      hasMore = result && result.resource && result.resource.total > 0;
    } while (hasMore);


    result = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
      "method": "get",
    "to": "postmaster@desk.msging.net",
    "uri": "/monitoring/open-tickets?version=2&$take=500&$skip=0&refreshCache=true",
    "id": uuidv4(),
    "from": "blipticket1@msging.net",
    }, {
      headers: {
        'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
      }
    }).toPromise();


    if (result && result.resource && result.resource.items && result.resource.items.length > 0) {
      result.resource.items.map((s: any) => s.tags = ['Aberto']);
      data = data.concat(result.resource.items);
    }

    hasMore = result && result.resource && result.resource.total > 0;


    let response = await this.http.post<any>('https://foodtosave.http.msging.net/commands', {
      "method": "get",
    "to": "postmaster@desk.msging.net",
    "uri": "/monitoring/waiting-tickets?version=2&$take=500&$skip=0&refreshCache=true",
    "id": uuidv4(),
    "from": "blipticket1@msging.net",
    }, {
      headers: {
        'Authorization': "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
      }
    }).toPromise();


    if (response && response.resource && response.resource.items && response.resource.items.length > 0) {
      response.resource.items.map((s: any) => s.tags = ['Novo']);
      data = data.concat(response.resource.items);
    }

    hasMore = response && response.resource && response.resource.total > 0;
    
    this.tickets = data;
  }

  async listContacts() {

    let skip = 0;
    let hasContact = true;

    // do {

    // } while(hasContact);

    let result = await this.http.post('https://foodtosave.http.msging.net/commands', {
      "method": "get",
      "uri": `/contacts?$skip=${skip}&$take=100&$filter=(source%20ne%20'blip.ai'%20or%20source%20eq%20null)%20and%20(lastmessagedate%20ge%20datetimeoffset'2024-08-13T03%3A00%3A00.000Z')%20%20and%20(lastmessagedate%20le%20datetimeoffset'2024-08-21T02%3A59%3A00.000Z')%20`,
      "id": uuidv4(),
      "to": "postmaster@msging.net",
      "from": "blipticket1@msging.net",
    }, {
      headers: {
        Authorization: "Key YmxpcHRpY2tldDE6Zk9tNk4wZmJMVjB0M1d2YnZYdmY="
      }
    }).toPromise();

    console.log(result);

  }


}
