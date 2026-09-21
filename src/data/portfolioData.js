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
    github: 'https://github.com/#',
    linkedin: 'https://linkedin.com/in/#',
    leetcode: 'https://leetcode.com/#',
    spotify: 'https://open.spotify.com/user/#'
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
    description: 'A responsive full-stack platform built with Node.js, Express, and JavaScript featuring modular RESTful endpoints, database integration, and modern frontend styling.',
    technologies: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'CSS'],
    featured: true,
    githubUrl: 'https://github.com/#',
    liveUrl: 'https://#',
    badge: 'Featured Project'
  },
  {
    id: 'database-management-system',
    title: 'Relational Database & Query Engine',
    description: 'Structured database application designed with MySQL and SQL stored procedures, supporting relational schemas, indexing, and transactional integrity.',
    technologies: ['SQL', 'MySQL', 'Python'],
    featured: true,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Systems'
  },
  {
    id: 'interactive-android-utility',
    title: 'Mobile Utility Application',
    description: 'Native Android application designed for everyday productivity with structured UI components, local state caching, and responsive material layouts.',
    technologies: ['Android', 'Java'],
    featured: false,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Mobile'
  },
  {
    id: 'iot-embedded-system',
    title: 'Smart Embedded Sensor Controller',
    description: 'Hardware automation prototype leveraging Arduino microcontroller architecture and C++ firmware for real-time sensor monitoring and signal feedback.',
    technologies: ['Arduino', 'C++'],
    featured: false,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Hardware'
  },
  {
    id: 'interactive-3d-simulation',
    title: 'Interactive 3D Engine Simulation',
    description: 'Interactive real-time 3D simulation developed in Unity exploring physics interactions, component architectures, and responsive camera controllers.',
    technologies: ['Unity', 'C++'],
    featured: false,
    githubUrl: 'https://github.com/#',
    liveUrl: null,
    badge: 'Graphics'
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
