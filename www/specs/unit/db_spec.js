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
        race_of_bees TEXT,
        full_name TEXT
      );`.replace(/\s+/g, " ");
      sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement);
    });

    it("creates the survey table for this app", () => {
      surveyRepository.createTable();
      const sqlStatement = `
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        queen_right VARCHAR(1),
        queen_poor_performance VARCHAR(1),
        age_of_queen INTEGER,
        abnormal_brood_pattern VARCHAR(1),
        abnormal_cappings VARCHAR(1),
        abnormal_odor VARCHAR(1),
        hive_beetles VARCHAR(1),
        wax_moths VARCHAR(1),
        deformed_wings VARCHAR(1),
        black_shiny_bees VARCHAR(1),
        american_foul_brood VARCHAR(1),
        european_foul_brood VARCHAR(1),
        chalk_brood VARCHAR(1),
        snotty_brood VARCHAR(1),
        parasitic_mite_syndrome VARCHAR(1),
        dried_remains VARCHAR(1),
        dysentery VARCHAR(1),
        spotty_brood_pattern VARCHAR(1),
        number_of_mites INTEGER,
        honey_supers_removed VARCHAR(1),
        feeding_supplementary_sugar VARCHAR(1),
        honey_from_sealed_cells VARCHAR(1),
        honey_from_brood VARCHAR(1),
        split_or_combine VARCHAR(1),
        sample_tube_code INTEGER,
        hive_healthy VARCHAR(1),
        will_perform_treatment VARCHAR(1),
        final_mite_count_of_season VARCHAR(1),
        mite_count_photo_uri VARCHAR(255),
        created_on TEXT,
        did_you_perform_treatment VARCHAR(1),
        requeen VARCHAR(1),
        remove_drone_brood VARCHAR(1),
        brood_interruption VARCHAR(1),
        screen_bottom_board VARCHAR(1),
        soft_or_hard_treatment VARCHAR(1),
        kind_of_chemical VARCHAR(1),
        survive_treatment VARCHAR(1),
        survive_treatment_description TEXT,
        follow_up_number_of_mites INTEGER,
        follow_up_mite_count_photo_uri VARCHAR(255),
        follow_up_submitted_on TEXT,
        honey_report_submitted_on TEXT,
        survived_winter VARCHAR(1),
        winter_treatment VARCHAR(1),
        overwintering_report_submitted_on TEXT,
        honey_or_pollen VARCHAR(1),
        why_hive_failed TEXT
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
          race_of_bees,
          full_name
        )
        VALUES (?, ?, ?, ?);`.replace(/\s+/g, " ");

        const attributes = {
          email: "belinda@beekeepers.us",
          zipCode: "12345-5555",
          raceOfBees: "Italian",
          fullName: "John Doe"
        };

        profileRepository.createRecord(attributes);

        const expectedAttributes = [
          attributes.email,
          attributes.zipCode,
          attributes.raceOfBees,
          attributes.fullName
        ];

        sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement, expectedAttributes);
      });
    });

    describe("createSurvey", () => {
      it("persists a survey record with the provided attributes", () => {
        const sqlStatement = `
        INSERT INTO surveys (
          queen_right,
          queen_poor_performance,
          age_of_queen,
          abnormal_brood_pattern,
          abnormal_cappings,
          abnormal_odor,
          hive_beetles,
          wax_moths,
          deformed_wings,
          black_shiny_bees,
          american_foul_brood,
          european_foul_brood,
          chalk_brood,
          snotty_brood,
          parasitic_mite_syndrome,
          dried_remains,
          dysentery,
          spotty_brood_pattern,
          number_of_mites,
          honey_supers_removed,
          feeding_supplementary_sugar,
          honey_from_sealed_cells,
          honey_from_brood,
          split_or_combine,
          sample_tube_code,
          hive_healthy,
          will_perform_treatment,
          final_mite_count_of_season,
          mite_count_photo_uri,
          created_on,
          did_you_perform_treatment,
          requeen,
          remove_drone_brood,
          brood_interruption,
          screen_bottom_board,
          soft_or_hard_treatment,
          kind_of_chemical,
          survive_treatment,
          survive_treatment_description,
          follow_up_number_of_mites,
          follow_up_mite_count_photo_uri,
          follow_up_submitted_on,
          honey_report_submitted_on,
          survived_winter,
          winter_treatment,
          overwintering_report_submitted_on,
          honey_or_pollen,
          why_hive_failed
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
          ?, ?);`.replace(/\s+/g, " ");

        const attributes = {
          queenRight: "Y",
          queenPoorPerformance: "N",
          ageOfQueen: 8,
          abnormalBroodPattern: "N",
          abnormalCappings: "N",
          abnormalOdor: "N",
          hiveBeetles: "N",
          waxMoths: "Y",
          deformedWings: "N",
          blackShinyBees: "N",
          americanFoulBrood: "N",
          europeanFoulBrood: "Y",
          chalkBrood: "Y",
          snottyBrood: "Y",
          parasiticMiteSyndrome: "N",
          driedRemains: "Y",
          dysentery: "N",
          spottyBroodPattern: "Y",
          numberOfMites: 200,
          honeySupersRemoved: "Y",
          feedingSupplementarySugar: "N",
          honeyFromSealedCells: "N",
          honeyFromBrood: "Y",
          splitOrCombine: "N",
          sampleTubeCode: 1234567890,
          hiveHealthy: "N",
          willPerformTreatment: "Y",
          finalMiteCountOfSeason: "N",
          miteCountPhotoUri: "testphotouri",
          createdOn: "January 12, 2017",

          didYouPerformTreatment: "Y",
          requeen: "N",
          removeDroneBrood: "N",
          broodInterruption: "Y",
          screenBottomBoard: "N",
          softOrHardTreatment: "N",
          kindOfChemical: "",
          surviveTreatment: "Y",
          surviveTreatmentDescription: "",
          followUpNumberOfMites: "2",
          followUpMiteCountPhotoUri: "photo-2.jpg",
          followUpSubmittedOn: "1/16/17",
          honeyReportSubmittedOn: "1/18/17",
          survivedWinter: "Y",
          winterTreatment: "N",
          overwinteringReportSubmittedOn: "1/19/17",
          honeyOrPollen: "N",
          whyHiveFailed:"It failed."
        };

        surveyRepository.createRecord(attributes);

        const expectedAttributes = [
          attributes.queenRight,
          attributes.queenPoorPerformance,
          attributes.ageOfQueen,
          attributes.abnormalBroodPattern,
          attributes.abnormalCappings,
          attributes.abnormalOdor,
          attributes.hiveBeetles,
          attributes.waxMoths,
          attributes.deformedWings,
          attributes.blackShinyBees,
          attributes.americanFoulBrood,
          attributes.europeanFoulBrood,
          attributes.chalkBrood,
          attributes.snottyBrood,
          attributes.parasiticMiteSyndrome,
          attributes.driedRemains,
          attributes.dysentery,
          attributes.spottyBroodPattern,
          attributes.numberOfMites,
          attributes.honeySupersRemoved,
          attributes.feedingSupplementarySugar,
          attributes.honeyFromSealedCells,
          attributes.honeyFromBrood,
          attributes.splitOrCombine,
          attributes.sampleTubeCode,
          attributes.hiveHealthy,
          attributes.willPerformTreatment,
          attributes.finalMiteCountOfSeason,
          attributes.miteCountPhotoUri,
          attributes.createdOn,

          attributes.didYouPerformTreatment,
          attributes.requeen,
          attributes.removeDroneBrood,
          attributes.broodInterruption,
          attributes.screenBottomBoard,
          attributes.softOrHardTreatment,
          attributes.kindOfChemical,
          attributes.surviveTreatment,
          attributes.surviveTreatmentDescription,
          attributes.followUpNumberOfMites,
          attributes.followUpMiteCountPhotoUri,
          attributes.followUpSubmittedOn,
          attributes.honeyReportSubmittedOn,
          attributes.survivedWinter,
          attributes.winterTreatment,
          attributes.overwinteringReportSubmittedOn,
          attributes.honeyOrPollen,
          attributes.whyHiveFailed
        ];

        sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement, expectedAttributes);
      });
    });
  });

  describe("reading", () => {
    beforeEach(() => {
      executeSqlSpy = sinon.spy(connection, "executeSql");
    });

    afterEach(() => {
      executeSqlSpy.restore();
    });
    describe("findAll", () => {
      it("should return an array of all the records for the given repository", async function () {
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

  describe("updating", () => {
    beforeEach(() => {
      executeSqlSpy = sinon.spy(connection, "executeSql");
    });

    afterEach(() => {
      executeSqlSpy.restore();
    });

    describe("updateRecord", () => {
      it("updates the survey with the given id using the other provided attributes", () => {
        const attributes = {
          didYouPerformTreatment: "Y",
          kindOfChemical: "N",
          followUpMiteCountPhotoUri: "photo-two.png",
          id: 1000
        };

        const sqlStatement = `
        UPDATE surveys
        SET
        did_you_perform_treatment = ?,
        kind_of_chemical = ?,
        follow_up_mite_count_photo_uri = ?
        WHERE id = 1000;`.replace(/\s+/g, " ");

        surveyRepository.updateRecord(attributes);

        const expectedAttributes = [
          attributes.didYouPerformTreatment,
          attributes.kindOfChemical,
          attributes.followUpMiteCountPhotoUri
        ];

        sinon.assert.calledWithMatch(executeSqlSpy, sqlStatement, expectedAttributes);
      });
    });
  });

});
