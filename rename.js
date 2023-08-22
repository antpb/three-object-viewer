const fs = require('fs');
const path = require('path');

const HASH_to_file = [
  { '51af751c2048f283b39a777e1a3fae1b': 'three-object-viewer-three-portal-block-editor-script' },
  { 'bd2a3e7576d2e549fc22bfab35d48ca0': 'three-object-viewer-three-text-block-editor-script' },
  { 'a302549a555228fc26253251cff757bd': 'three-object-viewer-model-block-editor-script' },
  { 'a6625e41527a4ebb684bf747e8040213': 'three-object-viewer-three-audio-block-editor-script' },
  { 'f38ba41c49ce087276f6fb65a04d09f5': 'three-object-viewer-three-light-block-editor-script' },
  { '99e744b4fac1824cd9bd14f27bcce02b': 'three-object-viewer-npc-block-editor-script' },
  { '1c9eb460996b98bed51790c80e90f705': 'three-object-viewer-sky-block-editor-script' },
  { '760f26759af0cf80372c18dbbff3b8af': 'three-object-viewer-three-image-block-editor-script' },
  { '2f1be97f0700f196acecdfec131ed2a4': 'three-object-viewer-three-video-block-editor-script' },
  { 'db711d0e65eaf2e9518213c2fa3f74ff': 'three-object-viewer-spawn-point-block-editor-script' },
  { '05c0f6b04d52130d2210e3b0b4859a63': 'three-object-viewer-environment-editor-script' },
  { 'dd10ea5e2a0076c36967f4c3fdb50a0b': 'three-object-viewer-settings'}
];

const folderPath = 'languages';

fs.readdirSync(folderPath).forEach((file) => {
  const match = file.match(/three-object-viewer-es_MX-(.*).json/);

  if (match && match[1]) {
    const hash = match[1];
    const mapping = HASH_to_file.find((obj) => Object.keys(obj)[0] === hash);

    if (mapping) {
      const newName = 'three-object-viewer-es_MX-' + Object.values(mapping)[0] + '.json';
      fs.renameSync(path.join(folderPath, file), path.join(folderPath, newName));
    }
  }
});

fs.readdirSync(folderPath).forEach((file) => {
  const match = file.match(/three-object-viewer-ja-(.*).json/);

  if (match && match[1]) {
    const hash = match[1];
    const mapping = HASH_to_file.find((obj) => Object.keys(obj)[0] === hash);

    if (mapping) {
      const newName = 'three-object-viewer-ja-' + Object.values(mapping)[0] + '.json';
      fs.renameSync(path.join(folderPath, file), path.join(folderPath, newName));
    }
  }
});

