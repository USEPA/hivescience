import ghost from "ghostjs"
import expect from "expect.js"
import sinon from "sinon"
import DB from "../../js/db";

describe("DB", () => {
  const connection = {
    executeSql: () => {
    }
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

    it("creates the profile table for this app", () => {
      db.createTables();
      const sqlStatement = "CREATE TABLE IF NOT EXISTS profiles" +
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(100), " +
        "full_name VARCHAR(100), zip_code VARCHAR(20), " +
        "number_of_colonies INTEGER, monitor_varroa_mites VARCHAR(1), " +
        "monitor_varroa_mites_count INTEGER, monitor_methods VARCHAR(255), " +
        "treatment_methods VARCHAR(255), why_beekeep TEXT);";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });

    it("creates the survey table for this app", () => {
      db.createTables();
      const sqlStatement = "CREATE TABLE IF NOT EXISTS surveys" +
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, queen_right VARCHAR(1), " +
        "queen_drone_laying VARCHAR(1), queen_age INTEGER);";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });
  });

  describe("createProfile", () => {
    it("persists a profile record with the provided attributes", () => {
      const attributes = {
        email: "belinda@beekeepers.us",
        fullName: "Belinda Bees",
        zipCode: "12345-5555",
        numberOfColonies: 111,
        monitorVarroaMites: "N",
        monitorVarroaMitesCount: 345,
        monitorMethods: "Alcohol Wash, Other",
        treatmentMethods: "Requeening with resistant stock, Other",
        whyBeekeep: "To save the bees"
      };

      db.createProfile(attributes);

      const sqlStatement = "INSERT INTO profiles " +
        "(email, full_name, zip_code, number_of_colonies, monitor_varroa_mites, " +
        "monitor_varroa_mites_count, monitor_methods, treatment_methods, " +
        "why_beekeep) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement,
        [attributes.email, attributes.fullName, attributes.zipCode,
          attributes.numberOfColonies, attributes.monitorVarroaMites,
          attributes.monitorVarroaMitesCount, attributes.monitorMethods,
          attributes.treatmentMethods, attributes.whyBeekeep]);
    });
  });

  describe("createSurvey", () => {
    it("persists a survey record with the provided attributes", () => {
      const attributes = {
        queenRight: "Y",
        queenDroneLaying: "N",
        queenAge: 3
      };

      db.createSurvey(attributes);

      const sqlStatement = "INSERT INTO surveys " +
        "(queen_right, queen_drone_laying, queen_age) " +
        "VALUES (?, ?, ?);";
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement,
        [attributes.queenRight, attributes.queenDroneLaying, attributes.queenAge]);
    });
  });
});
