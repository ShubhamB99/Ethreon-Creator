import React, { Component } from 'react';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Web3 from 'web3';
import './App.css';
import Ethreon from '../abis/Ethreon.json';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
toast.configure()

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
    this.setState({ web3 })
    const networkId = await web3.eth.net.getId()
    const networkData = Ethreon.networks[networkId]
    if(networkData) {
      // console.log(networkData)
      const contract = web3.eth.Contract(Ethreon.abi, networkData.address)
      this.setState({ contract })
      // console.log(this.state.contract);
      this.getCreatorElseSignup();

      // const imgHash = await contract.methods.ge().call()
      // const imgHash = "QmeaKRPVpAndtLYRZVWcWG34proxjr9Z9wiNtaseSKfsTZ"
      // this.setState({ imgHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
    // console.log('Starting print!')
    // console.log(this.state.imgHash)
    // console.log(this.state.contentHash)
    console.log(this.state.contract)
    // console.log(this.state.web3)
    // console.log(this.state.buffer)
    // console.log(this.state.account)
  }

  async getCreatorElseSignup() {
    const isOldCreator = await this.state.contract.methods.isOldCreator().call({from: this.state.account});
    console.log('isOldCreator', isOldCreator);
    if (isOldCreator == false) {
      this.state.contract.methods.newCreatorSignup().send({ from: this.state.account }).then(function(result) {
        console.log(result);
      })
      this.notify('Welcome to the family!')
    }
    else {
      this.notify('Welcome Back!')
    }
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

  onSubmitImage = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }
      this.notify('Updating Image!')
      this.state.contract.methods.addCreatorImage(result[0].hash).send({ from: this.state.account }).then((r) => {
        console.log('Result', r)
        console.log('Image hash ', result[0].hash)
        return this.setState({ imgHash: result[0].hash })
      })
    })
  }

  onSubmitContent = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }
      this.notify('Updating Content!')
      this.state.contract.methods.addCreatorContent(result[0].hash).send({ from: this.state.account }).then((r) => {
        console.log('Result', r)
        console.log('Content hash ', result[0].hash)
        return this.setState({ contentHash: result[0].hash })
      })
    })
  }

  notify = (message) => {
    toast.info(message, {position: toast.POSITION.TOP_RIGHT, autoclose: 100})
  }

  render() {
    return (
      <div className="master-container">
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a rel="noopener noreferrer">
                  <div className="main-title"><h1>Creator's Dashboard</h1></div>
                </a>
                <br /><br /><br />
                <p>&nbsp;</p>
                <h2>Change Image</h2><br />
                <form onSubmit={this.onSubmitImage} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                <p>&nbsp;</p>
                <h2>Change Content</h2><br />
                <form onSubmit={this.onSubmitContent} >
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
