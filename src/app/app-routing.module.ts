import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodToSaveSupportWebviewComponent } from './food-to-save-support-webview/food-to-save-support-webview.component';
import { BlipTicketComponent } from './blip-ticket/blip-ticket.component';
import { FoodToSavePipelineComponent } from './food-to-save-pipeline/food-to-save-pipeline.component';

const routes: Routes = [
  { path: 'blipticket', component: BlipTicketComponent },
  { path: 'foodtosave/pipeline', component: FoodToSavePipelineComponent },
  { path: ':token', component: FoodToSaveSupportWebviewComponent },
  { path: '**', component: FoodToSaveSupportWebviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
