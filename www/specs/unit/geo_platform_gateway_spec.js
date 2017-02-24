import expect from "expect.js";
import fetchMock from "fetch-mock";
import _ from "underscore";
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
GeoPlatformGateway.blobClass = Symbol;

describe("GeoPlatformGateway", () => {
  describe("sync", () => {
    const profile = {
      email: "belinda@beekeeping.us",
      last_treatment_date: "2016-10-20",
      lost_colonies_over_winter: "Y",
      monitor_varroa_mites: "Y",
      monitor_varroa_mites_count: 23,
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
      number_of_mites: 10,
      mite_count_photo_uri: "test_photo_uri",
      final_mite_count_of_season: 20
    };
    const geolocation = {
      y: 37.785834,
      x: -122.406417,
      spatialReference: {
        wkid: 4326
      }
    };
    const surveyJSON = [
      {
        "geometry": {
          "y": 37.785834,
          "x": -122.406417,
          "spatialReference": {
            "wkid": 4326
          }
        },
        "attributes": {
          "email": "belinda@beekeeping.us",
          "feeding_supplementary_sugar": "",
          "final_mite_count_of_season": 20,
          "hive_beetles": "",
          "honey_from_brood": "N",
          "honey_from_sealed_cells": "Y",
          "honey_supers_removed": "N",
          "last_treatment_date": "2016-10-20",
          "lost_colonies_over_winter": "Y",
          "monitor_varroa_mites": "Y",
          "monitor_varroa_mites_count": 23,
          "number_of_colonies": 205,
          "number_of_mites": 10,
          "queen_poor_performance": "Y",
          "queen_right": "Y",
          "race_of_bees": "Africanized Buckfast",
          "sample_tube_code": "12345",
          "split_or_combine": "Y",
          "treatment_methods": "Mite treatment applied",
          "zip_code": "22202"
        }
      }
    ];

    // profile, survey => translate Keys, merge
    it("sends a POST request with all of the profile & survey data", async() => {
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

      let formatter = new AttributesFormatter(profile, survey, geolocation);
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

    it("throws an error with the error code and message if the request fails in geoplatform", async() => {
      fetchMock.post(
        GeoPlatformGateway.surveyUrl,
        {
          "addResults": [
            {
              "objectId": "null objectId", // Makes the failing assertion easier to understand.
              "globalId": "C9F9EB0F-B4F5-4910-B62B-CD913B4BE9FC",
              "success": false,
              "error": {
                "code": 1000,
                "description": "Arithmetic overflow error converting expression to data type int.\r\nThe statement has been terminated."
              }
            }
          ]
        }
      );

      let requestError;
      let formatter = new AttributesFormatter(profile, survey, geolocation);
      let formattedAttributes = formatter.execute();

      let fakeBlob = Symbol("fakeBlob");

      const geoPlatform = new GeoPlatformGateway(formattedAttributes, fakeBlob);

      let fakeSurveyData = new FakeFormData();
      fakeSurveyData.append("features", JSON.stringify(surveyJSON));
      fakeSurveyData.append("f", "pjson");
      fakeSurveyData.append("rollbackOnFailure", "true");

      try {
        requestError = await geoPlatform.syncSurvey();
      } catch(error) {
        expect(error).to.equal("Error code: 1000. " +
         "Arithmetic overflow error converting expression to data type int.\n" +
         "The statement has been terminated.");
        expect(fetchMock.called(GeoPlatformGateway.surveyUrl)).to.be(true);
        fetchMock.restore();
        return;
      }
      expect().fail("The call to syncSurvey should have thrown an error");
    });
  });
});