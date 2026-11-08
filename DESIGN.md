# DESIGN.md

Panduan arah desain (design direction & style system) untuk aplikasi **ManaDuitnya** (`manaduitnya-vue`). Dokumen ini menjadi acuan tunggal untuk seluruh implementasi antarmuka, tata letak, komponen, dan interaksi pengguna.

Dial: ENERGY 1 / RHYTHM 1 / MOTION 1

---

## 1. Identitas & Filosofi Desain (Product Identity)

- **Karakter:** Utilitarian, bersih, terpercaya, dan tenang (calm financial tool). Fokus utama adalah kejelasan data moneter dan kecepatan navigasi pengguna.
- **Gaya Visual:** *Clean, dense information layout* (padat data tanpa terasa sesak). Desain mengutamakan efisiensi ruang layar horizontal dan vertikal, sangat cocok untuk aplikasi keuangan harian dan dashboard operasional.
- **Fokus Tunggal (Single Focal Point):** Setiap tampilan layar hanya memiliki satu elemen paling penting yang langsung menangkap perhatian (misalnya: kartu total saldo di Dashboard atau tabel pencatatan di halaman Transaksi). Elemen sekunder lainnya harus mengalah secara visual.

---

## 2. Palet Warna & Token Desain (Tailwind Theme Tokens)

Warna aplikasi diturunkan secara ketat dari konfigurasi `tailwind.config.js`:

| Token | Nilai Hex | Peran & Penggunaan |
|---|---|---|
| `surface` | `#FFFFFF` | Latar area kerja utama, baris tabel, modal dialog, formulir input aktif |
| `card` | `#F1F5F9` | Latar belakang kanvas aplikasi (neutral slate canvas), container sekunder |
| `ink` | `#1E293B` | Teks judul utama, angka saldo, label penting (kontras tinggi, hindari `#000` murni)|
| `ink/60`, `ink/40` | Muted Slate | Subtitle, placeholder, label metadata, dan helper text |
| `brand` | `#0D9488` | Warna aksen utama (Teal-600) untuk tombol CTA primer, badge pemasukan, dan tab aktif |
| `brand-dark` | `#0F766E` | Hover state untuk CTA primer dan tautan teks yang dapat diklik |

### Warna Semantik Finansial
- **Pemasukan (Income):** Aksen Hijau/Teal (`text-brand`, badge `bg-brand/10 text-brand` atau `text-emerald-600 bg-emerald-50`) dipadukan dengan ikon `ArrowUpRight`.
- **Pengeluaran (Expense):** Aksen Merah/Rose (`text-rose-500`, badge `bg-rose-50 text-rose-500`) dipadukan dengan ikon `ArrowDownLeft`.
- **Border & Pembatas:** `border-slate-200` atau `border-slate-200/80` (halus dan menyatu, hindari garis tebal atau gelap).

