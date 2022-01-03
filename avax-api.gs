// Time to wait in miliseconds to call function.
// this is to sparse function calling.
// Recomended 5 seconds = 5 * 1000
// The maximum allowed value is 300000 (or 5 minutes). (Google Apps reference limit)
var waitInMiliseconds = 5 * 1000;

// How many times should we retry a failed funcion call
// This is to avoid function calling too many times and to exceed function timeout
// Recomended 3 times
var maxCallingTimes = 3;

// Cache timeout
// Avoids too much refreshed over time to prevent API from failing with too many calls
// Timeout in seconds
// Recomended 10 minutes, 600 seconds
var cacheTimeout = 600;

/**
 * --------------------------------------------------------------------------------------------
 * Google Sheet Scripts for AVAX API by Alderian
 * --------------------------------------------------------------------------------------------
 * 
 * You will need yout own API-KEY that ou can get from https://snowtrace.io/myapikey
 * You will need an user on https://snowtrace.io/ to get the API-KEY
 * 
 * getAVAXBalance       Gets AVAX token balance on your wallet
 * getAVAXTokenBalance  Gets ANY token balance on your wallet. It can get any contract balance
 * 
 */

 var apiAvaxUrl = "https://api.snowtrace.io/api";

/** getAVAXBalance
 * 
 * Gets AVAX token balance on your wallet
 * 
 * @param {avaxAddress}             the wallet avax address, in the form of 0x12345... 
 * @param {myApiKey}                the your api-key to use AVAX Api
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @param {calledTimes}             the number of times this function was called to control how many times its called
 * @returns 
 */
async function getAVAXBalance(avaxAddress, myApiKey, parseOptions, calledTimes = 0) {
  if (calledTimes >= maxCallingTimes) {
    return "Error: called too many times. " + calledTimes;
  }

  id_cache = 'AVAX' + avaxAddress + 'AVAXbalance'
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }

  try {
    Utilities.sleep(Math.random() * 100 + waitInMiliseconds)
    url = apiAvaxUrl + "?module=account&action=balance&address=" + avaxAddress + "&tag=latest&apikey=" + myApiKey;

    var res = await UrlFetchApp.fetch(url)
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);

    var balance = Number(parseFloat(parsedJSON.result) / 1000000000000000000);
    cache.put(id_cache, balance, cacheTimeout);
    return balance;
  }
  catch (err) {
    return getAVAXBalance(avaxAddress, myApiKey, parseOptions, calledTimes++);
  }

}

/** getAVAXTokenBalance
 * 
 * Gets ANY token balance on your wallet. It can get any contract balance
 * 
 * @param {avaxAddress}              the wallet avax address, in the form of 0x12345... 
 * @param {tokenContract}           the token contract to get
 * @param {myApiKey}                the your api-key to use AVAX Api
 * @param {parseOptions}            an optional fixed cell for automatic refresh of the data
 * @param {calledTimes}             the number of times this function was called to control how many times its called
 * @returns 
 */
async function getAVAXTokenBalance(avaxAddress, tokenContract, myApiKey, parseOptions, calledTimes = 0) {
  if (calledTimes >= maxCallingTimes) {
    return "Error: called too many times. " + calledTimes;
  }

  id_cache = 'AVAX' + avaxAddress + tokenContract + 'balance'
  var cache = CacheService.getScriptCache();
  var cached = cache.get(id_cache);
  if (cached != null) {
    return Number(cached);
  }

  try {
    Utilities.sleep(Math.random() * 100 + waitInMiliseconds)
    url = apiAvaxUrl + "?module=account&action=tokenbalance&contractaddress=" + tokenContract + "&address=" + avaxAddress + "&tag=latest&apikey=" + myApiKey;

    var res = await UrlFetchApp.fetch(url)
    var content = res.getContentText();
    var parsedJSON = JSON.parse(content);

    var balance = Number(parseFloat(parsedJSON.result) / 1000000000000000000);
    cache.put(id_cache, balance, cacheTimeout);
    return balance;
  }
  catch (err) {
    return getAVAXTokenBalance(avaxAddress, tokenContract, myApiKey, parseOptions, calledTimes++);
  }

}
