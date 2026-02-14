migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // Explicitly add 'venue' field
  collection.fields.add(new Field({
    name: "venue",
    type: "select",
    values: ["Church", "School", "Community Center", "Christian Camp", "Other"],
    required: true,
    defaultValue: "Church"
  }));

  // Ensure 'type' field exists with correct values
  const typeField = collection.fields.getByName("type");
  if (typeField) {
    typeField.values = ["Leader Based", "Other"];
    typeField.defaultValue = "Leader Based";
  } else {
    collection.fields.add(new Field({
      name: "type",
      type: "select",
      values: ["Leader Based", "Other"],
      required: true,
      defaultValue: "Leader Based"
    }));
  }

  return app.save(collection);
}, (app) => {
})
