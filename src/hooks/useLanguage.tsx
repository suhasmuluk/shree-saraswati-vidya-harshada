import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'mr';

const translations: Record<string, Record<Language, string>> = {
  // Sidebar & Navigation
  'nav.dashboard': { en: 'Dashboard', mr: 'डॅशबोर्ड' },
  'nav.students': { en: 'Students', mr: 'विद्यार्थी' },
  'nav.parents': { en: 'Parents', mr: 'पालक' },
  'nav.classes': { en: 'Classes', mr: 'वर्ग' },
  'nav.attendance': { en: 'Attendance', mr: 'उपस्थिती' },
  'nav.fees': { en: 'Fees', mr: 'शुल्क' },
  'nav.teachers': { en: 'Teachers', mr: 'शिक्षक' },
  'nav.staffSalary': { en: 'Staff Salary', mr: 'कर्मचारी वेतन' },
  'nav.teacherSummary': { en: 'Teacher Summary', mr: 'शिक्षक सारांश' },
  'nav.homework': { en: 'Homework', mr: 'गृहपाठ' },
  'nav.events': { en: 'Events', mr: 'कार्यक्रम' },
  'nav.announcements': { en: 'Announcements', mr: 'सूचना' },
  'nav.reports': { en: 'Reports', mr: 'अहवाल' },
  'nav.settings': { en: 'Settings', mr: 'सेटिंग्ज' },
  'nav.activityIdeas': { en: 'Activity Ideas', mr: 'उपक्रम कल्पना' },
  'nav.examResults': { en: 'Exam Results', mr: 'परीक्षा निकाल' },
  'nav.signOut': { en: 'Sign Out', mr: 'बाहेर पडा' },
  'nav.main': { en: 'Main', mr: 'मुख्य' },
  'nav.more': { en: 'More', mr: 'अधिक' },
  'nav.schoolAdmin': { en: 'School Admin', mr: 'शाळा व्यवस्थापन' },

  // Dashboard
  'dashboard.title': { en: 'Dashboard', mr: 'डॅशबोर्ड' },
  'dashboard.welcome': { en: 'Welcome to Shree Saraswati Vidya School Management', mr: 'श्री सरस्वती विद्या शाळा व्यवस्थापनात आपले स्वागत' },
  'dashboard.totalStudents': { en: 'Total Students', mr: 'एकूण विद्यार्थी' },
  'dashboard.totalTeachers': { en: 'Total Teachers', mr: 'एकूण शिक्षक' },
  'dashboard.presentToday': { en: 'Present Today', mr: 'आज उपस्थित' },
  'dashboard.pendingFees': { en: 'Fees Pending', mr: 'बाकी शुल्क' },
  'dashboard.announcements': { en: 'Announcements', mr: 'सूचना' },
  'dashboard.monthlyFee': { en: 'Monthly Fee Collection (₹)', mr: 'मासिक शुल्क संकलन (₹)' },
  'dashboard.recentAttendance': { en: 'Recent Attendance', mr: 'अलीकडील उपस्थिती' },
  'dashboard.recentAnnouncements': { en: 'Recent Announcements', mr: 'अलीकडील सूचना' },
  'dashboard.noFeeData': { en: 'No fee data yet.', mr: 'अद्याप शुल्क माहिती नाही.' },
  'dashboard.noAttendanceData': { en: 'No attendance data yet.', mr: 'अद्याप उपस्थिती माहिती नाही.' },
  'dashboard.noAnnouncements': { en: 'No announcements yet.', mr: 'अद्याप कोणतीही सूचना नाही.' },
  'dashboard.collected': { en: 'Collected', mr: 'जमा' },

  // Achievements
  'achievements.title': { en: 'Bright Students & Achievements', mr: 'हुशार विद्यार्थी आणि कामगिरी' },
  'achievements.bestAttendance': { en: '🌟 Best Attendance Stars', mr: '🌟 सर्वोत्तम उपस्थिती तारे' },
  'achievements.attendance': { en: 'attendance', mr: 'उपस्थिती' },
  'achievements.add': { en: 'Add Achievement', mr: 'कामगिरी जोडा' },
  'achievements.addTitle': { en: 'Add Student Achievement', mr: 'विद्यार्थ्याची कामगिरी जोडा' },
  'achievements.selectStudent': { en: 'Select Student', mr: 'विद्यार्थी निवडा' },
  'achievements.titleField': { en: 'Achievement Title *', mr: 'कामगिरीचे शीर्षक *' },
  'achievements.description': { en: 'Description (optional)', mr: 'वर्णन (ऐच्छिक)' },
  'achievements.sports': { en: 'Sports', mr: 'क्रीडा' },
  'achievements.academic': { en: 'Academic', mr: 'शैक्षणिक' },
  'achievements.arts': { en: 'Arts & Culture', mr: 'कला आणि संस्कृती' },
  'achievements.general': { en: 'General', mr: 'सामान्य' },
  'achievements.noAchievements': { en: 'No achievements added yet. Add your first bright student!', mr: 'अद्याप कोणतीही कामगिरी जोडलेली नाही. पहिला हुशार विद्यार्थी जोडा!' },
  'achievements.added': { en: 'Achievement added!', mr: 'कामगिरी जोडली!' },

  // Birthdays
  'birthday.title': { en: "Today's Birthdays", mr: 'आजचे वाढदिवस' },
  'birthday.today': { en: 'Today!', mr: 'आज!' },
  'birthday.inDays': { en: 'in {days} days', mr: '{days} दिवसांत' },
  'birthday.student': { en: 'Student', mr: 'विद्यार्थी' },
  'birthday.teacher': { en: 'Teacher', mr: 'शिक्षक' },

  // Class Attendance Summary
  'classAttendance.title': { en: "Today's Attendance by Class", mr: 'आजची वर्गनिहाय उपस्थिती' },
  'classAttendance.class': { en: 'Class', mr: 'वर्ग' },
  'classAttendance.total': { en: 'Total', mr: 'एकूण' },
  'classAttendance.present': { en: 'Present', mr: 'उपस्थित' },
  'classAttendance.absent': { en: 'Absent', mr: 'अनुपस्थित' },
  'classAttendance.notMarked': { en: 'Not Marked', mr: 'नोंद नाही' },
  'classAttendance.unassigned': { en: 'Unassigned', mr: 'वर्ग नाही' },

  // Students
  'students.title': { en: 'Students', mr: 'विद्यार्थी' },
  'students.addStudent': { en: 'Add Student', mr: 'विद्यार्थी जोडा' },
  'students.editStudent': { en: 'Edit Student', mr: 'विद्यार्थी संपादित करा' },
  'students.addNew': { en: 'Add New Student', mr: 'नवीन विद्यार्थी जोडा' },
  'students.totalStudents': { en: 'total students', mr: 'एकूण विद्यार्थी' },
  'students.name': { en: 'Student Name *', mr: 'विद्यार्थ्याचे नाव *' },
  'students.class': { en: 'Class', mr: 'वर्ग' },
  'students.parentName': { en: 'Parent Name *', mr: 'पालकांचे नाव *' },
  'students.phone': { en: 'Parent Phone *', mr: 'पालकांचा फोन *' },
  'students.search': { en: 'Search students...', mr: 'विद्यार्थी शोधा...' },
  'students.noStudents': { en: 'No students found.', mr: 'कोणताही विद्यार्थी सापडला नाही.' },
  'students.allClasses': { en: 'All Classes', mr: 'सर्व वर्ग' },
  'students.dob': { en: 'Date of Birth', mr: 'जन्मतारीख' },
  'students.gender': { en: 'Gender', mr: 'लिंग' },
  'students.male': { en: 'Male', mr: 'मुलगा' },
  'students.female': { en: 'Female', mr: 'मुलगी' },
  'students.other': { en: 'Other', mr: 'इतर' },
  'students.selectClass': { en: 'Select Class', mr: 'वर्ग निवडा' },
  'students.address': { en: 'Address', mr: 'पत्ता' },
  'students.admissionDate': { en: 'Admission Date', mr: 'प्रवेश तारीख' },
  'students.updateStudent': { en: 'Update Student', mr: 'विद्यार्थी अपडेट करा' },
  'students.noClass': { en: 'No class', mr: 'वर्ग नाही' },
  'students.parent': { en: 'Parent', mr: 'पालक' },
  'students.transport': { en: 'Transport', mr: 'वाहतूक' },
  'students.hasTransport': { en: 'Has Transport?', mr: 'वाहतूक आहे?' },
  'students.transportType': { en: 'Transport Type', mr: 'वाहतूक प्रकार' },
  'students.transportRoute': { en: 'Route', mr: 'मार्ग' },
  'students.bus': { en: 'Bus', mr: 'बस' },
  'students.car': { en: 'Car', mr: 'कार' },
  'students.van': { en: 'Van', mr: 'व्हॅन' },
  'students.noTransport': { en: 'Self', mr: 'स्वतः' },

  // Parents
  'parents.title': { en: 'Parents', mr: 'पालक' },
  'parents.subtitle': { en: 'View parent details and their children', mr: 'पालकांची माहिती आणि त्यांची मुले पहा' },
  'parents.search': { en: 'Search parents or students...', mr: 'पालक किंवा विद्यार्थी शोधा...' },
  'parents.noParents': { en: 'No parents found.', mr: 'कोणताही पालक सापडला नाही.' },

  // Classes
  'classes.title': { en: 'Classes', mr: 'वर्ग' },
  'classes.subtitle': { en: 'Overview of all classes', mr: 'सर्व वर्गांचा आढावा' },
  'classes.students': { en: 'Students', mr: 'विद्यार्थी' },
  'classes.notAssigned': { en: 'Not Assigned', mr: 'नियुक्त नाही' },

  // Attendance
  'attendance.title': { en: 'Attendance', mr: 'उपस्थिती' },
  'attendance.subtitle': { en: 'Mark daily attendance and view monthly reports', mr: 'दैनिक उपस्थिती नोंदवा आणि मासिक अहवाल पहा' },
  'attendance.markAttendance': { en: 'Mark daily attendance', mr: 'दैनिक उपस्थिती नोंदवा' },
  'attendance.daily': { en: 'Daily', mr: 'दैनिक' },
  'attendance.monthlyReport': { en: 'Monthly Report', mr: 'मासिक अहवाल' },
  'attendance.studentHistory': { en: 'Student History', mr: 'विद्यार्थी इतिहास' },
  'attendance.present': { en: 'Present', mr: 'उपस्थित' },
  'attendance.absent': { en: 'Absent', mr: 'अनुपस्थित' },
  'attendance.total': { en: 'Total', mr: 'एकूण' },
  'attendance.percentage': { en: 'Percentage', mr: 'टक्केवारी' },
  'attendance.selectStudent': { en: 'Select Student', mr: 'विद्यार्थी निवडा' },
  'attendance.studentWise': { en: 'Student-wise Monthly Attendance', mr: 'विद्यार्थी-निहाय मासिक उपस्थिती' },
  'attendance.student': { en: 'Student', mr: 'विद्यार्थी' },
  'attendance.class': { en: 'Class', mr: 'वर्ग' },
  'attendance.history': { en: 'Attendance History', mr: 'उपस्थिती इतिहास' },
  'attendance.records': { en: 'records', mr: 'नोंदी' },
  'attendance.totalDays': { en: 'Total Days', mr: 'एकूण दिवस' },
  'attendance.noRecords': { en: 'No attendance records found.', mr: 'उपस्थितीच्या नोंदी सापडल्या नाहीत.' },
  'attendance.noStudents': { en: 'No students found.', mr: 'कोणताही विद्यार्थी सापडला नाही.' },

  // Fees
  'fees.title': { en: 'Fee Management', mr: 'शुल्क व्यवस्थापन' },
  'fees.totalPending': { en: 'Total Pending', mr: 'एकूण बाकी' },
  'fees.recordFee': { en: 'Record Fee', mr: 'शुल्क नोंदवा' },
  'fees.recordPayment': { en: 'Record Fee Payment', mr: 'शुल्क पेमेंट नोंदवा' },
  'fees.paid': { en: 'Paid', mr: 'भरले' },
  'fees.pending': { en: 'Pending', mr: 'बाकी' },
  'fees.markPaid': { en: 'Mark Paid', mr: 'भरले म्हणून नोंदवा' },
  'fees.amount': { en: 'Amount (₹)', mr: 'रक्कम (₹)' },
  'fees.month': { en: 'Month', mr: 'महिना' },
  'fees.paymentMode': { en: 'Payment Mode', mr: 'पेमेंट मोड' },
  'fees.selectStudent': { en: 'Select Student', mr: 'विद्यार्थी निवडा' },
  'fees.selectMonth': { en: 'Select Month', mr: 'महिना निवडा' },
  'fees.allStatus': { en: 'All Status', mr: 'सर्व स्थिती' },
  'fees.searchStudent': { en: 'Search by student...', mr: 'विद्यार्थीनुसार शोधा...' },
  'fees.noRecords': { en: 'No fee records found.', mr: 'शुल्काच्या नोंदी सापडल्या नाहीत.' },
  'fees.cash': { en: 'Cash', mr: 'रोख' },
  'fees.upi': { en: 'UPI', mr: 'UPI' },
  'fees.online': { en: 'Online / Bank Transfer', mr: 'ऑनलाइन / बँक ट्रान्सफर' },
  'fees.cheque': { en: 'Cheque', mr: 'चेक' },

  // Teachers
  'teachers.title': { en: 'Teachers & Staff', mr: 'शिक्षक आणि कर्मचारी' },
  'teachers.subtitle': { en: 'teachers', mr: 'शिक्षक' },
  'teachers.staffMembers': { en: 'staff members', mr: 'कर्मचारी' },
  'teachers.addTeacher': { en: 'Add Teacher', mr: 'शिक्षक जोडा' },
  'teachers.editTeacher': { en: 'Edit Teacher', mr: 'शिक्षक संपादित करा' },
  'teachers.addStaff': { en: 'Add Staff', mr: 'कर्मचारी जोडा' },
  'teachers.editStaff': { en: 'Edit Staff', mr: 'कर्मचारी संपादित करा' },
  'teachers.staff': { en: 'Staff & Drivers', mr: 'कर्मचारी आणि चालक' },
  'teachers.teacherName': { en: 'Teacher Name *', mr: 'शिक्षकाचे नाव *' },
  'teachers.phone': { en: 'Phone *', mr: 'फोन *' },
  'teachers.assignClass': { en: 'Assign Class', mr: 'वर्ग नियुक्त करा' },
  'teachers.noTeachers': { en: 'No teachers added yet.', mr: 'अद्याप शिक्षक जोडलेले नाहीत.' },
  'teachers.noStaff': { en: 'No staff added yet.', mr: 'अद्याप कर्मचारी जोडलेले नाहीत.' },
  'teachers.notAssigned': { en: 'Not assigned', mr: 'नियुक्त नाही' },
  'teachers.staffName': { en: 'Name *', mr: 'नाव *' },
  'teachers.role': { en: 'Role *', mr: 'भूमिका *' },

  // Homework
  'homework.title': { en: 'Homework & Activities', mr: 'गृहपाठ आणि उपक्रम' },
  'homework.subtitle': { en: 'Assign homework and activities to classes', mr: 'वर्गांना गृहपाठ आणि उपक्रम द्या' },
  'homework.addHomework': { en: 'Add Homework', mr: 'गृहपाठ जोडा' },
  'homework.addTitle': { en: 'Add Homework / Activity', mr: 'गृहपाठ / उपक्रम जोडा' },
  'homework.titleField': { en: 'Title *', mr: 'शीर्षक *' },
  'homework.description': { en: 'Description', mr: 'वर्णन' },
  'homework.selectClass': { en: 'Select Class', mr: 'वर्ग निवडा' },
  'homework.noHomework': { en: 'No homework assigned yet.', mr: 'अद्याप गृहपाठ दिलेला नाही.' },
  'homework.due': { en: 'Due', mr: 'देय तारीख' },

  // Events
  'events.title': { en: 'Events & Calendar', mr: 'कार्यक्रम आणि दिनदर्शिका' },
  'events.subtitle': { en: 'Manage school events and important dates', mr: 'शाळेचे कार्यक्रम आणि महत्त्वाच्या तारखा व्यवस्थापित करा' },
  'events.addEvent': { en: 'Add Event', mr: 'कार्यक्रम जोडा' },
  'events.eventTitle': { en: 'Event Title *', mr: 'कार्यक्रमाचे शीर्षक *' },
  'events.saveEvent': { en: 'Save Event', mr: 'कार्यक्रम जतन करा' },
  'events.noEvents': { en: 'No events scheduled.', mr: 'कोणताही कार्यक्रम नियोजित नाही.' },
  'events.upcoming': { en: 'Upcoming', mr: 'आगामी' },
  'events.past': { en: 'Past', mr: 'मागील' },

  // Announcements
  'announcements.title': { en: 'Announcements', mr: 'सूचना' },
  'announcements.subtitle': { en: 'Post notices for parents and staff', mr: 'पालक आणि कर्मचाऱ्यांसाठी सूचना प्रसिद्ध करा' },
  'announcements.addAnnouncement': { en: 'New Announcement', mr: 'नवीन सूचना' },
  'announcements.postTitle': { en: 'Post Announcement', mr: 'सूचना प्रसिद्ध करा' },
  'announcements.titleField': { en: 'Title *', mr: 'शीर्षक *' },
  'announcements.content': { en: 'Content *', mr: 'मजकूर *' },
  'announcements.general': { en: 'General', mr: 'सामान्य' },
  'announcements.holiday': { en: 'Holiday', mr: 'सुट्टी' },
  'announcements.event': { en: 'Event', mr: 'कार्यक्रम' },
  'announcements.post': { en: 'Post Announcement', mr: 'सूचना प्रसिद्ध करा' },
  'announcements.posting': { en: 'Posting...', mr: 'प्रसिद्ध होत आहे...' },
  'announcements.noAnnouncements': { en: 'No announcements yet.', mr: 'अद्याप कोणतीही सूचना नाही.' },

  // Reports
  'reports.title': { en: 'Reports', mr: 'अहवाल' },
  'reports.subtitle': { en: 'Download and export school reports', mr: 'शाळेचे अहवाल डाउनलोड आणि निर्यात करा' },
  'reports.download': { en: 'Download PDF', mr: 'PDF डाउनलोड करा' },
  'reports.studentList': { en: 'Student List', mr: 'विद्यार्थी यादी' },
  'reports.feeCollection': { en: 'Fee Collection', mr: 'शुल्क संकलन' },
  'reports.pendingFees': { en: 'Pending Fees', mr: 'बाकी शुल्क' },
  'reports.attendanceReport': { en: 'Attendance Report', mr: 'उपस्थिती अहवाल' },
  'reports.salaryReport': { en: 'Salary Report', mr: 'वेतन अहवाल' },
  'reports.collected': { en: 'Collected', mr: 'जमा' },
  'reports.staff': { en: 'Staff', mr: 'कर्मचारी' },
  'reports.attendanceMonth': { en: 'Attendance month', mr: 'उपस्थिती महिना' },
  'reports.studentsAcross': { en: 'students across all classes', mr: 'सर्व वर्गातील विद्यार्थी' },
  'reports.classWiseStudent': { en: 'Class-wise & student-wise attendance for selected month', mr: 'निवडलेल्या महिन्यासाठी वर्ग-निहाय आणि विद्यार्थी-निहाय उपस्थिती' },
  'reports.feeRecords': { en: 'fee records total', mr: 'एकूण शुल्क नोंदी' },
  'reports.pendingPayments': { en: 'pending payments', mr: 'बाकी पेमेंट' },
  'reports.salaryDetails': { en: 'Staff salary details with deductions', mr: 'कर्मचारी वेतन तपशील कपातीसह' },

  // Salary / Staff Attendance
  'salary.title': { en: 'Staff Attendance & Salary', mr: 'कर्मचारी उपस्थिती आणि वेतन' },
  'salary.subtitle': { en: 'Track teacher & staff attendance and manage salary distribution', mr: 'शिक्षक आणि कर्मचारी उपस्थिती ट्रॅक करा आणि वेतन वितरण व्यवस्थापित करा' },
  'salary.dailyAttendance': { en: 'Daily Attendance', mr: 'दैनिक उपस्थिती' },
  'salary.salary': { en: 'Salary', mr: 'वेतन' },
  'salary.calculateAll': { en: 'Calculate All', mr: 'सर्वांचे वेतन काढा' },
  'salary.totalStaff': { en: 'Total Staff', mr: 'एकूण कर्मचारी' },
  'salary.totalPayable': { en: 'Total Payable', mr: 'एकूण देय' },
  'salary.notCalculated': { en: 'Not calculated', mr: 'गणना केली नाही' },
  'salary.downloadPDF': { en: 'Download PDF', mr: 'PDF डाउनलोड करा' },
  'salary.baseSalary': { en: 'Base', mr: 'मूळ वेतन' },
  'salary.deduction': { en: 'Deduction', mr: 'कपात' },
  'salary.netSalary': { en: 'Net', mr: 'निव्वळ' },
  'salary.markPaid': { en: 'Mark Paid', mr: 'भरले म्हणून नोंदवा' },

  // Teacher Summary
  'teacherSummary.title': { en: 'Teacher Monthly Summary', mr: 'शिक्षक मासिक सारांश' },
  'teacherSummary.subtitle': { en: 'Track teacher activity and performance month-wise', mr: 'शिक्षकांची मासिक कामगिरी आणि उपक्रम पहा' },
  'teacherSummary.teachers': { en: 'Teachers', mr: 'शिक्षक' },
  'teacherSummary.totalPresentDays': { en: 'Total Present Days', mr: 'एकूण उपस्थित दिवस' },
  'teacherSummary.classes': { en: 'Classes', mr: 'वर्ग' },
  'teacherSummary.totalSalary': { en: 'Total Salary', mr: 'एकूण वेतन' },
  'teacherSummary.halfDay': { en: 'Half Day', mr: 'अर्धा दिवस' },
  'teacherSummary.attTaken': { en: 'Att. Taken', mr: 'उपस्थिती घेतली' },

  // Settings
  'settings.title': { en: 'Settings', mr: 'सेटिंग्ज' },
  'settings.subtitle': { en: 'School and account settings', mr: 'शाळा आणि खाते सेटिंग्ज' },
  'settings.schoolInfo': { en: 'School Information', mr: 'शाळा माहिती' },
  'settings.schoolName': { en: 'School Name', mr: 'शाळेचे नाव' },
  'settings.type': { en: 'Type', mr: 'प्रकार' },
  'settings.account': { en: 'Account', mr: 'खाते' },
  'settings.email': { en: 'Email', mr: 'ईमेल' },
  'settings.role': { en: 'Role', mr: 'भूमिका' },
  'settings.systemInfo': { en: 'System Info', mr: 'सिस्टम माहिती' },

  // Siblings
  'siblings.title': { en: 'Siblings', mr: 'भावंडे' },
  'siblings.add': { en: 'Add Sibling', mr: 'भावंड जोडा' },
  'siblings.addTitle': { en: 'Add Sibling Details', mr: 'भावंडाची माहिती जोडा' },
  'siblings.name': { en: 'Sibling Name *', mr: 'भावंडाचे नाव *' },
  'siblings.class': { en: 'Class', mr: 'वर्ग' },
  'siblings.section': { en: 'Section', mr: 'विभाग' },
  'siblings.brother': { en: 'Brother', mr: 'भाऊ' },
  'siblings.sister': { en: 'Sister', mr: 'बहीण' },
  'siblings.linkExisting': { en: 'Link to existing student (optional)', mr: 'विद्यमान विद्यार्थ्याशी जोडा (ऐच्छिक)' },
  'siblings.selectStudent': { en: 'Select student...', mr: 'विद्यार्थी निवडा...' },
  'siblings.notInSchool': { en: 'Not in this school', mr: 'या शाळेत नाही' },
  'siblings.linked': { en: 'Linked', mr: 'जोडलेले' },
  'siblings.none': { en: 'No siblings added.', mr: 'भावंडे जोडलेली नाहीत.' },
  'siblings.added': { en: 'Sibling added!', mr: 'भावंड जोडले!' },
  'siblings.deleted': { en: 'Sibling removed.', mr: 'भावंड काढले.' },

  // WhatsApp
  'whatsapp.sendFee': { en: 'Send fee details on WhatsApp', mr: 'WhatsApp वर शुल्क तपशील पाठवा' },
  'whatsapp.sendTransport': { en: 'Send transport info on WhatsApp', mr: 'WhatsApp वर वाहतूक माहिती पाठवा' },
  'whatsapp.sendReceipt': { en: 'Send Receipt on WhatsApp', mr: 'WhatsApp वर पावती पाठवा' },
  'dashboard.sendFeeReminder': { en: 'Send Fee Reminder', mr: 'शुल्क स्मरणपत्र पाठवा' },
  'dashboard.sendTransportInfo': { en: 'Send Transport Info', mr: 'वाहतूक माहिती पाठवा' },

  // Exam Results
  'results.title': { en: 'Exam Results', mr: 'परीक्षा निकाल' },
  'results.subtitle': { en: 'Manage and share exam results with parents', mr: 'परीक्षा निकाल व्यवस्थापित करा आणि पालकांना शेअर करा' },
  'results.addResult': { en: 'Add Result', mr: 'निकाल जोडा' },
  'results.examName': { en: 'Exam Name *', mr: 'परीक्षेचे नाव *' },
  'results.subject': { en: 'Subject *', mr: 'विषय *' },
  'results.marksObtained': { en: 'Marks Obtained', mr: 'मिळालेले गुण' },
  'results.totalMarks': { en: 'Total Marks', mr: 'एकूण गुण' },
  'results.remarks': { en: 'Teacher Remarks', mr: 'शिक्षकांचे अभिप्राय' },
  'results.pass': { en: 'Pass', mr: 'उत्तीर्ण' },
  'results.fail': { en: 'Fail', mr: 'अनुत्तीर्ण' },
  'results.downloadPdf': { en: 'Download PDF', mr: 'PDF डाउनलोड' },
  'results.sendWhatsApp': { en: 'Send on WhatsApp', mr: 'WhatsApp वर पाठवा' },
  'results.searchStudent': { en: 'Search by student...', mr: 'विद्यार्थीनुसार शोधा...' },
  'results.allExams': { en: 'All Exams', mr: 'सर्व परीक्षा' },
  'results.noResults': { en: 'No exam results found.', mr: 'परीक्षा निकाल सापडले नाहीत.' },
  'results.added': { en: 'Result added!', mr: 'निकाल जोडला!' },
  'dashboard.quickActions': { en: 'Quick Actions', mr: 'त्वरित कृती' },
  'dashboard.viewResults': { en: 'View Results', mr: 'निकाल पहा' },
  'dashboard.viewFeeReceipts': { en: 'View Fee Receipts', mr: 'शुल्क पावत्या पहा' },

  // Expenses
  'nav.expenses': { en: 'Expenses', mr: 'खर्च' },
  'expenses.title': { en: 'Expense Manager', mr: 'खर्च व्यवस्थापक' },
  'expenses.subtitle': { en: 'Track school overheads and view profit/loss', mr: 'शाळेचा खर्च ट्रॅक करा आणि नफा/तोटा पहा' },
  'expenses.add': { en: 'Add Expense', mr: 'खर्च जोडा' },
  'expenses.addTitle': { en: 'Add New Expense', mr: 'नवीन खर्च जोडा' },
  'expenses.selectCategory': { en: 'Select Category', mr: 'प्रकार निवडा' },
  'expenses.description': { en: 'Description (optional)', mr: 'वर्णन (ऐच्छिक)' },
  'expenses.amount': { en: 'Amount (₹)', mr: 'रक्कम (₹)' },
  'expenses.date': { en: 'Date', mr: 'तारीख' },
  'expenses.categoryLabel': { en: 'Category', mr: 'प्रकार' },
  'expenses.income': { en: 'Fee Income (Paid)', mr: 'शुल्क उत्पन्न (भरलेले)' },
  'expenses.totalExpenses': { en: 'Total Expenses', mr: 'एकूण खर्च' },
  'expenses.profitLoss': { en: 'Profit / Loss', mr: 'नफा / तोटा' },
  'expenses.allExpenses': { en: 'All Expenses', mr: 'सर्व खर्च' },
  'expenses.categorySummary': { en: 'Category Summary', mr: 'प्रकारनिहाय सारांश' },
  'expenses.noExpenses': { en: 'No expenses recorded for this month.', mr: 'या महिन्यात कोणताही खर्च नोंदलेला नाही.' },
  'expenses.added': { en: 'Expense added!', mr: 'खर्च जोडला!' },
  'expenses.deleted': { en: 'Expense deleted.', mr: 'खर्च हटवला.' },
  'expenses.deleteConfirm': { en: 'Delete this expense?', mr: 'हा खर्च हटवायचा?' },
  'expenses.deleteDesc': { en: 'This action cannot be undone.', mr: 'ही क्रिया पूर्ववत करता येणार नाही.' },

  // Inquiries
  'nav.inquiries': { en: 'Inquiries', mr: 'चौकशी' },
  'inquiry.title': { en: 'Admission Inquiries', mr: 'प्रवेश चौकशी' },
  'inquiry.subtitle': { en: 'Track inquiries and convert to admissions', mr: 'चौकशी ट्रॅक करा आणि प्रवेशात रूपांतरित करा' },
  'inquiry.addInquiry': { en: 'New Inquiry', mr: 'नवीन चौकशी' },
  'inquiry.editInquiry': { en: 'Edit Inquiry', mr: 'चौकशी संपादित करा' },
  'inquiry.studentName': { en: 'Student Name', mr: 'विद्यार्थ्याचे नाव' },
  'inquiry.parentName': { en: 'Parent Name', mr: 'पालकांचे नाव' },
  'inquiry.contact': { en: 'Contact', mr: 'संपर्क' },
  'inquiry.alternateContact': { en: 'Alternate Contact', mr: 'पर्यायी संपर्क' },
  'inquiry.email': { en: 'Email', mr: 'ईमेल' },
  'inquiry.classInterested': { en: 'Class Interested', mr: 'वर्ग' },
  'inquiry.previousSchool': { en: 'Previous School', mr: 'मागील शाळा' },
  'inquiry.inquiryDate': { en: 'Inquiry Date', mr: 'चौकशी तारीख' },
  'inquiry.source': { en: 'Source', mr: 'स्रोत' },
  'inquiry.address': { en: 'Address', mr: 'पत्ता' },
  'inquiry.remarks': { en: 'Remarks', mr: 'टिप्पणी' },
  'inquiry.status': { en: 'Status', mr: 'स्थिती' },
  'inquiry.search': { en: 'Search by name or contact...', mr: 'नाव किंवा संपर्काने शोधा...' },
  'inquiry.noInquiries': { en: 'No inquiries found.', mr: 'चौकशी सापडली नाही.' },
  'inquiry.added': { en: 'Inquiry added!', mr: 'चौकशी जोडली!' },
  'inquiry.updated': { en: 'Inquiry updated!', mr: 'चौकशी अपडेट केली!' },
  'inquiry.converted': { en: 'Inquiry converted to admission!', mr: 'चौकशी प्रवेशात रूपांतरित!' },
  'inquiry.totalInquiries': { en: 'Total Inquiries', mr: 'एकूण चौकशी' },
  'inquiry.newInquiries': { en: 'New Inquiries', mr: 'नवीन चौकशी' },
  'inquiry.followUpPending': { en: 'Follow-ups', mr: 'फॉलो-अप' },
  'inquiry.convertedAdmissions': { en: 'Converted', mr: 'रूपांतरित' },
  'inquiry.conversionRate': { en: 'Conversion %', mr: 'रूपांतर %' },

  // Common
  'common.save': { en: 'Save', mr: 'जतन करा' },
  'common.saving': { en: 'Saving...', mr: 'जतन होत आहे...' },
  'common.cancel': { en: 'Cancel', mr: 'रद्द करा' },
  'common.delete': { en: 'Delete', mr: 'हटवा' },
  'common.edit': { en: 'Edit', mr: 'संपादित करा' },
  'common.update': { en: 'Update', mr: 'अपडेट करा' },
  'common.search': { en: 'Search...', mr: 'शोधा...' },
  'common.loading': { en: 'Loading...', mr: 'लोड होत आहे...' },
  'common.noData': { en: 'No data found.', mr: 'माहिती सापडली नाही.' },
  'common.people': { en: 'people', mr: 'लोक' },
  'common.days': { en: 'days', mr: 'दिवस' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
