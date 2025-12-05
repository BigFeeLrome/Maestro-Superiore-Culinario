import { Injectable, signal } from '@angular/core';

// API Key only in-memory: no persistence to browser storage.
@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  readonly apiKey = signal<string | null>(null);

  getApiKey(): string | null {
    return this.apiKey();
  }

  setApiKey(key: string) {
    this.apiKey.set(key);
  }

  clearApiKey() {
    this.apiKey.set(null);
  }
}
