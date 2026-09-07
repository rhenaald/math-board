# Math Board (Papan Matematika Interaktif)

**Math Board** adalah aplikasi web pembelajaran dan kuis matematika interaktif yang dirancang untuk melatih kemampuan berhitung dasar (penjumlahan, pengurangan, perkalian, dan pembagian) secara visual dan terstruktur. Aplikasi ini sangat cocok untuk siswa sekolah dasar/menengah dan dilengkapi dengan dashboard guru untuk memantau perkembangan belajar siswa.

---

## 🌟 Fitur Utama

### 1. Mode Siswa (Halaman Utama)
*   **Alur 3 Langkah (*Setup Wizard*)**:
    *   **Langkah 1**: Input Nama Siswa.
    *   **Langkah 2**: Pilih Operasi Matematika (`+`, `−`, `×`, `÷`, `Campuran`).
    *   **Langkah 3**: Pilih Satuan / Tingkat Nilai Tempat (**Satuan 1-9**, **Puluhan 10-99**, **Ratusan 100-999**, **Ribuan 1.000-9.999**).
*   **Alat Bantu Visual Balok Nilai Tempat (*Base-Ten Blocks*)**:
    *   Visualisasi interaktif berupa kubus satuan, batang puluhan, lempengan ratusan, dan kubus ribuan sesuai kedua angka pada soal.
    *   Panduan konsep penukaran (*regrouping*) dan pembongkaran balok untuk pemahaman simpan/pinjam.
*   **Papan Hitung Nilai Tempat**:
    *   Kotak bantuan visual **simpan/pinjam** (*carry/borrowing boxes*) untuk mempermudah perhitungan berkolom.
    *   Umpan balik diagnostik langsung jika siswa membuat kesalahan perhitungan.
*   **Audio & Animasi Efek**:
    *   Umpan balik suara interaktif (efek suara sukses, salah, dan fanfare saat selesai) menggunakan sintesis suara *Web Audio API*.
    *   Selebrasi kembang api visual menggunakan `canvas-confetti` saat soal diselesaikan dengan benar.

### 2. Mode Guru (Dashboard Evaluasi Latihan - `/guru`)
*   **Autentikasi Guru**: Pembatasan akses aman menggunakan JWT Token Cookie dengan enkripsi sesi (default: `admin` / `guru123`).
*   **Analisis Kesalahan Otomatis (*Error Diagnostics Engine*)**:
    *   Mendeteksi pola kekeliruan berhitung siswa secara otomatis: *Lupa Simpan (+)*, *Pengurangan Terbalik (tanpa pinjam)*, *Lupa Mengurangi Pinjaman (-)*, *Pergeseran Nilai Tempat*, serta kekeliruan hitung spesifik kolom.
    *   Menampilkan ringkasan evaluasi belajar dan rekomendasi tindakan intervensi bagi guru.
*   **Tabel & Detail Sesi**:
    *   Menampilkan data siswa yang telah menyelesaikan sesi latihan (Nama Siswa, Tanggal, Operasi & Satuan, Sesi ke-N, Skor Benar/Salah, dan Total Waktu).
    *   Klik baris siswa untuk membuka detail pengerjaan soal demi soal, status, jenis kesalahan, dan saran intervensi.
*   **Ekspor Data**: Opsi ekspor ke CSV lengkap dengan rincian evaluasi diagnostik, serta manajemen pembersihan data.

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
