import ghost from "ghostjs"
import expect from "expect.js"

describe("Survey", () => {
    beforeEach(async() => {
        await ghost.open("http://localhost:8000");
        let element = await ghost.findElement("button.profile-form-next-button");
        element.click();
        element = await ghost.findElement("button.profile-form-next-button");
        element.click();
        element = await ghost.findElement("input[type=submit]");
        element.click();
    });

    describe("mite count calculation", () => {
        it("shows the mites per 100 bees", async() => {
            let calcDiv = await ghost.findElement("#mites-per-bees-calc");
            expect(((await calcDiv.isVisible()))).to.be(false);

            let numberOfMitesInput = await ghost.findElement("#number-of-mites");
            await numberOfMitesInput.fill(12345);
            await numberOfMitesInput.script((element) => {
                let event = document.createEvent('Event');
                event.initEvent('keyup', true, true);
                element.dispatchEvent(event);
            });

            expect(((await calcDiv.isVisible()))).to.be(true);
            expect(await calcDiv.text()).to.equal("42 mites per 100 bees");

            await numberOfMitesInput.fill("");
            await numberOfMitesInput.script((element) => {
                let event = document.createEvent('Event');
                event.initEvent('keyup', true, true);
                element.dispatchEvent(event);
            });
            expect(((await calcDiv.isVisible()))).to.be(false);
        });
    });
});
