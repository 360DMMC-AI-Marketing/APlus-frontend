export const CATEGORIES = [
  "All Products",
  "Wound Care",
  "Vascular Access",
  "Incontinence Care",
  "Gloves",
  "Nursing Care Supplies",
  "Enteral Feeding Tubes",
  "Skin Biologics",
  "Advanced Wound Care",
  "PPE (Personal Protective Equipment)",
  "Central Supply",
  "DME (Durable Medical Equipment)",
];

// Categories without "All Products" — for forms and registration
export const PRODUCT_CATEGORIES = CATEGORIES.filter(c => c !== "All Products");
