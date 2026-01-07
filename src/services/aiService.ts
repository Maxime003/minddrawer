import { MindMapNode } from '../types/subject';
import { supabase } from './supabase';

/**
 * Génère une Mind Map en appelant la Supabase Edge Function sécurisée.
 * La clé API Gemini n'est plus exposée côté client.
 */
export async function generateMindMap(
  title: string,
  context: string,
  text: string
): Promise<MindMapNode> {
  try {
    console.log('🚀 Appel de la Edge Function generate-mindmap...');

    // Appel à la fonction distante via le SDK Supabase
    const { data, error } = await supabase.functions.invoke('generate-mindmap', {
      body: { 
        title, 
        context, 
        text 
      },
    });

    // Gestion des erreurs techniques (réseau, serveur 500, etc.)
    if (error) {
      console.error('❌ Erreur Supabase Function:', error);
      throw new Error(error.message || 'Erreur lors de la communication avec le serveur');
    }

    // Vérification que des données sont bien revenues
    if (!data) {
        throw new Error('Aucune donnée reçue du serveur');
    }
    
    // Gestion des erreurs métier renvoyées par notre fonction (ex: texte trop court, erreur Gemini)
    if (data.error) {
        throw new Error(`Erreur de génération: ${data.error}`);
    }

    // --- Post-traitement ---
    // On s'assure que chaque nœud a un ID unique (sécurité pour l'affichage React)
    const addIds = (node: any, parentId: string = 'root', index: number = 0): MindMapNode => {
      const nodeId = node.id || `${parentId}-${index}`;
      return {
        id: nodeId,
        text: node.text,
        description: node.description, 
        children: node.children?.map((child: any, i: number) => addIds(child, nodeId, i)),
      };
    };

    // On traite le JSON reçu de la fonction
    const mindMapWithIds = addIds(data);
    
    return mindMapWithIds;

  } catch (error) {
    console.error('❌ Erreur finale generateMindMap:', error);
    throw error; // L'erreur remontera à l'interface pour afficher une alerte à l'utilisateur
  }
}