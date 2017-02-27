# HiveScience
The HiveScience mobile App is designed for citizen scientist beekeepers to collect and share data related to the health of their honey bee colonies.  Using this App, beekeepers can easily enter hive health and Varroa mite monitoring data on-site and in real-time.  These data will help us better understand factors affecting the health of honey bees and their ability to survive the winter.  For more info, check out https://www.epa.gov/pollinator-protection/hivescience

## Install
- install `cordova 6+`
- install `npm`
- install cordova platforms and plugins with `cordova prepare`
- `npm install`
- `node setup_android.js`

## Build
`npm run build`

## Clean
`npm run clean`

## Test
`npm run test`

## Deploy to local simulator or device
- `npm run android`
- `npm run ios`

## Notes
- On android, cordova may not copy over the icons and splash images into the platforms directory. Run `node setup_android.js` to copy `res/android` into `platforms/android/res/mipmap-*` and `platforms/android/res/drawable-*` after cordova platform installation.
