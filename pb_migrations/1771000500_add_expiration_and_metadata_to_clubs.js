migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.add(new Field({
    name: "expiration",
    type: "date"
  }));

  collection.fields.add(new Field({
    name: "metadata",
    type: "json"
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  collection.fields.removeByName("expiration");
  collection.fields.removeByName("metadata");

  return app.save(collection);
})
