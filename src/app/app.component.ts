import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Agentic-AI';
  isChatbotOpen = false;
  messages: ChatMessage[] = [];
  private langChangeSubscription: Subscription | undefined;

  constructor(public authService: AuthService, public router: Router, private translate: TranslateService) {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      this.translate.use(savedLanguage);
    }
  }

  ngOnInit() {
    this.authService.token$.subscribe(token => {
      if (!token) {
        this.router.navigate(['/login']);
      } else if (this.isChatbotOpen) {
        this.addWelcomeMessage();
      }
    });

    // Subscribe to language changes
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      // Update existing messages when language changes
      this.updateMessages();
    });
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (this.isChatbotOpen && this.authService.isLoggedIn() && this.messages.length === 0) {
      this.addWelcomeMessage();
    }
  }

  addWelcomeMessage(): void {
    this.translate.get('WELCOME_MESSAGE').subscribe((text: string) => {
      this.messages.push({
        sender: 'bot',
        text: text,
        timestamp: new Date()
      });
    });
  }

  onQuerySubmitted(query: string): void {
    this.messages.push({
      sender: 'user',
      text: query,
      timestamp: new Date()
    });

    this.translate.get('MOCK_RESPONSE').subscribe((text: string) => {
      setTimeout(() => {
        this.messages.push({
          sender: 'bot',
          text: text,
          timestamp: new Date()
        });
        const chatBody = document.querySelector('.chatbot-body');
        if (chatBody) {
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }, 1000);
    });
  }

  updateMessages(): void {
    // Re-translate all bot messages
    const updatedMessages: ChatMessage[] = [];
    this.messages.forEach(message => {
      if (message.sender === 'user') {
        updatedMessages.push(message); // User messages remain unchanged
      } else {
        // Re-translate bot messages
        const key = message.text === this.translate.instant('WELCOME_MESSAGE') ? 'WELCOME_MESSAGE' : 'MOCK_RESPONSE';
        this.translate.get(key).subscribe((text: string) => {
          updatedMessages.push({
            sender: 'bot',
            text: text,
            timestamp: message.timestamp
          });
        });
      }
    });
    this.messages = updatedMessages;
  }
}