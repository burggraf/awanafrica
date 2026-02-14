import fs from 'fs';
import { parse } from 'csv-parse/sync';

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

function generateSql(csvPath) {
    console.log(`-- Generating SQL for ${csvPath}`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    for (const record of records) {
        const registrationNo = record['Registration #'];
        if (!registrationNo) continue;

        const metadata = {};
        METADATA_FIELDS.forEach(field => {
            const val = record[field];
            metadata[field] = val !== undefined ? parseInt(val, 10) || 0 : 0;
        });

        const metadataJson = JSON.stringify(metadata).replace(/'/g, "''");
        console.log(`UPDATE clubs SET metadata = '${metadataJson}' WHERE registration = '${registrationNo}';`);
    }
}

console.log("BEGIN TRANSACTION;");
generateSql('Data-Lesotho.csv');
generateSql('Data-Madagascar.csv');
console.log("COMMIT;");
