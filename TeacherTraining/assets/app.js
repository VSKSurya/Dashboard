/* All application data is synthetic. Browser scopes demonstrate behavior, not security. */
(function() {
    'use strict';
    if (window.DemoAuth?.authorized === false) return;
    const $id = id => document.getElementById(id),
        esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        } [c])),
        R = Rules,
        KEY = 'training-tracker-review-v1',
        uid = p => p + '-' + crypto.randomUUID(),
        roles = ['Schoolnet Admin', 'ERNET Admin', 'State Admin', 'School Admin', 'Trainer', 'Trainee'],
        nav = [
            ['dashboard', '◫', 'Overview'],
            ['projects', '▣', 'Projects'],
            ['plans', '▤', 'Training Plans'],
            ['batches', '▦', 'Batches'],
            ['trainees', '♧', 'Trainees & Approval'],
            ['registration', '↗', 'Open Registration'],
            ['resources', '▧', 'Learning Resources'],
            ['content', '▧', 'Content Library'],
            ['attendance', '✓', 'Attendance'],
            ['assessments', '≡', 'Assessments & Feedback'],
            ['completion', '◇', 'Completion Review'],
            ['certificates', '✧', 'Certificates'],
            ['masters', '⚙', 'Master Data'],
            ['reports', '▥', 'MIS Reports'],
            ['users', '♙', 'Users & Roles'],
            // ['audit', '↺', 'Audit Trail'],
            // ['review', '?', 'Rules & Decisions']
        ];
    let today = R.today(),
        db, active = 'A1',
        context = 'all',
        current = 'dashboard',
        reportType = 'Project Training Summary',
        reportRows = [],
        reportHeaders = [],
        stage = null,
        dialogForm = null,
        uploadBusy = false,
        otpChallenge = null;
    const pageRoutes = {
        dashboard: 'index.html',
        projects: 'projects.html',
        plans: 'training-plans.html',
        batches: 'batches.html',
        trainees: 'trainees.html',
        registration: 'registration.html',
        resources: 'resources.html',
        content: 'content-library.html',
        attendance: 'attendance.html',
        assessments: 'assessments.html',
        completion: 'completion.html',
        certificates: 'certificates.html',
        masters: 'masters.html',
        reports: 'reports.html',
        users: 'users.html',
        audit: 'audit.html',
        review: 'rules-decisions.html'
    };

    function pageHref(id, param) {
        let href = pageRoutes[id] || pageRoutes.dashboard;
        return param ? href + '?batch=' + encodeURIComponent(param) : href
    }

    function go(id, param) {
        location.href = pageHref(id, param)
    }

    function routeBatch() {
        return new URLSearchParams(location.search).get('batch') || ''
    }
    const TEACHER_FEEDBACK_QUESTIONS = ["1. Name of the School", "2. Name of the Teacher", "3. Contact Number", "4. The objectives of the training were clearly defined.", "5. The training content/topics were relevant.", "6. Participation and interaction were encouraged.", "7. The smart classroom components—Teaching Device (K-Yan) its features, and the use of multimedia content—were covered during the training.", "8. The training content was well organised and easy to follow.", "9. This training experience will be useful in my teaching.", "10. The trainer was knowledgeable about the training topics.", "11. The trainer was well prepared.", "12. I am comfortable using digital technology for teaching.", "13. Teaching Device (K-Yan) is easy to integrate into classroom teaching.", "14. A smart classroom will benefit students' learning.", "15. A smart classroom is effective in saving time during teaching.", "16. A smart classroom makes it easier to explain abstract or difficult concepts.", "17. The multimedia content provided in the smart classroom solution is useful.", "18. Overall feedback about the smart classroom", "19. Any suggestions for improvement?", "20. Are there any other topics that should have been covered?"];

    function teacherFeedbackFields(t, b) {
        return TEACHER_FEEDBACK_QUESTIONS.map((q, i) => ['q' + (i + 1), q, i >= 3 && i <= 17 ? 'radio' : i === 2 ? 'tel' : i >= 18 ? 'textarea' : 'text', true, i >= 3 && i <= 16 ? [1, 2, 3, 4, 5].map(v => ({
            id: String(v),
            name: String(v)
        })) : i === 17 ? ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].map(v => ({
            id: v,
            name: v
        })) : undefined])
    }

    function teacherFeedbackData(t, b) {
        return {
            q1: lookup(db.schools, b?.school),
            q2: t?.name || '',
            q3: t?.mobile || ''
        }
    }

    function sample() {
        let start = R.add(today, -3),
            end = today;
        return {
            version: 1,
            projects: [{
                id: 'P1',
                name: 'Digital Teaching Karnataka',
                code: 'ODOO-101',
                start: R.add(today, -90),
                end: R.add(today, 180),
                description: 'SAMPLE · Digital classroom development.'
            }, {
                id: 'P2',
                name: 'Student Learning Maharashtra',
                code: 'ODOO-102',
                start: R.add(today, -30),
                end: R.add(today, 120),
                description: 'SAMPLE · Student learning project.'
            }],
            plans: [{
                id: 'PL1',
                project: 'P1',
                code: 'TP-DEMO-01',
                name: 'Digital Teaching · Induction',
                type: 'Induction',
                days: 4,
                description: 'SAMPLE · Four-day training.'
            }, {
                id: 'PL2',
                project: 'P2',
                code: 'TP-DEMO-02',
                name: 'Student learning',
                type: 'Other',
                days: 2,
                description: 'SAMPLE'
            }],
            schools: [{
                id: 'S1',
                udise: 'DEMO-UDISE-01',
                name: 'Sample Government School',
                state: 'Karnataka',
                district: 'Bengaluru',
                location: 'Bengaluru, Karnataka'
            }, {
                id: 'S2',
                udise: 'DEMO-UDISE-02',
                name: 'Sample Municipal School',
                state: 'Maharashtra',
                district: 'Pune',
                location: 'Pune, Maharashtra'
            }],
            trainers: [{
                id: 'T1',
                name: 'Sample Trainer A',
                code: 'TR-DEMO-01',
                category: 'Employee'
            }, {
                id: 'T2',
                name: 'Sample Trainer B',
                code: 'TR-DEMO-02',
                category: 'Consultant'
            }],
            availability: [{
                id: 'AV1',
                trainer: 'T1',
                start: R.add(today, -100),
                end: R.add(today, 200)
            }, {
                id: 'AV2',
                trainer: 'T2',
                start: R.add(today, -100),
                end: R.add(today, 200)
            }],
            holidays: [],
            batches: [{
                id: 'B1',
                code: 'B-DEMO-01',
                project: 'P1',
                plan: 'PL1',
                school: 'S1',
                referenceLocation: 'Sample reference',
                start,
                end,
                capacity: 20,
                trainer: 'T1',
                open: true,
                closed: false,
                created: '2020-01-01T00:00:00Z'
            }, {
                id: 'B2',
                code: 'B-DEMO-02',
                project: 'P1',
                plan: 'PL1',
                school: 'S1',
                referenceLocation: '',
                start: R.add(today, 7),
                end: R.add(today, 10),
                capacity: 25,
                trainer: 'T1',
                open: false,
                closed: false,
                created: '2020-01-01T00:00:00Z'
            }, {
                id: 'B3',
                code: 'B-DEMO-03',
                project: 'P2',
                plan: 'PL2',
                school: 'S2',
                referenceLocation: '',
                start: R.add(today, 14),
                end: R.add(today, 15),
                capacity: 15,
                trainer: 'T2',
                open: false,
                closed: false,
                created: '2020-01-01T00:00:00Z'
            }],
            trainees: [{
                id: 'U1',
                batch: 'B1',
                name: 'Sample Teacher One',
                mobile: '9000000001',
                email: 'sample.one@example.test',
                approved: true,
                created: today
            }, {
                id: 'U2',
                batch: 'B1',
                name: 'Sample Teacher Two',
                mobile: '9000000002',
                email: 'sample.two@example.test',
                approved: false,
                created: today
            }],
            resources: [{
                id: 'RES1',
                name: 'Sample classroom guide',
                type: 'Sample text',
                project: 'P1',
                common: false,
                seed: true,
                created: '2019-01-01T00:00:00Z',
                uploadedBy: 'A1'
            }, {
                id: 'FORM1',
                name: 'Sample pre-assessment',
                type: 'Form',
                formType: 'Assessment',
                question: 'Which method encourages learner participation?',
                answer: 'Discussion',
                project: 'P1',
                common: false,
                created: '2019-01-01T00:00:00Z',
                uploadedBy: 'A1'
            }, {
                id: 'FORM2',
                name: 'Sample post-feedback',
                type: 'Form',
                formType: 'Feedback',
                question: 'What helped you most in this training?',
                answer: '',
                project: 'P1',
                common: false,
                created: '2019-01-01T00:00:00Z',
                uploadedBy: 'A1'
            }],
            links: [{
                id: 'L1',
                plan: 'PL1',
                resource: 'RES1',
                days: [1, 2, 3, 4],
                created: '2019-01-01T00:00:00Z'
            }, {
                id: 'L2',
                plan: 'PL1',
                resource: 'FORM1',
                days: [1],
                created: '2019-01-01T00:00:00Z'
            }, {
                id: 'L3',
                plan: 'PL1',
                resource: 'FORM2',
                days: [4],
                created: '2019-01-01T00:00:00Z'
            }],
            attendance: [],
            submissions: [],
            accesses: [],
            audit: [],
            activity: [],
            profiles: [],
            certificates: [],
            users: [{
                id: 'A1',
                name: 'Sample Central Admin',
                role: roles[0],
                projects: ['P1', 'P2']
            }, {
                id: 'A2',
                name: 'Sample ERNET Admin',
                role: roles[1],
                projects: ['P1']
            }, {
                id: 'A3',
                name: 'Sample State Admin',
                role: roles[2],
                projects: ['P1'],
                state: 'Karnataka'
            }, {
                id: 'A4',
                name: 'Sample School Admin',
                role: roles[3],
                projects: ['P1'],
                school: 'S1'
            }, {
                id: 'A5',
                name: 'Sample Trainer',
                role: roles[4],
                projects: ['P1'],
                trainer: 'T1'
            }, {
                id: 'A6',
                name: 'Sample Trainee',
                role: roles[5],
                projects: ['P1'],
                trainee: 'U1'
            }],
            settings: {
                attendance: '',
                pass: '',
                assessment: '',
                feedback: '',
                registration: 'day1',
                trainerUpload: false,
                propagate: false
            },
            template: {
                program: 'Teacher Development',
                signatory: 'Sample Authorized Signatory',
                color: '#17365d',
                organizationLogo: '',
                projectLogo: ''
            }
        }
    }
    try {
        db = JSON.parse(localStorage.getItem(KEY)) || sample();
        if (db.version !== 1) throw Error('Unsupported stored version.')
    } catch (e) {
        db = sample();
        setTimeout(() => message('Stored data could not be read. Sample data is shown; use Reset to replace corrupted storage. ' + e.message, true), 100)
    }
    db.certificateTemplates ||= ['Navy', 'Orange', 'Portrait'].map((name, i) => ({
        id: 'CT' + (i + 1),
        code: 'CT-DEMO-0' + (i + 1),
        project: 'P1',
        program: 'Digital Teaching Karnataka',
        signatory: 'Sample Program Director',
        color: i === 1 ? '#ce5e00' : i === 2 ? '#275d8c' : '#17365d',
        layout: i === 2 ? 'Portrait' : 'Landscape',
        organizationLogo: 'data:image/webp;base64,UklGRn4PAABXRUJQVlA4WAoAAAAQAAAANgEASgAAQUxQSDQNAAAB8Eftvyqn/f89JxMmycQGS4PPguA2tLgGSlOcUIUGyqSGQ6CGM3VBOrhD6jihinPoC+oSSgoRJGiKhA5xAjOPP/Y+e+9zpqz18hURE0D/HK4z4Jm0p4a1i1ZXteOjqWnjnkzuGn9XiOs1atykJ3vH35Vyl4Woitp5VC5m+knwA9kfNlYQPmxjHgTLftk4tREnQRPvpzNRE48XCus9d9OPJ85mHlzzXGMj2i/Jhe6phe1kJmriURJejXugqUx3TdhFRBM1pUcyB3PswFlN7eEb8EkNu4o7u2dPnLOzDABSpeLnFwI4uXWR5+31h0vBfZWXXQn98pP9dabk3oZ+eZZIk1U3IPrbuAhFfb8HcPbjt15bdaQSAA50EJt6CYKlx2VWXwM3r5pMdil0/WeYtDN+KJ3AqQsjb8q8BJxqS2zcRwDmSFSZXQIUvFyH+FUG7WHWcYisbb7gZHa1kqht0DnOioYkWGNDALIFKRYFjg8A7OpI3Jjx5wEEloaLEEU+coWzoiEpbPhmJQBoNjEiavByGYCcIRHEtz9TwXzp5qZOW30dwExOWwCFqye52U8YN3fy+xUAJIYBFY1Jdw2wRsz5G+B/O4KER1YCu3WI7MVMC5IdwByzkGD/61D5eTWpZjlA0UMkGLEIAH6tJUQ0mvnNQmqHM9ggRTQSQAKJLmH6kX7NE8A7nL7A1QbET2NItz8Am1BkAbCS9CNOY7dQp+tA2RCSHQ5kCdA3AK6TdCSzkgSnQfGZBIlW14Cb95K42w/gVF0xJ7OYVO9g8LJcRAB5JPwIkyhAicAqzgggldTQJ8A9QqMBDBKgZ/CHyL03gcBQkt+MUpEMAH/IURGAVwU8UH6tmdA954BAEslOAIDfI4UcjEdZCieQLEXXcVQsUYq+xaec53ExVJULaC60A0BrkejyIoGa5wC8SQqbA3UENgHIVOAD4NEbBwMv1BKw7AWwguQ/AYB0IWLSlCVyUHqv1CloYp3lRuErzjt4g1TRcXQVOgGggwhl/B6mtx3A2QgVdBQ9BNJN0OW2ETgSqvccgJIaCuJ8ANDXTL8CwKXaMr/gSzGXXOytI5wP0VzdXAwSugTALSTaDwDGktIxv3czU3gejJ2uE/UngBWk8lXmN4uJGucDwK92CQ0ZBlFDG6dVN1JX/V67UBaAg4q+B1ASpUbcBLNhcFkd3hQA6KIk7jYA3G8iR9tSANhpMZlSKdmPASBFSScA2EbBF1VoFLy8bACFViX0JfOxmehhBm+bqaoz1HzDmYphKpYy4/4GxsDw4gimNQB8TWonMDesZqJ5DFKFDmGHIZvgNF9oLgAE5ofLZTOd/gYOGYfHmReZ+YpaMWhnKst2prKXSAbSDTkbDNTxFtjTw2Sqga0RfPZKE6xjtjOTFYXeYkaZiiIzAaAwwSwuBAUNqWSAb3uIdWNuk0nOu+XL9HrChFlMFuNWRDnMbHNRg6sAkF3VFGGJ2UFCvS5zgM8aiTzK+MyimvO0GW6FENFfTLKqg8xCk1HPSgA4UMWQEh83AAQLxW3loXyGVc9tqvJMeb/ePDOgOhGBTVGVwXjNRs8xWGOIeJAQDcrhAAdr6qQyd8ySSfI+vXdM4dR7TtVm5i3T0TIGzxvxjIvtPvDNkiCiKpMLOTgezxvOwBF8b5nGx3hUZTAvmy/0IOMfbEAi6T4RTERVVwQYHLZyunHaBN9sU1Qloj+Yj1R9xTxqPqp2GgBKXCYIuRlURL0uMnBzqnGeCL7RZiglItrOZKn6hWkZBNSyGADO1zKOdgcZ1c1jjnEoh1kcfJ3N8CvzAhOooegGAF9IMNDgAAD8ZDeuozsquKhZOQDU5CxkTgafrcwEy5iWDEapqQ0Am8gkyRI0g8EWi2GqzUQrmE6c9gzaBh19YYKBDB1jdqsZzgwzkVPI8imDN/6GXn9boh+TxKFvmdWKBjUy0QjjrlbhPM0Emir5EMC5UIPeTVFF9p8ZjDKFrYPVTAW3qok1ZLrx+jDlDZQ0vn3aRLbzhs0jri0PAD5VEVMEYBwZ0wP7dEYATcWo7p9M5WkzTMJ0M2l4Saw2gEB1Hn0KALuUfI63TURjjLrm4FF/Br0VTAeQGWrQIUzXGQO0l6Aut8A1LqIA3c20GtdihboC+I50HWcAYKKCFOA+gQzjQn4wKJX0lzHn4qRq3wQqWpFoODNdbCjQQecloI8MjVbSg3lAYiZKbEpiVKUBq4TeBDBCj5peA+AfIdW6GKdJ8CsApxXcAvAujxrdNGQzCdr2AsAPsRK2wwAeI+E45i2hey7BZ9VZCDwuRYtUJDHDxZqVYTfJzmPiVPUG8LRAvA84YBGgFhcABGZbxVpdBF4XyQFQGS5VFwB26dDA2wb8Ei1C9j0A8Et9IfvngP9pEu/O7BSJPAJsI90fgaVy1j0KJjJeoeongWlSnzI9VUX7AcwJ5d3zE5BXk4TjvgaAnx+06IWMuQmgkcBQsLNlLEuZ8jY6lOJXdrwmidu8APDXOJtezxPA9QEkbt/N3Bnj4EUkZQJw60wBUDFIihw5UjWzmfIRYTr2fscANJdpV8bstSuiLAA4OaV5hL3VjOvAoZokaRlxHgDy5g9pXrN6o36vngGAA8SNHbvwYICD4yvTnDrtXlyXC27lV28/bWdoSKmiI9VI+oFsALi8cEBDR3zntKMANtUhUfdrm65C95aPDQBAII6Iqjw9PxPcXxZPqi1GzXwiNVJnby6CbrGPLQF7nkTbPvvqV5Xg/vn+9JE1VNyfUQHB/KctJB/6xAE/JPP68lwQd+t4Ie7kUMvjKgLvVSGFoSO/h2j5p+1JHKp/ICJyQDhZgvr7BRKhfLWQF5KJKojsQ978OutSYd6BdxNDSHGNYe/s/C3/WkHuL595J/WMJt0Il3g1nToucRuPqkz3Sf3QmVQ3HPv+0fzrBbn7Fj0cTbIu1fUYq0s4VoZS05/RiXIprylUxyUZpeauGfN8pkj5liT6J2rdlDc+3bUvY82Lfez0PwKjWvZ+xO0eP8XtHtGvQ4PQf4rEj1x8+Aokb+dlvNw15J8aoSN/gvLLC2r98yLqKAwtH/5PixQY7PunRb2rBn3+TwuqtaTUgMJ5Yf+8IIp8eMNJFf5jyweG0z89HR1SZi78MGO3pmm7Mz5cOHP4fdH0/wE6nTJ1XPx4mViHTSbe6XQ664ZJ1HHF6zR1RQjYnXEiTV2RPKurtVT9xIH3hRlS28mvIWFpntQ3Qaq20+l01rEZEee0S9ictUXinPx4gQQXP1YEkPGC75FoCrwno4Gt3NdNyIvccF4mXALJyBDJxAaeAz4xq/sEAJSsq2tAJvjpQtGeAgDInxoulgm24sv26jKQLOFCpkgG+JqABn6yMbs9bKLEG0CBVSrd41mgwT9EDPNNgCQlsV8hcOS917cU4a8+RqzysMkiTXJw84MZs7aV4ac6Eqs8nkVHUNknWDZ5WLdQuodtZkwaKbTkowAPSiUSEY3BRauYv7MJzscoCPkSJ9sREVXbjrJmBrhItkY+PnYQEdXag98ixFxERC8hJ1iSSVZDIkmbpBeOT8XHaixX0VpoF7LDDfsSaxWMxvnqxLX+AwdMtBo7LcS1fYt5CkKL4bzLrcPL8f7SKCV0At2F0pZjvmGdspAkdwzDSbe6y2UxTbU7lfVJtz0KQ+XoItrc3SJuBurRHoxWUutOoKZYVL6/vVGu9v78KJl6KLPpGangcRwiwTx0l0tAZdTd5Mf09PT0BWKP4xDRKOxT4foRm0mMkpAVZhTNx3KZXviJiKh1Mr+Zuo+9Xq+3l8AMLBHZhlEylo7HsJaC5HOv1+vtJ7Y7PT09fbJB3HyxL/EMUVRpoI5Eic9XDhyKlaG1eMOw8Gz0lhiIbxgv+B513DSBt/CmyIeYIFTs81UAu+3BwvWIcTMMmuFwOBwxQnG3K2KJ6BO8JHEk4zf4HrSQVMz5O+2Nos7+s1FiHZDLtE5mf8Y0dT0cDocjTGAq1ovsxSNChzKO488+pN6wFIfD4QgXG+RwOByRBqWR9BR843K5XNNwXCKRqt3AoyRH/ZBlM4oWYrlYRDnqkW7IJSSqc5FkN5yx6NmK0UDIRXVK0C94kklWQyJJm+In6LtkaDwuRCqgdHgMs+cFBgvRJizTG4aLVtNYz+MhvQn4niRoBvLC7m4t8FcadzcWSIX+jrdVOC7dLjSKegQuiTW/hRRe4wKkkmloJK404XUoxf1SYacx6+72FtYQtzMuW2UoEZXNFNBAwDDyQoyeDCC9fQjVnvoXNlhMRGtQOKkqUfysMswlKRqKsgZ/a/lsC5FyHztdL+QCevAoD0lStAX7VNBHJrCflaDBBYC/HKj0hJCZLLPK4b9cEEDxGFJAe7DDgKv5+fn5c01U4mMHimj8BL2JGt+t10zLsOiM1aYKeDUX0+CQ1k5govYIr/oeLUGgu/a6yDotgUOJ2hdiFPHcjszsg576ZOA6LUGOqP6cg7nZe1+sQeLrtASmuaY1VfW6xp2ol6CtE3ld6y7l1fjdRf59FlZQOCAkAgAAUB0AnQEqNwFLAD7RWqdNqCSjoiKUDwkAGglnbuDBd/gCyAPwA/QD+AJ5OU2eJ/4v+DP6S/gn10otjysK4E4nKi/IFCo6Vv6pKBLaHQkJ8rp4vpowiz9WhLcgJEYK0mhixVxbucWRD4/mF4TPWfy+CghESuN00k80ofl74ArnLzUWXydVE3h7zwWjrf1sHrR/I7qNGqDTPgiSMAUh4OaVypyciM8MNgToevqXCb6nnJX6vgISzz9koINRKejJ8H1UJS9dkW6R0wRW49/hPndmvdy+zwfRmN4zPvQTF9L+FQBxpDeGEOl2VU1uvfTSrmi/k42gAPzTgJ/R6dHQdC7w5SqDIZNAxSJGEgKmadKTc1CuFt2ZClDU7A6zgOsMxmyhsF8awX+lbH82HeFY29sqIySnP7Ar3+6raBlJRM8OiphbsKmYMSmdil7lvCC9mWMRVQfF2O1R5JXVUfKL9VmCBugfezIM3+30H4QeKn++NG6sltjxFsGSh8A05amfBX//uic8N+EGI0Q7ylbxSkZTJVH9PmH5SuoS3Ln4Tn/D6y7RBKdd3q3GQO0xBhyWjyMSUsrB+lnaUSN1nUuFOYDZmEkw/bAbJ0QQAoxORLoUiHcnQYgiQVgp//NP/+eh//9BwN8iFiTlx61ZPyp2F07t2smwZ2izMGI76hFIc102VvTLBiO+l9VH3Jkk960Hv6Ej32xfpoaf//9gWbrIR65yv3YAAAA=',
        projectLogo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCAxODAgNzAiPjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iNzAiIHJ4PSI4IiBmaWxsPSIjZjVmOGZiIi8+PHRleHQgeD0iOTAiIHk9IjMxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMTczNjVkIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTciIGZvbnQtd2VpZ2h0PSJib2xkIj5EaWdpdGFsIFRlYWNoaW5nPC90ZXh0Pjx0ZXh0IHg9IjkwIiB5PSI1MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NzU4YSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjExIj5TQU1QTEUgUFJPSkVDVDwvdGV4dD48L3N2Zz4=',
        created: new Date().toISOString()
    }));
    db.certificateRecords ||= [];

    if (window.KGBVScenario) {
        const hadKgbvScenario = db.projects.some(project => project.code === window.KGBVScenario.projectCode);
        const traineeCountBeforeKgbvMerge = db.trainees.length;
        db = window.KGBVScenario.merge(db, R);
        if (!hadKgbvScenario || db.trainees.length !== traineeCountBeforeKgbvMerge) {
            try {
                localStorage.setItem(KEY, JSON.stringify(db));
                setTimeout(() => message(hadKgbvScenario ? 'KGBV sample trainees added for all programme states.' : 'KGBV programme data added. Existing projects and browser records were retained.'), 100)
            } catch (e) {
                setTimeout(() => message('KGBV programme data was loaded for this view but could not be saved to browser storage: ' + e.message, true), 100)
            }
        }
    }

    function user() {
        if (window.DemoAuth?.publicGuest) return {
            id: 'GUEST',
            name: 'Registration visitor',
            role: 'Trainee',
            projects: []
        };
        return db.users.find(x => x.id === active) || db.users[0]
    }

    function central() {
        return user()?.role === roles[0]
    }

    function trainer() {
        return user()?.role === roles[4]
    }

    function trainee() {
        return user()?.role === roles[5]
    }

    function visibleProject(p) {
        return central() || user()?.projects?.includes(p.id)
    }

    function projects() {
        return db.projects.filter(visibleProject)
    }

    function batches() {
        let u = user();
        return db.batches.filter(b => {
            let schoolIds = schoolIdsForBatch(b), schools = schoolIds.map(id => db.schools.find(s => s.id === id)).filter(Boolean);
            return projects().some(p => p.id === b.project) && (context === 'all' || b.project === context) && (!u.state || b.state === u.state || schools.some(s => s.state === u.state)) && (!u.school || schoolIds.includes(u.school)) && (!trainer() || b.trainer === u.trainer) && (!trainee() || db.trainees.some(t => t.id === u.trainee && t.batch === b.id))
        })
    }

    function uniquePlanCode() {
        let code;
        do {
            code = uid('TP')
        } while (db.plans.some(p => R.norm(p.code) === R.norm(code)));
        return code
    }

    function planUsed(id) {
        return db.batches.some(b => b.plan === id)
    }

    function plans() {
        let u = user();
        return db.plans.filter(p => projects().some(x => x.id === p.project) && (context === 'all' || p.project === context) && (!(trainer() || trainee()) || batches().some(b => b.plan === p.id)))
    }

    function trainees() {
        return db.trainees.filter(t => batches().some(b => b.id === t.batch) && (!trainee() || t.id === user().trainee))
    }

    function canManageBatches(b) {
        return (central() || (roles.slice(1, 4).includes(user()?.role) && user().batchManage === true)) && (!b || !b.id || batches().some(x => x.id === b.id))
    }

    function batchCandidateAllowed(b) {
        let u = user(), schoolIds = schoolIdsForBatch(b), schools = schoolIds.map(id => db.schools.find(s => s.id === id)).filter(Boolean);
        return projects().some(p => p.id === b.project) && (context === 'all' || context === b.project) && (!u.state || b.state === u.state || schools.some(s => s.state === u.state)) && (!u.school || schoolIds.includes(u.school))
    }

    function canBatch(b) {
        return !!b && batches().some(x => x.id === b.id) && (canManageBatches(b) || (trainer() && b.trainer === user().trainer))
    }

    function lookup(arr, id, key = 'name') {
        return arr.find(x => x.id === id)?.[key] || '—'
    }

    function schoolIdsForBatch(b) {
        return Array.isArray(b?.schoolIds) && b.schoolIds.length ? [...new Set(b.schoolIds)] : b?.school ? [b.school] : []
    }

    function schoolNamesForBatch(b) {
        return schoolIdsForBatch(b).map(id => lookup(db.schools,id)).filter(name => name !== '—')
    }

    function schoolUdisesForBatch(b) {
        return schoolIdsForBatch(b).map(id => lookup(db.schools,id,'udise')).filter(code => code !== '—')
    }

    function schoolLocationsForBatch(b) {
        return [...new Set(schoolIdsForBatch(b).map(id => lookup(db.schools,id,'location')).filter(location => location !== '—'))]
    }

    function mask(v) {
        return v ? '•••' + String(v).slice(-3) : '—'
    }

    function nameMask(t) {
        return t ? 'Trainee ' + t.id.slice(0, 10) : '—'
    }

    function message(s, error = false) {
        $id('message').textContent = s;
        $id('message').className = error ? 'error' : ''
    }

    function deny() {
        message('You do not have permission to perform this action in this scope.', true)
    }

    function redact(v) {
        if (Array.isArray(v)) return v.map(redact);
        if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ['name', 'mobile', 'email', 'password'].includes(k) ? mask(x) : redact(x)]));
        return v
    }

    function visibleAudit(a) {
        if (central() || a.actor === active) return true;
        if (trainer() || trainee() || !projects().some(p => p.id === a.project)) return false;
        let batch = a.after?.batch || a.before?.batch || db.batches.find(b => b.id === a.entity)?.id || db.trainees.find(t => t.id === a.entity)?.batch;
        return !batch || batches().some(b => b.id === batch)
    }

    function audit(action, entity, before, after, project) {
        before = redact(before);
        after = redact(after);
        db.audit.push({
            id: uid('AUD'),
            date: new Date().toISOString(),
            actor: active,
            action,
            entity,
            project: project || context,
            before,
            after
        })
    }

    function commit(fn, text) {
        let prev = JSON.stringify(db);
        try {
            fn();
            localStorage.setItem(KEY, JSON.stringify(db));
            message(text || 'Changes saved in this browser.');
            return true
        } catch (e) {
            db = JSON.parse(prev);
            message('Changes were not saved: ' + e.message + ' Browser storage may be full or blocked.', true);
            return false
        }
    }

    function activity(type, result) {
        commit(() => db.activity.push({
            date: new Date().toISOString(),
            user: active,
            type,
            result
        }), 'Demo activity recorded.')
    }

    function options(arr, value, key = 'name', blank = true) {
        return (blank ? '<option value="">Select…</option>' : '') + arr.map(x => '<option value="' + esc(x.id) + '"' + (x.id === value ? ' selected' : '') + '>' + esc(x[key]) + '</option>').join('')
    }

    function btn(label, action, id = '', cls = '') {
        return '<button type="button" class="btn ' + cls + '" data-action="' + action + '" data-id="' + esc(id) + '">' + label + '</button>'
    }

    function badge(s) {
        return '<span class="pill">' + esc(s) + '</span>'
    }

    function info(s, w = false) {
        return '<div class="info ' + (w ? 'warning' : '') + '">' + s + '</div>'
    }

    function table(headers, rows) {
        if (!rows.length) return '<div class="empty">No records are available in this scope or filter.</div>';
        return '<div class="table-wrap"><table><thead><tr>' + headers.map(h => '<th scope="col">' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>'
    }

    function head(title, sub, actions = '') {
        return '<div class="page-head"><div><div class="eyebrow">TRAINING WORKSPACE / ' + esc(current.toUpperCase()) + '</div><h1>' + title + '</h1><p class="sub">' + sub + '</p></div><div class="actions">' + actions + '</div></div>'
    }

    function panel(title, body) {
        return '<section class="panel"><h2>' + title + '</h2>' + body + '</section>'
    }

    function searchBar() {
        return '<div class="toolbar"><label for="tableSearch">Search this table</label><input id="tableSearch" type="search" placeholder="Search visible records"></div>'
    }

    function selectBatch() {
        return '<div class="toolbar"><label for="batchSelect">Batch</label><select id="batchSelect">' + options(current === 'attendance' ? attendanceBatches() : batches(), sessionStorage.getItem('reviewBatch'), 'code') + '</select></div>'
    }

    function selectedBatch() {
        let id = $id('batchSelect')?.value || sessionStorage.getItem('reviewBatch'),
            bs = current === 'attendance' ? attendanceBatches() : batches();
        return bs.find(b => b.id === id) || bs[0]
    }

    function status(b) {
        return b.closed ? 'Completed' : today < b.start ? 'Upcoming' : today > b.end ? 'Awaiting completion' : 'In Progress'
    }

    function statPct(m) {
        return m.length ? Math.round(100 * m.filter(x => x.status === 'Present').length / m.length) + '%' : 'N/A'
    }

    function effectiveLinks(b) {
        return db.links.filter(l => R.linkEffective(l, b, db.settings))
    }

    function accessible(r, b) {
        let p = db.projects.find(x => x.id === b.project);
        let links = effectiveLinks(b).filter(l => l.resource === r.id);
        return links.some(l => (!r.formType && !l.days?.length) || (l.wholePlan && today >= b.start) || (l.days || []).some(d => today >= R.add(b.start, d - 1))) && today <= p.end
    }

    function canUploadResources() {
        return central() || (trainer() && (user().resourceUpload ?? db.settings.trainerUpload))
    }

    function resourcePlans() {
        return central() ? plans() : plans().filter(p => batches().some(b => b.plan === p.id))
    }

    function resourceProjects() {
        return projects().filter(p => resourcePlans().some(pl => pl.project === p.id))
    }

    function resourceScope() {
        return db.resources.filter(r => r.common || projects().some(p => p.id === r.project) && (context === 'all' || r.project === context) || db.links.some(l => l.resource === r.id && plans().some(p => p.id === l.plan))).filter(r => !(trainer() || trainee()) || (trainer() && (r.uploadedBy === active || r.common && canUploadResources())) || batches().some(b => effectiveLinks(b).some(l => l.resource === r.id)))
    }

    function syncHeader() {
        let ps = projects();
        if (ps.length === 1) context = ps[0].id;
        else if (context !== 'all' && !ps.some(p => p.id === context)) context = 'all';
        $id('projectContext').innerHTML = (ps.length > 1 ? '<option value="all">All permitted projects</option>' : '') + options(ps, context, 'name', false);
        $id('projectContext').value = context;
        $id('persona').innerHTML = options(db.users.map(u => ({
            id: u.id,
            name: u.id + ' · ' + (u.role === 'Trainee' ? 'Trainee Teacher / Student' : u.role)
        })), active, 'name', false);
        $id('identity').textContent = 'User ID: ' + (user()?.id || '') + ' · ' + (user()?.name || '') + ' · ' + (user()?.role === 'Trainee' ? 'Trainee Teacher / Student' : user()?.role || '');
        let signed = window.DemoAuth?.session()?.mode === 'login';
        $id('persona').disabled = !!signed || !!window.DemoAuth?.publicGuest;
        $id('persona').setAttribute('title', signed ? 'Login role is fixed. Logout to switch users.' : 'Demo persona · not authentication');
        $id('signout').textContent = 'Logout';
        $id('nav').innerHTML = nav.filter(([id]) => !window.DemoAuth || window.DemoAuth.allowed(user()?.role, id)).map(([id, icon, label]) => '<a href="' + pageHref(id) + '" class="' + (current === id ? 'active' : '') + '"' + (current === id ? ' aria-current="page"' : '') + '><span class="nav-icon" aria-hidden="true">' + icon + '</span>' + label + '</a>').join('')
    }

    function registrationBatch() {
        let route = routeBatch();
        return route ? db.batches.find(b => b.id === route) : selectedBatch()
    }

    function render() {
        today = R.today();
        current = document.body?.dataset?.page || 'dashboard';
        if (['registration', 'trainees', 'completion'].includes(current) && routeBatch()) sessionStorage.setItem('reviewBatch', routeBatch());
        if (!nav.some(n => n[0] === current)) current = 'dashboard';
        syncHeader();
        if (window.DemoAuth && !window.DemoAuth.allowed(user()?.role, current)) {
            $id('main').innerHTML = head('Access restricted', 'You do not have permission to access this page.') + panel('Return to your workspace', '<a class="btn btn-primary" href="index.html">Go to Dashboard</a>');
            return
        }
        let f = views[current];
        $id('main').innerHTML = f ? f() : '';
        if (current === 'registration') {
            renderBatchArea(registrationBatch())
        } else if ($id('batchSelect')) {
            let b = selectedBatch();
            if (b) {
                $id('batchSelect').value = b.id;
                sessionStorage.setItem('reviewBatch', b.id);
                renderBatchArea(b)
            }
        }
        if (current === 'reports') renderReport();
        $id('sidebar').classList.remove('open');
        $id('menu').setAttribute('aria-expanded', 'false')
    }
    const views = {
        dashboard() {
            let bs = batches(),
                ts = trainees(),
                ps = projects().filter(p => context === 'all' || p.id === context),
                marks = db.attendance.filter(a => ts.some(t => t.id === a.trainee)),
                started = ts.filter(t => t.approved && marks.some(a => a.trainee === t.id && a.status === 'Present')).length,
                complete = ts.filter(t => R.eligibility(t, db).eligible).length,
                cert = db.certificates.filter(c => ts.some(t => t.id === c.trainee)).length;
            let nums = [
                ['Projects', ps.length],
                ['Active projects', ps.filter(p => today >= p.start && today <= p.end).length],
                ['Training plans', plans().length],
                ['Batches', bs.length],
                ['Planned · capacity demo', bs.reduce((n, b) => n + Number(b.capacity), 0)],
                ['Registered trainees', ts.length],
                ['Approved', ts.filter(t => t.approved).length],
                ['Training started', started],
                ['Training completed · review', db.settings.attendance === '' ? 'Pending' : complete],
                ['Certificate previews', cert],
                ['Average recorded attendance', statPct(marks)],
                ['Assessment completion', formCompletion(ts, 'Assessment')],
                ['Feedback completion', formCompletion(ts, 'Feedback')]
            ];
            let pctComplete = db.settings.attendance === '' ? 'Pending' : ts.length ? Math.round(100 * complete / ts.length) + '%' : 'N/A',
                certPct = ts.length ? Math.round(100 * cert / ts.length) + '%' : 'N/A';
            if (trainer()) nums = [
                ['Assigned batches', bs.length],
                ['Upcoming batches', bs.filter(b => today < b.start).length],
                ['Active batches', bs.filter(b => today >= b.start && today <= b.end && !b.closed).length],
                ['Completed batches', bs.filter(b => b.closed).length],
                ['Total trainees', ts.length],
                ['Average attendance', statPct(marks)],
                ['Completion % · provisional', pctComplete]
            ];
            else if (trainee()) nums = [
                ['My training batches', bs.length],
                ['Present training days', marks.filter(m => m.status === 'Present').length],
                ['Recorded attendance', statPct(marks)],
                ['Completion status', ts[0] ? lifecycle(ts[0]) : 'Not assigned']
            ];
            else if (user().role === roles[3]) nums = [
                ['Total teachers · sample', ts.length],
                ['Registered', ts.length],
                ['Approved', ts.filter(t => t.approved).length],
                ['Training started', started],
                ['Training completed', db.settings.attendance === '' ? 'Pending' : complete],
                ['Attendance %', statPct(marks)],
                ['Assessment completion', formCompletion(ts, 'Assessment')],
                ['Certificate previews', cert]
            ];
            else if (user().role === roles[1] || user().role === roles[2]) nums = [
                ['Total schools', new Set(bs.flatMap(schoolIdsForBatch)).size],
                ['Total batches', bs.length],
                ['Upcoming batches', bs.filter(b => today < b.start).length],
                ['Ongoing batches', bs.filter(b => today >= b.start && today <= b.end && !b.closed).length],
                ['Completed batches', bs.filter(b => b.closed).length],
                ['Total trainees', ts.length],
                ['Average attendance', statPct(marks)],
                ['Completion %', pctComplete],
                ['Certification % · preview', certPct],
                ['Trainer availability', db.availability.filter(a => bs.some(b => b.trainer === a.trainer) && a.start <= today && a.end >= today).length],
                ['Approval pending', ts.filter(t => !t.approved).length],
                ['Assessment completion', formCompletion(ts, 'Assessment')]
            ];
            let counts = [bs.reduce((n, b) => n + Number(b.capacity), 0), ts.length, ts.filter(t => t.approved).length, started, db.settings.attendance === '' ? '—' : complete, cert];
            let rows = bs.map(b => [esc(b.code), esc((R.batchPlan(b, db)?.name || '—')), esc(b.start) + ' → ' + esc(b.end), esc(lookup(db.trainers, b.trainer)), badge(status(b)), btn('View', 'viewBatch', b.id)]);
            let stateCounts = {};
            for (let b of bs) {
                let s = b.state || lookup(db.schools, b.school, 'state');
                stateCounts[s] = (stateCounts[s] || 0) + 1
            }
            let month = {};
            for (let b of bs) month[b.start.slice(0, 7)] = (month[b.start.slice(0, 7)] || 0) + 1;
            return head(user().role + ' overview', 'Project-owned training, with evidence and decisions visible.') + '<div class="overview-hero"><div><h2>A clear view of every training journey</h2><p>' + esc(today) + ' · Asia/Kolkata · ' + esc(bs.length) + ' visible batches · all data is synthetic</p></div><span class="badge">SAMPLE DATA</span></div><div class="grid">' + nums.map(([k, v]) => '<div class="kpi"><small>' + esc(k) + '</small><strong>' + esc(v) + '</strong><small>Current permitted scope</small></div>').join('') + '</div><div class="split">' + panel('Training pipeline · review measure', '<div class="pipeline">' + ['Planned', 'Registered', 'Approved', 'Attended', 'Completed', 'Certified demo'].map((s, i) => '<div class="stage"><strong>' + counts[i] + '</strong><small>' + s + '</small></div>').join('') + '</div>' + info('Planned uses capacity; completed/certified need provisional criteria. This pipeline is a suggested visual.')) + panel('Needs attention', bs.filter(b => db.trainees.filter(t => t.batch === b.id && !t.approved).length).map(b => '<div class="attention">' + esc(b.code) + ' · trainee approval pending</div>').join('') + info('Low attendance, “starting soon”, shortage and insufficient-registration thresholds: Business clarification required.', true)) + '</div>' + panel(trainer() ? "Today’s work" : trainee() ? 'My training' : 'Training batches', table(['Batch', 'Plan', 'Dates', 'Trainer', 'Status', 'Action'], rows) + (trainer() ? '<div class="actions"><a class="btn" href="#attendance">Mark attendance</a><a class="btn" href="#trainees">View / approve trainees</a><a class="btn" href="#resources">Upload / view resources</a><a class="btn" href="#plans">View training plan</a></div>' : '')) + '<div class="split">' + panel('Training coverage by state', bars(stateCounts)) + panel('Monthly batch start trend', bars(month)) + '</div>' + panel('Role-specific review', roleDetail(bs, ts, marks))
        },
        projects() {
            return head('Projects', 'Odoo selection is simulated. Project dates and unique codes are validated.', central() ? btn('+ Create project', 'newProject', '', 'btn-primary') : '') + panel('Project register', searchBar() + table(['Project', 'Code', 'Dates', 'Plans', 'Action'], projects().filter(p => context === 'all' || p.id === context).map(p => [esc(p.name), esc(p.code), esc(p.start) + ' → ' + esc(p.end), db.plans.filter(x => x.project === p.id).length, btn('View', 'viewProject', p.id) + (central() ? ' ' + btn('Edit', 'editProject', p.id) : '')]))) + info('Project delete policy, exact mandatory fields and character limits: Business clarification required. No delete control is invented.', true)
        },
        plans() {
            return ''
        },
        batches() {
            const visibleBatches = batches();
            const canManageVisible = central() || (roles.slice(1, 4).includes(user()?.role) && user().batchManage === true);
            const canAccessVisible = b => canManageVisible || (trainer() && b.trainer === user().trainer);
            return head('Batch management', 'A trainee group for a project, training plan, school or KGBV teacher cluster, trainer and training period.', (central() ? btn('Batch permissions', 'batchPermissions') : '') + (canManageBatches() ? btn('Upload batches from Excel', 'importBatches', '', 'btn-primary') + btn('Create batch manually', 'newBatch') : '')) + info('Excel is the primary creation flow. KGBV teacher batches may include up to three schools in the same district; student batches are per school. Dates are checked against the plan window, trainer availability, holidays and school installation readiness.') + panel('Batch register', searchBar() + table(['Batch Unique ID', 'Project / Training Plan', 'School / UDISE codes', 'Actual / reference location', 'Training period', 'Maximum / registered', 'Trainer', 'Open registration', 'Actions'], visibleBatches.map(b => [esc(b.code), esc(lookup(db.projects, b.project)) + '<br>' + esc((R.batchPlan(b, db)?.code || '—')), esc(schoolNamesForBatch(b).join(', ')) + '<br><small>' + esc(schoolUdisesForBatch(b).join(', ')) + '</small>', esc(schoolLocationsForBatch(b).join('; ')) + '<br><small>Reference: ' + esc(b.referenceLocation || '—') + '</small>', esc(b.start) + ' → ' + esc(b.end), b.capacity + ' / ' + db.trainees.filter(t => t.batch === b.id).length, esc(lookup(db.trainers, b.trainer)), badge(b.open && !b.closed ? 'Yes' : 'No'), btn('View', 'viewBatch', b.id) + (canManageVisible ? ' ' + btn('Edit', 'editBatch', b.id) + ' ' + btn('Delete', 'deleteBatch', b.id, 'btn-danger') : '') + (canAccessVisible(b) ? ' ' + btn('Manage trainees', 'manageTrainees', b.id) + (b.open && !b.closed ? ' ' + btn('Registration link', 'copyLink', b.id) : '') : '')]))) + info('KGBV teacher batch capacity is ten teachers per selected school; student batch capacity is 100 per school. Registered participants count against capacity, including entries awaiting approval.', true)
        },
        trainees() {
            return head('Trainees & approval', 'Assigned trainer approval precedes final closure. Personal display remains masked.') + selectBatch() + '<div id="batchArea"></div>'
        },
        registration() {
            let b = registrationBatch();
            return head('Teacher / Trainee Registration', 'Enter your provided Batch Code, review the batch details, then complete registration.') + panel('Find your batch', '<label for="registrationBatchCode">Batch Code</label><input id="registrationBatchCode" type="text" value="' + esc(b?.code || '') + '" placeholder="Enter the Batch Code supplied by your trainer"><div class="toolbar">' + btn('View batch details', 'findRegistrationBatch', '', 'btn-primary') + '</div><p id="batchCodeError" class="invalid-feedback" role="alert"></p>') + '<div id="batchArea"></div>' + info('Request the displayed demo OTP before submitting. No SMS/email is sent. Day 1 only is provisional; the review settings allow an alternative within-batch window.', true)
        },
        resources() {
            return head('Training / learning resources', 'Project → Training Plan → Batches · file bytes stored in this browser.', (central() ? btn('Permissions & approved formats', 'resourcePolicy') : '') + (canUploadResources() ? btn('+ Upload & link resource', 'newResource', '', 'btn-primary') + btn('Bulk upload Excel + files', 'masterImport', 'resources') : '')) + info('PPT/PPTX and PDF supported. Demo video formats: ' + esc((db.settings.multimediaExtensions || ['mp4', 'webm']).join(', ')) + '. Other multimedia needs explicit administrator review. Common publication and historical batch access use separate controls.') + panel('Resource repository', searchBar() + table(['Resource', 'Type', 'Repository', 'Project → linked plans', 'Actions'], resourceScope().map(r => [esc(r.name), esc(r.formType || r.type), badge(r.common ? 'Common repository' : r.commonRequested ? 'Common publication requested' : 'Project resource'), db.links.filter(l => l.resource === r.id && plans().some(p => p.id === l.plan)).map(l => esc(lookup(db.projects, lookup(db.plans, l.plan, 'project'))) + ' → ' + esc(lookup(db.plans, l.plan, 'code')) + ' · ' + (l.applyExisting === true ? 'Existing & new batches' : l.applyExisting === false ? 'New batches only' : 'Legacy review policy') + ' · ' + batches().filter(b => R.linkEffective(l, b, db.settings)).length + ' matching batches').join('<br>') || 'No linked plans in this scope', btn('Open / download', 'openResource', r.id) + ' ' + btn('Batch availability', 'resourceAvailability', r.id) + (central() && !r.formType ? ' ' + btn('Link to another plan', 'reuseResource', r.id) + (r.common ? '' : ' ' + btn('Publish as common', 'publishCommon', r.id)) : '') + (trainer() && canUploadResources() && r.uploadedBy === active && !r.common && !r.commonRequested ? ' ' + btn('Request common reuse', 'requestCommon', r.id) : '')]))) + info('Upload and link in one save. Trainer uploads need an explicit grant. Common publication approval is a temporary review workflow; business must confirm who authorizes it. No size limit is invented; browser quota may prevent saving.', true)
        },
        attendance() {
            return head('Attendance management', 'Select project, batch and training day/date. Mark each trainee Present or Absent.') + '<div class="toolbar"><label for="attendanceProject">1. Project</label><select id="attendanceProject">' + options(projects(), attendanceProjectID(), 'name', false) + '</select></div>' + selectBatch() + '<div id="batchArea"></div>' + info('Assigned trainers primarily record attendance. Authorized batch managers can also correct it. Today and previous dates are permitted; future dates are blocked. Each change is audited. Final-closure corrections remain blocked pending policy.', true)
        },
        assessments() {
            return head('Assessments & feedback', 'Actual local submissions to linked sample or authored review forms.') + (central() ? info('Create forms in Master data, then link them to a training plan. Scoring uses exact-answer matching only for review; real assessment design requires clarification.') : '') + selectBatch() + '<div id="batchArea"></div>'
        },
        completion() {
            return head('Completion review', 'Evidence-led eligibility. Missing business thresholds are never filled automatically.') + selectBatch() + '<div id="batchArea"></div>' + info('Cancelled, Dropped/Inactive, reopening and started-date changes: Business clarification required. These suggested transitions need an approved policy.', true)
        },
        certificates() {
            return head('Certification', 'Configurable templates, validated certificate data and sample layouts.', central() ? btn('+ Add certificate template', 'newCertTemplate', '', 'btn-primary') + btn('+ Create certificate record', 'newCertRecord') : '') + info('Templates configure Project/Program, signatory, organization/project logos, colour and layout. Trainee, training, duration, completion date and number come from each record. Local POC records are marked; production issuance is not claimed.') + panel('Certificate templates', table(['Code', 'Project / Program', 'Signatory', 'Layout / colour', 'Sample'], certTemplates().map(c => [esc(c.code), esc(c.program), esc(c.signatory), esc(c.layout) + ' · ' + esc(c.color), btn('View sample', 'certSample', c.id) + ' ' + btn('Download sample', 'certSampleDownload', c.id) + (central() ? ' ' + btn('Edit template', 'editCertTemplate', c.id) : '')])) + masterTools('certificateTemplates')) + panel('Certificate records', table(['Number', 'Trainee', 'Training', 'Duration', 'Completed', 'Actions'], certRecords().map(r => [esc(r.number), esc(r.traineeName), esc(r.trainingName), r.duration + ' days', esc(r.completionDate), btn('View certificate', 'certRecord', r.id) + ' ' + btn('Download HTML', 'certRecordDownload', r.id)])) + masterTools('certificateRecords') + (certRecords().length ? btn('Download all visible certificates (ZIP)', 'certDownloadAll') : '')) + panel('Eligibility review', table(['Trainee', 'Batch', 'Evidence', 'Action'], trainees().map(t => [nameMask(t), esc(lookup(db.batches, t.batch, 'code')), esc(R.eligibility(t, db).message), btn('Review preview', 'certificate', t.id)])))
        },
        masters() {
            return head('Master data', 'Central trainer pool, availability, holiday calendar, resources and day-linked forms.') + panel('4.1 Trainer pool', table(['Code', 'Name', 'Category', 'Availability', 'Assignment history', 'Actions'], db.trainers.filter(t => central() || batches().some(b => b.trainer === t.id)).map(t => [esc(t.code), esc(t.name), esc(t.category), db.availability.filter(a => a.trainer === t.id && a.end >= today).map(a => esc(a.start) + ' → ' + esc(a.end)).join('<br>') || 'None recorded', btn('View history', 'trainerHistory', t.id), central() ? btn('Edit trainer', 'editTrainer', t.id) : '—'])) + (central() ? btn('+ Add trainer', 'newTrainer') : '') + masterTools('trainers') + masterTools('history')) + panel('4.2 Trainer availability', info('Add, edit or remove intervals. Schedule validation uses the current availability; changing it does not silently move existing batches.') + btn(availabilityFuture ? 'Show all availability' : 'View future availability', 'futureAvailability') + table(['Trainer', 'From', 'To', 'Actions'], db.availability.filter(a => (central() || trainer() && a.trainer === user().trainer) && (!availabilityFuture || a.end >= today)).map(a => [esc(lookup(db.trainers, a.trainer)), esc(a.start), esc(a.end), btn('Edit', 'editAvailability', a.id) + ' ' + btn('Remove', 'removeAvailability', a.id)])) + (central() || trainer() ? btn('+ Add availability', 'newAvailability') : '') + masterTools('availability')) + panel('4.3 Holiday calendar', table(['Name', 'Date', 'Scope', 'State', 'Project', 'Actions'], db.holidays.filter(h => !h.project || projects().some(p => p.id === h.project)).map(h => [esc(h.name), esc(h.date), esc(h.scope || (h.project ? (h.state ? 'Project + State' : 'Project') : (h.state ? 'State' : 'National'))), esc(h.state || 'All states'), esc(h.project ? lookup(db.projects, h.project) : 'All projects'), central() ? btn('Edit', 'editHoliday', h.id) + ' ' + btn('Remove', 'removeHoliday', h.id) : '—'])) + (central() ? btn('+ Add holiday', 'newHoliday') : '') + masterTools('holidays')) + panel('4.4 Training resources', info('Presentations, PDF manuals, video and approved multimedia. Common resources can be reused across projects; project resources remain within their project and selected plans.') + '<a class="btn" href="resources.html">Open learning resources</a>' + masterTools('resources')) + panel('4.5 Assessment & feedback forms', table(['Form', 'Purpose', 'Project', 'Training Plan / Days', 'Question'], resourceScope().filter(r => r.formType).map(r => [esc(r.name), esc(r.formPurpose || r.formType), esc(lookup(db.projects, r.project)), db.links.filter(l => l.resource === r.id && plans().some(p => p.id === l.plan)).map(l => esc(lookup(db.plans, l.plan, 'code')) + ' · Days ' + esc((l.days || []).join(', '))).join('<br>') || 'Not linked yet', esc(r.question)])) + (central() ? btn('+ Add form', 'newForm') : '') + masterTools('forms') + info('Forms open on the linked training day and remain available through project end. Existing-batch inclusion is an explicit review choice.'))
        },
        users() {
            return head('Users & roles', 'Persona-based review of provisional project, state, school and batch scope.', central() ? btn('+ Create demo user', 'newUser', '', 'btn-primary') : '') + panel('Demo user assignments', table(['User ID', 'Name masked', 'Role', 'Projects', 'Scope', 'Action'], db.users.filter(u => central() || u.id === active).map(u => [esc(u.id), mask(u.name), esc(u.role), esc(u.projects.map(p => lookup(db.projects, p)).join(', ')), esc(u.state || u.school || u.trainer || u.trainee || 'Assigned projects'), central() ? btn('Edit assignment', 'editUser', u.id) : 'Self']))) + panel('My profile', info('Contact capture and profile field permissions are provisional; this demo edits synthetic name/mobile/email only.') + btn('Edit synthetic profile', 'profile'))
        },
        reports() {
            let names = ['Project Training Summary', 'Batch Performance', 'Attendance', 'Trainer Availability', 'User Lifecycle', 'Resource Usage', 'User Login & Activity', 'Profile Change Audit', 'Training Exceptions'];
            const visibleBatches = batches();
            const visibleSchoolIds = new Set(visibleBatches.flatMap(schoolIdsForBatch));
            const visibleSchools = db.schools.filter(s => visibleSchoolIds.has(s.id));
            const visibleTrainerIds = new Set(visibleBatches.map(b => b.trainer));
            const visibleTrainers = db.trainers.filter(t => visibleTrainerIds.has(t.id));
            return head('MIS reports', 'Nine review views · scope enforced before filters · exports contain the current filtered rows.') + panel('Report filters', '<div class="filters"><div><label for="reportType">Report</label><select id="reportType">' + names.map(n => '<option' + (n === reportType ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</select></div>' + filter('rProject', 'Project', projects()) + filter('rState', 'State', [...new Set(visibleSchools.map(s => s.state))].map(n => ({id:n,name:n}))) + filter('rDistrict', 'District', [...new Set(visibleSchools.map(s => s.district))].map(n => ({id:n,name:n}))) + filter('rSchool', 'School', visibleSchools) + filter('rPlan', 'Training plan', plans()) + filter('rType', 'Training type', ['Induction', 'Refresher 1', 'Refresher 2', 'Other'].map(n => ({
                id: n,
                name: n
            }))) + filter('rBatch', 'Batch', visibleBatches.map(b => ({
                id: b.id,
                name: b.code
            }))) + filter('rTrainer', 'Trainer', visibleTrainers) + '<div><label for="rStart">From date</label><input id="rStart" type="date"></div><div><label for="rEnd">To date</label><input id="rEnd" type="date"></div>' + filter('rStatus', 'Batch status', ['Upcoming', 'In Progress', 'Awaiting completion', 'Completed'].map(n => ({
                id: n,
                name: n
            }))) + filter('rTraineeStatus', 'Trainee status', ['Registered', 'Approved', 'Training Started', 'Training Completed', 'Assessment Completed', 'Certified'].map(n => ({
                id: n,
                name: n
            }))) + '</div><div class="toolbar" style="margin-top:20px">' + btn('Apply filters', 'applyReport', '', 'btn-primary') + btn('Reset filters', 'resetReport') + btn('Download Excel', 'exportExcel') + btn('Download CSV', 'exportCSV') + btn('Print / Save as PDF', 'print') + '</div><div id="reportArea"></div>')
        },
        audit() {
            return head('Audit trail', 'Local masked records of important actions. Production requires immutable server audit.') + panel('Recorded changes', searchBar() + table(['Date', 'Actor', 'Action', 'Entity', 'Before → after'], db.audit.filter(visibleAudit).slice().reverse().map(a => [esc(a.date), esc(a.actor), esc(a.action), esc(a.entity), '<pre>' + esc(JSON.stringify(a.before)) + ' → ' + esc(JSON.stringify(a.after)) + '</pre>'])))
        },
        review() {
            return head('Rules & business decisions', 'Confirmed rules, source conflicts, assumptions and review-only configuration.', btn('Reset sample data', 'reset', '', 'btn-danger')) + panel('Temporary review settings', info('These values are <strong>prototype assumptions only</strong>. Saving them does not resolve or approve the business questions.', true) + reviewSettings()) + panel('Business clarifications · decision register', DECISIONS.clarifications.map(q => '<details><summary>' + esc(q.split(' — ')[0]) + '</summary><p>' + esc(q) + '</p></details>').join('')) + panel('Temporary prototype assumptions', DECISIONS.assumptions.map(a => '<p>' + esc(a) + '</p>').join('')) + panel('Suggested UX improvements', '<ul>' + DECISIONS.ux.map(u => '<li>' + esc(u) + '</li>').join('') + '</ul>') + panel('Business rules catalogue', searchBar() + table(['Rule ID', 'Classification', 'Module / source', 'Rule', 'Role', 'Behavior / message', 'Clarification'], CATALOGUE.map(r => [esc(r.id), esc(r.classification), esc(r.module + ' ' + r.source), esc(r.rule), esc(r.role), esc(r.behavior) + '<br><em>' + esc(r.message) + '</em>', esc(r.exceptions)]))) + panel('Traceability & full source', '<a class="btn" href="docs/Business-Review-Pack.html" target="_blank" rel="noopener">Read complete review pack</a> <a class="btn" href="docs/traceability.csv" download>Download traceability CSV</a> <a class="btn" href="docs/validation-matrix.csv" download>Download validation matrix</a>' + info('This pack includes every non-empty source paragraph and each table row. Browser-side permissions are demonstrations. No real OTP, Odoo/UDISE, encryption or server authentication is provided.'))
        }
    };

    function bars(obj) {
        let max = Math.max(1, ...Object.values(obj));
        return Object.keys(obj).length ? Object.entries(obj).map(([k, v]) => '<div class="bar-row"><span>' + esc(k) + '</span><div class="bar"><span style="width:' + (v / max * 100) + '%"></span></div><strong>' + v + '</strong></div>').join('') : '<div class="empty">No data available.</div>'
    }

    function formCompletion(ts, kind) {
        let expected = 0,
            done = 0;
        for (let t of ts) {
            let b = db.batches.find(b => b.id === t.batch);
            for (let l of effectiveLinks(b)) {
                let resource = db.resources.find(r => r.id === l.resource);
                if (resource?.formType && (!kind || resource.formType === kind)) {
                    expected++;
                    if (db.submissions.some(s => s.trainee === t.id && s.resource === l.resource)) done++
                }
            }
        }
        return expected ? Math.round(done / expected * 100) + '%' + (kind ? '' : ' combined') : 'N/A'
    }

    function roleDetail(bs, ts, marks) {
        let u = user();
        if (trainee()) {
            let t = ts[0],
                b = bs[0];
            if (!t || !b) return '<div class="empty">No training assigned.</div>';
            let done = db.attendance.filter(a => a.trainee === t.id && a.status === 'Present').length;
        return '<p>My training: ' + esc((R.batchPlan(b, db)?.name || '—')) + ' · ' + esc(schoolNamesForBatch(b).join(', ')) + ' · ' + esc(lookup(db.trainers, b.trainer)) + '</p><p>Present evidence: ' + done + ' of ' + lookup(db.plans, b.plan, 'days') + ' plan days' + (R.batchPlan(b, db)?.hours ? ' · ' + R.batchPlan(b, db).hours + ' course hours' : '') + '. Completion remains conditional.</p><div class="actions"><a class="btn" href="#assessments">Today’s assessments & feedback</a><a class="btn" href="#resources">Learning resources</a><a class="btn" href="#attendance">My attendance</a><a class="btn" href="#certificates">My certificate</a></div>'
        }
        if (trainer()) return table(['Today’s batch', 'Trainees', 'Attendance pending', 'Assessment / feedback'], bs.filter(b => today >= b.start && today <= b.end).map(b => [esc(b.code), ts.filter(t => t.batch === b.id).length, ts.filter(t => t.batch === b.id && !marks.some(a => a.date === today && a.trainee === t.id)).length, formCompletion(ts.filter(t => t.batch === b.id))]));
        return '<p>Total schools: ' + new Set(bs.flatMap(schoolIdsForBatch)).size + ' · Upcoming: ' + bs.filter(b => today < b.start).length + ' · Ongoing: ' + bs.filter(b => today >= b.start && today <= b.end && !b.closed).length + ' · Completed: ' + bs.filter(b => b.closed).length + '</p><p>Registration/approval pending: ' + ts.filter(t => !t.approved).length + ' · Assessment / feedback: ' + formCompletion(ts) + ' · Recorded attendance: ' + statPct(marks) + '</p>' + info('Completion/certification percentages, trainer utilization and threshold alerts require approved definitions.')
    }

    function filter(id, label, arr) {
        return '<div><label for="' + id + '">' + label + '</label><select id="' + id + '">' + options(arr, '', 'name', true).replace('Select…', 'All') + '</select></div>'
    }

    function uniqueSchools(k) {
        return [...new Set(db.schools.filter(s => batches().some(b => schoolIdsForBatch(b).includes(s.id))).map(s => s[k]))].map(n => ({
            id: n,
            name: n
        }))
    }

    function renderBatchArea(b) {
        if (!b) {
            $id('batchArea').innerHTML = '<div class="empty">Enter your provided Batch Code to view the batch and registration form.</div>';
            return
        }
        let ts = trainees().filter(t => t.batch === b.id),
            editable = canBatch(b);
        let title = esc(b.code) + ' · ' + esc((R.batchPlan(b, db)?.name || '—'));
        if (current === 'trainees') $id('batchArea').innerHTML = panel(title, info('Open registration: ' + (b.open && !b.closed ? 'Enabled' : 'Disabled') + ' · registered / capacity ' + ts.length + '/' + b.capacity + ' · awaiting trainer approval ' + ts.filter(t => !t.approved).length + ' · final closure ' + (b.closed ? 'Closed' : 'Open')) + (editable ? '<div class="toolbar">' + btn('Upload trainee XLSX', 'importTrainees', b.id) + (b.open && !b.closed ? btn('Copy registration link', 'copyLink', b.id) + btn('Open registration page', 'openRegistrationPage', b.id) : '') + (b.closed ? '' : btn(b.open ? 'Disable / close registration' : 'Enable open registration', b.open ? 'closeRegistration' : 'enableRegistration', b.id)) + (trainer() && !b.closed ? btn('Approve entire list', 'approveList', b.id) : '') + '</div>' : '') + table(['Trainee ID', 'Name masked', 'Mobile / email masked', 'Status', 'Action'], ts.map(t => [esc(t.id), nameMask(t), mask(t.mobile) + ' / ' + mask(t.email), badge(t.approved ? 'Approved' : 'Registered'), trainer() && editable && !b.closed && !t.approved ? btn('Approve', 'approve', t.id) : '—'])));
        if (current === 'registration') {
            let gate = R.registrationWindow(b, db);
            $id('batchArea').innerHTML = panel(title, info('Project: ' + esc(lookup(db.projects, b.project)) + ' · Training Plan: ' + esc(R.batchPlan(b, db)?.name || '—') + ' · Course hours: ' + esc(R.batchPlan(b, db)?.hours || '—') + ' · Trainer: ' + esc(lookup(db.trainers, b.trainer)) + ' · Location: ' + esc(schoolLocationsForBatch(b).join('; ')) + ' · School / cluster: ' + esc(schoolNamesForBatch(b).join(', ')) + ' · Training ' + esc(b.start) + ' → ' + esc(b.end) + ' · Open registration ' + (b.open && !b.closed ? 'Enabled' : 'Disabled') + ' · Registered ' + db.trainees.filter(t => t.batch === b.id).length + ' / ' + b.capacity) + (gate ? info(esc(gate), true) : formHTML('registration', {
                batch: b.id,
                name: '',
                mobile: '',
                email: '',
                otp: ''
            }, [
                ['name', 'Teacher Name', 'text', true],
                ['mobile', 'Mobile Number', 'tel', true],
                ['email', 'Email where applicable', 'email', false],
                ['otp', 'Demo OTP', 'text', true]
            ], 'Verify OTP & register') + '<div class="toolbar">' + btn('Request demo OTP', 'requestRegistrationOTP', b.id) + '</div><div id="otpNotice" role="status"></div>') + '<hr><p>Already registered? Search for your Unique ID using mobile or email. Lookup remains available when registration is closed.</p>' + btn('Find my Unique ID', 'openLookup', b.id));
            if ($id('batchSelect')) $id('batchSelect').value = b.id
        }
        if (current === 'attendance') {
            let date = today < b.start ? b.start : today > b.end ? b.end : today;
            $id('batchArea').innerHTML = panel(title, info('Project: ' + esc(lookup(db.projects, b.project)) + ' · Assigned trainer: ' + esc(lookup(db.trainers, b.trainer)) + ' · Training ' + esc(b.start) + ' → ' + esc(b.end)) + '<div class="toolbar"><label for="attendanceDay">Training day</label><select id="attendanceDay">' + attendanceDateOptions(b, date) + '</select><label for="attendanceDate">Training date</label><input id="attendanceDate" type="date" value="' + esc(date) + '" min="' + esc(b.start) + '" max="' + esc(today < b.end ? today : b.end) + '">' + btn('Load date', 'loadAttendance', b.id) + '</div>' + (canAttendance(b) ? '<div class="toolbar">' + btn('Download attendance template', 'attendanceTemplate', b.id) + btn('Bulk upload attendance', 'attendanceImport', b.id) + '</div>' : '') + '<div id="attendanceTable"></div>' + info('No missing attendance is treated as Absent automatically.'));
            attendanceTable(b, date)
        }
        if (current === 'assessments') {
            $id('batchArea').innerHTML = panel(title, table(['Activity', 'Assigned days', 'Availability', 'Submission / action'], effectiveLinks(b).map(l => {
                let r = db.resources.find(x => x.id === l.resource);
                if (!r?.formType) return null;
                let t = ts.find(t => t.id === user().trainee),
                    sub = db.submissions.find(s => s.trainee === t?.id && s.resource === r.id);
                return [esc(r.name) + ' · ' + esc(r.formType), esc(l.days.join(', ')), badge(accessible(r, b) ? 'Available' : 'Not yet available / expired'), trainee() ? sub ? 'Submitted ' + esc(sub.date) + (r.formType === 'Assessment' ? ' · demo score ' + esc(sub.score) + '%' : '') : btn('Complete form', 'submitForm', r.id) : esc(db.submissions.filter(s => ts.some(t => t.id === s.trainee) && s.resource === r.id).length) + ' local submissions']
            }).filter(Boolean)))
        }
        if (current === 'completion') $id('batchArea').innerHTML = panel(title, table(['Trainee', 'Approval', 'Attendance evidence', 'Eligibility'], ts.map(t => [nameMask(t), badge(t.approved ? 'Approved' : 'Pending'), statPct(db.attendance.filter(a => a.trainee === t.id)), esc(R.eligibility(t, db).message)])) + (editable ? btn('Evaluate and close batch', 'closeBatch', b.id, 'btn-primary') : '') + info('Recorded attendance % differs from completion evidence, which uses Present / required plan days. No default thresholds are supplied.'))
    }

    function matchesOTP(x, batch, purpose) {
        return x.otp === '123456' && otpChallenge?.batch === batch && otpChallenge.purpose === purpose && otpChallenge.mobile === R.mobile(x.mobile) && otpChallenge.email === R.norm(x.email)
    }
    const attendanceCols = ['Project Code', 'Batch Code', 'Trainee ID', 'Training Date', 'Attendance'];
    let attendanceStage = null;

    function attendanceProjectID() {
        let ps = projects(),
            id = context !== 'all' ? context : sessionStorage.getItem('reviewAttendanceProject');
        return ps.some(p => p.id === id) ? id : ps[0]?.id
    }

    function attendanceBatches() {
        return batches().filter(b => b.project === attendanceProjectID())
    }

    function canAttendance(b) {
        return !!b && !b.closed && canBatch(b)
    }

    function attendanceDateOptions(b, date) {
        let out = '',
            d = b.start,
            day = 1;
        while (d <= b.end) {
            out += '<option value="' + esc(d) + '"' + (d === date ? ' selected' : '') + (d > R.today() ? ' disabled' : '') + '>Day ' + day + ' · ' + esc(d) + '</option>';
            d = R.add(d, 1);
            day++;
        }
        return out
    }

    function attendanceRowErrors(x, base = db) {
        let e = [],
            b = base.batches.find(b => b.id === x.batch),
            t = base.trainees.find(t => t.id === x.trainee);
        if (!b || !canAttendance(db.batches.find(v => v.id === x.batch))) e.push('You are not authorized to modify this batch attendance, or the batch is finally closed.');
        if (!t || t.batch !== x.batch) e.push('Trainee ID must belong to the selected batch.');
        let dateError = R.attendance(x.date, b);
        if (dateError) e.push(dateError);
        if (!['Present', 'Absent'].includes(x.status)) e.push('Attendance must be Present or Absent.');
        return e
    }

    function attendanceRows(rows, batchID) {
        let seen = new Set();
        return rows.map((r, i) => {
            let project = db.projects.find(p => R.norm(p.code) === R.norm(r['Project Code'])),
                batch = db.batches.find(b => R.norm(b.code) === R.norm(r['Batch Code'])),
                x = {
                    batch: batch?.id,
                    trainee: String(r['Trainee ID'] || '').trim(),
                    date: dateValue(r['Training Date']),
                    status: String(r.Attendance || '').trim()
                },
                errors = attendanceRowErrors(x),
                key = x.batch + '|' + x.trainee + '|' + x.date;
            if (!project || batch?.project !== project.id) errors.push('Project Code must match the batch project.');
            if (batch?.id !== batchID) errors.push('Row must refer to the selected batch.');
            if (seen.has(key)) errors.push('Duplicate trainee/batch/date row in workbook.');
            seen.add(key);
            return {
                row: i + 2,
                data: x,
                errors
            }
        })
    }

    function storeAttendance(records, label) {
        return commit(() => {
            for (let x of records) {
                let m = db.attendance.find(a => a.batch === x.batch && a.trainee === x.trainee && a.date === x.date);
                if (m?.status === x.status) continue;
                let value = {
                    ...x,
                    id: m?.id || uid('ATT'),
                    updated: new Date().toISOString(),
                    updatedBy: active
                };
                audit(m ? 'Attendance corrected' : 'Attendance recorded', value.id, m ? {
                    ...m
                } : null, value, db.batches.find(b => b.id === x.batch).project);
                if (m) Object.assign(m, value);
                else db.attendance.push(value)
            }
        }, label)
    }

    function openAttendanceImport(id) {
        let b = attendanceBatches().find(b => b.id === id);
        if (!canAttendance(b)) return deny();
        attendanceStage = null;
        modal('Bulk attendance upload · ' + esc(b.code), info('Use the XLSX template. One row per trainee/batch/training date; today and previous training dates are allowed. Existing marks are corrected, missing rows remain unchanged. All rows validate before saving.') + '<div class="toolbar">' + btn('Download attendance template', 'attendanceTemplate', id) + '</div><label for="attendanceWorkbook">Excel workbook (.xlsx)</label><input id="attendanceWorkbook" type="file" accept=".xlsx"><div class="toolbar">' + btn('Validate attendance upload', 'attendancePreview', id) + '</div><div id="attendancePreview" role="status"></div><div class="form-actions">' + btn('Save validated attendance', 'attendanceCommit', id, 'btn-primary') + '</div>')
    }
    async function attendanceTemplate(id) {
        let b = attendanceBatches().find(b => b.id === id);
        if (!canAttendance(b)) return deny();
        let date = R.today() < b.start ? b.start : R.today() > b.end ? b.end : R.today();
        let rows = trainees().filter(t => t.batch === id).map(t => [lookup(db.projects, b.project, 'code'), b.code, t.id, date, '']);
        download(await Excel.write(attendanceCols, rows), 'attendance-' + b.code + '-template.xlsx');
        message('Template downloaded. Enter Present or Absent; future dates cannot be saved.')
    }
    async function previewAttendance(id) {
        attendanceStage = null;
        let b = attendanceBatches().find(b => b.id === id);
        if (!canAttendance(b)) return deny();
        try {
            let file = $id('attendanceWorkbook').files[0];
            if (!file?.name.toLowerCase().endsWith('.xlsx')) throw Error('Select an XLSX workbook.');
            let {
                headers,
                rows
            } = await Excel.read(file), missing = attendanceCols.filter(h => !headers.includes(h));
            if (missing.length) throw Error('Missing columns: ' + missing.join(', '));
            if (!rows.length) throw Error('No attendance rows found.');
            let results = attendanceRows(rows, id);
            attendanceStage = {
                batch: id,
                rows
            };
            $id('attendancePreview').innerHTML = info(results.some(r => r.errors.length) ? 'Validation failed. Nothing saved.' : 'All rows valid. Review corrections, then save.') + table(['Excel row', 'Trainee ID', 'Date', 'Current → Uploaded', 'Validation'], results.map(r => {
                let old = db.attendance.find(a => a.batch === r.data.batch && a.trainee === r.data.trainee && a.date === r.data.date);
                return [r.row, esc(r.data.trainee), esc(r.data.date), esc(old?.status || 'Not recorded') + ' → ' + esc(r.data.status), r.errors.length ? '<span class="invalid-feedback">' + esc(r.errors.join(' · ')) + '</span>' : badge(old?.status === r.data.status ? 'No change' : 'Valid')]
            }))
        } catch (err) {
            $id('attendancePreview').innerHTML = info(esc(err.message) + ' Nothing saved.', true)
        }
    }
    async function commitAttendance() {
        if (!attendanceStage || uploadBusy) return;
        let {
            batch,
            rows
        } = attendanceStage, b = attendanceBatches().find(b => b.id === batch);
        if (!canAttendance(b)) return deny();
        let results = attendanceRows(rows, batch);
        if (results.some(r => r.errors.length)) {
            $id('attendancePreview').innerHTML = info('Revalidation failed. Nothing saved: ' + esc(results.flatMap(r => r.errors).join(' · ')), true);
            return
        }
        uploadBusy = true;
        try {
            if (storeAttendance(results.map(r => r.data), 'Attendance upload saved locally; changes audited.')) {
                attendanceStage = null;
                closeModal();
                render()
            }
        } finally {
            uploadBusy = false
        }
    }

    function saveAttendance(id) {
        let b = attendanceBatches().find(b => b.id === id);
        if (!canAttendance(b)) return deny();
        let date = $id('attendanceDate').value,
            ts = trainees().filter(t => t.batch === id),
            choices = [...document.querySelectorAll('[data-mark]')],
            records = choices.map(c => ({
                batch: id,
                trainee: c.dataset.mark,
                date,
                status: c.value
            }));
        let errors = records.flatMap(x => attendanceRowErrors(x));
        if (!records.length || new Set(records.map(x => x.trainee)).size !== ts.length || records.length !== ts.length) errors.push('Mark each current trainee once. Reload the date if the trainee list changed.');
        if (errors.length) return message(errors.join(' · ') + ' Your choices are preserved.', true);
        if (storeAttendance(records, 'Attendance saved locally with audit entries.')) attendanceTable(b, date)
    }

    function attendanceTable(b, date) {
        let error = R.attendance(date, b);
        if (error) {
            $id('attendanceTable').innerHTML = info(esc(error), true);
            return
        }
        if ($id('attendanceDay')) $id('attendanceDay').value = date;
        let ts = trainees().filter(t => t.batch === b.id);
        $id('attendanceTable').innerHTML = table(['Trainee ID', 'Trainee', 'Attendance'], ts.map(t => {
            let m = db.attendance.find(a => a.batch === b.id && a.trainee === t.id && a.date === date);
            return [esc(t.id), esc(t.name), canAttendance(b) ? '<select aria-label="Attendance for ' + esc(t.id) + '" data-mark="' + esc(t.id) + '"><option value="">Choose…</option>' + ['Present', 'Absent'].map(s => '<option' + (m?.status === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>' : esc(m?.status || 'Not recorded')]
        })) + (canAttendance(b) && ts.length ? '<div class="form-actions">' + btn('Save attendance', 'saveAttendance', b.id, 'btn-primary') + '</div>' : '')
    }

    function field(name, label, type = 'text', value = '', required = false, items = null) {
        if (type === 'radio') return '<fieldset class="field wide feedback-radio-field"><legend>' + esc(label) + (required ? ' *' : '') + '</legend><div class="feedback-radio-options">' + (items || []).map((item, i) => '<label class="feedback-radio-option" for="f-' + name + (i ? '-' + i : '') + '"><input type="radio" id="f-' + name + (i ? '-' + i : '') + '" name="' + name + '" value="' + esc(item.id) + '" aria-describedby="e-' + name + '"' + (required ? ' required' : '') + (String(value) === String(item.id) ? ' checked' : '') + '><span>' + esc(item.name) + '</span></label>').join('') + '</div><div id="e-' + name + '" class="invalid-feedback" aria-live="polite"></div></fieldset>';
        let hint = required ? 'Required for demo; business mandatory status may need clarification.' : 'Optional in this prototype; business policy may need clarification.';
        let control = items ? '<select id="f-' + name + '" name="' + name + '"' + (required ? ' required' : '') + '>' + options(items, value) + '</select>' : type === 'textarea' ? '<textarea id="f-' + name + '" name="' + name + '">' + esc(value) + '</textarea>' : type === 'checkbox' ? '<input id="f-' + name + '" name="' + name + '" type="checkbox"' + (value ? ' checked' : '') + '>' : '<input id="f-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(value) + '"' + (required ? ' required' : '') + '>';
        return '<div class="field ' + (type === 'textarea' ? 'wide' : '') + '"><label for="f-' + name + '">' + esc(label) + (required ? ' *' : '') + '</label>' + control + '<small>' + hint + '</small><div id="e-' + name + '" class="invalid-feedback" aria-live="polite"></div></div>'
    }

    function formHTML(kind, data, fields, label = 'Save locally') {
        return '<form id="editForm" data-kind="' + kind + '" novalidate><input type="hidden" name="id" value="' + esc(data.id || '') + '"><input type="hidden" name="batch" value="' + esc(data.batch || '') + '"><div class="form-grid">' + fields.map(f => field(f[0], f[1], f[2], data[f[0]] ?? '', f[3], f[4])).join('') + '</div><div id="formError" class="invalid-feedback" role="alert"></div><div class="form-actions"><button type="submit" class="btn btn-primary">' + label + '</button></div></form>'
    }

    function modal(title, body) {
        $id('dialogTitle').textContent = title;
        $id('dialogBody').innerHTML = body;
        if (!$id('editor').open) $id('editor').showModal()
    }

    function closeModal() {
        $id('editor').close();
        attendanceStage = null;
        dialogForm = null;
        stage = null;
        masterStage = null
    }

    function errors(e) {
        document.querySelectorAll('.invalid-feedback').forEach(x => x.textContent = '');
        document.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));
        for (let [k, msg] of Object.entries(e)) {
            let f = $id('f-' + k),
                m = $id('e-' + k);
            if (m) m.textContent = msg;
            else if ($id('formError')) $id('formError').textContent = msg;
            if (f) {
                f.classList.add('is-invalid');
                f.setAttribute('aria-invalid', 'true');
                f.setAttribute('aria-describedby', 'e-' + k)
            }
        }
        document.querySelector('.is-invalid')?.focus()
    }

    function editProject(id) {
        if (!central()) return deny();
        let p = db.projects.find(x => x.id === id) || {};
        dialogForm = {
            kind: 'project',
            data: p
        };
        modal(id ? 'Edit project' : 'Create project from sample Odoo', info('No live Odoo connection. Code comes from this searchable sample list. No field lengths or past-date restrictions are invented.') + (!id ? '<label for="odooSearch">Search sample Odoo projects</label><input id="odooSearch" type="search" placeholder="Type project name or code"><label for="odooSelect">Project name → predefined sample code</label><select id="odooSelect"><option value="">Select…</option><option value="101">Digital Teaching Karnataka · ODOO-101</option><option value="102">Student Learning Maharashtra · ODOO-102</option><option value="103">Inclusive Teaching Programme · ODOO-103</option></select><br>' : '') + formHTML('project', p, [
            ['name', 'Project name', 'text', true],
            ['code', 'Project code', 'text', true],
            ['start', 'Start date', 'date', true],
            ['end', 'End date (strictly later)', 'date', true],
            ['description', 'Description', 'textarea', false]
        ]))
    }

    function editPlan(id) {
        if (!central()) return deny();
        let p = id ? plans().find(x => x.id === id) : {
            project: context === 'all' ? '' : context,
            type: 'Induction'
        };
        if (!p) return deny();
        dialogForm = {
            kind: 'plan',
            data: p
        };
        modal(id ? 'Modify Training Plan' : 'Add Training Plan', info(id ? 'Training Plan Code: <strong>' + esc(p.code) + '</strong>' : 'Unique Training Plan Code will be generated on save.') + (id && planUsed(id) ? info('This plan is used by a batch. Project, training type, duration and day assignments are protected. Name and description changes require a reason and are audited. Use Create revised plan for structural changes.', true) : '') + formHTML('plan', p, [
            ['project', 'Project', 'text', true, projects()],
            ['name', 'Training Plan Name', 'text', true],
            ['type', 'Training Type', 'text', true, ['Induction', 'Refresher 1', 'Refresher 2', 'Other'].map(x => ({
                id: x,
                name: x
            }))],
            ['description', 'Description', 'textarea', false],
            ['days', 'Number of training days', 'number', true], ...(id && planUsed(id) ? [
                ['reason', 'Reason for metadata change', 'textarea', true]
            ] : [])
        ]));
        if (id && planUsed(id))
            for (let field of ['project', 'type', 'days']) {
                $id('f-' + field).setAttribute('aria-readonly', 'true');
                if (field === 'days') $id('f-' + field).readOnly = true;
                else $id('f-' + field).disabled = true
            }
    }

    function planDayTable(p) {
        return table(['Day', 'Training / activity note', 'Linked resources / forms', 'Actions'], Array.from({
            length: Number(p.days)
        }, (_, i) => {
            let day = i + 1;
            return ['Day ' + day, esc(p.dayNotes?.[day] || 'No activity note entered'), db.links.filter(l => l.plan === p.id && (l.days || []).includes(day)).map(l => esc(lookup(db.resources, l.resource)) + (central() ? ' ' + btn('Change assigned days', 'editDayLink', l.id) : '')).join('<br>') || 'No resources/forms assigned', central() ? btn('Assign to this day', 'linkDay', p.id + '/' + day) : '—']
        }))
    }

    function dayChoice(p, selected = []) {
        return '<fieldset class="field wide"><legend>Training days *</legend>' + Array.from({
            length: Number(p.days)
        }, (_, i) => {
            let d = i + 1;
            return '<label class="day-choice"><input type="checkbox" name="dayChoice" value="' + d + '"' + (selected.includes(d) ? ' checked' : '') + '> Day ' + d + '</label>'
        }).join('') + '<div id="e-days" class="invalid-feedback" role="alert"></div></fieldset>'
    }

    function linkPlan(id, linkID = '', day = 0) {
        if (!central()) return deny();
        let p = plans().find(p => p.id === id),
            link = db.links.find(l => l.id === linkID && l.plan === id);
        if (!p || linkID && !link) return deny();
        if (link && planUsed(id)) return message('Existing day assignments are protected for a used plan. Create a revised plan to change them.', true);
        dialogForm = {
            kind: 'link',
            data: link || {
                plan: id
            }
        };
        modal('Assign resource / form to training days', info(esc(p.code) + ' · ' + p.days + ' training days. Select one or more days. No day outside this duration is available.') + formHTML('link', link || {}, [
            ['resource', 'Resource / form', 'text', true, db.resources.filter(r => r.common || r.project === p.project)],
            ['wholePlan', 'Attach feedback to entire Training Plan', 'checkbox', false],
            ['applyExisting', 'Include existing batches (review decision)', 'checkbox', false], ...(planUsed(id) ? [
                ['reason', 'Reason for adding an activity to a used plan', 'textarea', false]
            ] : [])
        ], 'Save day assignment').replace('<div class="form-actions">', dayChoice(p, link?.days || (day ? [day] : [])) + '<div class="form-actions">'))
    }

    function schedulePlan(id) {
        if (!central()) return deny();
        let p = plans().find(p => p.id === id);
        if (!p) return deny();
        if (planUsed(id)) return message('Day activities are protected for a used plan. Create a revised plan to change them.', true);
        dialogForm = {
            kind: 'planSchedule',
            data: p
        };
        modal('Day-wise training activities', info('Activity notes supplement resource/form assignments. Blank notes are allowed; no requirement says every day must have a resource.') + formHTML('planSchedule', Object.fromEntries(Array.from({
            length: p.days
        }, (_, i) => ['note' + (i + 1), p.dayNotes?.[i + 1] || ''])), Array.from({
            length: p.days
        }, (_, i) => ['note' + (i + 1), 'Day ' + (i + 1) + ' activity / training note', 'textarea', false]), 'Save day activities'))
    }

    function editBatch(id) {
        let b = id ? batches().find(x => x.id === id) : {
            project: context === 'all' ? '' : context,
            code: uid('B'),
            open: false
        };
        if (!canManageBatches(b) || id && !b) return deny();
        if (b.closed) return message('Business clarification required: editing a finally closed batch needs an approved policy.', true);
        dialogForm = {
            kind: 'batch',
            data: b
        };
        modal(id ? 'Edit batch' : 'Create batch', info('Actual location is derived from the sample UDISE directory. User-entered location is reference only. Dates after training starts are protected pending policy.') + '<label for="planSearch">Search reusable active training plans</label><input id="planSearch" type="search" placeholder="Search Training Plan Code / name">' + formHTML('batch', {
            ...b,
            schoolIdsText: schoolIdsForBatch(b).slice(1).map(id => lookup(db.schools, id, 'udise')).join(', '),
            open: b.open ? 'yes' : 'no',
            actualLocation: lookup(db.schools, b.school, 'location')
        }, [
            ['code', 'Batch Unique ID', 'text', true],
            ['project', 'Project', 'text', true, projects()],
            ['plan', 'Training Plan Code / name', 'text', true, db.plans.filter(p => p.status !== 'Draft' && p.status !== 'Inactive' || p.id === b.plan).map(p => ({
                id: p.id,
                name: p.code + ' · ' + p.name + ' (' + p.days + ' Days)'
            }))],
            ['school', 'Primary School / UDISE Code', 'text', true, db.schools.filter(s => !user().state || s.state === user().state).filter(s => !user().school || s.id === user().school).map(s => ({
                id: s.id,
                name: s.name + ' · ' + s.udise
            }))],
            ['schoolIdsText', 'Additional KGBV UDISE codes (comma separated, max 3 total)', 'textarea', false],
            ['referenceLocation', 'Location entered for reference', 'text', false],
            ['actualLocation', 'Actual location from UDISE', 'text', false],
            ['start', 'Training Start Date', 'date', true],
            ['end', 'Training End Date', 'date', true],
            ['capacity', 'Maximum Batch Size', 'number', true],
            ['trainer', 'Trainer', 'text', true, db.trainers],
            ['open', 'Open Registration – Yes/No', 'text', true, [{
                id: 'yes',
                name: 'Yes'
            }, {
                id: 'no',
                name: 'No'
            }]]
        ]));
        $id('f-actualLocation').readOnly = true;
        $id('f-actualLocation').setAttribute('aria-readonly', 'true');
        $id('f-plan').insertAdjacentHTML('afterend', '<div id="selectedPlanSummary"></div>');
        refreshBatchPlan()
    }
    const masterSpecs = {
        certificateTemplates: {
            title: 'Certificate templates',
            cols: ['Template Code', 'Project Code', 'Project/Program Name', 'Authorized Signatory', 'Colour Scheme', 'Layout', 'Organization Logo File', 'Project Logo File'],
            collection: 'certificateTemplates'
        },
        certificateRecords: {
            title: 'Certificate records',
            cols: ['Certificate Number', 'Trainee ID', 'Batch Code', 'Template Code', 'Trainee Name', 'Training Name', 'Training Duration', 'Completion Date'],
            collection: 'certificateRecords'
        },
        trainers: {
            title: 'Trainer pool',
            cols: ['Trainer Code', 'Name', 'Category'],
            collection: 'trainers'
        },
        availability: {
            title: 'Trainer availability',
            cols: ['Trainer Code', 'Start Date', 'End Date'],
            collection: 'availability'
        },
        history: {
            title: 'Trainer assignment history',
            cols: ['Trainer Code', 'Project Code', 'Batch Code', 'Start Date', 'End Date'],
            collection: 'trainerHistory'
        },
        holidays: {
            title: 'Holiday calendar',
            cols: ['Name', 'Date', 'Scope', 'State', 'Project Code'],
            collection: 'holidays'
        },
        resources: {
            title: 'Training resources',
            cols: ['Name', 'Project Code', 'Training Plan Code', 'Common', 'Include Existing Batches', 'File Name', 'Training Days'],
            collection: 'resources'
        },
        forms: {
            title: 'Assessment & feedback forms',
            cols: ['Name', 'Project Code', 'Training Plan Code', 'Form Purpose', 'Question', 'Expected Answer', 'Training Days', 'Include Existing Batches'],
            collection: 'resources'
        }
    };
    let masterStage = null,
        availabilityFuture = false;

    function masterAllowed(kind) {
        return kind === 'availability' ? central() || trainer() : kind === 'resources' ? canUploadResources() : central()
    }

    function masterTools(kind) {
        return masterAllowed(kind) ? '<div class="toolbar">' + btn('Download Excel template', 'masterTemplate', kind) + btn('Bulk upload Excel', 'masterImport', kind) + '</div>' : ''
    }

    function masterRows(kind, rows, files = [], base = db) {
        let temp = structuredClone(base),
            results = [],
            usedFiles = new Set();
        temp.trainerHistory ||= [];
        const yes = v => /^yes$/i.test(String(v || '').trim()),
            validYN = v => /^(yes|no)$/i.test(String(v || '').trim());
        for (let [i, row] of rows.entries()) {
            let e = [],
                x = {
                    id: uid('MASTER'),
                    created: new Date().toISOString()
                },
                link = null,
                file = null;
            const val = k => String(row[k] ?? '').trim(),
                project = temp.projects.find(p => R.norm(p.code) === R.norm(val('Project Code'))),
                plan = temp.plans.find(p => R.norm(p.code) === R.norm(val('Training Plan Code'))),
                tr = temp.trainers.find(t => R.norm(t.code) === R.norm(val('Trainer Code'))),
                days = val('Training Days') ? val('Training Days').split(',').map(Number) : [];
            if (!masterAllowed(kind)) e.push('You do not have permission for this master import.');
            if (kind === 'trainers') {
                Object.assign(x, {
                    code: val('Trainer Code'),
                    name: val('Name'),
                    category: val('Category')
                });
                if (!x.code || !x.name) e.push('Trainer Code and Name are required.');
                if (!['Employee', 'Consultant'].includes(x.category)) e.push('Category must be Employee or Consultant.');
                if (temp.trainers.some(t => R.norm(t.code) === R.norm(x.code))) e.push('Trainer Code already exists.');
            }
            if (kind === 'availability' || kind === 'history') {
                Object.assign(x, {
                    trainer: tr?.id,
                    start: dateValue(row['Start Date']),
                    end: dateValue(row['End Date'])
                });
                if (!tr) e.push('Trainer Code does not exist.');
                if (kind === 'availability' && !central() && tr?.id !== user().trainer) e.push('Trainers can maintain only their own availability.');
                if (!R.date(x.start) || !R.date(x.end) || x.start > x.end) e.push('Use valid dates; End Date must be on or after Start Date.');
                if (kind === 'availability' && temp.availability.some(a => a.trainer === x.trainer && a.start === x.start && a.end === x.end)) e.push('This availability interval already exists.');
                if (kind === 'history') {
                    Object.assign(x, {
                        project: project?.id,
                        batchCode: val('Batch Code'),
                        imported: true
                    });
                    if (!project || !x.batchCode) e.push('Valid Project Code and Batch Code are required.');
                    if (project && (x.start < project.start || x.end > project.end)) e.push('Historical assignment dates must be within the project period.');
                    if (temp.trainerHistory.some(a => a.trainer === x.trainer && a.project === x.project && R.norm(a.batchCode) === R.norm(x.batchCode) && a.start === x.start && a.end === x.end) || temp.batches.some(b => b.trainer === x.trainer && b.project === x.project && R.norm(b.code) === R.norm(x.batchCode) && b.start === x.start && b.end === x.end)) e.push('Assignment history already exists.');
                }
            }
            if (kind === 'holidays') {
                Object.assign(x, {
                    name: val('Name'),
                    date: dateValue(row.Date),
                    scope: val('Scope'),
                    state: val('State'),
                    project: project?.id || ''
                });
                if (!x.name || !R.date(x.date)) e.push('Holiday Name and valid Date are required.');
                if (!['National', 'State', 'Project', 'Project + State'].includes(x.scope)) e.push('Scope must be National, State, Project or Project + State.');
                if (x.scope === 'National' && (x.state || val('Project Code'))) e.push('National holidays must not have a State or Project Code.');
                if (x.scope === 'State' && (!x.state || val('Project Code'))) e.push('State holidays need State and no Project Code.');
                if (x.scope === 'Project' && (!project || x.state)) e.push('Project holidays need valid Project Code and no State.');
                if (x.scope === 'Project + State' && (!project || !x.state)) e.push('Project + State holidays need valid Project Code and State.');
                if (temp.holidays.some(h => h.date === x.date && R.norm(h.state) === R.norm(x.state) && (h.project || '') === x.project)) e.push('Holiday already exists for this date and scope.');
            }
            if (kind === 'resources' || kind === 'forms') {
                Object.assign(x, {
                    name: val('Name'),
                    project: project?.id,
                    uploadedBy: active
                });
                if (!x.name) e.push('Name is required.');
                if (!project || !plan || plan.status !== 'Active' || !resourcePlans().some(p => p.id === plan.id)) e.push('Select a permitted active Training Plan Code and Project Code.');
                if (!validYN(val('Include Existing Batches'))) e.push('Include Existing Batches must be Yes or No.');
                if (!central() && yes(val('Include Existing Batches'))) e.push('Administrator review is required to include existing batches.');
                if (temp.resources.some(r => r.project === x.project && R.norm(r.name) === R.norm(x.name))) e.push('Resource/form name already exists in this project (import identity contract).');
                if (kind === 'resources') {
                    if (!validYN(val('Common'))) e.push('Common must be Yes or No.');
                    let matches = files.filter(f => f.name === val('File Name'));
                    if (matches.length !== 1) e.push('Select exactly one matching file for File Name.');
                    file = matches[0];
                    if (file) {
                        let err = R.resourceFile(file, temp.settings);
                        if (err) e.push(err);
                        if (usedFiles.has(file.name)) e.push('File Name is repeated in the workbook; use plan reuse for an existing resource.');
                        Object.assign(x, {
                            common: central() && yes(val('Common')),
                            commonRequested: trainer() && yes(val('Common')),
                            filename: file.name,
                            size: file.size,
                            mime: file.type,
                            type: file.name.split('.').pop().toUpperCase()
                        });
                    }
                } else {
                    let purpose = val('Form Purpose');
                    if (!['Pre-training assessment', 'Daily/periodic feedback', 'Post-training assessment'].includes(purpose)) e.push('Select a supported Form Purpose.');
                    Object.assign(x, {
                        type: 'Form',
                        formPurpose: purpose,
                        formType: purpose === 'Daily/periodic feedback' ? 'Feedback' : 'Assessment',
                        question: val('Question'),
                        answer: val('Expected Answer'),
                        common: false
                    });
                    if (!x.question) e.push('Question is required.');
                    if (x.formType === 'Assessment' && !x.answer) e.push('Expected Answer is required for demo assessment scoring.');
                }
                if (plan && (kind === 'forms' || days.length)) {
                    let err = R.planDays(days, plan);
                    if (err) e.push(err);
                    if (new Set(days).size !== days.length) e.push('Training Days must not repeat.');
                }
                if (kind === 'forms' && !days.length) e.push('Forms require one or more Training Days.');
                link = {
                    id: uid('L'),
                    project: x.common ? null : x.project,
                    resource: x.id,
                    plan: plan?.id,
                    days,
                    applyExisting: yes(val('Include Existing Batches')),
                    created: x.created
                };
            }
            if (kind === 'certificateTemplates') {
                Object.assign(x, {
                    code: val('Template Code'),
                    project: project?.id,
                    program: val('Project/Program Name'),
                    signatory: val('Authorized Signatory'),
                    color: val('Colour Scheme'),
                    layout: val('Layout'),
                    organizationLogo: DEFAULT_CERT_LOGO,
                    projectLogo: ''
                });
                if (!x.code || !x.program || !x.signatory) e.push('Template Code, Project/Program Name and Authorized Signatory are required.');
                if (!project) e.push('Project Code must exist.');
                if (!/^#[0-9a-f]{6}$/i.test(x.color)) e.push('Colour Scheme must be a six-digit hex colour.');
                if (!['Landscape', 'Portrait'].includes(x.layout)) e.push('Layout must be Landscape or Portrait.');
                if ((temp.certificateTemplates || []).some(c => R.norm(c.code) === R.norm(x.code))) e.push('Template Code already exists.');
                for (let [field, col] of [
                        ['organizationLogo', 'Organization Logo File'],
                        ['projectLogo', 'Project Logo File']
                    ]) {
                    let name = val(col);
                    if (name) {
                        let matches = files.filter(f => f.name === name);
                        if (matches.length !== 1 || !/\.(png|jpe?g|webp)$/i.test(name)) e.push(col + ': select one matching PNG/JPG/WebP file.');
                        else x[field + 'File'] = matches[0];
                    }
                }
            }
            if (kind === 'certificateRecords') {
                let trainee = temp.trainees.find(t => t.id === val('Trainee ID')),
                    batch = temp.batches.find(b => R.norm(b.code) === R.norm(val('Batch Code'))),
                    template = (temp.certificateTemplates || []).find(c => R.norm(c.code) === R.norm(val('Template Code'))),
                    plan = temp.plans.find(p => p.id === batch?.plan);
                Object.assign(x, {
                    number: val('Certificate Number'),
                    trainee: trainee?.id,
                    batch: batch?.id,
                    project: batch?.project,
                    template: template?.id,
                    traineeName: val('Trainee Name'),
                    trainingName: val('Training Name'),
                    duration: Number(val('Training Duration')),
                    completionDate: dateValue(row['Completion Date']),
                    templateSnapshot: template ? structuredClone(template) : null
                });
                if (!x.number) e.push('Certificate Number is required.');
                if (!trainee || !batch || trainee.batch !== batch.id) e.push('Trainee ID must belong to Batch Code.');
                if (!template || template.project !== batch?.project) e.push('Template Code must belong to the batch project.');
                if (trainee && R.norm(x.traineeName) !== R.norm(trainee.name)) e.push('Trainee Name must match the trainee record.');
                if (!plan || R.norm(x.trainingName) !== R.norm(plan.name) || x.duration !== Number(plan.days)) e.push('Training Name and Duration must match the batch plan.');
                if (!R.date(x.completionDate) || x.completionDate > R.today() || batch && x.completionDate < batch.end) e.push('Completion Date must be valid, on/after batch end and not in the future.');
                if (trainee && !R.eligibility(trainee, temp).eligible) e.push(R.eligibility(trainee, temp).message);
                if ((temp.certificateRecords || []).some(c => R.norm(c.number) === R.norm(x.number))) e.push('Certificate Number already exists.');
                if ((temp.certificateRecords || []).some(c => c.trainee === x.trainee && c.batch === x.batch)) e.push('A certificate record already exists for this trainee/batch.');
            }
            if (!e.length) {
                temp[masterSpecs[kind].collection] ||= [];
                temp[masterSpecs[kind].collection].push(x);
                if (link) temp.links.push(link);
                if (file) usedFiles.add(file.name);
            }
            results.push({
                row: i + 2,
                data: x,
                link,
                file,
                errors: e
            });
        }
        return results
    }

    function openMasterImport(kind) {
        if (!masterSpecs[kind] || !masterAllowed(kind)) return deny();
        masterStage = null;
        modal('Bulk upload · ' + masterSpecs[kind].title, info('First-sheet XLSX template. Preview all rows, then save the validated list. Imports add records; use manual controls to change/remove availability. Dates: YYYY-MM-DD or Excel serial. No rows are saved if validation fails.') + masterTools(kind) + '<label for="masterWorkbook">Excel workbook (.xlsx)</label><input id="masterWorkbook" type="file" accept=".xlsx">' + (['resources', 'certificateTemplates'].includes(kind) ? '<label for="masterFiles">Matching resource / logo files (select all files listed in Excel)</label><input id="masterFiles" type="file" multiple>' : '') + '<div class="toolbar">' + btn('Validate upload', 'masterPreview', kind) + '</div><div id="masterPreview" role="status"></div><div class="form-actions">' + btn('Save validated upload', 'masterCommit', kind, 'btn-primary') + '</div>');
    }
    async function previewMaster(kind) {
        if (!masterAllowed(kind)) return deny();
        masterStage = null;
        let view = $id('masterPreview');
        try {
            let workbook = $id('masterWorkbook').files[0];
            if (!workbook || !workbook.name.toLowerCase().endsWith('.xlsx')) throw Error('Select the XLSX workbook.');
            let {
                headers,
                rows
            } = await Excel.read(workbook);
            let missing = masterSpecs[kind].cols.filter(c => !headers.includes(c));
            if (missing.length) throw Error('Missing columns: ' + missing.join(', '));
            if (!rows.length) throw Error('No data rows found.');
            let files = [...($id('masterFiles')?.files || [])],
                results = masterRows(kind, rows, files);
            masterStage = {
                kind,
                rows,
                files,
                results
            };
            view.innerHTML = info(results.some(r => r.errors.length) ? 'Validation failed. Nothing saved.' : 'All rows valid. Select Save validated upload.') + table(['Excel row', 'Record', 'Validation'], results.map(r => [r.row, esc(r.data.code || r.data.name || lookup(db.trainers, r.data.trainer)), r.errors.length ? '<span class="invalid-feedback">' + esc(r.errors.join(' · ')) + '</span>' : badge('Valid')]));
        } catch (err) {
            view.innerHTML = info(esc(err.message) + ' Nothing saved.', true)
        }
    }
    async function commitMaster() {
        if (!masterStage || uploadBusy) return;
        let {
            kind,
            rows,
            files
        } = masterStage;
        if (!masterAllowed(kind)) return deny();
        let results = masterRows(kind, rows, files);
        if (results.some(r => r.errors.length)) {
            $id('masterPreview').innerHTML = info('Revalidation failed. Nothing saved: ' + esc(results.flatMap(r => r.errors).join(' · ')), true);
            return
        }
        uploadBusy = true;
        let stored = [];
        try {
            await prepareCertLogos(results);
            for (let r of results)
                if (r.file) {
                    await fileStore('put', r.data.id, r.file);
                    stored.push(r.data.id)
                } let recheck = masterRows(kind, rows, files);
            if (recheck.some(r => r.errors.length)) throw Error('Data, permissions or approved formats changed during upload.');
            if (!commit(() => {
                    db[masterSpecs[kind].collection] ||= [];
                    for (let r of results) {
                        db[masterSpecs[kind].collection].push(r.data);
                        if (kind === 'certificateRecords') db.certificates.push({
                            trainee: r.data.trainee,
                            date: r.data.completionDate,
                            number: r.data.number,
                            provisional: true
                        });
                        if (r.link) db.links.push(r.link);
                        audit('Master ' + kind + ' imported', r.data.id, null, r.data, r.data.project || null)
                    }
                }, results.length + ' validated ' + masterSpecs[kind].title + ' records saved locally.')) throw Error('Metadata was not saved.');
            masterStage = null;
            closeModal();
            render();
        } catch (err) {
            let cleanup = await Promise.allSettled(stored.map(id => fileStore('delete', id)));
            $id('masterPreview').innerHTML = info(esc(err.message) + ' Import not saved.' + (cleanup.some(r => r.status === 'rejected') ? ' Some temporary file bytes could not be removed.' : ''), true)
        } finally {
            uploadBusy = false
        }
    }
    async function masterTemplate(kind) {
        if (!masterSpecs[kind] || !masterAllowed(kind)) return deny();
        let p = projects()[0],
            pl = resourcePlans().find(x => x.status === 'Active'),
            t = central() ? db.trainers[0] : db.trainers.find(t => t.id === user().trainer),
            start = R.add(today, 30),
            end = R.add(today, 31),
            samples = {
                certificateTemplates: [
                    ['CT-NEW-01', p?.code || '', 'Teacher Development', 'Sample Program Director', '#17365d', 'Landscape', '', '']
                ],
                certificateRecords: [
                    ['CERT-NEW-01', trainees()[0]?.id || '', lookup(db.batches, trainees()[0]?.batch, 'code'), certTemplates()[0]?.code || '', trainees()[0]?.name || '', lookup(db.plans, db.batches.find(b => b.id === trainees()[0]?.batch)?.plan), lookup(db.plans, db.batches.find(b => b.id === trainees()[0]?.batch)?.plan, 'days'), lookup(db.batches, trainees()[0]?.batch, 'end')]
                ],
                trainers: [
                    ['TR-NEW-01', 'New Trainer', 'Employee']
                ],
                availability: [
                    [t?.code || '', start, end]
                ],
                history: [
                    [t?.code || '', p?.code || '', 'HIST-DEMO-01', R.add(today, -7), R.add(today, -6)]
                ],
                holidays: [
                    ['Sample national holiday', R.add(today, 40), 'National', '', '']
                ],
                resources: [
                    ['New training slides', p?.code || '', pl?.code || '', 'No', 'No', 'training-slides.pptx', '']
                ],
                forms: [
                    ['New pre-training assessment', p?.code || '', pl?.code || '', 'Pre-training assessment', 'Which method encourages participation?', 'Discussion', '1', 'No']
                ]
            };
        download(await Excel.write(masterSpecs[kind].cols, samples[kind]), 'master-' + kind + '-template.xlsx');
    }

    function trainerHistory(id) {
        let t = db.trainers.find(t => t.id === id);
        if (!t || !central() && !batches().some(b => b.trainer === id)) return deny();
        let current = batches().filter(b => b.trainer === id).map(b => [esc(b.code), esc(lookup(db.projects, b.project)), esc(b.start), esc(b.end), 'Scheduled batch']),
            history = (db.trainerHistory || []).filter(h => h.trainer === id && projects().some(p => p.id === h.project)).map(h => [esc(h.batchCode), esc(lookup(db.projects, h.project)), esc(h.start), esc(h.end), 'Imported historical reference']);
        modal('Assignment history · ' + esc(t.code), table(['Batch', 'Project', 'From', 'To', 'Source'], current.concat(history)) + info('Imported historical references do not create or modify training schedules.'));
    }

    function openMaster(kind, id) {
        let edit = (kind === 'trainer' ? db.trainers : kind === 'holiday' ? db.holidays : db.availability).find(a => a.id === id) || {};
        if (kind === 'availability' ? !central() && !(trainer() && (!id || edit.trainer === user().trainer)) : !central()) return deny();
        let data = kind === 'availability' ? {
                ...edit,
                trainer: edit.trainer || user().trainer
            } : kind === 'form' ? {
                project: context === 'all' ? '' : context
            } : {
                ...edit
            },
            fields = kind === 'trainer' ? [
                ['name', 'Synthetic trainer name', 'text', true],
                ['code', 'Trainer code', 'text', true],
                ['category', 'Trainer category', 'text', true, ['Employee', 'Consultant'].map(x => ({
                    id: x,
                    name: x
                }))]
            ] : kind === 'availability' ? [
                ['trainer', 'Trainer', 'text', true, db.trainers.filter(t => central() || t.id === user().trainer)],
                ['start', 'Available from', 'date', true],
                ['end', 'Available to', 'date', true]
            ] : kind === 'holiday' ? [
                ['name', 'Holiday name', 'text', true],
                ['date', 'Holiday date', 'date', true],
                ['scope', 'Holiday scope', 'text', true, ['National', 'State', 'Project', 'Project + State'].map(n => ({
                    id: n,
                    name: n
                }))],
                ['state', 'State', 'text', false],
                ['project', 'Applicable project', 'text', false, projects()]
            ] : [
                ['name', 'Form name', 'text', true],
                ['project', 'Project', 'text', true, projects()],
                ['plan', 'Training Plan Code', 'text', true, plans().filter(p => p.status === 'Active').map(p => ({
                    id: p.id,
                    name: p.code + ' · ' + p.name
                }))],
                ['formPurpose', 'Form purpose', 'text', true, ['Pre-training assessment', 'Daily/periodic feedback', 'Post-training assessment'].map(n => ({
                    id: n,
                    name: n
                }))],
                ['question', 'Question', 'textarea', true],
                ['answer', 'Assessment expected answer (demo exact-match scoring)', 'text', false],
                ['wholePlan', 'Attach to entire Training Plan', 'checkbox', false],
                ['sampleFeedback', 'Use sample Teacher Training Feedback Form (20 questions)', 'checkbox', false],
                ['trainingDays', 'Training days (comma-separated; blank for entire plan)', 'text', false],
                ['applyExisting', 'Include existing batches (review decision)', 'checkbox', false]
            ];
        dialogForm = {
            kind,
            data
        };
        modal((id ? 'Edit ' : 'Add ') + kind, formHTML(kind, data, fields))
    }

    function openUser(id) {
        if (!central()) return deny();
        let u = db.users.find(x => x.id === id) || {
            projects: []
        };
        dialogForm = {
            kind: 'user',
            data: u
        };
        modal('Demo user role and scope', info('Permission boundaries are provisional. State/school/trainer/trainee role must have its matching scope.') + formHTML('user', {
            ...u,
            projectIDs: u.projects.join(',')
        }, [
            ['name', 'Synthetic user name', 'text', true],
            ['role', 'Role', 'text', true, roles.map(r => ({
                id: r,
                name: r
            }))],
            ['projectIDs', 'Project IDs comma separated, e.g. P1,P2', 'text', true],
            ['state', 'State Admin state', 'text', false],
            ['school', 'School Admin school', 'text', false, db.schools],
            ['trainer', 'Trainer pool identity', 'text', false, db.trainers],
            ['trainee', 'Trainee identity', 'text', false, db.trainees.map(t => ({
                id: t.id,
                name: nameMask(t)
            }))]
        ]))
    }

    function reviewSettings() {
        let s = db.settings;
        return '<form id="reviewForm" novalidate><div class="form-grid">' + field('attendance', 'Provisional minimum attendance % · blank = unresolved', 'number', s.attendance) + field('pass', 'Provisional assessment pass % · blank = unresolved', 'number', s.pass) + field('assessment', 'Assessment mandatory?', 'text', s.assessment, false, [{
            id: 'yes',
            name: 'Yes for review'
        }, {
            id: 'no',
            name: 'No for review'
        }]) + field('feedback', 'Feedback mandatory?', 'text', s.feedback, false, [{
            id: 'yes',
            name: 'Yes for review'
        }, {
            id: 'no',
            name: 'No for review'
        }]) + field('registration', 'Provisional registration window', 'text', s.registration, false, [{
            id: 'day1',
            name: 'Day 1 only (provisional)'
        }, {
            id: 'period',
            name: 'Within batch period (provisional)'
        }]) + field('trainerUpload', 'Default upload grant for trainers without individual settings', 'checkbox', s.trainerUpload) + field('propagate', 'Include existing batches for baseline links (review decision)', 'checkbox', s.propagate) + '</div><div id="formError" role="alert" class="invalid-feedback"></div><div class="form-actions"><button class="btn btn-primary">Save provisional settings</button></div></form>'
    }
    async function submitEdit(form) {
        let kind = form.dataset.kind,
            x = Object.fromEntries(new FormData(form));
        form.querySelectorAll('input[type=checkbox]').forEach(c => x[c.name] = c.checked);
        let old = dialogForm?.data || {},
            e = {};
        for (let f of form.querySelectorAll('[required]'))
            if (!f.disabled && !String(x[f.name] || '').trim()) e[f.name] = 'This field is required for the prototype.';
        if (form.querySelector('[type=email]')?.value && !form.querySelector('[type=email]').validity.valid) e.email = 'Enter a valid email address.';
        if (kind === 'registration') {
            let b = registrationBatch();
            if (!b || b.id !== x.batch) return errors({
                batch: 'Registration must use the batch in this link.'
            });
            Object.assign(e, R.trainee(x, b, db, true));
            if (db.users.some(u => u.id === String(x.mobile || '').trim())) e.mobile = 'This mobile number already has a login account. Sign in using your mobile number.';
            if (!matchesOTP(x, b.id, 'registration')) e.otp = 'Request a demo OTP for these contact details, then enter 123456.';
            if (Object.keys(e).length) return errors(e);
            if (commit(() => {
                    let t = {
                        ...teacherProfile(x),
                        id: uid('U'),
                        batch: b.id,
                        name: x.name.trim(),
                        mobile: x.mobile.trim(),
                        email: x.email.trim(),
                        approved: false,
                        created: R.today()
                    };
                    db.trainees.push(t);
                    db.users.push({
                        id: t.mobile,
                        name: t.name,
                        role: 'Trainee',
                        projects: [b.project],
                        trainee: t.id,
                        registeredMobile: true
                    });
                    audit('Self registration · simulated OTP', t.id, null, {
                        batch: b.id,
                        mobile: mask(x.mobile),
                        email: mask(x.email)
                    }, b.project)
                }, 'Trainee registered locally. Unique ID: ' + db.trainees.at(-1)?.id)) {
                otpChallenge = null;
                message('Trainee registered locally. Unique ID: ' + db.trainees.at(-1).id + ' · awaiting trainer approval. Login User ID: ' + db.trainees.at(-1).mobile + ' · Default password: Demo@123.');
                render()
            }
            return
        }
        if (kind === 'lookup') {
            let b = registrationBatch();
            Object.assign(e, R.contact(x));
            if (!b || b.id !== x.batch) e.batch = 'Lookup must use the batch in this link.';
            if (!matchesOTP(x, b?.id, 'lookup')) e.otp = 'Request a demo OTP for these contact details, then enter 123456.';
            if (Object.keys(e).length) return errors(e);
            let matches = db.trainees.filter(t => t.batch === b.id && R.sameContact(t, x));
            otpChallenge = null;
            modal('Unique ID lookup · simulated verification', matches.length ? table(['Unique ID', 'Name masked'], matches.map(t => [esc(t.id), nameMask(t)])) : info('No matching trainee ID found in this batch.'));
            return
        }
        if (['trainer', 'availability', 'holiday', 'form'].includes(kind)) {
            let mk = {
                trainer: 'trainers',
                availability: 'availability',
                holiday: 'holidays',
                form: 'forms'
            } [kind];
            if (!masterAllowed(mk) || kind === 'availability' && old.id && !central() && old.trainer !== user().trainer) return deny();
            if (kind === 'form' && x.wholePlan) {
                let p = plans().find(p => p.id === x.plan);
                if (p) x.trainingDays = Array.from({
                    length: p.days
                }, (_, i) => i + 1).join(',')
            }
            if (kind === 'form' && x.sampleFeedback) {
                x.formPurpose = 'Daily/periodic feedback';
                x.question = 'Smart Classroom / Digital Classroom Training — Teacher Training Feedback';
                delete e.question;
            }
            let row = kind === 'trainer' ? {
                'Trainer Code': x.code,
                Name: x.name,
                Category: x.category
            } : kind === 'availability' ? {
                'Trainer Code': lookup(db.trainers, x.trainer, 'code'),
                'Start Date': x.start,
                'End Date': x.end
            } : kind === 'holiday' ? {
                Name: x.name,
                Date: x.date,
                Scope: x.scope,
                State: x.state,
                'Project Code': x.project ? lookup(db.projects, x.project, 'code') : ''
            } : {
                Name: x.name,
                'Project Code': lookup(db.projects, x.project, 'code'),
                'Training Plan Code': lookup(db.plans, x.plan, 'code'),
                'Form Purpose': x.formPurpose,
                Question: x.question,
                'Expected Answer': x.answer,
                'Training Days': x.trainingDays,
                'Include Existing Batches': x.applyExisting ? 'Yes' : 'No'
            };
            let base = structuredClone(db),
                collection = masterSpecs[mk].collection;
            if (old.id) base[collection] = base[collection].filter(r => r.id !== old.id);
            let result = masterRows(mk, [row], [], base)[0];
            if (kind === 'form') {
                if (x.sampleFeedback) result.data.feedbackTemplate = 'teacher-training-20';
                if (x.wholePlan && result.link) {
                    result.link.wholePlan = true;
                    result.link.days = []
                }
            }
            if (result.errors.length) return errors({
                form: result.errors.join(' · ')
            });
            if (commit(() => {
                    let record = {
                            ...result.data,
                            id: old.id || result.data.id
                        },
                        i = db[collection].findIndex(r => r.id === record.id);
                    if (i < 0) db[collection].push(record);
                    else db[collection][i] = record;
                    if (result.link) db.links.push({
                        ...result.link,
                        resource: record.id
                    });
                    audit('Master ' + mk + ' saved', record.id, old.id ? old : null, record, record.project || null)
                }, 'Master data saved locally.')) {
                closeModal();
                render()
            }
            return
        }
        if (kind === 'planExample') {
            if (!central()) return deny();
            if (!projects().some(p => p.id === x.project)) e.project = 'Select a permitted project.';
            if (Object.keys(e).length) return errors(e);
            let code = uniquePlanCode();
            if (commit(() => {
                    let id = uid('PLAN'),
                        created = new Date().toISOString();
                    db.plans.push({
                        id,
                        code,
                        project: x.project,
                        name: 'Digital Teaching – Induction (SAMPLE)',
                        type: 'Induction',
                        description: 'SAMPLE: four-day training plan for stakeholder review.',
                        days: 4,
                        dayNotes: {
                            1: 'Pre-assessment + Training',
                            2: 'Training + Learning Resources',
                            3: 'Training + Learning Resources',
                            4: 'Post-assessment + Feedback'
                        },
                        created
                    });
                    let resources = [{
                        name: 'Sample pre-assessment',
                        type: 'Form',
                        formType: 'Assessment',
                        question: 'Which method encourages learner participation?',
                        answer: 'Discussion',
                        days: [1]
                    }, {
                        name: 'Sample learning resource',
                        type: 'Sample text',
                        seed: true,
                        days: [2, 3]
                    }, {
                        name: 'Sample post-assessment',
                        type: 'Form',
                        formType: 'Assessment',
                        question: 'Which method encourages learner participation?',
                        answer: 'Discussion',
                        days: [4]
                    }, {
                        name: 'Sample post-feedback',
                        type: 'Form',
                        formType: 'Feedback',
                        question: 'What helped you most?',
                        answer: '',
                        days: [4]
                    }];
                    for (let r of resources) {
                        let resource = uid('RES'),
                            {
                                days,
                                ...metadata
                            } = r;
                        db.resources.push({
                            ...metadata,
                            id: resource,
                            project: x.project,
                            common: false,
                            uploadedBy: active,
                            created
                        });
                        db.links.push({
                            id: uid('L'),
                            plan: id,
                            resource,
                            days,
                            applyExisting: false,
                            created
                        })
                    }
                    audit('Four-day sample training plan created', id, null, {
                        code,
                        days: 4,
                        sample: true
                    }, x.project)
                }, 'Four-day sample plan created: ' + code)) {
                closeModal();
                render()
            }
            return
        }
        if (kind === 'project') {
            if (!central()) return deny();
            Object.assign(e, R.project(x, db))
        }
        if (kind === 'plan') {
            if (!central()) return deny();
            if (old.id && planUsed(old.id)) {
                for (let k of ['project', 'type', 'days'])
                    if (x[k] === undefined) x[k] = String(old[k]);
                if (String(x.days) !== String(old.days) || x.project !== old.project || x.type !== old.type) e.days = 'This plan is in use. Create a revised plan for structural changes.';
                if (!String(x.reason || '').trim()) e.reason = 'Enter a reason for changing a used plan.'
            }
            x.code = old.code || uniquePlanCode();
            Object.assign(e, R.plan(x, db))
        }
        if (kind === 'planSchedule') {
            if (!central() || !plans().some(p => p.id === old.id)) return deny();
            if (planUsed(old.id)) return errors({
                form: 'Day activities are protected for a used plan. Create a revised plan.'
            });
            if (commit(() => {
                    let p = db.plans.find(p => p.id === old.id),
                        before = structuredClone(p.dayNotes || {});
                    p.dayNotes = Object.fromEntries(Array.from({
                        length: p.days
                    }, (_, i) => [i + 1, String(x['note' + (i + 1)] || '').trim()]));
                    audit('Plan day activities changed', p.id, before, p.dayNotes, p.project)
                }, 'Day activities saved locally.')) {
                closeModal();
                render()
            }
            return
        }
        if (kind === 'batch') {
            if (!canManageBatches(old.id ? db.batches.find(b => b.id === old.id) : null)) return deny();
            if (String(x.schoolIdsText || '').trim()) {
                const ids = String(x.schoolIdsText).split(/[;,\n]/).map(code => code.trim()).filter(Boolean).map(code => db.schools.find(s => R.norm(s.udise) === R.norm(code) || R.norm(s.id) === R.norm(code))?.id).filter(Boolean);
                if (ids.length !== String(x.schoolIdsText).split(/[;,\n]/).map(code => code.trim()).filter(Boolean).length) e.school = 'One or more additional UDISE codes were not found.';
                x.schoolIds = [...new Set([x.school, ...ids])];
                x.school = x.schoolIds[0];
            } else x.schoolIds = [x.school];
            delete x.schoolIdsText;
            if (!['yes', 'no'].includes(x.open)) e.open = 'Choose Yes or No for Open Registration.';
            x.open = x.open === 'yes';
            if (!batchCandidateAllowed(x)) e.project = 'Project/school is outside your authorized batch scope.';
            Object.assign(e, R.batch(x, db));
            if (old.closed) e.project = 'This batch is finally closed. Editing policy requires business clarification.';
            if (old.id && x.project !== old.project && db.trainees.some(t => t.batch === old.id)) e.project = 'A registered batch must retain its project to protect historical records.';
            if (old.id && x.plan !== old.plan && (today >= old.start || db.trainees.some(t => t.batch === old.id))) e.plan = 'A started or registered batch must retain its training plan to protect history.';
            if (old.id && today >= old.start && (x.start !== old.start || x.end !== old.end)) e.start = 'Changing dates after a batch starts needs an approved policy.'
        }
        if (kind === 'link') {
            let p = plans().find(p => p.id === old.plan),
                r = db.resources.find(r => r.id === x.resource);
            if (!central() || !p) return deny();
            let days = [...form.querySelectorAll('[name=dayChoice]:checked')].map(c => Number(c.value)),
                error = R.planDays(days, p);
            if (error && !x.wholePlan) e.days = error;
            if (x.wholePlan && r?.formType !== 'Feedback') e.days = 'Entire plan assignment is available for feedback forms.';
            if (!r || (!r.common && r.project !== p.project)) e.resource = 'This resource is outside the project scope.';
            if (db.links.some(l => l.id !== old.id && l.plan === p.id && l.resource === r?.id)) e.resource = 'This resource is already linked. Use Change assigned days for an unused plan or create a revision for a used plan.';
            if (old.id && planUsed(p.id)) e.days = 'Existing day assignments are protected for a used plan. Create a revised plan.';
            if (planUsed(p.id) && x.applyExisting && !String(x.reason || '').trim()) e.reason = 'Enter a reason before including existing batches.';
            x.days = x.wholePlan ? [] : [...new Set(days)];
            x.plan = p.id
        }
        if (kind === 'availability') {
            if (!central() && (!trainer() || x.trainer !== user().trainer)) return deny();
            if (x.start > x.end) e.end = 'Availability end must be on or after start (prototype assumption).'
        }
        if (kind === 'trainer' || kind === 'holiday' || kind === 'form') {
            if (!central()) return deny();
            if (kind === 'form' && x.formType === 'Assessment' && !x.answer) e.answer = 'Provide an expected answer for the demo assessment.';
            if (kind === 'trainer' && db.trainers.some(t => t.code === x.code)) e.code = 'Trainer code already exists (demo identity rule).'
        }
        if (kind === 'user') {
            if (!central()) return deny();
            x.projects = x.projectIDs.split(',').map(s => s.trim()).filter(Boolean);
            if (x.projects.some(p => !db.projects.some(q => q.id === p))) e.projectIDs = 'Use project IDs from the project register.';
            let map = {
                'State Admin': 'state',
                'School Admin': 'school',
                'Trainer': 'trainer',
                'Trainee': 'trainee'
            };
            if (map[x.role] && !x[map[x.role]]) e[map[x.role]] = 'Provide the corresponding role scope for this demo.';
            delete x.projectIDs
        }
        if (kind === 'batchPermission') {
            if (!central()) return deny();
            let u = db.users.find(u => u.id === x.userID && roles.slice(1, 4).includes(u.role));
            if (!u) e.userID = 'Select an administrator.';
            if (Object.keys(e).length) return errors(e);
            if (commit(() => {
                    u.batchManage = !!x.grant;
                    audit('Batch management grant changed', u.id, null, {
                        batchManage: u.batchManage
                    }, null)
                }, 'Scoped administrator batch permission saved locally.')) {
                closeModal();
                render()
            }
            return
        }
        if (kind === 'profile') {
            x.id = active
        }
        if (kind === 'resourcePolicy') {
            if (!central()) return deny();
            let extensions = x.extensions.split(',').map(v => v.trim().toLowerCase().replace(/^\./, '')).filter(Boolean);
            if (extensions.some(v => !/^[a-z0-9]+$/.test(v))) e.extensions = 'Use comma-separated file extensions, such as mp4, webm, mov.';
            if (!db.users.some(u => u.id === x.trainerUser && u.role === roles[4])) e.trainerUser = 'Select a trainer user.';
            if (Object.keys(e).length) return errors(e);
            if (commit(() => {
                    db.settings.multimediaExtensions = [...new Set(extensions)];
                    let u = db.users.find(u => u.id === x.trainerUser);
                    u.resourceUpload = !!x.grant;
                    audit('Resource upload policy updated', u.id, null, {
                        resourceUpload: u.resourceUpload,
                        extensions
                    }, null)
                }, 'Trainer permission and review-approved multimedia formats saved locally.')) {
                closeModal();
                render()
            }
            return
        }
        if (kind === 'resourceLink') {
            if (!central()) return deny();
            let r = db.resources.find(r => r.id === old.resource);
            Object.assign(e, R.resourceLink(x, r, db));
            if (!resourcePlans().some(p => p.id === x.plan)) e.plan = 'Select a permitted plan.';
            if (Object.keys(e).length) return errors(e);
            if (commit(() => {
                    let link = {
                        id: uid('L'),
                        resource: r.id,
                        project: x.project,
                        plan: x.plan,
                        days: [],
                        applyExisting: !!x.applyExisting,
                        created: new Date().toISOString()
                    };
                    db.links.push(link);
                    audit('Resource reused in plan', r.id, null, link, x.project)
                }, 'Resource linked locally. Batch availability follows this link’s review policy.')) {
                closeModal();
                render()
            }
            return
        }
        if (kind === 'resource') {
            if (!canUploadResources()) return deny();
            let file = form.querySelector('[name=file]').files[0],
                fileError = R.resourceFile(file, db.settings),
                plan = resourcePlans().find(p => p.id === x.plan && p.status === 'Active');
            if (fileError) e.file = fileError;
            if (!resourceProjects().some(p => p.id === x.project)) e.project = 'Select a permitted project with a training plan.';
            if (!plan) e.plan = 'Select an active reusable Training Plan.';
            if (trainer() && x.applyExisting) e.applyExisting = 'Administrator review is required to include existing batches.';
            if (Object.keys(e).length) return errors(e);
            let submit = form.querySelector('[type=submit]');
            if (submit.disabled) return;
            submit.disabled = true;
            submit.textContent = 'Storing file bytes…';
            let id = uid('RES');
            try {
                await fileStore('put', id, file)
            } catch (err) {
                submit.disabled = false;
                submit.textContent = 'Upload & link locally';
                return errors({
                    file: 'File was not stored: ' + err.message
                })
            }
            if (!canUploadResources() || R.resourceFile(file, db.settings) || !resourcePlans().some(p => p.id === x.plan && p.status === 'Active')) {
                await fileStore('delete', id).catch(() => {});
                submit.disabled = false;
                submit.textContent = 'Upload & link locally';
                return errors({
                    plan: 'Permission or plan changed during upload. Resource was not saved.'
                })
            }
            let ok = commit(() => {
                let created = new Date().toISOString(),
                    r = {
                        id,
                        name: x.name.trim(),
                        project: x.project,
                        common: central() && !!x.common,
                        commonRequested: trainer() && !!x.common,
                        type: file.name.split('.').pop().toUpperCase(),
                        filename: file.name,
                        size: file.size,
                        mime: file.type,
                        uploadedBy: active,
                        created
                    };
                db.resources.push(r);
                let link = {
                    id: uid('L'),
                    project: x.common && central() ? null : x.project,
                    plan: x.plan,
                    resource: id,
                    days: [],
                    applyExisting: central() && !!x.applyExisting,
                    created
                };
                db.links.push(link);
                audit('Resource bytes stored and plan linked', id, null, {
                    filename: file.name,
                    size: file.size,
                    plan: x.plan,
                    common: r.common,
                    commonRequested: r.commonRequested,
                    applyExisting: link.applyExisting
                }, x.project)
            }, 'Resource bytes, metadata and plan link stored locally.' + (trainer() && x.common ? ' Common publication request is pending administrator review.' : ''));
            if (!ok) {
                await fileStore('delete', id).catch(() => {});
                submit.disabled = false;
                submit.textContent = 'Upload & link locally';
                return
            }
            closeModal();
            render();
            return
        }
        if (kind === 'submission') {
            if (!trainee()) return deny();
            let r = db.resources.find(r => r.id === old.resource),
                t = trainees().find(t => t.id === user().trainee),
                b = batches().find(b => b.id === t?.batch);
            if (!r || !b || !accessible(r, b)) e.answer = 'This activity is not available on this date.';
            if (r?.feedbackTemplate === 'teacher-training-20') {
                for (let i = 1; i <= 20; i++)
                    if (!String(x['q' + i] || '').trim()) e['q' + i] = 'This question is required.';
                for (let i = 4; i <= 17; i++)
                    if (!/^[1-5]$/.test(x['q' + i] || '')) e['q' + i] = 'Choose a rating from 1 to 5.';
                if (!/^[0-9]{10}$/.test(x.q3 || '')) e.q3 = 'Enter a 10-digit contact number.';
                if (!['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'].includes(x.q18)) e.q18 = 'Choose an overall rating.';
                x.answer = TEACHER_FEEDBACK_QUESTIONS.map((q, i) => q + ': ' + (x['q' + (i + 1)] || '')).join('\n')
            }
            if (db.submissions.some(s => s.trainee === t?.id && s.resource === r?.id)) e.answer = 'This form has already been submitted.';
            if (Object.keys(e).length) return errors(e);
            if (commit(() => {
                    db.submissions.push({
                        id: uid('SUB'),
                        trainee: t.id,
                        resource: r.id,
                        date: today,
                        answer: x.answer,
                        responses: r.feedbackTemplate ? Object.fromEntries(TEACHER_FEEDBACK_QUESTIONS.map((q, i) => ['q' + (i + 1), x['q' + (i + 1)]])) : undefined,
                        score: r.formType === 'Assessment' ? (R.norm(x.answer) === R.norm(r.answer) ? 100 : 0) : null
                    });
                    audit('Form submitted', r.id, null, {
                        trainee: t.id,
                        type: r.formType
                    }, b.project)
                }, 'Form response stored locally. Demo scoring uses exact-answer matching.')) {
                closeModal();
                render()
            }
            return
        }
        if (['certificateTemplate', 'certificateRecord'].includes(kind)) return saveCertForm(form, kind, x);
        if (kind === 'template') {
            if (!central()) return deny();
            for (let n of ['organizationLogo', 'projectLogo']) {
                let f = form.querySelector('[name=' + n + ']')?.files[0];
                if (f) {
                    if (!/\.(png|jpg|jpeg)$/i.test(f.name)) e[n] = 'Use PNG or JPG for the demo logo.';
                    else try {
                        x[n] = await readDataURL(f)
                    } catch (err) {
                        e[n] = 'Logo could not be read.'
                    }
                } else x[n] = db.template[n]
            }
            if (Object.keys(e).length) return errors(e);
            if (commit(() => {
                    let before = db.template;
                    db.template = {
                        program: x.program,
                        signatory: x.signatory,
                        color: x.color,
                        organizationLogo: x.organizationLogo,
                        projectLogo: x.projectLogo
                    };
                    audit('Template edited', 'template', {
                        program: before.program
                    }, {
                        program: x.program
                    }, null)
                }, 'Certificate template saved locally.')) {
                closeModal();
                render()
            }
            return
        }
        if (Object.keys(e).length) return errors(e);
        let collection = {
            project: 'projects',
            plan: 'plans',
            batch: 'batches',
            trainer: 'trainers',
            availability: 'availability',
            holiday: 'holidays',
            form: 'resources',
            link: 'links',
            user: 'users',
            profile: 'profiles'
        } [kind];
        if (!collection) return errors({
            form: 'Unknown form operation.'
        });
        if (commit(() => {
                let before = old.id ? db[collection].find(v => v.id === old.id) : null;
                let record = {
                    ...old,
                    ...x,
                    id: old.id || uid(kind.toUpperCase())
                };
                delete record.batch;
                if (kind === 'plan') {
                    record.code = x.code;
                    record.name = x.name.trim();
                    record.days = Number(x.days)
                }
                if (kind === 'batch') {
                    record.code = x.code.trim();
                    record.actualLocation = lookup(db.schools, x.school, 'location');
                    record.capacity = Number(x.capacity);
                    record.closed = old.closed || false;
                    record.created = old.created || new Date().toISOString();
                    record.planSnapshot = old.plan === record.plan && old.planSnapshot ? old.planSnapshot : planSnapshot(record.plan);
                    record.planCode = record.planSnapshot?.code
                }
                if (kind === 'link') record.created = old.created || new Date().toISOString();
                if (kind === 'form') {
                    record.type = 'Form';
                    record.common = false;
                    record.created = new Date().toISOString();
                    record.uploadedBy = active
                }
                let idx = db[collection].findIndex(v => v.id === record.id);
                if (idx < 0) db[collection].push(record);
                else db[collection][idx] = record;
                if (kind === 'profile') {
                    let before = db.profiles.find(p => p.id === active) || {};
                    for (let k of ['name', 'mobile', 'email']) db.profilesAudit = (db.profilesAudit || []).concat({
                        date: new Date().toISOString(),
                        user: active,
                        field: k,
                        old: mask(old[k]),
                        new: mask(x[k]),
                        changedBy: active
                    })
                }
                audit(kind + ' saved', record.id, kind === 'profile' ? {
                    name: mask(old.name),
                    mobile: mask(old.mobile),
                    email: mask(old.email)
                } : before, kind === 'profile' ? {
                    name: mask(x.name),
                    mobile: mask(x.mobile),
                    email: mask(x.email)
                } : record, record.project || null)
            }, 'Saved locally.')) {
            closeModal();
            render()
        }
    }

    function fileStore(op, id, value) {
        return new Promise((resolve, reject) => {
            let req = indexedDB.open('training-tracker-files-v1', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('files');
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
                let database = req.result,
                    tx = database.transaction('files', op === 'get' ? 'readonly' : 'readwrite'),
                    store = tx.objectStore('files'),
                    r = op === 'get' ? store.get(id) : op === 'delete' ? store.delete(id) : op === 'clear' ? store.clear() : store.put(value, id);
                let result;
                r.onsuccess = () => result = r.result;
                tx.oncomplete = () => {
                    database.close();
                    resolve(result)
                };
                tx.onerror = () => {
                    database.close();
                    reject(tx.error)
                };
                tx.onabort = () => reject(tx.error || Error('File storage transaction aborted.'))
            }
        })
    }

    function readDataURL(f) {
        return new Promise((res, rej) => {
            let r = new FileReader();
            r.onload = () => res(r.result);
            r.onerror = () => rej(r.error);
            r.readAsDataURL(f)
        })
    }

    function download(blob, name) {
        let a = document.createElement('a'),
            u = URL.createObjectURL(blob);
        a.href = u;
        a.download = name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 1000)
    }
    const batchCols = ['Batch ID', 'Project Code', 'Training Plan Code', 'UDISE Code', 'Additional UDISE Codes', 'Reference Location', 'Start Date', 'End Date', 'Maximum Size', 'Trainer Code', 'Open Registration'],
        traineeCols = ["Batch ID", "State", "District", "Block", "School Name", "UDISE Code", "Teacher Name", "Mobile", "Email", "Gender", "Designation", "Classes Taught", "Subjects Taught", "Teaching Experience"];

    function openImport(kind, id) {
        let b = batches().find(b => b.id === id);
        if (kind === 'batches' ? !canManageBatches() : !canBatch(b)) return deny();
        stage = null;
        dialogForm = {
            kind: 'import',
            type: kind,
            batch: id
        };
        modal('Import ' + kind + ' from Excel', info('Demo XLSX contract: first worksheet, named headers, dates as YYYY-MM-DD text or Excel serial dates. All rows validate before atomic save; no partial upload. Binary XLS and production size limits require clarification.') + '<div class="toolbar">' + btn('Download XLSX template', 'templateImport', kind) + '</div><label for="importFile">Excel workbook (.xlsx)</label><input id="importFile" type="file" accept=".xlsx"><div id="importPreview" role="status"></div><div class="form-actions">' + btn('Save validated import', 'commitImport', '', 'btn-primary') + '</div>');
        document.querySelector('[data-action=commitImport]').disabled = true
    }

    function dateValue(v) {
        if (/^\d+(\.\d+)?$/.test(v)) {
            let d = new Date(Date.UTC(1899, 11, 30) + Number(v) * 86400000);
            return d.toISOString().slice(0, 10)
        }
        return v
    }
    async function parseImport(file) {
        let setting = dialogForm;
        if (!file || setting?.kind !== 'import') return;
        let view = $id('importPreview');
        view.innerHTML = '<div class="loading">Parsing and validating workbook…</div>';
        document.querySelector('[data-action=commitImport]').disabled = true;
        try {
            let {
                headers,
                rows
            } = await Excel.read(file);
            if (dialogForm !== setting) return;
            let cols = setting.type === 'batches' ? batchCols : traineeCols,
                missing = cols.filter(h => h !== 'Additional UDISE Codes' && !headers.includes(h));
            if (missing.length) throw Error('Missing template columns: ' + missing.join(', '));
            if (!rows.length) throw Error('The workbook contains no data rows.');
            let temp = structuredClone(db),
                results = [];
            for (let [rowIndex, r] of rows.entries()) {
                let x, e;
                if (setting.type === 'batches') {
                    let extraUdises = String(r['Additional UDISE Codes'] || '').split(/[;,]/).map(code => code.trim()).filter(Boolean),
                        extraIds = extraUdises.map(code => temp.schools.find(s => R.norm(s.udise) === R.norm(code))?.id);
                    x = {
                        id: uid('B'),
                        code: String(r['Batch ID'] || '').trim(),
                        project: temp.projects.find(p => R.norm(p.code) === R.norm(r['Project Code']))?.id,
                        plan: temp.plans.find(p => R.norm(p.code) === R.norm(r['Training Plan Code']))?.id,
                        school: temp.schools.find(s => R.norm(s.udise) === R.norm(r['UDISE Code']))?.id,
                        schoolIds: [temp.schools.find(s => R.norm(s.udise) === R.norm(r['UDISE Code']))?.id, ...extraIds.filter(Boolean)].filter(Boolean),
                        referenceLocation: r['Reference Location'],
                        start: dateValue(r['Start Date']),
                        end: dateValue(r['End Date']),
                        capacity: Number(r['Maximum Size']),
                        trainer: temp.trainers.find(t => R.norm(t.code) === R.norm(r['Trainer Code']))?.id,
                        open: /^yes$/i.test(String(r['Open Registration'] || '').trim()),
                        closed: false,
                        created: new Date().toISOString()
                    };
                    e = R.batch(x, temp);
                    if (extraIds.some(id => !id)) e.school = 'One or more additional UDISE codes were not found.';
                    if (!/^(yes|no)$/i.test(String(r['Open Registration'] || '').trim())) e.open = 'Open Registration must be Yes or No (demo contract).';
                    if (!batchCandidateAllowed(x)) e.project = 'Project/school is outside permitted scope.';
                    x.school = x.schoolIds[0];
                    x.state = temp.schools.find(s => s.id === x.school)?.state;
                    x.district = temp.schools.find(s => s.id === x.school)?.district;
                    x.actualLocation = [...new Set(x.schoolIds.map(id => lookup(temp.schools, id, 'location')))].join('; ');
                    if (!Object.keys(e).length) temp.batches.push(x)
                } else {
                    let b = batches().find(b => R.norm(b.code) === R.norm(r['Batch ID']));
                    x = {
                        id: uid('U'),
                        batch: b?.id,
                        name: r['Teacher Name'],
                        mobile: String(r.Mobile || ''),
                        email: String(r.Email || ''),
                        state: r.State,
                        district: r.District,
                        block: r.Block,
                        schoolName: r['School Name'],
                        udise: r['UDISE Code'],
                        gender: r.Gender,
                        designation: r.Designation,
                        classes: r['Classes Taught'],
                        subjects: r['Subjects Taught'],
                        experience: r['Teaching Experience'],
                        registrationProfile: true,
                        approved: false,
                        created: today
                    };
                    e = R.trainee(x, b, temp, false);
                    if (!b || b.id !== setting.batch || !canBatch(b)) e.batch = 'Row must refer to the selected permitted batch.';
                    if (!Object.keys(e).length) temp.trainees.push(x)
                }
                results.push({
                    row: rowIndex + 2,
                    data: x,
                    errors: Object.values(e)
                })
            }
            stage = {
                ...setting,
                results
            };
            view.innerHTML = info(results.some(r => r.errors.length) ? 'Validation failed. Nothing has been saved.' : 'All rows parsed and validated. Select Save validated import to persist.') + table(['Excel row', 'Identifier', 'UDISE actual location / batch', 'Validation'], results.map(r => [r.row, esc(r.data.code || mask(r.data.name)), esc(stage.type === 'batches' ? r.data.actualLocation : lookup(db.batches, r.data.batch, 'code')), r.errors.length ? '<span class="invalid-feedback">' + esc(r.errors.join(' · ')) + '</span>' : badge('Valid')]));
            document.querySelector('[data-action=commitImport]').disabled = results.some(r => r.errors.length)
        } catch (e) {
            stage = null;
            view.innerHTML = '<p class="invalid-feedback">' + esc(e.message) + '. Nothing has been saved.</p>'
        }
    }
    async function commitImport() {
        if (!stage || stage.results.some(r => r.errors.length) || uploadBusy) return;
        if (stage.type === 'batches' ? !canManageBatches() : !canBatch(batches().find(b => b.id === stage.batch))) return deny();
        let temp = structuredClone(db),
            e = [];
        for (let r of stage.results) {
            let err = stage.type === 'batches' ? R.batch(r.data, temp) : R.trainee(r.data, temp.batches.find(b => b.id === r.data.batch), temp, false);
            if (stage.type === 'batches' && !batchCandidateAllowed(r.data)) err.project = 'Project/school is outside permitted scope.';
            if (stage.type === 'trainees' && r.data.batch !== stage.batch) err.batch = 'Row must refer to the selected batch.';
            if (Object.keys(err).length) e.push(...Object.values(err));
            temp[stage.type === 'batches' ? 'batches' : 'trainees'].push(r.data)
        }
        if (e.length) {
            $id('importPreview').innerHTML = info('Data changed after preview; import not saved: ' + esc(e.join(' · ')), true);
            return
        }
        uploadBusy = true;
        let records = stage.results.map(r => r.data),
            type = stage.type;
        if (commit(() => {
                if (type === 'batches')
                    for (let r of records) {
                        r.planSnapshot = planSnapshot(r.plan);
                        r.planCode = r.planSnapshot?.code
                    }
                db[type === 'batches' ? 'batches' : 'trainees'].push(...records);
                for (let r of records) audit(type + ' imported', r.id, null, type === 'trainees' ? {
                    batch: r.batch,
                    name: mask(r.name),
                    mobile: mask(r.mobile),
                    email: mask(r.email)
                } : r, r.project || db.batches.find(b => b.id === r.batch)?.project)
            }, records.length + ' validated ' + type + ' records stored locally.')) {
            closeModal();
            render()
        }
        uploadBusy = false
    }
    async function importTemplate(kind) {
        let cols = kind === 'batches' ? batchCols : traineeCols,
            b = db.batches.find(b => b.id === (dialogForm?.batch || 'B1'));
        let rows = kind === 'batches' ? [
            [uid('B-DEMO'), 'ODOO-101', db.plans.find(p => p.status === 'Active')?.code, 'DEMO-UDISE-01', 'Sample reference', R.add(today, 20), R.add(today, 23), 20, 'TR-DEMO-01', 'No']
        ] : [
            [b?.code || 'B-DEMO-01', ...teacherSampleRow(b)]
        ];
        download(await Excel.write(cols, rows), kind + '-template.xlsx');
        message('XLSX template generated and downloaded.')
    }
    async function openResource(id) {
        let r = resourceScope().find(r => r.id === id);
        if (!r) return deny();
        let eligibleBatch = batches().find(b => effectiveLinks(b).some(l => l.resource === id) && accessible(r, b));
        if (!central() && !(trainer() && r.uploadedBy === active) && !eligibleBatch) {
            modal('Resource availability', info('This activity is not available on this date, or is not linked to your permitted batch.', true));
            return
        }
        if (r.formType) {
            modal('Form master', panel(esc(r.name), '<p>' + esc(r.question) + '</p>' + (r.feedbackTemplate ? '<ol>' + TEACHER_FEEDBACK_QUESTIONS.map(q => '<li>' + esc(q.replace(/^\d+\. /, '')) + '</li>').join('') + '</ol>' : '') + info('Submit through Assessments & feedback using the trainee persona.')));
            return
        }
        try {
            let blob = r.seed ? new Blob(['SAMPLE classroom guide. Encourage participatory learning through discussion and reflection.'], {
                type: 'text/plain'
            }) : await fileStore('get', id);
            if (!blob) throw Error('File bytes are missing in this browser. Re-upload is required.');
            download(blob, r.seed ? 'sample-classroom-guide.txt' : r.filename);
            commit(() => {
                db.accesses.push({
                    resource: id,
                    user: active,
                    date: new Date().toISOString()
                });
                audit('Resource accessed', id, null, {
                    user: active
                }, r.project)
            }, 'Resource bytes opened/downloaded; local access recorded.')
        } catch (e) {
            message('Resource was not opened: ' + e.message, true)
        }
    }
    const DEFAULT_CERT_LOGO = 'data:image/webp;base64,UklGRn4PAABXRUJQVlA4WAoAAAAQAAAANgEASgAAQUxQSDQNAAAB8Eftvyqn/f89JxMmycQGS4PPguA2tLgGSlOcUIUGyqSGQ6CGM3VBOrhD6jihinPoC+oSSgoRJGiKhA5xAjOPP/Y+e+9zpqz18hURE0D/HK4z4Jm0p4a1i1ZXteOjqWnjnkzuGn9XiOs1atykJ3vH35Vyl4Woitp5VC5m+knwA9kfNlYQPmxjHgTLftk4tREnQRPvpzNRE48XCus9d9OPJ85mHlzzXGMj2i/Jhe6phe1kJmriURJejXugqUx3TdhFRBM1pUcyB3PswFlN7eEb8EkNu4o7u2dPnLOzDABSpeLnFwI4uXWR5+31h0vBfZWXXQn98pP9dabk3oZ+eZZIk1U3IPrbuAhFfb8HcPbjt15bdaQSAA50EJt6CYKlx2VWXwM3r5pMdil0/WeYtDN+KJ3AqQsjb8q8BJxqS2zcRwDmSFSZXQIUvFyH+FUG7WHWcYisbb7gZHa1kqht0DnOioYkWGNDALIFKRYFjg8A7OpI3Jjx5wEEloaLEEU+coWzoiEpbPhmJQBoNjEiavByGYCcIRHEtz9TwXzp5qZOW30dwExOWwCFqye52U8YN3fy+xUAJIYBFY1Jdw2wRsz5G+B/O4KER1YCu3WI7MVMC5IdwByzkGD/61D5eTWpZjlA0UMkGLEIAH6tJUQ0mvnNQmqHM9ggRTQSQAKJLmH6kX7NE8A7nL7A1QbET2NItz8Am1BkAbCS9CNOY7dQp+tA2RCSHQ5kCdA3AK6TdCSzkgSnQfGZBIlW14Cb95K42w/gVF0xJ7OYVO9g8LJcRAB5JPwIkyhAicAqzgggldTQJ8A9QqMBDBKgZ/CHyL03gcBQkt+MUpEMAH/IURGAVwU8UH6tmdA954BAEslOAIDfI4UcjEdZCieQLEXXcVQsUYq+xaec53ExVJULaC60A0BrkejyIoGa5wC8SQqbA3UENgHIVOAD4NEbBwMv1BKw7AWwguQ/AYB0IWLSlCVyUHqv1CloYp3lRuErzjt4g1TRcXQVOgGggwhl/B6mtx3A2QgVdBQ9BNJN0OW2ETgSqvccgJIaCuJ8ANDXTL8CwKXaMr/gSzGXXOytI5wP0VzdXAwSugTALSTaDwDGktIxv3czU3gejJ2uE/UngBWk8lXmN4uJGucDwK92CQ0ZBlFDG6dVN1JX/V67UBaAg4q+B1ASpUbcBLNhcFkd3hQA6KIk7jYA3G8iR9tSANhpMZlSKdmPASBFSScA2EbBF1VoFLy8bACFViX0JfOxmehhBm+bqaoz1HzDmYphKpYy4/4GxsDw4gimNQB8TWonMDesZqJ5DFKFDmGHIZvgNF9oLgAE5ofLZTOd/gYOGYfHmReZ+YpaMWhnKst2prKXSAbSDTkbDNTxFtjTw2Sqga0RfPZKE6xjtjOTFYXeYkaZiiIzAaAwwSwuBAUNqWSAb3uIdWNuk0nOu+XL9HrChFlMFuNWRDnMbHNRg6sAkF3VFGGJ2UFCvS5zgM8aiTzK+MyimvO0GW6FENFfTLKqg8xCk1HPSgA4UMWQEh83AAQLxW3loXyGVc9tqvJMeb/ePDOgOhGBTVGVwXjNRs8xWGOIeJAQDcrhAAdr6qQyd8ySSfI+vXdM4dR7TtVm5i3T0TIGzxvxjIvtPvDNkiCiKpMLOTgezxvOwBF8b5nGx3hUZTAvmy/0IOMfbEAi6T4RTERVVwQYHLZyunHaBN9sU1Qloj+Yj1R9xTxqPqp2GgBKXCYIuRlURL0uMnBzqnGeCL7RZiglItrOZKn6hWkZBNSyGADO1zKOdgcZ1c1jjnEoh1kcfJ3N8CvzAhOooegGAF9IMNDgAAD8ZDeuozsquKhZOQDU5CxkTgafrcwEy5iWDEapqQ0Am8gkyRI0g8EWi2GqzUQrmE6c9gzaBh19YYKBDB1jdqsZzgwzkVPI8imDN/6GXn9boh+TxKFvmdWKBjUy0QjjrlbhPM0Emir5EMC5UIPeTVFF9p8ZjDKFrYPVTAW3qok1ZLrx+jDlDZQ0vn3aRLbzhs0jri0PAD5VEVMEYBwZ0wP7dEYATcWo7p9M5WkzTMJ0M2l4Saw2gEB1Hn0KALuUfI63TURjjLrm4FF/Br0VTAeQGWrQIUzXGQO0l6Aut8A1LqIA3c20GtdihboC+I50HWcAYKKCFOA+gQzjQn4wKJX0lzHn4qRq3wQqWpFoODNdbCjQQecloI8MjVbSg3lAYiZKbEpiVKUBq4TeBDBCj5peA+AfIdW6GKdJ8CsApxXcAvAujxrdNGQzCdr2AsAPsRK2wwAeI+E45i2hey7BZ9VZCDwuRYtUJDHDxZqVYTfJzmPiVPUG8LRAvA84YBGgFhcABGZbxVpdBF4XyQFQGS5VFwB26dDA2wb8Ei1C9j0A8Et9IfvngP9pEu/O7BSJPAJsI90fgaVy1j0KJjJeoeongWlSnzI9VUX7AcwJ5d3zE5BXk4TjvgaAnx+06IWMuQmgkcBQsLNlLEuZ8jY6lOJXdrwmidu8APDXOJtezxPA9QEkbt/N3Bnj4EUkZQJw60wBUDFIihw5UjWzmfIRYTr2fscANJdpV8bstSuiLAA4OaV5hL3VjOvAoZokaRlxHgDy5g9pXrN6o36vngGAA8SNHbvwYICD4yvTnDrtXlyXC27lV28/bWdoSKmiI9VI+oFsALi8cEBDR3zntKMANtUhUfdrm65C95aPDQBAII6Iqjw9PxPcXxZPqi1GzXwiNVJnby6CbrGPLQF7nkTbPvvqV5Xg/vn+9JE1VNyfUQHB/KctJB/6xAE/JPP68lwQd+t4Ie7kUMvjKgLvVSGFoSO/h2j5p+1JHKp/ICJyQDhZgvr7BRKhfLWQF5KJKojsQ978OutSYd6BdxNDSHGNYe/s/C3/WkHuL595J/WMJt0Il3g1nToucRuPqkz3Sf3QmVQ3HPv+0fzrBbn7Fj0cTbIu1fUYq0s4VoZS05/RiXIprylUxyUZpeauGfN8pkj5liT6J2rdlDc+3bUvY82Lfez0PwKjWvZ+xO0eP8XtHtGvQ4PQf4rEj1x8+Aokb+dlvNw15J8aoSN/gvLLC2r98yLqKAwtH/5PixQY7PunRb2rBn3+TwuqtaTUgMJ5Yf+8IIp8eMNJFf5jyweG0z89HR1SZi78MGO3pmm7Mz5cOHP4fdH0/wE6nTJ1XPx4mViHTSbe6XQ664ZJ1HHF6zR1RQjYnXEiTV2RPKurtVT9xIH3hRlS28mvIWFpntQ3Qaq20+l01rEZEee0S9ictUXinPx4gQQXP1YEkPGC75FoCrwno4Gt3NdNyIvccF4mXALJyBDJxAaeAz4xq/sEAJSsq2tAJvjpQtGeAgDInxoulgm24sv26jKQLOFCpkgG+JqABn6yMbs9bKLEG0CBVSrd41mgwT9EDPNNgCQlsV8hcOS917cU4a8+RqzysMkiTXJw84MZs7aV4ac6Eqs8nkVHUNknWDZ5WLdQuodtZkwaKbTkowAPSiUSEY3BRauYv7MJzscoCPkSJ9sREVXbjrJmBrhItkY+PnYQEdXag98ixFxERC8hJ1iSSVZDIkmbpBeOT8XHaixX0VpoF7LDDfsSaxWMxvnqxLX+AwdMtBo7LcS1fYt5CkKL4bzLrcPL8f7SKCV0At2F0pZjvmGdspAkdwzDSbe6y2UxTbU7lfVJtz0KQ+XoItrc3SJuBurRHoxWUutOoKZYVL6/vVGu9v78KJl6KLPpGangcRwiwTx0l0tAZdTd5Mf09PT0BWKP4xDRKOxT4foRm0mMkpAVZhTNx3KZXviJiKh1Mr+Zuo+9Xq+3l8AMLBHZhlEylo7HsJaC5HOv1+vtJ7Y7PT09fbJB3HyxL/EMUVRpoI5Eic9XDhyKlaG1eMOw8Gz0lhiIbxgv+B513DSBt/CmyIeYIFTs81UAu+3BwvWIcTMMmuFwOBwxQnG3K2KJ6BO8JHEk4zf4HrSQVMz5O+2Nos7+s1FiHZDLtE5mf8Y0dT0cDocjTGAq1ovsxSNChzKO488+pN6wFIfD4QgXG+RwOByRBqWR9BR843K5XNNwXCKRqt3AoyRH/ZBlM4oWYrlYRDnqkW7IJSSqc5FkN5yx6NmK0UDIRXVK0C94kklWQyJJm+In6LtkaDwuRCqgdHgMs+cFBgvRJizTG4aLVtNYz+MhvQn4niRoBvLC7m4t8FcadzcWSIX+jrdVOC7dLjSKegQuiTW/hRRe4wKkkmloJK404XUoxf1SYacx6+72FtYQtzMuW2UoEZXNFNBAwDDyQoyeDCC9fQjVnvoXNlhMRGtQOKkqUfysMswlKRqKsgZ/a/lsC5FyHztdL+QCevAoD0lStAX7VNBHJrCflaDBBYC/HKj0hJCZLLPK4b9cEEDxGFJAe7DDgKv5+fn5c01U4mMHimj8BL2JGt+t10zLsOiM1aYKeDUX0+CQ1k5govYIr/oeLUGgu/a6yDotgUOJ2hdiFPHcjszsg576ZOA6LUGOqP6cg7nZe1+sQeLrtASmuaY1VfW6xp2ol6CtE3ld6y7l1fjdRf59FlZQOCAkAgAAUB0AnQEqNwFLAD7RWqdNqCSjoiKUDwkAGglnbuDBd/gCyAPwA/QD+AJ5OU2eJ/4v+DP6S/gn10otjysK4E4nKi/IFCo6Vv6pKBLaHQkJ8rp4vpowiz9WhLcgJEYK0mhixVxbucWRD4/mF4TPWfy+CghESuN00k80ofl74ArnLzUWXydVE3h7zwWjrf1sHrR/I7qNGqDTPgiSMAUh4OaVypyciM8MNgToevqXCb6nnJX6vgISzz9koINRKejJ8H1UJS9dkW6R0wRW49/hPndmvdy+zwfRmN4zPvQTF9L+FQBxpDeGEOl2VU1uvfTSrmi/k42gAPzTgJ/R6dHQdC7w5SqDIZNAxSJGEgKmadKTc1CuFt2ZClDU7A6zgOsMxmyhsF8awX+lbH82HeFY29sqIySnP7Ar3+6raBlJRM8OiphbsKmYMSmdil7lvCC9mWMRVQfF2O1R5JXVUfKL9VmCBugfezIM3+30H4QeKn++NG6sltjxFsGSh8A05amfBX//uic8N+EGI0Q7ylbxSkZTJVH9PmH5SuoS3Ln4Tn/D6y7RBKdd3q3GQO0xBhyWjyMSUsrB+lnaUSN1nUuFOYDZmEkw/bAbJ0QQAoxORLoUiHcnQYgiQVgp//NP/+eh//9BwN8iFiTlx61ZPyp2F07t2smwZ2izMGI76hFIc102VvTLBiO+l9VH3Jkk960Hv6Ej32xfpoaf//9gWbrIR65yv3YAAAA=';
    const CERT_STYLE = `.certificate-sheet{--cert:#17365d;background:#fff;color:#243244;border:8px double var(--cert);padding:38px;text-align:center;max-width:1000px;margin:18px auto;position:relative;font:16px/1.6 Georgia,serif}.certificate-sheet.portrait{max-width:640px;padding:54px 32px}.certificate-sheet .cert-logos{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px}.certificate-sheet .cert-logos img{max-width:160px;max-height:65px;object-fit:contain}.certificate-sheet .organization-logo{background:var(--cert);padding:10px;border-radius:6px}.certificate-sheet .cert-kicker{font:12px system-ui;letter-spacing:.2em;text-transform:uppercase;color:var(--cert)}.certificate-sheet h1{font:38px/1.2 Georgia,serif;color:var(--cert);margin:12px 0 24px}.certificate-sheet .cert-name{font:italic 34px Georgia,serif;margin:22px 0;border-bottom:1px solid #dbe4ee;padding:12px}.certificate-sheet .cert-training{font-size:21px;font-weight:bold}.certificate-sheet .cert-details{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;font:14px system-ui;margin:26px 0}.certificate-sheet .cert-signature{border-top:1px solid var(--cert);display:inline-block;padding:12px 28px;margin-top:24px}.certificate-sheet .cert-number{font:12px system-ui;letter-spacing:.05em}.certificate-sheet .cert-demo{font:11px system-ui;color:#a02c28;margin-top:20px}.certificate-sheet.landscape{padding:22px 32px;font-size:14px;line-height:1.45}.certificate-sheet.landscape p{margin:8px 0}.certificate-sheet.landscape .cert-logos{margin-bottom:12px}.certificate-sheet.landscape .cert-logos img{max-height:45px}.certificate-sheet.landscape h1{font-size:32px;margin:8px 0 16px}.certificate-sheet.landscape .cert-name{font-size:28px;margin:12px 0;padding:8px}.certificate-sheet.landscape .cert-details{margin:16px 0}.certificate-sheet.landscape .cert-signature{margin-top:16px;padding:8px 28px}@media(max-width:640px){.certificate-sheet{padding:22px 16px}.certificate-sheet h1{font-size:28px}.certificate-sheet .cert-name{font-size:27px}.certificate-sheet .cert-logos img{max-width:110px}}@media print{body{margin:0!important;padding:0!important;background:#fff!important}.certificate-sheet{break-inside:avoid;margin:0 auto;border-color:var(--cert);print-color-adjust:exact;-webkit-print-color-adjust:exact}.certificate-sheet .cert-demo{display:block}}`;

    function certTemplates() {
        return (db.certificateTemplates || []).filter(c => projects().some(p => p.id === c.project))
    }

    function certRecords() {
        return (db.certificateRecords || []).filter(c => trainees().some(t => t.id === c.trainee))
    }

    function certSheet(r, c, sample = false) {
        let logos = (c.organizationLogo ? '<img class="organization-logo" src="' + esc(c.organizationLogo) + '" alt="Organization logo">' : '') + (c.projectLogo ? '<img src="' + esc(c.projectLogo) + '" alt="Project logo">' : '');
        return '<section class="certificate-sheet ' + (c.layout === 'Portrait' ? 'portrait' : 'landscape') + '" style="--cert:' + esc(c.color) + '"><div class="cert-logos">' + logos + '</div><div class="cert-kicker">' + esc(c.program) + '</div><h1>Certificate of Training</h1><p>This certificate recognizes</p><div class="cert-name">' + esc(r.traineeName) + '</div><p>for completing the training program</p><div class="cert-training">' + esc(r.trainingName) + '</div><div class="cert-details"><span>Training duration: <strong>' + esc(r.duration) + ' days</strong></span><span>Completion date: <strong>' + esc(r.completionDate) + '</strong></span></div><div class="cert-signature">' + esc(c.signatory) + '<br><small>Authorized Signatory</small></div><p class="cert-number">Certificate Number: ' + esc(r.number) + '</p><p class="cert-demo">' + (sample ? 'SAMPLE CERTIFICATE · SYNTHETIC DATA' : 'LOCAL POC CERTIFICATE · NOT PRODUCTION ISSUANCE') + '</p></section>'
    }

    function certDocument(r, c, sample = false) {
        return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Certificate ' + esc(r.number) + '</title><style>body{background:#f5f8fb;padding:24px;margin:0}' + CERT_STYLE + '@page{size:A4 ' + (c.layout === 'Portrait' ? 'portrait' : 'landscape') + ';margin:12mm}</style></head><body>' + certSheet(r, c, sample) + '</body></html>'
    }

    function certSample(c) {
        return {
            traineeName: 'Sample Teacher Ananya Sharma',
            trainingName: 'Digital Teaching – Induction',
            duration: 4,
            completionDate: today,
            number: 'SAMPLE-' + c.code
        }
    }
    async function prepareCertLogos(results) {
        for (let r of results)
            for (let field of ['organizationLogo', 'projectLogo'])
                if (r.data[field + 'File']) {
                    let value = await readDataURL(r.data[field + 'File']);
                    if (!/^data:image\/(png|jpeg|webp);base64,/i.test(value)) throw Error('Logo must contain PNG, JPEG or WebP image data.');
                    r.data[field] = value;
                    delete r.data[field + 'File']
                }
    }

    function openCertTemplate(id) {
        if (!central()) return deny();
        let old = id ? certTemplates().find(c => c.id === id) : null;
        if (id && !old) return deny();
        dialogForm = {
            kind: 'certificateTemplate',
            data: old || {}
        };
        modal(old ? 'Edit certificate template' : 'Add certificate template', info('Trainee Name, Training Name, Duration, Completion Date and Certificate Number are filled from the certificate record. Template configuration supplies program, signatory, logos, colour and layout.') + formHTML('certificateTemplate', old || {
            color: '#17365d',
            layout: 'Landscape',
            project: context === 'all' ? '' : context
        }, [
            ['code', 'Template Code', 'text', true],
            ['project', 'Project', 'text', true, projects()],
            ['program', 'Project / Program Name', 'text', true],
            ['signatory', 'Authorized Signatory', 'text', true],
            ['color', 'Custom colour scheme', 'color', true],
            ['layout', 'Layout', 'text', true, ['Landscape', 'Portrait'].map(n => ({
                id: n,
                name: n
            }))],
            ['organizationLogo', 'Organization Logo PNG/JPG/WebP', 'file', false],
            ['projectLogo', 'Project Logo PNG/JPG/WebP', 'file', false]
        ], 'Save template'))
    }

    function openCertRecord() {
        if (!central()) return deny();
        dialogForm = {
            kind: 'certificateRecord',
            data: {}
        };
        modal('Create certificate record', info('Select a completed, approved trainee. Values must match the selected batch and plan. Certificate numbers must be unique. This remains a local POC record.') + formHTML('certificateRecord', {}, [
            ['number', 'Certificate Number', 'text', true],
            ['trainee', 'Trainee ID / Name', 'text', true, trainees().map(t => ({
                id: t.id,
                name: t.id + ' · ' + t.name
            }))],
            ['batch', 'Batch Code', 'text', true, batches().map(b => ({
                id: b.id,
                name: b.code
            }))],
            ['template', 'Certificate Template', 'text', true, certTemplates().map(c => ({
                id: c.id,
                name: c.code + ' · ' + c.program
            }))],
            ['traineeName', 'Trainee Name', 'text', true],
            ['trainingName', 'Training Name', 'text', true],
            ['duration', 'Training Duration (days)', 'number', true],
            ['completionDate', 'Completion Date', 'date', true]
        ], 'Save certificate record'))
    }
    async function saveCertForm(form, kind, x) {
        if (!central()) return deny();
        let old = dialogForm?.data || {},
            files = [],
            row;
        if (kind === 'certificateTemplate') {
            for (let field of ['organizationLogo', 'projectLogo']) {
                let file = form.querySelector('[name=' + field + ']')?.files[0];
                if (file) files.push(file)
            }
            row = {
                'Template Code': x.code,
                'Project Code': lookup(db.projects, x.project, 'code'),
                'Project/Program Name': x.program,
                'Authorized Signatory': x.signatory,
                'Colour Scheme': x.color,
                Layout: x.layout,
                'Organization Logo File': form.querySelector('[name=organizationLogo]')?.files[0]?.name || '',
                'Project Logo File': form.querySelector('[name=projectLogo]')?.files[0]?.name || ''
            }
        } else row = {
            'Certificate Number': x.number,
            'Trainee ID': x.trainee,
            'Batch Code': lookup(db.batches, x.batch, 'code'),
            'Template Code': (db.certificateTemplates || []).find(c => c.id === x.template)?.code,
            'Trainee Name': x.traineeName,
            'Training Name': x.trainingName,
            'Training Duration': x.duration,
            'Completion Date': x.completionDate
        };
        let type = kind === 'certificateTemplate' ? 'certificateTemplates' : 'certificateRecords',
            base = structuredClone(db);
        if (old.id) base[type] = base[type].filter(c => c.id !== old.id);
        let r = masterRows(type, [row], files, base)[0];
        if (r.errors.length) return errors({
            form: r.errors.join(' · ')
        });
        let button = form.querySelector('[type=submit]');
        if (button?.disabled) return;
        if (button) button.disabled = true;
        try {
            await prepareCertLogos([r]);
            if (old.id) {
                for (let field of ['organizationLogo', 'projectLogo'])
                    if (!form.querySelector('[name=' + field + ']')?.files[0]) r.data[field] = old[field] || '';
                r.data.id = old.id;
            }
            let latest = structuredClone(db);
            if (old.id) latest[type] = latest[type].filter(c => c.id !== old.id);
            if (masterRows(type, [row], files, latest)[0].errors.length) return errors({
                form: 'Data or permission changed. Please review and save again.'
            });
            if (commit(() => {
                    db[type] ||= [];
                    let index = db[type].findIndex(c => c.id === r.data.id);
                    if (index < 0) db[type].push(r.data);
                    else db[type][index] = r.data;
                    if (type === 'certificateRecords') db.certificates.push({
                        trainee: r.data.trainee,
                        date: r.data.completionDate,
                        number: r.data.number,
                        provisional: true
                    });
                    audit(type + ' saved', r.data.id, null, r.data, r.data.project)
                }, 'Certificate configuration saved locally.')) {
                closeModal();
                render()
            }
        } catch (err) {
            errors({
                form: err.message
            })
        } finally {
            if (button) button.disabled = false
        }
    }
    async function downloadCertRecords() {
        let records = certRecords();
        if (!records.length) return message('No certificate records in your scope.', true);
        let zip = new JSZip();
        for (let r of records) zip.file(r.number.replace(/[^A-Za-z0-9_-]/g, '_') + '-' + r.id + '.html', certDocument(r, r.templateSnapshot));
        download(await zip.generateAsync({
            type: 'blob'
        }), 'certificate-records.zip')
    }

    function certificateHTML(t) {
        let b = db.batches.find(b => b.id === t.batch),
            plan = db.plans.find(p => p.id === b.plan),
            c = certTemplates().find(c => c.project === b.project) || {
                ...db.template,
                layout: 'Landscape'
            };
        return '<style>' + CERT_STYLE + '</style>' + certSheet({
            traineeName: t.name,
            trainingName: plan.name,
            duration: plan.days,
            completionDate: b.end,
            number: 'DEMO-' + t.id
        }, c)
    }

    function previewCertificate(id) {
        let t = trainees().find(t => t.id === id);
        if (!t) return deny();
        let e = R.eligibility(t, db);
        if (!e.eligible) {
            modal('Certificate eligibility', info(esc(e.message), true));
            return
        }
        modal('Marked demo certificate', certificateHTML(t) + '<div class="form-actions">' + btn('Download printable HTML', 'downloadCertificate', id) + '</div>')
    }

    function lifecycle(t) {
        if (db.certificates.some(c => c.trainee === t.id)) return 'Certified';
        if (R.eligibility(t, db).eligible) return 'Training Completed';
        if (db.submissions.some(s => s.trainee === t.id && db.resources.find(r => r.id === s.resource)?.formType === 'Assessment')) return 'Assessment Completed';
        if (t.approved && db.attendance.some(a => a.trainee === t.id && a.status === 'Present')) return 'Training Started';
        return t.approved ? 'Approved' : 'Registered'
    }

    function renderReport() {
        reportType = $id('reportType').value;
        let val = n => $id(n)?.value || '',
            from = val('rStart'),
            to = val('rEnd');
        if (from && to && from > to) {
            $id('reportArea').innerHTML = info('From date must be before or equal to To date.', true);
            reportRows = [];
            reportHeaders = [];
            return
        }
        let bs = batches().filter(b => {
                let batchSchools = schoolIdsForBatch(b).map(id => db.schools.find(s => s.id === id)).filter(Boolean),
                    s = batchSchools[0],
                    p = R.batchPlan(b, db);
                return (!val('rProject') || b.project === val('rProject')) && (!val('rState') || batchSchools.some(s => s.state === val('rState'))) && (!val('rDistrict') || batchSchools.some(s => s.district === val('rDistrict'))) && (!val('rSchool') || schoolIdsForBatch(b).includes(val('rSchool'))) && (!val('rPlan') || b.plan === val('rPlan')) && (!val('rType') || p.type === val('rType')) && (!val('rBatch') || b.id === val('rBatch')) && (!val('rTrainer') || b.trainer === val('rTrainer')) && (!val('rStatus') || status(b) === val('rStatus')) && (!from || b.end >= from) && (!to || b.start <= to)
            }),
            ts = trainees().filter(t => bs.some(b => b.id === t.batch) && (!val('rTraineeStatus') || lifecycle(t) === val('rTraineeStatus'))),
            marks = db.attendance.filter(a => ts.some(t => t.id === a.trainee) && (!from || a.date >= from) && (!to || a.date <= to)),
            eligible = t => R.eligibility(t, db).eligible;
        let heads, rows = [];
        switch (reportType) {
            case 'Project Training Summary':
                heads = ['Project', 'Plan', 'Batches', 'Planned capacity', 'Registered', 'Approved', 'Training Started', 'Completed demo', 'Certified demo', 'Attendance %', 'Assessment/form %', 'Completion %'];
                rows = plans().filter(p => bs.some(b => b.plan === p.id)).map(p => {
                    let pb = bs.filter(b => b.plan === p.id),
                        pt = ts.filter(t => pb.some(b => b.id === t.batch)),
                        complete = pt.filter(eligible).length;
                    return [lookup(db.projects, p.project), p.name, pb.length, pb.reduce((n, b) => n + Number(b.capacity), 0), pt.length, pt.filter(t => t.approved).length, pt.filter(t => db.attendance.some(a => a.trainee === t.id && a.status === 'Present') && t.approved).length, db.settings.attendance === '' ? 'Pending' : complete, db.certificates.filter(c => pt.some(t => t.id === c.trainee)).length, statPct(marks.filter(a => pt.some(t => t.id === a.trainee))), formCompletion(pt), db.settings.attendance === '' ? 'Pending' : pt.length ? Math.round(complete / pt.length * 100) + '%' : 'N/A']
                });
                break;
            case 'Batch Performance':
                heads = ['Project', 'Batch ID', 'School', 'Plan', 'Trainer', 'Start', 'End', 'Capacity', 'Registered', 'Approved', 'Attended', 'Completed demo', 'Attendance %', 'Status'];
                rows = bs.map(b => {
                    let bt = ts.filter(t => t.batch === b.id);
                    return [lookup(db.projects, b.project), b.code, schoolNamesForBatch(b).join(', '), (R.batchPlan(b, db)?.name || '—'), lookup(db.trainers, b.trainer), b.start, b.end, b.capacity, bt.length, bt.filter(t => t.approved).length, bt.filter(t => marks.some(a => a.trainee === t.id && a.status === 'Present')).length, db.settings.attendance === '' ? 'Pending' : bt.filter(eligible).length, statPct(marks.filter(a => a.batch === b.id)), status(b)]
                });
                break;
            case 'Attendance':
                heads = ['Project', 'Batch', 'Trainee masked', 'Training date', 'Present/Absent', 'Plan days', 'Days present', 'Attendance %'];
                rows = marks.map(a => {
                    let b = bs.find(b => b.id === a.batch),
                        t = ts.find(t => t.id === a.trainee),
                        tm = marks.filter(x => x.trainee === t.id);
                    return [lookup(db.projects, b.project), b.code, nameMask(t), a.date, a.status, lookup(db.plans, b.plan, 'days'), tm.filter(x => x.status === 'Present').length, statPct(tm)]
                });
                break;
            case 'Trainer Availability':
                heads = ['Trainer', 'State/Location', 'Available from', 'Available to', 'Assigned batches', 'Available capacity', 'Utilization %'];
                rows = db.availability.filter(a => bs.some(b => b.trainer === a.trainer)).map(a => [lookup(db.trainers, a.trainer), [...new Set(bs.filter(b => b.trainer === a.trainer).map(b => lookup(db.schools, b.school, 'location')))].join(', '), a.start, a.end, bs.filter(b => b.trainer === a.trainer).length, 'Business clarification required', 'Business clarification required']);
                break;
            case 'User Lifecycle':
                heads = ['User type', 'Masked ID / code', 'Batch', 'Stage', 'Evidence'];
                rows = ts.map(t => ['Trainee', t.id, lookup(db.batches, t.batch, 'code'), lifecycle(t), 'Local registration/approval/attendance/submission evidence']).concat(db.trainers.filter(t => bs.some(b => b.trainer === t.id)).map(t => ['Trainer', t.code, bs.filter(b => b.trainer === t.id).map(b => b.code).join(', '), 'Assigned (demo)', 'Delivered/Inactive transitions require clarification']));
                break;
            case 'Resource Usage':
                heads = ['Project', 'Plan', 'Resource', 'Type', 'Upload date', 'Uploaded by', 'Users accessing', 'Accesses', 'Last accessed'];
                rows = bs.flatMap(b => effectiveLinks(b).map(l => ({
                    b,
                    l
                }))).filter((v, i, arr) => arr.findIndex(x => x.b.plan === v.b.plan && x.l.resource === v.l.resource) === i).map(({
                    b,
                    l
                }) => {
                    let r = db.resources.find(r => r.id === l.resource),
                        aa = db.accesses.filter(a => a.resource === r.id);
                    return [lookup(db.projects, b.project), (R.batchPlan(b, db)?.name || '—'), r.name, r.type, r.created, r.uploadedBy, new Set(aa.map(a => a.user)).size, aa.length, aa.at(-1)?.date || 'Not accessed']
                });
                break;
            case 'User Login & Activity':
                heads = ['User ID', 'Role', 'Last demo entry', 'Demo entries', 'Failed OTP tests', 'Verified OTP tests', 'Real failed login / inactive'];
                rows = db.users.filter(u => central() || u.id === active || (!trainer() && !trainee() && u.projects.some(p => bs.some(b => b.project === p)))).map(u => {
                    let aa = db.activity.filter(a => a.user === u.id && (!from || a.date.slice(0, 10) >= from) && (!to || a.date.slice(0, 10) <= to)),
                        entries = aa.filter(a => a.type === 'Demo entry');
                    return [u.id, u.role, entries.at(-1)?.date || 'None', entries.length, aa.filter(a => a.type === 'Demo OTP' && a.result === 'Failed simulation').length, aa.filter(a => a.type === 'Demo OTP' && a.result === 'Verified simulation').length, 'N/A · no real authentication']
                });
                break;
            case 'Profile Change Audit':
                heads = ['Date', 'User', 'Field changed', 'Old masked', 'New masked', 'Changed by'];
                rows = (db.profilesAudit || []).filter(a => (central() || a.user === active) && (!from || a.date.slice(0, 10) >= from) && (!to || a.date.slice(0, 10) <= to)).map(a => [a.date, a.user, a.field, a.old, a.new, a.changedBy]);
                break;
            default:
                heads = ['Project', 'Batch', 'Exception', 'State'];
                for (let b of bs) {
                    if (ts.some(t => t.batch === b.id && !t.approved)) rows.push([lookup(db.projects, b.project), b.code, 'Registration approval pending', 'Attention required']);
                    if (!marks.some(m => m.batch === b.id)) rows.push([lookup(db.projects, b.project), b.code, 'No attendance recorded', 'Attention required']);
                    if (R.batch(b, db).trainer) rows.push([lookup(db.projects, b.project), b.code, 'Trainer availability conflict', 'Attention required']);
                    for (let t of ts.filter(t => t.batch === b.id)) {
                        if (db.settings.attendance !== '' && !eligible(t)) rows.push([lookup(db.projects, b.project), b.code, nameMask(t) + ': ' + R.eligibility(t, db).message, 'Attention required'])
                    }
                }
        }
        reportRows = rows;
        reportHeaders = heads;
        $id('reportArea').innerHTML = '<h2 class="report-section">' + esc(reportType) + '</h2>' + info('Sample-browser evidence only. Missing measure definitions show N/A or Business clarification required. Filters apply to batch scope; date filters also apply to attendance/activity/audit rows.') + table(heads, rows.map(r => r.map(esc)))
    }
    async function exportReport(excel) {
        if (!reportHeaders.length) return message('Apply valid report filters before exporting.', true);
        let filename = reportType.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        try {
            if (excel) download(await Excel.write(reportHeaders, reportRows), filename + '.xlsx');
            else {
                let cell = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
                download(new Blob(['\uFEFF' + [reportHeaders, ...reportRows].map(r => r.map(cell).join(',')).join('\r\n')], {
                    type: 'text/csv'
                }), filename + '.csv')
            }
            commit(() => audit('MIS downloaded', reportType, null, {
                rows: reportRows.length,
                format: excel ? 'XLSX' : 'CSV'
            }, context), 'Current filtered report downloaded.')
        } catch (e) {
            message('Report could not be exported: ' + e.message, true)
        }
    }
    async function act(action, id) {
        let b = batches().find(b => b.id === id),
            t = trainees().find(t => t.id === id);
        switch (action) {
            case 'findRegistrationBatch': {
                let code = R.norm($id('registrationBatchCode')?.value);
                let found = db.batches.find(b => R.norm(b.code) === code);
                if (!code || !found) {
                    $id('batchCodeError').textContent = code ? 'Batch Code not found. Check the code provided by your trainer.' : 'Enter your Batch Code.';
                    return
                }
                otpChallenge = null;
                go('registration', found.id);
                return
            }
            case 'masterImport':
                return openMasterImport(id);
            case 'masterTemplate':
                return masterTemplate(id);
            case 'masterPreview':
                return previewMaster(id);
            case 'masterCommit':
                return commitMaster();
            case 'trainerHistory':
                return trainerHistory(id);
            case 'futureAvailability':
                availabilityFuture = !availabilityFuture;
                render();
                break;
            case 'newProject':
                return editProject();
            case 'editProject':
                return editProject(id);
            case 'newPlan':
                return editPlan();
            case 'editPlan':
                return editPlan(id);
            case 'batchPermissions':
                if (!central()) return deny();
                dialogForm = {
                    kind: 'batchPermission',
                    data: {}
                };
                {
                    let u = db.users.find(u => roles.slice(1, 4).includes(u.role));
                    modal('Batch management permission', info('Explicit review grant: scoped administrator may create/import/edit/delete batches within assigned project/state/school. Detailed production grants require business confirmation.') + formHTML('batchPermission', {
                        userID: u?.id,
                        grant: !!u?.batchManage
                    }, [
                        ['userID', 'Administrator', 'text', true, db.users.filter(u => roles.slice(1, 4).includes(u.role)).map(u => ({
                            id: u.id,
                            name: u.role + ' · ' + u.id
                        }))],
                        ['grant', 'Allow batch management in assigned scope', 'checkbox', false]
                    ], 'Save batch permission'))
                }
                break;
            case 'manageTrainees':
                if (!canBatch(b)) return deny();
                sessionStorage.setItem('reviewBatch', b.id);
                go('trainees');
                break;
            case 'newBatch':
                return editBatch();
            case 'editBatch':
                return editBatch(id);
            case 'linkPlan':
                return linkPlan(id);
            case 'viewProject': {
                let p = projects().find(p => p.id === id);
                if (!p) return deny();
                modal('Project details', table(['Field', 'Value'], Object.entries(p).map(([k, v]) => [esc(k), esc(v)])));
                break
            }
            case 'planExample':
                if (!central()) return deny();
                dialogForm = {
                    kind: 'planExample',
                    data: {}
                };
                modal('Create four-day sample plan', info('Creates a separate SAMPLE Digital Teaching – Induction plan with day-wise pre-assessment, training, learning resources, post-assessment and feedback. No existing batch will be reassigned.') + formHTML('planExample', {
                    project: context === 'all' ? '' : context
                }, [
                    ['project', 'Project', 'text', true, projects()]
                ], 'Create sample plan locally'));
                break;
            case 'planSchedule':
                return schedulePlan(id);
            case 'linkDay': {
                let [plan, day] = id.split('/');
                return linkPlan(plan, '', Number(day))
            }
            case 'editDayLink': {
                let l = db.links.find(l => l.id === id);
                if (!l) return deny();
                return linkPlan(l.plan, l.id)
            }
            case 'revisePlan': {
                if (!central()) return deny();
                let p = plans().find(p => p.id === id);
                if (!p) return deny();
                if (confirm('Create an independent revised plan with a new code? Existing batches and records will retain the original plan.')) {
                    let code = uniquePlanCode(),
                        newID = uid('PLAN');
                    if (commit(() => {
                            let next = {
                                ...structuredClone(p),
                                id: newID,
                                code,
                                revisedFrom: p.id,
                                created: new Date().toISOString()
                            };
                            db.plans.push(next);
                            for (let l of db.links.filter(l => l.plan === p.id)) db.links.push({
                                ...structuredClone(l),
                                id: uid('L'),
                                plan: newID,
                                applyExisting: false,
                                created: next.created
                            });
                            audit('Training plan revision created', newID, {
                                originalPlan: p.id
                            }, {
                                code,
                                revisedFrom: p.id
                            }, p.project)
                        }, 'Revised plan created locally: ' + code + '. Existing batches retain their original plan.')) {
                        render();
                        editPlan(newID)
                    }
                }
                break
            }
            case 'viewPlan': {
                let p = plans().find(p => p.id === id);
                if (!p) return deny();
                modal(p.name, panel('Training Plan', table(['Field', 'Value'], [
                    ['Project', esc(lookup(db.projects, p.project))],
                    ['Training Plan Code', esc(p.code)],
                    ['Training Type', esc(p.type)],
                    ['Description', esc(p.description || '—')],
                    ['Duration', p.days + ' days'],
                    ['Used by batches', db.batches.filter(b => b.plan === id).length]
                ])) + panel('Day-wise activities', planDayTable(p)) + panel('Plan-wide materials (not day-assigned)', table(['Resource', 'Availability', 'Action'], db.links.filter(l => l.plan === id && !l.days?.length).map(l => [esc(lookup(db.resources, l.resource)), 'Available once the link applies; assign days if required.', central() ? btn('Change assigned days', 'editDayLink', l.id) : '—']))));
                break
            }
            case 'viewBatch':
                if (!b) return deny();
                modal('Batch details', table(['Field', 'Value'], Object.entries(b).map(([k, v]) => [esc(k), esc(v)])) + info('Actual location: ' + esc(lookup(db.schools, b.school, 'location'))) + '<div class="actions"><a class="btn" href="#trainees" data-jump="' + esc(id) + '">View trainees</a><a class="btn" href="#completion" data-jump="' + esc(id) + '">Review completion</a></div>');
                break;
            case 'deleteBatch':
                if (!b || !canManageBatches(b)) return deny();
                if (b.closed) return message('A finally closed batch cannot be deleted under the prototype history policy.', true);
                if (db.trainees.some(t => t.batch === id) || db.attendance.some(a => a.batch === id)) return message('Batch has linked records; deletion policy requires clarification.', true);
                if (confirm('Delete this locally stored batch?'))
                    if (commit(() => {
                            db.batches = db.batches.filter(b => b.id !== id);
                            audit('Batch deleted', id, b, null, b.project)
                        }, 'Batch deleted locally.')) render();
                break;
            case 'approve':
                if (!trainer() || !t || db.batches.find(b => b.id === t.batch)?.closed || !canBatch(db.batches.find(b => b.id === t.batch))) return deny();
                if (commit(() => {
                        t.approved = true;
                        audit('Trainee approved', id, {
                            approved: false
                        }, {
                            approved: true
                        }, db.batches.find(b => b.id === t.batch).project)
                    }, 'Trainer approval saved locally.')) render();
                break;
            case 'approveList':
                if (!trainer() || !canBatch(b) || b.closed) return deny();
                if (confirm('Approve every trainee in this batch for the demo?'))
                    if (commit(() => {
                            db.trainees.filter(t => t.batch === b.id).forEach(t => t.approved = true);
                            audit('Trainee list approved', b.id, null, {
                                count: db.trainees.filter(t => t.batch === b.id).length
                            }, b.project)
                        }, 'Entire trainee list approved locally.')) render();
                break;
            case 'enableRegistration':
                if (!canBatch(b)) return deny();
                if (b.closed) return message('A finally closed batch cannot accept registrations.', true);
                if (commit(() => {
                        b.open = true;
                        audit('Open registration enabled', id, {
                            open: false
                        }, {
                            open: true
                        }, b.project)
                    }, 'Open registration enabled locally. Date and capacity checks still apply.')) render();
                break;
            case 'closeRegistration':
                if (!canBatch(b)) return deny();
                if (confirm('Close self-registration? Bulk upload remains available until final closure under the demo assumption.'))
                    if (commit(() => {
                            b.open = false;
                            audit('Registration closed', id, {
                                open: true
                            }, {
                                open: false
                            }, b.project)
                        }, 'Self-registration closed locally.')) render();
                break;
            case 'closeBatch': {
                if (!canBatch(b)) return deny();
                let list = db.trainees.filter(t => t.batch === b.id);
                if (!list.length) return message('Business clarification required: cannot close an empty batch in this demo.', true);
                if (list.some(t => !t.approved)) return message('Approve the entire trainee list before final closure.', true);
                let failures = list.map(t => R.eligibility(t, db)).filter(e => !e.eligible);
                if (failures.length) return message(failures[0].message, true);
                if (confirm('Close this batch under the current provisional completion criteria?'))
                    if (commit(() => {
                            b.closed = true;
                            b.open = false;
                            audit('Batch closed under provisional criteria', id, null, {
                                closed: true
                            }, b.project)
                        }, 'Batch marked Completed locally under provisional criteria.')) render();
                break
            }
            case 'loadAttendance':
                return attendanceTable(b, $id('attendanceDate').value);
            case 'saveAttendance':
                return saveAttendance(id);
            case 'attendanceImport':
                return openAttendanceImport(id);
            case 'attendanceTemplate':
                return attendanceTemplate(id);
            case 'attendancePreview':
                return previewAttendance(id);
            case 'attendanceCommit':
                return commitAttendance();
            case 'importBatches':
                return openImport('batches');
            case 'importTrainees':
                return openImport('trainees', id);
            case 'templateImport':
                return importTemplate(id);
            case 'commitImport':
                return commitImport();
            case 'copyLink': {
                if (!canBatch(b)) return deny();
                if (!b.open || b.closed) return message('Enable open registration before sharing this batch registration link.', true);
                let link = new URL(pageHref('registration', id), location.href).href;
                try {
                    await navigator.clipboard.writeText(link);
                    message('Batch registration link copied. This demo requires the same browser storage.')
                } catch (e) {
                    modal('Registration link', '<label for="copyURL">Copy this batch-specific link</label><input id="copyURL" readonly value="' + esc(link) + '">' + info('Clipboard access is unavailable. Select and copy the link.'))
                }
                break
            }
            case 'openRegistrationPage':
                if (!canBatch(b) || !b.open || b.closed) return deny();
                go('registration', b.id);
                break;
            case 'openLookup': {
                let batch = registrationBatch();
                if (!batch || batch.id !== id) return deny();
                otpChallenge = null;
                modal('Find my Unique ID', info('Enter mobile or email. Request a simulated OTP; no message is delivered.') + formHTML('lookup', {
                    batch: id
                }, [
                    ['mobile', 'Mobile Number', 'tel', false],
                    ['email', 'Email where applicable', 'email', false],
                    ['otp', 'Demo OTP', 'text', true]
                ], 'Verify & find Unique ID') + '<div class="toolbar">' + btn('Request demo OTP', 'requestLookupOTP', id) + '</div><div id="otpNotice" role="status"></div>');
                break
            }
            case 'requestRegistrationOTP':
            case 'requestLookupOTP': {
                let batch = registrationBatch(),
                    f = $id('editForm');
                if (!batch || batch.id !== id || !f) return deny();
                let x = Object.fromEntries(new FormData(f)),
                    e = R.contact(x),
                    purpose = action === 'requestLookupOTP' ? 'lookup' : 'registration';
                if (x.batch !== id) e.batch = 'Use the batch in this link.';
                if (purpose === 'registration') {
                    let gate = R.registrationWindow(batch, db);
                    if (gate) e.batch = gate
                }
                if (Object.keys(e).length) return errors(e);
                otpChallenge = {
                    batch: id,
                    purpose,
                    mobile: R.mobile(x.mobile),
                    email: R.norm(x.email)
                };
                $id('otpNotice').textContent = 'SIMULATED OTP: 123456. No SMS/email was sent. Enter it above; changing contacts requires another request.';
                break
            }
            case 'resourcePolicy':
                if (!central()) return deny();
                dialogForm = {
                    kind: 'resourcePolicy',
                    data: {}
                };
                {
                    let u = db.users.find(u => u.role === roles[4]);
                    modal('Trainer permission & approved multimedia', info('Approval authority and exact format/size policy require business confirmation. This is an explicit review grant, not production security.') + formHTML('resourcePolicy', {
                        trainerUser: u?.id,
                        grant: u?.resourceUpload ?? db.settings.trainerUpload,
                        extensions: (db.settings.multimediaExtensions || ['mp4', 'webm']).join(', ')
                    }, [
                        ['trainerUser', 'Trainer user', 'text', true, db.users.filter(u => u.role === roles[4])],
                        ['grant', 'Allow this trainer to upload resources', 'checkbox', false],
                        ['extensions', 'Review-approved video / other multimedia extensions', 'text', false]
                    ], 'Save permission & format policy'))
                }
                break;
            case 'newResource':
                if (!canUploadResources()) return deny();
                dialogForm = {
                    kind: 'resource',
                    data: {}
                };
                {
                    let ps = resourceProjects(),
                        project = context === 'all' ? (ps.length === 1 ? ps[0].id : '') : context;
                    modal('Upload and link training resource', info('PPT/PPTX, PDF and review-approved multimedia. Extension checks only; no business size cap is defined. Materials are available once their link applies; existing form day-gates remain unchanged.') + formHTML('resource', {
                        project
                    }, [
                        ['name', 'Resource name', 'text', true],
                        ['project', 'Project', 'text', true, ps],
                        ['plan', 'Training Plan Code / name', 'text', true, resourcePlans().filter(p => p.status !== 'Draft').map(p => ({
                            id: p.id,
                            name: p.code + ' · ' + p.name
                        }))],
                        ['common', central() ? 'Publish in common repository' : 'Request addition to common repository', 'checkbox', false], ...(central() ? [
                            ['applyExisting', 'Include existing batches using this plan (review decision)', 'checkbox', false]
                        ] : []), ['file', 'File to store in this browser', 'file', true]
                    ], 'Upload & link locally'))
                }
                break;
            case 'reuseResource': {
                if (!central()) return deny();
                let r = resourceScope().find(r => r.id === id && !r.formType);
                if (!r) return deny();
                dialogForm = {
                    kind: 'resourceLink',
                    data: {
                        resource: id
                    }
                };
                modal('Link resource to another training plan', info(esc(r.name) + ' · ' + (r.common ? 'Common resource: reuse across projects.' : 'Project resource: reuse within its project.')) + formHTML('resourceLink', {
                    project: r.project
                }, [
                    ['project', 'Project', 'text', true, r.common ? projects() : projects().filter(p => p.id === r.project)],
                    ['plan', 'Training Plan Code / name', 'text', true, plans().filter(p => p.status !== 'Draft').map(p => ({
                        id: p.id,
                        name: p.code + ' · ' + p.name
                    }))],
                    ['applyExisting', 'Include existing batches (review decision)', 'checkbox', false]
                ], 'Link resource locally'));
                break
            }
            case 'resourceAvailability': {
                let r = resourceScope().find(r => r.id === id);
                if (!r) return deny();
                modal('Resource batch availability', info(esc(r.name) + ' · Project → Training Plan → Batches') + table(['Project', 'Training Plan Code', 'Applies to', 'Matching batches in your scope', 'Action'], db.links.filter(l => l.resource === id && plans().some(p => p.id === l.plan)).map(l => [esc(lookup(db.projects, lookup(db.plans, l.plan, 'project'))), esc(lookup(db.plans, l.plan, 'code')), l.applyExisting === true ? 'Existing & new batches' : l.applyExisting === false ? 'New batches only' : 'Legacy review setting', batches().filter(b => R.linkEffective(l, b, db.settings)).map(b => esc(b.code)).join(', ') || 'None yet', l.applyExisting === true ? 'Existing batches included' : central() ? btn('Include existing batches', 'propagateResourceLink', l.id) : 'Administrator review required'])) + info('Matching batches use this exact Training Plan Code. Materials follow the selected per-link availability policy; linked day rules and project expiry still apply. Common publication alone does not link a resource to every plan.'));
                break
            }
            case 'propagateResourceLink': {
                if (!central()) return deny();
                let l = db.links.find(l => l.id === id);
                if (!l) return deny();
                if (confirm('Make this linked resource available to existing batches using this plan? Historical access will change under this review decision.'))
                    if (commit(() => {
                            l.applyExisting = true;
                            audit('Existing batch resource access enabled', id, null, {
                                plan: l.plan,
                                resource: l.resource,
                                applyExisting: true
                            }, lookup(db.plans, l.plan, 'project'))
                        }, 'Existing batches included for this resource link.')) {
                        closeModal();
                        render()
                    } break
            }
            case 'requestCommon': {
                let r = resourceScope().find(r => r.id === id);
                if (!trainer() || !canUploadResources() || !r || r.uploadedBy !== active || r.common || r.formType) return deny();
                if (commit(() => {
                        r.commonRequested = true;
                        audit('Common publication requested', id, null, {
                            requested: true
                        }, r.project)
                    }, 'Common repository request saved locally; awaiting administrator review.')) render();
                break
            }
            case 'publishCommon': {
                if (!central()) return deny();
                let r = resourceScope().find(r => r.id === id && !r.formType);
                if (!r) return deny();
                if (confirm('Publish this resource for reuse across projects and plans under the review approval workflow?'))
                    if (commit(() => {
                            r.common = true;
                            r.commonRequested = false;
                            audit('Resource published in common repository', id, null, {
                                common: true
                            }, r.project)
                        }, 'Common resource published locally. Link it to other plans to make it available to their batches.')) render();
                break
            }
            case 'openResource':
                return openResource(id);
            case 'newTrainer':
                return openMaster('trainer');
            case 'editTrainer':
                return openMaster('trainer', id);
            case 'editHoliday':
                return openMaster('holiday', id);
            case 'removeHoliday': {
                if (!central()) return deny();
                let holiday = db.holidays.find(h => h.id === id);
                if (!holiday) return deny();
                if (confirm('Remove this holiday? Schedule validation will use the updated calendar; existing batches will not be moved.'))
                    if (commit(() => {
                            db.holidays = db.holidays.filter(h => h.id !== id);
                            audit('Holiday removed', id, holiday, null, holiday.project || null)
                        }, 'Holiday removed locally.')) render();
                break
            }
            case 'newAvailability':
                return openMaster('availability');
            case 'editAvailability':
                return openMaster('availability', id);
            case 'newHoliday':
                return openMaster('holiday');
            case 'newForm':
                return openMaster('form');
            case 'removeAvailability': {
                let a = db.availability.find(x => x.id === id);
                if (!central() && !(trainer() && a?.trainer === user().trainer)) return deny();
                if (confirm('Remove availability? Existing assignments remain and appear as conflicts; replacement policy needs business clarification.'))
                    if (commit(() => {
                            db.availability = db.availability.filter(x => x.id !== id);
                            audit('Availability removed', id, a, null, null)
                        }, 'Availability removed; inspect assignment conflict alerts.')) render();
                break
            }
            case 'newUser':
                return openUser();
            case 'editUser':
                return openUser(id);
            case 'profile':
                dialogForm = {
                    kind: 'profile',
                    data: db.profiles.find(p => p.id === active) || {
                        name: user().name,
                        mobile: '',
                        email: ''
                    }
                };
                modal('Synthetic profile', formHTML('profile', dialogForm.data, [
                    ['name', 'Synthetic name', 'text', true],
                    ['mobile', 'Mobile', 'text', false],
                    ['email', 'Email', 'email', false]
                ]));
                break;
            case 'submitForm': {
                if (!trainee()) return deny();
                let r = resourceScope().find(r => r.id === id),
                    bt = batches().find(b => effectiveLinks(b).some(l => l.resource === id));
                if (!r || !bt || !accessible(r, bt)) return message('This activity is not available on this date.', true);
                dialogForm = {
                    kind: 'submission',
                    data: {
                        resource: id
                    }
                };
                modal(r.name, info(esc(r.question)) + (r.feedbackTemplate === 'teacher-training-20' ? info('All questions are required. Ratings: 1 Strongly Disagree · 2 Disagree · 3 Neutral · 4 Agree · 5 Strongly Agree.') + formHTML('submission', teacherFeedbackData(trainees().find(t => t.id === user().trainee), bt), teacherFeedbackFields(), 'Submit feedback') : formHTML('submission', {}, [
                    ['answer', 'Your response', 'textarea', true]
                ], 'Submit response locally')));
                break
            }
            case 'newCertTemplate':
                return openCertTemplate();
            case 'editCertTemplate':
                return openCertTemplate(id);
            case 'newCertRecord':
                return openCertRecord();
            case 'certDownloadAll':
                return downloadCertRecords();
            case 'certSample':
            case 'certSampleDownload': {
                let c = certTemplates().find(c => c.id === id);
                if (!c) return deny();
                let r = certSample(c);
                if (action === 'certSample') modal('Sample certificate', '<style>' + CERT_STYLE + '</style>' + certSheet(r, c, true));
                else download(new Blob([certDocument(r, c, true)], {
                    type: 'text/html'
                }), 'sample-' + c.code + '.html');
                break
            }
            case 'certRecord':
            case 'certRecordDownload': {
                let r = certRecords().find(r => r.id === id);
                if (!r) return deny();
                if (action === 'certRecord') modal('Local POC certificate', '<style>' + CERT_STYLE + '</style>' + certSheet(r, r.templateSnapshot));
                else download(new Blob([certDocument(r, r.templateSnapshot)], {
                    type: 'text/html'
                }), 'certificate-' + r.id + '.html');
                break
            }
            case 'template':
                return openCertTemplate();
            case 'legacyTemplate':
                if (!central()) return deny();
                dialogForm = {
                    kind: 'template',
                    data: db.template
                };
                modal('Configure certificate template', formHTML('template', db.template, [
                    ['program', 'Project / program name', 'text', true],
                    ['signatory', 'Authorized signatory', 'text', true],
                    ['color', 'Custom colour', 'color', true],
                    ['organizationLogo', 'Organization logo PNG/JPG', 'file', false],
                    ['projectLogo', 'Project logo PNG/JPG', 'file', false]
                ]));
                break;
            case 'certificate':
                return previewCertificate(id);
            case 'downloadCertificate': {
                if (!t) return deny();
                if (!R.eligibility(t, db).eligible) return message('Certificate eligibility is undetermined or not met.', true);
                let html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Demo certificate</title><style>body{font:16px system-ui;padding:40px}.cert{text-align:center;padding:50px;border:6px double}h1{font:36px Georgia}.name{font:32px Georgia;margin:35px}.demo{color:#a02c28;font-weight:bold}img{max-height:75px;max-width:160px}</style>' + certificateHTML(t) + '</html>';
                download(new Blob([html], {
                    type: 'text/html'
                }), 'demo-certificate-' + t.id + '.html');
                commit(() => {
                    audit('Demo certificate preview downloaded', t.id, null, {
                        provisional: true
                    }, db.batches.find(b => b.id === t.batch).project)
                }, 'Marked printable certificate preview downloaded; no production certificate issued.');
                break
            }
            case 'applyReport':
                return renderReport();
            case 'resetReport':
                return render();
            case 'exportExcel':
                return exportReport(true);
            case 'exportCSV':
                return exportReport(false);
            case 'print':
                window.print();
                break;
            case 'reset':
                if (confirm('Reset all local demo records and uploaded file bytes? This cannot be undone.')) {
                    try {
                        await fileStore('clear');
                        db = sample();
                        if (window.KGBVScenario) db = window.KGBVScenario.merge(db, R);
                        db.certificateRecords ||= [];
                        db.contentLibrary = [];
                        seedContentSamples();
                        localStorage.removeItem(KEY);
                        migrateReusablePlans();
                        localStorage.setItem(KEY, JSON.stringify(db));
                        active = window.DemoAuth?.session()?.userId || 'A1';
                        context = 'all';
                        sessionStorage.removeItem('reviewBatch');
                        message('Sample records reset; previously uploaded bytes removed.');
                        render()
                    } catch (e) {
                        message('Reset could not complete: ' + e.message, true)
                    }
                }
                break;
        }
    }

    function bind() {
        const on = (event, selector, fn) => {
            if (window.jQuery) jQuery(document).on(event, selector, fn);
            else document.addEventListener(event, e => {
                if (e.target.closest(selector)) fn.call(e.target.closest(selector), e)
            })
        };
        on('click', '[data-action]', function(e) {
            e.preventDefault();
            Promise.resolve(act(this.dataset.action, this.dataset.id)).catch(err => message('Operation did not complete: ' + err.message, true))
        });
        on('click', '[data-jump]', function() {
            sessionStorage.setItem('reviewBatch', this.dataset.jump);
            closeModal()
        });
        on('submit', '#editForm', function(e) {
            e.preventDefault();
            submitEdit(this).catch(err => errors({
                form: 'Operation was not completed: ' + err.message
            }))
        });
        on('submit', '#reviewForm', function(e) {
            e.preventDefault();
            let x = Object.fromEntries(new FormData(this));
            x.trainerUpload = this.trainerUpload.checked;
            x.propagate = this.propagate.checked;
            let err = {};
            for (let k of ['attendance', 'pass'])
                if (x[k] !== '' && (!Number.isFinite(Number(x[k])) || Number(x[k]) < 0 || Number(x[k]) > 100)) err[k] = 'Use a percentage from 0 to 100, or leave unresolved.';
            if (Object.keys(err).length) return errors(err);
            if (commit(() => {
                    let before = {
                        ...db.settings
                    };
                    db.settings = {
                        ...db.settings,
                        ...x
                    };
                    audit('Provisional review settings changed', 'settings', before, x, null)
                }, 'Provisional settings saved for review; business sign-off remains pending.')) render()
        });
        on('change', '#importFile', function() {
            parseImport(this.files[0])
        });
        on('change', '#batchSelect', function() {
            sessionStorage.setItem('reviewBatch', this.value);
            let b = batches().find(b => b.id === this.value);
            if (current === 'registration') {
                go('registration', this.value);
                otpChallenge = null
            } else if (b) renderBatchArea(b)
        });
        on('input', '#tableSearch', function() {
            let q = R.norm(this.value);
            document.querySelectorAll('main tbody tr').forEach(tr => tr.hidden = !R.norm(tr.textContent).includes(q))
        });
        on('input', '#odooSearch', function() {
            let q = R.norm(this.value);
            for (let o of $id('odooSelect').options) o.hidden = o.value && !R.norm(o.text).includes(q)
        });
        on('change', '#odooSelect', function() {
            let map = {
                '101': ['Digital Teaching Karnataka', 'ODOO-101'],
                '102': ['Student Learning Maharashtra', 'ODOO-102'],
                '103': ['Inclusive Teaching Programme', 'ODOO-103']
            };
            let x = map[this.value];
            if (x) {
                $id('f-name').value = x[0];
                $id('f-code').value = x[1]
            }
        });
        on('change', '#f-project', function() {
            if ($id('f-plan')) {
                let resourceForm = ['resource', 'resourceLink', 'form'].includes($id('editForm')?.dataset.kind);
                $id('f-plan').innerHTML = options((resourceForm ? resourcePlans() : db.plans).filter(p => p.status !== 'Draft').map(p => (resourceForm || $id('editForm')?.dataset.kind === 'batch') ? {
                    id: p.id,
                    name: p.code + ' · ' + p.name
                } : p), '')
            }
        });
        on('input', '#planSearch', function() {
            let q = R.norm(this.value);
            for (let o of $id('f-plan').options) o.hidden = o.value && !R.norm(o.text).includes(q)
        });
        on('change', '#attendanceWorkbook', function() {
            attendanceStage = null;
            $id('attendancePreview').innerHTML = info('Workbook changed. Validate this file before saving.');
        });
        on('change', '#attendanceProject', function() {
            sessionStorage.setItem('reviewAttendanceProject', this.value);
            context = this.value;
            sessionStorage.removeItem('reviewBatch');
            render()
        });
        on('change', '#attendanceDay', function() {
            $id('attendanceDate').value = this.value;
            let b = selectedBatch();
            if (b) attendanceTable(b, this.value)
        });
        on('change', '#attendanceDate', function() {
            let b = selectedBatch();
            if (b) attendanceTable(b, this.value)
        });
        on('change', '#f-school', function() {
            if ($id('f-actualLocation')) $id('f-actualLocation').value = lookup(db.schools, this.value, 'location')
        });
        on('change', '#f-trainee', function() {
            if ($id('editForm')?.dataset.kind === 'certificateRecord') {
                let t = trainees().find(t => t.id === this.value),
                    b = db.batches.find(b => b.id === t?.batch),
                    p = b ? R.batchPlan(b, db) : null;
                if (t && b && p) {
                    $id('f-traineeName').value = t.name;
                    $id('f-batch').value = b.id;
                    $id('f-trainingName').value = p.name;
                    $id('f-duration').value = p.days;
                    $id('f-completionDate').value = b.end
                }
            }
        });
        on('change', '#f-userID', function() {
            if ($id('f-grant')) $id('f-grant').checked = !!db.users.find(u => u.id === this.value)?.batchManage
        });
        on('change', '#f-trainerUser', function() {
            let u = db.users.find(u => u.id === this.value);
            $id('f-grant').checked = !!(u?.resourceUpload ?? db.settings.trainerUpload)
        });
        on('change', '#reportType', function() {
            renderReport()
        });
        on('click', 'a[href^="#"]', function(e) {
            let raw = this.getAttribute('href') || '';
            let id = raw.slice(1).split('/')[0];
            if (pageRoutes[id]) {
                e.preventDefault();
                let param = raw.split('/')[1] || '';
                go(id, param)
            }
        })
    }
    /* v4.8 reusable training masters: staged editing, stable codes and batch snapshots. */
    const planResourceTypes = ['Pre-Assessment', 'Baseline Survey', 'Training Material', 'Presentation', 'PDF', 'Video', 'Formative Assessment', 'Assignment', 'Project Work', 'Post Assessment', 'Feedback Form', 'LMS Resource', 'Other'];
    let planDraft = null,
        planFilters = {
            q: '',
            type: '',
            status: '',
            page: 1
        },
        pendingPlanConfirm = null;

    function resourceCategory(r) {
        return r.resourceType || (r.formPurpose === 'Pre-training assessment' ? 'Pre-Assessment' : r.formPurpose === 'Post-training assessment' ? 'Post Assessment' : r.formType === 'Feedback' ? 'Feedback Form' : r.formType === 'Assessment' ? 'Formative Assessment' : ['PPT', 'PPTX'].includes(r.type) ? 'Presentation' : r.type === 'PDF' ? 'PDF' : ['MP4', 'WEBM', 'Video'].includes(r.type) ? 'Video' : 'Other')
    }

    function planMappings(id) {
        return db.links.filter(l => l.plan === id).flatMap(l => (l.days?.length ? l.days : [1]).map(day => ({
            resource: l.resource,
            type: l.resourceType || resourceCategory(db.resources.find(r => r.id === l.resource) || {}),
            day: Number(day)
        })))
    }

    function planSnapshot(id) {
        let p = db.plans.find(p => p.id === id);
        return p ? {
            ...structuredClone(p),
            links: structuredClone(db.links.filter(l => l.plan === id)),
            captured: new Date().toISOString()
        } : null
    }
    uniquePlanCode = function() {
        let next = Math.max(db.planCodeSequence || 0, ...db.plans.map(p => Number(p.code?.match(/^TP-(\d+)$/)?.[1] || 0))) + 1;
        return 'TP-' + String(next).padStart(4, '0')
    };
    plans = function() {
        return db.plans.filter(p => !(trainer() || trainee()) || batches().some(b => b.plan === p.id))
    };
    resourceProjects = function() {
        return projects()
    };
    effectiveLinks = function(b) {
        return R.batchLinks(b, db)
    };
    resourceScope = function() {
        return db.resources.filter(r => (r.common || projects().some(p => p.id === r.project) && (context === 'all' || context === r.project)) && (!(trainer() || trainee()) || (trainer() && (r.uploadedBy === active || r.common && canUploadResources())) || batches().some(b => effectiveLinks(b).some(l => l.resource === r.id))))
    };

    function migrateReusablePlans() {
        if (db.reusablePlansVersion === 1) return;
        let fresh = !localStorage.getItem(KEY);
        // Capture the original configuration before lifting the old project dependency.
        for (let b of db.batches) {
            b.planSnapshot ||= planSnapshot(b.plan);
            b.planCode = b.planSnapshot?.code
        }
        for (let p of db.plans) {
            delete p.project;
            p.status ||= 'Active';
            p.revision ||= 1;
            if (Number(p.days) < 4) p.days = 4
        }
        if (fresh) {
            let p = db.plans.find(p => p.id === 'PL1');
            Object.assign(p, {
                name: 'Digital Teaching – Induction',
                code: 'TP-0001',
                description: 'A reusable four-day digital teaching programme.'
            });
            let second = db.plans.find(p => p.id === 'PL2');
            second.code = 'TP-0002';
            second.name = 'ICT Refresher';
            second.type = 'Refresher 1';
            db.links = db.links.filter(l => l.plan !== 'PL1');
            let examples = [
                ['Pre-Assessment', 'Digital Teaching Pre-Test', 1],
                ['Presentation', 'Digital Teaching Introduction', 1],
                ['PDF', 'Teacher Training Handbook', 1],
                ['Presentation', 'Smart Classroom Techniques', 2],
                ['Video', 'Interactive Classroom Demo', 2],
                ['Assignment', 'Classroom Activity', 2],
                ['Training Material', 'Advanced Teaching Techniques', 3],
                ['Formative Assessment', 'Day 3 Knowledge Check', 3],
                ['Post Assessment', 'Digital Teaching Final Test', 4],
                ['Feedback Form', 'Training Feedback Form', 4]
            ];
            examples.forEach(([type, name, day], i) => {
                let id = 'PLAN-SAMPLE-' + (i + 1),
                    formType = type.includes('Assessment') ? 'Assessment' : type === 'Feedback Form' ? 'Feedback' : null;
                db.resources.push({
                    id,
                    name,
                    type: type === 'Presentation' ? 'PPTX' : type === 'PDF' ? 'PDF' : type === 'Video' ? 'Video' : 'Sample text',
                    resourceType: type,
                    formType,
                    common: true,
                    seed: true,
                    uploadedBy: 'A1',
                    created: '2019-01-01T00:00:00Z',
                    question: formType === 'Feedback' ? 'What helped you most?' : 'Which method encourages learner participation?',
                    answer: formType === 'Assessment' ? 'Discussion' : ''
                });
                db.links.push({
                    id: 'PLAN-LINK-' + (i + 1),
                    plan: 'PL1',
                    resource: id,
                    resourceType: type,
                    days: [day],
                    created: '2019-01-01T00:00:00Z',
                    applyExisting: false
                })
            });
            for (let b of db.batches) {
                if (b.plan === 'PL2') b.end = R.add(b.start, 3);
                b.planSnapshot = planSnapshot(b.plan);
                b.planCode = b.planSnapshot.code
            }
        }
        db.planCodeSequence = Math.max(2, ...db.plans.map(p => Number(p.code?.match(/^TP-(\d+)$/)?.[1] || 0)));
        db.reusablePlansVersion = 1;
    }
    migrateReusablePlans();

    function previewPlan(p, mappings) {
        return '<div class="plan-day-grid">' + Array.from({
            length: Number(p.days) || 0
        }, (_, i) => {
            let rows = mappings.filter(m => m.day === i + 1);
            return '<article class="card plan-day"><h3>Day ' + (i + 1) + '</h3><span class="pill">' + rows.length + ' Resources</span><ul>' + rows.map(m => '<li><strong>' + esc(m.type) + '</strong><br>' + esc(lookup(db.resources, m.resource)) + '</li>').join('') + '</ul>' + (!rows.length ? '<p class="sub">No resources assigned.</p>' : '') + '</article>'
        }).join('') + '</div>'
    }
    views.plans = function() {
        return head('Training plans', 'Reusable training masters → batch assignment. Plans are independent of projects.', central() ? btn('<i class="bi bi-plus-lg" aria-hidden="true"></i> Add Training Plan', 'newPlan', '', 'btn-primary') : '') + panel('Training plan register', '<div class="toolbar plan-filters"><label>Search name / code<input id="planListSearch" type="search" value="' + esc(planFilters.q) + '" placeholder="Training Plan name or TP-0001"></label><label>Training Type<select id="planListType">' + options(['Induction', 'Refresher 1', 'Refresher 2', 'Other'].map(x => ({
            id: x,
            name: x
        })), planFilters.type) + '</select></label><label>Status<select id="planListStatus">' + options(['Active', 'Draft', 'Inactive'].map(x => ({
            id: x,
            name: x
        })), planFilters.status) + '</select></label></div><div id="planListRows">' + planListRows() + '</div>')
    };

    function planTable(headers, rows) {
        return table(headers, rows).replace('<table>', '<table class="table table-striped table-hover align-middle">')
    }

    function planListRows() {
        let list = plans().filter(p => (!planFilters.q || R.norm(p.name + ' ' + p.code).includes(R.norm(planFilters.q))) && (!planFilters.type || p.type === planFilters.type) && (!planFilters.status || p.status === planFilters.status)),
            total = Math.max(1, Math.ceil(list.length / 10));
        planFilters.page = Math.min(planFilters.page, total);
        return planTable(['Training Plan Code', 'Training Plan Name', 'Type / audience', 'Duration / hours', 'Delivery window', 'Resources', 'Status', 'Action'], list.slice((planFilters.page - 1) * 10, planFilters.page * 10).map(p => [esc(p.code), esc(p.name), esc(p.type) + (p.audience ? '<br><small>' + esc(p.audience) + '</small>' : ''), p.days + ' Days' + (p.hours ? '<br><small>' + p.hours + ' hours</small>' : ''), p.windowStart ? esc(p.windowStart) + ' → ' + esc(p.windowEnd) : '—', planMappings(p.id).length, badge(p.status || 'Active'), btn('View', 'viewPlan', p.id) + (central() ? btn('Modify', 'editPlan', p.id) + btn('Duplicate', 'duplicatePlan', p.id) + btn('Delete', 'deletePlan', p.id) : '')])) + '<div class="toolbar">' + btn('Previous', 'planPrevious') + '<span>Page ' + planFilters.page + ' of ' + total + ' · ' + list.length + ' plans</span>' + btn('Next', 'planNext') + '</div>'
    }

    function refreshPlanList() {
        if ($id('planListRows')) $id('planListRows').innerHTML = planListRows()
    }
    editPlan = function(id, duplicate = false) {
        if (!central()) return deny();
        let p = id ? db.plans.find(p => p.id === id) : {
            name: '',
            type: 'Induction',
            days: 4,
            description: '',
            status: 'Active'
        };
        if (!p) return deny();
        planDraft = {
            plan: structuredClone(p),
            mappings: id ? planMappings(id) : [],
            editIndex: -1
        };
        if (!id || duplicate) {
            delete planDraft.plan.id;
            planDraft.plan.code = uniquePlanCode();
            if (duplicate) planDraft.plan.name += ' - Copy';
            planDraft.plan.status = 'Active'
        }
        dialogForm = {
            kind: 'reusablePlan',
            data: planDraft.plan
        };
        let title = duplicate ? 'Duplicate Training Plan' : id ? 'Modify Training Plan' : 'Create Training Plan';
        modal(title, '<nav aria-label="breadcrumb" class="plan-breadcrumb">Dashboard / Training Management / Training Plans / ' + title + '</nav>' + info('Used batches retain their assigned version. Master changes are audited and apply to future batch assignments.') + formHTML('reusablePlan', planDraft.plan, [
            ['name', 'Training Plan Name *', 'text', true],
            ['code', 'Training Plan Code', 'text', false],
            ['type', 'Training Type', 'text', true, ['Induction', 'Refresher 1', 'Refresher 2', 'Other'].map(x => ({
                id: x,
                name: x
            }))],
            ['days', 'Number of Training Days *', 'number', true],
            ['description', 'Description', 'textarea', false],
            ['status', 'Status', 'text', true, ['Active', 'Inactive'].map(x => ({
                id: x,
                name: x
            }))]
        ], 'Save Training Plan').replace('<div class="form-grid">', '<h2>Basic Information</h2><div class="form-grid">').replace('<div id="formError"', '<section class="plan-assign"><h2>Assign Resources / Forms</h2><div class="plan-resource-form"><label for="mappingType">Resource Type *</label><label for="mappingResource">Resource Name *</label><label for="mappingDay">Day No. *</label><span></span><select id="mappingType">' + options(planResourceTypes.map(x => ({
            id: x,
            name: x
        })), '') + '</select><select id="mappingResource"><option value="">Select resource…</option></select><select id="mappingDay"></select>' + btn('Add Resource', 'addPlanMapping', '', 'btn-primary') + '</div><div id="mappingError" class="invalid-feedback d-block" role="alert"></div></section><section><h2>Assigned Resources</h2><div id="assignedPlanResources"></div></section><section><h2>Day-Wise Training Plan Preview</h2><div id="planDayPreview"></div></section><div id="durationConflict" role="alert"></div><div id="formError"').replace('<button type="submit"', btn('Cancel', 'cancelPlan') + btn('Save as Draft', 'savePlanDraft') + '<button type="submit"'));
        $id('f-code').readOnly = true;
        $id('f-days').min = '4';
        $id('f-days').step = '1';
        refreshPlanDraft()
    };
    linkPlan = function(id, linkID = '', day = 0) {
        editPlan(id);
        if (day && $id('mappingDay')) $id('mappingDay').value = String(day)
    };

    function draftDuration() {
        return Number($id('f-days')?.value || planDraft?.plan.days)
    }

    function refreshResourceNames() {
        let type = $id('mappingType').value;
        $id('mappingResource').innerHTML = options(db.resources.filter(r => resourceCategory(r) === type).map(r => ({
            id: r.id,
            name: r.name + (r.common ? '' : ' · ' + lookup(db.projects, r.project))
        })), '')
    }

    function durationConflicts() {
        let days = draftDuration();
        return [...new Set(planDraft.mappings.filter(m => m.day > days).map(m => m.day))].sort((a, b) => a - b)
    }

    function refreshPlanDraft() {
        if (!planDraft) return;
        let days = draftDuration(),
            selected = $id('mappingDay').value;
        $id('mappingDay').innerHTML = options(Array.from({
            length: Number.isInteger(days) && days > 0 ? days : 0
        }, (_, i) => ({
            id: String(i + 1),
            name: 'Day ' + (i + 1)
        })), selected);
        $id('assignedPlanResources').innerHTML = planTable(['Resource Type', 'Resource Name', 'Day No.', 'Action'], planDraft.mappings.map((m, i) => [esc(m.type), esc(lookup(db.resources, m.resource)), 'Day ' + m.day, btn('Edit', 'editPlanMapping', String(i)) + btn('Delete', 'removePlanMapping', String(i))]));
        $id('planDayPreview').innerHTML = previewPlan({
            days: Number.isInteger(days) && days > 0 ? days : 0
        }, planDraft.mappings);
        let conflicts = durationConflicts();
        $id('durationConflict').innerHTML = conflicts.length ? info('Resources are currently assigned to ' + conflicts.map(d => 'Day ' + d).join(' and ') + '. Remove or reassign these resources before reducing the Training Plan duration to ' + days + ' days.', true) : days < 4 ? info('A Training Plan must contain a minimum of 4 training days.', true) : ''
    }

    function addPlanMapping() {
        if (!planDraft || !central()) return deny();
        let m = {
                type: $id('mappingType').value,
                resource: $id('mappingResource').value,
                day: Number($id('mappingDay').value)
            },
            error = !m.type ? 'Resource Type is mandatory.' : !m.resource ? 'Resource Name is mandatory.' : !R.integer(m.day) || m.day > draftDuration() ? 'Select a valid Day No. within the training duration.' : resourceCategory(db.resources.find(r => r.id === m.resource) || {}) !== m.type ? 'Resource Name must match the selected Resource Type.' : planDraft.mappings.some((x, i) => i !== planDraft.editIndex && x.resource === m.resource && x.type === m.type && x.day === m.day) ? 'This Resource Type, Resource Name and Day combination is already assigned.' : '';
        $id('mappingError').textContent = error;
        if (error) return;
        if (planDraft.editIndex < 0) planDraft.mappings.push(m);
        else planDraft.mappings[planDraft.editIndex] = m;
        planDraft.editIndex = -1;
        let button = document.querySelector('[data-action="addPlanMapping"]');
        if (button) button.textContent = 'Add Resource';
        refreshPlanDraft()
    }

    function editPlanMapping(i) {
        let m = planDraft?.mappings[i];
        if (!m) return;
        $id('mappingType').value = m.type;
        refreshResourceNames();
        $id('mappingResource').value = m.resource;
        planDraft.editIndex = Number(i);
        $id('mappingDay').value = String(m.day);
        let b = document.querySelector('[data-action="addPlanMapping"]');
        if (b) b.textContent = 'Update Resource';
        $id('mappingType').focus()
    }

    function planConfirm(text, fn) {
        pendingPlanConfirm = fn;
        let target = $id('dialogBody');
        if (!$id('editor').open) {
            modal('Confirm deletion', '');
            target = $id('dialogBody')
        }
        target.insertAdjacentHTML('beforeend', '<div id="planConfirmation" class="modal show plan-confirm" role="dialog" aria-modal="true" aria-labelledby="planConfirmTitle" style="display:block"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h2 id="planConfirmTitle" class="modal-title fs-5">Confirm deletion</h2></div><div class="modal-body">' + esc(text) + '</div><div class="modal-footer">' + btn('Cancel', 'cancelPlanConfirm') + btn('Delete', 'acceptPlanConfirm', '', 'btn-danger') + '</div></div></div></div>');
        $id('planConfirmation').querySelector('button')?.focus()
    }

    function planToast(text) {
        message(text);
        let node = document.createElement('div');
        node.className = 'toast show plan-toast';
        node.setAttribute('role', 'status');
        node.innerHTML = '<div class="toast-body">' + esc(text) + '</div>';
        document.body.append(node);
        if (window.bootstrap?.Toast) new bootstrap.Toast(node, {
            delay: 4000
        }).show();
        setTimeout(() => node.remove(), 4500)
    }
    async function saveReusablePlan(form, draft = false) {
        if (!central() || !planDraft) return deny();
        let x = Object.fromEntries(new FormData(form)),
            old = planDraft.plan,
            p = {
                ...old,
                ...x,
                code: old.code,
                days: Number(x.days),
                name: String(x.name || '').trim(),
                status: draft ? 'Draft' : x.status || 'Active'
            },
            base = {
                ...db,
                links: db.links.filter(l => l.plan !== old.id)
            },
            e = R.plan(p, base);
        if (durationConflicts().length) e.days = 'Remove or reassign resources outside the new duration before saving.';
        if (planDraft.mappings.some(m => !planResourceTypes.includes(m.type) || resourceCategory(db.resources.find(r => r.id === m.resource) || {}) !== m.type || R.planDays([m.day], p))) e.form = 'Every mapping must have a valid resource, type and day.';
        let keys = planDraft.mappings.map(m => m.type + '|' + m.resource + '|' + m.day);
        if (new Set(keys).size !== keys.length) e.form = 'Duplicate resource mappings are not allowed.';
        if (Object.keys(e).length) return errors(e);
        let saved = commit(() => {
            let before = old.id ? structuredClone(db.plans.find(x => x.id === old.id)) : null;
            for (let b of db.batches.filter(b => b.plan === old.id)) {
                b.planSnapshot ||= planSnapshot(old.id);
                b.planCode = b.planSnapshot?.code
            }
            p.id = old.id || p.code;
            p.revision = (before?.revision || 0) + 1;
            delete p.project;
            delete p.batch;
            let links = planDraft.mappings.map(m => ({
                id: uid('L'),
                plan: p.id,
                resource: m.resource,
                resourceType: m.type,
                days: [m.day],
                created: new Date().toISOString(),
                applyExisting: false
            }));
            let idx = db.plans.findIndex(x => x.id === p.id);
            if (idx < 0) db.plans.push(p);
            else db.plans[idx] = p;
            db.links = db.links.filter(l => l.plan !== p.id).concat(links);
            db.planCodeSequence = Math.max(db.planCodeSequence || 0, Number(p.code.match(/^TP-(\d+)$/)?.[1] || 0));
            audit('Training plan master saved', p.id, before, {
                ...p,
                mappings: planDraft.mappings
            }, null)
        }, 'Training Plan saved locally.');
        if (saved) {
            planDraft = null;
            closeModal();
            render();
            planToast(draft ? 'Training Plan saved as Draft.' : 'Training Plan saved. Historical batch versions are preserved.')
        }
    }

    function refreshBatchPlan() {
        let id = $id('f-plan')?.value,
            p = db.plans.find(p => p.id === id),
            el = $id('selectedPlanSummary');
        if (el) el.innerHTML = p ? info('<strong>Selected Training Plan: ' + esc(p.name) + '</strong><br>Code: ' + esc(p.code) + ' · Duration: ' + p.days + ' Days · Resources: ' + planMappings(id).length) + btn('View Training Plan', 'previewBatchPlan', id) : info('Select an active reusable Training Plan.');
    }

    function planDetails(p, mappings) {
        return panel('Training Plan', table(['Field', 'Value'], [
            ['Training Plan Name', esc(p.name)],
            ['Training Plan Code', esc(p.code)],
            ['Training Type', esc(p.type)],
            ['Duration', p.days + ' Days'],
            ['Hours', p.hours ? p.hours + ' total' + (p.hoursPerDay?.length ? ' (' + p.hoursPerDay.join(' + ') + ' hours/day)' : '') : 'Not specified'],
            ['Audience', esc(p.audience || 'All participants')],
            ['Programme phase', p.phase ? 'Phase ' + p.phase : (p.kind === 'student' ? 'Student skill development' : 'Not specified')],
            ['Delivery window', p.windowStart ? esc(p.windowStart) + ' to ' + esc(p.windowEnd) : 'Not specified'],
            ['Description', esc(p.description)]
        ])) + panel('Day-Wise Training Plan Preview', previewPlan(p, mappings))
    }
    const priorPlanSubmit = submitEdit;
    submitEdit = async function(form) {
        if (form.dataset.kind === 'reusablePlan') return saveReusablePlan(form);
        return priorPlanSubmit(form)
    };
    const priorPlanAct = act;
    act = async function(action, id) {
        switch (action) {
            case 'cancelPlan':
                planDraft = null;
                return closeModal();
            case 'savePlanDraft':
                return saveReusablePlan($id('editForm'), true);
            case 'addPlanMapping':
                return addPlanMapping();
            case 'editPlanMapping':
                return editPlanMapping(Number(id));
            case 'removePlanMapping':
                if (!planDraft || !central()) return deny();
                return planConfirm('Delete this resource assignment? The resource stays in the repository.', () => {
                    planDraft.mappings.splice(Number(id), 1);
                    planDraft.editIndex = -1;
                    let button = document.querySelector('[data-action="addPlanMapping"]');
                    if (button) button.textContent = 'Add Resource';
                    refreshPlanDraft()
                });
            case 'cancelPlanConfirm':
                pendingPlanConfirm = null;
                $id('planConfirmation')?.remove();
                if (!planDraft) closeModal();
                return;
            case 'acceptPlanConfirm': {
                let fn = pendingPlanConfirm;
                pendingPlanConfirm = null;
                $id('planConfirmation')?.remove();
                return fn?.()
            }
            case 'planPrevious':
                planFilters.page = Math.max(1, planFilters.page - 1);
                return refreshPlanList();
            case 'planNext':
                planFilters.page++;
                return refreshPlanList();
            case 'duplicatePlan':
            case 'revisePlan':
                return editPlan(id, true);
            case 'deletePlan': {
                if (!central()) return deny();
                let p = plans().find(x => x.id === id);
                if (!p) return deny();
                if (planUsed(id)) return message('This Training Plan is assigned to batches. Set it Inactive to preserve batch references.', true);
                return planConfirm('Delete ' + p.code + ' — ' + p.name + '?', () => {
                    if (planUsed(id)) return message('This plan is now assigned to a batch; deletion blocked.', true);
                    if (commit(() => {
                            db.plans = db.plans.filter(p => p.id !== id);
                            db.links = db.links.filter(l => l.plan !== id);
                            audit('Training Plan deleted', id, p, null, null)
                        }, 'Training Plan deleted.')) {
                        closeModal();
                        render()
                    }
                })
            }
            case 'previewBatchPlan': {
                let p = db.plans.find(p => p.id === id);
                if (!p || !$id('editForm')) return;
                let existing = $id('inlinePlanPreview');
                if (existing) return existing.remove();
                $id('selectedPlanSummary').insertAdjacentHTML('beforeend', '<div id="inlinePlanPreview" class="plan-inline-preview" role="region" aria-label="Selected Training Plan details">' + planDetails(p, planMappings(id)) + '</div>');
                return
            }
            case 'viewPlan': {
                let p = plans().find(p => p.id === id);
                if (!p) return deny();
                return modal(p.name, planDetails(p, planMappings(id).filter(m => central() || resourceScope().some(r => r.id === m.resource))))
            }
            case 'planSchedule':
            case 'planExample':
                return editPlan(action === 'planSchedule' ? id : undefined);
            default:
                return priorPlanAct(action, id)
        }
    };
    const priorPlanBind = bind;
    bind = function() {
        priorPlanBind();
        const on = (event, selector, fn) => {
            if (window.jQuery) jQuery(document).on(event, selector, fn);
            else document.addEventListener(event, e => {
                let target = e.target.closest(selector);
                if (target) fn.call(target, e)
            })
        };
        on('input', '#f-days', refreshPlanDraft);
        on('change', '#mappingType', refreshResourceNames);
        on('input', '#planListSearch', function() {
            planFilters.q = this.value;
            planFilters.page = 1;
            refreshPlanList()
        });
        on('change', '#planListType', function() {
            planFilters.type = this.value;
            planFilters.page = 1;
            refreshPlanList()
        });
        on('change', '#planListStatus', function() {
            planFilters.status = this.value;
            planFilters.page = 1;
            refreshPlanList()
        });
        on('change', '#f-plan', function() {
            if ($id('editForm')?.dataset.kind === 'batch') {
                refreshBatchPlan();
                let p = db.plans.find(p => p.id === this.value);
                if (p && R.date($id('f-start').value)) $id('f-end').value = R.add($id('f-start').value, p.days - 1)
            }
        });
        on('change', '#f-start', function() {
            if ($id('editForm')?.dataset.kind === 'batch') {
                let p = db.plans.find(p => p.id === $id('f-plan').value);
                if (p && R.date(this.value)) $id('f-end').value = R.add(this.value, p.days - 1)
            }
        })
    };

    /* Separate Content Library; Learning Resources retains the v4.8 workflow. */
    db.contentLibrary ||= [];

    function seedContentSamples() {
        for (let {
                base64,
                ...record
            }
            of window.CONTENT_SAMPLES || [])
            if (!db.contentLibrary.some(r => r.id === record.id)) db.contentLibrary.push(record)
    }
    seedContentSamples();

    function sampleContentBlob(id) {
        let r = (window.CONTENT_SAMPLES || []).find(r => r.id === id);
        if (!r) throw Error('Sample file missing.');
        return new Blob([Uint8Array.from(atob(r.base64), c => c.charCodeAt(0))], {
            type: r.mime
        })
    }
    let contentTab = 'ALL',
        contentSearch = '',
        contentStage = null;
    const contentTabs = ['ALL', 'Videos', 'PDF_MANUALS', 'Presentations', 'Others'];

    function contentCategory(file) {
        let ext = String(file.filename || file.name || '').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) ? 'Others' : ['ppt', 'pptx'].includes(ext) ? 'Presentations' : ext === 'pdf' ? 'PDF_MANUALS' : ['docx', 'bpmn', 'drawio', 'workflow', 'json'].includes(ext) ? 'Others' : ['mp4', 'webm', 'mov', 'm4v', 'avi', 'mpeg', 'mpg'].includes(ext) ? 'Videos' : null
    }

    function contentFileError(file) {
        let type = contentCategory(file),
            ext = String(file.name || '').split('.').pop().toLowerCase();
        if (!type) return 'Unsupported format. Use PPT/PPTX, PDF, DOCX, BPMN, Draw.io, WORKFLOW, JSON, PNG/JPG/WEBP/GIF or an approved video format.';
        if (type === 'Videos' && !(db.settings.multimediaExtensions || ['mp4', 'webm']).includes(ext)) return 'Video format is not approved. Default video formats are MP4 and WEBM.';
        if (!file.size) return 'Empty files cannot be uploaded.';
        return ''
    }

    function contentScope() {
        return db.contentLibrary.filter(r => (central() || r.common || projects().some(p => p.id === r.project)) && (context === 'all' || r.common || r.project === context))
    }

    function contentItems() {
        return contentScope().filter(r => (contentTab === 'ALL' || contentCategory(r) === contentTab) && (!contentSearch || R.norm(r.name + ' ' + r.filename + ' ' + contentTags(r).join(' ')).includes(R.norm(contentSearch))))
    }

    function contentSize(size) {
        return size >= 1048576 ? (size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1024)) + ' KB'
    }

    function contentCover(r) {
        let type = contentCategory(r),
            ext = r.filename.split('.').pop().toUpperCase(),
            sample = (window.CONTENT_SAMPLES || []).find(s => s.id === r.id),
            poster = (window.CONTENT_SAMPLES || []).find(s => s.id === 'CONTENT-SAMPLE-PNG');
        if (type === 'Others' && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext.toLowerCase()) && sample) return '<div class="library-cover library-images"><img src="data:' + esc(sample.mime) + ';base64,' + sample.base64 + '" alt="' + esc(r.name) + '" loading="lazy"><span class="format-tag">' + esc(ext) + '</span></div>';
        if (type === 'Videos') return '<div class="library-cover library-video">' + (r.sampleContent && poster ? '<img src="data:' + poster.mime + ';base64,' + poster.base64 + '" alt="">' : '') + '<span class="video-play" aria-hidden="true">▶</span><span class="format-tag">' + esc(ext) + '</span></div>';
        let coverClass = type === 'PDF_MANUALS' ? 'pdf' : type === 'Presentations' ? 'pptx' : ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(ext) ? 'images' : ext === 'DOCX' ? 'docx' : ['BPMN', 'DRAWIO', 'WORKFLOW', 'JSON'].includes(ext) ? 'workflow' : 'document';
        return '<div class="library-cover library-' + coverClass + '"><div class="library-document" aria-hidden="true"><span>' + esc(ext) + '</span><i></i><i></i><i></i></div><span class="format-tag">' + esc(ext) + '</span></div>'
    }

    function contentTags(record) {
        let category = contentCategory(record),
            ext = String(record.filename || '').split('.').pop().toUpperCase(),
            isImage = ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(ext),
            isWorkflow = ['BPMN', 'DRAWIO', 'WORKFLOW', 'JSON'].includes(ext),
            inferred = category === 'Videos' ? ['Video', 'Training'] : category === 'PDF_MANUALS' ? ['Manual', 'Reference'] : category === 'Presentations' ? ['Presentation', 'Training'] : isImage ? ['Image', 'Classroom'] : isWorkflow ? ['Workflow', 'Process'] : ['Document', 'Learning resource'],
            words = String(record.name || '').split(/[^a-z0-9]+/i).filter(word => word.length > 2 && !['sample', 'file'].includes(word.toLowerCase()));
        return [...new Set([...(Array.isArray(record.tags) ? record.tags : []), ...inferred, ext, ...words.slice(0, 2)])].slice(0, 4)
    }

    function contentGrid() {
        let rows = contentItems();
        if (!rows.length) return '<div class="library-empty"><h2>No files found</h2><p>Try another tab or search, or use Bulk upload to add content.</p></div>';
        return '<div class="content-grid">' + rows.map(r => {
            let type = contentCategory(r),
                ext = r.filename.split('.').pop().toUpperCase(),
                kind = type === 'PDF_MANUALS' ? 'PDF & Manual' : type === 'Presentations' ? 'Presentation' : type === 'Videos' ? 'Video' : ['BPMN', 'DRAWIO', 'WORKFLOW', 'JSON'].includes(ext) ? 'Workflow' : ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(ext) ? 'Image' : 'Document',
                tags = contentTags(r);
            return '<article class="card content-card">' + contentCover(r) + '<div class="library-card-body"><div class="library-card-meta"><span>' + esc(kind) + '</span><span>' + contentSize(r.size) + '</span></div><h2>' + esc(r.name) + '</h2><p class="library-filename" title="' + esc(r.filename) + '">' + esc(r.filename) + '</p><div class="library-tags" aria-label="Tags">' + tags.map(tag => '<span class="library-tag">' + esc(tag) + '</span>').join('') + '</div><div class="library-scope">' + (r.sampleContent ? '<span class="library-sample">Sample</span>' : '') + '<span>' + esc(r.common ? 'Common library' : lookup(db.projects, r.project)) + '</span></div><div class="actions">' + btn('Preview', 'contentPreview', r.id, 'btn library-preview') + btn('Download', 'contentDownload', r.id, 'btn library-download') + '</div></div></article>'
        }).join('') + '</div>'
    }

    function contentTabBar() {
        let labels = {
            ALL: 'All',
            Videos: 'Videos',
            PDF_MANUALS: 'PDF & Manuals',
            Presentations: 'Presentations',
            Others: 'Others'
        };
        return '<div class="nav nav-tabs content-tabs" role="tablist" aria-label="Content format">' + contentTabs.map(type => '<button type="button" role="tab" id="content-tab-' + type + '" aria-controls="contentGrid" aria-selected="' + (contentTab === type) + '" class="nav-link ' + (contentTab === type ? 'active' : '') + '" data-action="contentTab" data-id="' + type + '">' + labels[type] + ' <span class="badge">' + contentScope().filter(r => type === 'ALL' || contentCategory(r) === type).length + '</span></button>').join('') + '</div>'
    }
    views.content = function() {
        let rows = contentScope(),
            bytes = rows.reduce((a, r) => a + Number(r.size || 0), 0);
        return '<div class="library-page">' + head('Content Library', 'Find training videos, manuals, presentations and other learning resources.', canUploadResources() ? btn('Bulk upload files', 'contentUpload', '', 'btn-primary') : '') + '<div class="library-summary"><div><span>Total files</span><strong>' + rows.length + '</strong></div><div><span>Content formats</span><strong>' + new Set(rows.map(r => r.filename.split('.').pop().toLowerCase())).size + '</strong></div><div><span>Library size</span><strong>' + contentSize(bytes) + '</strong></div><p>Videos, PDF manuals, presentations,<br>documents, workflows and images.</p></div><div class="library-browser"><div class="library-browser-head"><div><h2>Browse content</h2><p>Choose a category or search by file name, title, or tag.</p></div><div class="library-search"><label for="contentSearch">Search content</label><input id="contentSearch" type="search" value="' + esc(contentSearch) + '" placeholder="Search name, title, or tag"></div></div><div id="contentTabs">' + contentTabBar() + '</div><div class="library-results"><span id="contentCount">' + contentItems().length + ' files</span><span>Preview or download any card</span></div><section id="contentGrid" role="tabpanel" aria-labelledby="content-tab-' + contentTab + '">' + contentGrid() + '</section></div><p class="library-note">Content Library files are stored independently. Assign training resources through Learning Resources.</p></div>'
    };

    function refreshContent() {
        if ($id('contentCount')) $id('contentCount').textContent = contentItems().length + ' files';
        if ($id('contentTabs')) $id('contentTabs').innerHTML = contentTabBar();
        if ($id('contentGrid')) {
            $id('contentGrid').innerHTML = contentGrid();
            $id('contentGrid').setAttribute('aria-labelledby', 'content-tab-' + contentTab)
        }
    }

    function contentUploadScope(common, project) {
        return canUploadResources() && (!common || central()) && (common || projects().some(p => p.id === project && (context === 'all' || context === p.id)))
    }

    function openContentUpload() {
        if (!canUploadResources()) return deny();
        contentStage = null;
        modal('Bulk upload · Content Library', info('Choose multiple files together. Review all file types and duplicate checks before saving. Files are stored in this browser; nothing is added automatically to Learning Resources.') + '<div class="form-grid">' + (central() ? '<label>Library scope<select id="contentCommon"><option value="yes">Common library</option><option value="no">Project-specific</option></select></label>' : '<input type="hidden" id="contentCommon" value="no">') + '<label>Project (required for project-specific files)<select id="contentProject">' + options(projects(), context === 'all' ? '' : context) + '</select></label></div><label for="contentFiles">Select files · multiple selection supported</label><input id="contentFiles" type="file" multiple accept=".mp4,.webm,.mov,.m4v,.avi,.mpeg,.mpg,.ppt,.pptx,.pdf,.docx,.bpmn,.drawio,.workflow,.json,.png,.jpg,.jpeg,.webp,.gif"><div class="toolbar">' + btn('Validate files', 'contentValidate') + '</div><div id="contentUploadPreview" role="status"></div><div class="form-actions">' + btn('Save bulk upload', 'contentSave', '', 'btn-primary') + '</div>')
    }

    function validateContentFiles(files, common, project) {
        let seen = new Set();
        return files.map((file, i) => {
            let errors = [],
                error = contentFileError(file),
                key = R.norm(file.name);
            if (error) errors.push(error);
            if (!contentUploadScope(common, project)) errors.push('Select an authorized project or common library scope.');
            if (seen.has(key) || db.contentLibrary.some(r => r.common === common && (common || r.project === project) && R.norm(r.filename) === key)) errors.push('Duplicate file name in this upload or library scope. Rename the file before uploading.');
            seen.add(key);
            return {
                row: i + 1,
                file,
                type: contentCategory(file),
                errors
            }
        })
    }

    function previewContentUpload() {
        if (!canUploadResources()) return deny();
        let files = [...($id('contentFiles')?.files || [])],
            common = $id('contentCommon').value === 'yes',
            project = $id('contentProject').value;
        contentStage = null;
        if (!files.length) {
            $id('contentUploadPreview').innerHTML = info('Select one or more files.', true);
            return
        }
        let rows = validateContentFiles(files, common, project);
        contentStage = {
            files,
            common,
            project,
            actor: active
        };
        $id('contentUploadPreview').innerHTML = info(rows.some(r => r.errors.length) ? 'Validation failed. No files will be saved.' : 'All files valid. Select Save bulk upload to persist them.') + table(['File', 'Category', 'Size', 'Validation'], rows.map(r => [esc(r.file.name), esc(r.type || 'Unsupported'), contentSize(r.file.size), r.errors.length ? esc(r.errors.join(' · ')) : badge('Valid')]))
    }
    async function saveContentUpload() {
        let planned = contentStage;
        if (!planned || uploadBusy) return message('Validate selected files before saving.', true);
        if (planned.actor !== active || !contentUploadScope(planned.common, planned.project)) return deny();
        let rows = validateContentFiles(planned.files, planned.common, planned.project);
        if (rows.some(r => r.errors.length)) {
            $id('contentUploadPreview').innerHTML = info('Revalidation failed. No files saved: ' + esc(rows.flatMap(r => r.errors).join(' · ')), true);
            return
        }
        uploadBusy = true;
        let saveButton = document.querySelector('[data-action="contentSave"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving files…'
        }
        let stored = [],
            records = [];
        try {
            for (let row of rows) {
                let id = uid('CONTENT');
                stored.push(id);
                await fileStore('put', id, row.file);
                records.push({
                    id,
                    name: row.file.name.replace(/\.[^.]+$/, ''),
                    filename: row.file.name,
                    type: row.type,
                    size: row.file.size,
                    mime: row.file.type,
                    common: planned.common,
                    project: planned.common ? null : planned.project,
                    uploadedBy: active,
                    created: new Date().toISOString()
                })
            }
            if (contentStage !== planned || planned.actor !== active || !contentUploadScope(planned.common, planned.project) || validateContentFiles(planned.files, planned.common, planned.project).some(r => r.errors.length)) throw Error('Files, permissions or library contents changed. Validate again.');
            let ok = commit(() => {
                db.contentLibrary.push(...records);
                for (let record of records) audit('Content Library file uploaded', record.id, null, {
                    filename: record.filename,
                    size: record.size,
                    type: record.type,
                    common: record.common
                }, record.project)
            }, records.length + ' content files saved.');
            if (!ok) throw Error('Metadata save failed; upload rolled back.');
            stored = [];
            contentStage = null;
            closeModal();
            render();
        } catch (error) {
            await Promise.allSettled(stored.map(id => fileStore('delete', id)));
            message('Content upload was not saved: ' + error.message, true);
            if ($id('contentUploadPreview')) $id('contentUploadPreview').innerHTML = info(esc(error.message) + ' No files saved.', true)
        } finally {
            uploadBusy = false;
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Save bulk upload'
            }
        }
    }
    async function openContent(id, preview = false) {
        let r = contentScope().find(r => r.id === id);
        if (!r) return deny();
        try {
            let blob = r.sampleContent ? sampleContentBlob(id) : await fileStore('get', id);
            if (!contentScope().some(r => r.id === id)) return deny();
            if (!blob) throw Error('File bytes are missing in this browser.');
            if (preview) {
                let type = contentCategory(r),
                    ext = r.filename.split('.').pop().toLowerCase(),
                    isImage = type === 'Others' && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext),
                    isPdf = type === 'PDF_MANUALS',
                    mime = isPdf ? 'application/pdf' : isImage ? blob.type || 'image/' + (ext === 'jpg' ? 'jpeg' : ext) : type === 'Videos' ? blob.type || 'video/' + (ext === 'webm' ? 'webm' : 'mp4') : blob.type || 'application/octet-stream';
                let url = URL.createObjectURL(new Blob([blob], {
                    type: mime
                }));
                let previewBody;
                if (isPdf) previewBody = '<div class="pdf-viewer-toolbar"><span>PDF Viewer</span><a class="btn library-download" href="' + url + '" download="' + esc(r.filename) + '">Download</a><a class="btn library-preview" href="' + url + '" target="_blank" rel="noopener">Open in new tab</a></div><iframe class="content-preview-pdf" src="' + url + '" title="PDF preview: ' + esc(r.name) + '"></iframe>';
                else if (isImage) previewBody = '<img class="content-preview-image" src="' + url + '" alt="' + esc(r.name) + '">';
                else if (type === 'Videos') previewBody = '<video class="content-preview-video" controls src="' + url + '"></video>';
                else {
                    let text = await contentTextPreview(r, blob), tags = contentTags(r).map(tag => '<span class="library-tag">' + esc(tag) + '</span>').join('');
                    previewBody = '<div class="content-office-preview"><div class="content-office-heading"><div class="library-document" aria-hidden="true"><span>' + esc(ext.toUpperCase()) + '</span><i></i><i></i><i></i></div><div><h3>' + esc(r.name) + '</h3><p>' + esc(r.filename) + '</p><div class="library-tags">' + tags + '</div></div></div>' + (text ? '<pre class="content-text-preview">' + esc(text) + '</pre>' : '<p class="content-preview-empty">This file is ready to preview. Download it to open the full document in a compatible app.</p>') + '<a class="btn library-download" href="' + url + '" download="' + esc(r.filename) + '">Download original file</a></div>';
                }
                modal(r.name, previewBody + (isPdf ? info('The browser PDF viewer provides page navigation, zoom and print where supported. Use Download or Open in new tab if it does not display.') : type === 'Videos' ? info('Preview support depends on the browser and video codec. Download retains the original file.') : ''));
                $id('editor').classList.toggle('pdf-preview-dialog', isPdf);
                $id('editor').addEventListener('close', () => {
                    $id('editor').classList.remove('pdf-preview-dialog');
                    URL.revokeObjectURL(url)
                }, {
                    once: true
                })
            } else download(blob, r.filename)
        } catch (error) {
            message('Content could not be opened: ' + error.message, true)
        }
    }

    async function contentTextPreview(record, blob) {
        let ext = record.filename.split('.').pop().toLowerCase();
        if (['docx', 'pptx'].includes(ext) && window.JSZip) {
            try {
                let zip = await window.JSZip.loadAsync(blob), names = Object.keys(zip.files).filter(name => ext === 'docx' ? name === 'word/document.xml' : /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort(), chunks = [];
                for (let name of names.slice(0, 20)) {
                    let xml = await zip.files[name].async('string'), doc = new DOMParser().parseFromString(xml, 'application/xml'), parts = [...doc.getElementsByTagName('*')].filter(node => node.localName === 't').map(node => node.textContent).filter(Boolean);
                    if (parts.length) chunks.push((ext === 'pptx' ? name.split('/').pop().replace('.xml', '').replace('slide', 'Slide ') + '\n' : '') + parts.join(' '));
                }
                return chunks.join('\n\n').slice(0, 12000)
            } catch { return '' }
        }
        if (ext === 'json') {
            let raw = await blob.text();
            try { return JSON.stringify(JSON.parse(raw), null, 2).slice(0, 12000) } catch { return raw.slice(0, 12000) }
        }
        if (['bpmn', 'drawio', 'workflow'].includes(ext)) {
            let raw = await blob.text();
            if (raw.trim().startsWith('<')) {
                let doc = new DOMParser().parseFromString(raw, 'application/xml');
                if (!doc.querySelector('parsererror')) return [...doc.getElementsByTagName('*')].map(node => node.textContent?.trim()).filter((value, index, all) => value && value.length < 500 && all.indexOf(value) === index).join('\n').slice(0, 12000)
            }
            return raw.slice(0, 12000)
        }
        return ''
    }

    const priorContentAct = act;
    act = async function(action, id) {
        switch (action) {
            case 'contentTab':
                if (!contentTabs.includes(id)) return;
                contentTab = id;
                refreshContent();
                $id('content-tab-' + id)?.focus();
                return;
            case 'contentUpload':
                return openContentUpload();
            case 'contentValidate':
                return previewContentUpload();
            case 'contentSave':
                return saveContentUpload();
            case 'contentPreview':
                return openContent(id, true);
            case 'contentDownload':
                return openContent(id);
            default:
                return priorContentAct(action, id)
        }
    };
    const priorContentBind = bind;
    bind = function() {
        priorContentBind();
        const on = (event, selector, fn) => {
            if (window.jQuery) jQuery(document).on(event, selector, fn);
            else document.addEventListener(event, e => {
                let target = e.target.closest(selector);
                if (target) fn.call(target, e)
            })
        };
        on('input', '#contentSearch', function() {
            contentSearch = this.value;
            refreshContent()
        });
        on('change', '#contentFiles, #contentCommon, #contentProject', function() {
            contentStage = null;
            if ($id('contentUploadPreview')) $id('contentUploadPreview').innerHTML = info('Selection changed. Validate again before saving.')
        });
        on('keydown', '[role="tab"][data-action="contentTab"]', function(e) {
            let i = contentTabs.indexOf(this.dataset.id),
                next = e.key === 'ArrowRight' ? (i + 1) % contentTabs.length : e.key === 'ArrowLeft' ? (i + contentTabs.length - 1) % contentTabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? contentTabs.length - 1 : -1;
            if (next >= 0) {
                e.preventDefault();
                act('contentTab', contentTabs[next])
            }
        });
        $id('editor').addEventListener('close', () => {
            contentStage = null
        })
    };

    /* Teacher profile: source Sample Registration Form.docx. Directory is synthetic. */
    function teacherDirectory() {
        return db.schools.map(s => ({
            ...s,
            block: s.block || (s.district === 'Bengaluru' ? 'Sample Bengaluru Block' : 'Sample Pune Block')
        }))
    }
    const teacherChoices = {
        gender: ['Female', 'Male', 'Other', 'Prefer not to say'],
        designation: ['Teacher', 'Head Teacher', 'Warden', 'Other'],
        classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
        subjects: ['Languages', 'Mathematics', 'Science', 'Social Science', 'Computer-ICT', 'Vocational', 'Other'],
        experience: ['Less than 1 year', '1–5 years', '6–10 years', '11–15 years', 'More than 15 years']
    };

    function teacherProfile(x) {
        return Object.fromEntries(['state', 'district', 'block', 'schoolName', 'udise', 'gender', 'designation', 'classes', 'subjects', 'experience'].map(k => [k, String(x[k] || '').trim()]).concat([
            ['registrationProfile', true]
        ]))
    }

    function teacherList(x) {
        return Array.isArray(x) ? x : String(x || '').split(';').map(v => v.trim()).filter(Boolean)
    }

    function teacherErrors(x, db) {
        let e = {};
        for (let k of ['state', 'district', 'block', 'schoolName', 'udise', 'name', 'gender', 'designation', 'experience'])
            if (!String(x[k] || '').trim()) e[k] = 'This field is required.';
        if (!/^\d{10}$/.test(String(x.mobile || ''))) e.mobile = 'Enter a 10-digit mobile number.';
        for (let k of ['gender', 'designation', 'experience'])
            if (!teacherChoices[k].includes(x[k])) e[k] = 'Select one of the listed options.';
        for (let k of ['classes', 'subjects']) {
            let v = teacherList(x[k]);
            if (!v.length || v.some(y => !teacherChoices[k].includes(y))) e[k] = 'Select at least one valid option.'
        }
        let school = teacherDirectory().find(s => s.udise === String(x.udise || '').trim());
        if (!school || school.name !== x.schoolName || school.state !== x.state || school.district !== x.district || school.block !== x.block) e.schoolName = 'Select a matching State, District, Block, School and UDISE from the sample directory.';
        return e
    }
    const priorTeacherRule = R.trainee;
    R.trainee = function(x, b, data, self) {
        let e = priorTeacherRule(x, b, data, self);
        if (x.registrationProfile || self) Object.assign(e, teacherErrors(x, data));
        return e
    };

    function teacherSampleRow(b) {
        let s = teacherDirectory().find(s => s.id === b?.school) || teacherDirectory()[0];
        return [s.state, s.district, s.block, s.name, s.udise, 'Sample New Teacher', '9000000099', 'new.teacher@example.test', 'Female', 'Teacher', 'Class 6;Class 7', 'Languages;Mathematics', '1–5 years']
    }

    function profileField(k, label, multiple = false) {
        return '<label for="f-' + k + '">' + label + ' *<select id="f-' + k + '" ' + (multiple ? 'multiple aria-describedby="e-' + k + '"' : 'name="' + k + '" required') + '></select>' + (multiple ? '<input type="hidden" name="' + k + '" id="profile-' + k + '">' : '') + '<span id="e-' + k + '" class="invalid-feedback"></span></label>'
    }

    function profileOptions(k, values) {
        let el = $id('f-' + k);
        if (!el) return;
        el.innerHTML = '<option value="">Select…</option>' + values.map(v => '<option value="' + esc(v) + '">' + esc(v) + '</option>').join('')
    }

    function profileCascade(k) {
        let d = teacherDirectory(),
            v = n => $id('f-' + n)?.value;
        if (k === 'state') {
            profileOptions('district', [...new Set(d.filter(s => s.state === v('state')).map(s => s.district))]);
            profileOptions('block', [])
        }
        if (k === 'district') profileOptions('block', [...new Set(d.filter(s => s.state === v('state') && s.district === v('district')).map(s => s.block))]);
        if (k !== 'schoolName') {
            let q = R.norm($id('schoolSearch')?.value);
            profileOptions('schoolName', d.filter(s => s.state === v('state') && s.district === v('district') && s.block === v('block') && (!q || R.norm(s.name + ' ' + s.udise).includes(q))).map(s => s.name))
        }
        let school = d.find(s => s.name === v('schoolName') && s.block === v('block') && s.state === v('state'));
        $id('f-udise').value = school?.udise || ''
    }
    const priorTeacherArea = renderBatchArea;
    renderBatchArea = function(b) {
        priorTeacherArea(b);
        if (current !== 'registration' || !$id('editForm') || $id('editForm').dataset.kind !== 'registration') return;
        let form = $id('editForm');
        form.classList.add('teacher-profile');
        let first = document.createElement('fieldset');
        first.innerHTML = '<legend>School &amp; Teacher Details</legend>' + info('School directory: SAMPLE DATA. Select your applicable batch above. UDISE is populated from the selected school.') + '<div class="profile-grid">' + profileField('state', 'State') + profileField('district', 'District') + profileField('block', 'Block') + '<label for="schoolSearch">Search school<input type="search" id="schoolSearch" placeholder="School name or UDISE"></label>' + profileField('schoolName', 'KGBV / School Name') + '<label for="f-udise">UDISE+ Code *<input name="udise" id="f-udise" readonly required><span id="e-udise" class="invalid-feedback"></span></label></div>';
        form.prepend(first);
        let second = document.createElement('fieldset');
        second.innerHTML = '<legend>Teaching Profile</legend><p>Use Ctrl/Cmd to select multiple classes or subjects.</p><div class="profile-grid">' + profileField('gender', 'Gender') + profileField('designation', 'Designation / Role') + profileField('classes', 'Classes Taught', true) + profileField('subjects', 'Subject(s) Taught', true) + profileField('experience', 'Total Teaching Experience') + '</div>';
        form.insertBefore(second, form.querySelector('[type=submit]')?.parentElement || null);
        profileOptions('state', [...new Set(teacherDirectory().map(s => s.state))]);
        for (let k of Object.keys(teacherChoices)) {
            profileOptions(k, teacherChoices[k]);
            if (['classes', 'subjects'].includes(k)) $id('f-' + k).querySelector('[value=""]').remove()
        }
        $id('f-mobile').setAttribute('pattern', '[0-9]{10}');
        $id('f-mobile').setAttribute('maxlength', '10');
    };
    const priorTeacherBatches = batches;
    batches = function() {
        if (current === 'registration' && window.DemoAuth?.publicGuest && !routeBatch()) return db.batches.filter(b => b.open && !b.closed);
        return priorTeacherBatches()
    };
    const priorTeacherBind = bind;
    bind = function() {
        priorTeacherBind();
        const on = (evt, selector, fn) => {
            if (window.jQuery) jQuery(document).on(evt, selector, fn);
            else document.addEventListener(evt, e => {
                if (e.target.matches(selector)) fn.call(e.target, e)
            })
        };
        on('change', '#f-state,#f-district,#f-block,#f-schoolName', function() {
            if (current === 'registration') profileCascade(this.id.slice(2))
        });
        on('input', '#schoolSearch', () => profileCascade('search'));
        on('change', '#f-classes,#f-subjects', function() {
            let k = this.id.slice(2);
            $id('profile-' + k).value = [...this.selectedOptions].map(o => o.value).join(';')
        })
    };

    /* ERNET sponsor dashboard; measures are derived from authorized demo records. */
    let ernetFilter = {
        project: '',
        state: '',
        district: '',
        school: '',
        plan: '',
        batch: '',
        from: '',
        to: '',
        type: 'All',
        status: ''
    };

    function ernetBase() {
        return batches()
    }

    function ernetType(t) {
        return t.participantType === 'Student' ? 'Students' : t.participantType === 'Teacher' || t.designation || /teacher/i.test(t.name || '') ? 'Teachers' : 'Unknown'
    }

    function ernetRows() {
        if (ernetFilter.from && ernetFilter.to && ernetFilter.from > ernetFilter.to) return [];
        return ernetBase().filter(b => {
            let assigned = schoolIdsForBatch(b).map(id => db.schools.find(s => s.id === id)).filter(Boolean);
            return (!ernetFilter.project || b.project === ernetFilter.project) && (!ernetFilter.state || assigned.some(s => s.state === ernetFilter.state)) && (!ernetFilter.district || assigned.some(s => s.district === ernetFilter.district)) && (!ernetFilter.school || schoolIdsForBatch(b).includes(ernetFilter.school)) && (!ernetFilter.plan || b.plan === ernetFilter.plan) && (!ernetFilter.batch || b.id === ernetFilter.batch) && (!ernetFilter.from || b.end >= ernetFilter.from) && (!ernetFilter.to || b.start <= ernetFilter.to)
        })
    }

    function ernetMetrics(bs, type = ernetFilter.type) {
        let ids = new Set(bs.map(b => b.id)),
            ts = db.trainees.filter(t => ids.has(t.batch) && (!trainee() || t.id === user().trainee) && (type === 'All' || ernetType(t) === type)),
            marks = db.attendance.filter(a => ts.some(t => t.id === a.trainee) && ids.has(a.batch) && (!ernetFilter.from || a.date >= ernetFilter.from) && (!ernetFilter.to || a.date <= ernetFilter.to)),
            configured = ['attendance', 'pass', 'assessment', 'feedback'].every(k => db.settings[k] !== ''),
            done = configured ? ts.filter(t => R.eligibility(t, db).eligible) : [],
            attended = ts.filter(t => marks.some(a => a.trainee === t.id && a.status === 'Present')),
            cert = new Set(db.certificates.filter(c => ts.some(t => t.id === c.trainee)).map(c => c.trainee));
        return {
            ts,
            marks,
            target: type === 'All' ? bs.reduce((n, b) => n + Number(b.targetParticipants ?? b.capacity), 0) : bs.every(b => Number.isFinite(Number(b[type === 'Teachers' ? 'teacherTarget' : 'studentTarget']))) ? bs.reduce((n, b) => n + Number(b[type === 'Teachers' ? 'teacherTarget' : 'studentTarget']), 0) : null,
            registered: ts.length,
            attended: attended.length,
            completed: configured ? done.length : null,
            certified: cert.size,
            attendance: marks.length ? 100 * marks.filter(a => a.status === 'Present').length / marks.length : null,
            teachers: configured ? done.filter(t => ernetType(t) === 'Teachers').length : null,
            students: configured ? done.filter(t => ernetType(t) === 'Students').length : null
        }
    }

    function ernetPct(n, d) {
        return n === null || !d ? 'N/A' : (100 * n / d).toFixed(1) + '%'
    }

    function ernetValue(v) {
        return v === null ? 'Pending' : Number(v).toLocaleString('en-IN')
    }

    function ernetStatus(b) {
        return b.closed ? 'Completed' : today < b.start ? 'Upcoming' : today > b.end ? 'Delayed' : 'Ongoing'
    }

    function ernetSelect(k, label, items) {
        let selected = items.find(x => x.id === ernetFilter[k])?.name || 'All';
        return '<label>' + label + '<select data-ernet="' + k + '" title="' + esc(selected) + '"><option value="" title="All">All</option>' + items.map(x => '<option value="' + esc(x.id) + '" title="' + esc(x.name) + '" ' + (ernetFilter[k] === x.id ? 'selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label>'
    }

    function ernetOrderedFilters() {
        let bs = ernetBase().filter(b => !ernetFilter.project || b.project === ernetFilter.project),
            locationBatches = bs.filter(b => !ernetFilter.plan || b.plan === ernetFilter.plan),
            schools = db.schools.filter(s => locationBatches.some(b => schoolIdsForBatch(b).includes(s.id))),
            unique = k => [...new Set(schools.filter(s => k === 'state' || !ernetFilter.state || s.state === ernetFilter.state).map(s => s[k]))].filter(Boolean).map(v => ({
                id: v,
                name: v
            }));
        return '<div class="ernet-filters ernet-ordered-filters">' + ernetSelect('project', 'Project', projects().filter(p => context === 'all' || p.id === context)) + ernetSelect('plan', 'Training Plan', db.plans.filter(p => bs.some(b => b.plan === p.id))) + ernetSelect('state', 'State', unique('state')) + ernetSelect('district', 'District', unique('district')) + ernetSelect('school', 'School', schools.filter(s => (!ernetFilter.state || s.state === ernetFilter.state) && (!ernetFilter.district || s.district === ernetFilter.district))) + ernetSelect('batch', 'Batch', locationBatches.filter(b => {
            let assigned = schoolIdsForBatch(b).map(id => db.schools.find(s => s.id === id)).filter(Boolean);
            return (!ernetFilter.state || assigned.some(s => s.state === ernetFilter.state)) && (!ernetFilter.district || assigned.some(s => s.district === ernetFilter.district)) && (!ernetFilter.school || schoolIdsForBatch(b).includes(ernetFilter.school))
        }).map(b => ({
            id: b.id,
            name: b.code
        }))) + '<label>From Date<input aria-label="From Date" title="' + esc(ernetFilter.from || 'Select From Date') + '" type="date" data-ernet="from" value="' + esc(ernetFilter.from) + '"></label><label>To Date<input aria-label="To Date" title="' + esc(ernetFilter.to || 'Select To Date') + '" type="date" data-ernet="to" value="' + esc(ernetFilter.to) + '"></label><label>Participant Type<select data-ernet="type" title="' + esc(ernetFilter.type) + '">' + ['Teachers', 'Students'].map(v => '<option value="' + v + '" title="' + v + '" ' + (ernetFilter.type === v ? 'selected' : '') + '>' + v + '</option>').join('') + '</select></label><div class="ernet-filter-reset">' + btn('Reset filters', 'ernetReset') + '</div></div>'
    }

    function ernetFilters() {
        if (user().role === 'ERNET Admin') return ernetOrderedFilters();
        let bs = ernetBase().filter(b => !ernetFilter.project || b.project === ernetFilter.project),
            schools = db.schools.filter(s => bs.some(b => schoolIdsForBatch(b).includes(s.id))),
            unique = k => [...new Set(schools.filter(s => (k === 'state' || !ernetFilter.state || s.state === ernetFilter.state)).map(s => s[k]))].filter(Boolean).map(v => ({
                id: v,
                name: v
            }));
        return '<div class="ernet-filters">' + ernetSelect('project', 'Project', projects().filter(p => context === 'all' || p.id === context)) + ernetSelect('state', 'State', unique('state')) + ernetSelect('district', 'District', unique('district')) + ernetSelect('school', 'School', schools.filter(s => (!ernetFilter.state || s.state === ernetFilter.state) && (!ernetFilter.district || s.district === ernetFilter.district))) + ernetSelect('plan', 'Training Plan', db.plans.filter(p => bs.some(b => b.plan === p.id))) + ernetSelect('batch', 'Batch', bs.filter(b => (!ernetFilter.school || schoolIdsForBatch(b).includes(ernetFilter.school)) && (!ernetFilter.plan || b.plan === ernetFilter.plan)).map(b => ({
            id: b.id,
            name: b.code
        }))) + '<label>From date<input type="date" data-ernet="from" value="' + esc(ernetFilter.from) + '"></label><label>To date<input type="date" data-ernet="to" value="' + esc(ernetFilter.to) + '"></label><label>Participant Type<select data-ernet="type">' + ['All', 'Teachers', 'Students'].map(v => '<option ' + (ernetFilter.type === v ? 'selected' : '') + '>' + v + '</option>').join('') + '</select></label>' + btn('Reset filters', 'ernetReset') + '</div>'
    }

    function ernetProgress(m) {
        return ['Planned', 'Enrolled', 'Attended', 'Completed', 'Certified'].map((label, i) => {
            let count = [m.target, m.registered, m.attended, m.completed, m.certified][i],
                pct = ernetPct(count, m.target),
                width = count !== null && m.target ? Math.min(100, 100 * count / m.target) : 0;
            return '<div class="ernet-progress-row"><strong>' + label + '</strong><div class="ernet-track"><span style="width:' + width + '%"></span></div><span>' + ernetValue(count) + '</span><small>' + pct + '</small></div>'
        }).join('')
    }

    function ernetParticipation(bs) {
        let t = ernetMetrics(bs, 'Teachers'),
            s = ernetMetrics(bs, 'Students'),
            max = Math.max(t.target || 0, s.target || 0, t.registered, s.registered, t.attended, s.attended, t.completed || 0, s.completed || 0, 1);
        return '<div class="ernet-legend"><span>■ Teachers</span><span>■ Students</span></div>' + ['Target', 'Registered', 'Attended', 'Completed'].map((label, i) => {
            let key = ['target', 'registered', 'attended', 'completed'][i];
            return '<div class="ernet-group"><strong>' + label + '</strong>' + [t, s].map((m, j) => '<div class="ernet-group-bar ' + (j ? 'student' : '') + '"><span style="width:' + Math.min(100, 100 * (m[key] || 0) / max) + '%"></span><small>' + (m[key] === null ? 'Pending' : ernetValue(m[key])) + '</small></div>').join('') + '</div>'
        }).join('')
    }

    function ernetGeography(bs) {
        let level = !ernetFilter.state ? 'state' : !ernetFilter.district ? 'district' : 'school',
            groups = [...new Set(bs.flatMap(b => level === 'school' ? schoolIdsForBatch(b) : schoolIdsForBatch(b).map(id => lookup(db.schools, id, level))))];
        return table([level === 'state' ? 'State' : level === 'district' ? 'District' : 'School', 'Target (capacity fallback)', 'Trained · provisional', 'Achievement', 'Attendance', 'Explore'], groups.map(g => {
            let subset = bs.filter(b => (level === 'school' ? schoolIdsForBatch(b) : schoolIdsForBatch(b).map(id => lookup(db.schools, id, level))).includes(g)),
                m = ernetMetrics(subset);
            return [esc(level === 'school' ? lookup(db.schools, g) : g), ernetValue(m.target), ernetValue(m.completed), ernetPct(m.completed, m.target), m.attendance === null ? 'N/A' : m.attendance.toFixed(1) + '%', btn(level === 'school' ? 'View batches' : 'Drill down', 'ernetGeo', level + '|' + g)]
        }))
    }
    const priorErnetDashboard = views.dashboard;
    views.dashboard = function() {
        if (user().role !== 'ERNET Admin') return priorErnetDashboard();
        let bs = ernetRows(),
            m = ernetMetrics(bs),
            statusCounts = Object.fromEntries(['Upcoming', 'Ongoing', 'Completed', 'Delayed'].map(s => [s, bs.filter(b => ernetStatus(b) === s).length])),
            nums = [
                ['Training Progress', ernetPct(m.completed, m.target)],
                ['Target Participants', ernetValue(m.target)],
                ['Participants Registered', ernetValue(m.registered)],
                ['Participants Trained', ernetValue(m.completed)],
                ['Attendance Rate', m.attendance === null ? 'N/A' : m.attendance.toFixed(1) + '%'],
                ['Active Batches', statusCounts.Ongoing],
                ['Completed Batches', statusCounts.Completed],
                ['Upcoming Batches', statusCounts.Upcoming],
                ['Teachers Trained', ernetValue(m.teachers)],
                ['Students Trained', ernetValue(m.students)]
            ],
            shown = bs.filter(b => !ernetFilter.status || ernetStatus(b) === ernetFilter.status);
        return '<div class="ernet-dashboard">' + head('ERNET Admin Dashboard', 'Training progress, attendance and participation across your assigned projects.') + ernetFilters() + (ernetFilter.from && ernetFilter.to && ernetFilter.from > ernetFilter.to ? info('From date must be on or before To date.', true) : '') + '<p class="ernet-caption">SAMPLE DATA · Filtered to assigned projects. Targets use batch capacity where no confirmed target exists. Completion and trained counts require review criteria.</p><div class="ernet-kpis">' + nums.map(([label, v]) => '<div class="kpi"><small>' + label + '</small><strong>' + v + '</strong></div>').join('') + '</div><div class="ernet-columns">' + panel('Training Progress', ernetProgress(m)) + panel('Target vs Achievement', '<div class="ernet-achievement"><strong>' + ernetPct(m.completed, m.target) + '</strong><span>Achievement</span></div>' + '<div class="ernet-track"><span style="width:' + (m.completed !== null && m.target ? Math.min(100, 100 * m.completed / m.target) : 0) + '%"></span></div>' + '<p>Target: ' + ernetValue(m.target) + ' · Trained: ' + ernetValue(m.completed) + '</p><p class="ernet-caption">Use geographic drill-down below: Project → State → District → School → Batch.</p>') + '</div>' + panel('Teacher vs Student Participation', ernetParticipation(bs) + '<p class="ernet-caption">Targets follow the synthetic 10-teacher / 100-student KGBV school assumptions. Completion criteria require review.</p>') + panel('Batch Progress', '<p>' + bs.length + ' total filtered batches</p><div class="ernet-statuses">' + Object.entries(statusCounts).map(([s, n]) => btn(s + ' · ' + n, 'ernetStatus', s, ernetFilter.status === s ? 'btn btn-primary' : 'btn')).join('') + btn('All batches', 'ernetStatus', '') + '</div>') + panel('Geographic Performance', ernetGeography(bs)) + panel('Training Batches' + (ernetFilter.status ? ' · ' + ernetFilter.status : ''), table(['Batch', 'Project', 'School / Cluster', 'Training Plan', 'Dates', 'Status', 'Action'], shown.map(b => [esc(b.code), esc(lookup(db.projects, b.project)), esc(schoolNamesForBatch(b).join(', ')), esc(R.batchPlan(b, db)?.name || '—'), esc(b.start) + ' → ' + esc(b.end), badge(ernetStatus(b)), btn('View details', 'viewBatch', b.id)]))) + '</div>'
    };
    const priorErnetAct = act;
    act = async function(action, id) {
        if (action.startsWith('ernet') && !roles.includes(user().role)) return deny();
        if (action === 'ernetReset') {
            ernetFilter = {
                project: '',
                state: '',
                district: '',
                school: '',
                plan: '',
                batch: '',
                from: '',
                to: '',
                type: user().role === 'ERNET Admin' ? 'Teachers' : 'All',
                status: ''
            };
            render();
            return
        }
        if (action === 'ernetStatus') {
            ernetFilter.status = id;
            render();
            return
        }
        if (action === 'ernetGeo') {
            let [k, ...v] = id.split('|');
            if (!['state', 'district', 'school'].includes(k)) return;
            ernetFilter[k] = v.join('|');
            if (k === 'state') {
                ernetFilter.district = '';
                ernetFilter.school = ''
            }
            if (k === 'district') ernetFilter.school = '';
            ernetFilter.batch = '';
            render();
            return
        }
        return priorErnetAct(action, id)
    };
    const priorErnetBind = bind;
    bind = function() {
        priorErnetBind();
        let handler = function(e) {
            let el = e.target;
            if (!el.matches('[data-ernet]') || !roles.includes(user().role)) return;
            let k = el.dataset.ernet;
            ernetFilter[k] = el.value;
            ernetFilter.status = '';
            if (k === 'project') {
                ernetFilter.state = '';
                ernetFilter.district = '';
                ernetFilter.school = '';
                ernetFilter.plan = '';
                ernetFilter.batch = ''
            }
            if (k === 'state') {
                ernetFilter.district = '';
                ernetFilter.school = '';
                ernetFilter.batch = ''
            }
            if (k === 'district') {
                ernetFilter.school = '';
                ernetFilter.batch = ''
            }
            if (k === 'plan' && user().role === 'ERNET Admin') {
                ernetFilter.state = '';
                ernetFilter.district = '';
                ernetFilter.school = ''
            }
            if (k === 'school' || k === 'plan') ernetFilter.batch = '';
            render()
        };
        if (window.jQuery) jQuery(document).on('change', '[data-ernet]', handler);
        else document.addEventListener('change', handler)
    };

    /* Graphic dashboard aligned to the supplied sponsor reference. */
    function sponsorBarChart(labels, series) {
        let w = 440,
            h = 215,
            left = 42,
            top = 16,
            bottom = 43,
            max = Math.max(...series.flatMap(s => s.values.filter(v => v !== null)), 1),
            plot = h - top - bottom,
            group = (w - left - 12) / labels.length;
        return '<svg class="sponsor-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(labels.join(', ')) + ' comparison">' + [0, .25, .5, .75, 1].map(n => '<line x1="' + left + '" y1="' + (top + plot * (1 - n)) + '" x2="430" y2="' + (top + plot * (1 - n)) + '" stroke="#e8eef5"/><text x="36" y="' + (top + plot * (1 - n) + 4) + '" text-anchor="end" font-size="10" fill="#66758a">' + Math.round(max * n) + '</text>').join('') + labels.map((label, i) => series.map((s, j) => {
            let value = s.values[i],
                bw = Math.min(35, group / (series.length + 1)),
                x = left + i * group + group / 2 + (j - series.length / 2) * bw,
                y = top + plot - (value || 0) / max * plot;
            return '<rect x="' + x + '" y="' + y + '" width="' + (bw - 5) + '" height="' + ((value || 0) / max * plot) + '" rx="2" fill="' + (s.colors?.[i] || s.color) + '"/><text x="' + (x + (bw - 5) / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="10" fill="#17365d">' + (value === null ? 'N/A' : value) + '</text>'
        }).join('') + '<text x="' + (left + i * group + group / 2) + '" y="' + (h - 20) + '" text-anchor="middle" font-size="10" fill="#17365d">' + esc(label) + '</text>').join('') + '</svg>'
    }

    function sponsorDonut(n, d) {
        let pct = n !== null && d ? 100 * n / d : null;
        return '<div class="sponsor-donut"><svg viewBox="0 0 120 120" role="img" aria-label="Achievement ' + ernetPct(n, d) + '"><circle cx="60" cy="60" r="45" fill="none" stroke="#edf2f8" stroke-width="14"/><circle cx="60" cy="60" r="45" fill="none" stroke="#f58220" stroke-width="14" pathLength="100" stroke-dasharray="' + (pct === null ? 0 : Math.min(100, pct)) + ' 100" transform="rotate(-90 60 60)"/><text x="60" y="65" text-anchor="middle" fill="#17365d" font-size="18" font-weight="700">' + ernetPct(n, d) + '</text></svg><strong>Achievement</strong></div>'
    }

    function sponsorTrend(m) {
        let days = [...new Set(m.marks.map(a => a.date))].sort(),
            values = days.map(d => {
                let rows = m.marks.filter(a => a.date === d);
                return 100 * rows.filter(a => a.status === 'Present').length / rows.length
            });
        if (!days.length) return '<div class="sponsor-empty">No attendance recorded for these filters.</div>';
        let x = i => days.length === 1 ? 220 : 45 + i * 365 / (days.length - 1),
            y = v => 175 - v * 1.4,
            pts = values.map((v, i) => x(i) + ',' + y(v)).join(' ');
        return '<svg class="sponsor-chart" viewBox="0 0 440 215" role="img" aria-label="Attendance percentage by recorded date">' + [0, 25, 50, 75, 100].map(v => '<line x1="45" x2="410" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#e8eef5"/><text x="36" y="' + (y(v) + 3) + '" text-anchor="end" font-size="10" fill="#66758a">' + v + '%</text>').join('') + '<polyline points="' + pts + '" fill="none" stroke="#f58220" stroke-width="3"/>' + values.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="4" fill="#f58220"/><text x="' + x(i) + '" y="' + (y(v) - 10) + '" text-anchor="middle" font-size="10" fill="#17365d">' + v.toFixed(1) + '%</text><text x="' + x(i) + '" y="200" text-anchor="middle" font-size="9" fill="#66758a">' + esc(days[i].slice(5)) + '</text>').join('') + '</svg>'
    }

    function sponsorEffectiveness(m) {
        let subs = db.submissions.filter(s => m.ts.some(t => t.id === s.trainee) && (!ernetFilter.from || s.date >= ernetFilter.from) && (!ernetFilter.to || s.date <= ernetFilter.to)),
            scores = term => subs.filter(s => /assessment/i.test(lookup(db.resources, s.resource, 'formType')) && new RegExp(term, 'i').test(lookup(db.resources, s.resource)) && Number.isFinite(Number(s.score))).map(s => Number(s.score)),
            avg = a => a.length ? a.reduce((a, b) => a + b, 0) / a.length : null,
            pre = avg(scores('pre')),
            post = avg(scores('post')),
            feedback = m.ts.filter(t => subs.some(s => s.trainee === t.id && lookup(db.resources, s.resource, 'formType') === 'Feedback')).length;
        return '<div class="sponsor-effect-scores">' + [
            ['Pre-Assessment Average', pre],
            ['Post-Assessment Average', post]
        ].map(([label, v]) => '<div><small>' + label + '</small><strong>' + (v === null ? 'Pending' : v.toFixed(1) + '%') + '</strong><div class="ernet-track"><span style="width:' + (v || 0) + '%"></span></div></div>').join('') + '</div><div class="sponsor-effect-mini"><div><small>Knowledge Improvement</small><strong>' + (pre === null || post === null ? 'Pending' : (post - pre).toFixed(1) + ' pts') + '</strong></div><div><small>Satisfaction</small><strong>Pending</strong></div><div><small>Feedback Completion</small><strong>' + ernetPct(feedback, m.ts.length) + '</strong></div></div><p class="ernet-caption">Recorded demo scores. Satisfaction requires a configured rating scale.</p>'
    }

    function sponsorAttention(bs, m) {
        let delayed = bs.filter(b => ernetStatus(b) === 'Delayed'),
            pending = m.ts.filter(t => !t.approved),
            items = [
                ['Batches awaiting closure', delayed.length, 'Delayed'],
                ['Trainees awaiting approval', pending.length, ''],
                ['Batches missing assigned trainers', bs.filter(b => !db.trainers.some(t => t.id === b.trainer)).length, '']
            ];
        return '<div class="sponsor-attention">' + items.map(([label, n, status]) => '<div><strong>' + n + '</strong><span>' + label + '</span>' + (status ? btn('View', 'ernetStatus', status) : '') + '</div>').join('') + '</div><p class="ernet-caption">Low-attendance and target alerts need approved thresholds. Certificate-pending counts require confirmed issuance rules.</p>'
    }
    const sponsorPriorProgress = ernetProgress;
    ernetProgress = function(m) {
        let stages = ['Planned', 'Enrolled', 'Approved', 'Attended', 'Completed', 'Certified'],
            counts = [m.target, m.registered, m.ts.filter(t => t.approved).length, m.attended, m.completed, m.certified];
        return stages.map((label, i) => '<div class="ernet-progress-row"><strong>' + label + '</strong><div class="ernet-track"><span style="width:' + (counts[i] !== null && m.target ? Math.min(100, 100 * counts[i] / m.target) : 0) + '%;background:' + ['#17365d', '#2d91ea', '#70b9ef', '#f58220', '#ffb36f', '#ffd9b6'][i] + '"></span></div><span>' + ernetValue(counts[i]) + '</span><small>' + ernetPct(counts[i], m.target) + '</small></div>').join('')
    };
    views.dashboard = function() {
        let bs = ernetRows(),
            m = ernetMetrics(bs),
            t = ernetMetrics(bs, 'Teachers'),
            s = ernetMetrics(bs, 'Students'),
            counts = Object.fromEntries(['Upcoming', 'Ongoing', 'Completed', 'Delayed'].map(k => [k, bs.filter(b => ernetStatus(b) === k).length])),
            shown = bs.filter(b => !ernetFilter.status || ernetStatus(b) === ernetFilter.status),
            nums = [
                ['Training Progress', ernetPct(m.completed, m.target), '◔'],
                ['Target Participants', ernetValue(m.target), '◎'],
                ['Participants Registered', ernetValue(m.registered), '♟'],
                ['Participants Trained', ernetValue(m.completed), '◆'],
                ['Attendance Rate', m.attendance === null ? 'N/A' : m.attendance.toFixed(1) + '%', '▥'],
                ['Active Batches', counts.Ongoing, '▤'],
                ['Completed Batches', counts.Completed, '✓'],
                ['Upcoming Batches', counts.Upcoming, '◷'],
                ['Teachers Trained', ernetValue(m.teachers), '♟'],
                ['Students Trained', ernetValue(m.students), '♟']
            ];
        nums = roleDashboardKPIs(bs, m, counts, nums);
        return '<div class="ernet-dashboard sponsor-reference ' + (user().role === 'ERNET Admin' ? 'ernet-seven-kpis' : '') + '"><div class="sponsor-title"><h1>Teacher Training – ' + esc(user().role) + ' Dashboard</h1><p>Track training progress, attendance, and participation of teachers and students.</p></div>' + ernetFilters() + '<p class="ernet-caption">SAMPLE DATA · Assigned projects only · Targets use capacity fallback · Completion criteria may be pending.</p>' + (ernetFilter.from && ernetFilter.to && ernetFilter.from > ernetFilter.to ? info('From date must be on or before To date.', true) : '') + '<div class="ernet-kpis">' + nums.map(([label, value, icon]) => '<div class="kpi"><small>' + label + '</small><span class="sponsor-kpi-icon" aria-hidden="true">' + icon + '</span><strong>' + value + '</strong><span class="sponsor-kpi-note">' + (String(value) === 'Pending' || value === 'N/A' ? 'Data pending' : 'Filtered scope') + '</span></div>').join('') + '</div><div class="sponsor-three">' + panel('Targets vs Trained', '<div class="sponsor-target">' + sponsorBarChart(['Target', 'Trained'], [{
            values: [m.target, m.completed],
            color: '#275d8c',
            colors: ['#275d8c', '#f58220']
        }]) + sponsorDonut(m.completed, m.target) + '</div>') + panel('Training Progress', ernetProgress(m)) + panel('Attendance Trend', sponsorTrend(m)) + '</div><div class="sponsor-batch-row ' + (user().role === 'ERNET Admin' ? 'ernet-status-only' : '') + '">' + (user().role === 'ERNET Admin' ? '' : panel('Teachers vs Students', '<div class="ernet-legend"><span>■ Teachers</span><span>■ Students</span></div>' + sponsorBarChart(['Target', 'Registered', 'Attended', 'Completed'], [{
            values: [t.target, t.registered, t.attended, t.completed],
            color: '#2d91ea'
        }, {
            values: [s.target, s.registered, s.attended, s.completed],
            color: '#f58220'
        }]))) + sponsorBatchStatus(bs) + '</div><div class="sponsor-bottom">' + (user().role === 'ERNET Admin' ? '' : panel('Location Performance', ernetGeography(bs)) + panel('Needs Attention', sponsorAttention(bs, m))) + '</div></div>'
    };

    function sponsorBatchStatus(bs) {
        let stages = [{
                name: 'Upcoming',
                color: '#f58220',
                icon: '◷',
                hint: 'Scheduled to begin'
            }, {
                name: 'Ongoing',
                color: '#275d8c',
                icon: '▶',
                hint: 'Training in progress'
            }, {
                name: 'Completed',
                color: '#169b62',
                icon: '✓',
                hint: 'Batch finally closed'
            }],
            counts = stages.map(s => bs.filter(b => ernetStatus(b) === s.name).length),
            total = counts.reduce((a, b) => a + b, 0);
        return '<section class="batch-visual" aria-label="Batch status overview"><div class="batch-visual-heading"><div><span>TRAINING DELIVERY</span><h3>Batch Status</h3><p>Choose a status to explore its batches.</p></div><div class="batch-visual-total"><strong>' + total + '</strong><span>batches in these statuses</span></div></div><div class="batch-visual-cards">' + stages.map((s, i) => '<button type="button" class="batch-status-card" data-action="ernetBatchVisual" data-id="' + s.name + '" style="--status-color:' + s.color + '"><span class="batch-status-icon" aria-hidden="true">' + s.icon + '</span><span class="batch-status-count">' + counts[i] + '</span><strong>' + s.name + '</strong><span class="batch-status-hint">' + s.hint + '</span><span class="batch-status-link">View batches <span aria-hidden="true">→</span></span></button>').join('') + '</div><div class="batch-distribution" role="img" aria-label="' + stages.map((s, i) => s.name + ': ' + counts[i]).join(', ') + '">' + stages.map((s, i) => '<span style="width:' + (total ? 100 * counts[i] / total : 0) + '%;background:' + s.color + '"></span>').join('') + '</div><div class="batch-distribution-labels">' + stages.map((s, i) => '<span><i style="background:' + s.color + '"></i>' + s.name + ' ' + (total ? (100 * counts[i] / total).toFixed(1) : '0') + '%</span>').join('') + '</div>' + (total ? '' : '<p class="ernet-caption">No batches in these statuses match the selected filters.</p>') + '</section>'
    }
    const priorBatchVisualAct = act;
    act = async function(action, id) {
        if (action === 'batchStatusTrainees') {
            let b = ernetRows().find(b => b.id === id);
            if (!b) return deny();
            let ts = trainees().filter(t => t.batch === b.id);
            modal('Trainees — ' + b.code, table(['Trainee ID', 'Name', 'Mobile / email masked', 'Participant Type', 'Completed Training Hours'], ts.map(t => [esc(t.id), esc(t.name), mask(t.mobile) + ' / ' + mask(t.email), esc(ernetType(t)), hoursLabel(t, [b])])));
            return
        }
        if (action === 'ernetBatchVisual') {
            if (!roles.includes(user().role) || !['Upcoming', 'Ongoing', 'Completed'].includes(id)) return deny();
            let rows = ernetRows().filter(b => ernetStatus(b) === id);
            modal(id + ' batches', rows.length ? '<div class="batch-drill-cards">' + rows.map(b => '<article><h3>' + esc(b.code) + '</h3><p>' + esc(R.batchPlan(b, db)?.name || '—') + '</p><p>' + esc(schoolNamesForBatch(b).join(', ')) + '</p><p>' + esc(b.start) + ' → ' + esc(b.end) + '</p>' + (trainee() ? '' : btn('View details', 'batchStatusTrainees', b.id)) + '</article>').join('') + '</div>' : info('No ' + id.toLowerCase() + ' batches match the selected filters.'));
            return
        }
        return priorBatchVisualAct(action, id)
    };

    function roleDashboardKPIs(bs, m, counts, base) {
        if (user().role === 'ERNET Admin') return base.filter(([label]) => !['Training Progress', 'Teachers Trained', 'Students Trained'].includes(label));
        let role = user().role,
            schoolCount = new Set(bs.map(b => b.school)).size,
            attendance = m.attendance === null ? 'N/A' : m.attendance.toFixed(1) + '%',
            pending = m.ts.filter(t => !t.approved).length;
        if (role === 'Schoolnet Admin') return [
            ['Projects', projects().filter(p => (context === 'all' || p.id === context) && (!ernetFilter.project || p.id === ernetFilter.project)).length, '▤'],
            ['Schools', schoolCount, '◆'],
            ['Target Participants', ernetValue(m.target), '◎'],
            ['Registered Participants', m.registered, '♟'],
            ['Participants Trained', ernetValue(m.completed), '✓'],
            ['Attendance Rate', attendance, '▥'],
            ['Active Batches', counts.Ongoing, '▶'],
            ['Completed Batches', counts.Completed, '✓'],
            ['Upcoming Batches', counts.Upcoming, '◷'],
            ['Assigned Trainers', new Set(bs.map(b => b.trainer).filter(Boolean)).size, '♟']
        ];
        if (role === 'Trainer') return [
            ['Assigned Batches', bs.length, '▤'],
            ['Assigned Trainees', m.registered, '♟'],
            ['Approval Pending', pending, '◷'],
            ['Attendance Rate', attendance, '▥'],
            ['Trainees Attended', m.attended, '✓'],
            ['Trainees Completed', ernetValue(m.completed), '✓'],
            ['Ongoing Batches', counts.Ongoing, '▶'],
            ['Upcoming Batches', counts.Upcoming, '◷'],
            ['Completed Batches', counts.Completed, '✓'],
            ['Linked Resources', new Set(bs.flatMap(b => effectiveLinks(b).map(l => l.resource))).size, '◆']
        ];
        if (role === 'School Admin') return [
            ['Schools in Scope', schoolCount, '◆'],
            ['School Batches', bs.length, '▤'],
            ['Target Participants', ernetValue(m.target), '◎'],
            ['Registered Participants', m.registered, '♟'],
            ['Teachers Trained', ernetValue(m.teachers), '♟'],
            ['Students Trained', ernetValue(m.students), '♟'],
            ['Attendance Rate', attendance, '▥'],
            ['Ongoing Batches', counts.Ongoing, '▶'],
            ['Completed Batches', counts.Completed, '✓'],
            ['Approval Pending', pending, '◷']
        ];
        return base
    }

    function roleKpiCards(nums) {
        return '<div class="ernet-kpis">' + nums.map(([label, value]) => '<div class="kpi"><small>' + esc(label) + '</small><strong>' + esc(value) + '</strong><span class="sponsor-kpi-note">My training</span></div>').join('') + '</div>'
    }
    const visualRoleDashboard = views.dashboard;
    let dashboardRole = '';
    views.dashboard = function() {
        let role = user().role;
        if (dashboardRole !== user().id) {
            ernetFilter = {
                project: '',
                state: '',
                district: '',
                school: '',
                plan: '',
                batch: '',
                from: '',
                to: '',
                type: role === 'ERNET Admin' ? 'Teachers' : 'All',
                status: ''
            };
            dashboardRole = user().id
        }
        if (role !== 'Trainee') return visualRoleDashboard();
        let bs = ernetRows(),
            m = ernetMetrics(bs),
            t = db.trainees.find(t => t.id === user().trainee),
            elig = t ? R.eligibility(t, db) : null,
            resources = new Set(bs.flatMap(b => effectiveLinks(b).filter(l => {
                let r = db.resources.find(r => r.id === l.resource);
                return r && accessible(r, b)
            }).map(l => l.resource))),
            forms = new Set(bs.flatMap(b => effectiveLinks(b).filter(l => {
                let r = db.resources.find(r => r.id === l.resource);
                return r?.formType && accessible(r, b)
            }).map(l => l.resource))),
            submitted = new Set(db.submissions.filter(s => s.trainee === t?.id && forms.has(s.resource)).map(s => s.resource)),
            days = bs.reduce((n, b) => n + Number(R.batchPlan(b, db)?.days || 0), 0),
            present = m.marks.filter(a => a.status === 'Present').length,
            nums = [
                ['My Assigned Batches', bs.length],
                ['Training Days', days],
                ['Present Days', present],
                ['Attendance Rate', m.attendance === null ? 'N/A' : m.attendance.toFixed(1) + '%'],
                ['Trainer Approval', t ? (t.approved ? 'Approved' : 'Pending') : 'Not assigned'],
                ['Completion', elig ? (elig.eligible ? 'Eligible' : 'Pending') : 'Not assigned'],
                ['Available Resources', resources.size],
                ['Assigned Forms', forms.size],
                ['Forms Submitted', submitted.size],
                ['Certificate Previews', m.certified]
            ];
        return '<div class="ernet-dashboard sponsor-reference">' + head('Teacher / Student Dashboard', 'Your training, attendance, learning resources and completion evidence.') + ernetFilters() + roleKpiCards(nums) + '<div class="sponsor-three">' + panel('My Attendance', sponsorTrend(m)) + panel('Training Day Progress', sponsorBarChart(['Required days', 'Present marks'], [{
            values: [days, present],
            color: '#275d8c',
            colors: ['#275d8c', '#f58220']
        }])) + panel('Assessment & Feedback', sponsorBarChart(['Assigned forms', 'Submitted'], [{
            values: [forms.size, submitted.size],
            color: '#275d8c'
        }])) + '</div><div class="sponsor-batch-row">' + panel('My Next Steps', '<div class="actions"><a class="btn" href="resources.html">Learning Resources</a><a class="btn" href="assessments.html">Assessments & Feedback</a><a class="btn" href="attendance.html">My Attendance</a><a class="btn" href="certificates.html">My Certificate</a></div>' + info(elig?.message || 'No training assigned.')) + sponsorBatchStatus(bs) + '</div>' + panel('My Training Details', bs.map(b => '<article class="batch-drill-cards"><div><h3>' + esc(b.code) + '</h3><p>' + esc(R.batchPlan(b, db)?.name || '—') + '</p><p>' + esc(lookup(db.schools, b.school)) + ' · ' + esc(lookup(db.trainers, b.trainer)) + '</p><p>' + esc(b.start) + ' → ' + esc(b.end) + '</p></div></article>').join('') || info('No training assigned.')) + '<p class="ernet-caption">SAMPLE DATA · Only your own learner records. Attendance rate uses recorded marks; unmarked days are not assumed absent.</p></div>'
    };


    /* ERNET feedback revision: monitoring, persistent school cohorts and evidence-based hours. */
    function ernetSchoolScope() {
        let ps = projects().filter(p => context === 'all' || p.id === context);
        return db.schools.filter(s => ps.some(p => s.project === p.id || (s.projects || []).includes(p.id) || db.batches.some(b => b.school === s.id && b.project === p.id)))
    }

    function schoolCohorts() {
        db.schoolCohorts ||= [];
        for (let p of projects())
            for (let school of ernetSchoolScope().filter(s => s.project === p.id || (s.projects || []).includes(p.id) || db.batches.some(b => b.school === s.id && b.project === p.id))) {
                if (!db.schoolCohorts.some(c => c.project === p.id && c.school === school.id)) db.schoolCohorts.push({
                    id: uid('COHORT'),
                    code: 'SB-' + p.code + '-' + school.id,
                    project: p.id,
                    school: school.id
                });
            }
        return db.schoolCohorts.filter(c => projects().some(p => p.id === c.project) && (context === 'all' || c.project === context))
    }

    function ernetSchoolRows() {
        return ernetSchoolScope().filter(s => (!ernetFilter.project || s.project === ernetFilter.project || (s.projects || []).includes(ernetFilter.project) || db.batches.some(b => b.school === s.id && b.project === ernetFilter.project)) && (!ernetFilter.state || s.state === ernetFilter.state) && (!ernetFilter.district || s.district === ernetFilter.district) && (!ernetFilter.school || s.id === ernetFilter.school))
    }

    function teacherHours(t, bs) {
        let ids = new Set(bs.map(b => b.id)),
            teacherIds = new Set(db.trainees.filter(x => x.id === t.id || (t.mobile && x.mobile === t.mobile)).map(x => x.id)),
            seen = new Set(),
            total = 0,
            missing = 0;
        for (let a of db.attendance.filter(a => teacherIds.has(a.trainee) && ids.has(a.batch) && a.status === 'Present' && a.date <= today && (!ernetFilter.from || a.date >= ernetFilter.from) && (!ernetFilter.to || a.date <= ernetFilter.to))) {
            let key = a.batch + '|' + a.date;
            if (seen.has(key)) continue;
            seen.add(key);
            let b = bs.find(b => b.id === a.batch),
                value = a.hours ?? b.dailyTrainingHours;
            if (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 24) missing++;
            else total += Number(value)
        }
        return {
            total,
            missing,
            days: seen.size
        }
    }

    function hoursLabel(t, bs) {
        let h = teacherHours(t, bs);
        return h.total.toFixed(1) + ' h' + (h.missing ? ' · ' + h.missing + ' day(s) duration pending' : '')
    }

    function ernetTeachers(bs) {
        let ids = new Set(bs.map(b => b.id));
        return db.trainees.filter(t => ids.has(t.batch) && ernetType(t) === 'Teachers')
    }

    function ernetHoursView(bs) {
        return info('Completed hours = sum of recorded duration for Present training days through today. Absent days add zero. Missing duration remains pending; no default hours are assumed.') + table(['Teacher ID', 'Teacher', 'State', 'School', 'Completed training hours'], ernetTeachers(bs).filter((t, i, arr) => arr.findIndex(x => (x.mobile || x.id) === (t.mobile || t.id)) === i).map(t => {
            let b = bs.find(b => b.id === t.batch),
                s = db.schools.find(s => s.id === b.school) || {};
            return [esc(t.id), esc(t.name), esc(s.state), esc(s.name), esc(hoursLabel(t, bs))]
        }))
    }

    function ernetCertRecords(bs) {
        let ids = new Set(bs.map(b => b.id)),
            ts = db.trainees.filter(t => ids.has(t.batch) && (ernetFilter.type === 'All' || ernetType(t) === ernetFilter.type)),
            out = new Map();
        for (let c of [...(db.certificateRecords || []), ...(db.certificates || [])]) {
            let t = ts.find(t => t.id === c.trainee);
            if (!t || c.batch && !ids.has(c.batch)) continue;
            let date = c.completionDate || c.date;
            if ((ernetFilter.from && (!date || date < ernetFilter.from)) || (ernetFilter.to && (!date || date > ernetFilter.to))) continue;
            let key = c.number || c.id || t.id;
            if (!out.has(key)) out.set(key, {
                ...c,
                batch: c.batch || t.batch
            })
        }
        return [...out.values()]
    }

    function ernetCertification(bs) {
        let records = ernetCertRecords(bs),
            schools = db.schools.filter(s => bs.some(b => b.school === s.id)),
            states = [...new Set(schools.map(s => s.state))].sort(),
            count = ss => records.filter(c => bs.some(b => b.id === c.batch && ss.some(s => s.id === b.school))).length;
        return '<div class="ernet-cert-summary"><h3>' + records.length + ' certifications in filtered scope</h3></div><p class="ernet-caption">Select a State, then a District to view school-wise certifications.</p>' + states.map(state => {
            let ss = schools.filter(s => s.state === state),
                districts = [...new Set(ss.map(s => s.district || 'District not specified'))].sort();
            return '<details class="ernet-cert-drill"><summary>' + esc(state) + ' <span class="badge">' + count(ss) + ' certifications</span></summary>' + districts.map(district => {
                let ds = ss.filter(s => (s.district || 'District not specified') === district);
                return '<details class="ernet-cert-drill"><summary>' + esc(district) + ' <span class="badge">' + count(ds) + ' certifications</span></summary>' + table(['School', 'Certifications'], ds.map(s => [esc(s.name), count([s])])) + '</details>'
            }).join('') + '</details>'
        }).join('') + (states.length ? '' : '<div class="empty">No schools in the selected scope.</div>')
    }

    function ernetTargets() {
        let schools = ernetSchoolRows(),
            states = [...new Set(schools.map(s => s.state))];
        return info('Overall programme targets: Teachers 7,500 · Students 75,000. State teacher target = unique schools × 10. Student state targets are not specified. State totals are not forced to match the programme target.') + table(['State', 'Schools in scope', 'Teacher target (schools × 10)', 'Student target'], states.map(state => {
            let n = schools.filter(s => s.state === state).length;
            return [esc(state), n, n * 10, 'Not configured']
        }))
    }
    const feedbackPriorMetrics = ernetMetrics;
    ernetMetrics = function(bs, type = ernetFilter.type) {
        let m = feedbackPriorMetrics(bs, type);
        if (user().role !== 'ERNET Admin') return m;
        m.target = type === 'Students' ? 75000 : 7500;
        m.certified = ernetCertRecords(bs).length;
        return m
    };
    const feedbackPriorProgress = ernetProgress;
    ernetProgress = function(m) {
        if (user().role !== 'ERNET Admin') return feedbackPriorProgress(m);
        return ['Planned', 'Enrolled', 'Attended', 'Completed', 'Certified'].map((label, i) => {
            let v = [m.target, m.registered, m.attended, m.completed, m.certified][i];
            return '<div class="ernet-progress-row"><strong>' + label + '</strong><div class="ernet-track"><span style="width:' + (m.target && v !== null ? Math.min(100, 100 * v / m.target) : 0) + '%"></span></div><span>' + ernetValue(v) + '</span><small>' + ernetPct(v, m.target) + '</small></div>'
        }).join('')
    };
    const feedbackPriorDashboard = views.dashboard;
    views.dashboard = function() {
        schoolCohorts();
        let html = feedbackPriorDashboard();
        if (user().role !== 'ERNET Admin') return html;
        let bs = ernetRows(),
            m = ernetMetrics(bs);
        html = html.replace('Targets use capacity fallback', 'Programme targets by participant type').replace('<small>Target Participants</small>', '<small>Target Participants — ' + esc(ernetFilter.type) + '</small>');
        return html + panel('Programme and State Targets', ernetTargets()) + panel('Teacher-wise Completed Training Hours', ernetHoursView(bs)) + panel('Certifications — Overall, State, District and School', ernetCertification(bs))
    };
    let ernetPlanning = {
        state: '',
        from: '',
        to: ''
    };

    function ernetPlanningRows() {
        return batches().filter(b => {
            let s = db.schools.find(s => s.id === b.school);
            return (!ernetPlanning.state || s?.state === ernetPlanning.state) && (!ernetPlanning.from || b.end >= ernetPlanning.from) && (!ernetPlanning.to || b.start <= ernetPlanning.to)
        })
    }

    function cohortView() {
        let rows = schoolCohorts().filter(c => !ernetPlanning.state || db.schools.find(s => s.id === c.school)?.state === ernetPlanning.state);
        return info('Each school has a persistent project batch (cohort) throughout the current project period. Dated training batches are delivery sessions within that cohort; their original dates and attendance remain intact.') + table(['School batch code', 'State', 'School', 'Project period', 'Delivery batches'], rows.map(c => {
            let p = db.projects.find(p => p.id === c.project),
                s = db.schools.find(s => s.id === c.school);
            return [esc(c.code), esc(s?.state), esc(s?.name), esc(p.start) + ' → ' + esc(p.end), db.batches.filter(b => b.project === c.project && b.school === c.school).map(b => esc(b.code)).join(', ') || 'Planning pending']
        }))
    }
    const feedbackPriorBatches = views.batches;
    views.batches = function() {
        if (user().role !== 'ERNET Admin') return feedbackPriorBatches();
        let states = [...new Set(ernetSchoolScope().map(s => s.state))],
            invalid = ernetPlanning.from && ernetPlanning.to && ernetPlanning.from > ernetPlanning.to;
        return head('Batch-wise Planning', 'Monitor school batches and dated training sessions.') + '<div class="toolbar"><label>State<select data-ernet-planning="state"><option value="">All</option>' + states.map(s => '<option ' + (ernetPlanning.state === s ? 'selected' : '') + '>' + esc(s) + '</option>').join('') + '</select></label><label>From Date<input type="date" data-ernet-planning="from" value="' + esc(ernetPlanning.from) + '"></label><label>To Date<input type="date" data-ernet-planning="to" value="' + esc(ernetPlanning.to) + '"></label></div>' + panel('School Batch Continuity', cohortView()) + panel('Training Delivery Planning', invalid ? info('From Date must not be after To Date.', true) : table(['Batch', 'State', 'School', 'Training Plan', 'Trainer', 'From', 'To', 'Status'], ernetPlanningRows().map(b => [esc(b.code), esc(lookup(db.schools, b.school, 'state')), esc(lookup(db.schools, b.school)), esc(R.batchPlan(b, db)?.name), esc(lookup(db.trainers, b.trainer)), esc(b.start), esc(b.end), esc(status(b))])))
    };
    const feedbackPriorTrainees = views.trainees;
    views.trainees = function() {
        if (user().role !== 'ERNET Admin') return feedbackPriorTrainees();
        return head('Teacher Data', 'Read-only teacher training records; ERNET has no approval workflow.') + panel('Teacher-wise Training Hours', ernetHoursView(batches()))
    };

    function ernetFeedbackAnalysis() {
        let bs = batches(),
            teachers = ernetTeachers(bs),
            rows = db.submissions.filter(x => teachers.some(t => t.id === x.trainee) && db.resources.find(r => r.id === x.resource)?.formType === 'Feedback'),
            schools = db.schools.filter(s => bs.some(b => b.school === s.id)),
            states = [...new Set(schools.map(s => s.state))],
            count = ss => rows.filter(r => {
                let t = teachers.find(t => t.id === r.trainee),
                    b = bs.find(b => b.id === t.batch);
                return ss.some(s => s.id === b.school)
            }).length;
        return panel('State-level Feedback', table(['State', 'Responses'], states.map(state => [esc(state), count(schools.filter(s => s.state === state))]))) + panel('School-level Feedback', table(['State', 'School', 'Responses'], schools.map(s => [esc(s.state), esc(s.name), count([s])]))) + panel('Teacher-level Feedback', table(['Teacher', 'State', 'School', 'Form', 'Date', 'Feedback'], rows.map(r => {
            let t = teachers.find(t => t.id === r.trainee),
                b = bs.find(b => b.id === t.batch),
                s = db.schools.find(s => s.id === b.school);
            return [esc(t.name), esc(s?.state), esc(s?.name), esc(lookup(db.resources, r.resource)), esc(r.date), esc(r.answer)]
        }))) + info('Analysis reports response counts and the submitted comments. No satisfaction score is inferred from free text; a rated form is required for numeric satisfaction analysis.')
    }
    const feedbackPriorAssessments = views.assessments;
    views.assessments = function() {
        if (user().role !== 'ERNET Admin') return feedbackPriorAssessments();
        return head('Assessment & Feedback Analysis', 'State, school and teacher evidence within assigned projects.') + ernetFeedbackAnalysis() + panel('Assessment Results', table(['Teacher', 'School', 'Assessment', 'Date', 'Score'], db.submissions.filter(r => trainees().some(t => t.id === r.trainee) && db.resources.find(x => x.id === r.resource)?.formType === 'Assessment').map(r => {
            let t = trainees().find(t => t.id === r.trainee),
                b = batches().find(b => b.id === t.batch);
            return [esc(t.name), esc(lookup(db.schools, b.school)), esc(lookup(db.resources, r.resource)), esc(r.date), r.score === null ? 'Pending' : esc(r.score) + '%']
        })))
    };
    const feedbackPriorHeader = syncHeader;
    syncHeader = function() {
        feedbackPriorHeader();
        if (user().role === 'ERNET Admin') $id('nav').innerHTML = $id('nav').innerHTML.replace('Trainees & approval', 'Teacher Data')
    };
    const feedbackPriorAct = act;
    act = async function(action, id) {
        if (user().role === 'ERNET Admin' && ['approve', 'approveList', 'closeBatch', 'enableRegistration', 'closeRegistration', 'importTrainees', 'copyLink', 'openRegistrationPage', 'addPlan', 'editPlan'].includes(action)) return deny();
        return feedbackPriorAct(action, id)
    };
    document.addEventListener('change', e => {
        if (e.target.dataset?.ernetPlanning && user().role === 'ERNET Admin') {
            ernetPlanning[e.target.dataset.ernetPlanning] = e.target.value;
            render()
        }
        if (e.target.dataset?.trainingHours) {
            let b = batches().find(b => b.id === e.target.dataset.trainingHours),
                value = Number(e.target.value);
            if (!canBatch(b) || !Number.isFinite(value) || value <= 0 || value > 24) return message('Authorized users may record a duration greater than 0 and at most 24 hours.', true);
            commit(() => {
                let old = b.dailyTrainingHours;
                b.dailyTrainingHours = value;
                audit('Daily training duration set', b.id, old, value, b.project)
            }, 'Training duration saved.');
            render()
        }
    });
    const feedbackPriorBatchArea = renderBatchArea;
    renderBatchArea = function(b) {
        feedbackPriorBatchArea(b);
        if (b && current === 'attendance' && canAttendance(b)) $id('batchArea').innerHTML += '<label>Recorded hours per Present training day (batch)<input type="number" min="0.01" max="24" step="0.25" data-training-hours="' + esc(b.id) + '" value="' + esc(b.dailyTrainingHours || '') + '"></label><p>Enter the delivered daily duration; leave blank when not known. Attendance-specific hours take precedence.</p>'
    };
    window.ERNETFeedback = {
        teacherHours,
        ernetCertRecords,
        ernetTargets,
        ernetSchoolRows,
        schoolCohorts,
        ernetPlanningRows,
        setPlanning: v => ernetPlanning = {
            ...ernetPlanning,
            ...v
        }
    };

    if (!db.resources.some(r => r.id === 'TEACHER-FEEDBACK-SAMPLE')) {
        db.resources.push({
            id: 'TEACHER-FEEDBACK-SAMPLE',
            name: 'Teacher Training Feedback — Smart Classroom',
            type: 'Form',
            formType: 'Feedback',
            formPurpose: 'Daily/periodic feedback',
            feedbackTemplate: 'teacher-training-20',
            question: 'Smart Classroom / Digital Classroom Training',
            common: true,
            uploadedBy: 'A1',
            created: '2019-01-01T00:00:00Z'
        });
        if (db.plans.some(p => p.id === 'PL1')) db.links.push({
            id: 'TEACHER-FEEDBACK-PLAN',
            plan: 'PL1',
            resource: 'TEACHER-FEEDBACK-SAMPLE',
            days: [],
            wholePlan: true,
            applyExisting: true,
            created: '2019-01-01T00:00:00Z'
        });
    }
    $id('persona').addEventListener('change', e => {
        if (window.DemoAuth?.session()?.mode === 'login' || window.DemoAuth?.publicGuest) {
            render();
            return
        }
        active = e.target.value;
        window.DemoAuth?.useDemo(active);
        sessionStorage.setItem('reviewPersona', active);
        context = 'all';
        sessionStorage.removeItem('reviewBatch');
        activity('Demo entry', 'Persona selected');
        render()
    });
    $id('projectContext').addEventListener('change', e => {
        context = e.target.value;
        sessionStorage.removeItem('reviewBatch');
        render()
    });
    $id('menu').addEventListener('click', () => {
        $id('sidebar').classList.toggle('open');
        $id('menu').setAttribute('aria-expanded', $id('sidebar').classList.contains('open'))
    });
    $id('cancelDialog').addEventListener('click', closeModal);
    $id('editor').addEventListener('close', () => {
        stage = null;
        dialogForm = null
    });
    $id('signout').addEventListener('click', () => {
        activity('Logout', 'Session ended');
        window.DemoAuth?.logout();
        sessionStorage.removeItem('reviewPersona');
        sessionStorage.removeItem('reviewBatch');
        otpChallenge = null;
        location.href = 'login.html?loggedout=1'
    });
    window.addEventListener('popstate', () => {
        otpChallenge = null;
        if ($id('editor').open) closeModal();
        render();
        $id('main').focus()
    });
    bind();
    active = window.DemoAuth?.session()?.userId || (window.DemoAuth && document.body.dataset.page === 'registration' ? 'A6' : sessionStorage.getItem('reviewPersona') || 'A1');
    if (!db.users.some(u => u.id === active)) active = 'A1';
    render();
    try {
        localStorage.setItem(KEY, JSON.stringify(db))
    } catch (e) {
        message('Browser storage is blocked. Data is available only in memory; saves will show failures.', true)
    }
    if (!window.jQuery) {
        let banner = document.createElement('div');
        banner.className = 'info warning';
        banner.textContent = 'CDN unavailable: core native interactions remain active. Bootstrap 5.3.8 and jQuery 4.0.0 are pinned; run the asset setup to vendor them locally.';
        $id('main').append(banner)
    }
    window.TrainingReview = {
        getData: () => structuredClone(db),
        getScope: () => ({
            projects: projects(),
            batches: batches(),
            trainees: trainees()
        }),
        render
    };
})();
