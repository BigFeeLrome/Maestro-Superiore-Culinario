import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../core/services/gemini.service';
import { SorService } from '../../core/services/sor.service';
import { LanguageService } from '../../core/services/language.service';
import { MaestroStore, CreationMode } from '../../core/services/maestro-store.service';
import { ExpertiseLevel } from '../../core/models/maestro-schema.models';
import { InputWizardComponent } from '../../ui/input-wizard/input-wizard.component';
import { RecipeViewComponent } from '../../ui/recipe-view/recipe-view.component';
import { SageCardComponent } from '../../ui/sage-card/sage-card.component';
import { MenuWorkspaceComponent } from '../../ui/menu-workspace/Menu-WorkspaceComponent';
import { MenuAnalysisComponent } from '../../ui/menu-analysis/menu-analysis.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    InputWizardComponent, 
    RecipeViewComponent, 
    SageCardComponent,
    MenuWorkspaceComponent,
    MenuAnalysisComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  @Input() mode: CreationMode = 'SINGLE';

  private readonly geminiService = inject(GeminiService);
  private readonly sorService = inject(SorService);
  private readonly store = inject(MaestroStore);
  readonly lang = inject(LanguageService);

  // Expose store signals directly to template
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly maestroResponse = this.store.maestroResponse;
  readonly menuResponse = this.store.menuResponse;

  // Derived state to determine view
  get currentState(): 'idle' | 'loading' | 'error' | 'success' {
    if (this.isLoading()) return 'loading';
    if (this.error()) return 'error';
    if (this.maestroResponse() || this.menuResponse()) return 'success';
    return 'idle';
  }

  async onEvoke(
    formData: {
      ingredients: string;
      expertise: ExpertiseLevel;
      constraints: string[];
      numCourses?: number;
    }
  ) {
    this.store.startLoading();

    try {
      const ingredients = formData.ingredients.split(',').map(i => i.trim()).filter(i => i);
      const sorContext = this.sorService.getRelevantContext(ingredients);

      const enrichedConstraints = [...formData.constraints];
      if (sorContext) {
        enrichedConstraints.push(`SERVER_INSTRUCTION: Prioritize these facts: ${sorContext}`);
      }

      if (this.mode === 'SINGLE') {
        const response = await this.geminiService.generateDish(
          ingredients,
          formData.expertise,
          enrichedConstraints
        );
        this.store.setSingleDish(response);
      } else {
        // MENU MODE
        const response = await this.geminiService.generateMenu(
          ingredients,
          formData.expertise,
          enrichedConstraints,
          formData.numCourses
        );
        this.store.setMenuProject(response);
      }
      
    } catch (error) {
      console.error('Failed to evoke Maestro:', error);
      this.store.setError(this.lang.t().error_desc);
    }
  }

  reset(): void {
    this.store.resetData();
  }
}