import _ from "underscore";
import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes} from "./helpers"

require("babel-core/register");
require("babel-polyfill");

let db;
let profileFormTemplate;
let surveyFormTemplate;
let dataViewTemplate;
let profileAttributes;
let surveyAttributes;

var app = {
  initialize: function () {
    profileFormTemplate = Handlebars.compile($("#profile-form-template").html());
    surveyFormTemplate = Handlebars.compile($("#survey-form-template").html());
    dataViewTemplate = Handlebars.compile($("#data-view-template").html());
    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function () {
    this.setupDatabase();
    this.renderProfileForm();
    this.showOption();
  },

  showOption: function () {
    $("#other-race-of-bees").on("click", () => {
      if ($("#other-race-of-bees").is(':checked')) {
        $("#input-race").show();
      }
      else {
        $("#input-race-of-bees").val("");
        $("#input-race").hide();
      }
    });

    $("#other-monitor-methods").on("click", () => {
      if ($("#other-monitor-methods").is(':checked')) {
        $("#input-method").show();
      }
      else {
        $("#input-count-method").val("");
        $("#input-method").hide();
      }
    });

    $("#other-treatment-method").on("click", () => {
      if ($("#other-treatment-method").is(':checked')) {
        $("#input-treatment").show();
      }
      else {
        $("#input-treatment-method").val("");
        $("#input-treatment").hide();
      }
    });

    $("#other-diseases").on("click", () => {
      if ($("#other-diseases").is(':checked')) {
        $("#input-disease").show();
      }
      else {
        $("#input-other-disease").val("");
        $("#input-disease").hide();
      }
    });

  },

  renderProfileForm: function () {
    $("#main-container").html(profileFormTemplate());

    $(".profile-form-back-button").on("click", (event) => {
      const pageNumber = parseInt($(event.target).data("next-page"), 10);
      $(`#profile-form-page-${pageNumber + 1}`).hide();
      $(`#profile-form-page-${pageNumber}`).show();
    });

    $(".profile-form-next-button").on("click", (event) => {
      const pageNumber = parseInt($(event.target).data("next-page"), 10);
      $(`#profile-form-page-${pageNumber - 1}`).hide();
      $(`#profile-form-page-${pageNumber}`).show();
    });

    const form = $("#profile-form");
    form.on("submit", (event) => {
      event.preventDefault();
      profileAttributes = formatAttributes(form.serializeArray());
      db.createProfile(profileAttributes);
      $("#profile-form-template").hide();
      this.renderSurveyForm();
      this.showOption();
    });
  },

  renderSurveyForm: function () {
    $("#main-container").html(surveyFormTemplate());
    const form = $("#survey-form");
    form.on("submit", (event) => {
      event.preventDefault();
      surveyAttributes = formatAttributes(form.serializeArray());
      db.createSurvey(surveyAttributes);
      $("#survey-form-template").hide();
      this.renderDataView();
    });
  },

  renderDataView: async function () {
    const profiles = await db.allProfiles();
    const surveys = await db.allSurveys();
    profileAttributes['profileRow'] = _.last(profiles);
    surveyAttributes['surveyRow'] = _.last(surveys);
    const allAttributes = _.extend({}, profileAttributes, surveyAttributes);
    $("#main-container").html(dataViewTemplate(allAttributes));
  },

  // "private" methods

  setupDatabase: function () {
    db = new DB(window.sqlitePlugin);
    db.initialize();
    db.createTables();
  }

};

app.initialize();