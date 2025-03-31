import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodToSaveSupportWebviewComponent } from './food-to-save-support-webview/food-to-save-support-webview.component';

const routes: Routes = [
  { path: ':token', component: FoodToSaveSupportWebviewComponent },
  { path: '**', component: FoodToSaveSupportWebviewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
