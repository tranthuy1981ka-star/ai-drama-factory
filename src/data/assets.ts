import type { Asset } from '../types/production'

const storyboard25PanelUrl =
  'https://tduggeuvaqfjayjzzkan.supabase.co/storage/v1/object/sign/ai-guoman-assets/AI_Guoman_MASTER/references/storyboard/REF_storyboard_25panel_layout_v01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmFkMDE4Ni03MGY1LTQ5ZTctYWZmZC1kNWQ1NWQ3M2E2MGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhaS1ndW9tYW4tYXNzZXRzL0FJX0d1b21hbl9NQVNURVIvcmVmZXJlbmNlcy9zdG9yeWJvYXJkL1JFRl9zdG9yeWJvYXJkXzI1cGFuZWxfbGF5b3V0X3YwMS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxMjQ3OTk3LCJleHAiOjIwOTY2MDc5OTd9.RqLR1YvifX19YUPL4N3RtlMPtsJhyIrUgw1mdBzpQvk'
const darkFemaleCharacterSheetUrl =
  'https://tduggeuvaqfjayjzzkan.supabase.co/storage/v1/object/sign/ai-guoman-assets/AI_Guoman_MASTER/references/characters/REF_dark_female_character_sheet_v01.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmFkMDE4Ni03MGY1LTQ5ZTctYWZmZC1kNWQ1NWQ3M2E2MGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhaS1ndW9tYW4tYXNzZXRzL0FJX0d1b21hbl9NQVNURVIvcmVmZXJlbmNlcy9jaGFyYWN0ZXJzL1JFRl9kYXJrX2ZlbWFsZV9jaGFyYWN0ZXJfc2hlZXRfdjAxLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODEyNDc5OTgsImV4cCI6MjA5NjYwNzk5OH0.qyzb6xM4uLh6fvPziC0UvdXGwKnWfuh3B3-y8wY2x10'

const asset = (
  assetId: string,
  name: string,
  type: Asset['type'],
  description: string,
  usageNotes: string,
  overrides: Partial<Asset> = {},
): Asset => ({
  assetId,
  name,
  type,
  description,
  suggestedPath: `AI_Drama_Factory/04_Character_Refs/${name}`,
  status: 'Missing',
  googleDriveUrl: '',
  thumbnailUrl: '',
  approvedVersion: '',
  usageNotes,
  ...overrides,
})

export const assets: Asset[] = [
  asset('suli-normal-front', 'suli_normal_front.png', 'character', '蘇璃正面標準設定圖。', '所有蘇璃 shot 的主參考。'),
  asset('suli-normal-closeup', 'suli_normal_closeup.png', 'character', '蘇璃臉部近鏡參考。', '近鏡與情緒 shot 使用。'),
  asset('suli-pendant-closeup', 'suli_pendant_closeup.png', 'prop', '命線吊墜特寫。', '命線能力啟動前後使用。'),
  asset('suli-pain-expression', 'suli_pain_expression.png', 'expression', '蘇璃反噬痛楚表情。', '所有反噬 shot 必須參考。'),
  asset('suli-shocked-expression', 'suli_shocked_expression.png', 'expression', '蘇璃看見死亡倒數的震驚表情。', 'E01/E02 命線視覺使用。'),
  asset('suli-touching-fate-line', 'suli_touching_fate_line.png', 'fx', '蘇璃伸手觸碰命線動作。', '改寫命線 shot 使用。'),
  asset('test-hall-wide', 'test_hall_wide.png', 'location', '能力測試大廳廣角。', 'E01 公開測試場景。'),
  asset('test-hall-screen', 'test_hall_screen.png', 'location', '評級巨型螢幕。', 'F 級結果與倒數警報。'),
  asset('mission-corridor', 'mission_corridor.png', 'location', '異能局任務走廊。', '任務分配與警報轉場。'),
  asset('abandoned-mall', 'abandoned_mall.png', 'location', '廢棄商場外圍。', 'E02/E03 實戰場景。'),
  asset('rift-entrance', 'rift_entrance.png', 'location', '裂隙入口。', '警報與裂隙擴張 shot。'),
  asset('rift-interior', 'rift_interior.png', 'location', '裂隙內部。', 'E03 困局與核心暴露。'),
  asset('monster-core-beast', 'monster_core_beast.png', 'monster', '裂隙核心厄獸全身。', '怪物主參考。'),
  asset('monster-eye-closeup', 'monster_eye_closeup.png', 'monster', '厄獸單眼特寫。', '怪物認出蘇璃時使用。'),
  asset('han-ce-ref', 'han_ce_ref.png', 'character', '韓策角色設定圖。', '隊長指揮與受傷 shot。'),
  asset('qin-yin-ref', 'qin_yin_ref.png', 'character', '秦音角色設定圖。', 'E02 瀕死救援 shot。'),
  asset('shen-yao-ref', 'shen_yao_ref.png', 'character', '沈曜角色設定圖。', 'E03 結尾檔案更新 shot。'),
  asset('fate-line-fx', 'fate_line_fx.png', 'fx', '命線特效參考。', '所有命線視覺層。'),
  asset('backlash-fx', 'backlash_fx.png', 'fx', '反噬裂紋與冷光。', '蘇璃使用能力後的後果。'),
  asset('ref-storyboard-25panel-layout-v01', 'REF Storyboard 25 Panel Layout v01', 'reference', '25 格 storyboard layout 手動參考圖。', '只作手動 storyboard layout reference，不批准用於影片生成。', {
    suggestedPath: 'AI_Guoman_MASTER/references/storyboard/REF_storyboard_25panel_layout_v01.png',
    status: 'Approved Reference',
    googleDriveUrl: storyboard25PanelUrl,
    thumbnailUrl: storyboard25PanelUrl,
    approvedVersion: 'REF_storyboard_25panel_layout_v01.png',
    source: 'manual_reference',
    generationMethod: 'manual_reference',
    approvedForVideo: false,
    localPath: 'C:/Users/Kelvin Cheng/Documents/AI_Guoman_MASTER/05_storyboards_style_refs/REF_storyboard_25panel_layout_v01.png',
  }),
  asset('ref-dark-female-character-sheet-v01', 'REF Dark Female Character Sheet v01', 'reference', '深色女性角色設定手動參考圖。', '只作手動角色設定 reference，不批准用於影片生成。', {
    suggestedPath: 'AI_Guoman_MASTER/references/characters/REF_dark_female_character_sheet_v01.png',
    status: 'Approved Reference',
    googleDriveUrl: darkFemaleCharacterSheetUrl,
    thumbnailUrl: darkFemaleCharacterSheetUrl,
    approvedVersion: 'REF_dark_female_character_sheet_v01.png',
    source: 'manual_reference',
    generationMethod: 'manual_reference',
    approvedForVideo: false,
    localPath: 'C:/Users/Kelvin Cheng/Documents/AI_Guoman_MASTER/02_character_refs_style_refs/REF_dark_female_character_sheet_v01.png',
  }),
].map((item) =>
  item.type === 'location'
    ? { ...item, suggestedPath: `AI_Drama_Factory/05_Scene_Refs/${item.name}` }
    : item.type === 'fx'
      ? { ...item, suggestedPath: `AI_Drama_Factory/06_Keyframes/${item.name}` }
      : item,
)
