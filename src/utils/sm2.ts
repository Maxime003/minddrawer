/**
 * Algorithme SM-2 (SuperMemo 2) pour la répétition espacée
 * 
 * @param quality - Qualité de la réponse (0-5)
 *   - 0-2: Échec complet
 *   - 3: Difficulté
 *   - 4: Correct avec effort
 *   - 5: Facile
 * @param previousInterval - Intervalle précédent en jours
 * @param previousRepetitions - Nombre de répétitions précédentes
 * @param previousEaseFactor - Facteur de facilité précédent (EF)
 * @returns Nouveau intervalle, répétitions et facteur de facilité
 */
export interface SM2Result {
  interval: number;
  repetitions: number;
  easeFactor: number;
}

export const calculateSM2 = (
  quality: number,
  previousInterval: number,
  previousRepetitions: number,
  previousEaseFactor: number
): SM2Result => {
  let easeFactor = previousEaseFactor;
  let repetitions = previousRepetitions;
  let interval = previousInterval;

  // Si qualité < 3 (échec) : réinitialiser
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    // easeFactor reste inchangé
  } else {
    // Si qualité >= 3 (succès) : mettre à jour
    // Calcul du nouveau easeFactor
    easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Minimum 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    // Mise à jour des répétitions
    repetitions = previousRepetitions + 1;

    // Calcul du nouvel intervalle
    if (repetitions === 1) {
      interval = 1; // 1 jour
    } else if (repetitions === 2) {
      interval = 6; // 6 jours
    } else {
      // repetitions > 2 : intervalle = intervalle précédent * easeFactor
      interval = Math.ceil(previousInterval * easeFactor);
    }
  }

  return {
    interval,
    repetitions,
    easeFactor,
  };
};
