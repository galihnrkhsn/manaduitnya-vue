# ManaDuitnya - PWA iOS Native-Feel Frontend (Vue 3 + Vite + Tailwind CSS)

Aplikasi web progresif (**PWA**) super ringan (hanya ~280 KiB) dengan nuansa antarmuka **serasa aplikasi iOS native**, siap terhubung dengan RESTful API **`manaduitnya-dotnet`**.

---

## 📱 Fitur Khusus iOS & Native Feel

- **iOS Safe Area Insets**: Mendukung `viewport-fit=cover` sehingga antarmuka menyesuaikan lekukan layar iPhone (Notch & Dynamic Island di atas, serta Home Indicator bar di bawah).
- **iOS Bottom Tab Bar**: Navigasi bawah bergaya frosted glass (`backdrop-blur-xl bg-white/90`) dengan posisi fixed dan tombol aksi cepat sentral.
- **iOS Action / Bottom Sheet**: Modal input transaksi terbuka dari bawah ke atas layaknya native sheet di iOS.
- **Anti-Bounce & No Callout**: Mencegah browser rubber-band bounce berlebih serta menonaktifkan callout / select teks yang sering mengganggu feel native pada tombol.
- **Haptic Tactile Feedback**: Animasi sentuh responsif (`active:scale-[0.96]`) dan integrasi getaran haptic saat tombol ditekan.
- **Offline Ready (Service Worker & Workbox)**: Cache otomatis aset statis dan API offline fallback berkat `vite-plugin-pwa`.
- **Petunjuk Instalasi iOS Otomatis**: Menampilkan banner panduan satu ketukan untuk menambahkan aplikasi ke Layar Utama (*Home Screen*) di Safari iOS.

---

## 🚀 Menjalankan & Menguji di iPhone

### 1. Jalankan Dev Server dengan Host Terbuka
```bash
npm run dev -- --host
```

Vite akan menampilkan alamat Network, contoh:
```text
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.10:5173/
```

### 2. Cara Pasang di iPhone (iOS Safari)
1. Sambungkan iPhone ke jaringan Wi-Fi yang sama dengan komputer Anda.
2. Buka **Safari** di iPhone dan akses URL Network (misal: `http://192.168.1.10:5173`).
3. Ketuk tombol **Bagikan (Share)** (ikon kotak dengan panah ke atas di bagian bawah Safari).
4. Gulir ke bawah dan pilih **"Tambah ke Layar Utama" (Add to Home Screen)**.
5. Ketuk **Tambah**.
6. Ikon **ManaDuitnya** akan muncul di layar utama iPhone Anda. Saat dibuka, aplikasi akan berjalan fullscreen tanpa address bar ataupun navigasi browser!

---

## 🛠️ Build Produksi PWA

```bash
npm run build
```
Hasil build berada di folder `dist/` lengkap dengan `sw.js` (Service Worker) dan `manifest.webmanifest`.
