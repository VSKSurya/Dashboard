(function(root) {
    'use strict';
    const R = {
        today() {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Kolkata',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date())
        },
        add(d, n) {
            let x = new Date(d + 'T12:00:00Z');
            x.setUTCDate(x.getUTCDate() + Number(n));
            return x.toISOString().slice(0, 10)
        },
        norm: v => String(v || '').trim().toLowerCase(),
        date: v => /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && Number.isFinite(Date.parse(v + 'T12:00:00Z')) && new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) === v,
        integer: v => Number.isInteger(Number(v)) && Number(v) > 0,
        batchPlan(b, db) {
            return b.planSnapshot || db.plans.find(p => p.id === b.plan)
        },
        batchLinks(b, db) {
            let links = b.planSnapshot?.links || db.links.filter(l => R.linkEffective(l, b, db.settings));
            let extras = db.links.filter(l => l.plan === b.plan && l.applyExisting === true && !links.some(x => x.id === l.id));
            return [...links, ...extras].filter(l => {
                let r = db.resources.find(r => r.id === l.resource);
                return r && (r.common || !r.project || r.project === b.project) && (!l.project || l.project === b.project) && !(l.days || []).some(d => d > Number(R.batchPlan(b, db)?.days))
            })
        },
        resourceFile(file, settings) {
            if (!file) return 'Select a resource file.';
            let ext = String(file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase(),
                allowed = ['ppt', 'pptx', 'pdf', ...(settings.multimediaExtensions || ['mp4', 'webm'])];
            return allowed.includes(ext) ? '' : 'This format is not approved in the prototype. Ask the administrator to review the multimedia allowlist.'
        },
        linkEffective(l, b, settings) {
            return l.plan === b.plan && ((l.applyExisting === undefined ? !!settings.propagate : l.applyExisting === true) || !l.created || !b.created || l.created <= b.created)
        },
        resourceLink(x, r, db) {
            let e = {},
                p = db.plans.find(p => p.id === x.plan);
            if (!p || p.status === 'Draft' || p.status === 'Inactive') e.plan = 'Select an active reusable training plan.';
            if (!r) e.resource = 'Select an available resource.';
            else if (!r.common && r.project !== x.project) e.resource = 'Only common resources can be reused across projects.';
            if (db.links.some(l => l.plan === x.plan && l.resource === r?.id)) e.plan = 'This resource is already linked to this training plan.';
            return e
        },
        project(p, db) {
            let e = {};
            if (!p.name) e.name = 'Select a project name.';
            if (!p.code) e.code = 'Project code is required in this demo.';
            if (db.projects.some(x => x.id !== p.id && R.norm(x.code) === R.norm(p.code))) e.code = 'Project code already exists.';
            if (!R.date(p.start) || !R.date(p.end) || p.start >= p.end) e.end = 'Project start date must be before end date.';
            if (db.batches.some(b => b.project === p.id && (b.start < p.start || b.end > p.end))) e.end = 'Existing batches must remain within the project period.';
            return e
        },
        plan(p, db) {
            let e = {};
            const project = db.projects.find(x => x.id === p.project),
                minimumDays = project?.code === 'ERN-KGBV-26' ? 1 : 4;
            if (!String(p.name || '').trim()) e.name = 'Enter a Training Plan Name.';
            if (!['Induction', 'Refresher 1', 'Refresher 2', 'Other'].includes(p.type)) e.type = 'Select a Training Type.';
            if (!R.integer(p.days) || Number(p.days) < minimumDays) e.days = 'A Training Plan must contain at least ' + minimumDays + ' training day(s).';
            if (p.code && db.plans.some(x => x.id !== p.id && R.norm(x.code) === R.norm(p.code))) e.code = 'Training Plan Code already exists.';
            if ((db.links || []).some(l => l.plan === p.id && (l.days || []).some(d => d > Number(p.days)))) e.days = 'Resources are assigned outside this duration. Remove or reassign them before saving.';
            return e
        },
        planDays(days, p) {
            return !days.length || days.some(d => !R.integer(d) || Number(d) > Number(p.days)) ? 'Select one or more days within the training duration.' : ''
        },
        batch(b, db) {
            let e = {};
            let p = db.projects.find(x => x.id === b.project),
                pl = db.plans.find(x => x.id === b.plan),
                s = db.schools.find(x => x.id === b.school),
                schoolIds = [...new Set(Array.isArray(b.schoolIds) && b.schoolIds.length ? b.schoolIds : [b.school])],
                assignedSchools = schoolIds.map(id => db.schools.find(x => x.id === id)).filter(Boolean),
                isKgbv = p?.code === 'ERN-KGBV-26';
            if (!p) e.project = 'Select a project.';
            if (!pl || (['Draft', 'Inactive'].includes(pl.status) && !db.batches.some(x => x.id === b.id && x.plan === b.plan))) e.plan = 'Select an active reusable training plan.';
            let assigned = db.batches.find(x => x.id === b.id && x.plan === b.plan)?.planSnapshot || pl;
            if (assigned && R.date(b.start) && R.date(b.end) && b.end !== R.add(b.start, Number(assigned.days) - 1)) e.end = 'Batch dates must cover the selected training plan duration (' + assigned.days + ' days).';
            if (!s) e.school = 'Select a valid school / UDISE code.';
            else if (!s.location) e.school = 'Actual location is unavailable for this UDISE entry.';
            if (!R.date(b.start) || !R.date(b.end) || b.start > b.end) e.end = 'Batch end date must be on or after start date (prototype assumption).';
            else if (p && (b.start < p.start || b.end > p.end)) e.end = 'Batch dates must fall within the project period.';
            if (isKgbv && pl) {
                if (!schoolIds.length || assignedSchools.length !== schoolIds.length) e.school = 'Select valid KGBV UDISE codes for the batch.';
                if (pl.kind === 'teacher' && assignedSchools.length > 3) e.school = 'A KGBV teacher cluster can include up to three schools.';
                if (pl.kind === 'student' && assignedSchools.length !== 1) e.school = 'A KGBV student batch must be for one school.';
                if (assignedSchools.some(x => x.state !== assignedSchools[0]?.state || x.district !== assignedSchools[0]?.district)) e.school = 'All schools in a KGBV teacher cluster must be in the same state and district.';
                if (pl.windowStart && (b.start < pl.windowStart || b.end > pl.windowEnd)) e.start = 'Training dates must fall within the programme window: ' + pl.windowStart + ' to ' + pl.windowEnd + '.';
                const readinessDays = pl.kind === 'student' ? 5 : (Number(pl.phase) <= 3 ? 2 : 0);
                if (readinessDays && assignedSchools.some(x => x.commissionDate && b.start < R.add(x.commissionDate, readinessDays))) e.start = 'Training must be scheduled after the KGBV installation readiness period.';
                const requiredCapacity = assignedSchools.reduce((total,school) => total + (pl.kind === 'student' ? Number(school.targetStudents || 100) : Number(school.targetTeachers || 10)),0);
                if (R.integer(b.capacity) && Number(b.capacity) < requiredCapacity) e.capacity = 'Capacity must cover the KGBV target participants for every selected school (' + requiredCapacity + ').';
            }
            if (!R.integer(b.capacity)) e.capacity = 'Enter a positive whole-number capacity (prototype assumption).';
            if (db.trainees.filter(t => t.batch === b.id).length > Number(b.capacity)) e.capacity = 'Capacity cannot be lower than current enrollment.';
            if (!(db.trainers || []).some(t => t.id === b.trainer)) e.trainer = 'Select a valid trainer.';
            else if (!db.availability.some(a => a.trainer === b.trainer && a.start <= b.start && a.end >= b.end)) e.trainer = 'Trainer is not available for the entire batch period.';
            if (s && db.holidays.some(h => h.date >= b.start && h.date <= b.end && (!h.project || h.project === b.project) && (!h.state || assignedSchools.some(school => school.state === h.state)))) e.start = 'Training conflicts with an applicable holiday.';
            if (db.batches.some(x => x.id !== b.id && R.norm(x.code) === R.norm(b.code))) e.code = 'Batch ID already exists (prototype global scope).';
            if (!String(b.code || '').trim()) e.code = 'Batch Unique ID is required.';
            if (typeof b.open !== 'boolean') e.open = 'Open Registration must be Yes or No.';
            return e
        },
        mobile: v => String(v || '').replace(/[\s()-]/g, '').trim(),
        contact(t) {
            let e = {};
            if (!String(t.mobile || '').trim() && !String(t.email || '').trim()) e.mobile = 'Enter a mobile number or email.';
            if (t.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(t.email).trim())) e.email = 'Enter a valid email address.';
            return e
        },
        sameContact(a, b) {
            return !!((R.mobile(a.mobile) && R.mobile(a.mobile) === R.mobile(b.mobile)) || (R.norm(a.email) && R.norm(a.email) === R.norm(b.email)))
        },
        registrationWindow(b, db) {
            if (!b) return 'The batch link is invalid.';
            if (b.closed) return 'This batch is finally closed.';
            if (!b.open) return 'Open registration is disabled or closed for this batch.';
            let day = R.today();
            if (db.settings.registration === 'day1' ? day !== b.start : day < b.start || day > b.end) return 'Registration is outside the provisional window: ' + (db.settings.registration === 'day1' ? 'batch start date only.' : 'batch dates only.');
            if (db.trainees.filter(t => t.batch === b.id).length >= Number(b.capacity)) return 'Batch capacity has been reached.';
            return ''
        },
        trainee(t, b, db, self) {
            let e = {};
            if (!b) {
                e.batch = 'Select an applicable batch.';
                return e
            }
            if (t.batch && t.batch !== b.id) e.batch = 'Registration must refer to the applicable batch.';
            if (b.closed) e.batch = 'This batch is finally closed; import policy requires clarification.';
            if (db.trainees.filter(x => x.batch === b.id).length >= Number(b.capacity)) e.name = 'Batch capacity has been reached.';
            if (!String(t.name || '').trim()) e.name = 'Name is required for the synthetic demo.';
            Object.assign(e, R.contact(t));
            if (db.trainees.some(x => x.batch === b.id && R.sameContact(x, t))) e.mobile = 'This trainee is already registered in this batch.';
            if (self) {
                let gate = R.registrationWindow(b, db);
                if (gate) e.batch = gate;
                if (t.otp !== '123456') e.otp = 'Enter the displayed demo OTP to verify.'
            }
            return e
        },
        attendance(date, b) {
            if (!R.date(date)) return 'Select a valid attendance date.';
            if (date > R.today()) return 'Attendance cannot be marked for a future date.';
            if (!b || date < b.start || date > b.end) return 'Attendance date must be within the batch period (prototype assumption).';
            return ''
        },
        eligibility(t, db) {
            let b = db.batches.find(x => x.id === t.batch),
                p = b ? R.batchPlan(b, db) : null,
                s = db.settings;
            if (s.attendance === '' || s.pass === '' || s.assessment === '' || s.feedback === '') return {
                eligible: false,
                message: 'Business clarification required: completion criteria are not configured.'
            };
            if (!t.approved) return {
                eligible: false,
                message: 'Trainer approval is required.'
            };
            if (R.today() < b.end) return {
                eligible: false,
                message: 'Required training days have not elapsed.'
            };
            let marks = db.attendance.filter(x => x.trainee === t.id && x.batch === b.id),
                present = marks.filter(x => x.status === 'Present').length;
            let pct = 100 * present / p.days;
            let forms = R.batchLinks(b, db).map(x => db.resources.find(r => r.id === x.resource)).filter(x => x && x.formType);
            let subs = db.submissions.filter(x => x.trainee === t.id);
            if (marks.length < p.days) return {
                eligible: false,
                message: 'Attendance evidence for the required training days is incomplete.'
            };
            if (pct < Number(s.attendance)) return {
                eligible: false,
                message: 'Attendance is below the provisional completion threshold.'
            };
            if (s.assessment === 'yes' && !forms.some(f => f.formType === 'Assessment')) return {
                eligible: false,
                message: 'A required assessment must be linked to the plan.'
            };
            if (s.feedback === 'yes' && !forms.some(f => f.formType === 'Feedback')) return {
                eligible: false,
                message: 'A required feedback form must be linked to the plan.'
            };
            for (let f of forms) {
                if ((f.formType === 'Assessment' && s.assessment === 'yes') || (f.formType === 'Feedback' && s.feedback === 'yes')) {
                    let sub = subs.find(x => x.resource === f.id);
                    if (!sub) return {
                        eligible: false,
                        message: 'Required assessments/forms are incomplete.'
                    };
                    if (f.formType === 'Assessment' && Number(sub.score) < Number(s.pass)) return {
                        eligible: false,
                        message: 'Assessment score is below the provisional pass threshold.'
                    }
                }
            }
            return {
                eligible: true,
                message: 'Meets provisional review criteria; production eligibility still requires sign-off.',
                attendance: pct
            }
        },
    };
    if (typeof module !== 'undefined') module.exports = R;
    root.Rules = R;
})(typeof window === 'undefined' ? globalThis : window);
