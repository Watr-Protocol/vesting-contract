const { time } = require("@nomicfoundation/hardhat-network-helpers");
const chai = require("chai")
const { solidity } = require("ethereum-waffle");

chai.use(solidity);

describe("VestingContract", () => {
    it("should return locked balance", async () => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        chai.expect(await contract.locked() == "1000000000000000000")
    }),
    it("should unlock as time progresses", async () => {
        const payeeWallet = await ethers.Wallet.createRandom()
        const factory = await ethers.getContractFactory('TokenVesting')
        const now = (await ethers.provider.getBlock("latest")).timestamp
        // address _payee, uint64 _epoch_length, uint8 _number_of_epochs, uint256 allocation
        const contract = await factory.deploy(payeeWallet.address, 3600, 4, "1000000000000000000", now)
        await contract.deployed()
        chai.expect(await contract.locked() == "1000000000000000000")
        await time.increase(3601)
        chai.expect(await contract.locked() == "750000000000000000")
        await time.increase(3601)
        chai.expect(await contract.locked() == "500000000000000000")
        await time.increase(3601)
        chai.expect(await contract.locked() == "250000000000000000")
        await time.increase(720000)
        chai.expect(await contract.locked() == "0")
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
        chai.expect(await ethers.provider.getBalance(contract.address), "1000000000000000000")
        await time.increase(3601)
        await contract.withdraw(payeeWallet.address)
        const contractBalance = await ethers.provider.getBalance(contract.address)
        chai.expect(contractBalance).to.equal("750000000000000000")
        const payeeBalance = await ethers.provider.getBalance(payeeWallet.address)
        chai.expect(payeeBalance).to.equal("250000000000000000")
    })
})