/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Database, HelpCircle, Key, Server, Settings, Terminal, Check } from "lucide-react";

export default function TechnicalDoc() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const appwriteCodeSnippet = `// 📂 src/lib/appwrite.ts
import { Client, Account, Databases, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'my-rdv-project');

export const account = new Account(client);
export const databases = new Databases(client);

// 🗄️ IDs des collections Appwrite requises :
export const DATABASE_ID = 'rdv_db';
export const USERS_COLLECTION_ID = 'users_collection';
export const APPOINTMENTS_COLLECTION_ID = 'appointments_collection';
export const CONFIG_COLLECTION_ID = 'config_collection';
export const AUDIT_LOGS_COLLECTION_ID = 'audit_logs_collection';
`;

  const envFileExample = `# Netlify Environment Variables Configuration
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
VITE_APPWRITE_PROJECT_ID="votre_project_id_ici"
VITE_APPWRITE_DB_ID="rdv_db"
VITE_APPWRITE_COLLECTION_USERS="users_collection"
VITE_APPWRITE_COLLECTION_APPOINTMENTS="appointments_collection"
`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Welcome header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold font-sans tracking-tight text-gray-900 md:text-2xl">
          Documentation Technique de Connexion
        </h2>
        <p className="text-xs text-gray-500 font-medium">
          Guide d'intégration Appwrite, déploiement Netlify et guide utilisateur
        </p>
      </div>

      {/* Grid detailing deployment and Appwrite parameters template for copy paste */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Modélisation Appwrite</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Ce projet utilise une architecture reactive d'abstraction de données. Les écritures locales dans le store simulent à 100% les événements d'API de documents Appwrite.
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Server className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-950">Prêt pour Netlify</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            L'architecture de l'application Single Page Application (SPA) bâtie sous Vite est pleinement optimisée pour être déployée en un clic sur Netlify via git sync.
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-gray-150 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Key className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-950">Système SMTP Virtuel</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            Inclus : un centre de traçabilité SMTP qui affiche en temps réel les e-mails automatiques déclenchés pour valider vos tests de réception.
          </p>
        </div>
      </div>

      {/* Code sections for Netlify and Appwrite adapter settings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appwrite Adapter Code Template */}
        <div className="rounded-2xl border border-gray-150 bg-white shadow-xs overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-150 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4.5 w-4.5 text-gray-400" />
              <span className="text-xs font-bold font-mono text-gray-800">appwrite.ts (Configuration)</span>
            </div>
            <button
              onClick={() => handleCopy(appwriteCodeSnippet, "adapter")}
              className="rounded-lg bg-white border border-gray-200 py-1 px-2.5 text-[10px] font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-1"
            >
              {copiedSection === "adapter" ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  Copié !
                </>
              ) : (
                "Copier"
              )}
            </button>
          </div>
          <div className="p-4 bg-gray-950 text-white overflow-x-auto">
            <pre className="text-[10px] sm:text-xs font-mono leading-relaxed font-normal whitespace-pre">
              {appwriteCodeSnippet}
            </pre>
          </div>
        </div>

        {/* Environment variables settings for deployment */}
        <div className="rounded-2xl border border-gray-150 bg-white shadow-xs overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-150 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-gray-400" />
              <span className="text-xs font-bold font-mono text-gray-800">Variables d'environnement (Netlify)</span>
            </div>
            <button
              onClick={() => handleCopy(envFileExample, "env")}
              className="rounded-lg bg-white border border-gray-200 py-1 px-2.5 text-[10px] font-bold text-gray-600 hover:bg-gray-100 flex items-center gap-1"
            >
              {copiedSection === "env" ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  Copié !
                </>
              ) : (
                "Copier"
              )}
            </button>
          </div>
          <div className="p-4 bg-gray-950 text-white overflow-x-auto">
            <pre className="text-[10px] sm:text-xs font-mono leading-relaxed font-normal whitespace-pre">
              {envFileExample}
            </pre>
          </div>

          <div className="p-5 border-t border-gray-150 space-y-3.5 bg-gray-50/40 text-xs text-gray-600 font-medium">
            <h4 className="font-bold text-gray-800 flex items-center gap-1">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              Étapes de déploiement en 3 clics :
            </h4>
            <ol className="list-decimal pl-4.5 space-y-1.5 leading-relaxed">
              <li>
                Inscrivez-vous sur <span className="font-semibold text-gray-900">Appwrite Cloud</span> et créez un projet nommé <code className="bg-gray-150 px-1 py-0.5 rounded font-mono text-[10px]">PrendreUnRDV</code>.
              </li>
              <li>
                Créez une base de données avec les deux collections principales : <code className="bg-gray-150 px-1 py-0.5 rounded font-mono text-[10px]">users_collection</code> et <code className="bg-gray-150 px-1 py-0.5 rounded font-mono text-[10px]">appointments_collection</code>.
              </li>
              <li>
                Déployez le code source épuré sur <span className="font-semibold text-gray-900">Netlify</span>. Dans les paramètres "Environment variables", renseignez les clés copiées ci-dessus. Tout le système est prêt !
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Manual support and functional checks guide */}
      <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
          Manuel d'Utilisation Applicative
        </h3>

        <div className="grid gap-6 md:grid-cols-2 text-xs text-gray-650 leading-relaxed font-medium">
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider font-mono">
              👤 Guide Utilisateur (Client)
            </h4>
            <ul className="list-disc pl-4.5 space-y-1.5">
              <li>
                <strong>Création de compte :</strong> S'inscrire à l'accueil. Vous recevez un e-mail automatique simulé de bienvenue visible dans l'historique SMTP.
              </li>
              <li>
                <strong>Réservation :</strong> Cliquer sur "Prendre RDV", sélectionner une date disponible (15 jours glissants) puis un créneau vert. Renseignez vos notes optionnelles de consultation.
              </li>
              <li>
                <strong>Annulations et Reports :</strong> Les boutons de modification s'affichent devant vos créneaux réservés. Les conditions de délai paramétrées (ex: 24h d'avance obligatoire) sont contrôlées automatiquement.
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider font-mono">
              🔑 Guide Administrateur (Marie Lemoine)
            </h4>
            <ul className="list-disc pl-4.5 space-y-1.5">
              <li>
                <strong>Aperçu d'activité :</strong> Les graphiques analytiques compilent vos indicateurs de fréquentation, d'annulation de créneau et les taux d'assiduité mensuelle.
              </li>
              <li>
                <strong>Gestion des horaires :</strong> Paramétrez l'heure d'ouverture et de fermeture, la durée d'une consultation (ex: 45m, 60m) et ajustez le délai légal d'annulation tardive.
              </li>
              <li>
                <strong>Modèles d'emails :</strong> Modifiez librement l'Expéditeur d'envoi, l'URL de votre logo d'entreprise et rédigez vos propres structures de relance ou de report en utilisant les balises de fusion.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
