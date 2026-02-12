migrate((app) => {
  const years = new Collection({
    name: "club_years",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs", required: true, cascadeDelete: true },
      { name: "label", type: "text", required: true }, // e.g. "2026-2027"
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const students = new Collection({
    name: "students",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs", required: true, cascadeDelete: true },
      { name: "firstName", type: "text", required: true },
      { name: "lastName", type: "text", required: true },
      { name: "dateOfBirth", type: "date" },
      { name: "notes", type: "text" }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const registrations = new Collection({
    name: "student_registrations",
    type: "base",
    fields: [
      { name: "student", type: "relation", collectionId: "students", required: true, cascadeDelete: true },
      { name: "club_year", type: "relation", collectionId: "club_years", required: true, cascadeDelete: true },
      { name: "program", type: "relation", collectionId: "programs", required: true, cascadeDelete: true }
    ],
    listRule: "@request.auth.id != '' && student.club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const events = new Collection({
    name: "events",
    type: "base",
    fields: [
      { name: "club", type: "relation", collectionId: "clubs", required: true, cascadeDelete: true },
      { name: "club_year", type: "relation", collectionId: "club_years", required: true, cascadeDelete: true },
      { name: "name", type: "text", required: true },
      { name: "type", type: "select", values: ["Weekly", "Games", "Quiz", "Other"], required: true },
      { name: "startDate", type: "date", required: true },
      { name: "endDate", type: "date", required: true }
    ],
    listRule: "@request.auth.id != '' && club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  const attendance = new Collection({
    name: "attendance",
    type: "base",
    fields: [
      { name: "event", type: "relation", collectionId: "events", required: true, cascadeDelete: true },
      { name: "student", type: "relation", collectionId: "students", required: true, cascadeDelete: true },
      { name: "status", type: "select", values: ["Present", "Absent", "Excused"], required: true }
    ],
    listRule: "@request.auth.id != '' && event.club.club_memberships_via_club.user.id ?= @request.auth.id",
  });

  app.saveCollection(years);
  app.saveCollection(students);
  app.saveCollection(registrations);
  app.saveCollection(events);
  app.saveCollection(attendance);
}, (app) => {
  const collections = ["attendance", "events", "student_registrations", "students", "club_years"];
  for (const name of collections) {
    const collection = app.findCollectionByNameOrId(name);
    if (collection) app.deleteCollection(collection);
  }
})
