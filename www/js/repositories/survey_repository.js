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
      ["diseases", "TEXT"],
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