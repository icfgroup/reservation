/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  CalendarClock,
  Clock,
  Shield,
  Bell,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Star,
  ChevronRight,
  Calendar,
  CheckCircle
} from "lucide-react";

interface LandingPageProps {
  onNavigateAuth: () => void;
}

// Animated counter component
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    const el = document.getElementById(`counter-${end}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [end, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return (
    <span id={`counter-${end}`} className="tabular-nums">
      {count.toLocaleString("fr-FR")}{suffix}
    </span>
  );
}

export default function LandingPage({ onNavigateAuth }: LandingPageProps) {
  const features = [
    {
      icon: <CalendarClock className="h-6 w-6" />,
      title: "Réservation instantanée",
      description: "Vos clients réservent en 3 clics. Calendrier interactif avec disponibilités temps réel.",
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notifications automatiques",
      description: "Confirmations, rappels et alertes d'annulation envoyés automatiquement par email.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Sécurité RGPD",
      description: "Protection des données personnelles, chiffrement et journalisation complète des actions.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Tableau de bord analytique",
      description: "Statistiques de fréquentation, taux de présence et export des données en temps réel.",
      color: "from-cyan-500 to-blue-600"
    }
  ];

  const steps = [
    { step: "01", title: "Créez votre compte", desc: "Inscription rapide en moins d'une minute." },
    { step: "02", title: "Choisissez une date", desc: "Parcourez le calendrier interactif des disponibilités." },
    { step: "03", title: "Sélectionnez un créneau", desc: "Réservez le créneau horaire qui vous convient." },
    { step: "04", title: "Confirmation immédiate", desc: "Recevez votre confirmation par email instantanément." }
  ];

  return (
    <div className="overflow-hidden">
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 animate-gradient" />

        {/* Decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="animate-slide-down mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide">
              Plateforme Certifiée RGPD • Disponible 24h/24
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up text-4xl font-black tracking-tight text-white sm:text-5xl md:text-7xl leading-[1.1]">
            Réservez vos{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              rendez-vous
            </span>
            <br />
            en quelques clics
          </h1>

          {/* Sub-headline */}
          <p className="animate-slide-up mx-auto mt-6 max-w-2xl text-base sm:text-lg font-medium text-gray-400 leading-relaxed" style={{ animationDelay: "100ms" }}>
            Simplifiez la gestion de votre agenda professionnel. Calendrier interactif,
            confirmations automatiques et tableau de bord complet pour une expérience sans friction.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "200ms" }}>
            <button
              onClick={onNavigateAuth}
              className="group relative flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-gray-900 shadow-2xl shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
              id="landing-cta-primary"
            >
              <CalendarClock className="h-5 w-5 text-indigo-600" />
              Prendre Rendez-vous Maintenant
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onNavigateAuth}
              className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/25"
              id="landing-cta-secondary"
            >
              Accéder à l'espace Admin
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Social proof */}
          <div className="animate-fade-in mt-12 flex items-center justify-center gap-6 text-sm text-gray-500" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-gray-900 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {["JD", "SB", "CP", "ML"][i]}
                  </div>
                ))}
              </div>
              <span className="text-xs font-medium text-gray-400">Utilisé par des professionnels</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1 text-xs font-semibold text-gray-400">5.0</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="h-2 w-1.5 rounded-full bg-white/40 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES SECTION
          ============================================ */}
      <section className="relative bg-white py-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-100 mb-4">
              <Zap className="h-3.5 w-3.5" />
              Fonctionnalités
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-base text-gray-500 max-w-2xl mx-auto font-medium">
              Une plateforme complète pour automatiser vos réservations et simplifier votre quotidien professionnel.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-200"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS SECTION
          ============================================ */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100 mb-4">
              <Calendar className="h-3.5 w-3.5" />
              Comment ça marche
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Réservation en 4 étapes simples
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {steps.map((item, i) => (
              <div key={i} className="relative text-center group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-indigo-200 to-transparent" />
                )}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 shadow-sm group-hover:border-indigo-300 group-hover:shadow-md transition-all">
                  <span className="text-xl font-black font-mono">{item.step}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          STATS SECTION
          ============================================ */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            {[
              { value: 2500, suffix: "+", label: "Rendez-vous gérés" },
              { value: 98, suffix: "%", label: "Taux de satisfaction" },
              { value: 500, suffix: "+", label: "Clients actifs" },
              { value: 24, suffix: "h/7j", label: "Disponibilité" }
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs font-semibold text-indigo-300/70 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION
          ============================================ */}
      <section className="bg-white py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700 border border-amber-100 mb-4">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              Témoignages
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Ce que disent nos utilisateurs
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 stagger-children">
            {[
              {
                name: "Dr. Laurent Mercier",
                role: "Médecin généraliste",
                text: "PrendreUnRDV a révolutionné la gestion de mon cabinet. Les annulations de dernière minute ont diminué de 60% grâce aux rappels automatiques."
              },
              {
                name: "Sophie Bernard",
                role: "Consultante RH",
                text: "L'interface est intuitive et mes clients adorent pouvoir réserver en autonomie. Le gain de temps administratif est considérable."
              },
              {
                name: "Thomas Petit",
                role: "Coach sportif",
                text: "Le tableau de bord analytique me permet de suivre ma fréquentation et d'optimiser mes créneaux. Outil indispensable !"
              }
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 transition-all hover:shadow-lg hover:border-gray-200">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium mb-5 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900">{testimonial.name}</span>
                    <span className="block text-xs text-gray-500 font-medium">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 p-12 sm:p-16 shadow-2xl relative overflow-hidden">
            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/15 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                Prêt à simplifier votre planning ?
              </h2>
              <p className="text-sm text-gray-400 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                Rejoignez les professionnels qui ont déjà adopté PrendreUnRDV pour automatiser leur gestion de rendez-vous.
              </p>
              <button
                onClick={onNavigateAuth}
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-gray-900 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                id="landing-cta-bottom"
              >
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Commencer Gratuitement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="mt-4 text-xs text-gray-500 font-medium">
                Aucune carte bancaire requise • Configuration en 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
