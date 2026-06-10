import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  BookOpen,
  Check,
  Clipboard,
  Clapperboard,
  Download,
  Film,
  FolderKanban,
  Image,
  ListChecks,
  PenLine,
  RefreshCcw,
  SearchCheck,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react'
import { assets as baseAssets } from './data/assets'
import { characters } from './data/characters'
import { episodes as baseEpisodes, shotCards as baseShotCards } from './data/episodes'
import { projectBible } from './data/projectBible'
import type {
  Asset,
  AssetMetadata,
  AssetStatus,
  EpisodeStatus,
  ModelUsed,
  ProductionStatus,
  ProjectStateExport,
  ResultStatus,
  ShotCard,
  ShotVersion,
} from './types/production'
import {
  assetsMarkdown,
  beatSheetsMarkdown,
  downloadTextFile,
  episodeConceptsMarkdown,
  jimengPrompt,
  klingPrompt,
  projectBibleMarkdown,
  promptsText,
  seedancePromptsText,
  seedancePrompt,
} from './utils/exportUtils'
import {
  createProjectStateExport,
  loadAssetMetadata,
  loadAssetStatuses,
  loadBeatStatuses,
  loadEpisodeStatuses,
  loadShotStatuses,
  loadShotVersions,
  restoreProjectState,
  saveAssetMetadata,
  saveAssetStatuses,
  saveBeatStatuses,
  saveEpisodeStatuses,
  saveShotStatuses,
  saveShotVersions,
} from './utils/storage'

type Page = 'overview' | 'bible' | 'characters' | 'episodes' | 'beats' | 'storyboard' | 'prompts' | 'review' | 'assets' | 'exports'

const pages: { id: Page; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'overview', label: '總覽', icon: FolderKanban },
  { id: 'bible', label: 'Project Bible', icon: BookOpen },
  { id: 'characters', label: '角色', icon: Users },
  { id: 'episodes', label: '集數', icon: Film },
  { id: 'beats', label: 'Beat Sheets', icon: ListChecks },
  { id: 'storyboard', label: 'Storyboard', icon: Clapperboard },
  { id: 'prompts', label: 'Prompt Builder', icon: Sparkles },
  { id: 'review', label: 'Review Queue', icon: SearchCheck },
  { id: 'assets', label: 'Asset Library', icon: Image },
  { id: 'exports', label: 'Export Center', icon: Download },
]

const shotStatuses: ProductionStatus[] = [
  'Draft',
  'Outline Approved',
  'Beat Approved',
  'Storyboard Approved',
  'Needs Revision',
  'Image Prompt Ready',
  'Video Prompt Ready',
  'Generated',
  'Final Approved',
]

const assetStatuses: AssetStatus[] = ['Missing', 'Available', 'Needs Update', 'Approved Reference']
const modelOptions: ModelUsed[] = ['Seedance', 'Kling', 'Jimeng', 'Other']
const resultOptions: ResultStatus[] = ['Approved', 'Rejected', 'Maybe']

const statusTone: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  'Outline Approved': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Beat Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'Storyboard Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Needs Revision': 'bg-rose-50 text-rose-700 border-rose-200',
  'Image Prompt Ready': 'bg-violet-50 text-violet-700 border-violet-200',
  'Video Prompt Ready': 'bg-amber-50 text-amber-700 border-amber-200',
  Generated: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Final Approved': 'bg-green-50 text-green-700 border-green-200',
  Missing: 'bg-rose-50 text-rose-700 border-rose-200',
  Available: 'bg-green-50 text-green-700 border-green-200',
  'Needs Update': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved Reference': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Maybe: 'bg-amber-50 text-amber-700 border-amber-200',
  'Concept Draft': 'bg-slate-100 text-slate-700 border-slate-200',
  'Concept Approved': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Beat Sheet Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'Storyboard In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Prompt Ready': 'bg-violet-50 text-violet-700 border-violet-200',
  'In Generation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

const progressWeight: Record<ProductionStatus, number> = {
  Draft: 5,
  'Needs Revision': 10,
  'Outline Approved': 20,
  'Beat Approved': 35,
  'Storyboard Approved': 50,
  'Image Prompt Ready': 62,
  'Video Prompt Ready': 75,
  Generated: 88,
  'Final Approved': 100,
}

const firstThreeShotIds = ['E01_S001', 'E01_S002', 'E01_S003']

