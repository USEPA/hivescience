import _ from "underscore"
import {toCamelCase} from "../helpers"
import Q from "Q"

export default class AbstractRepository {
  constructor(db) {
    this.db = db;
  }

  createTable() {
    const sqlStatement = `
      CREATE TABLE IF NOT EXISTS ${this.tableName()} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${this.columnsForInsert()}
      );`;
    let defer = Q.defer();
    this.db.executeSql(sqlStatement.replace(/\s+/g, " "), [],
      defer.resolve, defer.reject);
    return defer.promise;
  }

  createRecord(attributes) {
    const sqlStatement = `
      INSERT INTO ${this.tableName()} ( ${this.columnNames().join(", ")} )
      VALUES (${this.updatePreparedStatement()});`;
    let defer = Q.defer();
    const values = this.extractValuesFromAttributes(attributes);
    this.db.executeSql(sqlStatement.replace(/\s+/g, " "), values,
      defer.resolve, defer.reject);
    return defer.promise;
  }

  findAll() {
    let rows = [];
    let defer = Q.defer();
    this.db.connection.executeSql(`SELECT * FROM ${this.tableName()};`, [],
      (result) => {
        for (let i = 0; i < result.rows.length; i++) {
          rows[i] = result.rows.item(i);
        }
        defer.resolve(rows);
      }, defer.reject);
    return defer.promise;
  }

  updateRecord(attributes) {
    let [id, columnsStatement, values] = this.
      extractUpdatePropertiesFromAttributes(attributes);

    const sqlStatement = `
      UPDATE ${this.tableName()}
      SET ${columnsStatement}
      WHERE id = ${id};`;

    let defer = Q.defer();
    this.db.executeSql(sqlStatement.replace(/\s+/g, " "), values,
      defer.resolve, defer.reject);
    return defer.promise;
  }

  // =================
  // "Private" methods
  // =================

  // Can this be an array instead of a string
  columnNames() {
    return this.columns().map((column_pair) => column_pair[0]);
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

  extractValuesFromAttributes(attributes) {
    const columnNames = this.columns()
      .map((column_pair) => toCamelCase(column_pair[0]));
    return columnNames.map((column_name) => attributes[column_name]);
  }

  extractUpdatePropertiesFromAttributes(attributes) {
    const keys = Object.keys(attributes);
    const columnsToUpdate = this.columnNames().filter(
      (columnName) => {
        let name = toCamelCase(columnName);
        return _.contains(keys, name) && attributes[name] !== "";
      });
    const columnsStatement = columnsToUpdate.map((column) => `${column} = ?`).join(",\n");
    const id = Number(attributes.id);
    delete attributes.id;
    const values = columnsToUpdate.map((columnName) => {
      return attributes[toCamelCase(columnName)];
    });
    return [id, columnsStatement, values];
  }
}