import AbstractRepository from "./abstract_repository"

export default class SurveyRepository extends AbstractRepository {
  constructor(db) {
    super(db);
  }

  tableName() {
    return "surveys";
  }

  initialColumns() {
    return [
      // Initial survey
      ["queen_right", "VARCHAR(1)"],
      ["queen_poor_performance", "VARCHAR(1)"],
      //["age_of_queen", "INTEGER"],
      ["abnormal_brood_pattern", "VARCHAR(1)"],
      ["abnormal_cappings", "VARCHAR(1)"],
      ["abnormal_odor", "VARCHAR(1)"],
      ["small_hive_beetles", "VARCHAR(1)"],
      ["wax_moths", "VARCHAR(1)"],
      ["deformed_wings", "VARCHAR(1)"],
      ["black_shiny_bees", "VARCHAR(1)"],
      ["american_foulbrood", "VARCHAR(1)"],
      ["european_foulbrood", "VARCHAR(1)"],
      ["chalkbrood", "VARCHAR(1)"],
      ["snotty_brood", "VARCHAR(1)"],
      ["parasitic_mite_syndrome", "VARCHAR(1)"],
      ["dried_remains", "VARCHAR(1)"],
      ["dysentery", "VARCHAR(1)"],
      ["number_of_mites", "INTEGER"],
      ["honey_supers_removed", "VARCHAR(1)"],
      ["feeding_supplementary_sugar", "VARCHAR(1)"],
      ["honey_from_sealed_cells", "VARCHAR(1)"],
      ["honey_from_brood", "VARCHAR(1)"],
      ["split_or_combine", "VARCHAR(1)"],
      ["sample_tube_code", "INTEGER"],
      ["hive_healthy", "VARCHAR(1)"],
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
      ["follow_up_number_of_mites", "INTEGER"],
      ["follow_up_mite_count_photo_uri", "VARCHAR(255)"],
      ["follow_up_submitted_on", "TEXT"],
      ["honey_report_submitted_on", "TEXT"],

      // Overwintering survey
      ["survived_winter", "VARCHAR(1)"],
      ["winter_treatment", "VARCHAR(1)"],
      ["overwintering_report_submitted_on", "TEXT"],
      ["honey_or_pollen", "VARCHAR(1)"],
      ["why_hive_failed", "TEXT"]
    ];
  }

  migratedColumns() {
    return [
      ["sync_failed", "INTEGER"]
    ];
  }
}
