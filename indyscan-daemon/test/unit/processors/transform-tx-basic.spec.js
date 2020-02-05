/* eslint-env jest */
const { createProcessorExpansion } = require('../../../src/processors/processor-expansion')
const txAttribRoleSteward = require('indyscan-storage/test/resource/sample-txs/tx-domain-attrib-role-steward')
const _ = require('lodash')

let processor = createProcessorExpansion({id:'foo', sourceLookups: undefined})

const DOMAIN_LEDGER_ID = '1'

describe('common transformations', () => {
  it('should not modify original argument object', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
  })

  it('should set typeName', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    let transformed = await processor.transformTx(tx)
    expect(JSON.stringify(tx)).toBe(JSON.stringify(txAttribRoleSteward))
    expect(transformed.txn.typeName).toBe('ATTRIB')
  })

  it('should convert txnMetadata.txnTime to ISO8601', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    let transformed = await processor.transformTx(tx)
    expect(transformed.txnMetadata.txnTime).toBe('2019-11-27T15:34:07.000Z')
  })

  it('should set subledger.code and subledger.name', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    let transformed = await processor.transformTx(tx)
    expect(transformed.subledger.code).toBe(DOMAIN_LEDGER_ID)
    expect(transformed.subledger.name).toBe('DOMAIN')
  })

  it('should have added root meta field', async () => {
    const tx = _.cloneDeep(txAttribRoleSteward)
    let transformed = await processor.transformTx(tx)
    expect(transformed.meta).toBeDefined()
  })

  it('should throw if tx argument is undefined', async () => {
    let threw
    try {
      await processor.transformTx(undefined)
    } catch (err) {
      threw = true
    }
    expect(threw).toBeTruthy()
  })

  it('should throw if tx argument is null', async () => {
    let threw
    try {
      await processor.transformTx(null)
    } catch (err) {
      threw = true
    }
    expect(threw).toBeTruthy()
  })

  it('should throw if tx argument is empty object', async () => {
    let threw
    try {
      await processor.transformTx({})
    } catch (err) {
      threw = true
    }
    expect(threw).toBeTruthy()
  })
})