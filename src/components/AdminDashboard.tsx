/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { store, useStore } from "../store";
import { AppointmentStatus, Appointment, User } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend as ChartLegend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Mail,
  Sliders,
  ShieldAlert,
  CalendarClock,
  Sparkles,
  Info,
  ChevronRight,
  UserCheck,
  UserX,
  Send,
  Save,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import BookingWizard from "./BookingWizard";

export default function AdminDashboard() {
  const { appointments, users, config, templates, auditLogs } = useStore();

  // Selected subscreen tab
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "clients" | "calendar" | "emails" | "audit">("overview");

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter & Search states
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState<string>("Tous");
  const [apptDateFilter, setApptDateFilter] = useState<string>("Tous"); // Tous, Aujourd'hui, Cette semaine, Ce mois

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientHistory, setSelectedClientHistory] = useState<User | null>(null);

  // Client Edit states
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientFirstName, setEditClientFirstName] = useState("");
  const [editClientLastName, setEditClientLastName] = useState("");
  const [editClientEmail, setEditClientEmail] = useState("");
  const [editClientPhone, setEditClientPhone] = useState("");
  const [editClientError, setEditClientError] = useState("");

  // Manual appointment creation popin state
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [manualBookingClientId, setManualBookingClientId] = useState("");
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Edit Template configuration states
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateLogo, setTemplateLogo] = useState("");
  const [templateSender, setTemplateSender] = useState("");

  // Calendar customized dates
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");

  // Export process state
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState("");

  // Statistics Aggregators
  const totalApptsCount = appointments.length;
  const completedCount = appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;
  const cancelledCount = appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length;
  const pendingCount = appointments.filter((a) => a.status === AppointmentStatus.PENDING).length;
  const confirmedCount = appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length;
  const rescheduledCount = appointments.filter((a) => a.status === AppointmentStatus.RESCHEDULED).length;

  const todayStr = new Date().toISOString().split("T")[0];
  const appsToday = appointments.filter((a) => a.date === todayStr);
  const appsUpcoming = appointments.filter((a) => a.date > todayStr && a.status !== AppointmentStatus.CANCELLED);

  const totalClientsCount = users.length;
  const presenceRate =
    completedCount + cancelledCount > 0
      ? Math.round((completedCount / (completedCount + cancelledCount)) * 100)
      : 100;

  // Rich Client Statistics
  const clientsList = users.filter((u) => u.role === "client");
  const avgReservations = clientsList.length > 0 ? (appointments.length / clientsList.length).toFixed(1) : "0.0";
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "2026-06"
  const newClientsThisMonth = clientsList.filter((u) => u.createdAt && u.createdAt.startsWith(currentMonthStr)).length;

  const clientFidelityList = clientsList.map((c) => {
    const rdvCount = appointments.filter((a) => a.clientId === c.id).length;
    return {
      name: `${c.firstName} ${c.lastName}`,
      email: c.email,
      phone: c.phone,
      rdvCount
    };
  })
  .filter((c) => c.rdvCount > 0)
  .sort((a, b) => b.rdvCount - a.rdvCount)
  .slice(0, 5);

  // Recharts aggregation: Monthly trends (April, May, June 2026)
  const monthlyData = [
    {
      name: "Avril 2026",
      Réservations: appointments.filter((a) => a.date.startsWith("2026-04")).length,
      Annulations: appointments.filter((a) => a.date.startsWith("2026-04") && a.status === AppointmentStatus.CANCELLED).length
    },
    {
      name: "Mai 2026",
      Réservations: appointments.filter((a) => a.date.startsWith("2026-05")).length,
      Annulations: appointments.filter((a) => a.date.startsWith("2026-05") && a.status === AppointmentStatus.CANCELLED).length
    },
    {
      name: "Juin 2026",
      Réservations: appointments.filter((a) => a.date.startsWith("2026-06")).length,
      Annulations: appointments.filter((a) => a.date.startsWith("2026-06") && a.status === AppointmentStatus.CANCELLED).length
    }
  ];

  // Recharts Status Pie charts data
  const statusChartData = [
    { name: "Confirmés", value: confirmedCount, color: "#10B981" },
    { name: "Terminés", value: completedCount, color: "#6B7280" },
    { name: "En attente", value: pendingCount, color: "#3B82F6" },
    { name: "Annulés", value: cancelledCount, color: "#EF4444" },
    { name: "Reportés", value: rescheduledCount, color: "#F59E0B" }
  ].filter((item) => item.value > 0);

  // Filter Appointments List
  const handleDateRangeCheck = (apptDateStr: string) => {
    if (apptDateFilter === "Tous") return true;

    const apptDate = new Date(apptDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (apptDateFilter === "Aujourd'hui") {
      return apptDateStr === todayStr;
    }

    if (apptDateFilter === "Cette semaine") {
      // Simple within-7-days check
      const diffTime = Math.abs(apptDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    if (apptDateFilter === "Ce mois") {
      const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
      return apptDateStr.startsWith(currentMonthStr);
    }

    return true;
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.clientName.toLowerCase().includes(apptSearch.toLowerCase()) ||
      appt.clientEmail.toLowerCase().includes(apptSearch.toLowerCase()) ||
      appt.id.toLowerCase().includes(apptSearch.toLowerCase());

    const matchesStatus = apptStatusFilter === "Tous" || appt.status === apptStatusFilter;
    const matchesDate = handleDateRangeCheck(appt.date);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filter Clients Directory List
  const filteredClients = users.filter((client) => {
    return (
      client.firstName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.lastName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone.includes(clientSearch)
    );
  });

  // Quick Inline Status Update handlers
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    store.updateAppointmentStatus(id, status);
  };

  const startEditingClient = (client: User) => {
    setIsEditingClient(true);
    setEditClientFirstName(client.firstName);
    setEditClientLastName(client.lastName);
    setEditClientEmail(client.email);
    setEditClientPhone(client.phone);
    setEditClientError("");
  };

  const handleSaveClientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientHistory) return;

    if (!editClientFirstName || !editClientLastName || !editClientEmail || !editClientPhone) {
      setEditClientError("Veuillez renseigner tous les champs.");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editClientEmail)) {
      setEditClientError("Le format de l'adresse e-mail est invalide.");
      return;
    }

    // Validate phone number format (French phone number check)
    // Clean spaces, dots, hyphens
    const cleanPhone = editClientPhone.replace(/[\s.-]/g, "");
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setEditClientError("Le format du numéro de téléphone est invalide (doit être un numéro français valide).");
      return;
    }

    const res = store.adminUpdateUserProfile(
      selectedClientHistory.id,
      editClientFirstName,
      editClientLastName,
      editClientPhone,
      editClientEmail
    );

    if (!res.success) {
      setEditClientError(res.message);
    } else {
      setIsEditingClient(false);
      if (res.user) {
        setSelectedClientHistory(res.user);
      }
      showToast("success", "Fiche client mise à jour avec succès !");
    }
  };

  // Block date handler
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    store.blockSpecificDate(newBlockedDate);
    setNewBlockedDate("");
  };

  // Add customized holiday date handler
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName || !newHolidayDate) return;
    store.addHoliday(newHolidayName, newHolidayDate);
    setNewHolidayName("");
    setNewHolidayDate("");
  };

  // Open Template configuration details
  const startEditingTemplate = (tmpl: any) => {
    setEditingTemplateId(tmpl.id);
    setTemplateSubject(tmpl.subject);
    setTemplateBody(tmpl.body);
    setTemplateLogo(tmpl.logoUrl || "");
    setTemplateSender(tmpl.senderName);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateId) return;

    store.updateNotificationTemplate(editingTemplateId, {
      subject: templateSubject,
      body: templateBody,
      logoUrl: templateLogo,
      senderName: templateSender
    });

    setEditingTemplateId(null);
    showToast("success", "Le modèle d'email a été sauvegardé avec succès ! Tous les prochains envois utiliseront ce format.");
  };

  // Real Export to CSV download trigger
  const triggerCSVDownload = (dataList: any[], filename: string) => {
    setIsExporting(true);
    setExportType("CSV");

    setTimeout(() => {
      // Assemble rows
      const headers = ["ID", "Client", "Email", "Date", "Heure", "Status", "Notes"];
      const rows = dataList.map((a) => [
        a.id,
        a.clientName || `${a.firstName} ${a.lastName}`,
        a.clientEmail || a.email,
        a.date || a.createdAt,
        a.time || "N/A",
        a.status || (a.isActive ? "Actif" : "Désactivé"),
        (a.notes || "").replace(/,/g, " ")
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportType("");
    }, 1200);
  };

  const triggerExcelDownload = (dataList: any[], filename: string) => {
    setIsExporting(true);
    setExportType("Excel");

    setTimeout(() => {
      const headers = ["ID", "Client", "Email", "Date", "Heure", "Status", "Notes"];
      const rows = dataList.map((a) => [
        a.id,
        a.clientName || `${a.firstName} ${a.lastName}`,
        a.clientEmail || a.email,
        a.date || a.createdAt,
        a.time || "N/A",
        a.status || (a.isActive ? "Actif" : "Désactivé"),
        a.notes || ""
      ]);

      let xml = `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Reservations">
  <Table>
   <Row>`;
      
      headers.forEach(h => {
        xml += `<Cell><Data ss:Type="String">${h}</Data></Cell>`;
      });
      xml += `</Row>`;

      rows.forEach(r => {
        xml += `<Row>`;
        r.forEach(val => {
          xml += `<Cell><Data ss:Type="String">${val}</Data></Cell>`;
        });
        xml += `</Row>`;
      });

      xml += `  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportType("");
    }, 1000);
  };

  const triggerPDFDownload = (dataList: any[], filename: string) => {
    setIsExporting(true);
    setExportType("PDF");

    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        showToast("error", "Le bloqueur de pop-up empêche l'exportation. Veuillez autoriser les pop-ups.");
        setIsExporting(false);
        setExportType("");
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; padding: 20px; }
              h1 { font-size: 20px; color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
              th { background-color: #f3f4f6; color: #4b5563; font-weight: bold; border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
              td { border: 1px solid #e5e7eb; padding: 8px; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .status { font-weight: bold; text-transform: uppercase; font-size: 9px; }
              .status-confirmed { color: #10b981; }
              .status-pending { color: #3b82f6; }
              .status-completed { color: #6b7280; }
              .status-cancelled { color: #ef4444; }
              .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; text-align: center; font-family: monospace; }
            </style>
          </head>
          <body>
            <h1>Registre des Réservations — PrendreUnRDV</h1>
            <p>Généré le : ${new Date().toLocaleString('fr-FR')}</p>
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Statut</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${dataList.map(a => `
                  <tr>
                    <td style="font-family: monospace; font-weight: bold;">#${a.id}</td>
                    <td>${a.clientName || `${a.firstName} ${a.lastName}`}</td>
                    <td>${a.clientEmail || a.email}</td>
                    <td>${a.date || a.createdAt}</td>
                    <td>${a.time || "N/A"}</td>
                    <td class="status status-${(a.status || '').toLowerCase()}">${a.status || (a.isActive ? "Actif" : "Désactivé")}</td>
                    <td>${a.notes || ""}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              PrendreUnRDV • Export officiel PDF • Document confidentiel
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setIsExporting(false);
      setExportType("");
    }, 1200);
  };

  // Manual appointment creation setup
  const triggerManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuestBooking) {
      if (!guestFirstName || !guestLastName || !guestEmail || !guestPhone) {
        showToast("error", "Veuillez renseigner toutes les coordonnées du client invité.");
        return;
      }
    } else {
      if (!manualBookingClientId) {
        showToast("error", "Veuillez désigner un client existant dans l'annuaire.");
        return;
      }
    }

    setShowManualBooking(true);
  };

  const finalizeManualBooking = () => {
    setShowManualBooking(false);
    // Reset parameters
    setManualBookingClientId("");
    setIsGuestBooking(false);
    setGuestFirstName("");
    setGuestLastName("");
    setGuestEmail("");
    setGuestPhone("");
    showToast("success", "Le rendez-vous manuel a été programmé.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold shadow-lg animate-slide-up bg-white border-gray-100">
          {toast.type === "success" ? (
            <>
              <CheckCircle className="h-4.5 w-4.5 text-green-500 shrink-0" />
              <span className="text-green-700">{toast.message}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              <span className="text-red-700">{toast.message}</span>
            </>
          )}
        </div>
      )}
      {/* Admin Title Board */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100 mb-2">
            <Sliders className="h-3 w-3" />
            Console d'Administration
          </span>
          <h1 className="text-xl font-bold font-sans tracking-tight md:text-2xl text-gray-900 leading-tight">
            Gestion Globale de la Plateforme
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Supervisez en temps réel le planning, configurez l'automate de rappel et générez vos tableurs d'activité.
          </p>
        </div>

        {/* Action button manual scheduler */}
        <button
          onClick={() => {
            setIsGuestBooking(false);
            setManualBookingClientId("");
            setShowManualBooking(true);
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-all active:scale-97 shadow-md"
          id="admin-create-booking-shortcut-btn"
        >
          <Plus className="h-4 w-4" />
          Planifier un RDV manuellement
        </button>
      </div>

      {/* Export progress banner screen overlay modal */}
      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs">
          <div className="w-80 rounded-2xl bg-white p-6 text-center shadow-xl border border-gray-100 animate-bounce">
            <span className="text-3xl">📥</span>
            <h4 className="mt-3 text-sm font-bold text-gray-950">
              Génération du classeur {exportType}
            </h4>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Veuillez patienter pendant la compilation du registre...
            </p>
          </div>
        </div>
      )}

      {/* Internal Navigation Tabs grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 border-b border-gray-200 mb-8 text-xs font-semibold gap-1 py-1 rounded-t-xl bg-white sticky top-[64px] z-30 shadow-xs">
        <button
          onClick={() => {
            setActiveTab("overview");
            setSelectedClientHistory(null);
          }}
          className={`py-3 px-2 border-b-2 text-center transition-all ${
            activeTab === "overview"
              ? "border-gray-950 text-gray-950 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
          id="admin-tab-overview-btn"
        >
          Vue d'ensemble
        </button>

        <button
          onClick={() => {
            setActiveTab("appointments");
            setSelectedClientHistory(null);
          }}
          className={`py-3 px-2 border-b-2 text-center transition-all ${
            activeTab === "appointments"
              ? "border-gray-950 text-gray-950 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
          id="admin-tab-appointments-btn"
        >
          Réservations ({appointments.length})
        </button>

        <button
          onClick={() => {
            setActiveTab("clients");
            setSelectedClientHistory(null);
          }}
          className={`py-3 px-2 border-b-2 text-center transition-all ${
            activeTab === "clients"
              ? "border-gray-950 text-gray-950 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
          id="admin-tab-clients-btn"
        >
          Annuaire ({users.filter((u) => u.role !== "admin").length})
        </button>

        <button
          onClick={() => {
            setActiveTab("calendar");
            setSelectedClientHistory(null);
          }}
          className={`py-3 px-2 border-b-2 text-center transition-all ${
            activeTab === "calendar"
              ? "border-gray-950 text-gray-950 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
          id="admin-tab-calendar-btn"
        >
          Calendrier / Heures
        </button>

        <button
          onClick={() => {
            setActiveTab("emails");
            setSelectedClientHistory(null);
          }}
          className={`py-3 px-2 border-b-2 text-center transition-all ${
            activeTab === "emails"
              ? "border-gray-950 text-gray-950 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
          id="admin-tab-emails-btn"
        >
          Modèles d'Emails
        </button>

        <button
          onClick={() => {
            setActiveTab("audit");
            setSelectedClientHistory(null);
          }}
          className={`py-3 px-2 border-b-2 text-center transition-all ${
            activeTab === "audit"
              ? "border-gray-950 text-gray-950 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-900"
          }`}
          id="admin-tab-audit-btn"
        >
          Audit Securité
        </button>
      </div>

      {/* CORE SCREENS ROUTING */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Stats Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <span className="block text-xs font-semibold text-gray-400 mb-1">Total Réservations</span>
              <span className="block text-2xl font-bold text-gray-900 font-sans tracking-tight">{totalApptsCount}</span>
              <span className="text-[10px] text-gray-400 font-mono font-medium">Tout historique</span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <span className="block text-xs font-semibold text-gray-400 mb-1">Aujourd'hui</span>
              <span className="block text-2xl font-bold text-gray-900 font-sans tracking-tight">{appsToday.length}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold font-mono">
                ● En cours / validés
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <span className="block text-xs font-semibold text-gray-400 mb-1">À Venir</span>
              <span className="block text-2xl font-bold text-gray-900 font-sans tracking-tight">{appsUpcoming.length}</span>
              <span className="text-[10px] text-gray-400 font-mono font-medium">Créneaux bloqués</span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <span className="block text-xs font-semibold text-gray-400 mb-1">Fidélité Clients</span>
              <span className="block text-2xl font-bold text-gray-900 font-sans tracking-tight">
                {users.filter((u) => u.isActive && u.role === "client").length}
              </span>
              <span className="text-[10px] text-gray-400 font-mono font-medium">Comptes actifs</span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <span className="block text-xs font-semibold text-gray-400 mb-1">Taux de présence</span>
              <span className="block text-2xl font-bold text-gray-950 font-sans tracking-tight">{presenceRate}%</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> Hors annulations
              </span>
            </div>
          </div>

          {/* Graphical Analytics charts with Recharts */}
          <div className="grid gap-6 md:grid-cols-12">
            {/* Monthly Trend Bar Chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-8">
              <h3 className="text-sm font-bold text-gray-900 mb-4 font-sans flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-gray-400" /> Évolution mensuelle des réservations
              </h3>
              <div className="h-80 w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fill: "#9CA3AF" }} />
                    <YAxis tick={{ fill: "#9CA3AF" }} />
                    <ChartTooltip />
                    <ChartLegend />
                    <Bar dataKey="Réservations" fill="#1F2937" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Annulations" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Pie Chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 font-sans">
                  Répartition des statuts
                </h3>
                {statusChartData.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400">Pas de données graphiques.</div>
                ) : (
                  <div className="h-48 w-full text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Pie labels legend */}
              <div className="space-y-2 mt-4">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-gray-650">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Statistics Row */}
          <div className="grid gap-6 md:grid-cols-12">
            {/* Fidelity stats */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 font-sans flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-gray-400" />
                Clients les plus réguliers (Top 5)
              </h3>
              {clientFidelityList.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">Aucune donnée de fidélité disponible.</div>
              ) : (
                <div className="space-y-3">
                  {clientFidelityList.map((client, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-gray-800">{client.name}</span>
                        <span className="block text-[10px] text-gray-400">{client.email}</span>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-750 font-mono">
                        {client.rdvCount} RDV
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic statistics summary */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 font-sans flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-gray-400" />
                  Indicateurs de Fréquentation Clients
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="rounded-xl bg-gray-55/40 p-4 border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nouveaux ce mois</span>
                    <span className="block text-2xl font-extrabold text-gray-950 font-sans">{newClientsThisMonth}</span>
                    <span className="text-[9px] text-gray-400 font-medium">Inscriptions {new Date().toLocaleDateString("fr-FR", { month: "long" })}</span>
                  </div>

                  <div className="rounded-xl bg-gray-55/40 p-4 border border-gray-100">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fréquence de Réservation</span>
                    <span className="block text-2xl font-extrabold text-gray-950 font-sans">{avgReservations}</span>
                    <span className="text-[9px] text-gray-400 font-medium">RDV par client en moyenne</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50/20 border border-indigo-100 p-3 mt-4 text-[11px] text-indigo-750 font-medium flex gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
                <p>Ces données de fidélisation vous permettent d'identifier vos clients les plus actifs et d'adapter votre communication.</p>
              </div>
            </div>
          </div>

          {/* Today's Schedule agenda view */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <CalendarClock className="h-4.5 w-4.5 text-gray-400" />
              L'Agenda d'Aujourd'hui
            </h3>

            {appsToday.length === 0 ? (
              <div className="rounded-xl bg-gray-50/50 border border-dashed border-gray-150 p-8 text-center text-xs text-gray-400">
                Aucune réservation passée ou prévue pour aujourd'hui.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {appsToday.map((appt) => (
                  <div
                    key={appt.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/40 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400">
                          #{appt.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase rounded-full px-2 py-0.5 ${
                            appt.status === AppointmentStatus.COMPLETED
                              ? "bg-gray-200 text-gray-600"
                              : appt.status === AppointmentStatus.CANCELLED
                              ? "bg-red-50 text-red-650"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                      <span className="block text-sm font-bold text-gray-800 tracking-tight">
                        {appt.clientName}
                      </span>
                      <span className="block text-[10.5px] font-mono text-gray-500 font-medium">
                        Heure : {appt.time} ({appt.duration} m)
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-150 flex gap-1 justify-end">
                      <button
                        onClick={() => handleStatusChange(appt.id, AppointmentStatus.COMPLETED)}
                        className="rounded-md bg-white border border-gray-200 px-2 py-1 text-[10px] font-bold text-gray-600 hover:text-green-600 hover:bg-green-50/20"
                        title="Marquer comme Terminé"
                      >
                        ✓ Terminer
                      </button>
                      <button
                        onClick={() => store.cancelAppointment(appt.id, "Annulation par l'administrateur.", false)}
                        className="rounded-md bg-white border border-gray-200 px-2 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50"
                        title="Annuler le rendez-vous"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS LIST */}
      {activeTab === "appointments" && (
        <div className="space-y-6 animate-fade-in">
          {/* Advanced Filtering controls */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-2">
              {/* Search text input */}
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par client, référence..."
                  value={apptSearch}
                  onChange={(e) => setApptSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs font-semibold text-gray-800 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                />
              </div>

              {/* Status Selector dropdown */}
              <select
                value={apptStatusFilter}
                onChange={(e) => setApptStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 bg-white"
              >
                <option value="Tous">Tous les statuts</option>
                <option value={AppointmentStatus.CONFIRMED}>Confirmé</option>
                <option value={AppointmentStatus.PENDING}>En attente</option>
                <option value={AppointmentStatus.RESCHEDULED}>Reporté</option>
                <option value={AppointmentStatus.COMPLETED}>Terminé</option>
                <option value={AppointmentStatus.CANCELLED}>Annulé</option>
              </select>

              {/* Date Selector dropdown */}
              <select
                value={apptDateFilter}
                onChange={(e) => setApptDateFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 bg-white"
              >
                <option value="Tous">Toutes les dates</option>
                <option value="Aujourd'hui">Aujourd'hui</option>
                <option value="Cette semaine">Cette semaine</option>
                <option value="Ce mois">Ce mois-ci</option>
              </select>
            </div>

            {/* Export options */}
            <div className="flex gap-2">
              <button
                onClick={() => triggerCSVDownload(filteredAppointments, "reservations_rdv")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs font-bold text-gray-650 hover:bg-gray-50 cursor-pointer"
                title="Exporter au format CSV standard"
              >
                <Download className="h-4 w-4 text-gray-400" />
                CSV
              </button>
              <button
                onClick={() => triggerExcelDownload(filteredAppointments, "reservations_rdv")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-55/10 text-emerald-700 py-2 px-3 text-xs font-bold hover:bg-emerald-50/30 cursor-pointer"
                title="Exporter au format compatible Microsoft Excel"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Excel
              </button>
              <button
                onClick={() => triggerPDFDownload(filteredAppointments, "reservations_rdv")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-55/10 text-red-700 py-2 px-3 text-xs font-bold hover:bg-red-50/30 cursor-pointer"
                title="Générer une version imprimable en PDF"
              >
                <FileText className="h-4 w-4 text-red-650" />
                PDF
              </button>
            </div>
          </div>

          {/* Appointments Grid Ledger */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] tracking-wider uppercase text-gray-400 font-mono font-bold border-b border-gray-100">
                    <th className="py-3.5 px-6">Référence</th>
                    <th className="py-3.5 px-6">Client</th>
                    <th className="py-3.5 px-6">Date & Créneau</th>
                    <th className="py-3.5 px-6">Statut</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        Aucune réservation correspondante n'a été trouvée.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50/50">
                        {/* Reference code */}
                        <td className="py-4 px-6 font-mono font-bold text-gray-400">
                          #{appt.id}
                        </td>
                        {/* Client details */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="block font-bold text-gray-800">{appt.clientName}</span>
                            <span className="block text-[10px] text-gray-400 font-mono font-medium">
                              Tel: {appt.clientPhone} • {appt.clientEmail}
                            </span>
                          </div>
                        </td>
                        {/* Selected Date slots */}
                        <td className="py-4 px-6">
                          <div>
                            <span className="block font-semibold text-gray-800">
                              {new Date(appt.date).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                            </span>
                            <span className="block text-[10.5px] font-mono text-gray-500 font-bold leading-none mt-0.5">
                              {appt.time} (60m)
                            </span>
                          </div>
                        </td>
                        {/* Badge status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              appt.status === AppointmentStatus.CONFIRMED
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : appt.status === AppointmentStatus.CANCELLED
                                ? "bg-red-50 text-red-650"
                                : appt.status === AppointmentStatus.PENDING
                                ? "bg-blue-50 text-blue-750"
                                : appt.status === AppointmentStatus.RESCHEDULED
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-50 text-gray-600 border border-gray-150"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </td>
                        {/* Quick inline status updates controllers */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={appt.status}
                              onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 focus:outline-none"
                            >
                              <option value={AppointmentStatus.CONFIRMED}>Confirmer</option>
                              <option value={AppointmentStatus.PENDING}>En attente</option>
                              <option value={AppointmentStatus.RESCHEDULED}>Reporter</option>
                              <option value={AppointmentStatus.COMPLETED}>Terminer</option>
                              <option value={AppointmentStatus.CANCELLED}>Annuler</option>
                            </select>
                            
                            <button
                              onClick={() => store.cancelAppointment(appt.id, "Supprimé par l'administrateur.", false)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Annuler"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLIENTS DIRECTORY */}
      {activeTab === "clients" && (
        <div className="space-y-6 animate-fade-in">
          {/* Client Search and actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client par mail, nom, téléphone..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs font-semibold text-gray-800"
              />
            </div>

            <button
              onClick={() => triggerCSVDownload(filteredClients, "annuaire_clients")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Download className="h-4 w-4 text-gray-400" />
              Exporter Annuaire (CSV)
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {/* Left Hand: Clients list */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden md:col-span-7">
              <div className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  const itemsCount = appointments.filter((a) => a.clientId === client.id).length;
                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientHistory(client)}
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        selectedClientHistory?.id === client.id ? "bg-gray-50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <div>
                        <span className="block text-sm font-bold text-gray-850">
                          {client.firstName} {client.lastName}
                        </span>
                        <span className="block text-[10.5px] font-mono font-medium text-gray-400">
                          {client.email} • Tel: {client.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 font-mono">
                          {itemsCount} RDV
                        </span>
                        {client.isActive ? (
                          <span className="text-[10px] font-bold text-green-600">Actif</span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-500">Suspendu</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Hand: Selected Client history dashboard */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-5">
              {selectedClientHistory ? (
                isEditingClient ? (
                  <form onSubmit={handleSaveClientEdit} className="space-y-4">
                    <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-gray-900">Modifier la fiche client</h3>
                      <span className="text-[10px] font-mono text-gray-400 font-semibold">ID: {selectedClientHistory.id}</span>
                    </div>

                    {editClientError && (
                      <div className="rounded-lg bg-red-50 p-2.5 text-[11px] font-semibold text-red-600 border border-red-100">
                        {editClientError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-500">Prénom</label>
                        <input
                          type="text"
                          required
                          value={editClientFirstName}
                          onChange={(e) => setEditClientFirstName(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-500">Nom</label>
                        <input
                          type="text"
                          required
                          value={editClientLastName}
                          onChange={(e) => setEditClientLastName(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Adresse e-mail</label>
                      <input
                        type="email"
                        required
                        value={editClientEmail}
                        onChange={(e) => setEditClientEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-500">Numéro de téléphone</label>
                      <input
                        type="tel"
                        required
                        value={editClientPhone}
                        onChange={(e) => setEditClientPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
                      />
                    </div>

                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditingClient(false)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-gray-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Sauvegarder
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Title & Actions */}
                    <div className="border-b border-gray-100 pb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {selectedClientHistory.firstName} {selectedClientHistory.lastName}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">
                          Membre depuis : {new Date(selectedClientHistory.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        <div className="mt-2 text-xs font-semibold space-y-1 text-gray-600">
                          <p>✉ {selectedClientHistory.email}</p>
                          <p>📞 {selectedClientHistory.phone}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 items-end">
                        <button
                          onClick={() => startEditingClient(selectedClientHistory)}
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-650 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5 text-indigo-500" />
                          Modifier
                        </button>
                        <button
                          onClick={() =>
                            store.deactivateUser(selectedClientHistory.id, !selectedClientHistory.isActive)
                          }
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                            selectedClientHistory.isActive
                              ? "bg-red-50 text-red-650 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                          id="admin-toggle-client-status-btn"
                        >
                          {selectedClientHistory.isActive ? "Suspendre l'accès" : "Réactiver l'accès"}
                        </button>
                      </div>
                    </div>

                    {/* Summary of items bookings */}
                    <div>
                      <span className="block text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400 mb-2">
                        Historique des interventions ({appointments.filter((a) => a.clientId === selectedClientHistory.id).length})
                      </span>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {appointments
                          .filter((a) => a.clientId === selectedClientHistory.id)
                          .map((appt) => (
                            <div
                              key={appt.id}
                              className="rounded-lg bg-gray-50 p-3 text-xs flex justify-between items-center"
                            >
                              <div>
                                <span className="font-bold text-gray-800">
                                  {new Date(appt.date).toLocaleDateString("fr-FR")} à {appt.time}
                                </span>
                                <span className="block text-[10px] text-gray-400 font-mono">
                                  Réf : #{appt.id}
                                </span>
                              </div>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                  appt.status === AppointmentStatus.COMPLETED
                                    ? "bg-gray-200 text-gray-600"
                                    : appt.status === AppointmentStatus.CANCELLED
                                    ? "bg-red-100 text-red-650"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {appt.status}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <span className="text-2xl block mb-2">👤</span>
                  <p className="text-xs font-semibold">Consulter la fiche client</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed text-gray-400 max-w-xs mx-auto">
                    Sélectionnez un client à gauche pour faire apparaître son historique d'intervention complet, son statut d'adhésion et de connexion.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CALENDAR / AVAILABILITY PARAMETERS */}
      {activeTab === "calendar" && (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          {/* Working days schedule configure card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                Paramètres de Disponibilité d'Activité
              </h3>

              <div className="space-y-4 text-xs font-semibold">
                {/* Hours row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 mb-1.5">Début de journée</label>
                    <input
                      type="text"
                      value={config.startHour}
                      onChange={(e) => store.updateAvailabilityConfig({ startHour: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1.5">Fin de journée</label>
                    <input
                      type="text"
                      value={config.endHour}
                      onChange={(e) => store.updateAvailabilityConfig({ endHour: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Duration step */}
                <div>
                  <label className="block text-gray-500 mb-1.5">Durée des créneaux (minutes)</label>
                  <select
                    value={config.slotDuration}
                    onChange={(e) => store.updateAvailabilityConfig({ slotDuration: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white font-bold"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes (1 heure)</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>

                {/* Working Days Checkboxes */}
                <div>
                  <label className="block text-gray-500 mb-2">Jours d'activité configurés</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: "Lundi", value: 1 },
                      { label: "Mardi", value: 2 },
                      { label: "Mercredi", value: 3 },
                      { label: "Jeudi", value: 4 },
                      { label: "Vendredi", value: 5 },
                      { label: "Samedi", value: 6 },
                      { label: "Dimanche", value: 7 }
                    ].map((day) => {
                      const isChecked = config.workingDays.includes(day.value);
                      return (
                        <label
                          key={day.value}
                          className={`flex items-center gap-1.5 rounded-xl border p-2 cursor-pointer transition-all hover:bg-gray-50 select-none ${
                            isChecked
                              ? "border-indigo-200 bg-indigo-50/20 text-indigo-700 font-bold"
                              : "border-gray-200 bg-white text-gray-650"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let updatedDays = [...config.workingDays];
                              if (e.target.checked) {
                                if (!updatedDays.includes(day.value)) {
                                  updatedDays.push(day.value);
                                }
                              } else {
                                updatedDays = updatedDays.filter((d) => d !== day.value);
                              }
                              updatedDays.sort((a, b) => a - b);
                              store.updateAvailabilityConfig({ workingDays: updatedDays });
                            }}
                            className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500"
                          />
                          <span className="text-[10px]">{day.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Min hours cancellation notice */}
                <div>
                  <label className="block text-gray-500 mb-1.5">
                    Délai d'annulation minimum requis (heures)
                  </label>
                  <input
                    type="number"
                    value={config.minCancellationHours}
                    onChange={(e) => store.updateAvailabilityConfig({ minCancellationHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold"
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 mt-4 flex items-start gap-2 text-xs text-gray-500">
              <Info className="h-4.5 w-4.5 text-gray-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Toutes les modifications prennent effet rétroactivement sur la génération des prochains créneaux d'heures du planning en ligne.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Block customized single date calendar block date and holiday lists */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Bloquer une date spécifique
              </h3>

              <form onSubmit={handleAddBlockedDate} className="flex gap-2 mb-4">
                <input
                  type="date"
                  required
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="rounded-lg border border-gray-200 py-1.5 px-3 text-xs font-semibold flex-1"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                >
                  Bloquer la date
                </button>
              </form>

              {/* Blocked dates history list */}
              <div className="flex flex-wrap gap-1.5">
                {config.blockedDates.map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 pl-3.5 pr-2 py-1 text-xs font-semibold text-gray-800 font-mono"
                  >
                    {new Date(date).toLocaleDateString("fr-FR")}
                    <button
                      type="button"
                      onClick={() => store.unblockSpecificDate(date)}
                      className="rounded-full bg-gray-200 p-0.5 text-gray-400 hover:bg-gray-300 hover:text-gray-950"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Custom Holidays config */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Périodes de congés / Fêtes
              </h3>

              <form onSubmit={handleAddHoliday} className="grid grid-cols-2 gap-2 mb-4">
                <input
                  type="text"
                  required
                  placeholder="Intitulé (ex: Pont de Mai)"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="rounded-lg border border-gray-200 py-1.5 px-3 text-xs font-semibold"
                />
                <div className="flex gap-1">
                  <input
                    type="date"
                    required
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="rounded-lg border border-gray-200 py-1.5 px-3 text-xs font-semibold flex-1"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-gray-900 p-2 text-xs font-bold text-white hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </form>

              {/* Display list */}
              <div className="space-y-2">
                {config.holidays.map((hol) => (
                  <div
                    key={hol.id}
                    className="rounded-lg bg-gray-50 px-3 py-2 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-gray-800">{hol.name}</span>
                      <span className="block text-[10px] text-gray-400 font-mono">
                        Date : {new Date(hol.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => store.removeHoliday(hol.id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMAIL TEMPLATE CUSTOMISATION */}
      {activeTab === "emails" && (
        <div className="grid gap-6 md:grid-cols-12 animate-fade-in">
          {/* Email Templates selector */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Automates d'Envoi
            </h3>

            <div className="space-y-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => startEditingTemplate(tmpl)}
                  className={`w-full text-left rounded-xl p-3 text-xs font-semibold flex justify-between items-center transition-colors ${
                    editingTemplateId === tmpl.id
                      ? "bg-gray-100 text-gray-900 border-l-4 border-l-gray-900 pl-2.5"
                      : "bg-white hover:bg-gray-50 text-gray-650"
                  }`}
                >
                  <div>
                    <span className="block font-bold">{tmpl.title}</span>
                    <span className="text-[10px] text-gray-400 truncate max-w-xs">{tmpl.subject}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Email Editor Detail form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:col-span-8">
            {editingTemplateId ? (
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 flex justify-between items-center">
                  <span>Personnaliser l'E-mail</span>
                  <span className="font-mono text-[10px] text-gray-400">Modèle: {editingTemplateId}</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Nom de l'Expéditeur</label>
                  <input
                    type="text"
                    required
                    value={templateSender}
                    onChange={(e) => setTemplateSender(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Adresse URL du logo de l'entreprise</label>
                  <input
                    type="url"
                    value={templateLogo}
                    onChange={(e) => setTemplateLogo(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Sujet du message</label>
                  <input
                    type="text"
                    required
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Corps de texte</label>
                  <textarea
                    rows={8}
                    required
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-3 text-xs leading-relaxed"
                  />
                </div>

                {/* Variable replacements helper info */}
                <div className="rounded-xl bg-gray-50 border border-gray-150 p-3.5 text-xs text-gray-500 font-medium space-y-1">
                  <span className="font-bold text-gray-700">📌 Paramètres dynamiques pris en charge :</span>
                  <p className="leading-relaxed">
                    Utilisez ces balises de fusion pour inclure les détails du client ou du créneau :
                    <br />
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-600 font-mono text-[10px]">{`{client_name}`}</code> : Prénom et nom •{" "}
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-600 font-mono text-[10px]">{`{reference}`}</code> : Code unique •{" "}
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-600 font-mono text-[10px]">{`{date}`}</code> : Date de RDV •{" "}
                    <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-600 font-mono text-[10px]">{`{time}`}</code> : Horaires
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-650 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                    id="save-template-btn"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer les variables de fusion
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-16 text-center text-gray-400">
                <span className="text-3xl block mb-2">📬</span>
                <p className="text-xs font-semibold">Éditeur de Modèles de Courriers</p>
                <p className="text-[11px] mt-0.5 leading-relaxed text-gray-400 max-w-xs mx-auto">
                  Sélectionnez un événement d'automate d'envoi à gauche pour modifier dynamiquement les sujets d'e-mails, les variables de fusion SMTP ou l'icône de logo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY AUDIT LEDGER */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-xs overflow-hidden animate-fade-in">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 font-sans">
                Registre Général de Journalisation & d'Audit
              </h3>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              RFC 5424 Syslog Conformity
            </span>
          </div>

          <div className="divide-y divide-gray-150">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-[9px] font-bold text-gray-600 font-mono">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-gray-800">Par {log.actor}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    {log.details}
                  </p>
                </div>

                <div className="text-right text-[10px] font-mono text-gray-400">
                  {new Date(log.timestamp).toLocaleDateString("fr-FR")} à {new Date(log.timestamp).toLocaleTimeString("fr-FR", { hour: "numeric", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POP-IN MODAL: MANUAL BOOKING FORM FOR ADMIN */}
      {showManualBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
              Créer un rendez-vous manuel (Admin)
            </h4>

            <form onSubmit={triggerManualBooking} className="space-y-4">
              <div className="flex gap-4 border-b border-gray-100 pb-4 text-xs">
                {/* Regular selection */}
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    checked={!isGuestBooking}
                    onChange={() => setIsGuestBooking(false)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Client enregistré existant
                </label>
                {/* Guest selection */}
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    checked={isGuestBooking}
                    onChange={() => setIsGuestBooking(true)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  Nouvel invité (Inscription automatique)
                </label>
              </div>

              {isGuestBooking ? (
                /* Guest personal coordinates */
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Marc"
                      value={guestFirstName}
                      onChange={(e) => setGuestFirstName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">Nom</label>
                    <input
                      type="text"
                      required
                      placeholder="Lefebvre"
                      value={guestLastName}
                      onChange={(e) => setGuestLastName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">Contact Email</label>
                    <input
                      type="email"
                      required
                      placeholder="m.lefebvre@gmail.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">Téléphone mobile</label>
                    <input
                      type="tel"
                      required
                      placeholder="0611223344"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* Existing client dropdown selector */
                <div className="text-xs">
                  <label className="block text-gray-600 mb-1 font-semibold">Désigner le client</label>
                  <select
                    value={manualBookingClientId}
                    onChange={(e) => setManualBookingClientId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs font-semibold"
                    required
                  >
                    <option value="">Sélectionner un membre</option>
                    {users
                      .filter((u) => u.role !== "admin")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* BookingWizard wrapper element for selecting date & slots */}
              <div className="border-t border-gray-150 pt-4">
                <BookingWizard
                  onSuccess={finalizeManualBooking}
                  adminModeClientId={isGuestBooking ? undefined : manualBookingClientId}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowManualBooking(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-250 cursor-pointer"
                  id="admin-close-manual-booking-btn"
                >
                  Fermer la fenêtre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
