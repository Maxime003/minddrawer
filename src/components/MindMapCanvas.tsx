import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { MindMapNode } from '../types/subject';
import { calculateRadialLayout, ComputedNode, ComputedEdge } from '../utils/layoutEngine';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  onNodePress?: (node: ComputedNode) => void;
}

// Dimensions et Configuration
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CANVAS_SIZE = 4000; // Espace virtuel large
const CENTER = CANVAS_SIZE / 2;

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode, onNodePress }) => {
  // --- MOTEUR PHYSIQUE (Reanimated) ---
  
  // 1. Calcul pour centrer le canvas (0,0) au milieu de l'écran au démarrage
  const initialX = (SCREEN_W - CANVAS_SIZE) / 2;
  const initialY = (SCREEN_H - CANVAS_SIZE) / 2;

  // 2. Valeurs partagées pour l'animation (Thread UI - 60 FPS)
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(1);
  
  // Mémoire pour les gestes continus
  const savedTranslateX = useSharedValue(initialX);
  const savedTranslateY = useSharedValue(initialY);
  const savedScale = useSharedValue(1);

  // --- GESTES ---

  // Pan (Déplacement)
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Pinch (Zoom)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Combinaison des gestes
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Style animé optimisé
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // --- RENDU DATA ---
  const { nodes, edges } = useMemo(() => calculateRadialLayout(rootNode), [rootNode]);

  // Courbes de Bézier
  const createEdgePath = (edge: ComputedEdge): string => {
    const sx = edge.source.x + CENTER;
    const sy = edge.source.y + CENTER;
    const tx = edge.target.x + CENTER;
    const ty = edge.target.y + CENTER;

    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const dx = tx - sx;
    const dy = ty - sy;
    
    return `M ${sx} ${sy} Q ${midX - dy * 0.3} ${midY + dx * 0.3} ${tx} ${ty}`;
  };

  // Fonction de Reset (Recentrage)
  const resetCamera = () => {
    translateX.value = withSpring(initialX);
    translateY.value = withSpring(initialY);
    scale.value = withSpring(1);
    // Reset des valeurs sauvegardées
    savedTranslateX.value = initialX;
    savedTranslateY.value = initialY;
    savedScale.value = 1;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          
          {/* Surface tactile invisible pour capturer le Pan partout */}
          <View style={styles.touchSurface} />

          {/* Calque SVG (Lignes) */}
          <View style={styles.layer} pointerEvents="none">
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

          {/* Nœuds */}
          {nodes.map((node) => {
            const isRoot = node.level === 0;
            const left = node.x + CENTER;
            const top = node.y + CENTER;

            return (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.nodeWrapper,
                  { left: left - 100, top: top - 30 },
                  { zIndex: isRoot ? 20 : 10 }
                ]}
                onPress={() => onNodePress && onNodePress(node)}
                activeOpacity={0.8}
              >
                <View style={[styles.card, isRoot ? styles.rootCard : styles.childCard]}>
                  <Text style={[styles.text, isRoot ? styles.rootText : styles.childText]} numberOfLines={3}>
                    {node.text}
                  </Text>
                  {!isRoot && <View style={styles.dot} />}
                </View>
              </TouchableOpacity>
            );
          })}

        </Animated.View>
      </GestureDetector>

      {/* Bouton de Recentrage */}
      <TouchableOpacity style={styles.fab} onPress={resetCamera}>
        <Text style={{ fontSize: 24 }}>🎯</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  touchSurface: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.001)', // Crucial pour le geste Pan
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  nodeWrapper: {
    position: 'absolute',
    width: 200,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 180,
  },
  rootCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 120,
  },
  childCard: {
    backgroundColor: 'rgba(30, 34, 43, 0.9)',
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  text: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  rootText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  childText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    position: 'absolute',
    left: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    elevation: 5,
  }
});

export default MindMapCanvas;