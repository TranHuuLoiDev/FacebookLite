# Facebook Lite - Social Media Application

Ứng dụng mạng xã hội tương tự Facebook được xây dựng bằng Spring Boot và mô hình MVC.

## Cấu trúc dự án

```
FacebookLite/
├── src/
│   ├── main/
│   │   ├── java/com/facebooklite/
│   │   │   ├── controller/        # Controllers - xử lý HTTP requests
│   │   │   ├── service/           # Business logic layer
│   │   │   ├── repository/        # Data access layer (JPA)
│   │   │   ├── model/             # Entity models
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── config/            # Configuration classes
│   │   │   ├── security/          # Security & Authentication
│   │   │   ├── exception/         # Exception handling
│   │   │   ├── util/              # Utility classes
│   │   │   └── FacebookLiteApplication.java
│   │   └── resources/
│   │       ├── static/            # Static resources
│   │       │   ├── css/
│   │       │   ├── js/
│   │       │   └── images/
│   │       ├── templates/         # Thymeleaf templates
│   │       └── application.properties
│   └── test/
│       └── java/com/facebooklite/ # Unit tests
├── pom.xml
└── README.md
```

## Công nghệ sử dụng

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** - Database access
- **Spring Security** - Authentication & Authorization
- **MySQL** - Database
- **Thymeleaf** - Template engine
- **Lombok** - Reduce boilerplate code
- **JWT** - Token-based authentication
- **Maven** - Build tool

## Tính năng chính

- 👤 Đăng ký & Đăng nhập người dùng
- 📝 Đăng bài viết (Post)
- 👍 Like & Comment
- 👥 Kết bạn (Friend requests)
- 💬 Nhắn tin (Messaging)
- 📷 Upload ảnh
- 🔔 Thông báo (Notifications)
- 🔒 Bảo mật với JWT

## Cài đặt

### Yêu cầu
- JDK 17 trở lên
- MySQL 8.0+
- Maven 3.6+

### Các bước cài đặt

1. Clone repository
2. Tạo database MySQL:
```sql
CREATE DATABASE facebook_lite_db;
```

3. Cấu hình database trong `application.properties`
4. Build project:
```bash
mvn clean install
```

5. Run application:
```bash
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại: http://localhost:8080

## API Endpoints (Dự kiến)

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/posts` - Lấy danh sách bài viết
- `POST /api/posts` - Tạo bài viết mới
- `POST /api/posts/{id}/like` - Like bài viết
- `POST /api/posts/{id}/comment` - Comment bài viết
- `GET /api/users/{id}` - Xem profile
- `POST /api/friends/request` - Gửi lời mời kết bạn

## License

MIT License
