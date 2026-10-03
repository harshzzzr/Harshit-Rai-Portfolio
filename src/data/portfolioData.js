/**
 * Local Portfolio Seed & Fallback Data Architecture
 * 
 * PURPOSE:
 * - Production source of truth is Cloud Firestore.
 * - This local data serves exclusively as seed data, development data, and offline fallback.
 */

export const personalInfo = {
  name: 'Harshit Rai',
  role: 'Computer Engineering Student & Developer',
  tagline: 'Computer Engineering • C++ Systems • Full-Stack Web Development',
  shortBio: 'Computer Engineering student specializing in software engineering, algorithmic problem solving in C++, and building reliable full-stack web applications.',
  about: [
    'I am a Computer Engineering student driven by a strong curiosity for how computing systems and software architectures operate at scale. My core interests center on full-stack web engineering, systems development, and data-driven applications.',
    'With a rigorous foundation in algorithms and object-oriented paradigms, I focus on writing clean, modular, and maintainable code. I enjoy exploring emerging technologies, building practical tools, and collaborating on impactful engineering problems.'
  ],
  education: [
    {
      degree: 'Bachelor of Engineering in Computer Engineering',
      institution: 'Computer Engineering Department',
      status: 'Undergraduate Student',
      highlights: [
        'Core curriculum in Computer Science & Engineering fundamentals',
        'Key focus: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks',
        'Active participant in technical problem-solving and software project tracks'
      ]
    }
  ],
  socials: {
    github: 'https://github.com/harshzzzr',
    githubUsername: 'harshzzzr',
    linkedin: 'https://www.linkedin.com/in/harshit-rai-/',
    linkedinUsername: 'harshit-rai-',
    leetcode: 'https://leetcode.com/u/GkKWasfX4F/',
    leetcodeUsername: 'GkKWasfX4F',
    spotify: 'https://open.spotify.com/user/31b6a5xevyjjpxunwv3fr2f662mu',
    spotifyUsername: '31b6a5xevyjjpxunwv3fr2f662mu'
  },
  contact: {
    email: 'harshittrrai@gmail.com',
    location: 'Available for Opportunities & Collaborations'
  }
};

export const skillsData = [
  {
    category: 'Programming',
    skills: [
      { name: 'C++', level: 'Core' },
      { name: 'Python', level: 'Core' },
      { name: 'Java', level: 'Core' },
      { name: 'JavaScript', level: 'Core' },
      { name: 'SQL', level: 'Core' }
    ]
  },
  {
    category: 'Web Development',
    skills: [
      { name: 'HTML', level: 'Frontend' },
      { name: 'CSS', level: 'Frontend' },
      { name: 'Node.js', level: 'Backend' },
      { name: 'Express', level: 'Backend' },
      { name: 'Angular', level: 'Frontend' }
    ]
  },
  {
    category: 'Database',
    skills: [
      { name: 'MySQL', level: 'Relational' },
      { name: 'MongoDB', level: 'Document' },
      { name: 'Firebase', level: 'NoSQL / BaaS' }
    ]
  },
  {
    category: 'Tools',
    skills: [
      { name: 'Git', level: 'VCS' },
      { name: 'GitHub', level: 'Collaboration' }
    ]
  },
  {
    category: 'Mobile / Other Technologies',
    skills: [
      { name: 'Arduino', level: 'Hardware / IoT' },
      { name: 'Android', level: 'Mobile App' },
      { name: 'Unity', level: 'Game / 3D Engine' }
    ]
  }
];

