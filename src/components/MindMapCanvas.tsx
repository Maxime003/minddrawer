import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ReactNativeZoomableView } from '@dudigital/react-native-zoomable-view'; // Garde les accolades
import Svg, { Path } from 'react-native-svg';
import { MindMapNode } from '../types/subject';
import { calculateRadialLayout, ComputedNode, ComputedEdge } from '../utils/layoutEngine';
import { theme } from '../theme/theme';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  onNodePress?: (node: ComputedNode) => void;
}

// On garde une taille confortable mais pas excessive
const CANVAS_SIZE = 2000;
const CANVAS_CENTER = CANVAS_SIZE / 2;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode, onNodePress }) => {
  const zoomRef = useRef<ReactNativeZoomableView | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);

  // Calcul du layout
  const { nodes, edges } = useMemo(() => calculateRadialLayout(rootNode), [rootNode]);

  // Fonction pour centrer la caméra programmeatiquement
  const centerCamera = () => {
    if (zoomRef.current) {
      // Le but : Placer le point (1000, 1000) au centre de ton écran.
      // Offset X = (Moitié Ecran) - 1000
      // Offset Y = (Moitié Ecran) - 1000
      const targetX = (screenWidth / 2) - CANVAS_CENTER;
      const targetY = (screenHeight / 2) - CANVAS_CENTER;

      // On force le déplacement immédiat
      zoomRef.current.moveTo(targetX, targetY);
    }
  };

  // On centre une fois au démarrage, après un court délai pour être sûr que tout est chargé
  useEffect(() => {
    const timer = setTimeout(() => {
      centerCamera();
    }, 100); // 100ms de délai pour laisser le temps au moteur de rendu
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <View style={styles.container}>
      <ReactNativeZoomableView
        ref={zoomRef}
        // Liberté totale de zoom
        maxZoom={2}
        minZoom={0.2}
        zoomStep={0.5}
        initialZoom={1}
        // CRUCIAL : On désactive les bordures pour éviter le "snap back" (disparition)
        bindToBorders={false}
        // CRUCIAL : On active le pan
        panEnabled={true}
        zoomEnabled={true}
        // IMPORTANT : On NE PASSE PAS contentWidth/Height ici pour éviter les conflits
        style={styles.zoomableView}
        // Un double tap pour recentrer si on est perdu
        onDoubleTapAfter={centerCamera}
      >
        {/* Le Conteneur du Canvas.
            J'ai ajouté une bordure temporaire (opacity 0.1) pour que tu puisses voir les limites
            si jamais tu te perds.
        */}
        <View style={styles.canvasContainer}>
          
          {/* Couche SVG (Lignes) */}
          {/* pointerEvents="none" est vital : il laisse passer tes doigts à travers les lignes */}
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
                onPress={() => onNodePress && onNodePress(node)}
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
      
      {/* Bouton flottant de Recentrage (Optionnel, utile pour debug) */}
      <TouchableOpacity style={styles.centerButton} onPress={centerCamera}>
        <Text style={{fontSize: 20}}>🎯</Text>
      </TouchableOpacity>
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
    // Cette couleur de fond est INDISPENSABLE pour que le Pan fonctionne dans le vide
    backgroundColor: 'rgba(255, 255, 255, 0.02)', 
    // Bordure de debug (très subtile) pour voir les limites du terrain de jeu
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
  centerButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
    elevation: 5,
    zIndex: 200,
  }
});

export default MindMapCanvas;