import test from 'node:test';
import assert from 'node:assert/strict';
import { parseContactMessage, escapeContactHtml } from './contact.js';

test('contact form accepts a valid customer inquiry', () => {
  assert.deepEqual(parseContactMessage({
    name: '  Անի  ',
    email: '  ANI@EXAMPLE.COM  ',
    message: '  Բարև ձեզ, հարց ունեմ։  ',
  }), {
    name: 'Անի',
    email: 'ani@example.com',
    message: 'Բարև ձեզ, հարց ունեմ։',
    website: '',
  });
});

test('contact form requires valid name, email and message', () => {
  assert.ok(parseContactMessage({ name: 'A', email: 'a@example.com', message: 'Hello' }).error);
  assert.ok(parseContactMessage({ name: 'Anne', email: 'wrong', message: 'Hello' }).error);
  assert.ok(parseContactMessage({ name: 'Anne', email: 'a@example.com', message: 'Hi' }).error);
  assert.ok(parseContactMessage({ name: 'Anne', email: 'a@example.com', message: 'x'.repeat(2001) }).error);
  assert.ok(parseContactMessage({ name: 'An\r\nB', email: 'a@example.com', message: 'Hello' }).error);
});

test('contact HTML content is escaped safely', () => {
  assert.equal(escapeContactHtml(`<script>alert('x' & "y")</script>`), '&lt;script&gt;alert(&#39;x&#39; &amp; &quot;y&quot;)&lt;/script&gt;');
});
