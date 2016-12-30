import _ from "underscore"
import {toCamelCase} from "../helpers"
import Q from "Q"

export class AbstractRepository {
  constructor(db) {
    this.db = db;
  }

  createTable() {
    const sqlStatement = `
      CREATE TABLE IF NOT EXISTS ${this.tableName()} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${this.columnsForInsert()}
      );`;
    this.db.executeSql(sqlStatement.replace(/\s+/g, " "));
  }

  createRecord(attributes) {
    const sqlStatement = `
      INSERT INTO ${this.tableName()} ( ${this.columnNames()} )
      VALUES (${this.updatePreparedStatement()});`;
    const values = this.extractValuesFromAttributes(attributes);
    this.db.executeSql(sqlStatement.replace(/\s+/g, " "), values);
  }

  findAll() {
    let rows = [];
    let defer = Q.defer();
    this.db.connection.executeSql(`SELECT * FROM ${this.tableName()};`, [],
      (result) => {
        for(let i = 0; i < result.rows.length; i++) {
          rows[i] = result.rows.item(i);
        }
        defer.resolve(rows);
      }, defer.reject);
    return defer.promise;
  }

  // "Private" methods

  columnNames() {
    return this.columns()
      .map((column_pair) => column_pair[0]).join(", ");
  }

  updatePreparedStatement() {
    let statement = "";
    _.times(this.columns().length, () => statement += "?, ");
    return statement.slice(0, -2);
  }

  columnsForInsert() {
    let joinedColumns = this.columns().reduce(
      (memo, elem) => memo.concat(elem.join(" ") + ", "),
      "");
    return joinedColumns.slice(0, -2);
  }

  columnsForInsert() {
    let joinedColumns = this.columns().reduce(
      (memo, elem) => memo.concat(elem.join(" ") + ", "),
      "");
    return joinedColumns.slice(0, -2);
  }

  extractValuesFromAttributes(attributes) {
    const columnNames = this.columns()
      .map((column_pair) => toCamelCase(column_pair[0]));
    return columnNames.map((column_name) => attributes[column_name]);
  }
}

export class SurveyRepository extends AbstractRepository {
  tableName() {
    return "surveys";
  }

  columns() {
    return [
      ["queen_right", "VARCHAR(1)"],
      ["queen_drone_laying", "VARCHAR(1)"],
      ["diseases", "TEXT"],
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

export class ProfileRepository extends AbstractRepository {
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