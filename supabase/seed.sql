-- ============================================================
--  Prosenjit Mondol — Portfolio CMS Seed Data
--  File: supabase/seed.sql
--  Run AFTER schema.sql in the Supabase SQL editor.
--  Source: chatbot-knowledge.js + index.html
-- ============================================================

-- ── ABOUT (1 row) ──────────────────────────────────────────
INSERT INTO about (
  name, nickname, title, bio, open_to,
  cgpa, credits_completed, honor,
  lab_role, lab_affiliation, lab_url,
  email, phone, portfolio_url
) VALUES (
  'Prosenjit Mondol',
  'Prosen',
  'B.Sc. CSE Student & Research Assistant',
  'Prosenjit Mondol is a B.Sc. Computer Science and Engineering student at Patuakhali Science & Technology University (PSTU), Bangladesh, currently on the Dean''s List with a CGPA of 3.656/4.00. He serves as a Research Assistant & Lab Systems Coordinator at the Computation Informatics & Machine Intelligence Lab (CIMILab), University of Missouri, USA (Remote), where he works on next-generation machine intelligence and computational systems for data-driven insights, intelligent decision-making, and real-world impact.',
  'Research collaborations and opportunities in AI in Health, Health Informatics, HCI, Machine Learning, Image Processing, Computer Vision, and related areas.',
  '3.656 / 4.00',
  '126.5 / 165',
  'Dean''s List',
  'Research Assistant & Lab Systems Coordinator (Remote)',
  'Computation Informatics & Machine Intelligence Lab (CIMILab), University of Missouri, USA',
  'https://pronad1.github.io/CIMILab/index.html',
  'prosenjit1156@gmail.com',
  '+880 1315747034',
  'https://pronad1.github.io/Personal-Portfolio/'
) ON CONFLICT DO NOTHING;

-- ── NEWS (10 rows) ─────────────────────────────────────────
INSERT INTO news (date, title, content, display_order) VALUES
(
  'Sep 2026',
  'Physically Presented at MICCAI 2026 — Strasbourg, France',
  'Paper presented at the 3rd MiRASOL Workshop, MICCAI 2026 through the MICCAI Ambassador Program. Prof. Dr. Pamela Guevara personally presented our poster.',
  1
),
(
  'Aug 2026',
  'IEEE Xplore Paper Published — Bangla License Plate OCR',
  'Paper ''A Deep Learning Approach to Bangla License Plate Text Extraction using Easy OCR'' (ICPECCII 2026) is now available on IEEE Xplore.',
  2
),
(
  'Aug 2026',
  'Paper Accepted at MIRASOL Workshop, MICCAI 2026',
  'Paper ''A Sensitivity-Gated Cascade for Compute-Efficient Spinal Lesion Detection'' accepted at MIRASOL Workshop, MICCAI 2026.',
  3
),
(
  'Sep 2026',
  'Rank #1 — Global Live Leaderboard, Glucose Prediction Challenge',
  'Secured Rank #1 on the Global Live Leaderboard in the Glucose Prediction Challenge (MetaboNet Consortium — Stanford, Harvard, UCSB, Pavia, etc.).',
  4
),
(
  'Aug 2026',
  'Participated in PSTU IT Carnival 2026 Hackathon',
  'Participated in the Hackathon at PSTU IT Carnival 2026.',
  5
),
(
  '2026',
  'DSANet Paper Submitted to ICECE 2026, BUET',
  'DSANet paper submitted at ICECE 2026, BUET (First Author, Under Review).',
  6
),
(
  '2025',
  'First Prize — PSTU IT Carnival (NeuroVision AI)',
  'Won First Prize at PSTU IT Carnival for the NeuroVision AI project.',
  7
),
(
  '2025',
  'Top 5 — PSTU Programming Contest 2025',
  'Ranked Top 5 out of 50 teams at PSTU Programming Contest 2025.',
  8
),
(
  'Aug 2025',
  'Started Role at CIMILab, University of Missouri, USA',
  'Started role as Research Assistant & Lab Systems Coordinator at CIMILab, University of Missouri, USA.',
  9
),
(
  'Feb 2023',
  'Enrolled in B.Sc. CSE at PSTU',
  'Enrolled in B.Sc. CSE at PSTU. Currently on Dean''s List with CGPA 3.656/4.00.',
  10
)
ON CONFLICT DO NOTHING;

