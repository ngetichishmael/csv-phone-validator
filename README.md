# CSV Phone Validator

> Smart CSV data cleaner with Kenya phone number validation, built with Nuxt 3 and TypeScript

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.2.1-00DC82?logo=nuxt.js)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2-000000?logo=bun)](https://bun.sh)

A production-ready web application that validates, cleans, and formats CSV data with focus on Kenya mobile phone number validation. Perfect for bulk SMS services, airtime distribution, and customer data management.

![CSV Phone Validator](https://img.shields.io/badge/Status-Production%20Ready-success)

## ✨ Features

### Core Functionality
- 📤 **CSV Upload**: Drag-and-drop or click to browse
- ✅ **Smart Phone Validation**: Validates and formats Kenya mobile numbers to `+2547XXXXXXXX`
- 🎨 **Visual Error Highlighting**: Color-coded rows (green=valid, red=invalid, yellow=duplicate)
- ✏️ **Inline Editing**: Double-click phone numbers to fix errors in real-time
- 📊 **Sort by Bundle Size**: One-click sorting by package/bundle column
- 💾 **Clean Data Export**: Download cleaned CSV with only valid rows

### Advanced Features
- 🔍 **Duplicate Detection**: Automatically identifies duplicate phone numbers
- 📈 **Real-time Statistics**: Live dashboard showing validation success rate
- 📱 **Telco Identification**: Detects Safaricom, Airtel, and Telkom numbers
- 🔬 **Scientific Notation Support**: Handles Excel's scientific notation (e.g., `2.54708E+11`)
- 🎯 **Smart Auto-Fix**: Handles leading zeros, missing prefixes, and various formats

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) 1.0+ installed
- Node.js 18+ (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/csv-phone-validator.git
cd csv-phone-validator

# Install dependencies
bun install

# Start development server
bun run dev
```

Visit **http://localhost:3000** and start cleaning your CSV files!

### Quick Test

1. Upload the included `public/Sample Dataset.csv` (5000+ rows)
2. See instant validation with color-coded results
3. Edit invalid numbers by double-clicking
4. Sort by bundle size
5. Export cleaned data

## 📖 Usage

### Phone Number Validation

The validator handles various input formats and standardizes them to `+2547XXXXXXXX`:

| Input Format | Output | Status |
|--------------|--------|--------|
| `0722123456` | `+254722123456` | ✅ Valid |
| `722123456` | `+254722123456` | ✅ Valid |
| `2.54708E+11` | `+254708000000` | ✅ Valid (Excel) |
| `+254 722 123 456` | `+254722123456` | ✅ Valid |
| `0t2s431243` | - | ❌ Invalid (contains letters) |
| `0622123456` | - | ❌ Invalid (wrong prefix) |

### Supported Formats

✅ With/without country code (+254, 254)  
✅ With/without leading zero (0722...)  
✅ Scientific notation (from Excel)  
✅ Various separators (spaces, dashes)  
✅ 7xx and 1xx prefixes (Kenya mobile)

### Validation Rules

- **Format**: `+2547XXXXXXXX` (12 digits total)
- **Prefixes**: Must start with 7 or 1 (Kenya mobile)
- **Length**: Exactly 9 digits after country code
- **Characters**: Digits only (no letters or special chars)

## 🏗️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com) (SPA mode)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **State**: Pinia
- **CSV Parser**: PapaParse
- **Validation**: Custom phone formatter
- **Package Manager**: Bun
- **Linting**: ESLint with Vue rules

## 📁 Project Structure

```
csv-phone-validator/
├── app/
│   ├── components/         # Vue components
│   │   ├── upload/        # File upload
│   │   ├── table/         # Data table with editing
│   │   ├── dashboard/     # Statistics
│   │   └── export/        # Export controls
│   ├── composables/       # Reusable logic
│   ├── stores/            # Pinia state
│   ├── utils/             # Phone formatter
│   └── types/             # TypeScript types
├── public/                # Static assets
└── test-validation.ts     # Test suite
```

## 🧪 Testing

Run the automated validation tests:

```bash
bun run test-validation.ts
```

**Expected results**: 14/14 tests passing ✅

Manual testing checklist available in [TESTING.md](TESTING.md)

## 📊 Performance

- **File Upload**: < 2 seconds for 5000+ rows
- **Validation**: Real-time processing
- **Sorting**: Instant (< 100ms)
- **Export**: < 1 second
- **Bundle Size**: ~150KB gzipped

## 🌍 Telco Detection

Automatically identifies mobile network operators (approximate due to number portability):

- **Safaricom**: 70x, 71x, 72x, 74x, 79x, 11x, 12x
- **Airtel**: 73x, 78x, 10x
- **Telkom**: 77x

## 📝 Development

```bash
# Development
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint

# Auto-fix linting issues
bun run lint:fix
```

## 🚢 Deployment

Deploy to:
- [Vercel](https://vercel.com) (recommended)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- Any static hosting

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📸 Screenshots

> Add screenshots here after deployment

## 🎯 Use Cases

- 📱 **Bulk SMS Services**: Validate phone numbers before sending
- 💳 **Airtime Distribution**: Clean customer data for top-ups
- 📊 **CRM Data Import**: Standardize phone numbers in customer database
- 🎁 **Marketing Campaigns**: Validate contact lists
- 📞 **Call Center Operations**: Clean and format phone databases

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ish**

- GitHub: [@yourusername](https://github.com/yourusername)
- Built for Peak Hackathon 2025

## 🙏 Acknowledgments

- Peak Hackathon organizers for the challenge
- Nuxt team for the amazing framework
- Open source community

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md)
- [Testing Guide](TESTING.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Project Summary](PROJECT_SUMMARY.md)

---

**⭐ Star this repo if you found it helpful!**

Made with ❤️ by Ish
