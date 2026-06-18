/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Appointment,
  AppointmentStatus,
  AvailabilityConfig,
  NotificationTemplate,
  SimulatedEmail,
  AuditLog
} from "./types";

import {
  isAppwriteConfigured,
  tryAppwriteLoad,
  tryAppwriteSave,
  tryAppwriteDelete,
  USERS_COLLECTION_ID,
  APPOINTMENTS_COLLECTION_ID,
  CONFIG_COLLECTION_ID,
  AUDIT_LOGS_COLLECTION_ID
} from "./lib/appwrite";

// Seed Data
const DEFAULT_AVAILABILITY: AvailabilityConfig = {
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  startHour: "09:00",
  endHour: "18:00",
  slotDuration: 60, // 60 minutes
  blockedDates: ["2026-06-25", "2026-07-14"],
  holidays: [
    { id: "1", name: "Fête Nationale", date: "2026-07-14" },
    { id: "2", name: "Assomption", date: "2026-08-15" },
    { id: "3", name: "Toussaint", date: "2026-11-01" }
  ],
  minCancellationHours: 24
};

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: "signup",
    title: "Création de compte",
    subject: "Bienvenue sur votre plateforme de réservation !",
    body: "Bonjour {client_name},\n\nNous sommes ravis de vous compter parmi nos membres. Votre espace personnel est désormais entièrement activé.\n\nVous pouvez dès maintenant prendre rendez-vous en ligne, consulter vos réservations et gérer vos informations en toute simplicité.\n\nCordialement,\nL'équipe administrative.",
    senderName: "PrendreUnRDV Administration",
    logoUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&q=80"
  },
  {
    id: "booking",
    title: "Confirmation de rendez-vous",
    subject: "Confirmation de votre réservation #{reference}",
    body: "Bonjour {client_name},\n\nVotre réservation a bien été enregistrée avec succès !\n\nVoici les détails de votre rendez-vous :\n- Référence : #{reference}\n- Date : {date}\n- Heure : {time}\n- Durée : {duration} minutes\n\nSi vous souhaitez modifier ou annuler cette réservation, veuillez vous connecter à votre espace au moins {min_cancel_hours} heures à l'avance.\n\nÀ bientôt !",
    senderName: "PrendreUnRDV Administration",
    logoUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&q=80"
  },
  {
    id: "reminder",
    title: "Rappel de rendez-vous",
    subject: "Rappel : Votre rendez-vous de demain le {date}",
    body: "Bonjour {client_name},\n\nCeci est un rappel amical concernant votre rendez-vous de demain, le {date} à {time}.\n\nSi vous avez un empêchement, merci de nous contacter au plus vite ou de reprogrammer depuis votre espace client.\n\nNous nous réjouissons de vous recevoir.\n\nCordialement.",
    senderName: "PrendreUnRDV Administration",
    logoUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&q=80"
  },
  {
    id: "update",
    title: "Modification / Report",
    subject: "Mise à jour de votre rendez-vous #{reference}",
    body: "Bonjour {client_name},\n\nNous vous informons que votre rendez-vous #{reference} a été mis à jour.\n\nVoici les nouvelles informations :\n- Date : {date}\n- Heure : {time}\n\nUne question ? Connectez-vous à votre espace client ou contactez notre équipe.\n\nRespectueusement.",
    senderName: "PrendreUnRDV Administration",
    logoUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&q=80"
  },
  {
    id: "cancel",
    title: "Confirmation d'annulation",
    subject: "Annulation de votre rendez-vous #{reference}",
    body: "Bonjour {client_name},\n\nNous vous confirmons que votre rendez-vous #{reference} prévu le {date} à {time} a bien été annulé.\n\nSi cette annulation relève d'une erreur, vous pouvez réserver un nouveau créneau directement en ligne à tout moment.\n\nAu plaisir de vous revoir.",
    senderName: "PrendreUnRDV Administration",
    logoUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=100&q=80"
  }
];

// Helper: get ISO date string offset from today by N days
function daysFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SEED_USERS: User[] = [
  {
    id: "usr-admin",
    firstName: "Marie",
    lastName: "Lemoine",
    email: "admin@rdv.fr",
    phone: "0601020304",
    password: "Admin2026!",
    role: "admin",
    isActive: true,
    createdAt: new Date(Date.now() - 150 * 86400000).toISOString()
  },
  {
    id: "usr-client-1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@gmail.com",
    phone: "0612345678",
    password: "Client2026!",
    role: "client",
    isActive: true,
    createdAt: new Date(Date.now() - 57 * 86400000).toISOString()
  },
  {
    id: "usr-client-2",
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.b@yahoo.fr",
    phone: "0789456123",
    password: "Client2026!",
    role: "client",
    isActive: true,
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: "usr-client-3",
    firstName: "Thomas",
    lastName: "Dubois",
    email: "t.dubois@outlook.com",
    phone: "0654127893",
    password: "Client2026!",
    role: "client",
    isActive: false, // Compte désactivé (accès suspendu)
    createdAt: new Date(Date.now() - 24 * 86400000).toISOString()
  },
    {
      id: "usr-client-4",
      firstName: "Chloé",
      lastName: "Petit",
      email: "chloe.p@gmail.com",
      phone: "0622334455",
      password: "Client2026!",
      role: "client",
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: "usr-ecqm19",
      firstName: "Ecq",
      lastName: "M19",
      email: "oooo@gmail.com",
      phone: "0600000000",
      password: "Admin2026!",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    }
];

