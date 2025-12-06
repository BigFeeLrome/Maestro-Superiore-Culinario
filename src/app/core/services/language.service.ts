
import { Injectable, signal, computed } from '@angular/core';

export type Language = 'IT' | 'EN';

const DICTIONARY = {
    IT: {
        // LANDING PAGE
        landing_subtitle: 'Sistema di Intelligenza Culinaria',
        enter_lab: 'Entra nel Laboratorio',
        landing_mode_single: 'Piatto Signature',
        landing_desc_single: 'Progettazione di un Singolo Piatto d\'Autore',
        landing_mode_menu: 'Menu Degustazione',
        landing_desc_menu: 'Sviluppo di un Menu Completo',
        landing_mode_analysis: 'Audit Ristorante',
        landing_desc_analysis: 'Analisi Strategica di Menu Esistenti',
        landing_mode_calculator: 'Calcolatore Alcol',
        landing_desc_calculator: 'Calcolo Diluizione Alcolica Professionale',

        // HEADER & NAV
        back_home: 'HOME',
        dashboard_title: 'Laboratorio Culinario',

        // INPUT WIZARD / CHAT
        wizard_title: 'Laboratorio Culinario',
        wizard_expertise_label: 'Livello Culinario',
        wizard_placeholder: 'Descrivi il profilo sensoriale desiderato...',
        wizard_thinking: 'Creatività in corso...',
        wizard_materialize: 'Realizza Piatto',
        wizard_solidifying: 'Strutturazione ricetta...',
        chat_system_welcome: 'Benvenuto. Sono il Maestro Superiore. Definiamo il piatto insieme. Quale ingrediente o emozione vogliamo esplorare?',
        chat_system_error: 'La connessione è debole. Riprova.',
        chat_system_handoff_error: 'Ho difficoltà a bilanciare la ricetta. Possiamo riassumere gli ingredienti principali?',

        // MENU WORKSPACE
        menu_ws_title: 'Atelier Culinario',
        menu_ws_courses: 'Piatti',
        menu_ws_concept: 'Filo Conduttore',
        menu_ws_chat_placeholder: 'Discuti modifiche (es. "Rendi il secondo piatto più piccante...")',
        btn_view_course: 'Esamina',
        btn_back_to_menu: 'Torna al Menu',
        btn_regenerate_course: 'Rigenera Piatto',
        btn_undo_last: 'Annulla Modifica',
        btn_export_pdf: 'Esporta PDF Chef',
        btn_analyze_menu: 'Analisi Costi',
        msg_updating_menu: 'Il Maestro sta rielaborando il menu...',
        msg_regenerating_dish: 'Rielaborazione piatto in corso...',
        msg_analyzing_costs: 'Ricerca prezzi ingredienti in corso...',

        // MENU ANALYSIS REPORT
        ma_report_title: 'Business Plan Ristorante',
        ma_total_cost: 'Costo Ingredienti Totale',
        ma_rec_price: 'Prezzo Vendita (Pax)',
        ma_margin: 'Margine',
        ma_breakdown_title: 'Dettaglio Piatti',
        ma_dish: 'Piatto',
        ma_cost: 'Costo Ingredienti',
        ma_exp_ing: 'Ingredienti Premium',

        // MENU ANALYSIS COMPONENT
        ana_title: 'Consulenza Strategica',
        ana_subtitle: 'Carica un menu o fornisci un URL per un\'analisi AI allineata alla tua Brand Identity.',
        ana_upload_label: 'Carica Menu (PDF/IMG)',
        ana_url_label: 'URL Sito Web (Opzionale)',
        ana_analyze_btn: 'Avvia Audit Ristorante',
        ana_analyzing: 'Analisi identità e studio dei piatti in corso...',
        ana_profile_title: 'Profilo Identitario Rilevato',
        ana_identity: 'Identità',
        ana_vibe: 'Percezione Esterna',
        ana_target: 'Target',
        ana_table_dish: 'Piatto Rilevato',
        ana_table_critique: 'Analisi Critica',
        ana_table_improvement: 'Suggerimento Evolutivo',
        ana_table_score: 'Allineamento',
        ana_table_actions: 'Azioni',
        ana_btn_regenerate: 'Genera Alternativa',
        ana_btn_create_recipe: 'Crea Ricetta',
        ana_btn_export_pdf: 'Esporta Report PDF',
        ana_global_critique: 'Valutazione Globale',
        ana_opportunities: 'Opportunità Strategiche',

        // FILTERS - HEADERS
        filter_cat_diet: 'Profilo Nutrizionale',
        filter_cat_tech: 'Tecnica & Cottura',
        filter_cat_mood: 'Vibe & Stagione',
        filter_cat_log: 'Base & Ingrediente',
        filter_active_label: 'Direttive Attive',

        // GROUP 1: NUTRITIONAL PROFILE
        grp1_vegetarian: 'Vegetariano',
        grp1_vegan: 'Vegano',
        grp1_gluten_free: 'Senza Glutine',
        grp1_dairy_free: 'Senza Latticini',
        grp1_low_calorie: 'Leggero (< 400 Kcal)',
        grp1_high_protein: 'Proteico',
        grp1_seafood: 'A Base di Pesce',
        grp1_meat: 'A Base di Carne',
        grp1_mushroom: 'A Base di Funghi',
        grp1_raw: 'Crudo / Preparazione Fredda',

        // GROUP 2: TECHNIQUE
        grp2_baked: 'Al Forno',
        grp2_grilled: 'Alla Griglia',
        grp2_sous_vide: 'Sottovuoto',
        grp2_sauteed: 'Saltato',
        grp2_steamed: 'Al Vapore',
        grp2_braised: 'Brasato',
        grp2_fried: 'Fritto',
        grp2_poached: 'Affogato',
        grp2_fermented: 'Fermentato',
        grp2_smoked: 'Affumicato',

        // GROUP 3: MOOD/SEASON
        grp3_spring: 'Primavera',
        grp3_summer: 'Estate',
        grp3_autumn: 'Autunno',
        grp3_winter: 'Inverno',
        grp3_comfort: 'Comfort Food',
        grp3_fine_dining: 'Fine Dining',
        grp3_casual: 'Casual',
        grp3_rustic: 'Rustico',
        grp3_modern: 'Contemporaneo',
        grp3_traditional: 'Tradizionale',

        // GROUP 4: INGREDIENT BASE
        grp4_pasta: 'A Base di Pasta',
        grp4_rice: 'A Base di Riso',
        grp4_bread: 'A Base di Pane',
        grp4_legumes: 'Legumi',
        grp4_vegetables: 'Verdure',
        grp4_fish: 'Pesce',
        grp4_beef: 'Manzo',
        grp4_chicken: 'Pollo',
        grp4_game: 'Selvaggina',
        grp4_dairy: 'Latticini',

        // EXPERTISE
        exp_beginner: 'Cuoco Casalingo',
        exp_teacher: 'Istruttore Culinario',
        exp_enthusiast: 'Appassionato',
        exp_pro: 'Chef Professionista',

        // LOADING STATES
        loading_materializing: 'Distillando la tua Visione Culinaria...',
        loading_maestro_cooking: 'Il Maestro è ai fornelli...',
        error_title: 'Ricetta Incompleta',
        error_desc: 'Il Consiglio dei Saggi non ha raggiunto un consenso. Per favore affina la tua richiesta.',
        btn_retry: 'Riprova',
        btn_new_commission: 'Nuova Commissione',

        // RECIPE VIEW
        meta_execution: 'TEMPO ESECUZIONE',
        section_rationale: 'Filosofia Culinaria',
        section_mise_en_place: 'Preparazione Ingredienti',
        section_preparation: 'Esecuzione Ricetta',
        section_toolkit: 'Toolkit Strategico',
        section_homemade: 'Preparazioni Homemade',
        section_nutrition: 'Profilo Nutrizionale',
        nutr_calories: 'Calorie Totali',
        nutr_proteins: 'Proteine',
        nutr_carbs: 'Carboidrati',
        nutr_fats: 'Grassi',
        nutr_fiber: 'Fibre',
        btn_gen_photo: 'Genera Foto',
        btn_download: 'Scarica Copia Chef',
        btn_export_code: 'Esporta Codice Ricetta',
        tip_label: 'Pro Tip',

        // PLATING GUIDE
        plating_title: 'Guida Impiattamento',
        plating_container: 'Contenitore',
        plating_arrangement: 'Disposizione',
        plating_finishing: 'Tocco Finale',

        // SENSORY PROFILE
        sensory_title: 'Profilo Sensoriale',
        sensory_taste: 'Equilibrio Gustativo',
        sensory_texture: 'Mappa Texture',

        // PDF COLUMNS
        col_ingredient: 'Ingrediente',
        col_qty: 'Quantità',
        col_price: 'Prezzo Mercato',
        col_cost: 'Costo',
        col_trend: 'Trend',
        col_calories: 'Calorie (Kcal)',
        col_abv: 'ABV %',

        // SAGES
        sages_intro: 'Ecco il responso del Consiglio dei Saggi per il tuo piatto:',
        sage_scientist: 'Lo Scienziato',
        sage_artist: 'L\'Artista',
        sage_historian: 'Lo Storico',
        sage_philosopher: 'Il Filosofo',

        // MARKET ANALYSIS
        ma_single_title: 'Analisi Granulare Costi & Profilo Nutrizionale',
        ma_single_calculating: 'Analisi costi e valori nutrizionali in corso...',
        market_title: 'Analisi di Mercato',
        market_margin: 'Margine',
        market_export: 'Esporta Report',
        market_total_cost: 'Costo Totale',
        market_sugg_price: 'Prezzo Suggerito',
        market_narrative: 'Strategia Commerciale',

        // PHOTO PROMPT
        photo_title: 'Maestro Visual Studio',
        photo_subtitle: 'Powered by Google Imagen',
        photo_label: 'Prompt Engineering (English)',
        photo_copy: 'Copia',
        photo_export_md: 'Esporta (MD)',
        photo_copied: 'Copiato!',
        photo_placeholder: 'In attesa della visione del Maestro...',
        photo_render: 'Renderizza Visualizzazione',
        photo_developing: 'Sviluppo Rendering...',
        photo_awaiting: 'In attesa di Render',
        photo_processing: 'Elaborazione Imagen...',
        photo_btn_regenerate: 'Rigenera',
        photo_btn_download: 'Scarica Immagine',
        photo_btn_insert: 'Inserisci nella Ricetta',
        photo_btn_close: 'Torna alla Ricetta',

        // CALCULATOR
        calc_title: 'Calcolatore Alcol',
        calc_subtitle: 'Diluizione Professionale',
        calc_form_title: 'Parametri Diluizione',
        calc_initial_volume: 'Volume Iniziale (ml)',
        calc_initial_abv: 'ABV Iniziale (%)',
        calc_target_abv: 'ABV Target (%)',
        calc_loading: 'Elaborazione...',
        calc_calculate: 'Calcola',
        calc_results: 'Risultati',
        calc_water_to_add: 'Acqua da Aggiungere',
        calc_final_volume: 'Volume Finale',
        calc_download_pdf: 'Scarica PDF',
        calc_maestro_says: 'Il Maestro dice',
        calc_consulting: 'Consulenza Alcolicomplex',
    },

    EN: {
        // LANDING PAGE
        landing_subtitle: 'Culinary Intelligence System',
        enter_lab: 'Enter the Laboratory',
        landing_mode_single: 'Signature Dish',
        landing_desc_single: 'Design of a Single Masterpiece Dish',
        landing_mode_menu: 'Tasting Menu',
        landing_desc_menu: 'Development of a Full Culinary Program',
        landing_mode_analysis: 'Restaurant Audit',
        landing_desc_analysis: 'Strategic Audit of Existing Menus',
        landing_mode_calculator: 'Alcohol Calculator',
        landing_desc_calculator: 'Professional Alcohol Dilution Calculator',

        // HEADER & NAV
        back_home: 'HOME',
        dashboard_title: 'Culinary Laboratory',

        // INPUT WIZARD / CHAT
        wizard_title: 'Culinary Laboratory',
        wizard_expertise_label: 'Culinary Level',
        wizard_placeholder: 'Describe the desired sensory profile...',
        wizard_thinking: 'Creating...',
        wizard_materialize: 'Materialize Dish',
        wizard_solidifying: 'Solidifying recipe...',
        chat_system_welcome: 'Welcome. I am Maestro Superiore. Let us define the dish together. What ingredient or emotion shall we explore?',
        chat_system_error: 'The connection is faint. Please try again.',
        chat_system_handoff_error: 'I am having trouble balancing the recipe. Could we summarize the main ingredients?',

        // MENU WORKSPACE
        menu_ws_title: 'Culinary Atelier',
        menu_ws_courses: 'Dishes',
        menu_ws_concept: 'Thematic Thread',
        menu_ws_chat_placeholder: 'Discuss adjustments (e.g. "Make the second dish spicier...")',
        btn_view_course: 'Examine',
        btn_back_to_menu: 'Back to Menu',
        btn_regenerate_course: 'Regenerate Dish',
        btn_undo_last: 'Undo Change',
        btn_export_pdf: 'Export Chef PDF',
        btn_analyze_menu: 'Cost Analysis',
        msg_updating_menu: 'The Maestro is refining the menu...',
        msg_regenerating_dish: 'Regenerating dish...',
        msg_analyzing_costs: 'Querying ingredient prices...',

        // MENU ANALYSIS REPORT
        ma_report_title: 'Restaurant Business Plan',
        ma_total_cost: 'Total Ingredient Cost',
        ma_rec_price: 'Sale Price (Pax)',
        ma_margin: 'Margin',
        ma_breakdown_title: 'Dish Breakdown',
        ma_dish: 'Dish',
        ma_cost: 'Ingredient Cost',
        ma_exp_ing: 'Premium Ingredients',

        // MENU ANALYSIS COMPONENT
        ana_title: 'Strategic Consultancy',
        ana_subtitle: 'Upload a menu or provide a URL for AI analysis aligned with your Brand Identity.',
        ana_upload_label: 'Upload Menu (PDF/IMG)',
        ana_url_label: 'Website URL (Optional)',
        ana_analyze_btn: 'Start Restaurant Audit',
        ana_analyzing: 'Analyzing identity and studying the menu...',
        ana_profile_title: 'Identity Profile Detected',
        ana_identity: 'Identity',
        ana_vibe: 'External Perception',
        ana_target: 'Target',
        ana_table_dish: 'Detected Dish',
        ana_table_critique: 'Critical Analysis',
        ana_table_improvement: 'Evolutionary Suggestion',
        ana_table_score: 'Alignment',
        ana_table_actions: 'Actions',
        ana_btn_regenerate: 'Create Alternative',
        ana_btn_create_recipe: 'Create Recipe',
        ana_btn_export_pdf: 'Export Report PDF',
        ana_global_critique: 'Global Assessment',
        ana_opportunities: 'Strategic Opportunities',

        // FILTERS - HEADERS
        filter_cat_diet: 'Nutritional Profile',
        filter_cat_tech: 'Technique & Cooking',
        filter_cat_mood: 'Vibe & Season',
        filter_cat_log: 'Base & Ingredient',
        filter_active_label: 'Active Directives',

        // GROUP 1: NUTRITIONAL PROFILE
        grp1_vegetarian: 'Vegetarian',
        grp1_vegan: 'Vegan',
        grp1_gluten_free: 'Gluten Free',
        grp1_dairy_free: 'Dairy Free',
        grp1_low_calorie: 'Light (< 400 Kcal)',
        grp1_high_protein: 'High Protein',
        grp1_seafood: 'Seafood-based',
        grp1_meat: 'Meat-based',
        grp1_mushroom: 'Mushroom-based',
        grp1_raw: 'Raw / Cold Prep',

        // GROUP 2: TECHNIQUE
        grp2_baked: 'Baked',
        grp2_grilled: 'Grilled',
        grp2_sous_vide: 'Sous Vide',
        grp2_sauteed: 'Sautéed',
        grp2_steamed: 'Steamed',
        grp2_braised: 'Braised',
        grp2_fried: 'Fried',
        grp2_poached: 'Poached',
        grp2_fermented: 'Fermented',
        grp2_smoked: 'Smoked',

        // GROUP 3: MOOD/SEASON
        grp3_spring: 'Spring',
        grp3_summer: 'Summer',
        grp3_autumn: 'Autumn',
        grp3_winter: 'Winter',
        grp3_comfort: 'Comfort Food',
        grp3_fine_dining: 'Fine Dining',
        grp3_casual: 'Casual',
        grp3_rustic: 'Rustic',
        grp3_modern: 'Contemporary',
        grp3_traditional: 'Traditional',

        // GROUP 4: INGREDIENT BASE
        grp4_pasta: 'Pasta-based',
        grp4_rice: 'Rice-based',
        grp4_bread: 'Bread-based',
        grp4_legumes: 'Legumes',
        grp4_vegetables: 'Vegetables',
        grp4_fish: 'Fish',
        grp4_beef: 'Beef',
        grp4_chicken: 'Chicken',
        grp4_game: 'Game',
        grp4_dairy: 'Dairy',

        // EXPERTISE
        exp_beginner: 'Home Cook',
        exp_teacher: 'Culinary Instructor',
        exp_enthusiast: 'Enthusiast',
        exp_pro: 'Professional Chef',

        // LOADING STATES
        loading_materializing: 'Distilling your Culinary Vision...',
        loading_maestro_cooking: 'The Maestro is at the stove...',
        error_title: 'Incomplete Recipe',
        error_desc: 'The Council of Sages could not reach a consensus. Please refine your request.',
        btn_retry: 'Try Again',
        btn_new_commission: 'New Commission',

        // RECIPE VIEW
        meta_execution: 'EXECUTION TIME',
        section_rationale: 'Culinary Philosophy',
        section_mise_en_place: 'Ingredient Preparation',
        section_preparation: 'Recipe Execution',
        section_toolkit: 'Strategic Toolkit',
        section_homemade: 'Homemade Preparations',
        section_nutrition: 'Nutritional Profile',
        nutr_calories: 'Total Calories',
        nutr_proteins: 'Proteins',
        nutr_carbs: 'Carbohydrates',
        nutr_fats: 'Fats',
        nutr_fiber: 'Fiber',
        btn_gen_photo: 'Generate Photo',
        btn_download: 'Download Chef Copy',
        btn_export_code: 'Export Recipe Code',
        tip_label: 'Pro Tip',

        // PLATING GUIDE
        plating_title: 'Plating Guide',
        plating_container: 'Container',
        plating_arrangement: 'Arrangement',
        plating_finishing: 'Finishing Touch',

        // SENSORY PROFILE
        sensory_title: 'Sensory Profile',
        sensory_taste: 'Taste Balance',
        sensory_texture: 'Texture Map',

        // PDF COLUMNS
        col_ingredient: 'Ingredient',
        col_qty: 'Quantity',
        col_price: 'Market Price',
        col_cost: 'Cost',
        col_trend: 'Trend',
        col_calories: 'Calories (Kcal)',
        col_abv: 'ABV %',

        // SAGES
        sages_intro: 'Here is the verdict of the Council of Sages for your dish:',
        sage_scientist: 'The Scientist',
        sage_artist: 'The Artist',
        sage_historian: 'The Historian',
        sage_philosopher: 'The Philosopher',

        // MARKET ANALYSIS
        ma_single_title: 'Granular Cost & Nutritional Analysis',
        ma_single_calculating: 'Cost and nutritional analysis in progress...',
        market_title: 'Market Analysis',
        market_margin: 'Margin',
        market_export: 'Export Report',
        market_total_cost: 'Total Cost',
        market_sugg_price: 'Suggested Price',
        market_narrative: 'Commercial Strategy',

        // PHOTO PROMPT
        photo_title: 'Maestro Visual Studio',
        photo_subtitle: 'Powered by Google Imagen',
        photo_label: 'Prompt Engineering (English)',
        photo_copy: 'Copy',
        photo_export_md: 'Export (MD)',
        photo_copied: 'Copied!',
        photo_placeholder: 'Waiting for the Maestro\'s vision...',
        photo_render: 'Render Visualization',
        photo_developing: 'Rendering...',
        photo_awaiting: 'Awaiting Render',
        photo_processing: 'Imagen Engine Processing...',
        photo_btn_regenerate: 'Regenerate',
        photo_btn_download: 'Download Image',
        photo_btn_insert: 'Insert into Recipe',
        photo_btn_close: 'Back to Recipe',

        // CALCULATOR
        calc_title: 'Alcohol Calculator',
        calc_subtitle: 'Professional Dilution',
        calc_form_title: 'Dilution Parameters',
        calc_initial_volume: 'Initial Volume (ml)',
        calc_initial_abv: 'Initial ABV (%)',
        calc_target_abv: 'Target ABV (%)',
        calc_loading: 'Processing...',
        calc_calculate: 'Calculate',
        calc_results: 'Results',
        calc_water_to_add: 'Water to Add',
        calc_final_volume: 'Final Volume',
        calc_download_pdf: 'Download PDF',
        calc_maestro_says: 'The Maestro Says',
        calc_consulting: 'Alcohol Consulting',
    }
};

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    readonly currentLang = signal<Language>('IT'); // Default to Italian
    readonly t = computed(() => DICTIONARY[this.currentLang()]);

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
    }

    // Helper to get translated dynamic values
    getOptionLabel(key: string): string {
        const dict = this.t();
        // @ts-ignore
        const val = dict[key];
        return val || key;
    }

    getCurrentLang(): Language {
        return this.currentLang();
    }
}