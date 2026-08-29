const state = {
  authToken: window.localStorage.getItem("diXanhAuthToken") || "",
  currentUser: null,
  permissions: { views: [], actions: [] },
  roles: {},
  users: [],
  reopenRequests: [],
  systemLogs: [],
  systemCatalogs: [],
  systemCatalogsLoaded: false,
  roster: [],
  calendarVehicleOrder: [],
  franchiseVehicles: [],
  customers: [],
  contracts: [],
  contractPricing: null,
  vouchers: [],
  selectedVoucherIds: new Set(),
  promotions: [],
  orders: [],
  orderFeedback: [],
  cskhShiftReports: [],
  invoiceOrders: [],
  invoiceGroupCandidates: [],
  invoiceGroupSelection: new Set(),
  invoiceGroupSearch: "",
  debtOrders: [],
  commissionOrders: [],
  editingOrderId: "",
  filters: {
    customer: "",
    contract: "",
    voucher: "",
    voucherCampaign: "",
    promotion: "",
    order: "",
    orderStatus: "",
    driverNotificationStatus: "",
    invoiceOrder: "",
    invoiceStatus: "",
    debtOrder: "",
    debtStatus: "",
    commissionOrder: "",
    commissionStatus: "",
    orderFeedback: "",
    orderFeedbackStatus: "",
    vehicle: "",
    franchiseVehicle: "",
    dashboardDate: "",
    systemLog: "",
    systemLogAction: "",
  },
  orderBenefits: {
    voucherIds: [],
    promotionIds: [],
    voucherOpen: false,
    promotionOpen: false,
    voucherSearch: "",
    promotionSearch: "",
  },
  activeView: "dashboard",
  loadedSources: new Set(),
};

const APP_VERSION_STORAGE_KEY = "diXanhAppVersion";
const APP_VERSION_CHECK_INTERVAL_MS = 60 * 1000;

const pageMeta = {
  dashboard: ["Tổng quan", "Theo dõi khách hàng, hợp đồng/tuyến và đơn hàng điều xe."],
  customers: ["Khách hàng", "Mỗi số điện thoại chỉ được khai báo một lần."],
  contracts: ["Hợp đồng/tuyến", "Khai báo các tuyến/hợp đồng mẫu để tạo đơn hàng."],
  contractPricing: ["Tra cứu giá hợp đồng", "Nhập quãng đường để xem giá 1 chiều, 2 chiều và thời gian chờ miễn phí."],
  overnightCalculator: ["Tính chi phí sử dụng xe", "Tính tổng giờ sử dụng, giờ chờ tính phí và chi phí lưu đêm."],
  vouchers: ["Voucher", "Quản lý mã voucher còn hạn, hết hạn và lịch sử sử dụng."],
  promotions: ["Khuyến mãi", "Quản lý chương trình khuyến mãi có thể áp dụng cho đơn hàng."],
  orders: ["Đơn hàng", "Gán khách hàng vào tuyến, điều xe và theo dõi hóa đơn."],
  invoiceOrders: ["Hóa đơn", "Theo dõi các đơn khách hàng yêu cầu xuất hóa đơn."],
  debtOrders: ["Công nợ", "Theo dõi và xác nhận thu hồi công nợ của từng đơn hàng."],
  commissionOrders: ["Hoa hồng xe thương quyền", "Theo dõi và xác nhận các khoản hoa hồng phải thu từ xe thương quyền hợp tác."],
  orderFeedback: ["Phản hồi khách hàng", "Theo dõi đánh giá, nội dung phản hồi và kết quả chăm sóc sau chuyến đi."],
  cskhShiftReports: ["Báo cáo ca CSKH", "Nhập và theo dõi các chỉ số làm việc theo từng ca CSKH."],
  reports: ["Báo cáo", "Chọn loại báo cáo và xuất file Excel."],
  reopenApprovals: ["Duyệt mở lại", "Duyệt hoặc từ chối yêu cầu mở lại đơn hàng đã hoàn thành."],
  calendar: ["Lịch điều xe", "Xem xe trống và xe đang phục vụ theo từng ngày."],
  vehicles: ["Xe lên ca", "Dữ liệu lấy từ sheet DANH_SACH_LEN_CA."],
  franchiseVehicles: ["Xe thương quyền", "Khai báo xe hợp tác ngoài và tỷ lệ nộp lại công ty."],
  permissions: ["Phân quyền", "Quản lý tài khoản và reset mật khẩu người dùng."],
  systemLogs: ["Lịch sử thay đổi", "Theo dõi tài khoản và nội dung đã thay đổi trên hệ thống."],
  systemCatalogs: ["Quản trị hệ thống", "Quản lý các danh mục dùng chung trong toàn bộ ứng dụng."],
};

const systemLogActionLabels = {
  update_order: "Cập nhật đơn hàng",
  assign_order_vehicle: "Điều xe",
  complete_order: "Hoàn thành đơn",
  delete_order: "Xóa đơn hàng",
  request_reopen: "Yêu cầu mở lại",
  approve_reopen: "Duyệt mở lại",
  reject_reopen: "Từ chối mở lại",
  create_user: "Tạo tài khoản",
  update_user: "Cập nhật tài khoản",
  reset_password: "Reset mật khẩu",
  change_password: "Đổi mật khẩu",
  update_customer: "Cập nhật khách hàng",
  delete_customer: "Xóa khách hàng",
  update_tour: "Cập nhật tuyến",
  delete_tour: "Xóa tuyến",
  update_voucher: "Cập nhật voucher",
  delete_voucher: "Xóa voucher",
  update_promotion: "Cập nhật khuyến mãi",
  delete_promotion: "Xóa khuyến mãi",
  create_invoice_group: "Tạo hóa đơn gộp",
  update_invoice_group_status: "Cập nhật hóa đơn gộp",
  update_invoice_status: "Cập nhật hóa đơn",
  update_debt_status: "Cập nhật công nợ",
  update_commission_status: "Cập nhật hoa hồng",
  create_order_feedback: "Thêm phản hồi khách hàng",
  update_order_feedback: "Cập nhật phản hồi khách hàng",
  update_franchise_vehicle: "Cập nhật xe thương quyền",
  delete_franchise_vehicle: "Xóa xe thương quyền",
  create_system_catalog: "Thêm danh mục hệ thống",
  delete_system_catalog: "Xóa danh mục hệ thống",
  update_calendar_vehicle_order: "Sắp xếp lịch điều xe",
  reset_calendar_vehicle_order: "Khôi phục thứ tự lịch điều xe",
  delete_cskh_shift_report: "Xóa báo cáo ca CSKH",
};

const systemLogFieldLabels = {
  tenKhach: "Tên khách hàng",
  soDienThoai: "Số điện thoại",
  tuyen: "Tuyến",
  diemDon: "Điểm đón",
  diemTra: "Điểm trả",
  ngayGioDi: "Ngày giờ đi",
  ngayGioDuKienKetThuc: "Ngày giờ đến dự kiến",
  bienKiemSoat: "Biển kiểm soát",
  hoTenLaiXe: "Lái xe",
  soCho: "Số chỗ",
  giaTien: "Giá tiền",
  giamGia: "Giảm giá",
  phuThu: "Phụ thu",
  daCoc: "Đã cọc",
  thucThu: "Thực thu",
  soTienNopLai: "Hoa hồng phải thu",
  tongUuDai: "Tổng ưu đãi",
  thueVAT: "Thuế VAT",
  tongThanhToan: "Tổng thanh toán",
  voucherCodes: "Voucher",
  khuyenMai: "Khuyến mãi",
  ghiChu: "Ghi chú",
  trangThai: "Trạng thái đơn",
  trangThaiHoaDon: "Trạng thái hóa đơn",
  trangThaiCongNo: "Trạng thái công nợ",
  trangThaiHoaHong: "Trạng thái hoa hồng",
  congNo: "Công nợ",
  congNoChoAi: "Đối tượng công nợ",
  yeuCauHoaDon: "Yêu cầu hóa đơn",
  displayName: "Họ tên nhân viên",
  role: "Vai trò",
  status: "Trạng thái",
};

const defaultVehicleLineOptions = ["Xe điện", "Xe xăng", "Xe dầu", "Xe hybrid"];
const defaultVehicleMakeOptions = ["Limo Green", "Innova"];
const systemCatalogTypeLabels = {
  nguonKhach: "Nguồn khách",
  dongXe: "Dòng xe",
  hieuXe: "Hiệu xe",
};
const vehicleSeatOptions = ["4 chỗ", "5 chỗ", "7 chỗ", "9 chỗ", "16 chỗ", "29 chỗ", "45 chỗ", "Tải Van 945 KG"];
const defaultCustomerSourceOptions = ["Facebook Ads", "Tổng đài", "Tiktok", "Lái xe giới thiệu", "Khách cũ", "Khác"];

function catalogValues(type, fallback = []) {
  const values = state.systemCatalogs
    .filter((row) => row.loaiDanhMuc === type)
    .map((row) => String(row.giaTri || "").trim())
    .filter(Boolean);
  return state.systemCatalogsLoaded ? values : fallback;
}

function customerSourceOptions() {
  return catalogValues("nguonKhach", defaultCustomerSourceOptions);
}

function vehicleLineOptions() {
  return catalogValues("dongXe", defaultVehicleLineOptions);
}

function vehicleMakeOptions() {
  return catalogValues("hieuXe", defaultVehicleMakeOptions);
}
const reportTypes = [
  {
    value: "summary",
    label: "Báo cáo tổng hợp",
    mode: "month",
    actions: ["reports_all", "reports_revenue", "export_excel"],
    description: "Doanh thu, lượt khách, khu vực đặt xe, nguồn khách, danh sách khách hàng và danh sách xe thương quyền.",
    tags: ["Tổng quan", "Doanh thu", "Khách hàng", "Xe TQ"],
  },
  {
    value: "vouchers",
    label: "Báo cáo voucher",
    mode: "month",
    actions: ["reports_all", "export_excel", "export_vouchers"],
    description: "Voucher còn hạn, hết hạn, đã sử dụng, chưa sử dụng và các đơn hàng đã áp mã.",
    tags: ["Tất cả voucher", "Đã sử dụng", "Chi tiết đơn hàng"],
  },
  {
    value: "orders",
    label: "Báo cáo tất cả đơn hàng",
    mode: "range",
    actions: ["reports_all", "export_excel", "export_orders"],
    description: "Toàn bộ đơn trong khoảng ngày, gồm tài chính, điều xe, hóa đơn, voucher và khuyến mãi đã dùng.",
    tags: ["Danh sách đơn hàng", "Khách xe ghép", "Voucher/khuyến mãi"],
  },
  {
    value: "workPerformance",
    label: "Báo cáo hiệu suất làm việc",
    mode: "range",
    actions: ["reports_all", "export_excel", "export_orders"],
    description: "Danh sách đơn hàng được lọc theo ngày tạo đơn, gồm nguồn khách, loại đơn, ngày khách đi, trạng thái và ghi chú.",
    tags: ["Ngày tạo đơn", "Nguồn khách", "Trạng thái đơn"],
  },
  {
    value: "customers",
    label: "Danh sách khách hàng",
    mode: "none",
    actions: ["reports_all", "export_customers"],
    description: "Toàn bộ khách hàng, thông tin liên hệ, nguồn khách, ngày tạo, giao dịch cuối, số đơn và tổng doanh thu.",
    tags: ["Thông tin khách", "Nguồn khách", "Lịch sử giao dịch"],
  },
  {
    value: "debts",
    label: "Báo cáo công nợ",
    mode: "none",
    actions: ["reports_all", "export_debts"],
    description: "Danh sách đơn hàng công nợ, người chịu công nợ và số tiền còn phải thu.",
    tags: ["Công nợ", "Kế toán", "Còn phải thu"],
  },
  {
    value: "driverRevenue",
    label: "Báo cáo doanh thu lái xe",
    mode: "range",
    actions: ["reports_all", "reports_revenue", "export_excel"],
    description: "Doanh thu từng lái xe sau giảm giá, voucher, khuyến mãi và VAT; có phân biệt đơn công nợ và thực thu.",
    tags: ["Lái xe", "Doanh thu sau VAT", "Thực thu"],
  },
];

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  loginStatus: document.querySelector("#loginStatus"),
  loginSubmitButton: document.querySelector("#loginSubmitButton"),
  currentUserLabel: document.querySelector("#currentUserLabel"),
  logoutButton: document.querySelector("#logoutButton"),
  pageTitle: document.querySelector("#pageTitle"),
  pageHint: document.querySelector("#pageHint"),
  syncStatus: document.querySelector("#syncStatus"),
  refreshButton: document.querySelector("#refreshButton"),
  customerCount: document.querySelector("#customerCount"),
  contractCount: document.querySelector("#contractCount"),
  openOrderCount: document.querySelector("#openOrderCount"),
  doneOrderCount: document.querySelector("#doneOrderCount"),
  vehicleCount: document.querySelector("#vehicleCount"),
  availableVehicleCount: document.querySelector("#availableVehicleCount"),
  dashboardTodayLabel: document.querySelector("#dashboardTodayLabel"),
  dashboardDateFilter: document.querySelector("#dashboardDateFilter"),
  dashboardMoneySummary: document.querySelector("#dashboardMoneySummary"),
  dashboardMonthRevenueTitle: document.querySelector("#dashboardMonthRevenueTitle"),
  dashboardMonthRevenueTotal: document.querySelector("#dashboardMonthRevenueTotal"),
  dashboardMonthRevenueBars: document.querySelector("#dashboardMonthRevenueBars"),
  dashboardTopSources: document.querySelector("#dashboardTopSources"),
  dashboardRegions: document.querySelector("#dashboardRegions"),
  customerTable: document.querySelector("#customerTable"),
  contractTable: document.querySelector("#contractTable"),
  contractsView: document.querySelector("#contractsView"),
  contractPricingView: document.querySelector("#contractPricingView"),
  contractPricingKm: document.querySelector("#contractPricingKm"),
  contractPricingWeekend: document.querySelector("#contractPricingWeekend"),
  contractPricingResults: document.querySelector("#contractPricingResults"),
  contractPricingSetup: document.querySelector("#contractPricingSetup"),
  oneWayPricingTable: document.querySelector("#oneWayPricingTable"),
  roundTripPricingTable: document.querySelector("#roundTripPricingTable"),
  waitingPricingTable: document.querySelector("#waitingPricingTable"),
  saveContractPricingButton: document.querySelector("#saveContractPricingButton"),
  contractPricingStatus: document.querySelector("#contractPricingStatus"),
  overnightCalculatorForm: document.querySelector("#overnightCalculatorForm"),
  overnightStartInput: document.querySelector("#overnightStartInput"),
  overnightEndInput: document.querySelector("#overnightEndInput"),
  overnightFreeWaitInput: document.querySelector("#overnightFreeWaitInput"),
  overnightMovingHoursInput: document.querySelector("#overnightMovingHoursInput"),
  overnightResetButton: document.querySelector("#overnightResetButton"),
  overnightCalculatorResult: document.querySelector("#overnightCalculatorResult"),
  voucherTable: document.querySelector("#voucherTable"),
  printSelectedVouchersButton: document.querySelector("#printSelectedVouchersButton"),
  deleteVoucherCampaignButton: document.querySelector("#deleteVoucherCampaignButton"),
  selectAllVouchersCheckbox: document.querySelector("#selectAllVouchersCheckbox"),
  promotionTable: document.querySelector("#promotionTable"),
  orderTable: document.querySelector("#orderTable"),
  invoiceOrderTable: document.querySelector("#invoiceOrderTable"),
  debtOrderTable: document.querySelector("#debtOrderTable"),
  commissionOrderTable: document.querySelector("#commissionOrderTable"),
  orderFeedbackTable: document.querySelector("#orderFeedbackTable"),
  cskhShiftReportForm: document.querySelector("#cskhShiftReportForm"),
  cskhShiftReportSubmitButton: document.querySelector("#cskhShiftReportSubmitButton"),
  cskhShiftReportExportButton: document.querySelector("#cskhShiftReportExportButton"),
  cskhShiftReportFromInput: document.querySelector("#cskhShiftReportFromInput"),
  cskhShiftReportToInput: document.querySelector("#cskhShiftReportToInput"),
  cskhShiftReportStatus: document.querySelector("#cskhShiftReportStatus"),
  cskhShiftReportTable: document.querySelector("#cskhShiftReportTable"),
  vehicleTable: document.querySelector("#vehicleTable"),
  franchiseVehicleTable: document.querySelector("#franchiseVehicleTable"),
  userTable: document.querySelector("#userTable"),
  reopenRequestTable: document.querySelector("#reopenRequestTable"),
  systemLogTable: document.querySelector("#systemLogTable"),
  systemLogSearch: document.querySelector("#systemLogSearch"),
  systemLogActionFilter: document.querySelector("#systemLogActionFilter"),
  dispatchSummary: document.querySelector("#dispatchSummary"),
  dispatchTable: document.querySelector("#dispatchTable"),
  customerSearch: document.querySelector("#customerSearch"),
  contractSearch: document.querySelector("#contractSearch"),
  voucherCampaignFilter: document.querySelector("#voucherCampaignFilter"),
  voucherSearch: document.querySelector("#voucherSearch"),
  promotionSearch: document.querySelector("#promotionSearch"),
  orderSearch: document.querySelector("#orderSearch"),
  orderStatusFilter: document.querySelector("#orderStatusFilter"),
  driverNotificationStatusFilter: document.querySelector("#driverNotificationStatusFilter"),
  invoiceOrderSearch: document.querySelector("#invoiceOrderSearch"),
  invoiceStatusFilter: document.querySelector("#invoiceStatusFilter"),
  invoiceReportDateInput: document.querySelector("#invoiceReportDateInput"),
  invoiceReportDateToInput: document.querySelector("#invoiceReportDateToInput"),
  invoiceReportSummary: document.querySelector("#invoiceReportSummary"),
  debtOrderSearch: document.querySelector("#debtOrderSearch"),
  debtStatusFilter: document.querySelector("#debtStatusFilter"),
  debtReportDateInput: document.querySelector("#debtReportDateInput"),
  debtReportDateToInput: document.querySelector("#debtReportDateToInput"),
  debtReportSummary: document.querySelector("#debtReportSummary"),
  commissionOrderSearch: document.querySelector("#commissionOrderSearch"),
  commissionStatusFilter: document.querySelector("#commissionStatusFilter"),
  commissionReportDateInput: document.querySelector("#commissionReportDateInput"),
  commissionReportDateToInput: document.querySelector("#commissionReportDateToInput"),
  commissionReportSummary: document.querySelector("#commissionReportSummary"),
  orderFeedbackSearch: document.querySelector("#orderFeedbackSearch"),
  orderFeedbackStatusFilter: document.querySelector("#orderFeedbackStatusFilter"),
  orderFeedbackDateFromInput: document.querySelector("#orderFeedbackDateFromInput"),
  orderFeedbackDateToInput: document.querySelector("#orderFeedbackDateToInput"),
  vehicleSearch: document.querySelector("#vehicleSearch"),
  franchiseVehicleSearch: document.querySelector("#franchiseVehicleSearch"),
  customerDialog: document.querySelector("#customerDialog"),
  customerForm: document.querySelector("#customerForm"),
  customerFormStatus: document.querySelector("#customerFormStatus"),
  customerSubmitButton: document.querySelector("#customerSubmitButton"),
  openCustomerDialogButton: document.querySelector("#openCustomerDialogButton"),
  customerCancelButton: document.querySelector("#customerCancelButton"),
  contractDialog: document.querySelector("#contractDialog"),
  contractForm: document.querySelector("#contractForm"),
  contractFormStatus: document.querySelector("#contractFormStatus"),
  contractSubmitButton: document.querySelector("#contractSubmitButton"),
  openContractDialogButton: document.querySelector("#openContractDialogButton"),
  contractCancelButton: document.querySelector("#contractCancelButton"),
  voucherDialog: document.querySelector("#voucherDialog"),
  voucherForm: document.querySelector("#voucherForm"),
  voucherFormStatus: document.querySelector("#voucherFormStatus"),
  voucherSubmitButton: document.querySelector("#voucherSubmitButton"),
  openVoucherDialogButton: document.querySelector("#openVoucherDialogButton"),
  voucherCancelButton: document.querySelector("#voucherCancelButton"),
  voucherBatchDialog: document.querySelector("#voucherBatchDialog"),
  voucherBatchForm: document.querySelector("#voucherBatchForm"),
  voucherBatchFormStatus: document.querySelector("#voucherBatchFormStatus"),
  voucherBatchSubmitButton: document.querySelector("#voucherBatchSubmitButton"),
  openVoucherBatchDialogButton: document.querySelector("#openVoucherBatchDialogButton"),
  voucherBatchCancelButton: document.querySelector("#voucherBatchCancelButton"),
  promotionDialog: document.querySelector("#promotionDialog"),
  promotionForm: document.querySelector("#promotionForm"),
  promotionFormStatus: document.querySelector("#promotionFormStatus"),
  promotionSubmitButton: document.querySelector("#promotionSubmitButton"),
  openPromotionDialogButton: document.querySelector("#openPromotionDialogButton"),
  promotionCancelButton: document.querySelector("#promotionCancelButton"),
  franchiseVehicleDialog: document.querySelector("#franchiseVehicleDialog"),
  franchiseVehicleForm: document.querySelector("#franchiseVehicleForm"),
  franchiseVehicleFormStatus: document.querySelector("#franchiseVehicleFormStatus"),
  franchiseVehicleSubmitButton: document.querySelector("#franchiseVehicleSubmitButton"),
  openFranchiseVehicleDialogButton: document.querySelector("#openFranchiseVehicleDialogButton"),
  franchiseVehicleCancelButton: document.querySelector("#franchiseVehicleCancelButton"),
  userDialog: document.querySelector("#userDialog"),
  userForm: document.querySelector("#userForm"),
  userFormStatus: document.querySelector("#userFormStatus"),
  userSubmitButton: document.querySelector("#userSubmitButton"),
  userDialogTitle: document.querySelector("#userDialogTitle"),
  userPasswordField: document.querySelector("#userPasswordField"),
  openUserDialogButton: document.querySelector("#openUserDialogButton"),
  userCancelButton: document.querySelector("#userCancelButton"),
  systemCatalogForm: document.querySelector("#systemCatalogForm"),
  systemCatalogType: document.querySelector("#systemCatalogType"),
  systemCatalogSubmitButton: document.querySelector("#systemCatalogSubmitButton"),
  systemCatalogFormStatus: document.querySelector("#systemCatalogFormStatus"),
  systemCatalogTable: document.querySelector("#systemCatalogTable"),
  openChangePasswordButton: document.querySelector("#openChangePasswordButton"),
  changePasswordDialog: document.querySelector("#changePasswordDialog"),
  changePasswordForm: document.querySelector("#changePasswordForm"),
  changePasswordFormStatus: document.querySelector("#changePasswordFormStatus"),
  changePasswordSubmitButton: document.querySelector("#changePasswordSubmitButton"),
  changePasswordCancelButton: document.querySelector("#changePasswordCancelButton"),
  resetPasswordDialog: document.querySelector("#resetPasswordDialog"),
  resetPasswordForm: document.querySelector("#resetPasswordForm"),
  resetPasswordFormStatus: document.querySelector("#resetPasswordFormStatus"),
  resetPasswordSubmitButton: document.querySelector("#resetPasswordSubmitButton"),
  resetPasswordCancelButton: document.querySelector("#resetPasswordCancelButton"),
  reopenDialog: document.querySelector("#reopenDialog"),
  reopenForm: document.querySelector("#reopenForm"),
  reopenFormStatus: document.querySelector("#reopenFormStatus"),
  reopenSubmitButton: document.querySelector("#reopenSubmitButton"),
  reopenCancelButton: document.querySelector("#reopenCancelButton"),
  orderDialog: document.querySelector("#orderDialog"),
  orderForm: document.querySelector("#orderForm"),
  orderFormStatus: document.querySelector("#orderFormStatus"),
  orderSubmitButton: document.querySelector("#orderSubmitButton"),
  openOrderDialogButton: document.querySelector("#openOrderDialogButton"),
  assignVehicleDialog: document.querySelector("#assignVehicleDialog"),
  assignVehicleForm: document.querySelector("#assignVehicleForm"),
  assignVehicleFormStatus: document.querySelector("#assignVehicleFormStatus"),
  assignVehicleSummary: document.querySelector("#assignVehicleSummary"),
  assignVehicleSubmitButton: document.querySelector("#assignVehicleSubmitButton"),
  assignVehicleCancelButton: document.querySelector("#assignVehicleCancelButton"),
  driverRemittanceDateInput: document.querySelector("#driverRemittanceDateInput"),
  orderDateToInput: document.querySelector("#orderDateToInput"),
  orderSummaryTripCount: document.querySelector("#orderSummaryTripCount"),
  orderSummaryBaseAmount: document.querySelector("#orderSummaryBaseAmount"),
  orderSummarySurcharge: document.querySelector("#orderSummarySurcharge"),
  orderSummaryDiscount: document.querySelector("#orderSummaryDiscount"),
  orderSummaryVat: document.querySelector("#orderSummaryVat"),
  orderSummaryDeposit: document.querySelector("#orderSummaryDeposit"),
  orderSummaryAmountDue: document.querySelector("#orderSummaryAmountDue"),
  orderSummaryActualReceipt: document.querySelector("#orderSummaryActualReceipt"),
  orderSummaryCommission: document.querySelector("#orderSummaryCommission"),
  orderSummaryDebt: document.querySelector("#orderSummaryDebt"),
  reportTypeSelect: document.querySelector("#reportTypeSelect"),
  reportMonthWrap: document.querySelector("#reportMonthWrap"),
  reportMonthInput: document.querySelector("#reportMonthInput"),
  reportFromWrap: document.querySelector("#reportFromWrap"),
  reportFromInput: document.querySelector("#reportFromInput"),
  reportToWrap: document.querySelector("#reportToWrap"),
  reportToInput: document.querySelector("#reportToInput"),
  reportDescription: document.querySelector("#reportDescription"),
  reportMetaList: document.querySelector("#reportMetaList"),
  exportDriverRemittanceButton: document.querySelector("#exportDriverRemittanceButton"),
  exportSelectedReportButton: document.querySelector("#exportSelectedReportButton"),
  exportInvoicesReportButton: document.querySelector("#exportInvoicesReportButton"),
  openInvoiceGroupDialogButton: document.querySelector("#openInvoiceGroupDialogButton"),
  invoiceGroupDialog: document.querySelector("#invoiceGroupDialog"),
  invoiceGroupForm: document.querySelector("#invoiceGroupForm"),
  invoiceGroupFormStatus: document.querySelector("#invoiceGroupFormStatus"),
  invoiceGroupCandidateTable: document.querySelector("#invoiceGroupCandidateTable"),
  invoiceGroupSearch: document.querySelector("#invoiceGroupSearch"),
  invoiceGroupSummary: document.querySelector("#invoiceGroupSummary"),
  invoiceGroupSubmitButton: document.querySelector("#invoiceGroupSubmitButton"),
  invoiceGroupCancelButton: document.querySelector("#invoiceGroupCancelButton"),
  exportDebtsReportButton: document.querySelector("#exportDebtsReportButton"),
  exportCommissionsReportButton: document.querySelector("#exportCommissionsReportButton"),
  orderCancelButton: document.querySelector("#orderCancelButton"),
  orderCustomerId: document.querySelector("#orderCustomerId"),
  orderCustomerPhone: document.querySelector("#orderCustomerPhone"),
  orderCustomerName: document.querySelector("#orderCustomerName"),
  orderCustomerCccd: document.querySelector("#orderCustomerCccd"),
  orderCustomerAddress: document.querySelector("#orderCustomerAddress"),
  orderCustomerProfileType: document.querySelector("#orderCustomerProfileType"),
  orderCustomerBirthYear: document.querySelector("#orderCustomerBirthYear"),
  orderCustomerGender: document.querySelector("#orderCustomerGender"),
  orderCustomerSource: document.querySelector("#orderCustomerSource"),
  orderCustomerStaff: document.querySelector("#orderCustomerStaff"),
  orderCustomerPreview: document.querySelector("#orderCustomerPreview"),
  orderContractSelect: document.querySelector("#orderContractSelect"),
  orderVoucherPicker: document.querySelector("#orderVoucherPicker"),
  orderPromotionPicker: document.querySelector("#orderPromotionPicker"),
  orderBenefitsSection: document.querySelector("#orderBenefitsSection"),
  benefitPreview: document.querySelector("#benefitPreview"),
  orderPaymentSummary: document.querySelector("#orderPaymentSummary"),
  orderPickupInput: document.querySelector("#orderPickupInput"),
  orderDropoffInput: document.querySelector("#orderDropoffInput"),
  orderVehicleSelect: document.querySelector("#orderVehicleSelect"),
  orderDriverName: document.querySelector("#orderDriverName"),
  orderVehicleType: document.querySelector("#orderVehicleType"),
  orderVehicleSeats: document.querySelector("#orderVehicleSeats"),
  franchiseCommissionWrap: document.querySelector("#franchiseCommissionWrap"),
  franchiseCommissionInput: document.querySelector("#franchiseCommissionInput"),
  ticketCountInput: document.querySelector("#ticketCountInput"),
  ticketCountWrap: document.querySelector("#ticketCountWrap"),
  sharedPassengersSection: document.querySelector("#sharedPassengersSection"),
  sharedPassengerList: document.querySelector("#sharedPassengerList"),
  vehicleWarning: document.querySelector("#vehicleWarning"),
  invoiceToggle: document.querySelector("#invoiceToggle"),
  orderInvoiceSection: document.querySelector("#orderInvoiceSection"),
  orderDebtSection: document.querySelector("#orderDebtSection"),
  invoiceFields: document.querySelector("#invoiceFields"),
  calendarDateInput: document.querySelector("#calendarDateInput"),
  calendarTodayButton: document.querySelector("#calendarTodayButton"),
  calendarAvailabilityFilter: document.querySelector("#calendarAvailabilityFilter"),
  calendarOwnershipFilter: document.querySelector("#calendarOwnershipFilter"),
  calendarResetOrderButton: document.querySelector("#calendarResetOrderButton"),
  completeDialog: document.querySelector("#completeDialog"),
  completeForm: document.querySelector("#completeForm"),
  completeOrderLabel: document.querySelector("#completeOrderLabel"),
  completeOrderSummary: document.querySelector("#completeOrderSummary"),
  completeSubmitButton: document.querySelector("#completeSubmitButton"),
  completeCancelButton: document.querySelector("#completeCancelButton"),
  detailsDialog: document.querySelector("#detailsDialog"),
  detailsForm: document.querySelector("#detailsForm"),
  detailsTitle: document.querySelector("#detailsTitle"),
  detailsStatus: document.querySelector("#detailsStatus"),
  detailsReadonly: document.querySelector("#detailsReadonly"),
  detailsEditor: document.querySelector("#detailsEditor"),
  detailsSaveButton: document.querySelector("#detailsSaveButton"),
  detailsDeleteButton: document.querySelector("#detailsDeleteButton"),
  detailsCloseButton: document.querySelector("#detailsCloseButton"),
};

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

const roleLabels = {
  admin: "Admin",
  ke_toan: "Kế toán",
  cskh: "CSKH",
  marketing: "Marketing",
  ban_giam_doc: "Ban Giám đốc",
  kinh_doanh: "Kinh Doanh",
};

function roleLabel(role) {
  return state.roles?.[role] || roleLabels[role] || role || "";
}

function showLogin(message = "") {
  state.currentUser = null;
  state.permissions = { views: [], actions: [] };
  if (els.appShell) els.appShell.hidden = true;
  if (els.loginScreen) els.loginScreen.hidden = false;
  if (els.loginStatus) els.loginStatus.textContent = message;
}

function showApp() {
  if (els.loginScreen) els.loginScreen.hidden = true;
  if (els.appShell) els.appShell.hidden = false;
  if (els.currentUserLabel) {
    const name = state.currentUser?.displayName || state.currentUser?.username || "User";
    const role = roleLabel(state.currentUser?.role || "");
    els.currentUserLabel.textContent = role ? `${name} - ${role}` : name;
  }
  syncCskhShiftForm();
}

function clearAuth(message = "Vui lòng đăng nhập lại.") {
  state.authToken = "";
  window.localStorage.removeItem("diXanhAuthToken");
  showLogin(message);
}

