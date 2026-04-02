import { useState, useEffect } from "react";
import { apiClient } from "../api/client";

const FALLBACK_CATEGORIES = [
  { id: 1, name: "Wound Care", slug: "wound-care" },
  { id: 2, name: "Vascular Access", slug: "vascular-access" },
  { id: 3, name: "Incontinence Care", slug: "incontinence-care" },
  { id: 4, name: "Gloves", slug: "gloves" },
  { id: 5, name: "Nursing Care Supplies", slug: "nursing-care-supplies" },
  { id: 6, name: "Enteral Feeding Tubes", slug: "enteral-feeding-tubes" },
  { id: 7, name: "Skin Biologics", slug: "skin-biologics" },
  { id: 8, name: "Advanced Wound Care", slug: "advanced-wound-care" },
  { id: 9, name: "PPE (Personal Protective Equipment)", slug: "ppe-personal-protective-equipment" },
  { id: 10, name: "Central Supply", slug: "central-supply" },
  { id: 11, name: "DME (Durable Medical Equipment)", slug: "dme-durable-medical-equipment" },
];

let cachedCategories = null;

export function useCategories() {
  const [categories, setCategories] = useState(cachedCategories || FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(!cachedCategories);

  useEffect(() => {
    if (cachedCategories) return;

    apiClient("/categories")
      .then((data) => {
        const list = data.categories || [];
        if (list.length > 0) {
          cachedCategories = list;
          setCategories(list);
        }
      })
      .catch(() => {
        // API not available — fallback categories already set
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}
