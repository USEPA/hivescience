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
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), " +
      "full_name VARCHAR(100), zip_code VARCHAR(20), " +
      "number_of_colonies INTEGER, monitor_varroa_mites VARCHAR(1), " +
      "monitor_varroa_mites_count INTEGER, monitor_methods VARCHAR(255), " +
      "treatment_methods VARCHAR(255));",
      [],
      () => {
        console.log('create profiles table successful')
      },
      () => {
        console.log('create tables failed')
      }
    );
  }

  createProfile(attributes) {
    const values = [attributes.email, attributes.fullName, attributes.zipCode,
      attributes.numberOfColonies, attributes.monitorVarroaMites,
      attributes.monitorVarroaMitesCount, attributes.monitorMethods,
      attributes.treatmentMethods];

    this.connection.executeSql(
      "INSERT INTO profiles " +
      "(email, full_name, zip_code, number_of_colonies, monitor_varroa_mites, " +
      "monitor_varroa_mites_count, monitor_methods, treatment_methods) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
      values,
      () => {
        console.log('profile insert successful')
      },
      (error) => {
        console.log('profile insert failed', error)
      }
    );
  }
}