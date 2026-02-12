migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.add(new Field({
    name: "charter",
    type: "number",
    unique: true
  }));
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.removeByName("charter");
  return app.save(collection);
})
