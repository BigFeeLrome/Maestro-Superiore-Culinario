import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredientAnalysisItem, MarketReport } from '../../core/models/maestro-schema.models';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-market-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './market-analysis.component.html',
})
export class MarketAnalysisComponent {
  @Input() data: MarketReport | null = null;
  readonly lang = inject(LanguageService);

  downloadReport() {
    if (!this.data) return;

    const date = new Date().toISOString().split('T')[0];
    let md = `# MARKET ANALYSIS REPORT - ${date}\n\n`;
    md += `> ${this.data.marketing_hook}\n\n`;
    md += `### FINANCIAL OVERVIEW\n`;
    md += `- ${this.lang.t().ma_total_cost}: €${this.data.total_pour_cost}\n`;
    md += `- ${this.lang.t().ma_rec_price}: €${this.data.suggested_menu_price}\n`;
    md += `- ${this.lang.t().ma_margin}: ${this.data.profit_margin_percentage}%\n\n`;
    md += `### STRATEGY\n${this.data.pricing_strategy_note}\n\n`;
    md += `### COST BREAKDOWN\n`;
    md += `| ${this.lang.t().col_ingredient} | ${this.lang.t().col_qty} | ${this.lang.t().col_price} | ${this.lang.t().col_cost} | ${this.lang.t().col_trend} |\n`;
    md += `| --- | --- | --- | --- | --- |\n`;

    this.data.cost_breakdown.forEach((item: IngredientAnalysisItem) => {
      md += `| ${item.ingredient} | ${item.quantity_used} | ${item.market_unit_price} | €${item.calculated_cost} | ${item.market_trend} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maestro-market-analysis-${date}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}