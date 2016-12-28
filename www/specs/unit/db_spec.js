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
        last_treatment_date TEXT,
        lost_colonies_over_winter VARCHAR(1)
      );`;
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });

    it("creates the survey table for this app", () => {
      db.createTables();
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
        honey_supers_removed VARCHAR(1),
        honey_from_sealed_cells VARCHAR(1),
        honey_from_brood VARCHAR(1),
        split_or_combine VARCHAR(1),
        sample_tube_code INTEGER
      );`;
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });
  });

  describe("create", () => {
    describe("createProfile", () => {
      it("persists a profile record with the provided attributes", () => {
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
          last_treatment_date,
          lost_colonies_over_winter
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const attributes = {
          email: "belinda@beekeepers.us",
          fullName: "Belinda Bees",
          zipCode: "12345-5555",
          numberOfColonies: 111,
          raceOfBees: "Unknown, Italian, Other",
          monitorVarroaMites: "N",
          monitorVarroaMitesCount: 345,
          monitorMethods: "Alcohol Wash, Other",
          treatmentMethods: "Requeening with resistant stock, Other",
          lastTreatmentDate: "2016-03-20",
          lostColoniesOverWinter: "Y"
        };

        db.createProfile(attributes);

        const expectedAttributes = [
          attributes.email,
          attributes.fullName,
          attributes.zipCode,
          attributes.numberOfColonies,
          attributes.raceOfBees,
          attributes.monitorVarroaMites,
          attributes.monitorVarroaMitesCount,
          attributes.monitorMethods,
          attributes.treatmentMethods,
          attributes.lastTreatmentDate,
          attributes.lostColoniesOverWinter
        ];

        sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement, expectedAttributes);
      });
    });

    describe("createSurvey", () => {
      it("persists a survey record with the provided attributes", () => {
        const sqlStatement = `
        INSERT INTO surveys (
          queen_right,
          queen_drone_laying,
          diseases,
          honey_supers_on,
          honey_supers_removed,
          honey_from_sealed_cells,
          honey_from_brood,
          split_or_combine,
          sample_tube_code
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const attributes = {
          queenRight: "Y",
          queenDroneLaying: "N",
          diseases: "Abnormal cappings, Other",
          honeySupersOn: "Y",
          honeySupersRemoved: "Y",
          honeyFromSealedCells: "N",
          honeyFromBrood: "Y",
          splitOrCombine: "N",
          sampleTubeCode: 1234567890
        };

        db.createSurvey(attributes);

        const expectedAttributes = [
          attributes.queenRight,
          attributes.queenDroneLaying,
          attributes.diseases,
          attributes.honeySupersOn,
          attributes.honeySupersRemoved,
          attributes.honeyFromSealedCells,
          attributes.honeyFromBrood,
          attributes.splitOrCombine,
          attributes.sampleTubeCode
        ];

        sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement, expectedAttributes);
      });
    });
  });
});
