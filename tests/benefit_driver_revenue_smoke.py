import importlib.util
from importlib.machinery import SourceFileLoader
from pathlib import Path


source_path = Path(__file__).resolve().parents[1] / "main.py"
spec = importlib.util.spec_from_loader(
    "benefit_driver_revenue_main",
    SourceFileLoader("benefit_driver_revenue_main", str(source_path)),
)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)


# Mặc định cũ: ưu đãi vẫn trừ khỏi doanh thu của lái xe.
assert module.driver_revenue_amount(1_000_000, 50_000, 100_000, 0, 20_000) == 870_000

# Khi được tick, đúng phần ưu đãi đã giảm được cộng lại vào doanh thu lái xe.
assert module.driver_revenue_amount(1_000_000, 50_000, 100_000, 0, 20_000, 100_000) == 970_000
assert module.benefit_counts_for_driver_revenue({"tinhDoanhThuLaiXe": "Có"})
assert not module.benefit_counts_for_driver_revenue({"tinhDoanhThuLaiXe": ""})


voucher = {
    "id": "VC-1",
    "maVoucher": "DX-TEST",
    "tenVoucher": "Voucher tính doanh thu",
    "loaiGiaTri": "fixed",
    "giaTri": 100_000,
    "trangThai": "Đang áp dụng",
    "tinhDoanhThuLaiXe": "Có",
}
promotion = {
    "id": "KM-1",
    "tenChuongTrinh": "Khuyến mãi không tính doanh thu",
    "loaiGiaTri": "fixed",
    "giaTri": 50_000,
    "trangThai": "Đang áp dụng",
    "tinhDoanhThuLaiXe": "Không",
}
rows, total_discount, _, _ = module.build_benefit_rows(
    order_id="DH-1",
    customer_id="KH-1",
    customer_name="Nguyễn Văn A",
    voucher_ids=["VC-1"],
    promotion_ids=["KM-1"],
    amount=500_000,
    vouchers=[voucher],
    promotions=[promotion],
    benefit_usage=[],
    used_voucher_ids=set(),
)
flag_index = module.ORDER_BENEFIT_HEADERS.index("tinhDoanhThuLaiXe")
assert total_discount == 150_000
assert len(rows) == 2
assert all(len(row) == len(module.ORDER_BENEFIT_HEADERS) for row in rows)
assert rows[0][flag_index] == "Có"
assert rows[1][flag_index] == "Không"

# Sửa một đơn cũ không được làm thay đổi lịch sử chỉ vì cấu hình voucher hiện
# tại đã được bật/tắt sau khi đơn được tạo.
module.preserve_benefit_driver_revenue_snapshots(
    rows,
    [
        {
            "loaiUuDai": "voucher",
            "khachHangId": "KH-1",
            "uuDaiId": "VC-1",
            "tinhDoanhThuLaiXe": "Không",
        }
    ],
)
assert rows[0][flag_index] == "Không"
assert rows[1][flag_index] == "Không"
# Trả lại snapshot Có cho các kiểm tra tổng hợp phía dưới.
rows[0][flag_index] = "Có"


# DON_HANG_UU_DAI là ảnh chụp lịch sử: chỉ những dòng được tick mới cộng lại.
module.order_benefit_records = lambda: [
    {
        "donHangId": "DH-1",
        "soTienGiam": 100_000,
        "tinhDoanhThuLaiXe": "Có",
    },
    {
        "donHangId": "DH-1",
        "soTienGiam": 50_000,
        "tinhDoanhThuLaiXe": "Không",
    },
]
assert module.order_driver_revenue_benefit_totals() == {"DH-1": 100_000}


# Dữ liệu đơn hàng được làm giàu bằng snapshot để mọi báo cáo/bảng lương dùng
# chung một công thức, nhưng tổng thanh toán của khách vẫn giữ nguyên.
module.orders_worksheet = lambda: object()
module.worksheet_records = lambda worksheet, headers, force_refresh=False: [
    {
        "id": "DH-1",
        "giaTien": 1_000_000,
        "giamGia": 50_000,
        "tongUuDai": 150_000,
        "phuThu": 20_000,
    }
]
module.customer_records = lambda: []
orders = module.all_order_records()
assert orders[0]["uuDaiTinhDoanhThuLaiXe"] == 100_000
assert module.order_driver_revenue(orders[0]) == 920_000

# Phần cộng lại chỉ dùng tính thưởng/lương; không làm tăng tiền khách phải trả
# hoặc số tiền lái xe thực tế phải nộp về.
orders[0].update({"thueVAT": 80_000, "daCoc": 100_000, "congNo": "Không"})
assert module.order_customer_revenue(orders[0]) == 820_000
assert module.order_driver_remittance(orders[0]) == 800_000


class FakeAppendWorksheet:
    def __init__(self, headers):
        self.headers = headers
        self.rows = []

    def append_row(self, row, value_input_option="RAW"):
        self.rows.append(row)

    def append_rows(self, rows, value_input_option="RAW"):
        self.rows.extend(rows)

    def row_values(self, row_number):
        assert row_number == 1
        return self.headers


module.worksheet_records = lambda worksheet, headers, force_refresh=False: []
module.invalidate_worksheet_cache = lambda worksheet: None
module.make_id = lambda prefix: f"{prefix}-TEST"

voucher_sheet = FakeAppendWorksheet(module.VOUCHER_HEADERS)
module.vouchers_worksheet = lambda: voucher_sheet
module.create_voucher(
    module.VoucherInput(
        maVoucher="DX-CHECK",
        tenVoucher="Kiểm tra",
        loaiGiaTri="fixed",
        giaTri=25_000,
        tinhDoanhThuLaiXe=True,
    )
)
assert len(voucher_sheet.rows[0]) == len(module.VOUCHER_HEADERS)
assert dict(zip(module.VOUCHER_HEADERS, voucher_sheet.rows[0]))["tinhDoanhThuLaiXe"] == "Có"

promotion_sheet = FakeAppendWorksheet(module.PROMOTION_HEADERS)
module.promotions_worksheet = lambda: promotion_sheet
module.validate_unique_promotion_name = lambda name, exclude_id="": name
module.create_promotion(
    module.PromotionInput(
        tenChuongTrinh="Kiểm tra",
        loaiGiaTri="fixed",
        giaTri=25_000,
        tinhDoanhThuLaiXe=False,
    )
)
assert len(promotion_sheet.rows[0]) == len(module.PROMOTION_HEADERS)
assert dict(zip(module.PROMOTION_HEADERS, promotion_sheet.rows[0]))["tinhDoanhThuLaiXe"] == "Không"

print("BENEFIT_DRIVER_REVENUE_SMOKE_OK")
