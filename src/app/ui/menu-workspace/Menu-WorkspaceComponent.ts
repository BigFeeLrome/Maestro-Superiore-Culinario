import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuProjectResponse, MaestroResponse, MenuMarketReport } from '../../core/models/maestro-schema.models';
import { LanguageService } from '../../core/services/language.service';
import { GeminiService } from '../../core/services/gemini.service';

@Component({
    selector: 'app-menu-workspace',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './menu-workspace.component.html'
})
export class MenuWorkspaceComponent {
    @Input() menu!: MenuProjectResponse;

    protected lang = inject(LanguageService);
    private gemini = inject(GeminiService);

    selectedCourseIndex = signal<number | null>(null);
    chatInput = signal('');
    isUpdating = signal(false);
    menuHistory = signal<MenuProjectResponse[]>([]);
    marketReport = signal<MenuMarketReport | null>(null);
    isAnalyzing = signal(false);

    get selectedCourse(): MaestroResponse | null {
        const idx = this.selectedCourseIndex();
        return idx !== null ? this.menu.courses[idx] : null;
    }

    viewCourse(index: number) {
        this.selectedCourseIndex.set(index);
    }

    backToMenu() {
        this.selectedCourseIndex.set(null);
    }

    async sendModification() {
        const request = this.chatInput();
        if (!request.trim() || this.isUpdating()) return;

        this.menuHistory.update(h => [...h, JSON.parse(JSON.stringify(this.menu))]);
        this.isUpdating.set(true);
        this.chatInput.set('');

        try {
            const modified = await this.gemini.modifyMenu(this.menu, request);
            this.menu.concept = modified.concept;
            this.menu.courses = modified.courses;
        } catch (e) {
            console.error('Modification failed', e);
        } finally {
            this.isUpdating.set(false);
        }
    }

    async regenerateCourse(index: number) {
        this.menuHistory.update(h => [...h, JSON.parse(JSON.stringify(this.menu))]);
        this.isUpdating.set(true);

        try {
            const request = `Regenerate course ${index + 1} completely with a new creative approach`;
            const modified = await this.gemini.modifyMenu(this.menu, request);
            this.menu.courses = modified.courses;
        } catch (e) {
            console.error('Regeneration failed', e);
        } finally {
            this.isUpdating.set(false);
        }
    }

    undo() {
        const history = this.menuHistory();
        if (history.length > 0) {
            const previous = history[history.length - 1];
            this.menu.concept = previous.concept;
            this.menu.courses = previous.courses;
            this.menuHistory.update(h => h.slice(0, -1));
        }
    }

    async analyzeMarket() {
        this.isAnalyzing.set(true);
        try {
            const report = await this.gemini.analyzeMenuMarket(this.menu);
            this.marketReport.set(report);
        } catch (e) {
            console.error('Market analysis failed', e);
        } finally {
            this.isAnalyzing.set(false);
        }
    }
}