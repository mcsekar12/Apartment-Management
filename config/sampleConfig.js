

module.exports={

  "development": {
    "client":"pg",
    "connection":{

    "user": "root",
    "password": "",
    "database": "database_dev",
    "host": "127.0.0.1",
    "dialect": "postgres"
},
"debug":true
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  //heroku postgres client
  "production": {
  "client": 'pg',
  "connection": "postgres://user:password@domain:port/database",
  "searchPath": 'knex,public'

  }
}