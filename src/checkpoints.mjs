export const EFFECTS=['read','write','external','delete'];
export const DECISIONS=['pending','allow','hold'];
function objectWithKeys(value,keys,label){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(`${label}: expected an object`);
 for(const key of Object.keys(value))if(!keys.includes(key))throw new Error(`${label}: unknown field ${key}`);
 for(const key of keys)if(!Object.hasOwn(value,key))throw new Error(`${label}: missing ${key}`);
}
function text(value,label){if(typeof value!=='string'||!value.trim()||value.length>5000)throw new Error(`${label}: expected 1–5000 characters`);}
export function validatePlan(plan){
 objectWithKeys(plan,['schemaVersion','goal','owner','scope','actions'],'plan');
 if(plan.schemaVersion!==1)throw new Error('schemaVersion must be 1');
 for(const key of ['goal','owner','scope'])text(plan[key],key);
 if(!Array.isArray(plan.actions)||plan.actions.length<1||plan.actions.length>100)throw new Error('actions must contain 1–100 steps');
 const ids=new Set();
 for(const [n,a] of plan.actions.entries()){
  const label=`actions[${n}]`;objectWithKeys(a,['id','title','tool','target','effect','dependsOn','acceptance','rollback'],label);
  if(typeof a.id!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(a.id))throw new Error(`${label}: id must be a lowercase slug, up to 64 characters`);
  if(ids.has(a.id))throw new Error(`Duplicate id: ${a.id}`);ids.add(a.id);
  for(const key of ['title','tool','target','acceptance','rollback'])text(a[key],`${label}.${key}`);
  if(!EFFECTS.includes(a.effect))throw new Error(`${label}: unsupported effect`);
  if(!Array.isArray(a.dependsOn)||a.dependsOn.some(d=>typeof d!=='string')||new Set(a.dependsOn).size!==a.dependsOn.length)throw new Error(`${label}: dependsOn must contain unique step ids`);
 }
 const byId=new Map(plan.actions.map(a=>[a.id,a]));
 const done=new Set(),visiting=new Set();
 function visit(id){
  if(!ids.has(id))throw new Error(`Unknown dependency: ${id}`);
  if(visiting.has(id))throw new Error(`Dependency cycle at ${id}`);
  if(done.has(id))return;visiting.add(id);
  for(const dep of byId.get(id).dependsOn)visit(dep);
  visiting.delete(id);done.add(id);
 }
 for(const id of ids)visit(id);
 return plan;
}
export function createReview(plan){
 validatePlan(plan);
 if(new TextEncoder().encode(JSON.stringify(plan)).length>1024*1024)throw new Error('Plan must be at most 1 MiB');
 return {plan:structuredClone(plan),decisions:Object.fromEntries(plan.actions.map(a=>[a.id,'pending']))};
}
export function decide(review,id,decision){
 if(!review.plan.actions.some(a=>a.id===id))throw new Error(`Unknown step: ${id}`);
 if(!DECISIONS.includes(decision))throw new Error(`Unknown decision: ${decision}`);
 review.decisions[id]=decision;return review;
}
export function stepStatus(review,id){
 const byId=new Map(review.plan.actions.map(a=>[a.id,a])),memo=new Map();
 function status(key){
  if(memo.has(key))return memo.get(key);
  const a=byId.get(key);if(!a)throw new Error(`Unknown step: ${key}`);
  const decision=review.decisions[key];
  const result=decision!=='allow'?decision:a.dependsOn.every(dep=>status(dep)==='ready')?'ready':'waiting';
  memo.set(key,result);return result;
 }
 return status(id);
}
export function summarize(review){
 const result={total:review.plan.actions.length,pending:0,allowed:0,held:0,ready:0,waiting:0};
 for(const a of review.plan.actions){
  const decision=review.decisions[a.id];result[decision==='allow'?'allowed':decision==='hold'?'held':'pending']++;
  const status=stepStatus(review,a.id);if(status==='ready'||status==='waiting')result[status]++;
 }
 return result;
}
export function toReceipt(review){
 return {kind:'agent-checkpoint-review',schemaVersion:1,recordType:'manual planning decisions; not execution or authorization proof',...structuredClone(review),summary:summarize(review)};
}
function md(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replace(/[\\`*_{}\[\]()#+.!|~-]/g,'\\$&').replaceAll('\n',' ');}
export function toMarkdown(review){
 const p=review.plan,s=summarize(review);
 const lines=['# Agent checkpoint handoff','',`Goal: ${md(p.goal)}`,`Owner (self-reported): ${md(p.owner)}`,`Scope: ${md(p.scope)}`,'','Planning record only. No action has been executed by this plugin. Decisions do not grant host or service permissions.',`${s.total} steps · ${s.ready} review-ready · ${s.pending} pending · ${s.held} held · ${s.waiting} waiting for dependencies`,'','| Step | Effect | Decision | Dependency review |','| --- | --- | --- | --- |'];
 for(const a of p.actions)lines.push(`| ${md(a.id)} | ${a.effect} | ${review.decisions[a.id]} | ${stepStatus(review,a.id)} |`);
 for(const a of p.actions)lines.push('',`## ${md(a.id)}: ${md(a.title)}`,`Tool: ${md(a.tool)} · Target: ${md(a.target)}`,`Depends on: ${a.dependsOn.length?a.dependsOn.map(md).join(', '):'none'}`,`Acceptance: ${md(a.acceptance)}`,`Undo / rollback: ${md(a.rollback)}`);
 return lines.join('\n')+'\n';
}
