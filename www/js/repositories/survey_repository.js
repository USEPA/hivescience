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
      ["queen_right", "VARCHAR(1)"],
      ["queen_drone_laying", "VARCHAR(1)"],
      ["wax_moths", "VARCHAR(1)"],
      ["deformed_wings", "VARCHAR(1)"],
      ["black_shiny_bees", "VARCHAR(1)"],
      ["american_foul_brood", "VARCHAR(1)"],
      ["european_foul_brood", "VARCHAR(1)"],
      ["chalk_brood", "VARCHAR(1)"],
      ["abnormal_cappings", "VARCHAR(1)"],
      ["dried_remains", "VARCHAR(1)"],
      ["number_of_mites", "INTEGER"],
      ["honey_supers_on", "VARCHAR(1)"],
      ["honey_supers_removed", "VARCHAR(1)"],
      ["feeding_supplementary_sugar", "VARCHAR(1)"],
      ["honey_from_sealed_cells", "VARCHAR(1)"],
      ["honey_from_brood", "VARCHAR(1)"],
      ["split_or_combine", "VARCHAR(1)"],
      ["sample_tube_code", "INTEGER"]
    ];
  }
}