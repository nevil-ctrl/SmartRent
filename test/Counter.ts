import { expect } from "chai";
import { ethers } from "hardhat";

describe("Counter", function () {
  async function deployCounter() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();

    return { counter, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { counter, owner } = await deployCounter();

      expect(await counter.owner()).to.equal(owner.address);
    });

    it("Should deploy with the right initial value", async function () {
      const { counter } = await deployCounter();

      expect(await counter.number()).to.equal(0);
    });
  });

  describe("Increment", function () {
    it("Should increment the number", async function () {
      const { counter } = await deployCounter();

      await counter.increment();
      expect(await counter.number()).to.equal(1);

      await counter.increment();
      expect(await counter.number()).to.equal(2);
    });
  });

  describe("Set Number", function () {
    it("Should set the number", async function () {
      const { counter } = await deployCounter();

      await counter.setNumber(42);
      expect(await counter.number()).to.equal(42);
    });
  });
});
