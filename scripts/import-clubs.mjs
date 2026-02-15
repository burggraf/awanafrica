import fs from 'fs';
import { parse } from 'csv-parse/sync';
import PocketBase from 'pocketbase';

const LOCAL_PB_URL = 'http://127.0.0.1:8090';

async function importClubs(filePath, countryName) {
    const pb = new PocketBase(LOCAL_PB_URL);

    // 1. Get Country ID
    let country;
    try {
        country = await pb.collection('countries').getFirstListItem(`name="${countryName}"`, { requestKey: null });
    } catch (e) {
        console.log(`Country ${countryName} not found, creating...`);
        country = await pb.collection('countries').create({ name: countryName }, { requestKey: null });
    }

    // 2. Read and parse CSV
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} records in ${filePath}`);

    // Cache regions to avoid redundant lookups/creates
    const regionCache = {};

    for (const row of records) {
        const regionName = row.Location || 'Unknown';
        if (!regionCache[regionName]) {
            try {
                const region = await pb.collection('regions').getFirstListItem(`name="${regionName}" && country="${country.id}"`, { requestKey: null });
                regionCache[regionName] = region.id;
            } catch (e) {
                const region = await pb.collection('regions').create({ 
                    name: regionName, 
                    country: country.id 
                }, { requestKey: null });
                regionCache[regionName] = region.id;
            }
        }

        // Parse expiration: "Jan 2026" -> "2026-01-01 00:00:00"
        let expiration = null;
        if (row['Expiration Date']) {
            const parts = row['Expiration Date'].split(' ');
            if (parts.length === 2) {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const month = monthNames.indexOf(parts[0]) + 1;
                const year = parts[1];
                if (month > 0) {
                    expiration = `${year}-${month.toString().padStart(2, '0')}-01 00:00:00`;
                }
            }
        }

        const clubData = {
            name: row.Name,
            registration: row['Registration #'],
            salesforce: row['Salesforce #'],
            venue: row.Venue === 'Church' ? 'Church' : (row.Venue === 'School' ? 'School' : 'Other'),
            type: 'Leader Based', // Matches exact case from pb_migrations
            denomination: row.Denomination,
            location: row.Location,
            region: regionCache[regionName],
            expiration: expiration,
            missionary: null, // Local server requirement
            metadata: {
                puggles: parseInt(row.Puggles) || 0,
                cubbies: parseInt(row.Cubbies) || 0,
                sparks: parseInt(row.Sparks) || 0,
                flame: parseInt(row.Flame) || 0,
                torch: parseInt(row.Torch) || 0,
                truth_seekers: parseInt(row['Truth Seekers']) || 0,
                living_gods_story: parseInt(row["Living God's Story"]) || 0,
                tt: parseInt(row['T&T']) || 0,
                jr_varsity: parseInt(row['Jr. Varsity']) || 0,
                trek: parseInt(row.Trek) || 0,
                journey: parseInt(row.Journey) || 0,
                descubrelo: parseInt(row.Descubrelo) || 0,
                building_healthy_families: parseInt(row['Building Healthy Families']) || 0,
                total_clubbers: parseInt(row.Total) || 0,
                total_leaders: parseInt(row.Leaders) || 0,
                csv_missionary: row.Missionary,
                csv_created_date: row['Created Date']
            }
        };

        try {
            await pb.collection('clubs').create(clubData, { requestKey: null });
            console.log(`Imported: ${row.Name}`);
        } catch (err) {
            console.error(`Failed to import ${row.Name}:`, err.response?.data || err);
        }
    }
}

async function run() {
    try {
        await importClubs('Data-Lesotho.csv', 'Lesotho');
        await importClubs('Data-Madagascar.csv', 'Madagascar');
        console.log('Local import complete.');
    } catch (err) {
        console.error('Import failed:', err);
    }
}

run();
