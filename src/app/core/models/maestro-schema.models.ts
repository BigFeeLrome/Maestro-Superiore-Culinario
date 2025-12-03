// Core Types
export type SageType = 'SCIENTIST' | 'ARTIST' | 'HISTORIAN' | 'PHILOSOPHER';
export type ExpertiseLevel = 'Principiante' | 'Didatta' | 'Appassionato' | 'Professionista';

// 1. The Sage Analysis Structure
export interface SageAnalysis {
  headline: string;
  analysis: string;
}

// 2. The Maestro's Synthesis (The actionable recipe)
export interface RecipeIngredient {
  name: string;
  quantity: string; // e.g. "60ml", "2 dashes"
  notes?: string;
}

export interface RecipeStep {
  step_number: number;
  instruction: string;
  technical_note?: string; // The "Scientist" tip (e.g. "Shake unti tins frost")
}

export interface GlasswareGuide {
  glass_type: string; // e.g. "Coupe", "Nick & Nora", "Highball"
  ice_type: string;   // e.g. "Clear Cube", "Crushed", "None/Neat"
  garnish_detail: string;
}

export interface SensoryProfile {
  taste_balance: string; // e.g. "Sour, Earthy, Botanical"
  texture_map: string;   // e.g. "Silky, Effervescent"
}

// NEW: Homemade Preparation Guide
export interface HomemadePrep {
  name: string;         // e.g. "Black Olive Cordial"
  ingredients: string[]; // List of raw materials needed
  instructions: string;  // How to make it
  yield?: string;        // e.g. "Makes 500ml"
}

export interface MaestroSynthesis {
  rationale: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  glassware_guide: GlasswareGuide;
  sensory_profile: SensoryProfile;
  homemade_preps?: HomemadePrep[]; // Optional array for custom ingredients
}

// 3. The Main Response Object (Root)
export interface MaestroResponse {
  meta: {
    dish_name: string; // "Drink Name"
    concept_summary: string;
    preparation_time_minutes: number; // Renamed from execution_time
    difficulty_level: ExpertiseLevel;
    philosophical_pillar_alignment: string;
    abv_estimate: string; // e.g. "18% ABV"
    calories_estimate: number; // New: e.g. 180 (Kcal)
    drink_category: string; // e.g. "Sour", "Spirit-Forward"
  };
  sages_council: {
    scientist: SageAnalysis;
    artist: SageAnalysis;
    historian: SageAnalysis;
    philosopher: SageAnalysis;
  };
  maestro_synthesis: MaestroSynthesis;
}

// --- NEW PHASE 2 MODELS: MENU SYSTEM ---

export interface MenuConcept {
  title: string;
  description: string;
  seasonality: string;
  philosophical_theme: string;
}

export interface MenuProjectResponse {
  concept: MenuConcept;
  courses: MaestroResponse[]; // "Courses" here refers to Rounds/Drinks
}

// ---------------------------------------

// 4. Schede Operative Rapide (SOR) System
export type SorCategory = 'INGREDIENT' | 'TECHNIQUE';

export interface SorItem {
  id: string; // e.g., "I-045" or "T-008"
  category: SorCategory;
  title: string;
  scientific_principle?: string; // For the "Scientist"
  cultural_context?: string;     // For the "Historian"
  pairing_tags: string[];        // For search/suggestion
  technical_notes: string;       // The core knowledge
}

// 5. Evolution Protocol (Feedback System)
export interface FeedbackMetrics {
  creativity: number;   // 1-5 stars
  feasibility: number;  // 1-5 stars
  depth: number;        // 1-5 stars
  adherence: number;    // 1-5 stars
  comment: string;      // Free text
}

export interface SessionEntry {
  timestamp: Date;
  request: {
    ingredients: string[];
    expertise: ExpertiseLevel;
    constraints: string[];
  };
  response_meta: {
      dish_name: string;
      concept_summary: string;
  };
  feedback?: FeedbackMetrics;
}

// 7. Market Analysis & Nutritional Models
export interface IngredientAnalysisItem {
  ingredient: string;
  quantity_used: string;       // es. "60ml"
  market_unit_price: string;   // es. "€30.00 / 700ml"
  calculated_cost: number;     // es. 2.50
  market_trend: 'STABLE' | 'RISING' | 'FALLING';
  // New Nutritional Data
  abv_content: string;         // e.g. "40%"
  calories: number;            // e.g. 140 (Kcal for this quantity)
}

export interface NutritionalProfile {
  final_abv: string;           // e.g. "19.5% Vol" (Post-dilution)
  total_calories: number;      // e.g. 210 Kcal
  dilution_factor: string;     // e.g. "~25% Water added via Shake"
}

export interface MarketReport {
  total_pour_cost: number; 
  suggested_menu_price: number;
  profit_margin_percentage: number;
  cost_breakdown: IngredientAnalysisItem[]; // Updated type
  nutritional_profile: NutritionalProfile;  // New Section
  marketing_hook: string;
  pricing_strategy_note: string;
}

// 8. Photo Prompt Model
export interface PhotoPrompt {
  image_prompt: string;
}

// 9. Global Menu Market Analysis (Phase 3)
export interface DishFinancialSummary {
  dish_name: string;
  pour_cost: number; 
  key_expensive_ingredients: string[];
}

export interface MenuMarketReport {
  overall_pour_cost: number; 
  recommended_price_per_pax: number; 
  target_margin: number;
  financial_narrative: string;
  dishes_breakdown: DishFinancialSummary[];
}

// 10. Menu Analysis & Consultant Mode (Phase 3 Part 2)
export interface AnalyzedDish {
  original_name: string;
  current_description: string;
  critique: string;
  suggested_improvement: string;
  alignment_score: number; // 1-100 score of how well it fits the brand
}

export interface RestaurantProfile {
  name: string;
  brand_identity: string; // "Speakeasy", "Tiki Bar", "High Volume"
  perceived_vibe: string; // What the web says about it
  target_audience: string;
}

export interface MenuAnalysisResponse {
  restaurant_profile: RestaurantProfile;
  dishes: AnalyzedDish[]; // Actually Drinks
  global_critique: string;
  strategic_opportunities: string[];
}

// 6. SOR Service Advanced Search
export interface SearchCriteria {
  query?: string;
  category?: SorCategory;
  tags?: string[];
}