function Badge({ children }: { children: string }) {
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[children] ?? statusTone.Draft}`}>{children}</span>
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-cyan-600 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function App() {
  const [page, setPage] = useState<Page>('overview')
  const [selectedEpisode, setSelectedEpisode] = useState('E01')
  const [selectedShotId, setSelectedShotId] = useState('E01_S001')
  const [shotOverrides, setShotOverrides] = useState(loadShotStatuses)
  const [beatOverrides, setBeatOverrides] = useState(loadBeatStatuses)
  const [episodeOverrides, setEpisodeOverrides] = useState(loadEpisodeStatuses)
  const [assetOverrides, setAssetOverrides] = useState(loadAssetStatuses)
  const [assetMetadata, setAssetMetadata] = useState(loadAssetMetadata)
  const [shotVersions, setShotVersions] = useState(loadShotVersions)
  const [notice, setNotice] = useState('')

  useEffect(() => saveShotStatuses(shotOverrides), [shotOverrides])
  useEffect(() => saveBeatStatuses(beatOverrides), [beatOverrides])
  useEffect(() => saveEpisodeStatuses(episodeOverrides), [episodeOverrides])
  useEffect(() => saveAssetStatuses(assetOverrides), [assetOverrides])
  useEffect(() => saveAssetMetadata(assetMetadata), [assetMetadata])
  useEffect(() => saveShotVersions(shotVersions), [shotVersions])

  const episodes = useMemo(
    () => baseEpisodes.map((episode) => ({ ...episode, status: episodeOverrides[episode.episodeId] ?? episode.status })),
    [episodeOverrides],
  )
  const shotCards = useMemo(
    () => baseShotCards.map((shot) => ({ ...shot, status: shotOverrides[shot.shotId] ?? shot.status })),
    [shotOverrides],
  )
  const assets = useMemo(
    () =>
      baseAssets.map((asset) => {
        const metadata = assetMetadata[asset.assetId]
        return {
          ...asset,
          status: assetOverrides[asset.assetId] ?? asset.status,
          googleDriveUrl: metadata?.googleDriveUrl ?? asset.googleDriveUrl,
          thumbnailUrl: metadata?.thumbnailUrl ?? asset.thumbnailUrl,
          approvedVersion: metadata?.approvedVersion ?? asset.approvedVersion,
          usageNotes: metadata?.usageNotes ?? asset.usageNotes,
        }
      }),
    [assetOverrides, assetMetadata],
  )
  const selectedShot = shotCards.find((shot) => shot.shotId === selectedShotId) ?? shotCards[0]

  const setShotStatus = (shotId: string, status: ProductionStatus) => setShotOverrides((current) => ({ ...current, [shotId]: status }))
  const setBeatStatus = (episodeId: string, beatNumber: number, status: ProductionStatus) =>
    setBeatOverrides((current) => ({ ...current, [`${episodeId}-B${beatNumber}`]: status }))
  const setEpisodeStatus = (episodeId: string, status: EpisodeStatus) => setEpisodeOverrides((current) => ({ ...current, [episodeId]: status }))
  const setAssetStatus = (assetId: string, status: AssetStatus) => setAssetOverrides((current) => ({ ...current, [assetId]: status }))
  const updateAssetMetadata = (assetId: string, metadata: AssetMetadata) => setAssetMetadata((current) => ({ ...current, [assetId]: metadata }))
  const addShotVersion = (shotId: string, version: ShotVersion) =>
    setShotVersions((current) => ({ ...current, [shotId]: [...(current[shotId] ?? []), version] }))

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setNotice(`已複製：${label}`)
    window.setTimeout(() => setNotice(''), 1600)
  }

  const importProjectState = (state: ProjectStateExport) => {
    restoreProjectState(state)
    setShotOverrides(state.shotStatusOverrides ?? {})
    setEpisodeOverrides(state.episodeStatusOverrides ?? {})
    setBeatOverrides(state.beatStatusOverrides ?? {})
    setAssetOverrides(state.assetStatusOverrides ?? {})
    setAssetMetadata(state.assetMetadata ?? {})
    setShotVersions(state.shotVersionHistory ?? {})
    setNotice('Project state 已匯入')
  }

  const episodeProgress = (episodeId: string) => {
    const shots = shotCards.filter((shot) => shot.episodeId === episodeId)
    return Math.round(shots.reduce((sum, shot) => sum + progressWeight[shot.status], 0) / Math.max(shots.length, 1))
  }

  const counts = {
    beats: episodes.reduce((sum, episode) => sum + episode.beats.length, 0),
    shots: shotCards.length,
    storyboard: shotCards.filter((shot) => shot.status === 'Storyboard Approved').length,
    needsRevision: shotCards.filter((shot) => shot.status === 'Needs Revision').length,
    videoReady: shotCards.filter((shot) => shot.status === 'Video Prompt Ready').length,
    generated: shotCards.filter((shot) => shot.status === 'Generated').length,
    final: shotCards.filter((shot) => shot.status === 'Final Approved').length,
  }
  const overallProgress = Math.round(episodes.reduce((sum, episode) => sum + episodeProgress(episode.episodeId), 0) / episodes.length)

  const shared = { assets, shotVersions, addShotVersion, setShotStatus, copy }
  const pageContent = {
    overview: (
      <Overview counts={counts} overallProgress={overallProgress} episodes={episodes} episodeProgress={episodeProgress} shotCards={shotCards} assets={assets} />
    ),
    bible: <ProjectBiblePage />,
    characters: <CharactersPage />,
    episodes: <EpisodesPage episodes={episodes} shotCards={shotCards} episodeProgress={episodeProgress} setEpisodeStatus={setEpisodeStatus} />,
    beats: <BeatsPage selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} beatOverrides={beatOverrides} setBeatStatus={setBeatStatus} />,
    storyboard: <StoryboardPage selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} shotCards={shotCards} {...shared} />,
    prompts: (
      <PromptBuilderPage
        selectedEpisode={selectedEpisode}
        setSelectedEpisode={setSelectedEpisode}
        selectedShotId={selectedShotId}
        setSelectedShotId={setSelectedShotId}
        shotCards={shotCards}
        selectedShot={selectedShot}
        {...shared}
      />
    ),
    review: <ReviewQueuePage shotCards={shotCards} setShotStatus={setShotStatus} />,
    assets: <AssetLibraryPage assets={assets} setAssetStatus={setAssetStatus} updateAssetMetadata={updateAssetMetadata} />,
    exports: <ExportCenterPage episodes={episodes} shotCards={shotCards} assets={assets} importProjectState={importProjectState} />,
  }[page]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-6 rounded-md border border-cyan-100 bg-cyan-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">AI Drama Factory</p>
          <h1 className="mt-1 text-xl font-bold">《她從F級開始封神》</h1>
          <p className="mt-2 text-sm text-slate-600">E01 生產控制室</p>
        </div>
        <nav className="space-y-1">
          {pages.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold ${
                  page === item.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => setPage(item.id)}
                type="button"
              >
                <Icon size={17} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <select className="w-full rounded-md border border-slate-300 bg-white p-2" value={page} onChange={(event) => setPage(event.target.value as Page)}>
            {pages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
          {notice && <div className="fixed right-6 top-6 z-50 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">{notice}</div>}
          {pageContent}
        </div>
      </main>
    </div>
  )
}

function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6">
      <p className="text-sm font-semibold text-cyan-700">{eyebrow}</p>
      <h2 className="mt-1 text-3xl font-bold tracking-normal text-slate-950">{title}</h2>
      {children && <div className="mt-3 max-w-3xl text-slate-600">{children}</div>}
    </header>
  )
}

function Overview({
  counts,
  overallProgress,
  episodes,
  episodeProgress,
  shotCards,
  assets,
}: {
  counts: Record<string, number>
  overallProgress: number
  episodes: typeof baseEpisodes
  episodeProgress: (episodeId: string) => number
  shotCards: ShotCard[]
  assets: Asset[]
}) {
  const cards = [
    ['Episodes', 3],
    ['Total Beats', counts.beats],
    ['Total Shots', counts.shots],
    ['Storyboard Approved', counts.storyboard],
    ['Needs Revision', counts.needsRevision],
    ['Video Prompt Ready', counts.videoReady],
    ['Generated', counts.generated],
    ['Final Approved', counts.final],
  ]
  const e01FirstShots = shotCards.filter((shot) => firstThreeShotIds.includes(shot.shotId))
  const suliAssetsReady = assets.filter((asset) => asset.name.startsWith('suli_') && ['Available', 'Approved Reference'].includes(asset.status)).length
  const queue = [
    { title: '審核 E01-S001 至 E01-S003', detail: `${e01FirstShots.filter((shot) => shot.status !== 'Draft').length}/3 已有進度` },
    { title: '建立蘇璃 Reference Pack', detail: `${suliAssetsReady} 個蘇璃素材可用` },
    { title: 'Export E01 前 3 個 Image Prompts', detail: '到 Export Center 下載測試批次' },
    { title: '生成第一批 Keyframes', detail: '先做三張主視覺，不急住全集生成' },
    { title: '回填 generated file links', detail: '在 Shot Version History 或 Asset Library 填 URL' },
  ]
  return (
    <>
      <PageHeader eyebrow="Overview" title="製作總覽">
        <p>V0.1.1 聚焦 E01 第一批測試鏡頭，先確認角色一致性、畫風、keyframe 與影片 prompt，再擴展全集。</p>
      </PageHeader>
      <section className="mb-5 rounded-md border border-cyan-200 bg-cyan-50 p-5">
        <p className="text-sm font-bold text-cyan-700">Current Production Focus</p>
        <h3 className="mt-1 text-2xl font-bold">E01《F級廢物》</h3>
        <p className="mt-2 text-sm text-cyan-900">E02 / E03 只保留大綱和節拍，不進入正式生成階段。等 E01 視覺風格確認後才解鎖。</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">整體製作進度</h3>
            <span className="text-sm font-semibold text-cyan-700">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} />
          <div className="mt-5 space-y-4">
            {episodes.map((episode) => (
              <div key={episode.episodeId}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    {episode.episodeId} {episode.title}
                  </span>
                  <span>{episodeProgress(episode.episodeId)}%</span>
                </div>
                <ProgressBar value={episodeProgress(episode.episodeId)} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold">今日製作隊列</h3>
          <div className="mt-4 space-y-3">
            {queue.map((item, index) => (
              <div key={item.title} className="flex gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{index + 1}</span>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="mt-1 text-slate-600">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FirstThreePanel shotCards={shotCards} />
    </>
  )
}

function FirstThreePanel({ shotCards }: { shotCards: ShotCard[] }) {
  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-bold">E01 First 3 Shots Focus</h3>
      <p className="mt-1 text-sm text-slate-600">這三個 shot 是第一批 production test shots，先做 keyframe 與風格確認。</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {shotCards
          .filter((shot) => firstThreeShotIds.includes(shot.shotId))
          .map((shot) => (
            <div key={shot.shotId} className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-bold text-cyan-700">{shot.shotId}</p>
              <h4 className="mt-1 font-bold">{shot.title}</h4>
              <p className="mt-2 text-sm text-slate-600">{shot.storyPurpose}</p>
              <div className="mt-3">
                <Badge>{shot.status}</Badge>
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}

function ProjectBiblePage() {
  return (
    <>
      <PageHeader eyebrow="Project Bible" title={projectBible.title}>
        <p>{projectBible.format}</p>
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoBlock title="類型" items={[projectBible.genre]} />
        <InfoBlock title="核心能力" items={[projectBible.corePower]} />
        <InfoBlock title="創作定位" items={projectBible.creativePositioning} />
        <InfoBlock title="視覺母題" items={projectBible.visualMotifs} />
        <InfoBlock title="世界觀" items={[projectBible.worldSetting]} />
        <InfoBlock title="怪物規則" items={projectBible.monsterRules} />
      </div>
      <section className="mt-5 rounded-md border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-lg font-bold">重要地點</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {projectBible.locations.map((location) => (
            <div key={location.id} className="rounded-md bg-slate-50 p-4">
              <h4 className="font-bold">{location.name}</h4>
              <p className="mt-2 text-sm text-slate-600">{location.description}</p>
              <p className="mt-2 text-sm font-semibold text-cyan-700">{location.purpose}</p>
            </div>
          ))}
        </div>
      </section>
      <InfoBlock title="Production Rules" items={projectBible.productionRules} className="mt-5" />
    </>
  )
}

function InfoBlock({ title, items, className = '' }: { title: string; items: string[]; className?: string }) {
  return (
    <section className={`rounded-md border border-slate-200 bg-white p-5 ${className}`}>
      <h3 className="mb-3 text-lg font-bold">{title}</h3>
      <div className="space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  )
}

function CharactersPage() {
  return (
    <>
      <PageHeader eyebrow="Character Bible" title="角色聖經">
        <p>角色一致性是 V0.1.1 的硬規則。蘇璃出現時，提示詞必須保留外觀、吊墜與反噬規則。</p>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        {characters.map((character) => (
          <article key={character.id} className="rounded-md border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-bold">{character.name}</h3>
            <p className="mt-1 text-sm font-semibold text-cyan-700">{character.role}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Field label="性格" value={character.personality} />
              <Field label="外觀" value={character.appearance} />
              <Field label="一致性規則" value={character.consistencyRules.join('；')} />
              <Field label="故事功能" value={character.storyFunction} />
              <Field label="Prompt Notes" value={character.promptNotes} />
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}

function EpisodesPage({
  episodes,
  shotCards,
  episodeProgress,
  setEpisodeStatus,
}: {
  episodes: typeof baseEpisodes
  shotCards: ShotCard[]
  episodeProgress: (episodeId: string) => number
  setEpisodeStatus: (episodeId: string, status: EpisodeStatus) => void
}) {
  return (
    <>
      <PageHeader eyebrow="Episodes" title="E01-E03 集數概念">
        <p>Full Script Locked Until Storyboard Approval。現階段只批准概念、節拍、分鏡與提示詞方向。</p>
      </PageHeader>
      <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        E02 / E03 只保留大綱和節拍，不進入正式生成階段。等 E01 視覺風格確認後才解鎖。
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {episodes.map((episode) => {
          const shots = shotCards.filter((shot) => shot.episodeId === episode.episodeId).length
          return (
            <article key={episode.episodeId} className="rounded-md border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-cyan-700">{episode.episodeId}</p>
                  <h3 className="mt-1 text-xl font-bold">{episode.episodeId === 'E01' ? 'F級廢物' : episode.title}</h3>
                </div>
                <Badge>{episode.status}</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{episode.conceptSummary}</p>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="font-bold">開場：</span>
                  {episode.openingHook}
                </p>
                <p>
                  <span className="font-bold">結尾：</span>
                  {episode.endingHook}
                </p>
              </div>
              <div className="mt-4 flex gap-2 text-xs font-semibold text-slate-600">
                <span>{episode.beats.length} beats</span>
                <span>{shots} shots</span>
              </div>
              <div className="mt-4">
                <ProgressBar value={episodeProgress(episode.episodeId)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => setEpisodeStatus(episode.episodeId, 'Concept Approved')} type="button">
                  批准概念
                </button>
                <button className="btn-secondary" onClick={() => setEpisodeStatus(episode.episodeId, 'Concept Draft')} type="button">
                  需修訂
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

function EpisodeFilter({ selectedEpisode, setSelectedEpisode }: { selectedEpisode: string; setSelectedEpisode: (episodeId: string) => void }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {baseEpisodes.map((episode) => (
        <button
          key={episode.episodeId}
          className={`rounded-md px-4 py-2 text-sm font-bold ${selectedEpisode === episode.episodeId ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}
          onClick={() => setSelectedEpisode(episode.episodeId)}
          type="button"
        >
          {episode.episodeId}
        </button>
      ))}
    </div>
  )
}

