// ==UserScript==
// @name         Springer Professional Articles Downloader
// @namespace    abego.org
// @version      1.0
// @description  Adds a button to download all articles of a Springer Professional journal page (e.g. 'Informatik-Spektrum'). To download non-open access articles the user must be logged in. Make sure to add '.pdf' and '.jpg' to the 'Whitelisted File Extensions' list (in 'Settings').
// @author       Udo Borkowski
// @copyright    2017, abego Software GmbH, Germany (http://www.abego.org)
// @license      BSD 3-clause license
// @include      https://www.springerprofessional.de/*
// @grant        GM_info
// @grant        GM_notification
// @grant        GM_listValues
// @grant        GM_download
// ==/UserScript==
(function() {
    'use strict';

    function journalIssuePrefix(journal) {
        return journal.title + "-" + journal.issueYear + "-" + journal.issueNumber;
    }

    function articleFilename(article) {
        return journalIssuePrefix(article.journal) +
            "-art-" + ("" + article.number).padStart(2, "0") +
            " " + article.title + ". " + article.authors + ".pdf";
    }

    function coverFilename(journal) {
        return journalIssuePrefix(journal) + "-cover.jpg";
    }

    function downloadCover(journal) {

        var name = coverFilename(journal);
        var details = {
            url: journal.cover.url,
            name: name,
            saveAs: true,
            onload: function() {
                onDownloaded();
            },
            onerror: function(status) {
                console.error(status.error);
                console.error(status.details);
                onDownloaded();
            }
        };

        GM_download(details);
    }

    function downloadArticle(article) {

        var name = articleFilename(article);
        var details = {
            url: article.href,
            name: name,
            saveAs: true,
            onload: function() {
                onDownloaded();
            },
            onerror: function(status) {
                console.error(status.error);
                console.error(status.details);
                onDownloaded();
            }
        };

        GM_download(details);
    }

    function onDownloaded() {
        remaining--;
        updateProgress();
    }

    function downloadArticles(articles) {
        articles.each(function(i, e) {
            downloadArticle(e);
        });
    }

    function extractJournal() {
        var numberAndYear = $("div.dds-header__right-column span:first").text().split(/\s+/)[1].split("/");
        return {
            title: $("header.detail-content__header a:first").attr("title"),
            issueYear: numberAndYear[1],
            issueNumber: numberAndYear[0],
            cover: {
                url: $("div.cover-wrapper img").attr("src")
            }
        };
    }

    function extractArticles(journal) {
        return $("section.teaser.cf").map(function(i, e) {
            return {
                number: i + 1,
                title: $("h3", e).text(),
                authors: $("div.teaser__authors", e).text(),
                href: $("div.teaser__links a", e).attr("href"),
                link: $("div.teaser__links a", e).attr("data-track-link-actiontype"),
                journal: journal
            };
        });
    }

    function updateProgress() {
        if (remaining > 0) {
            progress.text("Downloading ... (" + remaining + " remaining)");
        } else {
            progress.text("");
        }
    }

    function quantity(n, itemLabel, itemsLabel) {
        if (!itemsLabel) {
            itemsLabel = itemLabel + "s";
        }
        return n + " " + (n == 1 ? itemLabel : itemsLabel);
    }

    var journal = extractJournal();
    var articles = extractArticles(journal).filter(function(i, e) {
        return e.href;
    });

    var progress = $("<span></span>");
    $("body").prepend(progress);

    var remaining = 0;
    updateProgress();

    if (articles && articles.length) {
        var btnTitle = "Download " + quantity(articles.length, "article") + " (and a cover image)";
        var btn = $("<button>" + btnTitle + "</button>");
        btn.click(function(e) {
            remaining = articles.length + 1;
            updateProgress();

            downloadCover(journal);
            downloadArticles(articles);
        });
        $("body").prepend(btn);
    }

})();