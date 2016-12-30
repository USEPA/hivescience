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
