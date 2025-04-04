import { CUSTOM_ELEMENTS_SCHEMA, DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import * as wordcloud from 'highcharts/modules/wordcloud.src';
import { CommonModule } from '@angular/common';
import { AbmexModuleModule } from './abmex-module/abmex-module.module';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { FoodToSaveSupportWebviewComponent } from './food-to-save-support-webview/food-to-save-support-webview.component';
import { MenuOptionComponent } from './menu-option/menu-option.component';
import { MenuSectionComponent } from './menu-section/menu-section.component';
import { BlipTicketComponent } from './blip-ticket/blip-ticket.component';
import { FoodToSavePipelineComponent } from './food-to-save-pipeline/food-to-save-pipeline.component';
import { BlipTicketFoodtosaveComponent } from './blip-ticket-foodtosave/blip-ticket-foodtosave.component';

registerLocaleData(localePt);

@NgModule({
  declarations: [
      AppComponent,
      FoodToSaveSupportWebviewComponent,
      MenuOptionComponent,
      MenuSectionComponent,
      BlipTicketComponent,
      FoodToSavePipelineComponent,
      BlipTicketFoodtosaveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ChartModule,
    CommonModule,
    FormsModule,
    AbmexModuleModule
  ],
  providers: [
    { provide: HIGHCHARTS_MODULES, useFactory: () => [ wordcloud ] }, // add as factory to your providers
    {
        provide:  DEFAULT_CURRENCY_CODE,
        useValue: 'BRL'
    },
    { provide: LOCALE_ID, useValue: 'pt-BR' }    
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
