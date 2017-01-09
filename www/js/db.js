const defaultSuccess = (action) => {
  return () => {
    console.log(`${action} success`);
  };
};

const defaultFailure = (action) => {
  return (error) => {
    console.log(`${action} failure`, error);
  };
};

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

  executeSql(sqlStatement, sqlVariables = [], success, failure) {
    let action = sqlStatement.split("(")[0].trim();
    success = success || defaultSuccess(action);
    failure = failure || defaultFailure(action);
    this.connection.executeSql(sqlStatement, sqlVariables, success, failure);
  }
}
