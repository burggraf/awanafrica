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
        "CREATE INDEX `idx_clubs_country` ON `clubs` (`country`)",
        "CREATE INDEX `idx_clubs_active` ON `clubs` (`active`)",
        "CREATE INDEX `idx_clubs_geo` ON `clubs` (`lat`, `lng` WHERE `lat` IS NOT NULL AND `lng` IS NOT NULL)"
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
      name: "clubbers",
      indexes: [
        "CREATE INDEX `idx_clubbers_club` ON `clubbers` (`club`)",
        "CREATE INDEX `idx_clubbers_guardian` ON `clubbers` (`guardian`)"
      ]
    },
    {
      name: "clubber_registrations",
      indexes: [
        "CREATE UNIQUE INDEX `idx_unique_clubber_reg` ON `clubber_registrations` (`clubber`, `club_year`, `program`)",
        "CREATE INDEX `idx_clubber_reg_clubber` ON `clubber_registrations` (`clubber`)",
        "CREATE INDEX `idx_clubber_reg_year` ON `clubber_registrations` (`club_year`)",
        "CREATE INDEX `idx_clubber_reg_program` ON `clubber_registrations` (`program`)"
      ]
    },
    {
      name: "events",
      indexes: [
        "CREATE INDEX `idx_events_club_year` ON `events` (`club`, `club_year`)"
      ]
    },
    {
      name: "attendance",
      indexes: [
        "CREATE UNIQUE INDEX `idx_unique_attendance` ON `attendance` (`event`, `clubber`)",
        "CREATE INDEX `idx_att_event` ON `attendance` (`event`)",
        "CREATE INDEX `idx_att_clubber` ON `attendance` (`clubber`)"
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
      console.log(`Failed to apply indexes for ${item.name}: ${e.message}`);
    }
  }
}, (app) => {
  // Revert logic
  const indexNames = [
    "idx_regions_country",
    "idx_clubs_region",
    "idx_clubs_country",
    "idx_clubs_active",
    "idx_clubs_geo",
    "idx_unique_membership",
    "idx_membership_user",
    "idx_membership_club",
    "idx_clubyears_club",
    "idx_clubbers_club",
    "idx_clubbers_guardian",
    "idx_unique_clubber_reg",
    "idx_clubber_reg_clubber",
    "idx_clubber_reg_year",
    "idx_clubber_reg_program",
    "idx_events_club_year",
    "idx_unique_attendance",
    "idx_att_event",
    "idx_att_clubber"
  ];

  const collectionNames = [
    "regions", "clubs", "club_memberships", "club_years",
    "clubbers", "clubber_registrations", "events", "attendance"
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
