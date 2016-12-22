import ghost from "ghostjs"
import expect from "expect.js"

describe("Home page", () => {
  beforeEach(async () => {
    await ghost.open("http://localhost:8000");
  });

  it("loads when the device is ready", async () => {
    let pageTitle = await ghost.pageTitle();
    expect(pageTitle).to.equal("Hello World");

    let body = await ghost.findElement("body");
    expect(await body.isVisible()).to.be.ok();
  });

  it("can navigate to the second profile page and then back to the first", async () => {
    let firstProfileHeading = await ghost.findElement("#profile-form-page-1 h1");
    expect(await firstProfileHeading.html()).to.equal("Tell us about yourself");

    const nextButton = await ghost.findElement("#profile-form-page-1 button.profile-form-next-button");
    nextButton.click();

    let element = await ghost.findElement("#profile-form-page-1");
    expect((await element.getAttribute("style")).display).to.equal('none');

    const secondProfileHeading = await ghost.findElement("#profile-form-page-2 h1");
    expect(await secondProfileHeading.html()).to.equal("Tell us about your bees");

    const backButton = await ghost.findElement("#profile-form-page-2 button.profile-form-back-button");
    backButton.click();

    element = await ghost.findElement("#profile-form-page-1");
    expect((await element.getAttribute("style")).display).not.to.equal('none');

    element = await ghost.findElement("#profile-form-page-2");
    expect((await element.getAttribute("style")).display).to.equal('none');
  });

  it("can navigate to the third profile page and then back to the second", async () => {
    let nextButton = await ghost.findElement("#profile-form-page-1 button.profile-form-next-button");
    nextButton.click();

    let secondProfileHeading = await ghost.findElement("#profile-form-page-2 h1");
    expect(await secondProfileHeading.html()).to.equal("Tell us about your bees");

    nextButton = await ghost.findElement("#profile-form-page-2 button.profile-form-next-button");
    nextButton.click();

    let element = await ghost.findElement("#profile-form-page-2");
    expect((await element.getAttribute("style")).display).to.equal('none');

    const thirdProfileHeading = await ghost.findElement("#profile-form-page-3 h1");
    expect(await thirdProfileHeading.html()).to.equal("Colony Health");

    const backButton = await ghost.findElement("#profile-form-page-3 button.profile-form-back-button");
    backButton.click();

    element = await ghost.findElement("#profile-form-page-2");
    expect((await element.getAttribute("style")).display).not.to.equal('none');

    element = await ghost.findElement("#profile-form-page-3");
    expect((await element.getAttribute("style")).display).to.equal('none');
  });
});
