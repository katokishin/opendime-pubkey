# Opendime Pubkey Calculator

This tool calculates the public key of any sealed [Opendime](https://opendime.com/) based on the contents of its `advanced/verify2.txt` file.

[You can use the tool here](https://trustless-services.com/opendime-pubkey.html) or you can run it locally on your computer.

## How to set up locally:

- Clone this repository.

- Run `npm install` to install the dependencies, including Browserify.

- Run `browserify app.js -o opendime-pubkey.js` to compile the Javascript file to be used in the browser.

- Open `opendime-pubkey.html` in your browser to use.


## How to use in the browser:

- Plug in your sealed Opendime. There is no need to reveal the private key for this to work.

- Navigate to the `advanced` folder and find `verify2.txt`. Copy the contents into the text area.

- Click on the `Calculate Public Key` button; you should see your Opendime's public key.

- Optional: Click on the `Copy to clipboard` button to copy the public key. An alert will appear if successful.


## Motivation:

Opendime devices have a unique property that allow ownership of a private key without knowledge of it.  Opendimes are also much cheaper than hardware cryptocurrency wallets.  Finally, revealing the private key requires irreversible physical tampering (destruction).

I believe these qualities give the Opendime potential to be used as a physical access key, e.g. a physical multisig key. Since the complex issue of cybersecurity is reduced to the simple issue of physical security, storage is much more operationally simple than most other options such as a raw private key, encrypted private key, paper wallet, seed phrase, etc.


## Disclaimer:

Use at your own risk. I will not be held accountable for any bugs or errors.

Most of the code in app.js is directly copied from [bitcoinjs-message](https://github.com/bitcoinjs/bitcoinjs-message). I would like to thank the developers who made this library.