-- ── EXPERIENCE (1 row) ─────────────────────────────────────
INSERT INTO experience (
  role, organization, org_url, location,
  period_start, period_end, description, display_order
) VALUES (
  'Research Assistant & Lab Systems Coordinator',
  'Computation Informatics & Machine Intelligence Lab (CIMILab)',
  'https://pronad1.github.io/CIMILab/index.html',
  'University of Missouri, USA (Remote)',
  'August 2025',
  'Present',
  'Working on next-generation machine intelligence and computational systems for data-driven insights, intelligent decision-making, and real-world impact. Contributing to research in AI in Health, Medical Image Analysis, and computational informatics.',
  1
) ON CONFLICT DO NOTHING;

-- ── EDUCATION (3 rows) ─────────────────────────────────────
INSERT INTO education (
  degree, institution, inst_url, location,
  period, gpa, honor, display_order
) VALUES
(
  'B.Sc. in Computer Science and Engineering',
  'Patuakhali Science & Technology University (PSTU)',
  'https://pstu.ac.bd',
  'Patuakhali, Bangladesh',
  'February 2023 – Present',
  '3.656 / 4.00',
  'Dean''s List',
  1
),
(
  'Higher Secondary Certificate (HSC) — Science',
  'Naogaon Govt. College',
  NULL,
  'Naogaon, Bangladesh',
  '2019 – 2021',
  '5.00 / 5.00',
  NULL,
  2
),
(
  'Secondary School Certificate (SSC) — Science',
  'Chakatitha High School',
  NULL,
  'Bangladesh',
  '2017 – 2019',
  '5.00 / 5.00',
  NULL,
  3
)
ON CONFLICT DO NOTHING;

-- ── PUBLICATIONS (3 rows) ──────────────────────────────────
INSERT INTO publications (
  title, venue, status, publisher, url,
  author_position, poster_url, notes, year,
  openreview_url, display_order
) VALUES
(
  'A Deep Learning Approach to Bangla License Plate Text Extraction using Easy OCR',
  'International Conference on Power, Electronics, Communications, Computing, and Intelligent Infrastructure (ICPECCII 2026)',
  'Published',
  'IEEE Xplore (2026)',
  'https://ieeexplore.ieee.org/document/11662050',
  'Co-author',
  NULL,
  'Published on IEEE Xplore in 2026. Presented at ICPECCII 2026.',
  2026,
  NULL,
  1
),
(
  'A Sensitivity-Gated Cascade for Compute-Efficient Spinal Lesion Detection in Resource-Constrained Settings',
  '3rd Medical Image Computing in Resource-Constrained Settings Workshop & Knowledge Interchange (MIRASOL), MICCAI 2026, Strasbourg, France',
  'Physically Presented',
  NULL,
  NULL,
  'First Author (2026)',
  'acheivement/[Prosenjit Mondol]_[74]_[MIRASOL]_poster.pdf',
  'Physically presented at MICCAI 2026 in Strasbourg, France, through the MICCAI Ambassador Program. Prof. Dr. Pamela Guevara personally carried and presented our poster at the on-site poster session. This is a landmark achievement for Prosenjit as an undergraduate researcher.',
  2026,
  'https://openreview.net/profile?id=%7EProsenjit_Mondol1',
  2
),
(
  'DSANet: A Grid-Search Optimized Heterogeneous Ensemble for Ischemic Stroke Lesion Segmentation',
  '14th International Conference on Electrical and Computer Engineering (ICECE 2026), BUET, Dhaka, Bangladesh',
  'Under Review',
  NULL,
  NULL,
  'First Author (2026)',
  NULL,
  'Submitted to ICECE 2026 at BUET. Currently under review as of November 2026.',
  2026,
  NULL,
  3
)
ON CONFLICT DO NOTHING;

