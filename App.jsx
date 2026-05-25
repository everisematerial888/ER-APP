// ============================================================================
//  EVERISE 智能進銷存管理系統 V2 — 完整版
//  Stack: React + Tailwind CSS + Lucide React + Firebase Firestore
//  作者: Senior Full-stack Engineer for Everise International Co., Ltd.
//  設計風格: 極簡高級風 (Celine / Dior) — 黑、白、灰主調
//  字體: 英數 Times New Roman；中文 標楷體 (BiaoKai)
// ============================================================================

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, FileText, Package, ClipboardList, TrendingUp,
  Upload, ScanLine, Search, Plus, Printer, Download, Trash2,
  ChevronDown, ChevronUp, X, Check, AlertCircle, Filter,
  Calendar, Tag, RotateCcw, Settings, FileSpreadsheet, Image as ImageIcon,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, getDocs, setDoc, addDoc,
  updateDoc, deleteDoc, query, orderBy, onSnapshot, where, writeBatch,
} from "firebase/firestore";
import { buildSeedTransactions } from "./src/seed-data.js";

// ============================================================================
//  Firebase 設定 — 請貼上您的 Firebase 金鑰
// ============================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID",
};
// 偵測 Firebase 是否真的設定 (避免空 config 覆蓋 seed 資料)
const FIREBASE_CONFIGURED = !String(firebaseConfig.apiKey).startsWith("YOUR_");
const app = FIREBASE_CONFIGURED ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const ROOT = "everise_system/shared"; // 全公司共用根路徑

