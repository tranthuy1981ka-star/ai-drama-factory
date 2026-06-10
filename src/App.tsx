import { useEffect, useMemo, useState } from 'react'
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
  Users,
} from 'lucide-react'
import { assets as baseAssets } from './data/assets'
import { characters } from './data/characters'
import { episodes as baseEpisodes, shotCards as baseShotCards } from './data/episodes'
import { projectBible } from './data/projectBible'
import type { AssetStatus, EpisodeStatus, ProductionStatus, ShotCard } from './types/production'
import {
  assetsMarkdown,
  beatSheetsMarkdown,
  downloadTextFile,
  episodeConceptsMarkdown,
  projectBibleMarkdown,
  promptsText,
} from './utils/exportUtils'
import {
  loadAssetStatuses,
  loadBeatStatuses,
  loadEpisodeStatuses,
  loadShotStatuses,
  saveAssetStatuses,
  saveBeatStatuses,
  saveEpisodeStatuses,
  saveShotStatuses,
} from './utils/storage'

type Page =
  | 'overview'
  | 'bible'
  | 'characters'
  | 'episodes'
  | 'beats'
  | 'storyboard'
  | 'prompts'
  | 'review'
  | 'assets'
  | 'exports'

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

const assetStatuses: AssetStatus[] = ['Missing', 'Available', 'Needs Update']

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
  const [copied, setCopied] = useState('')

  useEffect(() => saveShotStatuses(shotOverrides), [shotOverrides])
  useEffect(() => saveBeatStatuses(beatOverrides), [beatOverrides])
  useEffect(() => saveEpisodeStatuses(episodeOverrides), [episodeOverrides])
  useEffect(() => saveAssetStatuses(assetOverrides), [assetOverrides])

  const episodes = useMemo(
    () => baseEpisodes.map((episode) => ({ ...episode, status: episodeOverrides[episode.episodeId] ?? episode.status })),
    [episodeOverrides],
  )
  const shotCards = useMemo(
    () => baseShotCards.map((shot) => ({ ...shot, status: shotOverrides[shot.shotId] ?? shot.status })),
    [shotOverrides],
  )
  const assets = useMemo(
    () => baseAssets.map((asset) => ({ ...asset, status: assetOverrides[asset.assetId] ?? asset.status })),
    [assetOverrides],
  )
  const selectedShot = shotCards.find((shot) => shot.shotId === selectedShotId) ?? shotCards[0]

  const setShotStatus = (shotId: string, status: ProductionStatus) => setShotOverrides((current) => ({ ...current, [shotId]: status }))
  const setBeatStatus = (episodeId: string, beatNumber: number, status: ProductionStatus) =>
    setBeatOverrides((current) => ({ ...current, [`${episodeId}-B${beatNumber}`]: status }))
  const setEpisodeStatus = (episodeId: string, status: EpisodeStatus) => setEpisodeOverrides((current) => ({ ...current, [episodeId]: status }))
  const setAssetStatus = (assetId: string, status: AssetStatus) => setAssetOverrides((current) => ({ ...current, [assetId]: status }))

  const copy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1600)
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

  const pageContent = {
    overview: (
      <Overview counts={counts} overallProgress={overallProgress} episodes={episodes} episodeProgress={episodeProgress} shotCards={shotCards} />
    ),
    bible: <ProjectBiblePage />,
    characters: <CharactersPage />,
    episodes: <EpisodesPage episodes={episodes} shotCards={shotCards} episodeProgress={episodeProgress} setEpisodeStatus={setEpisodeStatus} />,
    beats: (
      <BeatsPage
        selectedEpisode={selectedEpisode}
        setSelectedEpisode={setSelectedEpisode}
        beatOverrides={beatOverrides}
        setBeatStatus={setBeatStatus}
      />
    ),
    storyboard: (
      <StoryboardPage
        selectedEpisode={selectedEpisode}
        setSelectedEpisode={setSelectedEpisode}
        shotCards={shotCards}
        setShotStatus={setShotStatus}
        copy={copy}
      />
    ),
    prompts: (
      <PromptBuilderPage
        selectedEpisode={selectedEpisode}
        setSelectedEpisode={setSelectedEpisode}
        selectedShotId={selectedShotId}
        setSelectedShotId={setSelectedShotId}
        shotCards={shotCards}
        selectedShot={selectedShot}
        copy={copy}
      />
    ),
    review: <ReviewQueuePage shotCards={shotCards} setShotStatus={setShotStatus} />,
    assets: <AssetLibraryPage assets={assets} setAssetStatus={setAssetStatus} />,
    exports: <ExportCenterPage episodes={episodes} shotCards={shotCards} assets={assets} />,
  }[page]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-6 rounded-md border border-cyan-100 bg-cyan-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">AI Drama Factory</p>
          <h1 className="mt-1 text-xl font-bold">《她從F級開始封神》</h1>
          <p className="mt-2 text-sm text-slate-600">AI 直式動畫短劇製作控制室</p>
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
          {copied && <div className="fixed right-6 top-6 z-50 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">已複製：{copied}</div>}
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
}: {
  counts: Record<string, number>
  overallProgress: number
  episodes: typeof baseEpisodes
  episodeProgress: (episodeId: string) => number
  shotCards: ShotCard[]
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
  const reviewItems = shotCards.filter((shot) => shot.status === 'Needs Revision' || shot.status === 'Draft').slice(0, 5)
  return (
    <>
      <PageHeader eyebrow="Overview" title="製作總覽">
        <p>快速查看進度、待審項目與下一步建議。V0.1 保持在前期製作與提示詞管理，不鎖死完整劇本。</p>
      </PageHeader>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
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
          <h3 className="text-lg font-bold">下一步建議</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>1. 先批准 E01 概念，再檢查 8 個 beat。</p>
            <p>2. 將 E01 shot cards 標記為 Storyboard Approved。</p>
            <p>3. 在 Prompt Builder 複製 image/video prompts 做外部生成。</p>
            <p>4. 生成後回來標記 Generated 或 Needs Revision。</p>
          </div>
          <h4 className="mt-5 font-bold">Review Queue 摘要</h4>
          <div className="mt-3 space-y-2">
            {reviewItems.map((shot) => (
              <div key={shot.shotId} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 text-sm">
                <span className="font-semibold">{shot.shotId}</span>
                <Badge>{shot.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
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
        <p>角色一致性是 V0.1 的硬規則。蘇璃出現時，提示詞必須保留外觀、吊墜與反噬規則。</p>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2">
        {characters.map((character) => (
          <article key={character.id} className="rounded-md border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">{character.name}</h3>
                <p className="mt-1 text-sm font-semibold text-cyan-700">{character.role}</p>
              </div>
              <Users className="text-slate-400" size={22} />
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-bold">性格</dt>
                <dd className="mt-1 text-slate-600">{character.personality}</dd>
              </div>
              <div>
                <dt className="font-bold">外觀</dt>
                <dd className="mt-1 text-slate-600">{character.appearance}</dd>
              </div>
              <div>
                <dt className="font-bold">一致性規則</dt>
                <dd className="mt-1 space-y-1 text-slate-600">{character.consistencyRules.map((rule) => <p key={rule}>{rule}</p>)}</dd>
              </div>
              <div>
                <dt className="font-bold">故事功能</dt>
                <dd className="mt-1 text-slate-600">{character.storyFunction}</dd>
              </div>
              <div>
                <dt className="font-bold">Prompt Notes</dt>
                <dd className="mt-1 text-slate-600">{character.promptNotes}</dd>
              </div>
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
        完整劇本暫停生成：請先通過 episode concept、beat sheet、storyboard shot cards 及 prompt direction，避免太早鎖死全季故事。
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {episodes.map((episode) => {
          const shots = shotCards.filter((shot) => shot.episodeId === episode.episodeId).length
          return (
            <article key={episode.episodeId} className="rounded-md border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-cyan-700">{episode.episodeId}</p>
                  <h3 className="mt-1 text-xl font-bold">{episode.title}</h3>
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
        <p>每集只保留 8 個核心節拍，讓審核先聚焦結構，不進入完整台詞劇本。</p>
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
                <p>
                  <span className="font-bold">事件：</span>
                  {beatItem.storyEvent}
                </p>
                <p>
                  <span className="font-bold">情緒目的：</span>
                  {beatItem.emotionalPurpose}
                </p>
                <p>
                  <span className="font-bold">視覺機會：</span>
                  {beatItem.visualOpportunity}
                </p>
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
  setShotStatus,
  copy,
}: {
  selectedEpisode: string
  setSelectedEpisode: (episodeId: string) => void
  shotCards: ShotCard[]
  setShotStatus: (shotId: string, status: ProductionStatus) => void
  copy: (label: string, text: string) => void
}) {
  const shots = shotCards.filter((shot) => shot.episodeId === selectedEpisode)
  return (
    <>
      <PageHeader eyebrow="Storyboard Shot Cards" title="分鏡卡">
        <p>每張卡有清楚鏡頭、單一動作、情緒目的、提示詞與審核按鈕。</p>
      </PageHeader>
      <EpisodeFilter selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} />
      <div className="space-y-4">
        {shots.map((shot) => (
          <ShotCardView key={shot.shotId} shot={shot} setShotStatus={setShotStatus} copy={copy} />
        ))}
      </div>
    </>
  )
}

function ShotCardView({
  shot,
  setShotStatus,
  copy,
}: {
  shot: ShotCard
  setShotStatus: (shotId: string, status: ProductionStatus) => void
  copy: (label: string, text: string) => void
}) {
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
      <div className="mt-4 grid gap-4 text-sm lg:grid-cols-2">
        <Field label="故事目的" value={shot.storyPurpose} />
        <Field label="導演備註" value={shot.directorNote || '保持簡潔，不加完整劇本。'} />
        <Field label="對白草稿" value={shot.dialogueDraft || '無，暫不寫完整台詞。'} />
        <Field label="旁白草稿" value={shot.narrationDraft || '無，暫不寫完整旁白。'} />
      </div>
      <details className="mt-4 rounded-md bg-slate-50 p-4">
        <summary className="cursor-pointer font-bold">Prompt Preview</summary>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <p>{shot.imagePromptCN}</p>
          <p>{shot.videoPromptCN}</p>
        </div>
      </details>
      <div className="mt-4 flex flex-wrap gap-2">
        <ActionButton icon={Check} label="批准分鏡" onClick={() => setShotStatus(shot.shotId, 'Storyboard Approved')} />
        <ActionButton icon={PenLine} label="需修訂" onClick={() => setShotStatus(shot.shotId, 'Needs Revision')} />
        <ActionButton icon={Image} label="Image Ready" onClick={() => setShotStatus(shot.shotId, 'Image Prompt Ready')} />
        <ActionButton icon={Film} label="Video Ready" onClick={() => setShotStatus(shot.shotId, 'Video Prompt Ready')} />
        <ActionButton icon={Archive} label="Generated" onClick={() => setShotStatus(shot.shotId, 'Generated')} />
        <ActionButton icon={Check} label="Final Approve" onClick={() => setShotStatus(shot.shotId, 'Final Approved')} />
        <ActionButton icon={RefreshCcw} label="Draft" onClick={() => setShotStatus(shot.shotId, 'Draft')} />
        <ActionButton icon={Clipboard} label="Copy Image" onClick={() => copy(`${shot.shotId} image`, shot.imagePromptCN)} />
        <ActionButton icon={Clipboard} label="Copy Video" onClick={() => copy(`${shot.shotId} video`, shot.videoPromptCN)} />
        <ActionButton icon={Clipboard} label="Copy Negative" onClick={() => copy(`${shot.shotId} negative`, shot.negativePromptCN)} />
      </div>
    </article>
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
  copy,
}: {
  selectedEpisode: string
  setSelectedEpisode: (episodeId: string) => void
  selectedShotId: string
  setSelectedShotId: (shotId: string) => void
  shotCards: ShotCard[]
  selectedShot: ShotCard
  copy: (label: string, text: string) => void
}) {
  const shots = shotCards.filter((shot) => shot.episodeId === selectedEpisode)
  return (
    <>
      <PageHeader eyebrow="Prompt Builder" title="提示詞工作台">
        <p>選擇 shot 後可檢查參考素材、複製 image/video/negative prompts，並做質素核對。</p>
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
          <div className="mt-4 space-y-2 text-sm">
            <Field label="Reference Assets" value={selectedShot.referenceAssets.join('、')} />
            <Field label="Shot Status" value={selectedShot.status} />
          </div>
          <h4 className="mt-5 font-bold">Prompt Quality Checklist</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {['蘇璃外觀一致', '包含 9:16', '一個清楚主體', '一個清楚動作', '情緒與燈光明確', '包含 negative prompt', '影片時長 5-10 秒，適合 AI 生成'].map((item) => (
              <p key={item} className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <PromptBox title="Image Prompt" content={selectedShot.imagePromptCN} onCopy={() => copy(`${selectedShot.shotId} image`, selectedShot.imagePromptCN)} />
          <PromptBox title="Video Prompt" content={selectedShot.videoPromptCN} onCopy={() => copy(`${selectedShot.shotId} video`, selectedShot.videoPromptCN)} />
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

function AssetLibraryPage({ assets, setAssetStatus }: { assets: typeof baseAssets; setAssetStatus: (assetId: string, status: AssetStatus) => void }) {
  return (
    <>
      <PageHeader eyebrow="Asset Library" title="素材庫">
        <p>V0.1 只追蹤素材狀態與建議路徑，不上傳檔案。Google Drive 連結與版本歷史留待 V0.2。</p>
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset.assetId} className="rounded-md border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{asset.name}</h3>
                <p className="mt-1 text-xs font-bold uppercase text-cyan-700">{asset.type}</p>
              </div>
              <Badge>{asset.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">{asset.description}</p>
            <p className="mt-3 break-words rounded-md bg-slate-50 p-3 text-xs text-slate-600">{asset.suggestedPath}</p>
            <p className="mt-3 text-sm text-slate-600">{asset.usageNotes}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {assetStatuses.map((status) => (
                <button key={status} className="btn-secondary" onClick={() => setAssetStatus(asset.assetId, status)} type="button">
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function ExportCenterPage({ episodes, shotCards, assets }: { episodes: typeof baseEpisodes; shotCards: ShotCard[]; assets: typeof baseAssets }) {
  const approvedVideoShots = shotCards.filter((shot) => ['Video Prompt Ready', 'Generated', 'Final Approved'].includes(shot.status))
  const exports = [
    ['Project Bible as Markdown', 'ai_drama_factory_project_bible.md', projectBibleMarkdown(projectBible), 'text/markdown;charset=utf-8'],
    ['Episode Concepts as Markdown', 'suli_e01_e03_episode_concepts.md', episodeConceptsMarkdown(episodes), 'text/markdown;charset=utf-8'],
    ['Beat Sheets as Markdown', 'suli_e01_e03_beat_sheets.md', beatSheetsMarkdown(episodes), 'text/markdown;charset=utf-8'],
    ['Shot Cards as JSON', 'suli_e01_e03_shot_cards.json', JSON.stringify(shotCards, null, 2), 'application/json;charset=utf-8'],
    ['All Image Prompts as TXT', 'suli_all_image_prompts.txt', promptsText(shotCards, 'imagePromptCN'), 'text/plain;charset=utf-8'],
    ['All Video Prompts as TXT', 'suli_all_video_prompts.txt', promptsText(shotCards, 'videoPromptCN'), 'text/plain;charset=utf-8'],
    ['Approved-only Video Prompts as TXT', 'suli_approved_video_prompts.txt', promptsText(approvedVideoShots, 'videoPromptCN'), 'text/plain;charset=utf-8'],
    ['Asset List as Markdown', 'suli_asset_library.md', assetsMarkdown(assets), 'text/markdown;charset=utf-8'],
  ] as const
  return (
    <>
      <PageHeader eyebrow="Export Center" title="輸出中心">
        <p>所有輸出都在瀏覽器下載，不需要 backend 或資料庫。</p>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {exports.map(([label, fileName, content, mimeType]) => (
          <button key={fileName} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-5 text-left hover:border-cyan-300 hover:bg-cyan-50" onClick={() => downloadTextFile(fileName, content, mimeType)} type="button">
            <span>
              <span className="block font-bold">{label}</span>
              <span className="mt-1 block text-sm text-slate-500">{fileName}</span>
            </span>
            <Download className="text-cyan-700" size={22} />
          </button>
        ))}
      </div>
      <section className="mt-6 rounded-md border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-lg font-bold">建議 Google Drive 結構</h3>
        <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          {projectBible.driveStructure.map((folder) => (
            <p key={folder} className="rounded-md bg-slate-50 p-3">
              {folder}
            </p>
          ))}
        </div>
      </section>
    </>
  )
}

export default App