async function checkAppVersion() {
  try {
    const response = await fetch("/api/app-version", { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) return true;
    const payload = await response.json();
    const version = String(payload.version || "");
    if (!version) return true;
    const previousVersion = window.localStorage.getItem(APP_VERSION_STORAGE_KEY) || "";
    window.localStorage.setItem(APP_VERSION_STORAGE_KEY, version);
    if (previousVersion && previousVersion !== version && state.authToken) {
      clearAuth("Ứng dụng vừa được cập nhật. Vui lòng đăng nhập lại.");
      return false;
    }
  } catch (error) {
    // Không đăng xuất chỉ vì kiểm tra phiên bản tạm thời mất kết nối.
  }
  return true;
}

function can(action) {
  if (state.currentUser?.role === "admin") return true;
  return (state.permissions.actions || []).includes(action);
}

function canView(view) {
  if (state.currentUser?.role === "admin") return true;
  return (state.permissions.views || []).includes(view);
}

function canOperateOrders() {
  return ["admin", "cskh"].includes(state.currentUser?.role);
}

function isPendingReopen(row) {
  const status = normalize(row?.status || row?.trangThai);
  return status === "cho duyet" || status === "pending";
}

function canExportReport(report) {
  if (!report) return false;
  return report.actions.some((action) => can(action));
}

function availableReportTypes() {
  return reportTypes.filter((report) => canExportReport(report));
}

function selectedReportType() {
  const value = els.reportTypeSelect?.value;
  return reportTypes.find((report) => report.value === value) || availableReportTypes()[0] || null;
}

function updateReportControls() {
  if (!els.reportTypeSelect) return;
  const allowedReports = availableReportTypes();
  const previousValue = els.reportTypeSelect.value;
  els.reportTypeSelect.innerHTML = allowedReports
    .map((report) => `<option value="${report.value}">${escapeHtml(report.label)}</option>`)
    .join("");

  if (allowedReports.some((report) => report.value === previousValue)) {
    els.reportTypeSelect.value = previousValue;
  }

  const report = selectedReportType();
  const hasReport = Boolean(report);
  els.reportTypeSelect.disabled = !hasReport;
  if (els.exportSelectedReportButton) {
    els.exportSelectedReportButton.disabled = !hasReport;
    els.exportSelectedReportButton.textContent = hasReport ? `Xuất ${report.label.toLowerCase()}` : "Không có quyền xuất báo cáo";
  }
  if (els.reportDescription) {
    els.reportDescription.textContent = hasReport ? report.description : "Tài khoản này chưa được phân quyền xuất báo cáo.";
  }
  if (els.reportMetaList) {
    els.reportMetaList.innerHTML = hasReport ? report.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") : "";
  }

  const mode = report?.mode || "none";
  if (els.reportMonthWrap) els.reportMonthWrap.hidden = mode !== "month";
  if (els.reportFromWrap) els.reportFromWrap.hidden = mode !== "range";
  if (els.reportToWrap) els.reportToWrap.hidden = mode !== "range";
}

function applyPermissions() {
  document.querySelectorAll(".nav-item[data-view]").forEach((button) => {
    button.hidden = !canView(button.dataset.view);
  });

  document.querySelectorAll(".nav-group").forEach((group) => {
    group.hidden = !group.querySelector(".nav-item[data-view]:not([hidden])");
  });

  const active = document.querySelector(".nav-item.active");
  if (active?.hidden) {
    const first = document.querySelector(".nav-item[data-view]:not([hidden])");
    if (first) switchView(first.dataset.view);
  }

  const canEditData = can("edit_data");
  const canManageBenefits = can("manage_benefits");
  [
    els.openCustomerDialogButton,
    els.openContractDialogButton,
    els.openFranchiseVehicleDialogButton,
  ].forEach((button) => {
    if (button) button.hidden = !canEditData;
  });
  if (els.openOrderDialogButton) els.openOrderDialogButton.hidden = !canOperateOrders();
  document.querySelectorAll('[data-action="dashboard-new-order"]').forEach((button) => {
    button.hidden = !canOperateOrders();
  });
  [els.openVoucherDialogButton, els.openVoucherBatchDialogButton, els.openPromotionDialogButton].forEach((button) => {
    if (button) button.hidden = !canManageBenefits;
  });

  if (els.openUserDialogButton) els.openUserDialogButton.hidden = !can("manage_users");

  if (els.exportDriverRemittanceButton) {
    els.exportDriverRemittanceButton.hidden = !["reports_all", "reports_revenue", "export_excel"].some((action) =>
      can(action),
    );
  }
  updateReportControls();
  if (els.exportInvoicesReportButton) {
    els.exportInvoicesReportButton.hidden = !["reports_all", "export_invoices"].some((action) => can(action));
  }
  if (els.openInvoiceGroupDialogButton) {
    els.openInvoiceGroupDialogButton.hidden = !can("create_invoice_groups");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function selectOptions(options, selectedValue, placeholder) {
  const selectedText = String(selectedValue || "");
  const values = selectedText && !options.includes(selectedText) ? [selectedText, ...options] : options;
  return [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...values.map((value) => `<option ${value === selectedText ? "selected" : ""}>${escapeHtml(value)}</option>`),
  ].join("");
}

function matches(row, query) {
  if (!query) return true;
  const haystack = normalize(Object.values(row).join(" "));
  return haystack.includes(normalize(query));
}

function invoiceOrderStatus(row) {
  return String(row?.trangThaiHoaDon || "").trim() || "Chưa xuất";
}

function franchisePlateIsValid(value) {
  return /^\d{2}[A-Z]-\d{3}\.\d{2}$/.test(String(value || "").trim().toUpperCase());
}

function localNowForInput() {
  return formatDateTimeForInput(new Date());
}

function localDateForInput(date = new Date()) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

function localMonthForInput(date = new Date()) {
  return localDateForInput(date).slice(0, 7);
}

function formatMonthLabel(value) {
  const text = String(value || "");
  const [year, month] = text.split("-");
  return year && month ? `Tháng ${month}/${year}` : "Tháng hiện tại";
}

function formatDate(value) {
  const dateKey = rosterDateKey({ thoiGianTao: value });
  return dateKey ? dateKey.split("-").reverse().join("/") : String(value || "");
}

function formatDateTime(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const date = parseDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return text;
  return formatDateTimeForInput(date);
}

function formatTime(value) {
  const date = parseDateTime(value);
  if (!date) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDateTimeForInput(value) {
  const date = value instanceof Date ? value : parseDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeDateTimeInput(value) {
  const date = parseDateTime(value);
  if (!date) return "";
  return formatDateTimeForInput(date);
}

function isCompleteDateTimeInput(value) {
  const text = String(value || "").trim();
  if (!/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(text)) return false;
  const date = parseDateTime(text);
  return Boolean(date) && formatDateTimeForInput(date) === text;
}

function setDateTimeInputValidity(input) {
  if (!input) return true;
  const hasValue = Boolean(String(input.value || "").trim());
  const missingRequiredValue = input.required && !hasValue;
  const isValid = !missingRequiredValue && (!hasValue || isCompleteDateTimeInput(input.value));
  input.classList.toggle("invalid", !isValid);
  input.setCustomValidity(
    isValid
      ? ""
      : missingRequiredValue
        ? "Vui lòng nhập thời gian khởi hành dự kiến của đơn hàng."
        : "Vui lòng nhập đủ ngày và giờ, ví dụ 17/07/2026 13:00.",
  );
  return isValid;
}

function validateDateTimeInputs(form) {
  return [...form.querySelectorAll(".datetime-input")].every(setDateTimeInputValidity);
}

function formatDateTimeTyping(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 12);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length <= 10) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10)}`;
}

function formatDateOnlyTyping(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function normalizeDateOnlyInput(value) {
  const text = String(value || "").trim();
  const digits = text.replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  return text;
}

function nativeDateValue(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return "";
}

function nativeDateTimeValue(value) {
  const date = parseDateTime(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateFromNativeValue(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

function dateTimeFromNativeValue(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return "";
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function emitInputChange(input) {
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function enhanceDateTimeControls(root = document) {
  root.querySelectorAll(".date-input:not([data-picker-enhanced]), .datetime-input:not([data-picker-enhanced])").forEach((input) => {
    const isDateTime = input.classList.contains("datetime-input");
    input.dataset.pickerEnhanced = "1";

    const wrapper = document.createElement("span");
    wrapper.className = "date-picker-wrap";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const nativePicker = document.createElement("input");
    nativePicker.type = isDateTime ? "datetime-local" : "date";
    nativePicker.className = "native-date-picker";
    nativePicker.tabIndex = -1;
    nativePicker.setAttribute("aria-hidden", "true");

    const pickerButton = document.createElement("button");
    pickerButton.type = "button";
    pickerButton.className = `date-picker-button${isDateTime ? " datetime" : ""}`;
    pickerButton.setAttribute("aria-label", isDateTime ? "Chọn ngày và giờ" : "Chọn ngày");
    pickerButton.title = isDateTime ? "Chọn ngày và giờ" : "Chọn ngày";

    pickerButton.innerHTML = isDateTime
      ? `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><circle cx="16.5" cy="16.5" r="3.5"/><path d="M16.5 14.7v2l1.4.8"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>`;

    wrapper.append(nativePicker, pickerButton);

    pickerButton.addEventListener("click", (event) => {
      event.preventDefault();
      nativePicker.value = isDateTime ? nativeDateTimeValue(input.value) : nativeDateValue(input.value);
      if (typeof nativePicker.showPicker === "function") nativePicker.showPicker();
      else nativePicker.click();
    });

    nativePicker.addEventListener("change", () => {
      const pickedValue = isDateTime ? dateTimeFromNativeValue(nativePicker.value) : dateFromNativeValue(nativePicker.value);
      if (!pickedValue) return;
      input.value = pickedValue;
      emitInputChange(input);
      input.focus();
    });
  });
}

function formatMoney(value) {
  if (value === null || value === undefined || String(value).trim() === "") return "";
  const amount = typeof value === "number" ? value : parseMoney(value);
  return Number.isFinite(amount) ? Math.round(amount).toLocaleString("en-US") : "";
}

function parseMoney(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function orderNetAmount(order) {
  if (order.thucThu !== undefined && String(order.thucThu || "").trim() !== "") return parseMoney(order.thucThu);
  return Math.max(
    parseMoney(order.giaTien) + parseMoney(order.phuThu) - parseMoney(order.giamGia)
      - parseMoney(order.tongUuDai) + parseMoney(order.thueVAT) - parseMoney(order.daCoc),
    0,
  );
}

function orderRevenueAmount(order) {
  return Math.max(parseMoney(order.giaTien) + parseMoney(order.phuThu) - parseMoney(order.giamGia) - parseMoney(order.tongUuDai), 0);
}

function orderVatAmount(order) {
  return parseMoney(order.thueVAT);
}

function orderTotalPaymentAmount(order) {
  return orderRevenueAmount(order) + orderVatAmount(order);
}

function invoiceFinancialAmounts(row) {
  if (row.invoiceEntityType === "invoiceGroup") {
    const vat = parseMoney(row.tongVAT);
    const total = parseMoney(row.tongThanhToan) || parseMoney(row.giaTien);
    const beforeVat = parseMoney(row.tongTruocVAT) || Math.max(total - vat, 0);
    return { beforeVat, vat, total };
  }
  const beforeVat = orderRevenueAmount(row);
  const vat = orderVatAmount(row);
  const total = parseMoney(row.tongThanhToan) || beforeVat + vat;
  return { beforeVat, vat, total };
}

function orderCommissionText(order) {
  const rate = parseFloat(order.tyLeNopLai || "0");
  return rate > 0 ? `${order.tyLeNopLai}% - ${formatMoney(order.soTienNopLai) || "0"}` : "";
}

function hasCommission(order) {
  return parseFloat(order.tyLeNopLai || "0") > 0;
}

function orderIsFranchiseVehicle(order) {
  return hasCommission(order) || normalize(order.loaiXeDieuDong).includes("thuong quyen");
}

function vehicleOwnershipLabel(order) {
  if (!order?.bienKiemSoat) return "Chưa xác định";
  return orderIsFranchiseVehicle(order) ? "Xe thương quyền hợp tác" : "Xe Công ty";
}

function vehicleSeatCount(order) {
  const savedSeatCount = order?.soCho || order?.so_cho || "";
  if (String(savedSeatCount).trim()) return String(savedSeatCount).trim().replace(/\s*chỗ\s*$/i, "");
  const plate = normalize(order?.bienKiemSoat);
  if (!plate) return "";
  const rosterVehicle = uniqueRosterVehicles().find((row) => normalize(row.bienKiemSoat) === plate);
  const franchiseVehicle = state.franchiseVehicles.find((row) => normalize(row.bienKiemSoat) === plate);
  const seatCount =
    rosterVehicle?.soCho ||
    rosterVehicle?.so_cho ||
    franchiseVehicle?.soCho ||
    franchiseVehicle?.so_cho ||
    "";
  return String(seatCount).trim().replace(/\s*chỗ\s*$/i, "");
}

function orderDriverName(order) {
  const savedDriverName = String(order?.hoTenLaiXe || "").trim();
  if (savedDriverName) return savedDriverName;
  const plate = normalize(order?.bienKiemSoat);
  if (!plate) return "";
  const rosterVehicle = uniqueRosterVehicles().find((row) => normalize(row.bienKiemSoat) === plate);
  const franchiseVehicle = state.franchiseVehicles.find((row) => normalize(row.bienKiemSoat) === plate);
  return String(
    driverName(rosterVehicle || {}) ||
      franchiseVehicle?.hoTenLaiXe ||
      "",
  ).trim();
}

function formatMoneyInput(input) {
  input.value = formatMoney(input.value);
}

function shouldFormatAsMoney(input) {
  const form = input.form;
  if (input.name === "giaTri" && form?.elements?.loaiGiaTri?.value === "percent") return false;
  return true;
}

function parseDateTime(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const vietnamese = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (vietnamese) {
    const [, day, month, year, hour, minute] = vietnamese;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const timeFirst = text.match(/^(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (timeFirst) {
    const [, hour, minute, day, month, year] = timeFirst;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(text.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function fallbackEnd(startValue) {
  const start = parseDateTime(startValue);
  if (!start) return "";
  start.setHours(start.getHours() + 4);
  return formatDateTimeForInput(start);
}

function overnightWindows(start, end) {
  const windows = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1, 22, 0, 0, 0);
  while (cursor < end) {
    const windowStart = new Date(cursor);
    const windowEnd = new Date(cursor);
    windowEnd.setDate(windowEnd.getDate() + 1);
    windowEnd.setHours(6, 0, 0, 0);
    if (start < windowEnd && end > windowStart) {
      const overlapStart = new Date(Math.max(start.getTime(), windowStart.getTime()));
      const overlapEnd = new Date(Math.min(end.getTime(), windowEnd.getTime()));
      windows.push({ windowStart, windowEnd, overlapStart, overlapEnd });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return windows;
}

function renderOvernightCalculation(excludedWindowIndexes = new Set()) {
  if (!els.overnightCalculatorResult) return;
  const startValid = setDateTimeInputValidity(els.overnightStartInput);
  const endValid = setDateTimeInputValidity(els.overnightEndInput);
  if (!startValid || !endValid) {
    els.overnightCalculatorResult.innerHTML = `<div class="form-alert error">Vui lòng nhập đúng định dạng dd/MM/yyyy hh:mm.</div>`;
    return;
  }
  const start = parseDateTime(els.overnightStartInput.value);
  const end = parseDateTime(els.overnightEndInput.value);
  if (!start || !end || end <= start) {
    els.overnightEndInput.classList.add("invalid");
    els.overnightEndInput.setCustomValidity("Ngày giờ đến phải sau ngày giờ đi.");
    els.overnightCalculatorResult.innerHTML = `<div class="form-alert error">Ngày giờ đến phải sau ngày giờ đi.</div>`;
    return;
  }
  els.overnightEndInput.setCustomValidity("");
  els.overnightEndInput.classList.remove("invalid");
  const freeWaitHours = Number(els.overnightFreeWaitInput?.value);
  const movingHours = Number(els.overnightMovingHoursInput?.value);
  if (!Number.isFinite(freeWaitHours) || freeWaitHours < 0 || !Number.isFinite(movingHours) || movingHours < 0) {
    els.overnightCalculatorResult.innerHTML = `<div class="form-alert error">Tổng giờ chờ miễn phí và tổng giờ xe di chuyển phải là số từ 0 trở lên.</div>`;
    return;
  }
  const totalUsageHours = (end.getTime() - start.getTime()) / 3600000;
  const windows = overnightWindows(start, end);
  const selectedWindows = windows.filter((_, index) => !excludedWindowIndexes.has(index));
  const totalOvernightHours = selectedWindows.reduce(
    (total, item) => total + (item.overlapEnd.getTime() - item.overlapStart.getTime()) / 3600000,
    0,
  );
  const billableWaitHours = totalUsageHours - movingHours - freeWaitHours - totalOvernightHours;
  if (billableWaitHours < -0.000001) {
    els.overnightCalculatorResult.innerHTML = `<div class="form-alert error">Tổng giờ xe di chuyển, giờ chờ miễn phí và giờ lưu đêm không được lớn hơn tổng giờ sử dụng xe (${totalUsageHours.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ).</div>`;
    return;
  }
  const normalizedBillableHours = Math.max(billableWaitHours, 0);
  const waitingFee = Math.round(normalizedBillableHours * 50000);
  const overnightFee = selectedWindows.length * 500000;
  const totalFee = waitingFee + overnightFee;
  const hourText = (value) => value.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const rows = windows.map((item, index) => `
    <tr class="${excludedWindowIndexes.has(index) ? "overnight-window-excluded" : ""}">
      <td>${index + 1}</td>
      <td><label class="overnight-window-toggle"><input type="checkbox" data-overnight-window-index="${index}" ${excludedWindowIndexes.has(index) ? "" : "checked"} /><span>${excludedWindowIndexes.has(index) ? "Không tính" : "Có tính"}</span></label></td>
      <td>${escapeHtml(formatDateTimeForInput(item.windowStart))}</td>
      <td>${escapeHtml(formatDateTimeForInput(item.windowEnd))}</td>
      <td>${escapeHtml(formatDateTimeForInput(item.overlapStart))} – ${escapeHtml(formatDateTimeForInput(item.overlapEnd))}</td>
      <td><strong>${hourText((item.overlapEnd.getTime() - item.overlapStart.getTime()) / 3600000)} giờ</strong></td>
    </tr>
  `).join("");
  els.overnightCalculatorResult.innerHTML = `
    <div class="overnight-result-summary">
      <div class="overnight-result-card"><span>Tổng giờ sử dụng xe</span><strong>${hourText(totalUsageHours)}</strong><small>giờ</small></div>
      <div class="overnight-result-card"><span>Tổng giờ lưu đêm</span><strong>${hourText(totalOvernightHours)}</strong><small>giờ</small></div>
      <div class="overnight-result-card"><span>Giờ chờ tính phí</span><strong>${hourText(normalizedBillableHours)}</strong><small>giờ</small></div>
      <div class="overnight-result-card"><span>Số đêm lưu</span><strong>${selectedWindows.length} đêm</strong><small>${hourText(totalOvernightHours)} giờ lưu đêm</small></div>
      <div class="overnight-result-card total"><span>Tổng chi phí</span><strong>${formatMoney(totalFee)}</strong><small>đ</small></div>
    </div>
    <div class="overnight-cost-breakdown">
      <span>Phí giờ chờ: <strong>${formatMoney(waitingFee)} đ</strong></span>
      <span>Phí lưu đêm: <strong>${formatMoney(overnightFee)} đ</strong></span>
    </div>
    ${windows.length ? `<div class="table-wrap"><table><thead><tr><th>STT</th><th>Tính lưu đêm</th><th>Bắt đầu khung đêm</th><th>Kết thúc khung đêm</th><th>Thời gian hành trình phát sinh</th><th>Số giờ lưu đêm</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty">Hành trình không phát sinh thời gian trong khung 22:00–06:00.</div>`}
  `;
}

function orderIsDone(order) {
  const status = normalize(order.trangThai);
  return Boolean(order.ngayGioHoanThanh) || status === "da hoan thanh" || status === "hoan thanh";
}

function orderIsCancelled(order) {
  const status = normalize(order.trangThai);
  return status.includes("huy");
}

function orderRange(order) {
  const start = parseDateTime(order.ngayGioDi);
  if (!start) return null;
  const end = parseDateTime(order.ngayGioHoanThanh) || parseDateTime(order.ngayGioDuKienKetThuc) || new Date(start.getTime() + 4 * 60 * 60 * 1000);
  return { start, end };
}

function rangesOverlap(leftStart, leftEnd, rightStart, rightEnd) {
  return leftStart < rightEnd && leftEnd > rightStart;
}

function orderConflicts(order, plate, startValue, endValue, excludeOrderId = "") {
  if (String(order.id) === String(excludeOrderId) || orderIsCancelled(order) || normalize(order.bienKiemSoat) !== normalize(plate)) return false;
  const currentStart = parseDateTime(startValue);
  const currentEnd = parseDateTime(endValue);
  const existing = orderRange(order);
  if (!currentStart || !currentEnd || !existing) return true;
  return rangesOverlap(existing.start, existing.end, currentStart, currentEnd);
}

function conflictingOrder(plate, startValue, endValue, excludeOrderId = "") {
  return state.orders.find((order) => orderConflicts(order, plate, startValue, endValue, excludeOrderId));
}

function driverText(row) {
  return row.hoTenMSNVLaiXe || row.hoTenNhanVienLaiXe || "";
}

function driverName(row) {
  return driverText(row).split(" - ", 1)[0] || "";
}

function hasRosterDriver(row) {
  return driverText(row).trim() !== "";
}

function parseRosterDate(row) {
  const text = String(row.thoiGianTao || "").trim();
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function rosterDateKey(row) {
  const time = parseRosterDate(row);
  if (!time) return "";
  const date = new Date(time);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function isRosterOnShift(row) {
  return normalize(row.trangThaiLenXuongCa).includes("len ca");
}

function betterRosterRow(current, candidate) {
  if (!current) return candidate;
  const currentOnShift = isRosterOnShift(current);
  const candidateOnShift = isRosterOnShift(candidate);
  if (candidateOnShift !== currentOnShift) return candidateOnShift ? candidate : current;
  return parseRosterDate(candidate) >= parseRosterDate(current) ? candidate : current;
}

function uniqueRosterVehicles() {
  const map = new Map();
  for (const row of state.roster) {
    const plate = String(row.bienKiemSoat || "").trim();
    if (plate) map.set(plate, betterRosterRow(map.get(plate), row));
  }
  return [...map.values()];
}

function rosterVehiclesForDate(dateKey, requireDriver = false) {
  const map = new Map();
  for (const row of state.roster) {
    const plate = String(row.bienKiemSoat || "").trim();
    if (!plate || !isRosterOnShift(row) || rosterDateKey(row) !== dateKey) continue;
    if (requireDriver && !hasRosterDriver(row)) continue;
    map.set(plate, betterRosterRow(map.get(plate), row));
  }
  return [...map.values()];
}

function rosterVehiclesForStart(startValue) {
  const start = parseDateTime(startValue);
  return start ? rosterVehiclesForDate(localDateForInput(start)) : [];
}

function activeFranchiseVehicles() {
  return state.franchiseVehicles.filter((row) => !normalize(row.trangThai).includes("ngung"));
}

function franchiseVehicleByPlate(plate) {
  return activeFranchiseVehicles().find((row) => normalize(row.bienKiemSoat) === normalize(plate));
}

function selectedVehicleKind() {
  return els.orderVehicleSelect.selectedOptions[0]?.dataset.vehicleKind || "";
}

function switchView(view) {
  state.activeView = view || "dashboard";
  document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
  document.querySelector(`#${view}View`)?.classList.add("active");
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  const [title, hint] = pageMeta[view] || pageMeta.dashboard;
  els.pageTitle.textContent = title;
  els.pageHint.textContent = hint;
  if (view === "calendar") renderCalendar();
  if (view === "reports") updateReportControls();
  if (view === "cskhShiftReports") syncCskhShiftForm();
  if (state.currentUser) loadData(state.activeView, false);
}

async function fetchJson(url, options = {}, timeoutMs = 30000) {
  const method = String(options.method || "GET").toUpperCase();
  const canRetry = method === "GET" || method === "HEAD";
  const maxAttempts = canRetry ? 2 : 1;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers = { ...(options.headers || {}) };
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "same-origin",
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401 && url !== "/api/login") {
        clearAuth(payload.detail || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        throw new Error(payload.detail || "Phiên đăng nhập đã hết hạn.");
      }
      if (!response.ok) {
        const error = new Error(payload.detail || "Có lỗi xảy ra");
        error.status = response.status;
        throw error;
      }
      return payload;
    } catch (error) {
      lastError = error;
      const aborted = error.name === "AbortError" || String(error.message || "").toLowerCase().includes("aborted");
      const transientStatus = [429, 500, 502, 503, 504].includes(Number(error.status));
      if (attempt < maxAttempts && (aborted || transientStatus)) {
        await new Promise((resolve) => window.setTimeout(resolve, 800 * attempt));
        continue;
      }
      if (aborted) {
        throw new Error("Google Sheet đang phản hồi chậm. Hệ thống đã tự thử lại nhưng chưa nhận được dữ liệu; vui lòng thử lại sau ít phút.");
      }
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }
  throw lastError || new Error("Không thể tải dữ liệu.");
}

function parseDateOnly(value) {
  const nativeValue = nativeDateValue(value);
  if (!nativeValue) return null;
  const [year, month, day] = nativeValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function orderDateKey(order) {
  const range = orderRange(order);
  return range ? localDateForInput(range.start) : "";
}

function dateKeyInRange(value, fromValue, toValue) {
  const dateKey = nativeDateValue(value);
  const from = nativeDateValue(fromValue);
  const to = nativeDateValue(toValue);
  return Boolean(dateKey) && (!from || dateKey >= from) && (!to || dateKey <= to);
}

function reportDateRange(fromInput, toInput) {
  const from = nativeDateValue(fromInput?.value || "") || localDateForInput();
  const to = nativeDateValue(toInput?.value || "") || from;
  if (from > to) {
    window.alert("Từ ngày không được lớn hơn đến ngày.");
    return null;
  }
  return { from, to };
}

function orderRouteLabel(order) {
  return order.tuyen || [order.diemDon, order.diemTra].filter(Boolean).join(" - ") || "Chưa có tuyến";
}

function sumBy(rows, getter) {
  return rows.reduce((total, row) => total + Number(getter(row) || 0), 0);
}

function topGroups(rows, keyGetter, valueGetter, limit = 4) {
  const groups = new Map();
  rows.forEach((row) => {
    const key = keyGetter(row) || "Chưa phân loại";
    const current = groups.get(key) || { label: key, count: 0, value: 0 };
    current.count += 1;
    current.value += Number(valueGetter(row) || 0);
    groups.set(key, current);
  });
  return [...groups.values()].sort((a, b) => b.value - a.value || b.count - a.count).slice(0, limit);
}

function renderMoneyStack(container, rows) {
  if (!container) return;
  container.innerHTML = rows
    .map(
      (row) => `
        <div class="money-row ${row.accent || ""}">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(formatMoney(row.value) || "0")}</strong>
        </div>
      `,
    )
    .join("");
}

function renderAlertList(container, rows) {
  if (!container) return;
  container.innerHTML = rows.length
    ? rows
        .map(
          (row) => `
            <button class="alert-item" data-action="${escapeHtml(row.action || "")}" type="button">
              <strong>${escapeHtml(row.value)}</strong>
              <span>${escapeHtml(row.label)}</span>
            </button>
          `,
        )
        .join("")
    : `<div class="empty compact-empty">Không có việc gấp cần xử lý.</div>`;
}

function renderRankList(container, rows) {
  if (!container) return;
  container.innerHTML = rows.length
    ? rows
        .map(
          (row, index) => `
            <div class="rank-row">
              <span>${index + 1}</span>
              <div>
                <strong>${escapeHtml(row.label)}</strong>
                <small>${escapeHtml(row.count)} đơn · ${escapeHtml(formatMoney(row.value) || "0")}</small>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="empty compact-empty">Chưa có dữ liệu.</div>`;
}

function renderRevenueBars(container, rows) {
  if (!container) return;
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  container.innerHTML = rows
    .map((row) => {
      const height = Math.max(Math.round((row.value / maxValue) * 100), row.value ? 8 : 2);
      const tooltipText = row.tooltipLines?.length ? row.tooltipLines.join("\n") : row.tooltip;
      const tooltip = row.tooltipLines?.length
        ? `<span class="mini-bar-tooltip">${row.tooltipLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</span>`
        : row.tooltip
          ? `<span class="mini-bar-tooltip">${escapeHtml(row.tooltip)}</span>`
        : "";
      return `
        <div class="mini-bar" title="${escapeHtml(tooltipText || `${row.label}: ${formatMoney(row.value) || "0"}`)}">
          <div class="mini-bar-track"><span style="height:${height}%"></span></div>
          <strong>${escapeHtml(row.label)}</strong>
          <small>${escapeHtml(formatMoney(row.value) || "0")}</small>
          ${tooltip}
        </div>
      `;
    })
    .join("");
}

function customerSourceForOrder(order) {
  if (order.nguonKhach) return order.nguonKhach;
  const phone = normalizePhone(order.soDienThoai);
  return state.customers.find((customer) => normalizePhone(customer.soDienThoai) === phone)?.nguonKhach || "";
}

function monthDateKeys(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const current = new Date(year, month, index + 1);
    return {
      key: localDateForInput(current),
      label: String(index + 1).padStart(2, "0"),
    };
  });
}

function renderDashboard() {
  const now = new Date();
  const selectedKey = state.filters.dashboardDate || localDateForInput(now);
  const selectedDate = parseDateOnly(selectedKey) || now;
  const dayStart = parseDateTime(`${selectedKey} 00:00`);
  const dayEnd = parseDateTime(`${selectedKey} 23:59`);
  const selectedOrders = state.orders.filter((order) => orderDateKey(order) === selectedKey && !orderIsCancelled(order));
  const selectedVehicles = rosterVehiclesForDate(selectedKey);
  const availableSelected = selectedVehicles.filter((vehicle) => {
    const plate = normalize(vehicle.bienKiemSoat);
    return !state.orders.some((order) => {
      const range = orderRange(order);
      return (
        plate &&
        range &&
        !orderIsCancelled(order) &&
        normalize(order.bienKiemSoat) === plate &&
        rangesOverlap(range.start, range.end, dayStart, dayEnd)
      );
    });
  });
  const selectedRevenue = sumBy(selectedOrders, orderRevenueAmount);
  const selectedNet = sumBy(selectedOrders, orderNetAmount);
  const selectedDeposit = sumBy(selectedOrders, (order) => parseMoney(order.daCoc));
  const monthBars = monthDateKeys(selectedDate).map((dateItem) => {
    const dayOrders = state.orders.filter((order) => orderDateKey(order) === dateItem.key && !orderIsCancelled(order));
    const companyOrders = dayOrders.filter((order) => !orderIsFranchiseVehicle(order));
    const franchiseOrders = dayOrders.filter(orderIsFranchiseVehicle);
    const value = sumBy(dayOrders, orderRevenueAmount);
    const companyValue = sumBy(companyOrders, orderRevenueAmount);
    const franchiseValue = sumBy(franchiseOrders, orderRevenueAmount);
    return {
      label: dateItem.label,
      value,
      tooltipLines: [
        `${formatDate(dateItem.key)} - Tổng ${dayOrders.length} cuốc - ${formatMoney(value) || "0"}`,
        `Xe công ty: ${companyOrders.length} cuốc - ${formatMoney(companyValue) || "0"}`,
        `Xe thương quyền: ${franchiseOrders.length} cuốc - ${formatMoney(franchiseValue) || "0"}`,
      ],
      tooltip: `${formatDate(dateItem.key)} · ${dayOrders.length} đơn · ${formatMoney(value) || "0"}`,
    };
  });
  const monthOrders = state.orders.filter((order) => {
    const key = orderDateKey(order);
    return key && key.slice(0, 7) === selectedKey.slice(0, 7) && !orderIsCancelled(order);
  });
  const monthRevenue = sumBy(monthOrders, orderRevenueAmount);
  const topSources = topGroups(monthOrders, customerSourceForOrder, orderRevenueAmount);
  const topRegions = topGroups(monthOrders, (order) => order.khuVucDatXe, orderRevenueAmount);

  if (els.dashboardDateFilter && els.dashboardDateFilter.value !== selectedKey) els.dashboardDateFilter.value = selectedKey;
  if (els.dashboardTodayLabel) els.dashboardTodayLabel.textContent = formatDate(selectedKey);
  if (els.dashboardMonthRevenueTitle) {
    els.dashboardMonthRevenueTitle.textContent = `Doanh thu tháng ${String(selectedDate.getMonth() + 1).padStart(2, "0")}/${selectedDate.getFullYear()}`;
  }
  if (els.dashboardMonthRevenueTotal) {
    const selectedMonthLabel = String(selectedDate.getMonth() + 1).padStart(2, "0") + "/" + selectedDate.getFullYear();
    const monthRevenueText = String(formatMoney(monthRevenue) || "0").replaceAll(".", ",");
    els.dashboardMonthRevenueTotal.innerHTML = "TỔNG DOANH THU THÁNG " + selectedMonthLabel + ": <span class=\"month-revenue-amount\">" + monthRevenueText + "đ</span>";
  }
  els.customerCount.textContent = state.customers.length;
  els.contractCount.textContent = state.contracts.length;
  els.openOrderCount.textContent = selectedOrders.length;
  els.doneOrderCount.textContent = selectedOrders.filter(orderIsDone).length;
  els.vehicleCount.textContent = selectedVehicles.length;
  els.availableVehicleCount.textContent = availableSelected.length;
  renderMoneyStack(els.dashboardMoneySummary, [
    { label: "Doanh thu ngày xem", value: selectedRevenue, accent: "strong" },
    { label: "Thực thu sau ưu đãi", value: selectedNet },
    { label: "Khách đã cọc", value: selectedDeposit },
    { label: "Còn phải thu", value: Math.max(selectedNet - selectedDeposit, 0) },
  ]);
  renderRevenueBars(els.dashboardMonthRevenueBars, monthBars);
  renderRankList(els.dashboardTopSources, topSources);
  renderRankList(els.dashboardRegions, topRegions);
}

function renderCustomers() {
  const rows = state.customers.filter((row) => matches(row, state.filters.customer));
  els.customerTable.innerHTML =
    rows
      .map(
        (row) => `
          <tr data-detail-type="customer" data-id="${escapeHtml(row.id)}">
            <td><strong>${escapeHtml(row.id || "")}</strong></td>
            <td><strong>${escapeHtml(row.tenKhach)}</strong></td>
            <td>${escapeHtml(row.soDienThoai)}</td>
            <td>${escapeHtml(row.soCCCD || "")}</td>
            <td>${escapeHtml(row.diaChi || "")}</td>
            <td>${escapeHtml(row.loaiKhachHang || "")}</td>
            <td>${escapeHtml(row.namSinh)}</td>
            <td>${escapeHtml(row.gioiTinh)}</td>
            <td>${escapeHtml(row.nguonKhach)}</td>
            <td>${escapeHtml(row.nhanVienNhap)}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="10" class="empty">Chưa có khách hàng.</td></tr>`;
}

function renderContracts() {
  const rows = state.contracts.filter((row) => matches(row, state.filters.contract));
  els.contractTable.innerHTML =
    rows
      .map(
        (row, index) => `
          <tr data-detail-type="contract" data-id="${escapeHtml(row.id)}">
            <td>${index + 1}</td>
            <td>${escapeHtml(row.diemDi || "")}</td>
            <td>${escapeHtml(row.diemDen || "")}</td>
            <td><strong>${escapeHtml(row.tuyen)}</strong></td>
            <td>${escapeHtml(row.ghiChu)}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="5" class="empty">Chưa có hợp đồng/tuyến.</td></tr>`;
}

function pricingRangeText(minValue, maxValue, unit = "km") {
  if (maxValue === null || maxValue === undefined || maxValue === "") return `Từ ${formatNumber(minValue)} ${unit}`;
  return `${formatNumber(minValue)} - ${formatNumber(maxValue)} ${unit}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function contractWaitText(amount) {
  const tier = (state.contractPricing?.waiting || []).find((row) => {
    const max = row.maxAmount;
    return amount >= Number(row.minAmount || 0) && (max === null || max === undefined || max === "" || amount <= Number(max));
  });
  const minutes = Number(tier?.minutes || 0);
  if (!minutes) return "Không áp dụng";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  return remain ? `${hours} giờ ${remain} phút` : `${hours} giờ`;
}

function pricingCell(value, group, rowIndex, key, editable, suffix = "") {
  const unit = suffix ? `<span class="pricing-cell-unit">${escapeHtml(suffix.trim())}</span>` : "";
  if (!editable) return `<span class="pricing-cell-value">${formatNumber(value)}${unit}</span>`;
  return `<span class="pricing-input-group"><input class="pricing-cell-input" type="number" min="0" step="1" value="${escapeHtml(value)}" data-pricing-group="${group}" data-pricing-row="${rowIndex}" data-pricing-key="${key}" aria-label="${escapeHtml(key)}" />${unit}</span>`;
}

function calculateContractPricing() {
  if (!els.contractPricingResults) return;
  const km = Number(els.contractPricingKm?.value || 0);
  const weekendMultiplier = els.contractPricingWeekend?.checked ? 1.1 : 1;
  if (!state.contractPricing || !Number.isFinite(km) || km <= 0) {
    els.contractPricingResults.innerHTML = `<div class="empty">Nhập kilomet để xem báo giá.</div>`;
    return;
  }
  const oneWayTier = (state.contractPricing.oneWay || []).find((row) => km >= Number(row.minKm || 0) && (row.maxKm === null || row.maxKm === undefined || row.maxKm === "" || km <= Number(row.maxKm)));
  const roundTripTier = (state.contractPricing.roundTrip || []).find((row) => km >= Number(row.minKm || 0) && (row.maxKm === null || row.maxKm === undefined || row.maxKm === "" || km <= Number(row.maxKm)));
  if (!oneWayTier || !roundTripTier) {
    els.contractPricingResults.innerHTML = `<div class="empty">Chưa có cấu hình phù hợp cho ${formatNumber(km)} km.</div>`;
    return;
  }
  const vehiclePrices = [
    { seat: "4", label: "Xe 4 chỗ", vehicleMultiplier: 1 },
    { seat: "7", label: "Xe 7 chỗ", vehicleMultiplier: 1 },
    { seat: "7", label: "Xe Innova", vehicleMultiplier: 1.15 },
    { seat: "16", label: "Xe 16 chỗ", vehicleMultiplier: 1 },
  ];
  els.contractPricingResults.innerHTML = vehiclePrices.map(({ seat, label, vehicleMultiplier }) => {
    const rate = Number(oneWayTier.rates?.[seat] || 0);
    // Chuyến ngắn 1-19 km không giảm chiều về: chiều về bằng 100% chiều đi.
    const returnPercent = km <= 19 ? 100 : Number(roundTripTier.percentages?.[seat] || 0);
    const baseOneWay = Math.max(0, km * rate * vehicleMultiplier);
    const oneWay = Math.round(baseOneWay * weekendMultiplier);
    const roundTripKm = km * 2;
    const roundTrip = Math.max(0, Math.round(baseOneWay * (100 + returnPercent) / 100 * weekendMultiplier));
    return `<article class="pricing-result-card">
      <h3>${label}</h3>
      <dl>
        <div><dt>Đơn giá</dt><dd>${formatMoney(rate * vehicleMultiplier)} / km</dd></div>
        <div><dt>Giá 1 chiều (${formatNumber(km)} km)</dt><dd>${formatMoney(oneWay)}</dd></div>
        <div><dt>Giá 2 chiều (${formatNumber(roundTripKm)} km)</dt><dd>${formatMoney(roundTrip)}</dd></div>
        ${vehicleMultiplier > 1 ? `<div><dt>Phụ thu dòng Innova</dt><dd>+15% giá xe 7 chỗ</dd></div>` : ""}
        <div><dt>Phụ thu cuối tuần</dt><dd>${weekendMultiplier > 1 ? "+10%" : "Không áp dụng"}</dd></div>
        <div><dt>Chiều về</dt><dd>${formatNumber(returnPercent)}% giá chiều đi</dd></div>
        <div><dt>Chờ miễn phí</dt><dd>2 chiều: ${contractWaitText(roundTrip)}</dd></div>
      </dl>
    </article>`;
  }).join("");
}

function renderContractPricing() {
  if (!els.oneWayPricingTable) return;
  const config = state.contractPricing;
  const editable = String(state.currentUser?.role || "").trim().toLowerCase() === "admin";
  if (els.saveContractPricingButton) els.saveContractPricingButton.hidden = !editable;
  if (els.contractPricingSetup) els.contractPricingSetup.hidden = false;
  if (els.contractPricingStatus) els.contractPricingStatus.hidden = !editable;
  if (!config) {
    els.oneWayPricingTable.innerHTML = `<tr><td colspan="4" class="empty">Đang tải bảng giá...</td></tr>`;
    els.roundTripPricingTable.innerHTML = `<tr><td colspan="4" class="empty">Đang tải bảng giá...</td></tr>`;
    els.waitingPricingTable.innerHTML = `<tr><td colspan="2" class="empty">Đang tải bảng giá...</td></tr>`;
    calculateContractPricing();
    return;
  }
  els.oneWayPricingTable.innerHTML = (config.oneWay || []).map((row, index) => `<tr>
    <td><strong>${pricingRangeText(row.minKm, row.maxKm)}</strong></td>
    ${["4", "7", "16"].map((seat) => `<td>${pricingCell(row.rates?.[seat] || 0, "oneWay", index, seat, editable, "đ/km")}</td>`).join("")}
  </tr>`).join("");
  els.roundTripPricingTable.innerHTML = (config.roundTrip || []).map((row, index) => `<tr>
    <td><strong>${pricingRangeText(row.minKm, row.maxKm)}</strong></td>
    ${["4", "7", "16"].map((seat) => `<td>${pricingCell(row.percentages?.[seat] || 0, "roundTrip", index, seat, editable, "%")}</td>`).join("")}
  </tr>`).join("");
  els.waitingPricingTable.innerHTML = (config.waiting || []).map((row, index) => `<tr>
    <td><strong>${pricingRangeText(row.minAmount, row.maxAmount, "đ")}</strong></td>
    <td>${pricingCell(row.minutes || 0, "waiting", index, "minutes", editable, " phút")}</td>
  </tr>`).join("");
  calculateContractPricing();
}

function benefitValueText(row) {
  const value = row.loaiGiaTri === "percent" ? `${row.giaTri}%` : formatMoney(row.giaTri);
  return value || "0";
}

function benefitKey(row, kind) {
  if (kind === "voucher") return String(row.maVoucher || row.id || "");
  return String(row.id || row.tenChuongTrinh || "");
}

function benefitIsSelectable(row) {
  return ["con han", "dang ap dung"].some((text) => normalize(row.trangThaiSuDung || row.trangThaiHieuLuc || row.trangThai).includes(text));
}

function calculateBenefitDiscount(row, baseAmount, remainingCap = baseAmount) {
  const value = Number(String(row.giaTri || "0").replace(",", "."));
  if (!Number.isFinite(value) || value <= 0 || baseAmount <= 0 || remainingCap <= 0) return 0;
  const rawDiscount = row.loaiGiaTri === "percent" ? Math.round((baseAmount * value) / 100) : parseMoney(row.giaTri);
  return Math.min(remainingCap, rawDiscount);
}

function selectedBenefitRows(kind) {
  const ids = new Set(kind === "voucher" ? state.orderBenefits.voucherIds : state.orderBenefits.promotionIds);
  const rows = kind === "voucher" ? state.vouchers : state.promotions;
  return rows.filter((row) => ids.has(benefitKey(row, kind)));
}

function orderBaseAmountPreview() {
  if (selectedContractType() === "xe_ghep") {
    return [...els.sharedPassengerList.querySelectorAll('[data-passenger-field="soTien"]')].reduce((total, input) => total + parseMoney(input.value), 0);
  }
  return parseMoney(els.orderForm.elements.giaTien?.value);
}

function selectedRowsByIds(rows, ids, kind = "voucher") {
  const selectedIds = new Set(ids.map(String));
  return rows.filter((row) => selectedIds.has(benefitKey(row, kind)));
}

function sharedPassengerPaymentPreview() {
  const usedVouchers = new Set();
  const voucherRows = [];
  const promotionRows = [];
  let baseAmount = 0;
  let manualDiscount = 0;
  let voucherDiscount = 0;
  let promotionDiscount = 0;
  let surcharge = 0;
  let deposit = 0;
  let vatAmount = 0;

  for (const passenger of collectSharedPassengers()) {
    const passengerBase = Number(passenger.soTien || 0);
    const passengerManual = Math.min(Number(passenger.giamGia || 0), passengerBase);
    const passengerSurcharge = Number(passenger.phuThu || 0);
    let remaining = Math.max(passengerBase - passengerManual, 0);
    baseAmount += passengerBase;
    manualDiscount += passengerManual;
    surcharge += passengerSurcharge;

    for (const voucher of selectedRowsByIds(state.vouchers, passenger.voucherIds || [], "voucher")) {
      const key = benefitKey(voucher, "voucher");
      if (usedVouchers.has(key)) continue;
      const discount = calculateBenefitDiscount(voucher, passengerBase, remaining);
      voucherDiscount += discount;
      remaining = Math.max(remaining - discount, 0);
      voucherRows.push(voucher);
      usedVouchers.add(key);
    }
    for (const promotion of selectedRowsByIds(state.promotions, passenger.promotionIds || [], "promotion")) {
      const discount = calculateBenefitDiscount(promotion, passengerBase, remaining);
      promotionDiscount += discount;
      remaining = Math.max(remaining - discount, 0);
      promotionRows.push(promotion);
    }
    remaining += passengerSurcharge;
    const passengerVat = passenger.yeuCauHoaDon ? Math.round(remaining * 0.08) : 0;
    vatAmount += passengerVat;
    deposit += Math.min(Number(passenger.daCoc || 0), remaining + passengerVat);
  }

  return { baseAmount, manualDiscount, surcharge, voucherRows, promotionRows, voucherDiscount, promotionDiscount, deposit, vatAmount };
}

function calculateOrderPaymentPreview() {
  const isShared = selectedContractType() === "xe_ghep";
  const sharedPreview = isShared ? sharedPassengerPaymentPreview() : null;
  const baseAmount = sharedPreview ? sharedPreview.baseAmount : orderBaseAmountPreview();
  const manualDiscount = sharedPreview ? sharedPreview.manualDiscount : Math.min(parseMoney(els.orderForm.elements.giamGia?.value), baseAmount);
  let remaining = Math.max(baseAmount - manualDiscount, 0);
  const voucherRows = sharedPreview ? sharedPreview.voucherRows : selectedBenefitRows("voucher");
  const promotionRows = sharedPreview ? sharedPreview.promotionRows : selectedBenefitRows("promotion");
  const voucherDiscount = sharedPreview
    ? sharedPreview.voucherDiscount
    : voucherRows.reduce((total, row) => {
        const discount = calculateBenefitDiscount(row, baseAmount, remaining);
        remaining = Math.max(remaining - discount, 0);
        return total + discount;
      }, 0);
  const promotionDiscount = sharedPreview
    ? sharedPreview.promotionDiscount
    : promotionRows.reduce((total, row) => {
        const discount = calculateBenefitDiscount(row, baseAmount, remaining);
        remaining = Math.max(remaining - discount, 0);
        return total + discount;
      }, 0);
  const benefitDiscount = voucherDiscount + promotionDiscount;
  const totalBenefit = manualDiscount + benefitDiscount;
  const surcharge = sharedPreview ? sharedPreview.surcharge : parseMoney(els.orderForm.elements.phuThu?.value);
  const revenueAfterDiscount = Math.max(baseAmount - manualDiscount - benefitDiscount, 0) + surcharge;
  const vatAmount = sharedPreview ? sharedPreview.vatAmount : els.invoiceToggle?.checked ? Math.round(revenueAfterDiscount * 0.08) : 0;
  const totalPayment = revenueAfterDiscount + vatAmount;
  const deposit = sharedPreview ? sharedPreview.deposit : Math.min(parseMoney(els.orderForm.elements.daCoc?.value), totalPayment);
  const commissionRate = 0;
  const commissionAmount = commissionRate > 0 ? Math.round((revenue * commissionRate) / 100) : 0;
  return {
    baseAmount,
    manualDiscount,
    voucherRows,
    promotionRows,
    voucherDiscount,
    promotionDiscount,
    totalBenefit,
    surcharge,
    benefitDiscount,
    revenue: revenueAfterDiscount,
    vatAmount,
    totalPayment,
    deposit,
    commissionRate,
    commissionAmount,
    netAmount: Math.max(totalPayment - deposit, 0),
  };
}

function benefitSummaryText(rows) {
  return rows.length ? rows.map((row) => benefitTitle(row, row.maVoucher ? "voucher" : "promotion")).join(", ") : "Không áp dụng";
}

function updateOrderPaymentSummary() {
  if (!els.orderPaymentSummary) return;
  const summary = calculateOrderPaymentPreview();
  els.orderPaymentSummary.innerHTML = `
    <div class="summary-total">
      <span>Thực thu sau ưu đãi</span>
      <strong>${escapeHtml(formatMoney(summary.revenue)) || "0"}</strong>
    </div>
    <div class="summary-grid">
      <div><span>Giá tiền / doanh thu</span><strong>${escapeHtml(formatMoney(summary.baseAmount)) || "0"}</strong></div>
      <div><span>Giảm giá thủ công</span><strong>${escapeHtml(formatMoney(summary.manualDiscount)) || "0"}</strong></div>
      <div><span>Voucher</span><strong>${escapeHtml(formatMoney(summary.voucherDiscount)) || "0"}</strong><small>${escapeHtml(benefitSummaryText(summary.voucherRows))}</small></div>
      <div><span>Khuyến mãi</span><strong>${escapeHtml(formatMoney(summary.promotionDiscount)) || "0"}</strong><small>${escapeHtml(benefitSummaryText(summary.promotionRows))}</small></div>
      <div><span>Tổng ưu đãi</span><strong>${escapeHtml(formatMoney(summary.totalBenefit)) || "0"}</strong></div>
      <div><span>Phụ thu</span><strong>${escapeHtml(formatMoney(summary.surcharge)) || "0"}</strong></div>
      <div><span>Thuế VAT (8%)</span><strong>${escapeHtml(formatMoney(summary.vatAmount)) || "0"}</strong></div>
      <div><span>Tổng thanh toán</span><strong>${escapeHtml(formatMoney(summary.totalPayment)) || "0"}</strong></div>
      <div><span>Khách đã cọc</span><strong>${escapeHtml(formatMoney(summary.deposit)) || "0"}</strong></div>
      ${
        summary.commissionRate > 0
          ? `<div class="commission"><span>Xe thương quyền nộp về</span><strong>${escapeHtml(formatMoney(summary.commissionAmount)) || "0"}</strong><small>${escapeHtml(summary.commissionRate)}% trên thực thu sau ưu đãi</small></div>`
          : ""
      }
      <div class="net"><span>Còn phải thu</span><strong>${escapeHtml(formatMoney(summary.netAmount)) || "0"}</strong></div>
    </div>
  `;
}

function voucherCampaignName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+#\d{3,}$/, "");
}

function voucherCampaigns() {
  return [...new Set(state.vouchers.map((row) => voucherCampaignName(row.tenVoucher)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
}

function renderVoucherCampaignFilter() {
  if (!els.voucherCampaignFilter) return;
  const selected = state.filters.voucherCampaign || "";
  const campaigns = voucherCampaigns();
  els.voucherCampaignFilter.innerHTML = [
    `<option value="">Tất cả chiến dịch</option>`,
    ...campaigns.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`),
  ].join("");
  if (selected && campaigns.includes(selected)) {
    els.voucherCampaignFilter.value = selected;
  } else {
    state.filters.voucherCampaign = "";
  }
}

function renderVouchers() {
  renderVoucherCampaignFilter();
  const rows = state.vouchers
    .filter((row) => matches(row, state.filters.voucher))
    .filter((row) => !state.filters.voucherCampaign || voucherCampaignName(row.tenVoucher) === state.filters.voucherCampaign)
    .sort(
      (a, b) =>
        voucherCampaignName(a.tenVoucher).localeCompare(voucherCampaignName(b.tenVoucher), "vi") ||
        String(a.maVoucher || "").localeCompare(String(b.maVoucher || ""), "vi"),
    );
  els.voucherTable.innerHTML =
    rows
      .map(
        (row, index) => `
          <tr data-detail-type="voucher" data-id="${escapeHtml(row.id)}">
            <td><input class="voucher-print-checkbox" type="checkbox" data-voucher-print-id="${escapeHtml(row.id)}" aria-label="Chọn in voucher ${escapeHtml(row.maVoucher)}" ${state.selectedVoucherIds.has(String(row.id)) ? "checked" : ""} /></td>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(row.maVoucher)}</strong></td>
            <td>${escapeHtml(voucherCampaignName(row.tenVoucher))}</td>
            <td>${escapeHtml(benefitValueText(row))}</td>
            <td>${escapeHtml(row.ngayBatDau || row.ngayHetHan ? [row.ngayBatDau, row.ngayHetHan || "Không giới hạn"].filter(Boolean).join(" - ") : "Không giới hạn")}</td>
            <td><span class="pill ${normalize(row.trangThaiSuDung).includes("da su dung") ? "done" : benefitIsSelectable(row) ? "running" : "cancelled"}">${escapeHtml(row.trangThaiSuDung || row.trangThai || "")}</span></td>
            <td>${row.donHangId ? `<strong>${escapeHtml(row.tenKhach || "")}</strong><div class="muted">${escapeHtml(row.donHangId)}</div>` : '<span class="muted">Chưa sử dụng</span>'}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="8" class="empty">Chưa có voucher.</td></tr>`;
  const visibleIds = rows.map((row) => String(row.id));
  const selectedVisibleCount = visibleIds.filter((id) => state.selectedVoucherIds.has(id)).length;
  if (els.selectAllVouchersCheckbox) {
    els.selectAllVouchersCheckbox.checked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
    els.selectAllVouchersCheckbox.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
  }
  if (els.printSelectedVouchersButton) {
    const count = state.selectedVoucherIds.size;
    els.printSelectedVouchersButton.disabled = count === 0;
    els.printSelectedVouchersButton.textContent = count ? `In ${count} voucher đã chọn` : "In voucher đã chọn";
  }
  if (els.deleteVoucherCampaignButton) {
    const campaign = state.filters.voucherCampaign || "";
    const campaignCount = state.vouchers.filter((row) => voucherCampaignName(row.tenVoucher) === campaign).length;
    els.deleteVoucherCampaignButton.hidden = !campaign || !can("manage_benefits");
    els.deleteVoucherCampaignButton.disabled = !campaignCount;
    els.deleteVoucherCampaignButton.textContent = campaignCount
      ? `Xóa toàn bộ chiến dịch (${campaignCount})`
      : "Xóa toàn bộ chiến dịch";
  }
}

function renderPromotions() {
  const rows = state.promotions.filter((row) => matches(row, state.filters.promotion));
  els.promotionTable.innerHTML =
    rows
      .map(
        (row, index) => `
          <tr data-detail-type="promotion" data-id="${escapeHtml(row.id)}">
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(row.tenChuongTrinh)}</strong></td>
            <td>${escapeHtml(benefitValueText(row))}</td>
            <td>${escapeHtml(row.ngayBatDau || row.ngayHetHan ? [row.ngayBatDau, row.ngayHetHan || "Không giới hạn"].filter(Boolean).join(" - ") : "Không giới hạn")}</td>
            <td><span class="pill ${benefitIsSelectable(row) ? "running" : "cancelled"}">${escapeHtml(row.trangThaiHieuLuc || row.trangThai || "")}</span></td>
            <td>${escapeHtml(row.ghiChu || "")}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="6" class="empty">Chưa có chương trình khuyến mãi.</td></tr>`;
}

function renderVehicles() {
  const rows = uniqueRosterVehicles().filter((row) => matches(row, state.filters.vehicle));
  els.vehicleTable.innerHTML =
    rows
      .map(
        (row) => `
          <tr>
            <td><strong>${escapeHtml(row.bienKiemSoat)}</strong></td>
            <td>${escapeHtml(formatDate(row.thoiGianTao))}</td>
            <td>${escapeHtml(row.soHieuXe)}</td>
            <td>${escapeHtml(row.loai_xe || row.loaiXe)}</td>
            <td>${escapeHtml(row.so_cho || row.soCho)}</td>
            <td>${escapeHtml(driverText(row))}</td>
            <td>${escapeHtml(row.khuVucHoatDong)}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="7" class="empty">Chưa có xe lên ca.</td></tr>`;
}

function renderFranchiseVehicles() {
  const rows = state.franchiseVehicles.filter((row) => matches(row, state.filters.franchiseVehicle));
  els.franchiseVehicleTable.innerHTML =
    rows
      .map(
        (row) => `
          <tr data-detail-type="franchiseVehicle" data-id="${escapeHtml(row.id)}">
            <td><strong>${escapeHtml(row.bienKiemSoat)}</strong></td>
            <td>${escapeHtml(row.dongXe || "")}</td>
            <td>${escapeHtml(row.hieuXe || "")}${row.soCho ? `<div class="muted">${escapeHtml(row.soCho)}</div>` : ""}</td>
            <td><strong>${escapeHtml(row.tenChuXe || "")}</strong><div class="muted">${escapeHtml(row.soDienThoaiChuXe || "")}</div></td>
            <td><strong>${escapeHtml(row.hoTenLaiXe || "")}</strong><div class="muted">${escapeHtml(row.soDienThoaiLaiXe || "")}</div>${row.diaChiLaiXe ? `<div class="muted">${escapeHtml(row.diaChiLaiXe)}</div>` : ""}</td>
            <td><span class="pill ${normalize(row.trangThai).includes("ngung") ? "" : "done"}">${escapeHtml(row.trangThai || "Đang hợp tác")}</span></td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="6" class="empty">Chưa có xe thương quyền.</td></tr>`;
}

function renderInvoiceOrders() {
  if (!els.invoiceOrderTable) return;
  const fromDate = nativeDateValue(els.invoiceReportDateInput?.value || "");
  const toDate = nativeDateValue(els.invoiceReportDateToInput?.value || "");
  const rows = state.invoiceOrders
    .filter((row) => matches(row, state.filters.invoiceOrder))
    .filter((row) => dateKeyInRange(orderDateKey(row), fromDate, toDate))
    .filter((row) => !state.filters.invoiceStatus || invoiceOrderStatus(row) === state.filters.invoiceStatus);
  const invoiceBeforeVatTotal = rows.reduce((total, row) => total + invoiceFinancialAmounts(row).beforeVat, 0);
  const invoiceVatTotal = rows.reduce((total, row) => total + invoiceFinancialAmounts(row).vat, 0);
  const invoiceAfterVatTotal = rows.reduce((total, row) => total + invoiceFinancialAmounts(row).total, 0);
  const issuedCount = rows.filter((row) => normalize(invoiceOrderStatus(row)) === "da xuat").length;
  renderReportViewSummary(els.invoiceReportSummary, [
    ["Tổng tiền chưa VAT", formatMoney(invoiceBeforeVatTotal) || "0"],
    ["Số tiền VAT", formatMoney(invoiceVatTotal) || "0"],
    ["Tổng sau VAT", formatMoney(invoiceAfterVatTotal) || "0"],
    ["Số hóa đơn", rows.length],
    ["Đã xuất", issuedCount],
    ["Chưa xuất", rows.length - issuedCount],
  ]);
  els.invoiceOrderTable.innerHTML =
    rows
      .map((row) => {
        const status = invoiceOrderStatus(row);
        const isIssued = normalize(status) === "da xuat";
        const financial = invoiceFinancialAmounts(row);
        const routeText = row.tuyen || row.loaiHopDong || "";
        const points = [row.diemDon, row.diemTra].filter(Boolean).join(" -> ");
        const action = can("manage_invoices")
          ? `<button class="small ${isIssued ? "secondary" : ""}" data-action="mark-invoice-status" data-order-id="${escapeHtml(row.id)}" data-entity-type="${escapeHtml(row.invoiceEntityType || "order")}" data-status="${isIssued ? "Chưa xuất" : "Đã xuất"}" type="button">${isIssued ? "Đánh dấu chưa xuất" : "Xác nhận đã xuất"}</button>`
          : "";
        return `
          <tr ${row.invoiceEntityType === "invoiceGroup" ? "" : `data-detail-type="order" data-id="${escapeHtml(row.id)}"`}>
            <td><strong>${escapeHtml(row.orderCode || row.id)}</strong>${row.invoiceEntityType === "sharedPassenger" ? `<div class="muted">Khách ghép: ${escapeHtml(row.id)}</div>` : ""}${row.invoiceEntityType === "invoiceGroup" ? `<div class="muted">${escapeHtml(row.soDonTrongNhom || 0)} đơn hàng</div>` : ""}</td>
            <td><strong>${escapeHtml(formatDateTime(row.ngayGioDi))}</strong></td>
            <td><strong>${escapeHtml(row.tenKhach || "")}</strong><div class="muted">${escapeHtml(row.soDienThoai || "")}</div></td>
            <td><strong>${escapeHtml(row.tenCongTy || row.tenKhach || "")}</strong><div class="muted">MST: ${escapeHtml(row.maSoThue || "")}</div>${row.nhomHoaDonId ? `<div class="muted">Nhóm HĐ: ${escapeHtml(row.nhomHoaDonId)}</div>` : ""}<div class="muted">${escapeHtml(row.diaChiHoaDon || "")}</div><div class="muted">${escapeHtml(row.emailHoaDon || "")}</div></td>
            <td><strong>${escapeHtml(routeText)}</strong><div class="muted">${escapeHtml(points)}</div></td>
            <td>
              <div>Chưa VAT: <strong>${escapeHtml(formatMoney(financial.beforeVat)) || "0"}</strong></div>
              <div class="muted">VAT: ${escapeHtml(formatMoney(financial.vat)) || "0"}</div>
              <div>Sau VAT: <strong>${escapeHtml(formatMoney(financial.total)) || "0"}</strong></div>
            </td>
            <td><span class="pill ${isIssued ? "done" : "running"}">${escapeHtml(status)}</span>${row.ngayXuatHoaDon ? `<div class="muted">${escapeHtml(formatDateTime(row.ngayXuatHoaDon))}</div>` : ""}${row.nguoiXuatHoaDon ? `<div class="muted">${escapeHtml(row.nguoiXuatHoaDon)}</div>` : ""}</td>
            <td class="action-cell">${action}</td>
          </tr>
        `;
      })
      .join("") || `<tr><td colspan="8" class="empty">Không có hóa đơn trong ngày đã chọn.</td></tr>`;
}

function debtOrderStatus(row) {
  return row.trangThaiCongNo || "Chưa thu hồi";
}

function renderReportViewSummary(container, items) {
  if (!container) return;
  container.innerHTML = items.map(([label, value]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `).join("");
}

function renderDebtOrders() {
  if (!els.debtOrderTable) return;
  const fromDate = nativeDateValue(els.debtReportDateInput?.value || "");
  const toDate = nativeDateValue(els.debtReportDateToInput?.value || "");
  const rows = state.debtOrders
    .filter((row) => matches(row, state.filters.debtOrder))
    .filter((row) => dateKeyInRange(orderDateKey(row), fromDate, toDate))
    .filter((row) => !state.filters.debtStatus || debtOrderStatus(row) === state.filters.debtStatus);
  const debtTotal = rows.reduce((total, row) => total + parseMoney(row.soTienCongNo), 0);
  const recoveredTotal = rows
    .filter((row) => normalize(debtOrderStatus(row)) === "da thu hoi")
    .reduce((total, row) => total + parseMoney(row.soTienCongNo), 0);
  renderReportViewSummary(els.debtReportSummary, [
    ["Số đơn công nợ", rows.length],
    ["Tổng công nợ", formatMoney(debtTotal) || "0"],
    ["Đã thu hồi", formatMoney(recoveredTotal) || "0"],
    ["Chưa thu hồi", formatMoney(Math.max(debtTotal - recoveredTotal, 0)) || "0"],
  ]);
  els.debtOrderTable.innerHTML =
    rows
      .map((row) => {
        const status = debtOrderStatus(row);
        const recovered = normalize(status) === "da thu hoi";
        const routeLabel = row.tuyen || [row.diemDon, row.diemTra].filter(Boolean).join(" -> ");
        const entityType = row.debtEntityType || "order";
        const orderCode = row.orderCode || row.id || "";
        const sharedPassengerLabel = entityType === "sharedPassenger"
          ? `<div class="muted">Khách ghép: ${escapeHtml(row.id || "")}</div>`
          : "";
        const action = can("manage_debts")
          ? `<button class="small ${recovered ? "secondary" : ""}" data-action="mark-debt-status" data-order-id="${escapeHtml(row.id)}" data-entity-type="${escapeHtml(entityType)}" data-status="${recovered ? "Chưa thu hồi" : "Đã thu hồi"}" type="button">${recovered ? "Chuyển về chưa thu hồi" : "Xác nhận đã thu hồi"}</button>`
          : "";
        return `
          <tr data-detail-type="order" data-id="${escapeHtml(orderCode)}">
            <td><strong>${escapeHtml(orderCode)}</strong>${sharedPassengerLabel}</td>
            <td><strong>${escapeHtml(formatDateTime(row.ngayGioDi))}</strong></td>
            <td><strong>${escapeHtml(row.tenKhach || "")}</strong><div class="muted">${escapeHtml(row.soDienThoai || "")}</div></td>
            <td><strong>${escapeHtml(row.congNoChoAi || "")}</strong></td>
            <td><strong>${escapeHtml(routeLabel)}</strong></td>
            <td><strong>${escapeHtml(formatMoney(row.soTienCongNo)) || "0"}</strong><div class="muted">VAT ${escapeHtml(formatMoney(row.thueVAT)) || "0"} · Cọc ${escapeHtml(formatMoney(row.daCoc)) || "0"}</div></td>
            <td><span class="pill ${recovered ? "done" : "running"}">${escapeHtml(status)}</span>${row.ngayThuHoiCongNo ? `<div class="muted">${escapeHtml(formatDateTime(row.ngayThuHoiCongNo))}</div>` : ""}${row.nguoiThuHoiCongNo ? `<div class="muted">${escapeHtml(row.nguoiThuHoiCongNo)}</div>` : ""}</td>
            <td class="action-cell">${action}</td>
          </tr>
        `;
      })
      .join("") || `<tr><td colspan="8" class="empty">Không có đơn công nợ trong ngày đã chọn.</td></tr>`;
}

function commissionOrderStatus(row) {
  return row.trangThaiHoaHong || "Chưa thu";
}

function renderCommissionOrders() {
  if (!els.commissionOrderTable) return;
  const fromDate = nativeDateValue(els.commissionReportDateInput?.value || "");
  const toDate = nativeDateValue(els.commissionReportDateToInput?.value || "");
  const rows = state.commissionOrders
    .filter((row) => matches(row, state.filters.commissionOrder))
    .filter((row) => dateKeyInRange(orderDateKey(row), fromDate, toDate))
    .filter((row) => !state.filters.commissionStatus || commissionOrderStatus(row) === state.filters.commissionStatus);
  const commissionTotal = rows.reduce((total, row) => total + parseMoney(row.soTienNopLai), 0);
  const collectedTotal = rows
    .filter((row) => normalize(commissionOrderStatus(row)) === "da thu")
    .reduce((total, row) => total + parseMoney(row.soTienNopLai), 0);
  renderReportViewSummary(els.commissionReportSummary, [
    ["Số đơn xe thương quyền", rows.length],
    ["Tổng hoa hồng", formatMoney(commissionTotal) || "0"],
    ["Đã thu", formatMoney(collectedTotal) || "0"],
    ["Chưa thu", formatMoney(Math.max(commissionTotal - collectedTotal, 0)) || "0"],
  ]);
  els.commissionOrderTable.innerHTML =
    rows
      .map((row) => {
        const status = commissionOrderStatus(row);
        const collected = normalize(status) === "da thu";
        const routeLabel = row.tuyen || [row.diemDon, row.diemTra].filter(Boolean).join(" → ");
        const action = can("manage_commissions")
          ? `<button class="small ${collected ? "secondary" : ""}" data-action="mark-commission-status" data-order-id="${escapeHtml(row.id)}" data-status="${collected ? "Chưa thu" : "Đã thu"}" type="button">${collected ? "Chuyển về chưa thu" : "Xác nhận đã thu"}</button>`
          : "";
        return `
          <tr data-detail-type="order" data-id="${escapeHtml(row.id)}">
            <td><strong>${escapeHtml(row.id || "")}</strong></td>
            <td><strong>${escapeHtml(formatDateTime(row.ngayGioDi))}</strong></td>
            <td><strong>${escapeHtml(row.tenKhach || "")}</strong><div class="muted">${escapeHtml(row.soDienThoai || "")}</div></td>
            <td><strong>${escapeHtml(row.bienKiemSoat || "")}</strong><div class="muted">${escapeHtml(row.hoTenLaiXe || "")}</div></td>
            <td><strong>${escapeHtml(routeLabel)}</strong></td>
            <td><strong>${escapeHtml(formatMoney(row.soTienNopLai)) || "0"}</strong><div class="muted">${escapeHtml(row.tyLeNopLai || "0")}%</div></td>
            <td><span class="pill ${collected ? "done" : "running"}">${escapeHtml(status)}</span>${row.ngayThuHoaHong ? `<div class="muted">${escapeHtml(formatDateTime(row.ngayThuHoaHong))}</div>` : ""}${row.nguoiThuHoaHong ? `<div class="muted">${escapeHtml(row.nguoiThuHoaHong)}</div>` : ""}</td>
            <td class="action-cell">${action}</td>
          </tr>
        `;
      })
      .join("") || `<tr><td colspan="8" class="empty">Không có hoa hồng xe thương quyền trong ngày đã chọn.</td></tr>`;
}

function renderOrderFeedback() {
  if (!els.orderFeedbackTable) return;
  const feedbackByOrder = new Map(state.orderFeedback.map((row) => [String(row.donHangId || ""), row]));
  const rows = state.orders
    .filter((order) => orderIsDone(order))
    .map((order) => ({ order, feedback: feedbackByOrder.get(String(order.id || "")) || null }))
    .filter(({ order, feedback }) => matches({ ...order, ...(feedback || {}) }, state.filters.orderFeedback))
    .filter(({ order }) => dateKeyInRange(orderDateKey(order), els.orderFeedbackDateFromInput?.value, els.orderFeedbackDateToInput?.value))
    .filter(({ feedback }) => {
      if (state.filters.orderFeedbackStatus === "done") return Boolean(feedback);
      if (state.filters.orderFeedbackStatus === "pending") return !feedback;
      return true;
    })
    .sort((left, right) => {
      const leftTime = parseDateTime(left.order.ngayGioHoanThanh || left.order.ngayGioDi)?.getTime() || 0;
      const rightTime = parseDateTime(right.order.ngayGioHoanThanh || right.order.ngayGioDi)?.getTime() || 0;
      return rightTime - leftTime;
    });

  els.orderFeedbackTable.innerHTML =
    rows
      .map(({ order, feedback }) => {
        const hasFeedback = Boolean(feedback);
        const route = order.tuyen || [order.diemDon, order.diemTra].filter(Boolean).join(" → ");
        const response = feedback
          ? `<strong>${escapeHtml(feedback.noiDungPhanHoi || "")}</strong>${feedback.ketQuaXuLy ? `<div class="muted">Kết quả: ${escapeHtml(feedback.ketQuaXuLy)}</div>` : ""}`
          : `<span class="muted">Chưa ghi nhận phản hồi</span>`;
        return `
          <tr data-detail-type="order" data-id="${escapeHtml(order.id)}">
            <td><strong>${escapeHtml(order.id || "")}</strong></td>
            <td><strong>${escapeHtml(formatDateTime(order.ngayGioDi))}</strong></td>
            <td>${escapeHtml(formatDateTime(order.ngayGioHoanThanh))}</td>
            <td><strong>${escapeHtml(order.tenKhach || "")}</strong><div class="muted">${escapeHtml(order.soDienThoai || "")}</div></td>
            <td><strong>${escapeHtml(route)}</strong></td>
            <td>${feedback?.diemDanhGia ? `<strong>${escapeHtml(feedback.diemDanhGia)}/10</strong><div class="muted">${escapeHtml(feedback.kenhChamSoc || "")}</div>` : "—"}</td>
            <td>${response}</td>
            <td><span class="pill ${hasFeedback ? "done" : "running"}">${hasFeedback ? "Đã phản hồi" : "Chưa phản hồi"}</span></td>
            <td class="action-cell"><button class="small ${hasFeedback ? "secondary" : ""}" data-action="open-order" data-order-id="${escapeHtml(order.id)}" type="button">${hasFeedback ? "Xem / cập nhật" : "Nhập phản hồi"}</button></td>
          </tr>
        `;
      })
      .join("") || `<tr><td colspan="9" class="empty">Chưa có đơn hàng hoàn thành phù hợp trong khoảng ngày đã chọn.</td></tr>`;
}

function syncCskhShiftForm() {
  if (!els.cskhShiftReportForm) return;
  const form = els.cskhShiftReportForm;
  const isMarketing = state.currentUser?.role === "marketing";
  form.elements.nhanVienTruc.value = state.currentUser?.displayName || state.currentUser?.username || "";
  if (!form.elements.ngay.value) form.elements.ngay.value = localDateForInput();
  form.elements.thoiGian.value = form.elements.caLamViec.value === "2" ? "14:30 - 22:00" : "07:00 - 14:30";
  [...form.querySelectorAll("label")].forEach((label) => {
    label.hidden = isMarketing && !label.querySelector('[name="ngay"]');
  });
  if (els.cskhShiftReportSubmitButton) els.cskhShiftReportSubmitButton.hidden = isMarketing;
  if (els.cskhShiftReportStatus) {
    els.cskhShiftReportStatus.textContent = isMarketing
      ? "Chọn ngày để xem và xuất báo cáo ca CSKH."
      : "";
  }
}

function orderCreatedDateKey(order) {
  const createdAt = String(order?.createdAt || "").trim();
  if (!createdAt) return "";
  const parsed = new Date(createdAt);
  return Number.isNaN(parsed.getTime()) ? nativeDateValue(createdAt) : localDateForInput(parsed);
}

function prefillCskhB2cOrderTotal() {
  const form = els.cskhShiftReportForm;
  const input = form?.elements?.tongSoLuongDonChot;
  const selectedDate = form?.elements?.ngay?.value;
  if (!input || !selectedDate) return;
  const total = state.orders.reduce((count, order) => {
    if (orderCreatedDateKey(order) !== selectedDate) return count;
    if (!orderIsSharedRide(order)) {
      return count + (normalize(order.loaiKhach) === "b2c" ? 1 : 0);
    }
    const passengers = Array.isArray(order.khachXeGhep) ? order.khachXeGhep : [];
    return count + passengers.filter((passenger) => (
      normalize(passenger.loaiKhach || "B2C") === "b2c"
    )).length;
  }, 0);
  input.value = String(total);
}

function renderCskhShiftReports() {
  if (!els.cskhShiftReportTable) return;
  const numericHeaders = [
    "Số lượng tin nhắn meta", "Số lượng khách phản hồi", "Số lượng cuộc gọi", "Số lượng chat zalo",
    "Số lượng khách từ website", "Số lượng khách từ Email", "Số lượng tin nhắn khách vãng lai",
    "Số lượng khách phản hồi từ tiktok", "Tổng số lượng đơn chốt",
  ];
  const fromDate = els.cskhShiftReportFromInput?.value || localDateForInput();
  const toDate = els.cskhShiftReportToInput?.value || fromDate;
  const currentEmployee = state.currentUser?.displayName || state.currentUser?.username || "";
  els.cskhShiftReportTable.innerHTML = state.cskhShiftReports
    .filter((row) => dateKeyInRange(row["Ngày"], fromDate, toDate))
    .slice()
    .reverse()
    .map((row) => {
      const canDelete = state.currentUser?.role === "admin"
        || (state.currentUser?.role === "cskh" && normalize(row["Nhân Viên Trực"]) === normalize(currentEmployee));
      return `<tr>
      <td>${escapeHtml(row["Ngày"] || "")}</td><td><strong>${escapeHtml(row["Nhân Viên Trực"] || "")}</strong></td>
      <td>${escapeHtml(row["Ca Làm Việc"] || "")}</td><td>${escapeHtml(row["Thời Gian"] || "")}</td>
      ${numericHeaders.map((header) => `<td>${escapeHtml(row[header] ?? 0)}</td>`).join("")}
      <td>${canDelete ? `<button class="small danger" data-action="delete-cskh-shift-report" data-report-date="${escapeHtml(row["Ngày"] || "")}" data-report-shift="${escapeHtml(row["Ca Làm Việc"] || "")}" data-report-employee="${escapeHtml(row["Nhân Viên Trực"] || "")}" type="button">Xóa</button>` : "—"}</td>
    </tr>`;
    })
    .join("") || `<tr><td colspan="14" class="empty">Chưa có báo cáo ca.</td></tr>`;
  syncCskhShiftForm();
}

function renderCalendar() {
  if (!els.calendarDateInput.value) els.calendarDateInput.value = localDateForInput();
  const date = els.calendarDateInput.value;
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);
  const rosterVehicles = rosterVehiclesForDate(date).map((vehicle) => ({
    plate: vehicle.bienKiemSoat,
    code: vehicle.soHieuXe || "",
    type: vehicle.loai_xe || vehicle.loaiXe || "",
    seats: vehicle.so_cho || vehicle.soCho || "",
    driver: driverText(vehicle),
    source: "Xe công ty",
  }));
  const franchiseVehicles = activeFranchiseVehicles().map((vehicle) => ({
    plate: vehicle.bienKiemSoat,
    code: vehicle.dongXe || "",
    type: vehicle.hieuXe || "",
    seats: vehicle.soCho || vehicle.so_cho || "",
    driver: vehicle.hoTenLaiXe || "",
    source: "Xe thương quyền",
  }));
  const vehicleMap = new Map();
  [...rosterVehicles, ...franchiseVehicles]
    .filter((vehicle) => !normalize([vehicle.code, vehicle.type, vehicle.seats].filter(Boolean).join(" ")).includes("tai van 945 kg"))
    .forEach((vehicle) => {
      if (vehicle.plate && !vehicleMap.has(normalize(vehicle.plate))) vehicleMap.set(normalize(vehicle.plate), vehicle);
    });
  const orderIndex = new Map(
    state.calendarVehicleOrder.map((row, index) => [normalize(row.bienKiemSoat || row), Number(row.thuTu || index + 1)]),
  );
  const orderedVehicles = [...vehicleMap.values()]
    .map((vehicle, originalIndex) => ({ vehicle, originalIndex }))
    .sort((left, right) => {
      const leftOwnershipOrder = left.vehicle.source === "Xe công ty" ? 0 : 1;
      const rightOwnershipOrder = right.vehicle.source === "Xe công ty" ? 0 : 1;
      if (leftOwnershipOrder !== rightOwnershipOrder) return leftOwnershipOrder - rightOwnershipOrder;
      const leftOrder = orderIndex.get(normalize(left.vehicle.plate));
      const rightOrder = orderIndex.get(normalize(right.vehicle.plate));
      if (leftOrder != null && rightOrder != null) return leftOrder - rightOrder;
      if (leftOrder != null) return -1;
      if (rightOrder != null) return 1;
      return left.originalIndex - right.originalIndex;
    })
    .map(({ vehicle }) => vehicle);
  const vehicles = orderedVehicles.map((vehicle) => {
    const orders = state.orders.filter((order) => {
      if (orderIsCancelled(order) || normalize(order.bienKiemSoat) !== normalize(vehicle.plate)) return false;
      const range = orderRange(order);
      return !range || rangesOverlap(range.start, range.end, dayStart, dayEnd);
    });
    return { vehicle, orders, busy: orders.length > 0 };
  });
  const filter = els.calendarAvailabilityFilter.value;
  const ownershipFilter = els.calendarOwnershipFilter?.value || "";
  const canReorder = canView("calendar") && !filter && !ownershipFilter;
  els.calendarResetOrderButton?.classList.toggle("hidden", !canView("calendar"));
  const rows = vehicles
    .filter((row) => (filter === "available" ? !row.busy : filter === "busy" ? row.busy : true))
    .filter((row) => (
      ownershipFilter === "company"
        ? row.vehicle.source === "Xe công ty"
        : ownershipFilter === "franchise"
          ? row.vehicle.source === "Xe thương quyền"
          : true
    ));
  const busyCount = vehicles.filter((row) => row.busy).length;
  const minutesInDay = 24 * 60;
  els.dispatchSummary.innerHTML = `
    <article><span>Tổng xe khả dụng</span><strong>${vehicles.length}</strong></article>
    <article><span>Trống cả ngày</span><strong>${vehicles.length - busyCount}</strong></article>
    <article><span>Có lịch bận</span><strong>${busyCount}</strong></article>
    <article><span>Ngày xem</span><strong>${date.split("-").reverse().join("/")}</strong></article>
  `;
  els.dispatchTable.innerHTML =
    `
      <div class="timeline-head">
        <div></div>
        <div class="timeline-hours">
          ${Array.from({ length: 13 }, (_, index) => `<span style="left:${(index / 12) * 100}%">${String(index * 2).padStart(2, "0")}:00</span>`).join("")}
        </div>
      </div>
      ${
        rows
          .map(({ vehicle, orders, busy }) => {
            const rawSeats = String(vehicle.seats || "").trim();
            const seatsLabel = rawSeats ? (normalize(rawSeats).includes("cho") ? rawSeats : `${rawSeats} chỗ`) : "Chưa có số chỗ";
            const blocks = orders
              .map((order) => {
                const range = orderRange(order);
                if (!range) return "";
                const start = new Date(Math.max(range.start.getTime(), dayStart.getTime()));
                const end = new Date(Math.min(range.end.getTime(), dayEnd.getTime()));
                const startMinutes = start.getHours() * 60 + start.getMinutes();
                const endMinutes = Math.max(end.getHours() * 60 + end.getMinutes(), startMinutes + 20);
                const left = Math.max((startMinutes / minutesInDay) * 100, 0);
                const width = Math.min(((endMinutes - startMinutes) / minutesInDay) * 100, 100 - left);
                const done = orderIsDone(order);
                const tourLabel = order.tuyen || order.loaiHopDong || "Chưa có tuyến";
                return `<button class="timeline-block ${done ? "done" : ""}" data-action="open-order" data-order-id="${escapeHtml(order.id)}" style="left:${left}%;width:${Math.max(width, 2)}%" type="button" title="${escapeHtml(tourLabel)} - ${escapeHtml(formatDateTime(order.ngayGioDi))} đến ${escapeHtml(formatDateTime(order.ngayGioHoanThanh || order.ngayGioDuKienKetThuc))}">
                  <strong>${escapeHtml(tourLabel)}</strong>
                  <span>${escapeHtml(formatTime(order.ngayGioDi))} - ${escapeHtml(formatTime(order.ngayGioHoanThanh || order.ngayGioDuKienKetThuc))}${done ? " · Đã hoàn thành" : ""}</span>
                </button>`;
              })
              .join("");
            return `
              <div class="timeline-row ${busy ? "busy" : ""} ${canReorder ? "calendar-sortable-row" : ""}" data-vehicle-plate="${escapeHtml(vehicle.plate)}" data-vehicle-source="${escapeHtml(vehicle.source)}" draggable="${canReorder ? "true" : "false"}">
                <div class="timeline-vehicle">
                  <strong>${escapeHtml(vehicle.plate)}</strong>
                  <span>${escapeHtml([vehicle.code, seatsLabel, vehicle.source].filter(Boolean).join(" · "))}</span>
                  <span>${escapeHtml(vehicle.driver || "Chưa có lái xe")}</span>
                  ${canReorder ? '<span class="calendar-drag-hint">⋮⋮ Kéo để sắp xếp</span>' : ""}
                </div>
                <div class="timeline-track">
                  ${blocks || '<span class="timeline-free">Trống cả ngày</span>'}
                </div>
              </div>
            `;
          })
          .join("") || `<div class="empty">Không có xe phù hợp.</div>`
      }
    `;
}

let draggedCalendarRow = null;
let draggedCalendarInitialOrder = "";

function calendarVehiclePlateOrder() {
  return [...els.dispatchTable.querySelectorAll(".timeline-row[data-vehicle-plate]")]
    .map((row) => row.dataset.vehiclePlate || "")
    .filter(Boolean);
}

async function saveCalendarVehicleOrder() {
  const plates = calendarVehiclePlateOrder();
  state.calendarVehicleOrder = plates.map((bienKiemSoat, index) => ({ bienKiemSoat, thuTu: index + 1 }));
  try {
    await fetchJson("/api/calendar-vehicle-order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bienKiemSoat: plates }),
    });
    if (els.syncStatus) els.syncStatus.textContent = "Đã lưu thứ tự xe trong lịch điều xe.";
  } catch (error) {
    if (els.syncStatus) els.syncStatus.textContent = error.message;
    await loadData();
  }
}

function selectedBenefitIds(container) {
  if (!container) return [];
  if (container === els.orderVoucherPicker) return [...state.orderBenefits.voucherIds];
  if (container === els.orderPromotionPicker) return [...state.orderBenefits.promotionIds];
  return [...container.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value).filter(Boolean);
}

function benefitDateText(row) {
  const start = row.ngayBatDau ? `Từ ${row.ngayBatDau}` : "";
  const end = row.ngayHetHan ? `Đến ${row.ngayHetHan}` : "Không giới hạn";
  return [start, end].filter(Boolean).join(" · ");
}

function renderBenefitPicker(container, rows, selectedIds, emptyText, kind) {
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = `<div class="empty compact-empty">${escapeHtml(emptyText)}</div>`;
    return;
  }
  container.innerHTML = rows
    .map((row) => {
      const title =
        kind === "voucher"
          ? `${row.maVoucher || ""} - ${voucherCampaignName(row.tenVoucher)}`.replace(/^ - /, "")
          : row.tenChuongTrinh || "";
      const key = benefitKey(row, kind);
      const checked = selectedIds.has(key) ? "checked" : "";
      const meta = [benefitValueText(row), benefitDateText(row)].filter(Boolean).join(" · ");
      return `
        <label class="benefit-option">
          <input type="checkbox" value="${escapeHtml(key)}" ${checked} />
          <span>
            <strong>${escapeHtml(title)}</strong>
            <small>${escapeHtml(meta || "Đang áp dụng")}</small>
          </span>
        </label>
      `;
    })
    .join("");
}

function benefitTitle(row, kind) {
  return kind === "voucher" ? `${row.maVoucher || ""} - ${voucherCampaignName(row.tenVoucher)}`.replace(/^ - /, "") : row.tenChuongTrinh || "";
}

function renderCompactBenefitPicker(container, rows, kind) {
  if (!container) return;
  const isVoucher = kind === "voucher";
  const selectedIds = new Set(isVoucher ? state.orderBenefits.voucherIds : state.orderBenefits.promotionIds);
  const open = isVoucher ? state.orderBenefits.voucherOpen : state.orderBenefits.promotionOpen;
  const search = isVoucher ? state.orderBenefits.voucherSearch : state.orderBenefits.promotionSearch;
  const selectedRows = rows.filter((row) => selectedIds.has(benefitKey(row, kind)));
  const selectedHtml = selectedRows.length
    ? selectedRows
        .map((row) => {
          const key = benefitKey(row, kind);
          return `<span class="benefit-chip">${escapeHtml(benefitTitle(row, kind))} <button type="button" data-action="remove-benefit" data-kind="${kind}" data-id="${escapeHtml(key)}">×</button></span>`;
        })
        .join("")
    : `<span class="benefit-empty">Chưa chọn ${isVoucher ? "voucher" : "khuyến mãi"}</span>`;
  const matchingRows = rows.filter((row) => normalize(benefitTitle(row, kind)).includes(normalize(search)));
  const optionsHtml = rows.length
    ? rows
        .map((row) => {
          const key = benefitKey(row, kind);
          const checked = selectedIds.has(key) ? "checked" : "";
          const meta = [benefitValueText(row), benefitDateText(row)].filter(Boolean).join(" · ");
          const hidden = normalize(benefitTitle(row, kind)).includes(normalize(search)) ? "" : "hidden";
          return `
            <label class="benefit-option" ${hidden}>
              <input type="checkbox" value="${escapeHtml(key)}" data-benefit-kind="${kind}" ${checked} />
              <span>
                <strong>${escapeHtml(benefitTitle(row, kind))}</strong>
                <small>${escapeHtml(meta || "Đang áp dụng")}</small>
              </span>
            </label>
          `;
        })
        .join("")
    : "";
  container.innerHTML = `
    <div class="benefit-selected">
      <div class="benefit-chip-list">${selectedHtml}</div>
      <button class="secondary benefit-add-button" data-action="${isVoucher ? "toggle-voucher-picker" : "toggle-promotion-picker"}" type="button">${open ? "Đóng" : isVoucher ? "Thêm voucher" : "Thêm khuyến mãi"}</button>
    </div>
    <div class="benefit-panel ${open ? "active" : ""}">
      <input class="search-input benefit-search" data-benefit-search="${isVoucher ? "voucher" : "promotion"}" placeholder="Tìm theo mã hoặc tên..." value="${escapeHtml(search)}" />
      <div class="benefit-option-list">
        ${optionsHtml}
        <div class="empty compact-empty benefit-search-empty" ${matchingRows.length ? "hidden" : ""}>${escapeHtml(rows.length ? "Không tìm thấy ưu đãi phù hợp" : `Không có ${isVoucher ? "voucher" : "khuyến mãi"} khả dụng`)}</div>
      </div>
    </div>
  `;
}

function updateBenefitPreview() {
  if (!els.benefitPreview) return;
  const voucherCount = selectedBenefitIds(els.orderVoucherPicker).length;
  const promotionCount = selectedBenefitIds(els.orderPromotionPicker).length;
  if (!voucherCount && !promotionCount) {
    els.benefitPreview.textContent = "Có thể chọn nhiều voucher và nhiều chương trình khuyến mãi.";
    return;
  }
  els.benefitPreview.textContent = `Đang chọn ${voucherCount} voucher và ${promotionCount} chương trình khuyến mãi.`;
}

function renderOrderBenefits() {
  const selectedVoucherIds = new Set(state.orderBenefits.voucherIds.map(String));
  const selectedPromotionIds = new Set(state.orderBenefits.promotionIds.map(String));
  const availableVouchers = state.vouchers.filter(
    (row) => benefitIsSelectable(row) || selectedVoucherIds.has(String(benefitKey(row, "voucher"))),
  );
  const availablePromotions = state.promotions.filter(
    (row) => benefitIsSelectable(row) || selectedPromotionIds.has(String(benefitKey(row, "promotion"))),
  );
  renderCompactBenefitPicker(els.orderVoucherPicker, availableVouchers, "voucher");
  renderCompactBenefitPicker(els.orderPromotionPicker, availablePromotions, "promotion");
  updateBenefitPreview();
  updateOrderPaymentSummary();
}

function renderOrderOptions() {
  els.orderContractSelect.innerHTML = state.contracts.length
    ? `<option value="">Chọn tour / tuyến</option>${state.contracts
        .map((row) => `<option value="${escapeHtml(row.id)}" data-start="${escapeHtml(row.diemDi || "")}" data-end="${escapeHtml(row.diemDen || "")}">${escapeHtml(row.tuyen)}</option>`)
        .join("")}`
    : `<option value="">Chưa có tour / tuyến</option>`;
  renderOrderBenefits();
  renderVehicleOptions();
  return;
  const availableVouchers = state.vouchers.filter(benefitIsSelectable);
  els.orderVoucherPicker.innerHTML = availableVouchers.length
    ? availableVouchers
        .map((row) => `<label class="benefit-option"><input type="checkbox" value="${escapeHtml(row.id)}" /><span><strong>${escapeHtml(row.maVoucher)} - ${escapeHtml(voucherCampaignName(row.tenVoucher))}</strong><small>${escapeHtml(benefitValueText(row))}${row.ngayHetHan ? ` · Đến ${escapeHtml(row.ngayHetHan)}` : ""}</small></span></label>`)
        .join("")
    : `<div class="empty compact-empty">Không có voucher khả dụng</div>`;
  const availablePromotions = state.promotions.filter(benefitIsSelectable);
  els.orderPromotionPicker.innerHTML = availablePromotions.length
    ? availablePromotions
        .map((row) => `<label class="benefit-option"><input type="checkbox" value="${escapeHtml(row.id)}" /><span><strong>${escapeHtml(row.tenChuongTrinh)}</strong><small>${escapeHtml(benefitValueText(row))}${row.ngayHetHan ? ` · Đến ${escapeHtml(row.ngayHetHan)}` : ""}</small></span></label>`)
        .join("")
    : `<div class="empty compact-empty">Không có khuyến mãi khả dụng</div>`;
  renderCompactBenefitPicker(els.orderVoucherPicker, availableVouchers, "voucher");
  renderCompactBenefitPicker(els.orderPromotionPicker, availablePromotions, "promotion");
  updateBenefitPreview();
  renderVehicleOptions();
}

function applySelectedContractDefaults() {
  const option = els.orderContractSelect.selectedOptions[0];
  if (!option?.value) return;
  if (!els.orderPickupInput.value && option.dataset.start) els.orderPickupInput.value = option.dataset.start;
  if (!els.orderDropoffInput.value && option.dataset.end) els.orderDropoffInput.value = option.dataset.end;
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function validCustomerPhone(value) {
  return /^0\d{9}$/.test(normalizePhone(value));
}

function requireCustomerPhone(value, label = "Số điện thoại") {
  const phone = normalizePhone(value);
  if (!/^0\d{9}$/.test(phone)) {
    throw new Error(`${label} phải gồm đúng 10 chữ số và bắt đầu bằng số 0.`);
  }
  return phone;
}

function isCustomerPhoneInput(element) {
  return element?.matches?.('[name="soDienThoai"], [data-passenger-field="soDienThoai"]');
}

document.addEventListener("input", (event) => {
  if (isCustomerPhoneInput(event.target)) event.target.setCustomValidity("");
});

document.addEventListener("focusout", (event) => {
  if (!isCustomerPhoneInput(event.target)) return;
  const phone = normalizePhone(event.target.value);
  event.target.value = phone;
  event.target.setCustomValidity(
    !phone || validCustomerPhone(phone) ? "" : "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.",
  );
});

function findCustomerByPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return state.customers.find((row) => normalizePhone(row.soDienThoai) === normalized) || null;
}

function setOrderCustomerFieldsLocked(locked) {
  for (const element of [
    els.orderCustomerName,
    els.orderCustomerCccd,
    els.orderCustomerAddress,
    els.orderCustomerProfileType,
    els.orderCustomerBirthYear,
    els.orderCustomerGender,
    els.orderCustomerSource,
    els.orderCustomerStaff,
  ]) {
    element.disabled = locked;
  }
  document.querySelectorAll(".customer-new-field").forEach((label) => label.classList.toggle("locked", locked));
  els.orderCustomerPreview.classList.toggle("locked", locked);
}

function fillOrderCustomer(customer) {
  if (!customer) {
    els.orderCustomerId.value = "";
    setOrderCustomerFieldsLocked(false);
    els.orderCustomerName.value = "";
    els.orderCustomerCccd.value = "";
    if (els.orderCustomerAddress) els.orderCustomerAddress.value = "";
    els.orderCustomerProfileType.value = "";
    els.orderCustomerBirthYear.value = "";
    els.orderCustomerGender.value = "";
    els.orderCustomerSource.value = "";
    els.orderCustomerStaff.value = state.currentUser?.displayName || state.currentUser?.username || "";
    els.orderCustomerPreview.textContent = "Chưa có khách hàng. Khi lưu đơn nguyên chuyến, hệ thống sẽ khai báo khách mới.";
    return;
  }
  els.orderCustomerId.value = customer.id || "";
  els.orderCustomerName.value = customer.tenKhach || "";
  els.orderCustomerCccd.value = customer.soCCCD || "";
  if (els.orderCustomerAddress) els.orderCustomerAddress.value = customer.diaChi || "";
  els.orderCustomerProfileType.value = customer.loaiKhachHang || "";
  els.orderCustomerBirthYear.value = customer.namSinh || "";
  els.orderCustomerGender.value = customer.gioiTinh || "";
  els.orderCustomerSource.value = customer.nguonKhach || "";
  els.orderCustomerStaff.value = customer.nhanVienNhap || "";
  setOrderCustomerFieldsLocked(true);
  els.orderCustomerPreview.textContent = [
    `Đã có khách: ${customer.tenKhach || ""}`,
    `SĐT: ${customer.soDienThoai || ""}`,
    customer.soCCCD ? `CCCD: ${customer.soCCCD}` : "",
    customer.loaiKhachHang ? `Loại khách: ${customer.loaiKhachHang}` : "",
    `Năm sinh: ${customer.namSinh || ""}`,
    `Giới tính: ${customer.gioiTinh || ""}`,
    `Nguồn: ${customer.nguonKhach || ""}`,
    `Nhân viên nhập: ${customer.nhanVienNhap || ""}`,
  ].join(" | ");
}

function selectedContractType() {
  return els.orderForm.elements.loaiHopDong.value;
}

function updateOrderTypeUI() {
  const isShared = selectedContractType() === "xe_ghep";
  els.sharedPassengersSection.classList.toggle("active", isShared);
  if (els.orderBenefitsSection) els.orderBenefitsSection.hidden = isShared;
  if (els.orderInvoiceSection) els.orderInvoiceSection.hidden = isShared;
  if (els.orderDebtSection) els.orderDebtSection.hidden = isShared;
  const debtToggle = document.querySelector("#debtToggle");
  const debtOwner = document.querySelector("#debtOwnerInput");
  if (debtToggle) debtToggle.disabled = isShared;
  if (debtOwner) {
    debtOwner.disabled = isShared;
    debtOwner.required = !isShared && Boolean(debtToggle?.checked);
    debtOwner.closest("label")?.classList.toggle("required", debtOwner.required);
  }
  els.ticketCountWrap.classList.toggle("active", isShared);
  els.ticketCountInput.required = isShared;
  els.ticketCountInput.min = isShared ? "1" : "0";
  for (const element of [
    els.orderPickupInput,
    els.orderDropoffInput,
    els.orderForm.elements.giaTien,
    els.orderForm.elements.giamGia,
    els.orderForm.elements.phuThu,
    els.orderForm.elements.daCoc,
  ]) {
    element.closest("label").hidden = isShared;
    element.disabled = isShared;
    element.required = !isShared;
  }
  const surchargeReason = els.orderForm.elements.lyDoPhuThu;
  if (surchargeReason) {
    const active = !isShared && parseMoney(els.orderForm.elements.phuThu?.value) > 0;
    surchargeReason.disabled = isShared;
    surchargeReason.required = active;
    surchargeReason.closest("label").hidden = !active;
    surchargeReason.closest("label").classList.toggle("required", active);
  }
  document.querySelectorAll(".customer-main-field").forEach((label) => label.classList.toggle("hidden", isShared));
  document.querySelectorAll(".customer-type-field").forEach((label) => label.classList.toggle("hidden", isShared));
  els.orderForm.querySelectorAll('input[name="loaiKhach"]').forEach((input) => {
    input.disabled = isShared;
    input.required = !isShared;
  });
  if (isShared) {
    state.orderBenefits.voucherIds = [];
    state.orderBenefits.promotionIds = [];
    els.invoiceToggle.checked = false;
    els.invoiceFields.classList.remove("active");
  }
  for (const name of ["tenCongTy", "maSoThue", "diaChiHoaDon"]) {
    const field = els.orderForm.elements[name];
    if (field) {
      field.required = !isShared && els.invoiceToggle.checked;
      field.closest("label")?.classList.toggle("required", field.required);
    }
  }
  for (const element of [
    els.orderCustomerPhone,
    els.orderCustomerName,
    els.orderCustomerProfileType,
    els.orderCustomerGender,
    els.orderCustomerSource,
    els.orderCustomerStaff,
  ]) {
    element.required = !isShared;
  }
  for (const element of [els.orderCustomerCccd, els.orderCustomerAddress, els.orderCustomerBirthYear]) {
    element.required = false;
  }
  if (!isShared) fillOrderCustomer(findCustomerByPhone(els.orderCustomerPhone.value));
  renderSharedPassengerFields();
}

function renderSharedPassengerFields() {
  const isShared = selectedContractType() === "xe_ghep";
  const count = isShared ? Math.max(Number(els.ticketCountInput.value || 0), 0) : 0;
  const currentStaff = state.currentUser?.displayName || state.currentUser?.username || "";
  const editingOrder = state.orders.find((row) => String(row.id) === String(state.editingOrderId || ""));
  const editingPassengers = editingOrder?.khachXeGhep || [];
  const existingVoucherIds = new Set(editingPassengers.flatMap((row) => row.voucherIds || []).map(String));
  const existingPromotionIds = new Set(editingPassengers.flatMap((row) => row.promotionIds || []).map(String));
  const vouchers = state.vouchers.filter(
    (row) => benefitIsSelectable(row) || existingVoucherIds.has(String(benefitKey(row, "voucher"))),
  );
  const promotions = state.promotions.filter(
    (row) => benefitIsSelectable(row) || existingPromotionIds.has(String(benefitKey(row, "promotion"))),
  );
  const benefitCheckboxes = (rows, kind, index) =>
    rows.length
      ? rows
          .map(
            (row) => {
              const benefitKind = kind === "voucherIds" ? "voucher" : "promotion";
              return `
                <label class="benefit-option compact">
                  <input type="checkbox" value="${escapeHtml(benefitKey(row, benefitKind))}" data-passenger-benefit="${kind}" data-passenger-index="${index}" />
                  <span>
                    <strong>${escapeHtml(benefitTitle(row, benefitKind))}</strong>
                    <small>${escapeHtml([benefitValueText(row), benefitDateText(row)].filter(Boolean).join(" · "))}</small>
                  </span>
                </label>
              `;
            },
          )
          .join("")
      : `<div class="empty compact-empty">Không có ${kind === "voucherIds" ? "voucher" : "khuyến mãi"} khả dụng.</div>`;
  els.sharedPassengerList.innerHTML = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return `
      <div class="shared-passenger-card passenger-tone-${(index % 6) + 1}" data-shared-passenger-card="${index}">
        <h3>Khách lẻ ${number}</h3>
        <div class="shared-passenger-section">
          <h4>Thông tin khách</h4>
          <div class="form-grid two-col">
            <label class="required"><span>Số điện thoại</span><input data-passenger-field="soDienThoai" data-passenger-index="${index}" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="0xxxxxxxxx" required /></label>
            <label class="required"><span>Họ tên</span><input data-passenger-field="hoTen" data-passenger-index="${index}" required /></label>
            <label><span>Số CCCD</span><input data-passenger-field="soCCCD" data-passenger-index="${index}" inputmode="numeric" /></label>
            <label><span>Năm sinh</span><input data-passenger-field="namSinh" data-passenger-index="${index}" inputmode="numeric" /></label>
            <label class="full"><span>Địa chỉ</span><input data-passenger-field="diaChi" data-passenger-index="${index}" /></label>
            <label class="required"><span>Giới tính</span><select data-passenger-field="gioiTinh" data-passenger-index="${index}" required><option value="">Chọn giới tính</option><option>Nam</option><option>Nữ</option><option>Khác</option></select></label>
            <label class="required"><span>Nguồn khách</span><select data-passenger-field="nguonKhach" data-passenger-index="${index}" required>${selectOptions(customerSourceOptions(), "", "Chọn nguồn")}</select></label>
            <label class="required"><span>Loại khách</span><select data-passenger-field="loaiKhach" data-passenger-index="${index}" required><option value="">Chọn loại khách</option><option value="B2C">B2C</option><option value="B2B">B2B</option></select></label>
            <label><span>Nhân viên nhập</span><input data-passenger-field="nhanVienNhap" data-passenger-index="${index}" value="${escapeHtml(currentStaff)}" readonly /></label>
          </div>
          <div class="customer-preview shared-customer-preview" data-passenger-preview="${index}">Nhập số điện thoại để kiểm tra khách hàng.</div>
        </div>
        <div class="shared-passenger-section">
          <h4>Hành trình</h4>
          <div class="form-grid two-col">
            <label class="required"><span>Điểm đón</span><input data-passenger-field="diemDon" data-passenger-index="${index}" required /></label>
            <label class="required"><span>Điểm trả</span><input data-passenger-field="diemTra" data-passenger-index="${index}" required /></label>
          </div>
        </div>
        <div class="shared-passenger-section">
          <h4>Tài chính</h4>
          <div class="form-grid three-col">
            <label class="required"><span>Số tiền</span><input class="money-input" data-passenger-field="soTien" data-passenger-index="${index}" inputmode="numeric" required /></label>
            <label><span>Giảm giá</span><input class="money-input" data-passenger-field="giamGia" data-passenger-index="${index}" inputmode="numeric" value="0" /></label>
            <label data-passenger-discount-note="${index}" hidden><span>Ghi chú giảm giá thủ công</span><input data-passenger-field="ghiChuGiamGia" data-passenger-index="${index}" /></label>
            <label><span>Phụ thu</span><input class="money-input" data-passenger-field="phuThu" data-passenger-index="${index}" inputmode="numeric" value="0" /></label>
            <label data-passenger-surcharge-reason="${index}" hidden><span>Lý do phụ thu</span><input data-passenger-field="lyDoPhuThu" data-passenger-index="${index}" /></label>
            <label><span>Đã cọc</span><input class="money-input" data-passenger-field="daCoc" data-passenger-index="${index}" inputmode="numeric" value="0" /></label>
          </div>
        </div>
        <details class="shared-passenger-section shared-collapsible">
          <summary>Voucher & khuyến mãi</summary>
          <div class="shared-benefit-grid">
            <div>
              <span class="field-label">Voucher</span>
              <div class="shared-benefit-list">${benefitCheckboxes(vouchers, "voucherIds", index)}</div>
            </div>
            <div>
              <span class="field-label">Khuyến mãi</span>
              <div class="shared-benefit-list">${benefitCheckboxes(promotions, "promotionIds", index)}</div>
            </div>
          </div>
        </details>
        <div class="shared-passenger-section">
          <h4>Hóa đơn VAT</h4>
          <label class="checkbox-line">
            <input type="checkbox" data-passenger-field="yeuCauHoaDon" data-passenger-index="${index}" />
            <span>Khách lẻ này yêu cầu xuất hóa đơn</span>
          </label>
          <div class="form-grid two-col shared-invoice-fields">
            <label><span>Tên công ty</span><input data-passenger-field="tenCongTy" data-passenger-index="${index}" /></label>
            <label><span>Mã số thuế</span><input data-passenger-field="maSoThue" data-passenger-index="${index}" /></label>
            <label class="full"><span>Địa chỉ hóa đơn</span><input data-passenger-field="diaChiHoaDon" data-passenger-index="${index}" /></label>
            <label><span>Email nhận hóa đơn</span><input data-passenger-field="emailHoaDon" data-passenger-index="${index}" type="email" /></label>
          </div>
        </div>
        <div class="shared-passenger-section">
          <h4>Công nợ</h4>
          <label class="checkbox-line">
            <input type="checkbox" data-passenger-field="congNo" data-passenger-index="${index}" />
            <span>Ghi nhận công nợ cho khách lẻ này</span>
          </label>
          <div class="form-grid two-col" data-passenger-debt-fields="${index}" hidden>
            <label><span>Đối tượng ghi nhận công nợ</span><input data-passenger-field="congNoChoAi" data-passenger-index="${index}" /></label>
          </div>
        </div>
      </div>
    `;
  }).join("");
  syncSharedPassengerPhoneGate();
  syncSharedVoucherAvailability();
  updateOrderPaymentSummary();
}

function collectSharedPassengers() {
  const passengers = [];
  const count = Math.max(Number(els.ticketCountInput.value || 0), 0);
  for (let index = 0; index < count; index += 1) {
    const passenger = { voucherIds: [], promotionIds: [] };
    els.sharedPassengerList.querySelectorAll(`[data-passenger-index="${index}"]`).forEach((input) => {
      if (input.dataset.passengerBenefit) {
        if (input.checked) passenger[input.dataset.passengerBenefit].push(input.value);
        return;
      }
      if (!input.dataset.passengerField) return;
      if (input.type === "checkbox") {
        passenger[input.dataset.passengerField] = input.checked;
      } else {
        passenger[input.dataset.passengerField] = input.classList.contains("money-input") ? parseMoney(input.value) : input.value.trim();
      }
    });
    passengers.push(passenger);
  }
  return passengers;
}

function snapshotSharedPassengerFields() {
  return [...els.sharedPassengerList.querySelectorAll("[data-shared-passenger-card]")].map((card) => {
    const passenger = { voucherIds: [], promotionIds: [] };
    card.querySelectorAll("[data-passenger-field], [data-passenger-benefit]").forEach((input) => {
      if (input.dataset.passengerBenefit) {
        if (input.checked) passenger[input.dataset.passengerBenefit].push(input.value);
        return;
      }
      const field = input.dataset.passengerField;
      if (!field) return;
      if (input.type === "checkbox") {
        passenger[field] = input.checked;
      } else {
        passenger[field] = input.classList.contains("money-input") ? parseMoney(input.value) : input.value.trim();
      }
    });
    return passenger;
  });
}

function populateSharedPassengerFields(passengers) {
  passengers.forEach((passenger, index) => {
    const card = els.sharedPassengerList.querySelector(`[data-shared-passenger-card="${index}"]`);
    if (!card) return;
    card.querySelectorAll(`[data-passenger-field][data-passenger-index="${index}"]`).forEach((input) => {
      const field = input.dataset.passengerField;
      if (input.type === "checkbox") {
        input.checked = Boolean(passenger[field]);
      } else {
        const value = passenger[field] ?? "";
        input.value = input.classList.contains("money-input") ? formatMoney(value) || "0" : value;
      }
    });
    for (const kind of ["voucherIds", "promotionIds"]) {
      const selected = new Set(
        (Array.isArray(passenger[kind]) ? passenger[kind] : String(passenger[kind] || "").split(","))
          .map((value) => String(value).trim())
          .filter(Boolean),
      );
      card.querySelectorAll(`[data-passenger-benefit="${kind}"]`).forEach((input) => {
        input.checked = selected.has(String(input.value));
      });
    }
    const invoiceToggle = card.querySelector('[data-passenger-field="yeuCauHoaDon"]');
    const invoiceFields = card.querySelector(".shared-invoice-fields");
    if (invoiceFields) invoiceFields.classList.toggle("active", Boolean(invoiceToggle?.checked));
    const debtToggle = card.querySelector('[data-passenger-field="congNo"]');
    const debtFields = card.querySelector(`[data-passenger-debt-fields="${index}"]`);
    if (debtFields) debtFields.hidden = !debtToggle?.checked;
    const discount = parseMoney(card.querySelector('[data-passenger-field="giamGia"]')?.value);
    const discountNote = card.querySelector(`[data-passenger-discount-note="${index}"]`);
    if (discountNote) discountNote.hidden = discount <= 0;
    const surcharge = parseMoney(card.querySelector('[data-passenger-field="phuThu"]')?.value);
    const surchargeReason = card.querySelector(`[data-passenger-surcharge-reason="${index}"]`);
    if (surchargeReason) surchargeReason.hidden = surcharge <= 0;
  });
  syncSharedPassengerPhoneGate();
  syncSharedVoucherAvailability();
  updateOrderPaymentSummary();
}

function sharedVoucherCheckboxes() {
  return [...els.sharedPassengerList.querySelectorAll('input[data-passenger-benefit="voucherIds"]')];
}

function sharedVoucherLabel(voucherId) {
  const row = state.vouchers.find((item) => String(benefitKey(item, "voucher")) === String(voucherId));
  return row ? benefitTitle(row, "voucher") : voucherId;
}

function syncSharedVoucherAvailability() {
  const selectedByVoucher = new Map();
  for (const checkbox of sharedVoucherCheckboxes()) {
    if (checkbox.checked && !selectedByVoucher.has(checkbox.value)) {
      selectedByVoucher.set(checkbox.value, checkbox.dataset.passengerIndex);
    }
  }
  for (const checkbox of sharedVoucherCheckboxes()) {
    const ownerIndex = selectedByVoucher.get(checkbox.value);
    const locked = ownerIndex !== undefined && ownerIndex !== checkbox.dataset.passengerIndex;
    checkbox.disabled = locked;
    const option = checkbox.closest(".benefit-option");
    option?.classList.toggle("is-disabled", locked);
    let note = option?.querySelector(".benefit-duplicate-note");
    if (locked) {
      if (!note) {
        note = document.createElement("small");
        note.className = "benefit-duplicate-note";
        option?.querySelector("span")?.appendChild(note);
      }
      note.textContent = `Đã chọn ở khách lẻ ${Number(ownerIndex) + 1}`;
    } else {
      note?.remove();
    }
  }
}

function duplicateSharedVoucherMessage() {
  const seen = new Map();
  for (const passenger of collectSharedPassengers()) {
    for (const voucherId of passenger.voucherIds || []) {
      if (seen.has(voucherId)) return `Voucher ${sharedVoucherLabel(voucherId)} chỉ được áp dụng cho một khách lẻ trong cùng đơn.`;
      seen.set(voucherId, true);
    }
  }
  return "";
}

function syncSharedPassengerPhoneGate(index = null) {
  const cards =
    index === null
      ? [...els.sharedPassengerList.querySelectorAll("[data-shared-passenger-card]")]
      : [...els.sharedPassengerList.querySelectorAll(`[data-shared-passenger-card="${index}"]`)];
  for (const card of cards) {
    const phoneInput = card.querySelector('[data-passenger-field="soDienThoai"]');
    const hasPhone = Boolean(normalizePhone(phoneInput?.value || ""));
    card.classList.toggle("needs-phone", !hasPhone);
    card.querySelectorAll("[data-passenger-field], [data-passenger-benefit]").forEach((input) => {
      if (input === phoneInput) return;
      if (!hasPhone) {
        input.disabled = true;
        input.dataset.lockedByPhone = "1";
        return;
      }
      if (input.dataset.lockedByPhone === "1" && input.dataset.lockedByCustomer !== "1") {
        input.disabled = false;
        input.dataset.lockedByPhone = "";
      }
    });
  }
}

function sharedPassengerInputs(index) {
  return {
    name: els.sharedPassengerList.querySelector(`[data-passenger-field="hoTen"][data-passenger-index="${index}"]`),
    cccd: els.sharedPassengerList.querySelector(`[data-passenger-field="soCCCD"][data-passenger-index="${index}"]`),
    address: els.sharedPassengerList.querySelector(`[data-passenger-field="diaChi"][data-passenger-index="${index}"]`),
    birthYear: els.sharedPassengerList.querySelector(`[data-passenger-field="namSinh"][data-passenger-index="${index}"]`),
    gender: els.sharedPassengerList.querySelector(`[data-passenger-field="gioiTinh"][data-passenger-index="${index}"]`),
    source: els.sharedPassengerList.querySelector(`[data-passenger-field="nguonKhach"][data-passenger-index="${index}"]`),
    staff: els.sharedPassengerList.querySelector(`[data-passenger-field="nhanVienNhap"][data-passenger-index="${index}"]`),
    preview: els.sharedPassengerList.querySelector(`[data-passenger-preview="${index}"]`),
  };
}

function setSharedPassengerCustomerLocked(index, locked) {
  const inputs = sharedPassengerInputs(index);
  for (const element of [inputs.name, inputs.cccd, inputs.address, inputs.birthYear, inputs.gender, inputs.source, inputs.staff]) {
    if (!element) continue;
    element.dataset.lockedByCustomer = locked ? "1" : "";
    element.disabled = locked;
  }
  if (inputs.preview) inputs.preview.classList.toggle("locked", locked);
}

function fillSharedPassengerCustomer(index, customer) {
  const inputs = sharedPassengerInputs(index);
  if (!inputs.name) return;
  if (!customer) {
    if (inputs.name.dataset.lockedCustomer === "1") {
      inputs.name.value = "";
      inputs.cccd.value = "";
      inputs.address.value = "";
      inputs.birthYear.value = "";
      inputs.gender.value = "";
      inputs.source.value = "";
      inputs.staff.value = state.currentUser?.displayName || state.currentUser?.username || "";
    }
    inputs.name.dataset.lockedCustomer = "";
    setSharedPassengerCustomerLocked(index, false);
    if (inputs.preview) inputs.preview.textContent = "Chưa có khách hàng. Có thể nhập thông tin mới cho khách lẻ này.";
    return;
  }
  inputs.name.value = customer.tenKhach || "";
  inputs.cccd.value = customer.soCCCD || "";
  inputs.address.value = customer.diaChi || "";
  inputs.birthYear.value = customer.namSinh || "";
  inputs.gender.value = customer.gioiTinh || "";
  inputs.source.value = customer.nguonKhach || "";
  inputs.staff.value = customer.nhanVienNhap || "";
  inputs.name.dataset.lockedCustomer = "1";
  setSharedPassengerCustomerLocked(index, true);
  if (inputs.preview) {
    inputs.preview.textContent = [
      `Đã có khách: ${customer.tenKhach || ""}`,
      `SĐT: ${customer.soDienThoai || ""}`,
      customer.soCCCD ? `CCCD: ${customer.soCCCD}` : "",
      customer.diaChi ? `Địa chỉ: ${customer.diaChi}` : "",
      customer.namSinh ? `Năm sinh: ${customer.namSinh}` : "",
      customer.gioiTinh ? `Giới tính: ${customer.gioiTinh}` : "",
      customer.nguonKhach ? `Nguồn: ${customer.nguonKhach}` : "",
      customer.nhanVienNhap ? `Nhân viên nhập: ${customer.nhanVienNhap}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }
}

function renderVehicleOptions() {
  const startValue = els.assignVehicleForm.elements.ngayGioDi.value;
  const endValue = els.assignVehicleForm.elements.ngayGioDuKienKetThuc.value;
  const currentOrderId = els.assignVehicleForm.elements.orderId?.value || "";
  const selected = els.orderVehicleSelect.value;
  const rosterRows = rosterVehiclesForStart(startValue);
  const franchiseRows = activeFranchiseVehicles();
  const emptyLabel = startValue ? "Chưa chọn xe" : "Chọn giờ đi trước";
  const seatsLabel = (value) => {
    const text = String(value || "").trim();
    if (!text) return "";
    return normalize(text).includes("cho") ? text : `${text} chỗ`;
  };
  const rosterOptions = rosterRows
    .map((row) => {
      const conflict = conflictingOrder(row.bienKiemSoat, startValue, endValue, currentOrderId);
      const noDriver = !hasRosterDriver(row);
      const vehicleType = row.loai_xe || row.loaiXe || "";
      const vehicleSeats = row.so_cho || row.soCho || "";
      const vehicleDetails = [row.soHieuXe, vehicleType, seatsLabel(vehicleSeats)].filter(Boolean).join(" - ");
      return `<option value="${escapeHtml(row.bienKiemSoat)}" data-vehicle-kind="internal" data-driver="${escapeHtml(driverText(row))}" data-vehicle-type="${escapeHtml(vehicleType)}" data-vehicle-seats="${escapeHtml(vehicleSeats)}" data-shift-date="${escapeHtml(formatDate(row.thoiGianTao))}" data-no-driver="${noDriver ? "1" : ""}" ${conflict ? "data-busy=\"1\"" : ""}>${escapeHtml(row.bienKiemSoat)}${vehicleDetails ? ` - ${escapeHtml(vehicleDetails)}` : ""}${noDriver ? " - chưa có lái" : ""}${conflict ? " - đang bận" : ""}</option>`;
    })
    .join("");
  const franchiseOptions = franchiseRows
    .map((row) => {
      const conflict = conflictingOrder(row.bienKiemSoat, startValue, endValue, currentOrderId);
      const vehicleType = row.hieuXe || "";
      const vehicleSeats = row.soCho || row.so_cho || "";
      const vehicleDetails = [row.dongXe, vehicleType, seatsLabel(vehicleSeats)].filter(Boolean).join(" - ");
      return `<option value="${escapeHtml(row.bienKiemSoat)}" data-vehicle-kind="franchise" data-driver="${escapeHtml(row.hoTenLaiXe || "")}" data-vehicle-type="${escapeHtml(vehicleType)}" data-vehicle-seats="${escapeHtml(vehicleSeats)}" ${conflict ? "data-busy=\"1\"" : ""}>${escapeHtml(row.bienKiemSoat)} - thương quyền${vehicleDetails ? ` - ${escapeHtml(vehicleDetails)}` : ""}${conflict ? " - đang bận" : ""}</option>`;
    })
    .join("");
  els.orderVehicleSelect.innerHTML = `
    <option value="">${emptyLabel}</option>
    ${rosterOptions ? `<optgroup label="Xe lên ca">${rosterOptions}</optgroup>` : ""}
    ${franchiseOptions ? `<optgroup label="Xe thương quyền">${franchiseOptions}</optgroup>` : ""}
  `;
  if ([...els.orderVehicleSelect.options].some((option) => option.value === selected)) {
    els.orderVehicleSelect.value = selected;
  }
  updateVehicleWarning();
}

function updateVehicleWarning() {
  const option = els.orderVehicleSelect.selectedOptions[0];
  els.orderDriverName.value = option?.dataset.driver || "";
  els.orderVehicleType.value = option?.dataset.vehicleType || "";
  els.orderVehicleSeats.value = option?.dataset.vehicleSeats || "";
  const plate = els.orderVehicleSelect.value;
  const currentOrderId = els.assignVehicleForm.elements.orderId?.value || "";
  const isFranchise = option?.dataset.vehicleKind === "franchise";
  els.franchiseCommissionWrap.classList.toggle("active", Boolean(isFranchise));
  els.franchiseCommissionWrap.classList.toggle("required", Boolean(isFranchise));
  els.franchiseCommissionInput.required = Boolean(isFranchise);
  if (!isFranchise) els.franchiseCommissionInput.value = "";
  const conflict = plate
    ? conflictingOrder(plate, els.assignVehicleForm.elements.ngayGioDi.value, els.assignVehicleForm.elements.ngayGioDuKienKetThuc.value, currentOrderId)
    : null;
  els.vehicleWarning.textContent = conflict
    ? `Cảnh báo: xe ${plate} đang bận đơn ${conflict.id} trong khung giờ này.`
    : isFranchise
      ? `Xe thương quyền: nhập tỷ lệ nộp lại riêng cho đơn hàng này.`
    : option?.dataset.noDriver === "1"
      ? `Xe ${plate} có lên ca ngày ${option.dataset.shiftDate}, nhưng chưa có lái xe. Vui lòng cập nhật lái xe trong DANH_SACH_LEN_CA trước khi lưu.`
    : option?.dataset.shiftDate
      ? `Xe được lấy theo danh sách lên ca ngày ${option.dataset.shiftDate}.`
      : "";
}

function parseSystemLogJson(value) {
  if (value && typeof value === "object") return value;
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
}

function systemLogValue(value) {
  if (value === null || value === undefined || value === "") return "Trống";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function systemLogComparableValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return Number.isFinite(value) ? `number:${value}` : String(value);
  if (typeof value === "boolean") return `boolean:${value}`;
  if (typeof value === "string") {
    const text = value.trim();
    if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text)) return `number:${Number(text)}`;
    return `string:${text}`;
  }
  if (Array.isArray(value)) return JSON.stringify(value.map(systemLogComparableValue));
  if (typeof value === "object") {
    return JSON.stringify(
      Object.keys(value)
        .sort()
        .reduce((result, key) => {
          result[key] = systemLogComparableValue(value[key]);
          return result;
        }, {}),
    );
  }
  return String(value);
}

function systemLogChanges(row) {
  const before = parseSystemLogJson(row.before);
  const after = parseSystemLogJson(row.after);
  const ignoredFields = new Set(["id", "createdAt", "updatedAt", "createdBy", "updatedBy"]);
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (key) => !ignoredFields.has(key) && systemLogComparableValue(before[key]) !== systemLogComparableValue(after[key]),
  );
  if (!keys.length) return `<span class="muted">—</span>`;
  const changes = keys
    .map((key) => {
      const label = systemLogFieldLabels[key] || key;
      const oldValue = systemLogValue(before[key]);
      const newValue = systemLogValue(after[key]);
      if (!Object.keys(before).length) {
        return `<div class="log-change"><span>${escapeHtml(label)}</span><strong>${escapeHtml(newValue)}</strong></div>`;
      }
      return `<div class="log-change"><span>${escapeHtml(label)}</span><del>${escapeHtml(oldValue)}</del><b>→</b><strong>${escapeHtml(newValue)}</strong></div>`;
    })
    .join("");
  return changes;
}

function renderSystemLogs() {
  if (!els.systemLogTable) return;
  const actions = [...new Set(state.systemLogs.map((row) => String(row.action || "")).filter(Boolean))].sort((a, b) =>
    (systemLogActionLabels[a] || a).localeCompare(systemLogActionLabels[b] || b, "vi"),
  );
  if (els.systemLogActionFilter) {
    const selected = state.filters.systemLogAction;
    els.systemLogActionFilter.innerHTML = [
      `<option value="">Tất cả thao tác</option>`,
      ...actions.map((action) => `<option value="${escapeHtml(action)}">${escapeHtml(systemLogActionLabels[action] || action)}</option>`),
    ].join("");
    els.systemLogActionFilter.value = selected;
  }
  const query = normalize(state.filters.systemLog);
  const rows = state.systemLogs.filter((row) => {
    if (state.filters.systemLogAction && row.action !== state.filters.systemLogAction) return false;
    if (!query) return true;
    return normalize(
      [row.username, row.role, row.action, systemLogActionLabels[row.action], row.targetType, row.targetId, row.note].join(" "),
    ).includes(query);
  });
  els.systemLogTable.innerHTML =
    rows
      .map(
        (row) => `
          <tr>
            <td><strong>${escapeHtml(formatDateTime(row.createdAt))}</strong></td>
            <td><strong>${escapeHtml(row.username || "")}</strong><div class="muted">${escapeHtml(roleLabel(row.role || ""))}</div></td>
            <td><span class="pill">${escapeHtml(systemLogActionLabels[row.action] || row.action || "")}</span></td>
            <td><strong>${escapeHtml(row.targetId || "")}</strong><div class="muted">${escapeHtml(row.targetType || "")}</div></td>
            <td class="system-log-changes">${systemLogChanges(row)}</td>
            <td>${escapeHtml(row.note || "") || `<span class="muted">—</span>`}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="6" class="empty">Chưa có lịch sử thay đổi phù hợp.</td></tr>`;
}

function renderPermissions() {
  if (els.userTable) {
    els.userTable.innerHTML =
      state.users
        .map((row) => {
          const active = normalize(row.status) === "active" || normalize(row.status) === "dang hoat dong";
          return `
            <tr>
              <td><strong>${escapeHtml(row.username)}</strong></td>
              <td>${escapeHtml(row.displayName || "")}</td>
              <td><span class="pill">${escapeHtml(roleLabel(row.role))}</span></td>
              <td><span class="pill ${active ? "done" : "cancelled"}">${escapeHtml(active ? "Đang hoạt động" : row.status || "Tạm khóa")}</span></td>
              <td>${escapeHtml(formatDateTime(row.createdAt))}</td>
              <td class="action-cell">
                <button class="small" data-action="open-edit-user" data-user-id="${escapeHtml(row.id)}" type="button">Chỉnh sửa</button>
                <button class="small secondary" data-action="open-reset-password" data-user-id="${escapeHtml(row.id)}" type="button">Reset mật khẩu</button>
              </td>
            </tr>
          `;
        })
        .join("") || `<tr><td colspan="6" class="empty">Chưa có tài khoản.</td></tr>`;
  }

  if (els.reopenRequestTable) {
    els.reopenRequestTable.innerHTML =
      state.reopenRequests
        .map((row) => {
          const pending = isPendingReopen(row);
          const approved = normalize(row.status) === "da duyet" || normalize(row.status) === "approved";
          const actions =
            pending && can("approve_reopen")
              ? `<div class="order-action-stack">
                  <button class="small" data-action="approve-reopen" data-request-id="${escapeHtml(row.id)}" type="button">Duyệt</button>
                  <button class="small secondary" data-action="reject-reopen" data-request-id="${escapeHtml(row.id)}" type="button">Từ chối</button>
                </div>`
              : "";
          return `
            <tr>
              <td><strong>${escapeHtml(row.orderId)}</strong><div class="muted">${escapeHtml(formatDateTime(row.createdAt))}</div></td>
              <td>${escapeHtml(row.requestedByName || row.requestedBy || "")}</td>
              <td>${escapeHtml(row.reason || "")}${row.adminNote ? `<div class="muted">Admin: ${escapeHtml(row.adminNote)}</div>` : ""}</td>
              <td><span class="pill ${pending ? "running" : approved ? "done" : "cancelled"}">${escapeHtml(row.status || "")}</span></td>
              <td>${actions}</td>
            </tr>
          `;
        })
        .join("") || `<tr><td colspan="5" class="empty">Chưa có yêu cầu mở lại đơn.</td></tr>`;
  }
}

function refreshCustomerSourceSelects() {
  const options = customerSourceOptions();
  [document.querySelector('#customerForm select[name="nguonKhach"]'), els.orderCustomerSource]
    .filter(Boolean)
    .forEach((select) => {
      const selected = select.value;
      const values = [...new Set([...options, selected].filter(Boolean))];
      select.innerHTML = selectOptions(values, selected, "Chọn nguồn");
    });
}

function refreshFranchiseVehicleCatalogSelects() {
  const lineSelect = els.franchiseVehicleForm?.elements.dongXe;
  const makeSelect = els.franchiseVehicleForm?.elements.hieuXe;
  if (lineSelect) {
    const selected = lineSelect.value;
    lineSelect.innerHTML = selectOptions(vehicleLineOptions(), selected, "Chọn dòng xe");
  }
  if (makeSelect) {
    const selected = makeSelect.value;
    makeSelect.innerHTML = selectOptions(vehicleMakeOptions(), selected, "Chọn hiệu xe");
  }
}

function renderSystemCatalogs() {
  refreshCustomerSourceSelects();
  refreshFranchiseVehicleCatalogSelects();
  if (els.systemCatalogType) {
    const selected = els.systemCatalogType.value || "nguonKhach";
    els.systemCatalogType.innerHTML = Object.entries(systemCatalogTypeLabels)
      .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
      .join("");
    els.systemCatalogType.value = selected;
  }
  if (!els.systemCatalogTable) return;
  els.systemCatalogTable.innerHTML = state.systemCatalogs
    .map((row, index) => `<tr>
      <td>${index + 1}</td>
      <td><span class="pill">${escapeHtml(systemCatalogTypeLabels[row.loaiDanhMuc] || row.loaiDanhMuc || "--")}</span></td>
      <td><strong>${escapeHtml(row.giaTri || "")}</strong></td>
      <td>${escapeHtml(row.createdBy || "Hệ thống")}</td>
      <td>${escapeHtml(formatDateTime(row.createdAt))}</td>
      <td><button class="small danger" data-action="delete-system-catalog" data-catalog-id="${escapeHtml(row.id)}" data-catalog-value="${escapeHtml(row.giaTri || "")}" type="button">Xóa</button></td>
    </tr>`)
    .join("") || `<tr><td colspan="6" class="empty">Danh mục chưa có dữ liệu.</td></tr>`;
}

function renderAll() {
  renderDashboard();
  renderCustomers();
  renderContracts();
  renderContractPricing();
  renderVouchers();
  renderPromotions();
  renderOrders();
  renderInvoiceOrders();
  renderDebtOrders();
  renderCommissionOrders();
  renderOrderFeedback();
  renderCskhShiftReports();
  renderVehicles();
  renderFranchiseVehicles();
  renderPermissions();
  renderSystemCatalogs();
  renderSystemLogs();
  renderOrderOptions();
  applyPermissions();
  if (document.querySelector("#calendarView")?.classList.contains("active")) renderCalendar();
}

const viewDataSources = {
  dashboard: ["roster", "franchiseVehicles", "customers", "contracts", "orders"],
  orders: ["systemCatalogs", "roster", "franchiseVehicles", "customers", "contracts", "vouchers", "promotions", "orders", "orderFeedback"],
  calendar: ["roster", "calendarVehicleOrder", "franchiseVehicles", "orders"],
  vehicles: ["roster"],
  franchiseVehicles: ["franchiseVehicles"],
  customers: ["systemCatalogs", "customers"],
  contracts: ["contracts"],
  contractPricing: ["contractPricing"],
  vouchers: ["vouchers"],
  promotions: ["promotions"],
  invoiceOrders: ["invoiceOrders", "invoiceGroupCandidates"],
  debtOrders: ["debtOrders"],
  commissionOrders: ["commissionOrders"],
  orderFeedback: ["orders", "orderFeedback"],
  cskhShiftReports: ["cskhShiftReports", "orders"],
  reports: ["customers", "vouchers", "promotions", "orders"],
  permissions: ["users"],
  reopenApprovals: ["reopenRequests"],
  systemCatalogs: ["systemCatalogs"],
  systemLogs: ["systemLogs"],
};

const dataSourceDefinitions = {
  systemCatalogs: ["danh mục hệ thống", "/api/system-catalogs"],
  roster: ["xe lên ca", "/api/roster"],
  calendarVehicleOrder: ["thứ tự lịch điều xe", "/api/calendar-vehicle-order"],
  franchiseVehicles: ["xe thương quyền", "/api/franchise-vehicles"],
  customers: ["khách hàng", "/api/customers"],
  contracts: ["hợp đồng/tuyến", "/api/tours"],
  contractPricing: ["bảng giá hợp đồng", "/api/contract-pricing"],
  vouchers: ["voucher", "/api/vouchers"],
  promotions: ["khuyến mãi", "/api/promotions"],
  orders: ["đơn hàng", "/api/orders"],
  orderFeedback: ["phản hồi khách hàng", "/api/order-feedback"],
  cskhShiftReports: ["báo cáo ca CSKH", "/api/cskh-shift-reports"],
  invoiceOrders: ["hóa đơn", "/api/invoice-orders"],
  invoiceGroupCandidates: ["đơn có thể gộp hóa đơn", "/api/invoice-groups/candidates"],
  debtOrders: ["công nợ", "/api/debt-orders"],
  commissionOrders: ["hoa hồng xe thương quyền", "/api/commission-orders"],
  users: ["tài khoản", "/api/users"],
  reopenRequests: ["yêu cầu mở lại", "/api/reopen-requests"],
  systemLogs: ["lịch sử thay đổi", "/api/logs"],
};

const loadDataPromises = new Map();

function allowedSourceKeys(view) {
  return (viewDataSources[view] || viewDataSources.dashboard).filter((key) => {
    if (key === "invoiceGroupCandidates") return can("create_invoice_groups");
    if (key === "users") return can("manage_users");
    if (key === "reopenRequests") return can("approve_reopen") || can("request_reopen");
    if (key === "systemLogs") return state.currentUser?.role === "admin";
    return true;
  });
}

async function loadDataOnce(view = state.activeView, force = true) {
  if (els.refreshButton) els.refreshButton.disabled = true;
  els.syncStatus.textContent = "Đang tải dữ liệu...";
  try {
    if (!state.currentUser) {
      const me = await fetchJson("/api/me", {}, 90000);
      state.currentUser = me.user;
      state.permissions = me.permissions || { views: [], actions: [] };
      state.roles = me.roles || {};
      showApp();
      applyPermissions();
    }
    const keys = allowedSourceKeys(view).filter((key) => force || !state.loadedSources.has(key));
    if (!keys.length) {
      renderAll();
      els.syncStatus.textContent = `Đã đồng bộ ${formatDateTime(new Date())}`;
      return;
    }
    const sources = keys.map((key) => {
      const [label, url] = dataSourceDefinitions[key];
      return [key, label, fetchJson(url, {}, 90000)];
    });
    const results = await Promise.allSettled(sources.map((source) => source[2]));
    const failed = [];
    results.forEach((result, index) => {
      const [key, label] = sources[index];
      if (result.status === "fulfilled") {
        state[key] = key === "contractPricing" ? result.value.config : (result.value.rows || []);
        state.loadedSources.add(key);
        if (key === "systemCatalogs") state.systemCatalogsLoaded = true;
      } else {
        failed.push(label);
      }
    });
    renderAll();
    prefillCskhB2cOrderTotal();
    els.syncStatus.textContent = failed.length
      ? `Đã tải một phần, lỗi: ${failed.join(", ")}`
      : `Đã đồng bộ ${formatDateTime(new Date())}`;
  } catch (error) {
    const message = error.message || "";
    if (message.includes("đăng nhập") || message.includes("Phiên") || message.includes("401")) {
      showLogin(message);
    } else if (els.syncStatus) {
      els.syncStatus.textContent = message;
    }
  } finally {
    if (els.refreshButton) els.refreshButton.disabled = false;
  }
}

function loadData(view = state.activeView, force = true) {
  const promiseKey = `${view}:${force ? "force" : "cached"}`;
  if (loadDataPromises.has(promiseKey)) return loadDataPromises.get(promiseKey);
  const promise = loadDataOnce(view, force).finally(() => {
    loadDataPromises.delete(promiseKey);
  });
  loadDataPromises.set(promiseKey, promise);
  return promise;
}

function openOrderDialog() {
  if (!canOperateOrders()) return;
  state.editingOrderId = "";
  els.orderForm.dataset.mode = "create";
  const title = els.orderForm.querySelector(".panel-title h2");
  if (title) title.textContent = "Tạo đơn hàng";
  if (els.orderSubmitButton) els.orderSubmitButton.textContent = "Lưu đơn hàng";
  els.orderForm.reset();
  state.orderBenefits = {
    voucherIds: [],
    promotionIds: [],
    voucherOpen: false,
    promotionOpen: false,
    voucherSearch: "",
    promotionSearch: "",
  };
  els.orderFormStatus.textContent = "";
  els.ticketCountInput.value = "0";
  els.orderCustomerId.value = "";
  els.orderCustomerStaff.value = state.currentUser?.displayName || state.currentUser?.username || "";
  els.orderCustomerPreview.textContent = "Nhập số điện thoại để kiểm tra khách hàng.";
  els.invoiceFields.classList.remove("active");
  const debtFields = document.querySelector("#debtFields");
  if (debtFields) debtFields.hidden = true;
  const debtOwner = document.querySelector("#debtOwnerInput");
  if (debtOwner) {
    debtOwner.required = false;
    debtOwner.closest("label")?.classList.remove("required");
  }
  const discountNoteWrap = document.querySelector("#manualDiscountNoteWrap");
  if (discountNoteWrap) {
    discountNoteWrap.hidden = true;
    discountNoteWrap.classList.remove("required");
  }
  if (els.orderForm.elements.ghiChuGiamGia) els.orderForm.elements.ghiChuGiamGia.required = false;
  if (els.orderBenefitsSection) els.orderBenefitsSection.hidden = false;
  renderOrderOptions();
  updateOrderTypeUI();
  els.orderDialog.showModal();
}

function orderIsSharedRide(order) {
  return normalize(order.loaiHopDong).includes("ghep");
}

function canEditOrderInline(order) {
  return order && !orderIsDone(order) && canOperateOrders();
}

function setOrderRadioValue(name, value) {
  const input = els.orderForm.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function setOrderSelectValue(select, value) {
  if (!select) return;
  const option = [...select.options].find((item) => String(item.value) === String(value));
  if (option) select.value = option.value;
}

function openOrderEditDialog(orderId) {
  const order = state.orders.find((row) => String(row.id) === String(orderId));
  if (!canEditOrderInline(order)) {
    openOrderDetails(orderId);
    return;
  }
  state.editingOrderId = String(order.id);
  els.orderForm.reset();
  els.orderForm.dataset.mode = "edit";
  const title = els.orderForm.querySelector(".panel-title h2");
  if (title) title.textContent = `Sửa đơn hàng ${order.id}`;
  if (els.orderSubmitButton) els.orderSubmitButton.textContent = "Lưu thay đổi";
  els.orderFormStatus.textContent =
    order.voucherCodes || order.khuyenMai
      ? "Có thể thêm hoặc bỏ voucher và chương trình khuyến mãi trước khi lưu thay đổi."
      : "";
  state.orderBenefits = {
    voucherIds:
      Array.isArray(order.voucherIds) && order.voucherIds.length
        ? order.voucherIds.map(String)
        : String(order.voucherCodes || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
    promotionIds: Array.isArray(order.promotionIds) ? order.promotionIds.map(String) : [],
    voucherOpen: false,
    promotionOpen: false,
    voucherSearch: "",
    promotionSearch: "",
  };
  const isShared = orderIsSharedRide(order);
  setOrderRadioValue("loaiHopDong", isShared ? "xe_ghep" : "xe_nguyen_chuyen");
  setOrderRadioValue("loaiKhach", order.loaiKhach === "B2B" ? "B2B" : "B2C");
  els.orderCustomerId.value = order.khachHangId || "";
  els.orderCustomerPhone.value = order.soDienThoai || "";
  els.orderCustomerName.value = order.tenKhach || "";
  if (els.orderCustomerAddress) els.orderCustomerAddress.value = order.diaChi || "";
  const customer = state.customers.find((row) => String(row.id) === String(order.khachHangId)) || findCustomerByPhone(order.soDienThoai);
  if (customer) {
    els.orderCustomerCccd.value = customer.soCCCD || "";
    if (els.orderCustomerAddress) els.orderCustomerAddress.value = customer.diaChi || "";
    els.orderCustomerProfileType.value = customer.loaiKhachHang || "";
    els.orderCustomerBirthYear.value = customer.namSinh || "";
    els.orderCustomerGender.value = customer.gioiTinh || "";
    els.orderCustomerSource.value = customer.nguonKhach || "";
    els.orderCustomerStaff.value = customer.nhanVienNhap || "";
  }
  if (customer) {
    fillOrderCustomer(customer);
  } else {
    setOrderCustomerFieldsLocked(false);
    els.orderCustomerPreview.textContent = `Không tìm thấy hồ sơ khách đã gắn với đơn ${order.id}.`;
  }
  renderOrderOptions();
  setOrderSelectValue(els.orderContractSelect, order.hopDongTourId || "");
  if (isShared) {
    els.ticketCountInput.value = String(order.khachXeGhep?.length || Number(order.soVe || 0) || 1);
  }
  setOrderSelectValue(els.orderForm.elements.khuVucDatXe, order.khuVucDatXe || "");
  els.orderPickupInput.value = order.diemDon || "";
  els.orderDropoffInput.value = order.diemTra || "";
  els.orderForm.elements.ngayGioDi.value = formatDateTime(order.ngayGioDi) || "";
  setOrderSelectValue(els.orderForm.elements.soCho, order.soCho || order.so_cho || "");
  els.orderForm.elements.giaTien.value = formatMoney(order.giaTien) || "";
  els.orderForm.elements.giamGia.value = formatMoney(order.giamGia) || "0";
  if (els.orderForm.elements.ghiChuGiamGia) {
    els.orderForm.elements.ghiChuGiamGia.value = order.ghiChuGiamGia || "";
    els.orderForm.elements.ghiChuGiamGia.required = Number(order.giamGia || 0) > 0;
    els.orderForm.elements.ghiChuGiamGia.closest("label").hidden = !(Number(order.giamGia || 0) > 0);
  }
  els.orderForm.elements.phuThu.value = formatMoney(order.phuThu) || "0";
  if (els.orderForm.elements.lyDoPhuThu) {
    const hasSurcharge = Number(order.phuThu || 0) > 0;
    els.orderForm.elements.lyDoPhuThu.value = order.lyDoPhuThu || "";
    els.orderForm.elements.lyDoPhuThu.required = hasSurcharge;
    els.orderForm.elements.lyDoPhuThu.closest("label").hidden = !hasSurcharge;
    els.orderForm.elements.lyDoPhuThu.closest("label").classList.toggle("required", hasSurcharge);
  }
  els.orderForm.elements.daCoc.value = formatMoney(order.daCoc) || "0";
  els.invoiceToggle.checked = normalize(order.yeuCauHoaDon).includes("co");
  els.invoiceFields.classList.toggle("active", els.invoiceToggle.checked);
  els.orderForm.elements.tenCongTy.value = order.tenCongTy || "";
  els.orderForm.elements.maSoThue.value = order.maSoThue || "";
  els.orderForm.elements.diaChiHoaDon.value = order.diaChiHoaDon || "";
  els.orderForm.elements.emailHoaDon.value = order.emailHoaDon || "";
  const debtToggle = document.querySelector("#debtToggle");
  const debtFields = document.querySelector("#debtFields");
  const debtOwner = document.querySelector("#debtOwnerInput");
  const hasDebt = normalize(order.congNo).includes("co");
  if (debtToggle) debtToggle.checked = hasDebt;
  if (debtFields) debtFields.hidden = !hasDebt;
  if (debtOwner) {
    debtOwner.value = order.congNoChoAi || "";
    debtOwner.required = hasDebt;
    debtOwner.closest("label")?.classList.toggle("required", hasDebt);
  }
  els.orderForm.elements.ghiChu.value = order.ghiChu || "";
  if (els.orderBenefitsSection) els.orderBenefitsSection.hidden = false;
  updateOrderTypeUI();
  if (isShared) populateSharedPassengerFields(order.khachXeGhep || []);
  setOrderCustomerFieldsLocked(Boolean(customer));
  if (els.orderBenefitsSection) els.orderBenefitsSection.hidden = false;
  renderOrderBenefits();
  updateOrderPaymentSummary();
  els.orderDialog.showModal();
}

function openAssignVehicleDialog(orderId) {
  if (!canOperateOrders()) return;
  const order = state.orders.find((row) => String(row.id) === String(orderId));
  if (!order || orderIsDone(order)) return;
  els.assignVehicleForm.reset();
  els.assignVehicleForm.elements.orderId.value = order.id;
  els.assignVehicleForm.elements.ngayGioDi.value = formatDateTime(order.ngayGioDi) || "";
  els.assignVehicleForm.elements.ngayGioDuKienKetThuc.value = formatDateTime(order.ngayGioDuKienKetThuc) || "";
  els.assignVehicleForm.querySelectorAll(".datetime-input").forEach((input) => {
    input.classList.remove("invalid");
    input.setCustomValidity("");
  });
  els.assignVehicleFormStatus.textContent = "";
  els.assignVehicleSummary.innerHTML = detailSection("Đơn cần điều xe", "detail-amber", [
    detailArticle("Mã đơn", order.id),
    detailArticle("Khách hàng", `${order.tenKhach || "Xe ghép"}${order.soDienThoai ? ` - ${order.soDienThoai}` : ""}`),
    detailArticle("Tuyến", order.tuyen || order.loaiHopDong || ""),
    detailArticle("Điểm đón / trả", [order.diemDon, order.diemTra].filter(Boolean).join(" - ")),
    detailArticle("Thực thu", formatMoney(orderRevenueAmount(order)) || "0"),
  ]);
  renderVehicleOptions();
  if (order.bienKiemSoat && [...els.orderVehicleSelect.options].some((option) => option.value === order.bienKiemSoat)) {
    els.orderVehicleSelect.value = order.bienKiemSoat;
  }
  updateVehicleWarning();
  els.assignVehicleDialog.showModal();
}

function openCompleteDialog(orderId) {
  if (!canOperateOrders()) return;
  const order = state.orders.find((row) => String(row.id) === String(orderId));
  if (!order) return;
  if (!normalize(order.trangThaiGuiTaiXe).includes("da gui tai xe")) {
    window.alert("Vui lòng đánh dấu Đã gửi tài xế trước khi hoàn thành đơn hàng.");
    return;
  }
  els.completeForm.elements.orderId.value = order.id;
  els.completeForm.elements.ngayGioHoanThanh.value = localNowForInput();
  els.completeOrderLabel.textContent = `${order.tenKhach} - ${order.tuyen}`;
  els.completeOrderSummary.innerHTML = [
    detailArticle("Mã đơn", order.id),
    detailArticle("Khách hàng", `${order.tenKhach || ""}${order.soDienThoai ? ` - ${order.soDienThoai}` : ""}`),
    detailArticle("Loại đơn", order.loaiHopDong || ""),
    detailArticle("Tuyến", order.tuyen || ""),
    detailArticle("Điểm đón / trả", `${order.diemDon || ""}${order.diemTra ? ` - ${order.diemTra}` : ""}`),
    detailArticle("Xe", order.bienKiemSoat || ""),
    detailArticle("Lái xe", `${order.hoTenLaiXe || ""}${order.maNVLaiXe ? ` - ${order.maNVLaiXe}` : ""}`),
    detailArticle("Đơn vị vận hành xe", vehicleOwnershipLabel(order)),
    hasCommission(order) ? detailArticle("Hoa hồng xe thương quyền", orderCommissionText(order)) : "",
    detailArticle("Giờ đi", formatDateTime(order.ngayGioDi)),
    detailArticle("Dự kiến kết thúc", formatDateTime(order.ngayGioDuKienKetThuc)),
    detailArticle("Giá tiền", formatMoney(order.giaTien)),
    detailArticle("Giảm giá", formatMoney(order.giamGia) || "0"),
    detailArticle("Phụ thu", formatMoney(order.phuThu) || "0"),
    order.phuThu ? detailArticle("Lý do phụ thu", order.lyDoPhuThu || "") : "",
    detailArticle("Ưu đãi", formatMoney(order.tongUuDai) || "0"),
    detailArticle("Voucher", order.voucherCodes || ""),
    detailArticle("Khuyến mãi", order.khuyenMai || ""),
    detailArticle("Thực thu", formatMoney(orderRevenueAmount(order)) || "0"),
    detailArticle("Khách đã cọc", formatMoney(order.daCoc) || "0"),
    detailArticle("Còn phải thu", formatMoney(orderNetAmount(order)) || "0"),
  ].join("");
  els.completeDialog.showModal();
}

function openReopenDialog(orderId) {
  if (!canOperateOrders()) return;
  const order = state.orders.find((row) => String(row.id) === String(orderId));
  if (!order || !els.reopenDialog) return;
  els.reopenForm.reset();
  els.reopenForm.elements.orderId.value = order.id;
  els.reopenFormStatus.textContent = `Gửi yêu cầu mở lại đơn ${order.id} để admin duyệt.`;
  els.reopenDialog.showModal();
}

async function reviewReopenRequest(requestId, approved) {
  const adminNote = window.prompt(approved ? "Ghi chú duyệt (nếu có):" : "Lý do từ chối (nếu có):") || "";
  await fetchJson(`/api/reopen-requests/${encodeURIComponent(requestId)}/${approved ? "approve" : "reject"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminNote }),
  });
  await loadData();
}

function detailArticle(label, value) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "")}</strong></article>`;
}

function detailSection(title, tone, items) {
  const content = items.filter(Boolean).join("");
  if (!content) return "";
  return `<section class="order-detail-section ${tone}">
    <h3>${escapeHtml(title)}</h3>
    <div class="order-detail-grid">${content}</div>
  </section>`;
}

function openCustomerDetails(customerId) {
  els.detailsSaveButton.textContent = "Lưu thay đổi";
  const row = state.customers.find((item) => String(item.id) === String(customerId));
  if (!row) return;
  els.detailsSaveButton.hidden = false;
  els.detailsDeleteButton.hidden = false;
  els.detailsForm.elements.id.value = row.id;
  els.detailsForm.elements.type.value = "customer";
  els.detailsTitle.textContent = "Chi tiết khách hàng";
  els.detailsStatus.textContent = "";
  els.detailsReadonly.innerHTML = [
    detailArticle("ID", row.id),
    detailArticle("Ngày tạo", formatDateTime(row.createdAt)),
  ].join("");
  els.detailsEditor.innerHTML = `
    <label class="required"><span>Tên khách hàng</span><input name="tenKhach" value="${escapeHtml(row.tenKhach)}" required /></label>
    <label class="required"><span>Số điện thoại</span><input name="soDienThoai" value="${escapeHtml(row.soDienThoai)}" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="0xxxxxxxxx" required /></label>
    <label><span>Số CCCD</span><input name="soCCCD" value="${escapeHtml(row.soCCCD || "")}" /></label>
    <label><span>Địa chỉ</span><input name="diaChi" value="${escapeHtml(row.diaChi || "")}" /></label>
    <label><span>Loại khách</span><select name="loaiKhachHang"><option value="">Chọn loại khách</option><option ${row.loaiKhachHang === "Khách cá nhân" ? "selected" : ""}>Khách cá nhân</option><option ${row.loaiKhachHang === "Khách doanh nghiệp" ? "selected" : ""}>Khách doanh nghiệp</option></select></label>
    <label><span>Năm sinh</span><input name="namSinh" value="${escapeHtml(row.namSinh)}" /></label>
    <label class="required"><span>Giới tính</span><select name="gioiTinh" required><option value="">Chọn giới tính</option><option ${row.gioiTinh === "Nam" ? "selected" : ""}>Nam</option><option ${row.gioiTinh === "Nữ" ? "selected" : ""}>Nữ</option><option ${row.gioiTinh === "Khác" ? "selected" : ""}>Khác</option></select></label>
    <label class="required"><span>Nguồn khách</span><select name="nguonKhach" required>${selectOptions([...new Set([...customerSourceOptions(), row.nguonKhach].filter(Boolean))], row.nguonKhach || "", "Chọn nguồn")}</select></label>
    <label><span>Nhân viên nhập</span><input name="nhanVienNhap" value="${escapeHtml(row.nhanVienNhap)}" readonly /></label>
  `;
  els.detailsDialog.showModal();
}

function openContractDetails(contractId) {
  els.detailsSaveButton.textContent = "Lưu thay đổi";
  const row = state.contracts.find((item) => String(item.id) === String(contractId));
  if (!row) return;
  els.detailsSaveButton.hidden = false;
  els.detailsDeleteButton.hidden = false;
  els.detailsForm.elements.id.value = row.id;
  els.detailsForm.elements.type.value = "contract";
  els.detailsTitle.textContent = "Chi tiết hợp đồng/tuyến";
  els.detailsStatus.textContent = "";
  els.detailsReadonly.innerHTML = [
    detailArticle("ID", row.id),
    detailArticle("Ngày tạo", formatDateTime(row.createdAt)),
  ].join("");
  els.detailsEditor.innerHTML = `
    <label class="required"><span>Điểm đi</span><input name="diemDi" value="${escapeHtml(row.diemDi || "")}" required /></label>
    <label class="required"><span>Điểm đến</span><input name="diemDen" value="${escapeHtml(row.diemDen || "")}" required /></label>
    <label class="full"><span>Ghi chú</span><textarea name="ghiChu" rows="3">${escapeHtml(row.ghiChu)}</textarea></label>
  `;
  els.detailsDialog.showModal();
}

function openVoucherDetails(voucherId) {
  els.detailsSaveButton.textContent = "Lưu thay đổi";
  const row = state.vouchers.find((item) => String(item.id) === String(voucherId));
  if (!row) return;
  const canManageBenefits = can("manage_benefits");
  els.detailsSaveButton.hidden = !canManageBenefits;
  els.detailsDeleteButton.hidden = !canManageBenefits;
  els.detailsForm.elements.id.value = row.id;
  els.detailsForm.elements.type.value = "voucher";
  els.detailsTitle.textContent = "Chi tiết voucher";
  els.detailsStatus.textContent = "";
  els.detailsReadonly.innerHTML = [
    detailArticle("ID", row.id),
    detailArticle("Trạng thái", row.trangThaiSuDung || row.trangThai || ""),
    detailArticle("Đơn đã dùng", row.donHangId || ""),
    detailArticle("Khách đã dùng", row.tenKhach || ""),
  ].join("");
  els.detailsEditor.innerHTML = `
    <label class="required"><span>Mã voucher</span><input name="maVoucher" value="${escapeHtml(row.maVoucher || "")}" required /></label>
    <label class="required"><span>Tên chiến dịch</span><input name="tenVoucher" value="${escapeHtml(row.tenVoucher || "")}" required /></label>
    <label class="required"><span>Loại giá trị</span><select name="loaiGiaTri"><option value="fixed" ${row.loaiGiaTri === "fixed" ? "selected" : ""}>Số tiền</option><option value="percent" ${row.loaiGiaTri === "percent" ? "selected" : ""}>Phần trăm</option></select></label>
    <label class="required"><span>Giá trị</span><input name="giaTri" class="money-input" value="${escapeHtml(formatMoney(row.giaTri) || row.giaTri || "")}" required /></label>
    <label><span>Ngày bắt đầu</span><input name="ngayBatDau" class="date-input" inputmode="numeric" value="${escapeHtml(row.ngayBatDau || "")}" /></label>
    <label><span>Ngày hết hạn</span><input name="ngayHetHan" class="date-input" inputmode="numeric" value="${escapeHtml(row.ngayHetHan || "")}" /></label>
    <label class="checkbox-line"><input name="khongGioiHanHanDung" type="checkbox" ${row.ngayHetHan ? "" : "checked"} /><span>Không giới hạn hạn sử dụng</span></label>
    <label><span>Trạng thái</span><select name="trangThai"><option ${row.trangThai === "Đang áp dụng" ? "selected" : ""}>Đang áp dụng</option><option ${row.trangThai === "Tạm ngưng" ? "selected" : ""}>Tạm ngưng</option></select></label>
    <label class="full"><span>Ghi chú</span><textarea name="ghiChu" rows="3">${escapeHtml(row.ghiChu || "")}</textarea></label>
  `;
  els.detailsEditor.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = !canManageBenefits;
  });
  if (!canManageBenefits) {
    els.detailsStatus.textContent = "Ban chi duoc xem voucher. Viec tao, sua, xoa do Kinh doanh quan ly.";
  }
  els.detailsDialog.showModal();
}

function openPromotionDetails(promotionId) {
  els.detailsSaveButton.textContent = "Lưu thay đổi";
  const row = state.promotions.find((item) => String(item.id) === String(promotionId));
  if (!row) return;
  const canManageBenefits = can("manage_benefits");
  els.detailsSaveButton.hidden = !canManageBenefits;
  els.detailsDeleteButton.hidden = !canManageBenefits;
  els.detailsForm.elements.id.value = row.id;
  els.detailsForm.elements.type.value = "promotion";
  els.detailsTitle.textContent = "Chi tiết khuyến mãi";
  els.detailsStatus.textContent = "";
  els.detailsReadonly.innerHTML = [
    detailArticle("ID", row.id),
    detailArticle("Trạng thái", row.trangThaiHieuLuc || row.trangThai || ""),
  ].join("");
  els.detailsEditor.innerHTML = `
    <label class="required full"><span>Tên chương trình</span><input name="tenChuongTrinh" value="${escapeHtml(row.tenChuongTrinh || "")}" required /></label>
    <label class="required"><span>Loại giá trị</span><select name="loaiGiaTri"><option value="fixed" ${row.loaiGiaTri === "fixed" ? "selected" : ""}>Số tiền</option><option value="percent" ${row.loaiGiaTri === "percent" ? "selected" : ""}>Phần trăm</option></select></label>
    <label class="required"><span>Giá trị</span><input name="giaTri" class="money-input" value="${escapeHtml(formatMoney(row.giaTri) || row.giaTri || "")}" required /></label>
    <label><span>Ngày bắt đầu</span><input name="ngayBatDau" class="date-input" inputmode="numeric" value="${escapeHtml(row.ngayBatDau || "")}" /></label>
    <label><span>Ngày hết hạn</span><input name="ngayHetHan" class="date-input" inputmode="numeric" value="${escapeHtml(row.ngayHetHan || "")}" /></label>
    <label><span>Trạng thái</span><select name="trangThai"><option ${row.trangThai === "Đang áp dụng" ? "selected" : ""}>Đang áp dụng</option><option ${row.trangThai === "Tạm ngưng" ? "selected" : ""}>Tạm ngưng</option></select></label>
    <label class="full"><span>Ghi chú</span><textarea name="ghiChu" rows="3">${escapeHtml(row.ghiChu || "")}</textarea></label>
  `;
  els.detailsEditor.querySelectorAll("input, select, textarea").forEach((field) => {
    field.disabled = !canManageBenefits;
  });
  if (!canManageBenefits) {
    els.detailsStatus.textContent = "Ban chi duoc xem khuyen mai. Viec tao, sua, xoa do Kinh doanh quan ly.";
  }
  els.detailsDialog.showModal();
}

async function updateInvoiceOrderStatus(invoiceId, status, entityType = "order") {
  const endpoint = entityType === "sharedPassenger"
    ? `/api/shared-passengers/${encodeURIComponent(invoiceId)}/invoice-status`
    : entityType === "invoiceGroup"
      ? `/api/invoice-groups/${encodeURIComponent(invoiceId)}/invoice-status`
      : `/api/orders/${encodeURIComponent(invoiceId)}/invoice-status`;
  await fetchJson(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trangThaiHoaDon: status }),
  });
  await loadData();
  switchView("invoiceOrders");
}

function selectedInvoiceGroupOrders() {
  return state.invoiceGroupCandidates.filter((row) => state.invoiceGroupSelection.has(String(row.id)));
}

function renderInvoiceGroupSummary() {
  const rows = selectedInvoiceGroupOrders();
  const beforeVat = rows.reduce((total, row) => total + Number(row.tienTruocVAT || 0), 0);
  const vat = rows.reduce((total, row) => total + Math.round(Number(row.tienTruocVAT || 0) * 0.08), 0);
  els.invoiceGroupSummary.innerHTML = `
    <div class="invoice-group-summary-title">
      <div>
        <span>Tổng kết hóa đơn</span>
        <small>Giá trị được tổng hợp từ các đơn đã chọn</small>
      </div>
      <span class="invoice-group-count">${rows.length} đơn</span>
    </div>
    <div class="invoice-group-summary-grid">
      <article>
        <span>Giá trị trước VAT</span>
        <strong>${escapeHtml(formatMoney(beforeVat)) || "0"} <small>đ</small></strong>
      </article>
      <article>
        <span>Thuế VAT 8%</span>
        <strong>${escapeHtml(formatMoney(vat)) || "0"} <small>đ</small></strong>
      </article>
      <article class="invoice-group-grand-total">
        <span>Tổng thanh toán</span>
        <strong>${escapeHtml(formatMoney(beforeVat + vat)) || "0"} <small>đ</small></strong>
      </article>
    </div>
  `;
}

function renderInvoiceGroupCandidates() {
  const selected = selectedInvoiceGroupOrders();
  const customerKey = selected[0] ? String(selected[0].khachHangId || normalizePhone(selected[0].soDienThoai)) : "";
  els.invoiceGroupCandidateTable.innerHTML =
    state.invoiceGroupCandidates
      .filter((row) => {
        const keyword = normalize(state.invoiceGroupSearch);
        if (!keyword) return true;
        return normalize(`${row.id || ""} ${row.tenKhach || ""} ${row.soDienThoai || ""}`).includes(keyword);
      })
      .map((row) => {
        const rowKey = String(row.khachHangId || normalizePhone(row.soDienThoai));
        const disabled = customerKey && rowKey !== customerKey;
        const checked = selected.some((item) => String(item.id) === String(row.id));
        return `<tr>
          <td><input type="checkbox" data-invoice-group-order value="${escapeHtml(row.id)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} /></td>
          <td><strong>${escapeHtml(row.id || "")}</strong></td>
          <td><strong>${escapeHtml(row.tenKhach || "")}</strong><div class="muted">${escapeHtml(row.soDienThoai || "")}</div></td>
          <td>${escapeHtml(formatDateTime(row.ngayGioDi))}</td>
          <td>${escapeHtml(row.tuyen || "")}</td>
          <td><strong>${escapeHtml(formatMoney(row.tienTruocVAT)) || "0"}</strong></td>
        </tr>`;
      })
      .join("") || `<tr><td colspan="6" class="empty">Không có đơn đã hoàn thành phù hợp để gộp hóa đơn.</td></tr>`;
  renderInvoiceGroupSummary();
}

function openInvoiceGroupDialog() {
  if (!can("create_invoice_groups")) return;
  els.invoiceGroupForm.reset();
  state.invoiceGroupSelection.clear();
  state.invoiceGroupSearch = "";
  els.invoiceGroupSearch.value = "";
  els.invoiceGroupFormStatus.textContent = "";
  renderInvoiceGroupCandidates();
  els.invoiceGroupDialog.showModal();
}

async function updateDebtOrderStatus(orderId, status, entityType = "order") {
  await fetchJson(`/api/debt-orders/${encodeURIComponent(orderId)}/status?entityType=${encodeURIComponent(entityType)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trangThaiCongNo: status }),
  });
  await loadData();
  switchView("debtOrders");
}

async function updateCommissionOrderStatus(orderId, status) {
  await fetchJson(`/api/commission-orders/${encodeURIComponent(orderId)}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trangThaiHoaHong: status }),
  });
  await loadData();
  switchView("commissionOrders");
}

