import _ from "underscore";
import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes} from "./helpers";
import ProfileRepository from "./repositories/profile_repository";
import SurveyRepository from "./repositories/survey_repository";
import GeoPlatformGateway from "./geo_platform/geo_platform_gateway";
import AttributesFormatter from "./geo_platform/attributes_formatter";
import CameraService from "./services/camera_service";
import FileService from "./services/file_service";
import "babel-core/register";
import "babel-polyfill";

let db;
let body;

let profileFormTemplate;
let surveyFormTemplate;
let dataViewTemplate;
let welcomeTemplate;
let reportsTemplate;
let followUpFormTemplate;
let honeyFormTemplate;

let profileAttributes = {};
let surveyAttributes = {};
let miteCountPhotoUri;

let profileRepository;
let surveyRepository;

let cameraService;
let fileService;

let app = {
  initialize: function () {
    profileFormTemplate = Handlebars.compile($("#profile-form-template").html());
    surveyFormTemplate = Handlebars.compile($("#survey-form-template").html());
    dataViewTemplate = Handlebars.compile($("#data-view-template").html());
    welcomeTemplate = Handlebars.compile($("#welcome-template").html());
    reportsTemplate = Handlebars.compile($("#reports-template").html());
    followUpFormTemplate = Handlebars.compile($("#follow-up-form-template").html());
    honeyFormTemplate = Handlebars.compile($("#honey-form-template").html());
    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: async function () {
    body = $("body");
    cameraService = new CameraService(navigator.camera);
    fileService = new FileService(window, FileReader, Blob);
    await this._setupDatabase();
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

  renderProfileForm: function () {
    $("#main-container").html(profileFormTemplate());
    document.location.href = "#top";

    this._setupRadioButtons();

    const form = $("#profile-form");
    form.on("submit", (event) => {
      event.preventDefault();
      profileAttributes = formatAttributes(form.serializeArray());
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
    $("#main-container").html(surveyFormTemplate());
    document.location.href = "#top";

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

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      this._syncToGeoPlatform(_.last(profiles), _.last(surveys));

      $("#survey-form-template").hide();
      this.renderReportsView(surveys);
    });
  },

  renderReportsView: function (surveys) {
    body.removeClass("gray-background");
    body.addClass("white-background");
    surveys = surveys.map((survey) => {
      survey.renderFollowUpButton = survey.will_perform_treatment === "Y";
      survey.followUpSubmitted = survey.follow_up_number_of_mites != null;
      survey.renderHoneyReportButton = survey.final_mite_count_of_season === "Y";
      survey.honeyReportSubmitted = survey.honey_report_submitted_on != null;
      survey.renderOverwinterReportButton = survey.honeyReportSubmitted;
      return survey;
    });
    $("#main-container").html(reportsTemplate({surveys: surveys}));

    $(".follow-up-button").on("click", (event) => {
      event.preventDefault();
      this.renderFollowUpForm($(event.currentTarget).data("survey-id"));
    });

    $(".honey-report-button").on("click", (event) => {
      event.preventDefault();
      this.renderHoneyForm($(event.currentTarget).data("survey-id"));
    });

    $(".create-report").on("click", (event) => {
      event.preventDefault();
      this.renderSurveyForm();
    });

    document.location.href = "#top";
  },

  renderFollowUpForm: function (surveyId) {
    body.removeClass("white-background");
    body.addClass("gray-background");
    $("#main-container").html(followUpFormTemplate({surveyId: surveyId}));
    document.location.href = "#top";

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

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      this._syncToGeoPlatform(_.last(profiles), _.last(surveys));

      $("#follow-up-form-template").hide();
      this.renderReportsView(surveys);
    });
  },

  renderHoneyForm: function (surveyId) {
    body.removeClass("white-background");
    body.addClass("gray-background");
    $("#main-container").html(honeyFormTemplate({surveyId: surveyId}));
    document.location.href = "#top";

    this._setupRadioButtons();

    const form = $("#honey-form");
    form.on("submit", async(event) => {
      event.preventDefault();
      surveyAttributes = formatAttributes(form.serializeArray());
      surveyAttributes.honeyReportSubmittedOn = (new Date()).toLocaleDateString();
      await surveyRepository.updateRecord(surveyAttributes);

      const surveys = await surveyRepository.findAll();
      const profiles = await profileRepository.findAll();
      this._syncToGeoPlatform(_.last(profiles), _.last(surveys));

      $("#honey-form-template").hide();
      this.renderReportsView(surveys);
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
    const formatter = new AttributesFormatter(profile, survey);
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
      document.location.href = "#top";
      $(`#survey-section-${pageNumber + 1}`).hide();
      $(`#survey-section-${pageNumber}`).show();
      $(`#survey-section-${pageNumber} .section-indicator`).children().eq(pageNumber - 1)
        .css("background-color", "rgba(255,255,255,1.0)");
    });

    $(".next-section-button").on("click", (event) => {
      event.preventDefault();
      const pageNumber = parseInt($(event.target).data("next-page"), 10);
      document.location.href = "#top";
      $(`#survey-section-${pageNumber - 1}`).hide();
      $(`#survey-section-${pageNumber}`).show();
      $(`#survey-section-${pageNumber} .section-indicator`).children().eq(pageNumber - 1)
        .css("background-color", "rgba(255,255,255,1.0)");
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
      const imageUri = await cameraService.getImageUri();
      const fileEntry = await fileService.getFile(imageUri);
      const copiedFileUri = await fileService.copyFile(fileEntry, cordova.file.dataDirectory);
      const key = $(event.currentTarget).data("key-name");
      miteCountPhotoUri = {};
      miteCountPhotoUri[key] = copiedFileUri;
      $("#mites-photo-preview").attr('src', copiedFileUri).show();
    });
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
  }
};

app.initialize();