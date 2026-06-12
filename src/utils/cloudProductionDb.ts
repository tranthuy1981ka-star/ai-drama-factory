import type { ProductionDbRoot } from './productionDbAdapter'
import { getSupabaseClientState } from './supabaseClient'

export interface CloudProductionStateRow {
  id?: string
  project_id: string
  state: ProductionDbRoot
  updated_at?: string
  updated_by?: string | null
  note?: string | null
}

export interface CloudSyncStatus {
  configured: boolean
  status: 'configured' | 'not_configured' | 'error'
  message: string
  lastUpdated: string
  projectId: string
}

export interface CloudSyncResult<T = unknown> {
  ok: boolean
  data: T | null
  error: string | null
}

const PROJECT_ID = 'AI_Guoman_MASTER'

export const isCloudSyncConfigured = () => getSupabaseClientState().configured

export const getCloudSyncStatus = async (): Promise<CloudSyncStatus> => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) {
    return {
      configured: false,
      status: 'not_configured',
      message: state.message,
      lastUpdated: '',
      projectId: PROJECT_ID,
    }
  }

  const { data, error } = await state.client
    .from('production_state')
    .select('updated_at')
    .eq('project_id', PROJECT_ID)
    .maybeSingle()

  if (error) {
    return {
      configured: true,
      status: 'error',
      message: error.message,
      lastUpdated: '',
      projectId: PROJECT_ID,
    }
  }

  return {
    configured: true,
    status: 'configured',
    message: data ? 'Cloud state found.' : 'Cloud configured, no state saved yet.',
    lastUpdated: data?.updated_at ?? '',
    projectId: PROJECT_ID,
  }
}

export const loadProductionDbFromCloud = async (): Promise<CloudSyncResult<CloudProductionStateRow>> => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) {
    return { ok: false, data: null, error: state.message }
  }

  const { data, error } = await state.client
    .from('production_state')
    .select('*')
    .eq('project_id', PROJECT_ID)
    .maybeSingle()

  if (error) {
    return { ok: false, data: null, error: error.message }
  }

  if (!data) {
    return { ok: false, data: null, error: 'No cloud production state found for AI_Guoman_MASTER.' }
  }

  return { ok: true, data: data as CloudProductionStateRow, error: null }
}

export const saveProductionDbToCloud = async (productionDb: ProductionDbRoot, note = ''): Promise<CloudSyncResult<CloudProductionStateRow>> => {
  const state = getSupabaseClientState()
  if (!state.configured || !state.client) {
    return { ok: false, data: null, error: state.message }
  }

  const row = {
    project_id: PROJECT_ID,
    state: productionDb,
    updated_by: 'AI Factory',
    note,
  }

  const { data, error } = await state.client
    .from('production_state')
    .upsert(row, { onConflict: 'project_id' })
    .select('*')
    .single()

  if (error) {
    return { ok: false, data: null, error: error.message }
  }

  return { ok: true, data: data as CloudProductionStateRow, error: null }
}
