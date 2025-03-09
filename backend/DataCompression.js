const pako = require('pako');
const Buffer = require('buffer').Buffer;

//const TextDecoder = require('util').TextDecoder;

/**
 * Compresses a string using the pako library.
 * 
 * @param {string} string The string to compress.
 * 
 * @returns The compressed string, or an "ERROR" string if an error occurred.
 */
const DeflateString = (string) => {
  try {
    return new Buffer.from(pako.deflate(string)).toString('base64');
  } catch (e) { console.log(e); return "ERROR"; }
}

/**
 * Decompresses a string using the pako library.
 * 
 * @param {string} byteString The byte string to decompress.
 * 
 * @returns The decompressed string, or an "ERROR" string if an error occurred.
 */
const InflateString = (byteString) => {
  try {
  return pako.inflate(Buffer.from(byteString, 'base64'), { to: 'string' });
  } catch (e) { console.log(e); return "ERROR"; }
}


const CompressPicklistJSON = (picklistJson) => {
  return picklistJson.map((picklistItem) => {
    return Object.keys(picklistItem).map((key) => {
      return picklistItem[key];
    });
  });
}

export { DeflateString, InflateString, CompressPicklistJSON };