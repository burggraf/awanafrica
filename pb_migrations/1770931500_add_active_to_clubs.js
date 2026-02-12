migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.add(new Field({
    name: "active",
    type: "bool",
    defaultValue: true
  }));
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  collection.fields.removeByName("active");
  return app.save(collection);
})
