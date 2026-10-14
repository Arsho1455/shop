import test from 'node:test';
import assert from 'node:assert/strict';
import { translations } from './translations.js';

const userFacingKeys = [
  'Գլխավոր', 'Կապ մեզ հետ', 'Իմ էջը', 'Գրանցվել', 'Մուտք գործել',
  'Ավելացնել զամբյուղ', 'Նախընտրածներ', 'Հաղորդագրություն',
  'Գաղտնաբառ', 'Բեսթսելլեր', 'Հատուկ գին',
  'Ապրանքը չգտնվեց', 'PhoneShop | Քո սմարթֆոնների աշխարհը',
];

test('core interface strings exist in all supported translations', () => {
  for (const locale of ['ru', 'en']) {
    for (const key of userFacingKeys) {
      assert.ok(translations[locale][key], `${locale} missing translation for ${key}`);
      assert.equal(/[\u0530-\u058f]/.test(translations[locale][key]), false, `unexpected Armenian in ${locale}: ${key}`);
    }
  }
});

test('translation dictionaries cover the same keys', () => {
  assert.deepEqual(Object.keys(translations.ru).sort(), Object.keys(translations.en).sort());
});
