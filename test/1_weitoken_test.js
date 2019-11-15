const WToken = artifacts.require('WToken')
const u = require('solidity-test-utils')

async function txGasPrice (receipt) {
  var tx = await web3.eth.getTransaction(receipt.tx)
  return web3.utils.toBN(receipt.receipt.cumulativeGasUsed*tx.gasPrice)
}

contract('WToken', async accounts => {

  before( async () => {

    token = await WToken.deployed()
    u.balance.register(token)
  })

  describe('Initial state', async () => {

    it ('Have 0 issued tokens', async () => {

      var totalSupply = (await token.totalSupply()).toNumber()
      assert.equal(totalSupply, 0)
    })
  })

  describe('Buying and selling', async () => {

    describe('One user cases', async () => {

      it ('can purchase', async () => {

        var txValue = 1234

        await u.balance.assertChange(
          async () => {
            await token.sendTransaction({
              from: accounts[1],
              value: txValue
            })
          }, {
            [token.address] : {
              [accounts[1]] : txValue
            },
            'eth' : {
              [accounts[1]] : -txValue,
              [token.address] : txValue
            }
          }
        )

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, txValue, "Total supply doesn't match")
      })

      it ('can purchase again', async () => {

        var prevPurchase = (await token.balanceOf(accounts[1])).toNumber()
        var txValue = 66

        await u.balance.assertChange(
          async () => {
            await token.sendTransaction({
              from: accounts[1],
              value: txValue
            })
          }, {
            [token.address] : {
              [accounts[1]] : txValue
            },
            'eth' : {
              [accounts[1]] : -txValue,
              [token.address] : txValue
            }
          }
        )

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, prevPurchase+txValue, "Total supply doesn't match")

      })

      it ('can burn', async () => {

        var prevPurchase = (await token.balanceOf(accounts[1])).toNumber()
        var burnAmt = 100

        await u.balance.assertChange(
          async () => {
            await token.burn(burnAmt, {
              from: accounts[1]
            })
          }, {
            [token.address] : {
              [accounts[1]] : -burnAmt
            },
            'eth' : {
              [accounts[1]] : burnAmt,
              [token.address] : -burnAmt
            }
          }
        )

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, prevPurchase-burnAmt, "Total supply doesn't match")

      })

    })

    describe('Two users', async () => {

      it ('second user can purchase', async () => {

        var acc1amt = (await token.balanceOf(accounts[1])).toNumber()
        var txValue = 666

        await u.balance.assertChange(
          async () => {
            await token.sendTransaction({
              from: accounts[2],
              value: txValue
            })
          }, {
            [token.address] : {
              [accounts[1]] : 0,
              [accounts[2]] : txValue
            },
            'eth' : {
              [accounts[1]] : 0,
              [accounts[2]] : -txValue,
              [token.address] : txValue
            }
          }
        )

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, acc1amt+txValue, "Total supply should not change")
      })

    })

  })

  describe('Transfers', async () => {

    it ('first user can transfer to the second', async () => {

        var transferValue = 111

        await u.balance.assertChange(
          async () => {
            await token.transfer(accounts[1], transferValue, {
              from: accounts[2]
            })
          }, {
            [token.address] : {
              [accounts[1]] : transferValue,
              [accounts[2]] : -transferValue
            }
          }
        )
      })
  })
})