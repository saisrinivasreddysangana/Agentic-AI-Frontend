import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: false,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent implements OnInit {
  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ];
  selectedLanguage: string;

  constructor(private translate: TranslateService) {
    // Get the preferred language from localStorage or default to the browser language
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLang = translate.getBrowserLang();
    
    // Set selected language based on saved preference or browser language
    this.selectedLanguage = savedLanguage || (this.languages.some(lang => lang.code === browserLang) ? browserLang! : 'en');
  }

  ngOnInit(): void {
    this.translate.use(this.selectedLanguage);
  }

  switchLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translate.use(language);
    localStorage.setItem('preferredLanguage', language);
    console.log(`Language switched to: ${language}`); // Debug log
  }
}