function openResetPasswordDialog(userId) {
  const row = state.users.find((item) => String(item.id) === String(userId));
  if (!row || !els.resetPasswordDialog) return;
  els.resetPasswordForm.reset();
  els.resetPasswordForm.elements.userId.value = row.id;
  els.resetPasswordForm.elements.username.value = row.username || "";
  els.resetPasswordFormStatus.textContent = "";
  els.resetPasswordDialog.showModal();
}

function openEditUserDialog(userId) {
  const row = state.users.find((item) => String(item.id) === String(userId));
  if (!row || !els.userDialog) return;
  els.userForm.reset();
  els.userForm.elements.id.value = row.id || "";
  els.userForm.elements.username.value = row.username || "";
  els.userForm.elements.displayName.value = row.displayName || "";
  els.userForm.elements.role.value = row.role || "cskh";
  els.userForm.elements.status.value = normalize(row.status) === "active" || normalize(row.status) === "dang hoat dong"
    ? "active"
    : "inactive";
  els.userForm.elements.manageSystemCatalogs.checked = String(row.extraPermissions || "")
    .split(",")
    .map((value) => value.trim())
    .includes("manage_system_catalogs");
  els.userForm.elements.password.required = false;
  els.userPasswordField.hidden = true;
  els.userDialogTitle.textContent = "Chỉnh sửa tài khoản";
  els.userSubmitButton.textContent = "Lưu thay đổi";
  els.userFormStatus.textContent = "";
  els.userDialog.showModal();
}

