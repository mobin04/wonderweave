const { open } = require('lmdb');
const fs = require('fs');

const cachePath = './parcel-cache/data.mdb'; // Path to Parcel's cache database

async function extractCache() {
  const db = open({ path: cachePath, readonly: true });

  let recoveredFiles = [];
  for (const [key, value] of db.getRange()) {
    if (typeof key === 'string' && key.includes('.js')) {
      const filePath = `./recovered/${key.replace(/\//g, '_')}`;
      fs.writeFileSync(filePath, value);
      recoveredFiles.push(filePath);
    }
  }

  console.log('Recovered files:', recoveredFiles);
  db.close();
}

extractCache();
