# Facebook Lite - Social Media Application

Ứng dụng mạng xã hội tương tự Facebook được xây dựng bằng Spring Boot và mô hình MVC.

## Cấu trúc dự án

```
FacebookLite/
├── .editorconfig
├── .gitignore
├── pom.xml
├── README.md
├── database/
│   └── facebook_lite_schema.sql   # Database schema
├── src/
│   ├── main/
│   │   ├── java/com/facebooklite/
│   │   │   ├── config/            # Configuration classes
│   │   │   ├── controller/        # Controllers - xử lý HTTP requests
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── exception/         # Exception handling
│   │   │   ├── model/             # Entity models
│   │   │   ├── repository/        # Data access layer (JPA)
│   │   │   ├── security/          # Security & Authentication
│   │   │   ├── service/           # Business logic layer
│   │   │   ├── util/              # Utility classes
│   │   │   └── FacebookLiteApplication.java
│   │   └── resources/
│   │       ├── static/            # Static resources
│   │       │   ├── css/           # Stylesheet files
│   │       │   ├── html/          # HTML pages
│   │       │   ├── images/        # Image assets
│   │       │   ├── js/            # JavaScript files
│   │       │   └── uploads/       # User uploaded files
│   │       ├── templates/         # Thymeleaf templates (empty)
│   │       └── application.properties
│   └── test/
│       └── java/com/facebooklite/ # Unit tests
└── target/                        # Build output
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

## Thành viên
1. Trần Hữu Lợi 
2. Lương Quốc An
3. Trần Lâm Nhật Tường
4. Phan Khải Điền

## Ngôn ngữ sử dụng
- Java
- Javascript
- HTML
- CSS

## Tính năng chính

- Đăng ký & Đăng nhập người dùng
- Đăng bài viết (Post)
- Like & Comment
- Kết bạn (Friend requests)
- Nhắn tin (Messaging)
- Upload ảnh
- Thông báo (Notifications)
- Bảo mật với JWT

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
