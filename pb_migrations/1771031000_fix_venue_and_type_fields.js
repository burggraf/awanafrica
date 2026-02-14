migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  // The 'type' field exists but we want it to be 'venue' with specific values
  const typeField = collection.fields.getByName("type");
  
  if (typeField) {
    typeField.name = "venue";
    typeField.values = ["Church", "School", "Community Center", "Christian Camp", "Other"];
    typeField.required = true;
    typeField.defaultValue = "Church";
  }

  // Now add a NEW 'type' field for "Leader Based" etc.
  collection.fields.add(new Field({
    name: "type",
    type: "select",
    values: ["Leader Based", "Other"],
    required: true,
    defaultValue: "Leader Based"
  }));

  return app.save(collection);
}, (app) => {
  // Reverting would be complex
})
