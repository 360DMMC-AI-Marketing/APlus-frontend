const KEYWORD_MAP = [
  { keywords: ["glove", "latex", "nitrile", "vinyl"], category: "Gloves" },
  { keywords: ["ppe", "mask", "gown", "shield", "protective", "respirator", "goggles"], category: "PPE (Personal Protective Equipment)" },
  { keywords: ["wound", "bandage", "gauze", "dressing", "adhesive"], category: "Wound Care" },
  { keywords: ["advanced wound", "collagen", "foam dressing", "alginate", "hydrogel"], category: "Advanced Wound Care" },
  { keywords: ["catheter", "iv", "vascular", "needle", "syringe", "infusion", "cannula"], category: "Vascular Access" },
  { keywords: ["incontinence", "diaper", "underpad", "briefs", "absorbent"], category: "Incontinence Care" },
  { keywords: ["feeding", "enteral", "tube", "nutritional"], category: "Enteral Feeding Tubes" },
  { keywords: ["skin", "biologic", "graft", "tissue"], category: "Skin Biologics" },
  { keywords: ["wheelchair", "walker", "crutch", "bed", "lift", "dme", "mri", "x-ray", "monitor", "scanner", "ventilator", "defibrillator", "machine", "equipment", "pump"], category: "DME (Durable Medical Equipment)" },
  { keywords: ["thermometer", "stethoscope", "oximeter", "bp", "blood pressure", "scale", "swab", "test", "specimen", "lab", "microscope"], category: "Nursing Care Supplies" },
  { keywords: ["tray", "kit", "supply", "central", "steril", "disinfect", "wipe", "container"], category: "Central Supply" },
];

export function inferCategory(product) {
  if (product.category) return product.category;

  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const text = `${name} ${desc}`;

  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => text.includes(kw))) {
      return entry.category;
    }
  }

  return "Central Supply";
}
