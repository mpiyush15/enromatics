# Attendance CSV Upload Format

## Overview
Upload bulk attendance data from biometric machines or manual records using CSV files.

## CSV Format Requirements

### Required Columns:
1. **rollNumber** - Student's roll number (e.g., BA001, MO015)
2. **status** - Attendance status

### Optional Columns:
3. **remarks** - Additional notes about attendance

### Valid Status Values:
- `present` - Student was present
- `absent` - Student was absent
- `late` - Student arrived late
- `excused` - Student had excused absence

## Sample CSV Format

```csv
rollNumber,status,remarks
BA001,present,On time
BA002,absent,Sick leave
BA003,late,Arrived 15 minutes late
BA004,present,
MO001,excused,Medical emergency
MO002,present,On time
```

## Important Notes

1. **Case Insensitive**: Column names and status values are case-insensitive
   - `rollNumber`, `RollNumber`, `ROLLNUMBER` all work
   - `present`, `Present`, `PRESENT` all work

2. **Default Status**: If status is missing or invalid, defaults to "present"

3. **File Size**: Maximum file size is 5MB

4. **Roll Numbers**: Must match existing student roll numbers in your institute
   - Students not found in database will be reported in the upload summary

5. **Date**: Attendance will be marked for the date selected in the UI

6. **Overwrite**: Uploading CSV for the same date will update existing attendance records

## Alternative Column Names Supported

The system supports these alternative column names for flexibility:
- Roll Number: `rollNumber`, `RollNumber`, `roll_number`, `ROLLNUMBER`
- Status: `status`, `Status`, `STATUS`
- Remarks: `remarks`, `Remarks`, `REMARKS`

## Upload Process

1. Click "Upload CSV" button on the attendance page
2. Select your attendance date
3. Choose your CSV file (must be .csv format)
4. Review the format requirements
5. Click "Upload Attendance"
6. System will process and show summary:
   - Total rows processed
   - Successfully imported records
   - Students not found (if any)

## Error Handling

If upload fails:
- Check CSV format matches the template
- Verify roll numbers exist in your student database
- Ensure file size is under 5MB
- Make sure file extension is .csv

## Future Features (Planned)

- Automatic SMS notifications to parents for absent/late students
- WhatsApp integration for attendance alerts
- Attendance pattern analysis
- Downloadable attendance reports in CSV format

---

**Need Help?** Contact support or check the in-app help documentation.
