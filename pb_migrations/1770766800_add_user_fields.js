
migrate((app) => {
  const snapshot = [
    {
      "id": "_pb_users_auth_",
      "name": "users",
      "type": "auth",
      "system": false,
      "fields": [
        {
          "id": "text3208210256",
          "name": "id",
          "type": "text",
          "system": true,
          "required": true,
          "presentable": false,
          "unique": false,
          "primaryKey": true,
          "min": 15,
          "max": 15,
          "pattern": "^[a-z0-9]+$",
          "autogeneratePattern": "[a-z0-9]{15}"
        },
        {
          "id": "password901924565",
          "name": "password",
          "type": "password",
          "system": true,
          "required": true,
          "presentable": false,
          "unique": false,
          "min": 8,
          "max": 0,
          "pattern": ""
        },
        {
          "id": "text2504183744",
          "name": "tokenKey",
          "type": "text",
          "system": true,
          "required": true,
          "presentable": false,
          "unique": false,
          "min": 30,
          "max": 60,
          "pattern": "",
          "autogeneratePattern": "[a-zA-Z0-9]{50}"
        },
        {
          "id": "email3885137012",
          "name": "email",
          "type": "email",
          "system": true,
          "required": true,
          "presentable": false,
          "unique": false,
          "onlyDomains": null,
          "exceptDomains": null
        },
        {
          "id": "bool1547992806",
          "name": "emailVisibility",
          "type": "bool",
          "system": true,
          "required": false,
          "presentable": false,
          "unique": false
        },
        {
          "id": "bool256245529",
          "name": "verified",
          "type": "bool",
          "system": true,
          "required": false,
          "presentable": false,
          "unique": false
        },
        {
          "id": "text1579384326",
          "name": "name",
          "type": "text",
          "system": false,
          "required": false,
          "presentable": false,
          "unique": false,
          "min": 0,
          "max": 255,
          "pattern": ""
        },
        {
          "id": "file376926767",
          "name": "avatar",
          "type": "file",
          "system": false,
          "required": false,
          "presentable": false,
          "unique": false,
          "maxSelect": 1,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp"
          ],
          "thumbs": null,
          "protected": false
        },
        {
          "id": "text_displayName",
          "name": "displayName",
          "type": "text",
          "system": false,
          "required": false,
          "presentable": false,
          "unique": false,
          "min": 0,
          "max": 255,
          "pattern": ""
        },
        {
          "id": "text_bio",
          "name": "bio",
          "type": "text",
          "system": false,
          "required": false,
          "presentable": false,
          "unique": false,
          "min": 0,
          "max": 2000,
          "pattern": ""
        },
        {
          "id": "autodate2990389176",
          "name": "created",
          "type": "autodate",
          "system": false,
          "required": false,
          "presentable": false,
          "unique": false,
          "onCreate": true,
          "onUpdate": false
        },
        {
          "id": "autodate3332085495",
          "name": "updated",
          "type": "autodate",
          "system": false,
          "required": false,
          "presentable": false,
          "unique": false,
          "onCreate": true,
          "onUpdate": true
        }
      ],
      "indexes": [
        "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
        "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''"
      ],
      "listRule": "id = @request.auth.id",
      "viewRule": "id = @request.auth.id",
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "options": {
        "allowEmailAuth": true,
        "allowOAuth2Auth": true,
        "allowUsernameAuth": false,
        "exceptEmailDomains": null,
        "manageRule": null,
        "minPasswordLength": 8,
        "onlyEmailDomains": null,
        "onlyVerified": false,
        "requireEmail": true
      }
    }
  ];

  return app.importCollections(snapshot, false);
}, (app) => {
  return null;
})
