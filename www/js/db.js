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
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), full_name VARCHAR(100), zip_code VARCHAR(20));",
      [],
      () => { console.log('create profiles table successful') },
      () => { console.log('create tables failed') }
    );
  }

  createProfile(attributes) {
    this.connection.executeSql(
      "INSERT INTO profiles (email, full_name, zip_code) VALUES (?, ?, ?);",
      [attributes.email, attributes.fullName, attributes.zipCode],
      () => { console.log('profile insert successful') },
      () => { console.log('profile insert failed') }
    );
  }
}