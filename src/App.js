import "./App.css";
import { useState } from "react";
import { ContractFactory, ethers } from "ethers";
import axios from "axios";
import Warranty from "./artifacts/contracts/Warranty.sol/Warranty.json";


function App() {
  const [ipfshash, setipfshash] = useState("");
  const [balance, setbalance] = useState(0);
  const [address, setaddress] = useState("");
  async function request_account() {
    console.log("first");

    //check if metamask exist
    if (window.ethereum) {
      console.log("detected");
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log(accounts);
        setaddress(accounts[0]);
      } catch (err) {
        console.log("Error connecting");
      }
    } else {
      console.log("not detected");
    }
  }

  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      await request_account();
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("provider", provider);
    const bal = await provider.getBalance(address);
    console.log("bal");
    setbalance(ethers.utils.formatEther(bal));
  }

  async function uploadPinata() {
    var data = JSON.stringify({
      pinataOptions: {
        cidVersion: 8,
      },
      pinataMetadata: {
        name: "Acoustic Guitar S-200",
      },
      pinataContent: {
        Company: "Yamaha",
        Product: "Acoustic Guitar",
      },
    });

    var config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: "e735c704db2370ec6012",
        pinata_secret_api_key:
          "5ffc98620a7e74dcb83e29c143df50366402ea9d618726448d479b043b8d242c",
      },
      data: data,
    };

    const res = await axios(config);

    console.log(res.data.IpfsHash);
    setipfshash(res.data.IpfsHash);
    console.log("ipfshash-> ", ipfshash);
  }

  function smartCon() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contactAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contract = new ethers.Contract(contactAddress, Warranty.abi, signer);
  }

  async function getPinata() {
    axios.get(`https://gateway.pinata.cloud/ipfs/${ipfshash}`)
    .then((res)=>{
      console.log("res-> ",res.data);
    })
  }

  async function getMintedStatus(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contactAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contract = new ethers.Contract(contactAddress, Warranty.abi, signer);
    const result = await contract.isContentOwned(ipfshash);
    console.log(result);
  }

  async function mintToken(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contactAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contract = new ethers.Contract(contactAddress, Warranty.abi, signer);
    const connection = contract.connect(signer);
    const addr = connection.address;
    const result = await contract.payToMint(addr, ipfshash, {
      value: ethers.utils.parseEther('0.05'),
    })

    await result.wait();
    getMintedStatus();
  }

  async function getURI(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contactAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contract = new ethers.Contract(contactAddress, Warranty.abi, signer);
    const uri = await contract.tokenURI();
  }

  return (
    <div className="App">
      <button onClick={request_account}>Connect Wallet</button>
      <h3>Wallet address: {address}</h3>
      <button onClick={connectWallet}>Really Connect Wallet</button>
      <button onClick={uploadPinata}>Upload shit to Pinata</button>
      <h3>Your balance is : {balance}</h3>
      <button onClick={smartCon}>Interact With Smart Contract</button>
      <h3>IPFS HASH of uploaded thing is : {ipfshash}</h3>

      <button onClick={getPinata}>Get Data from pinata using IPFS HASH</button>

      <button onClick={mintToken}>MINT A MOTHERFUCKING TOKEN</button>
    </div>
  );
}

export default App;
