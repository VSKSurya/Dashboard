/* KGBV programme seed derived from the supplied KGBV Training Tracker prototype.
   All school/contact records generated here are synthetic demonstration data. */
(function (root) {
    'use strict';

    const projectCode = 'ERN-KGBV-26';
    const programme = {
        id: 'P3',
        code: projectCode,
        name: 'Digital Classrooms in 750 KGBVs',
        start: '2026-09-01',
        end: '2029-08-31',
        poDate: '2026-09-01',
        installationDeadline: '2027-01-01',
        initialTrainingDeadline: '2027-03-01',
        description: 'KGBV digital classroom rollout based on the ERNET RFP Section IV. PO and implementation dates are prototype assumptions; all sample school and participant data are synthetic.'
    };
    const states = [
        ['Andhra Pradesh',196,'28','AP','Telugu',['Srikakulam','Vizianagaram','Bapatla','Kurnool','Anantapur','Prakasam']],
        ['Arunachal Pradesh',11,'12','AR','Hindi',['Papum Pare','Lower Subansiri','Changlang']],
        ['Assam',40,'18','AS','Assamese',['Dhubri','Goalpara','Barpeta','Karbi Anglong']],
        ['Chhattisgarh',40,'22','CG','Hindi',['Bastar','Dantewada','Korba','Surguja']],
        ['Gujarat',3,'24','GJ','Gujarati',['Dahod']],
        ['Haryana',14,'06','HR','Hindi',['Nuh','Palwal']],
        ['Jharkhand',46,'20','JH','Hindi',['Dumka','Pakur','Godda','West Singhbhum']],
        ['Karnataka',8,'29','KA','Kannada',['Raichur','Yadgir']],
        ['Manipur',1,'14','MN','Manipuri',['Churachandpur']],
        ['Rajasthan',45,'08','RJ','Hindi',['Barmer','Banswara','Dungarpur','Jaisalmer']],
        ['Sikkim',1,'11','SK','Nepali',['Gyalshing']],
        ['Telangana',165,'36','TS','Telugu',['Adilabad','Nalgonda','Khammam','Mahabubnagar','Nirmal']],
        ['Uttar Pradesh',180,'09','UP','Hindi',['Bahraich','Shravasti','Balrampur','Sonbhadra','Lalitpur','Chitrakoot']]
    ];
    const trainerCounts = {AP:6,AR:1,AS:2,CG:2,GJ:1,HR:1,JH:2,KA:1,MN:1,RJ:2,SK:1,TS:5,UP:5};
    const trainerNames = ['Meera Iyer','Arjun Reddy','Sneha Rao','Bikash Das','Iasha Lyngdoh','Prakash Sahu','Neha Srivastava','Amit Meena','Sasmita Nayak','Farhan Qureshi','Lakshmi Naidu','Kiran Babu','Pooja Tirkey','Rahul Soren','Divya Rathore','Vivek Chauhan','Sunita Netam','Harish Gowda','Thoibi Devi','Pema Bhutia','Ramesh Goud','Swathi Reddy','Naveen Kumar','Shalini Mishra','Ajay Pal','Kavita Rajput','Manoj Yadav','Geeta Kumari','Srinivas Rao','Anjali Patel','Deepak Malik'];
    const phases = [
        {phase:1,short:'Orientation',hours:2,days:1,hoursPerDay:[2],type:'Induction',start:'2026-11-01',end:'2026-12-31',notes:['Module 1: working and operational aspects of the digital classroom solution (2 h) · pre-assessment']},
        {phase:2,short:'Device & content use',hours:8,days:2,hoursPerDay:[4,4],type:'Induction',start:'2026-11-15',end:'2027-02-15',notes:['Module 2: using the digital teaching device and multimedia content (4 h)','Module 2: technology-enabled lessons and blended-learning practice (4 h) · assessment + feedback']},
        {phase:3,short:'Digital skills',hours:5,days:1,hoursPerDay:[5],type:'Induction',start:'2026-12-01',end:'2027-02-28',audience:'Teachers and students',notes:['Joint Module 3: cyber safety, digital creativity and AI awareness (5 h) · post-assessment + feedback']},
        {phase:4,short:'Refresher I',hours:5,days:1,hoursPerDay:[5],type:'Refresher 1',start:'2027-11-01',end:'2028-01-31',notes:['Module 4: implementation challenges and teacher queries (5 h) · feedback']},
        {phase:5,short:'Refresher II',hours:5,days:1,hoursPerDay:[5],type:'Refresher 2',start:'2028-05-01',end:'2028-07-31',notes:['Module 5: reinforcing adoption and resolving operational issues (5 h) · feedback']}
    ];
    const studentPlan = {id:'KGBV-ST',code:'TP-KGBV-STU',name:'Student skill development',type:'Other',days:3,hours:15,hoursPerDay:[5,5,5],audience:'Students',windowStart:'2026-12-01',windowEnd:'2027-02-28',schedule:['Pre-assessment + Module 1: cyber safety and digital responsibility (5 h)','Module 2: digital creativity with Canva / Adobe Express (5 h)','Module 3: AI awareness (5 h) + post-assessment + feedback']};
    const holidays = [
        ['2026-11-08','Diwali','National',''],['2026-11-24','Guru Nanak Jayanti','National',''],['2026-12-25','Christmas','National',''],
        ['2027-01-26','Republic Day','National',''],['2027-01-14','Sankranti','State','Andhra Pradesh'],['2027-01-15','Magh Bihu','State','Assam'],
        ['2027-03-04','Holi','National',''],['2026-11-01','Karnataka Rajyotsava','State','Karnataka']
    ];

    function addDays(value, days) {
        const date = new Date(value + 'T12:00:00Z');
        date.setUTCDate(date.getUTCDate() + days);
        return date.toISOString().slice(0, 10);
    }
    function dayDiff(a, b) {
        return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
    }
    function hash(value) {
        let n = 7;
        for (const ch of value) n = (n * 31 + ch.charCodeAt(0)) | 0;
        return n >>> 0;
    }
    function weekday(value) {
        return new Date(value + 'T12:00:00Z').getUTCDay();
    }
    function nextWorkday(value) {
        let date = value;
        while (weekday(date) === 0) date = addDays(date, 1);
        return date;
    }
    function uniqueId(prefix, collection) {
        let n = 1;
        while (collection.some(item => item.id === prefix + n)) n++;
        return prefix + n;
    }
    function ensureSampleTraineeCoverage(db) {
        const project = db.projects.find(item => item.code === projectCode);
        if (!project) return db;
        db.trainees ||= [];

        const sampleNames = {
            AP: ['Lakshmi Devi', 'Ravi Kumar'], AR: ['Tana Taba', 'Mimi Koyu'],
            AS: ['Rina Das', 'Rahul Bora'], CG: ['Sita Netam', 'Amit Markam'],
            GJ: ['Kanku Vasava', 'Mehul Rathwa'], HR: ['Sunita Malik', 'Poonam Dahiya'],
            JH: ['Anita Murmu', 'Birsa Soren'], KA: ['Savitha Nayak', 'Manjula Gowda'],
            MN: ['Ningthoujam Rani', 'Thokchom Ibemcha'], RJ: ['Kamla Meena', 'Gita Garasia'],
            SK: ['Pema Bhutia', 'Dawa Lepcha'], TS: ['Swapna Naik', 'Rajitha Nayak'],
            UP: ['Shabnam Khan', 'Suman Pal']
        };
        states.forEach(([state,,,abbr]) => {
            const school = db.schools.find(item => item.project === project.id && item.state === state);
            if (!school) return;
            const schoolIds = batch => batch.schoolIds || [batch.school];
            const teacherBatch = db.batches.find(batch => batch.project === project.id && batch.plan === 'KGBV-PH1' && schoolIds(batch).includes(school.id));
            const studentBatch = db.batches.find(batch => batch.project === project.id && batch.plan === 'KGBV-ST' && schoolIds(batch).includes(school.id));
            const [teacherName, studentName] = sampleNames[abbr];
            if (teacherBatch && !db.trainees.some(item => item.id === 'KGBV-SAMPLE-T-' + abbr)) {
                db.trainees.push({
                    id:'KGBV-SAMPLE-T-' + abbr, batch:teacherBatch.id, name:teacherName,
                    mobile:'', email:'', approved:false, created:'2026-10-14', state,
                    district:school.district, school:school.id, schoolName:school.name,
                    udise:school.udise, gender:'Female', designation:'Teacher',
                    traineeType:'Teacher', sample:true
                });
            }
            if (studentBatch && !db.trainees.some(item => item.id === 'KGBV-SAMPLE-S-' + abbr)) {
                db.trainees.push({
                    id:'KGBV-SAMPLE-S-' + abbr, batch:studentBatch.id, name:studentName,
                    mobile:'', email:'', approved:true, created:'2026-10-14', state,
                    district:school.district, school:school.id, schoolName:school.name,
                    udise:school.udise, grade:'IX', traineeType:'Student', sample:true
                });
            }
        });
        return db;
    }
    function merge(db, rules) {
        if (!db || !Array.isArray(db.projects)) return db;
        if (db.projects.some(p => p.code === projectCode)) return ensureSampleTraineeCoverage(db);
        const projectId = programme.id;
        db.projects.push({...programme});

        const schools = [];
        const stateMetadata = [];
        states.forEach(([state,count,udisePrefix,abbr,language,districts]) => {
            const districtTotals = Object.create(null);
            const stateSchools = [];
            for (let i = 0; i < count; i++) {
                const district = districts[i % districts.length];
                districtTotals[district] = (districtTotals[district] || 0) + 1;
                const schoolNumber = String(i + 1).padStart(3, '0');
                const id = 'KGBV-' + abbr + '-' + schoolNumber;
                const serial = String(100000000 + ((i * 7919 + hash(abbr)) % 899999999)).padStart(9, '0');
                let commissionDate = addDays('2026-09-22', (i * 13 + hash(abbr)) % 93);
                if ((i + hash(state)) % 20 === 0) commissionDate = addDays('2027-01-04', i % 31);
                const school = {
                    id,
                    name:'KGBV ' + district + ' ' + districtTotals[district],
                    udise:udisePrefix + serial,
                    state,
                    district,
                    location:district + ', ' + state,
                    language,
                    commissionDate,
                    targetTeachers:10,
                    targetStudents:100,
                    project:projectId,
                    projects:[projectId]
                };
                schools.push(school);
                stateSchools.push(school);
            }
            stateMetadata.push({state,abbr,schools:stateSchools,trainerCount:trainerCounts[abbr]});
        });
        db.schools.push(...schools);

        const trainers = [];
        let nameIndex = 0;
        stateMetadata.forEach(meta => {
            for (let i = 0; i < meta.trainerCount; i++) {
                const id = 'TR-' + String(1001 + trainers.length);
                const isRohan = meta.abbr === 'UP' && i === 0;
                trainers.push({id,code:id,name:isRohan ? 'Rohan Verma' : trainerNames[nameIndex++ % trainerNames.length],category:trainers.length % 3 ? 'Employee' : 'Consultant',state:meta.state,status:'Active',projects:[projectId]});
            }
        });
        trainers.push({id:'TR-' + String(1001 + trainers.length),code:'TR-' + String(1001 + trainers.length),name:'Ritu Saini',category:'Consultant',state:'Telangana',status:'Inactive',projects:[projectId]});
        db.trainers.push(...trainers);
        trainers.filter(t => t.status === 'Active').forEach((trainer,index) => {
            db.availability.push({id:'KGBV-AV-' + String(index + 1).padStart(3,'0'),trainer:trainer.id,start:'2026-10-15',end:programme.end,project:projectId});
        });

        const plans = phases.map(phase => ({
            id:'KGBV-PH' + phase.phase,
            project:projectId,
            code:'TP-KGBV-M' + phase.phase,
            name:'Phase ' + phase.phase + ' · ' + phase.short,
            type:phase.type,
            days:phase.days,
            hours:phase.hours,
            hoursPerDay:phase.hoursPerDay,
            phase:phase.phase,
            audience:phase.audience || 'Teachers',
            windowStart:phase.start,
            windowEnd:phase.end,
            dayNotes:Object.fromEntries(phase.notes.map((note,index) => [String(index + 1),note])),
            description:'KGBV teacher programme · ' + phase.hours + ' hours · ' + phase.days + ' training day(s). Window: ' + phase.start + ' to ' + phase.end + '.'
        }));
        plans.push({...studentPlan,project:projectId,phase:0,kind:'student',description:'KGBV student programme · 15 hours over three days. Window: ' + studentPlan.windowStart + ' to ' + studentPlan.windowEnd + '.',dayNotes:Object.fromEntries(studentPlan.schedule.map((note,index) => [String(index + 1),note]))});
        db.plans.push(...plans);

        const trainerByState = new Map();
        trainers.filter(t => t.status === 'Active').forEach(trainer => {
            const list = trainerByState.get(trainer.state) || [];
            list.push(trainer);
            trainerByState.set(trainer.state,list);
        });
        const clusters = [];
        stateMetadata.forEach(meta => {
            const byDistrict = new Map();
            meta.schools.forEach(school => {
                const list = byDistrict.get(school.district) || [];
                list.push(school);
                byDistrict.set(school.district,list);
            });
            let clusterNumber = 0;
            byDistrict.forEach(list => {
                for (let i = 0; i < list.length; i += 3) {
                    clusterNumber++;
                    const members = list.slice(i,i + 3);
                    clusters.push({
                        id:meta.abbr + '-C' + String(clusterNumber).padStart(3,'0'),
                        state:meta.state,
                        district:members[0].district,
                        schools:members,
                        trainer:trainerByState.get(meta.state)[(clusterNumber - 1) % trainerByState.get(meta.state).length],
                        index:clusterNumber
                    });
                }
            });
        });

        const batches = [];
        const firstTeacherBatchByState = new Map();
        const firstStudentBatchByState = new Map();
        clusters.forEach(cluster => {
            const groupsInState = clusters.filter(x => x.state === cluster.state).length;
            const fraction = ((cluster.index - 1) / Math.max(1,groupsInState)) * 0.8 + (hash(cluster.id) % 400) / 10000;
            const latestCommission = cluster.schools.map(s => s.commissionDate).sort().pop();
            let previousEnd = null;
            phases.forEach(phase => {
                const windowSpan = dayDiff(phase.start,phase.end);
                let start = addDays(phase.start,Math.round(fraction * windowSpan * 0.75));
                if (phase.phase <= 3) {
                    const ready = addDays(latestCommission,2);
                    if (start < ready) start = ready;
                }
                if (previousEnd && start < addDays(previousEnd,7)) start = addDays(previousEnd,7);
                start = nextWorkday(start);
                const lastStart = addDays(phase.end,-(phase.days - 1));
                if (start > lastStart) start = nextWorkday(lastStart);
                const batchId = 'KGBV-T' + phase.phase + '-' + cluster.id;
                const schoolIds = cluster.schools.map(s => s.id);
                const batch = {
                    id:batchId,
                    code:batchId,
                    project:projectId,
                    plan:'KGBV-PH' + phase.phase,
                    school:schoolIds[0],
                    schoolIds,
                    cluster:cluster.id,
                    kind:'teacher',
                    phase:phase.phase,
                    state:cluster.state,
                    district:cluster.district,
                    referenceLocation:'Teacher cluster · ' + cluster.id + ' · ' + cluster.schools.map(s => s.name).join('; '),
                    start,
                    end:addDays(start,phase.days - 1),
                    capacity:schoolIds.length * 10,
                    teacherTarget:schoolIds.length * 10,
                    studentTarget:0,
                    targetParticipants:schoolIds.length * 10,
                    trainer:cluster.trainer.id,
                    open:phase.phase <= 3,
                    closed:false,
                    created:'2026-10-01T00:00:00.000Z'
                };
                batches.push(batch);
                if (phase.phase === 1 && !firstTeacherBatchByState.has(cluster.state)) firstTeacherBatchByState.set(cluster.state,batch);
                previousEnd = batch.end;
            });
            cluster.schools.forEach((school,schoolIndex) => {
                const studentSpan = dayDiff(studentPlan.windowStart,studentPlan.windowEnd);
                let start = addDays(studentPlan.windowStart,Math.round(fraction * studentSpan * 0.75) + schoolIndex * 4 + (hash(school.id) % 4));
                const ready = addDays(school.commissionDate,5);
                if (start < ready) start = ready;
                const lastStart = addDays(studentPlan.windowEnd,-(studentPlan.days - 1));
                if (start > lastStart) start = lastStart;
                start = nextWorkday(start);
                const batchId = 'KGBV-ST-' + school.id;
                const batch = {
                    id:batchId,
                    code:batchId,
                    project:projectId,
                    plan:studentPlan.id,
                    school:school.id,
                    schoolIds:[school.id],
                    cluster:cluster.id,
                    kind:'student',
                    phase:0,
                    state:school.state,
                    district:school.district,
                    referenceLocation:'Student training · ' + cluster.id,
                    start,
                    end:addDays(start,studentPlan.days - 1),
                    capacity:100,
                    teacherTarget:0,
                    studentTarget:100,
                    targetParticipants:100,
                    trainer:cluster.trainer.id,
                    openReg:false,
                    open:false,
                    closed:false,
                    created:'2026-10-01T00:00:00.000Z'
                };
                batches.push(batch);
                if (!firstStudentBatchByState.has(school.state)) firstStudentBatchByState.set(school.state,batch);
            });
        });
        db.batches.push(...batches);

        holidays.forEach(([date,name,scope,state],index) => db.holidays.push({id:'KGBV-H' + String(index + 1),project:projectId,date,name,scope,state:state || ''}));

        const resourceRows = [
            ['Digital Classroom Solution – Orientation Deck','PPT','KGBV-PH1',1,'English','4.1 MB'],
            ['Operations Guide: Digital Teaching Device','PDF','KGBV-PH1',1,'English','3.1 MB'],
            ['User Manual: Digital Teaching Device','PDF','KGBV-PH1',1,'Telugu','3.3 MB'],
            ['User Manual: Digital Teaching Device','PDF','KGBV-PH1',1,'Hindi','3.2 MB'],
            ['Using the Digital Teaching Device (video)','Video','KGBV-PH2',1,'English','142 MB'],
            ['Navigating the 2D/3D Multimedia Content','Video','KGBV-PH2',1,'Hindi','118 MB'],
            ['Designing Technology-enabled Lessons','PPT','KGBV-PH2',2,'English','5.6 MB'],
            ['Blended-Learning Lesson Plan Templates','PDF','KGBV-PH2',2,'English','1.2 MB'],
            ['Pre-training Assessment (teachers)','Form','KGBV-PH1',1,'English','10 questions'],
            ['Daily Feedback Form','Form','KGBV-PH1',1,'English','6 questions'],
            ['Facilitator Guide: Joint Digital Skills Session','PDF','KGBV-PH3',1,'English','2.0 MB'],
            ['Post-training Assessment (teachers)','Form','KGBV-PH3',1,'English','15 questions'],
            ['Refresher I – Implementation FAQ','PDF','KGBV-PH4',1,'English','1.0 MB'],
            ['Troubleshooting Common Device Issues (video)','Video','KGBV-PH4',1,'Hindi','88 MB'],
            ['Refresher II – Sustaining Adoption','PPT','KGBV-PH5',1,'English','4.4 MB'],
            ['Cyber Safety & Digital Responsibility – Activity Book','PDF','KGBV-ST',1,'Hindi','6.2 MB'],
            ['Spotting Fake News & Online Scams (video)','Video','KGBV-ST',1,'English','64 MB'],
            ['Digital Creativity with Canva & Adobe Express','PPT','KGBV-ST',2,'English','9.8 MB'],
            ['Simple Animation & Video Editing Project Pack','Other','KGBV-ST',2,'English','HTML5 package'],
            ['AI Around Us – Classroom Activities','PPT','KGBV-ST',3,'Telugu','7.1 MB'],
            ['Student Pre-assessment','Form','KGBV-ST',1,'English','12 questions'],
            ['Student Post-assessment','Form','KGBV-ST',3,'English','12 questions'],
            ['Self-paced Digital Learning Modules','Other','KGBV-ST',1,'English','Online modules']
        ];
        resourceRows.forEach((row,index) => {
            const [name,type,plan,day,language,size] = row;
            const id = 'KGBV-R' + String(index + 1).padStart(2,'0');
            const isForm = type === 'Form';
            const formPurpose = isForm ? (name.toLowerCase().includes('pre-') ? 'Pre-training assessment' : name.toLowerCase().includes('post-') ? 'Post-training assessment' : 'Feedback') : '';
            db.resources.push({
                id,name,type,project:projectId,common:false,seed:true,created:'2026-09-05T00:00:00.000Z',uploadedBy:'A1',
                filename:isForm ? '' : name.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase() + '.' + ({PPT:'pptx',PDF:'pdf',Video:'mp4',Other:'zip'}[type] || 'bin'),
                size,language,formType:isForm?(formPurpose === 'Feedback' ? 'Feedback' : 'Assessment'):'',formPurpose,
                question:isForm ? 'Sample KGBV programme check-in question. Configure the approved form before live use.' : '',answer:'',
                demoOnly:isForm
            });
            db.links.push({id:'KGBV-L' + String(index + 1).padStart(2,'0'),plan,resource:id,days:[day],created:'2026-09-05T00:00:00.000Z'});
        });

        const teacherBatch = firstTeacherBatchByState.get('Uttar Pradesh');
        const selectedSchool = schools.find(s => s.state === 'Uttar Pradesh');
        const sampleTrainees = [
            ['Anita Yadav','Female','Teacher'],['Sunita Devi','Female','Teacher'],['Kavita Kumari','Female','Teacher'],['Rekha Singh','Female','Teacher'],['Pooja Yadav','Female','Teacher']
        ];
        sampleTrainees.forEach(([name,gender,designation],index) => {
            const id = 'KGBV-TT-' + String(index + 1).padStart(3,'0');
            db.trainees.push({id,batch:teacherBatch.id,name,mobile:'90000001' + String(index + 1).padStart(2,'0'),email:'teacher' + (index + 1) + '@example.test',approved:index === 0,created:'2026-10-14',state:'Uttar Pradesh',district:selectedSchool.district,school:selectedSchool.id,schoolName:selectedSchool.name,udise:selectedSchool.udise,gender,designation,traineeType:'Teacher',sample:true});
        });
        const studentBatch = firstStudentBatchByState.get('Uttar Pradesh');
        ['Asha Yadav','Fatima Khan','Meena Devi'].forEach((name,index) => {
            const school = schools.find(s => s.id === studentBatch.schoolIds[0]);
            db.trainees.push({id:'KGBV-ST-' + String(index + 1).padStart(3,'0'),batch:studentBatch.id,name,mobile:'',email:'',approved:true,created:'2026-10-14',state:school.state,district:school.district,school:school.id,schoolName:school.name,udise:school.udise,grade:['VIII','IX','X'][index],traineeType:'Student',sample:true});
        });

        const userFor = id => db.users.find(user => user.id === id);
        db.users.forEach(user => {
            if (['A1','A2','A3','A4','A5','A6'].includes(user.id)) user.projects = [...new Set([...(user.projects || []),projectId])];
        });
        if (userFor('A1')) { userFor('A1').name = 'KGBV Platform Admin'; }
        if (userFor('A2')) { userFor('A2').name = 'ERNET KGBV Monitoring'; }
        if (userFor('A3')) { userFor('A3').name = 'Uttar Pradesh State Admin'; userFor('A3').state = 'Uttar Pradesh'; }
        if (userFor('A4')) { userFor('A4').name = selectedSchool.name + ' Admin'; userFor('A4').state = selectedSchool.state; userFor('A4').school = selectedSchool.id; }
        if (userFor('A5')) { userFor('A5').name = 'Rohan Verma'; userFor('A5').state = 'Uttar Pradesh'; userFor('A5').trainer = teacherBatch.trainer; }
        if (userFor('A6')) { userFor('A6').name = 'Anita Yadav'; userFor('A6').state = 'Uttar Pradesh'; userFor('A6').school = selectedSchool.id; userFor('A6').trainee = 'KGBV-TT-001'; }

        db.certificateTemplates ||= [];
        if (!db.certificateTemplates.some(template => template.project === projectId)) {
            db.certificateTemplates.push({id:'KGBV-CT-01',code:'CT-ERN-KGBV-01',project:projectId,program:'KGBV Digital Classrooms',signatory:'Programme Director',color:'#1e3b33',layout:'Landscape',organizationLogo:'',projectLogo:'',created:'2026-10-14T00:00:00.000Z'});
        }
        db.template = {...(db.template || {}),program:'KGBV Digital Classrooms in 750 KGBVs',signatory:'Programme Director',color:'#1e3b33'};
        db.kgbvProgram = {
            code:projectCode,
            source:'KGBV Training Tracker – Prototype.html',
            stateCount:states.length,
            schoolTarget:schools.length,
            teacherHours:phases.reduce((sum,phase) => sum + phase.hours,0),
            studentHours:studentPlan.hours,
            initialTrainingDeadline:programme.initialTrainingDeadline,
            assumptions:['PO date 1 Sep 2026','Installation deadline 1 Jan 2027','Initial training deadline 1 Mar 2027','Sample contacts and UDISE values are synthetic.']
        };
        return ensureSampleTraineeCoverage(db);
    }

    root.KGBVScenario = {projectCode,merge};
})(window);
