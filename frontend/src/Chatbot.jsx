import { useState } from "react"

const API = import.meta.env.VITE_API_URL || "/api"

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello! 🌿 I'm Dr. Jarvis, your homoeopathic assistant. Tell me your symptoms or ask about any remedy!" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = { role: "user", text: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, an error occurred. Please try again!" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-blue-100">
          {/* Header */}
          <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <p className="font-semibold text-sm">Dr. Jarvis</p>
              <p className="text-xs opacity-80">Homoeopathic Assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-blue-50 text-gray-700 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-blue-50 text-gray-400 px-3 py-2 rounded-2xl text-sm rounded-bl-none">
                  Dr. Jarvis soch raha hai... 🤔
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-blue-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Symptoms likhो..."
              className="flex-1 border border-blue-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}