import Web3 from 'web3';
import { abi } from './uprtcl-abi';

export const checkHome = async (web3provider, dao) => {
  const provider = await web3provider
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  const contractInstance = new web3.eth.Contract(
    abi,
    '0xa61ae6D1Aab8FFF8AC293d5cA21cE641C134c29C' //rinkeby homeperspective contract address
  );
    console.log(contractInstance)
  return await contractInstance.methods.getHomePerspective(dao).call()
};
