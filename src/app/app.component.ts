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
  welcomeMessage: string = '';
  suggestedMessage: string = '';
  private langChangeSubscription: Subscription | undefined;

  constructor(
    public authService: AuthService, 
    public router: Router, 
    private translate: TranslateService
  ) {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      this.translate.use(savedLanguage);  // Load previously selected language
    } else {
      this.translate.use('en');  // Default to English if no preference is saved
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
      this.setWelcomeMessage();
    });
    this.setWelcomeMessage();
  }

  ngOnDestroy() {
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

  setWelcomeMessage(): void {
    const userName = 'Sai Srinivas Reddy Sangana'; // Replace with actual user name from AuthService if available
    this.translate.get('', { userName }).subscribe((text: string) => {
      this.welcomeMessage = text;
    });
    this.translate.get('SUGGESTED_MESSAGE').subscribe((text: string) => {
      this.suggestedMessage = text;
    });
  }

  addWelcomeMessage(): void {
    this.translate.get('WELCOME_MESSAGE', { userName: 'Sai Srinivas Reddy Sangana' }).subscribe((text: string) => {
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
    const updatedMessages: ChatMessage[] = [];
    this.messages.forEach(message => {
      if (message.sender === 'user') {
        updatedMessages.push(message); // User messages remain unchanged
      } else {
        // Re-translate bot messages
        const key = message.text.includes('Hello') ? 'WELCOME_MESSAGE' : 'MOCK_RESPONSE';
        this.translate.get(key, { userName: 'Sai Srinivas Reddy Sangana' }).subscribe((text: string) => {
          updatedMessages.push({
            sender: 'bot',
            text: text,
            timestamp: message.timestamp,
          });
        });
      }
    });
    this.messages = updatedMessages;
  }

  // Method to change language
  switchLanguage(language: string): void {
    this.translate.use(language);
    localStorage.setItem('preferredLanguage', language);  // Save the selected language in localStorage
  }
}
