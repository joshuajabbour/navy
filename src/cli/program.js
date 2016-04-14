import program from 'commander'
import {NavyError} from '../errors'
import {getConfig} from '../config'

const DEFAULT_ENVIRONMENT_NAME = 'dev'

function wrapper(res) {
  if (res.catch) {
    res.catch(ex => {
      if (ex instanceof NavyError) {
        ex.prettyPrint()
      } else {
        console.error(ex.stack)
      }
    })
  }

  return res
}

function basicCliWrapper(fnName) {
  return async function (maybeServices, ...args) {
    const { getEnvironment } = require('../environment')

    const opts = args.length === 0 ? maybeServices : args[args.length - 1]
    const otherArgs = args.slice(0, args.length - 1)
    const envName = opts.environment

    const returnVal = await wrapper(getEnvironment(envName)[fnName](
      Array.isArray(maybeServices) && maybeServices.length === 0
        ? undefined
        : maybeServices,
      ...otherArgs,
    ))

    if (returnVal != null) {
      console.log(returnVal)
    }
  }
}

function lazyRequire(path) {
  return function (...args) {
    const mod = require(path)
    return wrapper((mod.default || mod)(...args))
  }
}

const defaultNavy = getConfig().defaultNavy || DEFAULT_ENVIRONMENT_NAME

program
  .command('launch [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Launches the given services in an environment')
  .action(lazyRequire('./launch'))
  .on('--help', () => console.log(`
  This will prompt you for the services that you want to bring up.
  You can optionally provide the names of services to bring up which will disable the interactive prompt.
  `))

program
  .command('destroy')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .option('-f, --force', 'don\'t prompt before removing the environment')
  .description('Destroys an environment and all related data and services')
  .action(basicCliWrapper('destroy'))
  .on('--help', () => console.log(`
  This will destroy an entire environment and all of its data and services.

  Examples:
    $ navy destroy # destroy "${defaultNavy}" environment
    $ navy destroy -e dev # destroy "dev" environment
    $ navy destroy -e test # destroy "test" environment
  `))

program
  .command('ps')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .option('--json', 'output JSON instead of a table')
  .description('Lists the running services for an environment')
  .action(lazyRequire('./ps'))

program
  .command('start [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Starts the given services')
  .action(basicCliWrapper('start'))

program
  .command('stop [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Stops the given services')
  .action(basicCliWrapper('stop'))

program
  .command('restart [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Restarts the given services')
  .action(basicCliWrapper('restart'))

program
  .command('kill [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Kills the given services')
  .action(basicCliWrapper('kill'))

program
  .command('rm [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Removes the given services')
  .action(basicCliWrapper('rm'))

program
  .command('pull [services...]')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Pulls the given services\' images from their respective registries')
  .action(basicCliWrapper('pull'))

program
  .command('port <service> <port>')
  .option('-e, --environment [env]', `set the environment name to be used [${defaultNavy}]`, defaultNavy)
  .description('Prints the external port for the given internal port of the given service')
  .action(basicCliWrapper('port'))
  .on('--help', () => console.log(`
  Examples:
    $ navy port mywebserver 80
    35821
  `))

program
  .command('status')
  .option('--json', 'output JSON instead of a table')
  .description('List all of the running navies and the status of their services')
  .action(lazyRequire('./status'))

program
  .command('set-default <navy>')
  .description('Set the default navy')
  .action(lazyRequire('./set-default'))

program
  .command('help')
  .alias('*')
  .action(() => program.help())

export default program
