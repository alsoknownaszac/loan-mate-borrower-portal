# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for document uploads in the LoanMate application.

## 1. Storage Bucket Setup

The storage bucket has been created automatically. Run this command to verify:

```bash
node scripts/setup-storage.js
```

This creates:
- **Bucket name**: `documents`
- **Privacy**: Private (requires authentication)
- **File size limit**: 10MB
- **Allowed types**: PDF, JPG, PNG, DOC, DOCX

## 2. Required Storage Policies (Manual Setup)

You need to set up Row Level Security (RLS) policies in the Supabase Dashboard:

### Step 1: Go to Storage Policies
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Storage** > **Policies**
3. Select the `documents` bucket

### Step 2: Create Upload Policy
- **Policy name**: `Borrowers can upload their own documents`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
auth.uid()::text = (storage.foldername(name))[1]
```

### Step 3: Create View Policy
- **Policy name**: `Borrowers can view their own documents`
- **Operation**: `SELECT` 
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
auth.uid()::text = (storage.foldername(name))[1]
```

### Step 4: Create Admin Access Policy
- **Policy name**: `Admins can access all documents`
- **Operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = auth.jwt() ->> 'email' 
  AND is_active = true
)
```

## 3. File Upload Flow

### Frontend (Borrower)
1. User selects file in documents page
2. File is validated (type, size)
3. FormData is created with file + metadata
4. POST request to `/api/borrower/documents/upload`

### Backend Processing
1. **Validation**: File type, size, required fields
2. **Storage Upload**: File uploaded to `{borrowerId}/{documentType}/{filename}`
3. **Database Record**: Document metadata saved to `documents` table
4. **Status Update**: Document request marked as 'submitted'
5. **Notification**: Admin notified of new upload

### File Organization
```
documents/
├── {borrower-id-1}/
│   ├── identification/
│   │   └── id_document_123456.pdf
│   ├── income_proof/
│   │   └── payslip_123456.pdf
│   └── bank_statement/
│       └── statement_123456.pdf
└── {borrower-id-2}/
    └── identification/
        └── passport_123456.jpg
```

## 4. Database Schema

### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'requested')),
  requested_by UUID REFERENCES admin_users(id),
  requested_at TIMESTAMP,
  approved_at TIMESTAMP,
  upload_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Document Requests Table
```sql
CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL REFERENCES borrowers(id),
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'completed', 'overdue')),
  requested_by UUID REFERENCES admin_users(id),
  fulfilled_by UUID REFERENCES documents(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 5. API Endpoints

### Upload Document
- **Endpoint**: `POST /api/borrower/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: The document file
  - `borrowerId`: UUID of the borrower
  - `documentType`: Type of document
  - `documentRequestId`: (Optional) ID of the request being fulfilled

### Get Documents
- **Endpoint**: `GET /api/borrower/documents`
- **Returns**: Document requests and uploaded documents for the borrower

## 6. Security Features

### File Validation
- **Type checking**: Only PDF, JPG, PNG, DOC, DOCX allowed
- **Size limit**: 10MB maximum
- **Filename sanitization**: Prevents path traversal attacks

### Access Control
- **RLS Policies**: Users can only access their own documents
- **Admin Override**: Admins can access all documents for review
- **Signed URLs**: Temporary access for secure downloads

### Storage Security
- **Private bucket**: Files not publicly accessible
- **Path-based isolation**: Each borrower has their own folder
- **Audit trail**: All uploads logged in database

## 7. Testing

### Test Storage Setup
```bash
node scripts/test-storage-upload.js
```

### Test File Upload (Manual)
1. Log in as a borrower
2. Go to Documents page
3. Find a pending document request
4. Click "Upload File" and select a test document
5. Verify upload success and database record

## 8. Monitoring

### Storage Usage
- Monitor bucket size in Supabase Dashboard
- Set up alerts for storage limits
- Regular cleanup of test files

### Error Handling
- Upload failures are logged to console
- Users receive clear error messages
- Failed uploads don't leave orphaned files

## 9. Production Considerations

### Performance
- Consider CDN for file delivery
- Implement file compression for large documents
- Add progress indicators for large uploads

### Backup
- Supabase handles storage backups automatically
- Consider additional backup strategy for critical documents
- Document retention policies

### Compliance
- Ensure GDPR/privacy compliance for document storage
- Implement document deletion workflows
- Audit logging for document access

## 10. Troubleshooting

### Common Issues

**Upload fails with "mime type not supported"**
- Check file type is in allowed list
- Verify file isn't corrupted

**"Access denied" errors**
- Verify RLS policies are set up correctly
- Check user authentication status

**Files not appearing in UI**
- Check database records were created
- Verify API endpoints are working
- Check browser console for errors

### Debug Commands
```bash
# Test storage connection
node scripts/setup-storage.js

# Test upload functionality  
node scripts/test-storage-upload.js

# Check documents API
curl -X GET http://localhost:3000/api/borrower/documents
```

---

## Quick Start Checklist

- [ ] Run storage setup script
- [ ] Configure RLS policies in Supabase Dashboard
- [ ] Test file upload functionality
- [ ] Verify documents appear in borrower portal
- [ ] Test admin document review workflow

Your document upload system is now fully functional! 🎉