-- ── PROJECTS (7 rows) ──────────────────────────────────────
INSERT INTO projects (
  name, icon, description, tags,
  github_url, demo_url, live_url,
  awards, status, display_order
) VALUES
(
  'NeuroVision AI',
  '🧠',
  'A cutting-edge medical imaging platform for diagnosing neurological and cardiovascular conditions using advanced deep learning. Integrates brain, spine, heart, and chest imaging pipelines with lesion detection, segmentation, Grad-CAM explainability, and enterprise-grade security.',
  ARRAY['PyTorch', 'Deep Learning', 'Medical AI', 'Grad-CAM'],
  'https://github.com/pronad1/NeuroVision',
  NULL,
  NULL,
  'First Prize at PSTU IT Carnival 2025',
  'published',
  1
),
(
  'TrashBot',
  '🤖',
  'AI-powered smart waste management system using Raspberry Pi 3B, computer vision, and IoT. Features YOLO-based real-time waste detection, deep learning classification, live web monitoring, and remote tracking for smart city applications.',
  ARRAY['YOLO', 'IoT', 'Raspberry Pi', 'OpenCV'],
  'https://github.com/pronad1/TrashBot',
  'https://youtube.com/shorts/o1WTMZHI7-w',
  NULL,
  NULL,
  'published',
  2
),
(
  'ReuseHub',
  '♻️',
  'Community-driven sustainability platform built with Flutter 3.x and Firebase. Connects donors with seekers of reusable goods, facilitating a circular economy and reducing waste at a production-ready scale.',
  ARRAY['Flutter', 'Firebase', 'Dart', 'Mobile'],
  'https://github.com/pronad1/Flutter/tree/main/software',
  'https://youtu.be/6uswFRk_Srs',
  NULL,
  NULL,
  'published',
  3
),
(
  'Graph Craft',
  '🕸️',
  'Web-based tool for visualizing and analyzing graphs interactively. Users input adjacency matrices and instantly see graph visualizations alongside analysis results including traversals and shortest paths.',
  ARRAY['JavaScript', 'Algorithms', 'Data Structures', 'Web'],
  'https://github.com/pronad1/Graph-Visualizations',
  NULL,
  'https://pronad1.github.io/Graph-Visualizations/',
  NULL,
  'published',
  4
),
(
  'Smart Vacuum Cleaner',
  '🧹',
  'Autonomous floor-cleaning robot built on Arduino UNO. Uses ultrasonic sensors for obstacle detection and avoidance, enabling fully automated navigation and floor cleaning without human intervention.',
  ARRAY['Arduino', 'Robotics', 'IoT', 'Sensors'],
  'https://github.com/Prosenjit-Mondol/Ardiuno_UNO_Project',
  'https://www.youtube.com/watch?v=nY7cTv8nreg',
  NULL,
  NULL,
  'published',
  5
),
(
  'Job Portal',
  '💼',
  'Dynamic job portal connecting job seekers with employers. Features job posting, user authentication, application management, and advanced search functionality using PHP, MySQL, HTML, and JavaScript.',
  ARRAY['PHP', 'MySQL', 'Laravel', 'Web'],
  'https://github.com/pronad1/Web-Project',
  NULL,
  NULL,
  NULL,
  'published',
  6
),
(
  'Blood Bank Project',
  '🩸',
  'Java-based Blood Bank Management System designed to manage and streamline the process of blood donation and distribution. Maintains donor records, blood inventory, and blood requests from hospitals and healthcare institutions.',
  ARRAY['Java', 'OOP', 'Management System', 'Healthcare'],
  'https://github.com/pronad1/Blood_Bank_Project',
  NULL,
  NULL,
  NULL,
  'published',
  7
)
ON CONFLICT DO NOTHING;

