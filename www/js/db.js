export default class DB {
  constructor(sqlitePlugin) {
    this.sqlitePlugin = sqlitePlugin;
  }

  initialize() {
    this.connection = this.sqlitePlugin.openDatabase(
      {name: "buzz_buzz", location: "default"}
    );
  }

  createTables() {
    this.connection.executeSql(
      "CREATE TABLE IF NOT EXISTS profiles" +
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), full_name VARCHAR(100));",
      [],
      () => { console.log('create profiles table successful') },
      () => { console.log('create tables failed') }
    );
  }

  createProfile(attributes) {
    this.connection.executeSql(
      "INSERT INTO profiles (email, full_name) VALUES (?, ?);",
      [attributes.email, attributes.fullName],
      () => { console.log('profile insert successful') },
      () => { console.log('profile insert failed') }
    );
  }
}