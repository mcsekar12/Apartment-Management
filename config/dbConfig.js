

module.exports={

  "development": {
    "client":"pg",
    "connection":{

    "user": "root",
    "password": "",
    "database": "parking_system",
    "host": "127.0.0.1",
    "dialect": "postgres"
},
"debug":true
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "parking_system",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  //heroku postgres client
  "production": {
  "client": 'pg',
  "connection": "postgres://user:password@domain:port/parking_system",
  "searchPath": 'knex,public'

  }
}