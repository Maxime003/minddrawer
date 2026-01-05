import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MindMapNode } from '../types/subject';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// On définit le padding ici pour l'utiliser dans le calcul de largeur
const HORIZONTAL_PADDING = 20;

// Palette de couleurs pour les niveaux
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
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = level === 0;
  const nodeColor = getNodeColor(level);

  return (
    <View style={styles.itemWrapper}>
      {/* 1. LE NŒUD (CARD) */}
      <View style={styles.nodeRow}>
        
        {/* Lignes de connexion (Pour les enfants uniquement) */}
        {!isRoot && (
          <View style={styles.connectorContainer}>
             <View style={styles.connectorElbow} />
          </View>
        )}

        {/* Le contenu (Glass Card) */}
        <View style={[
            styles.cardBase, 
            isRoot ? styles.cardRoot : styles.cardChild,
            theme.shadows.card,
            { borderColor: isRoot ? theme.colors.primary : nodeColor + '40' }
        ]}>
            <View style={[
              styles.indicator, 
              { backgroundColor: nodeColor }
            ]} />
            
            <Text style={[
              styles.text, 
              isRoot ? styles.textRoot : styles.textChild
            ]}>
              {node.text}
            </Text>
        </View>
      </View>

      {/* 2. LES ENFANTS */}
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
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false} 
    >
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }} // Permet au contenu de remplir l'écran
      >
         {/* CORRECTION : On soustrait le padding de la largeur minimale forcée */}
         <View style={[
           styles.horizontalScrollWrapper, 
           { minWidth: SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) }
         ]}>
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
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  horizontalScrollWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING, // 20px de chaque côté
    // Le minWidth est géré inline pour le calcul dynamique
  },
  itemWrapper: {
    width: '100%',
  },
  
  // --- LAYOUT ---
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    // On enlève le paddingRight ici car il est géré par le wrapper principal maintenant
  },
  childrenContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  childrenContent: {
    flex: 1,
    flexDirection: 'column',
  },

  // --- CONNECTEURS ---
  connectorContainer: {
    width: 24,
    height: 30, 
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  connectorElbow: {
    position: 'absolute',
    left: 0,
    top: -24, 
    bottom: '50%',
    width: 16,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  verticalLine: {
    width: 2,
    marginLeft: 0, 
    marginRight: 16,
  },

  // --- CARDS ---
  cardBase: {
    flex: 1, // Stretch
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minWidth: 150,
  },
  cardRoot: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    marginBottom: 24,
    paddingVertical: 20,
  },
  cardChild: {},

  // --- INDICATEURS ---
  indicator: {
    width: 4,
    height: '100%',
    minHeight: 16,
    borderRadius: 2,
    marginRight: 14,
  },
  indicatorRoot: {
    width: 6,
    height: 20,
  },

  // --- TEXTE ---
  text: {
    flex: 1, 
    flexWrap: 'wrap',
  },
  textRoot: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  textChild: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E4E4E7',
    lineHeight: 22,
  },
});

export default MindMapCanvas;