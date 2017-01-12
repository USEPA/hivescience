import "whatwg-fetch";
import Q from "Q";
import "babel-core/register";
import "babel-polyfill";

let formDataClass;

export default class GeoPlatformGateway {

  static set formDataClass(formData) {
    formDataClass = formData;
  }

  static get formDataClass() {
    return formDataClass ? formDataClass : eval("FormData");
  }

  static get surveyUrl() {
    return "https://services.arcgis.com/cJ9YHowT8TU7DUyn/" +
      "arcgis/rest/services/Show_Me_The_Honey/FeatureServer/0/addFeatures";
  }

  static photoUrl(id) {
    return `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/rest/services/Show_Me_The_Honey/FeatureServer/0/${id}/addAttachment`;
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
      defer.resolve(json.addResults[0].objectId);
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
        body: this._makeForm("file", photoBlob)
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

  _makeForm(type, data) {
    let form = new GeoPlatformGateway.formDataClass();
    form.append(type, data);
    form.append("f", "pjson");
    form.append("rollbackOnFailure", "true");
    return form;
  }
}