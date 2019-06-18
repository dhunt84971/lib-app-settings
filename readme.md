# lib-app-settings.js

## Description
This is a simple application settings file handler allowing json settings to be read and written to a file individually or all at once.  Asynchronous functions that deal directly with the file all use either a callback function or return a Promise.  Synchronous functions that deal with the in memory settings return the results directly.

## Installation
Install the package using the usual commands:
```
npm install --save lib-app-settings
```

## Example Usage
Example uses can be found in example-usages.js.

```
const libAppSettings = require("lib-app-settings");

var _appSettings = new libAppSettings(".settings");
var _initSettings = {"lib-app-settings" : "1.0.0"};
var _settings = {};

async function init(){
// To load the entire settings file into an object use loadSettingsFromFile.
    // This is an asynchronous function and will require the use of a callback or the handling of a Promise.
    console.log("Example of call using await and a promise.");
    console.log("await _appSettings.loadSettingsFromFile(); - ");
    await _appSettings.loadSettingsFromFile()
    .then((resolve)=>{
        console.log("got here");
        if (resolve){
            _settings = resolve;
        }})
    .catch((err)=>{
        // Assume any error means the settings file does not exist and create it.
        _settings = _initSettings;
        _appSettings.setSettingsInMemory(_settings);
        _appSettings.saveSettingsToFile();
    });
    console.log(_settings);

    _settings = {};
    console.log("Example of call using a callback.");
    console.log("_appSettings.loadSettingsFromFile((settings) =>{}); - ");
    _appSettings.loadSettingsFromFile((err, settings) => {
        if (!err){
            _settings = settings;
        }
        console.log(_settings);
    });

    // getSettingFromFile and getSettingFromMemory examples.
    console.log("getSettingInMemory('thisSetting', 0); - ");
    console.log(_appSettings.getSettingInMemory("thisSetting", 0));

    console.log("getSettingInFile('thisSetting', 0); - ");
    console.log(await _appSettings.getSettingInFile("thisSetting", 0));

    // If a setting is undefined in libAppSettings the specified default value is returned but not saved to the settings.
    console.log("getSettingInMemory('thisSettingUndefined', 0); - ");
    console.log(_appSettings.getSettingInMemory("thisSettingUndefined", 0));
    
    console.log("getSettingInFile('thisSettingUndefined', 'default'); - ");
    console.log(await _appSettings.getSettingInFile("thisSettingUndefined", "default"));

    // setSettingInFile and setSettingInMemory examples.
    console.log("setSettingInMemory('thisSettingDefined', 12); - ");
    _appSettings.setSettingInMemory("thisSettingDefined", 12);
    console.log(_appSettings.getSettingInMemory("thisSettingDefined"));
    try {
        console.log(await _appSettings.getSettingInFile("thisSettingDefined"));  // Raises error - not defined.
    } catch(err) {
        console.log(err);
    }

    console.log("setSettingInFile('thisSettingDefined', 14); - ");
    await _appSettings.setSettingInFile("thisSettingDefined", 14);
    console.log(_appSettings.getSettingInMemory("thisSettingDefined"));
    console.log(await _appSettings.getSettingInFile("thisSettingDefined"));

    // removeSettingInFile and removeSettingInMemory examples.
    await _appSettings.removeSettingInFile("thisSettingDefined");
    
}

init();

```