import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import userModel from './models/userModel.js';
import projectModel from './models/projectModel.js';
import connectDB from './config/mongodb.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();
console.log('Connected to MongoDB...');

// Clear existing data
const clearDatabase = async () => {
  try {
    await userModel.deleteMany({});
    console.log('Users collection cleared');
    await projectModel.deleteMany({});
    console.log('Projects collection cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

// Departments
const departments = [
  "BRAC Business School",
  "BSRM School of Engineering",
  "School of Law",
  "School of Pharmacy",
  "School of Architecture and Design",
  "School of Humanities and Social Sciences",
  "School of General Education",
  "James P Grant School of Public Health"
];

// Generate faculty users
const createFaculty = async () => {
  console.log('Creating faculty users...');
  const facultyUsers = [];
  
  const facultyData = [
    {
      name: 'Dr. Saiful Islam',
      email: 'saiful.islam@bracu.ac.bd',
      department: "BSRM School of Engineering",
      bio: 'Professor of Computer Science with 15 years of experience in AI and machine learning research.',
      interests: ['Artificial Intelligence', 'Machine Learning', 'Neural Networks', 'Data Science'],
      theme: 'dark'
    },
    {
      name: 'Dr. Farhana Ahmed',
      email: 'farhana.ahmed@bracu.ac.bd',
      department: "BRAC Business School",
      bio: 'Associate Professor specializing in finance and economic development.',
      interests: ['Finance', 'Economics', 'Market Analysis', 'Business Strategy'],
      theme: 'light'
    },
    {
      name: 'Dr. Md. Rahman',
      email: 'md.rahman@bracu.ac.bd',
      department: "School of Pharmacy",
      bio: 'Research focus on pharmaceutical development and drug delivery systems.',
      interests: ['Pharmaceutical Science', 'Drug Delivery', 'Medicinal Chemistry', 'Biotechnology'],
      theme: 'light'
    },
    {
      name: 'Dr. Nusrat Jahan',
      email: 'nusrat.jahan@bracu.ac.bd',
      department: "School of Humanities and Social Sciences",
      bio: 'Working on anthropological studies of indigenous communities in Bangladesh.',
      interests: ['Anthropology', 'Indigenous Studies', 'Cultural Heritage', 'Social Development'],
      theme: 'dark'
    },
  ];

  for (const faculty of facultyData) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newFaculty = new userModel({
      name: faculty.name,
      email: faculty.email,
      password: hashedPassword,
      role: 'faculty',
      department: faculty.department,
      profile: {
        bio: faculty.bio,
        interests: faculty.interests
      },
      preferences: {
        theme: faculty.theme
      }
    });
    
    await newFaculty.save();
    facultyUsers.push(newFaculty);
  }
  
  return facultyUsers;
};

// Generate student users
const createStudents = async () => {
  console.log('Creating student users...');
  const studentUsers = [];
  
  const studentData = [
    {
      name: 'Fahim Ahmed',
      email: 'fahim.ahmed@g.bracu.ac.bd',
      department: "BSRM School of Engineering",
      bio: 'Final year CSE student interested in web development and AI.',
      interests: ['Web Development', 'JavaScript', 'React', 'Machine Learning'],
      theme: 'dark'
    },
    {
      name: 'Tasnim Rahman',
      email: 'tasnim.rahman@g.bracu.ac.bd',
      department: "BRAC Business School",
      bio: 'BBA student focusing on marketing and digital strategies.',
      interests: ['Marketing', 'Digital Strategy', 'Social Media', 'Business Analysis'],
      theme: 'light'
    },
    {
      name: 'Ismail Hossain',
      email: 'ismail.hossain@g.bracu.ac.bd',
      department: "School of Law",
      bio: 'Law student researching digital privacy laws in Bangladesh.',
      interests: ['Digital Law', 'Privacy Rights', 'Cyber Security', 'Legal Research'],
      theme: 'light'
    },
    {
      name: 'Maliha Khan',
      email: 'maliha.khan@g.bracu.ac.bd',
      department: "School of Architecture and Design",
      bio: 'Architecture student interested in sustainable urban design.',
      interests: ['Urban Design', 'Sustainability', '3D Modeling', 'Green Architecture'],
      theme: 'dark'
    },
    {
      name: 'Shahriar Kabir',
      email: 'shahriar.kabir@g.bracu.ac.bd',
      department: "School of Pharmacy",
      bio: 'Researching natural compounds with medicinal properties.',
      interests: ['Natural Medicine', 'Biochemistry', 'Drug Research', 'Herbal Remedies'],
      theme: 'dark'
    },
    {
      name: 'Nusaiba Haque',
      email: 'nusaiba.haque@g.bracu.ac.bd',
      department: "School of Humanities and Social Sciences",
      bio: 'Studying cultural anthropology with focus on rural communities.',
      interests: ['Anthropology', 'Rural Studies', 'Field Research', 'Cultural Studies'],
      theme: 'light'
    },
  ];

  for (const student of studentData) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newStudent = new userModel({
      name: student.name,
      email: student.email,
      password: hashedPassword,
      role: 'student',
      department: student.department,
      profile: {
        bio: student.bio,
        interests: student.interests
      },
      preferences: {
        theme: student.theme
      }
    });
    
    await newStudent.save();
    studentUsers.push(newStudent);
  }
  
  return studentUsers;
};

// Create projects
const createProjects = async (facultyUsers, studentUsers) => {
  console.log('Creating projects...');
  
  const projectsData = [
    {
      title: 'AI-Based Disease Prediction System',
      description: 'Development of a machine learning model that can predict potential diseases based on symptoms and patient history.',
      status: 'approved',
      department: "BSRM School of Engineering",
      progressPercentage: 35,
      tags: ['AI', 'Machine Learning', 'Healthcare', 'Data Science']
    },
    {
      title: 'Economic Impact of COVID-19 on SMEs',
      description: 'Research study analyzing how small and medium enterprises in Bangladesh were affected by the COVID-19 pandemic, and strategies for recovery.',
      status: 'ongoing',
      department: "BRAC Business School",
      progressPercentage: 70,
      tags: ['Economics', 'COVID-19', 'Business', 'SME']
    },
    {
      title: 'Novel Drug Delivery System for Cancer Treatment',
      description: 'Developing a targeted drug delivery mechanism that can improve efficacy of cancer treatment while reducing side effects.',
      status: 'proposed',
      department: "School of Pharmacy",
      progressPercentage: 0,
      tags: ['Pharmacy', 'Cancer Research', 'Drug Delivery', 'Medicine']
    },
    {
      title: 'Sustainable Urban Design for Climate Adaptation',
      description: 'Creating architectural guidelines and models for urban spaces that can adapt to changing climate conditions in Bangladesh.',
      status: 'ongoing',
      department: "School of Architecture and Design",
      progressPercentage: 45,
      tags: ['Architecture', 'Climate Change', 'Urban Design', 'Sustainability']
    },
    {
      title: 'Indigenous Knowledge Systems in Modern Bangladesh',
      description: 'Documentation and analysis of indigenous knowledge systems and their relevance to contemporary challenges in Bangladesh.',
      status: 'approved',
      department: "School of Humanities and Social Sciences",
      progressPercentage: 20,
      tags: ['Anthropology', 'Indigenous Studies', 'Cultural Heritage', 'Knowledge Systems']
    }
  ];

  for (let [index, projectData] of projectsData.entries()) {
    const facultyUser = facultyUsers[index % facultyUsers.length];
    const relatedStudents = studentUsers.filter(
      student => student.department === projectData.department
    );
    
    const project = new projectModel({
      title: projectData.title,
      description: projectData.description,
      status: projectData.status,
      progressPercentage: projectData.progressPercentage,
      initiator: facultyUser._id,
      mentor: facultyUser._id,
      department: projectData.department,
      tags: projectData.tags,
      openRoles: [
        {
          title: 'Research Assistant',
          description: 'Assist in data collection and analysis',
          isOpen: true
        },
        {
          title: 'Documentation Lead',
          description: 'Responsible for maintaining project documentation and reports',
          isOpen: true
        }
      ]
    });

    // Add some participants
    if (relatedStudents.length > 0) {
      const student1 = relatedStudents[0];
      project.participants.push({
        user: student1._id,
        role: 'Research Assistant',
        status: 'accepted'
      });
      
      // Add a comment from this student
      project.comments.push({
        user: student1._id,
        text: `I've been working on the data collection phase and we're making good progress.`,
        createdAt: new Date(),
        replies: []
      });
    }
    
    if (relatedStudents.length > 1) {
      const student2 = relatedStudents[1];
      project.participants.push({
        user: student2._id,
        role: 'Technical Support',
        status: 'requested'
      });
    }

    // Add a comment from faculty
    project.comments.push({
      user: facultyUser._id,
      text: `Our next milestone is to complete the literature review by the end of this month.`,
      createdAt: new Date(),
      replies: []
    });

    await project.save();
  }
};

// Main function to run seeder
const seedDatabase = async () => {
  try {
    await clearDatabase();
    const facultyUsers = await createFaculty();
    const studentUsers = await createStudents();
    await createProjects(facultyUsers, studentUsers);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();