function openFranchiseVehicleDetails(vehicleId) {
  els.detailsSaveButton.textContent = "Lưu thay đổi";
  const row = state.franchiseVehicles.find((item) => String(item.id) === String(vehicleId));
  if (!row) return;
  els.detailsSaveButton.hidden = false;
  els.detailsDeleteButton.hidden = false;
  els.detailsForm.elements.id.value = row.id;
  els.detailsForm.elements.type.value = "franchiseVehicle";
  els.detailsTitle.textContent = "Chi tiết xe thương quyền";
  els.detailsStatus.textContent = "";
  els.detailsReadonly.innerHTML = [
    detailArticle("ID", row.id),
    detailArticle("Ngày tạo", formatDateTime(row.createdAt)),
  ].join("");
  els.detailsEditor.innerHTML = `
    <label class="required"><span>Biển số xe</span><input name="bienKiemSoat" value="${escapeHtml(row.bienKiemSoat || "")}" required pattern="\\d{2}[A-Za-z]-\\d{3}\\.\\d{2}" placeholder="68A-123.45" title="Nhập đúng định dạng 68A-123.45" /></label>
    <label class="required"><span>Dòng xe</span><select name="dongXe" required>${selectOptions(vehicleLineOptions(), row.dongXe || "", "Chọn dòng xe")}</select></label>
    <label class="required"><span>Hiệu xe</span><select name="hieuXe" required>${selectOptions(vehicleMakeOptions(), row.hieuXe || "", "Chọn hiệu xe")}</select></label>
    <label><span>Số chỗ</span><select name="soCho">${selectOptions(vehicleSeatOptions, row.soCho || "", "Chọn số chỗ")}</select></label>
    <label class="required"><span>Chủ xe / đơn vị hợp tác</span><input name="tenChuXe" value="${escapeHtml(row.tenChuXe || "")}" required /></label>
    <label><span>SĐT chủ xe</span><input name="soDienThoaiChuXe" value="${escapeHtml(row.soDienThoaiChuXe || "")}" /></label>
    <label class="required"><span>Lái xe</span><input name="hoTenLaiXe" value="${escapeHtml(row.hoTenLaiXe || "")}" required /></label>
    <label><span>SĐT lái xe</span><input name="soDienThoaiLaiXe" value="${escapeHtml(row.soDienThoaiLaiXe || "")}" /></label>
    <label class="full"><span>Địa chỉ lái xe</span><input name="diaChiLaiXe" value="${escapeHtml(row.diaChiLaiXe || "")}" /></label>
    <label><span>Trạng thái</span><select name="trangThai"><option ${row.trangThai === "Đang hợp tác" ? "selected" : ""}>Đang hợp tác</option><option ${row.trangThai === "Tạm ngưng" ? "selected" : ""}>Tạm ngưng</option><option ${row.trangThai === "Ngừng hợp tác" ? "selected" : ""}>Ngừng hợp tác</option></select></label>
    <label class="full"><span>Ghi chú</span><textarea name="ghiChu" rows="3">${escapeHtml(row.ghiChu || "")}</textarea></label>
  `;
  els.detailsDialog.showModal();
}

