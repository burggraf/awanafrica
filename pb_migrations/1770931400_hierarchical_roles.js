migrate((app) => {
  // 1. Create admin_roles collection
  const adminRoles = new Collection({
    id: "adminroles0001",
    name: "admin_roles",
    type: "base",
    fields: [
      { name: "user", type: "relation", collectionId: "_pb_users_auth_", required: true, cascadeDelete: true },
      { name: "role", type: "select", values: ["Global", "Country", "Region"], required: true },
      { name: "country", type: "relation", collectionId: "countries000001", required: false, cascadeDelete: true },
      { name: "region", type: "relation", collectionId: "regions00000001", required: false, cascadeDelete: true }
    ],
    // Only Global Admins can manage admin roles
    listRule: "@request.auth.id != '' && (@request.auth.id = user.id || @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global')",
    viewRule: "@request.auth.id != '' && (@request.auth.id = user.id || @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global')",
    createRule: "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'",
    updateRule: "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'",
    deleteRule: "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'",
    indexes: [
      "CREATE UNIQUE INDEX `idx_user_role_target` ON `admin_roles` (`user`, `role`, `country`, `region`)"
    ]
  });
  app.save(adminRoles);

  // 2. Update events collection
  const events = app.findCollectionByNameOrId("events000000001");
  
  // Make club optional
  const clubField = events.fields.getByName("club");
  clubField.required = false;

  // Add region relation
  events.fields.add(new RelationField({
    name: "region",
    type: "relation",
    collectionId: "regions00000001",
    required: false,
    cascadeDelete: true
  }));

  // Update event rules for hierarchical access
  // List/View: User can see if they are a member of the club, OR if it's a regional event for their region
  events.listRule = "@request.auth.id != '' && (" +
    "club.club_memberships_via_club.user.id ?= @request.auth.id || " +
    "(region.id != '' && @collection.club_memberships.user.id ?= @request.auth.id && @collection.club_memberships.club.region.id ?= region.id)" +
    ")";
  events.viewRule = events.listRule;

  // Create/Update/Delete rules for events
  events.createRule = "@request.auth.id != '' && (" +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    "@collection.admin_roles.role ?= 'Global' || " +
    "(@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= club.region.country || @collection.admin_roles.country ?= region.country)) || " +
    "(@collection.admin_roles.role ?= 'Region' && (@collection.admin_roles.region ?= club.region || @collection.admin_roles.region ?= region))" +
    ") || " +
    "club.club_memberships_via_club.user.id ?= @request.auth.id && club.club_memberships_via_club.roles ?~ 'Director' " +
    ")";
  events.updateRule = events.createRule;
  events.deleteRule = events.createRule;

  app.save(events);

  // 3. Update regions/countries/clubs rules
  const countries = app.findCollectionByNameOrId("countries000001");
  countries.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'";
  countries.updateRule = countries.createRule;
  countries.deleteRule = countries.createRule;
  app.save(countries);

  const regions = app.findCollectionByNameOrId("regions00000001");
  regions.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && (" +
    "@collection.admin_roles.role ?= 'Global' || " +
    "(@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= country)" +
    ")";
  regions.updateRule = regions.createRule;
  regions.deleteRule = regions.createRule;
  app.save(regions);

  const clubs = app.findCollectionByNameOrId("clubs0000000001");
  clubs.createRule = "@request.auth.id != '' && (" +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    "@collection.admin_roles.role ?= 'Global' || " +
    "(@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= region.country) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")" +
    ")";
  clubs.updateRule = clubs.createRule;
  clubs.deleteRule = clubs.createRule;
  app.save(clubs);

}, (app) => {
  const adminRoles = app.findCollectionByNameOrId("adminroles0001");
  if (adminRoles) app.delete(adminRoles);

  const events = app.findCollectionByNameOrId("events000000001");
  const clubField = events.fields.getByName("club");
  clubField.required = true;
  events.fields.removeByName("region");
  
  // Revert to old rules
  events.listRule = "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id";
  events.viewRule = events.listRule;
  events.createRule = "";
  events.updateRule = "";
  events.deleteRule = "";
  app.save(events);

  const countries = app.findCollectionByNameOrId("countries000001");
  countries.createRule = "";
  countries.updateRule = "";
  countries.deleteRule = "";
  app.save(countries);

  const regions = app.findCollectionByNameOrId("regions00000001");
  regions.createRule = "";
  regions.updateRule = "";
  regions.deleteRule = "";
  app.save(regions);

  const clubs = app.findCollectionByNameOrId("clubs0000000001");
  clubs.createRule = "";
  clubs.updateRule = "";
  clubs.deleteRule = "";
  app.save(clubs);
})
