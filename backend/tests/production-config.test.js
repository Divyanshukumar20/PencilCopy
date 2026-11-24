import test from 'node:test';
import assert from 'node:assert/strict';

test('production permits cross-site cookies only with the configured frontend origin', async () => {
  process.env.NODE_ENV = 'production';
  process.env.FRONTEND_ORIGIN = 'https://pencilcopy.vercel.app';
  const [{app}, {cookieOptions}] = await Promise.all([
    import('../app.js'), import('../middlewares/verifytoken.js')
  ]);
  assert.equal(cookieOptions.secure, true);
  assert.equal(cookieOptions.sameSite, 'none');
  const server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  try {
    const url = `http://127.0.0.1:${server.address().port}/missing`;
    const post = origin => fetch(url, {method: 'POST', headers: origin ? {Origin: origin} : {}});
    assert.equal((await post()).status, 403);
    assert.equal((await post('https://other.example')).status, 403);
    assert.equal((await post(process.env.FRONTEND_ORIGIN)).status, 404);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
