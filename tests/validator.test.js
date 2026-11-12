import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../sources/app.js';
import { submissionSchema } from '../sources/schema.js';
import { errorMessages, winMessage } from '../sources/messages.js';

const valid = {
  f0:'valami', f1:'27', f2:'abc', f3:'teszt@example.hu', f4:'42',
  f5:'AB123', f6:'Jelszo123', f7:'igen', f8:'2026-11-12'
};
const fieldCases = [
  ['f0','   '], ['f1','9'], ['f2','ABC'], ['f3','abc'], ['f4','41'],
  ['f5','aB123'], ['f6','jelszo123'], ['f7','nem'], ['f8','2026-02-30'],
];

test('valid submission accepted by Zod', () => {
  assert.equal(submissionSchema.safeParse(valid).success, true);
});
for (const [field, value] of fieldCases) {
  test(`Zod rejects invalid ${field}`, () => {
    assert.equal(submissionSchema.safeParse({ ...valid, [field]: value }).success, false);
  });
}

test('HTTP API accepts winning payload; gives no validation details on failure', async () => {
  const diagnostics=[];
  const app=createApp({ logger:{info:(...args)=>diagnostics.push(args),warn:()=>{},error:()=>{}},pickError:()=>0 });
  const server=createServer(app);
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try {
    const base=`http://127.0.0.1:${server.address().port}`;
    const bad=await fetch(`${base}/api/validate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...valid,f2:'BAD'})});
    assert.equal(bad.status,422);
    assert.deepEqual(await bad.json(),{success:false,message:errorMessages[0]});
    assert.ok(diagnostics.some(d=>JSON.stringify(d).includes('f2')));
    const good=await fetch(`${base}/api/validate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(valid)});
    assert.equal(good.status,200);
    assert.deepEqual(await good.json(),{success:true,message:winMessage});
    const page=await (await fetch(base)).text();
    assert.match(page,/A Nagy Büdös/);
    assert.doesNotMatch(page,/const checks|const solutions|const errors =/);
  } finally {
    await new Promise(resolve=>server.close(resolve));
  }
});
