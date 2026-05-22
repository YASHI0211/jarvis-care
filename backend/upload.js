const { MongoClient } = require('mongodb')
const fs = require('fs')
const MONGO_URI = "mongodb+srv://csai23017_db_user:c6VcSdUDP7iHZR4j@jarvis-care.udczq4t.mongodb.net/?appName=jarvis-care"

async function upload() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  console.log("Connected to MongoDB!")

  const db = client.db("jarvis_care")
  const collection = db.collection("remedies")

  const data = JSON.parse(fs.readFileSync('./data/boericke_remedies.json', 'utf-8'))
  const filtered = data.filter(r => {
    if (!r.source_url || !r.general) return false
    if (r.general.length < 50) return false
    const lastPart = r.source_url.split('/').pop()
    if (lastPart.length <= 6 && lastPart.endsWith('.htm')) return false
    return true
  })

  await collection.deleteMany({})
  await collection.insertMany(filtered)
  console.log(`Uploaded ${filtered.length} remedies!`)
  await client.close()
}

upload().catch(console.error)