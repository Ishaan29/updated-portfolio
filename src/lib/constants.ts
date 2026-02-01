export const techStack = {
    Languages: ["Java", "Python", "Go", "JavaScript", "TypeScript"],
    Frameworks: ["Spring Boot", "FastAPI", "Node.js", "React", "Next.js"],
    Infrastructure: ["AWS (Lambda, S3, Glue, DynamoDB)", "Kubernetes", "Docker", "Terraform"],
    Databases: ["PostgreSQL", "MongoDB", "Redis", "DynamoDB"],
    Messaging: ["Kafka", "RabbitMQ"],
    Tools: ["Git", "CI/CD", "Jira"],
};

export const experiences = [
    {
        company: "CATT Labs (UMD)",
        role: "Software Analyst Intern",
        period: "2024 — Present",
        summary: "Driving quality and delivery excellence for transit research systems used by urban planners across US",
        description: [

            "Spearheaded end-to-end feature development from requirement elicitation to testing, reducing requirement drift by 20% and accelerating delivery time by 30%",
            "Developing requirements and quality assurance frameworks for transportation research systems",
            "Established comprehensive testing framework with JUnit, Cypress, and Selenium achieving 90% code coverage and 95% defect detection rate",
            "Orchestrated CI/CD pipeline with automated testing gates using Jenkins, preventing production defects and reducing validation cycles by 30%"
        ],
        technologies: ["PART-TIME (On UMD Campus)", "Javascript", "Python", "Java", "Cypress", "Selenium", "Playwrite", "Jenkins", "Jira"],
    },
    {
        company: "Velotio Technologies",
        role: "Software Engineer Backend",
        period: "2024 - 2024",
        summary: "Led backend architecture for an enterprise IoT platform enabling real-time telemetry processing and analytics",
        description: [
            "Architected IoT telemetry platform processing 100K+ data points/sec with sub-10ms latency, achieving 99.9% reliability using event-driven architecture",
            "Optimized scalable data ingestion pipeline with Java/Spring Boot, Kafka, and Redis caching, improving throughput by 30% and reducing infrastructure costs by $5K/month",
            "Deployed AWS infrastructure (EKS, ALB, RDS) using Terraform IaC, supporting 3x auto-scaling with zero-downtime deployments",
            "Led performance tuning for TCP/IP and MQTT protocols, achieving 150ms round-trip latency handling 2K concurrent device connections",
            "Mentored junior engineers on microservices design patterns, code reviews, and distributed systems best practices"
        ],
        technologies: ["Java", "Spring Boot", "Kafka", "Redis", "PostgreSQL", "AWS", "Kubernetes", "Terraform"],
    },
    {
        company: "Gainsight",
        role: "Software Engineer Backend",
        period: "2023 - 2024",
        summary: "Owned the analytics,observability and notification stack for Gainsight's multi-tenant SaaS platform serving 400+ enterprise customers.",
        description: [
            "Pioneered RAG-based analytics microservice processing 10TB data across 400+ tenants, achieving 99.95% uptime using circuit breakers and retry patterns",
            "Implemented multi-tenant architecture using Java, Python, and PGVector embeddings with Delta Lake, reducing query response time by 45%",
            "Transformed ETL workflows with Apache Airflow orchestration, automatic retry mechanisms, and data validation, delivering 2x performance through partition optimization",
            "Revolutionized system observability by deploying custom OpenTelemetry SDK with distributed tracing across 12 microservices, reducing MTTR by 50%",
            "Migrated 5+ services to Kubernetes with Helm charts, improving deployment reliability by 60% and establishing blue-green deployment strategy"
        ],
        technologies: ["Java", "Python", "PgVec", "Postgress", "AWS Glue", "S3", "DynamoDB", "Delta Lake", "Apache Airflow", "OpenTelemetry", "Kubernetes", "Helm"]
    },
    {
        company: "Gainsight",
        role: "Associate Software Engineer",
        period: "2021 — 2023",
        summary: "Built core notification infrastructure powering real-time alerts and third-party integrations for over 1 million end users globally.",
        description: [
            "Developed high-reliability notification engine serving 1M+ users with 80ms p99 latency and 99.99% availability using event sourcing pattern",
            "Integrated data pipelines with Slack and Microsoft Graph APIs using OAuth 2.0, processing 5K messages/sec with fault-tolerant dead letter queues",
            "Diagnosed and resolved 100+ production incidents through root cause analysis, reducing recurring issues by 80% and driving operational cost savings",
            "Achieved 85% test coverage across Node.js microservices using Jest, Mocha, and contract testing with Pact framework"
        ],
        technologies: ["Node.js", "TypeScript", "OAuth 2.0", "Slack API", "Microsoft Graph API", "Event Sourcing", "Jest", "Mocha"]
    },
];

