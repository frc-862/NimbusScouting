const axios = require('axios');

// iPhone Network IPv4: 172.20.10.5
// 862 server hostname: frc862.com
// PCCK12-Devices IPv4: 10.168.91.24
const tempIP = "frc862.com";

async function getOneFromDatabase(getQuery) {
  return await getDatabaseDataFromURL("/match", { password: "Abracadabra"}, getQuery);
}

async function getManyFromDatabase(getQuery) {
  return await getDatabaseDataFromURL("/matches", { password: "Abracadabra"}, getQuery);
}
 
async function getAllFromDatabase() {
  return await getDatabaseDataFromURL("/matches", { password: "Abracadabra"});
}

async function putOneToDatabase(dataToPut) {
  return await putDatabaseDataFromURL("/match", { password: "Abracadabra"}, dataToPut);
}

async function deleteOneFromDatabase(deleteQuery) {
  return await deleteDatabaseDataFromURL("/match", { password: "Abracadabra"}, deleteQuery); 

}

// Database Server Stuff
async function getDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, query = {}) {
  return await axios.default.get(`http://${tempIP}:4000${url_after}`, { headers: headers, params: query, timeout: 3000 })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(Object.keys(error), error.message, error.name, error.code, error.request);
    });
}

async function putDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, query = {}) {
  return await axios.default.put(`http://${tempIP}:4000${url_after}`, query, { headers: headers, timeout: 3000 })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(Object.keys(error), error.message, error.name, error.code, error.request);
    });
}

async function deleteDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, query = {}) {
  return await axios.default.delete(`http://${tempIP}:4000${url_after}`, { headers: headers, timeout: 3000, data: { query: query }})
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.log(error);
    });
}


// Blue Alliance API Stuff
const blueAllianceAuthKey = "uTHeEfPigDp9huQCpLNkWK7FBQIb01Qrzvt4MAjh9z2WQDkrsvNE77ch6bOPvPb6";

async function getBlueAllianceEvents(year) {
	return getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/events/" + year + "/simple");
}

async function getBlueAllianceTeams(eventCode) {
	return getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/event/" + eventCode + "/teams/simple");
}

async function getBlueAllianceMatches(eventCode) {
	return getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/event/" + eventCode + "/matches/simple");
}

async function getBlueAllianceDataFromURL(url) {
  if (blueAllianceAuthKey) {
    return await axios.default.get(url, { headers: { "X-TBA-Auth-Key": blueAllianceAuthKey }, timeout: 3000 })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.log(error);
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
  deleteOneFromDatabase
}