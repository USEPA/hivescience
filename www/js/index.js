import _ from "underscore";
import $ from "jquery";
import Q from "Q";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes, checkIfYes, checkIfNo, ariaCheckIfYes, ariaCheckIfNo} from "./helpers";
import ProfileRepository from "./repositories/profile_repository";
import SurveyRepository from "./repositories/survey_repository";
import GeoPlatformGateway from "./geo_platform/geo_platform_gateway";
import AttributesFormatter from "./geo_platform/attributes_formatter";
import CameraService from "./services/camera_service";
import FileService from "./services/file_service";
import "babel-core/register";
import "babel-polyfill";
import moment from "moment";

let db;
let body;

let profileFormTemplate;
let surveyFormTemplate;
let dataViewTemplate;
let welcomeTemplate;
let reportsTemplate;
let followUpFormTemplate;
let honeyFormTemplate;
let overwinteringFormTemplate;

let profileRepository;
let surveyRepository;

let cameraService;
let fileService;

// State
let onResumeOccurred = false;
let onResumeEvent = null;
let currentSurvey = null;
let currentSection = null;
let profileAttributes = {};
let surveyAttributes = {};
let photoButtonKey = null;
let copiedFileUri = null;
let miteCountPhotoUri = {};

const APP_STORAGE_KEY = 'epa-beekeeping-survey';

const LOADING_IMAGE_SRC = `
<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="120px" height="120px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-inf">
<rect x="0" y="0" width="100" height="100" fill="none" class="bk"/>
<path id="uil-inf-path" d="M24.3,30C11.4,30,5,43.3,5,50s6.4,20,19.3,20c19.3,0,32.1-40,51.4-40 C88.6,30,95,43.3,95,50s-6.4,20-19.3,20C56.4,70,43.6,30,24.3,30z" fill="none" stroke="#454545" stroke-width="1px" stroke-dasharray="5px"/>
<circle cx="0" cy="0" r="5" fill="#FABA60">
<animateMotion begin="0s" dur="1.5s" repeatCount="indefinite">
<mpath xlink:href="#uil-inf-path"/>
</animateMotion>
</circle>
<circle cx="0" cy="0" r="5" fill="#FABA60">
<animateMotion begin="0.12s" dur="1.5s" repeatCount="indefinite">
<mpath xlink:href="#uil-inf-path"/>
</animateMotion>
</circle>
<circle cx="0" cy="0" r="5" fill="#FABA60">
<animateMotion begin="0.25s" dur="1.5s" repeatCount="indefinite">
<mpath xlink:href="#uil-inf-path"/>
</animateMotion>
</circle>
<circle cx="0" cy="0" r="5" fill="#FABA60">
<animateMotion begin="0.37s" dur="1.5s" repeatCount="indefinite">
<mpath xlink:href="#uil-inf-path"/>
</animateMotion>
</circle>
<circle cx="0" cy="0" r="5" fill="#FABA60">
<animateMotion begin="0.5s" dur="1.5s" repeatCount="indefinite">
<mpath xlink:href="#uil-inf-path"/>
</animateMotion>
</circle>
</svg>
`;

