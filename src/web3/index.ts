import Web3 from 'web3';
import { abi } from './uprtcl-abi';

export const checkHome = async (web3provider, dao) => {
  const provider = await web3provider
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  web3.eth.defaultAccount = accounts[0];
  const contractInstance = new web3.eth.Contract(
    abi,
    '0xa371A1F205a2723C37ba3E35BbF2D7eA04c77402'
  );

  return await contractInstance.methods.getHomePerspective(dao).call()
};
