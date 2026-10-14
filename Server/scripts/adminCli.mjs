import { stdin, stdout } from 'node:process';
import { normalizeEmail, validEmail } from '../auth/utils/validate.js';

export function requireEmailArgument(usage) {
  const email = normalizeEmail(process.argv[2]);
  if (!validEmail(email)) throw new Error(`Օգտագործիր՝ ${usage}`);
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Ադմինի գաղտնաբառը մուտքագրիր իրական CMD/PowerShell terminal-ում (ոչ redirect կամ pipe)։');
  }
  return email;
}

// Read sensitive input directly in raw terminal mode. Works in interactive
// Windows CMD/PowerShell, without echoing the password or placing it in history.
export function readPassword(label) {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(new Error('Անհրաժեշտ է ինտերակտիվ terminal։'));
  }
  return new Promise((resolve, reject) => {
    let result = '';
    const previousRaw = Boolean(stdin.isRaw);
    stdout.write(label);
    try { stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8'); }
    catch (error) { reject(error); return; }

    const cleanup = () => {
      stdin.off('data', onData);
      stdin.setRawMode(previousRaw);
      stdin.pause();
      stdout.write('\n');
    };
    function onData(data) {
      for (const char of data) {
        if (char === '\r' || char === '\n') {
          cleanup();
          resolve(result);
          return;
        }
        if (char === '\u0003' || char === '\u0004') {
          cleanup();
          reject(new Error('Ընդհատվել է։'));
          return;
        }
        if (char === '\u007f' || char === '\b') {
          result = [...result].slice(0, -1).join('');
        } else if (char >= ' ' && char !== '\u007f') {
          result += char;
        }
      }
    }
    stdin.on('data', onData);
  });
}

export function validateAdminPassword(password) {
  return typeof password === 'string' && password.length >= 12 &&
    Buffer.byteLength(password, 'utf8') <= 72 &&
    !/[\u0000-\u001f\u007f]/.test(password);
}

export async function promptPasswordTwice() {
  const password = await readPassword('Նոր գաղտնաբառ (առնվազն 12 նիշ, չի ցուցադրվում): ');
  if (!validateAdminPassword(password)) {
    throw new Error('Գաղտնաբառը պետք է ունենա 12+ նիշ և առավելագույնը 72 բայթ։');
  }
  const repeat = await readPassword('Կրկնիր գաղտնաբառը: ');
  if (password !== repeat) throw new Error('Գաղտնաբառերը չեն համընկնում։');
  return password;
}
