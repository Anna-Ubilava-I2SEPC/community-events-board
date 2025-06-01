# Project: Community Events Board

## 👥 Team Information

- **Team Members**:  
  David Ramishvili - role1  
  Nana Kvirkvelia - role2  
  Anna Ubilava - role3

- **Selected Base Project**: Community Events Board

## 🎯 Project Vision

**Problem Statement**: People in small communities often miss out on local events due to lack of centralized, real-time communication.  
**Target Users**: Residents of a neighborhood or students on a university campus.  
**Value Proposition**: Provides a simple, accessible platform to share and discover events happening nearby without requiring complex logins or external tools.  
The architecture is designed with scalability in mind, allowing future enhancements such as user accounts, geolocation-based filtering, and broader community usage beyond a single campus or neighborhood.

## 🏗️ Architecture & Technical Design

### Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + TypeScript
- **Database**: MongoDB (probably:)
- **Deployment**: AWS [specify services - EC2, ECS, Lambda, etc.] (AWS EC2 (Node app), S3 (static React files), Route 53 (domain))
- **Testing**: Jest (backend), React Testing Library (frontend)

### System Architecture

- **Component Hierarchy**: App → EventList, EventForm
- **API Design**:
  - GET /events → Returns list of events
  - POST /events → Adds new event
- **Database Schema (Event)**: id (auto-generated), title, date, location, description
- **Authentication**: [will be handled later]

### Key Design Decisions

- Use of MongoDB: Simple document structure, easy to setup
- TypeScript enforced on both ends: Ensures consistency in Event structure
- No login/auth **yet** for MVP: Keeps the scope minimal

## 🧪 Test-Driven Development Strategy

- **Core Features to Test**:
  - creation form submission
  - Event list rendering
  - API communication
- **Testing Approach**:
  - Unit tests for backend routes
  - Integration tests for React + backend interaction
- **Test Coverage Goals**:
  - 90% test coverage on backend routes
  - 80% for frontend components

## 📦 Feature Breakdown

### Core Features (Must-Have)

- [ ] Submit an event (title, date, location, description)
- [ ] Display list of submitted events
- [ ] Store and fetch events via Node.js backend

### Enhanced Features (Nice-to-Have)

- [ ] Search bar and filtering by location/category
- [ ] User account creation and authentication
- [ ] Event deletion (admin-only, or specific authorization)

## 📅 4-Week Development Plan

### Week 1: Planning & Setup

- [ ] Project setup (React + Node + TypeScript)
- [ ] Database design and setup
- [ ] Basic project structure
- [ ] Initial test framework setup
- [ ] Environment configuration

### Week 2: Minimal App + Testing

- [ ] Core backend API endpoints
- [ ] Basic frontend components
- [ ] Write and run initial tests
- [ ] Database integration
- [ ] Authentication setup

### Week 3: Deployment + Development

- [ ] AWS deployment setup
- [ ] CI/CD pipeline (if applicable)
- [ ] Core feature development
- [ ] Test implementation for new features
- [ ] Performance optimization

### Week 4: Polish + Final Development

- [ ] Enhanced features implementation
- [ ] UI/UX improvements
- [ ] Comprehensive testing
- [ ] Documentation completion
- [ ] Final deployment and demo prep

## 🚀 Deployment Strategy

- **AWS Services**: [EC2, RDS, S3, etc.]
- **Environment Variables**: [How you'll manage config]
- **Database Hosting**: [AWS RDS, etc.]
- **Domain & SSL**: [If applicable]

## 📚 Documentation Plan

- **README**: Setup and run instructions
- **API Documentation**: Key endpoints and usage
- **Architecture Docs**: System design decisions
- **Testing Docs**: How to run tests and coverage
- **TODO.md**: Personal to-do list per team member

## 🤔 Potential Challenges & Solutions

- **Challenge 1**: [Technical challenge you anticipate]
  - _Solution approach_: [How you plan to address it]
- **Challenge 2**: [Another potential issue]
  - _Solution approach_: [Your strategy]

## 📈 Success Metrics

- **Functionality**: [How you'll measure if features work]
- **Code Quality**: [Linting, type safety, etc.]
- **Performance**: [Load times, responsiveness]
- **User Experience**: [Usability goals]

---

## 🎯 Grading Criteria (450 points total)

1. **Code Quality & Architecture** (120 pts - 27%)
2. **Testing Strategy & Implementation** (120 pts - 27%)
3. **Functionality & User Experience** (80 pts - 18%)
4. **Documentation & Technical Decisions** (80 pts - 18%)
5. **Deployment & DevOps** (50 pts - 11%)
