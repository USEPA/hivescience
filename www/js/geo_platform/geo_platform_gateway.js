import "whatwg-fetch"

let formDataClass;

export default class GeoPlatformGateway {

  static set formDataClass(formData) {
    formDataClass = formData;
  }

  static get formDataClass() {
    return formDataClass ? formDataClass : eval("FormData");
  }

  constructor(attributes) {
    this.attributes = attributes;
  }

  get surveyUrl() {
    return "https://services.arcgis.com/cJ9YHowT8TU7DUyn/" +
      "arcgis/rest/services/Show_Me_The_Honey/FeatureServer/0/addFeatures";
  }

  sync() {
    let form = new GeoPlatformGateway.formDataClass();
    form.append("features", this.attributes);
    form.append("f", "pjson");
    form.append("rollbackOnFailure", "true");

    fetch(this.surveyUrl, {
      method: "POST",
      body: form
    }).then((response) => {
      return response.json();
    }).then((json) => {
      // TODO extract and persist the object ID
      // It is necessary for uploading images
      // `json.addResults[0].objectId`
      // console.log("Response from geoplatform: ", json);
    }).catch((error) => {
      console.log("failure", error);
    });
  }
}