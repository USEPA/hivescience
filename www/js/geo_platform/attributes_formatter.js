import _ from "underscore";

export default class AttributesFormatter {
  constructor(profile, survey) {
    this.attributes = _.assign(profile, survey)
  }

  get baseAttributes() {
    return {
      // ,
      // "geometry": {
      //   "x": -102.4124797899999,
      //   "y": 57.77063009800008
      // }
    };
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

  execute(profile, survey) {
    let finalAttributes = _.assign({}, this.baseAttributes, this.transformAttributes());
    let sortedAttributes = this.sortKeys(finalAttributes);
    return JSON.stringify([{"attributes": sortedAttributes}]);
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
    for(key in keys) {
      sortedAttributes[keys[key]] = attributes[keys[key]];
    }
    return sortedAttributes;
  }
}