export const projects = [
    {
        title: "Distributed Vector Database",
        description:
            "A high-performance vector database optimized for similarity search using SIMD instructions and custom indexing strategies. Awarded AWS re:Inforce grant for security research applications.",
        tech: ["Go", "HNSW", "FAISS", "gRPC", "Docker", "Kubernetes"],
        links: {
            github: "https://github.com/Ishaan29/vectorDB",

        },
        image: "/projects/vector-db.png",
    },
    {
        title: "TerpSpark Backend",
        description:
            "A full RBAC plus events management system. Provides a robust REST API for managing campus events, including user authentication, event discovery with advanced filtering, and a repository pattern architecture.",
        tech: ["FastAPI", "PostgreSQL", "SQLAlchemy", "JWT", "Pydantic", "Pytest"],
        links: {
            github: "https://github.com/Ishaan29/terpspark-backend",
        },
        image: "/projects/terpspark.png",
    },
    {
        title: "EKS Microservices",
        description:
            "Automated CI/CD pipeline for deploying e-commerce microservices on AWS EKS. Features automatic Docker image building, ECR push, Kubernetes deployment automation, and version tagging.",
        tech: ["Kubernetes", "AWS EKS", "Docker", "GitHub Actions", "Terraform"],
        links: {
            github: "https://github.com/Ishaan29/eks-microservices",
        },
        image: "/projects/eks.png",
    },
    {
        title: "Otel Telemetry Platform",
        description:
            "Scalable real-time telemetry ingestion and processing platform for distributed systems observability.",
        tech: ["Java", "Spring Boot", "Kafka", "Redis", "PostgreSQL", "OpenTelemetry"],
        links: {
            github: "https://github.com/Ishaan29/ENPM-818N-Group-12",
        },
        image: "/projects/otel.png",
    },
    {
        title: "AI Desktop Assistant",
        description:
            "Intelligent desktop assistant that orchestrates multiple LLM providers (Anthropic, OpenAI) for context-aware task completion and workflow automation.",
        tech: ["Python", "FastAPI", "LangChain", "React", "Electron"],
        links: {
            github: "#",
            external: "#",
        },
    },
];

export const otherProjects: Array<{
    title: string;
    description: string;
    tech: string[];
    links: {
        github?: string;
        external?: string;
    };
    image?: string;
}> = [
        // {
        //     title: "AWS Glue ETL Pipeline",
        //     description:
        //         "Automated data pipeline for processing and transforming large datasets using AWS Glue and S3.",
        //     tech: ["AWS Glue", "Python", "S3"],
        //     links: {
        //         github: "#",
        //     },
        // },
        // {
        //     title: "Terrapin Attack Analysis",
        //     description:
        //         "Security research and analysis of the Terrapin attack on SSH protocol vulnerabilities.",
        //     tech: ["Security", "SSH", "Cryptography"],
        //     links: {
        //         github: "#",
        //     },
        // },
        // {
        //     title: "RAG Analytics System",
        //     description:
        //         "Retrieval-Augmented Generation system for analyzing complex documents and generating insights.",
        //     tech: ["Python", "LangChain", "OpenAI"],
        //     links: {
        //         github: "#",
        //     },
        // },
        // {
        //     title: "SOAP Protocol Vulnerability",
        //     description:
        //         "Assessment and demonstration of security vulnerabilities in SOAP-based web services.",
        //     tech: ["Security", "SOAP", "XML"],
        //     links: {
        //         github: "#",
        //     },
        // },
        // {
        //     title: "Docker/QEMU Networking Lab",
        //     description:
        //         "Virtual networking lab environment using Docker and QEMU for network simulation.",
        //     tech: ["Docker", "QEMU", "Networking"],
        //     links: {
        //         github: "#",
        //     },
        // },
    ];

