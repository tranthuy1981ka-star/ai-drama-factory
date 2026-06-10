import type { Asset, Episode, ProjectBible, ShotCard } from '../types/production'

export const downloadTextFile = (fileName: string, content: string, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const projectBibleMarkdown = (bible: ProjectBible) => `# ${bible.title}

## 類型
${bible.genre}

## 格式
${bible.format}

## 創作定位
${bible.creativePositioning.map((item) => `- ${item}`).join('\n')}

## 世界觀
${bible.worldSetting}

## 核心能力
${bible.corePower}

## 視覺母題
${bible.visualMotifs.map((item) => `- ${item}`).join('\n')}

## 地點
${bible.locations.map((location) => `### ${location.name}\n${location.description}\n\n用途：${location.purpose}`).join('\n\n')}

## 怪物規則
${bible.monsterRules.map((item) => `- ${item}`).join('\n')}

## 製作規則
${bible.productionRules.map((item) => `- ${item}`).join('\n')}
`

export const episodeConceptsMarkdown = (episodes: Episode[]) =>
  episodes
    .map(
      (episode) => `# ${episode.episodeId} ${episode.title}

狀態：${episode.status}

## 概念
${episode.conceptSummary}

## 開場 Hook
${episode.openingHook}

## 結尾 Hook
${episode.endingHook}
`,
    )
    .join('\n---\n')

export const beatSheetsMarkdown = (episodes: Episode[]) =>
  episodes
    .map(
      (episode) => `# ${episode.episodeId} ${episode.title}

${episode.beats
  .map(
    (beat) => `## Beat ${beat.beatNumber}: ${beat.title}
- 事件：${beat.storyEvent}
- 情緒目的：${beat.emotionalPurpose}
- 視覺機會：${beat.visualOpportunity}
- 狀態：${beat.status}`,
  )
  .join('\n\n')}
`,
    )
    .join('\n---\n')

export const promptsText = (shots: ShotCard[], field: 'imagePromptCN' | 'videoPromptCN') =>
  shots.map((shot) => `## ${shot.shotId} ${shot.title}\n${shot[field]}\n\nNegative:\n${shot.negativePromptCN}`).join('\n\n')

export const assetsMarkdown = (assets: Asset[]) =>
  `# Asset Library\n\n${assets
    .map(
      (asset) => `## ${asset.name}
- ID：${asset.assetId}
- 類型：${asset.type}
- 狀態：${asset.status}
- 描述：${asset.description}
- 建議路徑：${asset.suggestedPath}
- 使用備註：${asset.usageNotes}`,
    )
    .join('\n\n')}`
