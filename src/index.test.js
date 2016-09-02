/* eslint global-require:0, import/newline-after-import:0 */
const originalPlatform = process.platform
const originalKill = process.kill

describe('crossSpawnWithKill', () => {

  let crossSpawnWithKill

  beforeEach(() => {
    jest.mock('cross-spawn', () => jest.fn(() => ({pid: 32})))
    crossSpawnWithKill = require('./')
  })

  it('can be killed', () => {
    const child = crossSpawnWithKill('cmd', ['arg1'], {options: 1})
    const crossSpawn = require('cross-spawn')
    expect(crossSpawn).toBeCalledWith('cmd', ['arg1'], {options: 1})
    expect(typeof child.kill).toBe('function')
  })

  it('has a win32 kill function when the platform is win32', () => {
    process.platform = 'win32'
    jest.resetModules() // so the new platform is picked up
    const child = require('./')('cmd', ['arg1'])
    const crossSpawn = require('cross-spawn')
    crossSpawn.mockClear()
    child.kill()

    expect(crossSpawn).toBeCalled()
    expect(crossSpawn).toBeCalledWith('taskkill', ['/F', '/T', '/PID', 32])
  })

  it('has a posix kill function when the platform is not win32', () => {
    process.platform = 'ducks'
    process.kill = jest.fn(pid => {
      if (pid === 13) {
        throw new Error('just cause')
      }
    })
    jest.mock('ps-tree', () => jest.fn((pid, cb) => {
      cb(null, [{PID: 12}, {PID: 13}])
    }))
    jest.resetModules() // so the new platform is picked up
    const child = require('./')('cmd', ['arg1'])
    const psTreeMock = require('ps-tree')
    child.kill()

    expect(psTreeMock).toBeCalled()
    expect(psTreeMock.mock.calls.length).toBe(1)
    const [firstPsArg, secondPsArg] = psTreeMock.mock.calls[0]
    expect(firstPsArg).toBe(32)
    expect(typeof secondPsArg).toBe('function')
    expect(process.kill).toBeCalled()
    expect(process.kill.mock.calls.length).toBe(2)
    expect(process.kill).toBeCalledWith(12)
    expect(process.kill).toBeCalledWith(13)
  })

  it('ignores errors from ps-tree', () => {
    process.platform = 'ducks'
    process.kill = jest.fn()
    jest.mock('ps-tree', () => jest.fn((pid, cb) => {
      cb(new Error('I am an error'))
    }))
    jest.resetModules() // so the new platform is picked up
    const child = require('./')('cmd', ['arg1'])
    child.kill()

    expect(process.kill.mock.calls.length).toBe(0)
  })

  afterEach(() => {
    jest.resetModules()
    process.platform = originalPlatform
    process.kill = originalKill
  })
})
