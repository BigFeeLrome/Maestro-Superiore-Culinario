import { ChangeDetectionStrategy, Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { LandingComponent } from './app/pages/landing/landing.component';
import { CalculatorComponent } from './app/ui/calculator/calculator.component';
import { LanguageService, Language } from './app/core/services/language.service';
import { MaestroStore, CreationMode } from './app/core/services/maestro-store.service';
import { ApiKeyService } from './app/core/services/api-key.service';
import { GeminiService } from './app/core/services/gemini.service';
import { AuthService } from './app/core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DashboardComponent, LandingComponent, CalculatorComponent]
})
export class AppComponent implements OnInit, AfterViewInit {
  private readonly store = inject(MaestroStore);
  readonly lang = inject(LanguageService);
  private readonly apiKeyService = inject(ApiKeyService);
  private readonly gemini = inject(GeminiService);
  readonly auth = inject(AuthService);
  
  @ViewChild('googleBtn', { static: false }) googleBtn?: ElementRef<HTMLElement>;
  
  // High level state from Store
  readonly appState = this.store.appState;
  readonly creationMode = this.store.creationMode;

  // API Key modal state
  showApiKeyModal = false;
  errorApiKey: string | null = null;

  ngOnInit(): void {
    this.auth.init();
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button if overlay is visible
    setTimeout(() => {
      if (this.googleBtn?.nativeElement) {
        this.auth.renderButton(this.googleBtn.nativeElement);
      }
    }, 0);

    // Extra safety: retry rendering a few times while overlay is visible
    let attempts = 0;
    const retry = () => {
      if (!this.isAuthenticated() && this.googleBtn?.nativeElement) {
        this.auth.renderButton(this.googleBtn.nativeElement);
      }
      if (!this.isAuthenticated() && attempts++ < 20) {
        setTimeout(retry, 150);
      }
    };
    setTimeout(retry, 150);
  }

  selectMode(mode: CreationMode): void {
    this.store.setMode(mode);
  }

  backToHome(): void {
    this.store.goHome();
  }

  setLang(l: Language) {
    this.lang.setLanguage(l);
  }

  isLang(l: Language) {
    return this.lang.currentLang() === l;
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  logout() {
    this.auth.signOut();
    this.apiKeyService.clearApiKey();
    this.gemini.resetToEnvironmentKey();
  }

  // --- API Key UI handlers ---
  openApiKeyModal() {
    this.errorApiKey = null;
    this.showApiKeyModal = true;
  }

  closeApiKeyModal() {
    this.showApiKeyModal = false;
    this.errorApiKey = null;
  }

  maskedStoredApiKey(): string {
    const k = this.apiKeyService.getApiKey();
    if (!k) return '(nessuna)';
    if (k.length <= 8) return '********';
    return `${k.substring(0, 4)}...${k.substring(k.length - 4)}`;
  }

  saveApiKeyFrom(input: HTMLInputElement) {
    const key = (input?.value || '').trim();
    // Basic validation: non-empty and reasonable length
    if (!key || key.length < 20) {
      this.errorApiKey = 'Inserisci una chiave API valida.';
      return;
    }
    this.apiKeyService.setApiKey(key);
    this.gemini.setApiKey(key);
    this.closeApiKeyModal();
  }

  clearApiKey() {
    this.apiKeyService.clearApiKey();
    this.gemini.resetToEnvironmentKey();
    this.closeApiKeyModal();
  }

  // --- Auth helpers ---
  retryRenderGoogle() {
    if (this.googleBtn?.nativeElement) {
      this.auth.renderButton(this.googleBtn.nativeElement);
    }
  }
}