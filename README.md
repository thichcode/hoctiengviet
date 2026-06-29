# hoctiengviet

## Vòng quay tên (Wheel Name)

Trang web tĩnh cho phép nhập danh sách tên và quay chọn ngẫu nhiên.

### Chạy cục bộ
- Yêu cầu: Node.js đã cài sẵn (đã có trong môi trường)
- Chạy server tĩnh:

```bash
python3 -m http.server 5173 --bind 0.0.0.0 --directory /workspace
```

Mở trình duyệt tới cổng 5173.

### Triển khai lên Vercel
1. Cài Vercel CLI (nếu chưa có):
```bash
npm i -g vercel
```
2. Đăng nhập hoặc dùng token:
- Đăng nhập tương tác:
```bash
vercel login
```
- Hoặc thiết lập biến môi trường token:
```bash
export VERCEL_TOKEN=your_token_here
```
3. Deploy:
```bash
vercel --prod --confirm --yes --token "$VERCEL_TOKEN" --name wheel-name
```

Mặc định Vercel sẽ deploy như một static app từ thư mục gốc vì dự án có `index.html`.