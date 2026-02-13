migrate((app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  
  const field = collection.fields.getByName("charter");
  if (field) {
    field.name = "registration";
    app.save(collection);
  }
}, (app) => {
  const collection = app.findCollectionByNameOrId("clubs");
  const field = collection.fields.getByName("registration");
  if (field) {
    field.name = "charter";
    app.save(collection);
  }
})
