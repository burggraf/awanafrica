migrate((app) => {
  // 1. Identify all Lesotho duplicates using the correct findRecordsByFilter syntax
  const countries = app.findRecordsByFilter("countries", "name = 'Lesotho'");
  
  // Find the one with clubs (the 'canonical' one)
  let canonicalId = "";
  const duplicates = [];
  
  for (const country of countries) {
    let hasData = false;
    try {
      app.findFirstRecordByFilter("clubs", `country = "${country.id}"`);
      hasData = true;
    } catch (e) {}

    if (!hasData) {
      try {
        app.findFirstRecordByFilter("regions", `country = "${country.id}"`);
        hasData = true;
      } catch (e) {}
    }
    
    if (hasData) {
      if (!canonicalId) {
        canonicalId = country.id;
        console.log(`Setting canonical Lesotho to: ${canonicalId}`);
      } else {
        duplicates.push(country.id);
      }
    } else {
      duplicates.push(country.id);
    }
  }

  if (!canonicalId && countries.length > 0) {
    canonicalId = countries[0].id;
  }

  if (canonicalId) {
    // 2. Move any straggler clubs or regions to the canonical ID
    for (const dupId of duplicates) {
      if (dupId === canonicalId) continue;
      
      const clubs = app.findRecordsByFilter("clubs", `country = "${dupId}"`);
      for (const club of clubs) {
        club.set("country", canonicalId);
        app.save(club);
      }
      
      const regions = app.findRecordsByFilter("regions", `country = "${dupId}"`);
      for (const region of regions) {
        region.set("country", canonicalId);
        app.save(region);
      }

      // 3. Delete the duplicate country record
      const record = app.findRecordById("countries", dupId);
      app.delete(record);
      console.log(`Deleted duplicate Lesotho: ${dupId}`);
    }
  }
}, (app) => {
})
