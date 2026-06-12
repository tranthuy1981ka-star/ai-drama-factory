import type {
  Asset,
  AssetMetadata,
  AssetStatus,
  Episode,
  EpisodeStatusOverrides,
  ProductionStatus,
  ShotCard,
  ShotVersion,
  StatusOverrides,
} from '../types/production'
import { loadAssetMetadata, loadAssetStatuses, loadBeatStatuses, loadEpisodeStatuses, loadShotStatuses, loadShotVersions } from './storage'

export type MasterStatus = 'pending' | 'approved' | 'rejected' | 'retake' | 'needs_edit' | 'selected' | 'archived'
export type PromptType = 'image_prompt' | 'video_prompt' | 'storyboard_prompt' | 'motion_prompt' | 'negative_prompt'

export interface ProductionDbRoot {
  project: 'AI_Guoman_MASTER'
  version: '0.1'
  lastUpdated: string
  sourceApps: {
    storyStudio: string
    approvalWeb: string | null
    assetPipeline: string | null
  }
  episodes: ProductionEpisode[]
  scenes: ProductionScene[]
  clips: ProductionClip[]
  assets: ProductionAsset[]
  prompts: ProductionPrompt[]
  reviews: ProductionReview[]
  productionLog: ProductionLogEntry[]
  metadata?: Record<string, unknown>
  raw?: unknown
}

export interface ProductionEpisode {
  id: string
  title: string
  status: MasterStatus
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
  raw: unknown
}

export interface ProductionScene {
  id: string
  episode: string
  title: string
  description: string
  status: MasterStatus
  metadata: Record<string, unknown>
  raw: unknown
}

export interface ProductionClip {
  id: string
  episode: string
  scene: string
  clip_id: string
  shot_id: string
  title: string
  description: string
  duration: number
  status: MasterStatus
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
  raw: unknown
}

export interface ProductionAsset {
  id: string
  type: string
  episode: string
  scene: string
  clip_id: string
  shot_id: string
  title: string
  description: string
  local_path: string
  relative_path: string
  cloud_url: string
  thumbnail_url: string
  status: MasterStatus
  source: 'ai_factory' | 'codex_imagegen' | 'manual' | 'manual_reference' | 'runninghub' | 'seedance' | 'jimeng' | 'unknown'
  generation_method: 'manual' | 'manual_reference' | 'codex_imagegen' | 'runninghub' | 'seedance' | 'unknown'
  prompt_file: string
  batch_id: string
  approved_for_video: boolean
  created_at: string
  updated_at: string
  review_notes: string
  tags: string[]
  metadata: Record<string, unknown>
  raw: unknown
}

export interface ProductionPrompt {
  id: string
  type: PromptType
  episode: string
  scene: string
  clip_id: string
  shot_id: string
  title: string
  content: string
  negative_prompt: string
  status: MasterStatus
  source: 'ai_factory' | 'unknown'
  created_at: string
  updated_at: string
  tags: string[]
  metadata: Record<string, unknown>
  raw: unknown
}

export interface ProductionReview {
  id: string
  target_type: 'asset' | 'clip' | 'prompt' | 'storyboard' | 'video'
  target_id: string
  decision: 'approve' | 'reject' | 'retake' | 'needs_edit' | 'selected'
  notes: string
  reviewer: string
  created_at: string
  metadata: Record<string, unknown>
  raw: unknown
}

export interface ProductionLogEntry {
  id: string
  date: string
  event: string
  source: string
  target_type: string
  target_id: string
  notes: string
  metadata: Record<string, unknown>
}

export interface ProductionDbImportResult {
  shotStatusOverrides: StatusOverrides
  episodeStatusOverrides: EpisodeStatusOverrides
  beatStatusOverrides: StatusOverrides
  assetStatusOverrides: Record<string, AssetStatus>
  assetMetadata: Record<string, AssetMetadata>
  shotVersionHistory: Record<string, ShotVersion[]>
  raw: ProductionDbRoot
}

export interface ProductionDbSummary {
  episodes: number
  assets: number
  prompts: number
  pending: number
  approved: number
  rejected: number
  retake: number
  needsEdit: number
}

const nowIso = () => new Date().toISOString()

