import AbstractRepository from "./abstract_repository"

export default class ProfileRepository extends AbstractRepository {
  constructor(db) {
    super(db);
  }

  tableName() {
    return "profiles";
  }

  initialColumns() {
    return [
      // Note the specific ordering, this is critical for the sql
      // queries to work.
      ["email", "VARCHAR(100)"],
      ["zip_code", "VARCHAR(20)"],
      ["race_of_bees", "TEXT"],
      ["full_name", "TEXT"]
    ];
  };

  migratedColumns() {
    return [];
  };
}