# StarMar - Platform Media Sosial

![Logo StarMar](./assets/Logo/StarMar-.png)

StarMar adalah aplikasi media sosial modern dan kaya fitur yang dirancang untuk menghubungkan orang dan membangun komunitas. Ini memungkinkan pengguna untuk berbagi postingan, cerita, dan meme, berinteraksi dengan teman, dan menjelajahi konten yang sedang tren.

**Demo Langsung:** [https://starmar2.vercel.app](https://starmar2.vercel.app)

## Fitur

-   **Autentikasi:** Autentikasi pengguna yang aman dengan email/kata sandi, serta penyedia OAuth seperti Google dan GitHub.
-   **Postingan:** Buat, baca, perbarui, dan hapus postingan. Pengguna dapat menyukai dan mengomentari postingan.
-   **Cerita:** Bagikan cerita sementara dengan pengikut Anda.
-   **Meme:** Bagian khusus untuk berbagi dan menelusuri meme.
-   **Profil Pengguna:** Lihat dan sesuaikan profil pengguna Anda dengan gambar profil, bio, dan nama tampilan.
-   **Sistem Mengikuti:** Ikuti dan diikuti oleh pengguna lain.
-   **Notifikasi:** Terima notifikasi untuk suka, komentar, dan pengikut baru.
-   **Halaman Jelajahi:** Temukan konten baru dan sedang tren dari pengguna lain.
-   **Dasbor Admin:** Dasbor bagi administrator untuk mengelola pengguna dan konten.
-   **Desain Responsif:** Antarmuka pengguna yang indah dan responsif yang berfungsi di semua perangkat.
-   **Pencarian:** Cari pengguna dan postingan.
-   **Pesan Langsung:** Kirim pesan langsung ke pengguna lain.
-   **Tagar:** Gunakan tagar untuk mengkategorikan postingan dan menemukan konten terkait.
-   **Bookmark:** Simpan postingan untuk dilihat nanti.
-   **Mode Gelap/Terang:** Beralih antara mode gelap dan terang untuk pengalaman menonton yang nyaman.

## Teknologi yang Digunakan

-   **Frontend:**
    -   [React](https://reactjs.org/)
    -   [Vite](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
-   **Backend & Basis Data:**
    -   [Supabase](https://supabase.io/) - untuk autentikasi, basis data, dan penyimpanan.
-   **Deployment:**
    -   [Vercel](https://vercel.com/)

## Memulai

Untuk mendapatkan salinan lokal dan menjalankannya, ikuti langkah-langkah sederhana ini.

### Prasyarat

-   Node.js dan npm (atau yarn/pnpm)
-   Akun Supabase

### Instalasi

1.  **Kloning repositori:**
    ```sh
    git clone <URL_GIT_ANDA>
    cd star-snap-social
    ```

2.  **Instal dependensi:**
    ```sh
    npm install
    ```

3.  **Siapkan variabel lingkungan:**
    Buat file `.env` di root proyek Anda dan tambahkan variabel lingkungan berikut. Anda bisa mendapatkannya dari pengaturan proyek Supabase Anda.

    ```env
    VITE_SUPABASE_URL=URL_SUPABASE_ANDA
    VITE_SUPABASE_ANON_KEY=KUNCI_ANON_SUPABASE_ANDA
    VITE_SITE_URL=http://localhost:5173
    ```

4.  **Konfigurasi Supabase:**
    -   Aktifkan penyedia autentikasi Google dan GitHub di dasbor proyek Supabase Anda di bawah **Autentikasi > Penyedia**.
    -   Tambahkan URL pengalihan berikut ke pengaturan autentikasi proyek Supabase Anda di bawah **Autentikasi > Konfigurasi URL**:
        -   `http://localhost:5173/auth/callback`
        -   `https://url-produksi-anda.com/auth/callback`

5.  **Jalankan server pengembangan:**
    ```sh
    npm run dev
    ```

    Aplikasi akan tersedia di `http://localhost:5173`.

## Deployment

Proyek ini di-deploy di [Vercel](https://vercel.com/). Untuk men-deploy versi Anda sendiri, Anda dapat menghubungkan repositori GitHub Anda ke Vercel dan mengkonfigurasi variabel lingkungan di pengaturan proyek Vercel.

## Berkontribusi

Kontribusi adalah hal yang membuat komunitas sumber terbuka menjadi tempat yang luar biasa untuk belajar, menginspirasi, dan berkreasi. Setiap kontribusi yang Anda buat **sangat dihargai**.

Jika Anda memiliki saran yang akan membuat ini lebih baik, silakan fork repo dan buat pull request. Anda juga bisa langsung membuka isu dengan tag "peningkatan".
Jangan lupa beri bintang pada proyek ini! Terima kasih lagi!

1.  Fork Proyek
2.  Buat Cabang Fitur Anda (`git checkout -b feature/FiturLuarBiasa`)
3.  Commit Perubahan Anda (`git commit -m 'Tambahkan beberapa FiturLuarBiasa'`)
4.  Push ke Cabang (`git push origin feature/FiturLuarBiasa`)
5.  Buka Pull Request
