/* eslint-env jest */
const {createProcessorExpansion} = require('../../../../src/processors/processor-expansion')
const txNodeUpgrade = require('indyscan-storage/test/resource/sample-txs/tx-config-node-upgrade')
const _ = require('lodash')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const CONFIG_LEDGER_ID = '2'

describe('config/node-upgrade transaction transformations', () => {
  it('should andd typeName and subledger for config NODE_UPGRADE transaction', async () => {
    const tx = _.cloneDeep(txNodeUpgrade)
    let transformed = await processor.transformTx(tx, 'CONFIG')
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txNodeUpgrade)) // check passed tx was not modified
    expect(transformed.txn.typeName).toBe('NODE_UPGRADE')
    expect(transformed.subledger.code).toBe(CONFIG_LEDGER_ID)
    expect(transformed.subledger.name).toBe('CONFIG')
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-11T17:06:31.000Z')
  })
})