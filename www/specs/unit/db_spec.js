import expect from "expect.js"
import sinon from "sinon"
import DB from "../../js/db"
import Q from "Q"
import ProfileRepository from "../../js/repositories/profile_repository"
import SurveyRepository from "../../js/repositories/survey_repository"

describe("DB", () => {
  let connection = {
    executeSql: () => {
    }
  };

  let sqlitePlugin = {
    openDatabase: () => connection
  };

  let executeSqlSpy;
  let openDatabaseSpy;
  let db;
  let profileRepository;
  let surveyRepository;

  beforeEach(() => {
    openDatabaseSpy = sinon.spy(sqlitePlugin, "openDatabase");
    db = new DB(sqlitePlugin);
    db.initialize();
    profileRepository = new ProfileRepository(db);
    surveyRepository = new SurveyRepository(db);
  });

  afterEach(() => {
    openDatabaseSpy.restore();
  });

  describe("initialize", () => {
    beforeEach(() => {
      executeSqlSpy = sinon.spy(connection, "executeSql");
    });

    afterEach(() => {
      executeSqlSpy.restore();
    });

    it("connects to the DB", () => {
      sinon.assert.calledWithMatch(openDatabaseSpy, {
        name: "buzz_buzz",
        location: "default"
      });
    });

    it("creates the profile table for this app", () => {
      profileRepository.createTable();
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
      );`.replace(/\s+/g, " ");
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });

    it("creates the survey table for this app", () => {
      surveyRepository.createTable();
      const sqlStatement = `
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        queen_right VARCHAR(1),
        queen_drone_laying VARCHAR(1),
        diseases TEXT,
        honey_supers_on VARCHAR(1),
        honey_supers_removed VARCHAR(1),
        feeding_supplementary_sugar VARCHAR(1),
        honey_from_sealed_cells VARCHAR(1),
        honey_from_brood VARCHAR(1),
        split_or_combine VARCHAR(1),
        sample_tube_code INTEGER
      );`.replace(/\s+/g, " ");
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });
  });

  describe("create", () => {
    beforeEach(() => {
      executeSqlSpy = sinon.spy(connection, "executeSql");
    });

    afterEach(() => {
      executeSqlSpy.restore();
    });

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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`.replace(/\s+/g, " ");

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

        profileRepository.createRecord(attributes);

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
          feeding_supplementary_sugar,
          honey_from_sealed_cells,
          honey_from_brood,
          split_or_combine,
          sample_tube_code
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`.replace(/\s+/g, " ");

        const attributes = {
          queenRight: "Y",
          queenDroneLaying: "N",
          diseases: "Abnormal cappings, Other",
          honeySupersOn: "Y",
          honeySupersRemoved: "Y",
          feedingSupplementarySugar: "N",
          honeyFromSealedCells: "N",
          honeyFromBrood: "Y",
          splitOrCombine: "N",
          sampleTubeCode: 1234567890
        };

        surveyRepository.createRecord(attributes);

        const expectedAttributes = [
          attributes.queenRight,
          attributes.queenDroneLaying,
          attributes.diseases,
          attributes.honeySupersOn,
          attributes.honeySupersRemoved,
          attributes.feedingSupplementarySugar,
          attributes.honeyFromSealedCells,
          attributes.honeyFromBrood,
          attributes.splitOrCombine,
          attributes.sampleTubeCode
        ];

        sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement, expectedAttributes);
      });
    });
  });

  describe("reading", () => {
    describe("findAll", () => {
      it("should return an array of all the records for the given repository", async function() {
        const sqlStatement = "SELECT * FROM profiles;";
        let rowsArray = [{id: 1, full_name: "Belinda", email: "belinda@gmail.com"}];
        let rows = {item: (index) => rowsArray[0], length: 1};
        let sqlResult = {rows: rows, rowsAffected: 0, insertId: 2};
        let defer = Q.defer();
        connection.executeSql = (sql, variables, callback) => {
          expect(sql).to.equal(sqlStatement);
          defer.resolve(callback(sqlResult));
          return defer.promise;
        };
        let profiles = await profileRepository.findAll();
        expect(profiles).to.eql(rowsArray);
      })
    })
  });
});
