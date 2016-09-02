const crossSpawn = require('cross-spawn')

module.exports = killWin32

/**
 * Kills the new process and its sub processes forcibly.
 * @this ChildProcess
 * @returns {void}
 */
function killWin32() {
  crossSpawn('taskkill', ['/F', '/T', '/PID', this.pid])
}