export const normalizeStatus = (status: string | undefined): MasterStatus => {
  switch (status) {
    case 'Final Approved':
    case 'Storyboard Approved':
    case 'Beat Approved':
    case 'Outline Approved':
    case 'Concept Approved':
    case 'Approved Reference':
    case 'Approved':
    case 'Generated':
      return 'approved'
    case 'Needs Revision':
    case 'Needs Update':
      return 'needs_edit'
    case 'Rejected':
      return 'rejected'
    case 'Retake':
      return 'retake'
    case 'Video Prompt Ready':
    case 'Image Prompt Ready':
    case 'Prompt Ready':
    case 'Storyboard In Progress':
    case 'In Generation':
    case 'Available':
    case 'Maybe':
    case 'Draft':
    case 'Concept Draft':
    case 'Missing':
    default:
      return 'pending'
  }
}

export const masterStatusToShotStatus = (status: string | undefined): ProductionStatus => {
  switch (status) {
    case 'approved':
    case 'selected':
      return 'Final Approved'
    case 'rejected':
    case 'retake':
    case 'needs_edit':
      return 'Needs Revision'
    case 'archived':
    case 'pending':
    default:
      return 'Draft'
  }
}

export const masterStatusToAssetStatus = (status: string | undefined): AssetStatus => {
  switch (status) {
    case 'approved':
    case 'selected':
      return 'Approved Reference'
    case 'needs_edit':
    case 'retake':
      return 'Needs Update'
    case 'rejected':
    case 'archived':
    case 'pending':
    default:
      return 'Missing'
  }
}

export const mapAiFactoryEpisodeToProductionEpisode = (episode: Episode, statusOverride?: string): ProductionEpisode => ({
  id: episode.episodeId,
  title: episode.title,
  status: normalizeStatus(statusOverride ?? episode.status),
  created_at: '',
  updated_at: nowIso(),
  metadata: {
    conceptSummary: episode.conceptSummary,
    openingHook: episode.openingHook,
    endingHook: episode.endingHook,
    beatCount: episode.beats.length,
  },
  raw: episode,
})

export const mapAiFactoryShotToProductionClip = (shot: ShotCard, statusOverride?: string): ProductionClip => ({
  id: shot.shotId,
  episode: shot.episodeId,
  scene: shot.scene,
  clip_id: shot.shotId,
  shot_id: shot.shotId,
  title: shot.title,
  description: shot.action,
  duration: shot.durationSeconds,
  status: normalizeStatus(statusOverride ?? shot.status),
  created_at: '',
  updated_at: nowIso(),
  metadata: {
    productionStage: shot.productionStage,
    location: shot.location,
    characters: shot.characters,
    cameraAngle: shot.cameraAngle,
    cameraMovement: shot.cameraMovement,
    emotion: shot.emotion,
    storyPurpose: shot.storyPurpose,
    referenceAssets: shot.referenceAssets,
    directorNote: shot.directorNote,
  },
  raw: shot,
})

export const mapAiFactoryAssetToProductionAsset = (asset: Asset, statusOverride?: string): ProductionAsset => ({
  id: asset.assetId,
  type: asset.type,
  episode: '',
  scene: '',
  clip_id: '',
  shot_id: '',
  title: asset.name,
  description: asset.description,
  local_path: asset.localPath ?? '',
  relative_path: asset.suggestedPath,
  cloud_url: asset.googleDriveUrl,
  thumbnail_url: asset.thumbnailUrl,
  status: normalizeStatus(statusOverride ?? asset.status),
  source: asset.source ?? 'ai_factory',
  generation_method: asset.generationMethod ?? 'manual',
  prompt_file: '',
  batch_id: '',
  approved_for_video: asset.approvedForVideo ?? normalizeStatus(statusOverride ?? asset.status) === 'approved',
  created_at: '',
  updated_at: nowIso(),
  review_notes: asset.usageNotes,
  tags: [asset.type],
  metadata: {
    approvedVersion: asset.approvedVersion,
    suggestedPath: asset.suggestedPath,
  },
  raw: asset,
})

export const mapAiFactoryPromptToProductionPrompt = (shot: ShotCard, type: PromptType): ProductionPrompt => {
  const contentByType: Record<PromptType, string> = {
    image_prompt: shot.imagePromptCN,
    video_prompt: shot.videoPromptCN,
    negative_prompt: shot.negativePromptCN,
    storyboard_prompt: `${shot.cameraAngle}；${shot.cameraMovement}；${shot.action}`,
    motion_prompt: shot.action,
  }
  return {
    id: `${shot.shotId}_${type}`,
    type,
    episode: shot.episodeId,
    scene: shot.scene,
    clip_id: shot.shotId,
    shot_id: shot.shotId,
    title: `${shot.shotId} ${type}`,
    content: contentByType[type],
    negative_prompt: shot.negativePromptCN,
    status: normalizeStatus(shot.status),
    source: 'ai_factory',
    created_at: '',
    updated_at: nowIso(),
    tags: [shot.episodeId, shot.shotId, type],
    metadata: {
      referenceAssets: shot.referenceAssets,
    },
    raw: shot,
  }
}

