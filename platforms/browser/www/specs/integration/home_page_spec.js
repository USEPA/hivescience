import ghost from 'ghostjs'
import expect from 'expect.js'

describe('Home page', () => {
  it('loads when the device is ready', async () => {
    expect(1).to.be.ok();
    await ghost.open('http://localhost:3000');
    let pageTitle = await ghost.pageTitle();
    expect(pageTitle).to.equal('Hello World');

    let body = await ghost.findElement('body');
    expect(await body.isVisible()).to.be.ok();
  })
});
