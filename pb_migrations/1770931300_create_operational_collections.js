migrate((app) => {
  const years = new Collection({
    id: "years0000000001",
    name: "club_years",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "label", type: "text", required: true }, // e.g. "2026-2027"
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const students = new Collection({
    id: "students0000001",
    name: "students",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "firstName", type: "text", required: true },
      { name: "lastName", type: "text", required: true },
      { name: "dateOfBirth", type: "date" },
      { name: "notes", type: "text" }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const registrations = new Collection({
    id: "studentregistra",
    name: "student_registrations",
    type: "base",
    fields: [
      { name: "student", type: "relation", collectionId: "students0000001", required: true, cascadeDelete: true },
      { name: "club_year", type: "relation", collectionId: "years0000000001", required: true, cascadeDelete: true },
      { name: "program", type: "relation", collectionId: "programs0000001", required: true, cascadeDelete: true }
    ],
    listRule: "@request.auth.id != '' && student.club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const events = new Collection({
    id: "events000000001",
    name: "events",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs0000000001", required: true, cascadeDelete: true },
      { name: "club_year", type: "relation", collectionId: "years0000000001", required: true, cascadeDelete: true },
      { name: "name", type: "text", required: true },
      { name: "type", type: "select", values: ["Weekly", "Games", "Quiz", "Other"], required: true },
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const attendance = new Collection({
    id: "attendance00001",
    name: "attendance",
    type: "base",
    fields: [
      { name: "event", type: "relation", collectionId: "events000000001", required: true, cascadeDelete: true },
      { name: "student", type: "relation", collectionId: "students0000001", required: true, cascadeDelete: true },
      { name: "status", type: "select", values: ["Present", "Absent", "Excused"], required: true }
    ],
    listRule: "@request.auth.id != '' && event.club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  app.save(years);
  app.save(students);
  app.save(registrations);
  app.save(events);
  app.save(attendance);
}, (app) => {
  const collections = ["attendance", "events", "student_registrations", "students", "club_years"];
  for (const name of collections) {
    const collection = app.findCollectionByNameOrId(name);
    if (collection) app.delete(collection);
  }
})
