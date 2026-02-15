/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const adminRoles = app.findCollectionByNameOrId("adminroles0001");
  
  // 1. Add "Pending" to the role field options
  const roleField = adminRoles.fields.getByName("role");
  roleField.values = ["Pending", "Global", "Country", "Region"];
  
  // 2. Allow authenticated users to create their own pending admin role
  // Users can create an admin role for themselves if:
  // - The role is "Pending"
  // - The user field is themselves
  adminRoles.createRule = "@request.auth.id != '' && " +
    "((user = @request.auth.id && role = 'Pending') || " +
    "(@collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'))";
  
  return app.save(adminRoles);
}, (app) => {
  const adminRoles = app.findCollectionByNameOrId("adminroles0001");
  
  // Revert changes
  const roleField = adminRoles.fields.getByName("role");
  roleField.values = ["Global", "Country", "Region"];
  
  adminRoles.createRule = "@request.auth.id != '' && @collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'";
  
  return app.save(adminRoles);
})