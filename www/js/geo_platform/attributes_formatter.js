import _ from "underscore";

export default class AttributesFormatter {
  constructor(profile, survey, geolocation) {
    this.attributes = _.assign(profile, survey);
    this.geolocation = geolocation;
  }

  get keyTranslation() {
    return {
      small_hive_beetles: "hive_beetles"
    };
  }

  get keysToScrub() {
    return [
      "mite_count_photo_uri"
    ];
  }

  get translatableKeys() {
    return Object.keys(this.keyTranslation);
  }

  execute() {
    let sortedAttributes = this.sortKeys(this.transformAttributes());
    return JSON.stringify([
      {
        "geometry": this.geolocation,
        "attributes": sortedAttributes
      }
    ]);
  }

  // "Private" methods

  transformAttributes() {
    return _.assign(this.untranslatableAttributes, this.translatedAttributes);
  }

  get translatedAttributes() {
    return this.translatableKeys.reduce((acc, elem) => {
      acc[this.keyTranslation[elem]] = (this.attributes[elem] || "").toString();
      return acc;
    }, {});
  }

  get untranslatableAttributes() {
    return _.omit(this.attributes, (value, key) => {
      return _.contains(this.translatableKeys, key) || _.contains(this.keysToScrub, key);
    });
  }

  sortKeys(attributes) {
    let keys = Object.keys(attributes);
    keys.sort();
    let sortedAttributes = {};
    let key;
    for (key in keys) {
      sortedAttributes[keys[key]] = attributes[keys[key]];
    }
    return sortedAttributes;
  }
}