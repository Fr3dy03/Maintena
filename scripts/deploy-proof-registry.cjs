const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { JsonRpcProvider, Wallet, ContractFactory, formatEther } = require('ethers');

const root = path.resolve(__dirname, '..');
const env = Object.fromEntries(fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/).filter(Boolean).map(line => { const i=line.indexOf('='); return [line.slice(0,i), line.slice(i+1)]; }));
const source = fs.readFileSync(path.join(root, 'contracts', 'MaintenaProofRegistry.sol'), 'utf8');
const input = { language:'Solidity', sources:{'MaintenaProofRegistry.sol':{content:source}}, settings:{outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}} };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors?.some(e => e.severity === 'error')) { console.error(output.errors); process.exit(1); }
const artifact = output.contracts['MaintenaProofRegistry.sol'].MaintenaProofRegistry;
(async()=>{
  const provider = new JsonRpcProvider('https://rpc.bohr.life');
  const wallet = new Wallet(env.BOT_TESTNET_PRIVATE_KEY, provider);
  const network = await provider.getNetwork();
  if (network.chainId !== 968n) throw new Error(`Unexpected chain ${network.chainId}`);
  const balance = await provider.getBalance(wallet.address);
  if (balance === 0n) throw new Error('Deployment wallet has no BOT');
  const factory = new ContractFactory(artifact.abi, artifact.evm.bytecode.object, wallet);
  const contract = await factory.deploy(wallet.address);
  console.log(`DEPLOY_TX=${contract.deploymentTransaction().hash}`);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const receipt = await provider.getTransactionReceipt(contract.deploymentTransaction().hash);
  if (!receipt || receipt.status !== 1) throw new Error('Deployment receipt failed');
  const code = await provider.getCode(address);
  if (code === '0x') throw new Error('No bytecode at deployed address');
  const local = path.join(root, '.env.local');
  let contents = fs.readFileSync(local, 'utf8').split(/\r?\n/).filter(Boolean).filter(line => !line.startsWith('BOT_PROOF_'));
  contents.push('BOT_PROOF_CHAIN_ID=968', `BOT_PROOF_CONTRACT_ADDRESS=${address}`, 'BOT_PROOF_RPC_URL=https://rpc.bohr.life');
  fs.writeFileSync(local, contents.join('\n')+'\n');
  fs.mkdirSync(path.join(root,'artifacts'), {recursive:true});
  fs.writeFileSync(path.join(root,'artifacts','MaintenaProofRegistry.json'), JSON.stringify(artifact,null,2));
  console.log(`DEPLOYED_ADDRESS=${address}`);
  console.log(`BLOCK_NUMBER=${receipt.blockNumber}`);
  console.log(`BALANCE_AFTER_BOT=${formatEther(await provider.getBalance(wallet.address))}`);
})().catch(error=>{ console.error(error); process.exit(1); });