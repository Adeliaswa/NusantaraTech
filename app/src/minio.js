const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT || 9000),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin"
});

const bucketName = process.env.MINIO_BUCKET || "mahasiswa-files";

async function initMinioBucket() {
  const exists = await minioClient.bucketExists(bucketName);

  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log(`Bucket ${bucketName} berhasil dibuat`);
  } else {
    console.log(`Bucket ${bucketName} sudah tersedia`);
  }
}

module.exports = {
  minioClient,
  bucketName,
  initMinioBucket
};
