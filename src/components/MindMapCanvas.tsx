import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { MindMapNode } from '../types/subject';
import { theme } from '../theme/theme';

// Active LayoutAnimation sur Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MindMapCanvasProps {
  rootNode: MindMapNode;
}

// --- STYLES HIÉRARCHIQUES ---
const getLevelStyles = (level: number) => {
  switch (level) {
    case 0: // RACINE
      return {
        width: 400,
        padding: 20,
        fontSize: 24,
        fontWeight: '800' as const,
        color: '#FFFFFF',
        opacity: 1,
      };
    case 1: // SECTIONS
      return {
        width: 380,
        padding: 18,
        fontSize: 18,
        fontWeight: '700' as const,
        color: '#F4F4F5',
        opacity: 0.95,
      };
    case 2: // SOUS-SECTIONS
      return {
        width: 350,
        padding: 16,
        fontSize: 15,
        fontWeight: '500' as const,
        color: '#E4E4E7',
        opacity: 0.9,
      };
    default: // DÉTAILS
      return {
        width: 260,
        padding: 12,
        fontSize: 13,
        fontWeight: '400' as const,
        color: '#A1A1AA',
        opacity: 0.85,
      };
  }
};

const LEVEL_COLORS = [
  theme.colors.primary, 
  '#60A5FA',            
  '#A78BFA',            
  '#34D399',            
  '#F472B6',            
];

const getNodeColor = (level: number) => {
  return LEVEL_COLORS[level % LEVEL_COLORS.length];
};

const MindMapItem: React.FC<{ node: MindMapNode; level: number }> = ({ 
  node, 
  level, 
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // État d'ouverture
  
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = level === 0;
  const nodeColor = getNodeColor(level);
  const levelStyle = getLevelStyles(level);

  // Fonction pour basculer l'état avec animation
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Simulation de description si elle n'existe pas encore (pour tester le design)
  const description = node.description || "Tape ici pour voir plus de détails sur ce concept clé. Ce texte explicatif permet de mieux comprendre le point abordé.";

  return (
    <View style={styles.itemWrapper}>
      <View style={styles.nodeRow}>
        
        {/* Connecteur */}
        {!isRoot && (
          <View style={styles.connectorContainer}>
             <View style={styles.connectorElbow} />
          </View>
        )}

        {/* LA CARTE INTERACTIVE */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={toggleExpand}
          style={[
            styles.cardBase, 
            theme.shadows.card,
            { 
              width: levelStyle.width,
              padding: levelStyle.padding,
              borderWidth: isRoot ? 2 : 1,
              borderColor: isRoot ? theme.colors.primary : nodeColor + '30',
              backgroundColor: isRoot ? 'rgba(255, 107, 0, 0.15)' : theme.colors.surface,
            }
        ]}>
            {/* Ligne principale : Indicateur + Titre (CHEVRON RETIRÉ) */}
            <View style={styles.cardHeaderRow}>
              <View style={[
                styles.indicator, 
                { backgroundColor: nodeColor }
              ]} />
              
              <Text style={[
                styles.text, 
                {
                  fontSize: levelStyle.fontSize,
                  fontWeight: levelStyle.fontWeight,
                  color: levelStyle.color,
                }
              ]}>
                {node.text}
              </Text>
            </View>

            {/* ZONE DE DÉTAILS (Visible seulement si expanded) */}
            {isExpanded && (
              <View style={styles.detailsContainer}>
                <View style={[styles.separator, { backgroundColor: nodeColor + '20' }]} />
                <Text style={styles.detailsText}>
                  {description}
                </Text>
              </View>
            )}
        </TouchableOpacity>
      </View>

      {/* Enfants (Récursivité) */}
      {hasChildren && (
        <View style={styles.childrenContainer}>
          <View style={[styles.verticalLine, { backgroundColor: nodeColor + '20' }]} />
          <View style={styles.childrenContent}>
            {node.children!.map((child, index) => (
              <MindMapItem 
                key={child.id || index} 
                node={child} 
                level={level + 1}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode }) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.verticalScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
      >
         <View style={styles.treeContainer}>
            <MindMapItem node={rootNode} level={0} />
         </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  verticalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
  },
  treeContainer: {},
  itemWrapper: {},
  
  // --- LAYOUT ---
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center', // Important : Alignement en haut si la carte grandit
    marginBottom: 12,
  },
  childrenContainer: {
    flexDirection: 'row',
  },
  childrenContent: {
    flexDirection: 'column',
  },

  // --- CONNECTEURS ---
  connectorContainer: {
    width: 24,
    // On veut que le connecteur reste aligné avec le haut de la carte
    height: '100%', 
    paddingTop: 24, // Ajustement pour aligner avec le milieu du HEADER de la carte (pas toute la carte)
    position: 'absolute', // Astuce pour éviter de déformer le layout quand la carte s'ouvre
    left: -24,
  },
  connectorElbow: {
    width: 16,
    height: 30, // Taille fixe du coude
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: -15, // Pour remonter le coude
  },
  verticalLine: {
    width: 2,
    marginLeft: 0, 
    marginRight: 16,
  },

  // --- CARDS ---
  cardBase: {
    flexDirection: 'column', // Changé en colonne pour accueillir les détails en dessous
    alignItems: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden', // Pour contenir l'animation
  },
  
  // Header de la carte (Titre + Indicateur)
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  // --- INDICATEURS ---
  indicator: {
    width: 4,
    height: 16, // Hauteur fixe pour l'indicateur
    borderRadius: 2,
    marginRight: 12,
  },
  
  // Style chevron supprimé

  // --- DÉTAILS ---
  detailsContainer: {
    marginTop: 12,
    width: '100%',
    paddingLeft: 16, // Alignement sous le texte
  },
  separator: {
    height: 1,
    width: '100%',
    marginBottom: 8,
    opacity: 0.3,
  },
  detailsText: {
    fontSize: 14,
    color: '#A1A1AA', // Gris lisible
    lineHeight: 20,
    fontWeight: '400',
  },

  // --- TEXTE ---
  text: {
    flex: 1, 
    flexWrap: 'wrap',
    letterSpacing: 0.3,
  },
});

export default MindMapCanvas;