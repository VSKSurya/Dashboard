/* Executes the actual rendering/scope code using a minimal non-browser DOM fixture.
   This detects runtime/model errors; it does NOT validate browser layout or DOM behavior. */
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');const root=path.resolve(__dirname,'..');const nodes={};class Node{constructor(id){this.id=id;this.value='';this.events={};this.className='';this.options=[];this.classList={add(){},remove(){},toggle(){},contains(){return false}}}set innerHTML(v){this.html=v;for(let m of String(v).matchAll(/id="([^"]+)"/g))nodes[m[1]]||=new Node(m[1])}get innerHTML(){return this.html||''}set textContent(v){this.text=v}get textContent(){return this.text||''}addEventListener(k,f){this.events[k]=f}setAttribute(){}append(){}focus(){}}
['main','sidebar','menu','persona','projectContext','identity','nav','message','editor','dialogTitle','dialogBody','signout','cancelDialog'].forEach(id=>nodes[id]=new Node(id));let store=new Map(),session=new Map();let win={addEventListener(){}};const doc={getElementById:id=>nodes[id]||null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},createElement:()=>new Node('dynamic'),body:{dataset:{page:'dashboard'},classList:{add(){},remove(){}}}};const ctx={window:win,document:doc,console,Intl,Date,JSON,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},sessionStorage:{getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location:{search:'',hash:'#dashboard',href:'http://example.test/training-tracker/'},crypto,structuredClone,Blob,setTimeout:()=>0,navigator:{},URL,URLSearchParams};function setPage(raw){let [page,batch]=raw.replace(/^#/, '').split('/');doc.body.dataset.page=page;ctx.location.search=batch?'?batch='+encodeURIComponent(batch):'';}vm.createContext(ctx);for(let f of ['catalogue.js','decisions.js','rules.js']){vm.runInContext(fs.readFileSync(path.join(root,'assets',f),'utf8'),ctx);Object.assign(ctx,win)}vm.runInContext(fs.readFileSync(path.join(root,'assets/app.js'),'utf8').replace('window.TrainingReview={','window.TestHooks={act,submitEdit,commitImport,setStage:v=>stage=v,setData:v=>db=v};window.TrainingReview={'),ctx);
const R=ctx.Rules;
ctx.confirm=()=>true;
ctx.FormData=class {constructor(f){return Object.entries(f.values)}};
nodes.editor.showModal=function(){this.open=true};nodes.editor.close=function(){this.open=false};
const form=(kind,values)=>({dataset:{kind},values,querySelectorAll:()=>[],querySelector:()=>null});
const data=()=>win.TrainingReview.getData();
const setDB=fn=>{let d=data();fn(d);store.set('training-tracker-review-v1',JSON.stringify(d));win.TestHooks.setData(d)};
// db is lexical to the application: update via injected test-only hook instead.

(async()=>{
let checks=0;const check=(x)=>{assert.ok(x);checks++};
let b=data().batches[0],d=data(),t={batch:'B1',name:'New Teacher',mobile:'9000000099',email:'',otp:'123456'};
b.start=R.today();b.end=R.add(R.today(),3);b.capacity=4;d.batches[0]=b;
check(Object.keys(R.trainee(t,b,d,true)).length===0);
check(R.trainee({...t,batch:'B2'},b,d,true).batch);
check(R.trainee(t,{...b,open:false},d,true).batch);
check(!R.trainee(t,{...b,open:false},d,false).batch);
check(R.trainee(t,{...b,capacity:2},d,true).name);
check(R.trainee({...t,mobile:' 9000-000-001 '},b,d,false).mobile);
check(R.trainee({...t,mobile:'',email:' SAMPLE.ONE@EXAMPLE.TEST '},b,d,false).mobile);
check(!R.trainee({...t,batch:'B2',mobile:'9000000001'},d.batches[1],d,false).mobile);
check(R.trainee({...t,name:' '},b,d,false).name);
check(R.trainee({...t,mobile:'',email:''},b,d,false).mobile);
check(R.trainee({...t,email:'invalid'},b,d,false).email);
check(R.trainee(t,{...b,start:R.add(R.today(),-1)},d,true).batch);
d.settings.registration='period';check(!R.trainee(t,{...b,start:R.add(R.today(),-1)},d,true).batch);
check(R.trainee(t,{...b,start:R.add(R.today(),1)},d,true).batch);
check(R.trainee(t,{...b,closed:true},d,false).batch);
// Exercise real handlers with an entrant whose trainee persona has no assignment to B3.
nodes.persona.events.change({target:{value:'A6'}});
setDB(d=>{d.batches[2].start=R.today();d.batches[2].end=R.add(R.today(),1);d.batches[2].open=true;});
setPage('#registration/B3');win.TrainingReview.render();check(nodes.batchArea.innerHTML.includes('B-DEMO-03'));check(nodes.batchArea.innerHTML.includes('Verify OTP &amp; register')||nodes.batchArea.innerHTML.includes('Verify OTP & register'));check(!nodes.batchArea.innerHTML.includes('9000000001'));
setPage('#registration/DOES-NOT-EXIST');win.TrainingReview.render();check(!nodes.batchArea.innerHTML.includes('B-DEMO-01'));
setPage('#registration/B3');win.TrainingReview.render();
let f=form('registration',{batch:'B3',name:'New Teacher',mobile:'9000000099',email:'',otp:'123456'});nodes.editForm=f;nodes.otpNotice=new Node('otpNotice');
let before=data().trainees.length;await win.TestHooks.submitEdit(f);check(data().trainees.length===before);
await win.TestHooks.act('requestRegistrationOTP','B3');check(nodes.otpNotice.textContent.includes('SIMULATED OTP'));
f.values.mobile='9000000088';await win.TestHooks.submitEdit(f);check(data().trainees.length===before);
f.values.mobile='9000000099';await win.TestHooks.submitEdit(f);check(data().trainees.length===before+1);check(!data().trainees.at(-1).approved);check(nodes.message.textContent.includes(data().trainees.at(-1).id));
await win.TestHooks.act('requestRegistrationOTP','B3');await win.TestHooks.submitEdit(f);check(data().trainees.length===before+1);
setDB(d=>{d.batches[2].open=false});
await win.TestHooks.act('openLookup','B3');f=form('lookup',{batch:'B3',mobile:'9000000099',email:'',otp:'123456'});nodes.editForm=f;
await win.TestHooks.submitEdit(f);check(!nodes.dialogBody.innerHTML.includes(data().trainees.at(-1).id));
await win.TestHooks.act('requestLookupOTP','B3');await win.TestHooks.submitEdit(f);check(nodes.dialogBody.innerHTML.includes(data().trainees.at(-1).id));
// Scoped admin/trainer controls and bulk commit revalidation.
nodes.persona.events.change({target:{value:'A5'}});await win.TestHooks.act('enableRegistration','B3');check(!data().batches[2].open);
await win.TestHooks.act('enableRegistration','B2');check(data().batches[1].open);
let copied='';ctx.navigator.clipboard={writeText:async value=>{copied=value}};ctx.location.href='http://example.test/training-tracker/trainees.html?batch=B2';
await win.TestHooks.act('copyLink','B2');check(copied==='http://example.test/training-tracker/registration.html?batch=B2');check(!copied.includes('#'));
await win.TestHooks.act('openRegistrationPage','B2');check(ctx.location.href==='registration.html?batch=B2');
setPage('#registration/B2');win.TrainingReview.render();check(nodes.batchArea.innerHTML.includes('B-DEMO-02'));

await win.TestHooks.act('closeRegistration','B2');check(!data().batches[1].open);copied='';await win.TestHooks.act('copyLink','B2');check(copied==='');
setPage('#trainees');win.TrainingReview.render();nodes.importPreview=new Node('importPreview');
const record={id:'TEST-UPLOAD',batch:'B2',name:'Excel Teacher',mobile:'9000000077',email:'',approved:false};
win.TestHooks.setStage({type:'trainees',batch:'B2',results:[{data:record,errors:[]}]});
await win.TestHooks.commitImport();check(data().trainees.some(t=>t.id==='TEST-UPLOAD'));
setDB(d=>{d.batches[1].capacity=1});
win.TestHooks.setStage({type:'trainees',batch:'B2',results:[{data:{...record,id:'OVERFLOW',mobile:'9000000066'},errors:[]}]});
await win.TestHooks.commitImport();check(!data().trainees.some(t=>t.id==='OVERFLOW'));check(nodes.importPreview.innerHTML.includes('capacity'));
await win.TestHooks.act('closeBatch','B2');check(!data().batches[1].closed);check(nodes.message.textContent.includes('Approve the entire trainee list'));
await win.TestHooks.act('approveList','B2');check(data().trainees.find(t=>t.id==='TEST-UPLOAD').approved);
await win.TestHooks.act('closeBatch','B2');check(!data().batches[1].closed);check(nodes.message.textContent.includes('completion criteria'));
console.log(checks+' registration rule and actual action-handler assertions passed. Non-browser fixture; visual checks not covered.');
})().catch(e=>{console.error(e);process.exitCode=1});
