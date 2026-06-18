/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { store, useStore } from "../store";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  AlertCircle,
  FileText
} from "lucide-react";

interface BookingWizardProps {
  onSuccess: () => void;
  adminModeClientId?: string; // If admin is creating the booking manually
}

export default function BookingWizard({ onSuccess, adminModeClientId }: BookingWizardProps) {
  const { config, appointments } = useStore();

  const [wizardStep, setWizardStep] = useState(1); // 1: Select Date, 2: Select Time, 3: Confirm
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Create rolling 15 days list beginning today (including weekends) for client selecting
  const getRollingDaysList = () => {
    const list = [];
    const today = new Date();
    
    for (let i = 0; i < 15; i++) {
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + i);

      const yyyy = candidate.getFullYear();
      const mm = String(candidate.getMonth() + 1).padStart(2, "0");
      const dd = String(candidate.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Calculate localized day formats
      const dayName = candidate.toLocaleDateString("fr-FR", { weekday: "short" }); // lun, mar
      const dayNum = candidate.getDate();
      const monthName = candidate.toLocaleDateString("fr-FR", { month: "short" });

      // Determine day attributes
      const dayOfWeek = candidate.getDay(); // 0: Sun, 1: Mon
      const isWorkingDay = config.workingDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek);
      const isHoliday = config.holidays.some((h) => h.date === dateStr);
      const isBlocked = config.blockedDates.includes(dateStr);

      const isSelectable = isWorkingDay && !isHoliday && !isBlocked;

      list.push({
        dateStr,
        dayName,
        dayNum,
        monthName,
        isSelectable,
        reason: isHoliday
          ? "Jour férié"
          : isBlocked
          ? "Date bloquée"
          : !isWorkingDay
          ? "Week-end"
          : null
      });
    }
    return list;
  };

  const rollingDays = getRollingDaysList();

  const handleSelectDateCard = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime("");
    setWizardStep(2);
    setError("");
  };

  const activeDaySlots = selectedDate ? store.getAvailableTimeSlotsForDate(selectedDate) : [];

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setWizardStep(3);
    setError("");
  };

  const handleBookingSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMsg("");

    if (!selectedDate || !selectedTime) {
      setError("Veuillez sélectionner une date ainsi qu'un créneau libre.");
      return;
    }

    const res = store.createAppointment({
      date: selectedDate,
      time: selectedTime,
      notes: notes,
      clientId: adminModeClientId // Passed if admin is filling the booking on behalf of active client
    });

    if (!res.success) {
      setError(res.message);
    } else {
      setStatusMsg("Réservation validée ! Redirection en cours...");
      setTimeout(() => {
        onSuccess();
        // Reset state
        setWizardStep(1);
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
      }, 1000);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      {/* Wizard Header Progress Indicator */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {adminModeClientId ? "Créer un rendez-vous manuel" : "Réserver un nouveau rendez-vous"}
          </h3>
          <p className="text-xs font-semibold text-gray-500">
            Processus automatisé instantané
          </p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-400">
          <span className={`h-2 w-2 rounded-full ${wizardStep >= 1 ? "bg-indigo-600" : "bg-gray-200"}`} />
          <span className={`h-2 w-2 rounded-full ${wizardStep >= 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
          <span className={`h-2 w-2 rounded-full ${wizardStep >= 3 ? "bg-indigo-600" : "bg-gray-200"}`} />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 flex items-center gap-2 border border-red-100">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {statusMsg && (
        <div className="mb-4 rounded-xl bg-green-50 p-3.5 text-xs font-semibold text-green-700 flex items-center gap-2 border border-green-100">
          <Check className="h-4 w-4 text-green-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Step 1: SELECT DATE */}
      {wizardStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-4.5 w-4.5 text-gray-400" />
            <span>Étape 1 : Choisissez une date parmi nos disponibilités</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
            {rollingDays.map((day) => {
              const isSelected = selectedDate === day.dateStr;
              return (
                <button
                  key={day.dateStr}
                  type="button"
                  disabled={!day.isSelectable}
                  onClick={() => handleSelectDateCard(day.dateStr)}
                  className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center border transition-all ${
                    !day.isSelectable
                      ? "bg-gray-50 border-gray-100 text-gray-400 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "bg-gray-900 border-gray-900 text-white shadow-xs"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-900 hover:bg-gray-50/50"
                  }`}
                  title={day.reason || "Disponible"}
                  id={`booking-day-${day.dateStr}`}
                >
                  <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase leading-none mb-1">
                    {day.dayName}
                  </span>
                  <span className="text-lg font-bold font-sans tracking-tight leading-none mb-0.5">
                    {day.dayNum}
                  </span>
                  <span className="text-[10px] font-sans text-gray-500 font-medium">
                    {day.monthName}
                  </span>

                  {/* Unavailable mini badge info */}
                  {!day.isSelectable && day.reason && (
                    <span className="mt-1 block text-[8px] font-semibold text-red-500 max-w-full truncate leading-tight">
                      {day.reason === "Jour férié" ? "🏖️ Férié" : day.reason === "Week-end" ? "Week-end" : "Indisponible"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-gray-50 p-3 border border-gray-150 flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">
              Le calendrier affiche une fenêtre glissante en temps réel de 15 jours. Les week-ends, vacances déclarées et jours spécifiquement bloqués par la direction sont désactivés automatiquement.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: SELECT TIME */}
      {wizardStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-850"
              id="booking-back-to-step1-btn"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Changer de date
            </button>
            <span className="text-xs font-semibold text-gray-500 font-mono">
              Date : {new Date(selectedDate).toLocaleDateString("fr-FR", { dateStyle: "long" })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="h-4.5 w-4.5 text-gray-400" />
            <span>Étape 2 : Sélectionnez un créneau horaire libre</span>
          </div>

          {activeDaySlots.length === 0 ? (
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-6 text-center">
              <p className="text-sm font-medium text-yellow-800">
                Aucun créneau configurable disponible pour cette date.
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                La date sélectionnée est complète, fériée ou en dehors des périodes de travail définies dans les paramètres.
              </p>
              <button
                onClick={() => setWizardStep(1)}
                className="mt-4 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-700"
              >
                Retourner aux dates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {activeDaySlots.map((slot) => {
                const isTaken = slot.state === "booked";
                return (
                  <button
                    key={slot.time}
                    disabled={isTaken}
                    onClick={() => handleSelectTime(slot.time)}
                    className={`relative rounded-xl py-3 px-4 text-center border font-mono text-sm leading-none transition-all ${
                      isTaken
                        ? "bg-gray-50 border-gray-150 text-gray-400 cursor-not-allowed opacity-60 decoration-line-through"
                        : "bg-white border-gray-200 text-gray-800 hover:border-indigo-600 hover:bg-indigo-50/20 font-bold active:scale-97"
                    }`}
                    id={`booking-slot-${slot.time}`}
                  >
                    <span>{slot.time}</span>
                    <span className={`block text-[9px] font-sans font-medium mt-1 leading-none ${
                      isTaken ? "text-red-500" : "text-green-600"
                    }`}>
                      {isTaken ? "Occupé" : "Disponible"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: COMPILE NOTES & CONFIRM */}
      {wizardStep === 3 && (
        <form onSubmit={handleBookingSubmission} className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-850"
              id="booking-back-to-step2-btn"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Changer de créneau
            </button>
            <span className="text-xs font-semibold text-gray-500 font-mono">
              Date : {new Date(selectedDate).toLocaleDateString("fr-FR")} à {selectedTime}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
            <span className="block text-xs uppercase font-mono font-bold text-gray-400">
              Récapitulatif de la réservation
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-gray-400 font-medium">Date fixée</span>
                <span className="font-semibold text-gray-800">
                  {new Date(selectedDate).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 font-medium">Horaire défini</span>
                <span className="font-semibold text-gray-800 font-mono">
                  {selectedTime} ({config.slotDuration} minutes)
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <span className="block text-gray-400 font-medium text-xs mb-1 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Notes de consultation (Optionnel)
              </span>
              <textarea
                rows={3}
                placeholder="Ex. Précisions sur votre demande, objectifs, antécédents, etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                id="booking-notes-textarea"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all"
            id="booking-wizard-confirm-btn"
          >
            <Check className="h-4.5 w-4.5" />
            Confirmer définitivement le rendez-vous
          </button>
        </form>
      )}
    </div>
  );
}
