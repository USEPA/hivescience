export default class DB {
  constructor(sqlitePlugin) {
    this.sqlitePlugin = sqlitePlugin;
  }

  initialize() {
    this.connection = this.sqlitePlugin.openDatabase({
      name: "buzz_buzz",
      location: "default"
    });
  }

  createTables() {
    this.createProfilesTable();
    this.createSurveysTable();
  }

  createProfilesTable() {
    const sqlStatement = `
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(100),
        full_name VARCHAR(100),
        zip_code VARCHAR(20),
        number_of_colonies INTEGER,
        race_of_bees TEXT,
        monitor_varroa_mites VARCHAR(1),
        monitor_varroa_mites_count INTEGER,
        monitor_methods VARCHAR(255),
        treatment_methods VARCHAR(255),
        last_treatment_date TEXT
      );`;
    this.connection.executeSql(
      sqlStatement,
      [],
      () => console.log('create profiles table successful'),
      () => console.log('create profiles table failed')
    );
  }

  createSurveysTable() {
    const sqlStatement = `
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        queen_right VARCHAR(1),
        queen_drone_laying VARCHAR(1),
        queen_age INTEGER,
        diseases TEXT,
        bee_kill VARCHAR(1),
        bee_kill_description TEXT,
        honey_supers_on VARCHAR(1),
        honey_from_sealed_cells VARCHAR(1),
        honey_from_brood VARCHAR(1),
        split_or_combine VARCHAR(1),
        sample_tube_code INTEGER
      );`;
    this.connection.executeSql(
      sqlStatement,
      [],
      () => console.log('create surveys table successful'),
      () => console.log('create surveys table failed')
    );
  }

  createProfile(attributes) {
    const sqlStatement = `
        INSERT INTO profiles (
          email,
          full_name,
          zip_code,
          number_of_colonies,
          race_of_bees,
          monitor_varroa_mites,
          monitor_varroa_mites_count,
          monitor_methods,
          treatment_methods,
          last_treatment_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const values = [
      attributes.email,
      attributes.fullName,
      attributes.zipCode,
      attributes.numberOfColonies,
      attributes.raceOfBees,
      attributes.monitorVarroaMites,
      attributes.monitorVarroaMitesCount,
      attributes.monitorMethods,
      attributes.treatmentMethods,
      attributes.lastTreatmentDate
    ];
    this.connection.executeSql(
      sqlStatement,
      values,
      () => console.log('profile insert successful'),
      (error) => console.log('profile insert failed', error)
    );
  }

  createSurvey(attributes) {
    const sqlStatement = `
        INSERT INTO surveys (
          queen_right,
          queen_drone_laying,
          diseases,
          honey_supers_on,
          honey_from_sealed_cells,
          honey_from_brood,
          split_or_combine,
          sample_tube_code
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const values = [
      attributes.queenRight,
      attributes.queenDroneLaying,
      attributes.diseases,
      attributes.honeySupersOn,
      attributes.honeyFromSealedCells,
      attributes.honeyFromBrood,
      attributes.splitOrCombine,
      attributes.sampleTubeCode
    ];
    this.connection.executeSql(
      sqlStatement,
      values,
      () => console.log('survey insert successful'),
      (error) => console.log('survey insert failed', error)
    );
  }
}