function openOrderDetails(orderId) {
  const row =
    state.orders.find((item) => String(item.id) === String(orderId)) ||
    state.invoiceOrders.find((item) => String(item.id) === String(orderId));
  if (!row) return;
  const feedback = state.orderFeedback.find((item) => String(item.donHangId) === String(row.id)) || {};
  const canManageFeedback = orderIsDone(row) && can("manage_order_feedback");
  const debtStatus = normalize(row.congNo);
  const hasDebtRecord = debtStatus.includes("co") || ["true", "yes", "1"].includes(debtStatus);
  const storedDebtAmount = String(row.soTienCongNo || "").trim();
  const debtAmount = hasDebtRecord
    ? (storedDebtAmount
      ? parseMoney(storedDebtAmount)
      : Math.max(orderTotalPaymentAmount(row) - parseMoney(row.daCoc), 0))
    : 0;
  els.detailsForm.elements.id.value = row.id;
  els.detailsForm.elements.type.value = canManageFeedback ? "orderFeedback" : "order";
  els.detailsTitle.textContent = "Chi tiết đơn hàng";
  els.detailsStatus.textContent = "";
  els.detailsReadonly.innerHTML = [
    detailSection("Thông tin đơn hàng", "detail-blue", [
      detailArticle("Mã đơn", row.orderCode || row.id),
      row.invoiceEntityType === "sharedPassenger" ? detailArticle("Mã khách xe ghép", row.id) : "",
      detailArticle("Trạng thái", row.trangThai || ""),
      detailArticle("Loại đơn", row.loaiHopDong || ""),
      detailArticle("Khách hàng", `${row.tenKhach || ""}${row.soDienThoai ? ` - ${row.soDienThoai}` : ""}`),
    ]),
    detailSection("Hành trình", "detail-amber", [
      detailArticle("Tuyến", row.tuyen || ""),
      detailArticle("Điểm đón", row.diemDon || ""),
      detailArticle("Điểm trả", row.diemTra || ""),
      detailArticle("Giờ đi", formatDateTime(row.ngayGioDi)),
      detailArticle("Dự kiến kết thúc", formatDateTime(row.ngayGioDuKienKetThuc)),
      detailArticle("Hoàn thành", formatDateTime(row.ngayGioHoanThanh)),
    ]),
    detailSection("Điều xe", "detail-slate", [
      detailArticle("Xe", `${row.bienKiemSoat || ""}${row.soHieuXe ? ` - ${row.soHieuXe}` : ""}`),
      detailArticle("Lái xe", `${row.hoTenLaiXe || ""}${row.maNVLaiXe ? ` - ${row.maNVLaiXe}` : ""}`),
      detailArticle("Đơn vị vận hành xe", vehicleOwnershipLabel(row)),
      hasCommission(row) ? detailArticle("Hoa hồng xe thương quyền", orderCommissionText(row)) : "",
    ]),
    detailSection("Tài chính", "detail-purple", [
      detailArticle("Giá tiền / doanh thu", formatMoney(row.giaTien)),
      detailArticle("Giảm giá", formatMoney(row.giamGia) || "0"),
      detailArticle("Phụ thu", formatMoney(row.phuThu) || "0"),
      row.phuThu ? detailArticle("Lý do phụ thu", row.lyDoPhuThu || "") : "",
      detailArticle("Ưu đãi", formatMoney(row.tongUuDai) || "0"),
      detailArticle("Voucher", row.voucherCodes || ""),
      detailArticle("Khuyến mãi", row.khuyenMai || ""),
      detailArticle("Thành tiền trước VAT", formatMoney(orderRevenueAmount(row)) || "0"),
      detailArticle("Thuế VAT (8%)", formatMoney(orderVatAmount(row)) || "0"),
      detailArticle("Tổng thanh toán", formatMoney(orderTotalPaymentAmount(row)) || "0"),
      detailArticle("Khách đã cọc", formatMoney(row.daCoc) || "0"),
      detailArticle("Ghi nhận công nợ", hasDebtRecord ? "Có" : "Không"),
      detailArticle("Số tiền công nợ", hasDebtRecord ? (formatMoney(debtAmount) || "0") : "0"),
      detailArticle("Công nợ cho ai", hasDebtRecord ? (row.congNoChoAi || "—") : "—"),
      detailArticle("Trạng thái nộp tiền", hasDebtRecord ? "Công nợ" : (row.trangThaiNopTien === "Đã nộp tiền" ? "Đã nộp tiền" : "Chưa nộp tiền")),
      detailArticle("Còn phải thu", formatMoney(orderNetAmount(row)) || "0"),
    ]),
    detailSection("Hóa đơn", "detail-green", [
      detailArticle("Yêu cầu hóa đơn", row.yeuCauHoaDon || "Không"),
      detailArticle("Loại khách", row.loaiKhach || ""),
      detailArticle("Tên công ty", row.tenCongTy || ""),
      detailArticle("Mã số thuế", row.maSoThue || ""),
      detailArticle("Địa chỉ hóa đơn", row.diaChiHoaDon || ""),
      detailArticle("Email nhận hóa đơn", row.emailHoaDon || ""),
      detailArticle("Trạng thái hóa đơn", invoiceOrderStatus(row)),
      detailArticle("Ngày xuất hóa đơn", formatDateTime(row.ngayXuatHoaDon)),
      detailArticle("Người xuất hóa đơn", row.nguoiXuatHoaDon || ""),
      detailArticle("Ghi chú", row.ghiChu || ""),
    ]),
    feedback.id && !canManageFeedback
      ? detailSection("Phản hồi khách hàng", "detail-blue", [
          detailArticle("Kênh chăm sóc", feedback.kenhChamSoc || ""),
          detailArticle("Điểm đánh giá", feedback.diemDanhGia ? `${feedback.diemDanhGia}/10` : ""),
          detailArticle("Nội dung khách hàng phản ánh", feedback.noiDungPhanHoi || ""),
          detailArticle("Hình thức xử lý", feedback.hinhThucXuLy || ""),
          detailArticle("Kết quả xử lý", feedback.ketQuaXuLy || ""),
          detailArticle("Chú thích", feedback.chuThich || ""),
        ])
      : "",
  ].join("");
  els.detailsEditor.innerHTML = canManageFeedback
    ? `
      <fieldset class="feedback-editor full">
        <legend>Phản hồi khách hàng sau chuyến đi</legend>
        <div class="form-grid two-col">
          <label class="required">
            <span>Kênh chăm sóc</span>
            <select name="kenhChamSoc" required>
              ${selectOptions(["Điện thoại", "Zalo", "Facebook", "Email", "Trực tiếp", "Khác"], feedback.kenhChamSoc || "", "Chọn kênh chăm sóc")}
            </select>
          </label>
          <label class="required">
            <span>Điểm đánh giá (thang điểm 10)</span>
            <input name="diemDanhGia" type="number" min="1" max="10" step="1" value="${escapeHtml(feedback.diemDanhGia || "")}" required />
          </label>
          <label class="required full">
            <span>Nội dung khách hàng phản ánh</span>
            <textarea name="noiDungPhanHoi" rows="3" required>${escapeHtml(feedback.noiDungPhanHoi || "")}</textarea>
          </label>
          <label>
            <span>Hình thức xử lý</span>
            <textarea name="hinhThucXuLy" rows="2">${escapeHtml(feedback.hinhThucXuLy || "")}</textarea>
          </label>
          <label>
            <span>Kết quả xử lý</span>
            <textarea name="ketQuaXuLy" rows="2">${escapeHtml(feedback.ketQuaXuLy || "")}</textarea>
          </label>
          <label class="full">
            <span>Chú thích</span>
            <textarea name="chuThich" rows="2">${escapeHtml(feedback.chuThich || "")}</textarea>
          </label>
        </div>
      </fieldset>
    `
    : "";
  els.detailsSaveButton.textContent = canManageFeedback ? "Lưu phản hồi" : "Lưu thay đổi";
  els.detailsSaveButton.hidden = !canManageFeedback;
  els.detailsDeleteButton.hidden = row.invoiceEntityType === "sharedPassenger" || orderIsDone(row) || !canOperateOrders();
  els.detailsDialog.showModal();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

els.loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (els.loginSubmitButton) els.loginSubmitButton.disabled = true;
  if (els.loginStatus) els.loginStatus.textContent = "Đang đăng nhập...";
  const formData = new FormData(els.loginForm);
  try {
    const result = await fetchJson(
      "/api/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      },
      15000,
    );
    state.authToken = result.token || "";
    window.localStorage.setItem("diXanhAuthToken", state.authToken);
    state.currentUser = result.user;
    state.permissions = result.permissions || { views: [], actions: [] };
    state.roles = result.roles || {};
    if (els.loginStatus) els.loginStatus.textContent = "";
    showApp();
    await loadData();
  } catch (error) {
    if (els.loginStatus) els.loginStatus.textContent = error.message || "Không đăng nhập được.";
  } finally {
    if (els.loginSubmitButton) els.loginSubmitButton.disabled = false;
  }
});

