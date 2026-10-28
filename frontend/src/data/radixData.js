/**
 * Authoritative SkillSync Career-Readiness Platform Data & Benchmarks.
 * Based on the Participant Brief & 12-Skillset Framework.
 */

export const SKILL_CATEGORIES = {
  COD: {
    code: "COD",
    name: "Coding",
    fullName: "Programming Languages & Coding",
    description: "Core coding proficiency in languages such as Python, Java, C++, TypeScript, Go.",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    icon: "💻",
  },
  DSA: {
    code: "DSA",
    name: "DSA",
    fullName: "Data Structures & Algorithms",
    description: "Trees, graphs, dynamic programming, sorting, complexity analysis, algorithmic efficiency.",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    icon: "⚡",
  },
  OOD: {
    code: "OOD",
    name: "OOD",
    fullName: "Object-Oriented Design",
    description: "SOLID principles, design patterns (Factory, Observer, Singleton), class hierarchies, modularity.",
    color: "#0891b2",
    bgColor: "#ecfeff",
    borderColor: "#a5f3fc",
    icon: "🧩",
  },
  APTI: {
    code: "APTI",
    name: "Aptitude",
    fullName: "Aptitude & Problem Solving",
    description: "Analytical reasoning, mathematical problem solving, quantitative analysis, edge-case thinking.",
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    icon: "🎯",
  },
  COMM: {
    code: "COMM",
    name: "Communication",
    fullName: "Communication & Collaboration",
    description: "Technical writing, stakeholder presentation, cross-functional teamwork, code review hygiene.",
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    icon: "🗣️",
  },
  AI: {
    code: "AI",
    name: "AI / ML",
    fullName: "AI-Native Engineering & Machine Learning",
    description: "LLMs, prompt engineering, RAG, PyTorch, Scikit-Learn, data modeling, agentic workflows.",
    color: "#9333ea",
    bgColor: "#faf5ff",
    borderColor: "#e9d5ff",
    icon: "🤖",
  },
  CLOUD: {
    code: "CLOUD",
    name: "Cloud / DevOps",
    fullName: "DevOps & Cloud Computing",
    description: "AWS, GCP, Azure, Docker, Kubernetes, CI/CD pipelines, containerization, microservices.",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    icon: "☁️",
  },
  SQL: {
    code: "SQL",
    name: "SQL & Databases",
    fullName: "SQL, Relational & NoSQL Databases",
    description: "PostgreSQL, MySQL, query optimization, indexing, schema design, MongoDB, Redis caching.",
    color: "#4f46e5",
    bgColor: "#eef2ff",
    borderColor: "#c7d2fe",
    icon: "🗄️",
  },
  SWE: {
    code: "SWE",
    name: "Software Eng",
    fullName: "Software Engineering Best Practices",
    description: "Git version control, unit testing (pytest/jest), debugging, documentation, code cleanliness.",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    icon: "🛠️",
  },
  SYSD: {
    code: "SYSD",
    name: "System Design",
    fullName: "System Design & Architecture",
    description: "Distributed systems, scalability, load balancing, caching strategies, microservice patterns.",
    color: "#ea580c",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    icon: "🏗️",
  },
  NETW: {
    code: "NETW",
    name: "Networking",
    fullName: "Computer Networking",
    description: "TCP/IP, HTTP/HTTPS, DNS, WebSockets, REST APIs, network latency, security protocols.",
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    icon: "🌐",
  },
  OS: {
    code: "OS",
    name: "Operating Systems",
    fullName: "Operating Systems & Concurrency",
    description: "Linux, process management, multi-threading, concurrency, memory allocation, shell scripting.",
    color: "#475569",
    bgColor: "#f8fafc",
    borderColor: "#e2e8f0",
    icon: "⚙️",
  },
  OTHER: {
    code: "OTHER",
    name: "Specialized / Other",
    fullName: "Specialized Domain & Tools",
    description: "Domain specific tools, frameworks, and auxiliary skills.",
    color: "#6b7280",
    bgColor: "#f9fafb",
    borderColor: "#e5e7eb",
    icon: "📌",
  },
};

