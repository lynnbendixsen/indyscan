const fs = require('fs')

async function importFileToStorage (storage, filePath) {
  let lines = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
  for (const line of lines) {
    const tx = JSON.parse(line)
    console.log(`Importing tx: ${JSON.stringify(tx)}`)
    await storage.addTx(tx)
  }
}

module.exports.importFileToStorage = importFileToStorage
