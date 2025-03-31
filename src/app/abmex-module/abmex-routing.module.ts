import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbmexComponent } from './abmex/abmex.component';

const routes: Routes = [
    { path: '**', component: AbmexComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbmexRoutingModule { }
