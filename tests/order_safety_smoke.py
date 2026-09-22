import copy
import importlib.util
import re
from importlib.machinery import SourceFileLoader
from pathlib import Path


source_path = Path(__file__).resolve().parents[1] / "main.py"
spec = importlib.util.spec_from_loader(
    "order_safety_main",
    SourceFileLoader("order_safety_main", str(source_path)),
)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


class GspreadUtils:
    @staticmethod
    def rowcol_to_a1(row, col):
        letters = ""
        while col:
            col, remainder = divmod(col - 1, 26)
            letters = chr(65 + remainder) + letters
        return f"{letters}{row}"


class GspreadStub:
    utils = GspreadUtils()


if module.gspread is None:
    module.gspread = GspreadStub()


class Cell:
    def __init__(self, value):
        self.value = value


class FakeWorksheet:
    title = module.ORDERS_SHEET_NAME
    id = 991

    def __init__(self, rows, cell_override=None):
        self.rows = copy.deepcopy(rows)
        self.cell_override = cell_override
        self.updates = []

    def get_all_values(self):
        return copy.deepcopy(self.rows)

    def cell(self, row, col):
        if self.cell_override is not None:
            return Cell(self.cell_override)
        return Cell(self.rows[row - 1][col - 1])

    def update(self, range_name, values, value_input_option="RAW"):
        self.updates.append((range_name, copy.deepcopy(values), value_input_option))
        match = re.match(r"A(\d+):[A-Z]+\d+", range_name)
        assert match
        self.rows[int(match.group(1)) - 1] = copy.deepcopy(values[0])


def order(order_id, name, update_at="", update_by=""):
    row = {header: "" for header in module.ORDER_HEADERS}
    row.update({"id": order_id, "tenKhach": name, "updateAt": update_at, "updateBy": update_by})
    return row


def values(*orders):
    return [module.ORDER_HEADERS] + [
        [item.get(header, "") for header in module.ORDER_HEADERS] for item in orders
    ]


history = []
module.append_order_history_snapshots = lambda snapshots: history.extend(
    (row["id"], row["tenKhach"], kind, source, actor)
    for row, kind, source, actor in snapshots
)
module.invalidate_worksheet_cache = lambda worksheet: None

# A stale caller row number must not matter: the function resolves the live ID.
ws = FakeWorksheet(values(order("DH-A", "A"), order("DH-B", "B")))
updated = order("DH-B", "B updated", "v1", "tester")
module.update_order_row_safely(ws, updated)
assert ws.rows[1][module.ORDER_HEADERS.index("id")] == "DH-A"
assert ws.rows[1][module.ORDER_HEADERS.index("tenKhach")] == "A"
assert ws.rows[2][module.ORDER_HEADERS.index("id")] == "DH-B"
assert ws.rows[2][module.ORDER_HEADERS.index("tenKhach")] == "B updated"
assert [item[2] for item in history] == ["before_update", "intended_update"]

# Duplicate IDs must block all writes.
duplicate_ws = FakeWorksheet(values(order("DH-X", "X1"), order("DH-X", "X2")))
try:
    module.update_order_row_safely(duplicate_ws, order("DH-X", "changed", "v1", "tester"))
except module.HTTPException as exc:
    assert exc.status_code == 409
else:
    raise AssertionError("Duplicate IDs were not blocked")
assert duplicate_ws.updates == []

# A concurrent version change must block the stale writer.
concurrent_ws = FakeWorksheet(values(order("DH-C", "C", "server-v1", "first")))
try:
    module.update_order_row_safely(
        concurrent_ws,
        order("DH-C", "stale update", "client-v0\nclient-v2", "first\nsecond"),
    )
except module.HTTPException as exc:
    assert exc.status_code == 409
else:
    raise AssertionError("Concurrent update was not blocked")
assert concurrent_ws.updates == []

# If a row moves between lookup and final verification, no write is allowed.
moved_ws = FakeWorksheet(values(order("DH-M", "M")), cell_override="DH-OTHER")
try:
    module.update_order_row_safely(moved_ws, order("DH-M", "changed", "v1", "tester"))
except module.HTTPException as exc:
    assert exc.status_code == 409
else:
    raise AssertionError("Moved row was not blocked")
assert moved_ws.updates == []

print("ORDER_SAFETY_SMOKE_OK")
