export const theme = {
  colors: {
    // FOND : Un noir profond mais pas absolu pour laisser vivre les ombres
    background: '#09090B', 
    
    // SURFACE (Glass) : Noir avec transparence pour l'effet de superposition
    surface: 'rgba(30, 30, 35, 0.7)',
    surfaceLight: 'rgba(255, 255, 255, 0.05)', // Pour les items survolés ou actifs
    
    // BORDURES : Très subtiles, essentielles pour le glassmorphism
    border: 'rgba(255, 255, 255, 0.1)',
    
    // ACCENT ÉNERGIQUE : Orange électrique
    primary: '#FF6B00', 
    primaryGradient: ['#FF6B00', '#FF9F0A'], // Pour les dégradés de boutons
    
    // TEXTE
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA', // Gris zinc lisible
    textTertiary: '#52525B',

    // STATUS
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },

  borderRadius: {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },

  // OMBRES PRÉ-DÉFINIES (Shadow generator style)
  shadows: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    glow: {
      shadowColor: "#FF6B00",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    }
  }
};