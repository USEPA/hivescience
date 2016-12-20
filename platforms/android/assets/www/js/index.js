/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import $ from 'jquery';
import Handlebars from 'handlebars';
import DB from './db';

let db;
let profileFormTemplate;
let profileViewTemplate;

var app = {
  initialize: function () {
    profileFormTemplate = Handlebars.compile($('#profile-form-template').html());
    profileViewTemplate = Handlebars.compile($('#profile-view-template').html());
    console.log('in app init');
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function () {
    this.receivedEvent('deviceready');
    console.log('on device ready');
    db = new DB(window.sqlitePlugin);
    db.initialize();
    db.createTables();

    this.renderProfileForm();
  },

  receivedEvent: function (id) {
    let parentElement = document.getElementById(id);
    let listeningElement = parentElement.querySelector('.listening');
    let receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  },

  renderProfileForm: () => {
    $('body').html(profileFormTemplate());
  }
};

app.initialize();