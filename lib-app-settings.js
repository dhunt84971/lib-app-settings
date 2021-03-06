(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.AppSettings = factory();
    }
}(this, function () {
    "use strict";
    const lockFile = require('lockfile');
    const fs = require("fs");

    //Global variables.
    var _settingsFile = "";
    var _settings = {};
    var _lockFilename = "";

    function AppSettings(settingsFile) {
        _settingsFile = settingsFile;
        _lockFilename = _settingsFile + ".lock"; 
    }

    //#region PRIVATE METHODS
    /// Save settings to the .settings file.
    function saveSettingsToFile(callback) {
        return new Promise(function (resolve, reject) {
            lockFile.lock(_lockFilename, {"wait":3000}, (er) =>{
                if (er) {
                    if (er.message.includes("EEXIST")){
                        lockFile.unlockSync(_lockFilename);
                    }
                    reject(er);
                    if (callback) {
                        callback(er);
                    }
                    return;
                }
                var json = JSON.stringify(_settings, null, 2);
                fs.writeFile(_settingsFile, json, "utf8", (err) => {
                    lockFile.unlock(_lockFilename, (er)=>{
                        if (err || er) {
                            reject(err);
                        }
                        if (callback) {
                            callback(err);
                        }
                        resolve();
                    });
                });
            });
        });
    }

    /// Load settings from the .settings file.
    function loadSettingsFromFile(callback) {
        return new Promise(function (resolve, reject) {
            lockFile.lock(_lockFilename, {"wait":3000}, (er) =>{
                if (er) {
                    console.log(er.message);
                    if (er.message.includes("EEXIST")){
                        lockFile.unlockSync(_lockFilename);
                    }
                    reject(er);
                    return;
                }
                fs.readFile(_settingsFile, "utf8", (err, data) => {
                    lockFile.unlock(_lockFilename, (er)=>{
                        if (err || er) {
                            reject(err);
                        }
                        else {
                            try {
                                _settings = JSON.parse(data); //parse into an object
                            }
                            catch (e){
                                reject(e);
                                err = e;
                            }
                            resolve(_settings);
                        }
                        if (callback) {
                            callback(err, _settings);
                        }
                    });
                });
            });
        });
    }

    //#endregion PRIVATE METHODS

    //#region PUBLIC PROTOTYPE METHODS
    AppSettings.prototype.loadSettingsFromFile = function (callback) {
        return loadSettingsFromFile(callback);
    };

    AppSettings.prototype.saveSettingsToFile = function (callback) {
        return saveSettingsToFile(callback);
    };

    AppSettings.prototype.getSettingsInFile = function (callback) {
        if (typeof callback !== "function") {
            return new Promise(function (resolve, reject) {
                loadSettingsFromFile((err, _settings) => {
                    //console.log("loaded settings first using a promise.");
                    resolve(_settings);
                });
            });

        } else {
            loadSettingsFromFile((err, _settings) => {
                //console.log("loaded settings first using a callback.");
                callback(_settings);
            });
        }
    };

    AppSettings.prototype.getSettingsInMemory = function () {
        //console.log("Used in memory settings using a promise.");
        return _settings;
    };

    // This function is asynchronous.  The setting value will be sent to the callback if specified or as the resolve of a Promise.
    AppSettings.prototype.getSettingInFile = function (name, defaultValue, callback) {
        if (typeof callback !== "function") {
            return new Promise(function (resolve, reject) {
                loadSettingsFromFile((err, _settings) => {
                    if (!err){
                        if (typeof _settings[name] !== "undefined") {
                            resolve(_settings[name]);
                        } else if (typeof defaultValue !== "undefined") {
                            resolve(defaultValue);
                        } else {
                            reject("Setting " + name + " not found!");
                        }
                    } else {
                        reject("Could not load settings file.");
                    }
                });
            });

        } else {
            loadSettingsFromFile((err, _settings) => {
                //console.log("loaded settings first using a callback.");
                if (typeof _settings[name] !== "undefined") {
                    callback(_settings[name]);
                } else if (typeof defaultValue !== "undefined") {
                    callback(defaultValue);
                } else callback(undefined);
            });

        }
    };

    // This function is synchronous.  The return value contains the value of the setting.
    AppSettings.prototype.getSettingInMemory = function (name, defaultValue) {
        if (typeof _settings[name] !== "undefined") {
            return _settings[name];
        } else if (typeof defaultValue !== "undefined") {
            return defaultValue;
        } else return undefined;
    };

    AppSettings.prototype.setSettingsInFile = function (settings, callback) {
        _settings = settings;
        if (typeof callback !== "function") {
            return new Promise(function (resolve, reject) {
                saveSettingsToFile((err) => {
                    if (err) reject();
                    else resolve();
                });
            });
        } else {
            saveSettingsToFile((err) => {
                callback(err);
            });
        }
    };

    AppSettings.prototype.setSettingsInMemory = function (settings) {
        //console.log("Update in memory settings.");
        _settings = settings;
        return;
    };

    AppSettings.prototype.setSettingInFile = function (setting, value, callback) {
        if (typeof callback !== "function") {
            return new Promise(function (resolve, reject) {
                // read the setting file first before updating/adding the passed setting.
                loadSettingsFromFile((err,settings) => {
                    if (!err){
                        _settings = settings;
                        _settings[setting] = value;
                        saveSettingsToFile((err) => {
                            if (err) reject("Could not save settings to file.");
                            else resolve();
                        });
                    } else {
                        reject("Could not load settings file.");
                    }
                    
                });
            });
        } else {
            // read the setting file first before updating/adding the passed setting.
            loadSettingsFromFile((err,settings) => {
                if (!err){
                    _settings = settings;
                    _settings[setting] = value;
                    saveSettingsToFile((err) => {
                        callback(err);
                    });
                } else {
                    callback(err);
                }
            });
        }
    };

    AppSettings.prototype.setSettingInMemory = function (setting, value) {
        _settings[setting] = value;
        return;
    };

    AppSettings.prototype.removeSettingInFile = function (setting, callback) {
        if (typeof callback !== "function") {
            return new Promise(function (resolve, reject) {
                // read the setting file first before updating/adding the passed setting.
                loadSettingsFromFile((err,settings) => {
                    if (!err){
                        _settings = settings;
                        _settings[setting] = undefined;
                        saveSettingsToFile((err) => {
                            if (err) reject("Could not save settings to file.");
                            else resolve();
                        });
                    } else {
                        reject("Could not load settings file.");
                    }
                    
                });
            });
        } else {
            // read the setting file first before updating/adding the passed setting.
            loadSettingsFromFile((err,settings) => {
                if (!err){
                    _settings = settings;
                    _settings[setting] = undefined;
                    saveSettingsToFile((err) => {
                        callback(err);
                    });
                } else {
                    callback(err);
                }
            });
        }
    };

    AppSettings.prototype.removeSettingInMemory = function (setting) {
        _settings[setting] = undefined;
        return;
    };

    //#endregion PUBLIC PROTOTYPE METHODS

    return AppSettings;
}));
