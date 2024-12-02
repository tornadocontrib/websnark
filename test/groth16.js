
const assert = require("assert");
const { describe, it, beforeEach, afterEach } = require("node:test")
const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const buildGroth16 = require("../index.js").buildGroth16;

describe("Basic tests for groth16 proof generator", () => {
    let groth16
    beforeEach(async () => groth16 = await buildGroth16())
    afterEach(async () => groth16.terminate())

    it("should do basic multiexponentiation", async () => {
        const signalsAll = fs.readFileSync(path.join(__dirname, "data", "witness.bin"));
        const provingKey = fs.readFileSync(path.join(__dirname, "data", "proving_key.bin"));

        const nSignals = 1;

        const pkey32 = new Uint32Array(provingKey);
        const pPointsA = pkey32[5];

        const points = provingKey.slice(pPointsA, pPointsA + nSignals*64);
        const signals = signalsAll.slice(0, nSignals*32);

        const pr1 = groth16.alloc(96);
        const pPoints = groth16.alloc(points.byteLength);
        groth16.putBin(pPoints, points);

        const pSignals = groth16.alloc(signals.byteLength);
        groth16.putBin(pSignals, signals);

        groth16.instance.exports.g1_zero(pr1);
        groth16.instance.exports.g1_multiexp(pSignals, pPoints, nSignals, 1, pr1);
        groth16.instance.exports.g1_affine(pr1, pr1);
        groth16.instance.exports.g1_fromMontgomery(pr1, pr1);

        const r1 = groth16.bin2g1(groth16.getBin(pr1, 96));

        groth16.instance.exports.g1_zero(pr1);
        groth16.instance.exports.g1_multiexp2(pSignals, pPoints, nSignals, 1, pr1);
        groth16.instance.exports.g1_affine(pr1, pr1);
        groth16.instance.exports.g1_fromMontgomery(pr1, pr1);

        const r2 = groth16.bin2g1(groth16.getBin(pr1, 96));

        assert.equal(r1[0],r2[0]);
        assert.equal(r1[1],r2[1]);
    });

    it.skip("It should do a basic point doubling G1", { timeout: 10000000 }, async () => {
        const signals = fs.readFileSync(path.join(__dirname, "data", "witness.bin"));
        const provingKey = fs.readFileSync(path.join(__dirname, "data", "proving_key.bin"));
        const proofS = await groth16.proof(signals.buffer, provingKey.buffer);

        const proof = snarkjs.unstringifyBigInts(proofS);
        const verifierKey = snarkjs.unstringifyBigInts(JSON.parse(fs.readFileSync(path.join(__dirname, "data", "verification_key.json"), "utf8")));
        const pub = snarkjs.unstringifyBigInts(JSON.parse(fs.readFileSync(path.join(__dirname, "data", "public.json"), "utf8")));

        assert(snarkjs.groth.isValid(verifierKey, proof, pub));
    });

});
