migrate((app) => {
  const collection = app.findCollectionByNameOrId("club_memberships");

  // --- CLUB MEMBERSHIPS RULES ---
  // Allow access if:
  // 1. User is the member (Self)
  // 2. User is the assigned Missionary for the club
  // 3. User is an Admin (Global, Missionary, Country, Region) with appropriate scope
  // 4. User is a Director of the club

  const isSelf = `user = @request.auth.id`;
  const isAssignedMissionary = `club.missionary = @request.auth.id`;
  
  const isAdmin = `(
    @collection.admin_roles.user ?= @request.auth.id && (
      @collection.admin_roles.role ?= 'Global' || 
      @collection.admin_roles.role ?= 'Missionary' ||
      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || 
      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)
    )
  )`;

  const isDirector = `(
    @collection.club_memberships.club ?= club.id && 
    @collection.club_memberships.user ?= @request.auth.id && 
    @collection.club_memberships.roles ?~ 'Director'
  )`;

  const viewRule = `@request.auth.id != "" && (
    ${isSelf} || 
    ${isAssignedMissionary} || 
    ${isAdmin} ||
    ${isDirector}
  )`;

  // Modify (Update/Delete): Only allow authorized personnel
  const modifyRule = `@request.auth.id != "" && (
    ${isAssignedMissionary} || 
    ${isAdmin} ||
    ${isDirector}
  )`;

  collection.listRule = viewRule;
  collection.viewRule = viewRule;
  collection.updateRule = modifyRule;
  collection.deleteRule = modifyRule;

  app.save(collection);

  // --- USERS RULES ---
  // Allow authenticated users to view/list users (needed for member lists, searching, etc.)
  const users = app.findCollectionByNameOrId("users");
  
  // Previously restricted to self, now open to authenticated users for directory functionality
  users.listRule = `@request.auth.id != ""`;
  users.viewRule = `@request.auth.id != ""`;
  
  app.save(users);

}, (app) => {
  // Revert logic would restore previous rules
})
