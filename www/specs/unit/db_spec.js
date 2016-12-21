import ghost from "ghostjs"
import expect from "expect.js"
import sinon from "sinon"
import DB from "../../js/db";

describe("DB", () => {
  const connection = {
    executeSql: () => {}
  };
  const sqlitePlugin = {
    openDatabase: () => connection
  };

  let executeSqlSpy;
  let openDatabaseSpy;
  let db;

  beforeEach(() => {
    executeSqlSpy = sinon.spy(connection, "executeSql");
    openDatabaseSpy = sinon.spy(sqlitePlugin, "openDatabase");
    db = new DB(sqlitePlugin);
    db.initialize();
  });

  afterEach(() => {
    openDatabaseSpy.restore();
    executeSqlSpy.restore();
  });

  describe("initialize", () => {
    it("connects to the DB", () => {
      sinon.assert.calledWithMatch(openDatabaseSpy, {
        name: "buzz_buzz",
        location: "default"
      });
    });

    it("creates the necessary tables for this app", () => {
      db.createTables();
      let sqlStatement = "CREATE TABLE IF NOT EXISTS profiles" +
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), " +
        "full_name VARCHAR(100), " +
        "zip_code VARCHAR(20));";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });
  });

  describe("createProfile", () => {
    it("persists a profile record with the provided attributes", () => {
      const attributes = {
        email: "belinda@beekeepers.us",
        fullName: "Belinda Bees",
        zipCode: "12345-5555"
      };
      db.createProfile(attributes);
      const sqlStatement = "INSERT INTO profiles (email, full_name, zip_code) VALUES (?, ?, ?);";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement,
        [attributes.email, attributes.fullName, attributes.zipCode]);
    });
  });
});
