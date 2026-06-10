import type { Beat, Episode, ProductionStatus, ShotCard } from '../types/production'

const negativePromptCN =
  '低質素、變形手指、錯誤肢體、臉部崩壞、眼睛歪斜、重複角色、角色髮色錯誤、服裝不一致、過度曝光、模糊、雜訊、字幕、浮水印、logo、文字亂碼、血腥過量、色情、Q 版、卡通過度簡化、鏡頭劇烈搖晃、多人動作混亂。'

const suliRules =
  '蘇璃角色一致性：黑長髮、淺灰藍瞳、白色短外套、深色戰術裙褲、頸間命線吊墜，冷靜壓抑表情，不可改髮色不可 Q 版。'

const beat = (
  episodeId: string,
  beatNumber: number,
  title: string,
  storyEvent: string,
  emotionalPurpose: string,
  visualOpportunity: string,
): Beat => ({
  episodeId,
  beatNumber,
  title,
  storyEvent,
  emotionalPurpose,
  visualOpportunity,
  status: 'Draft',
})

const prompt = (subject: string, scene: string, emotion: string, extra = '') =>
  `直式 9:16，華語都市奇幻動畫風格，電影感冷色調，${subject}，${scene}，情緒：${emotion}，冷白與幽藍光源，清晰構圖，角色比例自然，細節精緻，沒有字幕或畫面文字。${extra}`

const videoPrompt = (duration: number, subject: string, action: string, camera: string, mood: string, extra = '') =>
  `時長 ${duration} 秒，直式 9:16，Seedance/Kling/Jimeng 影片提示詞。主體：${subject}。單一動作：${action}。鏡頭：${camera}。燈光：冷白主光與幽藍裂隙邊光。氣氛：${mood}。保持角色與場景視覺一致，不要複雜連續動作，不要把對白文字燒入畫面。${extra}`

const shot = (
  episodeId: string,
  order: number,
  title: string,
  durationSeconds: number,
  scene: string,
  location: string,
  characters: string[],
  cameraAngle: string,
  cameraMovement: string,
  action: string,
  emotion: string,
  storyPurpose: string,
  referenceAssets: string[],
  dialogueDraft = '',
  narrationDraft = '',
  directorNote = '',
): ShotCard => {
  const shotId = `${episodeId}_S${String(order).padStart(3, '0')}`
  const hasSuli = characters.includes('蘇璃')
  const subject = characters.length ? characters.join('、') : scene
  return {
    episodeId,
    shotId,
    order,
    title,
    durationSeconds,
    productionStage: 'Storyboard Shot Card',
    scene,
    location,
    characters,
    cameraAngle,
    cameraMovement,
    action,
    emotion,
    dialogueDraft,
    narrationDraft,
    storyPurpose,
    visualStyle: '直式 9:16，華語都市奇幻動畫，冷色電影感，清晰人物輪廓。',
    referenceAssets,
    imagePromptCN: prompt(subject, `${location}，${scene}，${action}`, emotion, hasSuli ? suliRules : ''),
    videoPromptCN: videoPrompt(durationSeconds, subject, action, `${cameraAngle}，${cameraMovement}`, emotion, hasSuli ? suliRules : ''),
    negativePromptCN,
    directorNote,
    status: 'Draft',
  }
}

