const crypto = require('crypto');

const freelancerId = 'evaluation-freelancer-001';
const score = 4.6;
const secret = process.env.ZK_SECRET || 'freelance3_zk_secret';

const numberOfRuns = 1000;
const times = [];
let lastProofHash = '';

for (let i = 0; i < numberOfRuns; i++) {
    const start = process.hrtime.bigint();

    lastProofHash = crypto
        .createHash('sha256')
        .update(`${freelancerId}:${score.toFixed(2)}:${secret}:${Date.now()}`)
        .digest('hex');

    const end = process.hrtime.bigint();

    const elapsedNanoseconds = Number(end - start);
    const elapsedMilliseconds = elapsedNanoseconds / 1e6;

    times.push(elapsedMilliseconds);
}

const average =
    times.reduce((sum, value) => sum + value, 0) / times.length;

const minimum = Math.min(...times);
const maximum = Math.max(...times);

const proofSizeHex = Buffer.byteLength(lastProofHash, 'utf8');
const proofSizeBinary = Buffer.from(lastProofHash, 'hex').length;

console.log('========================================');
console.log(' FreeLance3 Reputation Proof Evaluation');
console.log('========================================');
console.log('Runs:', numberOfRuns);
console.log('Last proof hash:', lastProofHash);
console.log('Proof hash length:', lastProofHash.length, 'hex characters');
console.log('Proof size (stored/transmitted hex):', proofSizeHex, 'bytes');
console.log('Proof size (binary SHA-256 digest):', proofSizeBinary, 'bytes');
console.log('Average generation time:', average.toFixed(6), 'ms');
console.log('Minimum generation time:', minimum.toFixed(6), 'ms');
console.log('Maximum generation time:', maximum.toFixed(6), 'ms');
console.log('========================================');
