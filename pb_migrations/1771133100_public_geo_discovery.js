migrate((app) => {
  const countries = app.findCollectionByNameOrId("countries");
  const regions = app.findCollectionByNameOrId("regions");

  countries.listRule = "";
  countries.viewRule = "";
  regions.listRule = "";
  regions.viewRule = "";

  app.save(countries);
  app.save(regions);
}, (app) => {
  const countries = app.findCollectionByNameOrId("countries");
  const regions = app.findCollectionByNameOrId("regions");

  countries.listRule = "@request.auth.id != ''";
  countries.viewRule = "@request.auth.id != ''";
  regions.listRule = "@request.auth.id != ''";
  regions.viewRule = "@request.auth.id != ''";

  app.save(countries);
  app.save(regions);
})
