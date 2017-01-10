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
        zip_code VARCHAR(20),
        race_of_bees TEXT
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
        age_of_queen INTEGER,
        hive_beetles VARCHAR(1),
        wax_moths VARCHAR(1),
        deformed_wings VARCHAR(1),
        black_shiny_bees VARCHAR(1),
        american_foul_brood VARCHAR(1),
        european_foul_brood VARCHAR(1),
        chalk_brood VARCHAR(1),
        abnormal_cappings VARCHAR(1),
        dried_remains VARCHAR(1),
        dysentery VARCHAR(1),
        number_of_mites INTEGER,
        honey_supers_on VARCHAR(1),
        honey_supers_removed VARCHAR(1),
        feeding_supplementary_sugar VARCHAR(1),
        honey_from_sealed_cells VARCHAR(1),
        honey_from_brood VARCHAR(1),
        split_or_combine VARCHAR(1),
        sample_tube_code INTEGER,
        will_perform_treatment VARCHAR(1),
        final_mite_count_of_season VARCHAR(1),
        mite_count_photo_uri VARCHAR(255),
        created_on TEXT
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
          zip_code,
          race_of_bees 
        )
        VALUES (?, ?, ?);`.replace(/\s+/g, " ");

        const attributes = {
          email: "belinda@beekeepers.us",
          zipCode: "12345-5555",
          raceOfBees: "Italian"
        };

        profileRepository.createRecord(attributes);

        const expectedAttributes = [
          attributes.email,
          attributes.zipCode,
          attributes.raceOfBees
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
          age_of_queen,
          hive_beetles,
          wax_moths,
          deformed_wings,
          black_shiny_bees,
          american_foul_brood,
          european_foul_brood,
          chalk_brood,
          abnormal_cappings,
          dried_remains,
          dysentery,
          number_of_mites,
          honey_supers_on,
          honey_supers_removed,
          feeding_supplementary_sugar,
          honey_from_sealed_cells,
          honey_from_brood,
          split_or_combine,
          sample_tube_code,
          will_perform_treatment,
          final_mite_count_of_season,
          mite_count_photo_uri,
          created_on
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`.replace(/\s+/g, " ");

        const attributes = {
          queenRight: "Y",
          queenDroneLaying: "N",
          ageOfQueen: 8,
          hiveBeetles: "N",
          waxMoths: "Y",
          deformedWings: "N",
          blackShinyBees: "N",
          americanFoulBrood: "N",
          europeanFoulBrood: "Y",
          chalkBrood: "Y",
          abnormalCappings: "N",
          driedRemains: "Y",
          dysentery: "N",
          numberOfMites: 200,
          honeySupersOn: "Y",
          honeySupersRemoved: "Y",
          feedingSupplementarySugar: "N",
          honeyFromSealedCells: "N",
          honeyFromBrood: "Y",
          splitOrCombine: "N",
          sampleTubeCode: 1234567890,
          willPerformTreatment: "Y",
          finalMiteCountOfSeason: "N",
          miteCountPhotoUri: "testphotouri",
          createdOn: "January 12, 2017"
        };

        surveyRepository.createRecord(attributes);

        const expectedAttributes = [
          attributes.queenRight,
          attributes.queenDroneLaying,
          attributes.ageOfQueen,
          attributes.hiveBeetles,
          attributes.waxMoths,
          attributes.deformedWings,
          attributes.blackShinyBees,
          attributes.americanFoulBrood,
          attributes.europeanFoulBrood,
          attributes.chalkBrood,
          attributes.abnormalCappings,
          attributes.driedRemains,
          attributes.dysentery,
          attributes.numberOfMites,
          attributes.honeySupersOn,
          attributes.honeySupersRemoved,
          attributes.feedingSupplementarySugar,
          attributes.honeyFromSealedCells,
          attributes.honeyFromBrood,
          attributes.splitOrCombine,
          attributes.sampleTubeCode,
          attributes.willPerformTreatment,
          attributes.finalMiteCountOfSeason,
          attributes.miteCountPhotoUri,
          attributes.createdOn
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
