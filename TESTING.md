# Testing Guide

## Manual Testing Checklist

### 1. Initial Load
- [ ] App loads at http://localhost:3000
- [ ] Header displays correctly with title "CSV Data Cleaner" and "by Ish"
- [ ] Upload zone is visible with drag-and-drop area
- [ ] Upload icon and instructions are clear

### 2. File Upload
- [ ] Drag and drop works
- [ ] Click to browse works
- [ ] Only accepts .csv files
- [ ] Shows error for non-CSV files
- [ ] Shows error for files > 10MB
- [ ] Shows loading state during processing
- [ ] Successfully parses Sample Dataset.csv

### 3. Data Display
After uploading Sample Dataset.csv:
- [ ] Stats summary shows correct totals
- [ ] Table displays all columns (Status, mobile, firstName, lastName, package, Actions)
- [ ] Rows are color-coded:
  - Green for valid rows
  - Red for invalid rows (e.g., row with "0t2s431243", "p718626672")
  - Yellow for duplicate phone numbers
- [ ] Error messages appear below invalid phone numbers

### 4. Phone Number Validation
Check these specific test cases from Sample Dataset.csv:

**Valid Numbers (should be green):**
- `793928485` → formatted to `+254793928485`
- `733569097` → formatted to `+254733569097`
- `717706000` → formatted to `+254717706000`

**Invalid Numbers (should be red with errors):**
- `0t2s431243` → "Phone number contains invalid characters"
- `p718626672` → "Phone number contains invalid characters"

**Scientific Notation (should convert and validate):**
- `2.54708E+11` → formatted to `+254708000000` (or similar)
- `2.54774E+11` → formatted to `+254774000000` (or similar)

### 5. Inline Editing
- [ ] Double-click a phone number cell
- [ ] Cell becomes editable with blue border
- [ ] Type a new phone number
- [ ] Press Enter or click outside
- [ ] Cell re-validates automatically
- [ ] Status badge updates (valid/invalid)
- [ ] Color coding updates

**Test Edit Cases:**
1. Edit invalid number to valid: `0t2s431243` → `0722123456`
   - Should turn green after save
2. Edit valid number to invalid: `733569097` → `abc123`
   - Should turn red with error message

### 6. Sorting
- [ ] Click "Sort by Bundle" button
- [ ] Rows sort by package size in descending order
- [ ] Largest bundle (5120) appears first
- [ ] Smallest bundle (50) appears last

### 7. Row Deletion
- [ ] Click delete icon (trash) on any row
- [ ] Confirmation dialog appears
- [ ] Click OK to delete
- [ ] Row is removed from table
- [ ] Stats update to reflect deletion
- [ ] Duplicate detection re-runs (yellow rows update if needed)

### 8. Export Functionality
- [ ] "Export only valid rows" checkbox is checked by default
- [ ] Export stats show correct counts
- [ ] Preview toggle works
- [ ] Preview shows first 5 rows in JSON format
- [ ] Click "Download CSV" button
- [ ] File downloads as `cleaned-Sample Dataset.csv`
- [ ] Open downloaded file in Excel/Numbers
- [ ] Verify only valid rows are included
- [ ] Verify phone numbers are in +2547XXXXXXXX format
- [ ] Verify no internal fields (_id, _status, etc.) are included

### 9. Clear Data
- [ ] Click "Clear Data" button
- [ ] Table disappears
- [ ] Upload zone reappears
- [ ] Can upload new file

### 10. Responsive Design
- [ ] Resize browser window
- [ ] Layout adjusts appropriately
- [ ] Table scrolls horizontally if needed
- [ ] All buttons remain accessible

### 11. Telco Identification
Check that valid phone numbers show telco in parentheses:
- [ ] 722xxxxxx shows (Safaricom)
- [ ] 733xxxxxx shows (Airtel)
- [ ] 770xxxxxx shows (Telkom)

## Expected Results with Sample Dataset.csv

Based on the sample data:
- **Total Records**: 5002 rows
- **Valid Records**: ~4990+ (most are valid)
- **Invalid Records**: ~10-12 (ones with letters like "0t2s431243", "p718626672")
- **Duplicates**: Several (e.g., multiple entries for same phone number)
- **Success Rate**: ~99%

## Known Issues (Expected Behavior)

1. **Scientific Notation**: Numbers like `2.54708E+11` are converted to regular format
2. **Number Portability**: Telco detection is approximate due to number portability
3. **Double-click Sensitivity**: May need to double-click precisely on the phone number text

## Performance Testing

With 5002 rows:
- [ ] File upload completes in < 2 seconds
- [ ] Table renders smoothly
- [ ] Sorting completes instantly
- [ ] Editing is responsive
- [ ] Export completes in < 1 second

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

## Automated Test Script

To run a quick validation test:

```bash
cd csv-cleaner
bun run dev
```

Then open http://localhost:3000 in your browser and follow the manual checklist above.

## Test Data Reference

Sample rows from the dataset:

| Row | Mobile | Status | Expected Result |
|-----|--------|--------|-----------------|
| 2 | 2.54708E+11 | Valid | +254708000000 |
| 7 | 0t2s431243 | Invalid | Contains invalid characters |
| 3 | 793928485 | Valid | +254793928485 |
| 37 | p718626672 | Invalid | Contains invalid characters |

## Success Criteria

✅ All manual test cases pass
✅ No console errors
✅ Smooth user experience
✅ Data validates correctly
✅ Export produces clean CSV
✅ All core requirements met

---

**Testing completed by**: ___________
**Date**: ___________
**Results**: ___________

