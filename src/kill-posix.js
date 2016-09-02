const getDescendentProcessInfo = require('ps-tree')

module.exports = killPosix

/**
 * Kills the new process and its sub processes.
 * @this ChildProcess
 * @returns {void}
 */
function killPosix() {
  getDescendentProcessInfo(this.pid, (err, descendent) => {
    if (err) {
      return
    }

    descendent.forEach(({PID: pid}) => {
      try {
        process.kill(pid)
      } catch (_err) {
        // ignore.
      }
    })
  })
}
