import type { Asset } from '../types/production'

const asset = (
  assetId: string,
  name: string,
  type: Asset['type'],
  description: string,
  usageNotes: string,
): Asset => ({
  assetId,
  name,
  type,
  description,
  suggestedPath: `AI_Drama_Factory/04_Character_Refs/${name}`,
  status: 'Missing',
  usageNotes,
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
].map((item) =>
  item.type === 'location'
    ? { ...item, suggestedPath: `AI_Drama_Factory/05_Scene_Refs/${item.name}` }
    : item.type === 'fx'
      ? { ...item, suggestedPath: `AI_Drama_Factory/06_Keyframes/${item.name}` }
      : item,
)