export const exportProductionDb = (input: { episodes: Episode[]; shotCards: ShotCard[]; assets: Asset[] }): ProductionDbRoot => {
  const shotStatusOverrides = loadShotStatuses()
  const episodeStatusOverrides = loadEpisodeStatuses()
  const assetStatusOverrides = loadAssetStatuses()
  const assetMetadata = loadAssetMetadata()
  const shotVersions = loadShotVersions()
  const timestamp = nowIso()

  const assetsFromLibrary = input.assets.map((asset) => {
    const metadata = assetMetadata[asset.assetId]
    return mapAiFactoryAssetToProductionAsset(
      {
        ...asset,
        googleDriveUrl: metadata?.googleDriveUrl ?? asset.googleDriveUrl,
        thumbnailUrl: metadata?.thumbnailUrl ?? asset.thumbnailUrl,
        approvedVersion: metadata?.approvedVersion ?? asset.approvedVersion,
        usageNotes: metadata?.usageNotes ?? asset.usageNotes,
      },
      assetStatusOverrides[asset.assetId],
    )
  })

  const generatedAssets: ProductionAsset[] = Object.entries(shotVersions).flatMap(([shotId, versions]) =>
    versions.map((version) => ({
      id: version.versionId,
      type: 'video',
      episode: shotId.slice(0, 3),
      scene: '',
      clip_id: shotId,
      shot_id: shotId,
      title: version.versionId,
      description: version.issueNotes,
      local_path: '',
      relative_path: '',
      cloud_url: version.fileUrl,
      thumbnail_url: '',
      status: normalizeStatus(version.resultStatus),
      source: version.modelUsed === 'Seedance' ? 'seedance' : version.modelUsed === 'Jimeng' ? 'jimeng' : 'unknown',
      generation_method: version.modelUsed === 'Seedance' ? 'seedance' : 'unknown',
      prompt_file: '',
      batch_id: '',
      approved_for_video: normalizeStatus(version.resultStatus) === 'approved',
      created_at: version.createdAt,
      updated_at: version.createdAt,
      review_notes: version.issueNotes,
      tags: [version.modelUsed, shotId],
      metadata: { modelUsed: version.modelUsed },
      raw: version,
    })),
  )

  return {
    project: 'AI_Guoman_MASTER',
    version: '0.1',
    lastUpdated: timestamp,
    sourceApps: {
      storyStudio: 'AI Factory',
      approvalWeb: null,
      assetPipeline: null,
    },
    episodes: input.episodes.map((episode) => mapAiFactoryEpisodeToProductionEpisode(episode, episodeStatusOverrides[episode.episodeId])),
    scenes: Array.from(new Set(input.shotCards.map((shot) => `${shot.episodeId}:${shot.scene}`))).map((key) => {
      const [episode, title] = key.split(':')
      return {
        id: key,
        episode,
        title,
        description: title,
        status: 'pending',
        metadata: {},
        raw: { episode, title },
      }
    }),
    clips: input.shotCards.map((shot) => mapAiFactoryShotToProductionClip(shot, shotStatusOverrides[shot.shotId])),
    assets: [...assetsFromLibrary, ...generatedAssets],
    prompts: input.shotCards.flatMap((shot) => [
      mapAiFactoryPromptToProductionPrompt(shot, 'image_prompt'),
      mapAiFactoryPromptToProductionPrompt(shot, 'video_prompt'),
      mapAiFactoryPromptToProductionPrompt(shot, 'negative_prompt'),
    ]),
    reviews: Object.entries(shotVersions).flatMap(([shotId, versions]) =>
      versions.map((version) => ({
        id: `${version.versionId}_review`,
        target_type: 'video',
        target_id: version.versionId,
        decision: normalizeStatus(version.resultStatus) === 'approved' ? 'approve' : normalizeStatus(version.resultStatus) === 'rejected' ? 'reject' : 'needs_edit',
        notes: version.issueNotes,
        reviewer: 'Kelvin',
        created_at: version.createdAt,
        metadata: { shotId },
        raw: version,
      })),
    ),
    productionLog: [
      {
        id: `export_${timestamp}`,
        date: timestamp,
        event: 'Exported production_db.json from AI Factory',
        source: 'ai_factory',
        target_type: 'project',
        target_id: 'AI_Guoman_MASTER',
        notes: 'Browser export generated by productionDbAdapter.ts',
        metadata: {
          beatStatusOverrides: loadBeatStatuses(),
        },
      },
    ],
    metadata: {
      shotStatusOverrides,
      episodeStatusOverrides,
      beatStatusOverrides: loadBeatStatuses(),
      assetStatusOverrides,
      assetMetadata,
      shotVersionHistory: shotVersions,
    },
  }
}

