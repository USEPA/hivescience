import ghost from "ghostjs"
import expect from "expect.js"
let Foo = require("../../js/foo");

describe("Foo", () => {
  it("has a name of 'bar'", () => {
    let foo = new Foo();
    expect(foo.name).to.equal("bar");
  })
});