export const recentActivity = [

    {
        title: "AWS re:Invent",
        description: "Placeholder for AWS re:Invent activity. Details about the session, workshop, or research presented.",
        date: "Dec 2025",
        links: {
            external: "https://reinvent.awsevents.com/"
        },
        image: "/projects/reinvent.png"
    },
    {
        title: "AWS re:Inforce",
        description: "Placeholder for AWS re:Inforce activity. Details about the session, workshop, or research presented.",
        date: "June 2025",
        links: {
            external: "https://reinforce.awsevents.com/"
        },
        image: "/projects/reinforce.png"
    }
];

export const resumeUrl = "/Resume_Eshaan_Bajpai.pdf";

export const availabilityStatus = "Interviewing now and available to work from May 2026";

export const testimonials = [
    {
        name: "Lavneesh Chandna",
        role: "Backend Software Engineer",
        company: "Salesforce",
        connection: "Lavneesh was senior to Eshaan and worked with him on the same team",
        text: "It's been a genuine pleasure working alongside Eshaan. I've had the opportunity to witness Eshaan's professional growth firsthand, and I can attest to his exceptional skills, work ethic, and contribution to our projects. Eshaan possesses a rare combination of technical expertise and creativity, which he brought to every aspect of our software development process. He consistently delivered high-quality code, demonstrating a deep understanding of the technologies being used, and always showed a keen interest in exploring new technologies and methodologies to improve our work.",
        image: "/images/lavneesh.png"
    },
    {
        name: "Vishwajeet Singh Chauhan",
        role: "Staff @Servicenow",
        company: "ServiceNow",
        connection: "Vishwajeet was senior to Eshaan and worked with him on the same team",
        text: "I had the pleasure of working with Eshaan for the past two years at Gainsight. He consistently impressed me with his technical skills, collaborative spirit, and dedication to continuous learning.\n\nOne thing that greatly impressed me was Eshaan's ability to quickly onboard a new tech stack. He demonstrated this by excelling in Node.js while simultaneously working on Java backend systems. Beyond his technical expertise, Eshaan's ability to understand business requirements and translate them into technical solutions proved crucial. He actively participated in knowledge sharing and mentorship initiatives within the team, inspiring others and contributing to a positive team culture.",
        image: "/images/vishwajeet.png"
    },
    {
        name: "Pallavi Gajbhiye",
        role: "Engineering Manager",
        company: "Gainsight",
        connection: "Pallavi managed Eshaan directly",
        text: "Working with Eshaan at Gainsight has been a transformative experience for our team, largely due to his critical expertise and contributions. His outstanding technical expertise and capacity for solving complex problems have left a lasting impression on the team.\n\nHis strategic thinking and analytical skills have enabled us to overcome complex challenges and deliver solutions that exceed expectations. His expertise spans technologies like Node, Java, Elastic search etc. His eagerness to embrace challenges, coupled with his technical acumen, has driven our team to explore innovative solutions and continuously improve our workflows.\nBeyond the technical skills, Eshaan was always ready to lend a hand to teammates, exemplifying what it means to work collaboratively.",
        image: "/images/pallavi.png"
    },
    {
        name: "Mani Kumar",
        role: "Engineering @Nielsen",
        company: "Nielsen",
        connection: "Mani worked with Eshaan on the same team",
        text: "Eshaan is the most curious and passionate teammate I got to work with. We worked together for more than 2 years at Gainsight, and all I have seen is Eshaan quickly adapting to changes and learning new tech stack to contribute to multiple projects, he worked in and out of the problems given to him covering all the edge cases, which needed very little to no quality validation from QA. He is capable of building scalable solutions and writing code thats very easy to understand and maintain.",
        image: "/images/mani.png"
    },
    {
        name: "Madgula Amit",
        role: "GenAI Engineer and Researcher, Principal Engineer",
        company: "Gainsight",
        connection: "Madgula was senior to Eshaan and worked with him on the same team",
        text: "I have worked with Eshaan for almost 2 years. He's an excellent team player, technical, and good problem solver. Working with him has been an absolute pleasure. He's an expert in NodeJs, Java, Backend systems. We have worked in 3 projects together. I greatly appreciate his humility.",
        image: "/images/amit.png"
    }

];

