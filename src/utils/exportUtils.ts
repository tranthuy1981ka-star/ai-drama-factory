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

export const seedancePrompt = (shot: ShotCard) =>
  `${shot.videoPromptCN}\nSeedance 補充：5-10 秒，直式 9:16，一個清楚動作，電影感鏡頭運動，角色一致穩定，沒有字幕、浮水印或畫面文字。`

export const klingPrompt = (shot: ShotCard) =>
  `Kling 圖生片提示詞：直式 9:16。第一幀：${shot.scene}，主體為 ${shot.characters.join('、') || shot.title}。動作延續：${shot.action}。最後幀：動作完成後保持 ${shot.emotion} 的情緒。鏡頭：${shot.cameraAngle}，${shot.cameraMovement}。保持主體穩定、動作乾淨、不要複雜連續運動、不要字幕或水印。`

export const jimengPrompt = (shot: ShotCard) =>
  `即夢影片提示詞：直式 9:16，${shot.location}，${shot.scene}。畫面主體是 ${shot.characters.join('、') || shot.title}，以華語都市奇幻動畫風格呈現。${shot.action}，情緒是${shot.emotion}，冷色電影感燈光，氣氛清晰，適合用關鍵幀圖生片，保持角色外觀一致，不加入字幕或水印。`

export const promptsText = (shots: ShotCard[], field: 'imagePromptCN' | 'videoPromptCN') =>
  shots.map((shot) => `## ${shot.shotId} ${shot.title}\n${shot[field]}\n\nNegative:\n${shot.negativePromptCN}`).join('\n\n')

export const seedancePromptsText = (shots: ShotCard[]) =>
  shots.map((shot) => `## ${shot.shotId} ${shot.title}\n${seedancePrompt(shot)}\n\nNegative:\n${shot.negativePromptCN}`).join('\n\n')

export const assetsMarkdown = (assets: Asset[]) =>
  `# Asset Library\n\n${assets
    .map(
      (asset) => `## ${asset.name}
- ID：${asset.assetId}
- 類型：${asset.type}
- 狀態：${asset.status}
- 描述：${asset.description}
- 建議路徑：${asset.suggestedPath}
- Google Drive：${asset.googleDriveUrl || '未設定'}
- Thumbnail：${asset.thumbnailUrl || '未設定'}
- Approved Version：${asset.approvedVersion || '未設定'}
- 使用備註：${asset.usageNotes}`,
    )
    .join('\n\n')}`
