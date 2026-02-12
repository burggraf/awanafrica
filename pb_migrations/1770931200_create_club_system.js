migrate((app) => {
  const countries = new Collection({
    id: "countries000001",
    name: "countries",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true, unique: true },
      { name: "isoCode", type: "text", unique: true }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
  });
  app.save(countries);

  const regions = new Collection({
    id: "regions00000001",
    name: "regions",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "country", type: "relation", collectionId: "countries000001", required: true, cascadeDelete: true }
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
  });
  app.save(regions);

  const clubs = new Collection({
    id: "clubs0000000001",
    name: "clubs",
    type: "base",
    fields: [
      { name: "name", type: "text", required: true },
      { name: "type", type: "select", values: ["church", "school", "other"], required: true },
      { name: "region", type: "relation", collectionId: "regions00000001", required: true },
      { name: "address", type: "text" },
      { name: "timezone", type: "text", defaultValue: "UTC" }
    ],
  });
  app.save(clubs);

  const memberships = new Collection({
    id: "memberships0001",
    name: "club_memberships",
    type: "base",
    fields: [
      { name: "user", type: "relation", collectionId: "_pb_users_auth_", required: true, cascadeDelete: true },
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "roles", type: "select", values: ["Director", "Secretary", "Treasurer", "Leader"], maxSelect: 4, required: true }
    ],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
  });
  app.save(memberships);

  const programs = new Collection({
    id: "programs0000001",
    name: "programs",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
    viewRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });
  app.save(programs);

  // Now update clubs with rules
  clubs.listRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  clubs.viewRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  app.save(clubs);
}, (app) => {
  const collections = ["programs", "club_memberships", "clubs", "regions", "countries"];
  for (const name of collections) {
    const collection = app.findCollectionByNameOrId(name);
    if (collection) app.delete(collection);
  }
})
