import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MindMapNode } from '../types/subject';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
}

/**
 * Composant récursif pour afficher un nœud de la Mind Map dans une liste hiérarchique simple
 */
const MindMapItem: React.FC<{ node: MindMapNode; level: number }> = ({ node, level }) => {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = level * 20;

  return (
    <View style={styles.itemContainer}>
      {/* Nœud avec bordure gauche colorée et padding */}
      <View style={[styles.nodeContainer, { paddingLeft }]}>
        <View style={styles.borderLeft} />
        <Text style={styles.nodeText}>{node.text}</Text>
      </View>

      {/* Récursion pour les enfants */}
      {hasChildren && (
        <View>
          {node.children!.map((child) => (
            <MindMapItem key={child.id} node={child} level={level + 1} />
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Composant principal : Vue liste hiérarchique simple de la Mind Map
 */
const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode }) => {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <MindMapItem node={rootNode} level={0} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  itemContainer: {
    marginBottom: theme.spacing.xs,
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.s,
    paddingVertical: theme.spacing.s,
    paddingRight: theme.spacing.m,
    marginBottom: theme.spacing.xs,
  },
  borderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.colors.primary,
  },
  nodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
});

export default MindMapCanvas;