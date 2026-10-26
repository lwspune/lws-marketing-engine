import test from 'node:test';
import assert from 'node:assert/strict';
import { endLineFor } from '../src/lib/platform.ts';

// House rule (reels/lwspune-insta.md): the end card says "Follow for more" on Instagram and
// "Subscribe for more" on YouTube. A reel renders once per platform; only the follow line changes.

test('Instagram keeps every line as written', () => {
  assert.equal(endLineFor('Follow for more', 'instagram'), 'Follow for more');
  assert.equal(endLineFor('a quarter turn.', 'instagram'), 'a quarter turn.');
});

test('YouTube says Subscribe where Instagram says Follow, including the series lines', () => {
  assert.equal(endLineFor('Follow for more', 'youtube'), 'Subscribe for more');
  assert.equal(endLineFor('Follow for #3', 'youtube'), 'Subscribe for #3');
});

test('YouTube leaves other lines alone, even ones that mention following', () => {
  assert.equal(endLineFor('a quarter turn.', 'youtube'), 'a quarter turn.');
  assert.equal(endLineFor('What follows from y″ = −y?', 'youtube'), 'What follows from y″ = −y?');
});
