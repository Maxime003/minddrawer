import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ REMPLACE CECI PAR TA VRAIE CLÉ POUR LE TEST :
const API_KEY = "AIzaSyAWDgV6d8rSkfpgSLeeIt7EYKvGArT4uG8"; 

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateMindMap = async (title: string, context: string, text: string) => {
  console.log("🚀 [AI DEBUG] Démarrage de la génération pour :", title);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Tu es un expert en pédagogie. Crée une Mind Map structurée pour apprendre ce concept.
      
      Titre: ${title}
      Contexte: ${context}
      Notes brutes: ${text}

      Format JSON attendu strictement (Respecte cette structure) :
      {
        "id": "root",
        "text": "${title}",
        "children": [
          { "id": "1", "text": "Sous-concept", "children": [] }
        ]
      }

      IMPORTANT : Réponds UNIQUEMENT avec le JSON brut. 
      NE METS PAS de balises markdown comme \`\`\`json ou \`\`\`.
      Si tu mets du texte avant ou après, le système plantera.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text();

    console.log("📝 [AI DEBUG] Réponse brute reçue de Gemini :", rawText.substring(0, 100) + "...");

    // --- NETTOYAGE DU CODE MARKDOWN (C'est souvent ça qui plante) ---
    // Enlève les ```json au début et ``` à la fin
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Parse le JSON
    const jsonResult = JSON.parse(rawText);
    
    console.log("✅ [AI DEBUG] JSON parsé avec succès !");
    return jsonResult;

  } catch (error) {
    console.error("❌ [AI DEBUG] ERREUR CRITIQUE :", error);
    
    // En cas d'erreur, on renvoie une map de secours pour ne pas crasher l'app
    return {
      id: "error-root",
      text: "Erreur IA - Voir Terminal",
      children: [
        { id: "e1", text: "Vérifie ta clé API" },
        { id: "e2", text: "Vérifie ta connexion" },
        { id: "e3", text: "Regarde les logs" }
      ]
    };
  }
};