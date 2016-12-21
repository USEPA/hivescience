import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes} from "./helpers"

let db;
let profileFormTemplate;
let profileViewTemplate;

var app = {
  initialize: () => {
    profileFormTemplate = Handlebars.compile($('#profile-form-template').html());
    profileViewTemplate = Handlebars.compile($('#profile-view-template').html());
    console.log('in app init');
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: () => {
    console.log('on device ready');
    this.setupDatabase();
    this.renderProfileForm();
  },

  renderProfileForm: () => {
    $('#main-container').html(profileFormTemplate());
    const form = $('#profile-form');
    form.on('submit', (event) => {
      event.preventDefault();
      const profileAttributes = formatAttributes(form.serializeArray());
      db.createProfile(profileAttributes);
      $("#profile-form-template").hide();
      $('#main-container').html(profileViewTemplate(profileAttributes));
    });
  },

  // "private" methods

  setupDatabase: () => {
    db = new DB(window.sqlitePlugin);
    db.initialize();
    db.createTables();
  }
};

app.initialize();