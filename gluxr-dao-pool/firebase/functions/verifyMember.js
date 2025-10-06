const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('@solana/spl-token');
admin.initializeApp();

exports.verifyMember = functions.https.onCall(async (data) => {
  const { wallet } = data;
  if (!wallet) {
    throw new functions.https.HttpsError('invalid-argument', 'wallet required');
  }
  const connection = new Connection(process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com');
  const mint = new PublicKey(process.env.GLUXR_MINT || 'ReplaceWithMint');
  const owner = new PublicKey(wallet);
  const ata = await getAssociatedTokenAddress(mint, owner);
  let balance = 0;
  try {
    const balInfo = await connection.getTokenAccountBalance(ata);
    balance = parseInt(balInfo.value.amount, 10);
  } catch (e) {
    balance = 0;
  }
  const verified = balance > 0;
  await admin.firestore().collection('members').doc(wallet).set({ verified, balance, ts: Date.now() }, { merge: true });
  return { verified, balance };
});
