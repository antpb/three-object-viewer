const fs = require('fs-extra');
const path = require('path');

const isPro = process.argv.includes('pro');

const sourceDirectory = path.join(__dirname);
const targetDirectory = path.join(__dirname, 'plugin-build', isPro ? 'pro' : 'free');

// Copy the entire directory to the target
fs.copySync(sourceDirectory, targetDirectory, {
    filter: (src, dest) => {
        // Exclude node_modules and plugin-build directories
        if (src.includes('node_modules') || src.includes('plugin-build')) {
            return false;
        }

        // If it's the free build, exclude the pro directory
        if (!isPro && src.includes('/pro/')) {
            return false;
        }

        return true;
    }
});

console.log(`Packaged the ${isPro ? 'pro' : 'free'} version to ${targetDirectory}`);

