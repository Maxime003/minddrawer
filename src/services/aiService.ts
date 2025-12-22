import { GoogleGenerativeAI } from '@google/generative-ai';
import { MindMapNode } from '../types/subject';

// Initialisation de l'API avec log de debug pour la clé
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
console.log('🔑 [DEBUG] Clé API chargée :', apiKey ? `${apiKey.substring(0, 5)}...` : 'NON (Vide)');

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Génère une Mind Map à partir d'un titre, contexte et texte
 * @param title Le titre du sujet
 * @param context Le contexte du sujet (course, book, article, idea)
 * @param text Le texte brut à analyser
 * @returns Une Mind Map structurée
 */
export async function generateMindMap(
  title: string,
  context: string,
  text: string
): Promise<MindMapNode> {
  console.log('🚀 [DEBUG] Envoi de la requête à Gemini...');
  console.log('📋 [DEBUG] Paramètres - Titre:', title.substring(0, 30), '| Contexte:', context);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

    const prompt = `Tu es un expert pédagogique en création de Mind Maps pour l'apprentissage.

Analyse le texte suivant et crée une Mind Map structurée en JSON.

TITRE: ${title}
CONTEXTE: ${context}
TEXTE:
${text}

INSTRUCTIONS STRICTES:
1. Crée une Mind Map hiérarchique avec le titre "${title}" comme nœud central (id: "root", text: "${title}")
2. Identifie 3 à 5 concepts principaux comme enfants du nœud central
3. Pour chaque concept principal, ajoute 1 à 3 sous-concepts si pertinent
4. Chaque nœud doit avoir un "text" court et clair (max 50 caractères)
5. La structure doit être logique et pédagogique

FORMAT JSON REQUIS:
{
  "id": "root",
  "text": "${title}",
  "children": [
    {
      "id": "1",
      "text": "Concept 1",
      "children": [
        {
          "id": "1-1",
          "text": "Sous-concept 1.1"
        }
      ]
    },
    {
      "id": "2",
      "text": "Concept 2"
    }
  ]
}

RÈGLE ABSOLUE: Réponds UNIQUEMENT avec le JSON brut. 
- PAS de texte avant le JSON
- PAS de texte après le JSON
- PAS de markdown (pas de \`\`\`json)
- PAS de \`\`\`json ou \`\`\`
- PAS d'explications
- UNIQUEMENT le JSON valide, rien d'autre.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    console.log('📝 [DEBUG] Réponse brute Gemini (premiers 200 caractères):', rawText.substring(0, 200));
    console.log('📏 [DEBUG] Longueur totale de la réponse:', rawText.length);

    // --- PARSING JSON ROBUSTE ---
    // Extraction du bloc JSON en cherchant la première '{' et la dernière '}'
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      console.error('❌ [DEBUG] JSON invalide - jsonStart:', jsonStart, 'jsonEnd:', jsonEnd);
      throw new Error('Aucun JSON valide trouvé dans la réponse de Gemini');
    }

    const jsonString = rawText.substring(jsonStart, jsonEnd + 1);
    console.log('✅ [DEBUG] JSON extrait (premiers 150 caractères):', jsonString.substring(0, 150));

    // Parse du JSON
    let mindMapData: MindMapNode;
    try {
      mindMapData = JSON.parse(jsonString) as MindMapNode;
      console.log('✅ [DEBUG] JSON parsé avec succès');
    } catch (parseError) {
      console.error('❌ [DEBUG] Erreur de parsing JSON:', parseError);
      throw new Error(`Erreur de parsing JSON: ${parseError instanceof Error ? parseError.message : 'Erreur inconnue'}`);
    }

    // Validation et génération des IDs si manquants (fonction récursive)
    const addIds = (node: MindMapNode, parentId: string = 'root', index: number = 0): MindMapNode => {
      const nodeId = node.id || `${parentId}-${index}`;
      return {
        id: nodeId,
        text: node.text,
        children: node.children?.map((child, i) => addIds(child, nodeId, i)),
      };
    };

    const mindMapWithIds = addIds(mindMapData);
    console.log('✅ [DEBUG] Mind Map générée avec succès');
    return mindMapWithIds;

  } catch (error) {
    console.error('❌ [DEBUG] ERREUR EXACTE dans generateMindMap:', error);
    if (error instanceof Error) {
      console.error('❌ [DEBUG] Message d\'erreur:', error.message);
      console.error('❌ [DEBUG] Stack trace:', error.stack);
    }
    throw error; // On relance l'erreur pour que le store bascule sur le mock
  }
}