import test from 'node:test';
import assert from 'node:assert/strict';
import { PterodactylClient } from '../src/client.js';

test('PterodactylClient throws error if panelUrl or apiKey is missing', () => {
  assert.throws(() => new PterodactylClient('', 'test-key'), /Panel URL and API Key are required/);
  assert.throws(() => new PterodactylClient('https://panel.example.com', ''), /Panel URL and API Key are required/);
});

test('PterodactylClient normalizes panel URL', () => {
  const client = new PterodactylClient('https://panel.vexanode.gg///', 'ptlc_sample_key');
  assert.equal(client.panelUrl, 'https://panel.vexanode.gg');
  assert.equal(client.apiKey, 'ptlc_sample_key');
});
