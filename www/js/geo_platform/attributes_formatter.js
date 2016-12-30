import _ from "underscore"

export default class AttributesFormatter {
  constructor(profile, survey) {
    this.attributes = _.assign(profile, survey)
  }

  get baseAttributes() {
    return {
      // We are going to change the diseases question to be several different questions.
      "Small_Hive_Beetle": "", // omit for now
      "Age_of_Queen": "", // omit for now
      "Wax_Moth": "", // omit for now
      "Deformed_Wings": "", // omit for now
      "Black_Shiny_Bees": "", // omit for now
      "American_Foul_Brood": "", // omit for now
      "European_Foul_Brood": "", // omit for now
      "Chalkbrood": "", // omit for now
      "Parasitic_Mite_Syndrome": "", // omit for now
      "Dysentery": "", // omit for now
      "Spotty_Brood_Pattern": "", // omit for now
      "Abnormal_Cappings": "", // omit for now
      "Dried_Remains": "", // omit for now

      // Wait until we implement "Type of Treatment Applied"
      "Treatment_Type": "",

      // TODO check if the current endpoint requires this. It has been since removed.
      "Filled_Tube": "",
      "Treatment_Required": "",

      // Will implement soon
      "Mite_Count_1": "10",
      "Image_Upload_1": "",
      "Mites_per_100_Bees": "",
      // Questions that have been removed but Geoplatform (at least this
      // current iteration) requires it/them
      "Bee_Kill": "",
      "Mite_Count_2": "",
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
      // Verify that this is correct, or fixed in the final version
      treatment_methods: "Management_Strategy",
      queen_right: "Queen_Right",
      queen_drone_laying: "Drone_Laying_Queen",
      honey_supers_on: "Honey_Supers",
      honey_from_sealed_cells: "Sealed_Honey_Cells",
      honey_from_brood: "Brood_Nest",
      split_or_combine: "Split_Combine_Colony",
      lost_colonies_over_winter: "Overwintering",
      last_treatment_date: "Last_Treatment"
    };
  }

  get translatableKeys() {
    return Object.keys(this.keyTranslation);
  }

  execute(profile, survey) {
    let finalAttributes = _.assign(this.transformAttributes(), this.baseAttributes);
    return JSON.stringify([{"attributes": finalAttributes}]);
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
      return _.contains(this.translatableKeys, key);
    });
  }
}