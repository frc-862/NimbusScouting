const pako = require('pako');
const Buffer = require('buffer').Buffer;

//const TextDecoder = require('util').TextDecoder;

const DeflateString = (string) => {
  try {
    return new Buffer.from(pako.deflate(string)).toString('base64');
  } catch (e) { console.log(e); return "ERROR"; }
}

const InflateString = (byteString) => {
  try {
  return pako.inflate(Buffer.from(byteString, 'base64'), { to: 'string' });
  } catch (e) { console.log(e); return "ERROR"; }
}

export { DeflateString, InflateString };