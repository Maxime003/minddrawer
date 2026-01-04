import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
// 👇 Toujours l'import nommé avec les accolades
import { ReactNativeZoomableView } from '@dudigital/react-native-zoomable-view';
import Svg, { Path } from 'react-native-svg';
import { MindMapNode } from '../types/subject';
import { calculateRadialLayout, ComputedNode, ComputedEdge } from '../utils/layoutEngine';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  onNodePress?: (node: ComputedNode) => void;
}

const CANVAS_SIZE = 2000;
const CANVAS_CENTER = CANVAS_SIZE / 2;

// On récupère les dimensions de l'écran pour calculer le centre
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode, onNodePress }) => {
  // Calcul du layout
  const { nodes, edges } = useMemo(() => calculateRadialLayout(rootNode), [rootNode]);

  // --- CALCUL DU CENTRAGE (Correction) ---
  // On veut que le pixel 1000 (Centre Canvas) soit au milieu de l'écran.
  // Décalage = (Moitié Ecran) - (Centre Canvas)
  // Ex: 200 - 1000 = -800.
  const initialOffsetX = (screenWidth / 2) - CANVAS_CENTER;
  const initialOffsetY = (screenHeight / 2) - CANVAS_CENTER;

  const createEdgePath = (edge: ComputedEdge): string => {
    const sx = edge.source.x + CANVAS_CENTER;
    const sy = edge.source.y + CANVAS_CENTER;
    const tx = edge.target.x + CANVAS_CENTER;
    const ty = edge.target.y + CANVAS_CENTER;

    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const dx = tx - sx;
    const dy = ty - sy;
    
    return `M ${sx} ${sy} Q ${midX - dy * 0.3} ${midY + dx * 0.3} ${tx} ${ty}`;
  };

  const handleNodePress = (node: ComputedNode) => {
    if (onNodePress) onNodePress(node);
  };

  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        maxZoom={2}
        minZoom={0.2}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={false} // Important : permet de se balader librement
        panEnabled={true}
        zoomEnabled={true}
        // 👇 C'EST ICI QUE C'ETAIT MANQUANT : On passe les offsets calculés
        initialOffsetX={initialOffsetX}
        initialOffsetY={initialOffsetY}
        // 👇 On retire contentWidth/Height pour éviter de bloquer le Pan
        style={styles.zoomableView}
      >
        <View style={styles.canvasContainer}>
          
          {/* Couche SVG (Lignes) */}
          {/* pointerEvents="none" laisse passer le clic au travers vers le fond pour le Pan */}
          <View style={styles.svgLayerWrapper} pointerEvents="none">
            <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
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
          </View>

          {/* Couche Nœuds (Cartes) */}
          {nodes.map((node) => {
            const isRoot = node.level === 0;
            const nodeX = node.x + CANVAS_CENTER;
            const nodeY = node.y + CANVAS_CENTER;

            return (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.nodeContainer,
                  {
                    left: nodeX - 100, // Centrage horizontal (largeur 200)
                    top: nodeY - 30,  // Centrage vertical
                  },
                  isRoot ? styles.rootNode : styles.childNode,
                ]}
                onPress={() => handleNodePress(node)}
                activeOpacity={0.7}
              >
                <View style={[styles.nodeCard, isRoot ? styles.rootCard : styles.childCard]}>
                  <Text style={[styles.nodeText, isRoot ? styles.rootText : styles.childText]} numberOfLines={3}>
                    {node.text}
                  </Text>
                  
                  {!isRoot && <View style={styles.connectionDot} />}
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
    overflow: 'hidden',
  },
  zoomableView: {
    flex: 1,
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    // Une couleur de fond quasi-invisible est nécessaire pour capter le "drag" (Pan)
    backgroundColor: 'rgba(255,255,255, 0.001)', 
  },
  svgLayerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    zIndex: 0,
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200, 
    height: 60,
    zIndex: 10,
  },
  nodeCard: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    minWidth: 100,
    maxWidth: 180,
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
    paddingVertical: theme.spacing.m,
    minWidth: 140,
  },
  childCard: {
    backgroundColor: 'rgba(30, 34, 43, 0.95)',
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 13,
    fontWeight: '500',
  },
  rootNode: { zIndex: 100 },
  childNode: { zIndex: 50 },
  connectionDot: {
    position: 'absolute',
    left: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
});

export default MindMapCanvas;