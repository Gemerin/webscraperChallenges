/**
 * Application class of web scraper.
 *
 * @author Saskia Heinemann <sh224wg@student.lnu.se>
 * @version 1.1.0
 */

import { LinkScraper } from './links-scraper.js'
/**
 * The Application class is responsible for managing the scraping process.
 * It uses the LinkScraper class to extract and process data from URLs.
 */
export class Application {
  /**
   * Creates a new Application instance.
   * Initializes a new LinkScraper instance.
   */
  constructor () {
    this.LinkScraper = new LinkScraper()
  }

  /**
   * Initates scraping process and logs links to the console.
   *
   * @returns {Promise<string>} finalResult - The final result of the scraping process.
   */
  async run () {
    console.log('Scraping Links...OK')
    const dateInfo = await this.extractDates()
    if (dateInfo.length === 0) {
      return 'No Dates Available'
    }
    const cinemaInfo = await this.extractCinema(dateInfo)
    const restaurantInfo = await this.extractRestaurant(cinemaInfo, dateInfo)

    const results = []

    for (const date of dateInfo) {
      for (const cinema of cinemaInfo) {
        const movieStartTime = Number(cinema.timeOp.split(':')[0])
        const restaurantTime = restaurantInfo.filter(restaurant => {
          const restaurantStartTime = Number(restaurant.split('-')[0])
          return movieStartTime !== restaurantStartTime
        })
        for (const restaurant of restaurantTime) {
          const result = `On ${date}, "${cinema.movie}" Begins at ${cinema.timeOp}, and there is a free table between ${restaurant}`
          results.push(result)
        }
      }
    }
    const finalResult = '\nSuggestions:\n' + [...new Set(results)].join('\n')
    return finalResult
  }

  /**
   * Initiates the link scraping process by extracting links from the provided URL.
   * The URL is expected to be passed as a command-line argument.
   *
   * @returns {Promise<string[]>} links - A promise that resolves to an array of links.
   * @throws {Error} Will throw an error if the link extraction fails.
   */
  async initial () {
    try {
      const url = process.argv[2]
      const links = await this.LinkScraper.extractLinks(url)
      return links
    } catch (error) {
      console.error(`Failed to fetch links: ${error.message}`)
    }
  }

  /**
   * Extracts dates from the initial set of links.
   * It first fetches the initial links, then for each link, it extracts nested links and parses HTML dates.
   * After that, it finds the common "ok" days among all the parsed dates.
   *
   * @returns {Promise<string[]>} goodDay - A promise that resolves to an array of "ok" days.
   * @throws {Error} Will throw an error if the link extraction or HTML parsing fails.
   */
  async extractDates () {
    const links = await this.initial()
    if (!links) {
      console.error('No links fetched')
      return
    }
    const firstLink = links[0]
    // stores all days with an ok in an array
    const arrayDays = []
    try {
      const linksOnPage = await this.LinkScraper.extractLinks(firstLink)
      for (const nestedLink of linksOnPage) {
        const okDays = await this.LinkScraper.parseHtmlDates(nestedLink)
        arrayDays.push(okDays)
      }
    } catch (error) {
      console.error(`Failed to fetch links from: ${firstLink}`)
    }
    // Find the common "ok" days. Returns each ok day from okdays to create new array by filtering each array wth a boolean checking for 'day' to check which day from each array all contains ok.
    const goodDay = arrayDays.shift().filter(day => arrayDays.every(okDays => okDays.includes(day)))
    console.log('Scraping Date...OK')

    return goodDay
  }

  /**
   * Extracts cinema data for the given "good" days.
   * It first fetches the initial links, then for each "good" day, it iterates over movie dates and collects the data.
   *
   * @param {string[]} goodDays - An array of "good" days.
   * @returns {Promise<object[]>} film - A promise that resolves to an array of cinema data.
   * @throws {Error} Will throw an error if the link extraction or movie date iteration fails.
   */
  async extractCinema (goodDays) {
    const links = await this.initial()
    if (!links) {
      console.error('No links fetched')
      return
    }
    const secondLink = links[1]

    const film = []
    for (const goodDay of goodDays) {
      const dayData = await this.LinkScraper.iterateMovieDates(secondLink, goodDay)
      film.push(...dayData)
    }
    console.log('Scraping Cinema...OK')
    return film
  }

  /**
   * Extracts restaurant data based on the given cinema and date information.
   * It first fetches the initial links, then authenticates the restaurant and sorts the availability based on the cinema and date information.
   *
   * @param {object} cinemaInfo - The cinema information.
   * @param {object} dateInfo - The date information.
   * @returns {Promise<object[]>} restFree - A promise that resolves to an array of available restaurants.
   * @throws {Error} Will throw an error if the link extraction, restaurant authentication or availability sorting fails.
   */
  async extractRestaurant (cinemaInfo, dateInfo) {
    const links = await this.initial()
    if (!links) {
      console.error('No links fetched')
      return
    }
    const thirdLink = links[2]
    const restData = await this.LinkScraper.restaurantAuthentication(thirdLink)
    const restFree = await this.LinkScraper.sortAvailability(restData, cinemaInfo, dateInfo)
    console.log('Scraping Restaurant...OK')
    return restFree
  }
}
