import AbstractRepository from "./abstract_repository"

export default class ProfileRepository extends AbstractRepository {
  constructor(db) {
    super(db);
  }

  tableName() {
    return "profiles";
  }

  columns() {
    return [
      // Note the specific ordering, this is critical for the sql
      // queries to work.
      ["email", "VARCHAR(100)"],
      ["full_name", "VARCHAR(100)"],
      ["zip_code", "VARCHAR(20)"],
      ["number_of_colonies", "INTEGER"],
      ["race_of_bees", "TEXT"],
      ["monitor_varroa_mites", "VARCHAR(1)"],
      ["monitor_varroa_mites_count", "INTEGER"],
      ["monitor_methods", "VARCHAR(255)"],
      ["treatment_methods", "VARCHAR(255)"],
      ["last_treatment_date", "TEXT"],
      ["lost_colonies_over_winter", "VARCHAR(1)"]
    ];
  };
}