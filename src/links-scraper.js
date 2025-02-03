/**
 * The LinkScraper class.
 *
 * @author Saskia Heinemann <sh224wg@student.lnu.se>
 * @version 1.1.0
 */
/**
 * Encapulates the logic for extracting links from a URL (linkscraper)
 */
import { JSDOM } from 'jsdom'

/**
 *
 */
export class LinkScraper {
  /**
   * Extracts all unique links from the given URL.
   * It fetches the HTML from the URL, parses it into a DOM structure, and then selects all 'a' elements with href attributes.
   * It converts relative URLs to absolute, sorts the URLs in ascending order, and removes duplicates.
   *
   * @param {string} url - The URL to extract links from.
   * @returns {Promise<string[]>} links - A promise that resolves to an array of unique links.
   * @throws {Error} Will throw an error if the fetch operation or HTML parsing fails.
   */
  async extractLinks (url) {
    const response = await fetch(url)
    const text = await response.text()
    const dom = new JSDOM(text, { url })
    const baseUrl = dom.window.location.href

    const links = Array.from(dom.window.document.querySelectorAll('a[href^="http://"], a[href^="https://"], a[href^="./"]'))
      .map(anchorElement => {
        let href = anchorElement.href
        if (href.startsWith('./')) {
          // if relative URL convert to absolute
          href = new URL(href, baseUrl).href
        }
        return href
      })
      .sort()
    return [...new Set(links)]
  }

  /**
   * Fetches data from the given URL and returns the response body as text.
   * It sends a network request to the provided URL and waits for the promise returned by fetch to resolve.
   * Then, it returns a promise that resolves with the response body as a string.
   *
   * @param {string} url - The URL to fetch data from.
   * @returns {Promise<string>} - A promise that resolves with the response body as a string.
   * @throws {Error} Will throw an error if the fetch operation fails.
   */
  async fetchText (url) {
    const response = await fetch(url)
    return await response.text()
  }

  /**
   * Parses HTML dates from the given URL.
   * It fetches the HTML content from the URL, parses it into a DOM structure, and then selects all 'th' and 'td' elements.
   * It creates a new array containing the text content from each element.
   * Then, it loops over 'th' and 'td' elements and if 'td' is 'ok', it adds the corresponding day to the array.
   *
   * @param {string} url - The URL to parse HTML dates from.
   * @returns {Promise<string[]>} okDays - A promise that resolves to an array of "ok" days.
   * @throws {Error} Will throw an error if the fetch operation or HTML parsing fails.
   */
  async parseHtmlDates (url) {
    const htmlContent = await this.fetchText(url)
    const dom = new JSDOM(htmlContent)
    const thElements = [...dom.window.document.querySelectorAll('th')].map(th => th.textContent)
    const tdElements = [...dom.window.document.querySelectorAll('td')].map(td => td.textContent)

    const okDays = []
    for (let i = 0; i < thElements.length; i++) {
      if (tdElements[i].toLowerCase() === 'ok') {
        okDays.push(thElements[i])
      }
    }
    return okDays
  }

  /**
   * Iterates over movie dates for a given day and link.
   * It fetches the HTML content from the link, parses it into a DOM structure, and then selects movie and day options.
   * It finds the option for the given "good" day and if it exists, it iterates over movie options, fetches content for each movie, filters out unavailable times, and collects the movie title and times.
   *
   * @param {string} secondLink - The link to fetch movie and day options from.
   * @param {string} goodDay - The day to find movie times for.
   * @returns {Promise<object[]>} data - A promise that resolves to an array of movie times and titles for the given day.
   * @throws {Error} Will throw an error if the fetch operation, HTML parsing, or content fetching fails.
   */
  async iterateMovieDates (secondLink, goodDay) {
    const data = []

    const htmlMovie = await this.fetchText(secondLink)
    const dom = new JSDOM(htmlMovie)

    const movies = dom.window.document.getElementById('movie')
    const options = Array.from(movies.options).map(option => ({ value: option.value, text: option.textContent }))

    const days = dom.window.document.getElementById('day')
    const dayOp = Array.from(days.options).map(option => ({ value: option.value, text: option.textContent }))
    const goodDayOption = dayOp.find(option => option.text === goodDay)
    if (!goodDayOption) {
      console.error('No dates available')
      return []
    }

    const goodDayNr = Number(goodDayOption.value)
    const dayString = goodDayNr.toString().padStart(2, '0')

    for (let movie = 1; movie < options.length; movie++) {
      const movieString = movie.toString().padStart(2, '0')

      const content = await this.getCheckUrl(secondLink, dayString, movieString)

      const removeZero = content.filter(num => num.status !== 0)

      const times = removeZero.map(item => item.time)

      const movieTitleOption = options.find(option => option.value === movieString)
      const movieTitle = movieTitleOption ? movieTitleOption.text : undefined

      const movieTimes = times.map(time => ({ timeOp: time, movie: movieTitle }))
      data.push(...movieTimes)
    }
    return data
  }

