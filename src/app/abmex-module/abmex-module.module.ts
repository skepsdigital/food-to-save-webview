import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TagCloudComponent } from 'angular-tag-cloud-module';
import { AbmexRoutingModule } from './abmex-routing.module';
import { AbmexComponent } from './abmex/abmex.component';
import { AbmexChatsComponent } from './abmex-chats/abmex-chats.component';
import { AbmexHomeComponent } from './abmex-home/abmex-home.component';
import { AbmexQuestionComponent } from './abmex-question/abmex-question.component';
import { AbmexQuestionsComponent } from './abmex-questions/abmex-questions.component';



@NgModule({
  declarations: [
    AbmexComponent,
    AbmexChatsComponent,
    AbmexHomeComponent,
    AbmexQuestionComponent,
    AbmexQuestionsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    TagCloudComponent,
    AbmexRoutingModule
  ],
  entryComponents: [
    AbmexQuestionComponent,
    AbmexHomeComponent
  ]
})
export class AbmexModuleModule { }
