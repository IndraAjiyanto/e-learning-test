# Catatan Analisis Arsitektur LMS Kesatria Academy

> Tech Stack: NestJS + Handlebars (SSR) + PostgreSQL + TypeORM + TailwindCSS + AlpineJS

---

## 1. Struktur Modul

```
src/
├── app.module.ts          # Root module (60+ feature modules)
├── main.ts                # Bootstrap: Handlebars, session, passport, guards
├── data-source.ts         # TypeORM config
├── entities/              # 60+ entity files (centralized)
├── views/                 # Handlebars templates
│   ├── layouts/main.hbs   # Master layout
│   ├── partials/          # Navbar, sidebar, footer, components
│   └── admin/user/course/ # Halaman per role
├── common/                # Shared: guards, filters, helpers, decorators, upload
└── [feature]/             # Per domain: courses/, users/, auth/, payments/, dll.
    ├── *.controller.ts
    ├── *.service.ts
    ├── *.module.ts
    ├── dto/
    └── *.controller.spec.ts
```

## 2. Dependency Injection

```typescript
// Contoh: CoursesService menginjeksi 20+ repository
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    // ... 17+ repository lainnya
  ) {}
}
```

## 3. Guards & Decorators

```typescript
// Global guard di main.ts
app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

// Custom decorator
@Roles('admin', 'super_admin')  // → sets metadata ROLES_KEY
@ValidateImage({ minWidth: 1900, folder: 'program' })

// Guard implementation
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [...]);
    if (!requiredRoles) return true;
    return requiredRoles.includes(user?.role);
  }
}
```

## 4. Entity Relationships

```
User 1-N UserCourse N-1 Course
User 1-N Payment N-1 Course
User 1-1 Biodata
Payment 1-1 Invoice
Payment 1-N InstallmentPayment
Course 1-N Weeks 1-N Session
Session 1-N Quiz 1-N Question
Session 1-N Assignment
User 1-N WeekProgress N-1 Weeks
User 1-N SessionProgress N-1 Session
User 1-N QuizProgress N-1 Quiz
Course N-N Technology (via course_technologies)
Course N-1 Category
Course N-1 CourseType
Course 1-N Installment
User N-N Voucher (via voucher_courses)
```

## 5. Handlebars Helpers

```typescript
// src/common/helpers/index.ts — aggregator
export const hbsHelpers = {
  ...waHelpers,      // formatWa, waLink
  ...stringHelpers,  // truncate, slugify, capitalize, json
  ...dateHelpers,    // formatDate, formatDateTime, relativeTime
  ...numberHelpers,  // formatRupiah, formatNumber
  ...logicHelpers,   // eq, gte, gt, or, and, roles, ternary
  ...i18nHelpers,    // t, __
  ...uiHelpers,      // starRating, badgeClass
};
```

Usage di template:
```handlebars
{{#if (roles user.role 'admin' 'super_admin')}}
  {{> sidebar}}
{{/if}}
{{formatRupiah course.price}}
{{eq a b}}
```

## 6. RBAC

| Role | Akses |
|---|---|
| `super_admin` | Semua: manage users, courses, payments, approve/reject |
| `admin` | Manage kursus yang di-mentor-kan, logbook, approve pembayaran |
| `user` | Daftar kursus, bayar, akses materi, quiz, logbook, portfolio |

## 7. Custom Interceptors

- `ValidateImageInterceptor`: Validasi MIME type, dimensi (via `image-size`), ukuran file → simpan ke disk → attach URL ke `req.body.uploadedImageUrls`
- `MulterErrorInterceptor`: Handle error dari multer
- `FileUploadExceptionFilter`: Handle file upload errors → flash message

## 8. Session & Auth Flow

```
Login → passport.authenticate('local')
  → serialize user.id ke session cookie
  → Session tersimpan di PostgreSQL (connect-pg-simple, tabel web_sessions)

AuthMiddleware → cek req.isAuthenticated()
  → false → redirect /session-expired
  → true → next()

RolesGuard → cek metadata @Roles() vs req.user.role
  → tidak cocok → 403 Forbidden
```

## 9. Pola yang Digunakan

| Pola | Contoh |
|---|---|
| Repository Pattern | `@InjectRepository(Course)` → TypeORM Repository |
| Singleton via DI | Semua service singleton oleh NestJS DI |
| Guard Pattern | `RolesGuard`, `AuthenticatedGuard` |
| Interceptor Chain | `FileInterceptor` → `ValidateImageInterceptor` |
| Decorator Metadata | `@Roles()`, `@ValidateImage()` via `SetMetadata` |
| Flash Messages | `connect-flash` + `req.flash('success', ...)` |
| SSR + SPA Hybrid | Handlebars untuk halaman, JSON API untuk fetch client-side |

## 10. Technical Debt

| Issue | Dampak |
|---|---|
| 20+ repository di satu service | SRP violation, sulit test |
| Business logic di controller | Harusnya di service |
| Hardcoded role checks | Harusnya pakai policy/strategy pattern |
| `INV-${Date.now()}` tanpa unique | Rawan tabrakan |
| Tidak ada CSRF protection | Vulnerability untuk SSR forms |
| Tidak ada transaksi DB atomik | Data yatim kalika gagal mid-flow |
| 96 test gagal (scaffold CLI) | Coverage 0% untuk kebanyakan module |
| `synchronize: true` di data-source | Berbahaya di production |
| Session secret hardcoded `'rahasia-super'` | Harusnya dari env |
| Legacy Invoice API Xendit | Sudah deprecated, harus migrasi |

---

> Dokumen ini dibuat pada 10 September 2026