const e01Beats = [
  beat('E01', 1, '公開測試冷開場', '巨型螢幕宣布蘇璃為 F 級。', '把女主放入最低位，建立羞辱壓力。', '測試大廳廣角、人群目光、F 級紅字。'),
  beat('E01', 2, '人群反應', '旁觀者嘲笑，低階人員被推到前排看。', '加深制度暴力與孤立感。', '近鏡切換嘲笑與蘇璃沉默。'),
  beat('E01', 3, '測試官羞辱', '測試官公開質疑蘇璃只適合做誘餌。', '製造壓迫與觀眾代入。', '高角度俯拍蘇璃，低角度拍測試官。'),
  beat('E01', 4, '韓策判斷', '韓策認定 F 級無法進隊，只能服從調派。', '建立強者誤判。', '隊長冷眼與制服肩章特寫。'),
  beat('E01', 5, '蘇璃壓抑異象', '蘇璃看見人群背後閃過命線，忍住不動。', '暗示她不是普通 F 級。', '幽藍線條短暫穿過空氣。'),
  beat('E01', 6, '危險任務分配', '系統把她派往裂隙外圍後勤。', '把羞辱轉成真實危險。', '任務走廊警報與名單投影。'),
  beat('E01', 7, '首次死亡預視', '蘇璃看見某條命線在十分鐘後斷裂。', '啟動核心懸疑。', '吊墜與倒數光影。'),
  beat('E01', 8, '倒數懸念', '螢幕閃出 00:09:59，只有蘇璃看見。', '用倒數收尾，推動下一集。', '巨屏倒映在蘇璃瞳孔。'),
]

const e02Beats = [
  beat('E02', 1, '倒數成真', '蘇璃發現倒數正跟現實同步。', '讓超自然資訊變成危機。', '手腕光影、秒數跳動。'),
  beat('E02', 2, '測試廳恐慌', '裂隙警報打斷測試，人群失控。', '把羞辱場轉為災難場。', '紅色警燈與逃散人群。'),
  beat('E02', 3, '裂隙警報', '城市外圍裂隙被確認擴張。', '拉高外部威脅。', '螢幕地圖與黑藍裂口。'),
  beat('E02', 4, '韓策接管', '韓策下令撤離低階人員與封鎖通道。', '展示制度效率與盲點。', '指揮手勢與隊員移動。'),
  beat('E02', 5, '秦音命線斷裂', '蘇璃看見秦音的命線在逃生門前斷開。', '給蘇璃一個必須選擇的救援目標。', '秦音背後幽藍線突然黑化。'),
  beat('E02', 6, '最後一秒救援', '蘇璃推開秦音，承受第一次反噬。', '證明她願意承擔代價。', '慢動作手掌與命線偏移。'),
  beat('E02', 7, '韓策誤判為幸運', '韓策認為只是巧合，命令蘇璃退後。', '強化主角被低估。', '韓策冷臉與蘇璃顫抖指尖。'),
  beat('E02', 8, '怪物認出蘇璃', '厄獸從裂隙中看向蘇璃，像認得她。', '結尾拉出命線與怪物關係。', '怪物單眼特寫與蘇璃瞳孔反光。'),
]

const e03Beats = [
  beat('E03', 1, '裂隙封鎖', '裂隙膨脹，眾人被困在商場內層。', '把所有角色逼入同一危機。', '商場樓層扭曲、出口消失。'),
  beat('E03', 2, '韓策攻擊失敗', '韓策發動攻擊卻無法破防。', '讓 A 級權威首次崩塌。', '能量刃碎在外骨骼上。'),
  beat('E03', 3, '隊長受傷', '厄獸反擊，韓策被擊倒。', '把救場責任推向蘇璃。', '低角度拍韓策撞向玻璃。'),
  beat('E03', 4, '死亡匯聚點', '蘇璃看見所有命線都流向同一死亡點。', '展示不可逃的宿命壓迫。', '無數幽藍線匯入黑色核心。'),
  beat('E03', 5, '吊墜異變', '蘇璃吊墜浮現未知命線。', '揭示她身世與力量不簡單。', '吊墜冷光與空氣裂紋。'),
  beat('E03', 6, '記憶閃回', '蘇璃觸碰命線，看見城市裂隙初現片段。', '給觀眾謎團，不鎖死真相。', '碎片式畫面，不做完整解釋。'),
  beat('E03', 7, '改寫核心', '蘇璃改寫命線，短暫暴露怪物核心。', '用代價換反轉。', '命線纏住怪物胸口。'),
  beat('E03', 8, '未知神危等級', '沈曜收到檔案更新：蘇璃，未知神危。', '以制度級懸念收尾。', '監察官螢幕與冰冷微笑。'),
]

