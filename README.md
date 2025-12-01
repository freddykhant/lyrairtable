# lyrairtable clone

building lyra airtable clone as part of my take home assessment with lyra

## req

[ ] 1:1 UI with airtable
[x] able to log in via google and create bases
[x] in each base, able to create tables
[x] able to dynamically add columns
[x] text and number (fine for now)
[x] editing cells, navigable with arrow keys + tab key
[x] creating table will show default rows + columns
[x] ability to see table w/ 100k rows and scroll **WITHOUT LAG**
[x] button to add 100k rows to table
[x] virtualised infinite scroll using tRPC's hooks + tanstack virtualiser
[x] ability to search across all cells (filter for rows)
[ ] able to create a 'view' of a table and save following configurations:
[ ] filter columns: for both numbers (greater than, smaller than) adn text (not empty, is empty, contains, not contains, equal to)
[ ] simple sorting on columns: text A[ ]>Z, Z[ ]>A
[ ] for numbers, decreasing or increasing
[ ] search, filter, sort have to be done on db level
[ ] can search through and hide/show columns
[ ] make sure theres a loading state
[ ] ultimate goal: if there are **1m rows**, can still **load without issue**!

## tech stack

t3 stack

- next app router
- next auth (google)
- tailwind
- trpc
- drizzle
- postgres neon
- tanstack table
- tan stack virtualizer
- fakerjs
