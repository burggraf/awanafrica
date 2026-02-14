import PocketBase from 'pocketbase';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const PB_URL = 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

// These are the metadata fields to extract
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

async function updateClubs(csvPath) {
    console.log(`Processing ${csvPath}...`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    for (const record of records) {
        const registrationNo = record['Registration #'];
        if (!registrationNo) continue;

        try {
            // Find the club by registration number
            const result = await pb.collection('clubs').getFirstListItem(`registration="${registrationNo}"`);
            
            const metadata = {};
            METADATA_FIELDS.forEach(field => {
                const val = record[field];
                metadata[field] = val !== undefined ? parseInt(val, 10) || 0 : 0;
            });

            await pb.collection('clubs').update(result.id, {
                metadata: metadata
            });
            console.log(`Updated club: ${registrationNo} (${record['Name']})`);
        } catch (e) {
            if (e.status === 404) {
                console.warn(`Club not found in DB: ${registrationNo}`);
            } else {
                console.error(`Error updating club ${registrationNo}:`, e.message);
            }
        }
    }
}

async function run() {
    try {
        console.log("Starting update...");
        // Auto-authenticate as the first superuser found
        await pb.collection('_superusers').authWithPassword('admin@example.com', '1234567890');
        await updateClubs('Data-Lesotho.csv');
        await updateClubs('Data-Madagascar.csv');
        console.log("Done.");
    } catch (e) {
        console.error("Run failed:", e);
    }
}

run();
