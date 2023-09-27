const fs = require('fs-extra');
const path = require('path');

const isPro = process.argv.includes('pro');

const sourceDirectory = path.join(__dirname);
const targetDirectory = path.join(__dirname, 'plugin-build', isPro ? 'pro/three-object-viewer' : 'free/three-object-viewer');

// Explicitly specify directories or files you want to copy for the free version
const itemsToCopy = [
    'LICENSE',
    'admin',
    'blocks',
    'build',
    'inc',
    'languages',
    'php',
    'readme.txt',
    'three-object-viewer.php',
];

// Ensure the target directory is clean before copying
fs.removeSync(targetDirectory);
fs.ensureDirSync(targetDirectory);

itemsToCopy.forEach(item => {
    const sourcePath = path.join(sourceDirectory, item);
    const targetPath = path.join(targetDirectory, item);
    fs.copySync(sourcePath, targetPath);
});

// If it's the pro build, include the 'pro' directory plus all free version files/directories
if (isPro) {
    const sourcePro = path.join(sourceDirectory, 'pro');
    const targetPro = path.join(targetDirectory, 'pro');
    fs.copySync(sourcePro, targetPro);
}

console.log(`Packaged the ${isPro ? 'pro' : 'free'} version to ${targetDirectory}`);
