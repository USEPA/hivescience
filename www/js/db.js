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
    this.createProfilesTable();
    this.createSurveysTable();
  }

  createProfilesTable() {
    this.connection.executeSql(
      "CREATE TABLE IF NOT EXISTS profiles" +
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), " +
      "full_name VARCHAR(100), zip_code VARCHAR(20), " +
      "number_of_colonies INTEGER, monitor_varroa_mites VARCHAR(1), " +
      "monitor_varroa_mites_count INTEGER, monitor_methods VARCHAR(255), " +
      "treatment_methods VARCHAR(255), why_beekeep TEXT);",
      [],
      () => console.log('create profiles table successful'),
      () => console.log('create profiles table failed')
    );
  }

  createSurveysTable() {
    this.connection.executeSql(
      "CREATE TABLE IF NOT EXISTS surveys" +
      "(id INTEGER PRIMARY KEY AUTOINCREMENT, queen_right VARCHAR(1), " +
      "queen_drone_laying VARCHAR(1), queen_age INTEGER, " +
      "diseases TEXT, bee_kill VARCHAR(1));",
      [],
      () => console.log('create surveys table successful'),
      () => console.log('create surveys table failed')
    );
  }

  createProfile(attributes) {
    const values = [attributes.email, attributes.fullName, attributes.zipCode,
      attributes.numberOfColonies, attributes.monitorVarroaMites,
      attributes.monitorVarroaMitesCount, attributes.monitorMethods,
      attributes.treatmentMethods, attributes.whyBeekeep];

    this.connection.executeSql(
      "INSERT INTO profiles " +
      "(email, full_name, zip_code, number_of_colonies, monitor_varroa_mites, " +
      "monitor_varroa_mites_count, monitor_methods, treatment_methods, " +
      "why_beekeep) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
      values,
      () => console.log('profile insert successful'),
      (error) => console.log('profile insert failed', error)
    );
  }

  createSurvey(attributes) {
    const values = [attributes.queenRight, attributes.queenDroneLaying,
      attributes.queenAge, attributes.diseases, attributes.beeKill];
    this.connection.executeSql(
      "INSERT INTO surveys " +
      "(queen_right, queen_drone_laying, queen_age, diseases, bee_kill) " +
      "VALUES (?, ?, ?, ?, ?);",
      values,
      () => console.log('survey insert successful'),
      (error) => console.log('survey insert failed', error)
    );
  }
}