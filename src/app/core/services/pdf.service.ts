import { Injectable } from '@angular/core';
// @ts-ignore
import * as pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private fontsLoaded = false;

  // Unifying on "Crimson Text" for the entire document to ensure stability and quality.
  // It is a high-quality Old Style Serif (OFL) suitable for fine dining menus.
  // We use GitHub Raw URLs pointing to specific static files.
  private readonly fonts = {
    CrimsonRegular: 'https://raw.githubusercontent.com/google/fonts/main/ofl/crimsontext/CrimsonText-Regular.ttf',
    CrimsonBold: 'https://raw.githubusercontent.com/google/fonts/main/ofl/crimsontext/CrimsonText-Bold.ttf',
    CrimsonItalic: 'https://raw.githubusercontent.com/google/fonts/main/ofl/crimsontext/CrimsonText-Italic.ttf'
  };

  /**
   * Fetches fonts, converts to Base64, and configures PDFMake VFS.
   */
  async ensureFontsLoaded(): Promise<void> {
    if (this.fontsLoaded) return;

    // 1. Get the pdfMake instance
    const _pdfMake = (pdfMake as any).default || pdfMake;
    const _pdfFonts = (pdfFonts as any).default || pdfFonts;

    if (!_pdfMake) {
      console.error('PdfService: PDFMake not loaded');
      return;
    }

    // 2. Initialize VFS from pdfFonts (standard fonts) - CRITICAL for fallback
    if (!_pdfMake.vfs) {
        if (_pdfFonts && _pdfFonts.pdfMake && _pdfFonts.pdfMake.vfs) {
             _pdfMake.vfs = _pdfFonts.pdfMake.vfs;
        } else {
             _pdfMake.vfs = {};
        }
    }

    try {
      console.log('PdfService: Fetching professional fonts from remote...');
      // 3. Fetch all fonts in parallel
      const [cReg, cBold, cItalic] = await Promise.all([
        this.fetchFont(this.fonts.CrimsonRegular),
        this.fetchFont(this.fonts.CrimsonBold),
        this.fetchFont(this.fonts.CrimsonItalic)
      ]);

      // 4. Register files in Virtual File System
      _pdfMake.vfs['Crimson-Regular.ttf'] = cReg;
      _pdfMake.vfs['Crimson-Bold.ttf'] = cBold;
      _pdfMake.vfs['Crimson-Italic.ttf'] = cItalic;

      // 5. Configure Font Mapping
      // We map everything to Crimson Text. Titles will use bold.
      _pdfMake.fonts = {
        Crimson: {
          normal: 'Crimson-Regular.ttf',
          bold: 'Crimson-Bold.ttf',
          italics: 'Crimson-Italic.ttf',
          bolditalics: 'Crimson-Bold.ttf' // Fallback
        },
        // Fallback for standard refs
        Roboto: {
          normal: 'Crimson-Regular.ttf',
          bold: 'Crimson-Bold.ttf',
          italics: 'Crimson-Italic.ttf',
          bolditalics: 'Crimson-Bold.ttf'
        }
      };

      this.fontsLoaded = true;
      console.log('Maestro Professional Fonts Loaded');

    } catch (error) {
      console.error('Failed to load custom fonts. Falling back to default system.', error);
      
      // Fallback mapping so the PDF doesn't crash if network fails
      // We map our custom names back to standard Roboto which is built-in to pdfMake vfs
      _pdfMake.fonts = {
        Crimson: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        },
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      };
      
      this.fontsLoaded = true;
    }
  }

  private async fetchFont(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch font: ${url} (Status: ${response.status})`);
    const buffer = await response.arrayBuffer();
    return this.arrayBufferToBase64(buffer);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}