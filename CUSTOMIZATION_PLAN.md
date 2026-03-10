# M&T Individual Loans Customization Plan

## Overview
This document outlines the changes needed to customize the M&T Growth Gateway application from a **group loan** focused system to an **individual loan** focused system.

## Current State
- Application is designed for group loans (multiple borrowers per loan)
- 30% flat interest rate hardcoded throughout
- Group-specific fields and UI elements
- References to "Group Loan" terminology

## Target State
- Focus on individual borrowers (one borrower per loan)
- Configurable interest rates per loan product
- Individual loan terminology
- Simplified application process without group fields

---

## Changes Required

### 1. **Terminology Updates**
Replace all references to "group loans" with "individual loans" or generic "loans"

**Files to modify:**
- `README.md` - Update business model description
- `APP_OVERVIEW.md` - Update core business logic section
- `src/pages/staff/LoanApplications.tsx` - Dialog titles, descriptions
- `src/pages/staff/ProductManagement.tsx` - Card titles and descriptions
- `src/pages/staff/ActiveLoans.tsx` - Comments and labels
- `src/pages/staff/LoanDetails.tsx` - Labels and descriptions
- `src/pages/staff/Reports.tsx` - Report labels

### 2. **Remove Group-Specific Fields**
Remove or hide group-related fields from the UI

**Fields to remove/hide:**
- `group_id`
- `group_name`
- `group_members`

**Files to modify:**
- `src/pages/staff/LoanApplications.tsx` - Remove group form fields
- `src/pages/staff/ActiveLoans.tsx` - Remove group columns
- `src/pages/staff/LoanDetails.tsx` - Remove group information display

### 3. **Interest Rate Configuration**
Make interest rates configurable instead of hardcoded at 30%

**Changes:**
- Update `ProductManagement.tsx` to allow configurable rates
- Modify loan calculation functions to use product-specific rates
- Update database queries to fetch rates from loan products

**Files to modify:**
- `src/pages/staff/ProductManagement.tsx` - Add rate configuration UI
- `src/pages/staff/LoanApplications.tsx` - Use dynamic rates
- `src/pages/staff/ActiveLoans.tsx` - Use dynamic rates
- `src/pages/staff/LoanDetails.tsx` - Use dynamic rates
- `src/pages/staff/Reports.tsx` - Display actual rates

### 4. **Loan Application Process**
Simplify the loan application to focus on individual borrowers

**Changes:**
- Remove "New Group Loan" button/dialog
- Update "New Application" to be individual-focused
- Simplify form fields to individual borrower only

**Files to modify:**
- `src/pages/staff/LoanApplications.tsx` - Simplify application form

### 5. **UI/UX Updates**
Update user interface elements to reflect individual loan focus

**Changes:**
- Update dashboard metrics labels
- Modify loan cards to show individual borrower info
- Update reports to focus on individual loan metrics

**Files to modify:**
- `src/pages/StaffDashboard.tsx` - Update metric labels
- `src/components/staff/*` - Update any group-specific components

### 6. **Documentation Updates**
Update all documentation to reflect the new business model

**Files to modify:**
- `README.md` - Complete rewrite of business model section
- `APP_OVERVIEW.md` - Update core business logic
- `QUICK_START.md` - Update examples if needed

---

## Implementation Priority

### Phase 1: Core Functionality (High Priority)
1. ✅ Update terminology in all user-facing text
2. ✅ Remove group-specific form fields
3. ✅ Make interest rates configurable

### Phase 2: UI/UX Polish (Medium Priority)
4. ✅ Update dashboard and reports
5. ✅ Simplify loan application workflow
6. ✅ Update loan details view

### Phase 3: Documentation (Low Priority)
7. ✅ Update README.md
8. ✅ Update APP_OVERVIEW.md
9. ✅ Update other documentation

---

## Testing Checklist

After implementation, verify:
- [ ] Can create individual loan applications
- [ ] Interest rates are configurable per product
- [ ] No group-specific fields appear in UI
- [ ] Loan calculations work correctly with dynamic rates
- [ ] Reports display correctly
- [ ] Dashboard shows accurate metrics
- [ ] All documentation is updated

---

## Notes
- Database schema may already support individual loans (verify `loan_applications` table)
- Existing group loan data should remain accessible (backward compatibility)
- Consider adding a "loan type" field to distinguish between individual and group loans if needed
