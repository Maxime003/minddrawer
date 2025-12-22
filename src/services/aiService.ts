import { GoogleGenerativeAI } from '@google/generative-ai';
import { MindMapNode } from '../types/subject';

// On logue la clé (juste les 5 premiers caractères) pour être sûr qu'elle est chargée
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
console.log("🔑 [DEBUG] Clé API chargée :", apiKey ? `${apiKey.substring(0, 5)}...` : "NON (Vide)");

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateMindMap(
  context: string,
  text: string
): Promise<MindMapNode> {
  console.log("🚀 [DEBUG] Envoi de la requête à Gemini...");
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Tu es un expert pédagogique. Crée une structure JSON stricte pour une Mind Map.
      
      CONTEXTE: ${context}
      TEXTE: ${text}

      RÈGLE D'OR : Réponds UNIQUEMENT avec le JSON. Rien avant, rien après.
      
      FORMAT ATTENDU:
      {
        "id": "root",
        "text": "Titre du sujet",
        "children": [
          { "id": "1", "text": "Concept A", "children": [] }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    console.log("📝 [DEBUG] Réponse brute Gemini :", rawText.substring(0, 100) + "...");

    // --- NETTOYAGE ROBUSTE ---
    // On cherche la première accolade '{' et la dernière '}'
    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Aucun JSON trouvé dans la réponse");
    }

    const cleanJson = rawText.substring(jsonStart, jsonEnd + 1);
    
    // Parse
    const mindMapData = JSON.parse(cleanJson) as MindMapNode;

    // Ajout des IDs si manquants (fonction récursive)
    const addIds = (node: MindMapNode, parentId: string = 'root', index: number = 0): MindMapNode => {
      const nodeId = node.id || `${parentId}-${index}`;
      return {
        id: nodeId,
        text: node.text,
        children: node.children?.map((child, i) => addIds(child, nodeId, i)),
      };
    };

    return addIds(mindMapData);

  } catch (error) {
    console.error('❌ [DEBUG] ERREUR EXACTE :', error);
    throw error; // On relance l'erreur pour que le store bascule sur le mock
  }
}