/**
 * Company 12-Skillset Benchmarks (from staging_company_skill_levels_rows.csv & Hackathon Brief)
 * Benchmark levels are scaled 1 - 10.
 */
export const COMPANY_BENCHMARKS = {
  "Google LLC": {
    name: "Google LLC",
    displayName: "Google LLC (Alphabet)",
    tier: "Tier 1 Big Tech",
    badge: "High Bar · Systems & Algorithms",
    description: "Demands deep mastery in algorithms, distributed architecture, and systems engineering.",
    benchmarks: {
      COD: 8,
      DSA: 9,
      OOD: 8,
      APTI: 9,
      COMM: 7,
      AI: 7,
      CLOUD: 9,
      SQL: 8,
      SWE: 9,
      SYSD: 8,
      NETW: 9,
      OS: 9,
    },
  },
  "Microsoft Corporation": {
    name: "Microsoft Corporation",
    displayName: "Microsoft Corporation",
    tier: "Tier 1 Big Tech",
    badge: "High Bar · Cloud & Software Craftsmanship",
    description: "Values enterprise cloud architecture, clean OOP, software lifecycle, and data analytics.",
    benchmarks: {
      COD: 8,
      DSA: 8,
      OOD: 8,
      APTI: 8,
      COMM: 7,
      AI: 7,
      CLOUD: 8,
      SQL: 7,
      SWE: 8,
      SYSD: 7,
      NETW: 7,
      OS: 7,
    },
  },
  "Oracle Financial Services Software": {
    name: "Oracle Financial Services Software Limited",
    displayName: "Oracle Financial Services Software (OFSS)",
    tier: "Enterprise Financial Tech",
    badge: "Enterprise Stability & Database Scale",
    description: "Emphasis on robust SQL database engineering, financial system stability, and enterprise SWE.",
    benchmarks: {
      COD: 5,
      DSA: 6,
      OOD: 6,
      APTI: 6,
      COMM: 6,
      AI: 6,
      CLOUD: 5,
      SQL: 6,
      SWE: 7,
      SYSD: 5,
      NETW: 5,
      OS: 5,
    },
  },
  "Amazon.com, Inc.": {
    name: "Amazon.com, Inc.",
    displayName: "Amazon (AWS & Retail)",
    tier: "Tier 1 Big Tech",
    badge: "High Bar · Scalability & Ownership",
    description: "Demands high bar across coding, distributed systems, customer obsession, and cloud microservices.",
    benchmarks: {
      COD: 8,
      DSA: 9,
      OOD: 8,
      APTI: 9,
      COMM: 7,
      AI: 7,
      CLOUD: 9,
      SQL: 8,
      SWE: 9,
      SYSD: 8,
      NETW: 7,
      OS: 8,
    },
  },
};

/**
 * 6 Official Hackathon Job Descriptions across 3 Companies, 2 Roles each (PDF page 11)
 */
