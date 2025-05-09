
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/service/auth.service';
import { Subscription } from 'rxjs';


interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  response?: any;
  payslipUrl?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
  
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Agentic-AI';
  isChatbotOpen = false;
  messages: ChatMessage[] = [];
  welcomeMessage = 'Hello, I’m A.V.A., your Virtual Assistant. I can help you with frequently asked questions related to payroll or tax.';
  suggestedMessage = 'Here are some questions I was asked recently. You can choose from these or type your own question.';
  private tokenSubscription: Subscription | undefined;

  constructor(
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.tokenSubscription = this.authService.token$.subscribe(token => {
      console.log('AppComponent: Token subscription update, token:', token ? 'present' : 'null');
      if (!token) {
        this.router.navigate(['/login']);
      } else if (this.isChatbotOpen && this.messages.length === 0) {
        this.addWelcomeMessage();
      }
    });
  }

  ngOnDestroy() {
    if (this.tokenSubscription) {
      this.tokenSubscription.unsubscribe();
    }
  }

  logout(): void {
    console.log('AppComponent: Logging out');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
    console.log('AppComponent: Chatbot toggled, open:', this.isChatbotOpen);
    if (this.isChatbotOpen && this.authService.isLoggedIn() && this.messages.length === 0) {
      this.addWelcomeMessage();
    }
  }

  addWelcomeMessage(): void {
    console.log('AppComponent: Adding welcome message');
    this.messages.push({
      sender: 'bot',
      text: this.welcomeMessage,
      timestamp: new Date()
    });
  }

  onQuerySubmitted(event: { query: string, response?: any, payslipUrl?: string }): void {
    console.log('AppComponent: Query submitted event received:', event);
    if (event.query) {
      this.messages.push({
        sender: 'user',
        text: event.query,
        timestamp: new Date()
      });
    }

    if (event.response) {
      let responseText = event.response.explanation || 'An unexpected error occurred.';
      if (event.response.reasons && event.response.reasons.length > 0) {
        responseText += '\nReasons:\n';
        event.response.reasons.forEach((reason: any) => {
          responseText += `- ${reason.type}: ${reason.label} (${reason.delta})\n`;
        });
      }
      this.messages.push({
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
        response: event.response,
        payslipUrl: event.payslipUrl
      });
    }

    const chatBody = document.querySelector('.chatbot-body');
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  updateMessages(): void {
    console.log('AppComponent: Updating messages');
    const updatedMessages: ChatMessage[] = [];
    this.messages.forEach(message => {
      if (message.sender === 'user') {
        updatedMessages.push(message);
      } else if (message.response) {
        let responseText = message.response.explanation ? 'Payroll Explanation' : 'An unexpected error occurred.';
        if (message.response.reasons && message.response.reasons.length > 0) {
          responseText += '\nReasons:\n';
          message.response.reasons.forEach((reason: any) => {
            responseText += `- ${reason.type}: ${reason.label} (${reason.delta})\n`;
          });
        }
        updatedMessages.push({
          sender: 'bot',
          text: responseText,
          timestamp: message.timestamp,
          response: message.response,
          payslipUrl: message.payslipUrl
        });
      } else {
        updatedMessages.push({
          sender: 'bot',
          text: this.welcomeMessage,
          timestamp: message.timestamp
        });
      }
    });
    this.messages = updatedMessages;
  }
}