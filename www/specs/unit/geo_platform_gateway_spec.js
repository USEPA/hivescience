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
      full_name: "Belinda Beekeeper",
      last_treatment_date: "2016-10-20",
      lost_colonies_over_winter: "Y",
      monitor_methods: "Screen bottom board",
      monitor_varroa_mites: "Y",
      monitor_varroa_mites_count: "23",
      number_of_colonies: 205,
      race_of_bees: "Africanized Buckfast",
      treatment_methods: "Mite treatment applied",
      zip_code: "22202",
    };
    const survey = {
      queen_right: "Y",
      queen_drone_laying: "Y",
      diseases: "",
      honey_supers_on: "N",
      honey_supers_removed: "",
      feeding_supplementary_sugar: "",
      honey_from_sealed_cells: "Y",
      honey_from_brood: "N",
      split_or_combine: "Y",
      sample_tube_code: "",
      mite_count_photo_uri: "test_photo_uri"
    };
    const surveyJSON = [
      {
        "attributes": {
          // This first set of attributes is only for the sake of our test.
          "email": "belinda@beekeeping.us",
          "full_name": "Belinda Beekeeper",
          "monitor_methods": "Screen bottom board",
          "zip_code": "22202",
          "diseases": "",
          "honey_supers_removed": "",
          "feeding_supplementary_sugar": "",
          "sample_tube_code": "",
          // Everything below is what the current acceptance endpoint
          // responds to.
          "Colonies_in_Apiary": "205",
          "Race": "Africanized Buckfast",
          "Active_Monitoring": "Y",
          "Times_Year_Monitor": "23",
          "Management_Strategy": "Mite treatment applied",
          "Queen_Right": "Y",
          "Drone_Laying_Queen": "Y",
          "Honey_Supers": "N",
          "Sealed_Honey_Cells": "Y",
          "Brood_Nest": "N",
          "Split_Combine_Colony": "Y",
          "Overwintering": "Y",
          "Last_Treatment": "2016-10-20",

          "Small_Hive_Beetle": "",
          "Age_of_Queen": "", // omit for now
          "Wax_Moth": "", // omit for now
          "Deformed_Wings": "", // omit for now
          "Black_Shiny_Bees": "", // omit for now
          "American_Foul_Brood": "", // omit for now
          "European_Foul_Brood": "", // omit for now
          "Chalkbrood": "", // omit for now
          "Parasitic_Mite_Syndrome": "", // omit for now
          "Dysentery": "", // omit for now
          "Spotty_Brood_Pattern": "", // omit for now
          "Abnormal_Cappings": "", // omit for now
          "Dried_Remains": "", // omit for now
          "Treatment_Type": "",
          "Filled_Tube": "",
          "Treatment_Required": "",
          "Mite_Count_1": "10",
          "Image_Upload_1": "",
          "Mites_per_100_Bees": "",
          "Bee_Kill": "",
          "Mite_Count_2": "",
          "Image_Upload_2": "",
          "Total_Number_of_Bees": ""
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

      await geoPlatform.sync();

      expect(fetchMock.called(GeoPlatformGateway.surveyUrl)).to.be(true);
      expect(fetchMock.lastOptions(GeoPlatformGateway.surveyUrl).body).to.eql(fakeSurveyData);

      expect(fetchMock.called(GeoPlatformGateway.photoUrl(objectId))).to.be(true);
      expect(fetchMock.lastOptions(GeoPlatformGateway.photoUrl(objectId)).body).to.eql(fakePhotoData);

      fetchMock.restore();
    });
  });
});