import AbstractRepository from "./abstract_repository"

export default class SurveyRepository extends AbstractRepository {
  constructor(db) {
    super(db);
  }

  tableName() {
    return "surveys";
  }

  columns() {
    return [
      // Initial survey
      ["queen_right", "VARCHAR(1)"],
      ["queen_drone_laying", "VARCHAR(1)"],
      ["age_of_queen", "INTEGER"],
      ["hive_beetles", "VARCHAR(1)"],
      ["wax_moths", "VARCHAR(1)"],
      ["deformed_wings", "VARCHAR(1)"],
      ["black_shiny_bees", "VARCHAR(1)"],
      ["american_foul_brood", "VARCHAR(1)"],
      ["european_foul_brood", "VARCHAR(1)"],
      ["chalk_brood", "VARCHAR(1)"],
      ["parasitic_mite_syndrome", "VARCHAR(1)"],
      ["abnormal_cappings", "VARCHAR(1)"],
      ["dried_remains", "VARCHAR(1)"],
      ["dysentery", "VARCHAR(1)"],
      ["spotty_brood_pattern", "VARCHAR(1)"],
      ["number_of_mites", "INTEGER"],
      ["honey_supers_on", "VARCHAR(1)"],
      ["honey_supers_removed", "VARCHAR(1)"],
      ["feeding_supplementary_sugar", "VARCHAR(1)"],
      ["honey_from_sealed_cells", "VARCHAR(1)"],
      ["honey_from_brood", "VARCHAR(1)"],
      ["split_or_combine", "VARCHAR(1)"],
      ["sample_tube_code", "INTEGER"],
      ["will_perform_treatment", "VARCHAR(1)"],
      ["final_mite_count_of_season", "VARCHAR(1)"],
      ["mite_count_photo_uri", "VARCHAR(255)"],
      ["created_on", "TEXT"],

      // Follow-up survey
      ["did_you_perform_treatment", "VARCHAR(1)"],
      ["requeen", "VARCHAR(1)"],
      ["remove_drone_brood", "VARCHAR(1)"],
      ["brood_interruption", "VARCHAR(1)"],
      ["screen_bottom_board", "VARCHAR(1)"],
      ["soft_or_hard_treatment", "VARCHAR(1)"],
      ["kind_of_chemical", "VARCHAR(1)"],
      ["survive_treatment", "VARCHAR(1)"],
      ["survive_treatment_description", "TEXT"],
      ["follow_up_number_of_mites", "INTEGER"],
      ["follow_up_mite_count_photo_uri", "VARCHAR(255)"],
      ["follow_up_submitted_on", "TEXT"]
    ];
  }
}