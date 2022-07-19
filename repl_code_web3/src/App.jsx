import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";





const App = () => {
  //Just a state variable we use to store our user's public wallet.
  const [currentAccount, setCurrentAccount] = useState("");
  //im not too sure about states in react... but we need this...
  const [allWaves, setAllWaves] = useState([]);
  //making states for our message
  const [usrmsg, setUsrmsg] = useState("");
  //state for the loader
  const [isLoading, setIsLoading] = useState(false);
  //state for txHash
  const [txHash, setTxHash] = useState("");
  //Create a variable here that holds the contract address after you deploy!
  const contractAddress = "0x5f915BC854A5cBb8800021A350c9021088E354c1";
  const [balance, setBalance] = useState(0);
  //Create a variable here that references the abi content!
  const contractABI = abi.abi;

  
  const checkIfWalletIsConnected = async () => {
    try {
      //First make sure we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      //Check if we're authorized to access the user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const getAllWaves = async () => {
    try{
      const { ethereum } = window;
      if (ethereum) {
        //next three lines to setup provider, signer, and contract to interact with the contract.
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        //call from the contract.
        const waves = await wavePortalContract.getAllWaves();
        //pick out the return messages from the function to return to web.
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp *1000),
            message: wave.message
          });
        });
        //store data in react state
        setAllWaves(wavesCleaned);
      } else{
        console.log("Ethereum object doesn't existyy!")
      }
    }catch (error){
      console.log(error);
    }
  };

useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
  
  //Implement your connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }


  
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        //Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave(usrmsg, { gasLimit: 300000});
        setIsLoading(true);
        setTxHash(waveTxn.hash);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setIsLoading(false);
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        //call the balance
        // let bal = await wavePortalContract.getBalance();
        // bal = ethers.utils.formatEther(bal);
        // console.log("BALANCE PLEAESASEEESEESE", bal);   
        // setBalance(bal);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
}

  
  
  //This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Let's Get Wavy!
        </div>

        <div className="bio">
        <h5>I am <a target="blank" href="https://izhan.eth.link/">izhan</a> and I am making a DApp to explore developing on the blockchain! Connect your Ethereum wallet (on Rinkeby testnet), show some love by typing me a message, and click the button to interact with the smart contract to wave it over my way. <br></br> (BTW, you got a 50/50 shot to earn some fake money!)</h5>
          <p>Contract Addy: {contractAddress}<br></br>  
          </p>
        </div>        
       
        <div className="inputContainer">
          {currentAccount && !isLoading &&(
          <div>
              <input 
                className = "msgInput"
                type="text" 
                placeholder = "HINT: type here"
                value = {usrmsg}
                onChange = {(e) => setUsrmsg(e.target.value)}
              />
            </div>
          )}
          
          {usrmsg.trim() && !isLoading &&(
            <button className="waveButton" onClick={wave}>
              Wave at Me
            </button>
          )}

          {isLoading &&(
            <div className="center">
              <div className="lds-ripple"><div></div><div></div></div>
              <div>your wave is being mined...</div>
            </div>
          )}

          {txHash && (
            <div>
              <div className = "center">
                check your transaction here:
              </div>
              <div className = "center"> {txHash} </div>
            </div>
          )}
          
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>   
        
        {allWaves.slice(0).reverse().map((wave, index) => {
          return (
            <div className="txInfo" key={index}>
              <div>🔗 - Address: {wave.address}</div>
              <div>🕦 - Time: {wave.timestamp.toString()}</div>
              <div>✉️ - Message: {wave.message}</div>
            </div>)
        })}
        
      </div>
    </div>
    );
  }
export default App