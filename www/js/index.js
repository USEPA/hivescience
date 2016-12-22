import _ from "underscore";
import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes} from "./helpers"

let db;
let profileFormTemplate;
let surveyFormTemplate;
let dataViewTemplate;
let profileAttributes;
let surveyAttributes;

var app = {
  initialize: function() {
    profileFormTemplate = Handlebars.compile($("#profile-form-template").html());
    surveyFormTemplate = Handlebars.compile($("#survey-form-template").html());
    dataViewTemplate = Handlebars.compile($("#data-view-template").html());
    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function() {
    this.setupDatabase();
    this.renderProfileForm();
  },

  renderProfileForm: function() {
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
    });
  },

  renderSurveyForm: function() {
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

  renderDataView: function() {
    const allAttributes = _.extend({}, profileAttributes, surveyAttributes);
    $("#main-container").html(dataViewTemplate(allAttributes));
  },

  // "private" methods

  setupDatabase: function() {
    db = new DB(window.sqlitePlugin);
    db.initialize();
    db.createTables();
  }
};

app.initialize();