import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import { formatAttributes } from "./helpers"

let db;
let profileFormTemplate;
let  profileViewTemplate;

var app = {
  initialize: function () {
    profileFormTemplate = Handlebars.compile($('#profile-form-template').html());
    profileViewTemplate = Handlebars.compile($('#profile-view-template').html());
    console.log('in app init');
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function () {
    console.log('on device ready');
    db = new DB(window.sqlitePlugin);
    db.initialize();
    db.createTables();

    this.renderProfileForm();
  },

  renderProfileForm: () => {
    $('body').html(profileFormTemplate());
    const form = $('#profile-form');
    form.on('submit', (event) => {
      event.preventDefault();
      const profileAttributes = formatAttributes(form.serializeArray());
      db.createProfile(profileAttributes);
      $("#profile-form-template").hide();
      $('body').html(profileViewTemplate(profileAttributes));
    });
  }
};

app.initialize();