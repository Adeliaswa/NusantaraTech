# 🎓 NusantaraTech — Case Based 2: Containerization

> **Mata Kuliah:** Administrasi Data  
> **Topik:** Standardisasi Lingkungan Development Terintegrasi menggunakan Docker dan Docker Compose

Project ini menjalankan tiga service utama dalam satu environment terkontainerisasi:

| Service | Teknologi | Fungsi |
|--------|-----------|--------|
| App | Node.js + Express | API CRUD Mahasiswa |
| Database | MySQL 8.0 | Penyimpanan data relasional |
| Object Storage | MinIO | Penyimpanan file (seperti AWS S3) |

Semua service dijalankan menggunakan **Docker Compose**, terhubung lewat custom bridge network, dan menggunakan **Docker Volume** agar data tetap tersimpan saat container dihentikan.

---

## Anggota dan Pembagian Tugas

| No | Role | Tanggung Jawab |
|----|------|----------------|
| Adelia Swastika Dewi | 245150700111038 | Backend & App Service | Node.js Express, endpoint CRUD, integrasi MySQL & MinIO, Dockerfile |
| Devi Atika Putri | 245150700111039 | Docker & Infrastructure | docker-compose.yml, konfigurasi MySQL, MinIO, network, volume, .env |
| Nadhifa Fitriyah Wadiaturabbi | 245150707111064 | QA & Documentation | Testing API (Postman), testing database (DBeaver), testing MinIO, testing persistensi, README |

---

## Teknologi yang Digunakan

- **Node.js** + **Express.js** — Backend API
- **MySQL 8.0** — Database relasional
- **MinIO** — Object storage (S3-compatible)
- **Docker** + **Docker Compose** — Containerization
- **DBeaver** — GUI client untuk MySQL
- **Postman** — API testing tool

---

## Struktur Project

```
NusantaraTech/
├── app/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── index.js
│       ├── db.js
│       └── minio.js
├── docker-compose.yml
├── .env.example
├── README.md
```

---

## ✅ Prasyarat

