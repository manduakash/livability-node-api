"""
One-off generator: parses the legacy `libility.sql` dump and emits a
Drizzle ORM (mysql-core) schema file (src/db/schema.js).

Usage:
    python3 scripts/gen_schema.py /path/to/libility.sql > src/db/schema.js
"""
import re
import sys
import keyword


def camel(name: str) -> str:
    parts = re.split(r"[_\s]+", name.strip("`"))
    out = parts[0].lower()
    for p in parts[1:]:
        if not p:
            continue
        out += p[0].upper() + p[1:].lower()
    return out


def js_ident(name: str) -> str:
    ident = camel(name)
    if not ident:
        ident = "col"
    if ident[0].isdigit():
        ident = "_" + ident
    return ident


TYPE_MAP = {
    "int": "int",
    "tinyint": "tinyint",
    "smallint": "smallint",
    "mediumint": "mediumint",
    "bigint": "bigint",
    "float": "float",
    "double": "double",
    "decimal": "decimal",
    "varchar": "varchar",
    "char": "char",
    "text": "text",
    "mediumtext": "text",
    "longtext": "text",
    "tinytext": "text",
    "date": "date",
    "datetime": "datetime",
    "timestamp": "timestamp",
    "time": "time",
    "json": "json",
    "blob": "binary",
}


def parse_column(line: str):
    line = line.strip().rstrip(",")
    if not line.startswith("`"):
        return None  # constraints (PRIMARY KEY, KEY, UNIQUE KEY...) handled separately

    m = re.match(r"`(?P<name>[^`]+)`\s+(?P<type>\w+)(\((?P<args>[^)]*)\))?(?P<rest>.*)", line, re.S)
    if not m:
        return None

    name = m.group("name")
    sqltype = m.group("type").lower()
    args = m.group("args")
    rest = m.group("rest") or ""

    drizzle_fn = TYPE_MAP.get(sqltype, "text")

    options = {}
    call_args = []

    if drizzle_fn in ("varchar", "char"):
        length = args.split(",")[0].strip() if args else "255"
        call_args.append(f"{{ length: {length} }}")
    elif drizzle_fn == "decimal" and args:
        precision, scale = [a.strip() for a in args.split(",")]
        call_args.append(f"{{ precision: {precision}, scale: {scale} }}")
    elif drizzle_fn == "bigint":
        opts = ['mode: "number"']
        if "unsigned" in rest.lower():
            opts.append("unsigned: true")
        call_args.append("{ " + ", ".join(opts) + " }")
    elif drizzle_fn in ("int", "tinyint", "smallint", "mediumint"):
        if "unsigned" in rest.lower():
            call_args.append("{ unsigned: true }")

    not_null = "NOT NULL" in rest.upper()
    auto_increment = "AUTO_INCREMENT" in rest.upper()

    default_match = re.search(r"DEFAULT\s+(.+?)(\s+ON\s+UPDATE|$)", rest, re.I)
    default_expr = None
    on_update_now = "ON UPDATE CURRENT_TIMESTAMP" in rest.upper()

    if default_match:
        raw_default = default_match.group(1).strip().strip("'")
        if raw_default.upper() == "CURRENT_TIMESTAMP":
            default_expr = "now"
        elif raw_default.upper() == "NULL":
            default_expr = None
        elif drizzle_fn in ("int", "bigint", "tinyint", "smallint", "mediumint", "float", "double", "decimal"):
            default_expr = ("number", raw_default)
        else:
            default_expr = ("string", raw_default)

    return {
        "name": name,
        "ident": js_ident(name),
        "drizzle_fn": drizzle_fn,
        "call_args": call_args,
        "not_null": not_null,
        "auto_increment": auto_increment,
        "default_expr": default_expr,
        "on_update_now": on_update_now,
    }


def parse_table(body: str):
    columns = []
    primary_key = None
    unique_keys = []

    for raw_line in body.splitlines():
        line = raw_line.strip().rstrip(",")
        if not line:
            continue
        if line.startswith("`"):
            col = parse_column(line)
            if col:
                columns.append(col)
        elif line.upper().startswith("PRIMARY KEY"):
            m = re.search(r"\((.*)\)", line)
            if m:
                primary_key = [c.strip("` ") for c in m.group(1).split(",")]
        elif line.upper().startswith("UNIQUE KEY"):
            m = re.search(r"\((.*)\)", line)
            if m:
                unique_keys.append([c.strip("` ") for c in m.group(1).split(",")])

    return columns, primary_key, unique_keys


def render_column(col, primary_key, unique_keys, table_name):
    fn = col["drizzle_fn"]
    args = list(col["call_args"])
    chain = [f'mysqlTable_{fn}("{col["name"]}"' + (", " + args[0] if args else "") + ")"]
    # placeholder replaced below
    expr = f'{fn}("{col["name"]}"' + (", " + args[0] if args else "") + ")"

    is_pk = primary_key == [col["name"]]

    if is_pk:
        expr += ".primaryKey()"
        if col["auto_increment"]:
            expr += ".autoincrement()"

    if col["not_null"] and not is_pk:
        expr += ".notNull()"

    default_expr = col["default_expr"]
    if default_expr == "now":
        expr += ".defaultNow()"
    elif isinstance(default_expr, tuple):
        kind, val = default_expr
        if kind == "number":
            expr += f".default({val})"
        else:
            safe_val = val.replace('"', '\\"')
            expr += f'.default("{safe_val}")'

    if col["on_update_now"]:
        expr += ".onUpdateNow()"

    for uk in unique_keys:
        if uk == [col["name"]]:
            expr += ".unique()"

    return f'  {col["ident"]}: {expr},'


def main():
    sql_path = sys.argv[1]
    content = open(sql_path, encoding="utf-8", errors="replace").read()

    table_blocks = re.findall(
        r"CREATE TABLE `(\w+)` \((.*?)\n\)\s*ENGINE=.*?;",
        content,
        re.S,
    )

    used_fns = set()
    out_tables = []

    for table_name, body in table_blocks:
        columns, primary_key, unique_keys = parse_table(body)
        ident = js_ident(table_name)
        const_name = ident
        lines = [f'export const {const_name} = mysqlTable("{table_name}", {{']
        for col in columns:
            used_fns.add(col["drizzle_fn"])
            lines.append(render_column(col, primary_key, unique_keys, table_name))
        lines.append("});")
        out_tables.append("\n".join(lines))

    used_fns.discard(None)
    imports = sorted(used_fns | {"mysqlTable"})

    print('import {')
    for i, fn in enumerate(imports):
        comma = "," if i < len(imports) - 1 else ""
        print(f"  {fn}{comma}")
    print('} from "drizzle-orm/mysql-core";')
    print()
    print("// ---------------------------------------------------------------------------")
    print("// AUTO-GENERATED from libility.sql - do not hand edit table-by-table.")
    print("// Re-run `node scripts/gen-schema` (or the python generator) if the dump changes.")
    print("// ---------------------------------------------------------------------------")
    print()
    for block in out_tables:
        print(block)
        print()


if __name__ == "__main__":
    main()
