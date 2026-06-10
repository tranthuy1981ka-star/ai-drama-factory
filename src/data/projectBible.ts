import type { ProjectBible } from '../types/production'

export const projectBible: ProjectBible = {
  title: '她從F級開始封神',
  genre: '都市異能 / 命運懸疑 / 怪物裂隙 / AI 動畫直式短劇',
  format: '直式 9:16，每集約 2 分鐘，V0.1 只製作 E01-E03 前期材料。',
  creativePositioning: [
    '原創 IP，不複製現有作品、角色或世界觀。',
    '節奏參考華語直式短劇：5 秒內鉤子、羞辱壓力、反轉、懸念收尾。',
    '強女主、冷色電影感、AI 動畫視覺，重點是可審核、可迭代、可輸出提示詞。',
  ],
  worldSetting:
    '現代城市出現神秘裂隙，裂隙釋放名為「厄獸」的怪物。人類建立 F 至 S 的能力評級，F 級常被視為後勤、誘餌或低價值人員。蘇璃表面為 F 級，但她的命線能力不屬於評級系統。',
  corePower:
    '蘇璃能短暫看見、觸碰或改寫「命線」。命線代表死亡、選擇、因果、命運分支，以及人、怪物、地點與事件之間的隱藏連結。每次改寫都會造成反噬。',
  visualMotifs: [
    '命線：冷白與幽藍交錯的細線，像玻璃纖維穿過空氣。',
    '裂隙：城市表面撕開的黑藍傷口，邊緣有碎光與粒子倒流。',
    '反噬：蘇璃瞳孔失焦、指尖發冷光、頸側浮現短暫裂紋。',
  ],
  locations: [
    {
      id: 'test-hall',
      name: '能力評級測試大廳',
      description: '玻璃穹頂、巨型評級螢幕、白色地台與圍觀人群。',
      purpose: '公開羞辱、能力排名、第一集開場鉤子。',
    },
    {
      id: 'mission-corridor',
      name: '異能局任務走廊',
      description: '冷白燈、金屬牆、警報燈帶，牆面顯示任務分配。',
      purpose: '制度壓力、任務簡報、角色權力關係。',
    },
    {
      id: 'abandoned-mall',
      name: '廢棄商場外圍',
      description: '封鎖線、破碎招牌、夜雨反光，遠處可見裂隙光。',
      purpose: '第一個實戰危險場景與怪物遭遇。',
    },
    {
      id: 'rift-interior',
      name: '裂隙內層',
      description: '重力錯亂的商場內部，樓梯懸浮，牆面有命線穿梭。',
      purpose: '神秘、危險、超自然奇觀。',
    },
  ],
  monsterRules: [
    '厄獸有智慧，不只是野獸。',
    '牠能感知命線被觸碰，會優先鎖定蘇璃。',
    '核心短暫暴露時才可被擊中。',
    '裂隙擴張會令普通評級失準。',
  ],
  productionRules: [
    'V0.1 不生成完整最終劇本，只管理聖經、概念、節拍、分鏡、提示詞與審核。',
    '完整劇本需在概念、節拍、分鏡、shot card、提示詞方向通過後逐集生成。',
    '每個 shot 只做一個清楚動作，適合 Seedance/Kling/Jimeng 人手生成。',
    '角色一致性優先，蘇璃外觀與命線反噬規則不可隨意改。',
  ],
  driveStructure: [
    'AI_Drama_Factory/00_Project_Bible/',
    'AI_Drama_Factory/01_Episode_Outlines/',
    'AI_Drama_Factory/02_Beat_Sheets/',
    'AI_Drama_Factory/03_Storyboards/',
    'AI_Drama_Factory/04_Character_Refs/',
    'AI_Drama_Factory/05_Scene_Refs/',
    'AI_Drama_Factory/06_Keyframes/',
    'AI_Drama_Factory/07_Video_Clips/',
    'AI_Drama_Factory/08_Audio/',
    'AI_Drama_Factory/09_Final_Episodes/',
    'AI_Drama_Factory/10_Prompts/',
    'AI_Drama_Factory/11_Exports/',
  ],
  fileNaming: [
    'E01_S001_keyframe_v01.png',
    'E01_S001_video_v01.mp4',
    'E01_S001_video_v02_reroll.mp4',
    'E01_S001_final.mp4',
    'E01_S001_prompt_image.txt',
    'E01_S001_prompt_video.txt',
  ],
}
