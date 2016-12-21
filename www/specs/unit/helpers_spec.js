import { formatAttributes } from "../../js/helpers"
import expect from "expect.js"

describe("Helpers", () => {
  describe("formatAttributes", () => {
    it("returns a json object of the form {name: value}", () => {
      const attributes = [
        {name: "email", value: "test@foo.bar"},
        {name: "firstName", value: "Belinda"},
        {name: "zipCode", value: "12345"}
      ];

      expect(formatAttributes(attributes)).to.eql({
        email: "test@foo.bar",
        firstName: "Belinda",
        zipCode: "12345"
      });
    });

    it("concatenates the values for pairs that have the same key", () => {
      const attributes = [
        {name: "monitorMethods", value: "Powdered sugar roll"},
        {name: "monitorMethods", value: "Alcohol wash"}
      ];

      expect(formatAttributes(attributes)).to.eql({
        monitorMethods: "Powdered sugar roll, Alcohol wash",
      });
    });
  });
});