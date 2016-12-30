import {ProfileRepository, SurveyRepository} from "./repositories/repositories"

export default class DB {
  constructor(sqlitePlugin) {
    this.sqlitePlugin = sqlitePlugin;
  }

  initialize() {
    this.connection = this.sqlitePlugin.openDatabase({
      name: "buzz_buzz",
      location: "default"
    });
    this.profileRepository = new ProfileRepository(this);
    this.surveyRepository = new SurveyRepository(this);
  }

  createTables() {
    this.createProfilesTable();
    this.createSurveysTable();
  }

  createProfilesTable() {
    this.profileRepository.createTable();
  }

  createSurveysTable() {
    this.surveyRepository.createTable();
  }

  createProfile(attributes) {
    this.profileRepository.createRecord(attributes);
  }

  allProfiles() {
    return this.profileRepository.findAll();
  }

  allSurveys() {
    return this.surveyRepository.findAll();
  }

  createSurvey(attributes) {
    this.surveyRepository.createRecord(attributes);
  }

  executeSql(sqlStatement, sqlVariables = []) {
    let action = sqlStatement.split("(")[0].trim();
    this.connection.executeSql(
      sqlStatement,
      sqlVariables,
      () => console.log(`${action} successful`),
      (error) => console.log(`${action} failed`, error)
    );
  }
}

