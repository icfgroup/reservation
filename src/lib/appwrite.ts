/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Account, Databases, ID, Query } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

// Initialize Client
export const client = new Client();
if (projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);

// Base IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DB_ID || "rdv_db";
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS || "users_collection";
export const APPOINTMENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_APPOINTMENTS || "appointments_collection";
export const CONFIG_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_CONFIG || "config_collection";
export const AUDIT_LOGS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_AUDIT_LOGS || "audit_logs_collection";

/**
 * Utility check to verify if Appwrite credentials have been set up
 */
export function isAppwriteConfigured(): boolean {
  return !!projectId;
}

/**
 * Helper to gracefully sync data to and from Appwrite
 */
export async function tryAppwriteLoad<T>(
  collectionId: string,
  fallbackData: T[],
  queries: string[] = []
): Promise<T[]> {
  if (!isAppwriteConfigured()) {
    return fallbackData;
  }
  try {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, queries);
    // Map documents to state objects
    return response.documents.map((doc) => {
      const { $id, $createdAt, ...rest } = doc;
      return { id: $id, ...rest } as T;
    });
  } catch (error) {
    console.warn(`Appwrite: Failed to load from collection "${collectionId}". Falling back to local storage.`, error);
    return fallbackData;
  }
}

export async function tryAppwriteSave<T extends { id: string }>(
  collectionId: string,
  item: T
): Promise<boolean> {
  if (!isAppwriteConfigured()) return false;
  try {
    const { id, ...data } = item;
    try {
      // Try to update existing document
      await databases.updateDocument(DATABASE_ID, collectionId, id, data);
    } catch (e: any) {
      // If it doesn't exist (404), create it
      if (e.code === 404 || e.status === 404) {
        await databases.createDocument(DATABASE_ID, collectionId, id, data);
      } else {
        throw e;
      }
    }
    return true;
  } catch (error) {
    console.error(`Appwrite: Error saving document ${item.id} to "${collectionId}"`, error);
    return false;
  }
}

export async function tryAppwriteDelete(
  collectionId: string,
  id: string
): Promise<boolean> {
  if (!isAppwriteConfigured()) return false;
  try {
    await databases.deleteDocument(DATABASE_ID, collectionId, id);
    return true;
  } catch (error) {
    console.error(`Appwrite: Error deleting document ${id} from "${collectionId}"`, error);
    return false;
  }
}
