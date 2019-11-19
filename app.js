const bs58check = require('bs58check')
const bech32 = require('bech32')
const bufferEquals = require('buffer-equals')
const createHash = require('create-hash')
const secp256k1 = require('secp256k1')
const varuint = require('varuint-bitcoin')

/*  The code for this project was hacked together based on bitcoinjs-message.
 *  Many thanks to the contributors to https://github.com/bitcoinjs/bitcoinjs-message
 *  This code inherits the MIT License from the above repository.
 *  
 *  Although parts of this code support Segwit, Opendimes at the time of development
 *  (November 2019) only support having one classic P2PKH address (starting with 1~).
 * 
 *  Use Browserify.js to include dependencies for browser use.
 */

const SEGWIT_TYPES = {
  P2WPKH: 'p2wpkh',
  P2SH_P2WPKH: 'p2sh(p2wpkh)'
}

function sha256 (b) {
  return createHash('sha256')
    .update(b)
    .digest()
}
function hash256 (buffer) {
  return sha256(sha256(buffer))
}
function hash160 (buffer) {
  return createHash('ripemd160')
    .update(sha256(buffer))
    .digest()
}

function decodeSignature (buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')

  const flagByte = buffer.readUInt8(0) - 27
  if (flagByte > 15 || flagByte < 0) {
    throw new Error('Invalid signature parameter')
  }

  return {
    compressed: !!(flagByte & 12),
    segwitType: !(flagByte & 8)
      ? null
      : !(flagByte & 4)
        ? SEGWIT_TYPES.P2SH_P2WPKH
        : SEGWIT_TYPES.P2WPKH,
    recovery: flagByte & 3,
    signature: buffer.slice(1)
  }
}

function magicHash (message, messagePrefix) {
  messagePrefix = messagePrefix || '\u0018Bitcoin Signed Message:\n'
  if (!Buffer.isBuffer(messagePrefix)) {
    messagePrefix = Buffer.from(messagePrefix, 'utf8')
  }

  const messageVISize = varuint.encodingLength(message.length)
  const buffer = Buffer.allocUnsafe(
    messagePrefix.length + messageVISize + message.length
  )
  messagePrefix.copy(buffer, 0)
  varuint.encode(message.length, buffer, messagePrefix.length)
  buffer.write(message, messagePrefix.length + messageVISize)
  return hash256(buffer)
}

function verify (message, address, signature, messagePrefix) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')

  const parsed = decodeSignature(signature)
  const hash = magicHash(message, messagePrefix)
  const publicKey = secp256k1.recover(
    hash,
    parsed.signature,
    parsed.recovery,
    parsed.compressed
  )
  const publicKeyHash = hash160(publicKey)
  let actual, expected

  if (parsed.segwitType) {
    if (parsed.segwitType === SEGWIT_TYPES.P2SH_P2WPKH) {
      const redeemScript = Buffer.concat([
        Buffer.from('0014', 'hex'),
        publicKeyHash
      ])
      const redeemScriptHash = hash160(redeemScript)
      actual = redeemScriptHash
      expected = bs58check.decode(address).slice(1)
    } else if (parsed.segwitType === SEGWIT_TYPES.P2WPKH) {
      const result = bech32.decode(address)
      const data = bech32.fromWords(result.words.slice(1))
      actual = publicKeyHash
      expected = Buffer.from(data)
    }
  } else {
    actual = publicKeyHash
    expected = bs58check.decode(address).slice(1)
  }

  return bufferEquals(actual, expected)
}


function printRecoveredPubKey (message, signature) {
    if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')

    const parsed = decodeSignature(signature)
    const hash = magicHash(message)
    const publicKey = secp256k1.recover(
        hash,
        parsed.signature,
        parsed.recovery,
        parsed.compressed
    )
    return publicKey.toString('hex');
}

function getPubKey() {
  document.getElementById('pubkey').textContent = '';
  const verifyTextContents = document.openDimeText.verifyText.value.split('\n');
  if (verify(verifyTextContents[0],verifyTextContents[1],verifyTextContents[2])) {
    document.getElementById('pubkey').textContent = printRecoveredPubKey(
      verifyTextContents[0],
      verifyTextContents[2]
    );
  }
  return;
}

function copyPubKey() {
  let copyTarget = document.getElementById('pubkey');
  let range = document.createRange();
  range.selectNode(copyTarget);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand('copy');
  alert("Copied pubkey to clipboard: " + copyTarget.textContent);
  return;
}

document.getElementById('submitText').addEventListener('click', getPubKey, false);
document.getElementById('copyPubKey').addEventListener('click', copyPubKey, false);