let app = {
  initialize: function () {
    Handlebars.registerHelper('checkIfYes', checkIfYes);
    Handlebars.registerHelper('checkIfNo', checkIfNo);
    Handlebars.registerHelper('ariaCheckIfYes', ariaCheckIfYes);
    Handlebars.registerHelper('ariaCheckIfNo', ariaCheckIfNo);

    profileFormTemplate = Handlebars.compile($("#profile-form-template").html());
    surveyFormTemplate = Handlebars.compile($("#survey-form-template").html());
    dataViewTemplate = Handlebars.compile($("#data-view-template").html());
    welcomeTemplate = Handlebars.compile($("#welcome-template").html());
    reportsTemplate = Handlebars.compile($("#reports-template").html());
    followUpFormTemplate = Handlebars.compile($("#follow-up-form-template").html());
    honeyFormTemplate = Handlebars.compile($("#honey-form-template").html());
    overwinteringFormTemplate = Handlebars.compile($("#overwintering-form-template").html());

    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
    document.addEventListener("pause", this.onPause.bind(this), false);
    document.addEventListener("resume", this.onResume.bind(this), false);
  },

  onDeviceReady: async function () {
    body = $("body");
    cameraService = new CameraService(navigator.camera);
    fileService = new FileService(window, FileReader, Blob);
    await this._setupDatabase();

    if (onResumeOccurred) {
      await this._setupStateFromOnResume();
    }

    if (_.includes(["survey-form", "follow-up-form"], currentSurvey)) {
      this._restorePage();
      return;
    }

    if (await this._profileExists()) {
      const surveys = await surveyRepository.findAll();
      if (surveys.length > 0) {
        this.renderReportsView(surveys);
      } else {
        this.renderWelcomeTemplate();
      }
    } else {
      this.renderProfileForm();
    }
  },

  _setupStateFromOnResume: async function () {
    const state = JSON.parse(window.localStorage.getItem(APP_STORAGE_KEY));
    currentSurvey = state.currentSurvey;
    currentSection = state.currentSection;
    surveyAttributes = state.surveyAttributes;
    photoButtonKey = state.photoButtonKey;
    copiedFileUri = state.copiedFileUri;

    if (onResumeEvent.pendingResult && onResumeEvent.pendingResult.pluginStatus === "OK") {
      if (onResumeEvent.pendingResult.pluginServiceName === "Camera") {
        copiedFileUri = await this._copyImageToDataDirectory(
          onResumeEvent.pendingResult.result,
          photoButtonKey
        );
      }
    }
    const photoAttributes = {};
    photoAttributes[photoButtonKey] = copiedFileUri;
    _.extend(surveyAttributes, photoAttributes);
  },

  _restorePage: function () {
    if (currentSurvey.match(/survey/)) {
      this.renderSurveyForm();
    } else {
      this.renderFollowUpForm(surveyAttributes.id);
    }
    $("#survey-section-1").hide();
    $(`#${currentSection}`).show();
    let pageNumber = Number(currentSection.match(/(\d)$/)[0]);
    $(`#survey-section-${pageNumber} .section-indicator`).children().eq(pageNumber - 1)
      .css("background-color", "rgba(255,255,255,1.0)");
  },

  onPause: function () {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({
      currentSurvey: $("form").attr("id"),
      currentSection: $("form section:visible").attr("id"),
      surveyAttributes: formatAttributes($("form").serializeArray()),
      photoButtonKey: photoButtonKey,
      copiedFileUri: copiedFileUri
    }));
  },

  // This will run before onDeviceReady if the app is being resumed.
  onResume: async function (event) {
    onResumeOccurred = true;
    onResumeEvent = event;
  },

  renderProfileForm: function () {
    $("#main-container").html(profileFormTemplate());

    this._focusOnPageHeader("h1");

    this._setupRadioButtons();

    const form = $("#profile-form");
    form.on("submit", (event) => {
      event.preventDefault();
      profileAttributes = formatAttributes(form.serializeArray());

      if (profileAttributes.zipCode == "") {
        $("#zip-code").css("border", "1px solid red");
        $("label[for=zip-code]").css("color", "red");
        $("#zip-code-error-message").fadeIn(300);
      }

      if (profileAttributes.email == "") {
        $("#email").css("border", "1px solid red");
        $("label[for=email]").css("color", "red");
        $("#email-error-message").fadeIn(300);
      }

      if (profileAttributes.zipCode == "" || profileAttributes.email == "") {
        this._focusOnPageHeader("h1");
        return;
      }

      profileRepository.createRecord(profileAttributes);
      $("#profile-form-template").hide();
      this.renderWelcomeTemplate();
    });
  },

  renderWelcomeTemplate() {
    $("#main-container").html(welcomeTemplate());

    $(".create-report").on("click", (event) => {
      event.preventDefault();
      this.renderSurveyForm();
    });
  },

  renderSurveyForm: function () {
    body.removeClass("white-background");
    body.addClass("gray-background");

    _.assign(surveyAttributes, {currentDate: moment().format("LL")});
    $("#main-container").html(surveyFormTemplate(surveyAttributes));

    this._focusOnPageHeader();

    this._setupPagination();
    this._setupRadioButtons();
    this._setupAddMitesPhotoButton();
    this._setupNumberOfMitesCalculator();

    const form = $("#survey-form");
    form.on("submit", async(event) => {
      event.preventDefault();
      surveyAttributes = formatAttributes(form.serializeArray());
      const baseAttributes = {createdOn: (new Date()).toLocaleDateString()};
      _.extend(surveyAttributes, baseAttributes, miteCountPhotoUri);
      await surveyRepository.createRecord(surveyAttributes);

      surveyAttributes = {};

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      const syncError = await this._attemptSyncToGeoplatform(profiles, surveys);

      $("#survey-form-template").hide();
      this.renderReportsView(surveys, syncError);
    });
  },

  renderReportsView: function (surveys, syncError = false) {
    body.removeClass("gray-background");
    body.addClass("white-background");
    surveys = surveys.map((survey) => {
      survey.renderFollowUpButton = survey.will_perform_treatment === "Y";
      survey.followUpSubmitted = survey.follow_up_submitted_on != null;
      survey.renderHoneyReportButton = survey.final_mite_count_of_season === "Y";
      survey.honeyReportSubmitted = survey.honey_report_submitted_on != null;
      survey.renderOverwinterReportButton = survey.honeyReportSubmitted;
      survey.overwinteringReportSubmitted = survey.overwintering_report_submitted_on != null;
      return survey;
    });

    $("#main-container").html(reportsTemplate({surveys: surveys, syncError: syncError}));

    this._focusOnPageHeader("h1");

    $(".follow-up-button").on("click keypress", (event) => {
      event.preventDefault();
      this.renderFollowUpForm($(event.currentTarget).data("survey-id"));
    });

    $(".honey-report-button").on("click keypress", (event) => {
      event.preventDefault();
      this.renderHoneyForm($(event.currentTarget).data("survey-id"));
    });

    $(".overwintering-report-button").on("click keypress", (event) => {
      event.preventDefault();
      this.renderOverwinteringForm($(event.currentTarget).data("survey-id"));
    });

    $(".create-report").on("click keypress", (event) => {
      event.preventDefault();
      this.renderSurveyForm();
    });

  },

  renderFollowUpForm: function (surveyId) {
    body.removeClass("white-background");
    body.addClass("gray-background");

    _.assign(surveyAttributes, {surveyId: surveyId, currentDate: moment().format("LL")});
    $("#main-container").html(followUpFormTemplate(surveyAttributes));

    this._focusOnPageHeader();

    this._setupPagination();
    this._setupRadioButtons();
    this._setupAddMitesPhotoButton();
    this._setupNumberOfMitesCalculator();

    const form = $("#follow-up-form");
    form.on("submit", async(event) => {
      event.preventDefault();
      surveyAttributes = formatAttributes(form.serializeArray());
      surveyAttributes.followUpSubmittedOn = (new Date()).toLocaleDateString();
      _.extend(surveyAttributes, miteCountPhotoUri);
      await surveyRepository.updateRecord(surveyAttributes);

      surveyAttributes = {};

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      const syncError = await this._attemptSyncToGeoplatform(profiles, surveys);

      $("#follow-up-form-template").hide();
      this.renderReportsView(surveys, syncError);
    });
  },

  renderHoneyForm: function (surveyId) {
    body.removeClass("white-background");
    body.addClass("gray-background");

    $("#main-container").html(honeyFormTemplate({surveyId: surveyId, currentDate: moment().format("LL")}));

    this._focusOnPageHeader();

    this._setupRadioButtons();

    const form = $("#honey-form");
    form.on("submit", async(event) => {
      event.preventDefault();
      surveyAttributes = formatAttributes(form.serializeArray());
      surveyAttributes.honeyReportSubmittedOn = (new Date()).toLocaleDateString();
      await surveyRepository.updateRecord(surveyAttributes);

      surveyAttributes = {};

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      const syncError = await this._attemptSyncToGeoplatform(profiles, surveys);

      $("#honey-form-template").hide();
      this.renderReportsView(surveys, syncError);
    });
  },

  renderOverwinteringForm: function (surveyId) {
    body.removeClass("white-background");
    body.addClass("gray-background");

    $("#main-container").html(overwinteringFormTemplate({surveyId: surveyId, currentDate: moment().format("LL")}));

    this._focusOnPageHeader();

    this._setupRadioButtons();

    const form = $("#overwintering-form");
    form.on("submit", async(event) => {
      event.preventDefault();
      surveyAttributes = formatAttributes(form.serializeArray());
      surveyAttributes.overwinteringReportSubmittedOn = (new Date()).toLocaleDateString();
      await surveyRepository.updateRecord(surveyAttributes);

      surveyAttributes = {};

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      const syncError = await this._attemptSyncToGeoplatform(profiles, surveys);

      $("#overwintering-form-template").hide();
      this.renderReportsView(surveys, syncError);
    });
  },

  // "private" methods

  _setupDatabase: async function () {
    db = new DB(window.sqlitePlugin);
    db.initialize();
    await this._setupRepositories(db);
  },

  _setupRepositories: async function (db) {
    profileRepository = new ProfileRepository(db);
    surveyRepository = new SurveyRepository(db);
    await profileRepository.createTable();
    await surveyRepository.createTable();
  },

  _profileExists: async function () {
    const profiles = await profileRepository.findAll();
    return profiles.length > 0;
  },

  _syncToGeoPlatform: async function (profile, survey) {
    $("<div id='loading-spinner' role='alert'>" +
      "<p>Please wait while your data is being&nbsp;synced</p>" +
      `<div>${LOADING_IMAGE_SRC}</div>` +
      "</div>").appendTo($("#main-container"));

    const geolocation = {spatialReference: {wkid: 4326}};
    await this._getGeolocation(geolocation);

    const formatter = new AttributesFormatter(profile, survey, geolocation);
    const geoPlatform = new GeoPlatformGateway(formatter.execute());
    const surveyId = await geoPlatform.syncSurvey();
    if (survey["mite_count_photo_uri"] !== null || survey["follow_up_mite_count_photo_uri"] !== null) {
      let fileUri = survey["follow_up_mite_count_photo_uri"] || survey["mite_count_photo_uri"];
      const photo = await fileService.getBlob(fileUri);
      await geoPlatform.syncPhoto(photo, surveyId);
    }
  },

  _setupPagination: function () {
    $("#survey-section-1 .section-indicator").children().eq(0).css("background-color", "rgba(255,255,255,1.0)");

    $(".previous-section-button").on("click", (event) => {
      event.preventDefault();

      const pageNumber = parseInt($(event.target).data("next-page"), 10);
      $(`#survey-section-${pageNumber + 1}`).hide();
      $(`#survey-section-${pageNumber}`).show();
      $(`#survey-section-${pageNumber} .section-indicator`).children().eq(pageNumber - 1)
        .css("background-color", "rgba(255,255,255,1.0)");

      this._focusOnPageHeader();
    });

    $(".next-section-button").on("click", (event) => {
      event.preventDefault();

      const pageNumber = parseInt($(event.target).data("next-page"), 10);
      $(`#survey-section-${pageNumber - 1}`).hide();
      $(`#survey-section-${pageNumber}`).show();
      $(`#survey-section-${pageNumber} .section-indicator`).children().eq(pageNumber - 1)
        .css("background-color", "rgba(255,255,255,1.0)");

      this._focusOnPageHeader();
    });
  },

  _setupRadioButtons: function () {
    $("input[type=radio]").on("change", (event) => {
      const label = $(`label[for=${event.target.id}]`);
      const siblingLabels = label.siblings("label");
      const checked = event.target.checked;
      siblingLabels.attr("aria-checked", !checked);
      label.attr("aria-checked", checked);
      label.siblings("label:first-of-type").css("border-right", 0);
    });
  },

  _setupAddMitesPhotoButton: function () {
    $(".add-photo").on("click", async(event) => {
      event.preventDefault();
      photoButtonKey = $(event.currentTarget).data("key-name");
      const imageUri = await cameraService.getImageUri();
      const copiedFileUri = await this._copyImageToDataDirectory(imageUri, photoButtonKey);
      $("#mites-photo-preview").attr('src', copiedFileUri).show();
    });
  },

  _copyImageToDataDirectory: async function (imageUri, key) {
    const fileEntry = await fileService.getFile(imageUri);
    const copiedFileUri = await fileService.copyFile(fileEntry, cordova.file.dataDirectory);
    miteCountPhotoUri = {};
    miteCountPhotoUri[key] = copiedFileUri;
    return copiedFileUri;
  },

  _setupNumberOfMitesCalculator: function () {
    $("#number-of-mites").on("keyup", (event) => {
      const numberOfMitesTotal = parseFloat(event.target.value, 10);
      const numberOfMitesPer100 = Math.round((numberOfMitesTotal / 3.0) * 100.0) / 100.0;
      if (isNaN(numberOfMitesPer100)) {
        $("#mites-per-bees-calc").text("");
        $("#mites-per-bees-calc").hide();
      } else {
        $("#mites-per-bees-calc").text(`${numberOfMitesPer100} mites per 100 bees`);
        $("#mites-per-bees-calc").show();
      }
    });
  },

  _focusOnPageHeader: function (headerTag = "h2") {
    document.location.href = "#top";
    const header = $(`${headerTag}:visible`).first();
    header.focus();
    header.css({
      'outline-style': 'none',
      'box-shadow': 'none',
      'border-color': 'transparent'
    });
  },

  _getGeolocation: function (geolocation) {
    const defer = Q.defer();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        geolocation.x = position.coords.longitude;
        geolocation.y = position.coords.latitude;
        defer.resolve();
      },
      defer.reject
    );
    return defer.promise;
  },

  _attemptSyncToGeoplatform: async function(profiles, surveys) {
    let syncError = false;
    try {
      await this._syncToGeoPlatform(_.last(profiles), _.last(surveys));
    } catch (error) {
      syncError = true;
    }
    return syncError;
  }

};

app.initialize();
