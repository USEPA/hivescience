const fs = require('fs');
const fsx = require('fs-extra');

const icons = fs.readdirSync('./res/android/icons');
icons.forEach(file => {
    const source = './res/android/icons/' + file;
    const target = `./platforms/android/res/mipmap-${file.split('.')[0]}/icon.png`;
    fsx.copySync(source, target);
});

const splashes = fs.readdirSync('./res/android/splash');
splashes.forEach(file => {
    const source = './res/android/splash/' + file;
    const target = `./platforms/android/res/drawable-port-${file.split('.')[0]}/screen.png`;
    fsx.copySync(source, target);
});
