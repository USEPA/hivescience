// This code example is for sending data over to Geoplatform using Javascript.
// Instead of using XMLHttpRequest we will use the newer fetch API since it is terser.

// Make sure to switch out the serviceName for the name of the feature server
// you are targeting.
const serviceName = 'HiveScience';
// This is the generic endpoint for adding "features" to a Featured Service.
const surveyUrl = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/` +
  `rest/services/${serviceName}/FeatureServer/0/addFeatures`;
// In order to make updates or add photos to a feature we need to
// store the object id when we create it.
let featureObjectId;

// This is the data we're going to send over to Geoplatform. Note that it is
// an Array with a Hash, and the two top-level keys are for our attributes and
// the geo-spatial data.
let featureAttributes = JSON.stringify([
  {
    // Here are the actual attributes for the feature, you'll most likely get
    // this data from a form submission.
    attributes: {
      zip_code: 23323,
      email: "test@gmail.com"
    },
    // This is the geo-spatial data
    geometry: {
      x: -122.40,
      y: 37.78,
      spatialReference: {wkid: 4326}
    }
  }
]);

// We now create the request.
let request = fetch(surveyUrl, {
  // Since this is a Restful API we use the POST http verb to create a record.
  method: "POST",
  // The body has to point to a FormData object. Since it requires a few steps
  // and we will need to perform the same steps for when uploading a photo, we
  // extracted it into its own function.
  body: makeForm("features", featureAttributes)
});

// Since the fetch method uses Promises we need to handle the success
// and failure cases.

request.then((response) => {
  // Success case
  // Parse the response as JSON.
  return response.json();
}).then((json) => {
  // This is executed if the response was successful.
  // We receive the JSON that we parsed in the first callback.
  console.log(json);
  featureObjectId = json.addResults[0].objectId;
  // Here is the full JSON structure that was returned.
  // { "addResults" : [ {
  //    "objectId" : 217, "globalId" : "13B7EDC0-0735-4B11-931E-51FAB0092239", "success" : true
  // } ] }
  
  
// Check to ensure that "success" is not false. 
// If "success" is false then present user with the error code and error description
  // NOTE: When the addFeatures operation from the ArcGIS Online REST endpoint fails
  // to add the feature to the feature layer, it returns a response header status of "200 OK" 
  // (which the Fetch method interprets as a success), 
  // but inside the response JSON the key "success" will have a value of "false".
  // The below code accounts for this behavior.
  // NOTE: Intgers fields cannot exceed 10 integers in length.
  
if(json.addResults[0].success) {
        defer.resolve(json.addResults[0].objectId);
      } else {
        const error = json.addResults[0].error;
        defer.reject(`Error code: ${error.code}. ${error.description.replace("\r", "")}`);
      }
 
}).catch((error) => {
  // The request failed, insert error handling code that would be
  // appropriate for your app.
  console.log(error);
});

// This creates the form data object necessary to actual add the attributes
// to the request.
function makeForm(type, data) {
  let form = new FormData();
  // There is a 3rd, optional, argument to form.append which is used for the
  // file name. If you are uploading a file and want to control how it is named
  // on the Geoplatform, you would set the 3rd argument to the filename.
  form.append(type, data);
  form.append("f", "pjson");
  form.append("rollbackOnFailure", "true");
  return form;
}

// Adding photos to one of the previously added "features". We'll need to use
// featureObjectId since we have to attach photos to a specific feature.

const photoUrl = `https://services.arcgis.com/cJ9YHowT8TU7DUyn/arcgis/` +
  `rest/services/${serviceName}/FeatureServer/0/${featureObjectId}/addAttachment`;

// Since the only difference is what you name the upload and the data you upload,
// this example will be slightly condensed and won't have comments.

let photoBlob; // Binary data of the file you want to upload.

fetch(photoUrl, {
    method: "POST",
    // Instead of passing in "features" we pass in "file".
    body: makeForm("file", photoBlob)
}).then((response) => {
  return response.json();
}).then((json) => {
  console.log(json);
}).catch((error) => {
  console.log(error);
});
