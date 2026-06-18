/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { store, useStore } from "./store";
import Navbar from "./components/Navbar";
import AuthScreen from "./components/AuthScreen";
import ClientDashboard from "./components/ClientDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TechnicalDoc from "./components/TechnicalDoc";
import NotificationsLog from "./components/NotificationsLog";
import LandingPage from "./components/LandingPage";
import TermsPage from "./components/TermsPage";
import { isAppwriteConfigured } from "./lib/appwrite";

type ViewType = "landing" | "auth" | "client" | "admin" | "doc" | "terms";

export default function App() {
  const { currentUser, emails } = useStore();

  const [activeView, setActiveView] = useState<ViewType>("landing");
  const [showEmailCenter, setShowEmailCenter] = useState(false);
  const [lastViewedEmailCount, setLastViewedEmailCount] = useState(0);

  // Set initial screen based on current user login state
  useEffect(() => {
    if (currentUser) {
      setActiveView(currentUser.role === "admin" ? "admin" : "client");
    }
  }, [currentUser]);

  // Track email read status
  useEffect(() => {
    if (showEmailCenter) {
      setLastViewedEmailCount(emails.length);
    }
  }, [showEmailCenter, emails.length]);

  const unreadCount = Math.max(0, emails.length - lastViewedEmailCount);

  const handleAuthSuccess = (role: "client" | "admin") => {
    setActiveView(role === "admin" ? "admin" : "client");
  };

  const handleNavigate = (view: ViewType) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLanding = activeView === "landing";
  const isTerms = activeView === "terms";

  // Render active view content
  const renderViewContent = () => {
    switch (activeView) {
      case "landing":
        return <LandingPage onNavigateAuth={() => handleNavigate("auth")} />;
      case "auth":
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case "client":
        return <ClientDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "doc":
        return <TechnicalDoc />;
      case "terms":
        return (
          <TermsPage
            onBack={() => handleNavigate(currentUser ? (currentUser.role === "admin" ? "admin" : "client") : "landing")}
          />
        );
      default:
        return <LandingPage onNavigateAuth={() => handleNavigate("auth")} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20 text-gray-900 flex flex-col font-sans">
      {/* Decorative background grid */}
      {!isLanding && (
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      )}

      {/* Top Navbar */}
      <Navbar
        onNavigate={handleNavigate}
        activeView={activeView}
        onToggleEmailCenter={() => setShowEmailCenter(!showEmailCenter)}
        unreadEmailsCount={unreadCount}
        isTransparent={isLanding}
      />

      {/* Main content */}
      <main className={`flex-1 w-full ${isLanding || isTerms ? "" : "max-w-7xl mx-auto px-1 sm:px-2 md:px-0"}`}>
        {renderViewContent()}
      </main>

      {/* Slide-over email center */}
      {showEmailCenter && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-950/20 backdrop-blur-xs cursor-pointer"
            onClick={() => setShowEmailCenter(false)}
          />
          <NotificationsLog onClose={() => setShowEmailCenter(false)} />
        </>
      )}

      {/* Floating demo indicator */}
      <div className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-gray-500 shadow-xl border border-gray-150 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
        <span>Mode Démo Actif</span>
        <button
          onClick={() => setShowEmailCenter(!showEmailCenter)}
          className="ml-1 text-indigo-600 font-bold hover:underline"
        >
          Inspecteur SMTP ({emails.length})
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white py-6 mt-12 text-center text-xs text-gray-400 font-mono">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>© 2026 PrendreUnRDV • Plateforme Certifiée RGPD.</span>
            <button
              onClick={() => handleNavigate("terms")}
              className="text-indigo-500 hover:text-indigo-700 hover:underline font-semibold font-sans"
            >
              CGU & Mentions Légales
            </button>
          </div>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isAppwriteConfigured() ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            {isAppwriteConfigured() ? (
              <span className="text-emerald-600 font-semibold font-mono">
                Connecté en direct à Appwrite
              </span>
            ) : (
              <span>Synchronisé localement (Hors connexion Appwrite)</span>
            )}
            <span className="text-gray-300">•</span>
            <span>SPA Netlify</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
