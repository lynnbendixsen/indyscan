/* eslint-env jest */

// const createTxResolverWithError = () => {
//   let errCount = 0
//
//   return async function txResolverWithError (subledger, seqNo) {
//     return new Promise(function (resolve, reject) {
//       if (errCount === 0 && seqNo === 2) {
//         errCount++
//         reject(Error(`Simulated transaction resolution error. ErrCount:${errCount}`))
//       } else {
//         resolve({
//           network,
//           subledger,
//           txnMetadata: { seqNo }
//         })
//       }
//     })
//   }
// }

const { createWorkerRtw } = require('../../../src/workers/worker-rtw')
const { createTransformerSerializer } = require('../../../src/transformers/transformer-serializer')
const { createTargetMemory } = require('../../../src/targets/target-memory')
const { createIteratorGuided } = require('../../../src/iterators/iterator-guided')
const { createSourceMemory } = require('../../../src/sources/source-memory')
const sleep = require('sleep-promise')
const toCanonicalJson = require('canonical-json')

const TX_FORMAT_IN = 'format-foo'

let dataspace1 = {
  'domain': {
    1: { [TX_FORMAT_IN]: { 'foo': 'foo-data1' }, 'format-bar': { 'bar': 'bar-data1' } },
    2: { [TX_FORMAT_IN]: { 'foo': 'foo-data2' } },
    3: { [TX_FORMAT_IN]: { 'foo': 'foo-data3' }, 'format-bar': { 'bar': 'bar-data3' } },
    4: { [TX_FORMAT_IN]: { 'foo': 'foo-data4' } }
  },
  'pool': {
    1: { [TX_FORMAT_IN]: { 'pool': 'pooldata' } }
  },
  'config': {
    1: { 'format-config': { 'config': 'configdata' } }
  }
}

let dataspace2 = {
  domain: {},
  pool: {},
  config: {}
}

let sourceLedgerSim = createSourceMemory({ id: 'ledger-source-simulation', dataspace: dataspace1 })
let sourceDbSim = createSourceMemory({ id: 'db-source-simulation', dataspace: dataspace2 })
let targetDbSim = createTargetMemory({ id: 'db-target-simulation', dataspace: dataspace2 })
let originalSerializer = createTransformerSerializer({ id: 'serializer' })

describe('ledger tx resolution', () => {
  beforeAll(async () => {
    jest.setTimeout(1000 * 60)
  })

  it('should process 2 transaction in 500ms, then start worker again and store another 2 transactions', async () => {
    const sequentialConsumerConfig = {
      timeoutOnSuccess: 300,
      timeoutOnTxIngestionError: 6000,
      timeoutOnLedgerResolutionError: 6000,
      timeoutOnTxNoFound: 6000,
      jitterRatio: 0
    }
    let iteratorGuided = createIteratorGuided({
      id: 'test-iterator',
      source: sourceLedgerSim,
      sourceSeqNoGuidance: sourceDbSim,
      guidanceFormat: 'original'
    })
    let workerRtw = createWorkerRtw({
      id: 'test-domain',
      subledger: 'domain',
      iterator: iteratorGuided,
      iteratorTxFormat: TX_FORMAT_IN,
      transformer: originalSerializer,
      target: targetDbSim,
      timing: sequentialConsumerConfig
    })

    let txData1NotFound = await sourceDbSim.getTxData('domain', 1, 'original')
    expect(txData1NotFound).toBeUndefined()

    workerRtw.start()
    await sleep(500)
    workerRtw.stop()

    let txData1 = await sourceDbSim.getTxData('domain', 1, 'original')
    expect(toCanonicalJson(txData1)).toBe(toCanonicalJson({ serialized: JSON.stringify({ 'foo': 'foo-data1' }) }))

    let txData2 = await sourceDbSim.getTxData('domain', 2, 'original')
    expect(toCanonicalJson(txData2)).toBe(toCanonicalJson({ serialized: JSON.stringify({ 'foo': 'foo-data2' }) }))

    let txData3NotFound = await sourceDbSim.getTxData('domain', 3, 'original')
    expect(txData3NotFound).toBeUndefined()

    workerRtw.start()
    await sleep(500)
    workerRtw.stop()

    let txData3 = await sourceDbSim.getTxData('domain', 3, 'original')
    expect(toCanonicalJson(txData3)).toBe(toCanonicalJson({ serialized: JSON.stringify({ 'foo': 'foo-data3' }) }))

    let txData4 = await sourceDbSim.getTxData('domain', 4, 'original')
    expect(toCanonicalJson(txData4)).toBe(toCanonicalJson({ serialized: JSON.stringify({ 'foo': 'foo-data4' }) }))

    let txData5 = await sourceDbSim.getTxData('domain', 5, 'original')
    expect(txData5).toBeUndefined()
  })
  //
  // it('should timeout and only store 2 transactions', async () => {
  //   const timerConfig = {
  //     timeoutOnSuccess: 300,
  //     timeoutOnTxIngestionError: 500,
  //     timeoutOnLedgerResolutionError: 500,
  //     timeoutOnTxNoFound: 1000,
  //     jitterRatio: 0
  //   }
  //   const txResolveWithError = createTxResolverWithError()
  //   consumer = createConsumerSequential(txResolveWithError, storageRead, storageWrite, network, 'domain', timerConfig)
  //   consumer.start()
  //   await sleep(1000)
  //   consumer.stop()
  //   expect(await storageRead.getTxCount()).toBe(2)
  // })
})