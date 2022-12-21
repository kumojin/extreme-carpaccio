--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Seller
(
    name         TEXT PRIMARY KEY,
    password     TEXT,
    url          TEXT NOT NULL,
    cash         INT  NOT NULL,
    online       INT  NOT NULL,
    -- Saved as JSON
    cash_history TEXT NOT NULL
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Seller;
