import { MindMapNode } from '../types/subject';

// Initialisation de l'API avec log de debug pour la clé
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
console.log('🔑 [DEBUG] Clé API chargée :', apiKey ? `${apiKey.substring(0, 5)}...` : 'NON (Vide)');

/**
 * Auto-découverte du modèle Gemini disponible pour ce compte
 * @returns Le nom du modèle disponible (ex: "gemini-1.5-flash" ou "gemini-pro")
 */
async function getAvailableModel(): Promise<string> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log('🔍 [DEBUG] Recherche des modèles disponibles...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] Erreur lors de la récupération des modèles:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const models = data.models || [];

    console.log(`📋 [DEBUG] ${models.length} modèles trouvés`);

    // Modèles favoris à chercher en priorité
    const favoriteModels = ['gemini-1.5-flash', 'gemini-pro'];

    // 1. Chercher les modèles favoris
    for (const favorite of favoriteModels) {
      const found = models.find((model: any) => {
        const modelName = model.name?.replace('models/', '') || '';
        return modelName === favorite || modelName.includes(favorite);
      });

      if (found) {
        const modelName = found.name?.replace('models/', '') || found.name || favorite;
        console.log(`✅ [DEBUG] Modèle favori trouvé: ${modelName}`);
        return modelName;
      }
    }

    // 2. Si aucun favori trouvé, prendre le premier modèle Gemini qui supporte generateContent
    for (const model of models) {
      const modelName = model.name?.replace('models/', '') || model.name || '';
      
      // Vérifier que c'est un modèle Gemini et qu'il supporte generateContent
      if (
        modelName.startsWith('gemini') &&
        (model.supportedGenerationMethods?.includes('generateContent') ||
          !model.supportedGenerationMethods) // Si pas de restriction, on assume que c'est OK
      ) {
        console.log(`✅ [DEBUG] Modèle Gemini trouvé: ${modelName}`);
        return modelName;
      }
    }

    // 3. Fallback : prendre le premier modèle Gemini trouvé
    const firstGemini = models.find((model: any) => {
      const modelName = model.name?.replace('models/', '') || model.name || '';
      return modelName.startsWith('gemini');
    });

    if (firstGemini) {
      const modelName = firstGemini.name?.replace('models/', '') || firstGemini.name || 'gemini-pro';
      console.log(`⚠️ [DEBUG] Utilisation du premier modèle Gemini trouvé: ${modelName}`);
      return modelName;
    }

    // 4. Dernier recours : retourner un modèle par défaut
    console.warn('⚠️ [DEBUG] Aucun modèle Gemini trouvé, utilisation du fallback: gemini-pro');
    return 'gemini-pro';
  } catch (error) {
    console.error('❌ [DEBUG] Erreur lors de la découverte des modèles:', error);
    // En cas d'erreur, retourner un modèle par défaut
    console.warn('⚠️ [DEBUG] Utilisation du modèle par défaut: gemini-pro');
    return 'gemini-pro';
  }
}

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
    // Auto-découverte du modèle disponible
    const modelName = await getAvailableModel();
    console.log(`✅ [DEBUG] Modèle choisi : ${modelName}`);

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

    // Construction de l'URL REST API avec le modèle découvert
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

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

    console.log('🌐 [DEBUG] Envoi de la requête HTTP à Gemini...');

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
      console.error('❌ [DEBUG] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    // Parsing de la réponse JSON
    const data = await response.json();

    // Extraction du texte généré
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      (() => {
        throw new Error('Format de réponse inattendu de Gemini API');
      })();

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