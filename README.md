# Math Board (Papan Matematika Interaktif)

**Math Board** adalah aplikasi web pembelajaran dan kuis matematika interaktif yang dirancang untuk melatih kemampuan berhitung dasar (penjumlahan, pengurangan, perkalian, dan pembagian) secara visual dan terstruktur. Aplikasi ini sangat cocok untuk siswa sekolah dasar/menengah dan dilengkapi dengan dashboard guru untuk memantau perkembangan belajar siswa.

---

## 🌟 Fitur Utama

### 1. Mode Siswa (Halaman Utama)
*   **Mode Latihan**:
    *   Mendukung operasi Penjumlahan (`+`), Pengurangan (`-`), Perkalian (`×`), Pembagian (`÷`), dan Campuran (`mix`).
    *   Dilengkapi dengan kotak bantuan visual **simpan/pinjam** (*carry/borrowing boxes*) untuk mempermudah perhitungan berkolom (Satuan, Puluhan, Ratusan, Ribuan).
    *   Pengaturan latihan dinamis (fokus soal tanpa simpan, hanya simpan/pinjam, hasil harus positif, dsb.).
*   **Mode Kuis**:
    *   Tantangan terstruktur berisi **36 soal** (9 penjumlahan, 9 pengurangan, 9 perkalian, 9 pembagian) yang mencakup variasi digit (Satuan ke Satuan hingga Ratusan ke Ratusan).
    *   Pencatatan waktu pengerjaan secara keseluruhan dan per soal secara detail.
*   **Audio & Animasi Efek**:
    *   Umpan balik suara interaktif (efek suara sukses, salah, dan fanfare saat selesai) menggunakan sintesis suara *Web Audio API*.
    *   Selebrasi kembang api visual menggunakan `canvas-confetti` saat kuis diselesaikan dengan baik.

### 2. Mode Guru (Dashboard Rekap Nilai - `/guru`)
*   **Autentikasi Guru**: Pembatasan akses aman menggunakan JWT Token Cookie dengan enkripsi sesi.
*   **Tabel Rekap Nilai**: 
    *   Menampilkan data siswa yang telah menyelesaikan kuis (Nama Siswa, Tanggal, Upaya ke-N, Skor Benar/Salah, dan Total Waktu Pengerjaan).
    *   **Analisis Detail Soal**: Klik baris siswa untuk melihat detail pengerjaan: soal demi soal, jawaban siswa, indikasi benar/salah, dan waktu yang dihabiskan untuk menjawab setiap soal.
*   **Manajemen Data**: Opsi untuk membersihkan seluruh data riwayat rekap nilai dari database.

---

## 🛠️ Teknologi yang Digunakan

*   **Framework**: Next.js 16.3 (App Router)
*   **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
*   **Database & ORM**: PostgreSQL & Prisma ORM
*   **Animasi & Audio**: Canvas Confetti & Web Audio API (Synthesizer Suara)
*   **Autentikasi**: JSON Web Token (JWT) & Cookies

---

## 🚀 Panduan Instalasi & Menjalankan Project

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi Math Board di komputer lokal Anda:

### 1. Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terinstal:
*   [Node.js](https://nodejs.org/) (versi 18 ke atas direkomendasikan)
*   [PostgreSQL](https://www.postgresql.org/) (pastikan server database menyala)

### 2. Kloning Repository
```bash
git clone https://github.com/rhenaald/math-board.git
cd math-board
```

### 3. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua library/package yang diperlukan:
```bash
npm install
```

### 4. Konfigurasi Environment Variables (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` yang baru dibuat, lalu sesuaikan konfigurasi koneksi database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/math_board?schema=public"
JWT_SECRET="isi_dengan_kode_rahasia_bebas_untuk_guru"
```
*(Ganti `username`, `password`, `localhost`, dan nama database sesuai dengan konfigurasi PostgreSQL Anda)*

### 5. Setup Database dengan Prisma
Jalankan perintah berikut untuk membuat tabel-tabel database yang diperlukan berdasarkan skema Prisma:
```bash
npx prisma db push
```

### 6. Jalankan Server Development
Setelah database siap, jalankan aplikasi dalam mode pengembangan (development):
```bash
npm run dev
```

Buka browser Anda dan akses aplikasi di: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Informasi Akun Default Guru

Untuk masuk ke halaman Dashboard Guru di **[http://localhost:3000/guru](http://localhost:3000/guru)**, gunakan kredensial berikut:

*   **Username**: `admin`
*   **Password**: `guru123`
