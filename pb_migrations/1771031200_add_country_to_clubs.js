migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");

  // 1. Add country field using correct relation field syntax
  collection.fields.add(new Field({
    name: "country",
    type: "relation",
    collectionId: "countries000001",
    required: false,
    maxSelect: 1
  }));

  app.save(collection);

  // 2. Backfill country data from region.country
  const clubs = app.findAllRecords("clubs");
  for (const club of clubs) {
    const regionId = club.get("region");
    if (regionId) {
      try {
        const region = app.findRecordById("regions", regionId);
        const countryId = region.get("country");
        if (countryId) {
          club.set("country", countryId);
          app.save(club);
        }
      } catch (e) {}
    }
  }

  // 3. Make country required
  const field = collection.fields.getByName("country");
  if (field) {
    field.required = true;
    app.save(collection);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.removeByName("country");
  return app.save(collection);
})
