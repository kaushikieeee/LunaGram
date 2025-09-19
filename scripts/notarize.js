const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(context) {
  const appPath = context.appOutDir + '/LunaGram.app';
  const distDir = path.dirname(context.appOutDir);
  
  console.log('🔧 Post-build: Optimizing app for fast startup...');
  
  try {
    console.log('🔓 Removing quarantine flags from app...');
    execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
    
    console.log('⚡ Clearing extended attributes from app...');
    execSync(`find "${appPath}" -type f -exec xattr -c {} \\; 2>/dev/null || true`, { stdio: 'inherit' });
    
    console.log('🛠 Setting correct permissions...');
    execSync(`chmod +x "${appPath}/Contents/MacOS/LunaGram"`, { stdio: 'inherit' });
    
    console.log('🧹 Cleaning DMG and ZIP files...');
    execSync(`find "${distDir}" -name "*.dmg" -exec xattr -c {} \\; 2>/dev/null || true`, { stdio: 'inherit' });
    execSync(`find "${distDir}" -name "*.zip" -exec xattr -c {} \\; 2>/dev/null || true`, { stdio: 'inherit' });
    
    console.log('🔒 Removing quarantine from all dist files...');
    execSync(`xattr -dr com.apple.quarantine "${distDir}" 2>/dev/null || true`, { stdio: 'inherit' });
    
    console.log('✅ App and packages optimized for fast startup!');
  } catch (error) {
    console.warn('⚠️ Could not apply all optimizations:', error.message);
  }
};