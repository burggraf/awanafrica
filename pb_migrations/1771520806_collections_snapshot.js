/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const snapshot = [
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1582905952",
          "max": 0,
          "min": 0,
          "name": "method",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_2279338944",
      "indexes": [
        "CREATE INDEX `idx_mfas_collectionRef_recordRef` ON `_mfas` (collectionRef,recordRef)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_mfas",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": null,
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 8,
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 0,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "",
          "hidden": true,
          "id": "text3866985172",
          "max": 0,
          "min": 0,
          "name": "sentTo",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_1638494021",
      "indexes": [
        "CREATE INDEX `idx_otps_collectionRef_recordRef` ON `_otps` (collectionRef, recordRef)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_otps",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text2462348188",
          "max": 0,
          "min": 0,
          "name": "provider",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1044722854",
          "max": 0,
          "min": 0,
          "name": "providerId",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_2281828961",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_externalAuths_record_provider` ON `_externalAuths` (collectionRef, recordRef, provider)",
        "CREATE UNIQUE INDEX `idx_externalAuths_collection_provider` ON `_externalAuths` (collectionRef, provider, providerId)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_externalAuths",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "createRule": null,
      "deleteRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text455797646",
          "max": 0,
          "min": 0,
          "name": "collectionRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text127846527",
          "max": 0,
          "min": 0,
          "name": "recordRef",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text4228609354",
          "max": 0,
          "min": 0,
          "name": "fingerprint",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "id": "pbc_4275539003",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_authOrigins_unique_pairs` ON `_authOrigins` (collectionRef, recordRef, fingerprint)"
      ],
      "listRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId",
      "name": "_authOrigins",
      "system": true,
      "type": "base",
      "updateRule": null,
      "viewRule": "@request.auth.id != '' && recordRef = @request.auth.id && collectionRef = @request.auth.collectionId"
    },
    {
      "authAlert": {
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location:</p>\n<p><em>{ALERT_INFO}</em></p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>If this was you, you may disregard this email.</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "Login from a new location"
        },
        "enabled": true
      },
      "authRule": "",
      "authToken": {
        "duration": 86400
      },
      "confirmEmailChangeTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Confirm your {APP_NAME} new email address"
      },
      "createRule": null,
      "deleteRule": null,
      "emailChangeToken": {
        "duration": 1800
      },
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 0,
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 8,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "[a-zA-Z0-9]{50}",
          "hidden": true,
          "id": "text2504183744",
          "max": 60,
          "min": 30,
          "name": "tokenKey",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "exceptDomains": null,
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": null,
          "presentable": false,
          "required": true,
          "system": true,
          "type": "email"
        },
        {
          "hidden": false,
          "id": "bool1547992806",
          "name": "emailVisibility",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "bool256245529",
          "name": "verified",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": true,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": true,
          "type": "autodate"
        }
      ],
      "fileToken": {
        "duration": 180
      },
      "id": "pbc_3142635823",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_tokenKey_pbc_3142635823` ON `_superusers` (`tokenKey`)",
        "CREATE UNIQUE INDEX `idx_email_pbc_3142635823` ON `_superusers` (`email`) WHERE `email` != ''"
      ],
      "listRule": null,
      "manageRule": null,
      "mfa": {
        "duration": 1800,
        "enabled": false,
        "rule": ""
      },
      "name": "_superusers",
      "oauth2": {
        "enabled": false,
        "mappedFields": {
          "avatarURL": "",
          "id": "",
          "name": "",
          "username": ""
        }
      },
      "otp": {
        "duration": 180,
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "OTP for {APP_NAME}"
        },
        "enabled": false,
        "length": 8
      },
      "passwordAuth": {
        "enabled": true,
        "identityFields": [
          "email"
        ]
      },
      "passwordResetToken": {
        "duration": 1800
      },
      "resetPasswordTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Reset your {APP_NAME} password"
      },
      "system": true,
      "type": "auth",
      "updateRule": null,
      "verificationTemplate": {
        "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Verify your {APP_NAME} email"
      },
      "verificationToken": {
        "duration": 259200
      },
      "viewRule": null
    },
    {
      "authAlert": {
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location:</p>\n<p><em>{ALERT_INFO}</em></p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>If this was you, you may disregard this email.</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "Login from a new location"
        },
        "enabled": false
      },
      "authRule": "",
      "authToken": {
        "duration": 604800
      },
      "confirmEmailChangeTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Confirm your {APP_NAME} new email address"
      },
      "createRule": "",
      "deleteRule": "id = @request.auth.id",
      "emailChangeToken": {
        "duration": 1800
      },
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cost": 0,
          "hidden": true,
          "id": "password901924565",
          "max": 0,
          "min": 8,
          "name": "password",
          "pattern": "",
          "presentable": false,
          "required": true,
          "system": true,
          "type": "password"
        },
        {
          "autogeneratePattern": "[a-zA-Z0-9]{50}",
          "hidden": true,
          "id": "text2504183744",
          "max": 60,
          "min": 30,
          "name": "tokenKey",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "exceptDomains": null,
          "hidden": false,
          "id": "email3885137012",
          "name": "email",
          "onlyDomains": null,
          "presentable": true,
          "required": true,
          "system": true,
          "type": "email"
        },
        {
          "hidden": false,
          "id": "bool1547992806",
          "name": "emailVisibility",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "bool256245529",
          "name": "verified",
          "presentable": false,
          "required": false,
          "system": true,
          "type": "bool"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 255,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": true,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "file376926767",
          "maxSelect": 1,
          "maxSize": 0,
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/gif",
            "image/webp"
          ],
          "name": "avatar",
          "presentable": false,
          "protected": false,
          "required": false,
          "system": false,
          "thumbs": null,
          "type": "file"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text_displayName",
          "max": 255,
          "min": 0,
          "name": "displayName",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text_bio",
          "max": 2000,
          "min": 0,
          "name": "bio",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "autodate2990389176",
          "name": "created",
          "onCreate": true,
          "onUpdate": false,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "hidden": false,
          "id": "autodate3332085495",
          "name": "updated",
          "onCreate": true,
          "onUpdate": true,
          "presentable": false,
          "system": false,
          "type": "autodate"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text3571151285",
          "max": 0,
          "min": 0,
          "name": "language",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1098958488",
          "max": 0,
          "min": 0,
          "name": "locale",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text2541086472",
          "max": 0,
          "min": 0,
          "name": "theme",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1146066909",
          "max": 0,
          "min": 0,
          "name": "phone",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "fileToken": {
        "duration": 180
      },
      "id": "_pb_users_auth_",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
        "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''"
      ],
      "listRule": "@request.auth.id != \"\"",
      "manageRule": "@collection.admin_roles.user.id ?= @request.auth.id",
      "mfa": {
        "duration": 1800,
        "enabled": false,
        "rule": ""
      },
      "name": "users",
      "oauth2": {
        "enabled": true,
        "mappedFields": {
          "avatarURL": "avatar",
          "id": "",
          "name": "name",
          "username": ""
        }
      },
      "otp": {
        "duration": 180,
        "emailTemplate": {
          "body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
          "subject": "OTP for {APP_NAME}"
        },
        "enabled": false,
        "length": 8
      },
      "passwordAuth": {
        "enabled": true,
        "identityFields": [
          "email"
        ]
      },
      "passwordResetToken": {
        "duration": 1800
      },
      "resetPasswordTemplate": {
        "body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Reset your {APP_NAME} password"
      },
      "system": false,
      "type": "auth",
      "updateRule": "id = @request.auth.id",
      "verificationTemplate": {
        "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
        "subject": "Verify your {APP_NAME} email"
      },
      "verificationToken": {
        "duration": 259200
      },
      "viewRule": "@request.auth.id != \"\""
    },
    {
      "createRule": "",
      "deleteRule": "",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text3824486657",
          "max": 0,
          "min": 0,
          "name": "isoCode",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "id": "countries000001",
      "indexes": [],
      "listRule": "",
      "name": "countries",
      "system": false,
      "type": "base",
      "updateRule": "",
      "viewRule": ""
    },
    {
      "createRule": "",
      "deleteRule": "",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "countries000001",
          "hidden": false,
          "id": "relation1400097126",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "country",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        }
      ],
      "id": "regions00000001",
      "indexes": [
        "CREATE INDEX `idx_regions_country` ON `regions` (`country`)"
      ],
      "listRule": "",
      "name": "regions",
      "system": false,
      "type": "base",
      "updateRule": "",
      "viewRule": ""
    },
    {
      "createRule": "",
      "deleteRule": "",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "select2363381545",
          "maxSelect": 0,
          "name": "type",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "Leader Based",
            "Other"
          ]
        },
        {
          "cascadeDelete": false,
          "collectionId": "regions00000001",
          "hidden": false,
          "id": "relation258142582",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "region",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text223244161",
          "max": 0,
          "min": 0,
          "name": "address",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text922858135",
          "max": 0,
          "min": 0,
          "name": "timezone",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "bool1260321794",
          "name": "active",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1401453989",
          "max": 100,
          "min": 1,
          "name": "registration",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text363766028",
          "max": 0,
          "min": 0,
          "name": "denomination",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1587448267",
          "max": 0,
          "min": 0,
          "name": "location",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "relation1521074505",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "missionary",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "date617435213",
          "max": "",
          "min": "",
          "name": "expiration",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "hidden": false,
          "id": "json1326724116",
          "maxSize": 0,
          "name": "metadata",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "json"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text937041638",
          "max": 0,
          "min": 0,
          "name": "salesforce",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "select2442205965",
          "maxSelect": 0,
          "name": "venue",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "Church",
            "School",
            "Community Center",
            "Christian Camp",
            "Children's Ministry Office",
            "Mission Compound",
            "Refugee Camp",
            "Youth Center",
            "Orphanage",
            "Other"
          ]
        },
        {
          "cascadeDelete": false,
          "collectionId": "countries000001",
          "hidden": false,
          "id": "relation1400097126",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "country",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text2792196114",
          "max": 0,
          "min": 0,
          "name": "joinCode",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1100235223",
          "max": 0,
          "min": 0,
          "name": "leaderSecret",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "number2499937429",
          "max": null,
          "min": null,
          "name": "lat",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        },
        {
          "hidden": false,
          "id": "number2518964612",
          "max": null,
          "min": null,
          "name": "lng",
          "onlyInt": false,
          "presentable": false,
          "required": false,
          "system": false,
          "type": "number"
        }
      ],
      "id": "clubs0000000001",
      "indexes": [
        "CREATE INDEX `idx_clubs_region` ON `clubs` (`region`)",
        "CREATE INDEX `idx_clubs_active` ON `clubs` (`active`)",
        "CREATE INDEX `idx_clubs_country` ON `clubs` (`country`)",
        "CREATE INDEX `idx_clubs_geo` ON `clubs` (`lat`, `lng` WHERE `lat` IS NOT NULL AND `lng` IS NOT NULL)"
      ],
      "listRule": "",
      "name": "clubs",
      "system": false,
      "type": "base",
      "updateRule": "",
      "viewRule": ""
    },
    {
      "createRule": "@request.auth.id != '' && user = @request.auth.id",
      "deleteRule": "@request.auth.id != \"\" && (\n    club.missionary = @request.auth.id || \n    (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) ||\n    (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  )\n  )",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "relation2375276105",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "user",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "select3057528519",
          "maxSelect": 4,
          "name": "roles",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "Director",
            "Secretary",
            "Treasurer",
            "Leader",
            "Guardian",
            "Pending"
          ]
        }
      ],
      "id": "memberships0001",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_unique_membership` ON `club_memberships` (`user`, `club`)",
        "CREATE INDEX `idx_membership_user` ON `club_memberships` (`user`)",
        "CREATE INDEX `idx_membership_club` ON `club_memberships` (`club`)"
      ],
      "listRule": "@request.auth.id != \"\" && (\n    user = @request.auth.id || \n    club.missionary = @request.auth.id || \n    (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) ||\n    (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  )\n  )",
      "name": "club_memberships",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && (\n    club.missionary = @request.auth.id || \n    (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) ||\n    (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  )\n  )",
      "viewRule": "@request.auth.id != \"\" && (\n    user = @request.auth.id || \n    club.missionary = @request.auth.id || \n    (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) ||\n    (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  )\n  )"
    },
    {
      "createRule": "@request.auth.id != \"\" && ((\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "deleteRule": "@request.auth.id != \"\" && ((\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1843675174",
          "max": 0,
          "min": 0,
          "name": "description",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        }
      ],
      "id": "programs0000001",
      "indexes": [],
      "listRule": "@request.auth.id != \"\" && (club.club_memberships_via_club.user.id ?= @request.auth.id || (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "name": "programs",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && ((\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "viewRule": "@request.auth.id != \"\" && (club.club_memberships_via_club.user.id ?= @request.auth.id || (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))"
    },
    {
      "createRule": "@request.auth.id != \"\" && ((\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "deleteRule": "@request.auth.id != \"\" && ((\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text245846248",
          "max": 0,
          "min": 0,
          "name": "label",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "date1269603864",
          "max": "",
          "min": "",
          "name": "startDate",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "hidden": false,
          "id": "date826688707",
          "max": "",
          "min": "",
          "name": "endDate",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        }
      ],
      "id": "years0000000001",
      "indexes": [
        "CREATE INDEX `idx_clubyears_club` ON `club_years` (`club`)"
      ],
      "listRule": "@request.auth.id != \"\" && (club.club_memberships_via_club.user.id ?= @request.auth.id || (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "name": "club_years",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && ((\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))",
      "viewRule": "@request.auth.id != \"\" && (club.club_memberships_via_club.user.id ?= @request.auth.id || (\n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      @collection.admin_roles.role ?= 'Missionary' ||\n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  ) || (\n    @collection.club_memberships.club ?= club.id && \n    @collection.club_memberships.user ?= @request.auth.id && \n    @collection.club_memberships.roles ?~ 'Director'\n  ))"
    },
    {
      "createRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "deleteRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text596812118",
          "max": 0,
          "min": 0,
          "name": "firstName",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text2434144904",
          "max": 0,
          "min": 0,
          "name": "lastName",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "date3612849359",
          "max": "",
          "min": "",
          "name": "dateOfBirth",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "date"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text18589324",
          "max": 0,
          "min": 0,
          "name": "notes",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": false,
          "system": false,
          "type": "text"
        },
        {
          "cascadeDelete": false,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "relation2375276105",
          "maxSelect": 1,
          "minSelect": 0,
          "name": "guardian",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "bool1260321794",
          "name": "active",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "bool"
        },
        {
          "hidden": false,
          "id": "select3343321666",
          "maxSelect": 1,
          "name": "gender",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "select",
          "values": [
            "Male",
            "Female"
          ]
        }
      ],
      "id": "students0000001",
      "indexes": [
        "CREATE INDEX `idx_clubbers_club` ON `clubbers` (`club`)",
        "CREATE INDEX `idx_clubbers_guardian` ON `clubbers` (`guardian`)"
      ],
      "listRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "name": "clubbers",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "viewRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )"
    },
    {
      "createRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "deleteRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "students0000001",
          "hidden": false,
          "id": "relation3072569139",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "clubber",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "years0000000001",
          "hidden": false,
          "id": "relation3746216407",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club_year",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "programs0000001",
          "hidden": false,
          "id": "relation2465036164",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "program",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        }
      ],
      "id": "studentregistra",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_unique_clubber_reg` ON `clubber_registrations` (`clubber`, `club_year`, `program`)",
        "CREATE INDEX `idx_clubber_reg_clubber` ON `clubber_registrations` (`clubber`)",
        "CREATE INDEX `idx_clubber_reg_year` ON `clubber_registrations` (`club_year`)",
        "CREATE INDEX `idx_clubber_reg_program` ON `clubber_registrations` (`program`)"
      ],
      "listRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "name": "clubber_registrations",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "viewRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )"
    },
    {
      "createRule": "@request.auth.id != '' && (@collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= club.region.country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && (@collection.admin_roles.region ?= club.region || @collection.admin_roles.region ?= region))) || club.club_memberships_via_club.user.id ?= @request.auth.id && club.club_memberships_via_club.roles ?~ 'Director' )",
      "deleteRule": "@request.auth.id != '' && (@collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= club.region.country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && (@collection.admin_roles.region ?= club.region || @collection.admin_roles.region ?= region))) || club.club_memberships_via_club.user.id ?= @request.auth.id && club.club_memberships_via_club.roles ?~ 'Director' )",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "years0000000001",
          "hidden": false,
          "id": "relation3746216407",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club_year",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "autogeneratePattern": "",
          "hidden": false,
          "id": "text1579384326",
          "max": 0,
          "min": 0,
          "name": "name",
          "pattern": "",
          "presentable": false,
          "primaryKey": false,
          "required": true,
          "system": false,
          "type": "text"
        },
        {
          "hidden": false,
          "id": "select2363381545",
          "maxSelect": 0,
          "name": "type",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "Weekly",
            "Games",
            "Quiz",
            "Other"
          ]
        },
        {
          "hidden": false,
          "id": "date1269603864",
          "max": "",
          "min": "",
          "name": "startDate",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "hidden": false,
          "id": "date826688707",
          "max": "",
          "min": "",
          "name": "endDate",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "date"
        },
        {
          "cascadeDelete": true,
          "collectionId": "regions00000001",
          "hidden": false,
          "id": "relation258142582",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "region",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        }
      ],
      "id": "events000000001",
      "indexes": [
        "CREATE INDEX `idx_events_club_year` ON `events` (`club`, `club_year`)",
        "CREATE INDEX `idx_events_region` ON `events` (`region`)"
      ],
      "listRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "name": "events",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != '' && (@collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= club.region.country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && (@collection.admin_roles.region ?= club.region || @collection.admin_roles.region ?= region))) || club.club_memberships_via_club.user.id ?= @request.auth.id && club.club_memberships_via_club.roles ?~ 'Director' )",
      "viewRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )"
    },
    {
      "createRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "deleteRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "events000000001",
          "hidden": false,
          "id": "relation1001261735",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "event",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "students0000001",
          "hidden": false,
          "id": "relation3072569139",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "student",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "select2063623452",
          "maxSelect": 0,
          "name": "status",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "Present",
            "Absent",
            "Excused"
          ]
        },
        {
          "cascadeDelete": true,
          "collectionId": "clubs0000000001",
          "hidden": false,
          "id": "relation3102619762",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "club",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        }
      ],
      "id": "attendance00001",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_unique_attendance` ON `attendance` (`event`, `student`)",
        "CREATE INDEX `idx_att_event` ON `attendance` (`event`)",
        "CREATE INDEX `idx_att_student` ON `attendance` (`student`)",
        "CREATE INDEX `idx_att_clubber` ON `attendance` (`clubber`)"
      ],
      "listRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "name": "attendance",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )",
      "viewRule": "@request.auth.id != \"\" && (\n    club.club_memberships_via_club.user.id ?= @request.auth.id || \n    @collection.admin_roles.user ?= @request.auth.id && (\n      @collection.admin_roles.role ?= 'Global' || \n      (@collection.admin_roles.role ?= 'Country' && @collection.admin_roles.country ?= club.region.country) || \n      (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= club.region)\n    )\n  )"
    },
    {
      "createRule": "@request.auth.id != '' && ((user = @request.auth.id && role = 'Pending') || (@collection.admin_roles.user.id ?= @request.auth.id && @collection.admin_roles.role ?= 'Global'))",
      "deleteRule": "@request.auth.id != '' && (@collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)))",
      "fields": [
        {
          "autogeneratePattern": "[a-z0-9]{15}",
          "hidden": false,
          "id": "text3208210256",
          "max": 15,
          "min": 15,
          "name": "id",
          "pattern": "^[a-z0-9]+$",
          "presentable": false,
          "primaryKey": true,
          "required": true,
          "system": true,
          "type": "text"
        },
        {
          "cascadeDelete": true,
          "collectionId": "_pb_users_auth_",
          "hidden": false,
          "id": "relation2375276105",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "user",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "relation"
        },
        {
          "hidden": false,
          "id": "select1466534506",
          "maxSelect": 0,
          "name": "role",
          "presentable": false,
          "required": true,
          "system": false,
          "type": "select",
          "values": [
            "Pending",
            "Global",
            "Country",
            "Region"
          ]
        },
        {
          "cascadeDelete": true,
          "collectionId": "countries000001",
          "hidden": false,
          "id": "relation1400097126",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "country",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        },
        {
          "cascadeDelete": true,
          "collectionId": "regions00000001",
          "hidden": false,
          "id": "relation258142582",
          "maxSelect": 0,
          "minSelect": 0,
          "name": "region",
          "presentable": false,
          "required": false,
          "system": false,
          "type": "relation"
        }
      ],
      "id": "adminroles0001",
      "indexes": [
        "CREATE UNIQUE INDEX `idx_user_role_target` ON `admin_roles` (`user`, `role`, `country`, `region`)"
      ],
      "listRule": "@request.auth.id != '' && (user.id = @request.auth.id || @collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)))",
      "name": "admin_roles",
      "system": false,
      "type": "base",
      "updateRule": "@request.auth.id != '' && (@collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)))",
      "viewRule": "@request.auth.id != '' && (user.id = @request.auth.id || @collection.admin_roles.user.id ?= @request.auth.id && ((@collection.admin_roles.role ?= 'Global' || @collection.admin_roles.role ?= 'Missionary') || (@collection.admin_roles.role ?= 'Country' && (@collection.admin_roles.country ?= country || @collection.admin_roles.country ?= region.country)) || (@collection.admin_roles.role ?= 'Region' && @collection.admin_roles.region ?= region)))"
    }
  ];

  return app.importCollections(snapshot, false);
}, (app) => {
  return null;
})
