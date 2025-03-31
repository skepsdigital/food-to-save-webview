import { Component, EventEmitter, OnInit, Output } from '@angular/core';
// @ts-ignore
import * as blipChat  from 'blip-chat-widget';


@Component({
  selector: 'app-abmex-chats',
  templateUrl: './abmex-chats.component.html',
  styleUrls: ['./abmex-chats.component.scss']
})
export class AbmexChatsComponent implements OnInit {

  chat: any = '';

  @Output() onGoQuestion = new EventEmitter<string>();
  @Output() onGoHome = new EventEmitter<string>();
  @Output() onGoQuestions = new EventEmitter<string>();
  @Output() onGoChat = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    this.chat = new blipChat.BlipChat()
      .withAppKey('Z3VhcmFwaW5oZWlyb3NleHBlcmllbmNpYTowMzQ3ZGM5OC1jNGZjLTRjZGUtYTEwMy05MGJlMThlN2M2NTY=')
      .withTarget('abmex-chat')
      .withCustomCommonUrl('https://chat.blip.ai/')
      .build();
  }

  tab = 'home';

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
