import _ from "underscore";

export default class AttributesFormatter {
  constructor(profile, survey) {
    this.attributes = _.assign(profile, survey)
  }

  get baseAttributes() {
    return {
      // Wait until we implement "Type of Treatment Applied"
      "Treatment_Type": "",

      // TODO check if the current endpoint requires this. It has been since removed.
      "Treatment_Required": "",

      // Will implement soon
      "Image_Upload_1": "",
      "Mites_per_100_Bees": "",
      // Questions that have been removed but Geoplatform (at least this
      // current iteration) requires it/them
      "Bee_Kill": "",
      "Image_Upload_2": "",
      "Total_Number_of_Bees": ""
      // ,
      // "geometry": {
      //   "x": -102.4124797899999,
      //   "y": 57.77063009800008
      // }
    };
  }

  get keyTranslation() {
    return {
      number_of_colonies: "Colonies_in_Apiary",
      race_of_bees: "Race",
      monitor_varroa_mites: "Active_Monitoring",
      monitor_varroa_mites_count: "Times_Year_Monitor",
      treatment_methods: "Management_Strategy",
      queen_right: "Queen_Right",
      honey_supers_removed: "Honey_Supers",
      honey_from_sealed_cells: "Sealed_Honey_Cells",
      honey_from_brood: "Brood_Nest",
      split_or_combine: "Split_Combine_Colony",
      lost_colonies_over_winter: "Overwintering",
      last_treatment_date: "Last_Treatment",
      small_hive_beetles: "Small_Hive_Beetle",
      age_of_queen: "Age_of_Queen",
      wax_moths: "Wax_Moth",
      deformed_wings: "Deformed_Wings",
      black_shiny_bees: "Black_Shiny_Bees",
      american_foulbrood: "American_Foul_Brood",
      european_foulbrood: "European_Foul_Brood",
      chalkbrood: "Chalkbrood",
      parasitic_mite_syndrome: "Parasitic_Mite_Syndrome",
      dysentery: "Dysentery",
      abnormal_cappings: "Abnormal_Cappings",
      dried_remains: "Dried_Remains",
      number_of_mites: "Mite_Count_1",
      will_perform_treatment: "Treatment_Required",
      follow_up_number_of_mites: "Mite_Count_2",
      sample_tube_code: "Filled_Tube"
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