export const OFFICIAL_JOB_DESCRIPTIONS = [
  {
    id: "jd-google-swe",
    company: "Google LLC",
    role: "Software Engineer (SWE)",
    location: "Bengaluru, India (Hybrid)",
    department: "Core Engineering & Infrastructure",
    description: `Google Software Engineer (SWE) - Bengaluru, India.
We are looking for engineers to design and develop large-scale distributed systems and high-throughput microservices.
Key Responsibilities:
- Design, implement, and maintain scalable systems using C++, Java, or Python.
- Optimize algorithmic complexity, concurrency, and memory management for massive volume traffic.
- Collaborate with cross-functional teams and lead architecture reviews for resilient distributed infrastructure.
What We're Looking For:
- Strong foundations in Data Structures and Algorithms (DSA), time/space complexity analysis.
- Proven experience with System Design (SYSD), microservice architectures, and caching mechanisms.
- Deep understanding of Operating Systems (OS) concepts, multi-threading, IPC, and Linux kernel fundamentals.
- Solid grasp of Computer Networks (NETW), TCP/IP protocols, and low-latency network performance.
- Familiarity with CI/CD, unit testing, Git version control, and cloud infrastructure (GCP/Cloud).`,
    skills: [
      { skill_name: "Python", category_code: "COD", evidence: "Implement systems using Python or C++", confidence: "high" },
      { skill_name: "C++", category_code: "COD", evidence: "Design high performance services in C++", confidence: "high" },
      { skill_name: "Java", category_code: "COD", evidence: "Backend microservices implementation", confidence: "high" },
      { skill_name: "Data Structures & Algorithms", category_code: "DSA", evidence: "Deep algorithmic complexity and graph/tree optimization", confidence: "high" },
      { skill_name: "System Design", category_code: "SYSD", evidence: "Lead architecture reviews for distributed systems", confidence: "high" },
      { skill_name: "Distributed Systems", category_code: "SYSD", evidence: "Large scale distributed systems design", confidence: "high" },
      { skill_name: "Operating Systems", category_code: "OS", evidence: "Multi-threading, concurrency, memory management", confidence: "high" },
      { skill_name: "Linux", category_code: "OS", evidence: "Linux systems and kernel fundamentals", confidence: "medium" },
      { skill_name: "Computer Networks", category_code: "NETW", evidence: "TCP/IP protocols and network latency", confidence: "high" },
      { skill_name: "Object-Oriented Design", category_code: "OOD", evidence: "Modular component hierarchies and design patterns", confidence: "medium" },
      { skill_name: "Git & Version Control", category_code: "SWE", evidence: "Git workflow, code reviews and testing", confidence: "medium" },
      { skill_name: "Cloud Platforms (GCP)", category_code: "CLOUD", evidence: "Cloud infrastructure deployment", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Collaborate with cross-functional global teams", confidence: "low" },
    ],
  },
  {
    id: "jd-google-ds",
    company: "Google LLC",
    role: "Data Scientist",
    location: "Bengaluru, India",
    department: "Machine Intelligence & Search Analytics",
    description: `Google Data Scientist - Bengaluru, India.
Seeking passionate data scientists to build predictive models, run high-velocity A/B tests, and drive machine intelligence across billions of user events.
Key Responsibilities:
- Build machine learning models in Python using PyTorch, TensorFlow, or Scikit-Learn.
- Formulate statistical hypothesis testing, experimental design, and metrics evaluation.
- Query and aggregate petabyte-scale data using advanced SQL, BigQuery, and distributed query engines.
What We're Looking For:
- Strong foundation in Machine Learning (AI) and statistical inference (APTI).
- Advanced SQL proficiency, database schema modeling, and data pipeline construction.
- Fluency in Python data stack: Pandas, NumPy, Scikit-Learn, SciPy.
- Data visualization expertise and clear communication of insights to product leadership.`,
    skills: [
      { skill_name: "Python", category_code: "COD", evidence: "Core language for data modeling and scripting", confidence: "high" },
      { skill_name: "Machine Learning", category_code: "AI", evidence: "Build predictive models with PyTorch/TensorFlow", confidence: "high" },
      { skill_name: "Statistics & Inference", category_code: "APTI", evidence: "Statistical hypothesis testing and experiment design", confidence: "high" },
      { skill_name: "SQL & BigQuery", category_code: "SQL", evidence: "Query petabyte-scale datasets and metrics aggregation", confidence: "high" },
      { skill_name: "Pandas & NumPy", category_code: "COD", evidence: "Data manipulation and scientific computations", confidence: "high" },
      { skill_name: "Data Visualization", category_code: "OTHER", evidence: "Communicate insights to product leadership", confidence: "medium" },
      { skill_name: "Problem Solving", category_code: "APTI", evidence: "Derive solutions to complex business problems", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Present technical insights clearly to stakeholders", confidence: "low" },
    ],
  },
  {
    id: "jd-ms-swe",
    company: "Microsoft Corporation",
    role: "Software Engineer",
    location: "Hyderabad, India",
    department: "Azure Cloud & Platform Engineering",
    description: `Microsoft Software Engineer - Hyderabad, India.
Join Microsoft Azure and Developer Division to develop resilient, mission-critical enterprise services powering millions of global organizations.
Key Responsibilities:
- Build robust microservices using C#, .NET, Java, or C++.
- Write clean, maintainable code adhering to SOLID object-oriented principles.
- Automate deployment pipelines on Microsoft Azure using Docker, Kubernetes, and GitHub Actions.
What We're Looking For:
- Strong knowledge of Object-Oriented Design (OOD) and software craftsmanship.
- Solid understanding of Data Structures and Algorithms (DSA) for efficient resource consumption.
- Hands-on experience with Cloud (Azure/AWS) and containerized workflows.
- Relational database experience with SQL (SQL Server / PostgreSQL).
- Excellent debugging, testing, and collaborative communication skills.`,
    skills: [
      { skill_name: "C# / Java", category_code: "COD", evidence: "Build robust microservices using modern OOP languages", confidence: "high" },
      { skill_name: "Object-Oriented Design", category_code: "OOD", evidence: "Clean code adhering to SOLID principles", confidence: "high" },
      { skill_name: "Data Structures & Algorithms", category_code: "DSA", evidence: "Algorithm optimization and clean implementation", confidence: "high" },
      { skill_name: "Microsoft Azure / Cloud", category_code: "CLOUD", evidence: "Deploy microservices on Azure container platforms", confidence: "high" },
      { skill_name: "Docker & Kubernetes", category_code: "CLOUD", evidence: "Container orchestration and CI/CD pipelines", confidence: "medium" },
      { skill_name: "SQL & Relational DBs", category_code: "SQL", evidence: "Schema design and transactional queries", confidence: "medium" },
      { skill_name: "Software Engineering & Testing", category_code: "SWE", evidence: "Unit testing, debugging, and code reviews", confidence: "high" },
      { skill_name: "System Design", category_code: "SYSD", evidence: "Scalable service architecture and API design", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Collaborative teamwork across distributed timezones", confidence: "low" },
    ],
  },
  {
    id: "jd-ms-da",
    company: "Microsoft Corporation",
    role: "Data Analyst",
    location: "Hyderabad, India",
    department: "Business Analytics & Intelligence",
    description: `Microsoft Data Analyst - Hyderabad, India.
We are seeking an inquisitive Data Analyst to synthesize operational data into executive dashboards and strategic insights.
Key Responsibilities:
- Design and maintain interactive Power BI / Tableau dashboards for product engagement and telemetry.
- Write complex SQL queries for multi-source database ETL, joining transactional and dimensional tables.
- Perform exploratory data analysis using Python/Excel to detect operational anomalies and trends.
What We're Looking For:
- Advanced SQL proficiency, subqueries, window functions, and performance tuning.
- Mastery of Power BI, DAX expressions, or Tableau data modeling.
- Working knowledge of Python (Pandas) for data cleansing and automation.
- Strong quantitative aptitude and business communication.`,
    skills: [
      { skill_name: "SQL", category_code: "SQL", evidence: "Complex SQL queries, window functions, and joins", confidence: "high" },
      { skill_name: "Power BI / Tableau", category_code: "OTHER", evidence: "Build executive telemetry and engagement dashboards", confidence: "high" },
      { skill_name: "Python (Pandas)", category_code: "COD", evidence: "Data cleaning and exploratory automation", confidence: "medium" },
      { skill_name: "Data Modeling", category_code: "SQL", evidence: "Dimensional modeling and schema mapping", confidence: "medium" },
      { skill_name: "Analytical Aptitude", category_code: "APTI", evidence: "Quantitative problem solving and anomaly detection", confidence: "high" },
      { skill_name: "Excel Analytics", category_code: "OTHER", evidence: "Spreadsheet modeling and financial formulas", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Translate numbers into actionable business strategy", confidence: "medium" },
    ],
  },
  {
    id: "jd-oracle-ase",
    company: "Oracle Financial Services Software",
    role: "Associate Software Engineer",
    location: "Bengaluru / Mumbai, India",
    department: "Banking Platform Products",
    description: `Oracle Financial Services Software (OFSS) - Associate Software Engineer.
Seeking energetic junior engineers to build, customize, and deliver mission-critical banking software solutions (FLEXCUBE, Banking Payments).
Key Responsibilities:
- Develop core banking modules using Java, J2EE, Spring, and Oracle Database PL/SQL.
- Optimize database transactions, triggers, stored procedures, and batch processing jobs.
- Adhere to strict financial compliance, test coverage, and documentation standards.
What We're Looking For:
- Solid programming skills in Java / C++ and understanding of OOP fundamentals.
- Strong SQL and Relational Database concepts (Oracle DB / PL/SQL).
- Good analytical reasoning, aptitude, and problem-solving mindset.
- Basic knowledge of Software Engineering lifecycle (SDLC), Git, and unit testing.`,
    skills: [
      { skill_name: "Java", category_code: "COD", evidence: "Develop banking modules in Java/J2EE", confidence: "high" },
      { skill_name: "SQL & PL/SQL", category_code: "SQL", evidence: "Stored procedures, triggers, Oracle Database queries", confidence: "high" },
      { skill_name: "Object-Oriented Programming", category_code: "OOD", evidence: "Class structures, inheritance, encapsulation", confidence: "high" },
      { skill_name: "Data Structures", category_code: "DSA", evidence: "Core data structures and algorithms", confidence: "medium" },
      { skill_name: "Software Engineering (SWE)", category_code: "SWE", evidence: "SDLC practices, unit testing, Git", confidence: "high" },
      { skill_name: "Problem Solving", category_code: "APTI", evidence: "Analytical reasoning for financial workflows", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Documentation and cross-functional team discussions", confidence: "low" },
    ],
  },
  {
    id: "jd-oracle-asa",
    company: "Oracle Financial Services Software",
    role: "Application Support Analyst",
    location: "Bengaluru / Chennai, India",
    department: "Enterprise Customer Support & IT Operations",
    description: `Oracle Financial Services Software (OFSS) - Application Support Analyst.
Join our global support organization providing technical incident triage, customer escalations, and system reliability for enterprise tier-1 banks.
Key Responsibilities:
- Triage production incidents, analyze application server logs, and isolate software defects.
- Run database diagnostic SQL queries to inspect transactional discrepancies and data fixes.
- Coordinate with clients, release engineering, and developers to ensure 24/7 SLA uptime.
What We're Looking For:
- Proficiency in SQL and database querying for troubleshooting.
- Experience with customer service, incident management, and communication.
- Basic familiarity with Linux/Unix shell commands, logs, and server monitoring.
- Strong analytical troubleshooting skills under pressure.`,
    skills: [
      { skill_name: "SQL & Database Queries", category_code: "SQL", evidence: "Diagnostic queries to isolate transactional bugs", confidence: "high" },
      { skill_name: "Incident Troubleshooting", category_code: "APTI", evidence: "Triage production defects and root cause analysis", confidence: "high" },
      { skill_name: "Communication & Client Support", category_code: "COMM", evidence: "Client coordination and SLA escalation management", confidence: "high" },
      { skill_name: "Linux / Unix Commands", category_code: "OS", evidence: "Inspect server logs, permissions, and shell scripts", confidence: "medium" },
      { skill_name: "Excel & Reporting", category_code: "OTHER", evidence: "SLA metrics reporting and status tracking", confidence: "medium" },
      { skill_name: "Computer Networks & HTTP", category_code: "NETW", evidence: "Web service latency and connectivity inspection", confidence: "low" },
    ],
  },
];

/**
 * 4 Sample Candidate Resumes with deliberately different skill profiles (PDF page 11)
 */
export const SAMPLE_CANDIDATES = [
  {
    candidate_id: "candidate-ananya-rao",
    name: "Ananya Rao",
    email: "ananya.rao@example.edu",
    tagline: "Systems-Leaning Generalist",
    targetVerdict: "Strong fit for SWE-heavy roles, weaker fit for data roles",
    education: "B.Tech in Computer Science & Engineering, National Institute of Technology (CGPA: 8.9/10)",
    experience: [
      "Software Engineering Intern at CloudScale Systems (4 months): Built high-concurrency microservices in Go & C++, reducing request latency by 28%.",
      "Undergraduate Systems Researcher: Implemented distributed lock manager on raft protocol with Linux kernel tracing.",
    ],
    hackathons: [
      "Winner, InnoHacks 2025: Developed distributed key-value store in C++ with custom TCP protocol.",
      "Finalist, Smart India Hackathon: Scalable municipal sensor data gateway.",
    ],
    certifications: [
      "AWS Certified Solutions Architect - Associate",
      "Linux Foundation Certified System Administrator (LFCS)",
    ],
    preferred_roles: ["Software Engineer (SWE)", "Systems Engineer", "Backend Platform Engineer"],
    cv_summary: "Strong systems and SWE background with deep command of C++, Java, Python, OS internals, TCP/IP networking, and distributed systems. Limited exposure to machine learning, Big Data pipelines, and analytics.",
    skills: [
      { skill_name: "Python", category_code: "COD", evidence: "Scripting and automation test suites in Python", confidence: "high" },
      { skill_name: "Java", category_code: "COD", evidence: "Enterprise Java backend components and multi-threading", confidence: "high" },
      { skill_name: "C++", category_code: "COD", evidence: "High performance systems engineering and memory management", confidence: "high" },
      { skill_name: "Data Structures & Algorithms", category_code: "DSA", evidence: "Ranked top 5% on LeetCode; tree, graph, and DP expertise", confidence: "high" },
      { skill_name: "System Design", category_code: "SYSD", evidence: "Architected distributed key-value store with raft consensus", confidence: "high" },
      { skill_name: "Distributed Systems", category_code: "SYSD", evidence: "Microservices, sharding, and latency optimization", confidence: "high" },
      { skill_name: "Operating Systems", category_code: "OS", evidence: "Linux concurrency, process scheduling, pthreads", confidence: "high" },
      { skill_name: "Linux Internals", category_code: "OS", evidence: "LFCS certified; bash scripting and system call tracing", confidence: "high" },
      { skill_name: "Computer Networks (TCP/IP)", category_code: "NETW", evidence: "Custom socket protocol implementation, HTTP/2, DNS", confidence: "high" },
      { skill_name: "Git & CI/CD", category_code: "SWE", evidence: "GitHub Actions automation and strict branch protection", confidence: "medium" },
      { skill_name: "Unit Testing", category_code: "SWE", evidence: "Extensive pytest and gtest coverage", confidence: "medium" },
      { skill_name: "Cloud (AWS)", category_code: "CLOUD", evidence: "AWS EC2, S3, Docker containerization", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Lead technical speaker at student IEEE chapter", confidence: "medium" },
    ],
  },
  {
    candidate_id: "candidate-karthik-subramaniam",
    name: "Karthik Subramaniam",
    email: "karthik.subramaniam@example.edu",
    tagline: "Data-Leaning Analyst & ML Explorer",
    targetVerdict: "Strong fit for Data Scientist / Data Analyst roles, weaker fit for pure SWE roles",
    education: "B.Tech in Information Technology, Vellore Institute of Technology (CGPA: 8.7/10)",
    experience: [
      "Data Analytics Intern at FinTech Insights (6 months): Modeled churn prediction using Scikit-Learn; wrote SQL pipelines processing 2M daily records.",
      "Research Assistant, AI Lab: Published paper on customer segmentation using unsupervised clustering in Python.",
    ],
    hackathons: [
      "1st Runner Up, DataSprint 2025: Predictive healthcare diagnostics using XGBoost and Streamlit.",
      "Kaggle Competitions Master: Top 10% in Tabular Playground Series.",
    ],
    certifications: [
      "Google Data Analytics Professional Certificate",
      "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
    ],
    preferred_roles: ["Data Scientist", "Data Analyst", "Machine Learning Engineer"],
    cv_summary: "Skilled data analyst with strong SQL, Python (Pandas/NumPy), statistical modeling, and visualization tools (Tableau/Power BI). Limited background in low-level systems programming (C/C++), operating systems, and network protocols.",
    skills: [
      { skill_name: "Python", category_code: "COD", evidence: "Core language for data science, statistical analysis, and scripting", confidence: "high" },
      { skill_name: "SQL & Query Tuning", category_code: "SQL", evidence: "Advanced window functions, subqueries, and indexing for 2M rows", confidence: "high" },
      { skill_name: "Machine Learning (Scikit-Learn)", category_code: "AI", evidence: "Supervised and unsupervised models, XGBoost, cross-validation", confidence: "high" },
      { skill_name: "Statistics & Probability", category_code: "APTI", evidence: "A/B testing, hypothesis formulation, regression analysis", confidence: "high" },
      { skill_name: "Pandas & NumPy", category_code: "COD", evidence: "Data manipulation, ETL pipelines, tabular cleansing", confidence: "high" },
      { skill_name: "Data Visualization (Tableau/PowerBI)", category_code: "OTHER", evidence: "Certified PL-300; built executive retention dashboards", confidence: "high" },
      { skill_name: "Problem Solving", category_code: "APTI", evidence: "Kaggle tabular master with analytical problem solving", confidence: "high" },
      { skill_name: "Data Modeling", category_code: "SQL", evidence: "Star schema and dimensional table definitions", confidence: "medium" },
      { skill_name: "Git & Version Control", category_code: "SWE", evidence: "Repository management for ML experiments", confidence: "medium" },
      { skill_name: "Communication", category_code: "COMM", evidence: "Presented findings to VP of Product and stakeholders", confidence: "medium" },
    ],
  },
  {
    candidate_id: "candidate-priya-menon",
    name: "Priya Menon",
    email: "priya.menon@example.edu",
    tagline: "Entry-Level, Support & Enterprise Oriented",
    targetVerdict: "Best fit for Oracle FSS roles, weaker fit for Google / Microsoft tier-1 engineering",
    education: "B.Tech in Computer Science, JSS Academy of Technical Education (CGPA: 7.8/10)",
    experience: [
      "Technical Support Intern at IT Services Hub (5 months): Handled tier-1/tier-2 ticketing, SLA tracking, and resolved Oracle DB sync queries.",
      "College IT Helpdesk Coordinator: Managed student portal uptime and incident triage.",
    ],
    hackathons: [
      "Participant, College Tech Fest 2024: Built an inventory tracking database using Oracle SQL.",
    ],
    certifications: [
      "Oracle Certified Foundations Associate, Database",
      "ITIL v4 Foundations in IT Service Management",
    ],
    preferred_roles: ["Application Support Analyst", "Associate Software Engineer", "Quality Analyst"],
    cv_summary: "Dedicated entry-level professional with solid foundation in SQL, relational databases (Oracle), customer communication, incident resolution, and Excel. Needs upskilling in Data Structures, modern System Design, and Cloud DevOps.",
    skills: [
      { skill_name: "SQL & Relational Databases", category_code: "SQL", evidence: "Oracle DB certified; query generation and data validation", confidence: "high" },
      { skill_name: "Oracle Database & PL/SQL", category_code: "SQL", evidence: "Basic stored procedures, views, and data fixes", confidence: "medium" },
      { skill_name: "Troubleshooting & Triage", category_code: "APTI", evidence: "Resolved 200+ Jira service desk support tickets", confidence: "high" },
      { skill_name: "Communication & Customer Service", category_code: "COMM", evidence: "Cross-functional client interaction and documentation", confidence: "high" },
      { skill_name: "Excel & Analytics", category_code: "OTHER", evidence: "VLOOKUP, pivot tables, SLA reporting charts", confidence: "high" },
      { skill_name: "Linux Shell Basics", category_code: "OS", evidence: "Basic file commands, grep log inspection", confidence: "low" },
      { skill_name: "Java Basics", category_code: "COD", evidence: "Core OOP coursework and simple CRUD apps", confidence: "medium" },
      { skill_name: "Object-Oriented Programming", category_code: "OOD", evidence: "Understanding of classes, inheritance, encapsulation", confidence: "medium" },
      { skill_name: "SDLC & Software Testing", category_code: "SWE", evidence: "Manual test cases and defect tracking", confidence: "medium" },
    ],
  },
  {
    candidate_id: "candidate-rohan-verma",
    name: "Rohan Verma",
    email: "rohan.verma@example.edu",
    tagline: "Strong All-Rounder & Full-Stack Architect",
    targetVerdict: "Competitive fit across nearly every role in the hackathon pack",
    education: "B.Tech in Computer Science & Engineering, IIT Delhi (CGPA: 9.3/10)",
    experience: [
      "Full-Stack Software Engineering Intern at TechVenture (6 months): Built real-time analytics engine in Python & React, scaled Postgres database to 5k RPS.",
      "Open Source Contributor: Active committer to prominent cloud-native and ML tools.",
    ],
    hackathons: [
      "Grand Winner, HackTheFuture 2025 (1st of 200 teams): Real-time collaborative IDE using WebSockets and Docker.",
      "Finalist, Microsoft Imagine Cup India.",
    ],
    certifications: [
      "AWS Certified Developer - Associate",
      "Google Professional Cloud Architect",
      "DeepLearning.AI Machine Learning Specialization",
    ],
    preferred_roles: ["Software Engineer (SWE)", "Data Scientist", "Full-Stack Engineer", "Cloud Architect"],
    cv_summary: "Comprehensive high-performing skill profile spanning advanced algorithms (DSA), full-stack coding (Python, Java, C++, TypeScript), system design, cloud DevOps (AWS/Docker), SQL & databases, and practical machine learning.",
    skills: [
      { skill_name: "Python", category_code: "COD", evidence: "Production microservices, async FastAPI, ML pipelines", confidence: "high" },
      { skill_name: "Java", category_code: "COD", evidence: "Concurrent processing and Spring Boot microservices", confidence: "high" },
      { skill_name: "C++", category_code: "COD", evidence: "Competitive programming and low-level socket programming", confidence: "high" },
      { skill_name: "Data Structures & Algorithms", category_code: "DSA", evidence: "Candidate Master on Codeforces; graph algorithms, segment trees", confidence: "high" },
      { skill_name: "System Design", category_code: "SYSD", evidence: "Designed fault-tolerant event-driven pipeline handling 5k RPS", confidence: "high" },
      { skill_name: "Distributed Systems", category_code: "SYSD", evidence: "Kafka event streaming, Redis caching, microservices", confidence: "high" },
      { skill_name: "SQL & PostgreSQL", category_code: "SQL", evidence: "Schema normalization, EXPLAIN ANALYZE query optimization", confidence: "high" },
      { skill_name: "Machine Learning & AI", category_code: "AI", evidence: "PyTorch, transformer fine-tuning, embeddings", confidence: "high" },
      { skill_name: "AWS Cloud & DevOps", category_code: "CLOUD", evidence: "AWS Certified Developer; ECS, Lambda, Docker, Terraform", confidence: "high" },
      { skill_name: "Git, Testing & CI/CD", category_code: "SWE", evidence: "Strict TDD, automated GitHub Actions, code reviews", confidence: "high" },
      { skill_name: "Operating Systems & Concurrency", category_code: "OS", evidence: "Linux process management, epoll, memory profiling", confidence: "high" },
      { skill_name: "Computer Networks & WebSockets", category_code: "NETW", evidence: "TCP/IP handshake, HTTP/2, WebSocket multiplexing", confidence: "high" },
      { skill_name: "Problem Solving & Aptitude", category_code: "APTI", evidence: "Top national percentile in analytical assessments", confidence: "high" },
      { skill_name: "Object-Oriented Design (OOD)", category_code: "OOD", evidence: "Extensive design patterns and clean architecture", confidence: "high" },
      { skill_name: "Communication & Leadership", category_code: "COMM", evidence: "Mentored 15 junior developers, open-source maintainer", confidence: "high" },
    ],
  },
];
