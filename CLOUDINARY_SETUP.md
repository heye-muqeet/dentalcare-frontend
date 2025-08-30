# Cloudinary Setup Guide for Dental Report Images

## Overview

This guide walks you through setting up Cloudinary for storing dental report images in the dental clinic management system.

## Prerequisites

1. A Cloudinary account (free tier available)
2. Access to your project's environment variables

## Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address
4. Access your dashboard

## Step 2: Get Cloudinary Credentials

From your Cloudinary dashboard, you'll need:

1. **Cloud Name**: Your unique cloud identifier
2. **API Key**: Your API key for authentication
3. **Upload Preset**: A preset configuration for uploads

### Finding Your Credentials

1. **Cloud Name & API Key**: 
   - Located in your dashboard header
   - Example: `Cloud name: dw1a2b3c4d`

2. **Upload Preset**:
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Configure as described below

## Step 3: Configure Upload Preset

Create an unsigned upload preset for frontend uploads:

### Preset Configuration:
- **Preset name**: `dental-reports` (or your choice)
- **Signing mode**: `Unsigned`
- **Folder**: `dental-reports` (auto-creates folder structure)
- **Format**: Auto
- **Quality**: Auto
- **Max file size**: 10MB
- **Allowed formats**: jpg, png, bmp, tiff, webp

### Advanced Settings:
- **Auto-tagging**: Enable
- **Categorization**: Enable (optional)
- **Transformation**: 
  ```
  q_auto,f_auto,c_limit,w_1920,h_1920
  ```
  (Auto quality/format, max 1920px)

## Step 4: Environment Variables

Add these variables to your `.env` file:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=dental-reports
VITE_CLOUDINARY_API_KEY=your_api_key_here
```

### Example:
```env
VITE_CLOUDINARY_CLOUD_NAME=dw1a2b3c4d
VITE_CLOUDINARY_UPLOAD_PRESET=dental-reports
VITE_CLOUDINARY_API_KEY=123456789012345
```

## Step 5: Test Upload

1. Restart your development server
2. Go to the appointment details page
3. Try attaching a dental report with an image
4. Check your Cloudinary media library for the uploaded image

## Folder Structure

Images will be organized in Cloudinary as:
```
/dental-reports/
  ├── bitewing_xray_1234567890.jpg
  ├── gum_assessment_1234567891.png
  └── comprehensive_exam_1234567892.jpg
```

## Image Transformations

The system automatically applies these transformations:
- **Quality**: Auto (optimized for web)
- **Format**: Auto (webp when supported)
- **Size**: Max 1920px (maintains aspect ratio)
- **Compression**: Optimized for dental imaging

## Security Considerations

### For Production:

1. **Signed Uploads**: Use server-side signing for better security
2. **Upload Restrictions**: Limit file types and sizes
3. **Access Control**: Configure delivery permissions
4. **Image Moderation**: Enable auto-moderation if needed

### Recommended Production Setup:
```javascript
// Server-side upload signature generation
const cloudinary = require('cloudinary').v2;

const generateSignature = (params) => {
  return cloudinary.utils.api_sign_request(params, API_SECRET);
};
```

## Features Enabled

### ✅ Current Features:
- **Automatic Upload**: Images uploaded during report creation
- **Optimized Delivery**: Auto-quality and format optimization
- **Organized Storage**: Folder structure by test type
- **Metadata**: Test name, upload date, and context
- **URL Generation**: Optimized URLs for different use cases

### 🔄 Future Enhancements:
- **Image Editing**: Crop, rotate, annotate dental images
- **AI Integration**: Enhanced AI analysis with Cloudinary AI
- **Backup**: Automated backup strategies
- **CDN**: Global content delivery

## Troubleshooting

### Common Issues:

1. **Upload Failed**:
   - Check environment variables
   - Verify upload preset exists
   - Ensure file size < 10MB

2. **Images Not Displaying**:
   - Check Cloudinary URLs
   - Verify delivery permissions
   - Check browser console for errors

3. **Configuration Errors**:
   - Verify cloud name format
   - Check upload preset settings
   - Ensure API key is correct

### Debug Mode:
Enable debug logging by adding to your `.env`:
```env
VITE_DEBUG_CLOUDINARY=true
```

## Cost Optimization

### Free Tier Limits:
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month

### Tips:
1. Use auto-quality and format
2. Implement lazy loading
3. Set up auto-deletion for old files
4. Monitor usage in dashboard

## Support

- **Cloudinary Docs**: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Upload Presets**: [Upload preset documentation](https://cloudinary.com/documentation/upload_presets)
- **Transformations**: [Image transformation guide](https://cloudinary.com/documentation/image_transformations)

## Integration Status

- ✅ Upload service implemented
- ✅ Report modal integration
- ✅ Treatment API integration
- ✅ Image preview functionality
- ✅ Automatic optimization
- ✅ Error handling 