-- ── SKILLS (6 rows) ────────────────────────────────────────
INSERT INTO skills (category, items, display_order) VALUES
(
  'languages',
  ARRAY['Python', 'C++', 'R', 'Java', 'JavaScript', 'PHP', 'C#', 'Dart', 'C', 'HTML/CSS'],
  1
),
(
  'mlFrameworks',
  ARRAY['PyTorch', 'TensorFlow', 'Keras', 'Scikit-learn', 'OpenCV', 'Pandas', 'NumPy'],
  2
),
(
  'visualization',
  ARRAY['Matplotlib', 'Seaborn', 'Plotly'],
  3
),
(
  'databases',
  ARRAY['MySQL', 'Oracle', 'SQL Server', 'Firebase'],
  4
),
(
  'backendMobile',
  ARRAY['Laravel', 'Flutter', '.NET', 'REST APIs'],
  5
),
(
  'tools',
  ARRAY['Git', 'LaTeX', 'Jupyter', 'VS Code', 'Android Studio', 'Kaggle', 'Raspberry Pi', 'Arduino'],
  6
)
ON CONFLICT DO NOTHING;

-- ── AWARDS (9 rows) ────────────────────────────────────────
INSERT INTO awards (title, description, year, url, display_order) VALUES
(
  'PSTU Dean''s Merit Award',
  'Awarded for academic excellence — ranked among the top students in a cohort of 84 at Patuakhali Science & Technology University.',
  NULL,
  NULL,
  1
),
(
  'Rank #1 — Global Live Leaderboard, Glucose Prediction Challenge',
  'Secured Rank #1 on the Global Live Leaderboard in the Glucose Prediction Challenge (MetaboNet Consortium — Stanford, Harvard, UCSB, Pavia, etc.) with team team02w.',
  2026,
  'https://metabonetglucose-leaderboard.hf.space/',
  2
),
(
  'First Prize — PSTU IT Carnival (NeuroVision AI Project)',
  'Won First Prize at PSTU IT Carnival 2025 for the NeuroVision AI medical imaging project.',
  2025,
  NULL,
  3
),
(
  'Aungkur Scholarship — PSTU',
  'Merit-based scholarship awarded by Patuakhali Science & Technology University to outstanding students demonstrating exceptional academic performance.',
  NULL,
  NULL,
  4
),
(
  'Grameen Bank Scholarship',
  'Scholarship awarded by Grameen Bank in recognition of outstanding SSC (2019) results.',
  2019,
  NULL,
  5
),
(
  'MOUSUMI NGO Scholarship',
  'Scholarship awarded by MOUSUMI NGO in recognition of outstanding HSC (2021) results.',
  2021,
  NULL,
  6
),
(
  'Government Board Merit Scholarship (HSC & SSC)',
  'Government merit scholarships for outstanding results in both HSC (2021) and SSC (2019) examinations.',
  NULL,
  NULL,
  7
),
(
  'PSTU Programming Contest — Top 5',
  'Ranked in the top 5 out of 50 teams at the PSTU Programming Contest 2025.',
  2025,
  NULL,
  8
),
(
  'ICPC 2023 Asia Dhaka Preliminary — Honourable Mention',
  'Received Honourable Mention at the ICPC 2023 Asia Dhaka Preliminary contest.',
  2023,
  NULL,
  9
)
ON CONFLICT DO NOTHING;

-- ── CERTIFICATES (17 rows) ─────────────────────────────────
INSERT INTO certificates (label, file_url, type, display_order) VALUES
('MICCAI 2026 (MIRASOL Workshop) — Research Presentation Poster', NULL, 'conference', 1),
('ICPC 2023 Asia Dhaka Preliminary — Honourable Mention', NULL, 'competitive', 2),
('ICPC Recommended Certificate', NULL, 'competitive', 3),
('AI Oracle Certificate', NULL, 'ai', 4),
('CISCO — Introduction to Modern AI', NULL, 'cisco', 5),
('CISCO — Packet Tracer Learner Transcript', NULL, 'cisco', 6),
('MySQL Certificate', NULL, 'database', 7),
('Modern AI Certificate', NULL, 'ai', 8),
('Flutter Development Certificate', NULL, 'development', 9),
('AutoCAD Certificate', NULL, 'design', 10),
('Communication Certificate', NULL, 'soft-skill', 11),
('Cyber Security Introduction Certificate', NULL, 'security', 12),
('Data Science Certificate', NULL, 'data', 13),
('Microsoft Edge Certificate', NULL, 'microsoft', 14),
('JavaScript Intermediate — HackerRank', NULL, 'programming', 15),
('Microsoft Azure Certificate', NULL, 'microsoft', 16),
('Problem Solving Intermediate — HackerRank', NULL, 'competitive', 17)
ON CONFLICT DO NOTHING;