els.logoutButton?.addEventListener("click", async () => {
  try {
    await fetchJson("/api/logout", { method: "POST" }, 10000);
  } catch (error) {
    // Local session is cleared below even if the server session is already gone.
  }
  clearAuth("Đã đăng xuất.");
});

els.refreshButton.addEventListener("click", loadData);
els.cskhShiftReportForm?.elements.caLamViec?.addEventListener("change", syncCskhShiftForm);
els.cskhShiftReportForm?.elements.ngay?.addEventListener("change", prefillCskhB2cOrderTotal);
els.cskhShiftReportFromInput?.addEventListener("change", renderCskhShiftReports);
els.cskhShiftReportToInput?.addEventListener("change", renderCskhShiftReports);
els.cskhShiftReportExportButton?.addEventListener("click", () => {
  const range = reportDateRange(els.cskhShiftReportFromInput, els.cskhShiftReportToInput);
  if (!range) return;
  window.location.href = `/api/cskh-shift-reports/export.xlsx?tuNgay=${encodeURIComponent(range.from)}&denNgay=${encodeURIComponent(range.to)}`;
});
els.cskhShiftReportForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.currentUser?.role === "marketing") return;
  const form = els.cskhShiftReportForm;
  if (!form.reportValidity()) return;
  els.cskhShiftReportSubmitButton.disabled = true;
  els.cskhShiftReportStatus.textContent = "Đang lưu...";
  const data = new FormData(form);
  const numberValue = (name) => Number(data.get(name) || 0);
  const selectedDateText = String(data.get("ngay") || "").split("-").reverse().join("/");
  const selectedShift = `Ca ${numberValue("caLamViec")}`;
  const employee = state.currentUser?.displayName || state.currentUser?.username || "";
  const duplicate = state.cskhShiftReports.some((row) =>
    String(row["Ngày"] || "").trim() === selectedDateText
    && String(row["Ca Làm Việc"] || "").trim() === selectedShift
    && String(row["Nhân Viên Trực"] || "").trim() === employee
  );
  if (duplicate) {
    const message = `Báo cáo ngày ${selectedDateText} - ${selectedShift} đã được khai báo.`;
    els.cskhShiftReportStatus.textContent = message;
    els.cskhShiftReportSubmitButton.disabled = false;
    window.alert(message);
    return;
  }
  try {
    const result = await fetchJson("/api/cskh-shift-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ngay: data.get("ngay"),
        caLamViec: numberValue("caLamViec"),
        soLuongTinNhanMeta: numberValue("soLuongTinNhanMeta"),
        soLuongKhachPhanHoi: numberValue("soLuongKhachPhanHoi"),
        soLuongCuocGoi: numberValue("soLuongCuocGoi"),
        soLuongChatZalo: numberValue("soLuongChatZalo"),
        soLuongKhachTuWebsite: numberValue("soLuongKhachTuWebsite"),
        soLuongKhachTuEmail: numberValue("soLuongKhachTuEmail"),
        soLuongTinNhanKhachVangLai: numberValue("soLuongTinNhanKhachVangLai"),
        soLuongKhachPhanHoiTuTiktok: numberValue("soLuongKhachPhanHoiTuTiktok"),
        tongSoLuongDonChot: numberValue("tongSoLuongDonChot"),
      }),
    });
    const rows = await fetchJson("/api/cskh-shift-reports", {}, 90000);
    state.cskhShiftReports = rows.rows || [];
    renderCskhShiftReports();
    els.cskhShiftReportStatus.textContent = result.updated ? "Đã cập nhật báo cáo ca." : "Đã lưu báo cáo ca.";
  } catch (error) {
    els.cskhShiftReportStatus.textContent = error.message || "Không lưu được báo cáo ca.";
    window.alert(els.cskhShiftReportStatus.textContent);
  } finally {
    els.cskhShiftReportSubmitButton.disabled = false;
  }
});
els.openCustomerDialogButton.addEventListener("click", () => {
  els.customerForm.reset();
  els.customerForm.elements.id.value = "";
  els.customerForm.elements.nhanVienNhap.value = state.currentUser?.displayName || state.currentUser?.username || "";
  els.customerDialog.querySelector("h2").textContent = "Thêm khách hàng";
  els.customerFormStatus.textContent = "";
  els.customerDialog.showModal();
});
els.customerCancelButton.addEventListener("click", () => els.customerDialog.close());
els.openContractDialogButton.addEventListener("click", () => {
  els.contractForm.reset();
  els.contractForm.elements.id.value = "";
  els.contractDialog.querySelector("h2").textContent = "Thêm hợp đồng/tuyến";
  els.contractFormStatus.textContent = "";
  els.contractDialog.showModal();
});
els.contractCancelButton.addEventListener("click", () => els.contractDialog.close());
els.contractPricingKm?.addEventListener("input", calculateContractPricing);
els.contractPricingWeekend?.addEventListener("change", calculateContractPricing);
els.overnightCalculatorForm?.addEventListener("input", (event) => {
  if (!event.target.classList?.contains("datetime-input")) return;
  event.target.value = formatDateTimeTyping(event.target.value);
  setDateTimeInputValidity(event.target);
});
els.overnightCalculatorForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderOvernightCalculation();
});
els.overnightCalculatorResult?.addEventListener("change", (event) => {
  if (!event.target.matches?.("[data-overnight-window-index]")) return;
  const excludedIndexes = new Set(
    [...els.overnightCalculatorResult.querySelectorAll("[data-overnight-window-index]:not(:checked)")]
      .map((input) => Number(input.dataset.overnightWindowIndex)),
  );
  renderOvernightCalculation(excludedIndexes);
});
els.overnightResetButton?.addEventListener("click", () => {
  els.overnightCalculatorForm?.reset();
  [els.overnightStartInput, els.overnightEndInput].forEach((input) => {
    input?.classList.remove("invalid");
    input?.setCustomValidity("");
  });
  if (els.overnightCalculatorResult) els.overnightCalculatorResult.innerHTML = `<div class="empty">Nhập đầy đủ thông tin để tính thời gian và chi phí sử dụng xe.</div>`;
  els.overnightStartInput?.focus();
});
els.contractPricingView?.addEventListener("input", (event) => {
  const input = event.target.closest("[data-pricing-group]");
  if (!input || !state.contractPricing) return;
  const group = input.dataset.pricingGroup;
  const row = state.contractPricing[group]?.[Number(input.dataset.pricingRow)];
  if (!row) return;
  const value = Math.max(0, Number(input.value || 0));
  if (group === "oneWay") row.rates[input.dataset.pricingKey] = value;
  else if (group === "roundTrip") row.percentages[input.dataset.pricingKey] = value;
  else if (group === "waiting") row.minutes = value;
  calculateContractPricing();
});
els.saveContractPricingButton?.addEventListener("click", async () => {
  if (!state.contractPricing) return;
  els.saveContractPricingButton.disabled = true;
  els.contractPricingStatus.textContent = "Đang lưu bảng giá...";
  try {
    const result = await fetchJson("/api/contract-pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.contractPricing),
    }, 90000);
    state.contractPricing = result.config;
    els.contractPricingStatus.textContent = "Đã lưu cấu hình bảng giá hợp đồng.";
    renderContractPricing();
  } catch (error) {
    els.contractPricingStatus.textContent = error.message || "Không thể lưu bảng giá.";
  } finally {
    els.saveContractPricingButton.disabled = false;
  }
});
els.openVoucherDialogButton.addEventListener("click", async () => {
  els.voucherForm.reset();
  els.voucherForm.elements.id.value = "";
  els.voucherDialog.querySelector("h2").textContent = "Thêm voucher";
  els.voucherFormStatus.textContent = "Đang sinh mã...";
  els.voucherDialog.showModal();
  try {
    const result = await fetchJson("/api/vouchers/suggest-code", {}, 15000);
    els.voucherForm.elements.maVoucher.value = result.maVoucher || "";
    els.voucherFormStatus.textContent = "";
  } catch (error) {
    els.voucherFormStatus.textContent = "Không tự sinh được mã, bạn có thể nhập thủ công.";
  }
});
els.voucherCancelButton.addEventListener("click", () => els.voucherDialog.close());
els.openVoucherBatchDialogButton.addEventListener("click", () => {
  els.voucherBatchForm.reset();
  els.voucherBatchFormStatus.textContent = "";
  els.voucherBatchDialog.showModal();
});
els.voucherBatchCancelButton.addEventListener("click", () => els.voucherBatchDialog.close());
els.openPromotionDialogButton.addEventListener("click", () => {
  els.promotionForm.reset();
  els.promotionForm.elements.id.value = "";
  els.promotionDialog.querySelector("h2").textContent = "Thêm khuyến mãi";
  els.promotionFormStatus.textContent = "";
  els.promotionDialog.showModal();
});
els.promotionCancelButton.addEventListener("click", () => els.promotionDialog.close());
els.openFranchiseVehicleDialogButton.addEventListener("click", () => {
  els.franchiseVehicleForm.reset();
  refreshFranchiseVehicleCatalogSelects();
  els.franchiseVehicleForm.elements.id.value = "";
  els.franchiseVehicleDialog.querySelector("h2").textContent = "Thêm xe thương quyền";
  els.franchiseVehicleFormStatus.textContent = "";
  els.franchiseVehicleDialog.showModal();
});
els.franchiseVehicleCancelButton.addEventListener("click", () => els.franchiseVehicleDialog.close());
els.franchiseVehicleForm.elements.bienKiemSoat?.addEventListener("input", (event) => {
  event.target.value = event.target.value.toUpperCase();
});
els.openOrderDialogButton.addEventListener("click", () => {
  if (canOperateOrders()) openOrderDialog();
});
els.exportDriverRemittanceButton.addEventListener("click", () => {
  const selectedDate = els.driverRemittanceDateInput.value || localDateForInput();
  window.location.href = `/api/reports/driver-remittance.xlsx?ngay=${encodeURIComponent(selectedDate)}`;
});
els.reportTypeSelect?.addEventListener("change", updateReportControls);
els.exportSelectedReportButton?.addEventListener("click", () => {
  const report = selectedReportType();
  if (!report || !canExportReport(report)) return;
  if (report.value === "summary") {
    const selectedMonth = els.reportMonthInput.value || localMonthForInput();
    window.location.href = `/api/reports/summary.xlsx?thang=${encodeURIComponent(selectedMonth)}`;
    return;
  }
  if (report.value === "vouchers") {
    const selectedMonth = els.reportMonthInput.value || localMonthForInput();
    window.location.href = `/api/reports/vouchers.xlsx?thang=${encodeURIComponent(selectedMonth)}`;
    return;
  }
  if (report.value === "orders") {
    const fromDate = els.reportFromInput.value || localDateForInput();
    const toDate = els.reportToInput.value || fromDate;
    window.location.href = `/api/reports/orders.xlsx?tuNgay=${encodeURIComponent(fromDate)}&denNgay=${encodeURIComponent(toDate)}`;
    return;
  }
  if (report.value === "workPerformance") {
    const fromDate = els.reportFromInput.value || localDateForInput();
    const toDate = els.reportToInput.value || fromDate;
    window.location.href = `/api/reports/work-performance.xlsx?tuNgay=${encodeURIComponent(fromDate)}&denNgay=${encodeURIComponent(toDate)}`;
    return;
  }
  if (report.value === "driverRevenue") {
    const fromDate = els.reportFromInput.value || localDateForInput();
    const toDate = els.reportToInput.value || fromDate;
    window.location.href = `/api/reports/driver-revenue.xlsx?tuNgay=${encodeURIComponent(fromDate)}&denNgay=${encodeURIComponent(toDate)}`;
    return;
  }
  if (report.value === "customers") {
    window.location.href = "/api/reports/customers.xlsx";
    return;
  }
  if (report.value === "debts") {
    window.location.href = "/api/reports/debts.xlsx";
  }
});
els.exportInvoicesReportButton?.addEventListener("click", () => {
  const range = reportDateRange(els.invoiceReportDateInput, els.invoiceReportDateToInput);
  if (!range) return;
  window.location.href = `/api/reports/invoices.xlsx?tuNgay=${encodeURIComponent(range.from)}&denNgay=${encodeURIComponent(range.to)}`;
});
els.openInvoiceGroupDialogButton?.addEventListener("click", openInvoiceGroupDialog);
els.invoiceGroupCancelButton?.addEventListener("click", () => els.invoiceGroupDialog.close());
els.invoiceGroupCandidateTable?.addEventListener("change", (event) => {
  if (!event.target.matches("input[data-invoice-group-order]")) return;
  const orderId = String(event.target.value || "");
  if (event.target.checked) state.invoiceGroupSelection.add(orderId);
  else state.invoiceGroupSelection.delete(orderId);
  const selected = selectedInvoiceGroupOrders();
  if (selected.length === 1) {
    const first = selected[0];
    for (const name of ["tenCongTy", "maSoThue", "diaChiHoaDon", "emailHoaDon"]) {
      if (!els.invoiceGroupForm.elements[name].value) els.invoiceGroupForm.elements[name].value = first[name] || "";
    }
  }
  renderInvoiceGroupCandidates();
});
els.invoiceGroupSearch?.addEventListener("input", (event) => {
  state.invoiceGroupSearch = event.target.value;
  renderInvoiceGroupCandidates();
});
els.invoiceGroupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rows = selectedInvoiceGroupOrders();
  if (rows.length < 2) {
    els.invoiceGroupFormStatus.textContent = "Vui lòng chọn ít nhất hai đơn hàng.";
    return;
  }
  const payload = Object.fromEntries(new FormData(els.invoiceGroupForm).entries());
  payload.orderIds = rows.map((row) => row.id);
  els.invoiceGroupSubmitButton.disabled = true;
  els.invoiceGroupFormStatus.textContent = "Đang tạo lệnh hóa đơn gộp...";
  try {
    await fetchJson("/api/invoice-groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.invoiceGroupDialog.close();
    await loadData();
    switchView("invoiceOrders");
  } catch (error) {
    els.invoiceGroupFormStatus.textContent = error.message;
  } finally {
    els.invoiceGroupSubmitButton.disabled = false;
  }
});
els.exportDebtsReportButton?.addEventListener("click", () => {
  const range = reportDateRange(els.debtReportDateInput, els.debtReportDateToInput);
  if (!range) return;
  window.location.href = `/api/reports/debts.xlsx?tuNgay=${encodeURIComponent(range.from)}&denNgay=${encodeURIComponent(range.to)}`;
});
els.exportCommissionsReportButton?.addEventListener("click", () => {
  const range = reportDateRange(els.commissionReportDateInput, els.commissionReportDateToInput);
  if (!range) return;
  window.location.href = `/api/reports/commissions.xlsx?tuNgay=${encodeURIComponent(range.from)}&denNgay=${encodeURIComponent(range.to)}`;
});
els.orderCancelButton.addEventListener("click", () => {
  state.editingOrderId = "";
  els.orderForm.dataset.mode = "create";
  els.orderDialog.close();
});
els.orderDialog.addEventListener("close", () => {
  state.editingOrderId = "";
  els.orderForm.dataset.mode = "create";
});
els.assignVehicleCancelButton.addEventListener("click", () => els.assignVehicleDialog.close());
els.completeCancelButton.addEventListener("click", () => els.completeDialog.close());
els.detailsCloseButton.addEventListener("click", () => els.detailsDialog.close());

