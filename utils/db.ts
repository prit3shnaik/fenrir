import Dexie, { type Table } from 'dexie'
import type { SavedCase, ApiKeys } from '@/types'

export class FenrirDB extends Dexie {
  cases!: Table<SavedCase>
  settings!: Table<{ key: string; value: unknown }>

  constructor() {
    super('fenrir-db')
    this.version(1).stores({
      cases: 'id, name, createdAt, updatedAt',
      settings: 'key',
    })
  }
}

export const db = new FenrirDB()

export async function loadApiKeys(): Promise<Partial<ApiKeys>> {
  try {
    const row = await db.settings.get('apiKeys')
    return (row?.value as Partial<ApiKeys>) ?? {}
  } catch {
    return {}
  }
}

export async function saveApiKeys(keys: Partial<ApiKeys>): Promise<void> {
  await db.settings.put({ key: 'apiKeys', value: keys })
}

export async function saveCase(c: SavedCase): Promise<void> {
  await db.cases.put(c)
}

export async function loadCases(): Promise<SavedCase[]> {
  return db.cases.orderBy('updatedAt').reverse().toArray()
}

export async function deleteCase(id: string): Promise<void> {
  await db.cases.delete(id)
}

export async function loadCase(id: string): Promise<SavedCase | undefined> {
  return db.cases.get(id)
}