// ============================================================================
//  Master Inventory — 來自雲端「庫存總覽」(2026/5/24 同步)
//  欄位：itemName, color, out2025, init2026, out2026, current2026,
//        safetyLevel, recommendedRestock, group(分類用), tag(CSK/AP/VP/CH/TST/PAT)
// ============================================================================
const MASTER_INVENTORY = [
  // 600 series PVC
  { itemName: "600x600 PVC", color: "Black", out2025: 0, init2026: 4678, out2026: 0, current2026: 4678 },
  { itemName: "600D-1 PVC", color: "Black", out2025: 3218, init2026: 2500, out2026: 0, current2026: 2500 },
  { itemName: "600D PVC FLAT", color: "Black", out2025: 11331, init2026: 1403, out2026: 0, current2026: 1403, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC FLAT", color: "Navy", out2025: 1198, init2026: 2355, out2026: 0, current2026: 2355, safetyLevel: 7000, recommendedRestock: 5000 },
  { itemName: "600D PVC FLAT", color: "R-Blue", out2025: 0, init2026: 3721, out2026: 0, current2026: 3721, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC FLAT", color: "Cream", out2025: 0, init2026: 4950, out2026: 0, current2026: 4950, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC FLAT", color: "Red", out2025: 2936, init2026: 0, out2026: 0, current2026: 0, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC FLAT", color: "F-Pink", out2025: 0, init2026: 3802, out2026: 0, current2026: 3802, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC FLAT", color: "White", out2025: 0, init2026: 8297, out2026: 1750, current2026: 6547, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC FLAT (AP)", color: "Blue", out2025: 1650, init2026: 1550, out2026: 150, current2026: 1400, safetyLevel: 20000, recommendedRestock: 10000, tag: "AP" },
  { itemName: "600D PVC", color: "Black", out2025: 46368, init2026: 6891, out2026: 4831, current2026: 2060, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC", color: "Navy", out2025: 5674, init2026: 3751, out2026: 750, current2026: 3001, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC", color: "R-Blue", out2025: 4860, init2026: 1365, out2026: 0, current2026: 1365, safetyLevel: 5000, recommendedRestock: 5000 },
  { itemName: "600D PVC", color: "Cream", out2025: 10188, init2026: 1145, out2026: 0, current2026: 1145, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC", color: "Red", out2025: 3763, init2026: 3499, out2026: 0, current2026: 3499, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC", color: "F-Pink", out2025: 500, init2026: 3406, out2026: 0, current2026: 3406, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC", color: "White", out2025: 7732, init2026: 2501, out2026: 50, current2026: 2451, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "600D PVC", color: "Coffee", out2025: 3614, init2026: 1120, out2026: 0, current2026: 1120 },
  { itemName: "600D PVC", color: "Yellow", out2025: 0, init2026: 11, out2026: 0, current2026: 11 },
  { itemName: "600D PVC", color: "D-Grey", out2025: 4431, init2026: 1301, out2026: 0, current2026: 1301 },
  { itemName: "600D PVC", color: "Green", out2025: 1750, init2026: 4949, out2026: 0, current2026: 4949 },
  { itemName: "600D PVC", color: "Orange", out2025: 0, init2026: 259, out2026: 0, current2026: 259 },
  { itemName: "600D PVC", color: "L-Grey", out2025: 0, init2026: 73, out2026: 0, current2026: 73 },
  { itemName: "600D PVC", color: "Pink", out2025: 0, init2026: 772, out2026: 0, current2026: 772 },
  { itemName: "600D PVC", color: "Sky Blue", out2025: 0, init2026: 1030, out2026: 0, current2026: 1030 },
  { itemName: "600D PVC", color: "L-Green", out2025: 0, init2026: 330, out2026: 0, current2026: 330 },
  { itemName: "600D PVC", color: "Purple", out2025: 0, init2026: 456, out2026: 0, current2026: 456 },
  { itemName: "600D PVC", color: "Blue", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "600D PVC", color: "S-Blue", out2025: 0, init2026: 72, out2026: 0, current2026: 72 },
  { itemName: "600D PVC", color: "White-Cream", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },

  // Cat Skin / CK
  { itemName: "Cat Skin", color: "Black", out2025: 0, init2026: 277, out2026: 0, current2026: 277 },
  { itemName: "CK", color: "Black", out2025: 3250, init2026: 3161, out2026: 850, current2026: 2311, safetyLevel: 3000, recommendedRestock: 3000 },

  // 210D PU
  { itemName: "210D PU", color: "Black", out2025: 0, init2026: 1865, out2026: 0, current2026: 1865 },
  { itemName: "210D PU*2", color: "Black", out2025: 194640, init2026: 56076, out2026: 19565, current2026: 36511, safetyLevel: 100000, recommendedRestock: 50000 },
  { itemName: "210D PU*2", color: "Coffee", out2025: 19950, init2026: 19259, out2026: 7950, current2026: 11309, safetyLevel: 10000, recommendedRestock: 15000 },
  { itemName: "210D PU*2", color: "White", out2025: 0, init2026: 4929, out2026: 0, current2026: 4929, safetyLevel: 10000, recommendedRestock: 9000 },
  { itemName: "210D PU*2", color: "Charcoal", out2025: 0, init2026: 1731, out2026: 0, current2026: 1731 },
  { itemName: "210D PU*2", color: "Khaki", out2025: 1200, init2026: 9429, out2026: 0, current2026: 9429 },
  { itemName: "210D PU*2", color: "L-Blue", out2025: 0, init2026: 6752, out2026: 0, current2026: 6752 },
  { itemName: "210D PU*2", color: "L-Grey", out2025: 0, init2026: 10571, out2026: 0, current2026: 10571 },
  { itemName: "210D PU*2", color: "L-Pink", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "210D PU*2", color: "Purple", out2025: 0, init2026: 1215, out2026: 0, current2026: 1215 },
  { itemName: "210D PU*2", color: "L-Purple", out2025: 0, init2026: 3465, out2026: 0, current2026: 3465 },
  { itemName: "210D PU 4", color: "Black", out2025: 0, init2026: 6713, out2026: 0, current2026: 6713 },
  { itemName: "210D PU A-class", color: "Black", out2025: 0, init2026: 10758, out2026: 0, current2026: 10758 },

  // 300D series
  { itemName: "300D PVC FLAT 0.4mm", color: "Black", out2025: 0, init2026: 2402, out2026: 0, current2026: 2402 },
  { itemName: "300D PVC FLAT 0.4mm", color: "L-Blue #8", out2025: 0, init2026: 105, out2026: 0, current2026: 105 },
  { itemName: "300D PVC FLAT 0.4mm", color: "Navy #2", out2025: 0, init2026: 511, out2026: 0, current2026: 511 },
  { itemName: "300D PVC FLAT 0.4mm", color: "D-Grey #5", out2025: 0, init2026: 429, out2026: 0, current2026: 429 },
  { itemName: "300D PVC FLAT 0.4mm", color: "Cream #7", out2025: 0, init2026: 105, out2026: 0, current2026: 105 },
  { itemName: "300D PVC FLAT 0.4mm", color: "Red #6", out2025: 0, init2026: 155, out2026: 0, current2026: 155 },
  { itemName: "300D PVC FLAT 0.4mm", color: "L-Grey #4", out2025: 0, init2026: 1538, out2026: 0, current2026: 1538 },
  { itemName: "300D PVC FLAT 0.4mm", color: "Yellow #9", out2025: 0, init2026: 200, out2026: 0, current2026: 200 },
  { itemName: "300D PVC FLAT 0.4mm", color: "R-Blue #3", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "300D PVC FLAT 0.4mm", color: "D-Coffee #11", out2025: 0, init2026: 1506, out2026: 0, current2026: 1506 },
  { itemName: "300D PVC FLAT 0.4mm", color: "Orange #10", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "300D-1 PVC FLAT 0.35mm", color: "Black", out2025: 14000, init2026: 3178, out2026: 0, current2026: 3178, safetyLevel: 2500, recommendedRestock: 2500 },
  { itemName: "300D-1 PVC FLAT 0.35mm", color: "Navy", out2025: 3574, init2026: 1055, out2026: 1500, current2026: -445, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "300D PVC FLAT 0.5mm", color: "Black", out2025: 4250, init2026: 2, out2026: 0, current2026: 2 },

  // 420D series
  { itemName: "420D PVC Flat", color: "Black", out2025: 1850, init2026: 4246, out2026: 0, current2026: 4246, safetyLevel: 5000, recommendedRestock: 5000 },
  { itemName: "420D PVC Flat", color: "Red", out2025: 0, init2026: 1596, out2026: 0, current2026: 1596, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "420D PVC Flat", color: "Navy", out2025: 0, init2026: 1291, out2026: 100, current2026: 1191, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "420D PVC Flat", color: "R-Blue", out2025: 450, init2026: 2654, out2026: 700, current2026: 1954, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "420D PVC Flat", color: "J-Green", out2025: 100, init2026: 0, out2026: 0, current2026: 0, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "420D PVC Flat", color: "F-Pink", out2025: 0, init2026: 0, out2026: 0, current2026: 0, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "420 PU*2", color: "Black", out2025: 0, init2026: 9698, out2026: 0, current2026: 9698 },
  { itemName: "420D Nylon 0.4", color: "Black", out2025: 2250, init2026: 2782, out2026: 3000, current2026: -218, safetyLevel: 2500, recommendedRestock: 2500 },
  { itemName: "420D Nylon 0.5", color: "Black", out2025: 20931, init2026: 8499, out2026: 4562, current2026: 3937, safetyLevel: 10000, recommendedRestock: 5000 },
  { itemName: "420D Nylon 0.5", color: "Navy", out2025: 4143, init2026: 2115, out2026: 750, current2026: 1365, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "420D Nylon 0.5", color: "R-Blue", out2025: 300, init2026: 458, out2026: 0, current2026: 458, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "420D Nylon 0.5", color: "Red", out2025: 372, init2026: 136, out2026: 0, current2026: 136, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "420D Nylon 0.5", color: "F-Pink 膠淺", out2025: 0, init2026: 500, out2026: 0, current2026: 500, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "420D Nylon 0.5", color: "F-Pink", out2025: 0, init2026: 2057, out2026: 0, current2026: 2057, safetyLevel: 1000, recommendedRestock: 1000 },

  // 1680D
  { itemName: "1680D Single", color: "Black", out2025: 11286, init2026: 4319, out2026: 2722, current2026: 1597, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "1680D Double", color: "Black", out2025: 0, init2026: 1115, out2026: 0, current2026: 1115, safetyLevel: 2000, recommendedRestock: 2000 },

  // 印花類
  { itemName: "Flower", color: "Flower", out2025: 4200, init2026: 1126, out2026: 600, current2026: 526, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "Checker", color: "Brown", out2025: 2250, init2026: 1276, out2026: 200, current2026: 1076, safetyLevel: 2500, recommendedRestock: 2500 },
  { itemName: "Checker", color: "YellowCoffee #3", out2025: 0, init2026: 0, out2026: 0, current2026: 0, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "Checker", color: "Grey", out2025: 1900, init2026: 1197, out2026: 200, current2026: 997, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "Checker", color: "White", out2025: 100, init2026: 138, out2026: 100, current2026: 38, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "Burberry", color: "Cream", out2025: 300, init2026: 685, out2026: 0, current2026: 685, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Burberry", color: "Coffee", out2025: 1000, init2026: 1193, out2026: 200, current2026: 993, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Burberry", color: "Khaki", out2025: 150, init2026: 1495, out2026: 0, current2026: 1495, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Burberry", color: "Pink", out2025: 0, init2026: 300, out2026: 0, current2026: 300, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Key", color: "CoffeeGold", out2025: 200, init2026: 1304, out2026: 0, current2026: 1304, safetyLevel: 2000, recommendedRestock: 2000 },

  // OO/CC/Thunder
  { itemName: "OO#11", color: "Coffee", out2025: 1750, init2026: 2316, out2026: 250, current2026: 2066, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "OO#12", color: "Grey", out2025: 4766, init2026: 1065, out2026: 750, current2026: 315, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "OO#13", color: "D-Coffee", out2025: 3650, init2026: 1416, out2026: 400, current2026: 1016, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "OO#14", color: "L-Coffee", out2025: 552, init2026: 963, out2026: 50, current2026: 913, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "CC", color: "D-Brown", out2025: 850, init2026: 869, out2026: 400, current2026: 469, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "CC", color: "Khaki", out2025: 950, init2026: 1302, out2026: 150, current2026: 1152, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "Thunder", color: "Coffee", out2025: 600, init2026: 300, out2026: 300, current2026: 0 },

  // MESH 類
  { itemName: "Bottle Mesh", color: "Black", out2025: 0, init2026: 5277, out2026: 0, current2026: 5277 },
  { itemName: "小方格 Rubber Net", color: "Black", out2025: 4500, init2026: 6050, out2026: 0, current2026: 6050, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "小方格 Rubber Net", color: "White", out2025: 0, init2026: 1000, out2026: 0, current2026: 1000 },
  { itemName: "小方格 Rubber Net", color: "Khaki", out2025: 0, init2026: 2023, out2026: 0, current2026: 2023 },
  { itemName: "洗衣袋 Cloth Mesh", color: "White", out2025: 0, init2026: 5335, out2026: 0, current2026: 5335 },
  { itemName: "洗衣袋 Cloth Mesh", color: "Black", out2025: 0, init2026: 4812, out2026: 0, current2026: 4812 },
  { itemName: "LV Flower Printed", color: "Black Gray", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "LV Flower Printed", color: "Coffee Gold", out2025: 100, init2026: 1117, out2026: 0, current2026: 1117 },

  // Sandwich Mesh 270G
  { itemName: "Sandwich Mesh 270G", color: "Black", out2025: 28720, init2026: 17076, out2026: 4000, current2026: 13076, safetyLevel: 7000, recommendedRestock: 5000 },
  // Sandwich Mesh 320G
  { itemName: "Sandwich Mesh 320G", color: "Black", out2025: 13500, init2026: 8585, out2026: 1000, current2026: 7585, safetyLevel: 10000, recommendedRestock: 10000 },
  { itemName: "Sandwich Mesh 320G", color: "Red", out2025: 450, init2026: 1304, out2026: 50, current2026: 1254, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Sandwich Mesh 320G", color: "White", out2025: 2600, init2026: 2310, out2026: 0, current2026: 2310, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "Sandwich Mesh 320G", color: "Yellow", out2025: 150, init2026: 959, out2026: 150, current2026: 809, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Sandwich Mesh 320G", color: "R-Blue", out2025: 800, init2026: 1910, out2026: 250, current2026: 1660, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Sandwich Mesh 320G", color: "D-Grey", out2025: 600, init2026: 3080, out2026: 2238, current2026: 842, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "Sandwich Mesh 320G", color: "F-Pink", out2025: 100, init2026: 907, out2026: 0, current2026: 907, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Orange", out2025: 50, init2026: 393, out2026: 0, current2026: 393, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Coffee", out2025: 550, init2026: 856, out2026: 0, current2026: 856, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "L-Green", out2025: 0, init2026: 668, out2026: 0, current2026: 668, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Khaki", out2025: 1482, init2026: 1525, out2026: 0, current2026: 1525, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Purple", out2025: 250, init2026: 704, out2026: 200, current2026: 504, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Pink", out2025: 1100, init2026: 769, out2026: 200, current2026: 569, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Navy", out2025: 100, init2026: 1547, out2026: 0, current2026: 1547, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "N-Green", out2025: 0, init2026: 775, out2026: 0, current2026: 775, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "L-Purple", out2025: 0, init2026: 1422, out2026: 0, current2026: 1422, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Baby Blue", out2025: 600, init2026: 742, out2026: 0, current2026: 742, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "L-Grey", out2025: 0, init2026: 1085, out2026: 100, current2026: 985, safetyLevel: 500, recommendedRestock: 500 },
  { itemName: "Sandwich Mesh 320G", color: "Green", out2025: 250, init2026: 962, out2026: 0, current2026: 962, safetyLevel: 500, recommendedRestock: 500 },

  // 305 / 385
  { itemName: "305 0.8mm", color: "Black", out2025: 7483, init2026: 6096, out2026: 80, current2026: 6016, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "385", color: "Black", out2025: 0, init2026: 1064, out2026: 0, current2026: 1064, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "385", color: "Brown", out2025: 0, init2026: 300, out2026: 0, current2026: 300 },
  { itemName: "385", color: "Tan", out2025: 0, init2026: 450, out2026: 0, current2026: 450 },
  { itemName: "385", color: "D-Coffee", out2025: 160, init2026: 776, out2026: 0, current2026: 776, safetyLevel: 1000, recommendedRestock: 1000 },

  // C4
  { itemName: "C4", color: "Black", out2025: 54309, init2026: 13563, out2026: 7644, current2026: 5919, safetyLevel: 10000, recommendedRestock: 5000 },
  { itemName: "C4", color: "White", out2025: 1160, init2026: 1938, out2026: 0, current2026: 1938, safetyLevel: 7000, recommendedRestock: 5000 },
  { itemName: "C4", color: "D-Coffee", out2025: 250, init2026: 3487, out2026: 0, current2026: 3487, safetyLevel: 5000, recommendedRestock: 5000 },
  { itemName: "C4", color: "Tan", out2025: 1938, init2026: 1654, out2026: 0, current2026: 1654, safetyLevel: 5000, recommendedRestock: 5000 },
  { itemName: "C4", color: "Camel", out2025: 2987, init2026: 1958, out2026: 0, current2026: 1958, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "C4", color: "Red", out2025: 1050, init2026: 1974, out2026: 800, current2026: 1174, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "C4", color: "Beige", out2025: 4224, init2026: 1589, out2026: 1000, current2026: 589, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "C4", color: "F-Pink", out2025: 100, init2026: 2443, out2026: 150, current2026: 2293, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "C4", color: "Cream", out2025: 50, init2026: 207, out2026: 0, current2026: 207, safetyLevel: 3000, recommendedRestock: 3000 },
  { itemName: "C4", color: "R-Blue", out2025: 2350, init2026: 1453, out2026: 550, current2026: 903, safetyLevel: 1500, recommendedRestock: 1500 },
  { itemName: "C4", color: "Navy", out2025: 300, init2026: 3145, out2026: 512, current2026: 2633, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "C4", color: "Orange", out2025: 100, init2026: 617, out2026: 100, current2026: 517, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "C4", color: "Sky Blue", out2025: 650, init2026: 1626, out2026: 0, current2026: 1626, safetyLevel: 2000, recommendedRestock: 2000 },
  { itemName: "C4", color: "Pink", out2025: 650, init2026: 175, out2026: 0, current2026: 175, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "C4", color: "L-Grey", out2025: 687, init2026: 448, out2026: 100, current2026: 348, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "C4", color: "Maroon", out2025: 570, init2026: 200, out2026: 0, current2026: 200, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "C4", color: "D-Cream", out2025: 662, init2026: 100, out2026: 150, current2026: -50, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "C4", color: "Yellow", out2025: 0, init2026: 2350, out2026: 0, current2026: 2350, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "C4", color: "Orange #21", out2025: 0, init2026: 150, out2026: 0, current2026: 150, safetyLevel: 1000, recommendedRestock: 1000 },
  { itemName: "C4", color: "Caramel", out2025: 1382, init2026: 1666, out2026: 0, current2026: 1666, safetyLevel: 1000, recommendedRestock: 1000 },

  // Nylon Mesh / Zippers
  { itemName: "Nylon Mesh", color: "Black", out2025: 100, init2026: 2900, out2026: 0, current2026: 2900 },
  { itemName: "Zipper#3", color: "Black #1", out2025: 0, init2026: 106000, out2026: 0, current2026: 106000 },
  { itemName: "Zipper#3", color: "Coffee #2", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "Zipper#3", color: "D-Grey #3", out2025: 0, init2026: 15000, out2026: 0, current2026: 15000 },
  { itemName: "Zipper#3", color: "Cream #4", out2025: 0, init2026: 6000, out2026: 0, current2026: 6000 },
  { itemName: "Zipper#3", color: "White #5", out2025: 0, init2026: 3000, out2026: 0, current2026: 3000 },
  { itemName: "Zipper#3", color: "L-Grey #6", out2025: 0, init2026: 18000, out2026: 0, current2026: 18000 },
  { itemName: "Zipper#3", color: "F-Pink #7", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "Yellow #8", out2025: 0, init2026: 6000, out2026: 0, current2026: 6000 },
  { itemName: "Zipper#3", color: "R-Blue #9", out2025: 0, init2026: 12000, out2026: 0, current2026: 12000 },
  { itemName: "Zipper#3", color: "Orange #10", out2025: 0, init2026: 18000, out2026: 0, current2026: 18000 },
  { itemName: "Zipper#3", color: "Pink #11", out2025: 0, init2026: 12000, out2026: 0, current2026: 12000 },
  { itemName: "Zipper#3", color: "D-Green #12", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "Purple #13", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "Apple Green #14", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "Blue #15", out2025: 0, init2026: 12000, out2026: 0, current2026: 12000 },
  { itemName: "Zipper#3", color: "Sky Blue #16", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "Turquoise #17", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "Camel #18", out2025: 0, init2026: 21000, out2026: 0, current2026: 21000 },
  { itemName: "Zipper#3", color: "L-Camel #19", out2025: 0, init2026: 12000, out2026: 0, current2026: 12000 },
  { itemName: "Zipper#5", color: "Black", out2025: 9000, init2026: 227000, out2026: 60000, current2026: 167000 },
  { itemName: "Zipper#5", color: "White #2", out2025: 0, init2026: 36000, out2026: 0, current2026: 36000 },
  { itemName: "Zipper#5", color: "D-Coffee #7", out2025: 0, init2026: 200000, out2026: 0, current2026: 200000 },
  { itemName: "Zipper#5", color: "Blue #4", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "Zipper#5", color: "R-Blue #5", out2025: 0, init2026: 6000, out2026: 0, current2026: 6000 },
  { itemName: "Zipper#5", color: "Water Blue #10", out2025: 0, init2026: 4000, out2026: 0, current2026: 4000 },
  { itemName: "Zipper#5", color: "Yellow #11", out2025: 0, init2026: 6000, out2026: 0, current2026: 6000 },
  { itemName: "Zipper#5", color: "Red #12", out2025: 0, init2026: 2000, out2026: 0, current2026: 2000 },
  { itemName: "Zipper#5", color: "Coffee #13", out2025: 0, init2026: 0, out2026: 0, current2026: 0 },
  { itemName: "Zipper#5", color: "L-Coffee #15", out2025: 0, init2026: 6000, out2026: 0, current2026: 6000 },
  { itemName: "Zipper#5", color: "Cream White #20", out2025: 0, init2026: 10000, out2026: 0, current2026: 10000 },
  { itemName: "Zipper#5", color: "Navy #21", out2025: 0, init2026: 2000, out2026: 0, current2026: 2000 },
  { itemName: "Zipper#5", color: "Green #22", out2025: 0, init2026: 14000, out2026: 0, current2026: 14000 },
  { itemName: "Zipper#5", color: "Coffee Gold", out2025: 0, init2026: 40000, out2026: 0, current2026: 40000 },
  { itemName: "Zipper#5", color: "Coffee Silver", out2025: 0, init2026: 12000, out2026: 0, current2026: 12000 },
  { itemName: "Zipper#5", color: "Black Gold", out2025: 0, init2026: 30000, out2026: 0, current2026: 30000 },
  { itemName: "Zipper#5", color: "Black Silver", out2025: 0, init2026: 2000, out2026: 0, current2026: 2000 },
  { itemName: "Zipper#5", color: "SPN退回 Yellow", out2025: 0, init2026: 3000, out2026: 0, current2026: 3000 },

  // 標記 (CSK/AP/VP/CH/TST/PAT) 獨立品項
  { itemName: "210D PU (CH)", color: "Black", out2025: 11100, init2026: 150, out2026: 0, current2026: 150, tag: "CH" },
  { itemName: "300D PVC A-CLASS 0.55 (CSK)", color: "Black", out2025: 12325, init2026: 3148, out2026: 2250, current2026: 898, safetyLevel: 2000, recommendedRestock: 2000, tag: "CSK" },
  { itemName: "300D PVC A-CLASS 0.55 (CSK)", color: "Navy", out2025: 1550, init2026: 1921, out2026: 150, current2026: 1771, safetyLevel: 2000, recommendedRestock: 2000, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Black", out2025: 16352, init2026: 13845, out2026: 5550, current2026: 8295, safetyLevel: 3000, recommendedRestock: 3000, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Navy", out2025: 4972, init2026: 9828, out2026: 3201, current2026: 6627, safetyLevel: 3000, recommendedRestock: 3000, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "R-Blue", out2025: 0, init2026: 500, out2026: 100, current2026: 400, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Red", out2025: 0, init2026: 500, out2026: 0, current2026: 500, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Beige", out2025: 0, init2026: 500, out2026: 0, current2026: 500, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "F-Pink", out2025: 0, init2026: 500, out2026: 0, current2026: 500, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Purple", out2025: 0, init2026: 500, out2026: 200, current2026: 300, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Burgundy", out2025: 0, init2026: 500, out2026: 0, current2026: 500, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "Orange", out2025: 0, init2026: 500, out2026: 50, current2026: 450, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "D-Green", out2025: 0, init2026: 500, out2026: 50, current2026: 450, tag: "CSK" },
  { itemName: "600x600D 0.6MM (CSK)", color: "D-Grey", out2025: 0, init2026: 500, out2026: 150, current2026: 350, tag: "CSK" },
  { itemName: "385 (PAT)", color: "Black", out2025: 0, init2026: 2233, out2026: 0, current2026: 2233, tag: "PAT" },
  { itemName: "385 (PAT)", color: "Brown", out2025: 0, init2026: 915, out2026: 0, current2026: 915, tag: "PAT" },
  { itemName: "Crack Face", color: "Black", out2025: 320, init2026: 3118, out2026: 480, current2026: 2638, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Crack Face", color: "Coffee", out2025: 1600, init2026: 2204, out2026: 284, current2026: 1920, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Crack Face", color: "Tan", out2025: 1200, init2026: 1577, out2026: 100, current2026: 1477, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Kevlar", color: "Black", out2025: 80, init2026: 1381, out2026: 80, current2026: 1301 },
  { itemName: "Kevlar", color: "Navy", out2025: 40, init2026: 1400, out2026: 0, current2026: 1400 },
  { itemName: "Lacoste", color: "Black", out2025: 1400, init2026: 1590, out2026: 320, current2026: 1270, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Lacoste", color: "Navy", out2025: 520, init2026: 480, out2026: 0, current2026: 480, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Lacoste", color: "Coffee", out2025: 520, init2026: 1055, out2026: 0, current2026: 1055, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Vaccum Checker", color: "Black", out2025: 1360, init2026: 1679, out2026: 200, current2026: 1479, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Vaccum Checker", color: "Navy", out2025: 200, init2026: 1345, out2026: 120, current2026: 1225, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Vaccum Checker", color: "D-Coffee", out2025: 400, init2026: 1158, out2026: 120, current2026: 1038, safetyLevel: 800, recommendedRestock: 800 },
  { itemName: "Composite Cloth", color: "Black", out2025: 1300, init2026: 9782, out2026: 0, current2026: 9782 },
  { itemName: "Composite Cloth", color: "Grey", out2025: 0, init2026: 2099, out2026: 0, current2026: 2099 },
  { itemName: "Composite Cloth", color: "Cream", out2025: 0, init2026: 2127, out2026: 0, current2026: 2127 },
  { itemName: "Composite Cloth", color: "J-Green", out2025: 0, init2026: 5725, out2026: 0, current2026: 5725 },
  { itemName: "Organza", color: "Black", out2025: 0, init2026: 11911, out2026: 0, current2026: 11911 },
  { itemName: "300D 0.5MM (TST)", color: "Black", out2025: 4361, init2026: 8877, out2026: 1500, current2026: 7377, safetyLevel: 3000, recommendedRestock: 3000, tag: "TST" },
  { itemName: "600D PVC (VP)", color: "Black", out2025: 19833, init2026: 10504, out2026: 4755, current2026: 5749, safetyLevel: 7000, recommendedRestock: 7000, tag: "VP" },
  { itemName: "600D PVC FLAT (VP)", color: "Black", out2025: 15241, init2026: 5157, out2026: 100, current2026: 5057, tag: "VP" },
];

// ============================================================================
//  業務常數 — Packaging Rules / Client Prefixes / Price Maps
// ============================================================================
// 預設布料每 Roll 數量 (Y/Roll)
const DEFAULT_ROLL = 50;
// 特殊包裝規則 (依品名關鍵字，匹配 substring，全大寫)
// 注意：先匹配長關鍵字以避免短關鍵字搶先
const PACKING_RULES = [
  // 210 PU 系列 150Y/Roll (含 210D PU / 210D PU*2 / 210D PU 4 / 210D PU A-class)
  { keyword: "210D PU", yardPerRoll: 150 },
  { keyword: "210 PU", yardPerRoll: 150 },
  // 40Y/Roll 特殊品項
  { keyword: "CRACK FACE", yardPerRoll: 40 },
  { keyword: "CHACK FACE", yardPerRoll: 40 },
  { keyword: "KEVLAR", yardPerRoll: 40 },
  { keyword: "LACOSTE", yardPerRoll: 40 },
  { keyword: "VACCUM", yardPerRoll: 40 },
  { keyword: "VACUUM", yardPerRoll: 40 },
  { keyword: "CHECKER", yardPerRoll: 40 },
  { keyword: "385", yardPerRoll: 40 },
  { keyword: "305", yardPerRoll: 40 },
];

// 客戶前綴 (自 SA App Master Table 同步)
const CLIENT_PREFIXES = [
  "AP", "APS", "CCHH", "CH", "CL", "CS", "CSK", "DP",
  "HEC", "HRR", "OC", "PAT", "PC", "PCR", "PV", "ROMA",
  "SPK", "SPN", "SRN", "SRR", "SU", "TC", "TNC", "TST",
  "WL", "WP", "ER",
];

// 客戶 SA 起始號 (CURRENT START 從 SA App 抓取)
const SA_START_NUMBERS = {
  AP: 955, APS: 860, CCHH: 137, CH: 276, CL: 300, CS: 125, CSK: 586,
  DP: 424, HEC: 22, HRR: 97, OC: 1, PAT: 29, PC: 241, PCR: 251,
  PV: 211, ROMA: 11, SPK: 2, SPN: 127, SRN: 345, SRR: 115, SU: 68,
  TC: 304, TNC: 838, TST: 67, WL: 285, WP: 274,
};

// ============================================================================
//  Sanitizer — 髒數據清洗大腦
// ============================================================================
/**
 * 處理匯入的髒數據字串，提取最終數字。
 * 規則：剝離英文字母、提取等號後最終數字、保留負號。
 * 範例：
 *   "50*23R+30Y=1180Y"  → 1180
 *   "-500T"             → -500
 *   "(23*50)+64"        → 1214 (計算)
 *   "100"               → 100
 */
function sanitizeQuantity(raw) {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "number") return Math.trunc(raw);
  let s = String(raw).trim();
  if (!s) return 0;
  // 1. 若含等號，取等號後段
  if (s.includes("=")) s = s.split("=").pop();
  // 2. 剝離英文字母 (保留 + - * / ( ) 數字 . 空白)
  s = s.replace(/[A-Za-z]+/g, "").trim();
  // 3. 處理括號與算式 (例如 "(23*50)+64")
  // 安全運算：只允許數字、+ - * / ( ) . 空白
  if (/^[0-9+\-*/().\s]+$/.test(s)) {
    try {
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict"; return (${s})`)();
      if (typeof v === "number" && isFinite(v)) return Math.round(v);
    } catch (e) { /* fallthrough */ }
  }
  // 4. 退而求其次：抓最後的有號數字
  const m = s.match(/-?\d+(\.\d+)?(?!.*\d)/);
  return m ? Math.round(parseFloat(m[0])) : 0;
}

// ============================================================================
//  Smart Quantity Parser — 用於請款單顯示
// ============================================================================
/**
 * 將純數字轉成算式字串供文件顯示。
 * 例：145 → "50*2R+45=145Y"
 *     1180 → "50*23R+30=1180Y"
 */
function parseQuantityForInvoice(itemName, qty) {
  const upper = String(itemName).toUpperCase();
  let yardPerRoll = DEFAULT_ROLL;
  for (const rule of PACKING_RULES) {
    if (upper.includes(rule.keyword)) { yardPerRoll = rule.yardPerRoll; break; }
  }
  const n = Math.abs(qty);
  if (!n) return "0Y";
  const rolls = Math.floor(n / yardPerRoll);
  const remainder = n - rolls * yardPerRoll;
  if (rolls === 0) return `${n}Y`;
  if (remainder === 0) return `${yardPerRoll}*${rolls}R=${n}Y`;
  return `${yardPerRoll}*${rolls}R+${remainder}=${n}Y`;
}

// ============================================================================
//  Financial Rounding — 泰銖計算 (無小數)
// ============================================================================
const thbRound = (n) => Math.round(n);

// ============================================================================
//  Item Key — 唯一識別 (品名+顏色)
// ============================================================================
const itemKey = (itemName, color) => `${(itemName || "").trim()}__${(color || "").trim()}`;

// ============================================================================
//  Inventory Calc — 動態庫存
//  公式：當前 = 期初 + 進貨 - 出貨 + 盤點差額 (略過 isVoided)
// ============================================================================
function calcCurrentStock(item, transactions) {
  const key = itemKey(item.itemName, item.color);
  let qty = item.init2026 || 0;
  for (const tx of transactions || []) {
    if (tx.isVoided) continue;
    if (itemKey(tx.itemName, tx.color) !== key) continue;
    if (tx.type === "IN") qty += tx.quantity;
    else if (tx.type === "OUT") qty -= tx.quantity;
    else if (tx.type === "AUDIT") qty += tx.diff || 0;
  }
  return qty;
}

// ============================================================================
//  Date helpers
// ============================================================================
const todayStr = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtDate = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
};

// ============================================================================
//  Global Styles
// ============================================================================
const fontEN = { fontFamily: "'Times New Roman', Times, serif" };
const fontZH = { fontFamily: "'BiaoKai', '標楷體', 'DFKai-SB', 'STKaiti', serif" };

// ============================================================================
//  Top-level App
// ============================================================================
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [inventory, setInventory] = useState(MASTER_INVENTORY);
  // 預載入雲端 order-tracking 出貨流水 (250+ 筆)
  const [transactions, setTransactions] = useState(() => buildSeedTransactions(sanitizeQuantity));
  const [invoices, setInvoices] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Firestore live sync (只在已設定金鑰時啟用，否則保留 seed) ----
  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !db) {
      console.info("[Everise] Firebase 未設定，使用本地 seed 資料 (230+ 筆出貨流水)");
      return;
    }
    try {
      const unsubT = onSnapshot(
        query(collection(db, `${ROOT}/transactions`), orderBy("date", "desc")),
        (snap) => setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );
      const unsubI = onSnapshot(
        query(collection(db, `${ROOT}/invoices`), orderBy("date", "desc")),
        (snap) => setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );
      const unsubM = onSnapshot(
        collection(db, `${ROOT}/mappings`),
        (snap) => setMappings(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );
      return () => { unsubT(); unsubI(); unsubM(); };
    } catch (e) {
      console.warn("Firestore 連線失敗，使用本地暫存模式。", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={fontEN}>
      <Header tab={tab} setTab={setTab} />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {tab === "dashboard" && <DashboardView inventory={inventory} transactions={transactions} invoices={invoices} />}
        {tab === "invoice" && <InvoiceView inventory={inventory} invoices={invoices} setInvoices={setInvoices} transactions={transactions} setTransactions={setTransactions} />}
        {tab === "inventory" && <InventoryView inventory={inventory} transactions={transactions} setTransactions={setTransactions} />}
        {tab === "restock" && <RestockReportView inventory={inventory} transactions={transactions} />}
        {tab === "shipping" && <ShippingRecordsView invoices={invoices} transactions={transactions} setTransactions={setTransactions} />}
        {tab === "incoming" && <IncomingRecordsView transactions={transactions} setTransactions={setTransactions} mappings={mappings} setMappings={setMappings} inventory={inventory} />}
        {tab === "import" && <CSVImportView inventory={inventory} mappings={mappings} setMappings={setMappings} setTransactions={setTransactions} />}
      </main>
      <Footer />
    </div>
  );
}

// ============================================================================
//  Header / Navigation
// ============================================================================
function Header({ tab, setTab }) {
  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", zh: "儀表板" },
    { id: "invoice", icon: FileText, label: "Invoice", zh: "請款單" },
    { id: "inventory", icon: Package, label: "Inventory", zh: "庫存盤點" },
    { id: "restock", icon: ClipboardList, label: "Restock Report", zh: "補貨參考單" },
    { id: "shipping", icon: TrendingUp, label: "Shipping", zh: "出貨紀錄" },
    { id: "incoming", icon: ScanLine, label: "Incoming", zh: "進貨紀錄" },
    { id: "import", icon: Upload, label: "Import", zh: "CSV 匯入" },
  ];
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-400">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center text-white text-lg" style={fontEN}>E</div>
          <div>
            <div className="text-lg tracking-[0.18em]" style={fontEN}>EVERISE</div>
            <div className="text-[10px] text-neutral-800 tracking-widest" style={fontEN}>INTELLIGENT INVENTORY · INVOICE SYSTEM</div>
          </div>
        </div>
        <div className="text-[11px] text-neutral-700 tracking-widest hidden md:block" style={fontEN}>
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit", weekday: "short" })}
        </div>
      </div>
      <nav className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 flex gap-1 overflow-x-auto border-t border-neutral-300">
        {tabs.map(({ id, icon: Icon, label, zh }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs tracking-widest border-b-2 transition-colors whitespace-nowrap
              ${tab === id ? "border-neutral-900 text-neutral-900 font-medium" : "border-transparent text-neutral-700 hover:text-neutral-900"}`}
          >
            <Icon size={14} />
            <span style={fontEN}>{label}</span>
            <span className="text-neutral-800" style={fontZH}>{zh}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-300 mt-12">
      <div className="max-w-[1440px] mx-auto px-6 py-5 text-[10px] tracking-widest text-neutral-700 flex justify-between" style={fontEN}>
        <span>EVERISE INTERNATIONAL CO., LTD. · CLOUD INVENTORY V2</span>
        <span>FIRESTORE · {ROOT}</span>
      </div>
    </footer>
  );
}

// ============================================================================
//  Reusable UI Atoms
// ============================================================================
function SectionTitle({ en, zh, action }) {
  return (
    <div className="flex items-end justify-between mb-6 pb-4 border-b-2 border-neutral-900">
      <div>
        <h2 className="text-2xl tracking-[0.16em] font-medium text-neutral-900" style={fontEN}>{en}</h2>
        <p className="text-sm text-neutral-800 mt-1 tracking-wide" style={fontZH}>{zh}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, zhLabel, value, unit, accent }) {
  return (
    <div className={`border ${accent ? "border-2 border-neutral-900 bg-neutral-50" : "border border-neutral-400"} p-5`}>
      <div className="text-[10px] tracking-[0.2em] text-neutral-900 font-medium" style={fontEN}>{label}</div>
      <div className="text-[11px] text-neutral-700 mt-0.5" style={fontZH}>{zhLabel}</div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl tracking-tight text-neutral-900 font-medium" style={fontEN}>{value}</span>
        {unit && <span className="text-xs text-neutral-700" style={fontEN}>{unit}</span>}
      </div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", className = "", style }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...fontEN, ...(style || {}) }}
      className={`w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-neutral-900 text-sm bg-white ${className}`}
    />
  );
}

function Select({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={fontEN}
      className={`w-full px-3 py-2 border border-neutral-300 focus:outline-none focus:border-neutral-900 text-sm bg-white ${className}`}
    >
      {options.map((o) => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.2em] bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-30`}
      style={fontEN}
    >
      {Icon && <Icon size={14} />}{children}
    </button>
  );
}

function GhostButton({ children, onClick, icon: Icon, active }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.15em] border ${
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
      } transition-colors`}
      style={fontEN}
    >
      {Icon && <Icon size={13} />}{children}
    </button>
  );
}

function Modal({ open, onClose, title, zhTitle, children, maxWidth = "max-w-3xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className={`bg-white ${maxWidth} w-full mt-12 mb-12 border border-neutral-300`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-400">
          <div>
            <h3 className="text-lg tracking-[0.15em]" style={fontEN}>{title}</h3>
            {zhTitle && <div className="text-xs text-neutral-700 mt-0.5" style={fontZH}>{zhTitle}</div>}
          </div>
          <button onClick={onClose} className="text-neutral-700 hover:text-neutral-900"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
//  Module 1 — DASHBOARD (儀表板)
// ============================================================================
function DashboardView({ inventory, transactions, invoices }) {
  const stats = useMemo(() => {
    const totalSKU = inventory.length;
    let totalYards = 0, belowSafety = 0, negative = 0;
    inventory.forEach((it) => {
      const stock = calcCurrentStock(it, transactions);
      totalYards += Math.max(stock, 0);
      if (it.safetyLevel && stock < it.safetyLevel) belowSafety++;
      if (stock < 0) negative++;
    });
    const ytdRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    return { totalSKU, totalYards, belowSafety, negative, ytdRevenue, invoiceCount: invoices.length };
  }, [inventory, transactions, invoices]);

  // 需補貨清單 (依安全水位)
  const restockList = useMemo(() => {
    return inventory
      .map((it) => ({ ...it, stock: calcCurrentStock(it, transactions) }))
      .filter((it) => it.safetyLevel && it.stock < it.safetyLevel)
      .sort((a, b) => (a.stock - a.safetyLevel) - (b.stock - b.safetyLevel))
      .slice(0, 12);
  }, [inventory, transactions]);

  return (
    <div>
      <SectionTitle en="DASHBOARD" zh="儀表板總覽" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="TOTAL SKU" zhLabel="品項總數" value={stats.totalSKU} />
        <StatCard label="TOTAL YARDS" zhLabel="總庫存碼數" value={stats.totalYards.toLocaleString()} unit="Y" />
        <StatCard label="BELOW SAFETY" zhLabel="低於安全水位" value={stats.belowSafety} accent />
        <StatCard label="NEGATIVE STOCK" zhLabel="負庫存" value={stats.negative} accent />
        <StatCard label="INVOICES" zhLabel="請款單張數" value={stats.invoiceCount} />
        <StatCard label="YTD THB" zhLabel="本年度泰銖" value={stats.ytdRevenue.toLocaleString()} unit="฿" />
      </div>

      <div className="mt-10">
        <h3 className="text-sm tracking-[0.2em] mb-4" style={fontEN}>RESTOCK SHORTLIST <span className="text-neutral-800 ml-2" style={fontZH}>建議優先補貨</span></h3>
        {restockList.length === 0 ? (
          <div className="text-neutral-700 text-sm py-8 text-center border border-dashed border-neutral-400">No items below safety level.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-[10px] tracking-[0.2em] text-neutral-700 border-b border-neutral-400" style={fontEN}>
                <th className="py-3 pr-4">#</th>
                <th className="py-3 pr-4">ITEM</th>
                <th className="py-3 pr-4">COLOR</th>
                <th className="py-3 pr-4 text-right">STOCK</th>
                <th className="py-3 pr-4 text-right">SAFETY</th>
                <th className="py-3 pr-4 text-right">DEFICIT</th>
                <th className="py-3 text-right">SUGGEST</th>
              </tr>
            </thead>
            <tbody>
              {restockList.map((it, i) => (
                <tr key={itemKey(it.itemName, it.color)} className="border-b border-neutral-300">
                  <td className="py-2.5 pr-4 text-neutral-700">{i + 1}</td>
                  <td className="py-2.5 pr-4">{it.itemName}</td>
                  <td className="py-2.5 pr-4">{it.color}</td>
                  <td className="py-2.5 pr-4 text-right">{it.stock.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-neutral-700">{it.safetyLevel.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-right text-red-600">{(it.stock - it.safetyLevel).toLocaleString()}</td>
                  <td className="py-2.5 text-right">{(it.recommendedRestock || 0).toLocaleString()} Y</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  Module 2 — INVOICE (新增 / 管理 請款單 SA)
// ============================================================================
function InvoiceView({ inventory, invoices, setInvoices, transactions, setTransactions }) {
  const [openNew, setOpenNew] = useState(false);
  const [filterPrefix, setFilterPrefix] = useState("ALL");
  const [filterOrigin, setFilterOrigin] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterPrefix !== "ALL" && inv.prefix !== filterPrefix) return false;
      if (filterOrigin !== "ALL" && inv.origin !== filterOrigin) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(inv.saNumber || "").toLowerCase().includes(s) && !(inv.client || "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [invoices, filterPrefix, filterOrigin, search]);

  // 動態跳號 — 計算下一個 SA 號 (依客戶前綴)
  function getNextNumber(prefix) {
    const sameClient = invoices.filter((i) => i.prefix === prefix);
    if (sameClient.length === 0) {
      const base = SA_START_NUMBERS[prefix];
      return base || 1;
    }
    const max = Math.max(...sameClient.map((i) => i.number || 0));
    return max + 1;
  }

  async function handleCreate(payload) {
    const next = getNextNumber(payload.prefix);
    const number = payload.number || next;
    const saNumber = `${payload.prefix}#${String(number).padStart(3, "0")}`;
    const totalAmount = payload.items.reduce((s, it) => s + thbRound(it.quantity * it.unitPrice), 0);
    const newInvoice = {
      saNumber, prefix: payload.prefix, number, client: payload.client, origin: payload.origin,
      date: payload.date, items: payload.items, totalAmount,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, `${ROOT}/invoices`), newInvoice);
    } catch (e) {
      console.warn("Firestore 寫入失敗，使用本地暫存。", e);
      setInvoices([{ id: `local-${Date.now()}`, ...newInvoice }, ...invoices]);
    }
    // 同步建立 OUT 交易紀錄
    for (const it of payload.items) {
      const tx = {
        date: payload.date, type: "OUT",
        itemName: it.itemName, color: it.color, quantity: it.quantity, rawQuantity: it.rawQuantity || String(it.quantity),
        client: payload.client, origin: payload.origin, invoiceNumber: saNumber, isVoided: false,
        createdAt: new Date().toISOString(),
      };
      try { await addDoc(collection(db, `${ROOT}/transactions`), tx); }
      catch (e) { setTransactions((arr) => [{ id: `local-${Date.now()}-${Math.random()}`, ...tx }, ...arr]); }
    }
    setOpenNew(false);
  }

  return (
    <div>
      <SectionTitle
        en="INVOICE LIST" zh="請款單 SA 管理"
        action={<PrimaryButton onClick={() => setOpenNew(true)} icon={Plus}>NEW SA</PrimaryButton>}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="w-44"><Select value={filterPrefix} onChange={setFilterPrefix} options={[{ value: "ALL", label: "All Clients" }, ...CLIENT_PREFIXES.map((p) => ({ value: p, label: p }))]} /></div>
        <div className="w-40"><Select value={filterOrigin} onChange={setFilterOrigin} options={[{ value: "ALL", label: "All Origins" }, { value: "CN", label: "China (CN)" }, { value: "ER", label: "Warehouse (ER)" }]} /></div>
        <div className="flex-1 min-w-[200px]"><TextInput value={search} onChange={setSearch} placeholder="Search SA# or Client..." /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-neutral-700 text-sm py-12 text-center border border-dashed border-neutral-400" style={fontEN}>
          No invoices yet. Click <b>NEW SA</b> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((inv) => (
            <InvoiceCard key={inv.id} inv={inv} />
          ))}
        </div>
      )}

      <Modal open={openNew} onClose={() => setOpenNew(false)} title="NEW SA INVOICE" zhTitle="新增請款單" maxWidth="max-w-5xl">
        <InvoiceForm
          inventory={inventory}
          onSubmit={handleCreate}
          getNextNumber={getNextNumber}
        />
      </Modal>
    </div>
  );
}

