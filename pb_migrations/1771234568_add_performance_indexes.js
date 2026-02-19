migrate((app) => {
  const collections = [
    {
      name: "regions",
      indexes: ["CREATE INDEX `idx_regions_country` ON `regions` (`country`)"]
    },
    {
      name: "clubs",
      indexes: [
        "CREATE INDEX `idx_clubs_region` ON `clubs` (`region`)",
        "CREATE INDEX `idx_clubs_active` ON `clubs` (`active`)"
      ]
    },
    {
      name: "club_memberships",
      indexes: [
        "CREATE UNIQUE INDEX `idx_unique_membership` ON `club_memberships` (`user`, `club`)",
        "CREATE INDEX `idx_membership_user` ON `club_memberships` (`user`)",
        "CREATE INDEX `idx_membership_club` ON `club_memberships` (`club`)"
      ]
    },
    {
      name: "club_years",
      indexes: ["CREATE INDEX `idx_clubyears_club` ON `club_years` (`club`)"]
    },
    {
      name: "students",
      indexes: ["CREATE INDEX `idx_students_club` ON `students` (`club`)"]
    },
    {
      name: "student_registrations",
      indexes: [
        "CREATE UNIQUE INDEX `idx_unique_registration` ON `student_registrations` (`student`, `club_year`, `program`)",
        "CREATE INDEX `idx_reg_student` ON `student_registrations` (`student`)",
        "CREATE INDEX `idx_reg_year` ON `student_registrations` (`club_year`)",
        "CREATE INDEX `idx_reg_program` ON `student_registrations` (`program`)"
      ]
    },
    {
      name: "events",
      indexes: [
        "CREATE INDEX `idx_events_club_year` ON `events` (`club`, `club_year`)",
        "CREATE INDEX `idx_events_region` ON `events` (`region`)"
      ]
    },
    {
      name: "attendance",
      indexes: [
        "CREATE UNIQUE INDEX `idx_unique_attendance` ON `attendance` (`event`, `student`)",
        "CREATE INDEX `idx_att_event` ON `attendance` (`event`)",
        "CREATE INDEX `idx_att_student` ON `attendance` (`student`)"
      ]
    }
  ];

  for (const item of collections) {
    try {
      const collection = app.findCollectionByNameOrId(item.name);
      if (collection) {
        if (!collection.indexes) {
          collection.indexes = [];
        }
        for (const idx of item.indexes) {
          const match = idx.match(/INDEX `(.+?)`/);
          if (match) {
            const idxName = match[1];
            if (!collection.indexes.some(existing => existing.includes(idxName))) {
              collection.indexes.push(idx);
            }
          }
        }
        app.save(collection);
      }
    } catch (e) {
      // Silent skip if collection doesn't exist yet
    }
  }
}, (app) => {
  // Revert logic: find and remove the indexes we added
  const indexNames = [
    "idx_regions_country",
    "idx_clubs_region",
    "idx_clubs_active",
    "idx_unique_membership",
    "idx_membership_user",
    "idx_membership_club",
    "idx_clubyears_club",
    "idx_students_club",
    "idx_unique_registration",
    "idx_reg_student",
    "idx_reg_year",
    "idx_reg_program",
    "idx_events_club_year",
    "idx_events_region",
    "idx_unique_attendance",
    "idx_att_event",
    "idx_att_student"
  ];

  const collectionNames = [
    "regions", "clubs", "club_memberships", "club_years",
    "students", "student_registrations", "events", "attendance"
  ];

  for (const name of collectionNames) {
    const collection = app.findCollectionByNameOrId(name);
    if (collection && collection.indexes) {
      collection.indexes = collection.indexes.filter(existing => {
        return !indexNames.some(nameToRemove => existing.includes(nameToRemove));
      });
      app.save(collection);
    }
  }
})
