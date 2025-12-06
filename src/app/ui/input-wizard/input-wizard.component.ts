import { Component, output, inject, signal, OnInit, ViewChild, ElementRef, effect, ChangeDetectorRef, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExpertiseLevel } from '../../core/models/maestro-schema.models';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../core/services/gemini.service';
import { LanguageService } from '../../core/services/language.service';
import { ChatSession } from '@google/generative-ai';
import { CreationMode } from '../../core/services/maestro-store.service';

interface ChatMessage {
  role: 'user' | 'model';
  content: string; // The main text
  suggestions?: string[]; // The distinct questions
}

@Component({
  selector: 'app-input-wizard',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './input-wizard.component.html',
})
export class InputWizardComponent implements OnInit {
  @Input() mode: CreationMode = 'SINGLE';

  private readonly gemini = inject(GeminiService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly lang = inject(LanguageService);
  
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  inputControl = new FormControl('');

  // Chat State
  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  isMaterializing = signal(false);
  private chatSession!: ChatSession;

  // Voice State
  isRecording = signal(false);
  private recognition: any;
  private textBeforeRecording = '';

  // Wizard Logic State
  expertise: ExpertiseLevel = 'Appassionato';
  readonly expertiseLevels: ExpertiseLevel[] = ['Principiante', 'Didatta', 'Appassionato', 'Professionista'];
  
  // --- STRATEGIC FILTERS ENGINE ---
  private readonly initialSets = {
    group1: ['grp1_vegetarian', 'grp1_vegan', 'grp1_gluten_free', 'grp1_dairy_free', 'grp1_low_calorie'],
    group2: ['grp2_baked', 'grp2_grilled', 'grp2_sous_vide', 'grp2_sauteed', 'grp2_steamed'],
    group3: ['grp3_spring', 'grp3_summer', 'grp3_autumn', 'grp3_winter', 'grp3_fine_dining'],
    group4: ['grp4_pasta', 'grp4_rice', 'grp4_fish', 'grp4_beef', 'grp4_vegetables']
  };

  // Group Definitions for AI Prompting
  private readonly groupDefinitions = {
    group1: 'Nutritional Profile, Dietary Requirements, Health Considerations',
    group2: 'Cooking Technique, Temperature Control, Preparation Methods',
    group3: 'Seasonality, Atmosphere, Dining Experience, Food Mood',
    group4: 'Ingredient Base, Primary Components, Protein Source, Staple Foundation'
  };

  // The currently visible options
  visibleOptions = signal({
    group1: [] as string[],
    group2: [] as string[],
    group3: [] as string[],
    group4: [] as string[]
  });

  // Loading state per column
  isRegenerating = signal({
    group1: false,
    group2: false,
    group3: false,
    group4: false,
    questions: false
  });

  // The Active Constraints (Selected by user)
  constraintsControl = new FormControl<string[]>([]);
  
  submitRequest = output<{ ingredients: string; expertise: ExpertiseLevel; constraints: string[] }>();

  constructor() {
    // PERFORMANCE FIX: Use effect instead of ngAfterViewChecked
    effect(() => {
      // Trigger scroll whenever messages change
      const msgs = this.messages();
      if(msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit(): void {
    this.startSession();
    this.initSpeechRecognition();
    
    // Load initial static sets for immediate render
    this.visibleOptions.set({
      group1: this.initialSets.group1,
      group2: this.initialSets.group2,
      group3: this.initialSets.group3,
      group4: this.initialSets.group4
    });
  }

  // --- VOICE RECOGNITION (Web Speech API) ---
  private initSpeechRecognition() {
    // Cross-browser compatibility check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;     
        this.recognition.interimResults = true; 
        
        this.recognition.onstart = () => {
          this.isRecording.set(true);
          this.textBeforeRecording = this.inputControl.value || ''; 
          this.cdr.detectChanges(); 
        };

        this.recognition.onend = () => {
          this.isRecording.set(false);
          this.cdr.detectChanges();
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech Recognition Error', event.error);
          this.isRecording.set(false);
        }

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          
          for (let i = 0; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }

          const separator = (this.textBeforeRecording && !this.textBeforeRecording.endsWith(' ')) ? ' ' : '';
          this.inputControl.setValue(this.textBeforeRecording + separator + transcript);
          
          this.cdr.detectChanges(); 
        };
    } catch(e) {
        console.warn("Failed to initialize speech recognition", e);
    }
  }

  toggleRecording() {
    if (!this.recognition) {
      alert("Browser does not support Web Speech API");
      return;
    }

    if (this.isRecording()) {
      this.recognition.stop();
    } else {
      this.recognition.lang = this.lang.currentLang() === 'IT' ? 'it-IT' : 'en-US';
      this.recognition.start();
    }
  }

  // --- DYNAMIC SLOT MACHINE LOGIC ---
  async randomizeCategory(groupKey: 'group1' | 'group2' | 'group3' | 'group4'): Promise<void> {
    if (this.isRegenerating()[groupKey]) return;

    this.isRegenerating.update(curr => ({ ...curr, [groupKey]: true }));

    try {
      const description = this.groupDefinitions[groupKey];
      const currentValues = this.visibleOptions()[groupKey].map(key => this.lang.getOptionLabel(key));

      const newFilters = await this.gemini.generateCreativeFilters(description, this.lang.currentLang(), currentValues);
      
      if (newFilters && newFilters.length > 0) {
        this.visibleOptions.update(curr => ({
          ...curr,
          [groupKey]: newFilters.slice(0, 5) // Ensure max 5
        }));
      }
    } catch (e) {
      console.error(`Failed to regenerate ${groupKey}`, e);
    } finally {
      this.isRegenerating.update(curr => ({ ...curr, [groupKey]: false }));
    }
  }

  toggleConstraint(optionKey: string): void {
    const currentValue = this.constraintsControl.value || [];
    const newValue = currentValue.includes(optionKey)
      ? currentValue.filter(item => item !== optionKey)
      : [...currentValue, optionKey];
    this.constraintsControl.setValue(newValue);

    const localizedLabel = this.lang.getOptionLabel(optionKey);
    const action = newValue.includes(optionKey) ? 'ACTIVATED' : 'DEACTIVATED';
    this.sendSystemInjection(`[SYSTEM UPDATE: User ${action} constraint: ${localizedLabel}]`);
  }

  isSelected(option: string): boolean {
    const constraints = this.constraintsControl.value;
    return constraints ? constraints.includes(option) : false;
  }

  getSelectedLabels(): string[] {
    const constraints = this.constraintsControl.value || [];
    return constraints; 
  }


  // --- CHAT LOGIC ---
  private startSession() {
    const sessionMode = (this.mode === 'MENU') ? 'MENU' : 'SINGLE';
    this.chatSession = this.gemini.startMaestroChatSession(sessionMode);
    
    // Default suggestions must be DIRECTIVES / ANSWERS, not questions.
    const defaultSuggestions = this.lang.currentLang() === 'IT' 
      ? ['Un risotto con tartufo e funghi porcini', 'Un piatto vegetariano creativo', 'Qualcosa di light e sofisticato']
      : ['A truffle risotto with porcini mushrooms', 'A creative vegetarian dish', 'Something light and sophisticated'];

    this.messages.update(msgs => [...msgs, {
      role: 'model',
      content: this.lang.t().chat_system_welcome,
      suggestions: defaultSuggestions
    }]);
  }

  private scrollToBottom(): void {
    try {
      if(this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  async sendMessage() {
    const text = this.inputControl.value?.trim();
    if (!text || this.isLoading()) return;

    this.inputControl.setValue('');
    this.isLoading.set(true);

    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);

    try {
      console.log('Sending message:', text);
      const response = await this.chatSession.sendMessage(text);
      console.log('Raw response:', response);
      const responseText = response.response.text();
      console.log('Response text:', responseText);
      
      if(responseText?.includes("READY_TO_MATERIALIZE")) {
         this.materializeVision();
         return;
      }

      if (responseText) {
        this.addModelMessage(responseText);
      }
    } catch (e: any) {
      console.error('Chat error details:', e?.message, e?.stack, e);
      this.messages.update(msgs => [...msgs, { role: 'model', content: this.lang.t().chat_system_error }]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private addModelMessage(rawText: string) {
    const parts = rawText.split('|||');
    const mainContent = parts[0].trim();
    let suggestions: string[] = [];

    if (parts.length > 1) {
      suggestions = parts[1].split('|').map(s => s.trim()).filter(s => s.length > 0);
    }

    this.messages.update(msgs => [...msgs, { 
      role: 'model', 
      content: mainContent,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }]);
  }

  async selectSuggestion(question: string) {
    this.inputControl.setValue(question);
    this.sendMessage();
  }

  // --- REFRESH QUESTIONS (Uses the new generateRefinedQuestions Logic) ---
  async refreshQuestions() {
    if (this.isRegenerating().questions) return;
    
    // Find last model message with suggestions
    const lastModelMsgIndex = [...this.messages()].reverse().findIndex(m => m.role === 'model' && m.suggestions);
    if (lastModelMsgIndex === -1) return;

    this.isRegenerating.update(c => ({...c, questions: true}));
    
    try {
       // We use the full context to generate RELEVANT questions, not keywords
       const context = this.messages().map(m => `${m.role}: ${m.content}`).join('\n');
       
       const newQuestions = await this.gemini.generateRefinedQuestions(
          context, 
          this.lang.currentLang()
       );
       
       if (newQuestions.length > 0) {
          // Update the specific message in the signal array
          this.messages.update(msgs => {
             const reversedIdx = msgs.length - 1 - lastModelMsgIndex; // Convert reverse index to real index
             const updated = [...msgs];
             updated[reversedIdx] = {
                ...updated[reversedIdx],
                suggestions: newQuestions.slice(0, 3)
             };
             return updated;
          });
       }
    } catch(e) {
       console.error("Failed to refresh questions", e);
    } finally {
       this.isRegenerating.update(c => ({...c, questions: false}));
    }
  }


  private async sendSystemInjection(text: string) {
    try {
      await this.chatSession.sendMessage(text);
    } catch (e) {
      console.warn('Failed to update context', e);
    }
  }

  async materializeVision() {
    this.isMaterializing.set(true);
    this.isLoading.set(true);
    
    try {
      const summary = await this.gemini.summarizeChatContext(this.chatSession);
      
      const uiConstraints = this.constraintsControl.value || [];
      const localizedUiConstraints = uiConstraints.map(key => this.lang.getOptionLabel(key));
      
      const chatConstraints = summary.constraints || [];
      const finalConstraints = [...new Set([...localizedUiConstraints, ...chatConstraints])];

      let finalExpertise = this.expertise;
      if (summary.concept_abstract) {
        finalConstraints.push(`CONCEPT_THEME: ${summary.concept_abstract}`);
      }

      this.submitRequest.emit({
        ingredients: summary.ingredients.join(', '),
        expertise: finalExpertise,
        constraints: finalConstraints,
      });

    } catch (error) {
      console.error('Materialization failed', error);
      this.messages.update(msgs => [...msgs, { role: 'model', content: this.lang.t().chat_system_handoff_error }]);
    } finally {
      this.isMaterializing.set(false);
      this.isLoading.set(false);
    }
  }
}