const test = require('node:test');
const assert = require('node:assert/strict');
const { parseListingFields } = require('../controllers/listingController');

test('parses valid listing fields from multipart-style strings', () => {
  const fields = parseListingFields({
    title: '  Vintage denim jacket  ',
    description: '  Soft denim, no major flaws.  ',
    priceCents: '4500',
    category: 'OUTERWEAR',
    size: 'M',
    condition: 'GOOD',
    status: 'available',
  });

  assert.deepEqual(fields, {
    title: 'Vintage denim jacket',
    description: 'Soft denim, no major flaws.',
    priceCents: 4500,
    category: 'outerwear',
    size: 'M',
    condition: 'good',
    status: 'available',
  });
});

test('rejects an invalid category', () => {
  assert.throws(
    () => parseListingFields({
      title: 'Test listing',
      description: '',
      priceCents: '1000',
      category: 'not-a-category',
      size: 'M',
      condition: 'good',
    }),
    /valid category/i,
  );
});

test('rejects fractional cents', () => {
  assert.throws(
    () => parseListingFields({
      title: 'Test listing',
      description: '',
      priceCents: '10.5',
      category: 'tops',
      size: 'M',
      condition: 'good',
    }),
    /whole number of cents/i,
  );
});
