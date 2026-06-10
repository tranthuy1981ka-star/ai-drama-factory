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

export type AssetStatus = 'Missing' | 'Available' | 'Needs Update'
export type AssetType = 'character' | 'location' | 'prop' | 'monster' | 'expression' | 'fx'

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
  usageNotes: string
}

export type StatusOverrides = Record<string, ProductionStatus>
export type EpisodeStatusOverrides = Record<string, EpisodeStatus>
export type AssetStatusOverrides = Record<string, AssetStatus>
