const fs = require('fs');
const path = require('path');
const { JsonRpcProvider, Wallet, Contract, id, ZeroHash } = require('ethers');

const root = path.resolve(__dirname, '..');
const env = Object.fromEntries(fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/).filter(Boolean).map(line => { const i=line.indexOf('='); return [line.slice(0,i), line.slice(i+1)]; }));
const artifact = JSON.parse(fs.readFileSync(path.join(root, 'artifacts', 'MaintenaProofRegistry.json'), 'utf8'));
const rpc = env.BOT_PROOF_RPC_URL;

(async () => {
  const provider = new JsonRpcProvider(rpc);
  const network = await provider.getNetwork();
  if (network.chainId !== 968n) throw new Error(`Expected Bohr chain 968, got ${network.chainId}`);
  const wallet = new Wallet(env.BOT_TESTNET_PRIVATE_KEY, provider);
  const contract = new Contract(env.BOT_PROOF_CONTRACT_ADDRESS, artifact.abi, wallet);
  const code = await provider.getCode(env.BOT_PROOF_CONTRACT_ADDRESS);
  if (code === '0x') throw new Error('Canonical contract has no bytecode');
  const signer = await contract.authorisedSigner();
  if (signer.toLowerCase() !== wallet.address.toLowerCase()) throw new Error('Contract signer mismatch');
  console.log('CHAIN_PASS=968');
  console.log(`CONTRACT_PASS=${env.BOT_PROOF_CONTRACT_ADDRESS}`);
  console.log(`SIGNER_PASS=${wallet.address}`);

  const proofId = id(`maintena-e2e-${Date.now()}`);
  const assetHash = id('opaque-asset-e2e-001');
  const recordHash = id('opaque-service-record-e2e-001');
  const contentHash = id('canonical-manifest-e2e-v1');
  const tx = await contract.anchorProof(proofId, assetHash, recordHash, contentHash, 1, ZeroHash);
  const receipt = await tx.wait(1);
  if (!receipt || receipt.status !== 1) throw new Error('Proof transaction failed');
  const parsed = receipt.logs.map(log => { try { return contract.interface.parseLog(log); } catch { return null; } }).find(log => log?.name === 'ProofAnchored');
  if (!parsed) throw new Error('ProofAnchored event was not emitted');
  const confirmations = (await provider.getBlockNumber()) - receipt.blockNumber;
  console.log(`PROOF_TX=${tx.hash}`);
  console.log(`PROOF_STATUS=${receipt.status}`);
  console.log(`PROOF_BLOCK=${receipt.blockNumber}`);
  console.log(`PROOF_CONFIRMATIONS=${confirmations}`);
  console.log(`EVENT_PROOF_ID=${parsed.args.proofId}`);
  console.log(`EVENT_RECORD_TYPE=${parsed.args.recordType}`);
  if (!(await contract.proofExists(proofId))) throw new Error('proofExists was not persisted');
  console.log('PROOF_READBACK_PASS=true');

  try {
    await contract.anchorProof.staticCall(proofId, assetHash, recordHash, contentHash, 1, ZeroHash);
    throw new Error('Duplicate proof unexpectedly accepted');
  } catch (error) {
    if (error.message === 'Duplicate proof unexpectedly accepted') throw error;
    console.log('DUPLICATE_REJECTION_PASS=true');
  }

  const unauthorized = Wallet.createRandom().connect(provider);
  const unauthorizedContract = new Contract(env.BOT_PROOF_CONTRACT_ADDRESS, artifact.abi, unauthorized);
  try {
    await unauthorizedContract.anchorProof.staticCall(id('unauthorized-proof'), assetHash, recordHash, contentHash, 1, ZeroHash);
    throw new Error('Unauthorized signer unexpectedly accepted');
  } catch (error) {
    if (error.message === 'Unauthorized signer unexpectedly accepted') throw error;
    console.log('UNAUTHORIZED_REJECTION_PASS=true');
  }
  console.log(`EXPLORER=https://scan.bohr.life/tx/${tx.hash}`);
})().catch(error => { console.error(error); process.exit(1); });