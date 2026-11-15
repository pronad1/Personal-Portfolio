const fs = require('fs');
const path = require('path');
const vm = require('vm');

const kbPath = path.join(__dirname, '..', 'chatbot-knowledge.js');
const kbCode = fs.readFileSync(kbPath, 'utf8');

const appPath = path.join(__dirname, '..', 'admin', 'app.js');
const appCode = fs.readFileSync(appPath, 'utf8');

const context = {
  window: {},
  document: {
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  navigator: {},
  console: console
};
context.window = context;

vm.createContext(context);
vm.runInContext(kbCode, context);
context.window.PROSENJIT_KB = context.PROSENJIT_KB;

// Run app.js in context to access LocalDB
vm.runInContext(appCode + '\nthis.LocalDB = LocalDB;', context);

const tables = [
  'about', 'news', 'experience', 'education', 'publications',
  'projects', 'skills', 'skill_categories', 'awards',
  'certificates', 'competitive_programming', 'cp_meta', 'contests',
  'hackathons', 'coursework', 'contact_profiles', 'volunteering', 'media'
];

const data = {
  version: '1.0',
  updated_at: new Date().toISOString(),
  tables: {}
};

for (const t of tables) {
  data.tables[t] = context.LocalDB.getInitial(t);
}

const outDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'portfolio-data.json'), JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully generated data/portfolio-data.json with', Object.keys(data.tables).length, 'tables!');
