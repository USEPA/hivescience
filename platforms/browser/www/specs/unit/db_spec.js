import ghost from "ghostjs"
import expect from "expect.js"
import sinon from "sinon"
import DB from '../../js/db';

describe("DB", () => {
  const connection = {
    executeSql: () => {}
  };
  const sqlitePlugin = {
    openDatabase: () => connection
  };

  describe('initialize', () => {
    let executeSqlSpy;
    let openDatabaseSpy;
    let db;

    beforeEach(() => {
      executeSqlSpy = sinon.spy(connection, 'executeSql');
      openDatabaseSpy = sinon.spy(sqlitePlugin, 'openDatabase');
      db = new DB(sqlitePlugin);
      db.initialize();
    });

    afterEach(() => {
      openDatabaseSpy.restore();
      executeSqlSpy.restore();
    });

    it("connects to the DB", () => {
      sinon.assert.calledWithMatch(openDatabaseSpy, {
        name: "buzz_buzz",
        location: "default"
      });

    });

    it("creates the necessary tables for this app", () => {
      db.createTables();
      let sqlStatement = "CREATE TABLE IF NOT EXISTS profiles" +
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100));";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });
  });
});
