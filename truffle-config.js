require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      timeoutBlocks: 200
    },
    matic: {
      provider: () => new HDWalletProvider(mnemonic, `https://rpc-mumbai.matic.today`, 4),
      network_id: 80001,
      // gasPrice: '0x0',
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/'
  // compilers: {
  //   solc: {
  //     optimizer: {
  //       enabled: false//,
  //       // runs: 200
  //     }
  //   }
  // }
}

// Contract -> 0x3fF2a76e21c0b8BE765Dc5E206c0F4316EAcd515