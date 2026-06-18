/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AppointmentStatus {
  PENDING = "En attente",
  CONFIRMED = "Confirmé",
  CANCELLED = "Annulé",
  RESCHEDULED = "Reporté",
  COMPLETED = "Terminé"
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: "client" | "admin";
  isActive: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string; // Actionable reservation reference like APP-XYZ-123
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes (default 45 or 60)
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: AppointmentStatus;
  createdAt: string;
  notes?: string;
  cancellationReason?: string;
}

export interface AvailabilityConfig {
  workingDays: number[]; // 1 to 5 (Mon-Fri) or 1 to 6 (Mon-Sat)
  startHour: string; // e.g. "09:00"
  endHour: string; // e.g. "18:00"
  slotDuration: number; // In minutes, e.g. 30, 45, 60
  blockedDates: string[]; // List of YYYY-MM-DD that are fully blocked
  holidays: { id: string; name: string; date: string }[]; // Specific holidays
  minCancellationHours: number; // e.g., 24h
}

export interface NotificationTemplate {
  id: "signup" | "booking" | "reminder" | "update" | "cancel";
  title: string;
  subject: string;
  body: string;
  logoUrl?: string;
  senderName: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  logoUrl?: string;
  templateType: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}
