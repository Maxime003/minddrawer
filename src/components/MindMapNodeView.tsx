import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MindMapNode } from '../types/subject';
import { theme } from '../theme/theme';

interface MindMapNodeViewProps {
  node: MindMapNode;
  level?: number;
}

/**
 * Composant récursif pour afficher un nœud de la Mind Map et ses enfants
 * Style "User Flow" avec lignes de connexion visibles
 */
const MindMapNodeView: React.FC<MindMapNodeViewProps> = ({ node, level = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = level === 0;

  return (
    <View style={styles.container}>
      {/* Carte du nœud */}
      <View style={[styles.nodeCard, isRoot ? styles.rootCard : styles.childCard]}>
        {!isRoot && (
          <View style={styles.connectionDot} />
        )}
        <Text style={[styles.nodeText, isRoot ? styles.rootText : styles.childText]}>
          {node.text}
        </Text>
      </View>

      {/* Récursion pour les enfants avec lignes de connexion */}
      {hasChildren && (
        <View style={styles.childrenContainer}>
          {/* Conteneur avec ligne verticale et enfants */}
          <View style={styles.childrenWithLine}>
            {/* Ligne verticale qui s'arrête au dernier enfant */}
            <View style={styles.verticalLineContainer}>
              <View style={styles.verticalLine} />
            </View>
            
            {/* Conteneur des enfants */}
            <View style={styles.childrenWrapper}>
              {node.children!.map((child, index) => {
                const isLastChild = index === node.children!.length - 1;
                return (
                  <View key={child.id} style={styles.childRow}>
                    {/* Ligne horizontale (bras) alignée au centre vertical */}
                    <View style={styles.horizontalLineContainer}>
                      <View style={styles.horizontalLine} />
                    </View>
                    
                    {/* Nœud enfant */}
                    <View style={styles.childNodeContainer}>
                      <MindMapNodeView node={child} level={level + 1} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  // Carte racine (Niveau 0)
  rootCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  // Carte enfant
  childCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    minHeight: 40, // Hauteur minimale pour aligner le point
  },
  nodeCard: {
    // Style de base pour les cartes
  },
  // Point de connexion sur les cartes enfants
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    position: 'absolute',
    left: -9, // Positionné à gauche de la carte, aligné avec la ligne horizontale
    top: 17, // Centre verticalement (environ la moitié de minHeight 40 - 3px de radius)
  },
  // Texte
  nodeText: {
    color: theme.colors.textPrimary,
  },
  rootText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  childText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  // Conteneur des enfants
  childrenContainer: {
    marginTop: theme.spacing.m,
    marginLeft: 20, // Marge à gauche comme demandé
  },
  // Conteneur avec ligne verticale et enfants
  childrenWithLine: {
    flexDirection: 'row',
  },
  // Conteneur de la ligne verticale
  verticalLineContainer: {
    width: 2,
    marginRight: theme.spacing.s,
    justifyContent: 'flex-start',
  },
  // Ligne verticale continue (s'arrête naturellement au dernier enfant)
  verticalLine: {
    width: 2,
    backgroundColor: theme.colors.surfaceHighlight,
    flex: 1,
    minHeight: 40, // Hauteur minimale pour être visible
  },
  // Wrapper des enfants
  childrenWrapper: {
    flex: 1,
  },
  // Ligne horizontale (bras) pour chaque enfant
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  // Conteneur de la ligne horizontale (pour alignement vertical)
  horizontalLineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  horizontalLine: {
    width: 16,
    height: 2,
    backgroundColor: theme.colors.surfaceHighlight,
  },
  // Conteneur du nœud enfant
  childNodeContainer: {
    flex: 1,
  },
});

export default MindMapNodeView;
