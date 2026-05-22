const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const dataPath = path.join(__dirname, 'data', 'boericke_remedies.json')
const allRemedies = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

function extractNameFromGeneral(general, abbreviation) {
  if (!general) return abbreviation
  const match = general.match(/Médi-T\s+([A-Z][A-Z\s\-]+(?:\([^)]+\))?)\s+[A-Z][a-z]/)
  if (match) return match[1].trim()
  return abbreviation
}

const remedies = allRemedies.filter(r => {
  if (!r.source_url || !r.general) return false
  if (r.general.length < 50) return false
  const lastPart = r.source_url.split('/').pop()
  if (lastPart.length <= 6 && lastPart.endsWith('.htm')) return false
  if (r.source_url.endsWith('index.htm')) return false
  return true
}).map(r => {
  const full_name = extractNameFromGeneral(r.general, r.abbreviation)
  const general = r.general.replace(/^.*?Médi-T\s+/, '').replace(/^[A-Z][A-Z\s\-]+\s+/, '').trim()
  return { ...r, full_name, general }
})

app.get('/api/remedies', (req, res) => {
  const { search, letter, page = 1, limit = 20 } = req.query
  let filtered = remedies
  if (letter) filtered = filtered.filter(r => r.letter === letter.toUpperCase())
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(r =>
      r.full_name.toLowerCase().includes(q) ||
      (r.common_name && r.common_name.toLowerCase().includes(q)) ||
      (r.keywords && r.keywords.some(k => k.includes(q)))
    )
  }
  const total = filtered.length
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + parseInt(limit))
  res.json({ total, page: parseInt(page), limit: parseInt(limit), results: paginated })
})

app.get('/api/remedies/:abbreviation', (req, res) => {
  const remedy = remedies.find(r => r.abbreviation === req.params.abbreviation.toUpperCase())
  if (!remedy) return res.status(404).json({ error: 'Remedy not found' })
  res.json(remedy)
})

app.get('/api/letters', (req, res) => {
  const letters = [...new Set(remedies.map(r => r.letter))].sort()
  res.json(letters)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})