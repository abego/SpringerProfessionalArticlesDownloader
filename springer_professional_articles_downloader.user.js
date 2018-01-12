/**
[The "BSD 3-clause license"]
Copyright (c) 2017, abego Software GmbH, Germany (http://www.abego.org)
All rights reserved.

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, 
   this list of conditions and the following disclaimer.
   
2. Redistributions in binary form must reproduce the above copyright notice, 
   this list of conditions and the following disclaimer in the documentation 
   and/or other materials provided with the distribution.
   
3. Neither the name of the abego Software GmbH nor the names of its 
   contributors may be used to endorse or promote products derived from this 
   software without specific prior written permission.
   
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
POSSIBILITY OF SUCH DAMAGE.
**/
// ==UserScript==
// @id           SpringerProfessionalArticlesDownloader
// @name         Springer Professional Articles Downloader
// @namespace    https://github.com/abego/SpringerProfessionalArticlesDownloader
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

    var selector_Ausgabe_nn_yyyy = "article > header > h2";
    var selector_JournalTitle = "h1";
    var selector_CoverImg = "article > header > img";

    function journalIssuePrefix(journal) {
        return journal.title + "-" + journal.issueYear + "-" + journal.issueNumber;
    }

    function articleFilename(article) {
        return asFilename(journalIssuePrefix(article.journal) +
            "-art-" + ("" + article.number).padStart(2, "0") +
            " " + article.title + ". " + article.authors + ".pdf");
    }

    function coverFilename(journal) {
        return asFilename(journalIssuePrefix(journal) + "-cover.jpg");
    }

    function downloadCover(journal) {

        var name = coverFilename(journal);
        var details = {
            url: journal.cover.url,
            name: name,
            saveAs: false,
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
            saveAs: false,
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
        var numberAndYear = $(selector_Ausgabe_nn_yyyy).text().split(/\s+/)[1].split("/");
        return {
            title: $(selector_JournalTitle).text(),
            issueYear: numberAndYear[1],
            issueNumber: numberAndYear[0],
            cover: {
                url: $(selector_CoverImg).attr("src")
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

    function asFilename(s) {
        // replace characters that must not be part of a filename by a space
        return s.replace(/[:\?\/\\]/g," ");
    }

    function quantity(n, itemLabel, itemsLabel) {
        if (!itemsLabel) {
            itemsLabel = itemLabel + "s";
        }
        return n + " " + (n == 1 ? itemLabel : itemsLabel);
    }

    // ----------------------------------------------------------------

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