export const episodes: Episode[] = [
  {
    episodeId: 'E01',
    title: 'F 級判定',
    status: 'Concept Draft',
    conceptSummary:
      '蘇璃在能力評級測試中被公開判為 F 級，所有人認定她只能做誘餌。當她被派往裂隙外圍任務前，她看見一條只有自己能看見的死亡倒數。',
    openingHook: '測試官冷聲宣佈：「蘇璃，F 級。」全場瞬間安靜。',
    endingHook: '蘇璃瞳孔倒映出命線倒數：00:09:59。',
    beats: e01Beats,
  },
  {
    episodeId: 'E02',
    title: '倒數命線',
    status: 'Concept Draft',
    conceptSummary:
      '死亡倒數開始成真，裂隙警報讓測試廳陷入混亂。蘇璃救下秦音並承受反噬，卻被韓策當成運氣；裂隙厄獸首次認出她。',
    openingHook: '倒數少了一秒，天花玻璃同時裂開一道幽藍痕。',
    endingHook: '厄獸單眼鎖定蘇璃，像在說：終於找到你。',
    beats: e02Beats,
  },
  {
    episodeId: 'E03',
    title: '第一條改寫',
    status: 'Concept Draft',
    conceptSummary:
      '裂隙擴張困住眾人，韓策攻擊失敗並受傷。蘇璃看見所有人的死亡匯聚點，冒著反噬改寫命線，暴露怪物核心，卻讓自己的檔案被更新為未知神危等級。',
    openingHook: '整座商場向內折疊，出口在眾人眼前消失。',
    endingHook: '沈曜看著檔案微笑：「蘇璃，未知神危等級。」',
    beats: e03Beats,
  },
]

