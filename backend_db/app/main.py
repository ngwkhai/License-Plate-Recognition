import sys
import os
import time
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.login import router as login_router
from app.websocket.ws_server import websocket_endpoint
from app.db.database import Base, engine
from app.utils.security import get_current_user
from app.db.models import User

# Thêm thư mục /app vào sys.path để import dễ dàng
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_app() -> FastAPI:
    app = FastAPI()

    # Middleware đo thời gian xử lý request cho các route /admin
    @app.middleware("http")
    async def log_request_time(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        if request.url.path.startswith("/admin"):
            print(f"[{request.method}] {request.url.path} - {duration:.3f}s")
        return response

    # Cấu hình CORS (cho phép tất cả domain, phương thức, header...)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Tạo bảng trong database nếu chưa có
    Base.metadata.create_all(bind=engine)

    # Đăng ký router cho các nhóm API
    app.include_router(login_router)  # Router đăng nhập, không có prefix (ví dụ: /login)
    app.include_router(admin_router)  # Router admin với prefix /admin

    # Đăng ký websocket route
    app.add_api_websocket_route("/ws", websocket_endpoint)

    # Route kiểm tra sức khỏe server
    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    # Ví dụ route admin dashboard có bảo vệ quyền admin
    @app.get("/admin/dashboard")
    def admin_dashboard(current_user: User = Depends(get_current_user)):
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập tài nguyên này."
            )
        return {"message": f"Welcome Admin {current_user.username}!"}

    return app

app = create_app()
