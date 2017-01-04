import _ from "underscore";
import $ from "jquery";
import Handlebars from "handlebars";
import DB from "./db";
import {formatAttributes} from "./helpers"
import ProfileRepository from "./repositories/profile_repository"
import SurveyRepository from "./repositories/survey_repository"
import GeoPlatformGateway from "./geo_platform/geo_platform_gateway"
import AttributesFormatter from "./geo_platform/attributes_formatter"

require("babel-core/register");
require("babel-polyfill");

let db;
let profileFormTemplate;
let surveyFormTemplate;
let dataViewTemplate;
let profileAttributes;
let surveyAttributes;
let profileRepository;
let surveyRepository;

let app = {
    initialize: function () {
        profileFormTemplate = Handlebars.compile($("#profile-form-template").html());
        surveyFormTemplate = Handlebars.compile($("#survey-form-template").html());
        dataViewTemplate = Handlebars.compile($("#data-view-template").html());
        document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function () {
        this._setupDatabase();
        this.renderProfileForm();
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

        this._setupOption("#other-race-of-bees", "#input-race");
        this._setupOption("#other-monitor-method", "#input-method");
        this._setupOption("#other-treatment-method", "#input-treatment");

        this._setupRadioButtonsAria();

        const form = $("#profile-form");
        form.on("submit", (event) => {
            event.preventDefault();
            profileAttributes = formatAttributes(form.serializeArray());
            profileRepository.createRecord(profileAttributes);
            $("#profile-form-template").hide();
            this.renderSurveyForm();
        });
    },

    renderSurveyForm: function () {
        $("#main-container").html(surveyFormTemplate());

        this._setupOption("#other-disease", "#input-disease");

        this._setupRadioButtonsAria();

        const form = $("#survey-form");
        form.on("submit", (event) => {
            event.preventDefault();
            surveyAttributes = formatAttributes(form.serializeArray());
            surveyRepository.createRecord(surveyAttributes);
            $("#survey-form-template").hide();
            this.renderDataView();
        });
    },

    renderDataView: async function () {
        const profiles = await profileRepository.findAll();
        const surveys = await surveyRepository.findAll();
        profileAttributes['profileRow'] = _.last(profiles);
        surveyAttributes['surveyRow'] = _.last(surveys);
        this.syncToGeoPlatform(_.last(profiles), _.last(surveys));
        const allAttributes = _.extend({}, profileAttributes, surveyAttributes);
        $("#main-container").html(dataViewTemplate(allAttributes));
    },

    // "private" methods

    _setupDatabase: function () {
        db = new DB(window.sqlitePlugin);
        db.initialize();
        this._setupRepositories(db);
    },

    _setupRepositories: function (db) {
        profileRepository = new ProfileRepository(db);
        surveyRepository = new SurveyRepository(db);
        profileRepository.createTable();
        surveyRepository.createTable();
    },

    syncToGeoPlatform(profile, survey) {
        const formatter = new AttributesFormatter(profile, survey);
        const geoPlatform = new GeoPlatformGateway(formatter.execute());
        geoPlatform.sync();
    },

    _setupOption: function (parentId, childId) {
        $(parentId).on("click", () => {
            if ($(parentId).is(":checked")) {
                $(childId).show();
            } else {
                $(`${childId} > input`).val("");
                $(childId).hide();
            }
        });
    },

    _setupRadioButtonsAria: function () {
        $("input[type=radio]").on("change", (event) => {
            const label = $(`label[for=${event.target.id}]`);
            const siblingLabels = label.siblings("label");
            const checked = event.target.checked;
            siblingLabels.attr("aria-checked", !checked);
            label.attr("aria-checked", checked);
        });
    }
};

app.initialize();