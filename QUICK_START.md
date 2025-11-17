# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### 1. Install & Run

```bash
cd csv-cleaner
bun install
bun run dev
```

Open http://localhost:3000 in your browser.

### 2. Test the App

1. **Upload File**: Drag `public/Sample Dataset.csv` into the upload zone
2. **See Results**: View the color-coded table and statistics
3. **Edit Data**: Double-click any red phone number to fix it
4. **Sort**: Click "Sort by Bundle" button
5. **Export**: Click "Download CSV" to get cleaned data

### 3. Expected Results

With Sample Dataset.csv:
- ✅ ~5000 rows processed instantly
- ✅ ~99% validation success rate
- ✅ Invalid entries clearly marked in red
- ✅ Duplicates highlighted in yellow
- ✅ Clean export ready in seconds

---

## 📋 Core Features Demo

### Feature 1: Smart Validation
Upload Sample Dataset.csv and notice:
- Row 7: `0t2s431243` (invalid - contains letters) → RED
- Row 37: `p718626672` (invalid - starts with letter) → RED
- Row 2: `2.54708E+11` (valid - converts from scientific notation) → GREEN

### Feature 2: Inline Editing
1. Double-click `0t2s431243` (row 7)
2. Change to `0722123456`
3. Press Enter
4. Watch it turn GREEN with Safaricom label

### Feature 3: Export
1. Check "Export only valid rows" (default)
2. See preview showing 4990+ rows will be exported
3. Click "Download CSV"
4. Open file - all phone numbers in perfect format!

---

## 🎯 Key Validation Examples

| Input | Output | Status |
|-------|--------|--------|
| `0722123456` | `+254722123456` | ✅ Valid (Safaricom) |
| `2.54708E+11` | `+254708000000` | ✅ Valid (Safaricom) |
| `733569097` | `+254733569097` | ✅ Valid (Airtel) |
| `0t2s431243` | N/A | ❌ Invalid (contains letters) |
| `p718626672` | N/A | ❌ Invalid (starts with letter) |

---

## 🐛 Troubleshooting

**Server won't start?**
```bash
lsof -ti:3000 | xargs kill -9
bun run dev
```

**Build errors?**
```bash
rm -rf .nuxt node_modules
bun install
```

**Still issues?**
Check that Bun is installed: `bun --version`

---

## 📚 More Documentation

- **README.md** - Full feature documentation
- **TESTING.md** - Complete testing checklist
- **DEPLOYMENT.md** - How to deploy
- **PROJECT_SUMMARY.md** - Technical details

---

**Need help?** Open an issue or contact Ish

**Ready to demo?** You're all set! 🎉

