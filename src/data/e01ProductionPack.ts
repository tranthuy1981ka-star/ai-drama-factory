export const e01First3RequiredAssets = [
  'suli_normal_front_v01.png',
  'suli_normal_closeup_v01.png',
  'suli_pendant_closeup_v01.png',
  'test_hall_wide_v01.png',
  'test_hall_screen_v01.png',
  'fate_line_fx_v01.png',
]

export const e01First3NegativePrompt =
  '角色走樣、髮型錯誤、吊墜消失、古裝、歐美臉、Q版、幼態化、過度性感化、低清、手指畸形、面部崩壞、多餘人物、字幕、水印、logo、低質動畫、畫面閃爍、肢體錯位、背景融化、鏡頭混亂。'

export const e01First3KeyframePrompts = [
  {
    id: 'KF_REF_SULI_FRONT',
    title: '蘇璃正面角色參考圖',
    prompt:
      '直式 9:16，華語都市奇幻動畫風格，電影感冷色調。蘇璃正面角色設定圖，黑長髮，淺灰藍瞳，白色短外套，深色戰術裙褲，頸間銀色命線吊墜，冷靜壓抑表情，站姿自然，乾淨全身構圖，柔和冷白主光，淡幽藍邊光，背景簡潔，不要字幕或文字。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    id: 'KF_REF_SULI_CLOSEUP',
    title: '蘇璃 close-up 角色參考圖',
    prompt:
      '直式 9:16，華語都市奇幻動畫風格，電影感冷色調。蘇璃臉部 close-up 角色參考，黑長髮自然垂落，淺灰藍瞳清晰，神情冷靜但有被壓抑的痛感，白色外套領口和銀色吊墜上緣入鏡，冷白光照亮臉部，幽藍反光在瞳孔中，構圖乾淨，不要字幕或文字。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    id: 'KF_REF_SULI_PENDANT',
    title: '蘇璃握住銀色吊墜 close-up',
    prompt:
      '直式 9:16，華語都市奇幻動畫風格，電影感冷色調。蘇璃低頭，手指輕握頸間銀色命線吊墜，吊墜微微發出幽藍冷光，畫面以手、吊墜、下半張臉為主體，黑長髮落在肩側，情緒克制不安，背景是模糊的測試大廳冷光，清晰細節，不要字幕或文字。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    id: 'KF_REF_TEST_HALL_WIDE',
    title: '覺醒測試大廳 wide shot',
    prompt:
      '直式 9:16，華語都市奇幻動畫風格，電影感冷色調。現代能力覺醒測試大廳 wide shot，玻璃穹頂，白色測試台，巨型評級屏幕，高冷金屬牆面，圍觀人群形成壓迫感，蘇璃站在中央測試台上，人物細小但清楚，冷白燈光和幽藍科技光，構圖有舞台感，不要字幕或水印。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    id: 'KF_REF_RANK_SCREEN',
    title: '巨型評級屏幕顯示「蘇璃，F級」',
    prompt:
      '直式 9:16，華語都市奇幻動畫風格，電影感冷色調。能力測試大廳的巨型評級屏幕特寫，屏幕冷白光亮起，清楚顯示「蘇璃，F級」，屏幕下方有蘇璃孤立站在測試台上的小身影，周圍人群陰影壓迫，畫面乾淨，文字只保留屏幕評級內容，不加其他字幕。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    id: 'KF_REF_FATE_LINE_FX',
    title: '銀藍命線 FX reference',
    prompt:
      '直式 9:16，華語都市奇幻動畫風格，電影感冷色調。銀藍命線 FX reference，細如玻璃纖維的光線在空氣中交錯，冷白與幽藍光點流動，線條有命運分支感和因果連接感，背景深灰模糊，光線清晰可作特效參考，不要角色，不要字幕，不要水印。',
    negativePrompt: e01First3NegativePrompt,
  },
]

export const e01First3SeedancePrompts = [
  {
    shotId: 'E01_S001',
    title: '巨型屏幕亮起「蘇璃，F級」',
    prompt:
      'Seedance 影片提示詞，時長 6 秒，直式 9:16，華語都市奇幻動畫風格，電影感冷色調。主體是現代能力覺醒測試大廳的巨型評級屏幕，屏幕由暗轉亮，清楚顯示「蘇璃，F級」，蘇璃站在下方白色測試台中央，黑長髮、淺灰藍瞳、白色短外套、深色戰術裙褲、頸間銀色命線吊墜。單一動作：巨型屏幕亮起並完成評級顯示。鏡頭由蘇璃背後緩慢推向屏幕，冷白燈光，幽藍科技反光，壓迫感強。不要把對白字幕燒入畫面，除屏幕評級文字外不要其他文字，不要 logo，不要水印。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    shotId: 'E01_S002',
    title: '全場沉默後爆笑，羞辱壓力爆發',
    prompt:
      'Seedance 影片提示詞，時長 7 秒，直式 9:16，華語都市奇幻動畫風格，電影感冷色調。主體是能力覺醒測試大廳內的圍觀人群與中央的蘇璃。蘇璃保持黑長髮、淺灰藍瞳、白色短外套、深色戰術裙褲、頸間銀色命線吊墜，表情冷靜壓抑。單一動作：全場短暫沉默後，人群同時爆出嘲笑，蘇璃站在中央不動。鏡頭從人群側面橫向滑移，最後停在蘇璃側臉，冷白燈光，幽藍屏幕反光，羞辱壓力清楚。不要字幕，不要 logo，不要水印，不要複雜打鬥。',
    negativePrompt: e01First3NegativePrompt,
  },
  {
    shotId: 'E01_S003',
    title: '蘇璃低頭握住銀色吊墜，吊墜微微發光',
    prompt:
      'Seedance 影片提示詞，時長 6 秒，直式 9:16，華語都市奇幻動畫風格，電影感冷色調。主體是蘇璃的上半身與銀色命線吊墜，蘇璃黑長髮、淺灰藍瞳、白色短外套、深色戰術裙褲，表情克制不安。單一動作：蘇璃低頭，用手輕握頸間銀色吊墜，吊墜微微亮起幽藍冷光。鏡頭由胸口吊墜 close-up 緩慢推近到蘇璃下半張臉，背景是模糊測試大廳冷光，動作穩定細膩。不要字幕，不要 logo，不要水印，不要多餘人物搶畫面。',
    negativePrompt: e01First3NegativePrompt,
  },
]

export const e01First3Checklist = [
  {
    shotId: 'E01_S001',
    action: '巨型屏幕亮起「蘇璃，F級」',
    requiredAssets: e01First3RequiredAssets,
  },
  {
    shotId: 'E01_S002',
    action: '全場沉默後爆笑，羞辱壓力爆發',
    requiredAssets: e01First3RequiredAssets,
  },
  {
    shotId: 'E01_S003',
    action: '蘇璃低頭握住銀色吊墜，吊墜微微發光',
    requiredAssets: e01First3RequiredAssets,
  },
]
