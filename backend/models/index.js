// backend/models/index.js
const fs = require('fs');
const path = require('path');

const modelsDir = __dirname;

fs.readdirSync(modelsDir)
  .filter(
    (f) =>
      f.endsWith('.js') &&
      f !== 'index.js' &&              // don't import self
      !f.startsWith('.')               // ignore hidden files
  )
  .forEach((file) => {
    // Require each model file so mongoose.model(...) runs
    require(path.join(modelsDir, file));
  });

console.log('✅ Models registered:', 
  fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js') && f !== 'index.js'));
