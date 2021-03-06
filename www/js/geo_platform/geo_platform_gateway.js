import "whatwg-fetch";
import Q from "Q";
import "babel-core/register";
import "babel-polyfill";
import moment from "moment";

let formDataClass;
let blobClass;

export default class GeoPlatformGateway {

  static set formDataClass(formData) {
    formDataClass = formData;
  }

  static get formDataClass() {
    return formDataClass ? formDataClass : eval("FormData");
  }

  static set blobClass(blob) {
    blobClass = blob;
  }

  static get blobClass() {
    return blobClass ? blobClass : eval("Blob");
  }

  static get surveyUrl() {
    return "https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/" +
      "rest/services/HiveScience/FeatureServer/0/addFeatures";
  }

  static photoUrl(id) {
    return "https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/" +
      "rest/services/HiveScience/FeatureServer/0/" + id + "/addAttachment";
  }

  constructor(attributes) {
    this.attributes = attributes;
  }

  syncSurvey() {
    let defer = Q.defer();
    fetch(GeoPlatformGateway.surveyUrl,
      {
        method: "POST",
        body: this._makeForm("features", this.attributes)
      }
    ).then((response) => {
      return response.json();
    }).then((json) => {
      if(json.addResults[0].success) {
        defer.resolve(json.addResults[0].objectId);
      } else {
        const error = json.addResults[0].error;
        defer.reject(`Error code: ${error.code}. ${error.description.replace("\r", "")}`);
      }
    }).catch((error) => {
      defer.reject(error);
    });
    return defer.promise;
  }

  syncPhoto(photoBlob, surveyId) {
    let defer = Q.defer();
    fetch(GeoPlatformGateway.photoUrl(surveyId),
      {
        method: "POST",
        body: this._makeForm("file", photoBlob, surveyId)
      }
    ).then((response) => {
      return response.json();
    }).then((json) => {
      defer.resolve();
    }).catch((error) => {
      defer.reject(error);
    });
    return defer.promise;
  }

  // private

  _makeForm(type, data, surveyId=null) {
    let form = new GeoPlatformGateway.formDataClass();
    const jsonAttributes = JSON.parse(this.attributes);
    if(data instanceof GeoPlatformGateway.blobClass) {
      const datePrefix = moment().format("YYYY-MM-DD");
      const isFollowUp = jsonAttributes[0].attributes.follow_up_submitted_on;
      let fileSuffix = isFollowUp ? "follow-up-survey" : "survey";
      const fileName = `${surveyId}_${datePrefix}_${fileSuffix}.jpg`;
      form.append(type, data, fileName);
    } else {
      form.append(type, data);
    }
    form.append("f", "pjson");
    form.append("rollbackOnFailure", "true");
    return form;
  }
}