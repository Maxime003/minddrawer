import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view';
import Svg, { Path } from 'react-native-svg';
import { MindMapNode } from '../types/subject';
import { calculateRadialLayout, ComputedNode, ComputedEdge } from '../utils/layoutEngine';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  onNodePress?: (node: ComputedNode) => void;
}

const CANVAS_SIZE = 5000; // Taille du canvas SVG
const CANVAS_CENTER = CANVAS_SIZE / 2;

/**
 * Composant pour afficher une Mind Map en mode radial/nuage avec zoom et pan
 */
const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode, onNodePress }) => {
  // Calcule les positions des nœuds et arêtes
  const { nodes, edges } = useMemo(() => {
    return calculateRadialLayout(rootNode);
  }, [rootNode]);

  // Trouve les limites pour centrer le canvas
  const bounds = useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [nodes]);

  // Offset pour centrer le canvas
  const offsetX = CANVAS_CENTER - (bounds.minX + bounds.maxX) / 2;
  const offsetY = CANVAS_CENTER - (bounds.minY + bounds.maxY) / 2;

  /**
   * Crée un chemin SVG pour une arête (courbe de Bézier)
   */
  const createEdgePath = (edge: ComputedEdge): string => {
    const sx = edge.source.x + offsetX;
    const sy = edge.source.y + offsetY;
    const tx = edge.target.x + offsetX;
    const ty = edge.target.y + offsetY;

    // Courbe de Bézier quadratique pour un effet plus organique
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    
    // Point de contrôle pour la courbe (légèrement décalé pour une courbe douce)
    const dx = tx - sx;
    const dy = ty - sy;
    const controlX = midX - dy * 0.3;
    const controlY = midY + dx * 0.3;

    return `M ${sx} ${sy} Q ${controlX} ${controlY} ${tx} ${ty}`;
  };

  const handleNodePress = (node: ComputedNode) => {
    if (onNodePress) {
      onNodePress(node);
    }
  };

  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        maxZoom={2}
        minZoom={0.2}
        initialZoom={0.8}
        bindToBorders={false}
        style={styles.zoomContainer}
      >
        <View style={styles.canvasContainer}>
          {/* Couche 1 : Les Liens (SVG) */}
          <Svg
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={styles.svgLayer}
          >
            {edges.map((edge) => (
              <Path
                key={edge.id}
                d={createEdgePath(edge)}
                fill="none"
                stroke={theme.colors.surfaceHighlight}
                strokeWidth={2}
                opacity={0.6}
              />
            ))}
          </Svg>

          {/* Couche 2 : Les Nœuds (Views) */}
          {nodes.map((node) => {
            const isRoot = node.level === 0;
            const nodeX = node.x + offsetX;
            const nodeY = node.y + offsetY;

            return (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.nodeContainer,
                  {
                    left: nodeX - 100, // Ajuste pour centrer (moitié de la largeur max estimée)
                    top: nodeY - 30, // Ajuste pour centrer (moitié de la hauteur estimée)
                  },
                  isRoot ? styles.rootNode : styles.childNode,
                ]}
                onPress={() => handleNodePress(node)}
                activeOpacity={0.7}
              >
                <View style={[styles.nodeCard, isRoot ? styles.rootCard : styles.childCard]}>
                  <Text
                    style={[
                      styles.nodeText,
                      isRoot ? styles.rootText : styles.childText,
                    ]}
                    numberOfLines={3}
                  >
                    {node.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ReactNativeZoomableView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  zoomContainer: {
    flex: 1,
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    position: 'relative',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCard: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    minWidth: 100,
    maxWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  childCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    // Effet glassmorphism avec fond semi-transparent
    backgroundColor: 'rgba(30, 34, 43, 0.8)', // surface avec opacité
  },
  nodeText: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  rootText: {
    fontSize: 16,
    fontWeight: '700',
  },
  childText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rootNode: {
    // Ajustements pour le nœud racine
  },
  childNode: {
    // Ajustements pour les nœuds enfants
  },
});

export default MindMapCanvas;
