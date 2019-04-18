const event = [
  {
    "_id": "0000006a1fc1bb8ff05555708507a5f7",
    // Raw event data
    "event": {
      "action": "deleted",
      "database": "ffs",
      "display_name": "Admin",
      "hist_ip": "129.181.10.108",
      "hist_time": "1547679020",
      "histid": "3242",
      "host": "emit",
      "object_id": "2404",
      "object_name": "pilesworth",
      "object_subtype": "",
      "object_type": "User",
      "table": "fs_aryo_activity_log",
      "user_caps": "administrator",
      "user_email": "sam@mnemosyne.rocks",
      "user_id": "1",
      "user_login": "ffsadmin",
      "user_nicename": "ffsadmin",
      "user_registered": "2013-07-03 10:16:17",
      "user_status": "0",
      "user_url": "",
      "when": "2019-01-16 22:50:20"
    },
    // Portable hash
    "hash": "861011893fb34845935169295cc25df4",
    // Extracted metadata
    "meta": {
      "location": {
        "wp": {
          "database": "ffs"
        }
      },
      "source": {
        "name": "Wordpress Activity Log",
        "id": "rocks.mnemosyne.wp.activity"
      },
      "subject": {
        "email": "sam@mnemosyne.rocks",
        "wp": {
          "login": "ffsadmin"
        }
      },
      "time": {
        "start": "2019-01-16T22:50:20.000Z"
      // optional: end
      },
      "version": 0
    }
  },
  {
    "_id": "0000008507a5f75556a1fff0570c1bb8",
    "event": {
      "amsreferences": null,
      "content": "It's me!",
      "conversationid": "8:foo.bar.boz",
      "displayName": "FooBarBoz",
      "from": "8:foo.bar.boz",
      "id": "1549213955361",
      "messagetype": "RichText",
      "originalarrivaltime": "2019-04-16T17:36:31.601Z",
      "properties": null,
      "version": 1555436192141,
      "conversation": {
        "displayName": "FooBarBoz",
        "id": "8:foo.bar.boz",
        "messages": null,
        "properties": {
          "consumptionhorizon": "1555437491322;1555437491855;5204195122441766851",
          "conversationblocked": false,
          "conversationstatus": "Accepted",
          "lastimreceivedtime": "2019-04-16T18:43:56.759Z"
        },
        "threadProperties": null,
        "version": 1555440237203
      }
    },
    // Portable hash
    "hash": "935f43fb386169295cc25d1011894845",
    // Extracted metadata
    "meta": {
      "location": {
        "skype": {
          "displayName": "FooBarBoz",
          "id": "8:foo.bar.boz"
        }
      },
      "source": {
        "name": "Skype",
        "id": "rocks.mnemosyne.skype"
      },
      "subject": {
        "skype": "8:foo.bar.boz",
      },
      "time": {
        "start": "2019-04-16T17:36:31.601Z"
      // optional: end
      },
      "version": 12
    }
  }
]
