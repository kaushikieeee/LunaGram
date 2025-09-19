const { execSync } = require('child_process');

exports.default = async function(context) {
  const appPath = context.appOutDir + '/LunaGram.app';
  
  console.log('🔧 Post-build: Optimizing app for fast startup...');
  
  try {
    console.log('🔓 Removing quarantine flags...');
    execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
    
    console.log('⚡ Clearing extended attributes...');
    execSync(`find "${appPath}" -type f -exec xattr -c {} \\; 2>/dev/null || true`, { stdio: 'inherit' });
    
    console.log('🛠 Setting correct permissions...');
    execSync(`chmod +x "${appPath}/Contents/MacOS/LunaGram"`, { stdio: 'inherit' });
    
    console.log('✅ App optimized for fast startup!');
  } catch (error) {
    console.warn('⚠️ Could not apply all optimizations:', error.message);
  }
};