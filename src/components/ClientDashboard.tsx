/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { store, useStore } from "../store";
import { AppointmentStatus, Appointment } from "../types";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Lock,
  XCircle,
  CalendarClock,
  Sparkles,
  UserX,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  History,
  Info
} from "lucide-react";
import BookingWizard from "./BookingWizard";

export default function ClientDashboard() {
  const { currentUser, appointments, config } = useStore();

  // Active view states
  const [activeTab, setActiveTab] = useState<"upcoming" | "history" | "profile" | "book">("upcoming");

  // Profile fields state
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  // Password fields state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  // Common notification feedback state
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // Confirmation modal state (replaces native confirm() dialogs)
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: "", message: "", onConfirm: () => {} });

  // Appointment rescheduling process state
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-2" />
        <h3 className="text-lg font-bold text-gray-900">Session expirée</h3>
        <p className="text-sm text-gray-500">Veuillez vous reconnecter pour accéder à l'espace client.</p>
      </div>
    );
  }

  // Segment client's bookings
  const clientAppointments = appointments.filter((a) => a.clientId === currentUser.id);

  const upcomingAppointments = clientAppointments.filter(
    (a) =>
      (a.status === AppointmentStatus.CONFIRMED ||
        a.status === AppointmentStatus.PENDING ||
        a.status === AppointmentStatus.RESCHEDULED) &&
      new Date(`${a.date}T${a.time}`) >= new Date()
  );

  const pastAppointments = clientAppointments.filter(
    (a) =>
      a.status === AppointmentStatus.COMPLETED ||
      a.status === AppointmentStatus.CANCELLED ||
      (a.status !== AppointmentStatus.CANCELLED && new Date(`${a.date}T${a.time}`) < new Date())
  );

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");

    const res = store.updateUserProfile(firstName, lastName, phone, email);
    if (!res.success) {
      setFeedbackError(res.message);
    } else {
      setFeedbackSuccess(res.message);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");

    if (!currentPass || !newPass) {
      setFeedbackError("Veuillez renseigner les champs de mot de passe requis.");
      return;
    }

    const res = store.updatePassword(currentPass, newPass);
    if (!res.success) {
      setFeedbackError(res.message);
    } else {
      setFeedbackSuccess(res.message);
      setCurrentPass("");
      setNewPass("");
    }
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      show: true,
      title: "Suppression d’un compte client",
      message:
        "Vous êtes sur le point de supprimer définitivement votre compte. L’ensemble de vos réservations et données personnelles seront irrémédiablement effacées. Cette opération est conforme au RGPD et ne peut pas être annulée.",
      onConfirm: () => {
        store.deleteOwnAccount();
        setFeedbackSuccess("Votre compte a été supprimé avec succès.");
        setTimeout(() => window.location.reload(), 2000);
      }
    });
  };

  const handleCancelAppointment = (id: string) => {
    setConfirmModal({
      show: true,
      title: "Annulation d’un rendez-vous",
      message:
        "Confirmez-vous l’annulation de ce rendez-vous ? Un e-mail de notification sera automatiquement généré et envoyé à votre adresse.",
      onConfirm: () => {
        const res = store.cancelAppointment(id, "Annulé en ligne par le client.", true);
        if (!res.success) {
          setFeedbackError(res.message);
        } else {
          setFeedbackSuccess("Réservation annulée avec succès.");
        }
      }
    });
  };

  // Open inline reschedule pane
  const startRescheduling = (appt: Appointment) => {
    setReschedulingAppt(appt);
    setRescheduleDate("");
    setRescheduleTime("");
    setFeedbackError("");
    setFeedbackSuccess("");
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError("");
    if (!reschedulingAppt || !rescheduleDate || !rescheduleTime) {
      setFeedbackError("Veuillez sélectionner une date et un créneau d'horaire valides.");
      return;
    }

    const res = store.modifyAppointment(reschedulingAppt.id, {
      date: rescheduleDate,
      time: rescheduleTime
    });

    if (!res.success) {
      setFeedbackError(res.message);
    } else {
      setFeedbackSuccess("Rendez-vous reprogrammé avec succès !");
      setTimeout(() => {
        setReschedulingAppt(null);
        setFeedbackSuccess("");
      }, 1000);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal(m => ({ ...m, show: false }))}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(m => ({ ...m, show: false }));
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome header widget */}
      <div className="mb-8 rounded-2xl bg-gray-900 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md mb-2">
            <Sparkles className="h-3 w-3 text-indigo-300 animate-pulse" />
            Espace Personnel Sécurisé
          </span>
          <h1 className="text-xl font-bold font-sans tracking-tight md:text-2xl leading-tight">
            Bonjour, {currentUser.firstName} {currentUser.lastName} !
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Pilotez vos rendez-vous, modifiez vos disponibilités de contact ou passez commande à tout instant.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("book")}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-100 transition-all active:scale-97 shadow-md"
          id="client-book-now-top-btn"
        >
          <CalendarClock className="h-4 w-4 text-indigo-600" />
          Prendre Rendez-vous en Ligne
        </button>
      </div>

      {feedbackError && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {feedbackSuccess && (
        <div className="mb-6 rounded-xl border border-green-100 bg-green-50 p-4 text-xs font-semibold text-green-700 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-green-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 font-medium text-xs sm:text-sm pl-1 bg-white pt-2 rounded-t-xl">
        <button
          onClick={() => {
            setActiveTab("upcoming");
            setReschedulingAppt(null);
          }}
          className={`pb-3.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "upcoming"
              ? "border-gray-900 text-gray-950 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="client-tab-upcoming-btn"
        >
          <Calendar className="h-4 w-4" />
          Prochains RDV ({upcomingAppointments.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("history");
            setReschedulingAppt(null);
          }}
          className={`pb-3.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-gray-900 text-gray-950 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="client-tab-history-btn"
        >
          <History className="h-4 w-4" />
          Historique ({pastAppointments.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("book");
            setReschedulingAppt(null);
          }}
          className={`pb-3.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "book"
              ? "border-gray-900 text-gray-950 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="client-tab-book-btn"
        >
          <CalendarClock className="h-4 w-4" />
          Réserver un créneau
        </button>

        <button
          onClick={() => {
            setActiveTab("profile");
            setReschedulingAppt(null);
          }}
          className={`pb-3.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "profile"
              ? "border-gray-900 text-gray-950 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
          id="client-tab-profile-btn"
        >
          <User className="h-4 w-4" />
          Mon Profil & Sécurité
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="space-y-6">
        {/* TAB: UPCOMING */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-xs">
                <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <h3 className="text-sm font-semibold text-gray-900">Aucune réservation confirmée à venir</h3>
                <p className="mt-1 text-xs text-gray-400">Pour le moment, vous n'avez planifié aucun rendez-vous.</p>
                <button
                  onClick={() => setActiveTab("book")}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Choisir une date sur le calendrier
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-400">
                          #{appt.id}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            appt.status === AppointmentStatus.CONFIRMED
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : appt.status === AppointmentStatus.RESCHEDULED
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-850">
                          <Calendar className="h-4.5 w-4.5 text-gray-400" />
                          <span>
                            {new Date(appt.date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 font-mono">
                          <Clock className="h-4.5 w-4.5 text-gray-400" />
                          <span>
                            Horaire : {appt.time} ({appt.duration} minutes)
                          </span>
                        </div>
                      </div>

                      {appt.notes && (
                        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 font-medium mb-4">
                          <span className="block font-semibold text-gray-700 mb-0.5">Vos notes :</span>
                          {appt.notes}
                        </div>
                      )}
                    </div>

                    {/* Action buttons with cancellation rule enforcement checks */}
                    <div className="border-t border-gray-100 pt-3 flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => startRescheduling(appt)}
                        className="flex-1 rounded-lg bg-indigo-50 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                        id={`client-reschedule-btn-${appt.id}`}
                      >
                        Reprogrammer
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-650 hover:bg-red-100 transition-colors"
                        id={`client-cancel-btn-${appt.id}`}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* In-Line Rescheduling Panel */}
            {reschedulingAppt && (
              <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/20 p-6 shadow-sm animate-fade-in">
                <h4 className="text-sm font-bold text-gray-900 mb-2">
                  Reprogrammer le rendez-vous #{reschedulingAppt.id}
                </h4>
                <p className="text-xs text-gray-550 font-medium mb-4">
                  Actuel : {new Date(reschedulingAppt.date).toLocaleDateString("fr-FR")} à {reschedulingAppt.time}
                </p>

                <form onSubmit={handleSaveReschedule} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nouvelle date désirée
                      </label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={(e) => {
                          setRescheduleDate(e.target.value);
                          setRescheduleTime("");
                        }}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        id="reschedule-date-input"
                      />
                    </div>

                    {rescheduleDate && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Créneaux horaires disponibles
                        </label>
                        <select
                          required
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold"
                          id="reschedule-time-select"
                        >
                          <option value="">Sélectionner un horaire</option>
                          {store.getAvailableTimeSlotsForDate(rescheduleDate).map((slot) => {
                            if (slot.state === "booked") return null;
                            return (
                              <option key={slot.time} value={slot.time}>
                                {slot.time}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReschedulingAppt(null)}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      id="save-reschedule-btn"
                    >
                      Confirmer le report
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Vos rendez-vous passés et annulés</h3>
            </div>
            {pastAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-xs text-gray-400">Aucun historique de réservation disponible.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pastAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-gray-400">#{appt.id}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            appt.status === AppointmentStatus.COMPLETED
                              ? "bg-gray-50 text-gray-600 border border-gray-150"
                              : appt.status === AppointmentStatus.CANCELLED
                              ? "bg-red-50 text-red-650 border border-red-105"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-800 block">
                        Le {new Date(appt.date).toLocaleDateString("fr-FR", { dateStyle: "long" })} à {appt.time}
                      </span>
                      {appt.notes && (
                        <p className="text-xs text-gray-400 italic max-w-lg mt-1 font-medium">
                          Note : "{appt.notes}"
                        </p>
                      )}
                      {appt.cancellationReason && (
                        <p className="text-xs text-red-500 italic max-w-lg mt-1 font-medium">
                          Motif d'annulation : "{appt.cancellationReason}"
                        </p>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-400 text-right sm:block hidden">
                      Créé le {new Date(appt.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: BOOK WIZARD */}
        {activeTab === "book" && (
          <BookingWizard onSuccess={() => setActiveTab("upcoming")} />
        )}

        {/* TAB: PROFILE & ACCS */}
        {activeTab === "profile" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Update Profile coordinates forms */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <User className="h-4.5 w-4.5 text-gray-400" />
                Coordonnées personnelles
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Votre prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-850 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Votre nom de famille"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-850 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="nom.prenom@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-850 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone portable</label>
                  <input
                    type="tel"
                    required
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-850 placeholder-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 py-2 px-4 text-xs font-bold text-white hover:bg-gray-850 shadow-sm"
                  id="client-save-profile-btn"
                >
                  Enregistrer les modifications
                </button>
              </form>
            </div>

            <div className="space-y-6">
              {/* Change password forms */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Lock className="h-4.5 w-4.5 text-gray-400" />
                  Mise à jour du mot de passe
                </h3>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      required
                      placeholder="Saisissez votre mot de passe actuel"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 caractères"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold placeholder-gray-400"
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 py-2 px-4 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
                    id="client-save-password-btn"
                  >
                    Remplacer le mot de passe
                  </button>
                </form>
              </div>

              {/* Delete / Deactivate accounts */}
              <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6">
                <h3 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                  <UserX className="h-4.5 w-4.5 text-red-550" />
                  Zone d'exclusion de compte
                </h3>
                <p className="text-xs text-red-600 leading-relaxed font-semibold mb-4">
                  Si vous clôturez votre compte client, l'ensemble de vos réservations futures et données d'identifications associées seront définitivement détruites. La législation RGPD est appliquée de facto.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="rounded-lg bg-red-650 py-2 px-4 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
                  id="client-delete-account-btn"
                >
                  Supprimer mon compte définitivement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
