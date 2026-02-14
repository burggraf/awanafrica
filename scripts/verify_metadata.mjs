import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { execSync } from 'child_process';

const METADATA_FIELDS = [
    "Puggles",
    "Cubbies",
    "Sparks",
    "Flame",
    "Torch",
    "Truth Seekers",
    "Living God's Story",
    "T&T",
    "Jr. Varsity",
    "Trek",
    "Journey",
    "Descubrelo",
    "Building Healthy Families",
    "Total",
    "Leaders"
];

function verifyCsv(csvPath) {
    console.log(`Verifying ${csvPath}...`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < Math.min(records.length, 10); i++) {
        const record = records[i];
        const registrationNo = record['Registration #'];
        
        const output = execSync(`sqlite3 pb_data/data.db "SELECT metadata FROM clubs WHERE registration = '${registrationNo}';"`, { encoding: 'utf-8' }).trim();
        
        if (!output) {
            console.log(`[FAIL] ${registrationNo} not found in DB`);
            failCount++;
            continue;
        }

        const dbMetadata = JSON.parse(output);
        let match = true;
        METADATA_FIELDS.forEach(field => {
            const expected = parseInt(record[field] || 0, 10);
            const actual = dbMetadata[field];
            if (expected !== actual) {
                console.log(`[MISMATCH] ${registrationNo} field ${field}: Expected ${expected}, Actual ${actual}`);
                match = false;
            }
        });

        if (match) {
            console.log(`[OK] ${registrationNo}`);
            successCount++;
        } else {
            failCount++;
        }
    }
    console.log(`Verification for ${csvPath}: ${successCount} passed, ${failCount} failed (sampled first 10).`);
}

verifyCsv('Data-Lesotho.csv');
verifyCsv('Data-Madagascar.csv');
