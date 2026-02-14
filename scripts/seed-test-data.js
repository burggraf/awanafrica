/**
* AwanAfrica Test Data Seeder
* Run via: ./pocketbase run scripts/seed-test-data.js
*/

// Bounding boxes for major countries (MinLat, MaxLat, MinLng, MaxLng)
const countryBounds = {
  'TZ': [-11.75, -1.05, 29.34, 40.43],
  'KE': [-4.90, 4.62, 33.91, 41.90],
  'ZM': [-17.96, -8.23, 21.88, 33.48],
  'ZW': [-22.27, -15.50, 25.26, 32.85],
  'LS': [-30.68, -28.57, 27.01, 29.47],
  'MG': [-25.61, -11.95, 43.21, 50.48],
};

const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

// This logic is wrapped so it can be called by PocketBase's JS runner
module.exports = (app) => {
  console.log(">>> Starting Test Data Seeding...");

  const countriesColl = app.findCollectionByNameOrId("countries");
  const regionsColl = app.findCollectionByNameOrId("regions");
  const clubsColl = app.findCollectionByNameOrId("clubs");

  // 1. Seed Base Countries
  const countryData = [
    { name: "Tanzania", isoCode: "TZ" },
    { name: "Kenya", isoCode: "KE" },
    { name: "Zambia", isoCode: "ZM" },
    { name: "Zimbabwe", isoCode: "ZW" }
  ];

  for (const c of countryData) {
    try {
      app.findFirstRecordByFilter("countries", `isoCode = "${c.isoCode}"`);
    } catch (e) {
      console.log(`Creating country: ${c.name}`);
      const record = new Record(countriesColl, { name: c.name, isoCode: c.isoCode });
      app.save(record);
    }
  }

  // 2. Ensure Test Club exists for E2E
  let tz = app.findFirstRecordByFilter("countries", "isoCode = 'TZ'");
  let arusha;
  try {
    arusha = app.findFirstRecordByFilter("regions", "name = 'Arusha'");
  } catch (e) {
    console.log("Creating region: Arusha");
    arusha = new Record(regionsColl, { id: "arusha000000001", name: "Arusha", country: tz.id });
    app.save(arusha);
  }

  try {
    app.findFirstRecordByFilter("clubs", "joinCode = 'AW1234'");
  } catch (e) {
    console.log("Creating Test Club: Test Club Arusha (AW1234)");
    const club = new Record(clubsColl, {
      id: "testclub0000001",
      name: "Test Club Arusha",
      registration: "TZ000001",
      joinCode: "AW1234",
      region: arusha.id,
      country: tz.id,
      venue: "Church",
      type: "Leader Based",
      active: true
    });
    app.save(club);
  }

  // 3. Randomize Geodata for all clubs
  console.log("Randomizing club coordinates...");
  const records = app.findAllRecords("clubs");
  for (const record of records) {
    const countryId = record.get("country");
    let isoCode = "TZ"; // Default

    if (countryId) {
      try {
        const country = app.findRecordById("countries", countryId);
        isoCode = country.get("isoCode") || "TZ";
      } catch (e) {}
    }

    const bounds = countryBounds[isoCode] || countryBounds['TZ'];
    record.set("lat", getRandomInRange(bounds[0], bounds[1]));
    record.set("lng", getRandomInRange(bounds[2], bounds[3]));
    
    if (!record.get("joinCode")) {
      record.set("joinCode", Math.random().toString(36).substring(2, 8).toUpperCase());
    }

    app.save(record);
  }

  console.log(">>> Seeding Complete.");
};
