import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/Order';
import { environment } from 'src/environments/environment';
import { DeliveryDetailsResponse } from '../models/Responses';
import { BlipService } from './blip.service';

const PRD_ROUTER_KEY = "Key Zm9vZHRvc2F2ZTE6Q0pjUk43bXpQMWtsbVBoN2VpdHU="

export interface MenuActionsResponse {
  success: boolean;
  message: string;
  data?: any;
  canOpenChat: boolean;
  nextPage?: string;
}

@Injectable({
  providedIn: 'root'
})

export class MenuActionsService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {
    this.blipService = new BlipService(this.http);
  }
  private canOpenchat = true;
  private nextPage = "";
  private blipService: BlipService;

  async handleMenuAction(action: string, context: { token: string, currentOrder?: Order, openChat: any }): Promise<MenuActionsResponse> {
    try {
      switch (action) {
        case "Dúvidas sobre o rastreio":
          return await this.handleTrackingQuestions(context.token, context.currentOrder);
        default:
          return context.openChat(action);
      }
    } catch (e) {
      console.error("Error on handleMenuAction: ", JSON.stringify(e, null, 2));
      return context.openChat(action);
    }
  }

  async handleTrackingQuestions(token: string, currentOrder?: Order): Promise<MenuActionsResponse> {
    try {
      this.blipService.trackEvent("duvidasRastreio", "exibicao", PRD_ROUTER_KEY);

      this.nextPage = "duvidasRastreio";
      
      if (!currentOrder) {
        this.canOpenchat = true;
        this.blipService.trackEvent("duvidasRastreio", "sem pedido", PRD_ROUTER_KEY, {token: token});
        return this.mountResponse("Não foi possível encontrar informações sobre o seu pedido. Por favor, feche o app e abra novamente.");
      }

      if (currentOrder.delivery_type !== "DELIVERY") {
        this.blipService.trackEvent("duvidasRastreio", `!delivery-${currentOrder.delivery_type}`, PRD_ROUTER_KEY, {token: token});
        this.canOpenchat = true;
        return this.mountResponse("Como esse é um pedido para retirada no local, ele não tem rastreio. Mas pode ficar tranquilo! É só ir até o local no mesmo dia da compra e mostrar seu número de pedido para garantir a sua sacola. 😊");
      }

      const response = await this.http.get(
        `${this.apiUrl}/api/v1/orders/${currentOrder.id}/delivery-details`,
        {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`
          }
        }
      ).toPromise();

      console.log("Delivery details response: ", JSON.stringify(response, null, 2));

      const deliveryDetailsResponse = response as DeliveryDetailsResponse;

      console.log("Delivery details response: ", JSON.stringify(deliveryDetailsResponse, null, 2));

      this.blipService.trackEvent("duvidasRastreio", `status-${deliveryDetailsResponse.status}`, PRD_ROUTER_KEY, {token: token, currentOrder: currentOrder});
      var message = "";
      switch (deliveryDetailsResponse.status) {
        case "CANCELLED":
          this.canOpenchat = false;
          message = "Seu pedido foi cancelado. Se tiver qualquer problema, é só entrar em contato com a gente.";
          break;

        case "PLANNED":
        case "ASSIGNING":
          this.canOpenchat = false;
          message = "Seu pedido já está confirmado e estamos buscando um entregador. Assim que ele sair da loja, você poderá ver o trajeto em tempo real no aplicativo.";
          break;

        case "ASSIGNED":
        case "DEPARTED":
        case "PICKED_UP":
        case "AT_DELIVERY":
          this.canOpenchat = false;
          message = `Quem está cuidando da sua entrega é o/a ${deliveryDetailsResponse.logistic_operator} e você já pode acompanhar o trajeto direto pelo app.`;
          break;
        case "DELIVERED":
        case "FINISHED":
          this.canOpenchat = false;
          message = "Seu pedido foi entregue! 🎉 Se tiver qualquer problema, é só entrar em contato com a gente. Selecione \"Não recebi meu pedido\" no menu anterior pra que possamos te ajudar!";
          break;
        case "FAILED":
          this.canOpenchat = true;
          message = "Não conseguimos entregar seu pedido. Você pode entrar em contato com a gente para resolver isso. Selecione \"Não recebi meu pedido\" no menu anterior pra que possamos te ajudar!";
          break;
        case "RETURNING":
          this.canOpenchat = true;
          message = "Seu pedido está voltando para a loja. Não foi possível concluir a entrega! Se tiver qualquer problema, é só entrar em contato com a gente.";
          break;
        case "RETURN_FINISHED":
          this.canOpenchat = false;
          message = "Seu pedido foi devolvido. Se tiver qualquer problema, é só entrar em contato com a gente.";
          break;
        default:
          this.blipService.trackEvent("duvidasRastreio", `untreated-${deliveryDetailsResponse.status}`, PRD_ROUTER_KEY, {token: token, currentOrder: currentOrder});
          throw new Error('Status de entrega não reconhecido');
      }
      return this.mountResponse(message, deliveryDetailsResponse, this.canOpenchat);
    } catch (e) {
      this.blipService.trackEvent("duvidasRastreio", "error", PRD_ROUTER_KEY, {token: token, currentOrder: currentOrder, error: e});
      console.error("Error on handleTrackingQuestions: ", JSON.stringify(e, null, 2));
      this.canOpenchat = true;
      return this.mountResponse("Ocorreu um erro ao buscar as informações de entrega do seu pedido. Por favor, tente novamente mais tarde.");
    }
  }

  mountResponse(message: string, data?: any, canOpenChat?: boolean) {
    console.log("Mounting response: ", message, data, canOpenChat);
    canOpenChat = canOpenChat || this.canOpenchat;
    return {
      success: true,
      message: message,
      data: data,
      canOpenChat: canOpenChat,
      nextPage: this.nextPage
    } as MenuActionsResponse;
  }
}