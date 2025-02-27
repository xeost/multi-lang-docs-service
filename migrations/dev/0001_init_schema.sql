-- Migration number: 0001 	 2025-02-26T21:50:21.687Z
CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    token TEXT UNIQUE NOT NULL
);

CREATE TABLE Websites (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    check_interval TEXT
);

CREATE TABLE Translations (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    language TEXT NOT NULL,
    formality TEXT,
    custom_terms TEXT,
    repo_url TEXT,
    FOREIGN KEY (website_id) REFERENCES Websites(id)
);

CREATE TABLE Articles (
    id TEXT PRIMARY KEY,
    website_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (website_id) REFERENCES Websites(id)
);

CREATE TABLE AffiliatePrograms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    details TEXT
);

CREATE TABLE ArticleAffiliatePrograms (
    article_id TEXT NOT NULL,
    affiliate_program_id TEXT NOT NULL,
    PRIMARY KEY (article_id, affiliate_program_id),
    FOREIGN KEY (article_id) REFERENCES Articles(id),
    FOREIGN KEY (affiliate_program_id) REFERENCES AffiliatePrograms(id)
);