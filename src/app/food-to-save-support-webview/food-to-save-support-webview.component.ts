import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { Component, ComponentFactoryResolver, EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { MenuActionsService } from '../services/menu-actions.service';
import { BlipService } from '../services/blip.service';
import { environment } from 'src/environments/environment';

// @ts-ignore
import * as blipChat from 'blip-chat-widget';
import { Order, User, MessageMetadata, Menu } from "../models/types";

const PRD_ROUTER_KEY = "Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU="
const PRD_MAIN_BOT_SLUG = "foodtosave"
const PRD_ROUTER_SLUG = "foodtosave1"
const PRD_APP_KEY = "Zm9vZHRvc2F2ZTE6NmE2OTQ2ZTAtZmY2OS00NDNjLWI5MDAtZmZmN2Y1NDMxMTBh"
const HMG_APP_KEY = "Zm9vZHRvc2F2ZXJvdXRlcmhtZzpmZTNlY2I3My01OThhLTQzZTQtOWEwNi00NTllMWY3NjY1MmQ="
const HMG_ROUTER_KEY = "Key Zm9vZHRvc2F2ZXJvdXRlcmhtZzphZjNqY1VlV2RmTDQ0Ym9wS1lFdw=="
const HMG_ROUTER_SLUG = "foodtosaverouterhmg"
const HMG_MAIN_BOT_SLUG = "foodtosavehmg"

@Component({
  selector: 'app-food-to-save-support-webview',
  templateUrl: './food-to-save-support-webview.component.html',
  styleUrls: ['./food-to-save-support-webview.component.scss']
})
export class FoodToSaveSupportWebviewComponent implements OnInit {

  // url prod https://api.foodtosave.com.br/api/v1/
  // url hml https://api.sandbox.foodtosave.com
  //url = 'https://api.sandbox.foodtosave.com'//HOMOLOG
  private url = environment.apiUrl

  @Output() onGoQuestion = new EventEmitter<string>();
  @Output() onGoHome = new EventEmitter<string>();
  @Output() onGoQuestions = new EventEmitter<string>();
  @Output() onGoChat = new EventEmitter<string>();

  menu: Menu = {
    logistics: {
      title: "Problemas na entrega e/ou retirada",
      options: [
        "Meu pedido está atrasado",
        "Não recebi meu pedido",
        "Dúvidas sobre o rastreio", 
        "Endereço de entrega está errado",
        "Estabelecimento fechado para retirada"
      ]
    },
    afterSales: {
      title: "Problemas com pedido recebido",
      options: [
        "Problemas com a qualidade dos produtos recebidos",
        "Sacola não atendeu à expectativa"
      ]
    },
    payments: {
      title: "Dúvidas sobre pagamento",
      options: [
        "Dúvidas sobre estorno",
        "Reconhecimento de PIX",
        "Pagamento duplicado",
        "Cobrado, mas sem pedido no app",
        "Erro ao pagar pedido"
      ]
    },
    cancelations: {
      title: "Cancelamentos",
      options: []
    },
    partners: {
      title: "Quero ser parceiro",
      options: [
        "Como faço para cadastrar meu estabelecimento?",
        "Quero indicar novos estabelecimentos",
        "Já sou parceiro e preciso de suporte"
      ]
    },
    others: {
      title: "Outros assuntos",
      options: [
        "Cidades",
        "Problemas no App e/ou cadastro",
        "Caso não tenha encontrado sua dúvida, clique aqui"
      ]
    }
  };
  canOpenChat = true;
  isProduction = true;
  enableTabs = false;
  isEnableQuestion = false;
  isEnableChat = false;
  canSendMsg = true;
  isCollectingData = false;
  isloadingAnswer = false;
  answered = false;
  stateIds : string[] = [];
  isLoading = true;
  askReload = false;

  tab: any = {
    lateOrder: false,
    inappropriateProducts: false,
    paymentProblems: false
  };

  messages: any[] = [];

  cancelReasons = [
    {
      title: 'não vou conseguir retirar',
      type: 'TAKEOUT'
    },
    {
      title: 'horário de fechamento do estabelecimento.',
      type: 'TAKEOUT'
    },
    {
      title: 'pedi por engano',
      type: 'TAKEOUT'
    },
    {
      title: 'pedido com erro',
      type: 'TAKEOUT'
    },
    {
      title: 'outros',
      type: 'TAKEOUT'
    },
    {
      title: 'Endereço de entrega está errado',
      type: 'DELIVERY'
    },
    {
      title: 'me arrependi da compra',
      type: 'DELIVERY'
    },
    {
      title: 'pedi por engano',
      type: 'DELIVERY'
    }
  ];

  cancelReason = ''
  phrase: string = '';
  question: any = '';
  chat: any = '';
  token: any = '';
  orders: Order[] = [];
  firstName: string = '';
  user: User = {
    sub: "",
    iat: 0,
    name: null,
    email: null,
    phone: "",
    exp: 0,
    iss: ""
  };
  reason: any = '';

  currentOrder: Order | null = null;
  orderDetails: any = null;
  orderCanceled = false;
  failed = false;

  isEmailPriority = false;

  currentTab: string = '';

  isCancellable: boolean = false;
  private blipService: BlipService;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private menuActions: MenuActionsService
    
  ) { 
    this.blipService = new BlipService(this.http);
  }

  async ngOnInit() {

    // navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: true,
    // });

    let analyticsResult = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
      "id": uuidv4(),
      "to": "postmaster@analytics.msging.net",
      "method": "set",
      "type": "application/vnd.iris.eventTrack+json",
      "uri": "/event-track",
      "resource": {
        "category": "Abertura webview",
        "action": "Abertura"
      }
    }, {
      headers: {
        'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
        'Content-Type': 'application/json'
      }
    }).toPromise();

    this.token = this.route.snapshot.paramMap.get('token');


    try{
    if (this.token) {
      let emailsResult = await this.http.post<any>(`https://foodtosave.http.msging.net/commands`, {
        "id": uuidv4(),
        "method": "get",
        "uri": "/resources/emailsPrioritarios",
      }, {
        headers: {
          'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
          'Content-Type': 'application/json'
        }
      }).toPromise();


      this.user = JSON.parse(atob(this.token.split('.')[1]));
      console.log(this.user);

      if (this.user.email && this.user.name) {
        const possibleID = this.user.email + `-skeps`;
        if (await this.isOnAttendance(possibleID, PRD_ROUTER_KEY, PRD_ROUTER_SLUG)) {
          
          console.log("is on attendance");
          await this.openChat('');
          this.isLoading = false;
          return;

        }
        this.isLoading = false;

        if (emailsResult && emailsResult.resource) {
          let emails = emailsResult.resource.split(';');
          emails = emails.map((e: string) => e.toUpperCase());
          this.isEmailPriority = emails.filter((e: any) => e === this.user.email!.toUpperCase()).length > 0;
        }

        await this.getCurrentOrder(true);
        this.isCancellable = this.canCancelOrder();

        this.firstName = this.user && this.user.name ? this.user.name : '';

      }
    }else{
      this.askReload = true;
      await this.http.post(`https://foodtosave.http.msging.net/commands`, {
        "id": uuidv4(),
        "to": "postmaster@analytics.msging.net",
        "method": "set",
        "type": "application/vnd.iris.eventTrack+json",
        "uri": "/event-track",
        "resource": {
          "category": "debug no token",
          "action": `{token: ${this.token}}; user: ${JSON.stringify(this.user)}; orders: ${JSON.stringify(this.orders)}; datetime: ${new Date().toISOString()}`
        }
      }, {
        headers: {
          'Authorization': PRD_ROUTER_KEY,
          'Content-Type': 'application/json'
        }
      }).toPromise();
      
    }
    }catch(e){
      this.askReload = true;
      console.error("Error on init:"+ e);
      console.log(await this.http.post(`https://foodtosave.http.msging.net/commands`, {
        "id": uuidv4(),
        "to": "postmaster@analytics.msging.net",
        "method": "set",
        "type": "application/vnd.iris.eventTrack+json",
        "uri": "/event-track",
        "resource": {
          "category": "debug error",
          "action": `{token: ${this.token}}; user: ${JSON.stringify(this.user)}; orders: ${JSON.stringify(this.orders)}; datetime: ${new Date().toISOString()}`
        }
      }, {
        headers: {
          'Authorization': PRD_ROUTER_KEY,
          'Content-Type': 'application/json'
        }
      }).toPromise());
      return;
    }
    console.log(this.canCancelOrder());


    // let analyticsResultToken = await this.http.post(`https://foodtosave.http.msging.net/messages`, {
    //   "to": "gilberto.carvalho%40skeps.com.br@mailgun.gw.msging.net",
    //   "type": "text/plain",
    //   "content": "Token: " + this.token + ', user ' + JSON.stringify(this.user),
    //   "id": uuidv4()
    // },  {
    //   headers: {
    //     'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
    //     'Content-Type': 'application/json'
    //   }
    // }).toPromise();
  }

  async getCurrentOrder(refresh = false) {
    if(this.currentOrder != null && !refresh)return this.currentOrder;

    this.orders = await this.http.get<Order[]>(`${this.url}/api/v1/orders?first=0&limit=3`, {
      headers: {
        Authorization: "Bearer " + this.token
      },
    }).toPromise().catch((e) => {
      console.log(e);
      return [];
    });

    if (this.orders.length == 0){
      
      this.currentOrder = null;
      return null;
    }
    this.orders.forEach(order => delete order.merchant?.description);

    this.currentOrder = this.orders[0];

    if (this.currentOrder?.delivery_type !== 'TAKEOUT') {
      this.orderDetails = await this.http.get<any[]>(`${this.url}/api/v1/orders/${this.currentOrder!.id}/delivery-details`, {
        headers: {
          Authorization: "Bearer " + this.token
        },
      }).toPromise();
    }

    return this.currentOrder;

  }

  copyClipboard() {
    var input = document.createElement('textarea');
    input.innerHTML = this.token;
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
  }

  async enableTabClick(tab: any) {

    let analyticsResult = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
      "id": uuidv4(),
      "to": "postmaster@analytics.msging.net",
      "method": "set",
      "type": "application/vnd.iris.eventTrack+json",
      "uri": "/event-track",
      "resource": {
        "category": "Habilitar botão",
        "action": tab
      }
    }, {
      headers: {
        'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
        'Content-Type': 'application/json'
      }
    }).toPromise();

    this.tab[tab] = true;
    this.enableTabs = true;
    this.isEnableQuestion = false;
    this.isEnableChat = false;
    this.canSendMsg = true;
    this.isloadingAnswer = false;
  }

  backMenu() {
    this.isCollectingData = false;
    this.cancelReason = '';
    this.tab = {
      lateOrder: false,
      inappropriateProducts: false,
      paymentProblems: false
    };
    this.enableTabs = false;
    this.isEnableQuestion = false;
    this.currentTab = '';
    this.enableTabs = false;
    this.isEnableQuestion = false;
    this.isEnableChat = false;
    this.canSendMsg = true;
    this.isloadingAnswer = false;

    this.messages = [];
    this.question = '';
  }

  async openChat(phrase: string) {
    console.log("openChat");
    if (this.isEmailPriority) phrase = "#atendimento-prioritario";

    this.enableTabs = false;
    this.isEnableChat = true;
    this.isEnableQuestion = false;
    this.canSendMsg = true;
    this.isloadingAnswer = false;
    this.isCollectingData = false;



    let chat = new blipChat.BlipChat();
    this.chat = chat;


    let authObj: any = {
      authType: blipChat.BlipChat.DEV_AUTH,
      userIdentity: this.user && this.user.email ? this.user.email + '-skeps' : uuidv4(),
      userPassword: 'MTIzNDU2'
    };

    //object to set values into first contact
    let accountObj: any = {
      extras: {
        isLoggedIn: false
      }
    };

    
    if (this.user && this.user.email) {
      accountObj.email = this.user.email;
      accountObj.fullName = this.user.name;
      accountObj.name = this.user.name;
      accountObj.extras = {};
      accountObj.extras.email = this.user.email;
      accountObj.extras.fullName = this.user.name;
      accountObj.extras.isLoggedIn = true;
      accountObj.extras.token = this.token;
      accountObj.extras.orders = JSON.stringify(this.orders);

      this.resetUserState(authObj.userIdentity, PRD_ROUTER_KEY, PRD_MAIN_BOT_SLUG, PRD_ROUTER_SLUG);

    }


    const customMetadata: MessageMetadata = {
      isLoggedIn: this.user.email && this.user.name ? true : false
    };
    if (this.user.name) customMetadata.nomeUsuario = this.user.name;
    if (this.user.email) customMetadata.email = this.user.email;
    if (this.user.name) customMetadata.fullName = this.user.name;
    if (this.user.name) customMetadata.name = this.user.name;
    if (this.currentOrder) customMetadata.orders = JSON.stringify(this.orders);
    if (this.token) customMetadata.token = this.token;

    this.chat.withAppKey(PRD_APP_KEY)
      .withAuth(authObj)
      .withAccount(accountObj)
      .withEventHandler(blipChat.BlipChat.LOAD_EVENT, function () {
        chat.sendMessage({
          "type": "text/plain",
          "content": phrase,
          "metadata": {
            "#blip.hiddenMessage": true
          }
        })
      })
      .withCustomMessageMetadata(customMetadata)
      .withTarget('abmex-chat')
      .withCustomCommonUrl('https://foodtosave.chat.blip.ai/')
      .build();
  }
  
  //function to send the user to the start of the main chat
  async resetUserState(userIdentity: string, routerKey: string, mainBotSlug: string, routerSlug: string = 'foodtosaverouterhmg') {

    const header = {
      headers: {
        "Authorization": routerKey,
        "Content-Type": "application/json",
      }
    };


    //get all context variables
    const contextVariables = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
      "id": uuidv4(),
      "to": "postmaster@msging.net",
      "method": "get",
      "uri": "/contexts/" + encodeURIComponent(encodeURIComponent(userIdentity) + `.${routerSlug}@0mn.io`),
    }, header).toPromise();

    const contextVariablesTyped = contextVariables as { resource: { items: any[] } };

    if (!contextVariablesTyped || !contextVariablesTyped.resource || !contextVariablesTyped.resource.items) {
      return;
    }

    //extract stateIds
    

    //User on attendance
    if (await this.isOnAttendance(userIdentity, routerKey, routerSlug)) {
      console.log("not reseted because is on attendance");
      return;
    }

    //remove all stateIds
    const stateIds = await this.getStateIds(userIdentity, routerKey, routerSlug);

    for (let stateId of stateIds) {
      await this.http.post(`https://foodtosave.http.msging.net/commands`, {
        "id": uuidv4(),
        "to": "postmaster@msging.net",
        "method": "delete",
        "uri": "/contexts/" + encodeURIComponent(encodeURIComponent(userIdentity) + `.${routerSlug}@0mn.io`) + "/" + stateId,
      }, header).toPromise();
    }

    //change master state
    const masterState = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
      "id": uuidv4(),
      "to": "postmaster@msging.net",
      "method": "set",
      "uri": "/contexts/" + encodeURIComponent(encodeURIComponent(userIdentity) + `.${routerSlug}@0mn.io`) + "/master-state",
      "type": "text/plain",
      "resource": `${mainBotSlug}@msging.net`
    }, header).toPromise();


  }

  async isOnAttendance(userIdentity: string, routerKey: string, routerSlug: string = 'foodtosaverouterhmg'): Promise<boolean> {
    const header = {
      headers: {
        "Authorization": routerKey,
        "Content-Type": "application/json",
      }
    };

    const stateIds = await this.getStateIds(userIdentity, routerKey, routerSlug);

    console.log("stateIds", stateIds);
    for (let stateId of stateIds) {
      const stateResource: any = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
        "id": uuidv4(),
        "to": "postmaster@msging.net",
        "method": "get",
        "uri": "/contexts/" + encodeURIComponent(encodeURIComponent(userIdentity) + `.${routerSlug}@0mn.io`) + "/" + stateId
      }, header).toPromise()

      //User on attendance
      if (stateResource && stateResource.resource && stateResource.resource.startsWith("desk")) {
        return true;
      }
    }
    return false;



  }

  async getStateIds(userIdentity: string, routerKey: string, routerSlug: string = 'foodtosaverouterhmg'): Promise<string[]> {
    
    //Avoid multiple unecessary requests
    if(this.stateIds.length > 0){
      return this.stateIds;
    }

    const header = {
      headers: {
        "Authorization": routerKey,
        "Content-Type": "application/json",
      }
    };


    //get all context variables
    const contextVariables = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
      "id": uuidv4(),
      "to": "postmaster@msging.net",
      "method": "get",
      "uri": "/contexts/" + encodeURIComponent(encodeURIComponent(userIdentity) + `.${routerSlug}@0mn.io`),
    }, header).toPromise();

    const contextVariablesTyped = contextVariables as { resource: { items: any[] } };

    if (!contextVariablesTyped || !contextVariablesTyped.resource || !contextVariablesTyped.resource.items) {
      return [];
    }

    //extract stateIds
    const stateIds = (contextVariables as any).resource.items.filter((item: any) => item.startsWith('stateid@'));

    return stateIds;
  }

  openChatFailed() {
    this.enableTabs = false;
    this.isEnableChat = true;
    this.isEnableQuestion = false;
    this.canSendMsg = true;
    this.isloadingAnswer = false;

    let chat = new blipChat.BlipChat();
    this.chat = chat;

    let authObj: any = {
      authType: blipChat.BlipChat.DEV_AUTH,
      userIdentity: this.user && this.user.email ? this.user.email + '-skeps' : uuidv4(),
      userPassword: 'MTIzNDU2'
    };


    if (this.user && this.user.email) {
      authObj.email = this.user.email;
      authObj.name = this.user.name;
      authObj.fullName = this.user.name;
      authObj.extras = {};
      authObj.extras.email = this.user.email;
      authObj.extras.fullName = this.user.name;
    }

    this.chat.withAppKey('Zm9vZHRvc2F2ZTE6NmE2OTQ2ZTAtZmY2OS00NDNjLWI5MDAtZmZmN2Y1NDMxMTBh')
      .withAuth(authObj)
      .withEventHandler(blipChat.BlipChat.LOAD_EVENT, function () {
        chat.sendMessage({
          "type": "text/plain",
          "content": '#falhaapi',
          "metadata": {
            "#blip.hiddenMessage": true
          }
        })
      })
      .withCustomMessageMetadata({
        "nomeUsuario": this.user.name
      })
      .withTarget('abmex-chat')
      .withCustomCommonUrl('https://foodtosave.chat.blip.ai/')
      .build();
  }

  goQuestion() {

  }

  goHome() {

  }

  goQuestions() {

  }

  goChats() {

  }

  canEnableQuickCommand() {
    return this.currentOrder && this.currentOrder.status != 'CANCELED' && this.isProduction;
  }

  canCancelOrder() {
    if(!this.currentOrder)return false;
    console.log("Current order:", this.currentOrder);
    let deliveryDate = moment(this.currentOrder!.created_at);
    console.log("Tempo passado: ",moment.utc().diff(deliveryDate, 'minutes') )
    if (moment.utc().diff(deliveryDate, 'minutes') >= 5) {
      this.reason = 'A compra foi realizada há mais de 5 minutos, portanto não é possível seguir com o cancelamento por aqui.';
      this.canOpenChat = false;
      return false;
    }

    if (this.currentOrder!.status === 'CANCELED') {
      this.reason = 'O seu pedido de compra já foi cancelado';
      return false;
    }
    if (this.currentOrder!.delivery_type === 'TAKEOUT' && this.currentOrder!.status != 'CONCLUDED' && moment.utc().diff(deliveryDate, 'minutes') >= 5) {
      this.reason = 'O seu pedido de compra já foi solicitado há mais de 5 minutos, portanto não é possível seguir com o cancelamento';
      return false;
    } else if (this.orderDetails && this.orderDetails.status != 'PLANNED' && this.orderDetails.status != 'ASSIGNING' && moment().diff(deliveryDate, 'minutes') >= 5) {
      this.reason = 'O seu pedido já está em andamento e em rota de entrega, portanto não é possível seguir com o cancelamento';
      return false;
    }

    this.reason = '';

    return true;
  }

  async openProductWrong(message: string) {
    try {
      this.getCurrentOrder(true);
      this.phrase = message;
      this.menuActions.handleMenuAction(message, {
        token: this.token,
        currentOrder: this.currentOrder? this.currentOrder : undefined,
        openChat: (msg: string) => this.openChat(msg)
      }).then((response) => {
        console.log('Response from menu action:', response);
        this.reason = response.message;
        this.canOpenChat = response.canOpenChat;
        if(response.nextPage)this.currentTab = response.nextPage;
      });
    } catch (error) {
      console.error('Error handling menu action:', error);
      // Handle error appropriately
      this.openChat(message);
    }
  }

  openProblemProduct(message: any) {
    this.openChat(message);
  }

  backMainMenu() {
    this.currentTab = '';
  }

  openLogisticProblem() {
    this.openChat('#logistic-problem');
  }

  openPartnerQuestions(message: any) {
    this.openChat(message);
  }

  openPaymentQuestions(message: any) {
    this.openChat(message);
  }

  openOtherQuestions(message: any) {
    this.openChat(message);
  }

  openAttendance() {
    this.openChat('#attendance');
  }

  async openCancelOrder() {
    if (this.canEnableQuickCommand()) {
      this.enableTabClick('lateOrder')
      return await this.feedback('positive', 'cancelar');
    }
  }

  async sendMsg() {

    this.messages.push({
      text: this.question.replace(/\n/g, "<br>"),
      direction: 'user'
    });

    let question = this.question;
    this.question = '';
    this.canSendMsg = false;

    console.log(question);
    if (question.toUpperCase().indexOf('CANCEL') != -1) {
      console.log('identificou');
      if (this.canEnableQuickCommand()) {
        this.enableTabClick('lateOrder')
        return await this.feedback('positive', 'cancelar');
      }
    }


    await this.getAnswer(question);

    let elem = document.getElementById('scroll-body-conversation');
    if (elem) {
      elem.scrollTop = elem.scrollHeight + 10000;
    }

  }

  async cancelOrder() {
    try {

      await this.getCurrentOrder();
      if (this.canCancelOrder()) {

        if (this.cancelReason) {
          try {
            let analyticsResult2 = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
              "id": uuidv4(),
              "to": "postmaster@analytics.msging.net",
              "method": "set",
              "type": "application/vnd.iris.eventTrack+json",
              "uri": "/event-track",
              "resource": {
                "category": "Cancelar motivo",
                "action": this.cancelReason + ';' + JSON.stringify(this.currentOrder)
              }
            }, {
              headers: {
                'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
                'Content-Type': 'application/json'
              }
            }).toPromise();
          } catch (e) {

          }

        }



        let analyticsResult = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
          "id": uuidv4(),
          "to": "postmaster@analytics.msging.net",
          "method": "set",
          "type": "application/vnd.iris.eventTrack+json",
          "uri": "/event-track",
          "resource": {
            "category": "Botão cancelar",
            "action": "Solicitacao"
          }
        }, {
          headers: {
            'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
            'Content-Type': 'application/json'
          }
        }).toPromise();


        let result = await this.http.post(`${this.url}/api/v1/orders/${this.currentOrder!.id}/cancellations`, {
          "cancellation_reason": "CUSTOMER_GAVE_UP"
        }, {
          headers: {
            'Authorization': 'Bearer ' + this.token,
            'Content-Type': 'application/json'
          }
        }).toPromise();

        this.orderCanceled = true;
      }

    } catch (e) {
      this.orderCanceled = false;
      this.openChatFailed();
    }

  }

  async getAnswer(question: any) {

    this.isloadingAnswer = true;

    let analyticsResult = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
      "id": uuidv4(),
      "to": "postmaster@analytics.msging.net",
      "method": "set",
      "type": "application/vnd.iris.eventTrack+json",
      "uri": "/event-track",
      "resource": {
        "category": "Pergunta enviada",
        "action": question
      }
    }, {
      headers: {
        'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
        'Content-Type': 'application/json'
      }
    }).toPromise();


    let token = await this.http.get<any>('https://skepsreviewlistening.azurewebsites.net/api/foodtosave/refreshtoken').toPromise();



    let anwswer = await this.http.post<any>('https://discoveryengine.googleapis.com/v1alpha/projects/420032480770/locations/global/collections/default_collection/engines/food-to-save-suporte_1722448813124/servingConfigs/default_search:search',
      { "query": question, "pageSize": 10, "queryExpansionSpec": { "condition": "AUTO" }, "spellCorrectionSpec": { "mode": "AUTO" }, "contentSearchSpec": { "summarySpec": { "ignoreAdversarialQuery": true, "includeCitations": false, "summaryResultCount": 5, "modelSpec": { "version": "text-bison@002/answer_gen/v1" }, "modelPromptSpec": { "preamble": "Você é o agente virtual de atendimento da Food To Save.\n\nCaso você não tenha uma resposta disponível, apenas responda que não possui resposta para a pergunta e que o cliente pode conversar com um atendente." }, "answerLanguageCode": "pt-BR", } } },
      {
        headers: {
          'Authorization': 'Bearer ' + token.data.access_token,
          'Content-Type': 'application/json'
        }
      }).toPromise();

    this.messages.push({
      text: anwswer.summary.summaryText,
      direction: 'bot'
    });

    this.isloadingAnswer = false;

  }

  async feedback(feedback: string, phrase?: any) {
    if (phrase)this.phrase = phrase;

    this.blipService.trackEvent(this.currentTab, feedback, PRD_ROUTER_KEY);
    this.blipService.trackEvent(this.currentTab + "-" + this.phrase, feedback, PRD_ROUTER_KEY);
    

    // let analyticsResult = await this.http.post(`https://foodtosave.http.msging.net/commands`, {
    //   "id": uuidv4(),
    //   "to": "postmaster@analytics.msging.net",
    //   "method": "set",
    //   "type": "application/vnd.iris.eventTrack+json",
    //   "uri": "/event-track",
    //   "resource": {
    //     "category": "Feedback",
    //     "action": feedback
    //   }
    // }, {
    //   headers: {
    //     'Authorization': 'Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU=',
    //     'Content-Type': 'application/json'
    //   }
    // }).toPromise();

    if (feedback == 'negative') {
      if (this.user && this.user.email && this.user.email.length > 0) {
        this.openChat(this.phrase);
      } else {
        this.enableTabs = false;
        this.isEnableChat = false;
        this.canSendMsg = false;
        this.isloadingAnswer = false;
        this.isCollectingData = true;
      }
      // this.openChat(phrase);
      this.answered = false;
    } else {
      this.isCollectingData = false;
      this.answered = true;
    }
  }
  
}
