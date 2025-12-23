import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Récupération des variables d'environnement
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Vérification de la présence des clés
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Variables d\'environnement Supabase manquantes. ' +
    'Assurez-vous que EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY sont définies dans votre fichier .env'
  );
}

// Création et exportation du client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important pour React Native (pas d'URLs)
  },
});
