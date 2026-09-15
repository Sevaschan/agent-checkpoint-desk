import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'ipollowork.plugin.json')));
test('build produces self-contained syntax-valid UI and matching version',()=>{
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root});
 const html=fs.readFileSync(path.join(root,'ui/index.html'),'utf8');
 assert.equal((html.match(/<script>/g)||[]).length,1);new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
 assert.ok(!/src=["']https?:|href=["']https?:|\/\* (CHECKPOINT_CORE|SAMPLE_JSON|VERSION) \*\//.test(html));
 assert.ok(html.includes(manifest.package.version));
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'))).version,manifest.package.version);
});
test('archive contains exactly the manifest and bundled UI within delivery limits',()=>{
 execFileSync(process.execPath,['package.mjs'],{cwd:root});
 const archive=path.join(root,'dist',`${manifest.id}-${manifest.package.version}.ipollowork-plugin`);
 const entries=execFileSync('unzip',['-Z1',archive],{encoding:'utf8'}).trim().split('\n');
 assert.equal(new Set(entries).size,entries.length);assert.ok(entries.length<=512);
 assert.deepEqual(entries.filter(x=>!x.endsWith('/')).sort(),['ipollowork.plugin.json','ui/index.html']);
 let expanded=0;for(const file of entries.filter(x=>!x.endsWith('/'))){
  assert.ok(!file.startsWith('/')&&!file.split('/').includes('..'));assert.ok(!fs.lstatSync(path.join(root,file)).isSymbolicLink());
  const bytes=execFileSync('unzip',['-p',archive,file]);expanded+=bytes.length;assert.ok(bytes.equals(fs.readFileSync(path.join(root,file))));
 }
 assert.ok(fs.statSync(archive).size<=12*1024*1024);assert.ok(expanded<=10*1024*1024);
});
test('ordinary declarative manifest uses stable ids and unprivileged UI resource',()=>{
 assert.equal(manifest.schemaVersion,2);assert.equal(manifest.source.trusted,false);
 assert.equal(manifest.package.publisher.id,'sevaschan');assert.equal(manifest.package.updateId,'sevaschan/agent-checkpoint-desk');
 assert.equal(manifest.permissions,undefined);assert.equal(manifest.authorization,undefined);assert.equal(manifest.engineBindings,undefined);
 assert.equal(manifest.resources.length,1);assert.equal(manifest.resources[0].type,'ui');assert.equal(manifest.resources[0].ui.mimeType,'text/html;profile=mcp-app');
});
