import Chatbot from "./Chatbot"
import { useState, useEffect, useCallback } from "react"
import { Search, X, ChevronRight, Leaf, AlertCircle, Loader2 } from "lucide-react"

const API = import.meta.env.VITE_API_URL || "/api"

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function Badge({ text, variant = "default" }) {
  const styles = {
    default: "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50",
    amber: "bg-amber-900/40 text-amber-300 border border-amber-700/50",
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[variant]}`}>
      {text}
    </span>
  )
}

function RemedyCard({ remedy, onClick }) {
  return (
    <div
      onClick={() => onClick(remedy)}
      className="group bg-white border border-blue-100 rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col min-h-[170px]"
      style={{ boxShadow: '0 2px 8px 0 rgba(30, 136, 229, 0.06)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
              {remedy.abbreviation}
            </span>
            <span className="text-xs text-blue-300 font-bold">{remedy.letter}</span>
          </div>
          <h3 className="text-blue-900 font-semibold text-base leading-snug truncate group-hover:text-blue-600 transition-colors">
            {remedy.full_name}
          </h3>
          {remedy.common_name && (
            <p className="text-blue-400 text-xs mt-0.5 italic">{remedy.common_name}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
      </div>
      {remedy.general && (
        <p className="text-blue-400 text-xs mt-3 line-clamp-2 leading-relaxed">
          {remedy.general}
        </p>
      )}
      {remedy.keywords && remedy.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {remedy.keywords.slice(0, 4).map((kw) => (
            <Badge key={kw} text={kw} />
          ))}
        </div>
      )}
    </div>
  )
}

function RemedyDetail({ remedy, onClose }) {
  const [activeTab, setActiveTab] = useState("overview")
  const sectionKeys = Object.keys(remedy.sections || {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-800/50">
                {remedy.abbreviation}
              </span>
              {remedy.potencies && remedy.potencies.map((p) => (
                <Badge key={p} text={p} variant="amber" />
              ))}
            </div>
            <h2 className="text-white font-bold text-lg leading-tight">{remedy.full_name}</h2>
            {remedy.common_name && (
              <p className="text-emerald-400 text-sm mt-1 italic">{remedy.common_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-800 overflow-x-auto">
          {["overview", ...sectionKeys].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-emerald-900/40 text-emerald-300 border border-b-0 border-emerald-700/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" ? (
            <div className="space-y-4">
              {remedy.general && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">General</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{remedy.general}</p>
                </div>
              )}
              {remedy.keywords && remedy.keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {remedy.keywords.map((kw) => (
                      <Badge key={kw} text={kw} />
                    ))}
                  </div>
                </div>
              )}
              {remedy.relationships && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Relationships</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{remedy.relationships}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-300 text-sm leading-relaxed">
              {remedy.sections[activeTab]}
            </p>
          )}
        </div>
        <div className="px-6 py-3 border-t border-slate-800">
          <a
            href={remedy.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            View source
          </a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [remedies, setRemedies] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [selectedLetter, setSelectedLetter] = useState("")
  const [letters, setLetters] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedRemedy, setSelectedRemedy] = useState(null)
  const debouncedSearch = useDebounce(search, 400)
  const LIMIT = 18

  useEffect(() => {
    fetch(`${API}/letters`)
      .then((r) => r.json())
      .then(setLetters)
      .catch(() => {})
  }, [])

  const fetchRemedies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (debouncedSearch) params.set("search", debouncedSearch)
      if (selectedLetter) params.set("letter", selectedLetter)
      const res = await fetch(`${API}/remedies?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRemedies(data.results)
      setTotal(data.total)
    } catch {
      setError("Could not load remedies. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedLetter, page])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedLetter])

  useEffect(() => {
    fetchRemedies()
  }, [fetchRemedies])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur shadow-md border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center shadow">
              <Leaf className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-blue-900 font-extrabold text-2xl leading-none tracking-tight">Jarvis.care</h1>
              <p className="text-blue-500 text-xs font-medium">Remedy Explorer</p>
            </div>
          </div>
          <div className="flex-1 max-w-lg w-full relative mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Search remedies or symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-blue-200 rounded-full pl-12 pr-4 py-2 text-base text-blue-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-blue-400 hover:text-blue-600" />
              </button>
            )}
          </div>
          <div className="text-xs text-blue-500 whitespace-nowrap font-semibold">
            <span className="text-blue-700 font-bold">{total}</span> remedies
          </div>
        </div>
        {/* Letter Bar */}
        <div className="max-w-5xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          <button
            onClick={() => setSelectedLetter("")}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-bold transition-colors ${
              !selectedLetter
                ? "bg-blue-600 text-white shadow"
                : "text-blue-600 hover:bg-blue-100"
            }`}
          >
            All
          </button>
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLetter(l === selectedLetter ? "" : l)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-mono font-bold transition-colors ${
                selectedLetter === l
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : remedies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400">No remedies found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remedies.map((r) => (
                <RemedyCard key={r.source_url} remedy={r} onClick={setSelectedRemedy} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-400">
                  Page <span className="text-white font-medium">{page}</span> of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-sm px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {selectedRemedy && (
        <RemedyDetail remedy={selectedRemedy} onClose={() => setSelectedRemedy(null)} />
      )}
      <Chatbot />
    </div>
  )
}