Pastikan perangkat sudah memiliki:

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Postman](https://www.postman.com/downloads/)
- [DBeaver Community Edition](https://dbeaver.io/download/)

Cek instalasi:

```bash
git --version
docker --version
docker compose version
```

---

## Cara Menjalankan Project

### 1. Clone Repository di Ubuntu

```bash
git clone https://github.com/Adeliaswa/NusantaraTech.git
cd NusantaraTech
```

### 2. Konfigurasi Environment

Buat file `.env` dari `.env.example`:

```bash
cp .env.example .env
```

Isi `.env` yang digunakan:

```env
APP_PORT=3000
PORT=3000

DB_HOST=mysql
DB_PORT=3306
DB_NAME=academic_db
DB_USER=academic_user
DB_PASSWORD=academic_password

MYSQL_ROOT_PASSWORD=root_password

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=mahasiswa-files
```

### 3. Jalankan Semua Service

```bash
docker compose up -d --build
```

### 4. Cek Status Container

```bash
docker compose ps
```

Hasil yang diharapkan:

```
NAME              STATUS
academic_app      Up
academic_mysql    Up (healthy)
academic_minio    Up
```

<img width="1754" height="219" alt="Screenshot 2026-05-16 191251" src="https://github.com/user-attachments/assets/bbed9634-d50e-4fa4-aa10-fc44bdd0f161" />


---

## Akses Service

> **Catatan:** Ganti `<IP_VM>` dengan IP VM Anda (cek dengan `hostname -I` di terminal VM)

| Service | URL | Keterangan |
|---------|-----|------------|
| API | `http://<IP_VM>:3000` | Backend Express |
| Health Check | `http://<IP_VM>:3000/health` | Status semua service |
| MinIO Console | `http://<IP_VM>:9001` | Dashboard MinIO |

**Login MinIO:**
```
Username: minioadmin
Password: minioadmin
```

**Koneksi MySQL via DBeaver:**
```
Host     : <IP_VM>
Port     : 3307
Database : academic_db
Username : academic_user
Password : academic_password
```

Jika muncul error `Public Key Retrieval is not allowed`, gunakan JDBC URL berikut:

```
jdbc:mysql://<IP_VM>:3307/academic_db?allowPublicKeyRetrieval=true&useSSL=false
```

---

## Endpoint API

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/` | Informasi service |
| GET | `/health` | Status app, database, dan MinIO |
| POST | `/mahasiswa` | Tambah data mahasiswa |
| GET | `/mahasiswa` | Lihat semua data mahasiswa |
| GET | `/mahasiswa/:id` | Lihat detail mahasiswa |
| PUT | `/mahasiswa/:id` | Update data mahasiswa |
| DELETE | `/mahasiswa/:id` | Hapus data mahasiswa |
| POST | `/mahasiswa/:id/upload` | Upload file mahasiswa ke MinIO |

---

## Testing API dengan Postman

### 1. Health Check

**Method:** `GET`  
**URL:** `http://<IP_VM>:3000/health`

Expected Response:
```json
{
  "status": "OK",
  "app": "running",
  "database": "connected",
  "database_type": "MySQL",
  "minio": "connected",
  "bucket": "mahasiswa-files"
}
```

<img width="1102" height="621" alt="Screenshot 2026-05-16 183450" src="https://github.com/user-attachments/assets/e4cac602-6e76-41aa-bde2-baffd21c8307" />


---

### 2. Create Mahasiswa

**Method:** `POST`  
**URL:** `http://<IP_VM>:3000/mahasiswa`  
**Body → raw → JSON:**
```json
{
  "nama": "Nadhifa Fitriyah",
  "nim": "220001",
  "jurusan": "Teknik Informatika"
}
```

Expected Response:
```json
{
  "message": "Mahasiswa berhasil ditambahkan"
}
```

<img width="1114" height="831" alt="Screenshot 2026-05-16 183519" src="https://github.com/user-attachments/assets/fc77055a-cb60-46c4-80f7-871238c3f5e7" />


---

### 3. Get Semua Mahasiswa

**Method:** `GET`  
**URL:** `http://<IP_VM>:3000/mahasiswa`

Expected Response:
```json
{
  "message": "Data mahasiswa berhasil diambil"
}
```

<img width="1759" height="989" alt="Screenshot 2026-05-16 183650" src="https://github.com/user-attachments/assets/293b8532-337b-461f-a975-520485cd7fed" />


---

### 4. Get Detail Mahasiswa

**Method:** `GET`  
**URL:** `http://<IP_VM>:3000/mahasiswa/<ID_MHS>`

Expected Response: 

```json
{
    "message": "Detail mahasiswa berhasil diambil"
}
````

<img width="1114" height="628" alt="Screenshot 2026-05-16 183710" src="https://github.com/user-attachments/assets/581c3cb4-5eb0-48a0-8035-e56aea7a2f9a" />


---

### 5. Update Mahasiswa

**Method:** `PUT`
**URL:** `http://<IP_VM>:3000/mahasiswa/<ID_MHS>`

**Body → raw → JSON:**

Expected Response:

```json
{
    "message": "Mahasiswa berhasil diperbarui"
}
```

<img width="1112" height="780" alt="Screenshot 2026-05-16 183738" src="https://github.com/user-attachments/assets/8e48b633-bc10-4c20-9c52-c35ba519dd98" />

---

### 6. Delete Mahasiswa

**Method:** `DELETE`
**URL:** `http://<IP_VM>:3000/mahasiswa/1`

Expected Response:

```json
{
  "message": "Mahasiswa berhasil dihapus"
}
```

<img width="1115" height="873" alt="Screenshot 2026-05-16 183750" src="https://github.com/user-attachments/assets/bc653610-741d-4d80-8797-603eac4779fc" />


---

### 7. Upload File Mahasiswa

**Method:** `POST`
**URL:** `http://<IP_VM>:3000/mahasiswa/1/upload`

**Body → form-data**

| KEY  | TYPE |
| ---- | ---- |
| file | File |

Upload file gambar atau dokumen melalui Postman menggunakan form-data.

Expected Response:

```json
{
  "message": "File berhasil diupload ke MinIO"
}
```

<img width="1118" height="830" alt="Screenshot 2026-05-16 183842" src="https://github.com/user-attachments/assets/21c170de-b853-44f8-b869-2e1330e3528b" />


---

## Testing Database dengan DBeaver

Koneksi ke database menggunakan konfigurasi:

```
Host     : <IP_VM>
Port     : 3307
Database : academic_db
Username : academic_user
Password : academic_password
```

Yang diverifikasi:
- Koneksi ke `academic_db` berhasil
- Tabel `mahasiswa` muncul di database explorer
- Data yang diinput via Postman masuk ke tabel
- Kolom `file_name` dan `file_url` terisi setelah upload file

- Status koneksi "Connected" atau test connection berhasil 
<img width="857" height="702" alt="Screenshot 2026-05-16 183957" src="https://github.com/user-attachments/assets/247f61e5-86fa-47ac-9634-8c4388d980e4" />


- Tabel mahasiswa dan Isi Data
<img width="1757" height="989" alt="Screenshot 2026-05-16 184041" src="https://github.com/user-attachments/assets/cdc73c37-06c4-4dbd-9a86-8942d47fb419" />



---

## 📦 Testing MinIO

MinIO diakses melalui browser di `http://<IP_VM>:9001`.

**Login:**
```
Username: minioadmin
Password: minioadmin
```

Yang diverifikasi:
- Login MinIO berhasil
- Bucket `mahasiswa-files` tersedia
- File hasil upload dari API muncul di dalam bucket

- Tampilan Awal MinIO 
<img width="1759" height="989" alt="Screenshot 2026-05-16 184134" src="https://github.com/user-attachments/assets/f3580372-9e53-4fd7-b1ae-59fe6efdaf4b" />


- Dashboard MinIO
<img width="1759" height="989" alt="Screenshot 2026-05-16 184351" src="https://github.com/user-attachments/assets/adf1191f-b3f6-41b3-82e3-e51a2f0a350e" />


---

## Testing Persistensi Data

Untuk membuktikan data tidak hilang saat container dihentikan, dilakukan pengujian berikut:

**Langkah:**
```bash
# Stop semua container
docker compose down

# Jalankan kembali
docker compose up -d
```


**Hasil setelah container dijalankan ulang:**
- Data mahasiswa di MySQL **tetap ada**
- File di MinIO **tetap ada**
- API **tetap bisa diakses**

Ini membuktikan Docker Volume berfungsi dengan benar untuk persistensi data.

- DBeaver setelah restart — data mahasiswa masih ada di tabel 
<img width="1759" height="989" alt="Screenshot 2026-05-16 184813" src="https://github.com/user-attachments/assets/bd608f02-b6bb-4b54-b7ed-22586b9a9140" />


- MinIO setelah restart 
<img width="1759" height="989" alt="Screenshot 2026-05-16 184831" src="https://github.com/user-attachments/assets/b8381ccf-9a4d-400e-be90-26d6970b6662" />


- Terminal untuk testing persistensi data 
<img width="876" height="452" alt="Screenshot 2026-05-16 184749" src="https://github.com/user-attachments/assets/4448add5-f16b-4521-858f-5ad1bab39e50" />


---

## Cara Menghentikan Project

```bash
# Stop container (data tetap tersimpan di volume)
docker compose down

# Stop container DAN hapus semua volume (data hilang)
docker compose down -v
```

>  **Perhatian:** `docker compose down -v` akan **menghapus** semua data database dan file MinIO secara permanen.

---

## Kesimpulan

Project **NusantaraTech** berhasil menjalankan environment development terintegrasi menggunakan Docker Compose. Tiga service utama (App, MySQL, MinIO) berjalan dalam satu network dan dapat saling berkomunikasi. Data yang diinput melalui API tersimpan di MySQL dan dapat diverifikasi melalui DBeaver. File yang diupload tersimpan di MinIO dan URL-nya tersimpan di database. Pengujian persistensi membuktikan bahwa Docker Volume berfungsi — data tetap tersedia setelah container dihentikan dan dijalankan kembali.
