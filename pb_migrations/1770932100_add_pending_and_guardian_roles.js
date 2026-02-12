migrate((app) => {
  // 1. Update club_memberships roles
  const memberships = app.findCollectionByNameOrId("club_memberships");
  const rolesField = memberships.fields.getByName("roles");
  rolesField.values = ["Director", "Secretary", "Treasurer", "Leader", "Guardian", "Pending"];

  // Update rules to allow users to create their own "Guardian" or "Pending" membership
  memberships.createRule = "@request.auth.id != '' && (" +
    "user = @request.auth.id && (roles ?~ 'Guardian' || roles ?~ 'Pending')" +
    ")";
  
  app.save(memberships);

  // 2. Update admin_roles roles
  const adminRoles = app.findCollectionByNameOrId("admin_roles");
  const roleField = adminRoles.fields.getByName("role");
  roleField.values = ["Global", "Country", "Region", "Pending"];
  
  // Update rules to allow users to create their own "Pending" role during onboarding
  adminRoles.createRule = "@request.auth.id != '' && (" +
    "(@collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global') || " +
    "(user = @request.auth.id && role = 'Pending')" +
    ")";
  
  app.save(adminRoles);

  // 3. Update clubs list/view rules to allow searching during onboarding
  const clubs = app.findCollectionByNameOrId("clubs");
  clubs.listRule = "@request.auth.id != ''";
  clubs.viewRule = "@request.auth.id != ''";
  app.save(clubs);

}, (app) => {
  const memberships = app.findCollectionByNameOrId("club_memberships");
  const rolesField = memberships.fields.getByName("roles");
  rolesField.values = ["Director", "Secretary", "Treasurer", "Leader"];
  memberships.createRule = "";
  app.save(memberships);

  const adminRoles = app.findCollectionByNameOrId("admin_roles");
  const roleField = adminRoles.fields.getByName("role");
  roleField.values = ["Global", "Country", "Region"];
  adminRoles.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'";
  app.save(adminRoles);

  const clubs = app.findCollectionByNameOrId("clubs");
  clubs.listRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  clubs.viewRule = "@request.auth.id != '' && @collection.club_memberships.club.id ?= id && @collection.club_memberships.user.id ?= @request.auth.id";
  app.save(clubs);
})
