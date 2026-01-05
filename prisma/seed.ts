import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data in reverse dependency order
  console.log('Clearing existing data...')
  
  // Delete in reverse dependency order to handle foreign keys
  await prisma.keyFeature.deleteMany()
  await prisma.featuredProject.deleteMany()
  await prisma.project.deleteMany()
  await prisma.certification.deleteMany()
  await prisma.education.deleteMany()
  await prisma.softSkill.deleteMany()
  await prisma.advancedSkill.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.skillCategory.deleteMany()
  await prisma.focusArea.deleteMany()
  await prisma.personalValue.deleteMany()
  await prisma.journeyParagraph.deleteMany()
  await prisma.journey.deleteMany()
  await prisma.about.deleteMany()
  await prisma.hero.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  // Keep admin user, just update it
  
  console.log('Existing data cleared')

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  )

  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
    },
  })

  console.log('Admin user created:', adminUser.email)

  // Create Hero
  const existingHero = await prisma.hero.findFirst()
  const hero = existingHero
    ? await prisma.hero.update({
        where: { id: existingHero.id },
        data: {
          name: 'Aditya Pandey',
          title: 'B.Tech CSE Student & Full Stack Developer',
          description:
            'Passionate about building innovative web applications, exploring AI/ML technologies, and solving real-world problems through code.',
          imageUrl:
            'https://raw.githubusercontent.com/adityapandey-dev/adityapandey-dev/main/assets/images/aditya-photo.webp',
          linkedinUrl: 'https://www.linkedin.com/in/adityapandey-dev/',
          githubUrl: 'https://github.com/adityapandey-dev',
          email: 'adityapandey.dev.in@gmail.com',
          leetcodeUrl: 'https://leetcode.com/u/adityapandey-dev/',
        },
      })
    : await prisma.hero.create({
        data: {
          name: 'Aditya Pandey',
          title: 'B.Tech CSE Student & Full Stack Developer',
          description:
            'Passionate about building innovative web applications, exploring AI/ML technologies, and solving real-world problems through code.',
          imageUrl:
            'https://raw.githubusercontent.com/adityapandey-dev/adityapandey-dev/main/assets/images/aditya-photo.webp',
          linkedinUrl: 'https://www.linkedin.com/in/adityapandey-dev/',
          githubUrl: 'https://github.com/adityapandey-dev',
          email: 'adityapandey.dev.in@gmail.com',
          leetcodeUrl: 'https://leetcode.com/u/adityapandey-dev/',
        },
      })

  console.log('Hero created')

  // Create About
  const existingAbout = await prisma.about.findFirst()
  const about = existingAbout
    ? existingAbout
    : await prisma.about.create({
        data: {
      heading: 'About Me',
      subHeading:
        'Passionate developer with a focus on creating impactful solutions and continuous learning',
      journey: {
        create: {
          title: 'My Journey',
          paragraphs: {
            create: [
              {
                content:
                  "I'm a dedicated second-year B.Tech Computer Science student at Graphic Era Hill University, passionate about exploring the digital world through code. My journey in technology is driven by curiosity and a desire to create solutions that make a difference.",
                order: 0,
              },
              {
                content:
                  "Currently, I'm focusing on mastering the MERN Stack while also exploring AI and ML technologies. I believe in continuous learning and pushing my boundaries to grow as a developer.",
                order: 1,
              },
              {
                content:
                  "I'm particularly interested in the intersection of web development and artificial intelligence, where I see tremendous potential for creating intelligent, user-friendly applications that solve real problems.",
                order: 2,
              },
              {
                content:
                  "When I'm not coding, you might find me binge-watching the latest shows, exploring new technologies, or engaging with the developer community.",
                order: 3,
              },
            ],
          },
        },
      },
      values: {
        create: [
          { value: 'Curiosity', order: 0 },
          { value: 'Innovation', order: 1 },
          { value: 'Problem Solving', order: 2 },
          { value: 'Adaptability', order: 3 },
          { value: 'Continuous Learning', order: 4 },
        ],
      },
      focusAreas: {
        create: [
          {
            title: 'Full Stack Web Development',
            description:
              'Creating responsive, intuitive interfaces and robust backend systems with React, Node.js, Express, and MongoDB.',
            icon: 'web',
            order: 0,
          },
          {
            title: 'AI & Machine Learning',
            description:
              'Exploring artificial intelligence and machine learning applications using Python and TensorFlow.',
            icon: 'ai',
            order: 1,
          },
          {
            title: 'Competitive Programming',
            description:
              'Sharpening problem-solving skills through algorithmic challenges and data structure implementations in C++ and Python.',
            icon: 'cp',
            order: 2,
          },
          {
            title: 'Cloud Computing',
            description:
              'Building scalable and reliable applications using cloud services like AWS and Google Cloud.',
            icon: 'cloud',
            order: 3,
          },
        ],
      },
    },
  })

  console.log('About created')

  // Create Projects
  const projects = [
    {
      title: 'AtmosphereApp',
      description:
        'A sleek weather forecasting web application providing real-time weather updates for cities worldwide using the OpenWeather API.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'OpenWeather API'],
      icon: 'fas fa-cloud-sun',
      gradient: 'from-blue-400 to-indigo-500',
      githubUrl: 'https://github.com/adityapandey-dev/AtmosphereApp',
      liveDemoUrl: 'https://adityapandey-dev.github.io/AtmosphereApp/',
      order: 0,
    },
    {
      title: 'KeyForge Password Generator',
      description:
        'A secure password generator designed to create strong, unique, and customizable passwords with adjustable complexity.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Crypto'],
      icon: 'fas fa-key',
      gradient: 'from-indigo-500 to-purple-500',
      githubUrl:
        'https://github.com/adityapandey-dev/KeyForge-Secure-Password-Generator',
      liveDemoUrl:
        'https://adityapandey-dev.github.io/KeyForge-Secure-Password-Generator/',
      order: 1,
    },
    {
      title: 'NeoCalc iOS',
      description:
        'A dark-themed, sleek calculator inspired by the iOS design, built with web technologies for a seamless experience.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'UI Design'],
      icon: 'fas fa-calculator',
      gradient: 'from-gray-800 to-gray-900',
      githubUrl: 'https://github.com/adityapandey-dev/NeoCalc-iOS',
      liveDemoUrl: 'https://adityapandey-dev.github.io/NeoCalc-iOS/',
      order: 2,
    },
    {
      title: 'QRify QR Code Generator',
      description:
        'A web application designed to generate custom QR codes for URLs, text, and other types of data with ease.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'QR API'],
      icon: 'fas fa-qrcode',
      gradient: 'from-green-500 to-purple-500',
      githubUrl:
        'https://github.com/adityapandey-dev/QRify-QR-Code-Generator',
      liveDemoUrl:
        'https://adityapandey-dev.github.io/QRify-QR-Code-Generator/',
      order: 3,
    },
    {
      title: 'TaskMaster To-Do List',
      description:
        'A minimalistic to-do list application that helps organize and track daily tasks with local storage for persistence.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Local Storage'],
      icon: 'fas fa-tasks',
      gradient: 'from-yellow-400 to-orange-500',
      githubUrl:
        'https://github.com/adityapandey-dev/TaskMaster-To-Do-List',
      liveDemoUrl:
        'https://adityapandey-dev.github.io/TaskMaster-To-Do-List/',
      order: 4,
    },
    {
      title: 'TicTacToe Master',
      description:
        'A web-based version of the classic Tic-Tac-Toe game that supports both multiplayer and computer gameplay.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Game Logic'],
      icon: 'fas fa-gamepad',
      gradient: 'from-pink-500 to-red-500',
      githubUrl: 'https://github.com/adityapandey-dev/TicTacToe-Master',
      liveDemoUrl: 'https://adityapandey-dev.github.io/TicTacToe-Master/',
      order: 5,
    },
  ]

  const createdProjects = []
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: projectData,
    })
    createdProjects.push(project)
  }

  console.log('Projects created')

  // Create Featured Project for AtmosphereApp
  const atmosphereApp = createdProjects.find((p) => p.title === 'AtmosphereApp')
  if (atmosphereApp) {
    await prisma.featuredProject.create({
      data: {
        projectId: atmosphereApp.id,
        imageUrl:
          'https://raw.githubusercontent.com/adityapandey-dev/adityapandey-dev/main/assets/images/AtmosphereApp.png',
        technologies: [
          'HTML5',
          'CSS3',
          'JavaScript',
          'OpenWeather API',
          'Geolocation API',
          'Local Storage',
        ],
        keyFeatures: {
          create: [
            {
              feature: 'Real-time weather updates using OpenWeather API',
              order: 0,
            },
            {
              feature: 'Location-based weather tracking',
              order: 1,
            },
            {
              feature: '5-day forecast with detailed hourly predictions',
              order: 2,
            },
            {
              feature: 'Responsive design that works on mobile and desktop',
              order: 3,
            },
            {
              feature: 'Dynamic UI that changes based on weather conditions',
              order: 4,
            },
            {
              feature: 'Search history and favorite locations',
              order: 5,
            },
          ],
        },
      },
    })
    console.log('Featured project created for AtmosphereApp')
  }

  // Create Skills
  const skillCategories = [
    {
      title: 'Programming',
      icon: 'fas fa-code',
      order: 0,
      tags: ['HTML5', 'CSS3', 'TypeScript'],
      skills: [
        { name: 'JavaScript', level: 85, order: 0 },
        { name: 'Python', level: 80, order: 1 },
        { name: 'C++', level: 75, order: 2 },
        { name: 'Java', level: 70, order: 3 },
      ],
    },
    {
      title: 'Frontend',
      icon: 'fas fa-laptop-code',
      order: 1,
      tags: ['Tailwind CSS', 'Bootstrap', 'Redux'],
      skills: [
        { name: 'React.js', level: 90, order: 0 },
        { name: 'CSS Frameworks', level: 85, order: 1 },
        { name: 'Responsive Design', level: 85, order: 2 },
        { name: 'UI/UX Principles', level: 75, order: 3 },
      ],
    },
    {
      title: 'Backend',
      icon: 'fas fa-server',
      order: 2,
      tags: ['MySQL', 'Firebase', 'Authentication'],
      skills: [
        { name: 'Node.js', level: 85, order: 0 },
        { name: 'Express.js', level: 80, order: 1 },
        { name: 'MongoDB', level: 75, order: 2 },
        { name: 'REST APIs', level: 85, order: 3 },
      ],
    },
    {
      title: 'Tools & DevOps',
      icon: 'fas fa-tools',
      order: 3,
      tags: ['GitHub Actions', 'Docker', 'Deployment'],
      skills: [
        { name: 'Git & GitHub', level: 90, order: 0 },
        { name: 'VS Code', level: 95, order: 1 },
        { name: 'AWS', level: 70, order: 2 },
        { name: 'CI/CD', level: 65, order: 3 },
      ],
    },
  ]

  for (const categoryData of skillCategories) {
    const { skills, ...categoryInfo } = categoryData
    await prisma.skillCategory.create({
      data: {
        ...categoryInfo,
        skills: {
          create: skills,
        },
      },
    })
  }

  console.log('Skill categories created')

  // Create Advanced Skills
  const advancedSkills = [
    { category: 'ai', skill: 'Machine Learning Fundamentals', order: 0 },
    { category: 'ai', skill: 'Deep Learning Concepts', order: 1 },
    { category: 'ai', skill: 'Natural Language Processing', order: 2 },
    { category: 'ai', skill: 'TensorFlow, NumPy, Pandas', order: 3 },
    { category: 'ai', skill: 'Generative AI Applications', order: 4 },
    { category: 'cloud', skill: 'AWS (EC2, S3, Lambda)', order: 0 },
    { category: 'cloud', skill: 'Serverless Architecture', order: 1 },
    { category: 'cloud', skill: 'Ethical Hacking Basics', order: 2 },
    { category: 'cloud', skill: 'Mobile App Development', order: 3 },
    { category: 'cloud', skill: 'Responsive Web Design', order: 4 },
  ]

  for (const skillData of advancedSkills) {
    await prisma.advancedSkill.create({
      data: skillData,
    })
  }

  console.log('Advanced skills created')

  // Create Soft Skills
  const softSkills = [
    {
      title: 'Problem Solving',
      description: 'Analytical thinking with a systematic approach',
      order: 0,
    },
    {
      title: 'Team Collaboration',
      description: 'Effective communication in diverse teams',
      order: 1,
    },
    {
      title: 'Technical Communication',
      description: 'Explaining complex ideas clearly',
      order: 2,
    },
    {
      title: 'Time Management',
      description: 'Efficient task prioritization',
      order: 3,
    },
    {
      title: 'Attention to Detail',
      description: 'High focus on quality & precision',
      order: 4,
    },
    {
      title: 'Continuous Learning',
      description: 'Staying updated with latest tech',
      order: 5,
    },
  ]

  for (const skillData of softSkills) {
    await prisma.softSkill.create({
      data: skillData,
    })
  }

  console.log('Soft skills created')

  // Create Education
  const educationData = [
    {
      level: 'B.Tech',
      duration: '2023 - 2027 (Expected)',
      degree: 'Computer Science and Engineering',
      institution: 'Graphic Era Hill University, Bhimtal',
      description:
        "Currently pursuing my bachelor's degree with a focus on programming, data structures, algorithms, and system design. Actively involved in various technical projects and learning opportunities.",
      icon: 'fa-graduation-cap',
      bgColor: 'bg-blue-600',
      lightText: 'text-blue-100',
      pillBg: 'bg-blue-50',
      pillText: 'text-blue-600',
      skills: [
        'Data Structures',
        'Algorithms',
        'Web Development',
        'DBMS',
        'Object-Oriented Programming',
      ],
      order: 0,
    },
    {
      level: 'Senior Secondary',
      duration: 'Jan 2022 - Dec 2023',
      degree: 'Class XII (Science Stream)',
      institution: 'Nirmala Convent Sr. Sec. School, Kathgodam',
      description:
        'Completed higher secondary education with a focus on Physics, Chemistry, Mathematics, and Computer Science, providing a strong foundation in analytical and computational skills.',
      icon: 'fa-school',
      bgColor: 'bg-indigo-600',
      lightText: 'text-indigo-100',
      pillBg: 'bg-indigo-50',
      pillText: 'text-indigo-600',
      skills: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science'],
      order: 1,
    },
    {
      level: 'Secondary',
      duration: 'Jan 2020 - Dec 2021',
      degree: 'Class X',
      institution: 'Nirmala Convent Sr. Sec. School, Kathgodam',
      description:
        'Completed secondary education with a strong academic performance in a broad range of subjects including English, Hindi, Mathematics, Science, Social Science, and General Knowledge.',
      icon: 'fa-book',
      bgColor: 'bg-purple-600',
      lightText: 'text-purple-100',
      pillBg: 'bg-purple-50',
      pillText: 'text-purple-600',
      skills: ['Mathematics', 'Science', 'English', 'Social Studies'],
      order: 2,
    },
  ]

  for (const eduData of educationData) {
    await prisma.education.create({
      data: eduData,
    })
  }

  console.log('Education created')

  // Create Certifications
  const certifications = [
    {
      title: 'Ethical Hacking',
      description: 'Learn Ethical Hacking From Scratch 2024',
      organization: 'Udemy',
      date: 'September 2024',
      tags: ['Security', 'Network', 'Penetration Testing'],
      certificateUrl:
        'https://www.udemy.com/certificate/UC-f1a03422-d186-48bd-b60b-6b4cb195d250/',
      icon: 'fas fa-shield-alt',
      color: 'blue',
      order: 0,
    },
    {
      title: 'Version Control',
      description: 'Version Control Systems and Git',
      organization: 'Meta (Coursera)',
      date: 'September 2024',
      tags: ['Git', 'GitHub', 'Version Control'],
      certificateUrl:
        'https://www.coursera.org/account/accomplishments/records/BH1C4W96BGIE',
      icon: 'fas fa-code-branch',
      color: 'indigo',
      order: 1,
    },
    {
      title: 'Generative AI',
      description: 'Introduction to Generative AI Learning Path',
      organization: 'Google Cloud Training (Coursera)',
      date: 'September 2024',
      tags: ['AI', 'Machine Learning', 'Google Cloud'],
      certificateUrl:
        'https://www.coursera.org/account/accomplishments/specialization/FVK01WNX9LNY',
      icon: 'fas fa-robot',
      color: 'purple',
      order: 2,
    },
    {
      title: 'Responsible AI',
      description: 'Responsible AI: Applying AI Principles with Google Cloud',
      organization: 'Google Cloud Training (Coursera)',
      date: 'September 2024',
      tags: ['AI Ethics', 'Responsible AI'],
      certificateUrl:
        'https://www.coursera.org/account/accomplishments/records/LGDU0TJWHLL8',
      icon: 'fas fa-brain',
      color: 'purple',
      order: 3,
    },
    {
      title: 'JavaScript',
      description: 'Programming with JavaScript',
      organization: 'Meta (Coursera)',
      date: 'September 2024',
      tags: ['JavaScript', 'Programming', 'Web Development'],
      certificateUrl:
        'https://www.coursera.org/account/accomplishments/records/R1PGKIHD42J0',
      icon: 'fab fa-js',
      color: 'blue',
      order: 4,
    },
    {
      title: 'Large Language Models',
      description: 'Introduction to Large Language Models',
      organization: 'Google Cloud Skills Boost (Coursera)',
      date: 'September 2024',
      tags: ['LLMs', 'NLP', 'Machine Learning'],
      certificateUrl:
        'https://www.coursera.org/account/accomplishments/records/85GWVJ9UQPSH',
      icon: 'fas fa-comment-dots',
      color: 'purple',
      order: 5,
    },
  ]

  for (const certData of certifications) {
    await prisma.certification.create({
      data: certData,
    })
  }

  console.log('Certifications created')
  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