// Build seed appointments using dynamic dates so they always appear relevant
const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "RDV-X7Y8-A",
    date: daysFromToday(-8),
    time: "10:00",
    duration: 60,
    clientId: "usr-client-1",
    clientName: "Jean Dupont",
    clientEmail: "jean.dupont@gmail.com",
    clientPhone: "0612345678",
    status: AppointmentStatus.COMPLETED,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    notes: "Consultation périodique de suivi."
  },
  {
    id: "RDV-Z5W2-B",
    date: daysFromToday(-5),
    time: "14:00",
    duration: 60,
    clientId: "usr-client-2",
    clientName: "Sophie Bernard",
    clientEmail: "sophie.b@yahoo.fr",
    clientPhone: "0789456123",
    status: AppointmentStatus.COMPLETED,
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    notes: "Premier bilan d'orientation."
  },
  {
    id: "RDV-Cancelled-C",
    date: daysFromToday(-3),
    time: "11:00",
    duration: 60,
    clientId: "usr-client-3",
    clientName: "Thomas Dubois",
    clientEmail: "t.dubois@outlook.com",
    clientPhone: "0654127893",
    status: AppointmentStatus.CANCELLED,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: "Séance découverte.",
    cancellationReason: "Empêchement professionnel de dernière minute."
  },
  {
    id: "RDV-TODAY-09",
    date: daysFromToday(0),
    time: "09:00",
    duration: 60,
    clientId: "usr-client-4",
    clientName: "Chloé Petit",
    clientEmail: "chloe.p@gmail.com",
    clientPhone: "0622334455",
    status: AppointmentStatus.COMPLETED,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: "Bilan intermédiaire de mi-parcours."
  },
  {
    id: "RDV-TODAY-14",
    date: daysFromToday(0),
    time: "14:00",
    duration: 60,
    clientId: "usr-client-1",
    clientName: "Jean Dupont",
    clientEmail: "jean.dupont@gmail.com",
    clientPhone: "0612345678",
    status: AppointmentStatus.CONFIRMED,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: "Document de préparation à apporter."
  },
  {
    id: "RDV-FUTURE-1",
    date: daysFromToday(4),
    time: "11:00",
    duration: 60,
    clientId: "usr-client-2",
    clientName: "Sophie Bernard",
    clientEmail: "sophie.b@yahoo.fr",
    clientPhone: "0789456123",
    status: AppointmentStatus.CONFIRMED,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: "Suivi mensuel de progression."
  },
  {
    id: "RDV-FUTURE-2",
    date: daysFromToday(5),
    time: "15:00",
    duration: 60,
    clientId: "usr-client-4",
    clientName: "Chloé Petit",
    clientEmail: "chloe.p@gmail.com",
    clientPhone: "0622334455",
    status: AppointmentStatus.PENDING,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: "Validation des étapes pratiques finales."
  }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    action: "Configuration initiale",
    actor: "Marie Lemoine (Admin)",
    details: "Mise en ligne des créneaux hebdomadaires et paramétrage des horaires d'ouverture."
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    action: "Modification de statut",
    actor: "Marie Lemoine (Admin)",
    details: "Statut du rendez-vous #RDV-TODAY-09 mis à jour sur 'Terminé'."
  }
];

// Helper to generate unique reservation reference
export function generateReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "RDV-";
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

