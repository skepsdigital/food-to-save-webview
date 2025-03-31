import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-abmex-question',
  templateUrl: './abmex-question.component.html',
  styleUrls: ['./abmex-question.component.scss']
})
export class AbmexQuestionComponent implements OnInit {

  @Output() onGoQuestion = new EventEmitter<string>();
  @Output() onGoHome = new EventEmitter<string>();
  @Output() onGoQuestions = new EventEmitter<string>();
  @Output() onGoChat = new EventEmitter<string>();

  tab = 'home';

  constructor() { }

  ngOnInit(): void {
  }

  goQuestion() {
    this.onGoQuestion.emit('');
  }

  goHome() {
    this.onGoHome.emit('');
  }

  goQuestions() {
    this.onGoQuestions.emit('');
  }

  goChats() {
    this.onGoChat.emit('');
  }

}
