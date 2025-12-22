console.log("Ma clé API est :", process.env.EXPO_PUBLIC_GEMINI_API_KEY ? "Chargée ✅" : "Absente ❌");
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MindMapNode } from '../types/subject';

// Initialisation de l'API Gemini
const genAI = new GoogleGenerativeAI(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
);

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
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

SCHEMA JSON ATTENDU (MindMapNode):
{
  "id": string,        // Identifiant unique du nœud
  "text": string,      // Texte du nœud (max 50 caractères)
  "children": [        // Optionnel : tableau de nœuds enfants
    {
      "id": string,
      "text": string,
      "children": [...] // Peut être imbriqué
    }
  ]
}

EXEMPLE DE STRUCTURE:
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
    let responseText = response.text().trim();

    // Nettoyage de la réponse : retire les markdown code blocks si présents
    responseText = responseText.replace(/^```json\s*/i, '');
    responseText = responseText.replace(/^```\s*/i, '');
    responseText = responseText.replace(/\s*```$/i, '');
    responseText = responseText.trim();

    // Parse du JSON
    const mindMapData = JSON.parse(responseText) as MindMapNode;

    // Validation et génération des IDs si manquants
    const addIds = (node: MindMapNode, parentId: string = 'root', index: number = 0): MindMapNode => {
      const nodeId = node.id || `${parentId}-${index}`;
      return {
        id: nodeId,
        text: node.text,
        children: node.children?.map((child, i) => addIds(child, nodeId, i)),
      };
    };

    const mindMapWithIds = addIds(mindMapData);

    return mindMapWithIds;
  } catch (error) {
    console.error('Erreur lors de la génération de la Mind Map:', error);
    throw new Error(
      `Échec de la génération de la Mind Map: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
}