els.dashboardDateFilter?.addEventListener("change", (event) => {
  state.filters.dashboardDate = event.target.value || localDateForInput();
  renderDashboard();
});
els.customerSearch.addEventListener("input", (event) => {
  state.filters.customer = event.target.value;
  renderCustomers();
});
els.systemLogSearch?.addEventListener("input", (event) => {
  state.filters.systemLog = event.target.value;
  renderSystemLogs();
});
els.systemLogActionFilter?.addEventListener("change", (event) => {
  state.filters.systemLogAction = event.target.value;
  renderSystemLogs();
});
els.orderFeedbackSearch?.addEventListener("input", (event) => {
  state.filters.orderFeedback = event.target.value;
  renderOrderFeedback();
});
els.orderFeedbackStatusFilter?.addEventListener("change", (event) => {
  state.filters.orderFeedbackStatus = event.target.value;
  renderOrderFeedback();
});
els.orderFeedbackDateFromInput?.addEventListener("change", renderOrderFeedback);
els.orderFeedbackDateToInput?.addEventListener("change", renderOrderFeedback);
els.commissionOrderSearch?.addEventListener("input", (event) => {
  state.filters.commissionOrder = event.target.value;
  renderCommissionOrders();
});
els.commissionStatusFilter?.addEventListener("change", (event) => {
  state.filters.commissionStatus = event.target.value;
  renderCommissionOrders();
});
els.commissionReportDateInput?.addEventListener("change", renderCommissionOrders);
els.commissionReportDateToInput?.addEventListener("change", renderCommissionOrders);
els.contractSearch.addEventListener("input", (event) => {
  state.filters.contract = event.target.value;
  renderContracts();
});
els.voucherSearch.addEventListener("input", (event) => {
  state.filters.voucher = event.target.value;
  renderVouchers();
});
els.voucherCampaignFilter?.addEventListener("change", (event) => {
  state.filters.voucherCampaign = event.target.value;
  renderVouchers();
});
els.voucherTable?.addEventListener("click", (event) => {
  if (event.target.closest(".voucher-print-checkbox")) event.stopPropagation();
});
els.voucherTable?.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".voucher-print-checkbox");
  if (!checkbox) return;
  const voucherId = String(checkbox.dataset.voucherPrintId || "");
  if (checkbox.checked) state.selectedVoucherIds.add(voucherId);
  else state.selectedVoucherIds.delete(voucherId);
  renderVouchers();
});
els.selectAllVouchersCheckbox?.addEventListener("change", (event) => {
  els.voucherTable.querySelectorAll(".voucher-print-checkbox").forEach((checkbox) => {
    const voucherId = String(checkbox.dataset.voucherPrintId || "");
    if (event.target.checked) state.selectedVoucherIds.add(voucherId);
    else state.selectedVoucherIds.delete(voucherId);
  });
  renderVouchers();
});
els.printSelectedVouchersButton?.addEventListener("click", () => {
  const voucherIds = [...state.selectedVoucherIds];
  if (!voucherIds.length) return;
  window.location.href = `/api/vouchers/print.pdf?voucherIds=${encodeURIComponent(voucherIds.join(","))}`;
});
els.deleteVoucherCampaignButton?.addEventListener("click", async () => {
  const campaign = state.filters.voucherCampaign || "";
  if (!campaign || !can("manage_benefits")) return;
  const campaignRows = state.vouchers.filter((row) => voucherCampaignName(row.tenVoucher) === campaign);
  if (!campaignRows.length) return;
  if (!confirm(`Xóa toàn bộ ${campaignRows.length} voucher thuộc chiến dịch "${campaign}"?\n\nThao tác này chỉ thực hiện được khi chưa có voucher nào được sử dụng.`)) return;
  els.deleteVoucherCampaignButton.disabled = true;
  els.deleteVoucherCampaignButton.textContent = "Đang xóa...";
  try {
    await fetchJson(`/api/vouchers/campaign?campaignName=${encodeURIComponent(campaign)}`, {
      method: "DELETE",
    });
    campaignRows.forEach((row) => state.selectedVoucherIds.delete(String(row.id)));
    state.filters.voucherCampaign = "";
    await loadData();
    switchView("vouchers");
  } catch (error) {
    if (els.syncStatus) els.syncStatus.textContent = error.message;
    renderVouchers();
  }
});
els.promotionSearch.addEventListener("input", (event) => {
  state.filters.promotion = event.target.value;
  renderPromotions();
});
els.orderSearch.addEventListener("input", (event) => {
  state.filters.order = event.target.value;
  renderOrders();
});
els.driverRemittanceDateInput?.addEventListener("change", () => {
  if (
    els.orderDateToInput?.value &&
    els.driverRemittanceDateInput.value > els.orderDateToInput.value
  ) {
    els.orderDateToInput.value = els.driverRemittanceDateInput.value;
  }
  renderOrders();
});
els.orderDateToInput?.addEventListener("change", () => {
  if (
    els.driverRemittanceDateInput?.value &&
    els.orderDateToInput.value < els.driverRemittanceDateInput.value
  ) {
    els.driverRemittanceDateInput.value = els.orderDateToInput.value;
  }
  renderOrders();
});
els.orderStatusFilter?.addEventListener("change", (event) => {
  state.filters.orderStatus = event.target.value;
  renderOrders();
});
els.driverNotificationStatusFilter?.addEventListener("change", (event) => {
  state.filters.driverNotificationStatus = event.target.value;
  renderOrders();
});
els.invoiceOrderSearch?.addEventListener("input", (event) => {
  state.filters.invoiceOrder = event.target.value;
  renderInvoiceOrders();
});
els.invoiceStatusFilter?.addEventListener("change", (event) => {
  state.filters.invoiceStatus = event.target.value;
  renderInvoiceOrders();
});
els.invoiceReportDateInput?.addEventListener("change", renderInvoiceOrders);
els.invoiceReportDateToInput?.addEventListener("change", renderInvoiceOrders);
els.debtOrderSearch?.addEventListener("input", (event) => {
  state.filters.debtOrder = event.target.value;
  renderDebtOrders();
});
els.debtStatusFilter?.addEventListener("change", (event) => {
  state.filters.debtStatus = event.target.value;
  renderDebtOrders();
});
els.debtReportDateInput?.addEventListener("change", renderDebtOrders);
els.debtReportDateToInput?.addEventListener("change", renderDebtOrders);
els.vehicleSearch.addEventListener("input", (event) => {
  state.filters.vehicle = event.target.value;
  renderVehicles();
});
els.franchiseVehicleSearch.addEventListener("input", (event) => {
  state.filters.franchiseVehicle = event.target.value;
  renderFranchiseVehicles();
});

els.customerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.customerSubmitButton.disabled = true;
  els.customerFormStatus.textContent = "Đang lưu...";
  try {
    const payload = Object.fromEntries(new FormData(els.customerForm).entries());
    payload.soDienThoai = requireCustomerPhone(payload.soDienThoai);
    payload.nhanVienNhap = state.currentUser?.displayName || state.currentUser?.username || payload.nhanVienNhap || "";
    const id = payload.id;
    delete payload.id;
    await fetchJson(id ? `/api/customers/${encodeURIComponent(id)}` : "/api/customers", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.customerDialog.close();
    await loadData();
  } catch (error) {
    els.customerFormStatus.textContent = error.message;
  } finally {
    els.customerSubmitButton.disabled = false;
  }
});

els.contractForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.contractSubmitButton.disabled = true;
  els.contractFormStatus.textContent = "Đang lưu...";
  try {
    const payload = Object.fromEntries(new FormData(els.contractForm).entries());
    const id = payload.id;
    delete payload.id;
    await fetchJson(id ? `/api/tours/${encodeURIComponent(id)}` : "/api/tours", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.contractDialog.close();
    await loadData();
  } catch (error) {
    els.contractFormStatus.textContent = error.message;
  } finally {
    els.contractSubmitButton.disabled = false;
  }
});

els.voucherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.voucherSubmitButton.disabled = true;
  els.voucherFormStatus.textContent = "Đang lưu...";
  try {
    const payload = Object.fromEntries(new FormData(els.voucherForm).entries());
    const id = payload.id;
    delete payload.id;
    payload.giaTri = payload.loaiGiaTri === "fixed" ? parseMoney(payload.giaTri) : Number(String(payload.giaTri || "0").replace(",", "."));
    await fetchJson(id ? `/api/vouchers/${encodeURIComponent(id)}` : "/api/vouchers", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.voucherDialog.close();
    await loadData();
    switchView("vouchers");
  } catch (error) {
    els.voucherFormStatus.textContent = error.message;
  } finally {
    els.voucherSubmitButton.disabled = false;
  }
});

els.voucherBatchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.voucherBatchSubmitButton.disabled = true;
  els.voucherBatchFormStatus.textContent = "Đang phát hành...";
  try {
    const payload = Object.fromEntries(new FormData(els.voucherBatchForm).entries());
    payload.menhGia = payload.loaiGiaTri === "fixed" ? parseMoney(payload.menhGia) : Number(String(payload.menhGia || "0").replace(",", "."));
    payload.soLuong = Number(payload.soLuong || 0);
    await fetchJson("/api/vouchers/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.voucherBatchDialog.close();
    await loadData();
    switchView("vouchers");
  } catch (error) {
    els.voucherBatchFormStatus.textContent = error.message;
  } finally {
    els.voucherBatchSubmitButton.disabled = false;
  }
});

els.promotionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.promotionSubmitButton.disabled = true;
  els.promotionFormStatus.textContent = "Đang lưu...";
  try {
    const payload = Object.fromEntries(new FormData(els.promotionForm).entries());
    const id = payload.id;
    delete payload.id;
    if (payload.khongGioiHanHanDung) payload.ngayHetHan = "";
    delete payload.khongGioiHanHanDung;
    payload.giaTri = payload.loaiGiaTri === "fixed" ? parseMoney(payload.giaTri) : Number(String(payload.giaTri || "0").replace(",", "."));
    await fetchJson(id ? `/api/promotions/${encodeURIComponent(id)}` : "/api/promotions", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.promotionDialog.close();
    await loadData();
    switchView("promotions");
  } catch (error) {
    els.promotionFormStatus.textContent = error.message;
  } finally {
    els.promotionSubmitButton.disabled = false;
  }
});

els.franchiseVehicleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const plateInput = els.franchiseVehicleForm.elements.bienKiemSoat;
  plateInput.value = String(plateInput.value || "").trim().toUpperCase();
  if (!franchisePlateIsValid(plateInput.value)) {
    els.franchiseVehicleFormStatus.textContent = "Biển số xe phải đúng định dạng 68A-123.45.";
    plateInput.focus();
    return;
  }
  els.franchiseVehicleSubmitButton.disabled = true;
  els.franchiseVehicleFormStatus.textContent = "Đang lưu...";
  try {
    const payload = Object.fromEntries(new FormData(els.franchiseVehicleForm).entries());
    const id = payload.id;
    delete payload.id;
    await fetchJson(id ? `/api/franchise-vehicles/${encodeURIComponent(id)}` : "/api/franchise-vehicles", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.franchiseVehicleDialog.close();
    await loadData();
    switchView("franchiseVehicles");
  } catch (error) {
    els.franchiseVehicleFormStatus.textContent = error.message;
  } finally {
    els.franchiseVehicleSubmitButton.disabled = false;
  }
});

els.openUserDialogButton?.addEventListener("click", () => {
  els.userForm.reset();
  els.userForm.elements.id.value = "";
  els.userForm.elements.password.required = true;
  els.userPasswordField.hidden = false;
  els.userDialogTitle.textContent = "Tạo tài khoản";
  els.userSubmitButton.textContent = "Lưu tài khoản";
  els.userFormStatus.textContent = "";
  els.userDialog.showModal();
});

els.userCancelButton?.addEventListener("click", () => els.userDialog.close());
els.systemCatalogForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!can("manage_system_catalogs")) return;
  const payload = Object.fromEntries(new FormData(els.systemCatalogForm).entries());
  els.systemCatalogSubmitButton.disabled = true;
  els.systemCatalogFormStatus.textContent = "Đang thêm danh mục...";
  try {
    await fetchJson("/api/system-catalogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.systemCatalogForm.reset();
    els.systemCatalogFormStatus.textContent = "Đã thêm danh mục.";
    await loadData();
    switchView("systemCatalogs");
  } catch (error) {
    els.systemCatalogFormStatus.textContent = error.message;
  } finally {
    els.systemCatalogSubmitButton.disabled = false;
  }
});
els.openChangePasswordButton?.addEventListener("click", () => {
  els.changePasswordForm.reset();
  els.changePasswordFormStatus.textContent = "";
  els.changePasswordDialog.showModal();
});
els.changePasswordCancelButton?.addEventListener("click", () => els.changePasswordDialog.close());
els.resetPasswordCancelButton?.addEventListener("click", () => els.resetPasswordDialog.close());
els.reopenCancelButton?.addEventListener("click", () => els.reopenDialog.close());

els.userForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  els.userSubmitButton.disabled = true;
    const payload = Object.fromEntries(new FormData(els.userForm).entries());
    payload.extraPermissions = payload.manageSystemCatalogs ? ["manage_system_catalogs"] : [];
    delete payload.manageSystemCatalogs;
  const userId = payload.id || "";
  delete payload.id;
  els.userFormStatus.textContent = userId ? "Đang lưu thay đổi..." : "Đang tạo tài khoản...";
  try {
    if (userId) delete payload.password;
    await fetchJson(userId ? `/api/users/${encodeURIComponent(userId)}` : "/api/users", {
      method: userId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (userId && String(state.currentUser?.id || "") === String(userId)) {
      state.currentUser = { ...state.currentUser, ...payload };
      showApp();
    }
    els.userDialog.close();
    await loadData();
  } catch (error) {
    els.userFormStatus.textContent = error.message;
  } finally {
    els.userSubmitButton.disabled = false;
  }
});

els.changePasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.changePasswordForm).entries());
  if (payload.newPassword !== payload.confirmPassword) {
    els.changePasswordFormStatus.textContent = "Mật khẩu mới nhập lại không khớp.";
    return;
  }
  delete payload.confirmPassword;
  els.changePasswordSubmitButton.disabled = true;
  els.changePasswordFormStatus.textContent = "Đang đổi mật khẩu...";
  try {
    await fetchJson("/api/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.changePasswordDialog.close();
    alert("Đã đổi mật khẩu.");
  } catch (error) {
    els.changePasswordFormStatus.textContent = error.message;
  } finally {
    els.changePasswordSubmitButton.disabled = false;
  }
});

els.resetPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(els.resetPasswordForm).entries());
  if (payload.newPassword !== payload.confirmPassword) {
    els.resetPasswordFormStatus.textContent = "Mật khẩu mới nhập lại không khớp.";
    return;
  }
  const userId = payload.userId;
  els.resetPasswordSubmitButton.disabled = true;
  els.resetPasswordFormStatus.textContent = "Đang reset mật khẩu...";
  try {
    await fetchJson(`/api/users/${encodeURIComponent(userId)}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: payload.newPassword }),
    });
    els.resetPasswordDialog.close();
    await loadData();
  } catch (error) {
    els.resetPasswordFormStatus.textContent = error.message;
  } finally {
    els.resetPasswordSubmitButton.disabled = false;
  }
});

els.reopenForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const orderId = els.reopenForm.elements.orderId.value;
  els.reopenSubmitButton.disabled = true;
  els.reopenFormStatus.textContent = "Đang gửi yêu cầu...";
  try {
    const payload = { reason: els.reopenForm.elements.reason.value };
    await fetchJson(`/api/orders/${encodeURIComponent(orderId)}/reopen-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.reopenDialog.close();
    await loadData();
  } catch (error) {
    els.reopenFormStatus.textContent = error.message;
  } finally {
    els.reopenSubmitButton.disabled = false;
  }
});

els.orderForm.addEventListener("input", (event) => {
  if (event.target.name === "ngayGioDi") {
    event.target.value = formatDateTimeTyping(event.target.value);
    setDateTimeInputValidity(event.target);
  }
  if (event.target.classList?.contains("money-input") && shouldFormatAsMoney(event.target)) formatMoneyInput(event.target);
  if (event.target === els.orderCustomerPhone) {
    fillOrderCustomer(findCustomerByPhone(event.target.value));
  }
  if (event.target.dataset?.passengerField === "soDienThoai") {
    fillSharedPassengerCustomer(event.target.dataset.passengerIndex, findCustomerByPhone(event.target.value));
    syncSharedPassengerPhoneGate(event.target.dataset.passengerIndex);
  }
  if (event.target === els.ticketCountInput) {
    const visibleDrafts = snapshotSharedPassengerFields();
    if (visibleDrafts.length) els.sharedPassengerList._passengerDrafts = visibleDrafts;
    const drafts = els.sharedPassengerList._passengerDrafts || [];
    renderSharedPassengerFields();
    populateSharedPassengerFields(drafts.slice(0, Math.max(Number(els.ticketCountInput.value || 0), 0)));
  }
  if (event.target.name === "giamGia") {
    const wrap = document.querySelector("#manualDiscountNoteWrap");
    const note = els.orderForm.elements.ghiChuGiamGia;
    const active = parseMoney(event.target.value) > 0;
    if (wrap) wrap.hidden = !active;
    if (wrap) wrap.classList.toggle("required", active);
    if (note) note.required = active;
  }
  if (event.target.name === "phuThu") {
    const wrap = document.querySelector("#surchargeReasonWrap");
    const reason = els.orderForm.elements.lyDoPhuThu;
    const active = selectedContractType() !== "xe_ghep" && parseMoney(event.target.value) > 0;
    if (wrap) wrap.hidden = !active;
    if (wrap) wrap.classList.toggle("required", active);
    if (reason) reason.required = active;
  }
  if (event.target.dataset?.passengerField === "giamGia") {
    const index = event.target.dataset.passengerIndex;
    const wrap = els.sharedPassengerList.querySelector(`[data-passenger-discount-note="${index}"]`);
    const note = els.sharedPassengerList.querySelector(`[data-passenger-field="ghiChuGiamGia"][data-passenger-index="${index}"]`);
    const active = parseMoney(event.target.value) > 0;
    if (wrap) wrap.hidden = !active;
    if (wrap) wrap.classList.toggle("required", active);
    if (note) note.required = active;
  }
  if (event.target.dataset?.passengerField === "phuThu") {
    const index = event.target.dataset.passengerIndex;
    const wrap = els.sharedPassengerList.querySelector(`[data-passenger-surcharge-reason="${index}"]`);
    const reason = els.sharedPassengerList.querySelector(`[data-passenger-field="lyDoPhuThu"][data-passenger-index="${index}"]`);
    const active = parseMoney(event.target.value) > 0;
    if (wrap) wrap.hidden = !active;
    if (wrap) wrap.classList.toggle("required", active);
    if (reason) reason.required = active;
  }
  if (event.target.classList?.contains("money-input") || event.target === els.ticketCountInput) updateOrderPaymentSummary();
});

els.orderForm.addEventListener("change", (event) => {
  if (event.target.name === "ngayGioDi") {
    const normalized = normalizeDateTimeInput(event.target.value);
    if (normalized) event.target.value = normalized;
    setDateTimeInputValidity(event.target);
  }
  if (event.target.dataset?.passengerField === "yeuCauHoaDon") {
    const section = event.target.closest(".shared-passenger-section");
    section?.querySelector(".shared-invoice-fields")?.classList.toggle("active", event.target.checked);
    for (const fieldName of ["tenCongTy", "maSoThue", "diaChiHoaDon"]) {
      const field = section?.querySelector(`[data-passenger-field="${fieldName}"]`);
      if (field) {
        field.required = event.target.checked;
        field.closest("label")?.classList.toggle("required", event.target.checked);
      }
    }
    updateOrderPaymentSummary();
  }
  if (event.target.dataset?.passengerField === "congNo") {
    const index = event.target.dataset.passengerIndex;
    const fields = els.sharedPassengerList.querySelector(`[data-passenger-debt-fields="${index}"]`);
    const owner = els.sharedPassengerList.querySelector(`[data-passenger-field="congNoChoAi"][data-passenger-index="${index}"]`);
    if (fields) fields.hidden = !event.target.checked;
    if (owner) {
      owner.required = event.target.checked;
      owner.closest("label")?.classList.toggle("required", event.target.checked);
    }
  }
  if (event.target.dataset?.passengerBenefit === "voucherIds") {
    if (event.target.checked) {
      const duplicated = sharedVoucherCheckboxes().some(
        (checkbox) =>
          checkbox !== event.target &&
          checkbox.checked &&
          checkbox.value === event.target.value &&
          checkbox.dataset.passengerIndex !== event.target.dataset.passengerIndex,
      );
      if (duplicated) {
        event.target.checked = false;
        els.orderFormStatus.textContent = `Voucher ${sharedVoucherLabel(event.target.value)} đã được chọn cho khách lẻ khác.`;
      } else {
        els.orderFormStatus.textContent = "";
      }
    }
    syncSharedVoucherAvailability();
  }
  updateOrderPaymentSummary();
});

els.assignVehicleForm.addEventListener("input", (event) => {
  if (["ngayGioDi", "ngayGioDuKienKetThuc"].includes(event.target.name)) {
    event.target.value = formatDateTimeTyping(event.target.value);
    setDateTimeInputValidity(event.target);
    if (validateDateTimeInputs(els.assignVehicleForm)) renderVehicleOptions();
  }
  if (event.target === els.franchiseCommissionInput) {
    updateVehicleWarning();
  }
});

els.assignVehicleForm.addEventListener("change", (event) => {
  if (["ngayGioDi", "ngayGioDuKienKetThuc"].includes(event.target.name)) {
    const normalized = normalizeDateTimeInput(event.target.value);
    if (normalized) event.target.value = normalized;
    setDateTimeInputValidity(event.target);
    if (validateDateTimeInputs(els.assignVehicleForm)) renderVehicleOptions();
  }
});

