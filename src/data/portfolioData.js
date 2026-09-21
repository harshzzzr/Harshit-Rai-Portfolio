export const personalInfo = {
  name: 'Harshit Rai',
  role: 'Computer Engineering Student & Developer',
  tagline: 'Developer • Problem Solver • Technology Enthusiast',
  shortBio: 'Computer Engineering student with a passion for software engineering, algorithmic problem-solving, and building high-performance web applications and system solutions.',
  about: [
    'I am a Computer Engineering student driven by a strong curiosity for how computing systems and software architectures operate at scale. My core interests center on full-stack web engineering, systems development, and data-driven applications.',
    'With a rigorous foundation in algorithms and object-oriented paradigms, I focus on writing clean, modular, and maintainable code. I enjoy exploring emerging technologies, building practical tools, and collaborating on impactful engineering problems.'
  ],
  education: [
    {
      degree: 'Bachelor of Engineering in Computer Engineering',
      institution: 'Computer Engineering Academy / University',
      status: 'Undergraduate Student',
      highlights: [
        'Core curriculum in Computer Science & Engineering fundamentals',
        'Key focus: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks',
        'Active participant in technical problem-solving and software project tracks'
      ]
    }
  ],
  socials: {
    github: 'https://github.com/harshitrai',
    githubUsername: 'harshitrai',
    linkedin: 'https://linkedin.com/in/harshit-rai',
    linkedinUsername: 'harshit-rai',
    leetcode: 'https://leetcode.com/u/harshitrai',
    leetcodeUsername: 'harshitrai',
    spotify: 'https://open.spotify.com/user/harshitrai',
    spotifyUsername: 'harshitrai'
  },
  contact: {
    email: 'harshit.rai@example.com',
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

export const projectsData = [
  {
    id: 'fullstack-web-platform',
    title: 'Full-Stack Web Application',
    tagline: 'Modern RESTful web architecture with persistent data modeling and responsive UI',
    description: 'A responsive full-stack platform built with Node.js, Express, and JavaScript featuring modular RESTful endpoints, database integration, and modern frontend styling.',
    overview: 'This project demonstrates a production-grade multi-tier web application architecture. It separates concerns between client-side rendering, API routing, business controller logic, and document-oriented database persistence.',
    problem: 'Traditional client-side applications often face scalability bottlenecks when business logic, data validation, and database operations are tightly coupled, resulting in brittle deployments and complex maintenance.',
    solution: 'Engineered a modular MVC-style REST API using Express and Node.js coupled with MongoDB schema definitions. The client communicates asynchronously via structured JSON payloads with client-side input validation and error boundaries.',
    features: [
      'Modular RESTful API routing architecture with separation of controllers and services',
      'Document schema validation and indexing for reliable data operations',
      'Responsive user interface designed for mobile, tablet, and desktop viewports',
      'Comprehensive error handling middleware and structured JSON error responses',
      'Stateless request processing designed to scale across compute instances'
    ],
    technologies: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'CSS', 'HTML'],
    featured: true,
    githubUrl: 'https://github.com/#',
    liveUrl: 'https://#',
    badge: 'Featured Project',
    screenshots: []
  },
  {
    id: 'database-management-system',
    title: 'Relational Database & Query Engine',
    tagline: 'High-integrity relational schema design with optimized queries and transactions',
    description: 'Structured database application designed with MySQL and SQL stored procedures, supporting relational schemas, indexing, and transactional integrity.',
    overview: 'A robust database engineering project focused on normal form principles (1NF through BCNF), foreign key constraints, composite index optimization, and transactional ACID guarantees.',
    problem: 'Unstructured data access and unindexed multi-table queries lead to slow response times, read/write locks, and data redundancy as data volume expands.',
    solution: 'Designed normalized relational entity-relationship models, implemented stored procedures for complex operational transactions, and tested performance gains using SQL query profiling and indexes.',
    features: [
      'Normalized relational schemas up to 3NF/BCNF ensuring zero insertion/deletion anomalies',
      'Stored procedures and triggers enforcing business constraints at the database tier',
      'Composite indexing strategies yielding significant query execution time reductions',
      'ACID transaction control blocks preventing inconsistent intermediate states',
      'Python database connector scripts for automated data seeding and stress testing'
    ],
    technologies: ['SQL', 'MySQL', 'Python'],
    featured: true,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Systems',
    screenshots: []
  },
  {
    id: 'interactive-android-utility',
    title: 'Mobile Utility Application',
    tagline: 'Native Android application focused on productivity, local caching, and clean UI',
    description: 'Native Android application designed for everyday productivity with structured UI components, local state caching, and responsive material layouts.',
    overview: 'An Android application built natively using Java and Android Studio, providing offline-first capabilities, activity lifecycles management, and intuitive material design components.',
    problem: 'Users frequently require quick utilities that function without continuous network connectivity, requiring robust local storage and graceful lifecycle recovery.',
    solution: 'Implemented structured Android Activities and Fragments backed by local persistence, ensuring quick launch times and persistent user settings.',
    features: [
      'Native Android activity lifecycle management preventing memory leaks',
      'Responsive XML layouts adaptable to varied screen densities and orientations',
      'Local state persistence for instant data availability without network dependence',
      'Material design interface elements with accessible contrast and touch targets'
    ],
    technologies: ['Android', 'Java'],
    featured: false,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Mobile',
    screenshots: []
  },
  {
    id: 'iot-embedded-system',
    title: 'Smart Embedded Sensor Controller',
    tagline: 'Microcontroller firmware for real-time sensor processing and actuator feedback',
    description: 'Hardware automation prototype leveraging Arduino microcontroller architecture and C++ firmware for real-time sensor monitoring and signal feedback.',
    overview: 'An embedded systems prototype combining C++ firmware programming with hardware sensors and actuators to capture environmental telemetry in real time.',
    problem: 'Hardware environments require low-latency sensor sampling without blocking execution or exhausting limited microchip memory.',
    solution: 'Wrote non-blocking firmware loops in C++ using hardware timer interrupts and serial communication protocols for continuous sensor telemetry.',
    features: [
      'Real-time analog and digital sensor input processing with minimal latency',
      'Non-blocking event-driven loop structure avoiding synchronous delay bottlenecks',
      'Serial telemetry streaming formatted for monitoring and downstream analysis',
      'Hardware actuator control responding immediately to configured threshold events'
    ],
    technologies: ['Arduino', 'C++'],
    featured: false,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Hardware',
    screenshots: []
  },
  {
    id: 'interactive-3d-simulation',
    title: 'Interactive 3D Engine Simulation',
    tagline: 'Physics-based real-time 3D simulation with component-based mechanics',
    description: 'Interactive real-time 3D simulation developed in Unity exploring physics interactions, component architectures, and responsive camera controllers.',
    overview: 'A real-time interactive 3D simulation implemented in Unity, exploring physics simulation, collision mechanics, lighting calculations, and modular scene architecture.',
    problem: 'Simulating multi-body physical interactions in real-time requires balancing compute cycles with smooth frame rates and reliable player feedback.',
    solution: 'Utilized Unity component-driven architecture with optimized collision meshes, raycasting, and decoupled camera controller scripts.',
    features: [
      'Component-oriented design separating physics, rendering, and interaction logic',
      'Rigid-body dynamics and customized collider configurations',
      'Dynamic lighting and material shading optimized for smooth frame rates',
      'Configurable camera perspectives with smooth interpolations'
    ],
    technologies: ['Unity', 'C++'],
    featured: false,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Graphics',
    screenshots: []
  }
];

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
  hackathons: [
    {
      title: 'Engineering Hackathon Participant',
      role: 'Developer & Team Member',
      period: 'Hackathon Track',
      organization: 'Student Technical Community',
      description: 'Collaborated under rapid turnaround constraints to prototype software solutions addressing real-world problem statements.'
    }
  ],
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
  certifications: [
    {
      title: 'Foundational Software Engineering Track',
      role: 'Certified Learner',
      period: 'Verified Coursework',
      organization: 'Technical Learning Platform',
      description: 'Completed comprehensive technical modules covering core programming, database normalization, and web fundamentals.'
    }
  ]
};
