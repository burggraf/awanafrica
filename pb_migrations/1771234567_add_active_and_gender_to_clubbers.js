migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubbers");

  // Add active field (boolean)
  collection.fields.add(new Field({
    name: "active",
    type: "bool",
    defaultValue: true,
  }));

  // Add gender field (select)
  collection.fields.add(new Field({
    name: "gender",
    type: "select",
    values: ["Male", "Female"],
    required: false,
    maxSelect: 1
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubbers");

  collection.fields.removeByName("active");
  collection.fields.removeByName("gender");

  return app.save(collection);
})
