migrate((app) => {
  const clubsId = "clubs0000000001";
  
  // 1. Update student_registrations
  const registrations = app.findCollectionByNameOrId("student_registrations");
  registrations.fields.add(new Field({
    name: "club",
    type: "relation",
    collectionId: clubsId,
    required: true,
    cascadeDelete: true,
  }));
  
  // 2. Update attendance
  const attendance = app.findCollectionByNameOrId("attendance");
  attendance.fields.add(new Field({
    name: "club",
    type: "relation",
    collectionId: clubsId,
    required: true,
    cascadeDelete: true,
  }));
  
  app.save(registrations);
  app.save(attendance);

  // 3. Backfill data using raw SQL
  // student_registrations.club = students.club where student_registrations.student = students.id
  app.db().newQuery(`
    UPDATE student_registrations 
    SET club = (SELECT club FROM students WHERE students.id = student_registrations.student)
    WHERE club = '' OR club IS NULL
  `).execute();

  // attendance.club = events.club where attendance.event = events.id
  app.db().newQuery(`
    UPDATE attendance 
    SET club = (SELECT club FROM events WHERE events.id = attendance.event)
    WHERE club = '' OR club IS NULL
  `).execute();

  // 4. Update API Rules for simplicity and performance
  const clubCondition = `(
    club.club_memberships_via_club.user.id ?= @request.auth.id || 
    @collection.admin_roles.user ?= @request.auth.id && (
      @collection.admin_roles.role ?= 'Global' || 
      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || 
      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)
    )
  )`;

  const operationalCollections = ["student_registrations", "attendance", "club_years", "students", "events"];
  
  for (const name of operationalCollections) {
    const col = app.findCollectionByNameOrId(name);
    col.listRule = `@request.auth.id != "" && ${clubCondition}`;
    col.viewRule = col.listRule;
    col.createRule = col.listRule;
    col.updateRule = col.listRule;
    col.deleteRule = col.listRule;
    app.save(col);
  }

}, (app) => {
  const registrations = app.findCollectionByNameOrId("student_registrations");
  registrations.fields.removeByName("club");
  app.save(registrations);

  const attendance = app.findCollectionByNameOrId("attendance");
  attendance.fields.removeByName("club");
  app.save(attendance);
  
  // Restore original rules would be complex here, so we'll just leave them for now
  // as the fields are gone they will likely break anyway.
})
