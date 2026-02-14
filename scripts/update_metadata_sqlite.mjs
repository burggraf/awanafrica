import fs from 'fs';
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';

const DB_PATH = 'pb_data/data.db';
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

const db = new Database(DB_PATH);

function updateClubs(csvPath) {
    console.log(`Processing ${csvPath}...`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    const updateStmt = db.prepare('UPDATE clubs SET metadata = ?, updated = ? WHERE registration = ?');
    
    let updatedCount = 0;
    let missingCount = 0;

    const now = new Date().toISOString().replace('T', ' ').split('.')[0];

    db.transaction(() => {
        for (const record of records) {
            const registrationNo = record['Registration #'];
            if (!registrationNo) continue;

            const metadata = {};
            METADATA_FIELDS.forEach(field => {
                const val = record[field];
                metadata[field] = val !== undefined ? parseInt(val, 10) || 0 : 0;
            });

            const result = updateStmt.run(JSON.stringify(metadata), now, registrationNo);
            
            if (result.changes > 0) {
                updatedCount++;
            } else {
                missingCount++;
            }
        }
    })();

    console.log(`Finished ${csvPath}: ${updatedCount} updated, ${missingCount} missing.`);
}

try {
    updateClubs('Data-Lesotho.csv');
    updateClubs('Data-Madagascar.csv');
    console.log("Update completed.");
} catch (e) {
    console.error("Update failed:", e);
} finally {
    db.close();
}
