# lyrairtable clone

building lyra airtable clone as part of my take home assessment with lyra

## req

- 1:1 UI with airtable
- able to log in via google and create bases
- in each base, able to create tables
- able to dynamically add columns
- text and number (fine for now)
- editing cells, navigable with arrow keys + tab key
- creating table will show default rows + columns
- ability to see table iwth 100k rows and scroll **WITHOUT LAG**
  - button to add 100k rows to table
  - virtualised infinite scroll using tRPC's hooks + tanstack virtualiser
- ability to search across all cells (filter for rows)
- able to create a 'view' of a table and save following configurations:
  - filter columns: for both numbers (greater than, smaller than) adn text (not empty, is empty, contains, not contains, equal to)
  - simple sorting on columns: text A->Z, Z->A
  - for numbers, decreasing or increasing
  - search, filter, sort have to be done on db level
  - can search through and hide/show columns
- make sure theres a loading state
- ultimate goal: if there are **1m rows**, can still **load without issue**!

## tech stack

t3 stack

- next app router
- tailwind
- trpc
- drizzle
- postgres neon
- tanstack
- fakerjs
