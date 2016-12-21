import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes} from "./helpers"

let db;
let profileFormTemplate;
let profileViewTemplate;

var app = {
  initialize: function() {
    profileFormTemplate = Handlebars.compile($("#profile-form-template").html());
    profileViewTemplate = Handlebars.compile($("#profile-view-template").html());
    document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function() {
    this.setupDatabase();
    this.renderProfileForm();
  },

  renderProfileForm: function() {
    $("#main-container").html(profileFormTemplate());

    $(".profile-form-next-button").on("click", (event) => {
      const pageNumber = parseInt($(event.target).data("next-page"), 10);
      $(`#profile-form-page-${pageNumber - 1}`).hide();
      $(`#profile-form-page-${pageNumber}`).show();
    });

    const form = $("#profile-form");
    form.on("submit", (event) => {
      event.preventDefault();
      const profileAttributes = formatAttributes(form.serializeArray());
      db.createProfile(profileAttributes);
      $("#profile-form-template").hide();
      $("#main-container").html(profileViewTemplate(profileAttributes));
    });
  },

  // "private" methods

  setupDatabase: function() {
    db = new DB(window.sqlitePlugin);
    db.initialize();
    db.createTables();
  }
};

app.initialize();