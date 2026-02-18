const fs = require('fs');
const data = fs.readFileSync('public/MT MICROFINANCE Admin 33.xlsx');
const text = data.toString('utf8');

const tMatches = text.match(/<t[^>]*>([^<]+)<\/t>/g);
console.log(`Found ${tMatches ? tMatches.length : 0} <t> matches.`);

if (tMatches) {
    tMatches.slice(0, 100).forEach(m => {
        const content = m.replace(/<t[^>]*>|<\/t>/g, '');
        console.log(content);
    });
}

// Search for Mukisa
if (text.includes('Mukisa')) {
    console.log('FOUND "Mukisa" in raw text!');
} else {
    console.log('"Mukisa" NOT found in raw text.');
}
