import { time } from "@nomicfoundation/hardhat-network-helpers"
import hre from "hardhat";
import { expect } from "chai"

const ethers = hre.ethers

describe("VestingContract", () => {
    it("should return locked balance", async () => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        expect(await contract.locked() == "1000000000000000000")
    }),
    it("should unlock as time progresses", async () => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        expect(await contract.locked() == "1000000000000000000")
        await time.increase(3601)
        expect(await contract.locked() == "750000000000000000")
        await time.increase(3601)
        expect(await contract.locked() == "500000000000000000")
        await time.increase(3601)
        expect(await contract.locked() == "250000000000000000")
        await time.increase(720000)
        expect(await contract.locked() == "0")
    }),
    it("should allow withdrawal after unlocks", async () => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        const [owner, ] = await ethers.getSigners();
        await owner.sendTransaction({
            to: contract.address,
            value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
          });
        expect(await ethers.provider.getBalance(contract.address), "1000000000000000000")
        await time.increase(3601)
        await contract.withdraw(payeeWallet.address)
        const contractBalance = await ethers.provider.getBalance(contract.address)
        expect(contractBalance).to.equal("750000000000000000")
        const payeeBalance = await ethers.provider.getBalance(payeeWallet.address)
        expect(payeeBalance).to.equal("250000000000000000")
    }),
    it("should not allow withdrawal to an address that is not the payee", async () => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        const [owner, ] = await ethers.getSigners();
        await owner.sendTransaction({
            to: contract.address,
            value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
          });
        const nonPayeeWallet = await ethers.Wallet.createRandom()
        await time.increase(3601)
        expect(await contract.locked() == "750000000000000000")
        await expect(contract.withdraw(nonPayeeWallet.address)).to.be.revertedWith("Cannot withdraw to this address")
        
    }),
    it("should not allow withdrawal if there is nothing to withdraw", async() => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        const [owner, ] = await ethers.getSigners();
        await owner.sendTransaction({
            to: contract.address,
            value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
          });
        expect(await ethers.provider.getBalance(contract.address), "1000000000000000000")
        await expect(contract.withdraw(payeeWallet.address)).to.be.revertedWith("Nothing to withdraw")
    })
})