-- ── COMPETITIVE PROGRAMMING (4 rows) ───────────────────────
INSERT INTO competitive_programming (platform, handle, url, display_order) VALUES
('Codeforces', 'prosenjit_mondol', 'https://codeforces.com/profile/prosenjit_mondol', 1),
('HackerRank', 'prosenjit1156', 'https://www.hackerrank.com/profile/prosenjit1156', 2),
('LeetCode', 'prosenjit_mondol', 'https://leetcode.com/u/prosenjit_mondol/', 3),
('Beecrowd', 'Prosenjit', 'https://judge.beecrowd.com/en/profile/793803', 4)
ON CONFLICT DO NOTHING;

-- ── CP META (1 row) ────────────────────────────────────────
INSERT INTO cp_meta (
  problems_solved,
  nasa_team, nasa_role, nasa_project,
  nasa_location, nasa_track
) VALUES (
  '1,500+',
  'PSTU_CLITECH',
  'Programmer / Lead Developer',
  'Clitech — an intelligent weather risk intelligence app that transforms real-time NASA Earth Observation satellite data into personalized, actionable guidance for outdoor activities.',
  'Local Event: Barisal',
  '"Will It Rain On My Parade?" — Earth Science Division'
) ON CONFLICT DO NOTHING;

-- ── CONTESTS (3 rows) ──────────────────────────────────────
INSERT INTO contests (name, display_order) VALUES
('ICPC Dhaka Regional Preliminary (2023–2025)', 1),
('BitFest KUET (2024)', 2),
('PSTU IT Carnival Hackathon (2026)', 3)
ON CONFLICT DO NOTHING;

-- ── COURSEWORK (4 rows) ────────────────────────────────────
INSERT INTO coursework (category, courses, display_order) VALUES
(
  'computerScience',
  ARRAY[
    'Data Structure & Algorithms', 'Artificial Intelligence', 'Software Engineering',
    'Database Systems', 'Compiler Design & Automata', 'Algorithm Engineering',
    'Data Warehousing & Mining', 'Numerical Methods', 'Discrete Mathematics', 'VLSI Design'
  ],
  1
),
(
  'signalNetworks',
  ARRAY[
    'Data Communication Engineering', 'Optical Fiber Communication',
    'Computer Networks', 'Network Routing & Switching'
  ],
  2
),
(
  'mathematics',
  ARRAY[
    'Differential & Integral Calculus', 'Co-ordinate Geometry & Linear Algebra',
    'Statistics', 'Vector Analysis & Complex Variables', 'ODE & PDE'
  ],
  3
),
(
  'electricalElectronics',
  ARRAY[
    'Basic Electrical Engineering', 'Digital Logic Design',
    'Microprocessor & Interfacing', 'Electrical Technology'
  ],
  4
)
ON CONFLICT DO NOTHING;

