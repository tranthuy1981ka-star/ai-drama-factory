import type {
  AssetMetadata,
  AssetStatus,
  AssetStatusOverrides,
  EpisodeStatus,
  EpisodeStatusOverrides,
  ProductionStatus,
  ProjectStateExport,
  ShotVersion,
  StatusOverrides,
} from '../types/production'

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
  assetMetadata: 'ai-drama-factory-asset-metadata',
  shotVersions: 'ai-drama-factory-shot-version-history',
}

export const loadShotStatuses = (): StatusOverrides => readJson(STORAGE_KEYS.shots, {})
export const saveShotStatuses = (statuses: StatusOverrides) => writeJson(STORAGE_KEYS.shots, statuses)

export const loadBeatStatuses = (): StatusOverrides => readJson(STORAGE_KEYS.beats, {})
export const saveBeatStatuses = (statuses: StatusOverrides) => writeJson(STORAGE_KEYS.beats, statuses)

export const loadEpisodeStatuses = (): EpisodeStatusOverrides => readJson(STORAGE_KEYS.episodes, {})
export const saveEpisodeStatuses = (statuses: EpisodeStatusOverrides) => writeJson(STORAGE_KEYS.episodes, statuses)

export const loadAssetStatuses = (): AssetStatusOverrides => readJson(STORAGE_KEYS.assets, {})
export const saveAssetStatuses = (statuses: AssetStatusOverrides) => writeJson(STORAGE_KEYS.assets, statuses)

export const loadAssetMetadata = (): Record<string, AssetMetadata> => readJson(STORAGE_KEYS.assetMetadata, {})
export const saveAssetMetadata = (metadata: Record<string, AssetMetadata>) => writeJson(STORAGE_KEYS.assetMetadata, metadata)

export const loadShotVersions = (): Record<string, ShotVersion[]> => readJson(STORAGE_KEYS.shotVersions, {})
export const saveShotVersions = (versions: Record<string, ShotVersion[]>) => writeJson(STORAGE_KEYS.shotVersions, versions)

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

export const createProjectStateExport = (): ProjectStateExport => ({
  schemaVersion: '0.1.1',
  exportedAt: new Date().toISOString(),
  shotStatusOverrides: loadShotStatuses(),
  episodeStatusOverrides: loadEpisodeStatuses(),
  beatStatusOverrides: loadBeatStatuses(),
  assetStatusOverrides: loadAssetStatuses(),
  assetMetadata: loadAssetMetadata(),
  shotVersionHistory: loadShotVersions(),
})

export const restoreProjectState = (state: ProjectStateExport) => {
  saveShotStatuses(state.shotStatusOverrides ?? {})
  saveEpisodeStatuses(state.episodeStatusOverrides ?? {})
  saveBeatStatuses(state.beatStatusOverrides ?? {})
  saveAssetStatuses(state.assetStatusOverrides ?? {})
  saveAssetMetadata(state.assetMetadata ?? {})
  saveShotVersions(state.shotVersionHistory ?? {})
}