### Aturan Warna & Anti-Slop
- **Satu Aksen Terkendali:** Gunakan warna `brand` (#0D9488) hanya pada momen krusial (CTA utama, filter terpilih). Jangan menebarkan warna brand ke semua elemen.
- **Larangan Gradien Standar AI:** DILARANG menggunakan gradien biru-ke-ungu atau radial glow orbs di latar belakang. Gradien hanya diizinkan untuk representasi kartu fisik dompet/rekening (kartu ATM/e-wallet) dan banner ringkasan atas dengan opasitas terkontrol.

---

## 3. Tipografi & Format Moneter

- **Font Family:** `Inter Variable`, sans-serif. Huruf harus konsisten di seluruh aplikasi.
- **Hierarki Tipografi:**
  - *Headline / Total Saldo Utama:* `text-xl sm:text-2xl font-bold tracking-tight`
  - *Judul Seksi / Modal Title:* `text-base sm:text-lg font-bold text-ink`
  - *Header Tabel & Card Title:* `text-xs font-semibold uppercase tracking-wider text-ink/60`
  - *Teks Utama (Body):* `text-sm text-ink`
  - *Subtitle & Metadata:* `text-xs text-ink/60`
  - *Label / Tag / Tab Bar:* `text-[10px]` atau `text-[11px]` font-medium/font-bold
- **Format Mata Uang (Rupiah):**
  - Wajib diformat melalui fungsi konsisten `formatCurrency(val)` atau `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.
  - Tampilkan pemisah ribuan titik (contoh: `Rp 1.500.000`), bukan format angka polos (`1500000`).
  - Gunakan `tabular-nums` atau `font-mono` pada angka di tabel dan laporan agar perbandingan angka sejajar secara vertikal.

---

## 4. Tata Letak & Kepadatan Data (Dense Layout Rules)

- **Prinsip Kepadatan Informasi:** Tampilkan data finansial secara ringkas dan informatif. Prioritaskan daftar dan tabel dibanding kartu besar bertumpuk.
- **Tabel vs Cards:**
  - Gunakan baris tabel atau list yang rapi dengan pembatas tipis (`divide-y divide-slate-100`) untuk data riwayat transaksi.
  - **DILARANG** membungkus setiap baris transaksi ke dalam card terpisah dengan padding besar dan shadow tebal, karena membuang ruang vertikal layar.
  - Card hanya digunakan untuk ringkasan agregat (StatCard), kartu rekening/dompet, atau container utama pembungkus tabel/daftar.
- **Border Radius Terukur:**
  - Container utama & Modal: `rounded-2xl` atau `rounded-3xl`
  - Tombol CTA & Form Input: `rounded-xl`
  - Badge & Pill Status: `rounded-full` atau `rounded-lg`
  - Hindari menjadikan semua elemen berbentuk pill tanpa hierarki.

---

## 5. PWA & Standar Pengalaman Mobile (iOS Native Feel)

Aplikasi dirancang sebagai Progressive Web App (PWA) yang memberikan nuansa aplikasi native di genggaman pengguna ponsel (khususnya iOS & Android modern):

- **Safe Area Insets:**
  - Wajib memperhitungkan notch dan home bar pada perangkat modern menggunakan utilitas safe area:
    - `pt-safe`: Padding atas untuk header navigasi (`env(safe-area-inset-top)`).
    - `pb-safe`: Padding bawah untuk bottom bar dan modal sheet (`env(safe-area-inset-bottom)`).
    - `mb-safe`: Margin bawah penyeimbang konten.
- **Navigasi Dwi-Mode (Dual Navigation):**
  - **Mobile (< 768px):** Menggunakan *Fixed Bottom Tab Bar* (`fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-slate-200/80 pb-safe h-14`). Terdiri dari 4 navigasi inti: Ringkasan, Transaksi, Dompet, dan Anggaran.
  - **Desktop (>= 768px):** Menggunakan *Top Navigation Bar* (`sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-slate-200/80 pt-safe h-14 sm:h-16`) dengan menu horizontal dan info profil pengguna.
- **Pola Modal & Bottom Sheet:**
  - Pada layar ponsel, modal transaksi/tambah data harus tampil sebagai *Bottom Sheet* dari bawah layar dengan grab handle (`w-12 h-1.5 bg-slate-300 rounded-full`), `rounded-t-3xl`, dan `pb-safe`.
  - Pada layar tablet/desktop, modal tampil di tengah (`max-w-lg rounded-3xl`).
- **Mikrointeraksi & Taktil Sentuh:**
  - Terapkan kelas `ios-active-scale` (`active:scale-[0.96] active:opacity-85 transition-all duration-150`) pada setiap tombol, tautan navigasi, dan baris yang dapat diklik untuk memberi feedback taktil responsif.
  - Nonaktifkan highlight biru browser default: `-webkit-tap-highlight-color: transparent`.
  - Nonaktifkan seleksi teks tidak sengaja pada elemen interaktif: `user-select: none`.
  - Atur `overscroll-behavior-y: none` pada root dokumen agar tidak memicu scroll bounce janggal di iOS Safari.
- **Ukuran Target Sentuh (Touch Target):** Area interaksi minimal 44 × 44 px untuk semua kontrol sentuh mobile.

---

## 6. Formulir & Kontrol Input

- **Segmented Control:** Gunakan segmented control berpola pill untuk biner toggle (misal beralih antara "Pengeluaran" dan "Pemasukan") dengan warna latar kontras pada item aktif (`bg-rose-500` atau `bg-brand` dengan teks putih).
- **Prefix Nilai Uang:** Field input nominal wajib mencantumkan label `Rp` statis di sisi kiri input dengan padding yang memadai (`pl-11 pr-3.5`).
- **State Input:**
  - Default: Border `border-slate-200`, latar `bg-card` atau `bg-slate-50/50`.
  - Fokus: Bertransisi halus ke `bg-surface`, ring `focus:ring-2 focus:ring-brand`, `focus:outline-none`.

---

## 7. State API & Ketahanan Antarmuka (API State Resilience)

Setiap komponen yang berinteraksi dengan API wajib menangani 4 status siklus hidup secara tuntas:

1. **Loading State:**
   - Wajib menggunakan Skeleton Loader beranimasi halus (pulse ringan) dengan ukuran dan bentuk yang menyerupai konten asli.
   - Hindari spinner layar penuh yang membekukan interaksi pengguna.
2. **Empty State:**
   - Jika data kosong (belum ada transaksi, dompet, atau anggaran), wajib menampilkan:
     - Ikon visual relevan dari `lucide-vue-next` (warna muted `text-ink/40`).
     - Judul deskriptif singkat (contoh: "Belum Ada Transaksi").
     - Penjelasan ramah 1 kalimat yang memandu aksi.
     - Tombol CTA primer untuk langsung membuat data pertama kali ("Catat Transaksi Sekarang").
3. **Error State:**
   - Gunakan bahasa Indonesia yang manusiawi dan komunikatif (jangan tampilkan raw error seperti `Error: Request failed with status code 500`).
   - Sertakan tombol aksi "Coba Lagi" (*retry button*) atau langkah pemulihan yang jelas.
4. **Success / Feedback:**
   - Berikan feedback langsung saat aksi berhasil (misal: modal tertutup mulus, data di tabel bertambah seketika, atau toast feedback).

---

## 8. Standar Keahlian & Batasan Kualitas (Anti-Slop Boundaries)

- **Ikonografi Konsisten:** Gunakan pustaka resmi `lucide-vue-next` dengan ukuran proporsional (`w-4 h-4` untuk tombol/inline, `w-5 h-5` untuk navigasi). Hindari mencampuradukkan set ikon yang berbeda gaya.
- **Bebas Emoji Dekoratif:** DILARANG menaburkan emoji hiasan sembarangan pada judul, bullet point, atau tombol (contoh: jangan gunakan "💰 Keuangan", gunakan ikon Lucide `<Wallet />` yang profesional).
- **Glassmorphism Bertakar:** Efek backdrop blur (`backdrop-blur-md` / `backdrop-blur-xl`) dibatasi maksimal hanya pada header navigasi atas dan tab bar bawah. Permukaan card data dan form tetap solid agar teks terbaca tajam.
- **Kelengkapan Fungsional (C-2):** Setiap tombol, dropdown, filter, dan tab yang ada di layar harus memiliki fungsi aktif dan menangani interaksi nyata, bukan sekadar hiasan visual tanpa handler event.

