const fs = require('fs');

const number = 100;
const nomi = [];
for (let i = 1; i <= number; i++)
    nomi.push(`Nome${i}`);

// Scrivi i nomi in un file .txt
fs.writeFileSync(`nomi${number}.txt`, nomi.join('\n'), 'utf8');

console.log(`✅ File nomi${number}.txt generato con successo!`);
