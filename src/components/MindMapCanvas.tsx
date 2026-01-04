import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
// 👇 IMPORTANT : Toujours garder les accolades ici
import { ReactNativeZoomableView } from '@dudigital/react-native-zoomable-view';
import Svg, { Path } from 'react-native-svg';
import { MindMapNode } from '../types/subject';
import { calculateRadialLayout, ComputedNode, ComputedEdge } from '../utils/layoutEngine';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  onNodePress?: (node: ComputedNode) => void;
}

// 1. On réduit la taille pour soulager la mémoire (2000px suffisent largement)
const CANVAS_SIZE = 2000;
const CANVAS_CENTER = CANVAS_SIZE / 2;

// Récupération des dimensions de l'écran
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode, onNodePress }) => {
  const zoomRef = useRef<ReactNativeZoomableView | null>(null);
  
  // Recalcul du layout si les données changent
  const { nodes, edges } = useMemo(() => calculateRadialLayout(rootNode), [rootNode]);

  // 2. Calcul du décalage initial précis
  // Pour centrer le point (1000, 1000) sur un écran (ex: 400, 800)
  // On doit décaler le canvas vers la gauche et le haut.
  const initialOffsetX = (screenWidth / 2) - CANVAS_CENTER;
  const initialOffsetY = (screenHeight / 2) - CANVAS_CENTER;

  // Création des courbes
  const createEdgePath = (edge: ComputedEdge): string => {
    // Conversion coordonnées relatives -> absolues dans le canvas
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

  // 3. Sécurité : On force le zoom à se positionner après le montage du composant
  useEffect(() => {
    if (zoomRef.current) {
        // Optionnel : si le centrage initial rate, on peut le forcer ici
        // zoomRef.current.moveTo(initialOffsetX, initialOffsetY);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        ref={zoomRef}
        maxZoom={2}
        minZoom={0.2}
        zoomStep={0.5}
        initialZoom={1} // Zoom normal au début
        bindToBorders={false} // Permet de sortir du cadre (essentiel)
        panEnabled={true}
        zoomEnabled={true}
        // Définition explicite de la taille du contenu
        contentWidth={CANVAS_SIZE}
        contentHeight={CANVAS_SIZE}
        // Application du décalage calculé
        initialOffsetX={initialOffsetX}
        initialOffsetY={initialOffsetY}
        style={styles.zoomableView}
      >
        <View style={styles.canvasContainer}>
          
          {/* Couche 1 : Les Liens (SVG) */}
          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.svgLayer}>
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

          {/* Couche 2 : Les Nœuds */}
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
    flex: 1, // Prend toute la place dispo
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    // Fond transparent mais "solide" pour capturer le tactile
    backgroundColor: 'rgba(255,255,255, 0.001)', 
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
    width: 200, 
    height: 60, // Hauteur fixe pour aider le layout
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