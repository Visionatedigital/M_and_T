
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.resolve('d:/m-t-growth-gateway/loans.json');

function analyzeGroups() {
    try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const loans = JSON.parse(rawData);

        console.log(`Total records in JSON: ${loans.length}`);

        const groups: Record<string, any[]> = {};

        // Group by 'Group'
        loans.forEach((loan: any) => {
            const groupName = loan['Group'];
            if (groupName) {
                if (!groups[groupName]) {
                    groups[groupName] = [];
                }
                groups[groupName].push(loan);
            }
        });

        const groupNames = Object.keys(groups);
        console.log(`Total unique groups found: ${groupNames.length}`);

        // Analyze a few groups
        console.log("\n--- Group Analysis ---");
        let groupsMultiMember = 0;
        let groupsSamePrincipal = 0;

        groupNames.slice(0, 10).forEach(name => {
            const members = groups[name];
            const principals = members.map(m => m['Principal']);
            const uniquePrincipals = [...new Set(principals)];

            if (members.length > 1) {
                groupsMultiMember++;
                if (uniquePrincipals.length === 1) {
                    groupsSamePrincipal++;
                }
            }

            console.log(`Group: "${name}"`);
            console.log(`  Members: ${members.length}`);
            console.log(`  Principals: ${principals.join(', ')}`);
            console.log(`  Sum of Principals: ${principals.reduce((a, b) => a + Number(b), 0)}`);
            console.log(`  Same Principal for all? ${uniquePrincipals.length === 1 ? 'YES' : 'NO'}`);
            console.log('---');
        });

        console.log(`\nSummary:`);
        console.log(`Groups with > 1 member: ${groupsMultiMember} (in sample of 10)`);
        console.log(`Groups with Identical Principal for all members: ${groupsSamePrincipal} (in sample of 10)`);

    } catch (error) {
        console.error("Error analyzing groups:", error);
    }
}

analyzeGroups();
