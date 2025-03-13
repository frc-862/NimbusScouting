import Constants from 'expo-constants';

const axios = require('axios');
const dbApiKey = Constants.expoConfig.extra.API_KEY;

// iPhone Network IPv4: 172.20.10.5
// 862 server hostname: frc862.com
// PCCK12-Devices IPv4: 10.168.91.24

/**
 * Gets one match from the database.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {object} getQuery The query to get the match.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The match from the database, or an error string if the request failed.
 */
async function getOneFromDatabase(url_base, getQuery, timeoutTime) {
  return await getDatabaseDataFromURL(url_base, "/match", timeoutTime, {}, getQuery);
}

/**
 * Gets multiple matches from the database.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {object} getQuery The query to get the match.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The matches from the database, or an error string if the request failed.
 */
async function getManyFromDatabase(url_base, getQuery, timeoutTime) {
  return await getDatabaseDataFromURL(url_base, "/matches", timeoutTime, {}, getQuery);
}
 
/**
 * Gets all the matches from the database.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The matches from the database, or an error string if the request failed.
 */
async function getAllFromDatabase(url_base, timeoutTime) {
  return await getDatabaseDataFromURL(url_base, "/matches", timeoutTime);
}

/**
 * Puts one match into the database.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {object} dataToPut The query to get the match.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function putOneToDatabase(url_base, dataToPut, timeoutTime) {
  return await putDatabaseDataFromURL(url_base, "/match", timeoutTime, dataToPut);
}

/**
 * Deletes one match from the database.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {object} deleteQuery The query to get the match.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function deleteOneFromDatabase(url_base, deleteQuery, timeoutTime) {
  return await deleteDatabaseDataFromURL(url_base, "/match", timeoutTime, deleteQuery); 

}

/**
 * Tests connection with the database.
 * 
 * @param {string} fullURI The full URL of the database.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function APIGet(fullURI, timeoutTime) {
  return fetch(fullURI, {
      mode: 'cors',
      method: 'GET',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": dbApiKey,
      },
    })
      .then((resp) => { console.log("AAA: " + JSON.stringify(resp)); return resp.text() })
      .then((json) => json)
      .catch((error) => alert(error));
}

/**
 * Tests connection with the database.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {number} timeoutTime The time to wait for the request.
 * @param {number} max_tries - The maximum number of times to try the request.
 * @default max_tries = 1
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function testGet(url_base, timeoutTime, max_tries = 1) {
  return await axios.default.get(url_base, { timeout: timeoutTime, headers: {"x-api-key": dbApiKey} })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      if (max_tries > 0) {
        return testGet(url_base, timeoutTime, max_tries - 1);
      } else {
        return JSON.stringify(error);
      }
    });
}

// Database Server Stuff
/**
 * Gets data from the database at a provided URL.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {string} url_after The URL after the base URL.
 * @param {number} timeoutTime The time to wait for the request.
 * @param {object} headers The headers to include in the request.
 * @param {object} query The query to include in the request.
 * @default 
 * headers = {}
 * query = {}
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function getDatabaseDataFromURL(url_base, url_after, timeoutTime, headers = {}, query = {}) {
  return await axios.default.get(`${url_base}${url_after}`, { headers: { "x-api-key": dbApiKey, ...headers }, params: query, timeout: timeoutTime })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(JSON.stringify(error, null, 2));
      return "ERROR"
    });
}

/**
 * Puts data from the database at a provided URL.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {string} url_after The URL after the base URL.
 * @param {number} timeoutTime The time to wait for the request.
 * @param {object} headers The headers to include in the request.
 * @param {object} query The query to include in the request.
 * @default 
 * headers = {}
 * query = {}
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function putDatabaseDataFromURL(url_base, url_after, timeoutTime, data = {}, headers = {}) {
  return await axios.default.put(`${url_base}${url_after}`, data, { headers: { "x-api-key": dbApiKey, ...headers }, timeout: timeoutTime })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}

/**
 * Posts data from the database at a provided URL.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {string} url_after The URL after the base URL.
 * @param {number} timeoutTime The time to wait for the request.
 * @param {object} headers The headers to include in the request.
 * @param {object} query The query to include in the request.
 * @default 
 * headers = {}
 * query = {}
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function postDatabaseDataFromURL(url_base, url_after, timeoutTime, data = {}, headers = {}) {
  return await axios.default.post(`${url_base}${url_after}`, data, { headers: { "x-api-key": dbApiKey, ...headers }, timeout: timeoutTime })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      //alert(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}

/**
 * Deletes data from the database at a provided URL.
 * 
 * @param {string} url_base The base URL of the database.
 * @param {string} url_after The URL after the base URL.
 * @param {number} timeoutTime The time to wait for the request.
 * @param {object} query The query to include in the request.
 * @param {object} headers The headers to include in the request.
 * @default headers = {}
 * 
 * @returns The server's response, or an error string if the request failed.
 */
