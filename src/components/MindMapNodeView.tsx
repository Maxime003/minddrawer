import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MindMapNode } from '../types/subject';

interface MindMapNodeViewProps {
  node: MindMapNode;
  level?: number;
}

/**
 * Composant récursif pour afficher un nœud de la Mind Map et ses enfants
 */
const MindMapNodeView: React.FC<MindMapNodeViewProps> = ({ node, level = 0 }) => {
  // Fonction pour obtenir la couleur de bordure selon le niveau
  const getBorderColor = (level: number): string => {
    const colors = ['#4a90e2', '#6bcf7f', '#ff9500', '#ff6b6b', '#9370db'];
    return colors[Math.min(level, colors.length - 1)];
  };

  const borderColor = getBorderColor(level);
  const indent = level * 15;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <View style={[styles.container, { marginLeft: indent }]}>
      {/* Carte du nœud */}
      <View style={[styles.nodeCard, { borderLeftColor: borderColor }]}>
        <Text style={styles.nodeText}>{node.text}</Text>
      </View>

      {/* Récursion pour les enfants */}
      {hasChildren && (
        <View style={styles.childrenContainer}>
          {node.children!.map((child) => (
            <MindMapNodeView key={child.id} node={child} level={level + 1} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  nodeCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    padding: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  childrenContainer: {
    marginTop: 4,
  },
});

export default MindMapNodeView;
