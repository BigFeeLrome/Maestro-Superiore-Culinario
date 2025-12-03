import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SorItem, SearchCriteria } from '../models/maestro-schema.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SorService {
  private sorLibrary: SorItem[] = [];
  
  // Use relative path to be safe in various hosting environments
  private dataUrl = './assets/data/sor-library.json';

  constructor(private http: HttpClient) {
    this.initialize();
  }

  // Load the JSON when the app starts
  async initialize(): Promise<void> {
    try {
      // Use HttpClient to read the file from the assets folder
      this.sorLibrary = await firstValueFrom(this.http.get<SorItem[]>(this.dataUrl));
      console.log('SOR Library Loaded:', this.sorLibrary.length, 'items');
    } catch (error: any) {
      // Log the specific message or stringify the object to avoid [object Object]
      console.warn('SOR Library failed to load (Functionality limited):', error.message || JSON.stringify(error));
      // Provide an empty fallback so the app doesn't break
      this.sorLibrary = [];
    }
  }

  search(criteria: SearchCriteria): SorItem[] {
    if ((!criteria.query && !criteria.category && (!criteria.tags || criteria.tags.length === 0)) || this.sorLibrary.length === 0) {
      return [];
    }

    let results = [...this.sorLibrary];

    // Filter by general query string (searches title and tags)
    if (criteria.query) {
      const lowerQuery = criteria.query.toLowerCase();
      results = results.filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.pairing_tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by category
    if (criteria.category) {
      results = results.filter(item => item.category === criteria.category);
    }

    // Filter by specific tags
    if (criteria.tags && criteria.tags.length > 0) {
      const lowerTags = criteria.tags.map(t => t.toLowerCase());
      results = results.filter(item =>
        item.pairing_tags.some(pt => lowerTags.includes(pt.toLowerCase()))
      );
    }

    return results;
  }


  getRelevantContext(ingredients: string[]): string {
    if (!ingredients || ingredients.length === 0) return '';

    let contextString = '';
    const foundItems: SorItem[] = [];

    // Search for each ingredient in the library
    ingredients.forEach(ing => {
      const matches = this.search({ query: ing.trim() });
      if (matches.length > 0) {
        foundItems.push(...matches);
      }
    });

    // Remove duplicates
    const uniqueItems = [...new Set(foundItems)];

    if (uniqueItems.length > 0) {
      contextString = 'SCHEDE OPERATIVE RAPIDE (SOR) DATA - PRIORITIZE THIS TECHNICAL KNOWLEDGE:\n';
      uniqueItems.forEach(item => {
        contextString += `[REF ${item.id}] ${item.title} (${item.category}): ${item.technical_notes} Principle: ${item.scientific_principle}\n`;
      });
    }

    return contextString;
  }
}