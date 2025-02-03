/**
 * Entry point for the application.
 *
 * This script imports the Application class from './application.js', creates a new instance of it with the command-line arguments (skipping the first two), and runs it.
 * If any errors occur during the execution of the application, they are logged to the console and the process exits with a status code of 1.
 *
 * @module app
 */
import { Application } from './application.js'

(async () => {
  try {
  // Parse the command-line (skip the first two arguments).
    const [, , ...urls] = process.argv

    const app = new Application(urls)

    console.log(await app.run())
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
