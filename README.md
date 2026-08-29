# Quản lý cước xe Đi Xanh

Ứng dụng CSKH và điều hành xe của Đi Xanh.

## Công nghệ

- Backend: Python, FastAPI, Uvicorn
- Frontend: HTML, CSS và JavaScript thuần
- Dữ liệu: Google Sheets API
- Vận hành: systemd và Nginx reverse proxy

## Cài đặt phát triển

1. Tạo Python virtual environment.
2. Cài dependency từ `requirements.txt`.
3. Sao chép `.env.example` thành `.env` và điền cấu hình.
4. Đặt Google service account JSON ở đường dẫn cấu hình bởi `GOOGLE_SERVICE_ACCOUNT_FILE`.
5. Chạy `uvicorn main:app --host 127.0.0.1 --port 8021`.

Không commit `.env`, service account, file backup hoặc dữ liệu vận hành lên repository.

