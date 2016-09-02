const crossSpawn = require('cross-spawn')

const kill = require(
  process.platform === 'win32' ? './kill-win32' : './kill-posix'
)

module.exports = crossSpawnWithKill

/**
 * Launches a new process with the given command.
 * This is almost same as `child_process.spawn`.
 *
 * This returns a `ChildProcess` instance.
 * `kill` method of the instance kills the new process and its sub processes.
 *
 * @param {string} command - The command to run.
 * @param {string[]} args - List of string arguments.
 * @param {object} options - Options.
 * @returns {ChildProcess} A ChildProcess instance of new process.
 * @private
 */
function crossSpawnWithKill(...args) {
  const child = crossSpawn(...args)
  child.kill = kill.bind(child)
  return child
}
