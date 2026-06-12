export type ProductionStatus =
  | 'Draft'
  | 'Outline Approved'
  | 'Beat Approved'
  | 'Storyboard Approved'
  | 'Needs Revision'
  | 'Image Prompt Ready'
  | 'Video Prompt Ready'
  | 'Generated'
  | 'Final Approved'

export type EpisodeStatus =
  | 'Concept Draft'
  | 'Concept Approved'
  | 'Beat Sheet Approved'
  | 'Storyboard In Progress'
  | 'Storyboard Approved'
  | 'Prompt Ready'
  | 'In Generation'
  | 'Final Approved'

export type AssetStatus = 'Missing' | 'Available' | 'Needs Update' | 'Approved Reference'
export type AssetType = 'character' | 'location' | 'prop' | 'monster' | 'expression' | 'fx' | 'reference'
export type ModelUsed = 'Seedance' | 'Kling' | 'Jimeng' | 'Other'
export type ResultStatus = 'Approved' | 'Rejected' | 'Maybe'

export interface Location {
  id: string
  name: string
  description: string
  purpose: string
}

export interface ProjectBible {
  title: string
  genre: string
  format: string
  creativePositioning: string[]
  worldSetting: string
  corePower: string
  visualMotifs: string[]
  locations: Location[]
  monsterRules: string[]
  productionRules: string[]
  driveStructure: string[]
  fileNaming: string[]
}

export interface Character {
  id: string
  name: string
  role: string
  personality: string
  appearance: string
  consistencyRules: string[]
  storyFunction: string
  promptNotes: string
}

export interface Beat {
  episodeId: string
  beatNumber: number
  title: string
  storyEvent: string
  emotionalPurpose: string
  visualOpportunity: string
  status: ProductionStatus
}

export interface Episode {
  episodeId: string
  title: string
  status: EpisodeStatus
  conceptSummary: string
  openingHook: string
  endingHook: string
  beats: Beat[]
}

export interface ShotCard {
  episodeId: string
  shotId: string
  order: number
  title: string
  durationSeconds: number
  productionStage: string
  scene: string
  location: string
  characters: string[]
  cameraAngle: string
  cameraMovement: string
  action: string
  emotion: string
  dialogueDraft: string
  narrationDraft: string
  storyPurpose: string
  visualStyle: string
  referenceAssets: string[]
  imagePromptCN: string
  videoPromptCN: string
  negativePromptCN: string
  directorNote: string
  status: ProductionStatus
}

export interface Asset {
  assetId: string
  name: string
  type: AssetType
  description: string
  suggestedPath: string
  status: AssetStatus
  googleDriveUrl: string
  thumbnailUrl: string
  approvedVersion: string
  usageNotes: string
  source?: 'ai_factory' | 'manual_reference'
  generationMethod?: 'manual' | 'manual_reference'
  approvedForVideo?: boolean
  localPath?: string
}

export interface AssetMetadata {
  googleDriveUrl: string
  thumbnailUrl: string
  approvedVersion: string
  usageNotes: string
}

export interface ShotVersion {
  versionId: string
  modelUsed: ModelUsed
  fileUrl: string
  resultStatus: ResultStatus
  issueNotes: string
  createdAt: string
}

export interface ProjectStateExport {
  schemaVersion: '0.1.1'
  exportedAt: string
  shotStatusOverrides: StatusOverrides
  episodeStatusOverrides: EpisodeStatusOverrides
  beatStatusOverrides: StatusOverrides
  assetStatusOverrides: AssetStatusOverrides
  assetMetadata: Record<string, AssetMetadata>
  shotVersionHistory: Record<string, ShotVersion[]>
}

export type StatusOverrides = Record<string, ProductionStatus>
export type EpisodeStatusOverrides = Record<string, EpisodeStatus>
export type AssetStatusOverrides = Record<string, AssetStatus>