// Global Store State Manager
class CentralStore {
  private users: User[] = [];
  private appointments: Appointment[] = [];
  private config: AvailabilityConfig = DEFAULT_AVAILABILITY;
  private templates: NotificationTemplate[] = [];
  private emails: SimulatedEmail[] = [];
  private auditLogs: AuditLog[] = [];
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.syncWithAppwrite();
  }

  private async syncWithAppwrite() {
    if (!isAppwriteConfigured()) {
      console.log("Appwrite configuration missing or prefix is incomplete.");
      return;
    }
    
    console.log("Appwrite configured! Initializing cloud synchronization...");
    
    try {
      // 1. Sync Users
      const appwriteUsers = await tryAppwriteLoad<User>(USERS_COLLECTION_ID, []);
      if (appwriteUsers && appwriteUsers.length > 0) {
        console.log(`Appwrite: Loaded ${appwriteUsers.length} users.`);
        const mergedUsers = [...this.users];
        appwriteUsers.forEach((au) => {
          const idx = mergedUsers.findIndex((u) => u.id === au.id);
          if (idx >= 0) {
            mergedUsers[idx] = au;
          } else {
            mergedUsers.push(au);
          }
        });
        this.users = mergedUsers;
        this.saveUsers();
      } else {
        console.log("Appwrite: Remote Users collection is empty. Populating with seed users...");
        for (const user of this.users) {
          await tryAppwriteSave(USERS_COLLECTION_ID, user);
        }
      }

      // 2. Sync Appointments
      const appwriteAppts = await tryAppwriteLoad<Appointment>(APPOINTMENTS_COLLECTION_ID, []);
      if (appwriteAppts && appwriteAppts.length > 0) {
        console.log(`Appwrite: Loaded ${appwriteAppts.length} appointments.`);
        const mergedAppts = [...this.appointments];
        appwriteAppts.forEach((aa) => {
          const idx = mergedAppts.findIndex((a) => a.id === aa.id);
          if (idx >= 0) {
            mergedAppts[idx] = aa;
          } else {
            mergedAppts.push(aa);
          }
        });
        this.appointments = mergedAppts;
        this.saveAppointments();
      } else {
        console.log("Appwrite: Remote Appointments collection is empty. Populating with seed appointments...");
        for (const appt of this.appointments) {
          await tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, appt);
        }
      }

      // 3. Sync Availability Config
      const appwriteConfig = await tryAppwriteLoad<any>(CONFIG_COLLECTION_ID, []);
      if (appwriteConfig && appwriteConfig.length > 0) {
        const globalConf = appwriteConfig.find((c) => c.id === "global_config");
        if (globalConf) {
          let workingDays = globalConf.workingDays;
          let blockedDates = globalConf.blockedDates;
          if (typeof workingDays === "string") {
            try { workingDays = JSON.parse(workingDays); } catch (e) {}
          }
          if (typeof blockedDates === "string") {
            try { blockedDates = JSON.parse(blockedDates); } catch (e) {}
          }
          this.config = {
            ...this.config,
            ...globalConf,
            workingDays: Array.isArray(workingDays) ? workingDays.map(Number) : this.config.workingDays,
            blockedDates: Array.isArray(blockedDates) ? blockedDates : this.config.blockedDates,
          };
          this.saveConfig();
        }
      } else {
        console.log("Appwrite: Remote Config empty. Seeding...");
        const flatConfig = {
          id: "global_config",
          workingDays: JSON.stringify(this.config.workingDays),
          startHour: this.config.startHour,
          endHour: this.config.endHour,
          slotDuration: this.config.slotDuration,
          blockedDates: JSON.stringify(this.config.blockedDates),
          minCancellationHours: this.config.minCancellationHours
        };
        await tryAppwriteSave(CONFIG_COLLECTION_ID, flatConfig);
      }

      // 4. Sync Audit Logs
      const appwriteLogs = await tryAppwriteLoad<AuditLog>(AUDIT_LOGS_COLLECTION_ID, []);
      if (appwriteLogs && appwriteLogs.length > 0) {
        console.log(`Appwrite: Loaded ${appwriteLogs.length} audit logs.`);
        const mergedLogs = [...this.auditLogs];
        appwriteLogs.forEach((al) => {
          const idx = mergedLogs.findIndex((l) => l.id === al.id);
          if (idx >= 0) {
            mergedLogs[idx] = al;
          } else {
            mergedLogs.push(al);
          }
        });
        this.auditLogs = mergedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        this.saveAuditLogs();
      } else {
        console.log("Appwrite: Remote Audit Logs empty. Seeding recent...");
        for (const log of this.auditLogs.slice(0, 10)) {
          await tryAppwriteSave(AUDIT_LOGS_COLLECTION_ID, log);
        }
      }

      console.log("Appwrite database fully synchronized!");
      this.notify();
    } catch (err) {
      console.warn("Could not sync with Appwrite: Database or collections are missing.", err);
    }
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem("rdv_users");
      const storedRDVs = localStorage.getItem("rdv_appointments");
      const storedConfig = localStorage.getItem("rdv_config");
      const storedTemplates = localStorage.getItem("rdv_templates");
      const storedEmails = localStorage.getItem("rdv_emails");
      const storedLogs = localStorage.getItem("rdv_audit_logs");
      const storedUser = localStorage.getItem("rdv_current_user");

      if (storedUsers) this.users = JSON.parse(storedUsers);
      else {
        this.users = SEED_USERS;
        this.saveUsers();
      }

      if (storedRDVs) this.appointments = JSON.parse(storedRDVs);
      else {
        this.appointments = SEED_APPOINTMENTS;
        this.saveAppointments();
      }

      if (storedConfig) this.config = JSON.parse(storedConfig);
      else {
        this.config = DEFAULT_AVAILABILITY;
        this.saveConfig();
      }

      if (storedTemplates) this.templates = JSON.parse(storedTemplates);
      else {
        this.templates = DEFAULT_TEMPLATES;
        this.saveTemplates();
      }

      if (storedEmails) this.emails = JSON.parse(storedEmails);
      else {
        this.emails = [];
        this.saveEmails();
      }

      if (storedLogs) this.auditLogs = JSON.parse(storedLogs);
      else {
        this.auditLogs = SEED_AUDIT_LOGS;
        this.saveAuditLogs();
      }

      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Failed to restore simulated database state:", e);
    }
  }

  private saveUsers() {
    localStorage.setItem("rdv_users", JSON.stringify(this.users));
  }
  private saveAppointments() {
    localStorage.setItem("rdv_appointments", JSON.stringify(this.appointments));
  }
  private saveConfig() {
    localStorage.setItem("rdv_config", JSON.stringify(this.config));
  }
  private saveTemplates() {
    localStorage.setItem("rdv_templates", JSON.stringify(this.templates));
  }
  private saveEmails() {
    localStorage.setItem("rdv_emails", JSON.stringify(this.emails));
  }
  private saveAuditLogs() {
    localStorage.setItem("rdv_audit_logs", JSON.stringify(this.auditLogs));
  }
  private saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem("rdv_current_user", JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem("rdv_current_user");
    }
  }

  // Publisher
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  public getUsers(): User[] {
    return this.users.filter(u => u.id !== "usr-admin"); // Only display clients to admin
  }

  public getAllUsersAdmin(): User[] {
    return this.users;
  }

  public getAppointments(): Appointment[] {
    return this.appointments;
  }

  public getConfig(): AvailabilityConfig {
    return this.config;
  }

  public getTemplates(): NotificationTemplate[] {
    return this.templates;
  }

  public getEmails(): SimulatedEmail[] {
    return this.emails;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Simulated Email Dispatcher
  public triggerEmail(
    templateId: "signup" | "booking" | "reminder" | "update" | "cancel",
    toEmail: string,
    replacements: Record<string, string>
  ) {
    const template = this.templates.find((t) => t.id === templateId) || DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    let body = template.body;
    let subject = template.subject;

    // Apply Replacements
    Object.entries(replacements).forEach(([key, value]) => {
      const escapedKey = `{${key}}`;
      body = body.replace(new RegExp(escapedKey, "g"), value);
      subject = subject.replace(new RegExp(escapedKey, "g"), value);
    });

    // Replace global config variables in email body
    body = body.replace(/{min_cancel_hours}/g, String(this.config.minCancellationHours));

    const newEmail: SimulatedEmail = {
      id: "EML-" + Math.floor(Math.random() * 1000000),
      to: toEmail,
      subject: subject,
      body: body,
      sentAt: new Date().toISOString(),
      logoUrl: template.logoUrl,
      templateType: template.title
    };

    this.emails = [newEmail, ...this.emails];
    this.saveEmails();
    this.notify();
  }

  // Logger helper
  public logAudit(action: string, details: string) {
    const actorName = this.currentUser
      ? `${this.currentUser.firstName} ${this.currentUser.lastName} (${this.currentUser.role === "admin" ? "Admin" : "Client"})`
      : "Système";

    const newLog: AuditLog = {
      id: "LOG-" + Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
      action,
      actor: actorName,
      details
    };

    this.auditLogs = [newLog, ...this.auditLogs];
    this.saveAuditLogs();
    tryAppwriteSave(AUDIT_LOGS_COLLECTION_ID, newLog).catch(e => console.error("Appwrite log sync skipped:", e));
    this.notify();
  }

  // Auth Management
  public simulateSignup(userData: Omit<User, "id" | "role" | "isActive" | "createdAt">): { success: boolean; message: string } {
    const emailExists = this.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      return { success: false, message: "Un compte avec cette adresse email existe déjà." };
    }

    const newUser: User = {
      ...userData,
      id: "usr-" + Math.floor(Math.random() * 1000000),
      role: "client",
      isActive: true, // Auto-activated for simple client simulation flow
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    tryAppwriteSave(USERS_COLLECTION_ID, newUser).catch(e => console.error("Appwrite signup sync skipped:", e));

    // Log & Trigger Welcome Email
    this.logAudit("Inscription client", `Nouveau client inscrit : ${newUser.firstName} ${newUser.lastName}`);
    this.triggerEmail("signup", newUser.email, {
      client_name: `${newUser.firstName} ${newUser.lastName}`
    });

    this.notify();
    return { success: true, message: "Votre compte a été créé et activé avec succès !" };
  }

  public simulateLogin(email: string, password?: string): { success: boolean; message: string } {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: "Identifiants incorrects. Aucun compte trouvé." };
    }

    if (!user.isActive) {
      return { success: false, message: "Ce compte a été désactivé par l'administrateur." };
    }

    // Since mock validation
    if (password && user.password && user.password !== password) {
      return { success: false, message: "Mot de passe incorrect." };
    }

    this.currentUser = user;
    this.saveCurrentUser();
    this.logAudit("Connexion", "Utilisateur authentifié sur la plateforme.");
    this.notify();
    return { success: true, message: `Bienvenue, ${user.firstName} !` };
  }

  public simulateLogout() {
    this.logAudit("Déconnexion", "Utilisateur s'est déconnecté.");
    this.currentUser = null;
    this.saveCurrentUser();
    this.notify();
  }

  public updateUserProfile(firstName: string, lastName: string, phone: string, email: string): { success: boolean; message: string } {
    if (!this.currentUser) return { success: false, message: "Session expirée." };

    // Check email availability
    const emailConflict = this.users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== this.currentUser!.id
    );
    if (emailConflict) {
      return { success: false, message: "Cette adresse email est déjà utilisée par un autre utilisateur." };
    }

    let updatedUser: User | null = null;

    // Update inside stored users list
    this.users = this.users.map((u) => {
      if (u.id === this.currentUser!.id) {
        updatedUser = { ...u, firstName, lastName, phone, email };
        return updatedUser;
      }
      return u;
    });

    // Update state of current user
    this.currentUser = { ...this.currentUser, firstName, lastName, phone, email };

    const updatedAppts: Appointment[] = [];
    // Cascade client name updates inside appointments
    this.appointments = this.appointments.map((a) => {
      if (a.clientId === this.currentUser!.id) {
        const upAppt = {
          ...a,
          clientName: `${firstName} ${lastName}`,
          clientEmail: email,
          clientPhone: phone
        };
        updatedAppts.push(upAppt);
        return upAppt;
      }
      return a;
    });

    this.saveUsers();
    this.saveAppointments();
    this.saveCurrentUser();

    // Appwrite sync calls
    if (updatedUser) {
      tryAppwriteSave(USERS_COLLECTION_ID, updatedUser).catch(e => console.error(e));
    }
    updatedAppts.forEach(appt => {
      tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, appt).catch(e => console.error(e));
    });

    this.logAudit("Modification profil", "Mise à jour des coordonnées personnelles par l'utilisateur.");
    this.notify();

    return { success: true, message: "Profil mis à jour avec succès !" };
  }

  public adminUpdateUserProfile(
    userId: string,
    firstName: string,
    lastName: string,
    phone: string,
    email: string
  ): { success: boolean; message: string; user?: User } {
    const userInDb = this.users.find((u) => u.id === userId);
    if (!userInDb) return { success: false, message: "Utilisateur introuvable." };

    // Check email availability
    const emailConflict = this.users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId
    );
    if (emailConflict) {
      return { success: false, message: "Cette adresse email est déjà utilisée par un autre utilisateur." };
    }

    let updatedUser: User = { ...userInDb, firstName, lastName, phone, email };

    // Update inside stored users list
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        return updatedUser;
      }
      return u;
    });

    const updatedAppts: Appointment[] = [];
    // Cascade client name updates inside appointments
    this.appointments = this.appointments.map((a) => {
      if (a.clientId === userId) {
        const upAppt = {
          ...a,
          clientName: `${firstName} ${lastName}`,
          clientEmail: email,
          clientPhone: phone
        };
        updatedAppts.push(upAppt);
        return upAppt;
      }
      return a;
    });

    this.saveUsers();
    this.saveAppointments();

    // Appwrite sync calls
    tryAppwriteSave(USERS_COLLECTION_ID, updatedUser).catch(e => console.error(e));
    updatedAppts.forEach(appt => {
      tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, appt).catch(e => console.error(e));
    });

    this.logAudit("Modification profil (Admin)", `Mise à jour des coordonnées personnelles du client ${firstName} ${lastName} par l'administrateur.`);
    this.notify();

    return { success: true, message: "Profil client mis à jour avec succès !", user: updatedUser };
  }

  public updatePassword(currentPass: string, newPass: string): { success: boolean; message: string } {
    if (!this.currentUser) return { success: false, message: "Session expirée." };

    const userInDb = this.users.find((u) => u.id === this.currentUser!.id);
    if (!userInDb) return { success: false, message: "Utilisateur introuvable." };

    if (userInDb.password && userInDb.password !== currentPass) {
      return { success: false, message: "Mot de passe actuel incorrect." };
    }

    let updatedUser: User | null = null;
    this.users = this.users.map((u) => {
      if (u.id === this.currentUser!.id) {
        updatedUser = { ...u, password: newPass };
        return updatedUser;
      }
      return u;
    });

    this.currentUser.password = newPass;

    this.saveUsers();
    this.saveCurrentUser();

    if (updatedUser) {
      tryAppwriteSave(USERS_COLLECTION_ID, updatedUser).catch(e => console.error(e));
    }

    this.logAudit("Modification mot de passe", "Le code d'accès de l'utilisateur a été réinitialisé.");
    this.notify();

    return { success: true, message: "Votre mot de passe a bien été modifié." };
  }

  public deactivateUser(userId: string, state: boolean): { success: boolean; message: string } {
    let updatedUser: User | null = null;
    this.users = this.users.map((u) => {
      if (u.id === userId) {
        updatedUser = { ...u, isActive: state };
        return updatedUser;
      }
      return u;
    });

    this.saveUsers();
    if (updatedUser) {
      tryAppwriteSave(USERS_COLLECTION_ID, updatedUser).catch(e => console.error(e));
    }
    const targetUser = this.users.find(u => u.id === userId);
    this.logAudit(
      state ? "Réactivation compte" : "Désactivation compte",
      `Le compte de ${targetUser?.firstName} ${targetUser?.lastName} est désormais ${state ? "actif" : "suspendu"}.`
    );
    this.notify();
    return { success: true, message: `Compte client ${state ? "réactivé" : "désactivé"} !` };
  }

  public deleteOwnAccount() {
    if (!this.currentUser) return;
    const deletedId = this.currentUser.id;
    const deletedEmail = this.currentUser.email;

    // Remove from database list (make inactive or fully delete, let's delete but retain appointments in history for ledger consistency)
    this.users = this.users.filter((u) => u.id !== deletedId);
    this.saveUsers();
    tryAppwriteDelete(USERS_COLLECTION_ID, deletedId).catch(e => console.error(e));

    this.logAudit("Suppression compte", `Le client ${this.currentUser.firstName} ${this.currentUser.lastName} a supprimé son compte.`);

    // Log out immediately
    this.currentUser = null;
    this.saveCurrentUser();
    this.notify();
  }

  // Appointments Management
  public createAppointment(bookingData: {
    date: string;
    time: string;
    notes?: string;
    clientId?: string; // Optional if created by admin for a selected client
    clientOverride?: { firstName: string; lastName: string; email: string; phone: string }; // Admin manual flow
  }): { success: boolean; message: string; appointment?: Appointment } {
    const isSlotTaken = this.appointments.some(
      (a) => a.date === bookingData.date && a.time === bookingData.time && a.status !== AppointmentStatus.CANCELLED
    );

    if (isSlotTaken) {
      return { success: false, message: "Ce créneau horaire est déjà réservé par un autre rendez-vous." };
    }

    // Parse clients detail
    let activeClientId = "";
    let activeClientName = "";
    let activeClientEmail = "";
    let activeClientPhone = "";

    if (bookingData.clientId) {
      const client = this.users.find(u => u.id === bookingData.clientId);
      if (client) {
        activeClientId = client.id;
        activeClientName = `${client.firstName} ${client.lastName}`;
        activeClientEmail = client.email;
        activeClientPhone = client.phone;
      }
    } else if (bookingData.clientOverride) {
      // Manual admin creation or self creation with custom values
      activeClientId = "usr-guest-" + Math.floor(Math.random() * 10000);
      activeClientName = `${bookingData.clientOverride.firstName} ${bookingData.clientOverride.lastName}`;
      activeClientEmail = bookingData.clientOverride.email;
      activeClientPhone = bookingData.clientOverride.phone;

      // Register this user as a guest client inside directory as well so the admin can search them!
      const isClientEmailRegistered = this.users.some(u => u.email.toLowerCase() === activeClientEmail.toLowerCase());
      if (!isClientEmailRegistered) {
        const simulatedGuest: User = {
          id: activeClientId,
          firstName: bookingData.clientOverride.firstName,
          lastName: bookingData.clientOverride.lastName,
          email: activeClientEmail,
          phone: activeClientPhone,
          role: "client",
          isActive: true,
          createdAt: new Date().toISOString()
        };
        this.users.push(simulatedGuest);
        this.saveUsers();
        tryAppwriteSave(USERS_COLLECTION_ID, simulatedGuest).catch(e => console.error(e));
      }
    } else if (this.currentUser) {
      // Default booking for current logged-in client
      activeClientId = this.currentUser.id;
      activeClientName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      activeClientEmail = this.currentUser.email;
      activeClientPhone = this.currentUser.phone;
    } else {
      return { success: false, message: "Aucun client n'a été spécifié pour la réservation." };
    }

    const uniqueRef = generateReference();
    const newRDV: Appointment = {
      id: uniqueRef,
      date: bookingData.date,
      time: bookingData.time,
      duration: this.config.slotDuration,
      clientId: activeClientId,
      clientName: activeClientName,
      clientEmail: activeClientEmail,
      clientPhone: activeClientPhone,
      status: AppointmentStatus.CONFIRMED, // Auto-confirm standard reservations
      createdAt: new Date().toISOString(),
      notes: bookingData.notes
    };

    this.appointments.push(newRDV);
    this.saveAppointments();
    tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, newRDV).catch(e => console.error(e));

    this.logAudit("Création réservation", `Nouveau rendez-vous enregistré [${uniqueRef}] le ${newRDV.date} to ${newRDV.time} pour ${newRDV.clientName}.`);

    // Trigger confirmation notification
    this.triggerEmail("booking", newRDV.clientEmail, {
      client_name: newRDV.clientName,
      reference: newRDV.id,
      date: newRDV.date,
      time: newRDV.time,
      duration: String(newRDV.duration)
    });

    this.notify();
    return { success: true, message: `Votre rendez-vous du ${newRDV.date} à ${newRDV.time} a été validé !`, appointment: newRDV };
  }

  public modifyAppointment(
    rdvId: string,
    newData: { date: string; time: string; notes?: string }
  ): { success: boolean; message: string } {
    const original = this.appointments.find((a) => a.id === rdvId);
    if (!original) {
      return { success: false, message: "Rendez-vous introuvable." };
    }

    // Verify slot conflicts
    const conflict = this.appointments.some(
      (a) =>
        a.date === newData.date &&
        a.time === newData.time &&
        a.id !== rdvId &&
        a.status !== AppointmentStatus.CANCELLED
    );
    if (conflict) {
      return { success: false, message: "Ce nouveau créneau est déjà réservé par un autre client." };
    }

    // Save previous times for modification note and logger
    const oldDate = original.date;
    const oldTime = original.time;

    let updatedAppt: Appointment | null = null;
    this.appointments = this.appointments.map((a) => {
      if (a.id === rdvId) {
        updatedAppt = {
          ...a,
          date: newData.date,
          time: newData.time,
          notes: newData.notes !== undefined ? newData.notes : a.notes,
          status: AppointmentStatus.RESCHEDULED // Set status to Rescheduled/Reporté
        };
        return updatedAppt;
      }
      return a;
    });

    this.saveAppointments();
    if (updatedAppt) {
      tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, updatedAppt).catch(e => console.error(e));
    }

    this.logAudit(
      "Report / Modification RDV",
      `Mise à jour du RDV [${rdvId}] : reporté du (${oldDate} à ${oldTime}) vers la date (${newData.date} à ${newData.time}).`
    );

    // Trigger update email
    this.triggerEmail("update", original.clientEmail, {
      client_name: original.clientName,
      reference: original.id,
      date: newData.date,
      time: newData.time
    });

    this.notify();
    return { success: true, message: "Le rendez-vous a été reprogrammé avec succès !" };
  }

  public cancelAppointment(rdvId: string, reason?: string, triggerByClient: boolean = true): { success: boolean; message: string } {
    const rdv = this.appointments.find((a) => a.id === rdvId);
    if (!rdv) return { success: false, message: "Rendez-vous introuvable." };

    if (triggerByClient) {
      // Validate cancellation timeframe requirement
      const apptDateTime = new Date(`${rdv.date}T${rdv.time}`);
      const hoursDiff = (apptDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);

      if (hoursDiff < this.config.minCancellationHours) {
        return {
          success: false,
          message: `L'annulation n'est plus autorisée en ligne. Le délai de prévenance requis est de ${this.config.minCancellationHours} heures.`
        };
      }
    }

    let updatedAppt: Appointment | null = null;
    this.appointments = this.appointments.map((a) => {
      if (a.id === rdvId) {
        updatedAppt = {
          ...a,
          status: AppointmentStatus.CANCELLED,
          cancellationReason: reason || "Annulé depuis l'espace personnel."
        };
        return updatedAppt;
      }
      return a;
    });

    this.saveAppointments();
    if (updatedAppt) {
      tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, updatedAppt).catch(e => console.error(e));
    }

    this.logAudit(
      "Annulation RDV",
      `Le rendez-vous [${rdvId}] du ${rdv.date} à ${rdv.time} a été annulé.${reason ? ` Motif : ${reason}` : ""}`
    );

    // Trigger cancel email
    this.triggerEmail("cancel", rdv.clientEmail, {
      client_name: rdv.clientName,
      reference: rdv.id,
      date: rdv.date,
      time: rdv.time
    });

    this.notify();
    return { success: true, message: "Le rendez-vous a bien été annulé et l'email de confirmation envoyé." };
  }

  public updateAppointmentStatus(rdvId: string, status: AppointmentStatus): { success: boolean; message: string } {
    const rdv = this.appointments.find((a) => a.id === rdvId);
    if (!rdv) return { success: false, message: "Rendez-vous introuvable." };

    let updatedAppt: Appointment | null = null;
    this.appointments = this.appointments.map((a) => {
      if (a.id === rdvId) {
        updatedAppt = { ...a, status };
        return updatedAppt;
      }
      return a;
    });

    this.saveAppointments();
    if (updatedAppt) {
      tryAppwriteSave(APPOINTMENTS_COLLECTION_ID, updatedAppt).catch(e => console.error(e));
    }
    this.logAudit("Changement de statut", `Statut du rendez-vous [${rdvId}] mis à jour sur : '${status}'.`);
    this.notify();
    return { success: true, message: `Le statut du rendez-vous est maintenant : ${status}` };
  }

  private syncConfigToAppwrite() {
    const flatConfig = {
      id: "global_config",
      workingDays: JSON.stringify(this.config.workingDays),
      startHour: this.config.startHour,
      endHour: this.config.endHour,
      slotDuration: this.config.slotDuration,
      blockedDates: JSON.stringify(this.config.blockedDates),
      minCancellationHours: this.config.minCancellationHours
    };
    tryAppwriteSave(CONFIG_COLLECTION_ID, flatConfig).catch(e => console.error("Appwrite config sync skipped:", e));
  }

  // Admin Config updates
  public updateAvailabilityConfig(newConfig: Partial<AvailabilityConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.syncConfigToAppwrite();
    this.logAudit("Paramétrage calendrier", "Mise à jour des règles globales du calendrier (horaires/jours ouvrables).");
    this.notify();
  }

  public blockSpecificDate(dateString: string) {
    if (this.config.blockedDates.includes(dateString)) return;
    this.config.blockedDates.push(dateString);
    this.saveConfig();
    this.syncConfigToAppwrite();
    this.logAudit("Blocage date calendrier", `La date du ${dateString} a été bloquée pour toute future réservation de créneau.`);
    this.notify();
  }

  public unblockSpecificDate(dateString: string) {
    this.config.blockedDates = this.config.blockedDates.filter((d) => d !== dateString);
    this.saveConfig();
    this.syncConfigToAppwrite();
    this.logAudit("Déblocage date calendrier", `La date du ${dateString} a été rouverte aux réservations.`);
    this.notify();
  }

  public addHoliday(name: string, date: string) {
    const id = "hol-" + Math.floor(Math.random() * 100000);
    this.config.holidays.push({ id, name, date });
    this.saveConfig();
    this.syncConfigToAppwrite();
    this.logAudit("Ajout de congé / jour férié", `Jour férié défini : '${name}' le ${date}.`);
    this.notify();
  }

  public removeHoliday(holidayId: string) {
    const holiday = this.config.holidays.find(h => h.id === holidayId);
    this.config.holidays = this.config.holidays.filter((h) => h.id !== holidayId);
    this.saveConfig();
    this.syncConfigToAppwrite();
    if (holiday) {
      this.logAudit("Retrait de congé / jour férié", `Jour férié supprimé : '${holiday.name}' du ${holiday.date}.`);
    }
    this.notify();
  }

  // Update Email Templates
  public updateNotificationTemplate(id: string, update: Partial<NotificationTemplate>) {
    this.templates = this.templates.map((t) => {
      if (t.id === id) {
        return { ...t, ...update };
      }
      return t;
    });
    this.saveTemplates();
    this.logAudit("Mise à jour modèle e-mail", `Le modèle d'e-mail pour l'événement '${id}' a été personnalisé.`);
    this.notify();
  }

  // Helper: Generates list of hours slots for a specific date based on working config
  public getAvailableTimeSlotsForDate(dateString: string): { time: string; state: "free" | "booked" | "blocked" }[] {
    const dateObj = new Date(dateString);
    const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat

    // Map JS Sunday(0) -> Saturday(6)
    // Check if day is within defined workingDays
    // JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // AvailabilityConfig: 1=Mon, 2=Tue... etc. Let's make sure it translates easily.
    const isWorkingDay = this.config.workingDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek);
    const isBlocked = this.config.blockedDates.includes(dateString) || this.config.holidays.some((h) => h.date === dateString);

    if (!isWorkingDay || isBlocked) {
      return [];
    }

    // Compile times
    const slots: { time: string; state: "free" | "booked" | "blocked" }[] = [];
    const [startH, startM] = this.config.startHour.split(":").map(Number);
    const [endH, endM] = this.config.endHour.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = this.config.slotDuration;

    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += duration) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      // Search if there is an active appointment bookings at this time
      const indexBooking = this.appointments.find(
        (a) => a.date === dateString && a.time === timeStr && a.status !== AppointmentStatus.CANCELLED
      );

      slots.push({
        time: timeStr,
        state: indexBooking ? "booked" : "free"
      });
    }

    return slots;
  }

  public resetAllDataToDefault() {
    this.users = SEED_USERS;
    this.appointments = SEED_APPOINTMENTS;
    this.config = DEFAULT_AVAILABILITY;
    this.templates = DEFAULT_TEMPLATES;
    this.emails = [];
    this.auditLogs = SEED_AUDIT_LOGS;
    this.currentUser = null;

    this.saveUsers();
    this.saveAppointments();
    this.saveConfig();
    this.saveTemplates();
    this.saveEmails();
    this.saveAuditLogs();
    this.saveCurrentUser();
    this.logAudit("Réinitialisation démo", "L'ensemble des collections de données simulées a été réinitialisé.");
    this.notify();
  }
}

// Singleton Store
export const store = new CentralStore();

// React Custom Hook helper for global reactivity
import { useEffect, useState } from "react";

export function useStore() {
  const [state, setState] = useState({
    currentUser: store.getCurrentUser(),
    users: store.getUsers(),
    allUsers: store.getAllUsersAdmin(),
    appointments: store.getAppointments(),
    config: store.getConfig(),
    templates: store.getTemplates(),
    emails: store.getEmails(),
    auditLogs: store.getAuditLogs()
  });

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({
        currentUser: store.getCurrentUser(),
        users: store.getUsers(),
        allUsers: store.getAllUsersAdmin(),
        appointments: store.getAppointments(),
        config: store.getConfig(),
        templates: store.getTemplates(),
        emails: store.getEmails(),
        auditLogs: store.getAuditLogs()
      });
    });
    return unsubscribe;
  }, []);

  return state;
}
