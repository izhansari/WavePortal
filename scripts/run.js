const main = async () => {
    const [owner, randomPerson, randomPerson2] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    //this is how you fund the contract on deployment
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await waveContract.deployed();
  
    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract deployed by:", owner.address);

    //lets check to see if the contract is acc funded
    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));
  
    let waveCount = await waveContract.getTotalWaves();
    console.log(waveCount.toNumber());
  
    let waveTxn = await waveContract.wave("hardcoded wave msg on deployment!");
    await waveTxn.wait();
    
    waveTxn = await waveContract.connect(randomPerson).wave("deployment second wave messageeee!");
    await waveTxn.wait();

    waveTxn = await waveContract.connect(randomPerson2).wave("deployment last wavy messagio :(");
    await waveTxn.wait();

    //lets see the balance of the contract now.
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(contractBalance));

    let balTxn = await waveContract.getBalance();
    console.log("Contract Balance: ", balTxn);
  
    //waveCount = await waveContract.getTotalWaves();

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();