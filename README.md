# EVERISE 智能進銷存管理系統 V2

極簡高級風（Celine / Dior）── React SPA · Firebase Firestore · Tailwind CSS

## 七大模組

1. **Dashboard 儀表板** — 即時統計、低庫存警示、優先補貨清單
2. **Invoice 請款單 SA** — 客戶前綴自動跳號、智能數量解析（50Y/Roll、210PU 150Y、Crack/Lacoste/Vaccum/Checker/305/385 40Y）、Math.round 泰銖計算
3. **Inventory 庫存盤點** — 即時計算動態庫存（期初+進貨-出貨+盤點）、AUDIT 不覆寫原值、僅紀錄差額
4. **Restock Report 補貨參考單（老闆版）** ★ 新模組 — 完全對照雲端「回報老闆補貨標準範例」格式（項次／補貨參考數量／顏色／2025出貨／2026出貨／2026庫存／已下訂單未出／實際庫存-補貨標準／需補貨），可列印、可匯出 CSV
5. **Shipping Records 出貨紀錄** ★ 升級 — 排序可切換（新→舊／舊→新），可依櫃號分組，可作廢/還原
6. **Incoming Records 進貨紀錄** ★ 新模組 — 上傳容器手寫單／列印單圖檔，Tesseract.js OCR 自動辨識 → 解析為品名/顏色/數量/櫃號/客戶／可手動校正後寫入流水
7. **CSV Import** — 上傳 CSV、自動配對標準庫存、未識別清單手動配對寫入 Mapping Dict

## 一鍵部署

支援平台：Bolt.new · Lovable · stackblitz · Vercel · Netlify

1. 把整個資料夾複製進你的平台專案。
2. 在 `App.jsx` 頂部填入你的 `firebaseConfig`：

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

3. Firestore 路徑：所有讀寫都指向 `everise_system/shared/...`（全公司共用、即時同步、無綁定 uid）。

## 重要邏輯

### Sanitizer（髒數據清洗大腦）
- `50*23R+30Y=1180Y` → `1180`
- `-500T` → `-500`
- `(23*50)+64` → `1214`
- `145` → `145`

### parseQuantityForInvoice（請款單顯示用）
- 預設 `50Y/Roll`，將 `145` 顯示為 `50*2R+45=145Y`
- 含 `210 PU` 改 `150Y/Roll`
- 含 `CRACK FACE / KEVLAR / LACOSTE / VACCUM / CHECKER / 385 / 305` 改 `40Y/Roll`

### 財務四捨五入
- CSV 單價完整保留小數
- 小計／總計強制 `Math.round(qty * price)`

### 動態 C/NO 跳號
- 依客戶前綴跳號（如 `SRR#115` → `SRR#116`）
- 新客戶以 `NEW#001` 補零起跳
- 從 SA App 同步 27 個既有客戶的 CURRENT START

### 安全作廢 & 年度結轉
- 作廢只標記 `isVoided: true`，可隨時還原
- 年底結算時將 `current2026` 結轉為新年度 `initQty`

## 資料來源

期初與既有出貨數量取自雲端「庫存總覽」(`12...3FZtmpZikcRYzhTk`)，內建 190+ 個品名/顏色組合。
含 `(CSK)`／`(AP)`／`(VP)`／`(CH)`／`(TST)`／`(PAT)` 標記之品項皆為獨立識別。

## 列印與匯出

補貨參考單／請款單支援瀏覽器列印（已內建 print stylesheet，自動隱藏導覽列、A4 橫向、12mm 邊界）。
