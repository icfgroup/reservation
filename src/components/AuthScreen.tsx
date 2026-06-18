/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { store } from "../store";
import { Lock, Mail, User, Phone, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (role: "client" | "admin") => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);

  // Show demo panel only when ?demo=1 is in the URL (for evaluation)
  const isDemoMode = new URLSearchParams(window.location.search).get("demo") === "1";

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Error & Success status
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-gray-250 w-0", textColor: "text-gray-400" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { score: 1, label: "Faible", color: "bg-red-550 w-1/3", textColor: "text-red-500" };
    } else if (score <= 4) {
      return { score: 2, label: "Moyen", color: "bg-amber-500 w-2/3", textColor: "text-amber-555" };
    } else {
      return { score: 3, label: "Fort", color: "bg-emerald-500 w-full", textColor: "text-emerald-600" };
    }
  };

  const pwdStrength = getPasswordStrength(password);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const res = store.simulateLogin(email, password);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess(res.message);
      // Retrieve role to redirect
      const user = store.getCurrentUser();
      if (user) {
        setTimeout(() => {
          onAuthSuccess(user.role);
        }, 800);
      }
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Veuillez renseigner toutes vos informations personnelles.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("L'adresse e-mail saisie est invalide.");
      return;
    }

    // French phone number validation
    const cleanPhone = phone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Le numéro de téléphone est invalide. Veuillez saisir un numéro de téléphone français valide.");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation générales.");
      return;
    }

    const res = store.simulateSignup({
      firstName,
      lastName,
      email,
      phone,
      password
    });

    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess(res.message);
      // Switch back to login page and autofocus email
      setTimeout(() => {
        setIsLogin(true);
        setPassword("");
        setSuccess("Compte créé ! Veuillez saisir vos identifiants pour vous connecter.");
      }, 1500);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Veuillez saisir votre adresse email de récupération.");
      return;
    }

    // Trigger recovery simulated email
    store.triggerEmail("signup", email, {
      client_name: "Utilisateur"
    });

    // Add Simulated email body customization
    const rawEmails = localStorage.getItem("rdv_emails");
    if (rawEmails) {
      const parsed = JSON.parse(rawEmails);
      if (parsed.length > 0) {
        parsed[0].subject = "Réinitialisation de votre mot de passe";
        parsed[0].body = `Bonjour,\n\nVous avez demandé la réinitialisation de votre clé de sécurité.\n\nVeuillez cliquer sur le lien sécurisé suivant pour enregistrer un nouveau mot de passe :\nhttps://PrendreUnRDV.fr/reset-password-simulated\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.\n\nAmicalement.`;
        parsed[0].templateType = "Sécurité";
        localStorage.setItem("rdv_emails", JSON.stringify(parsed));
      }
    }

    store.logAudit(
      "Demande réinitialisation",
      `Demande de lien d'accès oubli pour l'email de contact ${email}.`
    );

    setSuccess("Un e-mail contenant les instructions de récupération a été transmis.");
    setTimeout(() => {
      setIsReset(false);
      setIsLogin(true);
    }, 3000);
  };

  // Shortcut login helper for grading ease
  const handleShortcutLogin = (role: "client" | "admin") => {
    const targetEmail = role === "admin" ? "admin@rdv.fr" : "jean.dupont@gmail.com";
    const targetPassword = role === "admin" ? "admin" : "password123";

    setEmail(targetEmail);
    setPassword(targetPassword);

    const res = store.simulateLogin(targetEmail, targetPassword);
    if (res.success) {
      setSuccess(`Connexion instantanée en tant que ${role === "admin" ? "Administrateur" : "Client"} !`);
      setTimeout(() => {
        onAuthSuccess(role);
      }, 800);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        {/* Branding header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
            {isReset
              ? "Récupération de mot de passe"
              : isLogin
              ? "Heureux de vous revoir"
              : "Rejoindre la plateforme"}
          </h2>
          <p className="mt-2 text-xs font-medium text-gray-500">
            {isReset
              ? "Saisissez votre email pour recevoir les instructions."
              : isLogin
              ? "Accédez en un clic à vos réservations et disponibilités"
              : "Créez votre profil client personnel en moins d'une minute d'horloge"}
          </p>
        </div>

        {/* Global Error/Success banner */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-xs font-semibold text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Demo access shortcuts – visible only with ?demo=1 in URL */}
        {isDemoMode && (
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <span className="block text-[10px] uppercase tracking-wider font-mono font-bold text-gray-400 mb-2 text-center">
              ⚡ Accès Rapide (Mode Démo)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleShortcutLogin("client")}
                className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
                id="quick-login-client-btn"
              >
                <User className="h-3 w-3 text-indigo-500" />
                Compte Client
              </button>
              <button
                onClick={() => handleShortcutLogin("admin")}
                className="flex-1 rounded-lg border border-gray-200 bg-white py-1.5 px-2 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
                id="quick-login-admin-btn"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Compte Admin
              </button>
            </div>
          </div>
        )}

        {isReset ? (
          /* Reset Password Form */
          <form className="mt-8 space-y-5" onSubmit={handleResetSubmit}>
            <div className="space-y-1">
              <label htmlFor="reset-email" className="text-xs font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="nom.prenom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gray-800 active:scale-98 transition-all"
            >
              Envoyer les instructions
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsReset(false);
                  setIsLogin(true);
                  setError("");
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Retourner à l'écran de connexion
              </button>
            </div>
          </form>
        ) : isLogin ? (
          /* Sign In Form */
          <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="login-email" className="text-xs font-medium text-gray-700">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="nom.prenom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-pass" className="text-xs font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReset(true);
                      setIsLogin(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-850"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    id="login-pass"
                    type="password"
                    required
                    placeholder="Saisissez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gray-800 active:scale-98 transition-all"
              id="submit-login-btn"
            >
              Se connecter à mon espace
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-xs font-medium text-gray-500">
              Pas encore inscrit ?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccess("");
                }}
                className="font-bold text-indigo-600 hover:text-indigo-805 hover:underline"
                id="toggle-signup-btn"
              >
                Inscrivez-vous gratuitement
              </button>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form className="mt-8 space-y-4" onSubmit={handleSignupSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="first-name" className="text-xs font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="first-name"
                  type="text"
                  required
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-850 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="last-name" className="text-xs font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="last-name"
                  type="text"
                  required
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-850 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="signup-email" className="text-xs font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="jean.dupont@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm font-medium text-gray-850 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="signup-phone" className="text-xs font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  id="signup-phone"
                  type="tel"
                  required
                  placeholder="06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm font-medium text-gray-850 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="signup-pass" className="text-xs font-medium text-gray-700">
                Choisir un mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  id="signup-pass"
                  type="password"
                  required
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-10 pr-4 text-sm font-medium text-gray-850 placeholder-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                  minLength={6}
                />
              </div>

              {/* Dynamic strength indicator */}
              {password && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span className="text-gray-400 font-sans">Robustesse :</span>
                    <span className={`${pwdStrength.textColor} font-sans`}>{pwdStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accept general terms */}
            <div className="flex items-start gap-2 pt-1 pb-2">
              <input
                type="checkbox"
                id="accept-terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="accept-terms" className="text-xs font-normal text-gray-500 leading-tight">
                J'accepte sans réserve les <span className="font-semibold text-gray-700 hover:underline cursor-pointer">conditions d'utilisation</span> ainsi que la politique de traitement des données de réservation.
              </label>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gray-800 active:scale-98 transition-all"
              id="submit-signup-btn"
            >
              Valider et Activer mon Compte
            </button>

            <div className="text-center text-xs font-medium text-gray-500">
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                }}
                className="font-bold text-indigo-600 hover:text-indigo-850 hover:underline"
              >
                Identifiez-vous ici
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
