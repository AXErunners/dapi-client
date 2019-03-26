# DAPI Client

[![Build Status](https://travis-ci.com/axerunners/dapi-client.svg?branch=master)](https://travis-ci.com/axerunners/dapi-client)

> Client library used to access Axe DAPI endpoints

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Install

```sh
npm install @axerunners/dapi-client
```

## Usage

```javascript
const DAPIClient = require('@axerunners/dapi-client');
var client = new DAPIClient();

client.getBalance('testaddress');
```

## Contributing

Feel free to dive in! [Open an issue](https://github.com/axerunners/dapi-client/issues/new) or submit PRs.

## License

[MIT](LICENSE) &copy; Axe Core Group, Inc.
