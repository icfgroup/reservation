/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { store, useStore } from "../store";
import { Mail, Clock, Trash2, Search, Send, Bell, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface NotificationsLogProps {
  onClose: () => void;
}

export default function NotificationsLog({ onClose }: NotificationsLogProps) {
  const { emails, appointments } = useStore();
  const [searchEmail, setSearchEmail] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filteredEmails = emails.filter((item) => {
    if (!searchEmail) return true;
    return item.to.toLowerCase().includes(searchEmail.toLowerCase()) ||
           item.subject.toLowerCase().includes(searchEmail.toLowerCase());
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClearLog = () => {
    setConfirmClear(true);
  };

  const executeClearLog = () => {
    localStorage.setItem("rdv_emails", JSON.stringify([]));
    // Trigger update on store
    store.resetAllDataToDefault(); // Simply lets us trigger notification of changes
    showToast("success", "Journal des e-mails vidé.");
  };

  // Simulate pushing a reminder for an active appointment in the store
  const handleSimulateReminder = () => {
    const futureAppointment = appointments.find(
      (a) => a.date >= new Date().toISOString().split("T")[0] && a.status === "Confirmé"
    );

    if (!futureAppointment) {
      showToast("error", "Aucune réservation à venir confirmée n'a été trouvée.");
      return;
    }

    store.triggerEmail("reminder", futureAppointment.clientEmail, {
      client_name: futureAppointment.clientName,
      reference: futureAppointment.id,
      date: futureAppointment.date,
      time: futureAppointment.time
    });

    store.logAudit(
      "Envoi rappel (Simulé)",
      `Rappel automatique de veille envoyé au client ${futureAppointment.clientName} pour le RDV du ${futureAppointment.date}.`
    );

    showToast("success", `Rappel simulé envoyé avec succès à ${futureAppointment.clientEmail} !`);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl ring-1 ring-black/10 transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Serveur d'E-mails (Simulé)
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Suivi en temps réel des notifications automatiques
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-900"
          id="email-center-close-btn"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Control Actions bar */}
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateReminder}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            title="Simuler l'envoi d'un rappel 24h avant l'échéance"
            id="sim-email-reminder-btn"
          >
            <Send className="h-3.5 w-3.5" />
            Déclencher un Rappel de Veille (24h)
          </button>
          
          <button
            onClick={handleClearLog}
            className="flex items-center justify-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Vider les logs"
            id="clear-emails-btn"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par destinataire ou sujet..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            id="search-emails-input"
          />
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-3">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Aucun email envoyé</h3>
            <p className="mt-1 text-xs text-gray-400 max-w-xs">
              Les notifications automatiques s'afficheront ici en temps réel lors de vos inscriptions, réservations ou reports.
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              className="group relative rounded-xl border border-gray-100 bg-white p-4.5 shadow-xs transition-all hover:border-gray-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {email.logoUrl ? (
                    <img
                      src={email.logoUrl}
                      alt="Logo"
                      className="h-8 w-8 rounded-lg object-cover bg-gray-50 border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Mail className="h-4 w-4" />
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-semibold text-gray-900 leading-tight">
                      {email.subject}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-indigo-600">
                      Destinataire : {email.to}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono text-[9px] text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(email.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              {/* Email Content Frame */}
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="whitespace-pre-line text-xs font-normal text-gray-600 leading-relaxed font-sans">
                  {email.body}
                </p>
              </div>

              <div className="mt-2.5 flex justify-between items-center text-[10px] text-gray-400">
                <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-md text-gray-600 font-mono">
                  {email.templateType}
                </span>
                <span className="font-mono text-gray-400">ID: {email.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-gray-100 p-4 bg-gray-50 text-center text-[10px] font-mono text-gray-400">
        Simulateur de transport SMTP • HTML5 Templates RFC 2822
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-20 left-6 right-6 z-50 flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold shadow-lg animate-slide-down bg-white border-gray-100">
          {toast.type === "success" ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-green-700">{toast.message}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span className="text-red-700">{toast.message}</span>
            </>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmClear && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Vider le journal ?</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Voulez-vous vraiment vider le journal des e-mails envoyés ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setConfirmClear(false);
                  executeClearLog();
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
