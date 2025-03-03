# The Gathering Web Scraper

Help three friends, Peter, Paul, and Mary, plan their once-a-month gathering. Once a month, they gather to watch a movie and then dine at their favorite restaurant. It is quite difficult for the three friends to plan a gathering because they first have to find at least one day when everyone can find a movie and finally find a time when a table is free to book at the restaurant.

The friends have their calendars online on a website, and the cinema and restaurant they visit also have websites. The friends realize that the planning of an evening should be automated but do not know how to do it. They know that they do not need a GUI and want to run the application from a command prompt and that Peter prefers Windows, Paul prefers macOS, and Mary prefers Linux.

This web scraper scrapes and analyzes data from the mentioned websites (explicitly built for this task). Two different start URLs, <https://courselab.lnu.se/scraper-site-1> and <https://courselab.lnu.se/scraper-site-2>.

The start URL must be passed as an argument when starting the application. The URLs are each leading to three other websites. It is irrelevant how these websites work under the hood. The interesting part is how the HTML is rendered and how to make HTTP requests to retrieve data. It does not matter which URL the application starts with because the websites are nearly the same, and only the data scraped differs, and thus the suggestions the application finally lists.

## The websites

From the start URL, the application must be able to crawl all three websites on its own. Data must be scraped and analyzed, and suggestions for the day, movie, and time to book a table must be listed.

Regardless of the start URL, the HTML of each website is nearly the same. The differences exist to ensure that your scraping code is as general as possible and that as little as possible has been hard-coded. The minor differences that exist are:

- href attribute values in HTML.
- Days when the three friends are available.
- Movie titles, when they start, and if there are any places left.
- The tables the friends can book and the redirect URL when logging in.

The varying `href` attribute values verify that your scraping code does not use hard-coded URLs. URLs defined in JavaScript, as in the AJAX and cinema example, will not change. You can, in other words, hard-code these.

### The start URL

The application must start by scraping the links on the web page given by the start URL and continue.

### The calendar

The web pages are built using simple HTML, and the task is to scrape the pages and analyze which days all three friends can gather. The friends have already decided to meet on Fridays, Saturdays, and Sundays, so there is no need to look for other days (#5).

### The cinema

The cinema website is a simple website that displays the cinema's shows for the weekend. You can find out what day and time a particular movie is shown and if it is sold out. By analyzing the traffic between the client and the server, you should find a way to request this information in your application and filter out suitable movies based on scraped data from the calendars.

#### Hint

Use the browser's inspector to analyze the traffic.

### The restaurant

The third website is for the three friends' favorite restaurant (the only one they visit). The application must log in using the credentials below to scrape what times they can book a table.

|username|zeke|
|--------|----|
|password|coys|

The website uses session cookies for authorization, which the application must handle. After a successful login, the scraper can find available times.

## The workflow to automate

1. Check which day, or days, all friends are available. If it is impossible to find a day when everyone can, this must be presented in the terminal window.
2. Scrape available movies for the possible days.
3. Log in to the restaurant's website to determine when the three friends can dine. Suppose they want to book a table at least two hours after the movie starts (#6).
4. By analyzing the scraped data, it remains to put together proposals containing the day, the movie with start time, and between which times to book a table.

After cloning the repository with the application's source code and running the `npm install` command, it must be easy to lint the source code and run the application. Therefore, add the script `start` and `lint` to the "scripts" field in the `package.json` file. 

The user must pass the start URL as an argument. That is the only input the user should do during the scrape process (#2). Below is an example of how to start the scraper using <https://courselab.lnu.se/scraper-site-1> as the start URL:

```shell
npm start https://courselab.lnu.se/scraper-site-1
```


## The output

### Using the first start URL

If <https://courselab.lnu.se/scraper-site-1> is used as the start URL, the list of suggestions must be exact:

```shell
Scraping links...OK
Scraping available days...OK
Scraping showtimes...OK
Scraping possible reservations...OK

Suggestions
===========
* On Friday, "Keep Your Seats, Please" begins at 16:00, and there is a free table to book between 18:00-20:00.
* On Friday, "A Day at the Races" begins at 16:00, and there is a free table to book between 18:00-20:00.
```

### Using the second start URL

For the second URL, <https://courselab.lnu.se/scraper-site-2>, some of the data and URLs have changed. 
```shell
Scraping links...OK
Scraping available days...OK
Scraping showtimes...OK
Scraping possible reservations...OK

Suggestions
===========
* On Saturday, "Keep Your Seats, Please" begins at 18:00, and there is a free table to book between 20:00-22:00.
* On Sunday, "Keep Your Seats, Please" begins at 18:00, and there is a free table to book between 20:00-22:00.
```

