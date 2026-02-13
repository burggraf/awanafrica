migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  // Set name and email to presentable
  const nameField = collection.fields.getByName("name");
  if (nameField) nameField.presentable = true;

  const emailField = collection.fields.getByName("email");
  if (emailField) emailField.presentable = true;

  // Unset preferences from being presentable to reduce clutter in relation previews
  const langField = collection.fields.getByName("language");
  if (langField) langField.presentable = false;

  const localeField = collection.fields.getByName("locale");
  if (localeField) localeField.presentable = false;

  const themeField = collection.fields.getByName("theme");
  if (themeField) themeField.presentable = false;

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  
  const nameField = collection.fields.getByName("name");
  if (nameField) nameField.presentable = false;

  const emailField = collection.fields.getByName("email");
  if (emailField) emailField.presentable = false;

  const langField = collection.fields.getByName("language");
  if (langField) langField.presentable = true;

  const localeField = collection.fields.getByName("locale");
  if (localeField) localeField.presentable = true;

  const themeField = collection.fields.getByName("theme");
  if (themeField) themeField.presentable = true;

  return app.save(collection);
})
