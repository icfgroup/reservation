/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { store, useStore } from "../store";
import {
  CalendarClock,
  User as UserIcon,
  LogOut,
  Mail,
  HelpCircle,
  RefreshCw,
  Menu,
  X
} from "lucide-react";
import logoRdv from "../../logo_rdv.png";

interface NavbarProps {
  onNavigate: (view: "landing" | "client" | "admin" | "auth" | "doc" | "terms") => void;
  activeView: string;
  onToggleEmailCenter: () => void;
  unreadEmailsCount: number;
  isTransparent?: boolean;
}

export default function Navbar({
  onNavigate,
  activeView,
  onToggleEmailCenter,
  unreadEmailsCount,
  isTransparent = false
}: NavbarProps) {
  const { currentUser } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Detect scroll for transparent → solid transition on landing
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    store.simulateLogout();
    onNavigate("landing");
    setMobileMenuOpen(false);
  };

  const handleResetDemo = () => {
    setShowConfirmReset(true);
  };

  const handleNav = (view: "landing" | "client" | "admin" | "auth" | "doc" | "terms") => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  // Dynamic navbar classes based on transparent mode + scroll state
  const showTransparent = isTransparent && !scrolled;
  const navClasses = showTransparent
    ? "sticky top-0 z-40 w-full transition-all duration-300 bg-transparent border-b border-transparent"
    : "sticky top-0 z-40 w-full transition-all duration-300 border-b border-gray-200 bg-white/90 backdrop-blur-xl shadow-sm";

  const textClass = showTransparent ? "text-white" : "text-gray-900";
  const subtextClass = showTransparent ? "text-white/60" : "text-gray-500";
  const btnHover = showTransparent
    ? "text-white/70 hover:text-white hover:bg-white/10"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
  const btnActive = showTransparent
    ? "bg-white/15 text-white"
    : "bg-gray-100 text-gray-900";

  return (
    <header className={navClasses}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Navigation brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (currentUser) {
                handleNav(currentUser.role === "admin" ? "admin" : "client");
              } else {
                handleNav("landing");
              }
            }}
            className="flex items-center gap-2 text-left group transition-all duration-200"
            id="nav-logo-btn"
          >
            {/* Logo Image */}
            <div className="flex items-center gap-2">
              <img src={logoRdv} alt="PrendreUnRDV Logo" className="h-10 w-auto" />
              <div>
                <span className={`block text-sm font-semibold tracking-tight sm:text-base ${textClass}`}>PrendreUnRDV</span>
                <span className={`block text-[10px] font-mono tracking-wider uppercase ${subtextClass}`}>Espace Réservation</span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {!currentUser && activeView !== "landing" && (
              <button
                onClick={() => handleNav("landing")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === "landing" ? btnActive : btnHover
                }`}
              >
                Accueil
              </button>
            )}

            {currentUser && currentUser.role === "client" && (
              <button
                onClick={() => handleNav("client")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === "client" ? btnActive : btnHover
                }`}
                id="nav-client-portal-btn"
              >
                Mon Espace Client
              </button>
            )}

            {currentUser && currentUser.role === "admin" && (
              <button
                onClick={() => handleNav("admin")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === "admin" ? btnActive : btnHover
                }`}
                id="nav-admin-portal-btn"
              >
                Portail Administrateur
              </button>
            )}

            <button
              onClick={() => handleNav("doc")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeView === "doc" ? btnActive : btnHover
              }`}
              id="nav-doc-btn"
            >
              <HelpCircle className="h-4 w-4" />
              Documentation
            </button>
          </nav>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Email center */}
          <button
            onClick={onToggleEmailCenter}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-95 ${
              showTransparent
                ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            title="Boîte de réception simulée"
            id="nav-email-center-btn"
          >
            <Mail className="h-5 w-5" />
            {unreadEmailsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 font-mono text-[10px] font-bold text-white ring-2 ring-white">
                {unreadEmailsCount}
              </span>
            )}
          </button>

          {/* Reset Demo */}
          <button
            onClick={handleResetDemo}
            className={`hidden sm:flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all ${
              showTransparent
                ? "border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
            title="Réinitialiser toutes les données"
            id="nav-reset-demo-btn"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Démo
          </button>

          {currentUser ? (
            <div className={`flex items-center gap-2 pl-2 border-l ${showTransparent ? "border-white/15" : "border-gray-200"}`}>
              <div className="hidden lg:block text-right">
                <span className={`block text-xs font-semibold ${textClass}`}>
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className={`block text-[10px] font-mono tracking-wider uppercase ${subtextClass}`}>
                  {currentUser.role === "admin" ? "Administrateur" : "Particulier"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav(currentUser.role === "admin" ? "admin" : "client")}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    showTransparent
                      ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Mon Profil"
                  id="nav-user-profile-shortcut-btn"
                >
                  <UserIcon className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-transparent transition-colors ${
                    showTransparent
                      ? "text-white/50 hover:bg-red-500/20 hover:text-red-300"
                      : "text-gray-500 hover:bg-red-50 hover:text-red-600"
                  }`}
                  title="Se déconnecter"
                  id="nav-logout-btn"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNav("auth")}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs transition-all ${
                showTransparent
                  ? "bg-white text-gray-900 hover:bg-gray-100"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
              id="nav-login-btn"
            >
              Se Connecter
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`flex md:hidden h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              showTransparent
                ? "border-white/15 text-white/70 hover:bg-white/10"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t animate-slide-down ${
          showTransparent ? "border-white/10 bg-gray-950/95 backdrop-blur-xl" : "border-gray-100 bg-white"
        }`}>
          <div className="flex flex-col p-3 gap-1 text-sm font-medium">
            {!currentUser && (
              <button
                onClick={() => handleNav("landing")}
                className={`px-4 py-2.5 rounded-lg text-left ${activeView === "landing" ? btnActive : btnHover}`}
              >
                🏠 Accueil
              </button>
            )}
            {currentUser && currentUser.role === "client" && (
              <button
                onClick={() => handleNav("client")}
                className={`px-4 py-2.5 rounded-lg text-left ${activeView === "client" ? btnActive : btnHover}`}
              >
                📋 Mon Espace
              </button>
            )}
            {currentUser && currentUser.role === "admin" && (
              <button
                onClick={() => handleNav("admin")}
                className={`px-4 py-2.5 rounded-lg text-left ${activeView === "admin" ? btnActive : btnHover}`}
              >
                ⚙️ Administration
              </button>
            )}
            <button
              onClick={() => handleNav("doc")}
              className={`px-4 py-2.5 rounded-lg text-left ${activeView === "doc" ? btnActive : btnHover}`}
            >
              📖 Documentation
            </button>
            <button
              onClick={handleResetDemo}
              className={`px-4 py-2.5 rounded-lg text-left ${showTransparent ? "text-white/40" : "text-gray-400"}`}
            >
              🔄 Reset Démo
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-2">Réinitialiser la démo ?</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Voulez-vous vraiment réinitialiser toutes les données de la démo ? Vos modifications seront écrasées par les valeurs d'origine.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  store.resetAllDataToDefault();
                  setShowSuccessAlert(true);
                  setTimeout(() => {
                    setShowSuccessAlert(false);
                    onNavigate("landing");
                  }, 2000);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Success Toast */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-xs font-semibold text-green-700 shadow-lg animate-slide-up">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white font-bold">✓</span>
          <span>Données réinitialisées avec succès ! Vous avez été déconnecté.</span>
        </div>
      )}
    </header>
  );
}
