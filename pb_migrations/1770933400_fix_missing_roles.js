migrate((app) => {
  const memberships = app.findCollectionByNameOrId("club_memberships");
  const rolesField = memberships.fields.getByName("roles");
  rolesField.values = ["Director", "Secretary", "Treasurer", "Leader", "Guardian", "Pending"];
  app.save(memberships);

  const adminRoles = app.findCollectionByNameOrId("admin_roles");
  const roleField = adminRoles.fields.getByName("role");
  roleField.values = ["Global", "Country", "Region", "Pending"];
  app.save(adminRoles);
}, (app) => {
  // No-op for this fix
})