function InvoiceCard({ inv }) {
  return (
    <div className="border border-neutral-400 p-4 hover:border-neutral-900 transition-colors group">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base tracking-widest" style={fontEN}>{inv.saNumber}</div>
          <div className="text-xs text-neutral-700 mt-0.5" style={fontEN}>{inv.client} · {inv.origin}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-700" style={fontEN}>{fmtDate(inv.date)}</div>
          <div className="text-xs text-neutral-700" style={fontEN}>{(inv.items || []).length} ITEMS</div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-neutral-300 flex items-baseline justify-between">
        <div className="text-[10px] tracking-[0.2em] text-neutral-700" style={fontEN}>TOTAL THB</div>
        <div className="text-lg" style={fontEN}>฿{(inv.totalAmount || 0).toLocaleString()}</div>
      </div>
    </div>
  );
}

function InvoiceForm({ inventory, onSubmit, getNextNumber }) {
  const [prefix, setPrefix] = useState("APS");
  const [client, setClient] = useState("ER");
  const [origin, setOrigin] = useState("ER");
  const [date, setDate] = useState(todayStr());
  const [items, setItems] = useState([{ itemName: "", color: "", quantity: 0, rawQuantity: "", unitPrice: 0, packing: "" }]);

  const nextNo = getNextNumber(prefix);

  // 品名 options
  const itemNameOptions = useMemo(() => {
    const set = Array.from(new Set(inventory.map((i) => i.itemName)));
    return set.sort();
  }, [inventory]);

  function colorOptionsFor(name) {
    return inventory.filter((i) => i.itemName === name).map((i) => i.color);
  }

  function updateItem(i, patch) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    // 自動算數量
    if (patch.rawQuantity !== undefined) {
      next[i].quantity = sanitizeQuantity(patch.rawQuantity);
    }
    setItems(next);
  }

  function addRow() {
    setItems([...items, { itemName: "", color: "", quantity: 0, rawQuantity: "", unitPrice: 0, packing: "" }]);
  }
  function removeRow(i) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  const total = items.reduce((s, it) => s + thbRound((it.quantity || 0) * (it.unitPrice || 0)), 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>CLIENT PREFIX</div>
          <Select value={prefix} onChange={(v) => setPrefix(v)} options={CLIENT_PREFIXES} />
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>NEXT SA#</div>
          <div className="px-3 py-2 border border-neutral-400 bg-neutral-50 text-sm" style={fontEN}>{prefix}#{String(nextNo).padStart(3, "0")}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>CLIENT NAME</div>
          <TextInput value={client} onChange={setClient} placeholder="ER" />
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>ORIGIN</div>
          <Select value={origin} onChange={setOrigin} options={[{ value: "ER", label: "Warehouse (ER)" }, { value: "CN", label: "China Direct (CN)" }]} />
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>DATE</div>
          <TextInput type="date" value={date} onChange={setDate} />
        </div>
      </div>

      <div className="border-t border-neutral-400 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm tracking-[0.2em]" style={fontEN}>ITEMS</h4>
          <GhostButton onClick={addRow} icon={Plus}>ADD ROW</GhostButton>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-widest text-neutral-700 border-b border-neutral-400" style={fontEN}>
              <th className="py-2 pr-2">ITEM</th>
              <th className="py-2 pr-2">COLOR</th>
              <th className="py-2 pr-2">QTY (raw)</th>
              <th className="py-2 pr-2 text-right">QTY (Y)</th>
              <th className="py-2 pr-2">DISPLAY</th>
              <th className="py-2 pr-2 text-right">PRICE</th>
              <th className="py-2 pr-2 text-right">SUBTOTAL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const subtotal = thbRound((it.quantity || 0) * (it.unitPrice || 0));
              const display = it.itemName && it.quantity ? parseQuantityForInvoice(it.itemName, it.quantity) : "";
              return (
                <tr key={i} className="border-b border-neutral-300">
                  <td className="py-2 pr-2"><Select value={it.itemName} onChange={(v) => updateItem(i, { itemName: v, color: "" })} options={["", ...itemNameOptions]} /></td>
                  <td className="py-2 pr-2"><Select value={it.color} onChange={(v) => updateItem(i, { color: v })} options={["", ...colorOptionsFor(it.itemName)]} /></td>
                  <td className="py-2 pr-2"><TextInput value={it.rawQuantity} onChange={(v) => updateItem(i, { rawQuantity: v })} placeholder="50*23R+30=1180Y" /></td>
                  <td className="py-2 pr-2 text-right">{(it.quantity || 0).toLocaleString()}</td>
                  <td className="py-2 pr-2 text-xs text-neutral-800" style={fontEN}>{display}</td>
                  <td className="py-2 pr-2 text-right"><TextInput type="number" value={it.unitPrice} onChange={(v) => updateItem(i, { unitPrice: parseFloat(v) || 0 })} placeholder="0.00" /></td>
                  <td className="py-2 pr-2 text-right">฿{subtotal.toLocaleString()}</td>
                  <td className="py-2 pl-2"><button onClick={() => removeRow(i)} className="text-neutral-800 hover:text-red-600"><Trash2 size={14} /></button></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="py-3 text-right text-[10px] tracking-widest text-neutral-700" style={fontEN}>GRAND TOTAL</td>
              <td className="py-3 text-right text-lg" style={fontEN}>฿{total.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <PrimaryButton onClick={() => onSubmit({ prefix, client, origin, date, items, number: nextNo })} icon={Check}>SAVE SA</PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
//  Module 3 — INVENTORY (查看與盤點庫存)
// ============================================================================
function InventoryView({ inventory, transactions, setTransactions }) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("ALL");
  const [auditOpen, setAuditOpen] = useState(null); // 該品項
  const [showBelowSafetyOnly, setShowBelowSafetyOnly] = useState(false);

  const rows = useMemo(() => {
    return inventory.map((it) => {
      const stock = calcCurrentStock(it, transactions);
      return { ...it, stock };
    });
  }, [inventory, transactions]);

  const filtered = useMemo(() => {
    return rows.filter((it) => {
      if (filterTag !== "ALL") {
        if (filterTag === "STANDARD") { if (it.tag) return false; }
        else if (it.tag !== filterTag) return false;
      }
      if (showBelowSafetyOnly && (!it.safetyLevel || it.stock >= it.safetyLevel)) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(it.itemName + " " + it.color).toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rows, filterTag, search, showBelowSafetyOnly]);

  // 群組成 (品名 -> [顏色])
  const grouped = useMemo(() => {
    const m = new Map();
    filtered.forEach((it) => {
      if (!m.has(it.itemName)) m.set(it.itemName, []);
      m.get(it.itemName).push(it);
    });
    return m;
  }, [filtered]);

  return (
    <div>
      <SectionTitle en="INVENTORY" zh="庫存查詢與盤點" />

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="w-44">
          <Select value={filterTag} onChange={setFilterTag} options={[
            { value: "ALL", label: "All Tags" }, { value: "STANDARD", label: "Standard (無標)" },
            { value: "CSK", label: "CSK" }, { value: "AP", label: "AP" }, { value: "VP", label: "VP" },
            { value: "CH", label: "CH" }, { value: "TST", label: "TST" }, { value: "PAT", label: "PAT" },
          ]} />
        </div>
        <div className="flex-1 min-w-[200px]"><TextInput value={search} onChange={setSearch} placeholder="Search item or color..." /></div>
        <GhostButton onClick={() => setShowBelowSafetyOnly(!showBelowSafetyOnly)} active={showBelowSafetyOnly} icon={Filter}>BELOW SAFETY</GhostButton>
      </div>

      <div className="space-y-8">
        {[...grouped.entries()].map(([name, list]) => (
          <InventoryGroup key={name} name={name} list={list} onAudit={(it) => setAuditOpen(it)} />
        ))}
      </div>

      <Modal open={!!auditOpen} onClose={() => setAuditOpen(null)} title="AUDIT INVENTORY" zhTitle="盤點 — 僅輸入倉庫實際剩餘數量，系統自動算差額">
        {auditOpen && <AuditForm item={auditOpen} currentStock={auditOpen.stock} onSubmit={async (actual, note) => {
          const diff = actual - auditOpen.stock;
          const tx = {
            date: todayStr(), type: "AUDIT",
            itemName: auditOpen.itemName, color: auditOpen.color,
            quantity: Math.abs(diff), diff, rawQuantity: String(actual),
            isVoided: false, notes: note || "",
            createdAt: new Date().toISOString(),
          };
          try { await addDoc(collection(db, `${ROOT}/transactions`), tx); }
          catch (e) { setTransactions((arr) => [{ id: `local-${Date.now()}`, ...tx }, ...arr]); }
          setAuditOpen(null);
        }} />}
      </Modal>
    </div>
  );
}

function InventoryGroup({ name, list, onAudit }) {
  const [open, setOpen] = useState(true);
  const totalStock = list.reduce((s, it) => s + it.stock, 0);
  const hasLow = list.some((it) => it.safetyLevel && it.stock < it.safetyLevel);
  return (
    <div className="border border-neutral-400">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3 bg-neutral-50 hover:bg-neutral-100">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <span className="text-sm tracking-widest" style={fontEN}>{name}</span>
          <span className="text-xs text-neutral-700" style={fontEN}>· {list.length} COLORS · {totalStock.toLocaleString()} Y</span>
          {hasLow && <span className="text-[10px] tracking-widest text-red-600 ml-2" style={fontEN}>LOW STOCK</span>}
        </div>
      </button>
      {open && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-widest text-neutral-700 border-b border-neutral-400" style={fontEN}>
              <th className="py-2.5 pl-5 pr-3">COLOR</th>
              <th className="py-2.5 pr-3 text-right">INIT 2026</th>
              <th className="py-2.5 pr-3 text-right">IN</th>
              <th className="py-2.5 pr-3 text-right">OUT</th>
              <th className="py-2.5 pr-3 text-right">CURRENT</th>
              <th className="py-2.5 pr-3 text-right">SAFETY</th>
              <th className="py-2.5 pr-3 text-right">STATUS</th>
              <th className="py-2.5 pr-5 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => {
              const totalIn = 0; // 已在 stock 中計算，此處留欄位顯示 0 (細節在交易頁查)
              const totalOut = (it.out2026 || 0);
              const status = it.stock < 0 ? "NEGATIVE" : (it.safetyLevel && it.stock < it.safetyLevel ? "LOW" : "OK");
              return (
                <tr key={itemKey(it.itemName, it.color)} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="py-2.5 pl-5 pr-3" style={fontEN}>{it.color}</td>
                  <td className="py-2.5 pr-3 text-right" style={fontEN}>{(it.init2026 || 0).toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-right text-neutral-700" style={fontEN}>—</td>
                  <td className="py-2.5 pr-3 text-right text-neutral-700" style={fontEN}>{totalOut.toLocaleString()}</td>
                  <td className={`py-2.5 pr-3 text-right ${it.stock < 0 ? "text-red-600 font-medium" : ""}`} style={fontEN}>{it.stock.toLocaleString()}</td>
                  <td className="py-2.5 pr-3 text-right text-neutral-700" style={fontEN}>{it.safetyLevel ? it.safetyLevel.toLocaleString() : "—"}</td>
                  <td className="py-2.5 pr-3 text-right" style={fontEN}>
                    <span className={`text-[10px] tracking-widest ${
                      status === "OK" ? "text-emerald-600" : status === "LOW" ? "text-amber-600" : "text-red-600"
                    }`}>{status}</span>
                  </td>
                  <td className="py-2.5 pr-5 text-right">
                    <button onClick={() => onAudit(it)} className="text-[10px] tracking-widest border border-neutral-300 px-2 py-1 hover:border-neutral-900" style={fontEN}>AUDIT</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AuditForm({ item, currentStock, onSubmit }) {
  const [actual, setActual] = useState(currentStock);
  const [note, setNote] = useState("");
  const diff = (parseFloat(actual) || 0) - currentStock;
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700" style={fontEN}>ITEM</div>
          <div className="text-base" style={fontEN}>{item.itemName}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700" style={fontEN}>COLOR</div>
          <div className="text-base" style={fontEN}>{item.color}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>SYSTEM STOCK</div>
          <div className="px-3 py-2 border border-neutral-400 bg-neutral-50">{currentStock.toLocaleString()} Y</div>
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>ACTUAL COUNT</div>
          <TextInput type="number" value={actual} onChange={setActual} />
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>DIFFERENCE</div>
          <div className={`px-3 py-2 border ${diff === 0 ? "border-neutral-400 bg-neutral-50" : diff > 0 ? "border-emerald-500 text-emerald-700" : "border-red-500 text-red-700"}`}>
            {diff > 0 ? "+" : ""}{diff.toLocaleString()} Y
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>NOTE</div>
        <TextInput value={note} onChange={setNote} placeholder="盤點原因 / 備註" />
      </div>
      <div className="text-xs text-neutral-800 bg-neutral-50 px-3 py-2 mb-4" style={fontZH}>
        提交後系統會建立一筆 AUDIT 交易紀錄（差額：{diff}），<b>不會直接覆寫原數量</b>。可隨時作廢還原。
      </div>
      <div className="flex justify-end">
        <PrimaryButton onClick={() => onSubmit(parseFloat(actual) || 0, note)} icon={Check}>SUBMIT AUDIT</PrimaryButton>
      </div>
    </div>
  );
}

// ============================================================================
//  Module 4 — RESTOCK REPORT (補貨參考單 / 老闆版)
//  依據雲端「回報老闆補貨標準範例」格式：
//  項次 / 補貨參考數量 / 顏色 / 2025年出貨 / 2026年出貨 / 2026年庫存 /
//  已下訂單未出 / 實際庫存-庫存補貨標準 / 需補貨
// ============================================================================
function RestockReportView({ inventory, transactions }) {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [reportDate, setReportDate] = useState(todayStr());
  const [onOrderMap, setOnOrderMap] = useState({}); // {itemKey: number}

  // 有「安全水位」設定的品名才會在補貨參考單上
  const itemGroups = useMemo(() => {
    const set = new Set();
    inventory.forEach((it) => {
      if (it.safetyLevel) set.add(it.itemName);
    });
    return [...set].sort();
  }, [inventory]);

  useEffect(() => {
    if (!selectedGroup && itemGroups.length) setSelectedGroup(itemGroups[0]);
  }, [itemGroups]);

  const rows = useMemo(() => {
    if (!selectedGroup) return [];
    return inventory
      .filter((it) => it.itemName === selectedGroup && it.safetyLevel)
      .map((it, i) => {
        const stock = calcCurrentStock(it, transactions);
        const onOrder = parseFloat(onOrderMap[itemKey(it.itemName, it.color)] || 0);
        const actualVsStandard = stock - (it.safetyLevel || 0);
        const needRestock = actualVsStandard < 0;
        return {
          rank: i + 1,
          itemName: it.itemName,
          color: it.color,
          out2025: it.out2025 || 0,
          out2026: it.out2026 || 0,
          current2026: stock,
          recommendedRestock: it.recommendedRestock || 0,
          onOrder,
          actualVsStandard,
          needRestock,
        };
      });
  }, [selectedGroup, inventory, transactions, onOrderMap]);

  function handlePrint() { window.print(); }

  return (
    <div>
      <SectionTitle
        en="RESTOCK REPORT" zh="補貨參考單（老闆版）"
        action={<div className="flex gap-2">
          <GhostButton onClick={handlePrint} icon={Printer}>PRINT</GhostButton>
          <GhostButton onClick={() => exportRestockCSV(rows, selectedGroup, reportDate)} icon={Download}>EXPORT CSV</GhostButton>
        </div>}
      />

      <div className="flex flex-wrap items-center gap-3 mb-6 print:hidden">
        <div className="text-[10px] tracking-widest text-neutral-800" style={fontEN}>ITEM GROUP</div>
        <div className="w-72"><Select value={selectedGroup} onChange={setSelectedGroup} options={itemGroups} /></div>
        <div className="text-[10px] tracking-widest text-neutral-800 ml-4" style={fontEN}>REPORT DATE</div>
        <div className="w-44"><TextInput type="date" value={reportDate} onChange={setReportDate} /></div>
      </div>

      {/* Boss Report 主體 (列印用) */}
      <div className="bg-white border border-neutral-900 print:border-black">
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-900">
          <div>
            <div className="text-xl tracking-[0.2em]" style={fontEN}>{selectedGroup || "—"}</div>
            <div className="text-xs text-neutral-800 mt-1" style={fontZH}>規格 / 品項</div>
          </div>
          <div className="text-right">
            <div className="text-xs tracking-widest text-neutral-800" style={fontZH}>製表日期</div>
            <div className="text-base" style={fontEN}>{reportDate.replace(/-/g, "/")}</div>
          </div>
        </div>

        <table className="w-full text-sm" style={fontEN}>
          <thead>
            <tr className="border-b border-neutral-900 bg-neutral-100">
              <th className="px-3 py-3 text-center" style={fontZH}>項</th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>補貨<br />參考數量</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>顏色</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>2025年<br />出貨數量</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>2026年<br />出貨數量</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>2026年<br />庫存數量</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>已下訂單<br />未出數量Y</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>實際庫存 -<br />庫存補貨標準</span></th>
              <th className="px-3 py-3 text-center"><span style={fontZH}>需補貨</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-neutral-700">No items with safety level set.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.color} className="border-b border-neutral-300">
                <td className="px-3 py-3 text-center">{r.rank}</td>
                <td className="px-3 py-3 text-center">
                  <div>{r.recommendedRestock.toLocaleString()}</div>
                  <div className="text-[10px] text-neutral-800" style={fontZH}>補 {r.recommendedRestock.toLocaleString()}</div>
                </td>
                <td className="px-3 py-3 text-center">{r.color}</td>
                <td className="px-3 py-3 text-right">{r.out2025.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{r.out2026.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">{r.current2026.toLocaleString()}</td>
                <td className="px-3 py-3 text-right print:hidden">
                  <input
                    type="number"
                    className="w-20 border border-neutral-300 px-2 py-1 text-right text-sm"
                    style={fontEN}
                    value={onOrderMap[itemKey(r.itemName, r.color)] || ""}
                    onChange={(e) => setOnOrderMap({ ...onOrderMap, [itemKey(r.itemName, r.color)]: e.target.value })}
                  />
                </td>
                <td className="px-3 py-3 text-right hidden print:table-cell">{r.onOrder.toLocaleString()}</td>
                <td className={`px-3 py-3 text-right ${r.actualVsStandard < 0 ? "text-red-600 font-bold" : ""}`}>
                  {r.actualVsStandard.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-center">
                  {r.needRestock ? (
                    <span className="inline-block px-2 py-0.5 bg-neutral-900 text-white text-[10px] tracking-widest">YES</span>
                  ) : (
                    <span className="text-neutral-800 text-[10px] tracking-widest">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-neutral-800 mt-3" style={fontZH}>
        說明：庫存數量為「2026 期初 + 累計進貨 - 累計出貨 + 盤點差額」之動態值（略過作廢紀錄）。
        紅色數字＝實際庫存低於「庫存補貨標準（安全水位）」，建議下單補貨。
      </div>
    </div>
  );
}

function exportRestockCSV(rows, groupName, date) {
  const headers = ["項", "補貨參考數量", "顏色", "2025年出貨", "2026年出貨", "2026年庫存", "已下訂單未出", "實際庫存-補貨標準", "需補貨"];
  const lines = [
    `${groupName},,,,,,,,製表日期:${date}`,
    headers.join(","),
    ...rows.map((r) => [
      r.rank, r.recommendedRestock, r.color, r.out2025, r.out2026, r.current2026, r.onOrder, r.actualVsStandard, r.needRestock ? "YES" : "",
    ].join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RestockReport_${groupName}_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
//  Module 5 — SHIPPING RECORDS (出貨紀錄，含排序切換 + 作廢)
// ============================================================================
function ShippingRecordsView({ invoices, transactions, setTransactions }) {
  const [sortDir, setSortDir] = useState("desc"); // "desc": 新→舊；"asc": 舊→新
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("ALL");
  const [filterOrigin, setFilterOrigin] = useState("ALL");
  const [groupByContainer, setGroupByContainer] = useState(false);

  const outRecords = useMemo(() => {
    return transactions.filter((tx) => tx.type === "OUT");
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = outRecords.filter((tx) => {
      if (filterClient !== "ALL" && tx.client !== filterClient) return false;
      if (filterOrigin !== "ALL" && tx.origin !== filterOrigin) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${tx.itemName} ${tx.color} ${tx.invoiceNumber} ${tx.containerNumber || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });
    return list;
  }, [outRecords, sortDir, search, filterClient, filterOrigin]);

  async function toggleVoid(tx) {
    if (!confirm(tx.isVoided ? "確定要還原此紀錄？" : "確定要作廢此紀錄？")) return;
    try {
      await updateDoc(doc(db, `${ROOT}/transactions/${tx.id}`), { isVoided: !tx.isVoided });
    } catch (e) {
      setTransactions((arr) => arr.map((t) => (t.id === tx.id ? { ...t, isVoided: !t.isVoided } : t)));
    }
  }

  // 客戶選項從現有紀錄抽出
  const clientOptions = useMemo(() => {
    const set = new Set(outRecords.map((t) => t.client).filter(Boolean));
    return ["ALL", ...[...set].sort()];
  }, [outRecords]);

  return (
    <div>
      <SectionTitle
        en="SHIPPING RECORDS" zh="出貨紀錄"
        action={<div className="flex gap-2 items-center">
          <span className="text-[10px] tracking-widest text-neutral-700" style={fontEN}>SORT</span>
          <GhostButton onClick={() => setSortDir("desc")} active={sortDir === "desc"}>NEW → OLD</GhostButton>
          <GhostButton onClick={() => setSortDir("asc")} active={sortDir === "asc"}>OLD → NEW</GhostButton>
        </div>}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="w-44"><Select value={filterClient} onChange={setFilterClient} options={clientOptions.map((c) => ({ value: c, label: c === "ALL" ? "All Clients" : c }))} /></div>
        <div className="w-44"><Select value={filterOrigin} onChange={setFilterOrigin} options={[{ value: "ALL", label: "All Origins" }, { value: "CN", label: "China (CN)" }, { value: "ER", label: "Warehouse (ER)" }]} /></div>
        <div className="flex-1 min-w-[200px]"><TextInput value={search} onChange={setSearch} placeholder="Search item / color / SA# / C/NO..." /></div>
        <GhostButton onClick={() => setGroupByContainer(!groupByContainer)} active={groupByContainer} icon={Tag}>GROUP BY C/NO</GhostButton>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-neutral-700 border border-dashed border-neutral-400" style={fontEN}>
          No shipping records yet. Create an Invoice or upload a container to populate this list.
        </div>
      ) : groupByContainer ? (
        <GroupedShipping list={filtered} onVoid={toggleVoid} />
      ) : (
        <FlatShipping list={filtered} onVoid={toggleVoid} />
      )}
    </div>
  );
}

function FlatShipping({ list, onVoid }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[10px] tracking-widest text-neutral-700 border-b border-neutral-400" style={fontEN}>
          <th className="py-2.5 pr-3">DATE</th>
          <th className="py-2.5 pr-3">CLIENT</th>
          <th className="py-2.5 pr-3">C/NO</th>
          <th className="py-2.5 pr-3">SA#</th>
          <th className="py-2.5 pr-3">ITEM</th>
          <th className="py-2.5 pr-3">COLOR</th>
          <th className="py-2.5 pr-3 text-right">QTY (Y)</th>
          <th className="py-2.5 pr-3">ORIGIN</th>
          <th className="py-2.5 pr-3">STATUS</th>
          <th className="py-2.5 pr-3"></th>
        </tr>
      </thead>
      <tbody>
        {list.map((tx) => (
          <tr key={tx.id} className={`border-b border-neutral-50 ${tx.isVoided ? "opacity-40 line-through" : ""}`}>
            <td className="py-2.5 pr-3" style={fontEN}>{fmtDate(tx.date)}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.client || "—"}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.containerNumber || "—"}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.invoiceNumber || "—"}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.itemName}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.color}</td>
            <td className="py-2.5 pr-3 text-right" style={fontEN}>{(tx.quantity || 0).toLocaleString()}</td>
            <td className="py-2.5 pr-3 text-[10px] tracking-widest text-neutral-800" style={fontEN}>{tx.origin || "—"}</td>
            <td className="py-2.5 pr-3" style={fontEN}>
              <span className={`text-[10px] tracking-widest ${tx.isVoided ? "text-red-500" : "text-emerald-600"}`}>{tx.isVoided ? "VOID" : "ACTIVE"}</span>
            </td>
            <td className="py-2.5 pr-3 text-right">
              <button onClick={() => onVoid(tx)} className="text-[10px] tracking-widest text-neutral-700 hover:text-neutral-900" style={fontEN}>
                {tx.isVoided ? "RESTORE" : "VOID"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GroupedShipping({ list, onVoid }) {
  const grouped = useMemo(() => {
    const m = new Map();
    list.forEach((tx) => {
      const k = tx.containerNumber || "(無櫃號)";
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(tx);
    });
    return m;
  }, [list]);
  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([cno, txs]) => {
        const totalY = txs.reduce((s, t) => s + (t.isVoided ? 0 : t.quantity), 0);
        const date = txs[0]?.date;
        return (
          <div key={cno} className="border border-neutral-400">
            <div className="px-5 py-3 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm tracking-widest" style={fontEN}>{cno}</span>
                <span className="text-xs text-neutral-700" style={fontEN}>{fmtDate(date)} · {txs.length} ITEMS · {totalY.toLocaleString()} Y</span>
              </div>
            </div>
            <FlatShipping list={txs} onVoid={onVoid} />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
//  Module 6 — INCOMING RECORDS (進貨紀錄，含 OCR 圖檔辨識)
//  使用 Tesseract.js (CDN) 進行 OCR；解析 ER-XXX 容器格式
// ============================================================================
function IncomingRecordsView({ transactions, setTransactions, mappings, setMappings, inventory }) {
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const inRecords = useMemo(() => transactions.filter((t) => t.type === "IN"), [transactions]);
  const filtered = useMemo(() => {
    let list = inRecords.filter((t) => {
      if (search) {
        const s = search.toLowerCase();
        const hay = `${t.itemName} ${t.color} ${t.containerNumber || ""} ${t.client || ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });
    return list;
  }, [inRecords, search, sortDir]);

  async function toggleVoid(tx) {
    if (!confirm(tx.isVoided ? "確定要還原此紀錄？" : "確定要作廢此紀錄？")) return;
    try { await updateDoc(doc(db, `${ROOT}/transactions/${tx.id}`), { isVoided: !tx.isVoided }); }
    catch (e) { setTransactions((arr) => arr.map((t) => (t.id === tx.id ? { ...t, isVoided: !t.isVoided } : t))); }
  }

  async function saveParsedRows(rows, container, loadingDay) {
    for (const r of rows) {
      const tx = {
        date: loadingDay || todayStr(),
        type: "IN",
        itemName: r.itemName,
        color: r.color,
        quantity: r.quantity,
        rawQuantity: r.rawPacking || String(r.quantity),
        containerNumber: container,
        client: r.client,
        isVoided: false,
        createdAt: new Date().toISOString(),
      };
      try { await addDoc(collection(db, `${ROOT}/transactions`), tx); }
      catch (e) { setTransactions((arr) => [{ id: `local-${Date.now()}-${Math.random()}`, ...tx }, ...arr]); }
    }
    setUploadOpen(false);
  }

  return (
    <div>
      <SectionTitle
        en="INCOMING RECORDS" zh="進貨紀錄 (含圖檔 OCR 辨識)"
        action={<div className="flex gap-2">
          <GhostButton onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")} icon={RotateCcw}>
            {sortDir === "desc" ? "NEW → OLD" : "OLD → NEW"}
          </GhostButton>
          <PrimaryButton onClick={() => setUploadOpen(true)} icon={ScanLine}>UPLOAD & OCR</PrimaryButton>
        </div>}
      />

      <div className="mb-6">
        <TextInput value={search} onChange={setSearch} placeholder="Search container / item / color..." />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-neutral-700 border border-dashed border-neutral-400" style={fontEN}>
          No incoming records yet. Click <b>UPLOAD & OCR</b> to scan container manifests.
        </div>
      ) : (
        <FlatIncoming list={filtered} onVoid={toggleVoid} />
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="UPLOAD CONTAINER MANIFEST" zhTitle="上傳進貨單圖檔（OCR 辨識後寫入進貨流水）" maxWidth="max-w-5xl">
        <OCRUploader inventory={inventory} mappings={mappings} setMappings={setMappings} onSave={saveParsedRows} />
      </Modal>
    </div>
  );
}

function FlatIncoming({ list, onVoid }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[10px] tracking-widest text-neutral-700 border-b border-neutral-400" style={fontEN}>
          <th className="py-2.5 pr-3">LOADING DAY</th>
          <th className="py-2.5 pr-3">C/NO</th>
          <th className="py-2.5 pr-3">CLIENT TAG</th>
          <th className="py-2.5 pr-3">ITEM</th>
          <th className="py-2.5 pr-3">COLOR</th>
          <th className="py-2.5 pr-3 text-right">QTY (Y)</th>
          <th className="py-2.5 pr-3">PACKING (raw)</th>
          <th className="py-2.5 pr-3">STATUS</th>
          <th className="py-2.5 pr-3"></th>
        </tr>
      </thead>
      <tbody>
        {list.map((tx) => (
          <tr key={tx.id} className={`border-b border-neutral-50 ${tx.isVoided ? "opacity-40 line-through" : ""}`}>
            <td className="py-2.5 pr-3" style={fontEN}>{fmtDate(tx.date)}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.containerNumber || "—"}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.client || "—"}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.itemName}</td>
            <td className="py-2.5 pr-3" style={fontEN}>{tx.color}</td>
            <td className="py-2.5 pr-3 text-right" style={fontEN}>{(tx.quantity || 0).toLocaleString()}</td>
            <td className="py-2.5 pr-3 text-xs text-neutral-800" style={fontEN}>{tx.rawQuantity}</td>
            <td className="py-2.5 pr-3" style={fontEN}>
              <span className={`text-[10px] tracking-widest ${tx.isVoided ? "text-red-500" : "text-emerald-600"}`}>{tx.isVoided ? "VOID" : "ACTIVE"}</span>
            </td>
            <td className="py-2.5 pr-3 text-right">
              <button onClick={() => onVoid(tx)} className="text-[10px] tracking-widest text-neutral-700 hover:text-neutral-900" style={fontEN}>
                {tx.isVoided ? "RESTORE" : "VOID"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ----------------------------------------------------------------------------
//  OCRUploader — 使用 Tesseract.js (CDN) 進行 OCR
// ----------------------------------------------------------------------------
function OCRUploader({ inventory, mappings, setMappings, onSave }) {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [container, setContainer] = useState("");
  const [loadingDay, setLoadingDay] = useState(todayStr());
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [rawText, setRawText] = useState("");
  const [rows, setRows] = useState([]); // 解析後可編輯
  const fileRef = useRef(null);

  // 載入 Tesseract.js (從 CDN)
  useEffect(() => {
    if (window.Tesseract) return;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    document.head.appendChild(s);
  }, []);

  function handleFile(f) {
    setFile(f);
    if (previewURL) URL.revokeObjectURL(previewURL);
    setPreviewURL(URL.createObjectURL(f));
    setRawText(""); setRows([]); setProgress(0);
  }

  async function runOCR() {
    if (!file) return alert("請先選擇圖檔");
    if (!window.Tesseract) {
      alert("Tesseract.js 載入中，請稍後再試");
      return;
    }
    setBusy(true); setProgress(0);
    try {
      const { data } = await window.Tesseract.recognize(file, "eng", {
        logger: (m) => { if (m.progress) setProgress(Math.round(m.progress * 100)); }
      });
      setRawText(data.text);
      const parsed = parseManifestText(data.text, inventory, mappings);
      // 嘗試從文字解析容器號與裝櫃日
      const cnMatch = data.text.match(/ER[-\s]?(\d{3,4})/);
      if (cnMatch && !container) setContainer(`ER-${cnMatch[1]}`);
      const dayMatch = data.text.match(/Loading[\s\S]{0,15}?(\d{1,2})\/(\d{1,2})/i);
      if (dayMatch) {
        const m = parseInt(dayMatch[1]), d = parseInt(dayMatch[2]);
        const y = new Date().getFullYear();
        setLoadingDay(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
      }
      setRows(parsed);
    } catch (e) {
      console.error(e);
      alert("OCR 失敗：" + e.message);
    } finally {
      setBusy(false);
    }
  }

  function updateRow(i, patch) {
    const next = [...rows];
    next[i] = { ...next[i], ...patch };
    if (patch.rawPacking !== undefined) next[i].quantity = sanitizeQuantity(patch.rawPacking);
    setRows(next);
  }
  function removeRow(i) { setRows(rows.filter((_, idx) => idx !== i)); }
  function addRow() {
    setRows([...rows, { client: "ER", itemName: "", color: "", quantity: 0, rawPacking: "" }]);
  }

  function handleSubmit() {
    const valid = rows.filter((r) => r.itemName && r.color && r.quantity);
    if (valid.length === 0) return alert("沒有可儲存的有效列");
    onSave(valid, container, loadingDay);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="border-2 border-dashed border-neutral-300 p-6 text-center cursor-pointer hover:border-neutral-900" onClick={() => fileRef.current?.click()}>
          {previewURL ? (
            <img src={previewURL} alt="preview" className="max-h-80 mx-auto" />
          ) : (
            <div className="text-neutral-700">
              <ImageIcon size={32} className="mx-auto mb-2" />
              <div className="text-sm" style={fontEN}>Click to upload manifest image</div>
              <div className="text-xs mt-1" style={fontZH}>支援 JPG / PNG（建議解析度 1500px 以上）</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>CONTAINER NO.</div>
            <TextInput value={container} onChange={setContainer} placeholder="ER-659" />
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-neutral-700 mb-1" style={fontEN}>LOADING DAY</div>
            <TextInput type="date" value={loadingDay} onChange={setLoadingDay} />
          </div>
        </div>
        <div className="mt-3">
          <PrimaryButton onClick={runOCR} icon={ScanLine} disabled={busy || !file}>
            {busy ? `SCANNING... ${progress}%` : "RUN OCR"}
          </PrimaryButton>
        </div>
        {rawText && (
          <details className="mt-4 border border-neutral-400">
            <summary className="cursor-pointer px-3 py-2 text-xs text-neutral-800 bg-neutral-50">RAW OCR TEXT</summary>
            <pre className="px-3 py-2 text-[11px] whitespace-pre-wrap max-h-60 overflow-auto">{rawText}</pre>
          </details>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm tracking-[0.2em]" style={fontEN}>PARSED ROWS</h4>
          <GhostButton onClick={addRow} icon={Plus}>ADD</GhostButton>
        </div>
        {rows.length === 0 ? (
          <div className="text-neutral-700 text-sm py-10 text-center border border-dashed border-neutral-400" style={fontEN}>
            Run OCR to auto-fill rows, or click ADD to enter manually.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] tracking-widest text-neutral-700 border-b border-neutral-400" style={fontEN}>
                <th className="py-2 pr-2">CLIENT</th>
                <th className="py-2 pr-2">ITEM / COLOR</th>
                <th className="py-2 pr-2">PACKING</th>
                <th className="py-2 pr-2 text-right">QTY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-neutral-300">
                  <td className="py-1.5 pr-2"><TextInput value={r.client} onChange={(v) => updateRow(i, { client: v })} placeholder="ER" /></td>
                  <td className="py-1.5 pr-2">
                    <div className="flex flex-col gap-1">
                      <TextInput value={r.itemName} onChange={(v) => updateRow(i, { itemName: v })} placeholder="Item" />
                      <TextInput value={r.color} onChange={(v) => updateRow(i, { color: v })} placeholder="Color" />
                    </div>
                  </td>
                  <td className="py-1.5 pr-2"><TextInput value={r.rawPacking} onChange={(v) => updateRow(i, { rawPacking: v })} placeholder="(23*50)+64" /></td>
                  <td className="py-1.5 pr-2 text-right" style={fontEN}>{(r.quantity || 0).toLocaleString()}</td>
                  <td className="py-1.5 pl-2"><button onClick={() => removeRow(i)} className="text-neutral-800 hover:text-red-600"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {rows.length > 0 && (
          <div className="flex justify-end mt-4">
            <PrimaryButton onClick={handleSubmit} icon={Check}>SAVE TO INVENTORY</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

// 解析 ER-XXX 容器 OCR 文字 → 列陣列
// 期望行格式：CLIENT  ITEM/COLOR  ACTUAL_QTY  Y  PACKING
function parseManifestText(text, inventory, mappings) {
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  // 常見客戶 tag
  const CLIENT_TAGS = new Set([
    "ER", "ER(CSK)", "ER(VP)", "ER(PAT)", "ER(DP)", "ER(OC)",
    "APS", "AP", "SRR", "TC", "PC", "PCR", "HEC", "CH", "CL", "CS",
    "DP", "OC", "TST", "WL", "WP", "PV", "ROMA", "SPK", "SPN", "SRN",
    "SU", "TNC", "CSK", "PAT", "HRR", "CCHH", "VP", "CH", "HRR", "DP",
    "CL",
  ]);
  // 預先建立 itemKey 集
  const inventorySet = new Map();
  inventory.forEach((it) => {
    inventorySet.set(itemKey(it.itemName, it.color).toUpperCase(), it);
  });
  const out = [];
  for (const ln of lines) {
    // 尋找客戶 tag 開頭
    const tokens = ln.split(/\s{2,}|\t|,/).map((s) => s.trim()).filter(Boolean);
    if (tokens.length < 2) continue;
    const clientToken = tokens[0].toUpperCase().replace(/\s+/g, "");
    if (!CLIENT_TAGS.has(clientToken)) {
      // 嘗試在整行中辨識數字 + 品名
      const numMatch = ln.match(/([\d.,]+)\s*Y?\s*\(?([0-9*+\-\s]*)\)?/);
      if (!numMatch) continue;
      out.push({
        client: "",
        itemName: tokens[0],
        color: tokens[1] || "",
        rawPacking: tokens[tokens.length - 1] || "",
        quantity: sanitizeQuantity(numMatch[0]),
      });
      continue;
    }
    // 解析格式
    const rest = tokens.slice(1);
    // 假設後段為：[Item/Color, qty, Y, packing]
    // 數量在某一格
    let qtyIdx = -1;
    rest.forEach((t, i) => {
      if (/^\d[\d.,]*\.?\d*$/.test(t)) qtyIdx = i;
    });
    const itemColor = qtyIdx > 0 ? rest.slice(0, qtyIdx).join(" ") : rest[0];
    const packing = qtyIdx >= 0 ? rest.slice(qtyIdx + 1).join(" ") : "";
    const qty = qtyIdx >= 0 ? sanitizeQuantity(rest[qtyIdx]) : sanitizeQuantity(packing || rest[rest.length - 1]);
    // Item / Color 拆分
    let item = itemColor, color = "";
    const colorMatch = itemColor.match(/^(.+?)\s+(BLACK|WHITE|NAVY|R-BLUE|RED|BEIGE|F-PINK|PURPLE|BURGUNDY|ORANGE|D-GREEN|D-GREY|GREY|GREEN|CREAM|COFFEE|D-COFFEE|TAN|KHAKI|YELLOW|L-BLUE|L-GREY|L-PINK|L-PURPLE|L-GREEN|D-BROWN|BROWN|JADE GREEN|SKY-BLUE|SKY BLUE|MAROON|CARAMEL|D-CREAM|EGG-CREAM|NUDE|SHINY WHITE|SHINY YELLOW|JADE-GREEN|J-GREEN|COFFEE GOLD|BABY BLUE|N-GREEN|FLOWER|BLUE)([\s#\d]*)?$/i);
    if (colorMatch) {
      item = colorMatch[1].trim();
      color = (colorMatch[2] + (colorMatch[3] || "")).trim();
    }
    out.push({ client: clientToken, itemName: item, color, rawPacking: packing, quantity: qty });
  }
  return out;
}

// ============================================================================
//  Module 7 — CSV IMPORT (CSV 匯入配對)
// ============================================================================
function CSVImportView({ inventory, mappings, setMappings, setTransactions }) {
  const [csvText, setCsvText] = useState("");
  const [importType, setImportType] = useState("OUT"); // IN / OUT
  const [parsedRows, setParsedRows] = useState([]);
  const [unmapped, setUnmapped] = useState([]); // 未識別的品名
  const fileRef = useRef(null);

  function handleFile(f) {
    const reader = new FileReader();
    reader.onload = (e) => setCsvText(String(e.target.result || ""));
    reader.readAsText(f, "utf-8");
  }

  function parseCSV() {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return alert("CSV 內容為空");
    const headers = lines[0].split(",").map((s) => s.trim());
    const idxDate = headers.findIndex((h) => /date|日期/i.test(h));
    const idxItem = headers.findIndex((h) => /item|品名/i.test(h));
    const idxColor = headers.findIndex((h) => /color|顏色/i.test(h));
    const idxQty = headers.findIndex((h) => /qty|數量|quantity/i.test(h));
    const idxClient = headers.findIndex((h) => /client|客戶/i.test(h));
    const idxCNO = headers.findIndex((h) => /c\/?no|container|櫃號/i.test(h));
    const inventorySet = new Map();
    inventory.forEach((it) => inventorySet.set(itemKey(it.itemName, it.color), it));
    const dictMap = new Map(mappings.map((m) => [m.alias, { itemName: m.standardItemName, color: m.standardColor }]));

    const out = [], unknown = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((s) => s.trim());
      const rawItem = idxItem >= 0 ? cells[idxItem] : "";
      const rawColor = idxColor >= 0 ? cells[idxColor] : "";
      const aliasKey = `${rawItem}__${rawColor}`;
      let item = rawItem, color = rawColor;
      const k = itemKey(rawItem, rawColor);
      if (!inventorySet.has(k) && dictMap.has(aliasKey)) {
        item = dictMap.get(aliasKey).itemName;
        color = dictMap.get(aliasKey).color;
      } else if (!inventorySet.has(k)) {
        unknown.push({ rawItem, rawColor, row: cells, lineIdx: i });
        continue;
      }
      out.push({
        date: idxDate >= 0 ? cells[idxDate] : todayStr(),
        itemName: item, color, quantity: sanitizeQuantity(idxQty >= 0 ? cells[idxQty] : ""),
        client: idxClient >= 0 ? cells[idxClient] : "",
        containerNumber: idxCNO >= 0 ? cells[idxCNO] : "",
      });
    }
    setParsedRows(out);
    setUnmapped(unknown);
  }

  async function commitImport() {
    for (const r of parsedRows) {
      const tx = {
        date: r.date, type: importType, itemName: r.itemName, color: r.color,
        quantity: r.quantity, rawQuantity: String(r.quantity),
        client: r.client, containerNumber: r.containerNumber,
        isVoided: false, createdAt: new Date().toISOString(),
      };
      try { await addDoc(collection(db, `${ROOT}/transactions`), tx); }
      catch (e) { setTransactions((arr) => [{ id: `local-${Date.now()}-${Math.random()}`, ...tx }, ...arr]); }
    }
    alert(`已匯入 ${parsedRows.length} 筆 ${importType === "OUT" ? "出貨" : "進貨"}紀錄`);
    setParsedRows([]); setCsvText("");
  }

  async function saveMapping(idx, stdItem, stdColor) {
    const u = unmapped[idx];
    const map = {
      alias: `${u.rawItem}__${u.rawColor}`,
      standardItemName: stdItem, standardColor: stdColor,
      createdAt: new Date().toISOString(),
    };
    try { await addDoc(collection(db, `${ROOT}/mappings`), map); }
    catch (e) { setMappings((arr) => [{ id: `local-${Date.now()}`, ...map }, ...arr]); }
    setUnmapped(unmapped.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <SectionTitle en="CSV IMPORT" zh="CSV 匯入配對" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <GhostButton onClick={() => setImportType("OUT")} active={importType === "OUT"}>OUT 出貨</GhostButton>
            <GhostButton onClick={() => setImportType("IN")} active={importType === "IN"}>IN 進貨</GhostButton>
          </div>
          <div className="border-2 border-dashed border-neutral-300 p-6 text-center cursor-pointer" onClick={() => fileRef.current?.click()}>
            <FileSpreadsheet size={28} className="mx-auto text-neutral-700 mb-2" />
            <div className="text-sm" style={fontEN}>Click to upload CSV file</div>
            <div className="text-xs text-neutral-700 mt-1" style={fontZH}>欄位需含：日期 / 品名 / 顏色 / 數量 / 客戶 / 櫃號</div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="或直接貼上 CSV 內容…"
            className="w-full mt-3 px-3 py-2 border border-neutral-300 text-xs font-mono h-40"
            style={fontEN}
          />
          <div className="mt-3 flex gap-2">
            <PrimaryButton onClick={parseCSV} icon={Filter}>PARSE</PrimaryButton>
            {parsedRows.length > 0 && <PrimaryButton onClick={commitImport} icon={Check}>COMMIT ({parsedRows.length})</PrimaryButton>}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] mb-2" style={fontEN}>UNMAPPED ITEMS <span className="text-neutral-800 ml-2" style={fontZH}>未識別清單 — 手動配對至標準庫存</span></h4>
          {unmapped.length === 0 ? (
            <div className="text-neutral-700 text-sm py-10 text-center border border-dashed border-neutral-400" style={fontEN}>
              {parsedRows.length > 0 ? "All items mapped successfully." : "Parse a CSV to see results here."}
            </div>
          ) : (
            <div className="space-y-3">
              {unmapped.map((u, i) => (
                <UnmappedRow key={i} u={u} inventory={inventory} onSave={(item, color) => saveMapping(i, item, color)} />
              ))}
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm tracking-[0.2em] mb-2" style={fontEN}>MAPPED ROWS · {parsedRows.length}</h4>
              <div className="border border-neutral-400 max-h-80 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] tracking-widest text-neutral-700 border-b border-neutral-400 sticky top-0 bg-white" style={fontEN}>
                      <th className="py-2 px-3">DATE</th><th className="py-2 px-3">ITEM</th><th className="py-2 px-3">COLOR</th>
                      <th className="py-2 px-3 text-right">QTY</th><th className="py-2 px-3">CLIENT</th><th className="py-2 px-3">C/NO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 200).map((r, i) => (
                      <tr key={i} className="border-b border-neutral-50">
                        <td className="py-1.5 px-3" style={fontEN}>{r.date}</td>
                        <td className="py-1.5 px-3" style={fontEN}>{r.itemName}</td>
                        <td className="py-1.5 px-3" style={fontEN}>{r.color}</td>
                        <td className="py-1.5 px-3 text-right" style={fontEN}>{r.quantity}</td>
                        <td className="py-1.5 px-3" style={fontEN}>{r.client}</td>
                        <td className="py-1.5 px-3" style={fontEN}>{r.containerNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UnmappedRow({ u, inventory, onSave }) {
  const [item, setItem] = useState(u.rawItem);
  const [color, setColor] = useState(u.rawColor);
  const itemOptions = useMemo(() => [...new Set(inventory.map((i) => i.itemName))].sort(), [inventory]);
  const colorOptions = useMemo(() => inventory.filter((i) => i.itemName === item).map((i) => i.color), [item, inventory]);
  return (
    <div className="border border-neutral-400 p-3">
      <div className="text-xs text-neutral-700 mb-2" style={fontEN}>
        RAW: <b className="text-neutral-700">{u.rawItem} / {u.rawColor}</b>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={item} onChange={setItem} options={["", ...itemOptions]} />
        <Select value={color} onChange={setColor} options={["", ...colorOptions]} />
      </div>
      <div className="flex justify-end mt-2">
        <button onClick={() => onSave(item, color)} className="text-[10px] tracking-widest px-3 py-1 bg-neutral-900 text-white" style={fontEN}>
          SAVE MAPPING
        </button>
      </div>
    </div>
  );
}



