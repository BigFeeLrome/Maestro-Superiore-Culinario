import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketReport, MaestroSynthesis } from '../../core/models/maestro-schema.models';
import { LanguageService } from '../../core/services/language.service';
import { GeminiService } from '../../core/services/gemini.service';

@Component({
    selector: 'app-market-analysis',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './market-analysis.component.html'
})
export class MarketAnalysisComponent {
    @Input() synthesis!: MaestroSynthesis;

    protected lang = inject(LanguageService);
    private gemini = inject(GeminiService);

    report = signal<MarketReport | null>(null);
    isLoading = signal(false);
    error = signal<string | null>(null);

    async analyze() {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const result = await this.gemini.analyzeSingleDishMarket(this.synthesis);
            this.report.set(result);
        } catch (e: any) {
            this.error.set(e.message || 'Analysis failed');
        } finally {
            this.isLoading.set(false);
        }
    }

    getTrendIcon(trend: string): string {
        switch (trend) {
            case 'RISING': return '📈';
            case 'FALLING': return '📉';
            default: return '➡️';
        }
    }
}