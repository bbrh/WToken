const WToken = artifacts.require('WToken')

async function txGasPrice (receipt) {
  var tx = await web3.eth.getTransaction(receipt.tx)
  return web3.utils.toBN(receipt.receipt.cumulativeGasUsed*tx.gasPrice)
}

contract('WToken', async accounts => {

  before( async () => {

    token = await WToken.deployed()
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

        var balanceBefore = await web3.eth.getBalance(accounts[1])
        var txCostWei = await txGasPrice(await token.sendTransaction({ from: accounts[1], value: txValue }))
        var balanceAfter = await web3.eth.getBalance(accounts[1])

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, txValue, "Total supply doesn't match")

        var balance = (await token.balanceOf(accounts[1])).toNumber()
        assert.equal(balance, txValue, "Token balance doesn't match")

        assert.equal(
          balanceBefore,
          web3.utils.toBN(balanceAfter)
            .add(txCostWei)
            .add(web3.utils.toBN(txValue))
            .toString(10),
          "Ether balance doesn't match"
        )
      })

      it ('can purchase again', async () => {

        var prevPurchase = (await token.balanceOf(accounts[1])).toNumber()
        var txValue = 66

        var balanceBefore = await web3.eth.getBalance(accounts[1])
        var txCostWei = await txGasPrice(await token.sendTransaction({ from: accounts[1], value: txValue }))
        var balanceAfter = await web3.eth.getBalance(accounts[1])

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, prevPurchase+txValue, "Total supply doesn't match")

        var balance = (await token.balanceOf(accounts[1])).toNumber()
        assert.equal(balance, prevPurchase+txValue, "Token balance doesn't match")

        assert.equal(
          balanceBefore,
          web3.utils.toBN(balanceAfter)
            .add(txCostWei)
            .add(web3.utils.toBN(txValue))
            .toString(10),
          "Ether balance doesn't match"
        )
      })

      it ('can burn', async () => {

        var prevPurchase = (await token.balanceOf(accounts[1])).toNumber()
        var burnAmt = 100

        var balanceBefore = await web3.eth.getBalance(accounts[1])
        var txCostWei = await txGasPrice(await token.burn(burnAmt, { from: accounts[1] }))
        var balanceAfter = await web3.eth.getBalance(accounts[1])

        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, prevPurchase-burnAmt, "Total supply doesn't match")

        var balance = (await token.balanceOf(accounts[1])).toNumber()
        assert.equal(balance, prevPurchase-burnAmt)

        assert.equal(
          balanceBefore,
          web3.utils.toBN(balanceAfter)
            .add(txCostWei)
            .sub(web3.utils.toBN(burnAmt))
            .toString(10),
          "Ether balance doesn't match"
        )
      })

    })

    describe('Two users', async () => {

      it ('second user can purchase', async () => {

        var acc1amt = (await token.balanceOf(accounts[1])).toNumber()
        var txValue = 666

        await token.sendTransaction({ from: accounts[2], value: txValue })
        var totalSupply = (await token.totalSupply()).toNumber()
        assert.equal(totalSupply, acc1amt+txValue, "Total supply should not change")

        var balance = (await token.balanceOf(accounts[1])).toNumber()
        assert.equal(balance, acc1amt, "Sender balance doesn't match")

        var balance = (await token.balanceOf(accounts[2])).toNumber()
        assert.equal(balance, txValue, "Beneficiary balance doesn't match")
      })

    })

  })

  describe('Transfers', async () => {

    it ('first user can transfer to the second', async () => {
        var acc1before = (await token.balanceOf(accounts[1])).toNumber()
        var acc2before = (await token.balanceOf(accounts[2])).toNumber()
        var transferValue = 111

        await token.transfer(accounts[1], transferValue, { from: accounts[2] })

        var balance = (await token.balanceOf(accounts[1])).toNumber()
        assert.equal(balance, acc1before+transferValue, "Beneficiary balance doesn't match")

        var balance = (await token.balanceOf(accounts[2])).toNumber()
        assert.equal(balance, acc2before-transferValue, "Sender balance doesn't match")

      })

  })
})