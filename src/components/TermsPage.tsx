/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, FileText, Lock, Eye, Trash2, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

interface TermsPageProps {
  onBack: () => void;
}

function AccordionSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-2 bg-gray-50/30 border-t border-gray-100 animate-fade-in">
          <div className="text-xs text-gray-600 leading-relaxed font-medium space-y-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TermsPage({ onBack }: TermsPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <button
          onClick={onBack}
          className="mb-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
        >
          ← Retour à l'accueil
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight md:text-2xl">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Dernière mise à jour : Juin 2026 • Conformité RGPD
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <AccordionSection
          title="Article 1 — Objet de la plateforme"
          icon={<FileText className="h-4 w-4" />}
          defaultOpen={true}
        >
          <p>
            La plateforme PrendreUnRDV est un service en ligne de prise de rendez-vous
            permettant aux utilisateurs (ci-après « les Clients ») de réserver des créneaux
            horaires auprès d'un professionnel ou d'une entreprise (ci-après « l'Administrateur »).
          </p>
          <p>
            L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes
            conditions générales d'utilisation. Tout utilisateur s'inscrivant ou utilisant le
            service reconnaît avoir pris connaissance des présentes CGU.
          </p>
        </AccordionSection>

        <AccordionSection
          title="Article 2 — Inscription et gestion de compte"
          icon={<Lock className="h-4 w-4" />}
        >
          <p>
            Pour accéder aux fonctionnalités de réservation, l'utilisateur doit créer un compte
            personnel en fournissant les informations suivantes : nom, prénom, adresse email,
            numéro de téléphone et mot de passe.
          </p>
          <p>
            <strong>Unicité du compte :</strong> Une adresse email ne peut être associée qu'à un seul
            compte utilisateur. Le compte doit être activé avant toute utilisation.
          </p>
          <p>
            L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.
            Il s'engage à notifier immédiatement toute utilisation non autorisée de son compte.
          </p>
          <p>
            L'utilisateur peut à tout moment modifier ses informations personnelles, changer son
            mot de passe ou supprimer définitivement son compte depuis son espace personnel.
          </p>
        </AccordionSection>

        <AccordionSection
          title="Article 3 — Réservation et annulation"
          icon={<FileText className="h-4 w-4" />}
        >
          <p>
            Le processus de réservation se décompose en plusieurs étapes : sélection d'une date
            disponible, choix d'un créneau horaire libre, confirmation de la réservation. Chaque
            réservation génère une référence unique.
          </p>
          <p>
            <strong>Annulation :</strong> Le client peut annuler un rendez-vous sous réserve du
            respect du délai minimal défini par l'administrateur (par défaut 24 heures avant
            l'heure du rendez-vous). Passé ce délai, l'annulation en ligne n'est plus possible.
          </p>
          <p>
            <strong>Modification :</strong> Le client peut reprogrammer un rendez-vous en
            sélectionnant une nouvelle date et un nouveau créneau. Le système vérifie
            automatiquement la disponibilité du créneau souhaité.
          </p>
        </AccordionSection>

        <AccordionSection
          title="Article 4 — Protection des données personnelles (RGPD)"
          icon={<Eye className="h-4 w-4" />}
        >
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement
            UE 2016/679), nous nous engageons à protéger vos données personnelles.
          </p>
          <p>
            <strong>Données collectées :</strong> Nom, prénom, adresse email, numéro de téléphone,
            historique des rendez-vous, logs de connexion et d'activité.
          </p>
          <p>
            <strong>Finalité du traitement :</strong> Les données sont collectées exclusivement pour
            la gestion des rendez-vous, l'envoi de notifications automatiques (confirmations,
            rappels, annulations) et le suivi administratif.
          </p>
          <p>
            <strong>Durée de conservation :</strong> Les données personnelles sont conservées pendant
            la durée d'activité du compte. En cas de suppression du compte, les données
            d'identification sont supprimées immédiatement. L'historique des rendez-vous peut être
            conservé sous forme anonymisée à des fins statistiques.
          </p>
          <p>
            <strong>Droits de l'utilisateur :</strong> Conformément aux articles 15 à 22 du RGPD,
            vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification des informations inexactes</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d'opposition au traitement</li>
            <li>Droit à la limitation du traitement</li>
          </ul>
        </AccordionSection>

        <AccordionSection
          title="Article 5 — Sécurité des données"
          icon={<Shield className="h-4 w-4" />}
        >
          <p>
            La plateforme met en œuvre les mesures techniques et organisationnelles appropriées
            pour garantir la sécurité des données personnelles :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Chiffrement des mots de passe</li>
            <li>Protection contre les accès non autorisés</li>
            <li>Journalisation complète des actions administratives (audit trail)</li>
            <li>Sauvegarde régulière des données</li>
            <li>Connexions sécurisées via HTTPS</li>
          </ul>
        </AccordionSection>

        <AccordionSection
          title="Article 6 — Notifications automatiques"
          icon={<AlertTriangle className="h-4 w-4" />}
        >
          <p>
            En utilisant la plateforme, l'utilisateur consent à recevoir des notifications
            automatiques par email concernant :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La confirmation de création de compte</li>
            <li>La confirmation de réservation de rendez-vous</li>
            <li>Les rappels avant les rendez-vous programmés</li>
            <li>Les notifications de modification ou d'annulation</li>
          </ul>
          <p>
            L'administrateur peut personnaliser le contenu et le format des emails envoyés
            depuis le tableau de bord d'administration.
          </p>
        </AccordionSection>

        <AccordionSection
          title="Article 7 — Suppression de compte"
          icon={<Trash2 className="h-4 w-4" />}
        >
          <p>
            L'utilisateur peut à tout moment demander la suppression de son compte depuis son
            espace personnel. Cette action est irréversible et entraîne :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>La suppression immédiate des données d'identification</li>
            <li>L'annulation de toutes les réservations futures</li>
            <li>La déconnexion automatique de la plateforme</li>
          </ul>
          <p>
            L'administrateur peut également désactiver temporairement un compte client
            sans le supprimer définitivement.
          </p>
        </AccordionSection>

        <AccordionSection
          title="Article 8 — Responsabilité et disponibilité"
          icon={<FileText className="h-4 w-4" />}
        >
          <p>
            La plateforme s'engage à assurer une disponibilité maximale du service (24h/24, 7j/7).
            Toutefois, des interruptions temporaires peuvent survenir pour des opérations de
            maintenance ou de mise à jour.
          </p>
          <p>
            La plateforme ne saurait être tenue responsable des dommages directs ou indirects
            résultant de l'utilisation du service, de l'impossibilité d'y accéder ou d'une
            perte de données.
          </p>
        </AccordionSection>
      </div>

      {/* Footer note */}
      <div className="mt-10 rounded-xl border border-gray-100 bg-gray-50 p-5 text-center">
        <p className="text-xs text-gray-500 font-medium">
          Pour toute question relative à ces conditions ou à vos données personnelles,
          contactez notre service à l'adresse : <span className="font-semibold text-gray-700">contact@prendrerdv.fr</span>
        </p>
        <p className="mt-2 text-[10px] text-gray-400 font-mono">
          © 2026 PrendreUnRDV — Tous droits réservés • Conformité RGPD (UE 2016/679)
        </p>
      </div>
    </div>
  );
}
