import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MindMapNode } from '../types/subject';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
}

const MindMapItem: React.FC<{ node: MindMapNode; level: number; isLast?: boolean }> = ({ 
  node, 
  level, 
  isLast = false 
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = level === 0;

  return (
    <View style={styles.itemWrapper}>
      {/* 1. LE NŒUD (CARD) */}
      <View style={styles.nodeRow}>
        
        {/* Lignes de connexion (Pour les enfants uniquement) */}
        {!isRoot && (
          <View style={styles.connectorContainer}>
             {/* Ligne courbe qui vient du parent */}
             <View style={styles.connectorElbow} />
          </View>
        )}

        {/* Le contenu (Glass Card) */}
        <View style={[
            styles.cardBase, 
            isRoot ? styles.cardRoot : styles.cardChild,
            theme.shadows.card
        ]}>
            {/* Indicateur coloré */}
            <View style={[
              styles.indicator, 
              isRoot ? styles.indicatorRoot : styles.indicatorChild 
            ]} />
            
            <Text style={[
              styles.text, 
              isRoot ? styles.textRoot : styles.textChild
            ]}>
              {node.text}
            </Text>
        </View>
      </View>

      {/* 2. LES ENFANTS (Récursion) */}
      {hasChildren && (
        <View style={styles.childrenContainer}>
          {/* Ligne verticale continue qui longe les enfants */}
          <View style={styles.verticalLine} />
          
          <View style={styles.childrenContent}>
            {node.children!.map((child, index) => (
              <MindMapItem 
                key={child.id || index} 
                node={child} 
                level={level + 1}
                isLast={index === node.children!.length - 1}
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
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <MindMapItem node={rootNode} level={0} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Transparent car géré par ScreenWrapper
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espace pour le footer
  },
  itemWrapper: {
    marginBottom: 0,
  },
  
  // --- LAYOUT ARBORESCENCE ---
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childrenContainer: {
    flexDirection: 'row',
  },
  childrenContent: {
    flex: 1,
  },

  // --- CONNECTEURS (LIGNES) ---
  connectorContainer: {
    width: 24,
    height: 40, // Hauteur ajustée pour aligner avec le milieu de la carte
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  // Le "Coude" (Ligne qui part de la gauche et remonte)
  connectorElbow: {
    position: 'absolute',
    left: 0, // Collé à la ligne verticale du parent
    top: -20, // Remonte vers le parent
    bottom: '50%', // S'arrête au milieu de la hauteur de la ligne
    width: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 12, // Arrondi joli
    borderColor: theme.colors.textSecondary,
    opacity: 0.3,
  },
  // La ligne verticale continue à gauche des enfants
  verticalLine: {
    width: 2,
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.3,
    marginLeft: 0, // Doit s'aligner avec le borderLeft du connectorElbow
    marginRight: 22, // Espace avant le contenu des enfants
    flexGrow: 1,
  },

  // --- CARDS DESIGN (Glassmorphism) ---
  cardBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardRoot: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)', // Teinte orange subtile
    borderColor: 'rgba(255, 107, 0, 0.3)',
    marginBottom: 16,
    paddingVertical: 18,
  },
  cardChild: {
    // Style par défaut
  },

  // --- INDICATEURS (Puces) ---
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  indicatorRoot: {
    backgroundColor: theme.colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorChild: {
    backgroundColor: theme.colors.textSecondary,
  },

  // --- TYPOGRAPHIE ---
  text: {
    color: theme.colors.textPrimary,
    flex: 1,
  },
  textRoot: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  textChild: {
    fontSize: 15,
    fontWeight: '400',
    color: '#E4E4E7', // Zinc-200
    lineHeight: 22,
  },
});

export default MindMapCanvas;