# 🚀 Deployment Guide for Vercel

This guide will help you deploy the Blockchain Credentialing System to Vercel with proper HTTPS support for camera functionality.

## 🔧 Issues Fixed

### 1. Camera Not Closing Properly
- ✅ Added proper cleanup function for Html5Qrcode instances
- ✅ Fixed Stop Scan button to properly stop camera
- ✅ Added component unmount cleanup to prevent memory leaks

### 2. HTTPS/SSL Issues for Camera Access
- ✅ Added HTTPS detection and user-friendly error messages
- ✅ Updated Vite config for production HTTPS support
- ✅ Added visual indicator for secure connection status
- ✅ Created Vercel configuration for proper deployment

### 3. Production Environment Setup
- ✅ Added Vercel configuration file
- ✅ Improved error handling for camera permissions
- ✅ Added security headers for production deployment

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.local` file in your project root with the following variables:

```bash
# Blockchain Configuration
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# Or use alternative RPC URLs:
# VITE_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# VITE_RPC_URL=https://rpc.ankr.com/polygon_mumbai

# Contract Addresses (update these with your deployed contract addresses)
VITE_CERT_AGENCY_ADDRESS=0x18F3040088d9933C55722474daFfd273E1d562dD
VITE_CERTIFIER_ADDRESS=0xAECe4998324626df3ae58b80169ff8238C48EDAe
VITE_CERT_TEMPLATE_ADDRESS=0x418d3d74c39CB1150201AA46110a5C7064bA0Ec3
VITE_RECEIVER_ADDRESS=0x3164d3D3a32c4541681aA47065Ec5Cf7563C7Cca
VITE_CERTIFICATES_ADDRESS=0xb2E8d5D2ED3c0C30AdB6A6062f93A1fB91078e7f

# Optional: Admin address override
VITE_ADMIN_ADDRESS=

# App Configuration
VITE_APP_NAME=Ordinals Blockchain Credentialing System
VITE_APP_URL=https://your-domain.vercel.app
```

### 2. Vercel Environment Variables
In your Vercel dashboard, add the same environment variables:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each variable with the same names as above
4. Make sure to set them for "Production", "Preview", and "Development"

## 🚀 Deployment Steps

### 1. Connect to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel
```

### 2. Configure Build Settings
Vercel should automatically detect this as a Vite project, but verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Domain Configuration
1. In Vercel dashboard, go to "Domains"
2. Add your custom domain (optional)
3. Ensure HTTPS is enabled (should be automatic)

## 🔍 Testing After Deployment

### 1. Camera Functionality
- ✅ Visit your deployed site (should be HTTPS)
- ✅ Go to the Verify page
- ✅ Check that "Secure connection (HTTPS) - Camera ready" is displayed
- ✅ Try scanning a QR code
- ✅ Verify that the "Stop Scan" button properly closes the camera

### 2. Manual Verification
- ✅ Test manual verification with a valid certificate ID
- ✅ Verify that blockchain interactions work properly

### 3. Mobile Testing
- ✅ Test on mobile devices
- ✅ Ensure camera access works on mobile browsers
- ✅ Verify responsive design works correctly

## 🐛 Troubleshooting

### Camera Still Not Working?
1. **Check HTTPS**: Ensure your site is served over HTTPS
2. **Browser Permissions**: Check browser camera permissions
3. **Console Errors**: Open browser dev tools and check for errors
4. **Network Issues**: Ensure blockchain RPC endpoints are accessible

### Blockchain Issues?
1. **RPC URL**: Verify your RPC URL is correct and accessible
2. **Contract Addresses**: Ensure all contract addresses are correct
3. **Network**: Make sure you're connected to the right blockchain network

### Build Errors?
1. **Dependencies**: Run `npm install` to ensure all dependencies are installed
2. **Node Version**: Ensure you're using Node.js 18+ (Vercel uses Node 18 by default)
3. **Environment Variables**: Double-check all environment variables are set correctly

## 📱 Mobile Considerations

### iOS Safari
- Camera access requires user gesture (button click)
- May need additional permissions prompts

### Android Chrome
- Generally works well with HTTPS
- May require explicit permission grants

### PWA Features (Optional)
Consider adding PWA capabilities for better mobile experience:
- Add `manifest.json`
- Implement service worker
- Add offline capabilities

## 🔒 Security Notes

- Always use HTTPS in production
- Keep your RPC URLs and contract addresses secure
- Regularly update dependencies
- Monitor for security vulnerabilities

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure your blockchain contracts are deployed and accessible
4. Test with a simple certificate ID first

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Site loads over HTTPS
- ✅ Camera scanner shows "Secure connection" status
- ✅ QR code scanning works properly
- ✅ Camera closes when "Stop Scan" is clicked
- ✅ Manual verification works
- ✅ Blockchain interactions are functional

---

**Note**: This deployment guide assumes you have already deployed your smart contracts to the blockchain. If you haven't done so, you'll need to deploy the contracts first and update the contract addresses in your environment variables.

