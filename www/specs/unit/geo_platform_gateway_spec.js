import expect from "expect.js";
import fetchMock from "fetch-mock";
import GeoPlatformGateway from "../../js/geo_platform/geo_platform_gateway";
import AttributesFormatter from "../../js/geo_platform/attributes_formatter";

class FakeFormData {
  constructor() {
    this.data = {};
  }

  append(key, value) {
    this.data[key] = value;
  }
}
GeoPlatformGateway.formDataClass = FakeFormData;

describe("GeoPlatformGateway", () => {
  describe("sync", () => {
    const profile = {
      email: "belinda@beekeeping.us",
      last_treatment_date: "2016-10-20",
      lost_colonies_over_winter: "Y",
      monitor_varroa_mites: "Y",
      monitor_varroa_mites_count: "23",
      number_of_colonies: 205,
      race_of_bees: "Africanized Buckfast",
      treatment_methods: "Mite treatment applied",
      zip_code: "22202",
    };
    const survey = {
      queen_right: "Y",
      queen_poor_performance: "Y",
      honey_supers_removed: "N",
      feeding_supplementary_sugar: "",
      honey_from_sealed_cells: "Y",
      honey_from_brood: "N",
      split_or_combine: "Y",
      sample_tube_code: "12345",
      number_of_mites: "10",
      mite_count_photo_uri: "test_photo_uri",
      final_mite_count_of_season: "20"
    };
    const surveyJSON = [
      {
        "attributes": {

          "Abnormal_Cappings": "",
          "Active_Monitoring": "Y",
          "Age_of_Queen": "",
          "American_Foul_Brood": "",
          "Bee_Kill": "",
          "Black_Shiny_Bees": "",
          "Brood_Nest": "N",
          "Chalkbrood": "",
          "Colonies_in_Apiary": "205",
          "Deformed_Wings": "",
          "Dried_Remains": "",
          "Dysentery": "",
          "European_Foul_Brood": "",
          "Filled_Tube": "12345",
          "Honey_Supers": "N",
          "Image_Upload_1": "",
          "Image_Upload_2": "",
          "Last_Treatment": "2016-10-20",
          "Management_Strategy": "Mite treatment applied",
          "Mite_Count_1": "10",
          "Mite_Count_2": "",
          "Mites_per_100_Bees": "",
          "Overwintering": "Y",
          "Parasitic_Mite_Syndrome": "",
          "Queen_Right": "Y",
          "Race": "Africanized Buckfast",
          "Sealed_Honey_Cells": "Y",
          "Small_Hive_Beetle": "",
          "Split_Combine_Colony": "Y",
          "Times_Year_Monitor": "23",
          "Total_Number_of_Bees": "",
          "Treatment_Required": "",
          "Treatment_Type": "",
          "Wax_Moth": "",

          "email": "belinda@beekeeping.us",
          "feeding_supplementary_sugar": "",
          "final_mite_count_of_season": "20",
          "queen_poor_performance": "Y",
          "zip_code": "22202",
        }
        // ,
        // "geometry": {
        //   "x": -102.4124797899999,
        //   "y": 57.77063009800008
        // }
      }
    ];

    // profile, survey => translate Keys, merge
    it("sends a POST request with all of the profile & survey data", async () => {
      const objectId = 1021;

      fetchMock.post(
        GeoPlatformGateway.surveyUrl,
        {
          "addResults": [
            {
              "objectId": objectId,
              "globalId": "A0BD4DE3-4E4A-4EBE-82A1-9E407600CADA",
              "success": true
            }
          ]
        }
      );

      fetchMock.post(GeoPlatformGateway.photoUrl(objectId), {"foo": "bar"});

      let formatter = new AttributesFormatter(profile, survey);
      let formattedAttributes = formatter.execute();

      let fakeBlob = Symbol("fakeBlob");

      const geoPlatform = new GeoPlatformGateway(formattedAttributes, fakeBlob);

      let fakeSurveyData = new FakeFormData();
      fakeSurveyData.append("features", JSON.stringify(surveyJSON));
      fakeSurveyData.append("f", "pjson");
      fakeSurveyData.append("rollbackOnFailure", "true");

      let fakePhotoData = new FakeFormData();
      fakePhotoData.append("file", fakeBlob);
      fakePhotoData.append("f", "pjson");
      fakePhotoData.append("rollbackOnFailure", "true");

      let surveyId = await geoPlatform.syncSurvey();
      await geoPlatform.syncPhoto(fakeBlob, surveyId);

      expect(fetchMock.called(GeoPlatformGateway.surveyUrl)).to.be(true);
      let rawBody = fetchMock.lastOptions(GeoPlatformGateway.surveyUrl).body;
      expect(rawBody).to.eql(fakeSurveyData);

      expect(fetchMock.called(GeoPlatformGateway.photoUrl(objectId))).to.be(true);
      expect(fetchMock.lastOptions(GeoPlatformGateway.photoUrl(objectId)).body).to.eql(fakePhotoData);

      fetchMock.restore();
    });
  });
});