function filterBenefitPicker(kind, value) {
  const isVoucher = kind === "voucher";
  if (!isVoucher && kind !== "promotion") return;
  state.orderBenefits[isVoucher ? "voucherSearch" : "promotionSearch"] = value;
  const picker = isVoucher ? els.orderVoucherPicker : els.orderPromotionPicker;
  const query = normalize(value);
  let visibleCount = 0;
  picker.querySelectorAll(".benefit-option").forEach((option) => {
    const visible = !query || normalize(option.textContent).includes(query);
    option.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  const empty = picker.querySelector(".benefit-search-empty");
  if (empty) empty.hidden = visibleCount > 0;
}

document.addEventListener("compositionstart", (event) => {
  if (event.target.dataset?.benefitSearch) event.target.dataset.composing = "true";
});

document.addEventListener("compositionend", (event) => {
  const kind = event.target.dataset?.benefitSearch;
  if (!kind) return;
  event.target.dataset.composing = "false";
  filterBenefitPicker(kind, event.target.value);
});

document.addEventListener("input", (event) => {
  const benefitSearchKind = event.target.dataset?.benefitSearch;
  if (benefitSearchKind) {
    state.orderBenefits[benefitSearchKind === "voucher" ? "voucherSearch" : "promotionSearch"] = event.target.value;
    if (event.isComposing || event.target.dataset.composing === "true") return;
    filterBenefitPicker(benefitSearchKind, event.target.value);
    return;
  }
  if (event.target.closest?.(".benefit-picker")) updateBenefitPreview();
  if (event.target.classList?.contains("date-input")) event.target.value = formatDateOnlyTyping(event.target.value);
  if (event.target.classList?.contains("money-input") && shouldFormatAsMoney(event.target)) formatMoneyInput(event.target);
});

document.addEventListener("change", (event) => {
  if (event.target.dataset?.benefitKind) {
    const key = event.target.dataset.benefitKind === "voucher" ? "voucherIds" : "promotionIds";
    const current = new Set(state.orderBenefits[key]);
    if (event.target.checked) current.add(event.target.value);
    else current.delete(event.target.value);
    state.orderBenefits[key] = [...current];
    renderOrderBenefits();
    updateOrderPaymentSummary();
    return;
  }
  if (event.target.classList?.contains("date-input")) event.target.value = normalizeDateOnlyInput(event.target.value);
  if (event.target.name === "loaiGiaTri") {
    const valueInput = event.target.form?.elements?.giaTri;
    if (!valueInput) return;
    valueInput.value = event.target.value === "fixed" ? formatMoney(valueInput.value) : String(valueInput.value || "").replace(/,/g, "");
  }
});

els.completeForm.addEventListener("change", (event) => {
  if (event.target.name === "ngayGioHoanThanh") {
    const normalized = normalizeDateTimeInput(event.target.value);
    if (normalized) event.target.value = normalized;
    const order = state.orders.find(
      (row) => String(row.id) === String(els.completeForm.elements.orderId.value || ""),
    );
    const completedAt = parseDateTime(normalized);
    const startedAt = parseDateTime(order?.ngayGioDi);
    event.target.setCustomValidity(
      completedAt && startedAt && completedAt < startedAt
        ? "Giờ hoàn thành không được trước giờ đi."
        : "",
    );
  }
});
els.completeForm.addEventListener("input", (event) => {
  if (event.target.name === "ngayGioHoanThanh") event.target.value = formatDateTimeTyping(event.target.value);
});
els.orderVehicleSelect.addEventListener("change", () => {
  updateVehicleWarning();
  updateOrderPaymentSummary();
});
els.orderContractSelect.addEventListener("change", applySelectedContractDefaults);
els.orderForm.querySelectorAll('input[name="loaiHopDong"]').forEach((input) => {
  input.addEventListener("change", updateOrderTypeUI);
});
els.invoiceToggle.addEventListener("change", () => {
  els.invoiceFields.classList.toggle("active", els.invoiceToggle.checked);
  for (const name of ["tenCongTy", "maSoThue", "diaChiHoaDon"]) {
    const field = els.orderForm.elements[name];
    if (field) {
      field.required = els.invoiceToggle.checked;
      field.closest("label")?.classList.toggle("required", els.invoiceToggle.checked);
    }
  }
  updateOrderPaymentSummary();
});
document.querySelector("#debtToggle")?.addEventListener("change", (event) => {
  const fields = document.querySelector("#debtFields");
  const owner = document.querySelector("#debtOwnerInput");
  if (fields) fields.hidden = !event.target.checked;
  if (owner) owner.required = event.target.checked;
  owner?.closest("label")?.classList.toggle("required", event.target.checked);
});

els.orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateDateTimeInputs(els.orderForm)) {
    els.orderFormStatus.textContent = "Vui lòng nhập thời gian khởi hành dự kiến của đơn hàng.";
    els.orderForm.reportValidity();
    return;
  }
  els.orderSubmitButton.disabled = true;
  els.orderFormStatus.textContent = "Đang lưu...";
  try {
    const payload = Object.fromEntries(new FormData(els.orderForm).entries());
    payload.ngayGioDi = normalizeDateTimeInput(payload.ngayGioDi);
    payload.ngayGioDuKienKetThuc = "";
    payload.bienKiemSoat = "";
    payload.tyLeNopLai = 0;
    payload.giaTien = parseMoney(payload.giaTien);
    payload.giamGia = parseMoney(payload.giamGia);
    payload.phuThu = parseMoney(payload.phuThu);
    payload.daCoc = parseMoney(payload.daCoc);
    payload.soVe = Number(payload.soVe || 0);
    if (!payload.ngayGioDi) throw new Error("Vui lòng nhập ngày giờ đi theo định dạng dd/MM/yyyy HH:mm.");
    payload.yeuCauHoaDon = selectedContractType() === "xe_ghep" ? false : els.invoiceToggle.checked;
    payload.congNo = selectedContractType() === "xe_ghep" ? false : Boolean(document.querySelector("#debtToggle")?.checked);
    payload.congNoChoAi = payload.congNoChoAi || "";
    if (payload.congNo && !payload.congNoChoAi.trim()) throw new Error("Vui lòng nhập đối tượng ghi nhận công nợ.");
    if (payload.giamGia > 0 && !String(payload.ghiChuGiamGia || "").trim()) throw new Error("Vui lòng nhập ghi chú giảm giá thủ công.");
    if (selectedContractType() !== "xe_ghep" && payload.phuThu > 0 && !String(payload.lyDoPhuThu || "").trim()) {
      throw new Error("Vui lòng nhập lý do phụ thu.");
    }
    payload.voucherIds = selectedContractType() === "xe_ghep" ? [] : selectedBenefitIds(els.orderVoucherPicker);
    payload.promotionIds = selectedContractType() === "xe_ghep" ? [] : selectedBenefitIds(els.orderPromotionPicker);
    payload.khachXeGhep = selectedContractType() === "xe_ghep" ? collectSharedPassengers() : [];
    if (selectedContractType() === "xe_ghep") {
      payload.khachXeGhep.forEach((passenger, index) => {
        passenger.soDienThoai = requireCustomerPhone(passenger.soDienThoai, `Số điện thoại khách lẻ ${index + 1}`);
        if (!["B2C", "B2B"].includes(String(passenger.loaiKhach || "").toUpperCase())) {
          throw new Error(`Vui lòng chọn loại khách B2C/B2B cho khách lẻ ${index + 1}.`);
        }
      });
      const duplicateVoucherError = duplicateSharedVoucherMessage();
      if (duplicateVoucherError) throw new Error(duplicateVoucherError);
      const missingDiscountNote = payload.khachXeGhep.findIndex(
        (passenger) => Number(passenger.giamGia || 0) > 0 && !String(passenger.ghiChuGiamGia || "").trim(),
      );
      if (missingDiscountNote >= 0) throw new Error(`Vui lòng nhập ghi chú giảm giá thủ công cho khách lẻ ${missingDiscountNote + 1}.`);
      const missingSurchargeReason = payload.khachXeGhep.findIndex(
        (passenger) => Number(passenger.phuThu || 0) > 0 && !String(passenger.lyDoPhuThu || "").trim(),
      );
      if (missingSurchargeReason >= 0) throw new Error(`Vui lòng nhập lý do phụ thu cho khách lẻ ${missingSurchargeReason + 1}.`);
      const missingDebtOwner = payload.khachXeGhep.findIndex(
        (passenger) => passenger.congNo && !String(passenger.congNoChoAi || "").trim(),
      );
      if (missingDebtOwner >= 0) throw new Error(`Vui lòng nhập đối tượng công nợ cho khách lẻ ${missingDebtOwner + 1}.`);
      payload.khachHangId = "";
      payload.tenKhach = "";
      payload.soDienThoai = "";
      payload.soCCCD = "";
      payload.loaiKhachHang = "";
      payload.namSinh = "";
      payload.gioiTinh = "";
      payload.nguonKhach = "";
      payload.nhanVienNhap = "";
      payload.loaiKhach = "";
      payload.diemDon = "";
      payload.diemTra = "";
      payload.giaTien = 0;
      payload.giamGia = 0;
      payload.phuThu = 0;
      payload.lyDoPhuThu = "";
      payload.daCoc = 0;
      payload.tenCongTy = "";
      payload.maSoThue = "";
      payload.diaChiHoaDon = "";
      payload.emailHoaDon = "";
    } else {
      payload.soDienThoai = requireCustomerPhone(payload.soDienThoai, "Số điện thoại khách hàng");
    }
    const editingOrderId = state.editingOrderId || "";
    await fetchJson(editingOrderId ? `/api/orders/${encodeURIComponent(editingOrderId)}` : "/api/orders", {
      method: editingOrderId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    state.editingOrderId = "";
    els.orderForm.dataset.mode = "create";
    els.orderDialog.close();
    await loadData();
    switchView("orders");
  } catch (error) {
    els.orderFormStatus.textContent = error.message;
  } finally {
    els.orderSubmitButton.disabled = false;
  }
});

els.assignVehicleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateDateTimeInputs(els.assignVehicleForm)) {
    els.assignVehicleForm.reportValidity();
    return;
  }
  els.assignVehicleSubmitButton.disabled = true;
  els.assignVehicleFormStatus.textContent = "Đang lưu điều xe...";
  try {
    const payload = Object.fromEntries(new FormData(els.assignVehicleForm).entries());
    const orderId = payload.orderId;
    payload.ngayGioDi = normalizeDateTimeInput(payload.ngayGioDi);
    payload.ngayGioDuKienKetThuc = normalizeDateTimeInput(payload.ngayGioDuKienKetThuc);
    if (!payload.ngayGioDi || !payload.ngayGioDuKienKetThuc) {
      throw new Error("Vui lòng nhập ngày giờ theo định dạng dd/MM/yyyy HH:mm.");
    }
    payload.tyLeNopLai = Number(payload.tyLeNopLai || 0);
    delete payload.orderId;
    if (payload.bienKiemSoat && els.orderVehicleSelect.selectedOptions[0]?.dataset.noDriver === "1") {
      throw new Error("Xe này có lên ca nhưng chưa có lái xe. Vui lòng cập nhật lái xe trước khi lưu.");
    }
    if (payload.bienKiemSoat && conflictingOrder(payload.bienKiemSoat, payload.ngayGioDi, payload.ngayGioDuKienKetThuc, orderId)) {
      throw new Error("Xe đang bận trong khung giờ này. Vui lòng chọn xe khác hoặc đổi giờ.");
    }
    await fetchJson(`/api/orders/${encodeURIComponent(orderId)}/assign-vehicle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.assignVehicleDialog.close();
    await loadData();
    switchView("orders");
  } catch (error) {
    els.assignVehicleFormStatus.textContent = error.message;
  } finally {
    els.assignVehicleSubmitButton.disabled = false;
  }
});

els.completeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const orderId = els.completeForm.elements.orderId.value;
  els.completeSubmitButton.disabled = true;
  try {
    const completedAt = normalizeDateTimeInput(els.completeForm.elements.ngayGioHoanThanh.value);
    if (!completedAt) throw new Error("Vui lòng nhập ngày giờ hoàn thành theo định dạng dd/MM/yyyy HH:mm.");
    const order = state.orders.find((row) => String(row.id) === String(orderId));
    const completedDate = parseDateTime(completedAt);
    const startedDate = parseDateTime(order?.ngayGioDi);
    if (!completedDate || !startedDate) throw new Error("Ngày giờ hoàn thành hoặc giờ đi không hợp lệ.");
    if (completedDate < startedDate) throw new Error("Giờ hoàn thành không được trước giờ đi.");
    await fetchJson(`/api/orders/${encodeURIComponent(orderId)}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ngayGioHoanThanh: completedAt }),
    });
    els.completeDialog.close();
    await loadData();
  } catch (error) {
    els.completeOrderLabel.textContent = error.message;
  } finally {
    els.completeSubmitButton.disabled = false;
  }
});

document.body.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (target?.dataset.action === "toggle-driver-notification" && canOperateOrders() && can("dispatch")) {
    const orderId = target.dataset.orderId;
    const status = target.dataset.status;
    target.disabled = true;
    fetchJson(`/api/orders/${encodeURIComponent(orderId)}/driver-notification-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThaiGuiTaiXe: status }),
    })
      .then(() => loadData())
      .catch((error) => {
        alert(error.message);
        target.disabled = false;
      });
  }
  if (target?.dataset.action === "toggle-remittance-status" && can("manage_remittance_status")) {
    const orderId = target.dataset.orderId;
    const status = target.dataset.status;
    if (!confirm(`Xác nhận chuyển đơn ${orderId} sang trạng thái “${status}”?`)) return;
    target.disabled = true;
    fetchJson(`/api/orders/${encodeURIComponent(orderId)}/remittance-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThaiNopTien: status }),
    })
      .then(() => loadData())
      .catch((error) => {
        alert(error.message);
        target.disabled = false;
      });
  }
  if (target?.dataset.action === "assign-order" && canOperateOrders()) openAssignVehicleDialog(target.dataset.orderId);
  if (target?.dataset.action === "complete-order" && canOperateOrders()) openCompleteDialog(target.dataset.orderId);
  if (target?.dataset.action === "delete-order" && canOperateOrders()) {
    const orderId = target.dataset.orderId;
    const order = state.orders.find((row) => String(row.id) === String(orderId));
    if (!order || orderIsDone(order)) return;
    if (!confirm(`Xóa đơn hàng ${orderId}? Dữ liệu ưu đãi và khách xe ghép thuộc đơn này cũng sẽ được gỡ bỏ.`)) return;
    target.disabled = true;
    fetchJson(`/api/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" })
      .then(() => loadData())
      .catch((error) => {
        alert(error.message);
        target.disabled = false;
      });
  }
  if (target?.dataset.action === "request-reopen" && canOperateOrders()) openReopenDialog(target.dataset.orderId);
  if (target?.dataset.action === "approve-reopen") reviewReopenRequest(target.dataset.requestId, true);
  if (target?.dataset.action === "reject-reopen") reviewReopenRequest(target.dataset.requestId, false);
  if (target?.dataset.action === "open-order") openOrderDetails(target.dataset.orderId);
  if (target?.dataset.action === "mark-invoice-status") updateInvoiceOrderStatus(target.dataset.orderId, target.dataset.status, target.dataset.entityType);
  if (target?.dataset.action === "mark-debt-status") updateDebtOrderStatus(target.dataset.orderId, target.dataset.status, target.dataset.entityType);
  if (target?.dataset.action === "mark-commission-status") updateCommissionOrderStatus(target.dataset.orderId, target.dataset.status);
  if (target?.dataset.action === "open-edit-user") openEditUserDialog(target.dataset.userId);
  if (target?.dataset.action === "delete-system-catalog") {
    const catalogId = target.dataset.catalogId;
    const value = target.dataset.catalogValue || "giá trị này";
    if (!catalogId || !window.confirm(`Xóa “${value}” khỏi danh mục? Dữ liệu cũ đã sử dụng giá trị này vẫn được giữ nguyên.`)) return;
    target.disabled = true;
    fetchJson(`/api/system-catalogs/${encodeURIComponent(catalogId)}`, { method: "DELETE" })
      .then(() => loadData())
      .then(() => switchView("systemCatalogs"))
      .catch((error) => window.alert(error.message))
      .finally(() => { target.disabled = false; });
  }
  if (target?.dataset.action === "delete-cskh-shift-report") {
    const reportDate = target.dataset.reportDate || "";
    const reportShift = target.dataset.reportShift || "";
    const reportEmployee = target.dataset.reportEmployee || "";
    if (!window.confirm(`Xóa báo cáo ${reportDate} - ${reportShift} của ${reportEmployee}? Dòng dữ liệu vẫn được lưu để admin tra cứu lịch sử.`)) return;
    const parts = reportDate.split("/");
    const apiDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : reportDate;
    target.disabled = true;
    fetchJson("/api/cskh-shift-reports/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ngay: apiDate,
        caLamViec: Number(String(reportShift).replace(/\D/g, "")),
        nhanVienTruc: reportEmployee,
      }),
    })
      .then(async () => {
        const result = await fetchJson("/api/cskh-shift-reports", {}, 90000);
        state.cskhShiftReports = result.rows || [];
        renderCskhShiftReports();
        els.cskhShiftReportStatus.textContent = "Đã xóa báo cáo ca. Bạn có thể khai báo lại.";
      })
      .catch((error) => window.alert(error.message))
      .finally(() => { target.disabled = false; });
  }
  if (target?.dataset.action === "open-reset-password") openResetPasswordDialog(target.dataset.userId);
  if (target?.dataset.action === "dashboard-new-order" && canOperateOrders()) openOrderDialog();
  if (target?.dataset.action === "dashboard-calendar") switchView("calendar");
  if (target?.dataset.action === "dashboard-orders") switchView("orders");
  if (target?.dataset.action === "dashboard-vouchers") switchView("vouchers");
  if (target?.dataset.action === "toggle-voucher-picker") {
    state.orderBenefits.voucherOpen = !state.orderBenefits.voucherOpen;
    renderOrderBenefits();
  }
  if (target?.dataset.action === "toggle-promotion-picker") {
    state.orderBenefits.promotionOpen = !state.orderBenefits.promotionOpen;
    renderOrderBenefits();
  }
  if (target?.dataset.action === "remove-benefit") {
    const key = target.dataset.kind === "voucher" ? "voucherIds" : "promotionIds";
    state.orderBenefits[key] = state.orderBenefits[key].filter((id) => String(id) !== String(target.dataset.id));
    renderOrderBenefits();
    updateOrderPaymentSummary();
  }
  if (target) return;
  const row = event.target.closest("tr[data-detail-type]");
  if (!row) return;
  if (row.dataset.detailType === "customer") openCustomerDetails(row.dataset.id);
  if (row.dataset.detailType === "contract") openContractDetails(row.dataset.id);
  if (row.dataset.detailType === "voucher") openVoucherDetails(row.dataset.id);
  if (row.dataset.detailType === "promotion") openPromotionDetails(row.dataset.id);
  if (row.dataset.detailType === "franchiseVehicle") openFranchiseVehicleDetails(row.dataset.id);
  if (row.dataset.detailType === "order") {
    const order = state.orders.find((item) => String(item.id) === String(row.dataset.id));
    if (canEditOrderInline(order)) openOrderEditDialog(row.dataset.id);
    else openOrderDetails(row.dataset.id);
  }
});

els.detailsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const type = els.detailsForm.elements.type.value;
  if (type === "order") return;
  if ((type === "voucher" || type === "promotion") && !can("manage_benefits")) {
    els.detailsStatus.textContent = "Ban khong co quyen sua voucher/khuyen mai.";
    return;
  }
  const id = els.detailsForm.elements.id.value;
  const payload = Object.fromEntries(new FormData(els.detailsForm).entries());
  delete payload.id;
  delete payload.type;
  if (type === "customer") {
    try {
      payload.soDienThoai = requireCustomerPhone(payload.soDienThoai);
    } catch (error) {
      els.detailsStatus.textContent = error.message;
      return;
    }
  }
  if (type === "orderFeedback") {
    payload.diemDanhGia = Number(payload.diemDanhGia || 0);
  }
  if (type === "franchiseVehicle") {
    payload.bienKiemSoat = String(payload.bienKiemSoat || "").trim().toUpperCase();
    if (!franchisePlateIsValid(payload.bienKiemSoat)) {
      els.detailsStatus.textContent = "Biển số xe phải đúng định dạng 68A-123.45.";
      return;
    }
  }
  if (type === "voucher" || type === "promotion") {
    if (payload.khongGioiHanHanDung) payload.ngayHetHan = "";
    delete payload.khongGioiHanHanDung;
    payload.giaTri = payload.loaiGiaTri === "fixed" ? parseMoney(payload.giaTri) : Number(String(payload.giaTri || "0").replace(",", "."));
  }
  els.detailsSaveButton.disabled = true;
  els.detailsStatus.textContent = "Đang lưu...";
  try {
    const detailEndpoint =
      type === "customer"
        ? `/api/customers/${encodeURIComponent(id)}`
        : type === "contract"
          ? `/api/tours/${encodeURIComponent(id)}`
          : type === "voucher"
            ? `/api/vouchers/${encodeURIComponent(id)}`
            : type === "promotion"
              ? `/api/promotions/${encodeURIComponent(id)}`
              : type === "orderFeedback"
                ? `/api/order-feedback/${encodeURIComponent(id)}`
              : `/api/franchise-vehicles/${encodeURIComponent(id)}`;
    await fetchJson(detailEndpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    els.detailsDialog.close();
    await loadData();
  } catch (error) {
    els.detailsStatus.textContent = error.message;
  } finally {
    els.detailsSaveButton.disabled = false;
  }
});

els.detailsDeleteButton.addEventListener("click", async () => {
  const type = els.detailsForm.elements.type.value;
  if ((type === "voucher" || type === "promotion") && !can("manage_benefits")) {
    els.detailsStatus.textContent = "Ban khong co quyen xoa voucher/khuyen mai.";
    return;
  }
  const id = els.detailsForm.elements.id.value;
  if (type === "order") {
    const order = state.orders.find((row) => String(row.id) === String(id));
    if (!order || orderIsDone(order) || !canOperateOrders()) {
      els.detailsStatus.textContent = "Chỉ được xóa đơn hàng chưa hoàn thành.";
      return;
    }
  }
  const deleteLabels = {
    customer: "khách hàng",
    contract: "hợp đồng/tuyến",
    voucher: "voucher",
    promotion: "chương trình khuyến mãi",
    order: "đơn hàng",
    franchiseVehicle: "xe thương quyền",
  };
  const label = deleteLabels[type] || "dữ liệu";
  if (!confirm(`Xóa ${label} này?`)) return;
  els.detailsDeleteButton.disabled = true;
  els.detailsStatus.textContent = "Đang xóa...";
  try {
    const detailEndpoint =
      type === "customer"
        ? `/api/customers/${encodeURIComponent(id)}`
        : type === "contract"
          ? `/api/tours/${encodeURIComponent(id)}`
          : type === "voucher"
            ? `/api/vouchers/${encodeURIComponent(id)}`
            : type === "promotion"
              ? `/api/promotions/${encodeURIComponent(id)}`
              : type === "order"
                ? `/api/orders/${encodeURIComponent(id)}`
                : `/api/franchise-vehicles/${encodeURIComponent(id)}`;
    await fetchJson(detailEndpoint, {
      method: "DELETE",
    });
    els.detailsDialog.close();
    await loadData();
  } catch (error) {
    els.detailsStatus.textContent = error.message;
  } finally {
    els.detailsDeleteButton.disabled = false;
  }
});

enhanceDateTimeControls();
new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) enhanceDateTimeControls(node);
    });
  });
}).observe(document.body, { childList: true, subtree: true });

els.calendarDateInput.value = localDateForInput();
els.driverRemittanceDateInput.value = localDateForInput();
if (els.orderDateToInput) els.orderDateToInput.value = localDateForInput();
if (els.reportMonthInput) els.reportMonthInput.value = localMonthForInput();
if (els.reportFromInput) els.reportFromInput.value = localDateForInput();
if (els.cskhShiftReportFromInput) els.cskhShiftReportFromInput.value = localDateForInput();
if (els.cskhShiftReportToInput) els.cskhShiftReportToInput.value = localDateForInput();
if (els.reportToInput) els.reportToInput.value = localDateForInput();
if (els.invoiceReportDateInput) els.invoiceReportDateInput.value = localDateForInput();
if (els.invoiceReportDateToInput) els.invoiceReportDateToInput.value = localDateForInput();
if (els.debtReportDateInput) els.debtReportDateInput.value = localDateForInput();
if (els.debtReportDateToInput) els.debtReportDateToInput.value = localDateForInput();
if (els.commissionReportDateInput) els.commissionReportDateInput.value = localDateForInput();
if (els.commissionReportDateToInput) els.commissionReportDateToInput.value = localDateForInput();
if (els.orderFeedbackDateFromInput) els.orderFeedbackDateFromInput.value = localDateForInput();
if (els.orderFeedbackDateToInput) els.orderFeedbackDateToInput.value = localDateForInput();
updateReportControls();
els.calendarDateInput.addEventListener("change", renderCalendar);
els.calendarTodayButton.addEventListener("click", () => {
  els.calendarDateInput.value = localDateForInput();
  renderCalendar();
});
els.calendarAvailabilityFilter.addEventListener("change", renderCalendar);
els.calendarOwnershipFilter?.addEventListener("change", renderCalendar);
els.dispatchTable?.addEventListener("dragstart", (event) => {
  const row = event.target.closest(".calendar-sortable-row");
  if (!row || !canView("calendar")) return;
  draggedCalendarRow = row;
  draggedCalendarInitialOrder = calendarVehiclePlateOrder().join("|");
  row.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", row.dataset.vehiclePlate || "");
});
els.dispatchTable?.addEventListener("dragover", (event) => {
  if (!draggedCalendarRow) return;
  const target = event.target.closest(".calendar-sortable-row");
  if (!target || target === draggedCalendarRow) return;
  if (target.dataset.vehicleSource !== draggedCalendarRow.dataset.vehicleSource) return;
  event.preventDefault();
  const rect = target.getBoundingClientRect();
  const insertAfter = event.clientY > rect.top + rect.height / 2;
  target.parentNode.insertBefore(draggedCalendarRow, insertAfter ? target.nextSibling : target);
});
els.dispatchTable?.addEventListener("drop", async (event) => {
  if (!draggedCalendarRow) return;
  event.preventDefault();
  const row = draggedCalendarRow;
  draggedCalendarRow = null;
  row.classList.remove("dragging");
  const changed = draggedCalendarInitialOrder !== calendarVehiclePlateOrder().join("|");
  draggedCalendarInitialOrder = "";
  if (changed) await saveCalendarVehicleOrder();
});
els.dispatchTable?.addEventListener("dragend", async () => {
  if (!draggedCalendarRow) return;
  const row = draggedCalendarRow;
  draggedCalendarRow = null;
  row.classList.remove("dragging");
  const changed = draggedCalendarInitialOrder !== calendarVehiclePlateOrder().join("|");
  draggedCalendarInitialOrder = "";
  if (changed) await saveCalendarVehicleOrder();
});
els.calendarResetOrderButton?.addEventListener("click", async () => {
  if (!canView("calendar")) return;
  if (!confirm("Khôi phục thứ tự xe mặc định trong lịch điều xe?")) return;
  try {
    await fetchJson("/api/calendar-vehicle-order", { method: "DELETE" });
    state.calendarVehicleOrder = [];
    renderCalendar();
    if (els.syncStatus) els.syncStatus.textContent = "Đã khôi phục thứ tự xe mặc định.";
  } catch (error) {
    if (els.syncStatus) els.syncStatus.textContent = error.message;
  }
});

function renderOrders() {
  const departureDateFrom = nativeDateValue(els.driverRemittanceDateInput?.value || "");
  const departureDateTo = nativeDateValue(els.orderDateToInput?.value || "");
  const rows = state.orders
    .filter((row) => matches(row, state.filters.order))
    .filter((row) => dateKeyInRange(orderDateKey(row), departureDateFrom, departureDateTo))
    .filter((row) => {
      if (!state.filters.orderStatus) return true;
      if (state.filters.orderStatus === "completed") return orderIsDone(row);
      if (state.filters.orderStatus === "pending") return !orderIsDone(row);
      return true;
    })
    .filter((row) => {
      if (!state.filters.driverNotificationStatus) return true;
      if (state.filters.driverNotificationStatus === "driver-sent") {
        return normalize(row.trangThaiGuiTaiXe).includes("da gui tai xe");
      }
      if (state.filters.driverNotificationStatus === "driver-unsent") {
        return !normalize(row.trangThaiGuiTaiXe).includes("da gui tai xe");
      }
      return true;
    })
    .sort((left, right) => {
      const leftTime = parseDateTime(left.ngayGioDi)?.getTime() ?? Number.POSITIVE_INFINITY;
      const rightTime = parseDateTime(right.ngayGioDi)?.getTime() ?? Number.POSITIVE_INFINITY;
      return leftTime - rightTime || String(left.id || "").localeCompare(String(right.id || ""), "vi");
    });
  const summary = rows.reduce(
    (result, row) => {
      result.tripCount += 1;
      result.baseAmount += parseMoney(row.giaTien);
      result.surcharge += parseMoney(row.phuThu);
      result.discount += parseMoney(row.giamGia) + parseMoney(row.tongUuDai);
      result.vat += orderVatAmount(row);
      result.deposit += parseMoney(row.daCoc);
      result.amountDue += orderRevenueAmount(row);
      result.commission += parseMoney(row.soTienNopLai);
      const hasDebt = normalize(row.congNo).includes("co");
      let debtAmount = 0;
      if (hasDebt) {
        const storedDebt = String(row.soTienCongNo || "").trim();
        debtAmount = storedDebt
          ? parseMoney(storedDebt)
          : Math.max(orderRevenueAmount(row) + parseMoney(row.thueVAT) - parseMoney(row.daCoc), 0);
        result.debt += debtAmount;
      }
      result.actualReceipt += Math.max(
        orderRevenueAmount(row) + orderVatAmount(row) - parseMoney(row.daCoc) - debtAmount,
        0,
      );
      return result;
    },
    { tripCount: 0, baseAmount: 0, surcharge: 0, discount: 0, vat: 0, deposit: 0, amountDue: 0, actualReceipt: 0, commission: 0, debt: 0 },
  );
  if (els.orderSummaryTripCount) els.orderSummaryTripCount.textContent = summary.tripCount.toLocaleString("vi-VN");
  if (els.orderSummaryBaseAmount) els.orderSummaryBaseAmount.textContent = `${formatMoney(summary.baseAmount) || "0"} đ`;
  if (els.orderSummarySurcharge) els.orderSummarySurcharge.textContent = `${formatMoney(summary.surcharge) || "0"} đ`;
  if (els.orderSummaryDiscount) els.orderSummaryDiscount.textContent = `${formatMoney(summary.discount) || "0"} đ`;
  if (els.orderSummaryVat) els.orderSummaryVat.textContent = `${formatMoney(summary.vat) || "0"} đ`;
  if (els.orderSummaryDeposit) els.orderSummaryDeposit.textContent = `${formatMoney(summary.deposit) || "0"} đ`;
  if (els.orderSummaryAmountDue) els.orderSummaryAmountDue.textContent = `${formatMoney(summary.amountDue) || "0"} đ`;
  if (els.orderSummaryActualReceipt) els.orderSummaryActualReceipt.textContent = `${formatMoney(summary.actualReceipt) || "0"} đ`;
  if (els.orderSummaryCommission) els.orderSummaryCommission.textContent = `${formatMoney(summary.commission) || "0"} đ`;
  if (els.orderSummaryDebt) els.orderSummaryDebt.textContent = `${formatMoney(summary.debt) || "0"} đ`;
  const orderHead = document.querySelector(".order-table thead");
  if (orderHead) orderHead.innerHTML = `
    <tr>
      <th>Thao tác</th>
      <th>STT</th>
      <th>Mã đơn</th>
      <th>Ngày giờ đi</th>
      <th>Khách hàng</th>
      <th>Chuyến đi</th>
      <th>Điều xe</th>
      <th>Số chỗ</th>
      <th>Tài chính</th>
      <th>Loại / hóa đơn</th>
      <th>Ghi chú</th>
      <th>Gửi tài xế</th>
      <th>Trạng thái</th>
    </tr>
  `;
  els.orderTable.innerHTML =
    rows
      .map((row, index) => {
        const isDone = orderIsDone(row);
        const hasDispatch = Boolean(row.bienKiemSoat && row.ngayGioDi);
        const routeText = row.tuyen || row.loaiHopDong || "";
        const driverName = orderDriverName(row);
        const requestedSeatCount = String(row.soCho || row.so_cho || "").trim();
        const driverNotificationSent = normalize(row.trangThaiGuiTaiXe).includes("da gui tai xe");
        const pendingReopen = state.reopenRequests.some(
          (request) => String(request.orderId) === String(row.id) && isPendingReopen(request),
        );
        const isDebtOrder = normalize(row.congNo).includes("co");
        const remittancePaid = isDebtOrder || normalize(row.trangThaiNopTien).includes("da nop tien");
        const completedActions = [
          isDebtOrder
            ? `<span class="pill running">Công nợ</span>`
            : can("manage_remittance_status")
            ? `<button class="small ${remittancePaid ? "secondary" : ""}" data-action="toggle-remittance-status" data-order-id="${escapeHtml(row.id)}" data-status="${remittancePaid ? "Chưa nộp tiền" : "Đã nộp tiền"}" type="button">${remittancePaid ? "Đã nộp tiền" : "Chưa nộp tiền"}</button>`
            : `<span class="pill ${remittancePaid ? "done" : "running"}">${remittancePaid ? "Đã nộp tiền" : "Chưa nộp tiền"}</span>`,
          canOperateOrders() && can("request_reopen")
            ? `<button class="small secondary" data-action="request-reopen" data-order-id="${escapeHtml(row.id)}" type="button" ${pendingReopen ? "disabled" : ""}>${pendingReopen ? "Đã gửi yêu cầu" : "Yêu cầu mở lại"}</button>`
            : "",
        ].filter(Boolean).join("");
        const actions = isDone
          ? `<div class="order-action-stack">${completedActions}</div>`
          : `<div class="order-action-stack">
              ${canOperateOrders() && can("dispatch") ? `<button class="small secondary" data-action="assign-order" data-order-id="${escapeHtml(row.id)}" type="button">${hasDispatch ? "Sửa điều xe" : "Điều xe"}</button>` : ""}
              ${hasDispatch && driverNotificationSent && canOperateOrders() && can("complete_order") ? `<button class="small" data-action="complete-order" data-order-id="${escapeHtml(row.id)}" type="button">Hoàn thành</button>` : ""}
              ${canOperateOrders() ? `<button class="small danger" data-action="delete-order" data-order-id="${escapeHtml(row.id)}" type="button">Xóa</button>` : ""}
            </div>`;
        return `
          <tr data-detail-type="order" data-id="${escapeHtml(row.id)}">
            <td class="action-cell">${actions}</td>
            <td><strong>${index + 1}</strong></td>
            <td><strong>${escapeHtml(row.id)}</strong></td>
            <td><strong>${escapeHtml(formatDateTime(row.ngayGioDi) || "Chưa xác định")}</strong></td>
            <td><strong>${escapeHtml(row.tenKhach)}</strong></td>
            <td><strong>${escapeHtml(routeText)}</strong></td>
            <td>
              <strong>${escapeHtml(row.bienKiemSoat || "Chưa điều xe")}</strong>
              ${driverName ? `<div class="order-driver-name">Lái xe: ${escapeHtml(driverName)}</div>` : ""}
              ${row.bienKiemSoat ? `<span class="pill">${escapeHtml(vehicleOwnershipLabel(row))}</span>` : ""}
            </td>
            <td><strong>${requestedSeatCount ? escapeHtml(requestedSeatCount) : `<span class="muted">—</span>`}</strong></td>
            <td><strong>${escapeHtml(formatMoney(orderRevenueAmount(row))) || "0"}</strong></td>
            <td><span class="pill">${escapeHtml(row.loaiHopDong || "Xe nguyên chuyến")}</span></td>
            <td class="order-note-cell">${row.ghiChu ? escapeHtml(row.ghiChu) : `<span class="muted">—</span>`}</td>
            <td>
              ${isDone
                ? `<span class="muted">—</span>`
                : canOperateOrders() && can("dispatch")
                  ? `<button class="small ${driverNotificationSent ? "secondary" : ""}" data-action="toggle-driver-notification" data-order-id="${escapeHtml(row.id)}" data-status="${driverNotificationSent ? "Chưa gửi tài xế" : "Đã gửi tài xế"}" type="button">${driverNotificationSent ? "Đã gửi tài xế" : "Chưa gửi tài xế"}</button>`
                  : `<span class="pill ${driverNotificationSent ? "done" : "running"}">${driverNotificationSent ? "Đã gửi tài xế" : "Chưa gửi tài xế"}</span>`}
            </td>
            <td><span class="pill ${isDone ? "done" : "running"}">${escapeHtml(row.trangThai || "Chưa hoàn thành")}</span></td>
          </tr>
        `;
      })
      .join("") || `<tr><td colspan="13" class="empty">Chưa có đơn hàng.</td></tr>`;
}

async function initializeApp() {
  const versionIsCurrent = await checkAppVersion();
  if (versionIsCurrent) await loadData();
}

initializeApp();
window.setInterval(checkAppVersion, APP_VERSION_CHECK_INTERVAL_MS);
