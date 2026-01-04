import { MindMapNode } from '../types/subject';

/**
 * Nœud calculé avec ses coordonnées et métadonnées de positionnement
 */
export interface ComputedNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  parentId?: string;
}

/**
 * Arête calculée entre deux nœuds
 */
export interface ComputedEdge {
  id: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
}

/**
 * Résultat du calcul de layout radial
 */
export interface RadialLayoutResult {
  nodes: ComputedNode[];
  edges: ComputedEdge[];
}

/**
 * Constantes pour le layout radial
 */
const RADIUS_LEVEL_1 = 200; // Rayon pour les enfants directs de la racine
const RADIUS_LEVEL_2 = 150; // Rayon supplémentaire pour les sous-enfants

/**
 * Convertit un angle en radians en coordonnées cartésiennes
 */
function polarToCartesian(radius: number, angleInRadians: number): { x: number; y: number } {
  return {
    x: radius * Math.cos(angleInRadians),
    y: radius * Math.sin(angleInRadians),
  };
}

/**
 * Calcule le layout radial d'une Mind Map
 * 
 * @param rootNode Le nœud racine de la Mind Map
 * @returns Les nœuds et arêtes calculés avec leurs positions
 */
export function calculateRadialLayout(rootNode: MindMapNode): RadialLayoutResult {
  const nodes: ComputedNode[] = [];
  const edges: ComputedEdge[] = [];

  // Fonction récursive pour parcourir l'arbre et calculer les positions
  function processNode(
    node: MindMapNode,
    level: number,
    parentId?: string,
    parentPosition?: { x: number; y: number },
    parentNode?: MindMapNode
  ) {
    let nodePosition: { x: number; y: number };

    if (level === 0) {
      // Racine : position (0, 0)
      nodePosition = { x: 0, y: 0 };
    } else if (level === 1) {
      // Niveau 1 : cercle autour de la racine
      const childrenCount = rootNode.children?.length || 0;
      if (childrenCount === 0) {
        return; // Pas d'enfants, on ne peut pas calculer
      }

      // Trouve l'index de ce nœud parmi les enfants de la racine
      const nodeIndex = rootNode.children!.findIndex((child) => child.id === node.id);
      if (nodeIndex === -1) {
        return; // Nœud non trouvé
      }

      // Répartition uniforme des angles (360° / nombre d'enfants)
      const angleStep = (2 * Math.PI) / childrenCount;
      const angle = nodeIndex * angleStep;

      nodePosition = polarToCartesian(RADIUS_LEVEL_1, angle);
    } else {
      // Niveau 2+ : éventail autour du parent, orienté vers l'extérieur
      if (!parentPosition || !parentNode) {
        return; // Pas de parent, impossible de calculer
      }

      const children = parentNode.children;
      if (!children || children.length === 0) {
        return;
      }

      const nodeIndex = children.findIndex((child) => child.id === node.id);
      if (nodeIndex === -1) {
        return;
      }

      // Calcule l'angle du parent par rapport à la racine
      const parentAngle = Math.atan2(parentPosition.y, parentPosition.x);
      const parentDistance = Math.sqrt(
        parentPosition.x * parentPosition.x + parentPosition.y * parentPosition.y
      );

      // Angle d'ouverture pour les enfants (60° par défaut, ajusté selon le nombre)
      const spreadAngle = Math.min(Math.PI / 3, Math.PI / children.length);
      const startChildAngle = parentAngle - spreadAngle / 2;
      const angleStep = children.length > 1 ? spreadAngle / (children.length - 1) : 0;
      const childAngle = startChildAngle + nodeIndex * angleStep;

      // Position à une distance supplémentaire du parent
      const newDistance = parentDistance + RADIUS_LEVEL_2;
      nodePosition = polarToCartesian(newDistance, childAngle);
    }

    // Ajoute le nœud calculé
    nodes.push({
      id: node.id,
      text: node.text,
      x: nodePosition.x,
      y: nodePosition.y,
      level,
      parentId,
    });

    // Ajoute l'arête si le nœud a un parent
    if (parentPosition && parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentPosition,
        target: nodePosition,
      });
    }

    // Traite les enfants récursivement
    if (node.children && node.children.length > 0) {
      if (level === 0) {
        // Pour la racine, on calcule les angles pour tous les enfants de niveau 1
        const childrenCount = node.children.length;
        const angleStep = (2 * Math.PI) / childrenCount;

        node.children.forEach((child, index) => {
          const childAngle = index * angleStep;
          const childPosition = polarToCartesian(RADIUS_LEVEL_1, childAngle);
          processNode(child, level + 1, node.id, childPosition, node);
        });
      } else {
        // Pour les autres niveaux, on traite chaque enfant
        node.children.forEach((child) => {
          processNode(child, level + 1, node.id, nodePosition, node);
        });
      }
    }
  }

  // Démarre le traitement depuis la racine
  processNode(rootNode, 0);

  return { nodes, edges };
}