export const summarizeProductionDb = (db: ProductionDbRoot): ProductionDbSummary => {
  const statuses = [...(db.assets ?? []), ...(db.prompts ?? []), ...(db.clips ?? [])].map((item) => item.status)
  return {
    episodes: db.episodes?.length ?? 0,
    assets: db.assets?.length ?? 0,
    prompts: db.prompts?.length ?? 0,
    pending: statuses.filter((status) => status === 'pending').length,
    approved: statuses.filter((status) => status === 'approved' || status === 'selected').length,
    rejected: statuses.filter((status) => status === 'rejected').length,
    retake: statuses.filter((status) => status === 'retake').length,
    needsEdit: statuses.filter((status) => status === 'needs_edit').length,
  }
}

export const importProductionDb = (json: unknown): ProductionDbImportResult => {
  const db = json as ProductionDbRoot
  const shotStatusOverrides: StatusOverrides = {}
  const episodeStatusOverrides: EpisodeStatusOverrides = {}
  const assetStatusOverrides: Record<string, AssetStatus> = {}
  const assetMetadata: Record<string, AssetMetadata> = {}
  const shotVersionHistory: Record<string, ShotVersion[]> = {}

  for (const episode of db.episodes ?? []) {
    episodeStatusOverrides[episode.id] = episode.status === 'approved' ? 'Concept Approved' : 'Concept Draft'
  }
  for (const clip of db.clips ?? []) {
    if (clip.shot_id) shotStatusOverrides[clip.shot_id] = masterStatusToShotStatus(clip.status)
  }
  for (const asset of db.assets ?? []) {
    if (asset.id && asset.source === 'ai_factory') {
      assetStatusOverrides[asset.id] = masterStatusToAssetStatus(asset.status)
      assetMetadata[asset.id] = {
        googleDriveUrl: asset.cloud_url ?? '',
        thumbnailUrl: asset.thumbnail_url ?? '',
        approvedVersion: String(asset.metadata?.approvedVersion ?? ''),
        usageNotes: asset.review_notes ?? '',
      }
    }
    if (asset.shot_id && asset.cloud_url && asset.type === 'video') {
      const version: ShotVersion = {
        versionId: asset.id,
        modelUsed: asset.source === 'seedance' ? 'Seedance' : asset.source === 'jimeng' ? 'Jimeng' : 'Other',
        fileUrl: asset.cloud_url,
        resultStatus: asset.status === 'approved' || asset.status === 'selected' ? 'Approved' : asset.status === 'rejected' ? 'Rejected' : 'Maybe',
        issueNotes: asset.review_notes ?? '',
        createdAt: asset.created_at || nowIso(),
      }
      shotVersionHistory[asset.shot_id] = [...(shotVersionHistory[asset.shot_id] ?? []), version]
    }
  }

  const metadata = db.metadata as Partial<ProductionDbImportResult> | undefined
  return {
    shotStatusOverrides: { ...(metadata?.shotStatusOverrides ?? {}), ...shotStatusOverrides },
    episodeStatusOverrides: { ...(metadata?.episodeStatusOverrides ?? {}), ...episodeStatusOverrides },
    beatStatusOverrides: (metadata?.beatStatusOverrides as StatusOverrides | undefined) ?? {},
    assetStatusOverrides: { ...(metadata?.assetStatusOverrides ?? {}), ...assetStatusOverrides },
    assetMetadata: { ...(metadata?.assetMetadata ?? {}), ...assetMetadata },
    shotVersionHistory: { ...(metadata?.shotVersionHistory ?? {}), ...shotVersionHistory },
    raw: db,
  }
}