async function deleteDatabaseDataFromURL(url_base, url_after, timeoutTime, query, headers = {}) {
  return await axios.default.delete(`${url_base}${url_after}`, { headers: { "x-api-key": dbApiKey, ...headers }, timeout: timeoutTime, data: { query: query }})
    .then(response => {
      return response.data;
    })
    .catch(error => {
      //alert(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}


// Blue Alliance API Stuff
const blueAllianceAuthKey = "uTHeEfPigDp9huQCpLNkWK7FBQIb01Qrzvt4MAjh9z2WQDkrsvNE77ch6bOPvPb6";

/**
 * Gets events from the Blue Alliance API.
 * 
 * @param {number} year The year to get the events from.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The blue alliance events for that year, or an "ERROR" string if the request failed.
 */
async function getBlueAllianceEvents(year, timeoutTime) {
	return getBlueAllianceDataFromURL("events/" + year + "/simple", timeoutTime);
}

/**
 * Gets teams from the Blue Alliance API.
 * 
 * @param {string} eventCode The event to get the teams from.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The blue alliance teams for that event, or an "ERROR" string if the request failed.
 */
async function getBlueAllianceTeams(eventCode, timeoutTime) {
	return getBlueAllianceDataFromURL("event/" + eventCode + "/teams/simple", timeoutTime);
}

/**
 * Gets matches from the Blue Alliance API.
 * 
 * @param {string} eventCode The event to get the matches from.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The blue alliance matches for that event, or an "ERROR" string if the request failed.
 */
async function getBlueAllianceMatches(eventCode, timeoutTime) {
	return getBlueAllianceDataFromURL("event/" + eventCode + "/matches/simple", timeoutTime);
}

/**
 * Gets data from the Blue Alliance API.
 * 
 * @param {string} url The URL to get the data from.
 * @param {number} timeoutTime The time to wait for the request.
 * 
 * @returns The blue alliance data from the provided url, or an "ERROR" string if the request failed.
 */
async function getBlueAllianceDataFromURL(url, timeoutTime) {
  if (blueAllianceAuthKey) {
    return await axios.default.get("https://www.thebluealliance.com/api/v3/" + url, { headers: { "X-TBA-Auth-Key": blueAllianceAuthKey }, timeout: timeoutTime })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.log(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
        return "ERROR"
      });
  }
}

export { 
  getBlueAllianceMatches, 
  getBlueAllianceTeams, 
  getBlueAllianceEvents, 
  getBlueAllianceDataFromURL,
  getOneFromDatabase,
  getManyFromDatabase,
  getAllFromDatabase,
  putOneToDatabase,
  deleteOneFromDatabase,
  putDatabaseDataFromURL,
  postDatabaseDataFromURL,
  getDatabaseDataFromURL,
  deleteDatabaseDataFromURL,
  testGet,
  APIGet,
}