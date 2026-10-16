/* Executes the actual rendering/scope code using a minimal non-browser DOM fixture.
   This detects runtime/model errors; it does NOT validate browser layout or DOM behavior. */
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');const root=path.resolve(__dirname,'..');const nodes={};class Node{constructor(id){this.id=id;this.value='';this.events={};this.className='';this.options=[];this.classList={add(){},remove(){},toggle(){},contains(){return false}}}set innerHTML(v){this.html=v;for(let m of String(v).matchAll(/id="([^"]+)"/g))nodes[m[1]]||=new Node(m[1])}get innerHTML(){return this.html||''}set textContent(v){this.text=v}get textContent(){return this.text||''}addEventListener(k,f){this.events[k]=f}setAttribute(){}insertAdjacentHTML(_,v){this.innerHTML=this.innerHTML+v}append(){}focus(){}}
['main','sidebar','menu','persona','projectContext','identity','nav','message','editor','dialogTitle','dialogBody','signout','cancelDialog'].forEach(id=>nodes[id]=new Node(id));let store=new Map(),session=new Map();let win={addEventListener(){}};const doc={getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},createElement:()=>new Node('dynamic'),body:{dataset:{page:'dashboard'},classList:{add(){},remove(){}}}};const ctx={window:win,document:doc,console,Intl,Date,JSON,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},sessionStorage:{getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location:{search:'',hash:'#dashboard',href:'http://example.test/training-tracker/'},crypto,structuredClone,Blob,setTimeout:()=>0,navigator:{},URL,URLSearchParams};function setPage(raw){let [page,batch]=raw.replace(/^#/, '').split('/');doc.body.dataset.page=page;ctx.location.search=batch?'?batch='+encodeURIComponent(batch):'';}vm.createContext(ctx);for(let f of ['catalogue.js','decisions.js','rules.js']){vm.runInContext(fs.readFileSync(path.join(root,'assets',f),'utf8'),ctx);Object.assign(ctx,win)}vm.runInContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8').replace('window.TrainingReview={','window.TestHooks={ernetRows,ernetMetrics,act,submitEdit,commitImport,effectiveLinks,accessible,resourceScope,canUploadResources,contentCategory,contentItems,contentScope,contentFileError,validateContentFiles,saveContentUpload,previewContentUpload,setContentStage:v=>contentStage=v,setFileStore:v=>fileStore=v,setStage:v=>stage=v,setData:v=>db=v};window.TrainingReview={'),ctx);
const R=ctx.Rules;
ctx.confirm=()=>true;
ctx.FormData=class {constructor(f){return Object.entries(f.values)}};
nodes.editor.showModal=function(){this.open=true};nodes.editor.close=function(){this.open=false};
const form=(kind,values)=>({dataset:{kind},values,querySelectorAll:()=>[],querySelector:()=>null});
const data=()=>win.TrainingReview.getData();
const setDB=fn=>{let d=data();fn(d);store.set('training-tracker-review-v1',JSON.stringify(d));win.TestHooks.setData(d)};
// db is lexical to the application: update via injected test-only hook instead.




(async()=>{
for(const [id,label] of [['A1','Schoolnet Admin Dashboard'],['A2','ERNET Admin Dashboard'],['A3','State Admin Dashboard'],['A4','School Admin Dashboard'],['A5','Trainer Dashboard'],['A6','Teacher / Student Dashboard']]){
 nodes.persona.events.change({target:{value:id}});
 assert.ok(nodes.main.innerHTML.includes(label),id+' visual dashboard');
 assert.ok(nodes.main.innerHTML.includes('ernet-kpis'),id+' KPI cards');
 assert.ok(nodes.main.innerHTML.includes('Batch Status'),id+' graphical batch status');
 assert.ok(!nodes.main.innerHTML.includes('Training Effectiveness'));
 const rows=win.TestHooks.ernetRows(),metrics=win.TestHooks.ernetMetrics(rows);
 const scope=win.TrainingReview.getScope();
 assert.ok(rows.every(b=>scope.batches.some(x=>x.id===b.id)),id+' batch scope');
 if(id==='A6'){
 const own=data().users.find(u=>u.id===id).trainee;
 assert.ok(metrics.ts.every(t=>t.id===own),'Learner sees own records only');
 assert.ok(!nodes.main.innerHTML.includes('Teachers vs Students'));
 }else if(id!=='A2') assert.ok(nodes.main.innerHTML.includes('Teachers vs Students'));else {for(const removed of ['<small>Training Progress</small>','<small>Teachers Trained</small>','<small>Students Trained</small>','Teachers vs Students','Location Performance','Needs Attention'])assert.ok(!nodes.main.innerHTML.includes(removed),removed+' removed');assert.ok(nodes.main.innerHTML.includes('ernet-status-only'));}
 if(id==='A2'){
 let html=nodes.main.innerHTML;
 assert.ok(html.includes('<option value="Teachers" title="Teachers" selected>Teachers</option>'),'Teacher default');
 const order=['project','plan','state','district','school','batch','from','to','type'].map(k=>html.indexOf('data-ernet="'+k+'"'));
 assert.ok(order.every((v,i)=>v>=0&&(!i||v>order[i-1])),'Requested filter order');
 let cards=html.split('<div class="ernet-kpis">')[1].split('<div class="sponsor-three">')[0];
 assert.equal((cards.match(/class="kpi"/g)||[]).length,7,'Seven KPI cards');
 assert.ok(html.includes('ernet-seven-kpis'),'Scoped seven-column style');
 assert.ok(html.includes('<label>From Date<input')&&html.includes('<label>To Date<input'),'Separate date labels');
 assert.ok(!html.includes('class="ernet-date-range"'));
 assert.ok(html.includes('data-ernet="type" title="Teachers"'),'Selected full-text tooltip');
 assert.ok(html.includes('title="Select From Date"'),'Date tooltip');
 const filters=html.split('class="ernet-filters ernet-ordered-filters">')[1].split('ernet-filter-reset')[0];
 assert.equal((filters.match(/<select data-ernet="[^"]+" title="/g)||[]).length,7,'All dropdowns have selected-text tooltips');
 assert.ok(!/<option[^>]*value=[^>]*>/.test(filters.replace(/<option[^>]*title="[^"]*"[^>]*>/g,'')),'All options have full-text tooltips');
 assert.ok(metrics.ts.every(t=>/teacher/i.test(t.designation||t.name||'')),'Default metrics are Teachers');
 await win.TestHooks.act('ernetReset');
 assert.ok(nodes.main.innerHTML.includes('<option value="Teachers" title="Teachers" selected>Teachers</option>'),'Reset defaults to Teachers');
}
await win.TestHooks.act('ernetBatchVisual','Upcoming');
 assert.ok(nodes.dialogBody.innerHTML.includes('batch')||nodes.dialogBody.innerHTML.includes('Batch'));
}
console.log('Six role dashboard render, scoped metrics and status drill-down checks passed (non-browser fixture).');
})().catch(e=>{console.error(e);process.exitCode=1});
