# database schema design

## key innovation: jsonb metadata + data split

### the problem

airtable lets users create columns on the fly. traditional sql = rigid schema. can't add columns without migrations.

### the solution

- **columns table** = metadata (name, type, order)
- **rows table** = jsonb data field (flexible key-value)
- column IDs are keys in the jsonb object

### example

// columns table
{ id: "col-1", name: "Name", type: "text", tableId: "table-1" }
{ id: "col-2", name: "Status", type: "text", tableId: "table-1" }

// rows table
{ id: "row-1", tableId: "table-1", data: {
"col-1": "Anna Stracke PhD",
"col-2": "Done"
}}**magic:** add a column = insert metadata. no schema change needed. existing rows keep working.

---

## entity structure

users (nextauth)
└── bases (workspace containers)
└── tables (like sheets)
├── columns (metadata: name, type, order)
├── rows (data: jsonb object)
└── views (saved filters/sorts - futuret" | "number")

- belongs to table
- cascade delete when table deleted

### rows

- belongs to table
- **data field = jsonb** ← the magic
- keys = column IDs, values = cell data
- `order` field for position
- cascade delete when table deleted

### views

- saved configurations (filters, sorts, hidden columns)
- belongs to table

---

## performance considerations

### indexes

// rows table
index("row_table_id_idx").on(t.tableId) // filter by table
index("row_order_idx").on(t.order) // sort rows
index("row_data_gin_idx").on(t.data) // jsonb search (GIN)**gin index on jsonb:** allows fast search across all cell values

### why this scales

- jsonb is optimised in postgres (binary format, indexed)
- no joins needed to read rows (data is denormalised)
- adding columns = metadata insert (no data migration)
- queries use column IDs (stable, never change)
