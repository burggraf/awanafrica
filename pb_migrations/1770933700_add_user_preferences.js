migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.fields.add(new Field({
    name: "language",
    type: "text",
    required: false,
    presentable: true,
  }));

  collection.fields.add(new Field({
    name: "locale",
    type: "text",
    required: false,
    presentable: true,
  }));

  collection.fields.add(new Field({
    name: "theme",
    type: "text",
    required: false,
    presentable: true,
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  collection.fields.removeByName("language");
  collection.fields.removeByName("locale");
  collection.fields.removeByName("theme");

  return app.save(collection);
})
