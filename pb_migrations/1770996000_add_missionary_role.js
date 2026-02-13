migrate((app) => {
  const adminRoles = app.findCollectionByNameOrId("admin_roles");
  const roleField = adminRoles.fields.getByName("role");
  
  // Add Missionary to role values
  if (!roleField.values.includes("Missionary")) {
    roleField.values = [...roleField.values, "Missionary"];
  }
  app.save(adminRoles);

  // Update access rules to include Missionary wherever Global is used
  const globalOrMissionary = "(@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary')";

  // 1. admin_roles rules
  adminRoles.listRule = "@request.auth.id != '' && (" +
    "user.id = @request.auth.id || " +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    globalOrMissionary + " || " +
    "(@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")" +
    ")";
  adminRoles.viewRule = adminRoles.listRule;
  adminRoles.createRule = "@request.auth.id != '' && (" +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    globalOrMissionary + " || " +
    "(@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")" +
    ")";
  adminRoles.updateRule = adminRoles.createRule;
  adminRoles.deleteRule = adminRoles.createRule;
  app.save(adminRoles);

  // 2. countries rules
  const countries = app.findCollectionByNameOrId("countries");
  countries.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && " + globalOrMissionary;
  countries.updateRule = countries.createRule;
  countries.deleteRule = countries.createRule;
  app.save(countries);

  // 3. regions rules
  const regions = app.findCollectionByNameOrId("regions");
  regions.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && (" +
    globalOrMissionary + " || " +
    "(@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= country)" +
    ")";
  regions.updateRule = regions.createRule;
  regions.deleteRule = regions.createRule;
  app.save(regions);

  // 4. clubs rules
  const clubs = app.findCollectionByNameOrId("clubs");
  const adminCondition = `(
    @collection.admin_roles.user ?= @request.auth.id && (
      ${globalOrMissionary} || 
      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= region.country) || 
      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)
    )
  )`;
  const membershipCondition = `(
    @collection.club_memberships.club ?= id && 
    @collection.club_memberships.user ?= @request.auth.id
  )`;
  clubs.listRule = `@request.auth.id != "" && (${adminCondition} || ${membershipCondition})`;
  clubs.viewRule = clubs.listRule;
  clubs.createRule = "@request.auth.id != '' && (" +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    globalOrMissionary + " || " +
    "(@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= region.country) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")" +
    ")";
  clubs.updateRule = clubs.createRule;
  clubs.deleteRule = clubs.createRule;
  app.save(clubs);

  // 5. events rules
  const events = app.findCollectionByNameOrId("events");
  events.createRule = "@request.auth.id != '' && (" +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    globalOrMissionary + " || " +
    "(@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= club.region.country || @collection.admin_roles.country ?= region.country)) || " +
    "(@collection.admin_roles.role ?= 'Region' && (@collection.admin_roles.region ?= club.region || @collection.admin_roles.region ?= region))" +
    ") || " +
    "club.club_memberships_via_club.user.id ?= @request.auth.id && club.club_memberships_via_club.roles ?~ 'Director' " +
    ")";
  events.updateRule = events.createRule;
  events.deleteRule = events.createRule;
  app.save(events);

}, (app) => {
  // Revert roles is complex without knowing exact previous state, 
  // but we can at least remove Missionary from select if needed.
  const adminRoles = app.findCollectionByNameOrId("admin_roles");
  const roleField = adminRoles.fields.getByName("role");
  roleField.values = roleField.values.filter(v => v !== "Missionary");
  app.save(adminRoles);
})
