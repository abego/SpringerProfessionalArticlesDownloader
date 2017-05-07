# Springer Professional Articles Downloader (Tampermonkey UserScript)


Adds a button to Springer Professional journal web pages to download articles (e.g. 'Informatik-Spektrum').

## Details

When you visit a Springer Professional journal page with accessible articles a "Download _N_ articles" button appears at the top left of the page. 

Click the "Download" button to download all accessible articles from that page. 

You will find the downloaded articles as PDF files in your "Downloads" folder, with file names including the name, year and issue number of the journal, as well as the title and authors of the article (e.g. `Informatik-Spektrum-2017-2-art-14 Core Competence Shift Happens. Gunter Dueck.pdf`).

## Setup

[Install](https://tampermonkey.net/faq.php?ext=dhdg#Q102) the Tampermonkey UserScript `springer_professional_articles_downloader.user.js`.

Make sure to add `.pdf` and `.jpg` to the `Whitelisted File Extensions` list on Tampermonkey's `Settings` page. 

_(When a browser does not support the `Whitelisted File Extensions` list the download will not work. E.g. when checked in May 2017 Chrome was upporting this feature but Safari did not.)_

## Download non-OPEN ACCESS articles

To download non-open access articles make sure you are logged in into your Springer Professional account and you have the permission to access the journal's articles. 



