# WhatsApp Contacts Management Guide

## Overview
You can now manage WhatsApp contacts in 3 ways:
1. **Sync from Students** - Auto-import from your student database
2. **Add Manually** - Create contacts one by one
3. **Import from CSV** - Bulk upload using CSV files

## 1. Add Contacts Manually

### Steps:
1. Go to **WhatsApp → Campaigns**
2. Click **➕ Add Contact** button
3. Fill in the form:
   - **Name*** (required): Full name of contact
   - **Phone*** (required): WhatsApp number with country code
     - Format: `919876543210` (no + or spaces)
     - Must be 10-15 digits
   - **Type**: student, parent, guardian, or other
   - **Email** (optional): Contact email address
4. Click **Add Contact**

### Validations:
- ✅ Name and phone are mandatory
- ✅ Phone must be 10-15 digits (after removing spaces)
- ✅ Duplicate numbers are prevented per tenant
- ✅ Numbers are automatically cleaned (spaces/special chars removed)

---

## 2. Import Contacts from CSV

### CSV Format:
```csv
name,phone,type,email
John Doe,919876543210,student,john@example.com
Jane Parent,919876543211,parent,jane@example.com
Bob Guardian,919876543212,guardian,bob@example.com
```

### Steps:
1. Go to **WhatsApp → Campaigns**
2. Click **📄 Import CSV** button
3. Download the template CSV (optional)
4. Prepare your CSV file with the correct format
5. Select your CSV file
6. Click **Import CSV**
7. Review the import results

### Import Results:
- **Total**: Number of rows processed
- **Imported**: Successfully created contacts
- **Skipped**: Duplicates or invalid entries
- **Errors**: List of failed rows with error messages

### CSV Rules:
- ✅ First row must be header: `name,phone,type,email`
- ✅ Name and phone are required columns
- ✅ Phone numbers must include country code (e.g., 91 for India)
- ✅ Valid types: `student`, `parent`, `guardian`, `other`
- ✅ Email is optional
- ✅ Duplicates are automatically skipped
- ✅ Invalid phone numbers are rejected

### Example Import:
```
✅ Import completed: 45 imported, 5 skipped

Skipped entries:
- Row 3: Invalid phone number format
- Row 7: Contact already exists
- Row 12: Name is required
```

---

## 3. Sync from Student Database

### Steps:
1. Go to **WhatsApp → Campaigns**
2. Click **🔄 Sync Students** button
3. Wait for sync to complete
4. View synced contacts in the list

### Sync Behavior:
- Imports students with valid WhatsApp numbers
- Includes both student phone and parent phone
- Skips existing contacts (no duplicates)
- Updates metadata (class, section, etc.)

---

## 4. Delete Contacts

### Steps:
1. Find the contact in the campaigns list
2. Click the **🗑️** (trash) icon
3. Confirm deletion
4. Contact is permanently removed

### Important:
- ⚠️ Deleting a contact DOES NOT delete message history
- ⚠️ This only removes from the contacts list
- ⚠️ You can re-add the contact anytime

---

## API Endpoints

### Create Contact
```http
POST /api/whatsapp/contacts
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "John Doe",
  "phone": "919876543210",
  "type": "student",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "contact": {
    "_id": "...",
    "tenantId": "...",
    "name": "John Doe",
    "whatsappNumber": "919876543210",
    "type": "student",
    "email": "john@example.com"
  }
}
```

---

### Import Contacts from CSV
```http
POST /api/whatsapp/contacts/import
Content-Type: application/json
Authorization: Bearer {token}

{
  "contacts": [
    {
      "name": "John Doe",
      "phone": "919876543210",
      "type": "student",
      "email": "john@example.com"
    },
    {
      "name": "Jane Parent",
      "phone": "919876543211",
      "type": "parent"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed: 2 imported, 0 skipped",
  "results": {
    "total": 2,
    "imported": 2,
    "skipped": 0,
    "errors": []
  }
}
```

---

### Delete Contact
```http
DELETE /api/whatsapp/contacts/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## Best Practices

### Phone Number Format:
✅ **Correct**: `919876543210` (country code + number, no spaces)
❌ **Wrong**: `+91 98765 43210`, `9876543210`, `+919876543210`

### CSV Tips:
- Use Excel or Google Sheets to create CSV
- Keep formatting simple (no special formatting)
- Test with a small batch first (10-20 contacts)
- Check the error report after import
- Save the CSV template for future use

### Contact Management:
- Regularly sync from student database for updates
- Use CSV import for bulk additions (new batches)
- Add contacts manually for quick one-off additions
- Delete outdated or wrong contacts to keep list clean

---

## Troubleshooting

### "Contact already exists" Error
- Contact with this phone number already exists for your tenant
- Check the campaigns page - contact might be there
- If needed, delete the old contact first, then re-add

### "Invalid phone number format" Error
- Phone must be 10-15 digits
- Include country code (e.g., 91 for India)
- Remove spaces, dashes, and special characters
- Format: `919876543210` not `+91 98765 43210`

### CSV Import Fails
- Check CSV format matches template exactly
- Ensure first row is header: `name,phone,type,email`
- No empty rows in the middle of data
- Save as CSV (not Excel .xlsx)
- Use UTF-8 encoding

### Contact Not Receiving Messages
- Verify phone number format is correct
- Check if number is registered on WhatsApp
- Add number to Meta's test recipients list (for testing)
- Ensure WhatsApp config is saved and active

---

## Feature Summary

| Feature | Description | Location |
|---------|-------------|----------|
| Manual Add | Create individual contacts | Campaigns → ➕ Add Contact |
| CSV Import | Bulk upload from file | Campaigns → 📄 Import CSV |
| Sync Students | Auto-import from database | Campaigns → 🔄 Sync Students |
| Delete | Remove unwanted contacts | Campaigns → 🗑️ icon |
| Search | Find contacts by name/phone | Campaigns → Search box |
| Filter | Select contacts for campaigns | Campaigns → Checkboxes |

---

## Next Steps
1. **Add your first contacts** using manual form or CSV import
2. **Test messaging** by sending to a small group
3. **Sync regularly** from student database for updates
4. **Monitor reports** to track message delivery

Need help? Contact support or check the main WhatsApp module documentation.
