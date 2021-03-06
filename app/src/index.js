import Web3 from "web3";
import simpleStoreArtifact from "../../build/contracts/SimpleStore.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = simpleStoreArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        simpleStoreArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.refreshValue();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshValue: async function() {
    const { getValue } = this.meta.methods;
    const storeValue = await getValue().call();

    const storeValueElement = document.getElementsByClassName("storeValue")[0];
    storeValueElement.innerHTML = storeValue;
    this.checkLastBlock();
  },

  setValue: async function() {
    const newValue = document.getElementById("value").value;

    this.setStatus("Updating value on SimpleStore contract... (please wait)");

    const { setValue } = this.meta.methods;
    await setValue(newValue).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshValue();
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  checkLastBlock: async function() {
    const { web3 } = this;
    const latest = await web3.eth.getBlockNumber()

    let txStr = ''
    for(let i = 0; i <= latest; i++ ) {
      const block = await web3.eth.getBlock(i);
      console.log(`Searching block ${ block.number }...`);
      if (block && block.transactions) {
        for (let tx of block.transactions) {
            let transaction = await web3.eth.getTransaction(tx);
            let data = web3.utils.hexToAscii('0x' + transaction.input.slice(138, transaction.input.length))
            if (this.account === transaction.from && transaction.to !== null) {
              txStr += `<li>Block ${i} : `
              txStr += `To Address: ${transaction.to}, Data: ${data}, Timestamp: ${block.timestamp}</li>`
            }
          }
        const txULElement = document.getElementsByClassName("tx")[0];
        txULElement.innerHTML = txStr
      }
    }
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
