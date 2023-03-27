# Deployment Instructions
Deploy one contract for each contributor.
## Constructor
- _payee: `address` (the address that will receive the unlocked tokens)
- _epoch_length: `u64` (length of payment epoch, ms)
- _number_of_epochs: `u8` (number of epochs to divide the total payment over)
- allocation: `u256` (the amount of tokens allocated to this contract)
- _genesis_timestamp: `u64` (the UNIX timestamp of the Watr Mainnet Genesis Block)

## Post Deployment
### Funding
A transfer of `allocation` + the Watr network existential deposit(`0.01 WATR`) should be made to the deployed contract's address
### Verification
The contract's `locked` function can be called to verify the amount of tokens that are locked in the contract.

The contract's `checkWithdrawable` function can be called to check how many tokens would be withdrawn to the `payee` address if the `withdraw` function were to be called at this time. Immediately post deployment and funding this should equl zero.

### Withdrawal
Once at least one `epoch_length` has passed, a tranche of tokens will be available for withdrawal. The `withdraw` function can be called.
#### Constraints

- The address parameter passed into the `withdraw` function must match the `payee` supplied at construction
- the `withdraw` function can be called by any wallet with sufficient gas
