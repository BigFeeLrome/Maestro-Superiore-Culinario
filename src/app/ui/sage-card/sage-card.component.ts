import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SageAnalysis, SageType } from '../../core/models/maestro-schema.models';

@Component({
  selector: 'app-sage-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-stone-50 p-6 border-l-4 shadow-sm h-full transition-colors duration-300"
         [class.border-cyan-800]="type === 'SCIENTIST'"
         [class.border-purple-800]="type === 'ARTIST'"
         [class.border-amber-800]="type === 'HISTORIAN'"
         [class.border-emerald-800]="type === 'PHILOSOPHER'"
         [class.border-stone-400]="!['SCIENTIST', 'ARTIST', 'HISTORIAN', 'PHILOSOPHER'].includes(type)">
      
      <div class="flex justify-between items-center mb-3">
        <span class="font-sans text-[10px] uppercase tracking-widest font-bold text-stone-500">{{ type }}</span>
        <!-- Icon Placeholder -->
        <div class="w-2 h-2 rounded-full"
             [class.bg-cyan-800]="type === 'SCIENTIST'"
             [class.bg-purple-800]="type === 'ARTIST'"
             [class.bg-amber-800]="type === 'HISTORIAN'"
             [class.bg-emerald-800]="type === 'PHILOSOPHER'"
             [class.bg-stone-400]="!['SCIENTIST', 'ARTIST', 'HISTORIAN', 'PHILOSOPHER'].includes(type)"></div>
      </div>
      
      <h4 class="font-serif text-xl font-bold text-stone-900 mb-2 leading-tight">
        {{ data?.headline || 'Analyzing...' }}
      </h4>
      
      <p class="font-serif text-sm text-stone-600 leading-relaxed italic">
        "{{ data?.analysis || 'Waiting for the council...' }}"
      </p>
    </div>
  `
})
export class SageCardComponent {
  @Input() type: SageType = 'SCIENTIST';
  @Input() data: SageAnalysis | undefined;
}