  /**
   * Constructs a URL with the given parameters and fetches data from it.
   * It constructs a URL with the given link, day, and movie parameters, then fetches the content from the URL and parses it as JSON.
   *
   * @param {string} secondLink - The base link to construct the URL from.
   * @param {string} day - The day parameter to include in the URL.
   * @param {string} movie - The movie parameter to include in the URL.
   * @returns {Promise<object>} data - A promise that resolves to the parsed JSON data from the URL.
   * @throws {Error} Will throw an error if the fetch operation or JSON parsing fails.   '
   */
  async getCheckUrl (secondLink, day, movie) {
    const url = `${secondLink}/check?day=${day}&movie=${movie}`
    const response = await fetch(url)
    const data = await response.json()

    return data
  }

  /**
   * Authenticates with a restaurant by sending a POST request with a username and password.
   * It constructs a login URL from the given link, sends a POST request with a predefined username and password, and follows the redirect response.
   * It then fetches the content from the redirect URL and parses it as text.
   *
   * @param {string} thirdLink - The base link to construct the login URL from.
   * @returns {Promise<string>} data - A promise that resolves to the parsed text data from the redirect URL.
   * @throws {Error} Will throw an error if the fetch operation, redirect follow, or text parsing fails.
   */
  async restaurantAuthentication (thirdLink) {
    const loginUrl = `${thirdLink}/login`

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'zeke',
        password: 'coys'
      }),
      redirect: 'manual'
    })
    const cookie = response.headers.get('set-cookie')
    const redirectUrl = `${thirdLink}${response.headers.get('location')}`

    const redirectResponse = await fetch(redirectUrl, {
      headers: {
        Cookie: cookie
      }
    })
    const data = await redirectResponse.text()

    return data
  }

  /**
   * Sorts availability of restaurant reservations based on cinema times.
   * It parses the restaurant availability HTML, filters available times, and matches them with cinema times.
   * It then creates a reservation time range for each matching cinema time.
   *
   * @param {string} restFree - The HTML string of restaurant availability.
   * @param {object[]} cinemaInfo - The array of cinema information objects, each containing a 'timeOp' property with the cinema time.
   * @param {string[]} dateInfo - The array of date strings.
   * @returns {Promise<string[]>} reservation - A promise that resolves to an array of reservation time ranges.
   * @throws {Error} Will throw an error if the HTML parsing or time matching fails.
   */
  async sortAvailability (restFree, cinemaInfo, dateInfo) {
    const dom = new JSDOM(restFree)
    const inputElements = [...dom.window.document.querySelectorAll('input[name="group1"]')].map(item => item.value)
    dateInfo = dateInfo.map(day => day.toLowerCase())
    // filter dateinfo with available times for day overlap
    const filterDays = inputElements.filter(input => {
      const firstThree = input.slice(0, 3)
      return dateInfo.some(day => day.startsWith(firstThree))
    })
    const reservation = []
    for (const film of cinemaInfo) {
      const hour = parseInt(film.timeOp.split(':')[0])
      const hourTwo = hour + 2

      // get reservation time out of reservation
      const filteredTimes = filterDays.filter(timeSlot => {
        const timeStart = parseInt(timeSlot.slice(3, 5))
        return timeStart === hourTwo
      })
      // create end and start time
      const resTime = filteredTimes.map(timeSlot => {
        const timeStart = parseInt(timeSlot.slice(3, 5))
        const timeEnd = parseInt(timeSlot.slice(5))
        return `${timeStart}-${timeEnd}`
      })
      reservation.push(...resTime)
    }
    return reservation
  }
}
