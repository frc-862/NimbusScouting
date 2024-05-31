const axios = require('axios');

// iPhone Network IPv4: 172.20.10.5
// 862 server hostname: frc862.com
// PCCK12-Devices IPv4: 10.168.91.24


async function getOneFromDatabase(getQuery, IP, port, timeoutTime) {
  return await getDatabaseDataFromURL("/match", { password: "Abracadabra"}, getQuery, IP, port, timeoutTime);
}

async function getManyFromDatabase(getQuery, IP, port, timeoutTime) {
  return await getDatabaseDataFromURL("/matches", { password: "Abracadabra"}, getQuery, IP, port, timeoutTime);
}
 
async function getAllFromDatabase(IP, port, timeoutTime) {
  return await getDatabaseDataFromURL("/matches", { password: "Abracadabra"}, {}, IP, port, timeoutTime);
}

async function putOneToDatabase(dataToPut, IP, port, timeoutTime) {
  return await putDatabaseDataFromURL("/match", { password: "Abracadabra"}, dataToPut, IP, port, timeoutTime);
}

async function deleteOneFromDatabase(deleteQuery, IP, port, timeoutTime) {
  return await deleteDatabaseDataFromURL("/match", { password: "Abracadabra"}, deleteQuery, IP, port, timeoutTime); 

}

async function APIGet(fullURI, timeoutTime) {
  return fetch(fullURI, {
      mode: 'cors',
      method: 'GET',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => json)
      .catch((error) => alert(error));
}

async function testGet(IP, port, timeoutTime, max_tries = 1) {
  return await axios.default.get(`http://${IP}:${port}`, { timeout: timeoutTime, headers: {password: "Abracadabra"} })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      if (max_tries > 0) {
        return testGet(IP, port, timeoutTime, max_tries - 1);
      } else {
        return "Error";
      }
    });
}

// Database Server Stuff
async function getDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, query = {}, IP, port, timeoutTime) {
  return await axios.default.get(`http://${IP}:${port}${url_after}`, { headers: headers, params: query, timeout: timeoutTime })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      alert(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}

async function putDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, data = {}, IP, port, timeoutTime) {
  return await axios.default.put(`http://${IP}:${port}${url_after}`, data, { headers: headers, timeout: timeoutTime })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      alert(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}

async function postDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, data = {}, IP, port, timeoutTime) {
  return await axios.default.post(`http://${IP}:${port}${url_after}`, data, { headers: headers, timeout: timeoutTime })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      alert(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}

async function deleteDatabaseDataFromURL(url_after, headers = { password: "Abracadabra"}, query = {}, IP, port, timeoutTime) {
  return await axios.default.delete(`http://${IP}:${port}${url_after}`, { headers: headers, timeout: timeoutTime, data: { query: query }})
    .then(response => {
      return response.data;
    })
    .catch(error => {
      alert(`${Object.keys(error)}, ${error.message}, ${error.name}, ${error.code}, ${JSON.stringify(error.request)}`);
      return "ERROR"
    });
}


// Blue Alliance API Stuff
const blueAllianceAuthKey = "uTHeEfPigDp9huQCpLNkWK7FBQIb01Qrzvt4MAjh9z2WQDkrsvNE77ch6bOPvPb6";

async function getBlueAllianceEvents(year, timeoutTime) {
	return getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/events/" + year + "/simple", timeoutTime);
}

async function getBlueAllianceTeams(eventCode, timeoutTime) {
	return getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/event/" + eventCode + "/teams/simple", timeoutTime);
}

async function getBlueAllianceMatches(eventCode, timeoutTime) {
	return getBlueAllianceDataFromURL("https://www.thebluealliance.com/api/v3/event/" + eventCode + "/matches/simple", timeoutTime);
}

async function getBlueAllianceDataFromURL(url, timeoutTime) {
  if (blueAllianceAuthKey) {
    return await axios.default.get(url, { headers: { "X-TBA-Auth-Key": blueAllianceAuthKey }, timeout: timeoutTime })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        console.log(error);
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