-- ── CONTACT PROFILES (15 rows) ─────────────────────────────
INSERT INTO contact_profiles (platform, label, url, handle, icon, color, display_order) VALUES
('github',       'GitHub',         'https://github.com/pronad1',                                                                 'pronad1',               'fa-brands fa-github',          '#24292e', 1),
('linkedin',     'LinkedIn',       'https://www.linkedin.com/in/prosenjit-mondol-615342266/',                                    'prosenjit-mondol',      'fa-brands fa-linkedin',         '#0a66c2', 2),
('kaggle',       'Kaggle',         'https://www.kaggle.com/prosenjitmondol',                                                     'prosenjitmondol',       'fa-brands fa-kaggle',           '#20beff', 3),
('huggingface',  'Hugging Face',   'https://huggingface.co/prosenjit1156',                                                       'prosenjit1156',         'fa-solid fa-robot',             '#ff9d00', 4),
('researchgate', 'ResearchGate',   'https://www.researchgate.net/profile/Prosenjit-Mondol-2',                                    'Prosenjit-Mondol-2',    'fa-brands fa-researchgate',     '#00ccbb', 5),
('orcid',        'ORCID',          'https://orcid.org/0009-0009-4827-4768',                                                      '0009-0009-4827-4768',   'fa-brands fa-orcid',            '#a6ce39', 6),
('googlescholar','Google Scholar', 'https://scholar.google.com/citations?user=hidSpYcAAAAJ&hl=en',                               'hidSpYcAAAAJ',          'fa-solid fa-graduation-cap',   '#4285f4', 7),
('openreview',   'OpenReview',     'https://openreview.net/profile?id=%7EProsenjit_Mondol1',                                     'Prosenjit_Mondol1',     'fa-solid fa-file-alt',          '#8b5cf6', 8),
('youtube',      'YouTube',        'https://www.youtube.com/@prosen49',                                                          '@prosen49',             'fa-brands fa-youtube',          '#ff0000', 9),
('codeforces',   'Codeforces',     'https://codeforces.com/profile/prosenjit_mondol',                                            'prosenjit_mondol',      'fa-solid fa-code',              '#1f8dd6', 10),
('hackerrank',   'HackerRank',     'https://www.hackerrank.com/profile/prosenjit1156',                                           'prosenjit1156',         'fa-brands fa-hackerrank',       '#2ec866', 11),
('leetcode',     'LeetCode',       'https://leetcode.com/u/prosenjit_mondol/',                                                   'prosenjit_mondol',      'fa-solid fa-code',              '#ffa116', 12),
('email',        'Email',          'mailto:prosenjit1156@gmail.com',                                                             'prosenjit1156@gmail.com','fa-solid fa-envelope',         '#ea4335', 13),
('cimilab',      'CIMILab',        'https://pronad1.github.io/CIMILab/index.html',                                               NULL,                    'fa-solid fa-flask',             '#6366f1', 14),
('portfolio',    'Portfolio',      'https://pronad1.github.io/Personal-Portfolio/',                                              NULL,                    'fa-solid fa-globe',             '#2980b9', 15)
ON CONFLICT DO NOTHING;

-- ── VOLUNTEERING (3 rows) ──────────────────────────────────
INSERT INTO volunteering (org, role, period, description, tags, display_order) VALUES
(
  'Badhon',
  'Voluntary Blood Donor',
  'Feb 2023 – Present',
  'Badhon is Bangladesh''s largest voluntary blood donation organization. Actively contributes to saving lives by responding to emergency blood needs in hospitals.',
  ARRAY['Blood Donation', 'Community Service', 'Healthcare'],
  1
),
(
  'CSE Club, PSTU',
  'Member',
  'Jan 2023 – Present',
  'Active member of the CSE Club at PSTU, working to foster a culture of technology, innovation, and collaborative learning. Participates in organizing tech events, workshops, and programming contests.',
  ARRAY['Technology', 'Innovation', 'Events'],
  2
),
(
  'YouthMappers PSTU Chapter',
  'Head of Media & IT',
  'PSTU Campus',
  'YouthMappers is a global university network dedicated to open mapping for humanitarian impact. As Head of Media & IT for the PSTU Chapter, oversees digital communication and content creation.',
  ARRAY['Open Mapping', 'Humanitarian', 'Media', 'IT'],
  3
)
ON CONFLICT DO NOTHING;

-- ── END OF SEED ────────────────────────────────────────────
-- Total rows seeded:
--   about:                  1
--   news:                  10
--   experience:             1
--   education:              3
--   publications:           3
--   projects:               7
--   skills:                 6
--   awards:                 9
--   certificates:          17
--   competitive_programming: 4
--   cp_meta:                1
--   contests:               3
--   coursework:             4
--   contact_profiles:      15
--   volunteering:           3
--   TOTAL:                 87 rows
