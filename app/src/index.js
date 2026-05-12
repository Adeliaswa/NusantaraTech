require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { initDatabase, getPool } = require("./db");
const { minioClient, bucketName, initMinioBucket } = require("./minio");

const app = express();
const PORT = process.env.PORT || process.env.APP_PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Academic App Service berjalan",
    service: "Web/App Service",
    database: "MySQL",
    storage: "MinIO",
    endpoints: {
      health: "GET /health",
      getAllMahasiswa: "GET /mahasiswa",
      getMahasiswaById: "GET /mahasiswa/:id",
      createMahasiswa: "POST /mahasiswa",
      updateMahasiswa: "PUT /mahasiswa/:id",
      deleteMahasiswa: "DELETE /mahasiswa/:id",
      uploadFile: "POST /mahasiswa/:id/upload"
    }
  });
});

app.get("/health", async (req, res) => {
  try {
    const pool = getPool();

    await pool.query("SELECT 1 AS db_status");

    const bucketExists = await minioClient.bucketExists(bucketName);

    res.json({
      status: "OK",
      app: "running",
      database: "connected",
      database_type: "MySQL",
      minio: bucketExists ? "connected" : "bucket not found",
      bucket: bucketName
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message
    });
  }
});

app.post("/mahasiswa", async (req, res) => {
  try {
    const { nama, nim, jurusan } = req.body;

    if (!nama || !nim || !jurusan) {
      return res.status(400).json({
        message: "nama, nim, dan jurusan wajib diisi"
      });
    }

    const pool = getPool();

    const [result] = await pool.query(
      "INSERT INTO mahasiswa (nama, nim, jurusan) VALUES (?, ?, ?)",
      [nama, nim, jurusan]
    );

    const [rows] = await pool.query(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Mahasiswa berhasil ditambahkan",
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan mahasiswa",
      error: error.message
    });
  }
});

app.get("/mahasiswa", async (req, res) => {
  try {
    const pool = getPool();

    const [rows] = await pool.query(
      "SELECT * FROM mahasiswa ORDER BY id ASC"
    );

    res.json({
      message: "Data mahasiswa berhasil diambil",
      total: rows.length,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data mahasiswa",
      error: error.message
    });
  }
});

app.get("/mahasiswa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan"
      });
    }

    res.json({
      message: "Detail mahasiswa berhasil diambil",
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail mahasiswa",
      error: error.message
    });
  }
});

app.put("/mahasiswa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nim, jurusan } = req.body;

    if (!nama || !nim || !jurusan) {
      return res.status(400).json({
        message: "nama, nim, dan jurusan wajib diisi"
      });
    }

    const pool = getPool();

    const [result] = await pool.query(
      "UPDATE mahasiswa SET nama = ?, nim = ?, jurusan = ? WHERE id = ?",
      [nama, nim, jurusan, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan"
      });
    }

    const [rows] = await pool.query(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [id]
    );

    res.json({
      message: "Mahasiswa berhasil diperbarui",
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal memperbarui mahasiswa",
      error: error.message
    });
  }
});

app.delete("/mahasiswa/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan"
      });
    }

    await pool.query(
      "DELETE FROM mahasiswa WHERE id = ?",
      [id]
    );

    res.json({
      message: "Mahasiswa berhasil dihapus",
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus mahasiswa",
      error: error.message
    });
  }
});

app.post("/mahasiswa/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    if (!req.file) {
      return res.status(400).json({
        message: "File wajib diupload dengan field name: file"
      });
    }

    const [mahasiswaRows] = await pool.query(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [id]
    );

    if (mahasiswaRows.length === 0) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Mahasiswa tidak ditemukan"
      });
    }

    const originalName = req.file.originalname;
    const fileExtension = path.extname(originalName);
    const objectName = `mahasiswa-${id}-${Date.now()}${fileExtension}`;

    await minioClient.fPutObject(
      bucketName,
      objectName,
      req.file.path,
      {
        "Content-Type": req.file.mimetype
      }
    );

    const fileUrl = `http://${process.env.MINIO_ENDPOINT || "localhost"}:${process.env.MINIO_PORT || "9000"}/${bucketName}/${objectName}`;

    await pool.query(
      "UPDATE mahasiswa SET file_name = ?, file_url = ? WHERE id = ?",
      [objectName, fileUrl, id]
    );

    const [updatedRows] = await pool.query(
      "SELECT * FROM mahasiswa WHERE id = ?",
      [id]
    );

    fs.unlinkSync(req.file.path);

    res.json({
      message: "File berhasil diupload ke MinIO",
      bucket: bucketName,
      object_name: objectName,
      data: updatedRows[0]
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Gagal upload file",
      error: error.message
    });
  }
});

async function startServer() {
  try {
    await initDatabase();
    await initMinioBucket();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Academic App Service berjalan di port ${PORT}`);
    });
  } catch (error) {
    console.error("Gagal menjalankan server:", error.message);
    process.exit(1);
  }
}

startServer();
