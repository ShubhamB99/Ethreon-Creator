import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
// import Meme from '../abis/Meme.json'
import Ethreon from '../abis/Ethreon.json'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Ethreon.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Ethreon.abi, networkData.address)
      this.setState({ contract })
      // const imgHash = await contract.methods.ge().call()
      const imgHash = "QmeaKRPVpAndtLYRZVWcWG34proxjr9Z9wiNtaseSKfsTZ"
      this.setState({ imgHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
    console.log(this.state.contract);
    this.state.contract.methods.newCreatorSignup().send({ from: this.state.account }).then(function(result) {
      console.log(result);
    })
  }

  constructor(props) {
    super(props)

    this.state = {
      imgHash: '',
      contentHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }      
       this.state.contract.methods.addCreatorImage(result[0].hash).send({ from: this.state.account }).then((r) => {
         return this.setState({ imgHash: result[0].hash })
       })
    })
  }

  onSubmit2 = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }
       this.state.contract.methods.addCreatorContent(result[0].hash).send({ from: this.state.account }).then((r) => {
         return this.setState({ contentHash: result[0].hash })
       })
    })
  }

  render() {
    return (
      <div>
        {/* <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0" rel="noopener noreferrer">
            Ethreon - The Creator's Platform
          </a>
        </nav> */}
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a rel="noopener noreferrer">
                  <h1>Creator's Dashboard</h1>
                </a>
                <p>&nbsp;</p>
                <h2>Change Image</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                <p>&nbsp;</p>
                <h2>Change Content</h2>
                <form onSubmit={this.onSubmit2} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
