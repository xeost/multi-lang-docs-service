-- Migration number: 0001 	 2025-02-26T21:50:21.687Z
-- Create the initial documents table
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lang TEXT NOT NULL,
  content TEXT NOT NULL
);