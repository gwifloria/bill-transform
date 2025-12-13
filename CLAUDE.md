# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application that transforms Alipay and WeChat CSV bill exports into a custom CSV format with categorization and member assignment. The app uses a drag-and-drop interface to process bill files client-side.

## Development Commands

```bash
# Start development server (runs on Vite)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Data Flow

1. **Upload**: User drags CSV/XLSX file into UploadFileBox component
2. **Parse**: PapaParse (CSV) or xlsx library (XLSX/XLS) parses file based on format and platform-specific config
3. **Transform**: Platform-specific handler processes data:
   - WeChat: Direct processing with formatHandler
   - Alipay: Additional aliHandler preprocessing (handles refunds, filters Yu'e Bao)
4. **Categorize**: Keywords matching via typesGroupByKeyWords
5. **Output**: Auto-download transformed CSV

### Platform-Specific Processing

**Alipay (aliHandler.ts:3-45)**:
- Extracts data from row index 22 (Alipay export format quirk where all data is in a single row)
- Splits multi-line cell data by `\n` delimiter to reconstruct proper rows
- Handles refund logic: matches "退款-[name]" entries with original transactions
- Filters Yu'e Bao (余额宝) transactions
- Subtracts refund amounts from original transaction values
- Filters out zero-value transactions after refund adjustment
- After preprocessing, uses `aliConfig.startIndex: 1` for further processing

**WeChat**:
- Simpler processing, uses `startIndex: 17` directly
- Direct field mapping without refund handling

### Configuration System (config.ts)

Each platform has distinct CSV structures defined by index mappings:
- `startIndex`: Row where actual transaction data begins
- `nameIdx`: Transaction name/description column
- `timeIndex`: Transaction timestamp column
- `valueIndex`: Transaction amount column
- `typeIdx`: Transaction type column

Parse configs handle encoding differences (Alipay uses GBK, WeChat uses default).

### Categorization (keywords.ts)

Keyword-based transaction categorization using string matching. Each keyword maps to a category array `[大类, 小类, detail?]`:
- "骑" → ["基本交通", "通勤", "单车"]
- "盒马" → ["购物消费", "超市"]

Keywords are sorted by length (longest first) via `sortedKeywords` to ensure specific matches take priority over general ones. The first matching keyword determines category.

### Context Architecture

Global state managed via React Context (context/index.tsx):
- `MyContext` provides current member name ("珏珏子" default)
- UserSelect component updates context via Radio buttons
- Member name is embedded in output CSV rows

## Key Files

- `src/components/CSVTransformer/UploadFileBox.tsx` - Main upload/transform logic
- `src/components/CSVTransformer/aliHandler.ts` - Alipay-specific preprocessing
- `src/components/CSVTransformer/config.ts` - Platform configurations
- `src/components/CSVTransformer/keywords.ts` - Category keyword mappings
- `src/components/userSelect/constants.ts` - Member list
- `src/context/index.tsx` - Global state for member selection

## Code Conventions

- TypeScript with strict mode enabled
- React functional components with hooks
- Ant Design (antd) component library with custom theme
- ESLint + Prettier for code quality (pre-commit hooks via Husky)
- Conventional commits enforced via commitlint

## Output Format

CSV header row (from `config.ts:title`):
```
[名称, 时间, 金额, null×4, 类型, 成员, 支出成员, 大类, 小类]
```

Data rows (from `UploadFileBox.tsx:formatHandler`):
```
[交易名称, 交易时间, 金额, null×3, 成员名, 成员名, 大类, 小类, detail]
```

Note: Header and data rows have slight column mismatch (4 vs 3 nulls). The null columns serve as spacing for the target spreadsheet format.
