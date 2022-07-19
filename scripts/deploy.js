const main = async () => {
    //this will get our account addy and balance
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    //printing account addy and balance to console
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account balance: ", hre.ethers.utils.formatEther(accountBalance));
  
    //deploying contract now with funds.
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1"),
    });
    await waveContract.deployed();
  
    //see contract addy and if it is funded
    console.log("WavePortal address: ", waveContract.address);
    let contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log("WavePortal funds: ", hre.ethers.utils.formatEther(contractBalance));
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