export const seedProjects = [
  {
    id: 'campus-connect',
    title: 'Campus Connect',
    tagline: 'Full-stack campus networking and academic collaboration platform',
    description: 'A responsive full-stack platform connecting students and faculty with modular RESTful endpoints, database integration, and intuitive interfaces.',
    overview: 'This project demonstrates a production-grade multi-tier web application architecture. It separates concerns between client-side rendering, API routing, business controller logic, and document-oriented database persistence to streamline academic communication.',
    problem: 'Traditional campus communication channels are often fragmented across disparate tools, causing notification delays and administrative overhead.',
    solution: 'Engineered a modular MVC-style REST API using Express and Node.js coupled with MongoDB schema definitions and client-side input validation.',
    features: [
      'Modular RESTful API routing architecture with separation of controllers and services',
      'Document schema validation and indexing for reliable data operations',
      'Responsive user interface designed for mobile, tablet, and desktop viewports',
      'Comprehensive error handling middleware and structured JSON error responses',
      'Stateless request processing designed to scale across compute instances'
    ],
    technologies: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'CSS', 'HTML'],
    githubUrl: 'https://github.com/harshzzzr',
    liveUrl: null,
    screenshots: [],
    featured: true,
    category: 'Web',
    badge: 'Featured Project'
  },
  {
    id: 'drone-detection',
    title: 'Drone Detection System',
    tagline: 'Real-time telemetry and signal processing system for aerial monitoring',
    description: 'Hardware and sensor integration prototype for detecting and monitoring aerial objects with low-latency signal acquisition and telemetry feedback.',
    overview: 'An embedded systems prototype combining C++ firmware with hardware sensors and actuators to capture environmental telemetry and signal indicators in real time.',
    problem: 'Hardware environments require low-latency sensor sampling without blocking execution or exhausting microchip memory constraints.',
    solution: 'Wrote non-blocking firmware loops in C++ using hardware timer interrupts and serial communication protocols for continuous sensor telemetry.',
    features: [
      'Real-time analog and digital sensor input processing with minimal latency',
      'Non-blocking event-driven loop structure avoiding synchronous delay bottlenecks',
      'Serial telemetry streaming formatted for monitoring and downstream analysis',
      'Hardware actuator control responding immediately to configured threshold events'
    ],
    technologies: ['Arduino', 'C++', 'Python'],
    githubUrl: 'https://github.com/harshzzzr',
    liveUrl: null,
    screenshots: [],
    featured: true,
    category: 'Hardware',
    badge: 'Hardware'
  },
  {
    id: 'vip-framework',
    title: 'VIP Framework',
    tagline: 'High-performance modular software systems and execution pipeline architecture',
    description: 'A structured software framework designed for robust data processing, modular execution stages, and algorithmic efficiency.',
    overview: 'VIP Framework focuses on modular software architecture, algorithm design, and predictable performance across compute pipelines.',
    problem: 'Complex system pipelines often experience tight coupling and data bottlenecks when processing multidimensional inputs.',
    solution: 'Architected decoupled pipeline stages with strict interfaces and optimized memory management in C++.',
    features: [
      'Component-oriented design separating physics, processing, and interaction logic',
      'Rigid-body dynamics and customized collider configurations',
      'Dynamic lighting and material shading optimized for smooth frame rates',
      'Configurable camera perspectives with smooth interpolations'
    ],
    technologies: ['C++', 'Algorithms', 'Python'],
    githubUrl: 'https://github.com/harshzzzr',
    liveUrl: null,
    screenshots: [],
    featured: true,
    category: 'Systems',
    badge: 'Systems'
  },
  {
    id: 'android-jetpack-compose',
    title: 'Android Utility & Jetpack Compose Apps',
    tagline: 'Modern native Android application built with Jetpack Compose and Kotlin',
    description: 'Native Android application focusing on modern declarative UI with Jetpack Compose, state management, and offline persistence.',
    overview: 'An Android application built natively using Kotlin and Jetpack Compose, providing offline-first capabilities, activity lifecycle management, and intuitive material components.',
    problem: 'Users frequently require quick utilities that function without continuous network connectivity, requiring robust local storage and graceful lifecycle recovery.',
    solution: 'Implemented structured Android Activities and Jetpack Compose UI backed by local persistence, ensuring quick launch times and persistent user settings.',
    features: [
      'Native Android activity lifecycle management preventing memory leaks',
      'Declarative Jetpack Compose UI adaptable to varied screen densities and orientations',
      'Local state persistence for instant data availability without network dependence',
      'Material design interface elements with accessible contrast and touch targets'
    ],
    technologies: ['Android', 'Kotlin', 'Jetpack Compose', 'Java'],
    githubUrl: 'https://github.com/harshzzzr/N083-Harshit-Rai',
    liveUrl: null,
    screenshots: [],
    featured: false,
    category: 'Mobile',
    badge: 'Mobile'
  },
  {
    id: 'transport-logistics',
    title: 'Transport & Logistics Management System',
    tagline: 'Relational database architecture with transactional integrity and route indexing',
    description: 'Structured database application designed with MySQL and SQL stored procedures, supporting relational schemas, indexing, and transactional integrity.',
    overview: 'A robust database engineering project focused on normal form principles (1NF through BCNF), foreign key constraints, composite index optimization, and transactional ACID guarantees for fleet and logistics operations.',
    problem: 'Unstructured data access and unindexed multi-table queries lead to slow response times, read/write locks, and data redundancy as operational volume expands.',
    solution: 'Designed normalized relational entity-relationship models, implemented stored procedures for operational transactions, and tested performance gains using SQL query profiling and indexes.',
    features: [
      'Normalized relational schemas up to 3NF/BCNF ensuring zero insertion/deletion anomalies',
      'Stored procedures and triggers enforcing business constraints at the database tier',
      'Composite indexing strategies yielding significant query execution time reductions',
      'ACID transaction control blocks preventing inconsistent intermediate states',
      'Python database connector scripts for automated data seeding and stress testing'
    ],
    technologies: ['SQL', 'MySQL', 'Python', 'Relational DB'],
    githubUrl: 'https://github.com/harshzzzr',
    liveUrl: null,
    screenshots: [],
    featured: false,
    category: 'Database',
    badge: 'Database'
  }
];

export const projectsData = seedProjects;

export const timelineData = {
  experience: [
    {
      title: 'Computer Engineering Developer Track',
      role: 'Student Developer',
      period: 'Academic Trajectory',
      organization: 'Engineering Department',
      description: 'Engaged in hands-on software development laboratories, algorithm design, system architecture analysis, and collaborative code reviews.'
    },
    {
      title: 'Open Source & Independent Projects',
      role: 'Contributor & Builder',
      period: 'Continuous',
      organization: 'Independent',
      description: 'Building tools, experimenting with full-stack web stacks, microcontrollers, and modern framework architectures.'
    }
  ],
  hackathons: [],
  research: [
    {
      title: 'Systems & Computing Exploration',
      role: 'Academic Inquiry',
      period: 'Undergraduate Coursework',
      organization: 'Academic Laboratory',
      description: 'Investigating relational query optimization, distributed data structures, and microcontroller sensor interfacing.'
    }
  ],
  achievements: [
    {
      title: 'Algorithmic Problem Solving Milestones',
      role: 'Problem Solver',
      period: 'Active Practice',
      organization: 'Competitive Programming Tracks',
      description: 'Consistently practicing core algorithmic topics, data structures, and computational optimization in C++ and Java.'
    }
  ],
  certifications: []
};
