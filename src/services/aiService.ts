import { MindMapNode } from '../types/subject';

// Initialisation de l'API
// Assurez-vous que cette clé est bien dans votre .env
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

// 🔴 CORRECTION IMPORTANTE ICI : Utilisation de la version stable 1.5
const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Génère une Mind Map à partir d'un titre, contexte et texte
 * Appel direct à l'API Google (Attention : expose la clé API dans l'app compilée)
 */
export async function generateMindMap(
  title: string,
  context: string,
  text: string
): Promise<MindMapNode> {
  try {
    // Prompt incluant la demande de description
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
4. Chaque nœud doit avoir :
   - un "text" court et clair (max 50 caractères)
   - une "description" pédagogique courte et percutante (1 ou 2 phrases max) pour expliquer le concept.
5. La structure doit être logique et pédagogique

FORMAT JSON REQUIS:
{
  "id": "root",
  "text": "${title}",
  "description": "Vue d'ensemble du sujet...",
  "children": [
    {
      "id": "1",
      "text": "Concept 1",
      "description": "Explication clé du concept 1...",
      "children": [
        {
          "id": "1-1",
          "text": "Sous-concept 1.1",
          "description": "Détail spécifique sur le sous-concept..."
        }
      ]
    },
    {
      "id": "2",
      "text": "Concept 2",
      "description": "Explication du concept 2..."
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

    // Construction de l'URL REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    // Structure du body selon la spec REST de Gemini
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    console.log('🚀 Envoi de la requête à Gemini (Direct Client)...');

    // Requête HTTP avec fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Vérification de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] Erreur HTTP Gemini:', response.status, errorText);
      throw new Error(`Erreur Gemini ${response.status}: ${errorText}`);
    }

    // Parsing de la réponse JSON
    const data = await response.json();

    // Extraction du texte généré
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      (() => {
        throw new Error('Format de réponse inattendu de Gemini API');
      })();

    // --- PARSING JSON ROBUSTE ---
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error('Aucun JSON valide trouvé dans la réponse de Gemini');
    }

    const jsonString = rawText.substring(jsonStart, jsonEnd + 1);

    // Parse du JSON
    let mindMapData: MindMapNode;
    try {
      mindMapData = JSON.parse(jsonString) as MindMapNode;
    } catch (parseError) {
      throw new Error(`Erreur de parsing JSON: ${parseError instanceof Error ? parseError.message : 'Erreur inconnue'}`);
    }

    // Validation et génération des IDs si manquants
    const addIds = (node: MindMapNode, parentId: string = 'root', index: number = 0): MindMapNode => {
      const nodeId = node.id || `${parentId}-${index}`;
      return {
        id: nodeId,
        text: node.text,
        description: node.description, 
        children: node.children?.map((child, i) => addIds(child, nodeId, i)),
      };
    };

    return addIds(mindMapData);

  } catch (error) {
    console.error('❌ Erreur lors de la génération de la Mind Map:', error);
    throw error; 
  }
}