// supabase/functions/generate-mindmap/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MODEL_NAME = 'gemini-1.5-flash';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, context, text } = await req.json()

    if (!title || !text) {
      throw new Error('Le titre et le texte sont requis.')
    }

    const apiKey = Deno.env.get('AIzaSyCSZlRt1aqFg4f3lPt-eiFAeH5ffJpCXes')
    if (!apiKey) {
      throw new Error('Clé API Gemini non configurée sur le serveur.')
    }

    // --- LE PROMPT AMÉLIORÉ (AVEC DESCRIPTIONS) ---
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
- PAS de markdown (pas de json)
- PAS de json avec des backticks
- PAS d'explications
- UNIQUEMENT le JSON valide, rien d'autre.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Erreur Gemini ${geminiResponse.status}: ${errorText}`);
    }

    const data = await geminiResponse.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error('Format de réponse inattendu de Gemini API');

    const jsonStart = rawText.indexOf('{');
    const jsonEnd = rawText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
      throw new Error('Aucun JSON valide trouvé dans la réponse');
    }

    const jsonString = rawText.substring(jsonStart, jsonEnd + 1);
    const mindMapData = JSON.parse(jsonString);

    return new Response(JSON.stringify(mindMapData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})