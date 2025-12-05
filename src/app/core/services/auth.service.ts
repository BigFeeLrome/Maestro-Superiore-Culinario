import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

type GoogleJwt = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  credentialJwt: string; // ID token (unverified, client-side only)
};

declare global {
  interface Window { any: any; google?: any; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly gisReady = signal<boolean>(false);
  readonly gisError = signal<string | null>(null);

  private gisInitialized = false;
  private loadingPromise: Promise<void> | null = null;
  private renderSucceeded = false;

  private ensureGisScript(): Promise<void> {
    // If already available, resolve immediately
    const g = (window as any).google;
    if (g?.accounts?.id) {
      return Promise.resolve();
    }
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise<void>((resolve, reject) => {
      let script = document.getElementById('google-gsi') as HTMLScriptElement | null;
      if (script && g?.accounts?.id) {
        resolve();
        return;
      }
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.gisReady.set(true);
          resolve();
        };
        script.onerror = (e) => {
          const msg = 'Impossibile caricare Google Identity Services (script non raggiungibile).';
          console.error(msg, e);
          this.gisError.set(msg);
          reject(new Error(msg));
        };
        document.head.appendChild(script);
      } else {
        // If a script tag exists but google is not yet on window, wait a bit and check again
        let checks = 0;
        const check = () => {
          const gg = (window as any).google;
          if (gg?.accounts?.id) {
            this.gisReady.set(true);
            resolve();
            return;
          }
          checks++;
          if (checks < 60) {
            setTimeout(check, 100);
          } else {
            const msg = 'Google Identity Services non disponibili (timeout caricamento).';
            console.error(msg);
            this.gisError.set(msg);
            reject(new Error(msg));
          }
        };
        check();
      }
    });

    return this.loadingPromise;
  }

  init() {
    if (this.gisInitialized) return;
    // Load script then initialize
    this.ensureGisScript()
      .then(() => {
        const g = (window as any).google;
        if (!g?.accounts?.id) {
          const msg = 'Google Identity Services non disponibili (window.google mancante).';
          console.error(msg);
          this.gisError.set(msg);
          return;
        }
        g.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (res: any) => this.onCredential(res?.credential)
        });
        // Expose a global callback for optional declarative fallback
        (window as any).onGoogleCredential = (res: any) => this.onCredential(res?.credential);
        this.gisInitialized = true;
        this.gisReady.set(true);
        const id = environment.googleClientId;
        const masked = id ? `${id.substring(0, 8)}...${id.substring(id.length - 10)}` : 'missing';
        console.log('GIS initialized with Client ID:', masked);
      })
      .catch(() => {/* error already logged and stored */});
  }

  private onCredential(credential: string | undefined) {
    if (!credential) return;
    const claims = this.decodeJwt(credential);
    const u: AuthUser = {
      id: claims.sub,
      email: claims.email || null,
      name: claims.name || null,
      picture: claims.picture || null,
      credentialJwt: credential,
    };
    this.user.set(u);
    this.isAuthenticated.set(true);
  }

  renderButton(el: HTMLElement) {
    // Ensure GIS is available, then render the button (idempotent & robust)
    const opts = { theme: 'outline', size: 'large', shape: 'rectangular', text: 'signin_with' } as any;
    let attempts = 0;

    const tryRender = () => {
      const g = (window as any).google;
      if (g?.accounts?.id && el) {
        try {
          if (!this.gisInitialized) {
            g.accounts.id.initialize({
              client_id: environment.googleClientId,
              callback: (res: any) => this.onCredential(res?.credential)
            });
            this.gisInitialized = true;
          }
          // Clear container in case Angular recreated the node
          el.innerHTML = '';
          g.accounts.id.renderButton(el, opts);
          this.renderSucceeded = true;
          return;
        } catch (e) {
          console.error('GIS renderButton error:', e);
        }
      }

      attempts++;
      if (attempts < 60) {
        setTimeout(tryRender, 100);
      } else {
        const msg = 'Google Identity Services non disponibili (timeout durante il render del bottone).';
        console.error(msg);
        this.gisError.set(msg);
      }
    };

    this.ensureGisScript()
      .then(() => tryRender())
      .catch(() => {
        // gisError already set
      });
  }

  promptOneTap() {
    const g = window.google;
    if (g?.accounts?.id) {
      g.accounts.id.prompt();
    }
  }

  signOut() {
    const email = this.user()?.email || undefined;
    const g = window.google;
    if (g?.accounts?.id) {
      g.accounts.id.disableAutoSelect();
      if (email) {
        try { g.accounts.id.revoke(email, () => {}); } catch {}
      }
    }
    this.user.set(null);
    this.isAuthenticated.set(false);
  }

  private decodeJwt(token: string): GoogleJwt {
    // Basic base64url decode (client-side, unverified)
    const parts = token.split('.');
    if (parts.length < 2) return { sub: '' };
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  }
}
