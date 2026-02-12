migrate((app) => {
  const adminRoles = app.findCollectionByNameOrId("adminroles0001");
  
  // Update rules for admin_roles
  // List/View: 
  // - Self
  // - Global Admin (any)
  // - Country Admin (for their country)
  // - Region Admin (for their region)
  adminRoles.listRule = "@request.auth.id != '' && (" +
    "user.id = @request.auth.id || " +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    "@collection.admin_roles.role ?= 'Global' || " +
    "(@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")" +
    ")";
  adminRoles.viewRule = adminRoles.listRule;

  // Create/Update/Delete:
  // - Global Admin (any)
  // - Country Admin (can manage roles in their country)
  // - Region Admin (can manage roles in their region)
  adminRoles.createRule = "@request.auth.id != '' && (" +
    "@collection.admin_roles.user.id ?= @request.auth.id && (" +
    "@collection.admin_roles.role ?= 'Global' || " +
    "(@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || " +
    "(@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)" +
    ")" +
    ")";
  adminRoles.updateRule = adminRoles.createRule;
  adminRoles.deleteRule = adminRoles.createRule;
  
  app.save(adminRoles);

  // Update users collection list rule to allow admins to search users
  const users = app.findCollectionByNameOrId("_pb_users_auth_");
  
  // Manage rule allows seeing all fields (including email) and bypassing standard visibility rules.
  // We grant it to anyone with an administrative role.
  users.manageRule = "@collection.admin_roles.user.id ?= @request.auth.id";
  
  users.listRule = "id = @request.auth.id || @collection.admin_roles.user.id ?= @request.auth.id";
  users.viewRule = users.listRule;
  app.save(users);

}, (app) => {
  const adminRoles = app.findCollectionByNameOrId("adminroles0001");
  adminRoles.listRule = "@request.auth.id != '' && (@request.auth.id = user.id || @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global')";
  adminRoles.viewRule = adminRoles.listRule;
  adminRoles.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'";
  adminRoles.updateRule = adminRoles.createRule;
  adminRoles.deleteRule = adminRoles.createRule;
  app.save(adminRoles);

  const users = app.findCollectionByNameOrId("_pb_users_auth_");
  users.listRule = "id = @request.auth.id";
  users.viewRule = "id = @request.auth.id";
  app.save(users);
})