function BeatsPage({
  selectedEpisode,
  setSelectedEpisode,
  beatOverrides,
  setBeatStatus,
}: {
  selectedEpisode: string
  setSelectedEpisode: (episodeId: string) => void
  beatOverrides: Record<string, ProductionStatus>
  setBeatStatus: (episodeId: string, beatNumber: number, status: ProductionStatus) => void
}) {
  const episode = baseEpisodes.find((item) => item.episodeId === selectedEpisode) ?? baseEpisodes[0]
  return (
    <>
      <PageHeader eyebrow="Beat Sheets" title="8 Beat Outline">
        <p>每集只保留 8 個核心節拍，先聚焦結構，不進入完整台詞劇本。</p>
      </PageHeader>
      <EpisodeFilter selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} />
      <div className="space-y-3">
        {episode.beats.map((beatItem) => {
          const status = beatOverrides[`${beatItem.episodeId}-B${beatItem.beatNumber}`] ?? beatItem.status
          return (
            <article key={beatItem.beatNumber} className="rounded-md border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold">
                  Beat {beatItem.beatNumber}: {beatItem.title}
                </h3>
                <Badge>{status}</Badge>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <Field label="事件" value={beatItem.storyEvent} />
                <Field label="情緒目的" value={beatItem.emotionalPurpose} />
                <Field label="視覺機會" value={beatItem.visualOpportunity} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => setBeatStatus(beatItem.episodeId, beatItem.beatNumber, 'Beat Approved')} type="button">
                  批准 Beat
                </button>
                <button className="btn-secondary" onClick={() => setBeatStatus(beatItem.episodeId, beatItem.beatNumber, 'Needs Revision')} type="button">
                  需修訂
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

function StoryboardPage({
  selectedEpisode,
  setSelectedEpisode,
  shotCards,
  assets,
  shotVersions,
  addShotVersion,
  setShotStatus,
  copy,
}: {
  selectedEpisode: string
  setSelectedEpisode: (episodeId: string) => void
  shotCards: ShotCard[]
  assets: Asset[]
  shotVersions: Record<string, ShotVersion[]>
  addShotVersion: (shotId: string, version: ShotVersion) => void
  setShotStatus: (shotId: string, status: ProductionStatus) => void
  copy: (label: string, text: string) => void
}) {
  const shots = shotCards.filter((shot) => shot.episodeId === selectedEpisode)
  return (
    <>
      <PageHeader eyebrow="Storyboard Shot Cards" title="分鏡卡">
        <p>每張卡顯示 reference pack readiness、版本歷史、提示詞與審核按鈕。</p>
      </PageHeader>
      <EpisodeFilter selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} />
      <FirstThreePanel shotCards={shotCards} />
      <div className="mt-5 space-y-4">
        {shots.map((shot) => (
          <ShotCardView key={shot.shotId} shot={shot} assets={assets} versions={shotVersions[shot.shotId] ?? []} addShotVersion={addShotVersion} setShotStatus={setShotStatus} copy={copy} />
        ))}
      </div>
    </>
  )
}

function getReferenceState(shot: ShotCard, assets: Asset[]) {
  const required = shot.referenceAssets
  const missing = required.filter((name) => {
    const asset = assets.find((item) => item.name === name)
    return !asset || !['Available', 'Approved Reference'].includes(asset.status)
  })
  return {
    required,
    missing,
    readyForKeyframe: missing.length === 0,
    readyForVideo: missing.length === 0 && ['Video Prompt Ready', 'Generated', 'Final Approved'].includes(shot.status),
  }
}

function ShotCardView({
  shot,
  assets,
  versions,
  addShotVersion,
  setShotStatus,
  copy,
}: {
  shot: ShotCard
  assets: Asset[]
  versions: ShotVersion[]
  addShotVersion: (shotId: string, version: ShotVersion) => void
  setShotStatus: (shotId: string, status: ProductionStatus) => void
  copy: (label: string, text: string) => void
}) {
  const refs = getReferenceState(shot, assets)
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-700">{shot.shotId}</p>
          <h3 className="mt-1 text-xl font-bold">{shot.title}</h3>
        </div>
        <Badge>{shot.status}</Badge>
      </div>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
        <Field label="時長" value={`${shot.durationSeconds} 秒`} />
        <Field label="場景" value={shot.scene} />
        <Field label="地點" value={shot.location} />
        <Field label="角色" value={shot.characters.join('、') || '場景 / 怪物'} />
        <Field label="鏡頭角度" value={shot.cameraAngle} />
        <Field label="鏡頭運動" value={shot.cameraMovement} />
        <Field label="動作" value={shot.action} />
        <Field label="情緒" value={shot.emotion} />
      </div>
      <ReferencePack refs={refs} />
      <div className="mt-4 grid gap-4 text-sm lg:grid-cols-2">
        <Field label="故事目的" value={shot.storyPurpose} />
        <Field label="導演備註" value={shot.directorNote || '保持簡潔，不加完整劇本。'} />
      </div>
      <details className="mt-4 rounded-md bg-slate-50 p-4">
        <summary className="cursor-pointer font-bold">Prompt Preview</summary>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <p>{shot.imagePromptCN}</p>
          <p>{seedancePrompt(shot)}</p>
        </div>
      </details>
      <VersionHistory shotId={shot.shotId} versions={versions} addShotVersion={addShotVersion} />
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton icon={Check} label="批准分鏡" onClick={() => setShotStatus(shot.shotId, 'Storyboard Approved')} />
        <ActionButton icon={PenLine} label="需修訂" onClick={() => setShotStatus(shot.shotId, 'Needs Revision')} />
        <ActionButton icon={Image} label="Image Ready" onClick={() => setShotStatus(shot.shotId, 'Image Prompt Ready')} />
        <ActionButton icon={Film} label="Video Ready" onClick={() => setShotStatus(shot.shotId, 'Video Prompt Ready')} />
        <ActionButton icon={Archive} label="Generated" onClick={() => setShotStatus(shot.shotId, 'Generated')} />
        <ActionButton icon={Check} label="Final Approve" onClick={() => setShotStatus(shot.shotId, 'Final Approved')} />
        <ActionButton icon={RefreshCcw} label="Draft" onClick={() => setShotStatus(shot.shotId, 'Draft')} />
        <ActionButton icon={Clipboard} label="Copy Image" onClick={() => copy(`${shot.shotId} image`, shot.imagePromptCN)} />
        <ActionButton icon={Clipboard} label="Copy Seedance" onClick={() => copy(`${shot.shotId} Seedance`, seedancePrompt(shot))} />
      </div>
    </article>
  )
}

function ReferencePack({ refs }: { refs: ReturnType<typeof getReferenceState> }) {
  return (
    <section className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <Field label="Required reference assets" value={refs.required.join('、')} />
        <Field label="Missing reference assets" value={refs.missing.length ? refs.missing.join('、') : '無'} />
        <Field label="Ready for Keyframe" value={refs.readyForKeyframe ? 'Yes' : 'No'} />
        <Field label="Ready for Video" value={refs.readyForVideo ? 'Yes' : 'No'} />
      </div>
      {!refs.readyForKeyframe && <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">缺少參考素材，暫不建議生成。</p>}
    </section>
  )
}

function VersionHistory({
  shotId,
  versions,
  addShotVersion,
}: {
  shotId: string
  versions: ShotVersion[]
  addShotVersion: (shotId: string, version: ShotVersion) => void
}) {
  const [modelUsed, setModelUsed] = useState<ModelUsed>('Seedance')
  const [fileUrl, setFileUrl] = useState('')
  const [resultStatus, setResultStatus] = useState<ResultStatus>('Maybe')
  const [issueNotes, setIssueNotes] = useState('')
  const addVersion = () => {
    if (!fileUrl.trim()) return
    addShotVersion(shotId, {
      versionId: `${shotId}_V${String(versions.length + 1).padStart(2, '0')}`,
      modelUsed,
      fileUrl: fileUrl.trim(),
      resultStatus,
      issueNotes,
      createdAt: new Date().toISOString(),
    })
    setFileUrl('')
    setIssueNotes('')
  }
  return (
    <details className="mt-4 rounded-md border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer font-bold">Shot Version History</summary>
      <div className="mt-3 grid gap-2 md:grid-cols-[0.7fr_1.2fr_0.7fr_1fr_auto]">
        <select className="input" value={modelUsed} onChange={(event) => setModelUsed(event.target.value as ModelUsed)}>
          {modelOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <input className="input" value={fileUrl} onChange={(event) => setFileUrl(event.target.value)} placeholder="Generated file URL" />
        <select className="input" value={resultStatus} onChange={(event) => setResultStatus(event.target.value as ResultStatus)}>
          {resultOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <input className="input" value={issueNotes} onChange={(event) => setIssueNotes(event.target.value)} placeholder="Issue notes" />
        <button className="btn-primary" type="button" onClick={addVersion}>
          新增
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {versions.length === 0 ? (
          <p className="text-sm text-slate-500">未有生成版本。</p>
        ) : (
          versions.map((version) => (
            <div key={version.versionId} className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">{version.versionId}</span>
                <Badge>{version.modelUsed}</Badge>
                <Badge>{version.resultStatus}</Badge>
                <span className="text-slate-500">{new Date(version.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 break-words text-slate-700">{version.fileUrl}</p>
              {version.issueNotes && <p className="mt-1 text-slate-600">{version.issueNotes}</p>}
            </div>
          ))
        )}
      </div>
    </details>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 leading-6 text-slate-700">{value}</p>
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; onClick: () => void }) {
  return (
    <button className="btn-secondary inline-flex items-center gap-2" onClick={onClick} type="button" title={label}>
      <Icon size={15} />
      {label}
    </button>
  )
}

function PromptBuilderPage({
  selectedEpisode,
  setSelectedEpisode,
  selectedShotId,
  setSelectedShotId,
  shotCards,
  selectedShot,
  assets,
  shotVersions,
  addShotVersion,
  copy,
}: {
  selectedEpisode: string
  setSelectedEpisode: (episodeId: string) => void
  selectedShotId: string
  setSelectedShotId: (shotId: string) => void
  shotCards: ShotCard[]
  selectedShot: ShotCard
  assets: Asset[]
  shotVersions: Record<string, ShotVersion[]>
  addShotVersion: (shotId: string, version: ShotVersion) => void
  copy: (label: string, text: string) => void
}) {
  const shots = shotCards.filter((shot) => shot.episodeId === selectedEpisode)
  const refs = getReferenceState(selectedShot, assets)
  return (
    <>
      <PageHeader eyebrow="Prompt Builder" title="提示詞工作台">
        <p>同一 shot 可分別複製 Image、Seedance、Kling、Jimeng 與 Negative Prompt，不呼叫外部 API。</p>
      </PageHeader>
      <EpisodeFilter selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} />
      <div className="mb-5">
        <select className="w-full rounded-md border border-slate-300 bg-white p-3 font-semibold" value={selectedShotId} onChange={(event) => setSelectedShotId(event.target.value)}>
          {shots.map((shot) => (
            <option key={shot.shotId} value={shot.shotId}>
              {shot.shotId} - {shot.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-md border border-slate-200 bg-white p-5">
          <h3 className="text-xl font-bold">{selectedShot.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{selectedShot.action}</p>
          <ReferencePack refs={refs} />
          <h4 className="mt-5 font-bold">Prompt Quality Checklist</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {['蘇璃外觀一致', '包含 9:16', '一個清楚主體', '一個清楚動作', '情緒與燈光明確', '包含 negative prompt', '影片時長 5-10 秒，適合 AI 生成'].map((item) => (
              <p key={item} className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
          <VersionHistory shotId={selectedShot.shotId} versions={shotVersions[selectedShot.shotId] ?? []} addShotVersion={addShotVersion} />
        </section>
        <section className="space-y-4">
          <PromptBox title="Image Prompt" content={selectedShot.imagePromptCN} onCopy={() => copy(`${selectedShot.shotId} image`, selectedShot.imagePromptCN)} />
          <PromptBox title="Seedance Video Prompt" content={seedancePrompt(selectedShot)} onCopy={() => copy(`${selectedShot.shotId} Seedance`, seedancePrompt(selectedShot))} />
          <PromptBox title="Kling Video Prompt" content={klingPrompt(selectedShot)} onCopy={() => copy(`${selectedShot.shotId} Kling`, klingPrompt(selectedShot))} />
          <PromptBox title="Jimeng Video Prompt" content={jimengPrompt(selectedShot)} onCopy={() => copy(`${selectedShot.shotId} Jimeng`, jimengPrompt(selectedShot))} />
          <PromptBox title="Negative Prompt" content={selectedShot.negativePromptCN} onCopy={() => copy(`${selectedShot.shotId} negative`, selectedShot.negativePromptCN)} />
        </section>
      </div>
    </>
  )
}

function PromptBox({ title, content, onCopy }: { title: string; content: string; onCopy: () => void }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        <button className="btn-primary inline-flex items-center gap-2" onClick={onCopy} type="button">
          <Clipboard size={15} />
          複製
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{content}</p>
    </div>
  )
}

function ReviewQueuePage({ shotCards, setShotStatus }: { shotCards: ShotCard[]; setShotStatus: (shotId: string, status: ProductionStatus) => void }) {
  return (
    <>
      <PageHeader eyebrow="Review Queue" title="審核隊列">
        <p>按狀態分組，快速找出需要批准、重做或標記生成完成的 shot。</p>
      </PageHeader>
      <div className="space-y-5">
        {shotStatuses.map((status) => {
          const items = shotCards.filter((shot) => shot.status === status)
          return (
            <section key={status} className="rounded-md border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">{status}</h3>
                <Badge>{String(items.length)}</Badge>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-slate-500">沒有項目。</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((shot) => (
                    <div key={shot.shotId} className="rounded-md bg-slate-50 p-4">
                      <p className="text-sm font-bold text-cyan-700">{shot.shotId}</p>
                      <h4 className="mt-1 font-bold">{shot.title}</h4>
                      <p className="mt-2 text-sm text-slate-600">{shot.storyPurpose}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="btn-primary" onClick={() => setShotStatus(shot.shotId, 'Storyboard Approved')} type="button">
                          OK
                        </button>
                        <button className="btn-secondary" onClick={() => setShotStatus(shot.shotId, 'Needs Revision')} type="button">
                          Needs Revision
                        </button>
                        <button className="btn-secondary" onClick={() => setShotStatus(shot.shotId, 'Final Approved')} type="button">
                          Final Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </>
  )
}

function AssetLibraryPage({
  assets,
  setAssetStatus,
  updateAssetMetadata,
}: {
  assets: Asset[]
  setAssetStatus: (assetId: string, status: AssetStatus) => void
  updateAssetMetadata: (assetId: string, metadata: AssetMetadata) => void
}) {
  return (
    <>
      <PageHeader eyebrow="Asset Library" title="素材庫">
        <p>可回填 Google Drive URL、thumbnail、approved version 與 usage notes，資料會儲存在 localStorage 並可匯出 project state。</p>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard key={asset.assetId} asset={asset} setAssetStatus={setAssetStatus} updateAssetMetadata={updateAssetMetadata} />
        ))}
      </div>
    </>
  )
}

function AssetCard({
  asset,
  setAssetStatus,
  updateAssetMetadata,
}: {
  asset: Asset
  setAssetStatus: (assetId: string, status: AssetStatus) => void
  updateAssetMetadata: (assetId: string, metadata: AssetMetadata) => void
}) {
  const [metadata, setMetadata] = useState<AssetMetadata>({
    googleDriveUrl: asset.googleDriveUrl,
    thumbnailUrl: asset.thumbnailUrl,
    approvedVersion: asset.approvedVersion,
    usageNotes: asset.usageNotes,
  })
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{asset.name}</h3>
          <p className="mt-1 text-xs font-bold uppercase text-cyan-700">{asset.type}</p>
        </div>
        <Badge>{asset.status}</Badge>
      </div>
      <p className="mt-3 text-sm text-slate-600">{asset.description}</p>
      <p className="mt-3 break-words rounded-md bg-slate-50 p-3 text-xs text-slate-600">{asset.suggestedPath}</p>
      <div className="mt-4 space-y-2">
        <input className="input" value={metadata.googleDriveUrl} onChange={(event) => setMetadata({ ...metadata, googleDriveUrl: event.target.value })} placeholder="Google Drive URL" />
        <input className="input" value={metadata.thumbnailUrl} onChange={(event) => setMetadata({ ...metadata, thumbnailUrl: event.target.value })} placeholder="Thumbnail URL" />
        <input className="input" value={metadata.approvedVersion} onChange={(event) => setMetadata({ ...metadata, approvedVersion: event.target.value })} placeholder="Approved version" />
        <textarea className="input min-h-20" value={metadata.usageNotes} onChange={(event) => setMetadata({ ...metadata, usageNotes: event.target.value })} placeholder="Usage notes" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {assetStatuses.map((status) => (
          <button key={status} className="btn-secondary" onClick={() => setAssetStatus(asset.assetId, status)} type="button">
            {status}
          </button>
        ))}
        <button className="btn-primary" onClick={() => updateAssetMetadata(asset.assetId, metadata)} type="button">
          儲存欄位
        </button>
      </div>
    </article>
  )
}

function ExportCenterPage({
  episodes,
  shotCards,
  assets,
  importProjectState,
}: {
  episodes: typeof baseEpisodes
  shotCards: ShotCard[]
  assets: Asset[]
  importProjectState: (state: ProjectStateExport) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const e01FirstThree = shotCards.filter((shot) => firstThreeShotIds.includes(shot.shotId))
  const approvedSeedanceShots = shotCards.filter((shot) => shot.episodeId === 'E01' && ['Video Prompt Ready', 'Generated', 'Final Approved'].includes(shot.status))
  const projectState = () => JSON.stringify(createProjectStateExport(), null, 2)
  const exports = [
    ['Project Bible as Markdown', 'ai_drama_factory_project_bible.md', projectBibleMarkdown(projectBible), 'text/markdown;charset=utf-8'],
    ['Episode Concepts as Markdown', 'suli_e01_e03_episode_concepts.md', episodeConceptsMarkdown(episodes), 'text/markdown;charset=utf-8'],
    ['Beat Sheets as Markdown', 'suli_e01_e03_beat_sheets.md', beatSheetsMarkdown(episodes), 'text/markdown;charset=utf-8'],
    ['Shot Cards as JSON', 'suli_e01_e03_shot_cards.json', JSON.stringify(shotCards, null, 2), 'application/json;charset=utf-8'],
    ['All Image Prompts as TXT', 'suli_all_image_prompts.txt', promptsText(shotCards, 'imagePromptCN'), 'text/plain;charset=utf-8'],
    ['All Video Prompts as TXT', 'suli_all_video_prompts.txt', promptsText(shotCards, 'videoPromptCN'), 'text/plain;charset=utf-8'],
    ['E01 First 3 Image Prompts', 'e01_first_3_image_prompts.txt', promptsText(e01FirstThree, 'imagePromptCN'), 'text/plain;charset=utf-8'],
    ['E01 First 3 Seedance Prompts', 'e01_first_3_seedance_prompts.txt', seedancePromptsText(e01FirstThree), 'text/plain;charset=utf-8'],
    ['E01 Approved-only Seedance Prompts', 'e01_approved_seedance_prompts.txt', seedancePromptsText(approvedSeedanceShots), 'text/plain;charset=utf-8'],
    ['Asset List as Markdown', 'suli_asset_library.md', assetsMarkdown(assets), 'text/markdown;charset=utf-8'],
    ['Full Project State JSON', 'ai_drama_factory_project_state_v011.json', projectState(), 'application/json;charset=utf-8'],
  ] as const
  const handleImport = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    importProjectState(JSON.parse(text) as ProjectStateExport)
  }
  return (
    <>
      <PageHeader eyebrow="Export Center" title="輸出中心">
        <p>可下載 production prompts、素材表與完整 Project State JSON。匯入 JSON 可在公司機和家用機之間同步 localStorage 狀態。</p>
      </PageHeader>
      <section className="mb-5 rounded-md border border-cyan-200 bg-cyan-50 p-5">
        <h3 className="font-bold">Project State Export / Import</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary inline-flex items-center gap-2" onClick={() => downloadTextFile('ai_drama_factory_project_state_v011.json', projectState(), 'application/json;charset=utf-8')} type="button">
            <Download size={15} />
            Export Full Project State JSON
          </button>
          <button className="btn-secondary inline-flex items-center gap-2" onClick={() => fileInputRef.current?.click()} type="button">
            <Upload size={15} />
            Import Project State JSON
          </button>
          <input ref={fileInputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void handleImport(event.target.files?.[0])} />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {exports.map(([label, fileName, content, mimeType]) => (
          <button
            key={fileName}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-5 text-left hover:border-cyan-300 hover:bg-cyan-50"
            onClick={() => downloadTextFile(fileName, content, mimeType)}
            type="button"
          >
            <span>
              <span className="block font-bold">{label}</span>
              <span className="mt-1 block text-sm text-slate-500">{fileName}</span>
            </span>
            <Download className="text-cyan-700" size={22} />
          </button>
        ))}
      </div>
    </>
  )
}

export default App
