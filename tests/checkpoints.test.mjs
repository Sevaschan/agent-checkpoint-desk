import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validatePlan,createReview,decide,summarize,toMarkdown,toReceipt} from '../src/checkpoints.mjs';
const sample=()=>JSON.parse(readFileSync(new URL('../examples/release-plan.json',import.meta.url)));
test('sample starts entirely undecided; no execution is implied',()=>{
 const r=createReview(sample()); assert.deepEqual(summarize(r),{total:4,pending:4,allowed:0,held:0,ready:0,waiting:0});
 assert.match(toMarkdown(r),/Planning record only/);
});
test('dependencies must all be allowed, including transitive dependencies',()=>{
 const r=createReview(sample());decide(r,'inspect','allow');decide(r,'draft','allow');decide(r,'publish','hold');decide(r,'cleanup','allow');
 assert.deepEqual(summarize(r),{total:4,pending:0,allowed:3,held:1,ready:2,waiting:1});
 decide(r,'inspect','hold'); assert.equal(summarize(r).ready,0);
 decide(r,'inspect','pending');assert.equal(summarize(r).waiting,2);
});
test('rejects unknown dependencies, duplicate ids, self references and cycles',()=>{
 for(const mutate of [p=>p.actions[0].dependsOn=['missing'],p=>p.actions[1].id='inspect',p=>p.actions[0].dependsOn=['inspect'],p=>p.actions[0].dependsOn=['cleanup']]){
  const p=sample();mutate(p);assert.throws(()=>validatePlan(p));
 }
});
test('rejects malformed effects, unknown fields, missing rollback and oversized input',()=>{
 for(const mutate of [p=>p.actions[0].effect='execute',p=>p.actions[0].approved=true,p=>p.actions[1].rollback='',p=>p.goal='x'.repeat(6000)]){
  const p=sample();mutate(p);assert.throws(()=>validatePlan(p));
 }
});
test('importing a plan never carries previous approvals; receipt is separate',()=>{
 const r=createReview(sample());decide(r,'inspect','allow');
 const receipt=toReceipt(r);assert.equal(receipt.decisions.inspect,'allow');
 const fresh=createReview(receipt.plan);assert.equal(summarize(fresh).allowed,0);
 assert.throws(()=>createReview(receipt));
});
test('invalid decision leaves current review unchanged',()=>{
 const r=createReview(sample()),before=JSON.stringify(r);
 assert.throws(()=>decide(r,'inspect','approved'));assert.throws(()=>decide(r,'missing','allow'));assert.equal(JSON.stringify(r),before);
});
test('markdown contains scope, all steps and literal untrusted text',()=>{
 const p=sample();p.actions[0].title='<script> | [click](evil)';const r=createReview(p),md=toMarkdown(r);
 assert.ok(md.includes('&lt;script&gt;'));assert.ok(md.includes('\\|'));assert.ok(md.includes('docs/'));assert.ok(md.includes('rollback'));assert.equal(toReceipt(r).plan.actions.length,4);
});
test('dense acyclic dependency graph stays responsive',()=>{
 const p=sample(),base=p.actions[0];p.actions=Array.from({length:70},(_,i)=>({...base,id:'s'+i,dependsOn:Array.from({length:i},(_,n)=>'s'+n)}));
 const r=createReview(p);for(const a of p.actions)decide(r,a.id,'allow');
 assert.equal(summarize(r).ready,70);decide(r,'s0','hold');assert.equal(summarize(r).ready,0);
});
test('UTF-8 plan limit applies even when individual text fields are valid',()=>{
 const p=sample(),base=p.actions[0];p.actions=Array.from({length:100},(_,i)=>({...base,id:'s'+i,title:'字'.repeat(5000),dependsOn:[]}));
 assert.throws(()=>createReview(p),/1 MiB/);
});