export const shotCards: ShotCard[] = [
  shot('E01', 1, 'F 級宣判', 6, '評級結果公開', '能力評級測試大廳', ['蘇璃'], '高角度俯拍', '緩慢推近', '蘇璃站在白色測試台中央，巨屏冷光落在她身上。', '被壓低但不崩潰', '5 秒內建立羞辱鉤子。', ['suli_normal_front.png', 'test_hall_wide.png', 'test_hall_screen.png'], '測試官：蘇璃，F 級。'),
  shot('E01', 2, '沉默的人群', 7, '全場反應', '能力評級測試大廳', ['蘇璃'], '中遠景', '橫向滑移', '鏡頭掠過竊笑人群，最後停在蘇璃無表情的側臉。', '孤立、壓抑', '放大社會羞辱。', ['suli_normal_closeup.png', 'test_hall_wide.png']),
  shot('E01', 3, '測試官壓迫', 8, '公開羞辱', '能力評級測試大廳', ['蘇璃'], '低角度反打', '微微前壓', '測試官把誘餌任務牌推到蘇璃面前。', '憤怒被壓住', '把 F 級判定轉為任務危險。', ['suli_normal_front.png', 'test_hall_screen.png'], '測試官：F 級也有用，至少能探路。'),
  shot('E01', 4, '韓策冷眼', 6, '隊長旁觀', '能力評級測試大廳', ['韓策', '蘇璃'], '韓策肩後視角', '短促推近', '韓策掃過蘇璃檔案，眉頭微皺。', '冷靜、不信任', '建立韓策對蘇璃的誤判。', ['han_ce_ref.png', 'suli_normal_front.png']),
  shot('E01', 5, '命線閃現', 8, '異象初現', '能力評級測試大廳', ['蘇璃'], '眼部特寫', '快速拉焦', '蘇璃瞳孔中閃過幾條幽藍命線，隨即消失。', '震動但克制', '暗示核心能力。', ['suli_shocked_expression.png', 'fate_line_fx.png'], '', '她看見的，不是評級。'),
  shot('E01', 6, '任務名單', 7, '危險分派', '異能局任務走廊', ['蘇璃', '韓策'], '廣角', '跟拍', '任務名單投影更新，蘇璃名字被分到裂隙外圍後勤。', '壓力升級', '把故事推往裂隙任務。', ['mission_corridor.png', 'suli_normal_front.png', 'han_ce_ref.png']),
  shot('E01', 7, '吊墜發冷', 5, '能力警訊', '異能局任務走廊', ['蘇璃'], '極近特寫', '固定鏡頭', '蘇璃胸前吊墜泛起冷光。', '不安', '把命線倒數連到吊墜。', ['suli_pendant_closeup.png', 'fate_line_fx.png']),
  shot('E01', 8, '死亡倒數', 8, '第一次預視', '異能局任務走廊', ['蘇璃'], '主觀視角', '緩慢推進', '走廊盡頭浮現 00:09:59 的光影倒數，只有蘇璃停下腳步。', '驚疑、警戒', '建立下一集危機。', ['suli_shocked_expression.png', 'mission_corridor.png', 'fate_line_fx.png']),
  shot('E01', 9, '人群擦肩', 6, '孤立轉場', '異能局任務走廊', ['蘇璃'], '背後跟拍', '穩定跟移', '蘇璃逆著人流走向警報區，沒有人回頭。', '孤單但堅定', '強化女主處境。', ['suli_normal_front.png', 'mission_corridor.png']),
  shot('E01', 10, '警報紅光', 6, '裂隙訊號', '異能局任務走廊', ['韓策'], '中近景', '手持輕晃', '韓策抬頭看向突然轉紅的警報燈。', '戒備', '把制度場景切入災難。', ['han_ce_ref.png', 'mission_corridor.png']),
  shot('E01', 11, '蘇璃回望', 7, '命線呼喚', '異能局任務走廊', ['蘇璃'], '側臉近鏡', '慢速環繞', '蘇璃回頭，看見命線從測試大廳方向延伸出去。', '被迫選擇', '讓她主動面對危險。', ['suli_normal_closeup.png', 'fate_line_fx.png']),
  shot('E01', 12, '倒數入瞳', 5, '懸念收尾', '異能局任務走廊', ['蘇璃'], '瞳孔極近特寫', '迅速推近後定格', '倒數光影倒映在蘇璃瞳孔中。', '恐懼與決心並存', '用單一強畫面收尾。', ['suli_shocked_expression.png', 'fate_line_fx.png']),

  shot('E02', 1, '秒數同步', 6, '倒數成真', '能力評級測試大廳', ['蘇璃'], '手部近鏡', '輕微推近', '蘇璃指尖的冷光隨倒數跳動。', '壓抑恐懼', '證明倒數不是幻覺。', ['suli_pain_expression.png', 'fate_line_fx.png']),
  shot('E02', 2, '穹頂裂痕', 7, '警報爆發', '能力評級測試大廳', [], '仰角廣角', '快速後拉', '玻璃穹頂出現幽藍裂痕，警報燈亮起。', '驚慌', '把室內羞辱場變災難場。', ['test_hall_wide.png', 'rift_entrance.png']),
  shot('E02', 3, '韓策下令', 7, '現場指揮', '能力評級測試大廳', ['韓策'], '中近景', '穩定推近', '韓策抬手下令封鎖出口與撤離低階人員。', '冷靜強勢', '展示 A 級隊長能力。', ['han_ce_ref.png', 'test_hall_wide.png'], '韓策：所有 F、E 級退到後方。'),
  shot('E02', 4, '秦音跌倒', 6, '死亡線靠近', '能力評級測試大廳', ['秦音'], '低角度近鏡', '短促跟拍', '秦音被人群撞倒，資料板滑向裂隙光影。', '慌亂', '建立救援目標。', ['qin_yin_ref.png', 'test_hall_wide.png']),
  shot('E02', 5, '命線斷裂', 8, '蘇璃看見死亡點', '能力評級測試大廳', ['蘇璃', '秦音'], '主觀視角', '拉焦到命線', '秦音背後的命線突然黑化並斷開。', '震驚、急迫', '迫使蘇璃行動。', ['suli_shocked_expression.png', 'qin_yin_ref.png', 'fate_line_fx.png']),
  shot('E02', 6, '最後一推', 7, '改變命線', '能力評級測試大廳', ['蘇璃', '秦音'], '側面中景', '快速橫移', '蘇璃衝前推開秦音，自己手指穿過幽藍命線。', '決絕', '第一次明確改寫命線。', ['suli_touching_fate_line.png', 'qin_yin_ref.png', 'fate_line_fx.png']),
  shot('E02', 7, '反噬裂紋', 6, '代價顯現', '能力評級測試大廳', ['蘇璃'], '臉部近鏡', '固定鏡頭', '蘇璃頸側浮現細裂紋，呼吸一滯。', '痛楚但忍住', '建立能力代價。', ['suli_pain_expression.png', 'backlash_fx.png']),
  shot('E02', 8, '韓策否定', 6, '誤判延續', '能力評級測試大廳', ['韓策', '蘇璃'], '雙人中景', '緩慢推近韓策', '韓策扶起秦音，冷冷看向蘇璃，示意她退後。', '不信任', '保留角色衝突。', ['han_ce_ref.png', 'suli_pain_expression.png']),
  shot('E02', 9, '裂隙入口', 8, '怪物登場前', '能力評級測試大廳', [], '廣角', '慢速推入裂口', '黑藍裂隙在大廳牆面張開，空氣像水面扭曲。', '壓迫、未知', '準備怪物出場。', ['rift_entrance.png', 'test_hall_wide.png']),
  shot('E02', 10, '厄獸手臂', 7, '首次實體威脅', '能力評級測試大廳', [], '低角度特寫', '向後退移', '黑藍外骨骼手臂從裂隙伸出，指尖敲擊地面。', '恐懼', '讓怪物有智慧感。', ['monster_core_beast.png', 'rift_entrance.png']),
  shot('E02', 11, '單眼鎖定', 6, '認出蘇璃', '能力評級測試大廳', ['蘇璃'], '怪物視角', '快速拉焦到蘇璃', '厄獸單眼越過人群鎖定蘇璃。', '被盯上的寒意', '揭示怪物與蘇璃有關。', ['monster_eye_closeup.png', 'suli_normal_closeup.png']),
  shot('E02', 12, '牠知道她', 5, '懸念收尾', '能力評級測試大廳', ['蘇璃'], '蘇璃近鏡', '緩慢推近', '蘇璃聽見裂隙中像低語的震動，表情僵住。', '驚懼、困惑', '用怪物辨認女主作結。', ['suli_shocked_expression.png', 'monster_eye_closeup.png'], '', '不是牠第一次見她。'),

  shot('E03', 1, '商場折疊', 8, '裂隙封鎖', '廢棄商場外圍', ['蘇璃', '韓策'], '超廣角', '垂直下墜式推進', '廢棄商場入口向內折疊，出口被黑藍裂隙吞沒。', '絕望升級', '把所有人困入戰場。', ['abandoned_mall.png', 'rift_entrance.png']),
  shot('E03', 2, '內層空間', 7, '進入裂隙', '裂隙內層', ['蘇璃'], '廣角', '慢速環繞', '蘇璃站在重力錯亂的商場中，樓梯懸浮在頭頂。', '震撼、戒備', '建立超自然主場。', ['suli_normal_front.png', 'rift_interior.png']),
  shot('E03', 3, '韓策攻擊', 7, 'A 級出手', '裂隙內層', ['韓策'], '低角度中景', '快速前推', '韓策揮出能量刃斬向厄獸胸口。', '果斷', '先讓制度強者嘗試解決。', ['han_ce_ref.png', 'monster_core_beast.png']),
  shot('E03', 4, '攻擊碎裂', 6, '破防失敗', '裂隙內層', ['韓策'], '怪物胸口特寫', '震動式定格', '能量刃在外骨骼上碎成藍白火花。', '挫敗', '證明常規力量無效。', ['monster_core_beast.png', 'han_ce_ref.png']),
  shot('E03', 5, '隊長受傷', 7, '戰局逆轉', '裂隙內層', ['韓策', '蘇璃'], '側面低角度', '快速橫甩', '厄獸長臂擊中韓策，他撞向玻璃牆。', '震驚', '讓蘇璃成為唯一突破口。', ['han_ce_ref.png', 'monster_core_beast.png', 'suli_shocked_expression.png']),
  shot('E03', 6, '命線匯聚', 8, '死亡點顯現', '裂隙內層', ['蘇璃'], '主觀廣角', '慢速推近黑點', '所有人的命線都被拉向厄獸胸口的黑色死亡點。', '窒息壓力', '把危機變成命運問題。', ['suli_shocked_expression.png', 'fate_line_fx.png', 'monster_core_beast.png']),
  shot('E03', 7, '吊墜異變', 6, '未知命線', '裂隙內層', ['蘇璃'], '吊墜極近特寫', '固定鏡頭', '吊墜裂出一道從未出現的銀藍命線。', '不解、被召喚', '引出身世伏筆。', ['suli_pendant_closeup.png', 'fate_line_fx.png']),
  shot('E03', 8, '記憶碎片', 8, '短暫閃回', '裂隙內層', ['蘇璃'], '快速蒙太奇近鏡', '閃白切換', '蘇璃觸碰銀藍命線，看見城市裂隙初現的破碎畫面。', '痛楚、混亂', '提供謎團但不鎖死全季。', ['suli_touching_fate_line.png', 'backlash_fx.png']),
  shot('E03', 9, '改寫一線', 7, '主動使用能力', '裂隙內層', ['蘇璃'], '手部近鏡', '緩慢推近', '蘇璃咬牙抓住命線，把它從死亡點旁拉開。', '決絕、痛楚', '女主第一次明確主動改寫。', ['suli_touching_fate_line.png', 'fate_line_fx.png', 'backlash_fx.png']),
  shot('E03', 10, '核心暴露', 6, '反轉窗口', '裂隙內層', [], '厄獸胸口特寫', '快速拉近', '厄獸胸腔透明核心短暫打開，幽藍光脈搏跳動。', '緊張', '給韓策與隊伍反擊機會。', ['monster_core_beast.png', 'monster_eye_closeup.png']),
  shot('E03', 11, '反噬倒下', 7, '代價加倍', '裂隙內層', ['蘇璃', '韓策'], '中近景', '慢速下移', '蘇璃跪倒，韓策第一次露出震驚表情。', '痛楚、震撼', '改變韓策對她的認知。', ['suli_pain_expression.png', 'han_ce_ref.png', 'backlash_fx.png']),
  shot('E03', 12, '神危檔案', 8, '懸念收尾', '異能局監察室', ['沈曜'], '螢幕反光近鏡', '緩慢推近', '沈曜看著蘇璃檔案自動更新為未知神危等級。', '冷靜、危險', '用制度級懸念結尾。', ['shen_yao_ref.png'], '沈曜：終於醒了。'),
]

export const getShotsByEpisode = (episodeId: string) =>
  shotCards.filter((shotCard) => shotCard.episodeId === episodeId)

export const getEffectiveStatus = <T extends { status: ProductionStatus; shotId?: string; episodeId?: string; beatNumber?: number }>(
  item: T,
  overrides: Record<string, ProductionStatus>,
) => {
  const key = item.shotId ?? (item.beatNumber ? `${item.episodeId}-B${item.beatNumber}` : '')
  return key && overrides[key] ? overrides[key] : item.status
}
