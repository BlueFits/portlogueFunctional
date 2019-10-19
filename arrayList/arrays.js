//Required Arrays
exports.countryList = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"];

//Occupation List

exports.occupationList = function() {
    let occupationRaw = `University Student
    Truck Driver
    College Student
    Software Engineer
    Project Manager
    Salesperson
    Registered Nurse
    Business Analyst
    Administrative Assistant
    Data Analyst
    Driver
    Customer Service Representative
    Travel Nurse
    Data Scientist
    Product Manager
    Financial Analyst
    Executive Assistant
    Account Manager
    Operations Manager
    Account Executive
    Senior Software Engineer
    Program Manager
    General Manager
    Owner
    Purchase Specialist
    Medical Doctor
    Member
    Delivery Driver
    Software Engineer Intern
    Associate
    Marketing Manager
    Sales Specialist
    Analyst
    Assistant Manager
    Retail Salesperson
    Operator
    Full Stack Engineer
    Volunteer
    Assistant Store Manager
    Cashier
    Licensed Practical Nurse
    Certified Nursing Assistant
    Cook
    Technician
    Recruiter
    Manager
    Sales Director
    Store Manager
    Director Of Operations
    Mechanical Engineer
    Business Development Manager
    Physical Therapist
    Customer Service Specialist
    Security Officer
    Senior Project Manager
    Customer Success Manager
    Data Engineer
    Marketing Coordinator
    Outside Sales Representative
    Regional Sales Manager
    Engineer
    DevOps Engineer
    Graphic Designer
    Marketing Director
    Human Resources Manager
    Food Service Worker
    Human Resources Business Partner
    System Engineer
    Sales Manager
    Java Software Engineer
    Senior Financial Analyst
    Warehouse Associate
    Human Resources Generalist
    Senior Product Manager
    Speech Language Pathologist
    Senior Accountant
    Receptionist
    Vice President
    Analytics Specialist
    Tutor
    Server
    Pharmacy Technician
    Caregiver
    Maintenance Technician
    Staff Accountant
    Shift Lead
    Chief Financial Officer
    Human Resources Director
    Frontend Developer
    Outside Sales
    Specialist
    English Teacher
    Project Engineer
    Controller
    Marketing Specialist
    Lead Sales Representative
    Emergency Room Nurse
    Massage Therapist
    Manufacturing Engineer
    System Administrator
    Coordinator
    Office Manager
    Researcher
    Company Driver
    Teacher
    Medical Assistant
    Human Resources Specialist
    Shift Manager
    Accountant
    Intern
    Automotive Technician
    Surgical Nurse
    Director
    Electrical Engineer
    Engineering Manager
    Service Technician
    Director Of Business Development
    Data Entry Specialist
    Quality Assurance Manager
    Vice President Operations
    Network Engineer
    Inside Sales Representative
    Senior Program Manager
    Retail Associate
    Solutions Architect
    Product Designer
    Associate Researcher
    Process Engineer
    Scientist
    Restaurant General Manager
    Occupational Therapist
    Insurance Sales Representative
    Host
    Product Marketing Manager
    Assistant
    Developer
    Senior Business Analyst
    Operations Associate
    Dishwasher
    Human Resources Coordinator
    Crew Member
    Vice President Sales
    Medical Surgical Nurse
    Chief Operating Officer
    Nurse Practitioner
    Sales Development Representative
    Operational Specialist
    Shift Supervisor
    Digital Marketing Manager
    Accounting Manager
    Maintenance Specialist
    Supervisor
    Quality Engineer
    Technical Program Manager
    User Experience Designer
    Assistant General Manager
    Housekeeper
    Lead
    Crew
    Information Technology Specialist
    Operations Analyst
    Paralegal
    Scrum Master
    Sales Executive
    Attorney
    Data Entry Clerk
    Machine Learning Engineer
    Junior Software Engineer
    Designer
    Social Media Manager
    Restaurant Manager
    Research Analyst
    Brand Manager
    Salesforce Developer
    Marketing Associate
    Quality Assurance Engineer
    Financial Director
    Summer Intern
    Finance Manager
    Program Coordinator
    Executive Director
    Buyer
    Chief Executive Officer
    Dotnet Developer
    Consultant
    Vice President Marketing
    Intensive Care Nurse
    Business System Analyst
    Mechanic
    Marketing Intern
    Team Lead
    Cloud Engineer
    Retail Specialist
    Event Specialist
    Marketing Assistant
    Merchandiser
    Business Intelligence Analyst
    Web Developer
    Store Associate
    Representative
    Digital Marketing Specialist
    Enterprise Account Executive
    Support Specialist
    Javascript Developer
    Office Assistant
    Design Engineer
    District Manager
    Analytics Manager
    Instructor
    Parttime Sales Associate
    Sales Consultant
    Product Owner
    Recruitment Coordinator
    Business Development Representative
    Copywriter
    Human Resources Assistant
    Bartender
    Director Of Information Technology
    Test Engineer
    Progressive Care Nurse
    Financial Advisor
    Senior Scientist
    Security Engineer
    Managing Director
    Creative Director
    Investment Analyst
    Senior Data Scientist
    Line Cook
    Construction Project Manager
    Software Engineering Manager
    Legal Assistant
    Associate Attorney
    Senior Analyst
    Producer
    Director of Product Management
    Production Supervisor
    Technical Writer
    Licensed Massage Therapist
    Delivery Specialist
    Area Manager
    Architect
    Communications Specialist
    Attendant
    Marketing Analyst
    Special Agent
    Quality Assurance Specialist
    Social Media Marketing Specialist
    Business Intelligence Developer
    Operations Coordinator
    Sales Account Executive
    Labor and Delivery Nurse
    Director Of Engineering
    Event Coordinator
    Senior Data Analyst
    Technical Project Manager
    Hairstylist
    Corporate Lawyer
    Sales Engineer
    Territory Sales Manager
    Information Technology Manager
    Event Manager
    Case Manager
    Electrician
    Tax Specialist
    Department Specialist
    Office Associate
    Production Assistant
    Accounts Payable Specialist
    Senior Marketing Manager
    Partnerships Manager
    Communications Manager
    Management Intern
    Information Technology Project Manager
    Plant Manager
    Senior Java Software Engineer
    Laboratory Technician
    Retail Merchandiser
    Vice President Finance
    Supply Chain Manager
    Mechanical Design Engineer
    Postdoctoral Researcher
    Senior System Engineer
    Counter Sales
    Restaurant Worker
    Engineer Intern
    User Experience Researcher
    Art Director
    Supply Chain Analyst
    Home Health Nurse
    Quality Assurance Analyst
    Nursing Manager
    Client Service Representative
    Teaching Specialist
    Relationship Manager
    Brand Representative
    Training Supervisor
    Clerk
    Store Assistant
    Civil Engineer
    Licensed Insurance Agent
    Talent Acquisition Specialist
    Research Assistant
    Assistant Operations Manager
    Training Specialist
    Production Manager
    Territory Manager
    Operations Supervisor
    Prep Cook
    Department Manager
    Business Specialist
    Medical Sales Representative
    Frontend Engineer
    Investment Banking Analyst
    Director Of Communications
    Logistics Manager
    Internship Program
    Senior Engineer
    Community Manager
    Security Professional
    Assistant Restaurant Manager
    Material Handler
    Assistant Project Manager
    Program Director
    Service Manager
    Regional Sales Director
    Technical Recruiter
    Vice President Human Resources
    Customer Service Manager
    Social Media Coordinator
    Pharmacist
    Keyholder
    Social Worker
    Application Developer
    Python Developer
    Medical Director
    Retail Store Manager
    Senior Manager
    Nurse
    Seasonal Sales Associate
    Real Estate Agent
    Property Manager
    General
    Senior Account Executive
    Video Editor
    Administrator
    Diesel Mechanic
    Chief Of Staff
    Program Specialist
    Area Sales Manager
    Lawyer
    Stylist
    Associate Product Manager
    Sales Account Manager
    Content Specialist
    Back End Developer
    System Analyst
    Application Engineer
    Strategy Manager
    Advocate
    Field Service Technician
    Life Insurance Agent
    Business Development Specialist
    Cyber Security Analyst
    Personal Assistant
    Associate General Counsel
    Writer
    Investigator
    Care Specialist
    Insurance Agent
    Software Developer In Test
    Senior Network Engineer
    Executive Administrative Assistant
    Android Developer
    Product Specialist
    Physician Assistant
    Warehouse Supervisor
    Editor
    Maintenance Supervisor
    Key Account Manager
    Home Health Aide
    Software Engineering Specialist
    Information Technology Support Specialist
    Industrial Engineer
    Machine Operator
    Office Coordinator
    Instructional Designer
    Bookkeeper
    Senior Data Engineer
    Vice President Of Business Development
    Account Coordinator
    Welder
    Direct Support Professional
    Construction Manager
    District Sales Manager
    Chief Information Officer
    Digital Specialist
    Photographer
    Investment Specialist
    Kitchen Staff
    Big Data Developer
    Administrative Specialist
    Account Director
    Superintendent
    Product Analyst
    iOS Developer
    President
    Maintenance Mechanic
    Staff Software Engineer
    Retail Assistant
    Control Engineer
    Forklift Operator
    Automation Engineer
    Junior Business Analyst
    Product Director
    Shopper
    Accounting Clerk
    Senior Vice President
    Data Specialist
    Strategy Director
    Quantitative Analyst
    Senior Operations Manager
    Principal
    Case Management Nurse
    Strategist
    Busser
    National Account Manager
    Branch Manager
    Phlebotomist
    Field Engineer
    Vice President Of Engineering
    Director Of Development
    Site Reliability Engineer
    Business Development Associate
    SQL Developer
    Warehouse Specialist
    Lead Software Engineer
    Senior Researcher
    Planner
    Cloud Architect
    SAP Specialist
    Service Coordinator
    Financial Planning and Analysis Manager
    Investment Associate
    Customer Specialist
    Engagement Manager
    Assistant Professor
    Finance Intern
    Accounts Receivable Specialist
    Embedded Software Engineer
    Product Engineer
    Credit Analyst
    Construction Superintendent
    General Counsel
    Content Writer
    Maintenance Manager
    Risk Analyst
    Facilities Manager
    Contract Specialist
    Worker
    Logistics Coordinator
    Human Resources Intern
    Family Physician
    Assistant Controller
    Technical Support Engineer
    Production Associate
    Barista
    Legal Counsel
    Stock Associate
    Assembler
    Content Manager
    Inspector
    Senior Human Resources Assistant
    Sales Assistant
    Digital Marketing Director
    Data Science Intern
    Senior Account Manager
    Security Analyst
    Strategic Account Manager
    Senior Associate
    Salesforce Administrator
    Database Administrator
    Quality Assurance Automation Engineer
    Dispatcher
    Administrative Coordinator
    Patient Care Technician
    Environment, Health and Safety Manager
    Portfolio Manager
    Associate Project Manager
    Technical Support Specialist
    Estimator
    Director Of Analytics
    Civil Servant
    Structural Engineer
    Safety Manager
    Package Handler
    Sales Coordinator
    PRN Nurse
    Research And Development Engineer
    Real Estate Analyst
    Porter
    Dental Assistant
    Visual Designer
    Private Equity Associate
    Supply Chain Specialist
    ETL Developer
    Environmental Health Safety Specialist
    Senior Mechanical Engineer
    Business Operations Manager
    Senior
    Senior Human Resources Business Partner
    Custodian
    Compliance Specialist
    Data Architect
    Teller
    Brand Associate
    Director of Learning and Development
    Hospitalist
    Respiratory Therapist
    Program Assistant
    Principal Software Engineer
    Sales Intern
    Stocker
    Production Coordinator
    Payroll Specialist
    Medical Technologist
    Talent Acquisition Manager
    Sales Lead
    Sales Support Specialist
    Food Service Specialist
    Clinical Research Associate
    Merchandise Associate
    Interface Specialist
    Senior Director
    Tax Manager
    Baker
    Service Supervisor
    Interior Designer
    Oncology Nurse
    Service Representative
    Senior Product Marketing Manager
    Teacher Assistant
    Business Data Analyst
    Content Strategist
    Laborer
    Environmental Specialist
    Accounting Specialist
    Valet
    Compliance Analyst
    Procurement Manager
    Coach
    Office Administrator
    Intelligence Analyst
    Special Education Teacher
    Associate Brand Manager
    Cardiac Catheterization Laboratory Nurse
    Finance Associate
    Chemist
    Infrastructure Engineer
    Production Specialist
    Program Associate
    Senior Consultant
    Counselor
    Cyber Security Specialist
    Field Services Engineer
    Cyber Security Engineer
    Contract Manager
    Medical Science Liaison
    Account Representative
    Financial Planning Analyst
    Ambassador
    Clinical Specialist
    Chief Technology Officer
    Plumber
    Entrepreneur
    Solutions Engineer
    Advisor
    Quality Assurance Tester
    Client Services Manager
    Speaker
    Professor
    Underwriter
    Trial Attorney
    Installer
    Senior Graphic Designer
    Retail Sales Specialist
    Senior Human Resources Recruiter
    Senior Administrative Assistant
    Category Manager
    Senior Auditor
    Scheduler
    Certified Medical Assistant
    Management Consultant
    Senior Technical Program Manager
    Support Associate
    Communications Coordinator
    Content Director
    Post Anesthesia Care Nurse
    Warehouse Manager
    Strategy Associate
    Support Engineer
    Director of Financial Planning and Analysis
    Strategy Analyst
    Certified Massage Therapist
    Engineering Technician
    Executive Chef
    Carpenter
    Executive Assistant To Chief Executive Officer
    Service Assistant
    School Psychologist
    Safety Specialist
    Sales Floor Associate
    Senior Developer
    Design Director
    Learning Specialist
    Head Of Marketing
    Sales Operations Manager
    Security Guard
    Food Specialist
    Repairer
    Associate Scientist
    Vice President Of Products
    Business Operations Analyst
    Janitor
    Customer Experience Manager
    Corporate Specialist
    Director Of Partnerships
    Wealth Manager
    Psychiatrist
    Senior Designer
    Compliance Manager
    Assistant General Counsel
    Sales Operations Analyst
    User Interface Designer
    Validation Engineer
    Head
    Director Program Management
    Management Analyst
    Corporate Recruiter
    Vice President Strategy
    Procurement Specialist
    Internal Auditor
    Associate Director
    Laboratory Assistant
    Care Coordinator
    Purchasing Manager
    Contract Administrator
    Mentor
    English Second Language Teacher
    Senior Dotnet Developer
    Room Attendant
    Customer Support Specialist
    Information Technology Business Analyst
    Supply Chain Director
    Retail Sales Consultant
    Senior Electrical Engineer
    Finance Specialist
    Growth Specialist
    Director Of Software Development
    Call Center Representative
    Head Of Human Resources
    Member Services Specialist
    Financial Controller
    Veterinarian
    Accounting Assistant
    Concierge
    Director of Product Marketing
    Adjunct Professor
    Supplier Quality Engineer
    Other
    Software Quality Assurance Engineer`;

    occupationRaw = occupationRaw.replace(/\n/g, ",").replace(/ {2,}/g, "");

    let occupationArray = occupationRaw.split(",");

    return occupationArray
}