migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  const venueField = collection.fields.getByName("venue");
  if (venueField) {
    venueField.values = [
      "Church",
      "School",
      "Community Center",
      "Christian Camp",
      "Children's Ministry Office",
      "Mission Compound",
      "Refugee Camp",
      "Youth Center",
      "Orphanage",
      "Other"
    ];
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  const venueField = collection.fields.getByName("venue");
  if (venueField) {
    venueField.values = [
      "Church",
      "School",
      "Community Center",
      "Christian Camp",
      "Other"
    ];
  }

  return app.save(collection);
})
