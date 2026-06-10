import type { AssetStatus, AssetStatusOverrides, EpisodeStatus, EpisodeStatusOverrides, ProductionStatus, StatusOverrides } from '../types/production'

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const writeJson = <T>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export const STORAGE_KEYS = {
  shots: 'ai-drama-factory-shot-status',
  beats: 'ai-drama-factory-beat-status',
  episodes: 'ai-drama-factory-episode-status',
  assets: 'ai-drama-factory-asset-status',
}

export const loadShotStatuses = (): StatusOverrides => readJson(STORAGE_KEYS.shots, {})
export const saveShotStatuses = (statuses: StatusOverrides) => writeJson(STORAGE_KEYS.shots, statuses)

export const loadBeatStatuses = (): StatusOverrides => readJson(STORAGE_KEYS.beats, {})
export const saveBeatStatuses = (statuses: StatusOverrides) => writeJson(STORAGE_KEYS.beats, statuses)

export const loadEpisodeStatuses = (): EpisodeStatusOverrides => readJson(STORAGE_KEYS.episodes, {})
export const saveEpisodeStatuses = (statuses: EpisodeStatusOverrides) => writeJson(STORAGE_KEYS.episodes, statuses)

export const loadAssetStatuses = (): AssetStatusOverrides => readJson(STORAGE_KEYS.assets, {})
export const saveAssetStatuses = (statuses: AssetStatusOverrides) => writeJson(STORAGE_KEYS.assets, statuses)

export const setShotStatus = (shotId: string, status: ProductionStatus) => {
  const next = { ...loadShotStatuses(), [shotId]: status }
  saveShotStatuses(next)
  return next
}

export const setBeatStatus = (beatId: string, status: ProductionStatus) => {
  const next = { ...loadBeatStatuses(), [beatId]: status }
  saveBeatStatuses(next)
  return next
}

export const setEpisodeStatus = (episodeId: string, status: EpisodeStatus) => {
  const next = { ...loadEpisodeStatuses(), [episodeId]: status }
  saveEpisodeStatuses(next)
  return next
}

export const setAssetStatus = (assetId: string, status: AssetStatus) => {
  const next = { ...loadAssetStatuses(), [assetId]: status }
  saveAssetStatuses(next)
  return next
}
